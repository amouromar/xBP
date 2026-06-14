import { AppLocale, AppTheme, BloodPressureReading, DietEntry, HealthGuidelines } from "@/types";
import { DEFAULT_LOCALE } from "@/i18n";
import {
  DEFAULT_GUIDELINES,
  getReadingStatus,
  resetGuidelinesToDefault,
  validateGuidelines,
} from "@/utils/bpCalculations";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from "react";
import { Appearance } from "react-native";

type StoreState = {
  bpLogs: BloodPressureReading[];
  dietEntries: DietEntry[];
  theme: AppTheme;
  locale: AppLocale;
  healthGuidelines: HealthGuidelines;
  totalScore: number;
};

const initialState: StoreState = {
  bpLogs: [],
  dietEntries: [],
  theme: Appearance.getColorScheme() === "dark" ? "dark" : "light",
  locale: DEFAULT_LOCALE,
  healthGuidelines: resetGuidelinesToDefault(),
  totalScore: 0,
};

let state = initialState;
const listeners = new Set<() => void>();
let initialized = false;
const initPromise = (async () => {
  try {
    const stored = await AsyncStorage.getItem('xbp-app-state');
    if (stored) {
      const parsed = JSON.parse(stored);
      state = {
        ...initialState,
        ...parsed,
        healthGuidelines: {
          ...DEFAULT_GUIDELINES,
          ...parsed.healthGuidelines,
          bp: { ...DEFAULT_GUIDELINES.bp, ...parsed.healthGuidelines?.bp },
          pulse: { ...DEFAULT_GUIDELINES.pulse, ...parsed.healthGuidelines?.pulse },
          target: { ...DEFAULT_GUIDELINES.target, ...parsed.healthGuidelines?.target },
        },
        totalScore: parsed.totalScore ?? 0,
        locale: parsed.locale ?? DEFAULT_LOCALE,
      };
    }
  } catch (err) {
    console.error('[xBP Store] Failed to load persisted state:', err);
  } finally {
    initialized = true;
    emitChange();
  }
})();

function makeId() {
  return `bp_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function emitChange() {
  listeners.forEach((l) => l());
}

function setState(updater: StoreState | ((s: StoreState) => StoreState)) {
  state = typeof updater === "function" ? updater(state) : updater;
  emitChange();
  
  // Persist to AsyncStorage (fire and forget)
  AsyncStorage.setItem('xbp-app-state', JSON.stringify(state)).catch(err => {
    console.error('[xBP Store] Failed to persist state:', err);
  });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function snapshot() {
  return state;
}

export const storeActions = {
  // CREATE
  addBpLog(
    entry: Omit<BloodPressureReading, "id" | "createdAt"> &
      Partial<Pick<BloodPressureReading, "id" | "createdAt">>
  ) {
    setState((current) => {
      const status = getReadingStatus(
        entry.systolic,
        entry.diastolic,
        entry.pulse,
        current.healthGuidelines,
      );

      const newLog: BloodPressureReading = {
        id: entry.id ?? makeId(),
        createdAt: entry.createdAt ?? new Date().toISOString(),
        systolic: entry.systolic,
        diastolic: entry.diastolic,
        pulse: entry.pulse,
        source: entry.source,
        notes: entry.notes,
        statusLabel: status.statusLabel,
        recommendation: status.recommendation,
        pointsEarned: status.pointsEarned,
      };

      return {
        ...current,
        bpLogs: [newLog, ...current.bpLogs],
        totalScore: current.totalScore + (status.pointsEarned ?? 0),
      };
    });
  },

  // DELETE
  removeBpLog(id: string) {
    setState((current) => {
      const removed = current.bpLogs.find((b) => b.id === id);
      const pointsToRemove = removed?.pointsEarned ?? 0;

      return {
        ...current,
        bpLogs: current.bpLogs.filter((b) => b.id !== id),
        totalScore: Math.max(0, current.totalScore - pointsToRemove),
      };
    });
  },

  // UPDATE (preserves snapshot fields unless explicitly patched)
  updateBpLog(id: string, patch: Partial<BloodPressureReading>) {
    setState((current) => ({
      ...current,
      bpLogs: current.bpLogs.map((log) =>
        log.id === id ? { ...log, ...patch } : log
      ),
    }));
  },

  // OPTIONAL: diet still here for future
  addDietEntry(
    entry: Omit<DietEntry, "id" | "createdAt"> &
      Partial<Pick<DietEntry, "id" | "createdAt">>
  ) {
    setState((current) => ({
      ...current,
      dietEntries: [
        {
          id: entry.id ?? makeId(),
          createdAt: entry.createdAt ?? new Date().toISOString(),
          meal: entry.meal,
          notes: entry.notes,
        },
        ...current.dietEntries,
      ],
    }));
  },

  setHealthGuidelines(guidelines: HealthGuidelines): string | null {
    const error = validateGuidelines(guidelines);
    if (error) return error;

    setState((s) => ({ ...s, healthGuidelines: guidelines }));
    return null;
  },

  resetHealthGuidelines() {
    setState((s) => ({
      ...s,
      healthGuidelines: resetGuidelinesToDefault(),
    }));
  },

  setLocale(locale: AppLocale) {
    setState((s) => ({ ...s, locale }));
  },

  setTheme(theme: AppTheme) {
    setState((s) => ({ ...s, theme }));
  },

  toggleTheme() {
    setState((s) => ({
      ...s,
      theme: s.theme === "light" ? "dark" : "light",
    }));
  },

  reset() {
    setState(initialState);
  },
};

export function useStore<T>(selector: (s: StoreState) => T) {
  return useSyncExternalStore(
    subscribe,
    () => selector(snapshot()),
    () => selector(snapshot())
  );
}

export function getStoreState() {
  return snapshot();
}
