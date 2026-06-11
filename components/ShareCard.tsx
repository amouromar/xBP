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
};

export const ShareCard = forwardRef<View, Props>(function ShareCard(
  { systolic, diastolic, pulse },
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
          {/* BP */}
          <Text style={styles.bp}>{bp}</Text>

          {/* Pulse */}
          <Text style={styles.pulse}>{pulse ?? "--"} bpm</Text>

          {/* Footer row */}
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
    height: 256,
    paddingVertical: 28,
    paddingHorizontal: 22,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    gap: 18,
    overflow: "hidden",
  },

  bp: {
    fontSize: 52,
    fontWeight: "600",
    letterSpacing: 2,
    lineHeight: 60,
    paddingVertical: 4,
    textAlignVertical: "center",
    includeFontPadding: false,
  },

  pulse: {
    fontSize: 18,
    fontWeight: "500",
    opacity: 0.75,
  },

  footer: {
    marginTop: 14,
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