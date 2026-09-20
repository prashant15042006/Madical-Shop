import { Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";

import { useColors } from "@/hooks/useColors";

type Props = {
  expectedDeliveryAt: number | null;
  deliveredAt: number | null;
  status: string;
  size?: "sm" | "md";
  style?: ViewStyle;
};

function formatDuration(ms: number): string {
  const totalMin = Math.round(Math.abs(ms) / 60_000);
  if (totalMin < 60) return `${totalMin} min`;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return m === 0 ? `${h} ghante` : `${h}h ${m}min`;
}

function formatTime(ms: number): string {
  const d = new Date(ms);
  let h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  const mm = m < 10 ? `0${m}` : m;
  return `${h}:${mm} ${ampm}`;
}

export function CountdownBadge({
  expectedDeliveryAt,
  deliveredAt,
  status,
  size = "md",
  style,
}: Props) {
  const colors = useColors();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (status === "delivered") return;
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, [status]);

  const small = size === "sm";

  if (status === "delivered" && deliveredAt) {
    return (
      <View
        style={[
          styles.badge,
          {
            backgroundColor: "#dcfce7",
            paddingHorizontal: small ? 8 : 10,
            paddingVertical: small ? 3 : 5,
          },
          style,
        ]}
      >
        <Feather name="check-circle" size={small ? 11 : 13} color="#15803d" />
        <Text
          style={[
            styles.text,
            { color: "#166534", fontSize: small ? 11 : 12 },
          ]}
        >
          Delivered {formatTime(deliveredAt)}
        </Text>
      </View>
    );
  }

  if (!expectedDeliveryAt) return null;

  const remaining = expectedDeliveryAt - now;
  const overdue = remaining < 0;

  const bg = overdue ? "#fee2e2" : remaining < 15 * 60_000 ? "#fef3c7" : "#dbeafe";
  const fg = overdue ? "#b91c1c" : remaining < 15 * 60_000 ? "#92400e" : "#1d4ed8";
  const icon = overdue ? "alert-triangle" : "clock";
  const label = overdue
    ? `${formatDuration(remaining)} late`
    : `${formatDuration(remaining)} baaki`;

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: bg,
          paddingHorizontal: small ? 8 : 10,
          paddingVertical: small ? 3 : 5,
        },
        style,
      ]}
    >
      <Feather name={icon as any} size={small ? 11 : 13} color={fg} />
      <Text style={[styles.text, { color: fg, fontSize: small ? 11 : 12 }]}>
        {label}
      </Text>
    </View>
  );
}

export function DeliveryDeadline({
  expectedDeliveryAt,
}: {
  expectedDeliveryAt: number | null;
}) {
  if (!expectedDeliveryAt) return null;
  const colors = useColors();
  return (
    <View style={styles.deadlineRow}>
      <Feather name="target" size={14} color={colors.mutedForeground} />
      <Text style={[styles.deadlineText, { color: colors.mutedForeground }]}>
        Deliver by {formatTime(expectedDeliveryAt)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 999,
    alignSelf: "flex-start",
  },
  text: {
    fontFamily: "Inter_600SemiBold",
  },
  deadlineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  deadlineText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
});
