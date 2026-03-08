import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState } from "react";
import {
    Dimensions,
    ScrollView,
    StatusBar,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { ThemedText } from "../../components/ThemedText";
import { useTheme } from "../../context/ThemeContext";

const { width } = Dimensions.get("window");

const dailyWisdoms = [
    {
        sanskrit: "हरे कृष्ण हरे कृष्ण कृष्ण कृष्ण हरे हरे",
        transliteration: "Hare Krishna Hare Krishna Krishna Krishna Hare Hare",
        english:
            "Chanting the holy names purifies the heart and connects us with the divine consciousness",
        verse: "Bhagavad Gita 7.7",
        type: "mantra",
        mood: "devotional",
    },
    {
        sanskrit: "सर्वधर्मान्परित्यज्य मामेकं शरणं व्रज",
        transliteration: "Sarva-dharman parityajya mam ekam saranam vraja",
        english:
            "Abandon all varieties of religion and just surrender unto Me. I shall deliver you from all sinful reactions.",
        verse: "Bhagavad Gita 18.66",
        type: "shloka",
        mood: "surrender",
    },
    {
        sanskrit: "धृतराष्ट्र उवाच | धर्मक्षेत्रे कुरुक्षेत्रे समवेता युयुत्सवः | मामकाः पाण्डवाश्चैव किमकुर्वत सञ्जय ||",
        transliteration: "dhṛtarāṣṭra uvāca | dharma-kṣetre kuru-kṣetre samavetā yuyutsavaḥ | māmakāḥ pāṇḍavāś caiva kim akurvata sañjaya ||",
        english: "\"Dhritararashtra said: O Sanjaya, after my sons and the sons of Pandu assembled in the place of pilgrimage at Kurukshetra, desiring to fight, what did they do?\"",
        verse: "Chapter 1, Verse 1",
        type: "shloka",
        mood: "inquiry"
    }
];

export default function DailyWisdomScreen({ navigation }) {
    const { colors, isDark } = useTheme();

    const [currentWisdom, setCurrentWisdom] = useState(2);
    const { session } = useSelector((state) => state.user);

    const wisdom = dailyWisdoms[currentWisdom];

    const completeOnboarding = async () => {
        try {
            if (session?.user?.id) {
                await AsyncStorage.setItem(`onboarding_completed_${session.user.id}`, 'true');
            }
            navigation.reset({
                index: 0,
                routes: [{ name: 'MainApp' }],
            });

        } catch (error) {
            console.error(error);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                {}
                <View style={[styles.headerIconCircle, { borderColor: colors.border }]}>
                    <Feather name="book-open" size={27} color={colors.primary} />
                </View>

                {}
                <View style={styles.header}>
                    <ThemedText style={[styles.headerTitle, { color: colors.foreground }]}>Daily Wisdom</ThemedText>
                    <ThemedText style={[styles.headerSubtitle, { color: colors.mutedForeground }]}>
                        Begin each day with timeless wisdom from the Bhagavad Gita
                    </ThemedText>
                </View>

                {}
                <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.card }]}>

                    {}
                    <ThemedText style={[styles.sanskritText, { color: colors.primary }]}>
                        {wisdom.sanskrit}
                    </ThemedText>

                    {}
                    <ThemedText style={[styles.transliterationText, { color: colors.mutedForeground }]}>
                        {wisdom.transliteration}
                    </ThemedText>

                    {}
                    <ThemedText style={[styles.englishText, { color: colors.foreground }]}>
                        {wisdom.english}
                    </ThemedText>

                    {}
                    <View style={styles.verseNumberContainer}>
                        <ThemedText style={[styles.verseNumberText, { color: colors.foreground }]}>{wisdom.verse}</ThemedText>
                    </View>

                    {}
                    <View style={[styles.contextBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
                        <ThemedText style={[styles.contextText, { color: colors.mutedForeground }]}>
                            The opening verse sets the stage for the entire Bhagavad Gita, introducing the context of the great battle.
                        </ThemedText>
                    </View>

                </View>

                {}
                <TouchableOpacity
                    style={[styles.continueBtn, { backgroundColor: colors.primary }]}
                    
                    onPress={completeOnboarding}
                    activeOpacity={0.9}
                >
                    <ThemedText style={styles.continueBtnText}>Continue Your Journey</ThemedText>
                    <Feather name="arrow-right" size={20} color="#fff" />
                </TouchableOpacity>

                {}
                <ThemedText style={[styles.footerText, { color: colors.mutedForeground }]}>
                    Discover new verses daily and deepen your spiritual understanding
                </ThemedText>

                <View style={{ marginTop: 30, marginBottom: 20 }}>
                    <ThemedText style={[styles.designerText, { color: colors.mutedForeground }]}>
                        Designed by <ThemedText style={{ fontWeight: 'bold', color: colors.primary }}>Anantha Krishna</ThemedText>
                    </ThemedText>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 80, 
    },
    headerIconCircle: {
        width: 50,
        height: 50,
        borderRadius: 35,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    header: {
        alignItems: 'center',
        marginBottom: '3%',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 16,
        textAlign: 'center',
    },
    headerSubtitle: {
        fontSize: 14,
        textAlign: 'center',
    },
    card: {
        width: '100%',
        borderRadius: 12,
        padding: 18,
        borderWidth: 1,
        marginBottom: '3%',
        alignItems: 'center',
    },
    sanskritText: {
        fontSize: 14,
        textAlign: 'center',
        fontWeight: '600',
        marginBottom: 12,
        lineHeight: 28,
    },
    transliterationText: {
        fontSize: 14,
        textAlign: 'center',
        fontStyle: 'italic',
        marginBottom: 16,
        lineHeight: 22,
    },
    englishText: {
        fontSize: 13,
        textAlign: 'center',
        marginBottom: 16,
        lineHeight: 26,
    },
    verseNumberContainer: {
        marginBottom: '2%',
    },
    verseNumberText: {
        fontSize: 12,
        fontWeight: '600',
    },
    contextBox: {
        width: '100%',
        padding: 12,
        borderWidth: 1,
        borderRadius: 8,
    },
    contextText: {
        fontSize: 12,
        textAlign: 'center',
        lineHeight: 20,
    },
    
    continueBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 8,
        gap: 8,
        width: '80%',
        marginBottom: '2%',
    },
    continueBtnText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
    },
    footerText: {
        fontSize: 12,
        textAlign: 'center',
        
    },
    designerText: {
        fontSize: 14,
    }
});