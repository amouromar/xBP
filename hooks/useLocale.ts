import { storeActions, useStore } from "@/store/useStore";
import {
  AppLocale,
  DEFAULT_LOCALE,
  LOCALE_OPTIONS,
  translate,
  TranslationKey,
} from "@/i18n";

export function useLocale() {
  const locale = useStore((state) => state.locale ?? DEFAULT_LOCALE);

  return {
    locale,
    localeOptions: LOCALE_OPTIONS,
    setLocale: storeActions.setLocale,
    t: (key: TranslationKey) => translate(locale, key),
  };
}
