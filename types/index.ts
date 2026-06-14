export type AppTheme = "light" | "dark";

export type AppLocale = "en" | "es" | "fr" | "de";

export type BloodPressureReading = {
  id: string;
  systolic: number;
  diastolic: number;
  pulse?: number;
  createdAt: string;
  source?: string;
  notes?: string;
  statusLabel?: string;
  recommendation?: string;
  pointsEarned?: number;
};

export type HealthGuidelines = {
  bp: {
    normal: { systolicMax: number; diastolicMax: number };
    elevated: { systolicMin: number; systolicMax: number; diastolicMax: number };
    stage1: {
      systolicMin: number;
      systolicMax: number;
      diastolicMin: number;
      diastolicMax: number;
    };
    stage2: {
      systolicMin: number;
      systolicMax: number;
      diastolicMin: number;
      diastolicMax: number;
    };
    crisis: { systolicMin: number; diastolicMin: number };
  };
  pulse: { lowMax: number; normalMin: number; normalMax: number };
  target: { systolic: number; diastolic: number };
};

export type ReadingStatus = {
  category: BpCategory;
  statusLabel: string;
  recommendation: string;
  pulseLabel?: string;
  pointsEarned?: number;
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
