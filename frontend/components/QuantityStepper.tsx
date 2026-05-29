import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

type Props = {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
};

export function QuantityStepper({ value, onChange, min = 1, max = 99 }: Props) {
  const colors = useColors();

  const tap = () => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync().catch(() => {});
    }
  };

  return (
    <View
      style={[
        styles.row,
        { backgroundColor: colors.secondary, borderColor: colors.border },
      ]}
    >
      <Pressable
        onPress={() => {
          if (value > min) {
            tap();
            onChange(value - 1);
          }
        }}
        disabled={value <= min}
        style={({ pressed }) => [
          styles.btn,
          {
            opacity: value <= min ? 0.4 : pressed ? 0.7 : 1,
          },
        ]}
      >
        <Feather name="minus" size={20} color={colors.foreground} />
      </Pressable>
      <Text style={[styles.value, { color: colors.foreground }]}>{value}</Text>
      <Pressable
        onPress={() => {
          if (value < max) {
            tap();
            onChange(value + 1);
          }
        }}
        disabled={value >= max}
        style={({ pressed }) => [
          styles.btn,
          {
            opacity: value >= max ? 0.4 : pressed ? 0.7 : 1,
          },
        ]}
      >
        <Feather name="plus" size={20} color={colors.foreground} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 4,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
  btn: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  value: {
    minWidth: 36,
    textAlign: "center",
    fontFamily: "Inter_700Bold",
    fontSize: 18,
  },
});
