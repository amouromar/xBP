import {
  BloodPressureReading,
  BpCategory,
  HealthGuidelines,
  ReadingStatus,
} from "@/types";

export const DEFAULT_GUIDELINES: HealthGuidelines = {
  bp: {
    normal: { systolicMax: 119, diastolicMax: 79 },
    elevated: { systolicMin: 120, systolicMax: 129, diastolicMax: 79 },
    stage1: {
      systolicMin: 130,
      systolicMax: 139,
      diastolicMin: 80,
      diastolicMax: 89,
    },
    stage2: {
      systolicMin: 140,
      systolicMax: 179,
      diastolicMin: 90,
      diastolicMax: 119,
    },
    crisis: { systolicMin: 180, diastolicMin: 120 },
  },
  pulse: { lowMax: 59, normalMin: 60, normalMax: 100 },
  target: { systolic: 130, diastolic: 80 },
};

const CATEGORY_LABELS: Record<BpCategory, string> = {
  normal: "Normal",
  elevated: "Elevated",
  "hypertension-stage-1": "High blood pressure - stage 1",
  "hypertension-stage-2": "High blood pressure - stage 2",
  "hypertensive-crisis": "Hypertensive crisis",
};

export function resetGuidelinesToDefault(): HealthGuidelines {
  return JSON.parse(JSON.stringify(DEFAULT_GUIDELINES));
}

export function getBpCategory(
  systolic: number,
  diastolic: number,
  guidelines: HealthGuidelines = DEFAULT_GUIDELINES,
): { key: BpCategory; label: string } {
  const { bp } = guidelines;

  if (systolic >= bp.crisis.systolicMin || diastolic >= bp.crisis.diastolicMin) {
    return {
      key: "hypertensive-crisis",
      label: CATEGORY_LABELS["hypertensive-crisis"],
    };
  }

  if (
    systolic >= bp.stage2.systolicMin ||
    diastolic >= bp.stage2.diastolicMin
  ) {
    return {
      key: "hypertension-stage-2",
      label: CATEGORY_LABELS["hypertension-stage-2"],
    };
  }

  if (
    systolic >= bp.stage1.systolicMin ||
    diastolic >= bp.stage1.diastolicMin
  ) {
    return {
      key: "hypertension-stage-1",
      label: CATEGORY_LABELS["hypertension-stage-1"],
    };
  }

  if (
    systolic >= bp.elevated.systolicMin &&
    systolic <= bp.elevated.systolicMax &&
    diastolic <= bp.elevated.diastolicMax
  ) {
    return { key: "elevated", label: CATEGORY_LABELS.elevated };
  }

  return { key: "normal", label: CATEGORY_LABELS.normal };
}

export function getPulseCategory(
  pulse: number,
  guidelines: HealthGuidelines = DEFAULT_GUIDELINES,
): string {
  const { pulse: p } = guidelines;

  if (pulse <= p.lowMax) return "Low";
  if (pulse >= p.normalMin && pulse <= p.normalMax) return "Normal";
  return "High";
}

export function calculatePoints(
  systolic: number,
  diastolic: number,
  target: HealthGuidelines["target"],
): number {
  if (systolic > target.systolic || diastolic > target.diastolic) {
    return 0;
  }

  const sysGap = target.systolic - systolic;
  const diaGap = target.diastolic - diastolic;
  return Math.min(sysGap, diaGap);
}

function buildTargetContext(
  systolic: number,
  diastolic: number,
  target: HealthGuidelines["target"],
): string | null {
  const sysDiff = systolic - target.systolic;
  const diaDiff = diastolic - target.diastolic;
  const maxDiff = Math.max(sysDiff, diaDiff);

  if (maxDiff > 0) {
    return `${maxDiff} mmHg above your target of ${target.systolic}/${target.diastolic}`;
  }

  if (sysDiff < 0 || diaDiff < 0) {
    const underBy = Math.min(
      sysDiff < 0 ? target.systolic - systolic : Infinity,
      diaDiff < 0 ? target.diastolic - diastolic : Infinity,
    );
    if (underBy !== Infinity) {
      return `${underBy} mmHg under your target of ${target.systolic}/${target.diastolic}`;
    }
  }

  return null;
}

function buildRecommendation(
  category: BpCategory,
  systolic: number,
  diastolic: number,
  guidelines: HealthGuidelines,
): string {
  const targetContext = buildTargetContext(
    systolic,
    diastolic,
    guidelines.target,
  );
  const withinTarget =
    systolic <= guidelines.target.systolic &&
    diastolic <= guidelines.target.diastolic;

  switch (category) {
    case "normal":
      return "Keep up the great work! Your numbers are in the healthy range.";
    case "elevated":
      return targetContext
        ? `Elevated blood pressure. ${targetContext}. Monitor closely.`
        : "Elevated blood pressure. Monitor closely and maintain healthy habits.";
    case "hypertension-stage-1":
      if (withinTarget) {
        return "Stage 1 hypertension. Continue normal activity but monitor closely.";
      }
      return targetContext
        ? `Stage 1 hypertension. ${targetContext}. See your doctor if it continues.`
        : "Stage 1 hypertension. See your doctor if it continues.";
    case "hypertension-stage-2":
      return targetContext
        ? `Stage 2 hypertension. ${targetContext}. See your doctor within 2 weeks.`
        : "Stage 2 hypertension. See your doctor within 2 weeks.";
    case "hypertensive-crisis":
      return "This is a medical emergency! Go to the emergency room immediately.";
    default:
      return "Monitor your readings and consult your doctor if concerned.";
  }
}

export function getReadingStatus(
  systolic: number,
  diastolic: number,
  pulse?: number,
  guidelines: HealthGuidelines = DEFAULT_GUIDELINES,
): ReadingStatus {
  const { key, label } = getBpCategory(systolic, diastolic, guidelines);
  const recommendation = buildRecommendation(
    key,
    systolic,
    diastolic,
    guidelines,
  );
  const pointsEarned = calculatePoints(
    systolic,
    diastolic,
    guidelines.target,
  );

  const result: ReadingStatus = {
    category: key,
    statusLabel: label,
    recommendation,
    pointsEarned,
  };

  if (typeof pulse === "number") {
    result.pulseLabel = getPulseCategory(pulse, guidelines);
  }

  return result;
}

export function validateGuidelines(
  guidelines: HealthGuidelines,
): string | null {
  const { bp, pulse, target } = guidelines;

  if (bp.normal.systolicMax >= bp.elevated.systolicMin) {
    return "Normal systolic max must be less than elevated systolic min.";
  }
  if (bp.elevated.systolicMax >= bp.stage1.systolicMin) {
    return "Elevated systolic max must be less than stage 1 systolic min.";
  }
  if (bp.stage1.systolicMax >= bp.stage2.systolicMin) {
    return "Stage 1 systolic max must be less than stage 2 systolic min.";
  }
  if (bp.stage2.systolicMax >= bp.crisis.systolicMin) {
    return "Stage 2 systolic max must be less than crisis systolic min.";
  }
  if (bp.normal.diastolicMax >= bp.stage1.diastolicMin) {
    return "Normal diastolic max must be less than stage 1 diastolic min.";
  }
  if (bp.stage1.diastolicMax >= bp.stage2.diastolicMin) {
    return "Stage 1 diastolic max must be less than stage 2 diastolic min.";
  }
  if (bp.stage2.diastolicMax >= bp.crisis.diastolicMin) {
    return "Stage 2 diastolic max must be less than crisis diastolic min.";
  }
  if (pulse.lowMax >= pulse.normalMin) {
    return "Pulse low max must be less than normal min.";
  }
  if (pulse.normalMin > pulse.normalMax) {
    return "Pulse normal min must not exceed normal max.";
  }
  if (target.systolic <= 0 || target.diastolic <= 0) {
    return "Target values must be positive.";
  }

  return null;
}

export function getAverageReading(readings: BloodPressureReading[]) {
  if (readings.length === 0) {
    return null;
  }

  const totals = readings.reduce(
    (acc, reading) => ({
      systolic: acc.systolic + reading.systolic,
      diastolic: acc.diastolic + reading.diastolic,
      pulse: acc.pulse + (reading.pulse ?? 0),
      pulseCount: acc.pulseCount + (typeof reading.pulse === "number" ? 1 : 0),
    }),
    { systolic: 0, diastolic: 0, pulse: 0, pulseCount: 0 },
  );

  return {
    id: "average",
    systolic: Math.round(totals.systolic / readings.length),
    diastolic: Math.round(totals.diastolic / readings.length),
    pulse:
      totals.pulseCount > 0
        ? Math.round(totals.pulse / totals.pulseCount)
        : undefined,
    createdAt: new Date().toISOString(),
  } satisfies BloodPressureReading;
}
