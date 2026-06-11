import { storeActions, useStore } from "@/store/useStore";

export function useTheme() {
  const themeName = useStore((state) => state.theme);

  return {
    themeName,
    setTheme: storeActions.setTheme,
    toggleTheme: storeActions.toggleTheme,
  };
}
