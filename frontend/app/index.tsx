import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";

type Option = {
  key: "otc" | "all" | "shop";
  title: string;
  subtitle: string;
  icon: keyof typeof Feather.glyphMap;
};

const OPTIONS: Option[] = [
  {
    key: "otc",
    title: "OTC Medicine",
    subtitle: "Bina parche ki dawai",
    icon: "shield",
  },
  {
    key: "all",
    title: "Search Medicine",
    subtitle: "Naam se dhundhe",
    icon: "search",
  },
  {
    key: "shop",
    title: "Dukandar",
    subtitle: "Apni dukan manage karein",
    icon: "briefcase",
  },
];

export default function RoleScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { setRole } = useApp();

  const openCustomer = (mode?: string) => {
    setRole("customer");
    router.push({
      pathname: "/customer/dashboard",
      params: mode ? { mode } : {},
    });
  };

  const openShop = () => {
    setRole("shop");
    router.push("/shop/medicines");
  };

  const topPad = Platform.OS === "web" ? Math.max(insets.top, 40) : insets.top;
  const bottomPad =
    Platform.OS === "web" ? Math.max(insets.bottom, 28) : insets.bottom + 20;

  return (
    <LinearGradient
      colors={[colors.secondary, colors.background]}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingTop: topPad + 16, paddingBottom: bottomPad + 24 },
        ]}
      >
        {/* Brand Header */}
        <View style={styles.header}>
          <View style={[styles.logo, { backgroundColor: "#0aa672" }]}>
            <Feather name="plus" size={30} color="#ffffff" />
          </View>
          <Text style={[styles.brand, { color: colors.foreground }]}>
            MediGo
          </Text>
          <Text style={[styles.tagline, { color: colors.mutedForeground }]}>
            ⚡ 10-15 Min Express Delivery • 100% Asli Dawaiyan
          </Text>
        </View>

        {/* Main Action Cards (Blinkit / Flipkart Style) */}
        <View style={styles.cardsContainer}>
          {/* Grahak Card */}
          <Pressable
            onPress={() => openCustomer()}
            style={({ pressed }) => [
              styles.primaryCard,
              {
                backgroundColor: "#0aa672",
                transform: [{ scale: pressed ? 0.98 : 1 }],
              },
            ]}
          >
            <View style={styles.cardHeaderRow}>
              <View style={styles.cardBadge}>
                <Text style={styles.cardBadgeText}>🔥 POPULAR • 10 MIN</Text>
              </View>
              <Feather name="arrow-right-circle" size={24} color="#ffffff" />
            </View>

            <View style={{ gap: 4, marginTop: 12 }}>
              <Text style={styles.cardTitleWhite}>
                🛒 Dawai Kharidein (Customer)
              </Text>
              <Text style={styles.cardSubtitleWhite}>
                Fever, Pain, Cough, OTC & Prescription dawaiyan discount par kharidein
              </Text>
            </View>

            <View style={styles.cardFeaturesRow}>
              <View style={styles.pillWhite}>
                <Text style={styles.pillWhiteText}>💊 Sabhi Dawaiyan</Text>
              </View>
              <View style={styles.pillWhite}>
                <Text style={styles.pillWhiteText}>⚡ Free Delivery</Text>
              </View>
              <View style={styles.pillWhite}>
                <Text style={styles.pillWhiteText}>💰 Best Chhoot</Text>
              </View>
            </View>
          </Pressable>

          {/* Dukandar Card */}
          <Pressable
            onPress={openShop}
            style={({ pressed }) => [
              styles.secondaryCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              },
            ]}
          >
            <View style={styles.cardHeaderRow}>
              <View style={[styles.cardBadgeSec, { backgroundColor: "#eff6ff", borderColor: "#bfdbfe" }]}>
                <Text style={[styles.cardBadgeSecText, { color: "#1d4ed8" }]}>🏪 DUKANDAR PARTNER</Text>
              </View>
              <Feather name="arrow-right" size={20} color={colors.foreground} />
            </View>

            <View style={{ gap: 4, marginTop: 10 }}>
              <Text style={[styles.cardTitleSec, { color: colors.foreground }]}>
                🏪 Dukan Portal (Shopkeeper)
              </Text>
              <Text style={[styles.cardSubtitleSec, { color: colors.mutedForeground }]}>
                Dawai add karein, stock badhayein, price & discount set karein, orders manage karein
              </Text>
            </View>

            <View style={styles.cardFeaturesRow}>
              <View style={[styles.pillSec, { backgroundColor: colors.secondary }]}>
                <Text style={[styles.pillSecText, { color: colors.foreground }]}>➕ Add/Delete</Text>
              </View>
              <View style={[styles.pillSec, { backgroundColor: colors.secondary }]}>
                <Text style={[styles.pillSecText, { color: colors.foreground }]}>📦 Stock Stepper</Text>
              </View>
              <View style={[styles.pillSec, { backgroundColor: colors.secondary }]}>
                <Text style={[styles.pillSecText, { color: colors.foreground }]}>📊 Orders</Text>
              </View>
            </View>
          </Pressable>
        </View>

        {/* Value Highlights */}
        <View style={styles.featuresBox}>
          <View style={styles.featItem}>
            <Text style={styles.featEmoji}>⚡</Text>
            <Text style={[styles.featTitle, { color: colors.foreground }]}>Tez Delivery</Text>
            <Text style={[styles.featSub, { color: colors.mutedForeground }]}>10-15 minute mein ghar tak</Text>
          </View>
          <View style={styles.featItem}>
            <Text style={styles.featEmoji}>💰</Text>
            <Text style={[styles.featTitle, { color: colors.foreground }]}>Bachat Har Baar</Text>
            <Text style={[styles.featSub, { color: colors.mutedForeground }]}>5% se 30% tak discount</Text>
          </View>
          <View style={styles.featItem}>
            <Text style={styles.featEmoji}>🛡️</Text>
            <Text style={[styles.featTitle, { color: colors.foreground }]}>100% Genuine</Text>
            <Text style={[styles.featSub, { color: colors.mutedForeground }]}>Verified chemist medicines</Text>
          </View>
        </View>

        <Text style={[styles.footer, { color: colors.mutedForeground }]}>
          MadiGO1 — Aapke mohalle ki online pharmacy
        </Text>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    flexGrow: 1,
    gap: 20,
  },
  header: {
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
    shadowColor: "#0aa672",
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  brand: {
    fontFamily: "Inter_700Bold",
    fontSize: 32,
    letterSpacing: -0.5,
  },
  tagline: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    textAlign: "center",
  },
  cardsContainer: {
    gap: 14,
  },
  primaryCard: {
    padding: 18,
    borderRadius: 20,
    shadowColor: "#0aa672",
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  secondaryCard: {
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  cardBadgeText: {
    fontFamily: "Inter_700Bold",
    fontSize: 10,
    color: "#ffffff",
    letterSpacing: 0.5,
  },
  cardTitleWhite: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    color: "#ffffff",
  },
  cardSubtitleWhite: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.9)",
    lineHeight: 18,
  },
  cardFeaturesRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14,
    flexWrap: "wrap",
  },
  pillWhite: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  pillWhiteText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    color: "#ffffff",
  },
  cardBadgeSec: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  cardBadgeSecText: {
    fontFamily: "Inter_700Bold",
    fontSize: 10,
    letterSpacing: 0.5,
  },
  cardTitleSec: {
    fontFamily: "Inter_700Bold",
    fontSize: 17,
  },
  cardSubtitleSec: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    lineHeight: 18,
  },
  pillSec: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  pillSecText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
  },
  featuresBox: {
    flexDirection: "row",
    gap: 8,
    marginTop: 6,
  },
  featItem: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    padding: 10,
    borderRadius: 14,
    alignItems: "center",
    gap: 2,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  featEmoji: {
    fontSize: 20,
    marginBottom: 2,
  },
  featTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 11,
    textAlign: "center",
  },
  featSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 9,
    textAlign: "center",
  },
  footer: {
    textAlign: "center",
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: "auto",
  },
});
