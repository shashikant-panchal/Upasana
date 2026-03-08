import { Feather, Ionicons } from "@expo/vector-icons";
import { useScrollToTop } from "@react-navigation/native";
import moment from "moment";
import { useMemo, useRef, useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "../components/ThemedText";
import { DarkTheme, LightTheme } from "../constants/Colors";
import { useTheme } from "../context/ThemeContext";
import { getEkadashiByMonth } from "../data/ekadashiData";
import { getMoonPhasesByMonth } from "../data/moonPhaseData";
import { getFestivalsByMonth } from "../utils/hinduFestivals";

const WINDOW_WIDTH = Dimensions.get("window").width;
const relativeWidth = (percentage) => WINDOW_WIDTH * (percentage / 100);

const DAYS = ["S", "M", "T", "W", "T", "F", "S"];

const SummaryChip = ({ icon, label, count, color, bg, borderColor, isDark, themeColors }) => (
  <View style={[
    styles.summaryChip,
    {
      backgroundColor: isDark ? themeColors.card : bg,
      borderColor: isDark ? themeColors.border : borderColor
    }
  ]}>
    {icon}
    <ThemedText style={[styles.summaryChipText, { color: isDark ? themeColors.foreground : color }]}>
      <ThemedText style={{ fontWeight: 'bold', color: isDark ? themeColors.primary : color }}>{count}</ThemedText> {label}
    </ThemedText>
  </View>
);

const SectionHeader = ({ icon, title, color, isDark, themeColors }) => (
  <View style={styles.sectionHeader}>
    {icon}
    <ThemedText style={[styles.sectionTitle, { color: isDark ? themeColors.foreground : '#052962' }]}>{title}</ThemedText>
  </View>
);

const DateCell = ({ date, isEkadashi, isToday, isFestival, isMoon, colors, isDark }) => {
  if (!date) return <View style={styles.dateCell} />;

  let containerStyle = [styles.dateCell];
  let textStyle = [styles.dateCellText, { color: colors.foreground }];
  let dot = null;

  if (isToday) {
    containerStyle.push({ backgroundColor: colors.primary, borderRadius: 12 });
    textStyle.push({ color: colors.primaryForeground, fontWeight: 'bold' });
  } else {
    if (isEkadashi) {
      containerStyle.push({ backgroundColor: isDark ? '#3A1D1D' : '#FFF5F5' }); 
      dot = <View style={[styles.dot, { backgroundColor: '#EF4444' }]} />;
    } else if (isFestival) {
      containerStyle.push({ backgroundColor: isDark ? '#3A2E0E' : '#FEFCE8' }); 
      dot = <View style={[styles.dot, { backgroundColor: '#EAB308' }]} />;
    } else if (isMoon) {
      dot = <View style={[styles.dot, { backgroundColor: isDark ? '#64748B' : '#9CA3AF' }]} />;
    }
  }

  return (
    <View style={containerStyle}>
      <ThemedText style={textStyle}>{date}</ThemedText>
      {dot}
    </View>
  );
};

const CalendarScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const scrollRef = useRef(null);
  useScrollToTop(scrollRef);
  const [currentDate, setCurrentDate] = useState(moment());

  const currentMonth = currentDate.month();
  const currentYear = currentDate.year();

  const monthEkadashis = useMemo(() => getEkadashiByMonth(currentMonth).sort((a, b) => a.date - b.date), [currentMonth]);
  const ekadashiDates = useMemo(() => monthEkadashis.map(e => e.date.getDate().toString()), [monthEkadashis]);

  const festivals = useMemo(() => getFestivalsByMonth(currentMonth, currentYear).sort((a, b) => a.date.getTime() - b.date.getTime()), [currentMonth, currentYear]);
  const festivalDates = useMemo(() => festivals.map(f => new Date(f.date).getDate().toString()), [festivals]);

  const moonPhases = useMemo(() => getMoonPhasesByMonth(currentMonth, currentYear), [currentMonth, currentYear]);
  const moonDates = useMemo(() => moonPhases.map(m => m.date.date().toString()), [moonPhases]);

  const startOfMonth = currentDate.clone().startOf("month");
  const endOfMonth = currentDate.clone().endOf("month");
  const startDayOfWeek = startOfMonth.day();

  const calendarGrid = [];
  let week = Array(startDayOfWeek).fill("");
  let day = startOfMonth.clone();

  while (day.isSameOrBefore(endOfMonth)) {
    week.push(day.date().toString());
    if (week.length === 7) {
      calendarGrid.push(week);
      week = [];
    }
    day.add(1, "day");
  }
  if (week.length > 0) {
    while (week.length < 7) week.push("");
    calendarGrid.push(week);
  }

  const todayDate = moment().date().toString();
  const isCurrentMonth = currentDate.isSame(moment(), 'month');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => setCurrentDate(d => d.clone().subtract(1, 'M'))}>
          <Ionicons name="chevron-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <View style={{ alignItems: 'center' }}>
          <ThemedText style={[styles.headerMonth, { color: colors.foreground }]}>{currentDate.format("MMMM YYYY")}</ThemedText>
          <ThemedText style={[styles.headerSubtitle, { color: colors.primary }]}>Today</ThemedText>
        </View>
        <TouchableOpacity onPress={() => setCurrentDate(d => d.clone().add(1, 'M'))}>
          <Ionicons name="chevron-forward" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: '20%' }}>

        {}
        <View style={styles.chipsContainer}>
          <SummaryChip
            icon={<Feather name="moon" size={12} color="#EF4444" />}
            count={monthEkadashis.length}
            label="Ekadashi"
            color="#EF4444"
            bg="#FEF2F2"
            borderColor="#FECACA"
            isDark={isDark}
            themeColors={colors}
          />
          <SummaryChip
            icon={<Feather name="sun" size={12} color="#D97706" />}
            count={festivals.length}
            label="Festivals"
            color="#D97706"
            bg="#FFFBEB"
            borderColor="#FDE68A"
            isDark={isDark}
            themeColors={colors}
          />
          <SummaryChip
            icon={<Feather name="circle" size={12} color="#4F46E5" />}
            count={moonPhases.length}
            label="Moon Phases"
            color="#4F46E5"
            bg="#EEF2FF"
            borderColor="#C7D2FE"
            isDark={isDark}
            themeColors={colors}
          />
        </View>

        {}
        <View style={[styles.calendarCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.daysHeader}>
            {DAYS.map((d, i) => <ThemedText key={i} style={[styles.dayText, { color: colors.mutedForeground }]}>{d}</ThemedText>)}
          </View>
          {calendarGrid.map((week, i) => (
            <View key={i} style={styles.weekRow}>
              {week.map((date, j) => (
                <DateCell
                  key={j}
                  date={date}
                  isToday={isCurrentMonth && date === todayDate}
                  isEkadashi={ekadashiDates.includes(date)}
                  isFestival={festivalDates.includes(date)}
                  isMoon={moonDates.includes(date)}
                  colors={colors}
                  isDark={isDark}
                />
              ))}
            </View>
          ))}

          {}
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: colors.primary }]} /><ThemedText style={[styles.legendText, { color: colors.mutedForeground }]}>Today</ThemedText></View>
            <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#FCA5A5' }]} /><ThemedText style={[styles.legendText, { color: colors.mutedForeground }]}>Ekadashi</ThemedText></View>
            <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#FCD34D' }]} /><ThemedText style={[styles.legendText, { color: colors.mutedForeground }]}>Festival</ThemedText></View>
            <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: isDark ? '#64748B' : '#CBD5E1' }]} /><ThemedText style={[styles.legendText, { color: colors.mutedForeground }]}>Moon</ThemedText></View>
          </View>
        </View>

        {}
        <View style={[styles.sectionContainer, { backgroundColor: isDark ? DarkTheme.background : LightTheme.primaryForeground, borderColor: isDark ? DarkTheme.border : LightTheme.border }]}>
          <SectionHeader
            icon={<Feather name="moon" size={20} color="#EF4444" />}
            title="Ekadashi Observances"
            isDark={isDark}
            themeColors={colors}
          />
          {monthEkadashis.map((item, index) => (
            <TouchableWithoutFeedback
              key={index}
              onPress={() => navigation.navigate('DayDetails', { ekadashi: item, date: moment(item.date).format('YYYY-MM-DD') })}
            >
              <View style={[
                styles.card,
                {
                  backgroundColor: isDark ? colors.card : '#FFF5F5',
                  borderColor: isDark ? colors.border : '#FECACA'
                }
              ]}>
                <View style={[styles.iconBox, { backgroundColor: '#111' }]}>
                  <Ionicons name="moon" size={20} color="#FFF" />
                </View>
                <View style={styles.cardContent}>
                  <ThemedText style={[styles.cardTitle, { color: colors.foreground }]}>{item.name}</ThemedText>
                  <ThemedText style={[styles.cardSubtitle, { color: colors.mutedForeground }]}>{moment(item.date).format("ddd, MMM D")}</ThemedText>
                </View>
                <View style={[
                  styles.pill,
                  {
                    borderColor: '#FCA5A5',
                    backgroundColor: isDark ? '#3A1D1D' : '#FFF'
                  }
                ]}>
                  <ThemedText style={[styles.pillText, { color: '#EF4444' }]}>{item.paksha}</ThemedText>
                </View>
              </View>
            </TouchableWithoutFeedback>
          ))}
        </View>

        {}
        <View style={[styles.sectionContainer, { backgroundColor: isDark ? DarkTheme.background : LightTheme.primaryForeground, borderColor: isDark ? DarkTheme.border : LightTheme.border }]}>
          <SectionHeader
            icon={<Feather name="star" size={20} color="#D97706" />}
            title="Hindu Festivals"
            isDark={isDark}
            themeColors={colors}
          />
          {festivals.map((item, index) => (
            <View key={index} style={[
              styles.card,
              {
                backgroundColor: isDark ? colors.card : '#FFFBEB',
                borderColor: isDark ? colors.border : '#FDE68A'
              }
            ]}>
              <View style={[styles.iconCircle, { backgroundColor: isDark ? '#3A2E0E' : '#FEF3C7' }]}>
                <Feather name="star" size={18} color="#D97706" />
              </View>
              <View style={styles.cardContent}>
                <ThemedText style={[styles.cardTitle, { color: colors.foreground }]}>{item.name}</ThemedText>
                <ThemedText style={[styles.cardSubtitle, { color: colors.mutedForeground }]}>{moment(item.date).format("ddd, MMM D")} • {item.deity}</ThemedText>
              </View>
              <View style={[styles.pill, { backgroundColor: item.type === 'regional' ? '#14B8A6' : '#F59E0B', borderWidth: 0 }]}>
                <ThemedText style={[styles.pillText, { color: '#FFF' }]}>{item.type}</ThemedText>
              </View>
            </View>
          ))}
          {festivals.length === 0 && (
            <ThemedText style={[styles.cardSubtitle, { textAlign: 'center', marginTop: 10, color: colors.mutedForeground }]}>No festivals this month</ThemedText>
          )}
        </View>

        {}
        <View style={[styles.sectionContainer, { backgroundColor: isDark ? DarkTheme.background : LightTheme.primaryForeground, borderColor: isDark ? DarkTheme.border : LightTheme.border }]}>
          <SectionHeader
            icon={<View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: '#D4AF37' }} />}
            title="Moon Phases"
            isDark={isDark}
            themeColors={colors}
          />
          {moonPhases.map((item, index) => (
            <View key={index} style={[
              styles.card,
              {
                backgroundColor: isDark ? DarkTheme.card : LightTheme.card,
                borderColor: isDark ? DarkTheme.border : LightTheme.border
              }
            ]}>
              <View style={[styles.iconBox, { backgroundColor: isDark ? colors.muted : '#F1F5F9' }]}>
                {item.phase === 'full'
                  ? <Ionicons name="moon" size={20} color={colors.mutedForeground} />
                  : <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: isDark ? '#FFF' : '#000' }} />
                }
              </View>
              <View style={styles.cardContent}>
                <ThemedText style={[styles.cardTitle, { color: colors.foreground }]}>{item.name}</ThemedText>
                <ThemedText style={[styles.cardSubtitle, { color: colors.mutedForeground }]}>{item.date.format("ddd, MMM D")}</ThemedText>
              </View>
              <View style={[styles.pill, { borderColor: colors.border, backgroundColor: isDark ? colors.card : '#FFF' }]}>
                <ThemedText style={[styles.pillText, { color: colors.mutedForeground }]}>{item.type}</ThemedText>
              </View>
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, 
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  headerMonth: { fontSize: 18, fontWeight: 'bold' },
  headerSubtitle: { fontSize: 13 },

  chipsContainer: { flexDirection: 'row', justifyContent: 'center', gap: 10, paddingVertical: 16 },
  summaryChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, gap: 6 },
  summaryChipText: { fontSize: 12, fontWeight: '500' },

  calendarCard: { marginHorizontal: 16, borderRadius: 20, padding: 16, borderWidth: 1, marginBottom: 20 },
  daysHeader: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10 },
  dayText: { fontWeight: '600', width: 32, textAlign: 'center' },
  weekRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 12 },

  dateCell: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
  dateCellText: { fontSize: 15, fontWeight: '500' },
  dot: { width: 5, height: 5, borderRadius: 3, marginTop: 2 },

  legendContainer: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 12 },

  sectionContainer: { marginTop: 10, paddingHorizontal: 16, marginBottom: 10, marginHorizontal: 10, paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700' },

  card: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 10 },
  iconBox: { width: 40, height: 40, borderRadius: 4, alignItems: 'center', justifyContent: 'center' },
  iconCircle: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  cardContent: { flex: 1, marginLeft: 12 },
  cardTitle: { fontSize: 16, fontWeight: '600', marginBottom: 2 },
  cardSubtitle: { fontSize: 13 },
  pill: { paddingHorizontal: 10, paddingVertical: 0, borderRadius: 12, borderWidth: 1, borderColor: 'transparent' },
  pillText: { fontSize: 11, fontWeight: '600' }
});

export default CalendarScreen;
