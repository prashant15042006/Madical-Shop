import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  Alert,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PrimaryButton } from "@/components/PrimaryButton";
import { useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";
import { finalPrice } from "@/constants/medicines";

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
  const unitFinal = medicine
    ? finalPrice(medicine.price, medicine.discountPercent)
    : 0;
  const total = +(unitFinal * quantity).toFixed(2);

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

  const [placing, setPlacing] = React.useState(false);
  const confirmOrder = async (method: "upi" | "cod") => {
    if (placing) return;
    setPlacing(true);
    try {
      const order = await placeOrder({
        customerName: String(name),
        customerMobile: String(mobile),
        customerAddress: String(address),
        item: {
          medicineId: medicine.id,
          name: medicine.name,
          imageKey: medicine.imageKey,
          customImageUri: medicine.customImageUri ?? null,
          price: medicine.price,
          discountPercent: medicine.discountPercent ?? 0,
          unitFinalPrice: unitFinal,
          quantity,
        },
        total,
        paymentMethod: method,
      });
      router.replace({
        pathname: "/customer/order/[id]",
        params: { id: order.id, just_placed: "1" },
      });
    } catch (err) {
      console.warn("placeOrder failed", err);
      setPlacing(false);
    }
  };

  const openUpiApp = async () => {
    try {
      const supported = await Linking.canOpenURL(upiString);
      if (supported) {
        await Linking.openURL(upiString);
      } else {
        Alert.alert(
          "UPI app nahi mila",
          "Apne phone me PhonePe/Google Pay/Paytm install karein, ya barcode scan karein.",
        );
      }
    } catch {
      Alert.alert(
        "Open nahi hua",
        "Barcode scan karke pay karein.",
      );
    }
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
            Qty {quantity} · ₹{unitFinal} each
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

      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
        Payment Karein
      </Text>

      <View
        style={[
          styles.methodCard,
          { backgroundColor: colors.card, borderColor: colors.primary },
        ]}
      >
        <View style={styles.methodHeader}>
          <View
            style={[
              styles.methodIcon,
              { backgroundColor: colors.primary },
            ]}
          >
            <Feather
              name="smartphone"
              size={20}
              color={colors.primaryForeground}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.methodTitle, { color: colors.foreground }]}>
              UPI Payment
            </Text>
            <Text
              style={[styles.methodSub, { color: colors.mutedForeground }]}
            >
              Dukandar ka barcode scan karein
            </Text>
          </View>
        </View>

        <View style={styles.qrWrap}>
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
              style={{ width: 220, height: 220 }}
              contentFit="contain"
            />
          </View>
          <View
            style={[
              styles.amountChip,
              { backgroundColor: colors.primary },
            ]}
          >
            <Text style={[styles.amountChipText, { color: colors.primaryForeground }]}>
              Pay ₹{total}
            </Text>
          </View>
        </View>

        <Text style={[styles.payToText, { color: colors.foreground }]}>
          Pay to: {shop.shopName || "MediGo Shop"}
        </Text>

        <View style={styles.steps}>
          <Step n={1} text="PhonePe / GPay / Paytm khole" colors={colors} />
          <Step n={2} text="Yeh barcode scan karein" colors={colors} />
          <Step
            n={3}
            text={`Exact ₹${total} pay karein`}
            colors={colors}
          />
        </View>

        {Platform.OS !== "web" ? (
          <PrimaryButton
            title="UPI App Khole"
            icon="external-link"
            variant="outline"
            onPress={openUpiApp}
          />
        ) : null}

        <PrimaryButton
          title="Pay Ho Gaya · Order Confirm"
          icon="check-circle"
          onPress={() => confirmOrder("upi")}
        />
      </View>

      <View
        style={[
          styles.methodCard,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <View style={styles.methodHeader}>
          <View
            style={[
              styles.methodIcon,
              { backgroundColor: colors.accent },
            ]}
          >
            <Feather name="dollar-sign" size={20} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.methodTitle, { color: colors.foreground }]}>
              Cash on Delivery
            </Text>
            <Text
              style={[styles.methodSub, { color: colors.mutedForeground }]}
            >
              Delivery par dukandar ko cash dijiye
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.codAmount,
            { backgroundColor: colors.secondary },
          ]}
        >
          <Text
            style={[styles.codLabel, { color: colors.mutedForeground }]}
          >
            Delivery par dena hai
          </Text>
          <Text style={[styles.codValue, { color: colors.foreground }]}>
            ₹{total}
          </Text>
        </View>

        <PrimaryButton
          title="COD se Order Confirm"
          icon="check"
          variant="outline"
          onPress={() => confirmOrder("cod")}
        />
      </View>
    </ScrollView>
  );
}

function Step({
  n,
  text,
  colors,
}: {
  n: number;
  text: string;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={styles.stepRow}>
      <View style={[styles.stepNum, { backgroundColor: colors.accent }]}>
        <Text style={[styles.stepNumText, { color: colors.accentForeground }]}>
          {n}
        </Text>
      </View>
      <Text style={[styles.stepText, { color: colors.foreground }]}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: 16,
    gap: 16,
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
  methodCard: {
    padding: 16,
    borderRadius: 22,
    borderWidth: 1.5,
    gap: 14,
  },
  methodHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  methodIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  methodTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
  },
  methodSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
  },
  qrWrap: {
    alignItems: "center",
    gap: 10,
  },
  qrFrame: {
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  amountChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
  },
  amountChipText: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
  },
  payToText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    textAlign: "center",
  },
  steps: {
    gap: 8,
    paddingHorizontal: 4,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  stepNum: {
    width: 24,
    height: 24,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumText: {
    fontFamily: "Inter_700Bold",
    fontSize: 12,
  },
  stepText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    flex: 1,
  },
  codAmount: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 14,
  },
  codLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
  },
  codValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
  },
});
