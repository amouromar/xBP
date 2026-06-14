import { useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Check, Languages } from "lucide-react-native";
import { ReactNode } from "react";

import { Text } from "./Text";
import { useAppTheme } from "@/providers/ThemeProvider";
import { useLocale } from "@/hooks/useLocale";
import { AppLocale } from "@/i18n";

type HeaderProps = {
  rightContent?: ReactNode;
};

export function Header({ rightContent }: HeaderProps) {
  const { colors } = useAppTheme();
  const { locale, localeOptions, setLocale, t } = useLocale();
  const [showLanguages, setShowLanguages] = useState(false);

  const handleSelectLocale = (code: AppLocale) => {
    setLocale(code);
    setShowLanguages(false);
  };

  return (
    <>
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

        <View style={styles.right}>
          <TouchableOpacity
            hitSlop={12}
            onPress={() => setShowLanguages(true)}
            accessibilityRole="button"
            accessibilityLabel={t("language.title")}
          >
            <Languages size={24} color={colors.primary} />
          </TouchableOpacity>
          {rightContent}
        </View>
      </View>

      <Modal
        visible={showLanguages}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLanguages(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowLanguages(false)}
        >
          <Pressable
            style={[styles.menu, { backgroundColor: colors.surface }]}
            onPress={(e) => e.stopPropagation()}
          >
            <Text variant="section" style={styles.menuTitle}>
              {t("language.choose")}
            </Text>

            {localeOptions.map((option) => {
              const active = locale === option.code;
              return (
                <Pressable
                  key={option.code}
                  onPress={() => handleSelectLocale(option.code)}
                  style={[
                    styles.menuItem,
                    active && { backgroundColor: colors.primary + "14" },
                  ]}
                >
                  <Text
                    variant="body"
                    color={active ? "primary" : "default"}
                    style={active ? styles.menuItemActive : undefined}
                  >
                    {option.label}
                  </Text>
                  {active ? <Check size={18} color={colors.primary} /> : null}
                </Pressable>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  menu: {
    borderRadius: 18,
    padding: 20,
    gap: 4,
  },
  menuTitle: {
    marginBottom: 12,
    textAlign: "center",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  menuItemActive: {
    fontWeight: "600",
  },
});
