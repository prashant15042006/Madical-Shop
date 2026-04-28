import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

type Props = {
  icon?: keyof typeof Feather.glyphMap;
  title: string;
  subtitle?: string;
};

export function Empty({ icon = "inbox", title, subtitle }: Props) {
  const colors = useColors();
  return (
    <View style={styles.wrap}>
      <View
        style={[styles.iconWrap, { backgroundColor: colors.secondary }]}
      >
        <Feather name={icon} size={28} color={colors.primary} />
      </View>
      <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
      {subtitle ? (
        <Text style={[styles.sub, { color: colors.mutedForeground }]}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 8,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  title: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
  },
  sub: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    textAlign: "center",
    maxWidth: 280,
  },
});
