import { AppTheme, BloodPressureReading, DietEntry } from "@/types";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from "react";
import { Appearance } from "react-native";

type StoreState = {
  bpLogs: BloodPressureReading[];
  dietEntries: DietEntry[];
  theme: AppTheme;
};

const initialState: StoreState = {
  bpLogs: [],
  dietEntries: [],
  theme: Appearance.getColorScheme() === "dark" ? "dark" : "light",
};

let state = initialState;
const listeners = new Set<() => void>();
let initialized = false;
const initPromise = (async () => {
  try {
    const stored = await AsyncStorage.getItem('xbp-app-state');
    if (stored) {
      state = JSON.parse(stored);
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
    setState((current) => ({
      ...current,
      bpLogs: [
        {
          id: entry.id ?? makeId(),
          createdAt: entry.createdAt ?? new Date().toISOString(),
          systolic: entry.systolic,
          diastolic: entry.diastolic,
          pulse: entry.pulse,
          source: entry.source,
          notes: entry.notes,
        },
        ...current.bpLogs,
      ],
    }));
  },

  // DELETE
  removeBpLog(id: string) {
    setState((current) => ({
      ...current,
      bpLogs: current.bpLogs.filter((b) => b.id !== id),
    }));
  },

  // UPDATE (NEW)
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