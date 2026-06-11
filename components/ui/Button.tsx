import { ActivityIndicator, Pressable, StyleSheet, ViewStyle } from "react-native";

import { Text } from "@/components/ui/Text";
import { useAppTheme } from "@/providers/ThemeProvider";

type Props = {
  title?: string;
  children?: string;
  onPress?: () => void;
  variant?: "primary" | "secondary" | "destructive" | "textSecondary";
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
};

export function Button({
  title,
  children,
  onPress,
  variant = "primary",
  loading,
  disabled = false,
  style,
}: Props) {
  const { colors } = useAppTheme();
  const displayText = title || children;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor:
            variant === "secondary" || variant === "textSecondary" ? colors.surface :
            variant === "destructive" ? "#ef4444" : colors.primary,
          borderColor: colors.border,
          opacity: disabled ? 0.5 : 1,
        },
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "secondary" || variant === "textSecondary" ? colors.text : "#fff"}
        />
      ) : (
        <Text
          variant="body"
          color={variant === "secondary" || variant === "textSecondary" ? "default" : "default"}
          style={[
            styles.label,
            { color: variant === "secondary" || variant === "textSecondary" ? colors.text : "#fff" },
          ]}
        >
          {displayText}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    borderWidth: 1,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  label: {
    fontWeight: "600",
  },
});
