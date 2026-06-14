import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const TAB_BAR_CONTENT_HEIGHT = 56;

export function useTabBarInset() {
  const insets = useSafeAreaInsets();

  const bottomInset =
    insets.bottom > 0
      ? insets.bottom
      : Platform.select({ android: 16, ios: 0, default: 0 }) ?? 0;

  return {
    bottomInset,
    tabBarHeight: TAB_BAR_CONTENT_HEIGHT + bottomInset,
    floatingBottomOffset: TAB_BAR_CONTENT_HEIGHT + bottomInset + 12,
  };
}
