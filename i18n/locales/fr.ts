import { TranslationSchema } from "./en";

export const fr = {
  tabs: {
    home: "Accueil",
    history: "Historique",
    settings: "Réglages",
  },
  language: {
    title: "Langue",
    choose: "Choisissez votre langue",
  },
  logSheet: {
    title: "Nouvelle mesure",
    editTitle: "Modifier la mesure",
    systolicPlaceholder: "Systolique (120)",
    diastolicPlaceholder: "Diastolique (80)",
    pulsePlaceholder: "Pouls (72)",
    cancel: "Annuler",
    save: "Enregistrer",
    update: "Mettre à jour",
    missingFieldTitle: "Champ manquant",
    missingSystolic: "Veuillez saisir votre tension systolique.",
    missingDiastolic: "Veuillez saisir votre tension diastolique.",
    missingPulse: "Veuillez saisir votre pouls.",
    invalidSystolic: "La systolique doit être un nombre valide.",
    invalidDiastolic: "La diastolique doit être un nombre valide.",
    invalidPulse: "Le pouls doit être un nombre valide.",
  },
  home: {
    subtitle: "Suivez vos mesures tout au long de la semaine.",
    thisWeek: "Cette semaine",
    readings: "Mesures",
    reading: "Mesure",
    latest: "Plus récente",
    earliest: "Plus ancienne",
    noReadingsDay: "Aucune mesure pour ce jour.",
    logNewReading: "Nouvelle mesure",
    noReadings: "Aucune mesure",
    avg: "moy",
    pts: "pts",
  },
  history: {
    subtitle: "Parcourez les mesures par semaine et par jour.",
    noReadings: "Aucune mesure",
    noReadingsDay: "Aucun enregistrement de tension pour ce jour.",
  },
  settings: {
    subtitle: "Ajustez les préférences et les exports.",
    appearance: "Apparence",
    currentTheme: "Thème actuel",
    toggleTheme: "Changer le thème",
  },
  calendar: {
  weekdaysShort: ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"],
},
  common: {
    pulse: "Pouls",
    edit: "Modifier",
    delete: "Supprimer",
    noReading: "Aucune mesure disponible.",
  },
} satisfies TranslationSchema;
