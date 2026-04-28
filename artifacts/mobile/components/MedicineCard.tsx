import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import { Medicine } from "@/constants/medicines";

type Props = {
  medicine: Medicine;
  onBuy: () => void;
  onPress?: () => void;
};

export function MedicineCard({ medicine, onBuy, onPress }: Props) {
  const colors = useColors();
  const outOfStock = medicine.stock <= 0;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          opacity: pressed ? 0.95 : 1,
        },
      ]}
    >
      <View
        style={[styles.imageWrap, { backgroundColor: colors.secondary }]}
      >
        <Image
          source={medicine.image}
          style={styles.image}
          contentFit="cover"
          transition={200}
        />
        {medicine.otc ? (
          <View
            style={[styles.tag, { backgroundColor: colors.accent }]}
          >
            <Text style={[styles.tagText, { color: colors.accentForeground }]}>
              OTC
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.info}>
        <Text
          numberOfLines={1}
          style={[styles.name, { color: colors.foreground }]}
        >
          {medicine.name}
        </Text>
        <Text
          numberOfLines={1}
          style={[styles.desc, { color: colors.mutedForeground }]}
        >
          {medicine.description}
        </Text>
        <View style={styles.footer}>
          <Text style={[styles.price, { color: colors.foreground }]}>
            ₹{medicine.price}
          </Text>
          <Pressable
            onPress={outOfStock ? undefined : onBuy}
            disabled={outOfStock}
            style={({ pressed }) => [
              styles.buyBtn,
              {
                backgroundColor: outOfStock
                  ? colors.muted
                  : pressed
                    ? colors.accentForeground
                    : colors.primary,
              },
            ]}
          >
            <Feather
              name={outOfStock ? "x" : "shopping-bag"}
              size={14}
              color={
                outOfStock ? colors.mutedForeground : colors.primaryForeground
              }
            />
            <Text
              style={[
                styles.buyText,
                {
                  color: outOfStock
                    ? colors.mutedForeground
                    : colors.primaryForeground,
                },
              ]}
            >
              {outOfStock ? "Out" : "Buy"}
            </Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 12,
    width: "100%",
    flexDirection: "column",
    gap: 10,
  },
  imageWrap: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 999,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  tag: {
    position: "absolute",
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  tagText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
    letterSpacing: 0.5,
  },
  info: {
    gap: 2,
  },
  name: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  desc: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
  },
  footer: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  price: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
  },
  buyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
  },
  buyText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
  },
});
