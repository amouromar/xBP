import { de } from "./locales/de";
import { en, TranslationSchema } from "./locales/en";
import { es } from "./locales/es";
import { fr } from "./locales/fr";

export type AppLocale = "en" | "es" | "fr" | "de" | "sw";

export const DEFAULT_LOCALE: AppLocale = "en";

export const translations: Record<AppLocale, TranslationSchema> = {
  en : { ...en, ...require("./locales/en").en } as TranslationSchema,
  es : { ...en, ...require("./locales/es").es } as TranslationSchema,
  fr : { ...en, ...require("./locales/fr").fr } as TranslationSchema,
  de: { ...en, ...require("./locales/de").de } as TranslationSchema,
  sw: { ...en, ...require("./locales/sw").sw } as TranslationSchema,
};

export const LOCALE_OPTIONS: { code: AppLocale; label: string }[] = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "sw", label: "Swahili" },
];

export type TranslationKey =
  | "tabs.home"
  | "tabs.history"
  | "tabs.settings"
  | "language.title"
  | "language.choose"
  | "logSheet.title"
  | "logSheet.editTitle"
  | "logSheet.systolicPlaceholder"
  | "logSheet.diastolicPlaceholder"
  | "logSheet.pulsePlaceholder"
  | "logSheet.cancel"
  | "logSheet.save"
  | "logSheet.update"
  | "logSheet.missingFieldTitle"
  | "logSheet.missingSystolic"
  | "logSheet.missingDiastolic"
  | "logSheet.missingPulse"
  | "logSheet.invalidSystolic"
  | "logSheet.invalidDiastolic"
  | "logSheet.invalidPulse"
  | "home.subtitle"
  | "home.thisWeek"
  | "home.readings"
  | "home.reading"
  | "home.latest"
  | "home.earliest"
  | "home.noReadingsDay"
  | "home.logNewReading"
  | "home.noReadings"
  | "home.avg"
  | "home.pts"
  | "history.subtitle"
  | "history.noReadings"
  | "history.noReadingsDay"
  | "settings.subtitle"
  | "settings.appearance"
  | "settings.currentTheme"
  | "settings.toggleTheme"
  | "settings.language"
  | "settings.healthGuidelines"
  | "common.cancel"
  | "common.save"
  | "common.pulse"
  | "common.edit"
  | "common.delete"
  | "common.noReading";

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const value = path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in acc) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);

  return typeof value === "string" ? value : path;
}

export function translate(locale: AppLocale, key: TranslationKey): string {
  return getNestedValue(
    translations[locale] as unknown as Record<string, unknown>,
    key,
  );
}
