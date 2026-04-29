import { Feather } from "@expo/vector-icons";
import React, { useMemo } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Empty } from "@/components/Empty";
import { useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";

const DAY_MS = 24 * 60 * 60_000;

function startOfDay(d: Date): number {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.getTime();
}

export default function ShopAnalytics() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { orders, medicines } = useApp();
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom + 8;

  const stats = useMemo(() => {
    const now = Date.now();
    const todayStart = startOfDay(new Date(now));
    const weekStart = todayStart - 6 * DAY_MS;

    let todayRevenue = 0;
    let weekRevenue = 0;
    let totalRevenue = 0;
    let todayOrders = 0;
    let weekOrders = 0;
    let pendingCount = 0;
    let deliveredCount = 0;
    let lateCount = 0;
    let totalDeliveryMs = 0;
    let deliveredWithTimingCount = 0;

    const productCount: Record<
      string,
      { name: string; qty: number; revenue: number; imageKey: string }
    > = {};

    for (const o of orders) {
      totalRevenue += o.total;
      if (o.createdAt >= todayStart) {
        todayOrders += 1;
        todayRevenue += o.total;
      }
      if (o.createdAt >= weekStart) {
        weekOrders += 1;
        weekRevenue += o.total;
      }
      if (o.status === "delivered") {
        deliveredCount += 1;
        if (o.deliveredAt) {
          totalDeliveryMs += o.deliveredAt - o.createdAt;
          deliveredWithTimingCount += 1;
        }
      } else {
        pendingCount += 1;
        if (o.expectedDeliveryAt && now > o.expectedDeliveryAt) lateCount += 1;
      }

      const key = o.item.medicineId || o.item.name;
      if (!productCount[key]) {
        productCount[key] = {
          name: o.item.name,
          qty: 0,
          revenue: 0,
          imageKey: o.item.imageKey,
        };
      }
      productCount[key].qty += o.item.quantity;
      productCount[key].revenue += o.total;
    }

    const topProducts = Object.values(productCount)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    const avgDeliveryMin =
      deliveredWithTimingCount > 0
        ? Math.round(totalDeliveryMs / deliveredWithTimingCount / 60_000)
        : 0;

    const lowStock = medicines
      .filter((m) => m.stock > 0 && m.stock <= 5)
      .slice(0, 5);
    const outOfStock = medicines.filter((m) => m.stock === 0).slice(0, 5);

    return {
      todayRevenue,
      weekRevenue,
      totalRevenue,
      todayOrders,
      weekOrders,
      pendingCount,
      deliveredCount,
      lateCount,
      avgDeliveryMin,
      topProducts,
      lowStock,
      outOfStock,
    };
  }, [orders, medicines]);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[
        styles.scroll,
        { paddingBottom: bottomPad + 24 },
      ]}
    >
      <Text style={[styles.h2, { color: colors.foreground }]}>Aaj ka kaam</Text>
      <View style={styles.row2}>
        <Card
          icon="dollar-sign"
          label="Aaj ki kamai"
          value={`₹${stats.todayRevenue.toFixed(0)}`}
          accent="#16a34a"
        />
        <Card
          icon="shopping-bag"
          label="Aaj ke orders"
          value={String(stats.todayOrders)}
          accent="#0ea5e9"
        />
      </View>

      <Text style={[styles.h2, { color: colors.foreground }]}>
        7-din ka summary
      </Text>
      <View style={styles.row2}>
        <Card
          icon="trending-up"
          label="Hafte ki kamai"
          value={`₹${stats.weekRevenue.toFixed(0)}`}
          accent={colors.primary}
        />
        <Card
          icon="package"
          label="Hafte ke orders"
          value={String(stats.weekOrders)}
          accent="#9333ea"
        />
      </View>

      <Text style={[styles.h2, { color: colors.foreground }]}>
        Order status
      </Text>
      <View style={styles.row3}>
        <Mini
          label="Pending"
          value={String(stats.pendingCount)}
          color="#f59e0b"
        />
        <Mini
          label="Late"
          value={String(stats.lateCount)}
          color="#dc2626"
        />
        <Mini
          label="Delivered"
          value={String(stats.deliveredCount)}
          color="#16a34a"
        />
      </View>

      {stats.avgDeliveryMin > 0 ? (
        <View
          style={[
            styles.infoCard,
            { backgroundColor: colors.accent, borderColor: colors.primary },
          ]}
        >
          <Feather name="clock" size={20} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.infoTitle, { color: colors.accentForeground }]}>
              Average delivery time
            </Text>
            <Text style={[styles.infoSub, { color: colors.foreground }]}>
              {stats.avgDeliveryMin} minute — bahut achha kaam!
            </Text>
          </View>
        </View>
      ) : null}

      <Text style={[styles.h2, { color: colors.foreground }]}>
        Top selling medicines
      </Text>
      {stats.topProducts.length === 0 ? (
        <Empty
          icon="bar-chart-2"
          title="Abhi data nahi"
          subtitle="Order aane ke baad yahan top medicines dikhengi"
        />
      ) : (
        <View style={{ gap: 8 }}>
          {stats.topProducts.map((p, i) => (
            <View
              key={p.name + i}
              style={[
                styles.productRow,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <View
                style={[
                  styles.rankCircle,
                  { backgroundColor: colors.primary },
                ]}
              >
                <Text
                  style={[
                    styles.rankText,
                    { color: colors.primaryForeground },
                  ]}
                >
                  {i + 1}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.prodName, { color: colors.foreground }]}>
                  {p.name}
                </Text>
                <Text
                  style={[styles.prodMeta, { color: colors.mutedForeground }]}
                >
                  {p.qty} bika · ₹{p.revenue.toFixed(0)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {stats.outOfStock.length > 0 ? (
        <>
          <Text style={[styles.h2, { color: "#dc2626" }]}>
            Out of stock — turant fill karein
          </Text>
          <View style={{ gap: 6 }}>
            {stats.outOfStock.map((m) => (
              <Text
                key={m.id}
                style={[styles.alertText, { color: colors.foreground }]}
              >
                • {m.name}
              </Text>
            ))}
          </View>
        </>
      ) : null}

      {stats.lowStock.length > 0 ? (
        <>
          <Text style={[styles.h2, { color: "#f59e0b" }]}>
            Low stock — jald order karein
          </Text>
          <View style={{ gap: 6 }}>
            {stats.lowStock.map((m) => (
              <Text
                key={m.id}
                style={[styles.alertText, { color: colors.foreground }]}
              >
                • {m.name} — sirf {m.stock} baaki
              </Text>
            ))}
          </View>
        </>
      ) : null}
    </ScrollView>
  );
}

function Card({
  icon,
  label,
  value,
  accent,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value: string;
  accent: string;
}) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <View style={[styles.cardIcon, { backgroundColor: accent + "20" }]}>
        <Feather name={icon} size={18} color={accent} />
      </View>
      <Text style={[styles.cardValue, { color: colors.foreground }]}>
        {value}
      </Text>
      <Text style={[styles.cardLabel, { color: colors.mutedForeground }]}>
        {label}
      </Text>
    </View>
  );
}

function Mini({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.mini,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <Text style={[styles.miniValue, { color }]}>{value}</Text>
      <Text style={[styles.miniLabel, { color: colors.mutedForeground }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16, gap: 12 },
  h2: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    marginTop: 8,
  },
  row2: { flexDirection: "row", gap: 12 },
  row3: { flexDirection: "row", gap: 8 },
  card: {
    flex: 1,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
  },
  cardIcon: {
    width: 32,
    height: 32,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  cardValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
  },
  cardLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
  },
  mini: {
    flex: 1,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    gap: 2,
  },
  miniValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
  },
  miniLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  infoTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
  },
  infoSub: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
  },
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  rankCircle: {
    width: 28,
    height: 28,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  rankText: {
    fontFamily: "Inter_700Bold",
    fontSize: 13,
  },
  prodName: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  prodMeta: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
  },
  alertText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    paddingLeft: 4,
  },
});
