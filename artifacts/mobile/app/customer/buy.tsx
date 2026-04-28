import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Field } from "@/components/Field";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { PrimaryButton } from "@/components/PrimaryButton";
import { QuantityStepper } from "@/components/QuantityStepper";
import { useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";
import { finalPrice } from "@/constants/medicines";

export default function BuyScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { medicines } = useApp();
  const medicine = useMemo(
    () => medicines.find((m) => m.id === id),
    [medicines, id],
  );

  const [qty, setQty] = useState(1);
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");

  const unitFinal = medicine
    ? finalPrice(medicine.price, medicine.discountPercent)
    : 0;
  const total = +(unitFinal * qty).toFixed(2);
  const originalTotal = medicine ? medicine.price * qty : 0;
  const savings = +(originalTotal - total).toFixed(2);
  const hasDiscount = medicine ? (medicine.discountPercent ?? 0) > 0 : false;
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

  const onContinue = () => {
    if (!name.trim() || !mobile.trim() || !address.trim()) {
      Alert.alert(
        "Details adhure hai",
        "Apna naam, mobile aur address bhare.",
      );
      return;
    }
    if (mobile.trim().length < 10) {
      Alert.alert("Galat number", "10 digit ka mobile number daale.");
      return;
    }
    router.push({
      pathname: "/customer/payment",
      params: {
        id: medicine.id,
        qty: String(qty),
        name: name.trim(),
        mobile: mobile.trim(),
        address: address.trim(),
      },
    });
  };

  return (
    <KeyboardAwareScrollViewCompat
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[
        styles.scroll,
        { paddingBottom: bottomPad + 24 },
      ]}
      bottomOffset={20}
      keyboardShouldPersistTaps="handled"
    >
      <View
        style={[
          styles.hero,
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
        <View style={styles.heroInfo}>
          <Text style={[styles.medName, { color: colors.foreground }]}>
            {medicine.name}
          </Text>
          <Text style={[styles.medDesc, { color: colors.mutedForeground }]}>
            {medicine.description}
          </Text>
          <View style={styles.priceLine}>
            <Text style={[styles.unitPrice, { color: colors.foreground }]}>
              ₹{unitFinal}
            </Text>
            {hasDiscount ? (
              <>
                <Text
                  style={[styles.unitOld, { color: colors.mutedForeground }]}
                >
                  ₹{medicine.price}
                </Text>
                <View style={styles.offTag}>
                  <Text style={styles.offTagText}>
                    {medicine.discountPercent}% OFF
                  </Text>
                </View>
              </>
            ) : null}
          </View>
          <View style={styles.metaRow}>
            <View
              style={[styles.tag, { backgroundColor: colors.accent }]}
            >
              <Feather
                name="check-circle"
                size={12}
                color={colors.accentForeground}
              />
              <Text
                style={[styles.tagText, { color: colors.accentForeground }]}
              >
                {medicine.otc ? "OTC" : "Prescription"}
              </Text>
            </View>
            <Text style={[styles.stock, { color: colors.mutedForeground }]}>
              Stock: {medicine.stock}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Quantity
        </Text>
        <View style={styles.qtyRow}>
          <QuantityStepper
            value={qty}
            onChange={setQty}
            max={medicine.stock || 1}
          />
          <View style={styles.priceWrap}>
            <Text style={[styles.priceLabel, { color: colors.mutedForeground }]}>
              Total
            </Text>
            <View style={styles.totalLine}>
              <Text style={[styles.priceValue, { color: colors.foreground }]}>
                ₹{total}
              </Text>
              {hasDiscount ? (
                <Text
                  style={[
                    styles.totalOld,
                    { color: colors.mutedForeground },
                  ]}
                >
                  ₹{originalTotal}
                </Text>
              ) : null}
            </View>
          </View>
        </View>
        {hasDiscount && savings > 0 ? (
          <View
            style={[
              styles.savingsBanner,
              { backgroundColor: colors.accent, borderColor: colors.primary },
            ]}
          >
            <Feather name="tag" size={16} color={colors.primary} />
            <Text style={[styles.savingsText, { color: colors.foreground }]}>
              ₹{savings} ki bachat ho rahi hai
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Aapki details
        </Text>
        <View style={{ gap: 12 }}>
          <Field
            label="Naam"
            value={name}
            onChange={setName}
            placeholder="Pura naam"
            autoCapitalize="words"
          />
          <Field
            label="Mobile Number"
            value={mobile}
            onChange={setMobile}
            placeholder="10 digit number"
            keyboardType="phone-pad"
          />
          <Field
            label="Delivery Location"
            value={address}
            onChange={setAddress}
            placeholder="Ghar ka pura address"
            multiline
          />
        </View>
      </View>

      <PrimaryButton
        title="OK · Payment Karein"
        icon="arrow-right"
        onPress={onContinue}
      />
    </KeyboardAwareScrollViewCompat>
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
  hero: {
    flexDirection: "row",
    gap: 14,
    padding: 14,
    borderRadius: 22,
    borderWidth: 1,
  },
  imageWrap: {
    width: 96,
    height: 96,
    borderRadius: 999,
    overflow: "hidden",
  },
  heroInfo: {
    flex: 1,
    justifyContent: "center",
    gap: 4,
  },
  medName: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
  },
  medDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
  },
  priceLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
    flexWrap: "wrap",
  },
  unitPrice: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
  },
  unitOld: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    textDecorationLine: "line-through",
  },
  offTag: {
    backgroundColor: "#fee2e2",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
  },
  offTagText: {
    fontFamily: "Inter_700Bold",
    fontSize: 10,
    color: "#dc2626",
    letterSpacing: 0.4,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 8,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  tagText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
  },
  stock: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
  },
  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  priceWrap: {
    alignItems: "flex-end",
  },
  priceLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
  },
  totalLine: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
  },
  priceValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 24,
    letterSpacing: -0.3,
  },
  totalOld: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    textDecorationLine: "line-through",
  },
  savingsBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  savingsText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
  },
});
