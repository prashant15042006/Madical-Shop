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

import { PrimaryButton } from "@/components/PrimaryButton";
import { useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";

type Method = "upi" | "cod";

export default function PaymentScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id, qty, name, mobile, address } = useLocalSearchParams<{
    id: string;
    qty: string;
    name: string;
    mobile: string;
    address: string;
  }>();

  const { medicines, shop, placeOrder } = useApp();
  const medicine = useMemo(
    () => medicines.find((m) => m.id === id),
    [medicines, id],
  );
  const quantity = Math.max(1, Number(qty) || 1);
  const total = medicine ? medicine.price * quantity : 0;

  const [method, setMethod] = useState<Method>("upi");
  const [showQr, setShowQr] = useState(false);

  const upiString = `upi://pay?pa=${encodeURIComponent(
    shop.upiId || "shop@medigo",
  )}&pn=${encodeURIComponent(shop.shopName || "MediGo Shop")}&am=${total}&cu=INR`;
  const generatedQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=10&data=${encodeURIComponent(
    upiString,
  )}`;

  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom + 8;

  if (!medicine) {
    return (
      <View
        style={[
          styles.empty,
          { backgroundColor: colors.background },
        ]}
      >
        <Text style={{ color: colors.foreground }}>Medicine nahi mili.</Text>
      </View>
    );
  }

  const confirmOrder = () => {
    const order = placeOrder({
      customerName: String(name),
      customerMobile: String(mobile),
      customerAddress: String(address),
      item: {
        medicineId: medicine.id,
        name: medicine.name,
        imageKey: medicine.imageKey,
        price: medicine.price,
        quantity,
      },
      total,
      paymentMethod: method,
    });
    router.replace({
      pathname: "/customer/order/[id]",
      params: { id: order.id, just_placed: "1" },
    });
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
          styles.summary,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <View
          style={[styles.imageWrap, { backgroundColor: colors.secondary }]}
        >
          <Image
            source={medicine.image}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
          />
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={[styles.medName, { color: colors.foreground }]}>
            {medicine.name}
          </Text>
          <Text style={[styles.medDesc, { color: colors.mutedForeground }]}>
            Qty {quantity} · ₹{medicine.price} each
          </Text>
        </View>
        <Text style={[styles.totalText, { color: colors.foreground }]}>
          ₹{total}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Delivery Address
        </Text>
        <View
          style={[
            styles.addressBox,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.addressName, { color: colors.foreground }]}>
            {String(name)}
          </Text>
          <Text style={[styles.addressLine, { color: colors.mutedForeground }]}>
            {String(mobile)}
          </Text>
          <Text style={[styles.addressLine, { color: colors.mutedForeground }]}>
            {String(address)}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Payment Method
        </Text>
        <View style={{ gap: 12 }}>
          <MethodRow
            active={method === "upi"}
            icon="smartphone"
            title="UPI / Barcode"
            subtitle="QR scan karke turant payment"
            onPress={() => {
              setMethod("upi");
              setShowQr(false);
            }}
          />
          <MethodRow
            active={method === "cod"}
            icon="dollar-sign"
            title="Cash on Delivery"
            subtitle="Dukandar ko delivery par cash dijiye"
            onPress={() => {
              setMethod("cod");
              setShowQr(false);
            }}
          />
        </View>
      </View>

      {method === "upi" ? (
        <View
          style={[
            styles.qrCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          {!showQr ? (
            <View style={{ alignItems: "center", gap: 10 }}>
              <Feather name="maximize" size={28} color={colors.primary} />
              <Text
                style={[styles.qrTitle, { color: colors.foreground }]}
              >
                Barcode Generate Karein
              </Text>
              <Text
                style={[styles.qrSub, { color: colors.mutedForeground }]}
              >
                ₹{total} ka QR banega — scan karke pay karein
              </Text>
              <PrimaryButton
                title="Generate QR"
                icon="zap"
                onPress={() => setShowQr(true)}
              />
            </View>
          ) : (
            <View style={{ alignItems: "center", gap: 10 }}>
              <View
                style={[
                  styles.qrFrame,
                  { backgroundColor: "#fff", borderColor: colors.border },
                ]}
              >
                <Image
                  source={
                    shop.qrImageUri
                      ? { uri: shop.qrImageUri }
                      : { uri: generatedQrUrl }
                  }
                  style={{ width: 240, height: 240 }}
                  contentFit="contain"
                />
              </View>
              <Text
                style={[styles.qrTitle, { color: colors.foreground }]}
              >
                ₹{total} pay to {shop.shopName || "MediGo Shop"}
              </Text>
              <Text
                style={[styles.qrSub, { color: colors.mutedForeground }]}
              >
                Apne UPI app se yeh barcode scan karein
              </Text>
            </View>
          )}
        </View>
      ) : null}

      <PrimaryButton
        title={
          method === "cod" ? "OK · Order Confirm" : "Maine Pay Kar Diya"
        }
        icon="check-circle"
        onPress={confirmOrder}
      />
    </ScrollView>
  );
}

function MethodRow({
  active,
  icon,
  title,
  subtitle,
  onPress,
}: {
  active: boolean;
  icon: keyof typeof Feather.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.methodRow,
        {
          backgroundColor: active ? colors.accent : colors.card,
          borderColor: active ? colors.primary : colors.border,
          transform: [{ scale: pressed ? 0.99 : 1 }],
        },
      ]}
    >
      <View
        style={[
          styles.methodIcon,
          { backgroundColor: active ? colors.primary : colors.secondary },
        ]}
      >
        <Feather
          name={icon}
          size={20}
          color={active ? colors.primaryForeground : colors.primary}
        />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text
          style={[styles.methodTitle, { color: colors.foreground }]}
        >
          {title}
        </Text>
        <Text
          style={[styles.methodSub, { color: colors.mutedForeground }]}
        >
          {subtitle}
        </Text>
      </View>
      <Feather
        name={active ? "check-circle" : "circle"}
        size={22}
        color={active ? colors.primary : colors.mutedForeground}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: 16,
    gap: 18,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  summary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
  },
  imageWrap: {
    width: 64,
    height: 64,
    borderRadius: 999,
    overflow: "hidden",
  },
  medName: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
  medDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
  },
  totalText: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
  },
  addressBox: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
  },
  addressName: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  addressLine: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
  },
  methodRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1.5,
  },
  methodIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  methodTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
  methodSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
  },
  qrCard: {
    padding: 20,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: "center",
    gap: 10,
  },
  qrFrame: {
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  qrTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    textAlign: "center",
  },
  qrSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    textAlign: "center",
  },
});
