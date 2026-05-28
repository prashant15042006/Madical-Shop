import React from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { IMAGE_OPTIONS } from "@/constants/medicines";
import { useColors } from "@/hooks/useColors";

type Props = {
  selected: string | null;
  onChange: (key: string | null) => void;
};

const ALL_LABEL = "Sab";

export function CategoryFilter({ selected, onChange }: Props) {
  const colors = useColors();

  const chips = [
    { key: null, label: ALL_LABEL },
    ...IMAGE_OPTIONS,
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {chips.map((chip) => {
        const isActive = chip.key === selected;
        return (
          <Pressable
            key={chip.key ?? "__all__"}
            onPress={() => onChange(chip.key)}
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
              {chip.label}
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
