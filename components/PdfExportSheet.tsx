
import { BlurView } from "expo-blur";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Keyboard,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Check } from "lucide-react-native";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { useBPLogs } from "@/hooks/useBPLogs";
import { useAppTheme } from "@/providers/ThemeProvider";
import {
  exportLogsToPdf,
  formatDayKeyLabel,
  getUniqueDayKeys,
  PdfExportScope,
} from "@/utils/pdfExport";

type Props = {
  visible: boolean;
  onClose: () => void;
};

type Step = "options" | "select-days";

export function PdfExportSheet({ visible, onClose }: Props) {
  const { logs } = useBPLogs();
  const { colors } = useAppTheme();

  const [step, setStep] = useState<Step>("options");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  const backdropOpacity = useSharedValue(0);
  const dayKeys = useMemo(() => getUniqueDayKeys(logs), [logs]);

  useEffect(() => {
    if (visible) {
      setStep("options");
      setSelectedDays([]);
      backdropOpacity.value = withTiming(1, { duration: 250 });
    } else {
      backdropOpacity.value = withTiming(0, { duration: 200 });
      Keyboard.dismiss();
    }
  }, [visible, backdropOpacity]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const toggleDay = (dayKey: string) => {
    setSelectedDays((current) =>
      current.includes(dayKey)
        ? current.filter((k) => k !== dayKey)
        : [...current, dayKey],
    );
  };

  const runExport = async (scope: PdfExportScope) => {
    setIsExporting(true);
    const result = await exportLogsToPdf(logs, scope);
    setIsExporting(false);

    if (!result.success) {
      Alert.alert("Export failed", result.error ?? "Could not export PDF.");
      return;
    }

    onClose();
  };

  const handleToday = () => runExport({ type: "today" });
  const handleMonth = () => runExport({ type: "month" });
  const handleAll = () => runExport({ type: "all" });

  const handleExportSelectedDays = () => {
    if (selectedDays.length === 0) {
      Alert.alert("Select days", "Choose at least one day to export.");
      return;
    }
    runExport({ type: "days", dayKeys: selectedDays });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
          <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]}>
            <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
          </Animated.View>
        </Pressable>

        <View style={styles.overlay}>
          <Card style={styles.sheet}>
            <Text variant="section" style={styles.noWrap}>Export PDF</Text>

            <Text variant="body" color="muted" style={styles.noWrap}>
              {step === "options"
                ? "Choose which readings to include in your report."
                : "Select the days you want to export."}
            </Text>

            {step === "options" ? (
              <View style={styles.options}>
                <Button title="Today's readings" onPress={handleToday} loading={isExporting} disabled={isExporting} style={styles.fullWidth} />
                <Button title="Select specific days" variant="secondary" onPress={() => setStep("select-days")} disabled={isExporting || dayKeys.length === 0} style={styles.fullWidth} />
                <Button title="This month" variant="secondary" onPress={handleMonth} loading={isExporting} disabled={isExporting} style={styles.fullWidth} />
                <Button title="All data" variant="secondary" onPress={handleAll} loading={isExporting} disabled={isExporting} />
              </View>
            ) : (
              <>
                <ScrollView style={styles.dayList} contentContainerStyle={styles.dayListContent} showsVerticalScrollIndicator={false}>
                  {dayKeys.map((dayKey) => {
                    const active = selectedDays.includes(dayKey);
                    return (
                      <Pressable
                        key={dayKey}
                        onPress={() => toggleDay(dayKey)}
                        style={[
                          styles.dayRow,
                          {
                            borderColor: colors.border,
                            backgroundColor: active ? colors.primary + "14" : colors.surface,
                          },
                        ]}
                      >
                        <Text variant="body" style={[styles.dayLabel, styles.noWrap]}>
                          {formatDayKeyLabel(dayKey)}
                        </Text>

                        {active ? <Check size={18} color={colors.primary} /> : null}
                      </Pressable>
                    );
                  })}
                </ScrollView>

                <View style={styles.actions}>
                  <View style={styles.actionButton}>
                    <Button title="Back" variant="secondary" onPress={() => setStep("options")} disabled={isExporting} />
                  </View>

                  <View style={styles.actionButton}>
                    <Button
                      title="Export selected"
                      onPress={handleExportSelectedDays}
                      loading={isExporting}
                      disabled={isExporting}
                      style={styles.fullWidth}
                    />
                  </View>
                </View>
              </>
            )}

            {step === "options" ? (
              <Button title="Cancel" variant="secondary" onPress={onClose} disabled={isExporting} />
            ) : null}
          </Card>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    justifyContent: "flex-end",
  },
  backdrop: {
    backgroundColor: "rgba(0,0,0,0.9)",
  },
  overlay: {
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    gap: 14,
  },
  options: {
    gap: 10,
    width: "100%",
  },
  dayList: {
    maxHeight: 280,
  },
  dayListContent: {
    gap: 8,
  },
  dayRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  dayLabel: {
    fontWeight: "500",
    flexShrink: 1,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  fullWidth: {
    width: "100%",
  },
  noWrap: {
    flexWrap: "nowrap",
  },
});