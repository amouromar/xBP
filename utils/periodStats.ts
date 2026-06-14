import { BloodPressureReading } from "@/types";
import { getAverageReading } from "@/utils/bpCalculations";

export function startOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfWeek(date: Date) {
  const end = startOfWeek(date);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

export function startOfMonth(date: Date) {
  const d = new Date(date.getFullYear(), date.getMonth(), 1);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfMonth(date: Date) {
  const d = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function getPeriodStats(
  logs: BloodPressureReading[],
  start: Date,
  end: Date,
) {
  const inRange = logs.filter((log) => {
    const created = new Date(log.createdAt);
    return created >= start && created <= end;
  });

  const average = getAverageReading(inRange);
  const points = inRange.reduce(
    (sum, log) => sum + (log.pointsEarned ?? 0),
    0,
  );

  return {
    count: inRange.length,
    average,
    points,
  };
}

export function formatMonthLabel(date: Date) {
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}
