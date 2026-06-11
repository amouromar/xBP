import { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, View, TouchableOpacity } from "react-native";
import { ChevronLeft, ChevronRight } from "lucide-react-native";

import { BPDisplay } from "@/components/BPDisplay";
import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { useBPLogs } from "@/hooks/useBPLogs";
import { useAppTheme } from "@/providers/ThemeProvider";
import { formatDateTime } from "@/utils/formatting";
import { useTheme } from "@/hooks/useTheme";
import { Header } from "@/components/ui/Header";
import { Moon, Sun } from "lucide-react-native";

function startOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay();

  const diff = (day === 0 ? -6 : 1) - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);

  return d;
}

function getWeekDates(weekStart: Date) {
  return Array.from({ length: 7 }).map((_, i) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
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

function formatWeekRange(start: Date) {
  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
  };

  return `${start.toLocaleDateString("en-US", options)} – ${end.toLocaleDateString(
    "en-US",
    options
  )}`;
}

export default function HistoryScreen() {
  const { logs } = useBPLogs();
  const { colors } = useAppTheme();
  const { themeName } = useTheme();
  const { toggleTheme } = useTheme();
  const isDark = themeName === "dark";


  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const weekStart = useMemo(() => {
    const base = new Date();
    base.setDate(base.getDate() + weekOffset * 7);
    return startOfWeek(base);
  }, [weekOffset]);

  const weekDates = useMemo(() => getWeekDates(weekStart), [weekStart]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) =>
      isSameDay(new Date(log.createdAt), selectedDate)
    );
  }, [logs, selectedDate]);

  return (
    <FlatList
      data={filteredLogs}
      keyExtractor={(item) => item.id}
      contentContainerStyle={[
        styles.content,
        { backgroundColor: colors.background },
      ]}
      ListHeaderComponent={

        <View>
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
              </>
            }
          />
          <View style={styles.header}>
            <Text variant="body" color="muted">
              Browse readings by week and day.
            </Text>


            {/* WEEK NAVIGATOR */}
            <View style={styles.weekNav}>
              <Pressable onPress={() => setWeekOffset((v) => v - 1)}>
                <ChevronLeft size={22} color={colors.primary} />
              </Pressable>

              <Text variant="eyebrow">
                {formatWeekRange(weekStart)}
              </Text>

              <Pressable onPress={() => setWeekOffset((v) => v + 1)}>
                <ChevronRight size={22} color={colors.primary} />
              </Pressable>
            </View>

            {/* DAY STRIP */}
            <View style={styles.calendarStrip}>
              {weekDates.map((date, index) => {
                const active = isSameDay(date, selectedDate);

                return (
                  <Pressable
                    key={index}
                    onPress={() => setSelectedDate(date)}
                    style={[
                      styles.dayCard,
                      active && styles.dayCardActive,
                    ]}
                  >
                    <Text
                      variant="body"
                      color={active ? "primary" : "muted"}
                    >
                      {date.toLocaleDateString("en-US", {
                        weekday: "short",
                      })}
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
          </View>
        </View>
      }
      ListEmptyComponent={
        <Card style={{ marginHorizontal: 20, alignItems: "center", gap: 8 }}>
          <Text variant="section">No readings</Text>
          <Text variant="body" color="muted">
            No blood pressure logs for this day.
          </Text>
        </Card>
      }
      renderItem={({ item }) => (
        <Card style={{ marginHorizontal: 20, borderRadius: 18 }}>
          <View>
            <BPDisplay reading={item} compact />
            <Text variant="body" color="muted">
              {item.createdAt
                ? new Date(item.createdAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })
                : "recently"}
            </Text>
          </View>
        </Card>
      )}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    gap: 14,
  },

  header: {
    gap: 10,
    paddingHorizontal: 20,
    marginBottom: 8,
  },

  weekNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 10,
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

  row: {
    gap: 0,
  },
});