import { StyleSheet, TouchableOpacity, View } from "react-native";

import { SharePreview } from "@/components/SharePreview";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Header } from "@/components/ui/Header";
import { Text } from "@/components/ui/Text";
import { useTheme } from "@/hooks/useTheme";
import { useAppTheme } from "@/providers/ThemeProvider";
import { Moon, Sun } from "lucide-react-native";

export default function SettingsScreen() {
  const { colors } = useAppTheme();
  const { themeName } = useTheme();
  const { toggleTheme } = useTheme();
  const isDark = themeName === "dark";

  return (
    <View style={[styles.content, { backgroundColor: colors.background }]}>
      <Header
        rightContent={
          <>
            <TouchableOpacity hitSlop={12} onPress={toggleTheme}>
              {isDark ? (
                <Sun size={24} color={colors.primary} />
              ) : (
                <Moon size={24} color={colors.primary} />
              )}
            </TouchableOpacity>
          </>
        }
      />

      <View style={styles.header}>
        <Text variant="body" color="muted">
          Adjust app preferences and preview sharing layouts.
        </Text>
      </View>

      <View style={{ padding: 20, gap: 20 }}>
        <Card style={{ borderRadius: 18 }}>
          <Text variant="section">Appearance</Text>
          <Text variant="body" color="muted">
            Current theme: {themeName}
          </Text>
          <Button title="Toggle theme" onPress={toggleTheme} />
        </Card>

        <SharePreview />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
  },
});
