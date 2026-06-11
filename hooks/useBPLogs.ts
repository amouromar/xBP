import { storeActions, useStore } from "@/store/useStore";
import { BloodPressureReading } from "@/types";
import { getAverageReading } from "@/utils/bpCalculations";

const demoReading: BloodPressureReading = {
  id: "demo",
  systolic: 124,
  diastolic: 82,
  pulse: 72,
  createdAt: new Date().toISOString(),
  source: "Demo",
};

export function useBPLogs() {
  const logs = useStore((state) => state.bpLogs);

  const latestReading = logs[0] ?? demoReading;
  const averageReading = getAverageReading(logs) ?? demoReading;

  return {
    logs,
    latestReading,
    averageReading,

    addBpLog: storeActions.addBpLog,
    removeBpLog: storeActions.removeBpLog,
    updateBpLog: storeActions.updateBpLog, // ✅ FIXED

    addDemoReading() {
      storeActions.addBpLog({
        systolic: 124,
        diastolic: 82,
        pulse: 72,
        source: "Manual entry",
      });
    },
  };
}