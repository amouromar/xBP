import { LinearGradient } from "expo-linear-gradient";
import React, { forwardRef } from "react";
import {
    Pressable,
    StyleSheet,
    View,
} from "react-native";

import { Text } from "@/components/ui/Text";
import { useAppTheme } from "@/providers/ThemeProvider";
import { formatBp } from "@/utils/formatting";

type Props = {
  systolic: number;
  diastolic: number;
  pulse?: number;
  statusLabel?: string;
  recommendation?: string;
};

export const ShareCard = forwardRef<View, Props>(function ShareCard(
  { systolic, diastolic, pulse, statusLabel, recommendation },
  ref
) {
  const { colors } = useAppTheme();

  const bp = formatBp(systolic, diastolic);

  const date = new Date().toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });

  return (
    <Pressable delayLongPress={200}>
      <View style={styles.wrapper}>
        <LinearGradient
          colors={[
            "rgba(0,0,0,0.08)",
            "transparent",
            "rgba(0,0,0,0.08)",
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.border}
        />

        <View
          ref={ref}
          collapsable={false}
          style={[
            styles.card,
            { backgroundColor: colors.primarySoft },
          ]}
        >
          <Text style={styles.bp}>{bp}</Text>

          {statusLabel ? (
            <Text style={[styles.status, { color: colors.primary }]} numberOfLines={1}>
              {statusLabel}
            </Text>
          ) : null}

          {recommendation ? (
            <Text style={styles.recommendation} numberOfLines={2}>
              {recommendation}
            </Text>
          ) : null}

          <Text style={styles.pulse}>{pulse ?? "--"} bpm</Text>

          <View style={styles.footer}>
            <Text style={styles.date}>{date}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    padding: 2,
  },

  border: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.6,
  },

  card: {
    width: 256,
    minHeight: 256,
    paddingVertical: 24,
    paddingHorizontal: 18,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    overflow: "hidden",
  },

  bp: {
    fontSize: 48,
    fontWeight: "600",
    letterSpacing: 2,
    lineHeight: 54,
    paddingVertical: 2,
    textAlignVertical: "center",
    includeFontPadding: false,
  },

  status: {
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },

  recommendation: {
    fontSize: 11,
    fontWeight: "500",
    opacity: 0.75,
    textAlign: "center",
    lineHeight: 15,
    paddingHorizontal: 4,
  },

  pulse: {
    fontSize: 16,
    fontWeight: "500",
    opacity: 0.75,
  },

  footer: {
    marginTop: 8,
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  date: {
    fontSize: 11,
    opacity: 0.5,
  },
});
