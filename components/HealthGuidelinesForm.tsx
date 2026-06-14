import { useEffect, useState, type ReactNode } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";
import { ChevronDown, ChevronUp } from "lucide-react-native";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Text } from "@/components/ui/Text";
import { useHealthGuidelines } from "@/hooks/useHealthGuidelines";
import { useAppTheme } from "@/providers/ThemeProvider";
import { HealthGuidelines } from "@/types";

function numToStr(n: number) {
  return String(n);
}

function strToNum(s: string, fallback: number) {
  const n = parseInt(s, 10);
  return isNaN(n) ? fallback : n;
}

type GuidelineRowProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
};

function GuidelineRow({
  label,
  value,
  onChangeText,
  placeholder,
}: GuidelineRowProps) {
  return (
    <View style={styles.row}>
      <Text variant="body" style={styles.rowLabel}>
        {label}
      </Text>

      <Input
        value={value}
        onChangeText={onChangeText}
        keyboardType="number-pad"
        placeholder={placeholder}
        containerStyle={styles.input}
        style={styles.inputText}
      />
    </View>
  );
}

type SectionProps = {
  title: string;
  summary: string;
  expanded: boolean;
  onToggle: () => void;
  children: ReactNode;
};

function GuidelineSection({
  title,
  summary,
  expanded,
  onToggle,
  children,
}: SectionProps) {
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        styles.section,
        { borderColor: colors.border, backgroundColor: colors.surface },
      ]}
    >
      <Pressable
        onPress={onToggle}
        style={({ pressed }) => [
          styles.sectionHeader,
          pressed && { opacity: 0.75 },
        ]}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
      >
        <View style={styles.sectionHeaderText}>
          <Text variant="body" style={styles.sectionTitle}>
            {title}
          </Text>

          {!expanded ? (
            <Text variant="body" color="muted" style={styles.sectionSummary}>
              {summary}
            </Text>
          ) : null}
        </View>

        {expanded ? (
          <ChevronUp size={20} color={colors.textSecondary} />
        ) : (
          <ChevronDown size={20} color={colors.textSecondary} />
        )}
      </Pressable>

      {expanded ? (
        <View style={[styles.sectionBody, { borderTopColor: colors.border }]}>
          {children}
        </View>
      ) : null}
    </View>
  );
}

export function HealthGuidelinesForm() {
  const { healthGuidelines, setHealthGuidelines, resetHealthGuidelines } =
    useHealthGuidelines();

  const { colors } = useAppTheme();

  const [draft, setDraft] = useState<HealthGuidelines>(healthGuidelines);
  const [formExpanded, setFormExpanded] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    setDraft(healthGuidelines);
  }, [healthGuidelines]);

  const toggleSection = (key: string) => {
    setExpanded((current) => (current === key ? null : key));
  };

  const updateBp = (
    section: keyof HealthGuidelines["bp"],
    field: string,
    value: string
  ) => {
    setDraft((prev) => ({
      ...prev,
      bp: {
        ...prev.bp,
        [section]: {
          ...prev.bp[section],
          [field]: strToNum(
            value,
            (prev.bp[section] as Record<string, number>)[field]
          ),
        },
      },
    }));
  };

  const updatePulse = (
    field: keyof HealthGuidelines["pulse"],
    value: string
  ) => {
    setDraft((prev) => ({
      ...prev,
      pulse: {
        ...prev.pulse,
        [field]: strToNum(value, prev.pulse[field]),
      },
    }));
  };

  const updateTarget = (
    field: keyof HealthGuidelines["target"],
    value: string
  ) => {
    setDraft((prev) => ({
      ...prev,
      target: {
        ...prev.target,
        [field]: strToNum(value, prev.target[field]),
      },
    }));
  };

  const handleSave = () => {
    const error = setHealthGuidelines(draft);
    if (error) Alert.alert("Invalid guidelines", error);
  };

  const handleReset = () => {
    resetHealthGuidelines();
  };

  const { bp, pulse, target } = draft;

  return (
    <Card style={styles.card}>
      <Pressable
        onPress={() => setFormExpanded((v) => !v)}
        style={({ pressed }) => [
          styles.formHeader,
          pressed && { opacity: 0.75 },
        ]}
        accessibilityRole="button"
        accessibilityState={{ expanded: formExpanded }}
      >
        <View style={styles.formHeaderText}>
          <Text variant="section">Health Guidelines</Text>

          {!formExpanded ? (
            <Text variant="body" color="muted">
              Tap to customize blood pressure and pulse thresholds.
            </Text>
          ) : null}
        </View>

        {formExpanded ? (
          <ChevronUp size={22} color={colors.textSecondary} />
        ) : (
          <ChevronDown size={22} color={colors.textSecondary} />
        )}
      </Pressable>

      {formExpanded ? (
        <>
          <Text variant="body" color="muted">
            Tap a category to view and edit its thresholds.
          </Text>

          <Text variant="eyebrow" style={styles.groupLabel}>
            Blood Pressure
          </Text>

          {/* ---- sections unchanged for brevity ---- */}
          {/* (keep your existing GuidelineSection blocks here exactly as-is) */}

          <Text variant="eyebrow" style={styles.groupLabel}>
            Pulse
          </Text>

          {/* ---- pulse sections unchanged ---- */}

          <View style={styles.targetSection}>
            <Text variant="eyebrow">My Target</Text>

            <Text variant="body" color="muted" style={styles.targetHint}>
              Optional personal goal for recommendations.
            </Text>

            <View style={styles.targetRow}>
              <View style={styles.targetField}>
                <GuidelineRow
                  label="Systolic"
                  value={numToStr(target.systolic)}
                  onChangeText={(v) => updateTarget("systolic", v)}
                  placeholder="130"
                />
              </View>

              <View style={styles.targetField}>
                <GuidelineRow
                  label="Diastolic"
                  value={numToStr(target.diastolic)}
                  onChangeText={(v) => updateTarget("diastolic", v)}
                  placeholder="80"
                />
              </View>
            </View>
          </View>

          {/* ✅ FIXED ACTION BUTTONS */}
          <View style={styles.actions}>
            <View style={styles.actionButton}>
              <Button
                title="Save"
                onPress={handleSave}
              />
            </View>

            <View style={styles.actionButton}>
              <Button
                title="Reset to Standard"
                variant="secondary"
                onPress={handleReset}
              />
            </View>
          </View>
        </>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    gap: 10,
  },

  formHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  formHeaderText: {
    flex: 1,
    gap: 4,
  },

  groupLabel: {
    marginTop: 6,
    marginBottom: 2,
  },

  section: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
  },

  sectionHeaderText: {
    flex: 1,
    gap: 2,
  },

  sectionTitle: {
    fontWeight: "700",
    fontSize: 16,
  },

  sectionSummary: {
    fontSize: 14,
    lineHeight: 20,
  },

  sectionBody: {
    borderTopWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },

  row: {
    gap: 6,
  },

  rowLabel: {
    fontWeight: "600",
    fontSize: 15,
  },

  input: {
    flex: 1,
  },

  inputText: {
    fontSize: 20,
    fontWeight: "700",
  },

  targetSection: {
    marginTop: 8,
    gap: 8,
  },

  targetHint: {
    marginTop: -4,
  },

  targetRow: {
    flexDirection: "row",
    gap: 12,
  },

  targetField: {
    flex: 1,
  },

  // ✅ KEY FIX FOR BUTTON LAYOUT
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
    alignItems: "center",
  },

  actionButton: {
    flex: 1,
    minWidth: 0,
    justifyContent: "center",
  },
});