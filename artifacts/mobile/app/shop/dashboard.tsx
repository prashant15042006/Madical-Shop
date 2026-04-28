import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback } from "react";
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
import { resolveImage } from "@/constants/medicines";

export default function ShopDashboard() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { orders, medicines, shop, shopReady } = useApp();

  useFocusEffect(
    useCallback(() => {
      if (!shopReady) {
        router.replace("/shop/setup");
      }
    }, [shopReady, router]),
  );

  const pending = orders.filter((o) => o.status === "placed");
  const delivered = orders.filter((o) => o.status === "delivered");
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
        ListHeaderComponent={
          <View style={{ gap: 16, paddingBottom: 6 }}>
            <View
              style={[
                styles.shopCard,
                { backgroundColor: colors.primary },
              ]}
            >
              <View style={{ flex: 1, gap: 6 }}>
                <Text
                  style={[styles.shopName, { color: colors.primaryForeground }]}
                >
                  {shop.shopName || "Aapki dukan"}
                </Text>
                <View style={styles.shopMetaRow}>
                  <View style={styles.shopMetaItem}>
                    <Feather name="star" size={13} color="#fde68a" />
                    <Text
                      style={[
                        styles.shopMetaText,
                        { color: colors.primaryForeground },
                      ]}
                    >
                      {shop.ratingCount > 0
                        ? `${shop.rating.toFixed(1)} (${shop.ratingCount})`
                        : "Naya"}
                    </Text>
                  </View>
                  <View style={styles.shopMetaItem}>
                    <Feather
                      name="phone"
                      size={13}
                      color={colors.primaryForeground}
                    />
                    <Text
                      style={[
                        styles.shopMetaText,
                        { color: colors.primaryForeground },
                      ]}
                    >
                      {shop.mobile}
                    </Text>
                  </View>
                </View>
              </View>
              <Pressable
                onPress={() => router.push("/shop/setup")}
                style={({ pressed }) => [
                  styles.editBtn,
                  {
                    backgroundColor: "rgba(255,255,255,0.2)",
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <Feather
                  name="edit-2"
                  size={16}
                  color={colors.primaryForeground}
                />
              </Pressable>
            </View>

            <View style={styles.statsRow}>
              <Stat
                icon="clock"
                label="Pending"
                value={pending.length}
                color={colors.primary}
              />
              <Stat
                icon="check-circle"
                label="Delivered"
                value={delivered.length}
                color="#16a34a"
              />
              <Stat
                icon="package"
                label="Items"
                value={medicines.length}
                color="#0ea5e9"
              />
            </View>

            <Pressable
              onPress={() => router.push("/shop/medicines")}
              style={({ pressed }) => [
                styles.actionRow,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  opacity: pressed ? 0.95 : 1,
                },
              ]}
            >
              <View
                style={[
                  styles.actionIcon,
                  { backgroundColor: colors.accent },
                ]}
              >
                <Feather name="grid" size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={[styles.actionTitle, { color: colors.foreground }]}
                >
                  Inventory Manage Karein
                </Text>
                <Text
                  style={[
                    styles.actionSub,
                    { color: colors.mutedForeground },
                  ]}
                >
                  Medicine add ya remove karein, stock update karein
                </Text>
              </View>
              <Feather
                name="chevron-right"
                size={20}
                color={colors.mutedForeground}
              />
            </Pressable>

            <Text
              style={[styles.sectionTitle, { color: colors.foreground }]}
            >
              Orders
            </Text>
          </View>
        }
        scrollEnabled={true}
        ListEmptyComponent={
          <Empty
            icon="package"
            title="Abhi koi order nahi"
            subtitle="Customer order karega to yahan dikhega"
          />
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/shop/order/[id]",
                params: { id: item.id },
              })
            }
            style={({ pressed }) => [
              styles.orderRow,
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
                source={resolveImage(
                  item.item.imageKey,
                  item.item.customImageUri,
                )}
                style={{ width: "100%", height: "100%" }}
                contentFit="cover"
              />
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <Text
                numberOfLines={1}
                style={[styles.orderName, { color: colors.foreground }]}
              >
                {item.item.name} × {item.item.quantity}
              </Text>
              <Text
                style={[styles.orderMeta, { color: colors.mutedForeground }]}
              >
                {item.customerName} · {item.customerMobile}
              </Text>
              <View style={styles.orderFooter}>
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
                    size={11}
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
                    {item.status === "delivered" ? "Delivered" : "Naya"}
                  </Text>
                </View>
                <Text
                  style={[styles.totalText, { color: colors.foreground }]}
                >
                  ₹{item.total} · {item.paymentMethod === "cod" ? "COD" : "UPI"}
                </Text>
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

function Stat({
  icon,
  label,
  value,
  color,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value: number;
  color: string;
}) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.statCard,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <View style={[styles.statIcon, { backgroundColor: color + "20" }]}>
        <Feather name={icon} size={16} color={color} />
      </View>
      <Text style={[styles.statValue, { color: colors.foreground }]}>
        {value}
      </Text>
      <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  shopCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 18,
    borderRadius: 22,
    shadowColor: "#0aa672",
    shadowOpacity: 0.25,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  shopName: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
  },
  shopMetaRow: {
    flexDirection: "row",
    gap: 16,
  },
  shopMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  shopMetaText: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
  },
  editBtn: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
  },
  statCard: {
    flex: 1,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "flex-start",
    gap: 6,
  },
  statIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
  },
  statLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  actionTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
  actionSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
  },
  sectionTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    marginTop: 6,
  },
  orderRow: {
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
  orderName: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  orderMeta: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
  },
  orderFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
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
  totalText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
  },
});
