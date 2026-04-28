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

  const onPick = (opt: Option) => {
    if (opt.key === "shop") {
      setRole("shop");
      router.push("/shop/setup");
    } else {
      setRole("customer");
      router.push({
        pathname: "/customer/dashboard",
        params: { mode: opt.key },
      });
    }
  };

  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const bottomPad =
    Platform.OS === "web" ? Math.max(insets.bottom, 34) : insets.bottom + 8;

  return (
    <LinearGradient
      colors={[colors.secondary, colors.background]}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingTop: topPad + 24, paddingBottom: bottomPad + 24 },
        ]}
      >
        <View style={styles.header}>
          <View style={[styles.logo, { backgroundColor: colors.primary }]}>
            <Feather name="plus" size={28} color={colors.primaryForeground} />
          </View>
          <Text style={[styles.brand, { color: colors.foreground }]}>
            MediGo
          </Text>
          <Text style={[styles.tagline, { color: colors.mutedForeground }]}>
            Aapki dawai, aapke darwaze tak
          </Text>
        </View>

        <Text style={[styles.heading, { color: colors.foreground }]}>
          Aap kaise shuru karna chahenge?
        </Text>

        <View style={styles.options}>
          {OPTIONS.map((opt) => (
            <Pressable
              key={opt.key}
              onPress={() => onPick(opt)}
              style={({ pressed }) => [
                styles.option,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                },
              ]}
            >
              <View
                style={[
                  styles.optionIcon,
                  {
                    backgroundColor:
                      opt.key === "shop" ? colors.accent : colors.secondary,
                  },
                ]}
              >
                <Feather name={opt.icon} size={22} color={colors.primary} />
              </View>
              <View style={styles.optionText}>
                <Text
                  style={[styles.optionTitle, { color: colors.foreground }]}
                >
                  {opt.title}
                </Text>
                <Text
                  style={[
                    styles.optionSubtitle,
                    { color: colors.mutedForeground },
                  ]}
                >
                  {opt.subtitle}
                </Text>
              </View>
              <Feather
                name="chevron-right"
                size={22}
                color={colors.mutedForeground}
              />
            </Pressable>
          ))}
        </View>

        <Text style={[styles.footer, { color: colors.mutedForeground }]}>
          Customer aur dukandar — dono ke liye ek hi app
        </Text>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    flexGrow: 1,
    gap: 28,
  },
  header: {
    alignItems: "center",
    gap: 10,
    marginTop: 8,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    shadowColor: "#0aa672",
    shadowOpacity: 0.25,
    shadowRadius: 16,
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
    fontSize: 14,
  },
  heading: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
    marginTop: 8,
  },
  options: {
    gap: 14,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderRadius: 22,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  optionText: {
    flex: 1,
    gap: 2,
  },
  optionTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
  },
  optionSubtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
  },
  footer: {
    textAlign: "center",
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: "auto",
  },
});
