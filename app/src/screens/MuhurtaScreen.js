import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import moment from "moment";
import {
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "../components/ThemedText";
import { useTheme } from "../context/ThemeContext";

const MuhurtaScreen = ({ navigation }) => {
    const { colors, isDark } = useTheme();
    const today = moment();

    const muhurtaData = {
        tithi: "Ekadashi",
        paksha: "Shukla Paksha",
        nakshatra: "Rohini",
        yoga: "Harshana",
        karana: "Vanija",
        sunrise: "06:12 AM",
        sunset: "06:45 PM",
        moonrise: "03:24 PM",
        moonset: "04:12 AM",
        rahukaal: "04:30 PM - 06:00 PM",
        gulika: "03:00 PM - 04:30 PM",
        yamaganda: "09:00 AM - 10:30 AM",
        abhijit: "11:45 AM - 12:30 PM"
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Feather name="arrow-left" size={24} color={colors.mutedForeground} />
                </TouchableOpacity>
                <View style={styles.headerText}>
                    <ThemedText type="subtitle" style={{ color: colors.foreground }}>Day Checker</ThemedText>
                    <ThemedText type="small" style={{ color: colors.mutedForeground }}>मुहूर्त · Daily Panchang</ThemedText>
                </View>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {}
                <View style={[styles.dateCard, { backgroundColor: colors.primary + "10", borderColor: colors.primary + "30" }]}>
                    <ThemedText type="defaultSemiBold" style={{ color: colors.primary, fontSize: 18 }}>
                        {today.format("dddd, MMMM Do YYYY")}
                    </ThemedText>
                    <ThemedText type="small" style={{ color: colors.mutedForeground, marginTop: 4 }}>
                        Auspicious Day for Spiritual Practices
                    </ThemedText>
                </View>

                {}
                <View style={styles.grid}>
                    <View style={[styles.infoBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <MaterialCommunityIcons name="moon-waxing-crescent" size={24} color={colors.primary} />
                        <ThemedText type="small" style={styles.label}>Tithi</ThemedText>
                        <ThemedText type="defaultSemiBold">{muhurtaData.tithi}</ThemedText>
                        <ThemedText type="tiny" style={{ color: colors.mutedForeground }}>{muhurtaData.paksha}</ThemedText>
                    </View>
                    <View style={[styles.infoBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Ionicons name="sparkles" size={24} color="#EAB308" />
                        <ThemedText type="small" style={styles.label}>Nakshatra</ThemedText>
                        <ThemedText type="defaultSemiBold">{muhurtaData.nakshatra}</ThemedText>
                        <ThemedText type="tiny" style={{ color: colors.mutedForeground }}>Star Constellation</ThemedText>
                    </View>
                </View>

                {}
                <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={styles.sectionHeader}>
                        <Feather name="sun" size={18} color="#F59E0B" />
                        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Sun & Moon Timings</ThemedText>
                    </View>
                    <View style={styles.timeRow}>
                        <View style={styles.timeItem}>
                            <ThemedText type="small" style={styles.timeLabel}>Sunrise</ThemedText>
                            <ThemedText type="defaultSemiBold">{muhurtaData.sunrise}</ThemedText>
                        </View>
                        <View style={styles.timeItem}>
                            <ThemedText type="small" style={styles.timeLabel}>Sunset</ThemedText>
                            <ThemedText type="defaultSemiBold">{muhurtaData.sunset}</ThemedText>
                        </View>
                    </View>
                    <View style={[styles.divider, { backgroundColor: colors.border }]} />
                    <View style={styles.timeRow}>
                        <View style={styles.timeItem}>
                            <ThemedText type="small" style={styles.timeLabel}>Moonrise</ThemedText>
                            <ThemedText type="defaultSemiBold">{muhurtaData.moonrise}</ThemedText>
                        </View>
                        <View style={styles.timeItem}>
                            <ThemedText type="small" style={styles.timeLabel}>Moonset</ThemedText>
                            <ThemedText type="defaultSemiBold">{muhurtaData.moonset}</ThemedText>
                        </View>
                    </View>
                </View>

                {}
                <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={styles.sectionHeader}>
                        <Feather name="clock" size={18} color={colors.primary} />
                        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Important Muhurtas</ThemedText>
                    </View>

                    <View style={styles.muhurtaItem}>
                        <View style={[styles.muhurtaIcon, { backgroundColor: "#22c55e15" }]}>
                            <Feather name="check" size={16} color="#22c55e" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <ThemedText type="defaultSemiBold">Abhijit Muhurta</ThemedText>
                            <ThemedText type="small" style={{ color: colors.mutedForeground }}>Most Auspicious Time</ThemedText>
                        </View>
                        <ThemedText type="defaultSemiBold" style={{ color: "#22c55e" }}>{muhurtaData.abhijit}</ThemedText>
                    </View>

                    <View style={styles.muhurtaItem}>
                        <View style={[styles.muhurtaIcon, { backgroundColor: "#ef444415" }]}>
                            <Feather name="x" size={16} color="#ef4444" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <ThemedText type="defaultSemiBold">Rahu Kaal</ThemedText>
                            <ThemedText type="small" style={{ color: colors.mutedForeground }}>Unfavorable Period</ThemedText>
                        </View>
                        <ThemedText type="defaultSemiBold" style={{ color: "#ef4444" }}>{muhurtaData.rahukaal}</ThemedText>
                    </View>
                </View>

                <View style={styles.footer}>
                    <ThemedText type="tiny" style={{ color: colors.mutedForeground, textAlign: "center" }}>
                        Timings are calculated based on your local timezone.{"\n"}
                        Consult a Vedic priest for specific ritual timings.
                    </ThemedText>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButton: {
        padding: 8,
    },
    headerText: {
        alignItems: "center",
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    dateCard: {
        padding: 20,
        borderRadius: 24,
        borderWidth: 1,
        marginBottom: 20,
        marginTop: 10,
        alignItems: "center",
    },
    grid: {
        flexDirection: "row",
        gap: 16,
        marginBottom: 20,
    },
    infoBox: {
        flex: 1,
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    label: {
        marginTop: 12,
        marginBottom: 4,
        opacity: 0.6,
    },
    section: {
        padding: 20,
        borderRadius: 24,
        borderWidth: 1,
        marginBottom: 20,
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
    },
    timeRow: {
        flexDirection: "row",
        justifyContent: "space-around",
    },
    timeItem: {
        alignItems: "center",
    },
    timeLabel: {
        marginBottom: 6,
        opacity: 0.6,
    },
    divider: {
        height: 1,
        marginVertical: 16,
        opacity: 0.5,
    },
    muhurtaItem: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
    },
    muhurtaIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 16,
    },
    footer: {
        marginTop: 20,
        paddingVertical: 20,
    }
});

export default MuhurtaScreen;
