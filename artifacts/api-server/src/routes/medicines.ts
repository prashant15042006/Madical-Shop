import { Router, type IRouter } from "express";
import { eq, asc } from "drizzle-orm";
import { db, medicinesTable } from "@workspace/db";
import { CreateMedicineBody, UpdateMedicineBody } from "@workspace/api-zod";
import { MAIN_SHOP_ID } from "../lib/seed";

const router: IRouter = Router();

function medicineToResponse(m: typeof medicinesTable.$inferSelect) {
  return {
    id: m.id,
    shopId: m.shopId,
    name: m.name,
    description: m.description,
    price: m.price,
    discountPercent: m.discountPercent,
    stock: m.stock,
    otc: m.otc,
    imageKey: m.imageKey,
    customImageUri: m.customImageUri,
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

router.get("/medicines", async (_req, res): Promise<void> => {
  const list = await db
    .select()
    .from(medicinesTable)
    .where(eq(medicinesTable.shopId, MAIN_SHOP_ID))
    .orderBy(asc(medicinesTable.createdAt));
  res.json(list.map(medicineToResponse));
});

router.post("/medicines", async (req, res): Promise<void> => {
  const parsed = CreateMedicineBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [created] = await db
    .insert(medicinesTable)
    .values({
      id: genId("med"),
      shopId: MAIN_SHOP_ID,
      name: parsed.data.name,
      description: parsed.data.description,
      price: parsed.data.price,
      discountPercent: parsed.data.discountPercent ?? 0,
      stock: parsed.data.stock,
      otc: parsed.data.otc,
      imageKey: parsed.data.imageKey,
      customImageUri: parsed.data.customImageUri ?? null,
    })
    .returning();
  res.status(201).json(medicineToResponse(created));
});

router.patch("/medicines/:id", async (req, res): Promise<void> => {
  const id = String(req.params.id);
  const parsed = UpdateMedicineBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [updated] = await db
    .update(medicinesTable)
    .set(parsed.data)
    .where(eq(medicinesTable.id, id))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "Medicine not found" });
    return;
  }
  res.json(medicineToResponse(updated));
});

router.delete("/medicines/:id", async (req, res): Promise<void> => {
  const id = String(req.params.id);
  const [removed] = await db
    .delete(medicinesTable)
    .where(eq(medicinesTable.id, id))
    .returning();
  if (!removed) {
    res.status(404).json({ error: "Medicine not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
