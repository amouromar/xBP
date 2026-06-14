import { BlurView } from "expo-blur";
import React, { useEffect, useMemo, useState } from "react";
import { Alert, Keyboard, Pressable, StyleSheet, View } from "react-native";
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
import { useLocale } from "@/hooks/useLocale";
import { useAppTheme } from "@/providers/ThemeProvider";
import { BloodPressureReading } from "@/types";

type Props = {
  visible: boolean;
  onClose: () => void;

  mode?: "create" | "edit";
  initialData?: BloodPressureReading | null;
};

function isFilled(value: string) {
  return value.trim().length > 0;
}

function parsePositiveInt(value: string) {
  const n = parseInt(value.trim(), 10);
  if (isNaN(n) || n <= 0) return null;
  return n;
}

export function LogSheet({
  visible,
  onClose,
  mode = "create",
  initialData,
}: Props) {
  const { addBpLog, updateBpLog } = useBPLogs();
  const { t } = useLocale();

  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [pulse, setPulse] = useState("");

  const [render, setRender] = useState(visible);

  const backdropOpacity = useSharedValue(0);
  const keyboardHeight = useSharedValue(0);

  const canSave = useMemo(
    () => isFilled(systolic) && isFilled(diastolic) && isFilled(pulse),
    [systolic, diastolic, pulse],
  );

  useKeyboardHandler({
    onMove: (e) => {
      "worklet";
      keyboardHeight.value = e.height;
    },
  });

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
  }, [visible, backdropOpacity]);

  const containerStyle = useAnimatedStyle(() => ({
    paddingBottom: keyboardHeight.value,
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const validateFields = () => {
    if (!isFilled(systolic)) {
      Alert.alert(t("logSheet.missingFieldTitle"), t("logSheet.missingSystolic"));
      return null;
    }
    if (!isFilled(diastolic)) {
      Alert.alert(t("logSheet.missingFieldTitle"), t("logSheet.missingDiastolic"));
      return null;
    }
    if (!isFilled(pulse)) {
      Alert.alert(t("logSheet.missingFieldTitle"), t("logSheet.missingPulse"));
      return null;
    }

    const sys = parsePositiveInt(systolic);
    if (sys === null) {
      Alert.alert(t("logSheet.missingFieldTitle"), t("logSheet.invalidSystolic"));
      return null;
    }

    const dia = parsePositiveInt(diastolic);
    if (dia === null) {
      Alert.alert(t("logSheet.missingFieldTitle"), t("logSheet.invalidDiastolic"));
      return null;
    }

    const pul = parsePositiveInt(pulse);
    if (pul === null) {
      Alert.alert(t("logSheet.missingFieldTitle"), t("logSheet.invalidPulse"));
      return null;
    }

    return { sys, dia, pul };
  };

  const handleSave = async () => {
    const values = validateFields();
    if (!values) return;

    const { sys, dia, pul } = values;

    if (mode === "edit" && initialData) {
      updateBpLog(initialData.id, {
        systolic: sys,
        diastolic: dia,
        pulse: pul,
      });
    } else {
      addBpLog({
        systolic: sys,
        diastolic: dia,
        pulse: pul,
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
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
        <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]}>
          <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
        </Animated.View>
      </Pressable>

      <Animated.View style={[styles.overlay, containerStyle]}>
        <Card style={styles.sheet}>
          <Text variant="section">
            {mode === "edit" ? t("logSheet.editTitle") : t("logSheet.title")}
          </Text>

          <View style={styles.form}>
            <Input
              value={systolic}
              onChangeText={setSystolic}
              keyboardType="number-pad"
              placeholder={t("logSheet.systolicPlaceholder")}
            />

            <Input
              value={diastolic}
              onChangeText={setDiastolic}
              keyboardType="number-pad"
              placeholder={t("logSheet.diastolicPlaceholder")}
            />

            <Input
              value={pulse}
              onChangeText={setPulse}
              keyboardType="number-pad"
              placeholder={t("logSheet.pulsePlaceholder")}
              onSubmitEditing={canSave ? handleSave : undefined}
            />
          </View>

          <View style={styles.actions}>
            <View style={styles.button}>
              <Button
                title={t("logSheet.cancel")}
                variant="secondary"
                onPress={onClose}
              />
            </View>

            <View style={styles.button}>
              <Button
                title={mode === "edit" ? t("logSheet.update") : t("logSheet.save")}
                onPress={handleSave}
                disabled={!canSave}
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
