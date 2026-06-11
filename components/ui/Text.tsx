import { StyleSheet, Text as RNText, TextProps } from "react-native";

import { useAppTheme } from "@/providers/ThemeProvider";

type Variant = "body" | "title" | "section" | "eyebrow";

type Props = TextProps & {
  variant?: Variant;
  color?: "default" | "muted" | "primary";
};

export function Text({ variant = "body", color = "default", style, ...props }: Props) {
  const { colors } = useAppTheme();
  const resolvedColor = color === "default" && variant === "eyebrow" ? "primary" : color;

  return (
    <RNText
      {...props}
      style={[
        styles.base,
        styles[variant],
        colorStyles(colors)[resolvedColor],
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    fontFamily: "BricolageGrotesque",
  },
  body: {
    fontSize: 16,
    lineHeight: 22,
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "600",
  },
  section: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "600",
  },
  eyebrow: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    fontWeight: "700",
  },
});

function colorStyles(colors: {
  text: string;
  textSecondary: string;
  primary: string;
}) {
  return StyleSheet.create({
    default: {
      color: colors.text,
    },
    muted: {
      color: colors.textSecondary,
    },
    primary: {
      color: colors.primary,
    },
  });
}
