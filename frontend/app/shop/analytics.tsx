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
    let todayProfit = 0;
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

    // today's delivered medicines (separate from total counts)
    const todayDeliveredItems: {
      name: string;
      qty: number;
      revenue: number;
    }[] = [];
    const todayDeliveredMap: Record<
      string,
      { name: string; qty: number; revenue: number }
    > = {};

    // last 7 days breakdown
    const dayBuckets: {
      label: string;
      dateKey: number;
      orders: number;
      delivered: number;
      revenue: number;
      profit: number;
    }[] = [];
    for (let i = 6; i >= 0; i--) {
      const t = todayStart - i * DAY_MS;
      const d = new Date(t);
      const day = d.getDate();
      const monthShort = d.toLocaleDateString("en-IN", { month: "short" });
      dayBuckets.push({
        label: i === 0 ? "Aaj" : i === 1 ? "Kal" : `${day} ${monthShort}`,
        dateKey: t,
        orders: 0,
        delivered: 0,
        revenue: 0,
        profit: 0,
      });
    }
    const bucketIndex = (ts: number) => {
      const dayStart = startOfDay(new Date(ts));
      const idx = dayBuckets.findIndex((b) => b.dateKey === dayStart);
      return idx;
    };

    for (const o of orders) {
      const itemRevenue = o.total - (o.deliveryCharge ?? 0);
      totalRevenue += o.total;
      if (o.createdAt >= todayStart) {
        todayOrders += 1;
        todayRevenue += o.total;
      }
      if (o.createdAt >= weekStart) {
        weekOrders += 1;
        weekRevenue += o.total;
        const idx = bucketIndex(o.createdAt);
        if (idx >= 0) {
          dayBuckets[idx].orders += 1;
          if (o.status === "delivered") {
            dayBuckets[idx].delivered += 1;
            dayBuckets[idx].revenue += o.total;
            dayBuckets[idx].profit += itemRevenue;
          }
        }
      }
      if (o.status === "delivered") {
        deliveredCount += 1;
        if (o.deliveredAt) {
          totalDeliveryMs += o.deliveredAt - o.createdAt;
          deliveredWithTimingCount += 1;
        }
        if (o.createdAt >= todayStart) {
          todayProfit += itemRevenue;
          const k = o.item.medicineId || o.item.name;
          if (!todayDeliveredMap[k]) {
            todayDeliveredMap[k] = {
              name: o.item.name,
              qty: 0,
              revenue: 0,
            };
          }
          todayDeliveredMap[k].qty += o.item.quantity;
          todayDeliveredMap[k].revenue += o.total;
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

    todayDeliveredItems.push(
      ...Object.values(todayDeliveredMap).sort((a, b) => b.qty - a.qty),
    );

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
      todayProfit,
      weekRevenue,
      totalRevenue,
      todayOrders,
      weekOrders,
      pendingCount,
      deliveredCount,
      lateCount,
      avgDeliveryMin,
      topProducts,
      todayDeliveredItems,
      dayBuckets: dayBuckets.slice().reverse(),
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

      <Text style={[styles.h2, { color: colors.foreground }]}>
        Aaj ki delivery report
      </Text>
      {stats.todayDeliveredItems.length === 0 ? (
        <View
          style={[
            styles.infoCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Feather name="package" size={20} color={colors.mutedForeground} />
          <Text style={[styles.infoSub, { color: colors.mutedForeground }]}>
            Aaj abhi tak koi delivery nahi hui
          </Text>
        </View>
      ) : (
        <View
          style={[
            styles.deliveryCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.deliveryTopRow}>
            <View style={{ flex: 1 }}>
              <Text
                style={[styles.deliveryLabel, { color: colors.mutedForeground }]}
              >
                Aaj ki net kamai (delivery charge ke baad)
              </Text>
              <Text
                style={[styles.deliveryValue, { color: colors.foreground }]}
              >
                ₹{stats.todayProfit.toFixed(0)}
              </Text>
            </View>
            <View
              style={[
                styles.profitChip,
                { backgroundColor: "#dcfce7" },
              ]}
            >
              <Feather name="trending-up" size={14} color="#15803d" />
              <Text style={styles.profitChipText}>
                {stats.todayDeliveredItems.length} item
              </Text>
            </View>
          </View>
          <View style={[styles.deliveryDivider, { backgroundColor: colors.border }]} />
          {stats.todayDeliveredItems.map((it, i) => (
            <View key={it.name + i} style={styles.deliveryRow}>
              <Text
                style={[styles.deliveryName, { color: colors.foreground }]}
                numberOfLines={1}
              >
                {it.name}
              </Text>
              <Text
                style={[styles.deliveryQty, { color: colors.mutedForeground }]}
              >
                × {it.qty}
              </Text>
              <Text
                style={[styles.deliveryAmt, { color: colors.foreground }]}
              >
                ₹{it.revenue.toFixed(0)}
              </Text>
            </View>
          ))}
        </View>
      )}

      <Text style={[styles.h2, { color: colors.foreground }]}>
        7-din ka day-wise report
      </Text>
      <View
        style={[
          styles.tableCard,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <View
          style={[
            styles.tableHeader,
            { borderBottomColor: colors.border },
          ]}
        >
          <Text style={[styles.thDay, { color: colors.mutedForeground }]}>
            Din
          </Text>
          <Text style={[styles.thNum, { color: colors.mutedForeground }]}>
            Orders
          </Text>
          <Text style={[styles.thNum, { color: colors.mutedForeground }]}>
            Delivered
          </Text>
          <Text style={[styles.thNum, { color: colors.mutedForeground }]}>
            Kamai
          </Text>
        </View>
        {stats.dayBuckets.map((d) => (
          <View
            key={d.dateKey}
            style={[styles.tableRow, { borderBottomColor: colors.border }]}
          >
            <Text style={[styles.tdDay, { color: colors.foreground }]}>
              {d.label}
            </Text>
            <Text style={[styles.tdNum, { color: colors.foreground }]}>
              {d.orders}
            </Text>
            <Text style={[styles.tdNum, { color: "#16a34a" }]}>
              {d.delivered}
            </Text>
            <Text
              style={[
                styles.tdNum,
                styles.tdStrong,
                { color: colors.foreground },
              ]}
            >
              ₹{d.profit.toFixed(0)}
            </Text>
          </View>
        ))}
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
  deliveryCard: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
  },
  deliveryTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  deliveryLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
  },
  deliveryValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 24,
    marginTop: 2,
  },
  profitChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  profitChipText: {
    fontFamily: "Inter_700Bold",
    fontSize: 12,
    color: "#15803d",
  },
  deliveryDivider: {
    height: 1,
    marginVertical: 6,
  },
  deliveryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  deliveryName: {
    flex: 1,
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  deliveryQty: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
  },
  deliveryAmt: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
    minWidth: 60,
    textAlign: "right",
  },
  tableCard: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  tableRow: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    alignItems: "center",
  },
  thDay: {
    flex: 1.2,
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  thNum: {
    flex: 1,
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    textAlign: "right",
  },
  tdDay: {
    flex: 1.2,
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
  },
  tdNum: {
    flex: 1,
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    textAlign: "right",
  },
  tdStrong: {
    fontFamily: "Inter_700Bold",
  },
});
