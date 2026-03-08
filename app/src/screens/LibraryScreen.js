import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import {
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "../components/ThemedText";
import { useTheme } from "../context/ThemeContext";

const books = [
    {
        id: "bhagavad-gita",
        title: "Bhagavad Gita",
        sanskrit: "भगवद्गीता",
        description: "The Song of God - Divine dialogue between Krishna and Arjuna",
        chapters: 18,
        verses: 700,
        color: ["#F59E0B20", "#F9731620"],
        accent: "#F59E0B",
        available: true,
        route: "DailyReading",
    },
    {
        id: "ramayana",
        title: "Ramayana",
        sanskrit: "रामायण",
        description: "The epic journey of Lord Rama",
        chapters: 7,
        verses: 24000,
        color: ["#10B98120", "#05966920"],
        accent: "#10B981",
        available: false
    },
    {
        id: "mahabharata",
        title: "Mahabharata",
        sanskrit: "महाभारत",
        description: "The great epic of the Bharata dynasty",
        chapters: 18,
        verses: 100000,
        color: ["#3B82F620", "#4F46E520"],
        accent: "#3B82F6",
        available: false
    },
    {
        id: "upanishads",
        title: "Upanishads",
        sanskrit: "उपनिषद्",
        description: "Ancient philosophical texts of wisdom",
        chapters: 108,
        verses: 0,
        color: ["#8B5CF620", "#7C3AED20"],
        accent: "#8B5CF6",
        available: false
    },
    {
        id: "yoga-sutras",
        title: "Yoga Sutras",
        sanskrit: "योग सूत्र",
        description: "Patanjali's guide to the science of Yoga",
        chapters: 4,
        verses: 196,
        color: ["#EC489920", "#E11D4820"],
        accent: "#EC4899",
        available: false
    },
    {
        id: "vishnu-purana",
        title: "Vishnu Purana",
        sanskrit: "विष्णु पुराण",
        description: "Sacred stories of Lord Vishnu",
        chapters: 6,
        verses: 7000,
        color: ["#0EA5E920", "#0891B220"],
        accent: "#0EA5E9",
        available: false
    }
];

const LibraryScreen = ({ navigation }) => {
    const { colors, isDark } = useTheme();

    const handleBookClick = (book) => {
        if (book.available && book.route) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.navigate(book.route);
        } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Feather name="arrow-left" size={24} color={colors.mutedForeground} />
                </TouchableOpacity>
                <View style={styles.headerText}>
                    <ThemedText type="subtitle" style={{ color: colors.foreground }}>Library</ThemedText>
                    <ThemedText type="small" style={{ color: colors.mutedForeground }}>ग्रन्थालय · Sacred Texts</ThemedText>
                </View>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.intro}>
                    <ThemedText style={{ color: colors.mutedForeground, textAlign: "center" }}>
                        Explore the timeless wisdom of sacred scriptures
                    </ThemedText>
                </View>

                {books.map((book) => (
                    <TouchableOpacity
                        key={book.id}
                        style={[
                            styles.bookCard,
                            {
                                backgroundColor: isDark ? colors.card : book.color[0],
                                opacity: book.available ? 1 : 0.6,
                                borderColor: book.available ? book.accent + "40" : "transparent",
                                borderWidth: book.available ? 1 : 0,
                            }
                        ]}
                        onPress={() => handleBookClick(book)}
                        disabled={!book.available}
                    >
                        <View style={styles.bookIconContainer}>
                            <View style={[styles.iconBox, { backgroundColor: isDark ? book.color[0] : "#FFF" }]}>
                                <Feather name="book" size={24} color={book.accent} />
                            </View>
                        </View>

                        <View style={styles.bookInfo}>
                            <View style={styles.titleRow}>
                                <ThemedText type="defaultSemiBold" style={{ fontSize: 18 }}>{book.title}</ThemedText>
                                {!book.available && (
                                    <View style={[styles.soonBadge, { backgroundColor: colors.border + "40" }]}>
                                        <ThemedText style={{ fontSize: 9, fontWeight: "600", color: colors.mutedForeground }}>SOON</ThemedText>
                                    </View>
                                )}
                            </View>
                            <ThemedText type="small" style={{ color: book.accent, fontWeight: "500", marginBottom: 4 }}>
                                {book.sanskrit}
                            </ThemedText>
                            <ThemedText type="small" style={{ color: colors.mutedForeground, lineHeight: 18 }} numberOfLines={2}>
                                {book.description}
                            </ThemedText>

                            <View style={styles.metaRow}>
                                <View style={styles.meta}>
                                    <Feather name="layers" size={10} color={colors.mutedForeground} />
                                    <ThemedText type="small" style={styles.metaText}>{book.chapters} chapters</ThemedText>
                                </View>
                                {book.verses > 0 && (
                                    <View style={styles.meta}>
                                        <Feather name="list" size={10} color={colors.mutedForeground} />
                                        <ThemedText type="small" style={styles.metaText}>{book.verses.toLocaleString()} verses</ThemedText>
                                    </View>
                                )}
                            </View>
                        </View>

                        {book.available && (
                            <Ionicons name="chevron-forward" size={20} color={colors.mutedForeground} />
                        )}
                    </TouchableOpacity>
                ))}
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
    intro: {
        marginVertical: 20,
        paddingHorizontal: 10,
    },
    bookCard: {
        flexDirection: "row",
        padding: 16,
        borderRadius: 20,
        marginBottom: 16,
        alignItems: "center",
    },
    bookIconContainer: {
        marginRight: 16,
    },
    iconBox: {
        width: 56,
        height: 56,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
    },
    bookInfo: {
        flex: 1,
    },
    titleRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 2,
    },
    soonBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    metaRow: {
        flexDirection: "row",
        gap: 12,
        marginTop: 8,
    },
    meta: {
        flexDirection: "row",
        alignItems: "center",
    },
    metaText: {
        fontSize: 11,
        color: "rgba(0,0,0,0.5)",
        marginLeft: 4,
    }
});

export default LibraryScreen;
