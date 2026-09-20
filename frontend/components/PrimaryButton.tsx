import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";

import { useColors } from "@/hooks/useColors";

type Props = {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  icon?: keyof typeof Feather.glyphMap;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  size?: "md" | "lg";
};

export function PrimaryButton({
  title,
  onPress,
  variant = "primary",
  icon,
  loading,
  disabled,
  style,
  size = "lg",
}: Props) {
  const colors = useColors();

  const isPrimary = variant === "primary";
  const isOutline = variant === "outline";
  const isGhost = variant === "ghost";
  const isSecondary = variant === "secondary";

  const bg = isPrimary
    ? colors.primary
    : isSecondary
      ? colors.secondary
      : "transparent";
  const fg = isPrimary
    ? colors.primaryForeground
    : isOutline
      ? colors.primary
      : isGhost
        ? colors.foreground
        : colors.secondaryForeground;
  const borderColor = isOutline ? colors.primary : "transparent";

  const handlePress = () => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync().catch(() => {});
    }
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        size === "lg" ? styles.lg : styles.md,
        {
          backgroundColor: bg,
          borderColor,
          borderWidth: isOutline ? 1.5 : 0,
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <View style={styles.row}>
          {icon ? (
            <Feather name={icon} size={size === "lg" ? 18 : 16} color={fg} />
          ) : null}
          <Text
            style={[
              styles.label,
              { color: fg, fontSize: size === "lg" ? 16 : 14 },
            ]}
          >
            {title}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  lg: {
    paddingVertical: 16,
    paddingHorizontal: 22,
  },
  md: {
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  label: {
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.2,
  },
});
