import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, shopsTable } from "@workspace/db";
import { UpdateShopBody } from "@workspace/api-zod";
import { MAIN_SHOP_ID } from "../lib/seed";

const router: IRouter = Router();

function shopToResponse(shop: typeof shopsTable.$inferSelect) {
  return {
    id: shop.id,
    shopName: shop.shopName,
    ownerName: shop.ownerName,
    mobile: shop.mobile,
    address: shop.address,
    upiId: shop.upiId,
    qrImageUri: shop.qrImageUri,
    rating: shop.rating,
    ratingCount: shop.ratingCount,
  };
}

router.get("/shop", async (_req, res): Promise<void> => {
  const [shop] = await db
    .select()
    .from(shopsTable)
    .where(eq(shopsTable.id, MAIN_SHOP_ID));
  if (!shop) {
    res.status(404).json({ error: "Shop not found" });
    return;
  }
  res.json(shopToResponse(shop));
});

router.patch("/shop", async (req, res): Promise<void> => {
  const parsed = UpdateShopBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [shop] = await db
    .update(shopsTable)
    .set(parsed.data)
    .where(eq(shopsTable.id, MAIN_SHOP_ID))
    .returning();
  if (!shop) {
    res.status(404).json({ error: "Shop not found" });
    return;
  }
  res.json(shopToResponse(shop));
});

export default router;
