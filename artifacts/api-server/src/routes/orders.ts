import { Router, type IRouter } from "express";
import { and, desc, eq, sql } from "drizzle-orm";
import {
  db,
  medicinesTable,
  ordersTable,
  shopsTable,
} from "@workspace/db";
import { CreateOrderBody, RateOrderBody } from "@workspace/api-zod";
import { MAIN_SHOP_ID } from "../lib/seed";

const router: IRouter = Router();

function toMs(value: Date | null): number | null {
  return value ? value.getTime() : null;
}

const DEFAULT_DELIVERY_WINDOW_MS = 60 * 60_000; // 60 minutes

function orderToResponse(o: typeof ordersTable.$inferSelect) {
  return {
    id: o.id,
    shopId: o.shopId,
    customerName: o.customerName,
    customerMobile: o.customerMobile,
    customerAddress: o.customerAddress,
    item: {
      medicineId: o.itemMedicineId,
      name: o.itemName,
      imageKey: o.itemImageKey,
      customImageUri: o.itemCustomImageUri,
      price: o.itemPrice,
      discountPercent: o.itemDiscountPercent,
      unitFinalPrice: o.itemUnitFinalPrice,
      quantity: o.itemQuantity,
    },
    total: o.total,
    paymentMethod: o.paymentMethod,
    status: o.status,
    customerRating: o.customerRating,
    shopName: o.shopName,
    shopMobile: o.shopMobile,
    shopAddress: o.shopAddress,
    createdAt: o.createdAt.getTime(),
    expectedDeliveryAt: toMs(o.expectedDeliveryAt),
    deliveredAt: toMs(o.deliveredAt),
  };
}

function genId(prefix: string) {
  return (
    prefix +
    "_" +
    Date.now().toString(36) +
    Math.random().toString(36).slice(2, 8)
  );
}

router.get("/orders", async (req, res): Promise<void> => {
  const customerMobileRaw = req.query.customerMobile;
  const customerMobile =
    typeof customerMobileRaw === "string" && customerMobileRaw.trim().length
      ? customerMobileRaw.trim()
      : null;

  const where = customerMobile
    ? and(
        eq(ordersTable.shopId, MAIN_SHOP_ID),
        eq(ordersTable.customerMobile, customerMobile),
      )
    : eq(ordersTable.shopId, MAIN_SHOP_ID);

  const list = await db
    .select()
    .from(ordersTable)
    .where(where)
    .orderBy(desc(ordersTable.createdAt));
  res.json(list.map(orderToResponse));
});

router.post("/orders", async (req, res): Promise<void> => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const body = parsed.data;

  const [shop] = await db
    .select()
    .from(shopsTable)
    .where(eq(shopsTable.id, MAIN_SHOP_ID));

  const now = new Date();
  const expectedDeliveryAt = new Date(
    now.getTime() + DEFAULT_DELIVERY_WINDOW_MS,
  );

  const [created] = await db
    .insert(ordersTable)
    .values({
      id: genId("ord"),
      shopId: MAIN_SHOP_ID,
      customerName: body.customerName,
      customerMobile: body.customerMobile,
      customerAddress: body.customerAddress,
      itemMedicineId: body.item.medicineId,
      itemName: body.item.name,
      itemImageKey: body.item.imageKey,
      itemCustomImageUri: body.item.customImageUri ?? null,
      itemPrice: body.item.price,
      itemDiscountPercent: body.item.discountPercent ?? 0,
      itemUnitFinalPrice: body.item.unitFinalPrice,
      itemQuantity: body.item.quantity,
      total: body.total,
      paymentMethod: body.paymentMethod,
      shopName: shop?.shopName ?? "MediGo Shop",
      shopMobile: shop?.mobile ?? "",
      shopAddress: shop?.address ?? "",
      createdAt: now,
      expectedDeliveryAt,
    })
    .returning();

  // decrement stock
  await db
    .update(medicinesTable)
    .set({
      stock: sql`GREATEST(0, ${medicinesTable.stock} - ${body.item.quantity})`,
    })
    .where(eq(medicinesTable.id, body.item.medicineId));

  res.status(201).json(orderToResponse(created));
});

router.get("/orders/:id", async (req, res): Promise<void> => {
  const id = String(req.params.id);
  const [order] = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.id, id));
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  res.json(orderToResponse(order));
});

router.patch("/orders/:id/deliver", async (req, res): Promise<void> => {
  const id = String(req.params.id);
  const [updated] = await db
    .update(ordersTable)
    .set({ status: "delivered", deliveredAt: new Date() })
    .where(eq(ordersTable.id, id))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  res.json(orderToResponse(updated));
});

router.patch("/orders/:id/rate", async (req, res): Promise<void> => {
  const id = String(req.params.id);
  const parsed = RateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const rating = parsed.data.rating;

  const [existing] = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.id, id));
  if (!existing) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  const oldRating = existing.customerRating;
  const [updated] = await db
    .update(ordersTable)
    .set({ customerRating: rating })
    .where(eq(ordersTable.id, id))
    .returning();

  // update shop rating average
  const [shop] = await db
    .select()
    .from(shopsTable)
    .where(eq(shopsTable.id, existing.shopId));
  if (shop) {
    let totalRating = shop.rating * shop.ratingCount;
    let count = shop.ratingCount;
    if (oldRating != null) {
      totalRating = totalRating - oldRating + rating;
    } else {
      totalRating = totalRating + rating;
      count = count + 1;
    }
    await db
      .update(shopsTable)
      .set({
        rating: count > 0 ? totalRating / count : 0,
        ratingCount: count,
      })
      .where(eq(shopsTable.id, shop.id));
  }

  res.json(orderToResponse(updated));
});

export default router;
