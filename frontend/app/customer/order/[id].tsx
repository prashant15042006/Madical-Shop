import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CountdownBadge } from "@/components/CountdownBadge";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";
import { resolveImage } from "@/constants/medicines";

export default function OrderDetail() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id, just_placed } = useLocalSearchParams<{
    id: string;
    just_placed?: string;
  }>();
  const { orders, rateOrder } = useApp();

  const order = useMemo(() => orders.find((o) => o.id === id), [orders, id]);
  const [pickedRating, setPickedRating] = useState(0);
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom + 8;

  if (!order) {
    return (
      <View
        style={[
          styles.empty,
          { backgroundColor: colors.background },
        ]}
      >
        <Text style={{ color: colors.foreground }}>Order nahi mila.</Text>
      </View>
    );
  }

  const isDelivered = order.status === "delivered";
  const currentRating = order.customerRating ?? pickedRating;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[
        styles.scroll,
        { paddingBottom: bottomPad + 24 },
      ]}
    >
      {just_placed === "1" ? (
        <View
          style={[
            styles.successBanner,
            { backgroundColor: colors.accent, borderColor: colors.primary },
          ]}
        >
          <View
            style={[styles.successIcon, { backgroundColor: colors.primary }]}
          >
            <Feather name="check" size={22} color={colors.primaryForeground} />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={[styles.successTitle, { color: colors.accentForeground }]}
            >
              Order Confirmed
            </Text>
            <Text style={[styles.successSub, { color: colors.foreground }]}>
              Dukandar ko aapka order aur details bhej diya gaya hai
            </Text>
          </View>
        </View>
      ) : null}

      <View
        style={[
          styles.card,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <View style={styles.cardHead}>
          <View
            style={[styles.imageWrap, { backgroundColor: colors.secondary }]}
          >
            <Image
              source={resolveImage(
                order.item.imageKey,
                order.item.customImageUri,
              )}
              style={{ width: "100%", height: "100%" }}
              contentFit="cover"
            />
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={[styles.name, { color: colors.foreground }]}>
              {order.item.name}
            </Text>
            <Text style={[styles.meta, { color: colors.mutedForeground }]}>
              Qty {order.item.quantity} · ₹{order.item.unitFinalPrice} each
              {order.item.discountPercent
                ? ` (${order.item.discountPercent}% off)`
                : ""}
            </Text>
            <Text style={[styles.total, { color: colors.foreground }]}>
              Total ₹{order.total}
            </Text>
          </View>
        </View>

        <View
          style={[styles.divider, { backgroundColor: colors.border }]}
        />

        <Row
          label="Payment"
          value={order.paymentMethod === "cod" ? "Cash on Delivery" : "UPI"}
        />
        <Row
          label="Status"
          value={isDelivered ? "Delivered" : "Order Placed"}
          highlight={isDelivered ? colors.primary : undefined}
        />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <Row
          label="Items"
          value={`₹${(order.total - (order.deliveryCharge ?? 0)).toFixed(2)}`}
        />
        <Row
          label="Delivery Charge"
          value={`₹${(order.deliveryCharge ?? 0).toFixed(0)}`}
        />
        <Row label="Total" value={`₹${order.total}`} highlight={colors.primary} />
        <View style={{ marginTop: 8 }}>
          <CountdownBadge
            expectedDeliveryAt={order.expectedDeliveryAt}
            deliveredAt={order.deliveredAt}
            status={order.status}
          />
        </View>
      </View>

      <View
        style={[
          styles.card,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <Text
          style={[styles.sectionTitle, { color: colors.foreground }]}
        >
          Dukandar ke details
        </Text>
        <Detail icon="briefcase" label="Shop" value={order.shopName} />
        <Detail icon="phone" label="Mobile" value={order.shopMobile} />
        <Detail icon="map-pin" label="Address" value={order.shopAddress} />
      </View>

      <View
        style={[
          styles.card,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <Text
          style={[styles.sectionTitle, { color: colors.foreground }]}
        >
          Aapke details (dukandar ko bheja gaya)
        </Text>
        <Detail icon="user" label="Naam" value={order.customerName} />
        <Detail icon="phone" label="Mobile" value={order.customerMobile} />
        <Detail
          icon="map-pin"
          label="Delivery Address"
          value={order.customerAddress}
        />
      </View>

      {isDelivered ? (
        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text
            style={[styles.sectionTitle, { color: colors.foreground }]}
          >
            Dukandar ko rating de
          </Text>
          <Text
            style={[styles.helperText, { color: colors.mutedForeground }]}
          >
            Aapka feedback dukan ki rating banata hai
          </Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((n) => (
              <Pressable
                key={n}
                onPress={() => {
                  setPickedRating(n);
                  rateOrder(order.id, n);
                }}
                hitSlop={6}
              >
                <Feather
                  name="star"
                  size={36}
                  color={n <= currentRating ? "#f59e0b" : colors.muted}
                  style={{
                    opacity: n <= currentRating ? 1 : 0.7,
                  }}
                />
              </Pressable>
            ))}
          </View>
          {order.customerRating ? (
            <Text
              style={[styles.thanks, { color: colors.primary }]}
            >
              Dhanyavad! Aapne {order.customerRating} star diye hai.
            </Text>
          ) : null}
        </View>
      ) : null}

      <PrimaryButton
        title="Wapas Home"
        variant="outline"
        icon="home"
        onPress={() => router.replace("/")}
      />
    </ScrollView>
  );
}

function Row({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: string;
}) {
  const colors = useColors();
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, { color: colors.mutedForeground }]}>
        {label}
      </Text>
      <Text
        style={[
          styles.rowValue,
          { color: highlight ?? colors.foreground },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

function Detail({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value: string;
}) {
  const colors = useColors();
  return (
    <View style={styles.detailRow}>
      <View
        style={[styles.detailIcon, { backgroundColor: colors.secondary }]}
      >
        <Feather name={icon} size={16} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>
          {label}
        </Text>
        <Text style={[styles.detailValue, { color: colors.foreground }]}>
          {value}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: 16,
    gap: 14,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  successBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
  },
  successIcon: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  successTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 15,
  },
  successSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 2,
  },
  card: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    gap: 12,
  },
  cardHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  imageWrap: {
    width: 64,
    height: 64,
    borderRadius: 999,
    overflow: "hidden",
  },
  name: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
  },
  meta: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
  },
  total: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    marginTop: 2,
  },
  divider: {
    height: 1,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
  },
  rowValue: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  sectionTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
  },
  helperText: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  detailIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  detailLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
  },
  detailValue: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  starsRow: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    marginTop: 6,
  },
  thanks: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    textAlign: "center",
    marginTop: 8,
  },
});
