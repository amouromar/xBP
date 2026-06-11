import { Tabs } from "expo-router";
import {
    BookText,
    Settings,
    TvMinimal,
    type LucideIcon,
} from "lucide-react-native";

import { Text } from "@/components/ui/Text";
import { useAppTheme } from "@/providers/ThemeProvider";

export default function TabLayout() {
  const { colors } = useAppTheme();

  const createTabIcon =
    (Icon: LucideIcon) =>
    ({ color, size }: { color: string; size: number }) =>
      <Icon color={color} size={size} />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,

        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },

        tabBarLabel: ({ children, focused }) => (
          <Text
            variant="body"
            color={focused ? "primary" : "muted"}
          >
            {children}
          </Text>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: createTabIcon(TvMinimal),
        }}
      />

      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          tabBarIcon: createTabIcon(BookText),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: createTabIcon(Settings),
        }}
      />
    </Tabs>
  );
}