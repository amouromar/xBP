import { StyleSheet, View, Pressable } from "react-native";
import { Text } from "@/components/ui/Text";
import { BloodPressureReading } from "@/types";
import { useLocale } from "@/hooks/useLocale";
import { useAppTheme } from "@/providers/ThemeProvider";
import { getBpCategory } from "@/utils/bpCalculations";
import { formatBp } from "@/utils/formatting";

type Props = {
  reading: BloodPressureReading | null;
  compact?: boolean;

  onDelete?: (id: string) => void;
  onEdit?: (reading: BloodPressureReading) => void;
  onPress?: (reading: BloodPressureReading) => void;
};

export function BPDisplay({
  reading,
  compact = false,
  onDelete,
  onEdit,
  onPress,
}: Props) {
  const { colors } = useAppTheme();
  const { t } = useLocale();

  if (!reading) {
    return (
      <View style={styles.emptyWrap}>
        <Text variant="body" color="muted">
          {t("common.noReading")}
        </Text>
      </View>
    );
  }

  const category = getBpCategory(reading.systolic, reading.diastolic);
  const statusLabel = reading.statusLabel ?? category.label;
  const isNormal = category.key === "normal";
  const statusColor = isNormal ? colors.success : colors.danger;

  return (
    <Pressable
      onPress={() => onPress?.(reading)}
      style={[
        styles.container,
        compact && styles.compactCard,
      ]}
    >
      <View style={styles.row}>
        <View style={styles.mainContent}>
          <Text variant="title" color="primary">
            {formatBp(reading.systolic, reading.diastolic)}
          </Text>

          <Text variant="section" style={{ color: statusColor }}>
            {statusLabel}
          </Text>

          {reading.recommendation ? (
            <Text variant="body" color="muted" style={styles.recommendation}>
              {reading.recommendation}
            </Text>
          ) : null}

          {!compact && reading.pointsEarned && reading.pointsEarned > 0 ? (
            <View style={[styles.pointsBadge, { backgroundColor: colors.success + "22" }]}>
              <Text variant="body" style={{ color: colors.success, fontWeight: "600" }}>
                +{reading.pointsEarned} pts
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.pulse}>
          <Text variant="eyebrow">{t("common.pulse")}</Text>
          <Text variant="section">
            {reading.pulse ?? "--"} bpm
          </Text>
        </View>
      </View>

      {!compact ? (
        <Text variant="body" color="muted">
          {new Date(reading.createdAt).toLocaleDateString(
            "en-GB",
            {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            }
          )}
        </Text>
      ) : null}

      {(onDelete || onEdit) && (
        <View style={styles.actions}>
          {onEdit && (
            <Text
              color="muted"
              onPress={() => onEdit(reading)}
            >
              {t("common.edit")}
            </Text>
          )}

          {onDelete && (
            <Text
              color="muted"
              onPress={() => onDelete(reading.id)}
            >
              {t("common.delete")}
            </Text>
          )}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },

  emptyWrap: {
    minHeight: 96,
    alignItems: "center",
    justifyContent: "center",
  },

  compactCard: {
    paddingVertical: 12,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },

  mainContent: {
    flex: 1,
    gap: 4,
  },

  recommendation: {
    marginTop: 2,
    lineHeight: 22,
  },

  pointsBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 4,
  },

  pulse: {
    alignItems: "flex-end",
    gap: 2,
  },

  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 16,
    marginTop: 8,
  },
});
