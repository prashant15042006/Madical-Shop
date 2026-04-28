import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Field } from "@/components/Field";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";

export default function ShopSetup() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { shop, saveShopProfile } = useApp();

  const [shopName, setShopName] = useState(shop.shopName);
  const [ownerName, setOwnerName] = useState(shop.ownerName);
  const [mobile, setMobile] = useState(shop.mobile);
  const [address, setAddress] = useState(shop.address);
  const [upiId, setUpiId] = useState(shop.upiId);
  const [qrImageUri, setQrImageUri] = useState<string | null>(shop.qrImageUri);

  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom + 8;

  const pickQr = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(
        "Permission chahiye",
        "Apna QR/barcode select karne ke liye gallery ki permission de.",
      );
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
    });
    if (!res.canceled && res.assets[0]) {
      setQrImageUri(res.assets[0].uri);
    }
  };

  const onSave = async () => {
    if (!shopName.trim() || !mobile.trim() || !upiId.trim()) {
      Alert.alert(
        "Details adhure hai",
        "Shop name, mobile aur UPI ID zaroori hai.",
      );
      return;
    }
    if (mobile.trim().length < 10) {
      Alert.alert("Galat number", "10 digit mobile number daale.");
      return;
    }
    await saveShopProfile({
      shopName: shopName.trim(),
      ownerName: ownerName.trim(),
      mobile: mobile.trim(),
      address: address.trim(),
      upiId: upiId.trim(),
      qrImageUri,
    });
    router.replace("/shop/dashboard");
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
      <View style={styles.heroBlock}>
        <View
          style={[styles.heroIcon, { backgroundColor: colors.primary }]}
        >
          <Feather name="briefcase" size={26} color={colors.primaryForeground} />
        </View>
        <Text style={[styles.heroTitle, { color: colors.foreground }]}>
          Apni dukan set karein
        </Text>
        <Text style={[styles.heroSub, { color: colors.mutedForeground }]}>
          Customer ko ye details order ke saath dikhengi
        </Text>
      </View>

      <View style={{ gap: 14 }}>
        <Field
          label="Shop ka naam"
          value={shopName}
          onChange={setShopName}
          placeholder="e.g. Sharma Medical Store"
          autoCapitalize="words"
        />
        <Field
          label="Dukandar ka naam"
          value={ownerName}
          onChange={setOwnerName}
          placeholder="Apna pura naam"
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
          label="Shop Address"
          value={address}
          onChange={setAddress}
          placeholder="Pura address"
          multiline
        />
        <Field
          label="UPI ID"
          value={upiId}
          onChange={setUpiId}
          placeholder="e.g. shop@paytm"
          autoCapitalize="none"
        />

        <View style={styles.qrSection}>
          <Text style={[styles.qrLabel, { color: colors.foreground }]}>
            Apna QR / Barcode upload karein
          </Text>
          <Text style={[styles.qrHelper, { color: colors.mutedForeground }]}>
            Optional — agar nahi upload karte to UPI ID se app khud QR generate
            karega
          </Text>

          <Pressable
            onPress={pickQr}
            style={({ pressed }) => [
              styles.qrPicker,
              {
                backgroundColor: colors.card,
                borderColor: colors.primary,
                opacity: pressed ? 0.9 : 1,
              },
            ]}
          >
            {qrImageUri ? (
              <Image
                source={{ uri: qrImageUri }}
                style={styles.qrPreview}
                contentFit="contain"
              />
            ) : (
              <View style={{ alignItems: "center", gap: 8 }}>
                <Feather name="upload-cloud" size={28} color={colors.primary} />
                <Text style={[styles.qrPickText, { color: colors.primary }]}>
                  Tap karke barcode select karein
                </Text>
              </View>
            )}
          </Pressable>

          {qrImageUri ? (
            <Pressable
              onPress={() => setQrImageUri(null)}
              hitSlop={8}
              style={styles.removeBtn}
            >
              <Feather name="trash-2" size={14} color={colors.destructive} />
              <Text
                style={[
                  styles.removeText,
                  { color: colors.destructive },
                ]}
              >
                Hatao
              </Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      <PrimaryButton
        title="Save & Continue"
        icon="check"
        onPress={onSave}
      />
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: 20,
    gap: 22,
  },
  heroBlock: {
    alignItems: "center",
    gap: 6,
  },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  heroTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
  },
  heroSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    textAlign: "center",
  },
  qrSection: {
    gap: 8,
  },
  qrLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
  },
  qrHelper: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
  },
  qrPicker: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderRadius: 18,
    padding: 18,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 160,
    marginTop: 6,
  },
  qrPreview: {
    width: 160,
    height: 160,
  },
  qrPickText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
  },
  removeBtn: {
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
    alignSelf: "flex-end",
    paddingVertical: 4,
  },
  removeText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
  },
});
