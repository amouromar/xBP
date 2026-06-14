import { Tabs } from "expo-router";
import {
  BookText,
  Settings,
  TvMinimal,
  type LucideIcon,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Text } from "@/components/ui/Text";
import { useLocale } from "@/hooks/useLocale";
import { useAppTheme } from "@/providers/ThemeProvider";

function createTabIcon(Icon: LucideIcon) {
  function TabIcon({
    color,
    size,
  }: {
    color: string;
    size: number;
  }) {
    return <Icon color={color} size={size} />;
  }

  TabIcon.displayName = `${Icon.displayName ?? Icon.name}TabIcon`;

  return TabIcon;
}

export default function TabLayout() {
  const { colors } = useAppTheme();
  const { t } = useLocale();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarHideOnKeyboard: true,

        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,

        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,

          height: Math.max(64, 64 + insets.bottom),

          paddingBottom: Math.min(insets.bottom, 12),
          paddingTop: 6,
        },

        tabBarLabel: ({ children, focused }) => (
          <Text
            variant="body"
            color={focused ? "primary" : "muted"}
            numberOfLines={1}
            allowFontScaling={false}
          >
            {children}
          </Text>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("tabs.home"),
          tabBarIcon: createTabIcon(TvMinimal),
        }}
      />

      <Tabs.Screen
        name="history"
        options={{
          title: t("tabs.history"),
          tabBarIcon: createTabIcon(BookText),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: t("tabs.settings"),
          tabBarIcon: createTabIcon(Settings),
        }}
      />
    </Tabs>
  );
}