import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import moment from "moment";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { dw } from "../constants/Dimensions";
import { useTheme } from "../context/ThemeContext";
import { useNextEkadashi } from "../hooks/useEkadashi";
import DecorativeButton from "./DecorativeButton";
import { ThemedText } from "./ThemedText";

const NextEkadashiCard = ({ refreshCount }) => {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const { nextEkadashi, todayEkadashi: hookTodayEkadashi, loading, error, refresh } = useNextEkadashi();

  useEffect(() => {
    if (refreshCount > 0) {
      refresh();
    }
  }, [refreshCount]);
  
  const [optimisticToday, setOptimisticToday] = useState(null);

  const todayEkadashi = optimisticToday || hookTodayEkadashi;

  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    if (hookTodayEkadashi) {
      setOptimisticToday(null);
    }
  }, [hookTodayEkadashi]);

  useEffect(() => {
    const displayEkadashi = todayEkadashi || nextEkadashi;
    if (!displayEkadashi || todayEkadashi) return;

    const ekadashiDate = displayEkadashi.date || displayEkadashi.ekadashi_date;

    const updateCountdown = () => {
      const now = moment();
      const targetDate = moment(ekadashiDate);
      const diff = targetDate.diff(now);

      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        
        if (nextEkadashi && !todayEkadashi) {
          
          setOptimisticToday(nextEkadashi);
          refresh();
        }
        return;
      }

      const duration = moment.duration(diff);
      setCountdown({
        days: Math.floor(duration.asDays()),
        hours: duration.hours(),
        minutes: duration.minutes(),
        seconds: duration.seconds(),
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [nextEkadashi, todayEkadashi]);

  useEffect(() => {
    if (!todayEkadashi) return;

    const checkDayEnd = () => {
      const ekadashiDate = todayEkadashi.date || todayEkadashi.ekadashi_date;
      const endOfDay = moment(ekadashiDate).endOf("day");
      const now = moment();

      if (now.isAfter(endOfDay)) {
        setOptimisticToday(null);
        refresh(); 
      }
    };

    const interval = setInterval(checkDayEnd, 60000); 
    checkDayEnd();

    return () => clearInterval(interval);
  }, [todayEkadashi]);

  const handleBeginObservance = () => {
    const displayEkadashi = todayEkadashi || nextEkadashi;
    if (displayEkadashi) {
      const ekadashiDate =
        displayEkadashi.date || displayEkadashi.ekadashi_date;
      navigation.navigate("DayDetails", {
        ekadashi: displayEkadashi,
        date: moment(ekadashiDate).format("YYYY-MM-DD"),
      });
    }
  };

  const handleViewDetails = () => {
    const displayEkadashi = todayEkadashi || nextEkadashi;
    if (displayEkadashi) {
      const ekadashiDate =
        displayEkadashi.date || displayEkadashi.ekadashi_date;
      navigation.navigate("DayDetails", {
        ekadashi: displayEkadashi,
        date: moment(ekadashiDate).format("YYYY-MM-DD"),
      });
    }
  };

  const displayEkadashi = todayEkadashi || nextEkadashi;
  const isToday = todayEkadashi !== null;

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = moment(dateString);
    return date.format("ddd, MMM D");
  };

  const styles = getStyles(colors, isDark);

  if (loading && !todayEkadashi && !nextEkadashi) {
    return (
      <View style={styles.nextCardContainer}>
        <View style={styles.nextCardWrapper}>
          <View
            style={[
              styles.nextCardContent,
              { alignItems: "center", justifyContent: "center", padding: 40 },
            ]}
          >
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        </View>
      </View>
    );
  }

  if (error && !displayEkadashi) {
    return (
      <View style={styles.nextCardContainer}>
        <View style={styles.nextCardWrapper}>
          <View style={styles.nextCardContent}>
            <ThemedText style={styles.errorText}>
              {error || "No upcoming Ekadashi found"}
            </ThemedText>
          </View>
        </View>
      </View>
    );
  }

  const ekadashiName =
    displayEkadashi.name ||
    displayEkadashi.ekadashi_name ||
    (isToday ? "Today's Ekadashi" : "Next Ekadashi");
  const ekadashiDate = displayEkadashi.date || displayEkadashi.ekadashi_date;

  if (isToday) {
    return (
      <View style={styles.todayOuterContainer}>
        <View style={styles.todayCardWrapper}>
          <View style={styles.todayCardContent}>
            <LinearGradient
              colors={["#EF4444", "#F59E0B"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.todayBadge}
            >
              <ThemedText type="small" style={styles.todayBadgeText}>
                Today is Ekadashi!
              </ThemedText>
            </LinearGradient>

            <View style={styles.moonIconContainer}>
              <ThemedText type="heading" >🌙</ThemedText>
            </View>

            <ThemedText type="heading" style={styles.todayEkadashiName}>
              {ekadashiName}
            </ThemedText>

            <TouchableOpacity
              onPress={handleBeginObservance}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#F59E0B", "#F97316"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.observanceButton}
              >
                <ThemedText
                  type="defaultSemiBold"
                  style={styles.observanceButtonText}
                >
                  Begin Observance
                </ThemedText>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.nextCardContainer}>
      <View style={styles.nextCardWrapper}>
        <View style={styles.nextCardContent}>
          <View
            style={{
              flexDirection: "row",
              gap: 8,
            }}
          >
            <ThemedText type="small" style={styles.nextHeaderText}>
              NEXT EKADASHI
            </ThemedText>
            <LinearGradient
              colors={[isDark ? "#ffffff" : "#c4cad4ff", "transparent"]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={{
                width: dw / 2.2,
                height: 1.3,
                marginTop: 8,
              }}
            />
          </View>

          <View style={styles.nameAndDateRow}>
            <View style={styles.nameSection}>
              <ThemedText style={styles.moonIconSmall}>🌙</ThemedText>
              <ThemedText type="heading" style={styles.nextEkadashiName}>
                {ekadashiName}
              </ThemedText>
            </View>
            <ThemedText type="defaultSemiBold" style={styles.dateText}>
              {formatDate(ekadashiDate)}
            </ThemedText>
          </View>

          <View style={styles.countdownContainer}>
            <View style={styles.countdownBox}>
              <Text style={styles.countdownNumber} allowFontScaling={false}>
                {String(countdown.days).padStart(2, "0")}
              </Text>
              <ThemedText type="caption" style={styles.countdownLabel}>
                Days
              </ThemedText>
            </View>
            <View style={styles.countdownBox}>
              <Text style={styles.countdownNumber} allowFontScaling={false}>
                {String(countdown.hours).padStart(2, "0")}
              </Text>
              <ThemedText type="caption" style={styles.countdownLabel}>
                Hours
              </ThemedText>
            </View>
            <View style={styles.countdownBox}>
              <Text style={styles.countdownNumber} allowFontScaling={false}>
                {String(countdown.minutes).padStart(2, "0")}
              </Text>
              <ThemedText type="caption" style={styles.countdownLabel}>
                Minutes
              </ThemedText>
            </View>
            <View style={styles.countdownBox}>
              <Text style={styles.countdownNumber} allowFontScaling={false}>
                {String(countdown.seconds).padStart(2, "0")}
              </Text>
              <ThemedText type="caption" style={styles.countdownLabel}>
                Seconds
              </ThemedText>
            </View>
          </View>

          <DecorativeButton
            text="View Details"
            onPress={handleViewDetails}
            style={styles.viewDetailsButton}
          />
        </View>
      </View>
    </View>
  );
};

const getStyles = (colors, isDark) =>
  StyleSheet.create({
    todayOuterContainer: {
      backgroundColor: colors.card,
      borderRadius: 24,
      marginHorizontal: 15,
      marginVertical: 10,
      padding: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
    },
    todayCardWrapper: {
      backgroundColor: isDark ? colors.card : "#FFFDF8",
      borderRadius: 20,
      borderWidth: 1.5,
      borderColor: isDark ? colors.secondary : "#F9E79F",
      overflow: "visible",
    },
    todayCardContent: {
      padding: 15,
      paddingTop: 10,
      backgroundColor: "transparent",
      alignItems: "center",
    },
    todayBadge: {
      borderRadius: 30,
      paddingVertical: 6,
      paddingHorizontal: 20,
      marginTop: -20,
      marginBottom: 10,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
      elevation: 5,
    },
    todayBadgeText: {
      color: "#FFFFFF",
    },
    moonIconContainer: {
      backgroundColor: isDark ? colors.muted : "#FEF3C7",
      borderRadius: 60,
      borderWidth: 1,
      borderColor: isDark ? colors.secondary : "#FDE68A",
      width: 55,
      height: 55,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 15,
    },
    todayEkadashiName: {
      color: isDark ? colors.foreground : "#7C2D12",
      textAlign: "center",
      marginBottom: 15,
    },
    observanceButton: {
      borderRadius: 10,
      paddingVertical: '3%',
      paddingHorizontal: '25%',
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 6,
      elevation: 4,
    },
    observanceButtonText: {
      color: "#FFFFFF",
      fontSize: 15,
    },

    nextCardContainer: {
      backgroundColor: colors.lightBlueBg,
      borderRadius: 15,
      marginHorizontal: 15,
      marginVertical: 10,
      padding: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 0.5,
    },
    nextCardWrapper: {
      backgroundColor: colors.card,
      borderRadius: 15,
      overflow: "hidden",
    },
    nextCardContent: {
      padding: 16,
      backgroundColor: colors.card,
    },
    nextHeaderText: {
      fontSize: 14,
      color: colors.mutedForeground,
      letterSpacing: 1.5,
      marginBottom: 12,
    },
    nameAndDateRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    nameSection: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    moonIconSmall: {
      fontSize: 20,
      marginRight: 12,
    },
    nextEkadashiName: {
      fontSize: 19,
      color: colors.foreground,
      flex: 1,
    },
    dateText: {
      fontSize: 14,
      color: colors.foreground,
    },
    countdownContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 20,
      gap: 8,
    },
    countdownBox: {
      flex: 1,
      backgroundColor: isDark ? colors.background : "#F8F9FA",
      borderRadius: 16,
      paddingVertical: 12,
      paddingHorizontal: 4,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: isDark ? colors.border : "#E9ECEF",
    },
    countdownNumber: {
      fontSize: 25,
      fontWeight: "500",
      color: colors.primary,
      marginBottom: 2,
    },
    countdownLabel: {
      fontSize: 12,
      color: colors.mutedForeground,
    },
    viewDetailsButton: {
      marginTop: 10,
    },
    viewDetailsButtonText: {
      color: "#FFFFFF",
      fontSize: 15,
    },

    errorText: {
      fontSize: 14,
      color: colors.destructive,
      textAlign: "center",
      padding: 20,
    },
  });

export default NextEkadashiCard;
