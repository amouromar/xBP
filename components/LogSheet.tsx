import { BlurView } from "expo-blur";
import React, { useEffect, useState } from "react";
import { Keyboard, Pressable, StyleSheet, View } from "react-native";
import { useKeyboardHandler } from "react-native-keyboard-controller";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Text } from "@/components/ui/Text";

import { useBPLogs } from "@/hooks/useBPLogs";
import { useAppTheme } from "@/providers/ThemeProvider";
import { BloodPressureReading } from "@/types";

type Props = {
  visible: boolean;
  onClose: () => void;

  mode?: "create" | "edit";
  initialData?: BloodPressureReading | null;
};

export function LogSheet({
  visible,
  onClose,
  mode = "create",
  initialData,
}: Props) {
  const { addBpLog, updateBpLog } = useBPLogs();
  const { colors } = useAppTheme();

  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [pulse, setPulse] = useState("");

  const [render, setRender] = useState(visible);

  const backdropOpacity = useSharedValue(0);
  const keyboardHeight = useSharedValue(0);

  useKeyboardHandler({
    onMove: (e) => {
      "worklet";
      keyboardHeight.value = e.height;
    },
  });

  // hydrate fields when switching modes
  useEffect(() => {
    if (visible && mode === "edit" && initialData) {
      setSystolic(String(initialData.systolic));
      setDiastolic(String(initialData.diastolic));
      setPulse(initialData.pulse ? String(initialData.pulse) : "");
    }

    if (visible && mode === "create") {
      setSystolic("");
      setDiastolic("");
      setPulse("");
    }
  }, [visible, mode, initialData]);

  useEffect(() => {
    if (visible) {
      setRender(true);
      backdropOpacity.value = withTiming(1, { duration: 250 });
    } else {
      backdropOpacity.value = withTiming(0, { duration: 200 });
      Keyboard.dismiss();
      setTimeout(() => setRender(false), 220);
    }
  }, [visible]);

  const containerStyle = useAnimatedStyle(() => ({
    paddingBottom: keyboardHeight.value,
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const handleSave = async () => {
    const sys = parseInt(systolic, 10);
    const dia = parseInt(diastolic, 10);
    const pul = parseInt(pulse, 10);

    if (isNaN(sys) || isNaN(dia)) return;

    if (mode === "edit" && initialData) {
      updateBpLog(initialData.id, {
        systolic: sys,
        diastolic: dia,
        pulse: isNaN(pul) ? undefined : pul,
      });
    } else {
      addBpLog({
        systolic: sys,
        diastolic: dia,
        pulse: isNaN(pul) ? undefined : pul,
      });
    }

    setSystolic("");
    setDiastolic("");
    setPulse("");

    onClose();
  };

  if (!render) return null;

  return (
    <View style={styles.root}>
      {/* Backdrop */}
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
        <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]}>
          <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
        </Animated.View>
      </Pressable>

      {/* Sheet */}
      <Animated.View style={[styles.overlay, containerStyle]}>
        <Card style={styles.sheet}>
          <Text variant="section">
            {mode === "edit" ? "Edit Reading" : "Log New Reading"}
          </Text>

          <View style={styles.form}>
            <Input
              value={systolic}
              onChangeText={setSystolic}
              keyboardType="number-pad"
              placeholder="Systolic (120)"
            />

            <Input
              value={diastolic}
              onChangeText={setDiastolic}
              keyboardType="number-pad"
              placeholder="Diastolic (80)"
            />

            <Input
              value={pulse}
              onChangeText={setPulse}
              keyboardType="number-pad"
              placeholder="Pulse (72)"
              onSubmitEditing={handleSave}
            />
          </View>

          <View style={styles.actions}>
            <View style={styles.button}>
              <Button title="Cancel" variant="secondary" onPress={onClose} />
            </View>

            <View style={styles.button}>
              <Button
                title={mode === "edit" ? "Update" : "Save"}
                onPress={handleSave}
              />
            </View>
          </View>
        </Card>
      </Animated.View>
    </View>
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
  },

  form: {
    gap: 14,
    marginTop: 16,
    marginBottom: 20,
  },

  actions: {
    flexDirection: "row",
    gap: 12,
  },

  button: {
    flex: 1,
  },
});