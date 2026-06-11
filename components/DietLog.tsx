import { StyleSheet, View } from "react-native";
import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { DietEntry } from "@/types";
import { formatDateTime } from "@/utils/formatting";
import { theme } from "@/constants/theme";

type Props = {
  entries: DietEntry[];
  onAdd?: () => void;
};

export function DietLog({ entries, onAdd }: Props) {
  return (
    <Card>
      <View style={styles.header}>
        <Text variant="section">Diet log</Text>
        <Button title="Add meal" onPress={onAdd} variant="secondary" />
      </View>
      {entries.length === 0 ? (
        <Text variant="body" color="muted">
          No meals logged yet.
        </Text>
      ) : (
        entries.map((entry) => (
          <View key={entry.id} style={styles.entry}>
            <Text variant="body">{entry.meal}</Text>
            <Text variant="body" color="muted">
              {formatDateTime(entry.createdAt)}
            </Text>
          </View>
        ))
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 10,
  },
  entry: {
    gap: 4,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
});
