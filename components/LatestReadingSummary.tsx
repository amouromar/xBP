import { StyleSheet, View } from "react-native";

import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { useBPLogs } from "@/hooks/useBPLogs";
import { useAppTheme } from "@/providers/ThemeProvider";
import { getBpCategory } from "@/utils/bpCalculations";
import { formatBp } from "@/utils/formatting";

export function LatestReadingSummary() {
  const { latestReading, totalScore, logs } = useBPLogs();
  const { colors } = useAppTheme();

  if (logs.length === 0) {
    return null;
  }

  const category = getBpCategory(
    latestReading.systolic,
    latestReading.diastolic,
  );
  const statusLabel = latestReading.statusLabel ?? category.label;
  const isNormal = category.key === "normal";
  const statusColor = isNormal ? colors.success : colors.danger;

  return (
    <Card style={styles.card}>
      <Text variant="eyebrow">Your latest reading</Text>

      <Text variant="title" color="primary" style={styles.bp}>
        {formatBp(latestReading.systolic, latestReading.diastolic)}
      </Text>

      <Text variant="section" style={{ color: statusColor }}>
        {statusLabel}
      </Text>

      {latestReading.recommendation ? (
        <Text variant="body" color="muted" style={styles.recommendation}>
          {latestReading.recommendation}
        </Text>
      ) : null}

      {(latestReading.pointsEarned && latestReading.pointsEarned > 0) ||
      totalScore > 0 ? (
        <View style={styles.scoreRow}>
          {latestReading.pointsEarned && latestReading.pointsEarned > 0 ? (
            <View
              style={[styles.scoreBadge, { backgroundColor: colors.success + "22" }]}
            >
              <Text
                variant="body"
                style={{ color: colors.success, fontWeight: "600" }}
              >
                +{latestReading.pointsEarned} points
              </Text>
            </View>
          ) : null}

          {totalScore > 0 ? (
            <Text variant="body" color="muted">
              Total score: {totalScore}
            </Text>
          ) : null}
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    gap: 8,
  },
  bp: {
    marginTop: 4,
  },
  recommendation: {
    lineHeight: 22,
    marginTop: 2,
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 4,
    flexWrap: "wrap",
  },
  scoreBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
});
