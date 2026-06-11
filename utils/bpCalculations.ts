import { BloodPressureReading, BpCategory } from "@/types";

export function getBpCategory(
  systolic: number,
  diastolic: number,
): { key: BpCategory; label: string } {
  if (systolic >= 180 || diastolic >= 120) {
    return { key: "hypertensive-crisis", label: "Hypertensive crisis" };
  }

  if (systolic >= 140 || diastolic >= 90) {
    return { key: "hypertension-stage-2", label: "High blood pressure - stage 2" };
  }

  if (systolic >= 130 || diastolic >= 80) {
    return { key: "hypertension-stage-1", label: "High blood pressure - stage 1" };
  }

  if (systolic >= 120 && diastolic < 80) {
    return { key: "elevated", label: "Elevated" };
  }

  return { key: "normal", label: "Normal" };
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
    pulse: totals.pulseCount > 0 ? Math.round(totals.pulse / totals.pulseCount) : undefined,
    createdAt: new Date().toISOString(),
  } satisfies BloodPressureReading;
}
