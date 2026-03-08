import { Feather, Ionicons } from "@expo/vector-icons";
import { useScrollToTop } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import moment from "moment";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "../components/ThemedText";
import { useTheme } from "../context/ThemeContext";
import { useEkadashiList, useNextEkadashi } from "../hooks/useEkadashi";

const WINDOW_WIDTH = Dimensions.get("window").width;
const WINDOW_HEIGHT = Dimensions.get("window").height;
const relativeWidth = (percentage) => WINDOW_WIDTH * (percentage / 100);
const relativeHeight = (percentage) => WINDOW_HEIGHT * (percentage / 100);

const EkadashiScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const scrollRef = useRef(null);
  useScrollToTop(scrollRef);
  const currentYear = moment().year();
  const {
    ekadashiList,
    loading: listLoading,
    error: listError,
  } = useEkadashiList(currentYear);
  const { nextEkadashi, loading: nextLoading } = useNextEkadashi();
  const [viewMode, setViewMode] = useState("month"); 

  const handleMonthPress = (month, index) => {
    const selectedMonth = moment().month(index).year(currentYear);
    navigation.navigate("CalendarMonth", {
      month: selectedMonth.format("YYYY-MM"),
      monthName: month,
    });
  };

  const getEkadashisByMonth = () => {
    if (!ekadashiList || ekadashiList.length === 0) return {};

    const grouped = {};
    ekadashiList.forEach((ekadashi) => {
      const date = moment(ekadashi.date || ekadashi.ekadashi_date);
      const monthName = date.format("MMMM");

      if (!grouped[monthName]) {
        grouped[monthName] = [];
      }
      grouped[monthName].push(ekadashi);
    });

    return grouped;
  };

  const getMonthData = () => {
    const grouped = getEkadashisByMonth();
    const months = moment.months();
    const today = moment();

    return months.map((month, index) => {
      const monthEkadashis = grouped[month] || [];
      const monthDate = moment().month(index);
      
      const isUpcoming =
        monthDate.isAfter(today, "month") ||
        (monthDate.month() === today.month() &&
          monthDate.year() === today.year());

      return {
        month,
        ekadashis: monthEkadashis.length,
        isUpcoming,
        isCurrent:
          monthDate.month() === today.month() &&
          monthDate.year() === today.year(),
      };
    });
  };

  const totalEkadashis = ekadashiList ? ekadashiList.length : 0;
  const today = moment();
  const remainingEkadashis = ekadashiList
    ? ekadashiList.filter((e) => {
      const date = moment(e.date || e.ekadashi_date);
      return date.isAfter(today, "day");
    }).length
    : 0;

  const getNextEkadashiData = () => {
    if (!nextEkadashi) return null;

    const date = moment(nextEkadashi.date || nextEkadashi.ekadashi_date);
    const month = date.format("MMM");
    const day = date.format("D");
    const year = date.format("YYYY");

    const hinduMonth = nextEkadashi.month || month;

    return {
      title: nextEkadashi.name || nextEkadashi.ekadashi_name || "Next Ekadashi",
      dateFormatted: `${day} ${month} ${year}`,
      hinduMonth: hinduMonth,
      details:
        nextEkadashi.significance ||
        nextEkadashi.description ||
        "Makes all endeavors successful and fruitful...",
    };
  };

  const monthData = getMonthData();
  const nextEkadashiData = getNextEkadashiData();

  const MonthCard = ({ month, ekadashis, isUpcoming, onPress }) => {
    return (
      <TouchableOpacity
        style={[
          styles.monthCard,
          {
            backgroundColor: isUpcoming
              ? (isDark ? colors.muted : "#E9EDF6")
              : isDark
                ? colors.card
                : "#F8FAFC",
            borderColor: isUpcoming ? (isDark ? colors.border : "#ADBBDB") : colors.border,
          },
        ]}
        onPress={onPress}
      >
        <ThemedText
          type="defaultSemiBold"
          style={[styles.monthText, { color: colors.foreground }]}
        >
          {month}
        </ThemedText>
        <View style={styles.ekadashiCountContainer}>
          <Feather
            name="clock"
            size={relativeWidth(3.5)}
            color={colors.accent}
          />
          <ThemedText
            type="small"
            style={[styles.ekadashiCountText, { color: colors.accent }]}
          >
            {ekadashis} Ekadashis
          </ThemedText>
        </View>
        {isUpcoming && (
          <View
            style={[
              styles.upcomingBadge,
              { backgroundColor: isDark ? colors.secondary : "#FACC15" },
            ]}
          >
            <ThemedText
              type="caption"
              style={[
                styles.upcomingBadgeText,
                { color: isDark ? colors.secondaryForeground : "#422006" },
              ]}
            >
              Upcoming
            </ThemedText>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const NextEkadashiCardSimple = ({
    title,
    dateFormatted,
    hinduMonth,
    details,
    ekadashi,
  }) => (
    <TouchableWithoutFeedback
      onPress={() => {
        if (ekadashi) {
          const ekadashiDate = ekadashi.date || ekadashi.ekadashi_date;
          navigation.navigate("DayDetails", {
            ekadashi: ekadashi,
            date: moment(ekadashiDate).format("YYYY-MM-DD"),
          });
        }
      }}
    >
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.nextEkadashiCard, { borderColor: colors.border }]}
      >
        <View
          style={[
            styles.nextEkadashiMoonContainer,
            { backgroundColor: colors.primary },
          ]}
        >
          <Ionicons name="moon" size={relativeWidth(6)} color="#FFFFFF" />
        </View>
        <View style={styles.nextEkadashiContent}>
          <ThemedText
            type="defaultSemiBold"
            style={[styles.nextEkadashiTitle, { color: colors.foreground }]}
          >
            {title}
          </ThemedText>
          <ThemedText
            type="small"
            style={[styles.nextEkadashiDate, { color: colors.primary }]}
          >
            {dateFormatted} • {hinduMonth}
          </ThemedText>
          <ThemedText
            numberOfLines={2}
            type="small"
            style={[
              styles.nextEkadashiDetails,
              { color: colors.mutedForeground },
            ]}
          >
            {details}
          </ThemedText>
        </View>
      </LinearGradient>
    </TouchableWithoutFeedback>
  );

  if (listLoading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
      >
        <View style={styles.screenHeader}>
          <ThemedText
            type="heading"
            style={[styles.mainTitle, { color: colors.foreground }]}
          >
            Ekadashi Calendar {currentYear}
          </ThemedText>
          <ThemedText
            style={[styles.subtitle, { color: colors.mutedForeground }]}
          >
            Complete spiritual calendar for the year
          </ThemedText>
          <View
            style={[
              styles.subtitleUnderline,
              { backgroundColor: colors.mutedForeground },
            ]}
          />
        </View>

        {}
        <View style={styles.statsContainer}>
          <View
            style={[
              styles.statCard,
              {
                backgroundColor: isDark ? colors.card : "#F3E8FF",
                borderWidth: isDark ? 1 : 2,
                borderColor: isDark ? "#A855F7" : "#CEBDFD",
              },
            ]}
          >
            <ThemedText style={[styles.statNumber, { color: isDark ? "#E9D5FF" : "#7E22CE" }]}>
              {totalEkadashis}
            </ThemedText>
            <ThemedText style={[styles.statLabel, { color: isDark ? "#E9D5FF" : "#7E22CE" }]}>
              TOTAL EKADASHIS
            </ThemedText>
          </View>
          <View
            style={[
              styles.statCard,
              {
                backgroundColor: isDark ? colors.card : "#FFEDD5",
                borderWidth: isDark ? 1 : 2,
                borderColor: isDark ? colors.secondary : "#FDD09B",
              },
            ]}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Feather
                name="star"
                size={24}
                color={isDark ? colors.secondary : "#C2410C"}
                style={{ marginRight: 6 }}
              />
              <ThemedText
                style={[
                  styles.statNumber,
                  { color: isDark ? colors.secondary : "#C2410C" },
                ]}
              >
                {remainingEkadashis}
              </ThemedText>
            </View>
            <ThemedText
              style={[
                styles.statLabel,
                { color: isDark ? colors.secondary : "#C2410C" },
              ]}
            >
              REMAINING
            </ThemedText>
          </View>
        </View>

        {}
        <View style={styles.toggleContainerWrapper}>
          <View
            style={[
              styles.toggleContainer,
              {
                backgroundColor: isDark ? colors.muted : "#F1F5F9",
                borderColor: colors.border,
              },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.toggleButton,
                viewMode === "month" && {
                  backgroundColor: isDark ? colors.card : "#FFFFFF",
                  ...styles.toggleButtonActive,
                },
              ]}
              onPress={() => setViewMode("month")}
            >
              <Feather
                name="calendar"
                size={16}
                color={
                  viewMode === "month"
                    ? colors.foreground
                    : colors.mutedForeground
                }
                style={{ marginRight: 8 }}
              />
              <ThemedText
                style={[
                  styles.toggleText,
                  {
                    color:
                      viewMode === "month"
                        ? colors.foreground
                        : colors.mutedForeground,
                  },
                ]}
              >
                By Month
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                viewMode === "all" && {
                  backgroundColor: isDark ? colors.card : "#FFFFFF",
                  ...styles.toggleButtonActive,
                },
              ]}
              onPress={() => setViewMode("all")}
            >
              <Feather
                name="list"
                size={16}
                color={
                  viewMode === "all"
                    ? colors.foreground
                    : colors.mutedForeground
                }
                style={{ marginRight: 8 }}
              />
              <ThemedText
                style={[
                  styles.toggleText,
                  {
                    color:
                      viewMode === "all"
                        ? colors.foreground
                        : colors.mutedForeground,
                  },
                ]}
              >
                All Ekadashis
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {viewMode === "month" ? (
          <View style={styles.monthGrid}>
            {monthData.map((item, index) => (
              <MonthCard
                key={item.month}
                month={item.month}
                ekadashis={item.ekadashis}
                isUpcoming={item.isUpcoming}
                onPress={() => handleMonthPress(item.month, index)}
              />
            ))}
          </View>
        ) : (
          <View style={styles.listContainer}>
            {ekadashiList &&
              ekadashiList.map((ekadashi, index) => {
                const date = moment(ekadashi.date || ekadashi.ekadashi_date);
                const isPast = date.isBefore(today, "day");
                const isToday = date.isSame(today, "day");
                const status = isToday ? "Today" : isPast ? "Past" : "Upcoming";

                return (
                  <TouchableOpacity
                    key={index}
                    activeOpacity={0.8}
                    onPress={() => {
                      const ekadashiDate =
                        ekadashi.date || ekadashi.ekadashi_date;
                      navigation.navigate("DayDetails", {
                        ekadashi: ekadashi,
                        date: moment(ekadashiDate).format("YYYY-MM-DD"),
                      });
                    }}
                    style={[
                      styles.listCard,
                      {
                        opacity: isPast ? 0.6 : 1,
                        backgroundColor: isPast && isDark ? colors.muted + '20' : colors.card,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.listMoonContainer,
                        {
                          backgroundColor: !isPast
                            ? "black"
                            : isDark
                              ? colors.muted
                              : "#475569",
                        },
                      ]}
                    >
                      <Ionicons
                        name="moon"
                        size={relativeWidth(5)}
                        color="#FFFFFF"
                        style={{ opacity: isPast ? 0.8 : 1 }}
                      />
                    </View>

                    <View style={styles.listContent}>
                      <ThemedText
                        type="defaultSemiBold"
                        style={[styles.listTitle, { color: colors.foreground }]}
                      >
                        {ekadashi.name || ekadashi.ekadashi_name}
                      </ThemedText>
                      <View style={styles.listDateRow}>
                        <Feather
                          name="calendar"
                          size={12}
                          color={colors.mutedForeground}
                          style={{ marginRight: 4 }}
                        />
                        <ThemedText
                          type="small"
                          style={[
                            styles.listDate,
                            { color: colors.mutedForeground },
                          ]}
                        >
                          {date.format("D MMM YYYY")}
                        </ThemedText>
                      </View>
                    </View>

                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <View
                        style={[
                          styles.statusBadge,
                          status === "Today"
                            ? { backgroundColor: colors.primary }
                            : status === "Past"
                              ? {
                                backgroundColor: isDark
                                  ? colors.secondary
                                  : "#FDE047",
                              }
                              : { borderColor: colors.border, borderWidth: 1 },
                        ]}
                      >
                        <ThemedText
                          style={[
                            styles.statusText,
                            status === "Today"
                              ? { color: "#FFFFFF" }
                              : status === "Past"
                                ? {
                                  color: isDark
                                    ? colors.secondaryForeground
                                    : "#422006",
                                }
                                : { color: colors.foreground },
                          ]}
                        >
                          {status}
                        </ThemedText>
                      </View>
                      <Feather
                        name="chevron-right"
                        size={16}
                        color={colors.mutedForeground}
                        style={{ marginLeft: 8 }}
                      />
                    </View>
                  </TouchableOpacity>
                );
              })}
          </View>
        )}

        {nextEkadashiData && nextEkadashi && viewMode === "month" && (
          <View style={styles.nextEkadashiSection}>
            <ThemedText
              type="subtitle"
              style={[styles.sectionTitle, { color: colors.foreground }]}
            >
              Next Ekadashi
            </ThemedText>
            <NextEkadashiCardSimple
              title={nextEkadashiData.title}
              dateFormatted={nextEkadashiData.dateFormatted}
              hinduMonth={nextEkadashiData.hinduMonth}
              details={nextEkadashiData.details}
              ekadashi={nextEkadashi}
            />
          </View>
        )}

        {listError && (
          <View style={{ padding: 20, alignItems: "center" }}>
            <ThemedText type="small" style={{ color: colors.destructive }}>
              {listError}
            </ThemedText>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    
  },
  scrollViewContent: {
    paddingBottom: '20%',
  },
  screenHeader: {
    alignItems: "center",
    paddingVertical: relativeHeight(3),
  },
  mainTitle: {
    fontSize: 28, 
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
  },
  subtitleUnderline: {
    width: 60,
    height: 3,
    borderRadius: 2,
  },

  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: relativeHeight(3),
  },
  statCard: {
    width: "48%",
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 30,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },

  toggleContainerWrapper: {
    alignItems: "center",
    marginBottom: 24,
  },
  toggleContainer: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 4,
    width: "100%",
    borderWidth: 1,
  },
  toggleButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
  },
  toggleButtonActive: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: "600",
  },

  monthGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: relativeHeight(2),
  },
  monthCard: {
    width: "48%",
    borderRadius: 16,
    paddingVertical: 20,
    marginBottom: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  monthText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  ekadashiCountContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ekadashiCountText: {
    fontSize: 13,
    marginLeft: 6,
    fontWeight: "500",
  },
  upcomingBadge: {
    marginTop: 12,
    paddingHorizontal: 16, 
    paddingVertical: 6,
    borderRadius: 20,
  },
  upcomingBadgeText: {
    fontSize: 12,
    fontWeight: "700",
  },

  listContainer: {
    marginBottom: relativeHeight(2),
  },
  listCard: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  listMoonContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  listContent: {
    flex: 1,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  listDateRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  listDate: {
    fontSize: 13,
  },
  statusBadge: {
    paddingHorizontal: 12,
    
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },

  nextEkadashiSection: {
    marginTop: 10,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  nextEkadashiCard: {
    flexDirection: "row",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    
    shadowColor: "#94A3B8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  nextEkadashiMoonContainer: {
    width: 64,
    height: 64,
    backgroundColor: "#000000", 
    borderRadius: 8, 
    alignItems: "center",
    justifyContent: "center",
    marginRight: 20,
  },
  nextEkadashiContent: {
    flex: 1,
  },
  nextEkadashiTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  nextEkadashiDate: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 8,
  },
  nextEkadashiDetails: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default EkadashiScreen;
