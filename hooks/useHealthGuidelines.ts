import { storeActions, useStore } from "@/store/useStore";

export function useHealthGuidelines() {
  const healthGuidelines = useStore((state) => state.healthGuidelines);

  return {
    healthGuidelines,
    setHealthGuidelines: storeActions.setHealthGuidelines,
    resetHealthGuidelines: storeActions.resetHealthGuidelines,
  };
}
