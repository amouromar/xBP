import { View, StyleSheet, Image } from "react-native";
import { ReactNode } from "react";

import { Text } from "./Text";
import { useAppTheme } from "@/providers/ThemeProvider";

type HeaderProps = {
  rightContent?: ReactNode;
};

export function Header({ rightContent }: HeaderProps) {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.header, { backgroundColor: colors.background }]}>
      <View style={styles.left}>
        <Image
          source={require("@/assets/images/res/mipmap-xhdpi/ic_launcher_monochrome.png")}
          style={styles.logo}
          resizeMode="cover"
        />
        <Text variant="title" style={{ marginLeft: 8 }}>
          xBP
        </Text>
      </View>

      {rightContent && <View style={styles.right}>{rightContent}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 42,
    height: 100,
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
});