export const en = {
  tabs: {
    home: "Home",
    history: "History",
    settings: "Settings",
  },

  language: {
    title: "Language",
    choose: "Choose your language",
  },

  logSheet: {
    title: "Log New Reading",
    editTitle: "Edit Reading",
    systolicPlaceholder: "Systolic (120)",
    diastolicPlaceholder: "Diastolic (80)",
    pulsePlaceholder: "Pulse (72)",
    cancel: "Cancel",
    save: "Save",
    update: "Update",
    missingFieldTitle: "Missing field",
    missingSystolic: "Please enter your systolic reading.",
    missingDiastolic: "Please enter your diastolic reading.",
    missingPulse: "Please enter your pulse reading.",
    invalidSystolic: "Systolic must be a valid number.",
    invalidDiastolic: "Diastolic must be a valid number.",
    invalidPulse: "Pulse must be a valid number.",
  },

  home: {
    subtitle: "Track your readings across the week.",
    thisWeek: "This week",
    readings: "Readings",
    reading: "Reading",
    latest: "Latest",
    earliest: "Earliest",
    noReadingsDay: "No readings for this day.",
    logNewReading: "Log New Reading",
    noReadings: "No readings",
    avg: "avg",
    pts: "pts",
  },

  history: {
    subtitle: "Browse readings by week and day.",
    noReadings: "No readings",
    noReadingsDay: "No blood pressure logs for this day.",
  },

  settings: {
    subtitle: "Adjust app preferences and preview sharing layouts.",
    appearance: "Appearance",
    currentTheme: "Current theme",
    toggleTheme: "Toggle theme",
  },

  calendar: {
    weekdaysShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  },

  common: {
    pulse: "Pulse",
    edit: "Edit",
    delete: "Delete",
    noReading: "No reading available yet.",
  },
};

export type TranslationSchema = typeof en;