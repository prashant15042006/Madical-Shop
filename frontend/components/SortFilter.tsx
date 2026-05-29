import React from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useColors } from "@/hooks/useColors";

export type SortOption =
  | "default"
  | "name-asc"
  | "price-asc"
  | "price-desc"
  | "discount-desc";

type Props = {
  selected: SortOption;
  onChange: (option: SortOption) => void;
};

const OPTIONS: { key: SortOption; label: string }[] = [
  { key: "default", label: "Default" },
  { key: "name-asc", label: "Name (A-Z)" },
  { key: "price-asc", label: "Price ↓" },
  { key: "price-desc", label: "Price ↑" },
  { key: "discount-desc", label: "Discount ↑" },
];

export function SortFilter({ selected, onChange }: Props) {
  const colors = useColors();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {OPTIONS.map((opt) => {
        const isActive = opt.key === selected;
        return (
          <Pressable
            key={opt.key}
            onPress={() => onChange(opt.key)}
            style={({ pressed }) => [
              styles.chip,
              {
                backgroundColor: isActive
                  ? colors.primary
                  : colors.card,
                borderColor: isActive ? colors.primary : colors.border,
                opacity: pressed ? 0.75 : 1,
              },
            ]}
          >
            <Text
              style={[
                styles.chipText,
                {
                  color: isActive
                    ? colors.primaryForeground
                    : colors.foreground,
                },
              ]}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
      <View style={{ width: 4 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
  },
});
