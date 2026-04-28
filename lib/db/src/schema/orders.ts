import {
  doublePrecision,
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const ordersTable = pgTable("orders", {
  id: text("id").primaryKey(),
  shopId: text("shop_id").notNull(),
  customerName: text("customer_name").notNull(),
  customerMobile: text("customer_mobile").notNull(),
  customerAddress: text("customer_address").notNull(),
  itemMedicineId: text("item_medicine_id").notNull(),
  itemName: text("item_name").notNull(),
  itemImageKey: text("item_image_key").notNull(),
  itemCustomImageUri: text("item_custom_image_uri"),
  itemPrice: doublePrecision("item_price").notNull(),
  itemDiscountPercent: doublePrecision("item_discount_percent")
    .notNull()
    .default(0),
  itemUnitFinalPrice: doublePrecision("item_unit_final_price").notNull(),
  itemQuantity: integer("item_quantity").notNull(),
  total: doublePrecision("total").notNull(),
  paymentMethod: text("payment_method").notNull(),
  status: text("status").notNull().default("placed"),
  customerRating: integer("customer_rating"),
  shopName: text("shop_name").notNull().default(""),
  shopMobile: text("shop_mobile").notNull().default(""),
  shopAddress: text("shop_address").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  deliveredAt: timestamp("delivered_at", { withTimezone: true }),
});

export type Order = typeof ordersTable.$inferSelect;
