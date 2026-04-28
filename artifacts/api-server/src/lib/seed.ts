import { db, shopsTable, medicinesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "./logger";

export const MAIN_SHOP_ID = "main";

const DEFAULT_MEDICINES = [
  {
    id: "med_paracetamol",
    name: "Paracetamol 500mg",
    description: "Bukhar aur sir dard ke liye",
    price: 25,
    discountPercent: 0,
    stock: 50,
    otc: true,
    imageKey: "paracetamol",
  },
  {
    id: "med_crocin",
    name: "Crocin Advance",
    description: "Tej dard, OTC tablet",
    price: 35,
    discountPercent: 5,
    stock: 40,
    otc: true,
    imageKey: "blister",
  },
  {
    id: "med_amoxicillin",
    name: "Amoxicillin 250mg",
    description: "Antibiotic capsule",
    price: 85,
    discountPercent: 0,
    stock: 30,
    otc: false,
    imageKey: "capsule",
  },
  {
    id: "med_benadryl",
    name: "Benadryl Cough Syrup",
    description: "Khansi ke liye syrup",
    price: 120,
    discountPercent: 10,
    stock: 25,
    otc: true,
    imageKey: "syrup",
  },
  {
    id: "med_asthalin",
    name: "Asthalin Inhaler",
    description: "Asthma inhaler",
    price: 250,
    discountPercent: 0,
    stock: 15,
    otc: false,
    imageKey: "inhaler",
  },
  {
    id: "med_vitc",
    name: "Vitamin C 1000mg",
    description: "Immunity booster tablet",
    price: 180,
    discountPercent: 15,
    stock: 60,
    otc: true,
    imageKey: "vitamin",
  },
  {
    id: "med_eyedrop",
    name: "Refresh Eye Drops",
    description: "Aankh ki sukhan ke liye",
    price: 60,
    discountPercent: 0,
    stock: 35,
    otc: true,
    imageKey: "eyedrops",
  },
];

export async function ensureSeed(): Promise<void> {
  const [existingShop] = await db
    .select()
    .from(shopsTable)
    .where(eq(shopsTable.id, MAIN_SHOP_ID));

  if (!existingShop) {
    await db.insert(shopsTable).values({ id: MAIN_SHOP_ID });
    logger.info("Seeded main shop");
  }

  const existingMeds = await db
    .select({ id: medicinesTable.id })
    .from(medicinesTable)
    .where(eq(medicinesTable.shopId, MAIN_SHOP_ID));

  if (existingMeds.length === 0) {
    await db.insert(medicinesTable).values(
      DEFAULT_MEDICINES.map((m) => ({
        ...m,
        shopId: MAIN_SHOP_ID,
        customImageUri: null,
      })),
    );
    logger.info(`Seeded ${DEFAULT_MEDICINES.length} default medicines`);
  }
}
