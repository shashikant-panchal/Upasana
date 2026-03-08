import {
  Feather,
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import moment from "moment";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelector } from "react-redux";
import { dh, dw } from "../constants/Dimensions";
import { useTheme } from "../context/ThemeContext";
import { usePanchang } from "../hooks/usePanchang";
import CalendarModal from "./CalendarModal";
import { ThemedText } from "./ThemedText";

const PanchangCard = ({ refreshCount }) => {
  const { colors, isDark } = useTheme();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  const { panchangData, loading, error, refreshData } =
    usePanchang(selectedDate);

  useEffect(() => {
    if (refreshCount > 0) {
      refreshData && refreshData();
    }
  }, [refreshCount]);

  const { city } = useSelector((state) => state.location);

  const handleRefresh = () => {
    refreshData && refreshData();
  };

  const isToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <TouchableOpacity onPress={() => setIsCalendarVisible(true)}>
          <Ionicons
            name="moon-outline"
            size={dw * 0.045}
            color={colors.foreground}
          />
        </TouchableOpacity>
        <View style={{ marginLeft: dw * 0.012 }}>
          <TouchableOpacity
            onPress={() => setIsCalendarVisible(true)}
            style={{ flexDirection: 'row', alignItems: 'center' }}
          >
            <ThemedText
              type="defaultSemiBold"
              style={[styles.headerTitle, { color: colors.foreground }]}
            >
              {isToday(selectedDate)
                ? "Today's Panchang"
                : moment(selectedDate).format("DD MMM YYYY")}
            </ThemedText>
            <Ionicons
              name="chevron-down"
              size={14}
              color={colors.mutedForeground}
              style={{ marginLeft: 3 }}
            />
          </TouchableOpacity>
        </View>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        {!isToday(selectedDate) && (
          <TouchableOpacity
            onPress={() => setSelectedDate(new Date())}
            style={styles.todayButton}
          >
            <ThemedText style={styles.todayButtonText}>Today</ThemedText>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={handleRefresh}>
          <Ionicons
            name="refresh-outline"
            size={dw * 0.045}
            color={colors.foreground}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    if (typeof timeString === "string") {
      if (timeString.includes(":")) {
        return timeString.split(" ")[0];
      }
      return moment(timeString).format("HH:mm");
    }
    return "N/A";
  };

  const getTithi = () => {
    if (!panchangData) return "N/A";
    return (
      panchangData.tithi ||
      panchangData.tithi?.name ||
      panchangData.tithi?.details?.tithi_name ||
      panchangData.tithi_name ||
      "N/A"
    );
  };

  const getLocation = () => {
    if (!panchangData) return "N/A";
    return (
      panchangData.location ||
      (panchangData.latitude && panchangData.longitude
        ? `${panchangData.latitude.toFixed(1)}°, ${panchangData.longitude.toFixed(1)}°`
        : "N/A")
    );
  };

  const getSunrise = () => {
    if (!panchangData) return "N/A";
    return (
      panchangData.sunrise ||
      formatTime(panchangData.sunrise_time || panchangData.suryoday) ||
      "N/A"
    );
  };

  const getSunset = () => {
    if (!panchangData) return "N/A";
    return (
      panchangData.sunset ||
      formatTime(panchangData.sunset_time || panchangData.suryast) ||
      "N/A"
    );
  };

  const getMoonrise = () => {
    if (!panchangData) return "N/A";
    return (
      panchangData.moonrise ||
      formatTime(panchangData.moonrise_time || panchangData.chandroday) ||
      "N/A"
    );
  };

  const getNakshatra = () => {
    if (!panchangData) return "N/A";
    return (
      panchangData.nakshatra ||
      panchangData.nakshatra?.name ||
      panchangData.nakshatra_name ||
      "N/A"
    );
  };

  const getYoga = () => {
    if (!panchangData) return "N/A";
    return (
      panchangData.yoga ||
      panchangData.yoga?.name ||
      panchangData.yoga_name ||
      "N/A"
    );
  };

  const getRitu = () => {
    if (!panchangData) return "N/A";
    return (
      panchangData.ritu ||
      panchangData.ritu?.name ||
      panchangData.ritu_name ||
      "N/A"
    );
  };

  const renderInfoCard = (label, value, bgColor, align = "flex-start") => (
    <View
      style={[
        styles.smallCard,
        {
          backgroundColor: isDark ? colors.muted : bgColor,
          alignItems: align,
          borderWidth: 0.5,
          borderColor: isDark ? colors.border : 'rgba(0,0,0,0.05)'
        },
      ]}
    >
      <ThemedText
        type="defaultSemiBold"
        style={[styles.label, { color: colors.mutedForeground }]}
      >
        {label}
      </ThemedText>
      <ThemedText
        type="defaultSemiBold"
        style={[styles.value, { color: colors.foreground }]}
      >
        {value}
      </ThemedText>
    </View>
  );

  const renderIconCard = (
    icon,
    iconType,
    label,
    value,
    bgColor,
    iconBgColor,
    iconColor
  ) => (
    <View
      style={[
        styles.smallCard,
        styles.rowAlign,
        {
          backgroundColor: isDark ? colors.muted : bgColor,
          borderWidth: 0.5,
          borderColor: isDark ? colors.border : 'rgba(0,0,0,0.05)'
        },
      ]}
    >
      <View
        style={[
          styles.iconBackground,
          {
            backgroundColor: isDark
              ? colors.lightBlueBg
              : iconBgColor || colors.muted,
          },
        ]}
      >
        {iconType === "fa5" && (
          <FontAwesome5
            name={icon}
            size={dw * 0.04}
            color={isDark ? colors.primary : iconColor}
          />
        )}
        {iconType === "mc" && (
          <MaterialCommunityIcons
            name={icon}
            size={dw * 0.045}
            color={isDark ? colors.secondary : iconColor}
          />
        )}
        {iconType === "ion" && (
          <Ionicons
            name={icon}
            size={dw * 0.04}
            color={isDark ? colors.primary : iconColor}
          />
        )}
        {iconType === "feather" && (
          <Feather
            name={icon}
            size={dw * 0.04}
            color={isDark ? colors.primary : iconColor}
          />
        )}
      </View>
      <View style={styles.iconTextContainer}>
        <ThemedText
          style={[styles.subLabel, { color: colors.mutedForeground }]}
        >
          {label}
        </ThemedText>
        <ThemedText
          type="defaultSemiBold"
          style={[styles.value, { color: colors.foreground, marginTop: 0 }]}
        >
          {value}
        </ThemedText>
      </View>
    </View>
  );

  const renderBottomCard = (label, value, bgColor) => (
    <View
      style={[
        styles.bottomCard,
        {
          backgroundColor: isDark ? colors.muted : bgColor,
          borderWidth: 0.5,
          borderColor: isDark ? colors.border : 'rgba(0,0,0,0.05)'
        },
      ]}
    >
      <ThemedText style={[styles.subLabel, { color: colors.mutedForeground, fontSize: dw * 0.03 }]}>
        {label}
      </ThemedText>
      <ThemedText
        type="defaultSemiBold"
        style={[styles.value, { color: colors.foreground, fontSize: dw * 0.032 }]}
        numberOfLines={1}
      >
        {value}
      </ThemedText>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        {renderHeader()}
        <View style={{ padding: 20, alignItems: "center" }}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
        <CalendarModal
          visible={isCalendarVisible}
          onClose={() => setIsCalendarVisible(false)}
          onDateSelect={handleDateSelect}
          selectedDate={selectedDate}
        />
      </View>
    );
  }

  if (error || !panchangData) {
    return (
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        {renderHeader()}
        <View style={{ padding: 15, alignItems: "center" }}>
          <ThemedText style={{ color: colors.destructive, fontSize: 12 }}>
            {error || "Failed to load Panchang data"}
          </ThemedText>
        </View>
        <CalendarModal
          visible={isCalendarVisible}
          onClose={() => setIsCalendarVisible(false)}
          onDateSelect={handleDateSelect}
          selectedDate={selectedDate}
        />
      </View>
    );
  }

  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      {renderHeader()}

      <View style={styles.row}>
        {renderInfoCard("TITHI", getTithi(), "#E8F0FB")}
        {renderInfoCard("LOCATION", city ? city : getLocation(), "#E8F0FB")}
      </View>

      <View style={styles.row}>
        {renderIconCard(
          "sunrise",
          "feather",
          "Sunrise",
          getSunrise(),
          "#F1F6FE",
          null,
          colors.foreground
        )}
        {renderIconCard(
          "weather-sunset-down",
          "mc",
          "Sunset",
          getSunset(),
          "#FFF7E5",
          "#FEFCEB",
          "#FAE013"
        )}
      </View>

      <View
        style={[
          styles.fullCard,
          {
            backgroundColor: isDark ? colors.muted : "#F1F6FE",
            borderWidth: 0.5,
            borderColor: isDark ? colors.border : 'rgba(0,0,0,0.05)'
          },
        ]}
      >
        <View
          style={[
            styles.iconBackground,
            { backgroundColor: colors.lightBlueBg, padding: 6 },
          ]}
        >
          <Ionicons name="moon" size={dw * 0.04} color={colors.primary} />
        </View>
        <View style={styles.iconTextContainer}>
          <ThemedText
            style={[styles.subLabel, { color: colors.mutedForeground }]}
          >
            Moonrise
          </ThemedText>
          <ThemedText
            type="defaultSemiBold"
            style={[styles.value, { color: colors.foreground, marginTop: 0 }]}
          >
            {getMoonrise()}
          </ThemedText>
        </View>
      </View>

      <LinearGradient
        colors={["transparent", colors.mutedForeground, "transparent"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0.2 }}
        style={{ height: 1, marginVertical: 10, width: "100%", alignSelf: 'center' }}
      />

      <View style={styles.row}>
        {renderBottomCard("Nakshatra", getNakshatra(), "#DAE7DA")}
        {renderBottomCard("Yoga", getYoga(), "#E0D1F0")}
        {renderBottomCard("Ritu", getRitu(), "#D1E6F0")}
      </View>

      {(panchangData.samvatsara || panchangData.masa) && (
        <View style={[styles.row, { marginTop: 6 }]}>
          {panchangData.samvatsara && renderBottomCard("Samvatsara", panchangData.samvatsara, "#F1F5F9")}
          {panchangData.masa && renderBottomCard("Masa", panchangData.masa, "#F8FAFC")}
        </View>
      )}

      <CalendarModal
        visible={isCalendarVisible}
        onClose={() => setIsCalendarVisible(false)}
        onDateSelect={handleDateSelect}
        selectedDate={selectedDate}
      />
    </View>
  );
};

export default PanchangCard;

const styles = StyleSheet.create({
  card: {
    borderRadius: dw * 0.02,
    padding: dw * 0.06,
    marginHorizontal: 15,
    marginVertical: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: dh * 0.008,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: dw * 0.038,
  },
  todayButton: {
    paddingHorizontal: 20,
    paddingVertical: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 8,
  },
  todayButtonText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#334155'
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: dh * 0.006,
    gap: 10,
  },
  smallCard: {
    flex: 1,
    borderRadius: dw * 0.02,
    paddingVertical: dh * 0.012,
    paddingHorizontal: dw * 0.04,
  },
  fullCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: dw * 0.02,
    paddingVertical: dh * 0.015,
    marginVertical: dh * 0.008,
  },
  bottomCard: {
    flex: 1,
    borderRadius: dw * 0.02,
    paddingVertical: dh * 0.01,
    alignItems: "center",
  },
  label: {
    fontSize: dw * 0.028,
  },
  subLabel: {
    fontSize: dw * 0.03,
  },
  value: {
    fontSize: dw * 0.032,
    padding: 2,
    textAlign: "center",
  },
  iconBackground: {
    borderRadius: 8,
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  iconTextContainer: {
    marginLeft: dw * 0.02,
  },
  rowAlign: {
    flexDirection: "row",
    alignItems: "center",
  },
});