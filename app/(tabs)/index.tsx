import { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { BPDisplay } from "@/components/BPDisplay";
import { PeriodSummaryBar } from "@/components/PeriodSummaryBar";
import { LogSheet } from "@/components/LogSheet";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Header } from "@/components/ui/Header";
import { Text } from "@/components/ui/Text";
import { useBPLogs } from "@/hooks/useBPLogs";
import { useLocale } from "@/hooks/useLocale";
import { useTabBarInset } from "@/hooks/useTabBarInset";
import { useTheme } from "@/hooks/useTheme";
import { useAppTheme } from "@/providers/ThemeProvider";
import { storeActions } from "@/store/useStore";
import { BloodPressureReading } from "@/types";
import { Moon, Sun } from "lucide-react-native";
import {
  endOfWeek,
  getPeriodStats,
  startOfWeek,
} from "@/utils/periodStats";

/**
 * ----------------------------
 * WEEK HELPERS
 * ----------------------------
 */

function getWeekDates() {
  const start = startOfWeek(new Date());

  return Array.from({ length: 7 }).map((_, i) => {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    return date;
  });
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/**
 * ----------------------------
 * WEEKDAY LABELS (SAFE + CONTROLLED)
 * ----------------------------
 * avoids toLocaleDateString inconsistencies
 */

const WEEKDAY_MAP: Record<string, string[]> = {
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  de: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
  es: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"],
  fr: ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"],
  sw: ["Jpl", "Jta", "Jnn", "Jtn", "Alh", "Ijm", "Jmo"],
};

/**
 * ----------------------------
 * SAFE LOG GUARD
 * ----------------------------
 */

function isValidLog(log: any): log is BloodPressureReading {
  return (
    log &&
    typeof log.id === "string" &&
    log.id.length > 0 &&
    typeof log.systolic === "number" &&
    typeof log.diastolic === "number" &&
    typeof log.createdAt === "string"
  );
}

export default function HomeScreen() {
  const { colors } = useAppTheme();
  const { themeName, toggleTheme } = useTheme();
  const { t, locale } = useLocale();
  const { floatingBottomOffset, tabBarHeight } = useTabBarInset();
  const isDark = themeName === "dark";

  const { logs } = useBPLogs();

  const [showLogSheet, setShowLogSheet] = useState(false);
  const [sortOrder, setSortOrder] = useState<"latest" | "earliest">("latest");
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  const weekDates = useMemo(() => getWeekDates(), []);

  const weekdayLabels = useMemo(() => {
    return WEEKDAY_MAP[locale] ?? WEEKDAY_MAP.en;
  }, [locale]);

  const weekStats = useMemo(() => {
    const now = new Date();
    return getPeriodStats(
      logs.filter(isValidLog),
      startOfWeek(now),
      endOfWeek(now),
    );
  }, [logs]);

  const dayLogs = useMemo(() => {
    return logs
      .filter(isValidLog)
      .filter((log) => isSameDay(new Date(log.createdAt), selectedDate));
  }, [logs, selectedDate]);

  const sortedLogs = useMemo(() => {
    return [...dayLogs].sort((a, b) => {
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();

      return sortOrder === "latest" ? bTime - aTime : aTime - bTime;
    });
  }, [dayLogs, sortOrder]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        rightContent={
          <TouchableOpacity hitSlop={12} onPress={toggleTheme}>
            {isDark ? (
              <Sun size={24} color={colors.primary} />
            ) : (
              <Moon size={24} color={colors.primary} />
            )}
          </TouchableOpacity>
        }
      />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: tabBarHeight + 80 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text variant="body" color="muted">
          {t("home.subtitle")}
        </Text>

        <PeriodSummaryBar
          label={t("home.thisWeek")}
          averageSystolic={weekStats.average?.systolic}
          averageDiastolic={weekStats.average?.diastolic}
          points={weekStats.points}
          readingCount={weekStats.count}
        />

        {/* WEEK STRIP */}
        <View style={styles.calendarStrip}>
          {weekDates.map((date) => {
            const active = isSameDay(date, selectedDate);

            return (
              <Pressable
                key={`day-${date.toISOString()}`}
                onPress={() => setSelectedDate(date)}
                style={[styles.dayCard, active && styles.dayCardActive]}
              >
                <Text
                  variant="body"
                  color={active ? "primary" : "muted"}
                  style={{ width: 32, textAlign: "center" }}
                >
                  {weekdayLabels[date.getDay()]}
                </Text>

                <Text
                  style={[
                    styles.dateNumber,
                    active && styles.dateNumberActive,
                  ]}
                >
                  {date.getDate()}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* SORT + LIST */}
        <Card style={{ marginTop: 8, borderRadius: 18 }}>
          <View style={styles.sortRow}>
            <Text variant="section">
              {sortedLogs.length}{" "}
              {sortedLogs.length === 1
                ? t("home.reading")
                : t("home.readings")}
            </Text>

            {sortedLogs.length > 1 && (
              <View style={styles.sortToggle}>
                <Pressable
                  onPress={() => setSortOrder("latest")}
                  style={[
                    styles.sortButton,
                    sortOrder === "latest" && styles.sortButtonActive,
                  ]}
                >
                  <Text color={sortOrder === "latest" ? "primary" : "muted"}>
                    {t("home.latest")}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => setSortOrder("earliest")}
                  style={[
                    styles.sortButton,
                    sortOrder === "earliest" && styles.sortButtonActive,
                  ]}
                >
                  <Text color={sortOrder === "earliest" ? "primary" : "muted"}>
                    {t("home.earliest")}
                  </Text>
                </Pressable>
              </View>
            )}
          </View>

          {sortedLogs.length > 0 ? (
            <View style={{ gap: 12 }}>
              {sortedLogs.map((log) => {
                if (!log?.id) return null;

                return (
                  <View key={log.id}>
                    <BPDisplay
                      reading={log}
                      onEdit={(reading) =>
                        storeActions.updateBpLog(reading.id, reading)
                      }
                      onDelete={(id) => storeActions.removeBpLog(id)}
                      onPress={(reading) =>
                        console.log("pressed", reading.id)
                      }
                    />
                  </View>
                );
              })}
            </View>
          ) : (
            <Text variant="body" color="muted">
              {t("home.noReadingsDay")}
            </Text>
          )}
        </Card>
      </ScrollView>

      <View style={[styles.bottomBar, { bottom: floatingBottomOffset - 74 }]}>
        <Button
          title={t("home.logNewReading")}
          onPress={() => setShowLogSheet(true)}
        />
      </View>

      <LogSheet
        visible={showLogSheet}
        onClose={() => setShowLogSheet(false)}
      />
    </View>
  );
}

/**
 * ----------------------------
 * STYLES
 * ----------------------------
 */

const styles = StyleSheet.create({
  container: { flex: 1 },

  content: {
    padding: 20,
    paddingTop: 0,
    gap: 16,
  },

  calendarStrip: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },

  dayCard: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: "#C1C2CD",
    gap: 2,
  },

  dayCardActive: {
    backgroundColor: "#D7CBD5",
  },

  dateNumber: {
    fontSize: 28,
    fontWeight: "400",
    color: "#A2A2AA",
  },

  dateNumberActive: {
    color: "#55555D",
  },

  sortRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  sortToggle: {
    flexDirection: "row",
    gap: 8,
  },

  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },

  sortButtonActive: {
    backgroundColor: "#D7CBD5",
  },

  bottomBar: {
    position: "absolute",
    left: 20,
    right: 20,
  },
});