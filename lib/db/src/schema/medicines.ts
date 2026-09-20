import {
  boolean,
  doublePrecision,
  index,
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const medicinesTable = pgTable(
  "medicines",
  {
    id: text("id").primaryKey(),
    shopId: text("shop_id").notNull(),
    name: text("name").notNull(),
    description: text("description").notNull().default(""),
    price: doublePrecision("price").notNull().default(0),
    discountPercent: doublePrecision("discount_percent").notNull().default(0),
    stock: integer("stock").notNull().default(0),
    otc: boolean("otc").notNull().default(true),
    imageKey: text("image_key").notNull().default("paracetamol"),
    customImageUri: text("custom_image_uri"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [index("medicines_shop_idx").on(t.shopId, t.createdAt)],
);

export type Medicine = typeof medicinesTable.$inferSelect;
