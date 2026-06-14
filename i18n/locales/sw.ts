import { TranslationSchema } from "./en";

export const sw = {
  tabs: {
    home: "Nyumbani",
    history: "Historia",
    settings: "Mipangilio",
  },
  language: {
    title: "Lugha",
    choose: "Chagua lugha yako",
  },
  logSheet: {
    title: "Weka Kipimo",
    editTitle: "Hariri Kipimo",
    systolicPlaceholder: "Systolic (120)",
    diastolicPlaceholder: "Diastolic (80)",
    pulsePlaceholder: "Mapigo ya Moyo (72)",
    cancel: "Ghairi",
    save: "Hifadhi",
    update: "Sasisha",
    missingFieldTitle: "Taarifa Haijakamilika",
    missingSystolic: "Tafadhali weka thamani ya systolic.",
    missingDiastolic: "Tafadhali weka thamani ya diastolic.",
    missingPulse: "Tafadhali weka mapigo ya moyo.",
    invalidSystolic: "Systolic lazima iwe namba halali.",
    invalidDiastolic: "Diastolic lazima iwe namba halali.",
    invalidPulse: "Mapigo ya moyo lazima yawe namba halali.",
  },
  home: {
    subtitle: "Fuatilia vipimo vyako kwa wiki nzima.",
    thisWeek: "Wiki Hii",
    readings: "Vipimo",
    reading: "Kipimo",
    latest: "Cha Hivi Karibuni",
    earliest: "Cha Mwanzo",
    noReadingsDay: "Hakuna vipimo kwa siku hii.",
    logNewReading: "Weka Kipimo Kipya",
    noReadings: "Hakuna Vipimo",
    avg: "Wastani",
    pts: "Vipimo",
  },
  history: {
    subtitle: "Vinjari vipimo kulingana na wiki na siku.",
    noReadings: "Hakuna Vipimo",
    noReadingsDay: "Hakuna vipimo vya shinikizo la damu kwa siku hii.",
  },
  settings: {
    subtitle: "Badilisha mipangilio na hakiki ya usafirishaji wa data.",
    appearance: "Mwonekano",
    currentTheme: "Mandhari ya Sasa",
    toggleTheme: "Badili Mandhari",
  },
  calendar: {
  weekdaysShort: ["Jum", "Man", "Walt", "Wuk", "Wug", "Mra", "Jum"],
},
  common: {
    pulse: "Mapigo ya Moyo",
    edit: "Hariri",
    delete: "Futa",
    noReading: "Bado hakuna kipimo kilichopo.",
  },
} satisfies TranslationSchema;