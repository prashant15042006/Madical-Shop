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
import { useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";

export default function CustomerDashboard() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
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
    return list;
  }, [medicines, query, mode, category]);

  const title = mode === "otc" ? "OTC Medicines" : "All Medicines";
  const subtitle =
    mode === "otc"
      ? "Bina parche ke milne wali dawai"
      : "Naam ya kaam likhke search karein";

  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom + 8;

  const emptySubtitle = useMemo(() => {
    if (query && category)
      return `"${query}" naam se koi ${getCategoryLabel(category)} available nahi hai`;
    if (query)
      return `"${query}" naam se koi dawai available nahi hai`;
    if (category)
      return `Is category mein abhi koi dawai nahi hai`;
    return "Iss category me abhi koi dawai nahi hai";
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
          { paddingBottom: bottomPad + 100 },
        ]}
        ListHeaderComponent={
          <View style={styles.headerWrap}>
            <Text style={[styles.title, { color: colors.foreground }]}>
              {title}
            </Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              {subtitle}
            </Text>
            <View style={{ height: 14 }} />
            <SearchBar value={query} onChange={setQuery} />
            <View style={{ height: 10 }} />
            <View style={styles.filterRow}>
              <CategoryFilter selected={category} onChange={setCategory} />
            </View>
            <View style={{ height: 8 }} />
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

      <Pressable
        onPress={() => router.push("/customer/orders")}
        style={({ pressed }) => [
          styles.fab,
          {
            backgroundColor: colors.primary,
            bottom: bottomPad + 16,
            opacity: pressed ? 0.85 : 1,
          },
        ]}
      >
        <Feather name="package" size={20} color={colors.primaryForeground} />
        <Text style={[styles.fabText, { color: colors.primaryForeground }]}>
          My Orders
          {orders.length > 0 ? ` (${orders.length})` : ""}
        </Text>
      </Pressable>
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
  fab: {
    position: "absolute",
    alignSelf: "center",
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    shadowColor: "#0aa672",
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  fabText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
});
