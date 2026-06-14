import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

import { HealthGuidelinesForm } from "@/components/HealthGuidelinesForm";
import { SharePreview } from "@/components/SharePreview";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Header } from "@/components/ui/Header";
import { Text } from "@/components/ui/Text";
import { useLocale } from "@/hooks/useLocale";
import { useTheme } from "@/hooks/useTheme";
import { useAppTheme } from "@/providers/ThemeProvider";
import { Moon, Sun } from "lucide-react-native";

export default function SettingsScreen() {
  const { colors } = useAppTheme();
  const { themeName, toggleTheme } = useTheme();
  const { t } = useLocale();
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
          {t("settings.subtitle")}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Card style={{ borderRadius: 18 }}>
          <Text variant="section">{t("settings.appearance")}</Text>
          <Text variant="body" color="muted">
            {t("settings.currentTheme")}: {themeName}
          </Text>
          <Button title={t("settings.toggleTheme")} onPress={toggleTheme} />
        </Card>

        <HealthGuidelinesForm />

        <SharePreview />
      </ScrollView>
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
  scrollContent: {
    padding: 20,
    gap: 20,
    paddingBottom: 40,
  },
});
