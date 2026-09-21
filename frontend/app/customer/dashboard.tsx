import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CategoryFilter } from "@/components/CategoryFilter";
import { Empty } from "@/components/Empty";
import { MedicineCard } from "@/components/MedicineCard";
import { SearchBar } from "@/components/SearchBar";
import { SortFilter } from "@/components/SortFilter";
import { useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";
import { type SortOption } from "@/components/SortFilter";

export default function CustomerDashboard() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [sort, setSort] = useState<SortOption>("default");
  const { medicines, orders } = useApp();

  const filtered = useMemo(() => {
    let list = medicines;
    if (mode === "otc") list = list.filter((m) => m.otc);
    if (category) list = list.filter((m) => m.imageKey === category);
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q),
      );
    }
    if (sort === "name-asc") {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === "price-asc") {
      list = [...list].sort((a, b) => a.price - b.price);
    } else if (sort === "price-desc") {
      list = [...list].sort((a, b) => b.price - a.price);
    } else if (sort === "discount-desc") {
      list = [...list].sort((a, b) => b.discountPercent - a.discountPercent);
    }
    return list;
  }, [medicines, query, mode, category, sort]);

  const title = mode === "otc" ? "OTC Medicines" : "MediGo Pharmacy";
  const subtitle =
    mode === "otc"
      ? "Bina doctor ke parche wali zaroori dawai"
      : "Original dawaiyan seedha aapke darwaze tak";

  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom + 8;

  const emptySubtitle = useMemo(() => {
    if (query) return `"${query}" se milti-julti koi dawai nahi mili`;
    if (category) return "Is category me abhi koi dawai stock me nahi hai";
    return "Abhi store par koi dawai uplabdh nahi hai";
  }, [query, category]);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.col}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: bottomPad + 110 },
        ]}
        ListHeaderComponent={
          <View style={styles.headerWrap}>
            {/* Blinkit Style Delivery Banner */}
            <View style={styles.deliveryBanner}>
              <View style={styles.deliveryBadge}>
                <Feather name="zap" size={14} color="#ffffff" />
                <Text style={styles.deliveryBadgeText}>10-15 MIN EXPRESS</Text>
              </View>
              <Text style={styles.deliverySubtext}>
                🟢 Local Medical Store se Free Delivery
              </Text>
            </View>

            <View style={{ height: 12 }} />

            <View style={styles.titleRow}>
              <View>
                <Text style={[styles.title, { color: colors.foreground }]}>
                  {title}
                </Text>
                <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
                  {subtitle}
                </Text>
              </View>
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{filtered.length} Items</Text>
              </View>
            </View>

            <View style={{ height: 14 }} />
            <SearchBar
              value={query}
              onChange={setQuery}
              placeholder="Dawai ka naam search karein (e.g. Paracetamol, Dolo)..."
            />

            <View style={{ height: 12 }} />
            <View style={styles.filterRow}>
              <CategoryFilter selected={category} onChange={setCategory} />
            </View>

            <View style={{ height: 8 }} />
            <View style={styles.filterRow}>
              <SortFilter selected={sort} onChange={setSort} />
            </View>
            <View style={{ height: 10 }} />
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.cardWrap}>
            <MedicineCard
              medicine={item}
              onBuy={() =>
                router.push({
                  pathname: "/customer/buy",
                  params: { id: item.id },
                })
              }
            />
          </View>
        )}
        ListEmptyComponent={
          <View style={{ paddingTop: 24 }}>
            <Empty
              icon="search"
              title="Koi dawai nahi mili"
              subtitle={emptySubtitle}
            />
          </View>
        }
      />

      {/* Floating Bottom Bar: Orders & Dukandar switch */}
      <View style={[styles.bottomBar, { bottom: bottomPad + 12 }]}>
        <Pressable
          onPress={() => router.push("/customer/orders")}
          style={({ pressed }) => [
            styles.ordersFab,
            {
              backgroundColor: "#0aa672",
              opacity: pressed ? 0.88 : 1,
            },
          ]}
        >
          <Feather name="package" size={18} color="#ffffff" />
          <Text style={styles.fabText}>
            Mere Orders {orders.length > 0 ? `(${orders.length})` : ""}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.push("/shop/medicines")}
          style={({ pressed }) => [
            styles.shopSwitchFab,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              opacity: pressed ? 0.88 : 1,
            },
          ]}
        >
          <Feather name="briefcase" size={16} color={colors.foreground} />
          <Text style={[styles.shopSwitchText, { color: colors.foreground }]}>
            Dukandar Portal
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function getCategoryLabel(imageKey: string): string {
  const map: Record<string, string> = {
    paracetamol: "Tablet",
    capsule: "Capsule",
    syrup: "Syrup",
    blister: "Blister Pack",
    inhaler: "Inhaler",
    vitamin: "Vitamin",
    eyedrops: "Eye Drops",
  };
  return map[imageKey] ?? imageKey;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  headerWrap: {
    paddingTop: 4,
  },
  filterRow: {
    marginHorizontal: -16,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 24,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    marginTop: 4,
  },
  col: {
    gap: 12,
  },
  cardWrap: {
    flex: 1,
    marginBottom: 12,
    maxWidth: "50%",
  },
  deliveryBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ecfdf5",
    borderWidth: 1,
    borderColor: "#a7f3d0",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 8,
  },
  deliveryBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#059669",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  deliveryBadgeText: {
    fontFamily: "Inter_700Bold",
    fontSize: 10,
    color: "#ffffff",
    letterSpacing: 0.5,
  },
  deliverySubtext: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    color: "#065f46",
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  countBadge: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  countBadgeText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    color: "#475569",
  },
  bottomBar: {
    position: "absolute",
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  ordersFab: {
    flex: 1.2,
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#0aa672",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  shopSwitchFab: {
    flex: 1,
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  fabText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: "#ffffff",
  },
  shopSwitchText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
  },
});
