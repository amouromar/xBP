import { TranslationSchema } from "./en";

export const es = {
  tabs: {
    home: "Inicio",
    history: "Historial",
    settings: "Ajustes",
  },
  language: {
    title: "Idioma",
    choose: "Elige tu idioma",
  },
  logSheet: {
    title: "Registrar lectura",
    editTitle: "Editar lectura",
    systolicPlaceholder: "Sistólica (120)",
    diastolicPlaceholder: "Diastólica (80)",
    pulsePlaceholder: "Pulso (72)",
    cancel: "Cancelar",
    save: "Guardar",
    update: "Actualizar",
    missingFieldTitle: "Campo faltante",
    missingSystolic: "Introduce tu lectura sistólica.",
    missingDiastolic: "Introduce tu lectura diastólica.",
    missingPulse: "Introduce tu lectura de pulso.",
    invalidSystolic: "La sistólica debe ser un número válido.",
    invalidDiastolic: "La diastólica debe ser un número válido.",
    invalidPulse: "El pulso debe ser un número válido.",
  },
  home: {
    subtitle: "Sigue tus lecturas durante la semana.",
    thisWeek: "Esta semana",
    readings: "Lecturas",
    reading: "Lectura",
    latest: "Más reciente",
    earliest: "Más antigua",
    noReadingsDay: "No hay lecturas para este día.",
    logNewReading: "Registrar lectura",
    noReadings: "Sin lecturas",
    avg: "prom",
    pts: "pts",
  },
  history: {
    subtitle: "Consulta lecturas por semana y día.",
    noReadings: "Sin lecturas",
    noReadingsDay: "No hay registros de presión para este día.",
  },
  settings: {
    subtitle: "Ajusta preferencias y vistas de exportación.",
    appearance: "Apariencia",
    currentTheme: "Tema actual",
    toggleTheme: "Cambiar tema",
  },
  calendar: {
  weekdaysShort: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"],
},
  common: {
    pulse: "Pulso",
    edit: "Editar",
    delete: "Eliminar",
    noReading: "Aún no hay lecturas.",
  },
} satisfies TranslationSchema;
