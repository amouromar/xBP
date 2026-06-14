import { StyleSheet, View } from "react-native";

import { Text } from "@/components/ui/Text";
import { useLocale } from "@/hooks/useLocale";
import { useAppTheme } from "@/providers/ThemeProvider";
import { formatBp } from "@/utils/formatting";

type Props = {
  label: string;
  averageSystolic?: number;
  averageDiastolic?: number;
  points: number;
  readingCount: number;
};

export function PeriodSummaryBar({
  label,
  averageSystolic,
  averageDiastolic,
  points,
  readingCount,
}: Props) {
  const { colors } = useAppTheme();
  const { t } = useLocale();

  const hasAverage =
    typeof averageSystolic === "number" &&
    typeof averageDiastolic === "number";

  return (
    <View
      style={[
        styles.bar,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <Text variant="eyebrow" style={styles.label}>
        {label}
      </Text>

      <View style={styles.stats}>
        {hasAverage ? (
          <View style={styles.avgRow}>
            <Text variant="body" style={styles.avg}>
              {formatBp(averageSystolic, averageDiastolic)}
            </Text>
            <Text variant="body" color="muted">
              {t("home.avg")}
            </Text>
          </View>
        ) : (
          <Text variant="body" color="muted" style={styles.noReadings}>
            {t("home.noReadings")}
          </Text>
        )}

        {readingCount > 0 ? (
          <Text
            variant="body"
            style={[styles.points, { color: points > 0 ? colors.success : colors.textSecondary }]}
          >
            {points > 0 ? `+${points} ${t("home.pts")}` : `0 ${t("home.pts")}`}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  label: {
    flexShrink: 0,
  },
  stats: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 14,
  },
  avgRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  avg: {
    fontWeight: "600",
    fontSize: 15,
  },
  points: {
    fontWeight: "600",
    fontSize: 15,
  },
  noReadings: {
    fontWeight: "600",
    fontSize: 15,
  },
});
