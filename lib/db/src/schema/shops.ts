import {
  doublePrecision,
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const shopsTable = pgTable("shops", {
  id: text("id").primaryKey(),
  shopName: text("shop_name").notNull().default(""),
  ownerName: text("owner_name").notNull().default(""),
  mobile: text("mobile").notNull().default(""),
  address: text("address").notNull().default(""),
  upiId: text("upi_id").notNull().default(""),
  qrImageUri: text("qr_image_uri"),
  rating: doublePrecision("rating").notNull().default(0),
  ratingCount: integer("rating_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type Shop = typeof shopsTable.$inferSelect;
