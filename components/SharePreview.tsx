import { useBPLogs } from "@/hooks/useBPLogs";
import { useAppTheme } from "@/providers/ThemeProvider";
import { BloodPressureReading } from "@/types";
import { formatBp } from "@/utils/formatting";
import * as MediaLibrary from "expo-media-library";
import React, { useRef, useState } from "react";
import {
    Alert,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
} from "react-native";
import { captureRef } from "react-native-view-shot";
import { ShareCard } from "./ShareCard";
import { Card } from "./ui/Card";
import { Text } from "./ui/Text";

export function SharePreview() {
  const { logs } = useBPLogs();
  const { colors } = useAppTheme();
  const cardRef = useRef<View | null>(null);
  const [selectedLog, setSelectedLog] = useState<BloodPressureReading | null>(
    logs[0] ?? null
  );
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [lastTap, setLastTap] = useState(0);

  const handleCardPress = () => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;

    if (lastTap && now - lastTap < DOUBLE_PRESS_DELAY) {
      setShowExportMenu(true);
      setLastTap(0);
    } else {
      setLastTap(now);
    }
  };

  if (!selectedLog && logs.length === 0) {
    return (
      <Card>
        <Text variant="section">Share preview</Text>
        <Text variant="body" color="muted">
          No BP logs available. Add a log to get started.
        </Text>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <Text variant="section">Share preview</Text>

        {/* Log selector */}
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

        {/* Share card with double-tap */}
        {selectedLog && (
          <Pressable
            onPress={handleCardPress}
            delayLongPress={200}
          >
            <View style={styles.cardContainer}>
              <ShareCard
                ref={cardRef}
                systolic={selectedLog.systolic}
                diastolic={selectedLog.diastolic}
                pulse={selectedLog.pulse}
              />
            </View>
            <Text
              variant="body"
              color="muted"
              style={styles.doubleTapHint}
            >
              Double tap to export
            </Text>
          </Pressable>
        )}
      </Card>

      {/* Export menu modal */}
      <ExportMenu
        visible={showExportMenu}
        onClose={() => setShowExportMenu(false)}
        cardRef={cardRef}
      />
    </>
  );
}

interface ExportMenuProps {
  visible: boolean;
  onClose: () => void;
  cardRef: React.RefObject<View | null>;
}

function ExportMenu({ visible, onClose, cardRef }: ExportMenuProps) {
  const { colors } = useAppTheme();
  const [isExporting, setIsExporting] = useState(false);

  const handleSaveToDevice = async () => {
    try {
      setIsExporting(true);

      // Request permission
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission required", "Allow media access to save image.");
        return;
      }

      if (!cardRef.current) {
        Alert.alert("Error", "Could not capture image.");
        return;
      }

      // Capture the card
      const uri = await captureRef(cardRef.current, {
        format: "png",
        quality: 1,
      });

      // Save to gallery
      await MediaLibrary.saveToLibraryAsync(uri);

      Alert.alert("Success", "Image saved to your photo gallery!");
      onClose();
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Could not export image.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        style={styles.modalOverlay}
        onPress={onClose}
      >
        <View
          style={[
            styles.menuContainer,
            { backgroundColor: colors.surface },
          ]}
        >
          <Text variant="section" style={styles.menuTitle}>
            Export Options
          </Text>

          <Pressable
            onPress={handleSaveToDevice}
            disabled={isExporting}
            style={({ pressed }) => [
              styles.menuItem,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text variant="body" color="primary">
              {isExporting ? "Saving..." : "Save to Device"}
            </Text>
          </Pressable>

          <Pressable
            onPress={onClose}
            style={({ pressed }) => [
              styles.menuItem,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text variant="body" color="muted">
              Cancel
            </Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  selectorContainer: {
    marginVertical: 12,
    gap: 8,
  },
  selectorLabel: {
    marginLeft: 0,
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
  doubleTapHint: {
    textAlign: "center",
    marginTop: 8,
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  menuContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 32,
  },
  menuTitle: {
    textAlign: "center",
    marginBottom: 16,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 8,
  },
});
