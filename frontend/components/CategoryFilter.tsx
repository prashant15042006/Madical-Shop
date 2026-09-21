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
    { key: null, label: "Sabhi Dawai", icon: "🩺" },
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
                backgroundColor: isActive ? "#0aa672" : colors.card,
                borderColor: isActive ? "#0aa672" : colors.border,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <Text style={styles.emoji}>{chip.icon}</Text>
            <Text
              style={[
                styles.chipText,
                {
                  color: isActive ? "#ffffff" : colors.foreground,
                  fontWeight: isActive ? "700" : "500",
                },
              ]}
            >
              {chip.label}
            </Text>
          </Pressable>
        );
      })}
      <View style={{ width: 8 }} />
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
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  emoji: {
    fontSize: 14,
  },
  chipText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
  },
});
