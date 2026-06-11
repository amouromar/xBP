import { StyleSheet, View, Pressable } from "react-native";
import { Text } from "@/components/ui/Text";
import { BloodPressureReading } from "@/types";
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
  if (!reading) {
    return (
      <View style={styles.emptyWrap}>
        <Text variant="body" color="muted">
          No reading available yet.
        </Text>
      </View>
    );
  }

  const category = getBpCategory(
    reading.systolic,
    reading.diastolic
  );

  return (
    <Pressable
      onPress={() => onPress?.(reading)}
      style={[
        styles.container,
        compact && styles.compactCard,
      ]}
    >
      <View style={styles.row}>
        <View>
          <Text variant="title" color="primary">
            {formatBp(
              reading.systolic,
              reading.diastolic
            )}
          </Text>

          <Text variant="section" color="muted">
            {category.label}
          </Text>
        </View>

        <View style={styles.pulse}>
          <Text variant="eyebrow">Pulse</Text>
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

      {/* ACTION ROW */}
      {(onDelete || onEdit) && (
        <View style={styles.actions}>
          {onEdit && (
            <Text
              color="muted"
              onPress={() => onEdit(reading)}
            >
              Edit
            </Text>
          )}

          {onDelete && (
            <Text
              color="muted"
              onPress={() => onDelete(reading.id)}
            >
              Delete
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