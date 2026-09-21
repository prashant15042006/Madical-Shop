import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import { Medicine, finalPrice } from "@/constants/medicines";

type Props = {
  medicine: Medicine;
  onBuy: () => void;
  onPress?: () => void;
};

export function MedicineCard({ medicine, onBuy, onPress }: Props) {
  const colors = useColors();
  const outOfStock = medicine.stock <= 0;
  const isLowStock = !outOfStock && medicine.stock <= 5;
  const hasDiscount = (medicine.discountPercent ?? 0) > 0;
  const final = finalPrice(medicine.price, medicine.discountPercent);
  const savings = hasDiscount ? +(medicine.price - final).toFixed(0) : 0;

  return (
    <Pressable
      onPress={onPress ?? (outOfStock ? undefined : onBuy)}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          opacity: pressed ? 0.94 : 1,
        },
      ]}
    >
      {/* Product Image Box */}
      <View style={styles.imageBox}>
        <Image
          source={medicine.image}
          style={styles.image}
          contentFit="contain"
          transition={150}
        />

        {/* Discount Badge */}
        {hasDiscount ? (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>
              {medicine.discountPercent}% OFF
            </Text>
          </View>
        ) : null}

        {/* OTC / Rx Badge */}
        <View
          style={[
            styles.typeBadge,
            {
              backgroundColor: medicine.otc ? "#ecfdf5" : "#eff6ff",
              borderColor: medicine.otc ? "#a7f3d0" : "#bfdbfe",
            },
          ]}
        >
          <Text
            style={[
              styles.typeBadgeText,
              { color: medicine.otc ? "#047857" : "#1d4ed8" },
            ]}
          >
            {medicine.otc ? "OTC" : "Rx"}
          </Text>
        </View>
      </View>

      {/* Content Info */}
      <View style={styles.info}>
        <Text
          numberOfLines={2}
          style={[styles.name, { color: colors.foreground }]}
        >
          {medicine.name}
        </Text>

        <Text
          numberOfLines={1}
          style={[styles.desc, { color: colors.mutedForeground }]}
        >
          {medicine.description || "Swasthya & dekhbhal ke liye"}
        </Text>

        {/* Stock Status */}
        <View style={styles.stockRow}>
          {outOfStock ? (
            <Text style={styles.outOfStockText}>🔴 Abhi uplabdh nahi</Text>
          ) : isLowStock ? (
            <Text style={styles.lowStockText}>⚡ Sirf {medicine.stock} bache hain</Text>
          ) : (
            <Text style={styles.inStockText}>🟢 Stock uplabdh</Text>
          )}
        </View>

        {/* Price & Action Row */}
        <View style={styles.footer}>
          <View style={styles.priceCol}>
            <View style={styles.priceLine}>
              <Text style={[styles.price, { color: colors.foreground }]}>
                ₹{final}
              </Text>
              {hasDiscount ? (
                <Text
                  style={[styles.priceOld, { color: colors.mutedForeground }]}
                >
                  ₹{medicine.price}
                </Text>
              ) : null}
            </View>
            {hasDiscount && savings > 0 ? (
              <Text style={styles.savingsText}>Bachat ₹{savings}</Text>
            ) : null}
          </View>

          {/* Blinkit Style ADD Button */}
          <Pressable
            onPress={outOfStock ? undefined : onBuy}
            disabled={outOfStock}
            style={({ pressed }) => [
              styles.addBtn,
              {
                backgroundColor: outOfStock ? "#f1f5f9" : "#0aa672",
                borderColor: outOfStock ? "#cbd5e1" : "#0aa672",
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            {outOfStock ? (
              <Text style={styles.addBtnTextDisabled}>Out</Text>
            ) : (
              <>
                <Feather name="plus" size={13} color="#ffffff" />
                <Text style={styles.addBtnText}>ADD</Text>
              </>
            )}
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 10,
    width: "100%",
    flexDirection: "column",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  imageBox: {
    width: "100%",
    aspectRatio: 1.15,
    borderRadius: 12,
    backgroundColor: "#f8fafc",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    padding: 8,
  },
  image: {
    width: "88%",
    height: "88%",
  },
  discountBadge: {
    position: "absolute",
    top: 6,
    left: 6,
    backgroundColor: "#059669",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  discountText: {
    fontFamily: "Inter_700Bold",
    fontSize: 10,
    color: "#ffffff",
    letterSpacing: 0.3,
  },
  typeBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  typeBadgeText: {
    fontFamily: "Inter_700Bold",
    fontSize: 9,
    letterSpacing: 0.4,
  },
  info: {
    gap: 4,
    flex: 1,
  },
  name: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    lineHeight: 18,
    minHeight: 36,
  },
  desc: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
  },
  stockRow: {
    marginTop: 2,
  },
  inStockText: {
    fontFamily: "Inter_500Medium",
    fontSize: 10,
    color: "#059669",
  },
  lowStockText: {
    fontFamily: "Inter_500Medium",
    fontSize: 10,
    color: "#d97706",
  },
  outOfStockText: {
    fontFamily: "Inter_500Medium",
    fontSize: 10,
    color: "#dc2626",
  },
  footer: {
    marginTop: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  priceCol: {
    flexDirection: "column",
    gap: 1,
  },
  priceLine: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 5,
  },
  price: {
    fontFamily: "Inter_700Bold",
    fontSize: 15,
  },
  priceOld: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    textDecorationLine: "line-through",
  },
  savingsText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
    color: "#059669",
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 64,
  },
  addBtnText: {
    fontFamily: "Inter_700Bold",
    fontSize: 12,
    color: "#ffffff",
  },
  addBtnTextDisabled: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    color: "#94a3b8",
  },
});
