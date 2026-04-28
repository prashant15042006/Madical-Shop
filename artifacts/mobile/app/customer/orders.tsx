import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Empty } from "@/components/Empty";
import { useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";
import { MEDICINE_IMAGES } from "@/constants/medicines";

export default function OrdersScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { orders } = useApp();
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom + 8;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <FlatList
        data={orders}
        keyExtractor={(o) => o.id}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: bottomPad + 16,
          gap: 12,
        }}
        scrollEnabled={orders.length > 0}
        ListEmptyComponent={
          <Empty
            icon="package"
            title="Koi order nahi"
            subtitle="Aapne abhi tak koi order place nahi kiya hai"
          />
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/customer/order/[id]",
                params: { id: item.id },
              })
            }
            style={({ pressed }) => [
              styles.row,
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
                source={
                  MEDICINE_IMAGES[item.item.imageKey] ??
                  MEDICINE_IMAGES.paracetamol
                }
                style={{ width: "100%", height: "100%" }}
                contentFit="cover"
              />
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <Text
                numberOfLines={1}
                style={[styles.name, { color: colors.foreground }]}
              >
                {item.item.name}
              </Text>
              <Text style={[styles.meta, { color: colors.mutedForeground }]}>
                Qty {item.item.quantity} · ₹{item.total} ·{" "}
                {item.paymentMethod === "cod" ? "COD" : "UPI"}
              </Text>
              <View style={styles.statusRow}>
                <View
                  style={[
                    styles.statusPill,
                    {
                      backgroundColor:
                        item.status === "delivered"
                          ? colors.accent
                          : colors.secondary,
                    },
                  ]}
                >
                  <Feather
                    name={
                      item.status === "delivered" ? "check-circle" : "clock"
                    }
                    size={12}
                    color={
                      item.status === "delivered"
                        ? colors.accentForeground
                        : colors.primary
                    }
                  />
                  <Text
                    style={[
                      styles.statusText,
                      {
                        color:
                          item.status === "delivered"
                            ? colors.accentForeground
                            : colors.primary,
                      },
                    ]}
                  >
                    {item.status === "delivered"
                      ? "Delivered"
                      : "Order Placed"}
                  </Text>
                </View>
                {item.customerRating ? (
                  <View style={styles.ratingRow}>
                    <Feather name="star" size={12} color="#f59e0b" />
                    <Text
                      style={[styles.ratingText, { color: colors.foreground }]}
                    >
                      {item.customerRating}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
            <Feather
              name="chevron-right"
              size={20}
              color={colors.mutedForeground}
            />
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
  },
  imageWrap: {
    width: 56,
    height: 56,
    borderRadius: 999,
    overflow: "hidden",
  },
  name: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
  meta: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  statusText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  ratingText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
  },
});
