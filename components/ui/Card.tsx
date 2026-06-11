import { View, StyleSheet, ViewProps } from "react-native";

import { useAppTheme } from "@/providers/ThemeProvider";

export function Card({ style, ...props }: ViewProps) {
  const { colors } = useAppTheme();

  return (
    <View
      {...props}
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    padding: 16,
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
});
