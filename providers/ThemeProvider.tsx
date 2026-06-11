import {
  createContext,
  PropsWithChildren,
  useContext,
  useMemo,
} from "react";

import { useStore } from "@/store/useStore";
import { darkColors, lightColors } from "@/theme/colors";
import { AppTheme } from "@/types";

type Theme = {
  themeName: AppTheme;
  isDark: boolean;
  colors: typeof lightColors;
};

const ThemeContext = createContext<Theme | null>(null);

export function ThemeProvider({
  children,
}: PropsWithChildren) {
  const themeName = useStore((state) => state.theme);

  const value = useMemo(
    () => ({
      themeName,
      isDark: themeName === "dark",
      colors: themeName === "dark" ? darkColors : lightColors,
    }),
    [themeName]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useAppTheme must be used inside ThemeProvider"
    );
  }

  return context;
}
