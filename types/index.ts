export type AppTheme = "light" | "dark";

export type BloodPressureReading = {
  id: string;
  systolic: number;
  diastolic: number;
  pulse?: number;
  createdAt: string;
  source?: string;
  notes?: string;
};

export type DietEntry = {
  id: string;
  meal: string;
  createdAt: string;
  notes?: string;
};

export type BpCategory =
  | "normal"
  | "elevated"
  | "hypertension-stage-1"
  | "hypertension-stage-2"
  | "hypertensive-crisis";
