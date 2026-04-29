import {
  doublePrecision,
  index,
  integer,
  pgTable,
  real,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const ordersTable = pgTable(
  "orders",
  {
    id: text("id").primaryKey(),
    shopId: text("shop_id").notNull(),
    customerName: text("customer_name").notNull(),
    customerMobile: text("customer_mobile").notNull(),
    customerAddress: text("customer_address").notNull(),
    customerLat: real("customer_lat"),
    customerLng: real("customer_lng"),
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
    deliveryCharge: doublePrecision("delivery_charge").notNull().default(10),
    paymentMethod: text("payment_method").notNull(),
    status: text("status").notNull().default("placed"),
    customerRating: integer("customer_rating"),
    shopName: text("shop_name").notNull().default(""),
    shopMobile: text("shop_mobile").notNull().default(""),
    shopAddress: text("shop_address").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    expectedDeliveryAt: timestamp("expected_delivery_at", {
      withTimezone: true,
    }),
    deliveredAt: timestamp("delivered_at", { withTimezone: true }),
  },
  (t) => [
    index("orders_shop_created_idx").on(t.shopId, t.createdAt.desc()),
    index("orders_customer_created_idx").on(
      t.customerMobile,
      t.createdAt.desc(),
    ),
    index("orders_shop_status_idx").on(t.shopId, t.status),
  ],
);

export type Order = typeof ordersTable.$inferSelect;
