import { useBPLogs } from "@/hooks/useBPLogs";
import { useHealthGuidelines } from "@/hooks/useHealthGuidelines";
import { useAppTheme } from "@/providers/ThemeProvider";
import { BloodPressureReading } from "@/types";
import { getReadingStatus } from "@/utils/bpCalculations";
import { formatBp } from "@/utils/formatting";
import * as MediaLibrary from "expo-media-library";
import React, { useRef, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { captureRef } from "react-native-view-shot";
import { PdfExportSheet } from "./PdfExportSheet";
import { ShareCard } from "./ShareCard";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { Text } from "./ui/Text";

function resolveStatusFields(
  log: BloodPressureReading,
  guidelines: ReturnType<typeof useHealthGuidelines>["healthGuidelines"],
) {
  if (log.statusLabel && log.recommendation) {
    return {
      statusLabel: log.statusLabel,
      recommendation: log.recommendation,
    };
  }

  const status = getReadingStatus(
    log.systolic,
    log.diastolic,
    log.pulse,
    guidelines,
  );

  return {
    statusLabel: log.statusLabel ?? status.statusLabel,
    recommendation: log.recommendation ?? status.recommendation,
  };
}

export function SharePreview() {
  const { logs } = useBPLogs();
  const { healthGuidelines } = useHealthGuidelines();
  const { colors } = useAppTheme();
  const cardRef = useRef<View | null>(null);
  const [selectedLog, setSelectedLog] = useState<BloodPressureReading | null>(
    logs[0] ?? null,
  );
  const [showPdfSheet, setShowPdfSheet] = useState(false);
  const [isSavingImage, setIsSavingImage] = useState(false);

  const handleSaveImage = async () => {
    try {
      setIsSavingImage(true);

      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission required", "Allow media access to save image.");
        return;
      }

      if (!cardRef.current) {
        Alert.alert("Error", "Could not capture image.");
        return;
      }

      const uri = await captureRef(cardRef.current, {
        format: "png",
        quality: 1,
      });

      await MediaLibrary.saveToLibraryAsync(uri);
      Alert.alert("Success", "Image saved to your photo gallery!");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Could not export image.");
    } finally {
      setIsSavingImage(false);
    }
  };

  if (!selectedLog && logs.length === 0) {
    return (
      <Card>
        <Text variant="section">Export</Text>
        <Text variant="body" color="muted">
          No BP logs available. Add a log to get started.
        </Text>
      </Card>
    );
  }

  const statusFields = selectedLog
    ? resolveStatusFields(selectedLog, healthGuidelines)
    : null;

  return (
    <>
      <Card>
        <Text variant="section">Export</Text>
        <Text variant="body" color="muted">
          Save a share card image or export your readings as a PDF report.
        </Text>

        {logs.length > 1 && (
          <View style={styles.selectorContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.logList}
            >
              {logs.map((log) => (
                <Pressable
                  key={log.id}
                  onPress={() => setSelectedLog(log)}
                  style={[
                    styles.logButton,
                    selectedLog?.id === log.id && {
                      backgroundColor: colors.primary,
                    },
                  ]}
                >
                  <Text
                    variant="body"
                    style={[
                      styles.logButtonText,
                      selectedLog?.id === log.id && {
                        color: "white",
                        fontWeight: "600",
                      },
                    ]}
                  >
                    {formatBp(log.systolic, log.diastolic)}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {selectedLog && statusFields ? (
          <View style={styles.cardContainer}>
            <ShareCard
              ref={cardRef}
              systolic={selectedLog.systolic}
              diastolic={selectedLog.diastolic}
              pulse={selectedLog.pulse}
              statusLabel={statusFields.statusLabel}
              recommendation={statusFields.recommendation}
            />
          </View>
        ) : null}

        <View style={styles.exportActions}>
          <View style={styles.exportButton}>
            <Button
              title="Save Image"
              onPress={handleSaveImage}
              loading={isSavingImage}
              disabled={isSavingImage || !selectedLog}
            />
          </View>
          <View style={styles.exportButton}>
            <Button
              title="Export PDF"
              variant="secondary"
              onPress={() => setShowPdfSheet(true)}
              disabled={logs.length === 0}
            />
          </View>
        </View>
      </Card>

      <PdfExportSheet
        visible={showPdfSheet}
        onClose={() => setShowPdfSheet(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  selectorContainer: {
    marginVertical: 12,
    gap: 8,
  },
  logList: {
    marginHorizontal: -8,
    paddingHorizontal: 8,
  },
  logButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    alignItems: "center",
    opacity: 0.6,
  },
  logButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  cardContainer: {
    marginVertical: 16,
    alignItems: "center",
    width: "100%",
  },
  exportActions: {
    flexDirection: "row",
    gap: 12,
  },
  exportButton: {
    flex: 1,
  },
});
