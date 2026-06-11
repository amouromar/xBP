import { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { BPDisplay } from "@/components/BPDisplay";
import { LogSheet } from "@/components/LogSheet";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Header } from "@/components/ui/Header";
import { Text } from "@/components/ui/Text";
import { useBPLogs } from "@/hooks/useBPLogs";
import { useTheme } from "@/hooks/useTheme";
import { useAppTheme } from "@/providers/ThemeProvider";
import { storeActions } from "@/store/useStore";
import { BloodPressureReading } from "@/types";
import {
  GalleryVerticalEnd,
  Moon,
  Share,
  Sun,
} from "lucide-react-native";
import { router } from "expo-router";

/**
 * ----------------------------
 * SAFE DATE HELPERS
 * ----------------------------
 */

function startOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day;

  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);

  return d;
}

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
 * SAFE LOG GUARD
 * ----------------------------
 * Prevents undefined / broken logs from crashing UI
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
  const isDark = themeName === "dark";

  const { logs } = useBPLogs();

  const [showLogSheet, setShowLogSheet] = useState(false);
  const [sortOrder, setSortOrder] = useState<"latest" | "earliest">("latest");
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  const weekDates = useMemo(() => getWeekDates(), []);

  /**
   * STEP 1:
   * filter + remove corrupted logs
   */
  const dayLogs = useMemo(() => {
    return logs
      .filter(isValidLog)
      .filter((log) => isSameDay(new Date(log.createdAt), selectedDate));
  }, [logs, selectedDate]);

  /**
   * STEP 2:
   * sort safely
   */
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
          <>
            <TouchableOpacity hitSlop={12} onPress={toggleTheme}>
              {isDark ? (
                <Sun size={24} color={colors.primary} />
              ) : (
                <Moon size={24} color={colors.primary} />
              )}
            </TouchableOpacity>

            <TouchableOpacity hitSlop={12} onPress={() => console.log("Share")}>
              <Share size={24} color={colors.primary} />
            </TouchableOpacity>

            <TouchableOpacity
              hitSlop={12}
              onPress={() => router.push("/(tabs)/history")}
            >
              <GalleryVerticalEnd size={24} color={colors.primary} />
            </TouchableOpacity>
          </>
        }
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Text variant="body" color="muted">
            Track your readings across the week.
          </Text>
        </View>

        {/* WEEK STRIP */}
        <View style={styles.calendarStrip}>
          {weekDates.map((date, index) => {
            const active = isSameDay(date, selectedDate);

            return (
              <Pressable
                key={`day-${date.toISOString()}`} // ✅ stable key
                onPress={() => setSelectedDate(date)}
                style={[styles.dayCard, active && styles.dayCardActive]}
              >
                <Text variant="body" color={active ? "primary" : "muted"}>
                  {date.toLocaleDateString("en-US", { weekday: "short" })}
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
              {sortedLogs.length} Reading{sortedLogs.length !== 1 ? "s" : ""}
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
                    Latest
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
                    Earliest
                  </Text>
                </Pressable>
              </View>
            )}
          </View>

          {sortedLogs.length > 0 ? (
            <View style={{ gap: 12 }}>
              {sortedLogs.map((log) => {
                if (!log?.id) return null; // extra safety

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
              No readings for this day.
            </Text>
          )}
        </Card>
      </ScrollView>

      <View style={styles.bottomBar}>
        <Button
          title="Log New Reading"
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

const styles = StyleSheet.create({
  container: { flex: 1 },

  content: {
    padding: 20,
    paddingTop: 0,
    gap: 16,
    paddingBottom: 120,
  },

  hero: {
    gap: 10,
    marginBottom: 8,
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
    bottom: 24,
  },
});