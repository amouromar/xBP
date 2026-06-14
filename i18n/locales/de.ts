import { TranslationSchema } from "./en";

export const de = {
  tabs: {
    home: "Start",
    history: "Verlauf",
    settings: "Einstellungen",
  },
  language: {
    title: "Sprache",
    choose: "Wählen Sie Ihre Sprache",
  },
  logSheet: {
    title: "Messung erfassen",
    editTitle: "Messung bearbeiten",
    systolicPlaceholder: "Systolisch (120)",
    diastolicPlaceholder: "Diastolisch (80)",
    pulsePlaceholder: "Puls (72)",
    cancel: "Abbrechen",
    save: "Speichern",
    update: "Aktualisieren",
    missingFieldTitle: "Fehlendes Feld",
    missingSystolic: "Bitte geben Sie den systolischen Wert ein.",
    missingDiastolic: "Bitte geben Sie den diastolischen Wert ein.",
    missingPulse: "Bitte geben Sie den Puls ein.",
    invalidSystolic: "Systolisch muss eine gültige Zahl sein.",
    invalidDiastolic: "Diastolisch muss eine gültige Zahl sein.",
    invalidPulse: "Puls muss eine gültige Zahl sein.",
  },
  home: {
    subtitle: "Verfolgen Sie Ihre Messungen über die Woche.",
    thisWeek: "Diese Woche",
    readings: "Messungen",
    reading: "Messung",
    latest: "Neueste",
    earliest: "Älteste",
    noReadingsDay: "Keine Messungen für diesen Tag.",
    logNewReading: "Messung erfassen",
    noReadings: "Keine Messungen",
    avg: "Ø",
    pts: "Pkt",
  },
  history: {
    subtitle: "Messungen nach Woche und Tag durchsuchen.",
    noReadings: "Keine Messungen",
    noReadingsDay: "Keine Blutdruckmessungen für diesen Tag.",
  },
  settings: {
    subtitle: "Einstellungen und Exportvorschau anpassen.",
    appearance: "Darstellung",
    currentTheme: "Aktuelles Thema",
    toggleTheme: "Thema wechseln",
  },
  calendar: {
  weekdaysShort: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
},
  common: {
    pulse: "Puls",
    edit: "Bearbeiten",
    delete: "Löschen",
    noReading: "Noch keine Messung verfügbar.",
  },
} satisfies TranslationSchema;
