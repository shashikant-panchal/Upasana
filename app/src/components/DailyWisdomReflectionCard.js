import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";
import { dh, dw } from "../constants/Dimensions";
import { useTheme } from "../context/ThemeContext";
import { ThemedText } from "./ThemedText";

const DailyWisdomReflectionCard = ({
  reflectionText,
  timeOfDay = "evening",
}) => {
  const { colors, isDark } = useTheme();
  const isMorning = timeOfDay === "morning";
  const title = isMorning ? "Morning Inspiration" : "Evening Reflection";
  const iconName = isMorning ? "sunny-outline" : "moon-outline";
  const defaultText = isMorning
    ? "Begin your day with the holy names on your lips and Krishna in your heart"
    : "Evening is the perfect time to reflect on Krishna presence in every moment";

  return (
    <View style={[styles.reflectionCard, { backgroundColor: colors.card }]}>
      <View
        style={[
          styles.reflectionIconContainer,
          { backgroundColor: colors.lightBlueBg },
        ]}
      >
        <Ionicons name={iconName} size={24} color={colors.primary} />
      </View>
      <View style={styles.reflectionContent}>
        <ThemedText
          type="defaultSemiBold"
          style={[styles.reflectionTitle, { color: colors.foreground }]}
        >
          {title}
        </ThemedText>
        <ThemedText
          style={[styles.reflectionDescription, { color: colors.foreground }]}
        >
          {reflectionText || defaultText}
        </ThemedText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  reflectionCard: {
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  reflectionIconContainer: {
    width: dw / 10,
    height: dh / 20,
    alignSelf: "flex-start",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  reflectionContent: {
    flex: 1,
  },
  reflectionTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  reflectionDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default DailyWisdomReflectionCard;
