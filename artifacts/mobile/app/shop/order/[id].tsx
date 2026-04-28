import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  Alert,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PrimaryButton } from "@/components/PrimaryButton";
import { useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";
import { MEDICINE_IMAGES } from "@/constants/medicines";

export default function ShopOrderDetail() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { orders, markDelivered } = useApp();
  const order = useMemo(() => orders.find((o) => o.id === id), [orders, id]);

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

  const callCustomer = () => {
    Linking.openURL(`tel:${order.customerMobile}`).catch(() => {});
  };

  const onDeliver = () => {
    Alert.alert(
      "Confirm Delivery",
      `${order.item.name} × ${order.item.quantity} ko deliver mark karein?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Haan, deliver",
          onPress: async () => {
            await markDelivered(order.id);
            router.back();
          },
        },
      ],
    );
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[
        styles.scroll,
        { paddingBottom: bottomPad + 24 },
      ]}
    >
      <View
        style={[
          styles.card,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <View style={styles.headRow}>
          <View
            style={[styles.imageWrap, { backgroundColor: colors.secondary }]}
          >
            <Image
              source={
                MEDICINE_IMAGES[order.item.imageKey] ??
                MEDICINE_IMAGES.paracetamol
              }
              style={{ width: "100%", height: "100%" }}
              contentFit="cover"
            />
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={[styles.name, { color: colors.foreground }]}>
              {order.item.name}
            </Text>
            <Text style={[styles.meta, { color: colors.mutedForeground }]}>
              Qty {order.item.quantity} · ₹{order.item.price} each
            </Text>
            <Text style={[styles.total, { color: colors.foreground }]}>
              Total ₹{order.total}
            </Text>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <Row
          label="Payment"
          value={
            order.paymentMethod === "cod"
              ? "Cash on Delivery — collect karein"
              : "UPI — paid"
          }
        />
        <Row
          label="Status"
          value={isDelivered ? "Delivered" : "Naya order"}
          highlight={isDelivered ? colors.primary : "#f59e0b"}
        />
      </View>

      <View
        style={[
          styles.card,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Customer Details
        </Text>
        <Detail icon="user" label="Naam" value={order.customerName} />
        <Pressable onPress={callCustomer}>
          <Detail
            icon="phone"
            label="Mobile (tap to call)"
            value={order.customerMobile}
          />
        </Pressable>
        <Detail
          icon="map-pin"
          label="Delivery Address"
          value={order.customerAddress}
        />
      </View>

      {!isDelivered ? (
        <PrimaryButton
          title="Order Delivered"
          icon="check-circle"
          onPress={onDeliver}
        />
      ) : (
        <View
          style={[
            styles.deliveredBanner,
            { backgroundColor: colors.accent, borderColor: colors.primary },
          ]}
        >
          <Feather
            name="check-circle"
            size={22}
            color={colors.accentForeground}
          />
          <Text
            style={[styles.deliveredText, { color: colors.accentForeground }]}
          >
            Delivery complete ho chuki hai
            {order.customerRating
              ? ` · ${order.customerRating}★ rating mili`
              : ""}
          </Text>
        </View>
      )}
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
      <View style={[styles.detailIcon, { backgroundColor: colors.secondary }]}>
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
  card: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    gap: 12,
  },
  headRow: {
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
    flex: 1,
    textAlign: "right",
  },
  sectionTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
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
  deliveredBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  deliveredText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    flex: 1,
  },
});
