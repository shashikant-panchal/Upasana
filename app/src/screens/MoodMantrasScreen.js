import { Feather, Ionicons } from "@expo/vector-icons";
import * as Clipboard from 'expo-clipboard';
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    ScrollView,
    Share,
    StyleSheet,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { ThemedText } from "../components/ThemedText";
import { useTheme } from "../context/ThemeContext";

const { width } = Dimensions.get("window");

const moods = [
    {
        id: "peace",
        name: "Seeking Peace",
        icon: "moon-outline",
        color: "#60A5FA",
        gradient: ["#3B82F620", "#6366F120"],
        mantras: [
            {
                sanskrit: "ॐ शान्ति शान्ति शान्तिः",
                transliteration: "Om Shanti Shanti Shantihi",
                meaning: "Om, Peace, Peace, Peace — invoking peace in body, mind, and spirit",
                description: "This ancient mantra invokes threefold peace for the physical, mental, and spiritual realms. Chanting creates deep tranquility.",
                audioId: "305024877"
            },
            {
                sanskrit: "सर्वे भवन्तु सुखिनः",
                transliteration: "Sarve Bhavantu Sukhinah",
                meaning: "May all beings be happy",
                description: "A universal blessing for peace and happiness of all living beings. Part of the Shanti Mantras from the Upanishads.",
                audioId: "305024877"
            }
        ]
    },
    {
        id: "courage",
        name: "Need Courage",
        icon: "shield-outline",
        color: "#F87171",
        gradient: ["#EF444420", "#F9731620"],
        mantras: [
            {
                sanskrit: "ॐ दुं दुर्गायै नमः",
                transliteration: "Om Dum Durgayai Namah",
                meaning: "Salutations to Goddess Durga, the remover of difficulties",
                description: "Invoking the divine feminine power of Durga who destroys all obstacles and fears. Chant when facing challenges.",
                audioId: "305024877"
            },
            {
                sanskrit: "ॐ हनुमते नमः",
                transliteration: "Om Hanumate Namah",
                meaning: "Salutations to Lord Hanuman, embodiment of strength and devotion",
                description: "Hanuman represents ultimate courage, strength, and selfless devotion. This mantra awakens inner power.",
                audioId: "305024877"
            }
        ]
    },
    {
        id: "energy",
        name: "Low Energy",
        icon: "flash-outline",
        color: "#FACC15",
        gradient: ["#EAB30820", "#F59E0B20"],
        mantras: [
            {
                sanskrit: "ॐ सूर्याय नमः",
                transliteration: "Om Suryaya Namah",
                meaning: "Salutations to the Sun God, source of all energy",
                description: "The Sun is the source of all life energy. This mantra channels solar vitality and rejuvenates the body and mind.",
                audioId: "305024877"
            },
            {
                sanskrit: "ॐ ह्रीं श्रीं क्लीं",
                transliteration: "Om Hreem Shreem Kleem",
                meaning: "Bija mantras for energy, prosperity, and attraction",
                description: "Powerful seed sounds that activate energy centers. Hreem for transformation, Shreem for abundance, Kleem for attraction.",
                audioId: "305024877"
            }
        ]
    },
    {
        id: "love",
        name: "Feeling Love",
        icon: "heart-outline",
        color: "#F472B6",
        gradient: ["#EC489920", "#F43F5E20"],
        mantras: [
            {
                sanskrit: "ॐ क्लीं कृष्णाय नमः",
                transliteration: "Om Kleem Krishnaya Namah",
                meaning: "Salutations to Krishna, the embodiment of divine love",
                description: "Krishna represents divine love and joy. The bija 'Kleem' attracts love and devotion into your life.",
                audioId: "217533938"
            },
            {
                sanskrit: "राधे कृष्ण राधे श्याम",
                transliteration: "Radhe Krishna Radhe Shyam",
                meaning: "Divine names of Radha and Krishna, symbols of eternal love",
                description: "The divine couple represents the soul's yearning for the Supreme. Their love is the highest form of devotion.",
                audioId: "217533938"
            }
        ]
    },
    {
        id: "clarity",
        name: "Seeking Clarity",
        icon: "sunny-outline",
        color: "#FBBF24",
        gradient: ["#F59E0B20", "#EAB30820"],
        mantras: [
            {
                sanskrit: "ॐ ऐं सरस्वत्यै नमः",
                transliteration: "Om Aim Saraswatyai Namah",
                meaning: "Salutations to Goddess Saraswati, bestower of wisdom",
                description: "Saraswati is the goddess of knowledge, arts, and wisdom. Her mantra clears mental fog and enhances learning.",
                audioId: "1082920270"
            },
            {
                sanskrit: "असतो मा सद्गमय",
                transliteration: "Asato Ma Sadgamaya",
                meaning: "Lead me from untruth to truth",
                description: "From the Brihadaranyaka Upanishad. A prayer for illumination and discernment on the spiritual path.",
                audioId: "1082920270"
            }
        ]
    },
    {
        id: "gratitude",
        name: "Feeling Grateful",
        icon: "sparkles-outline",
        color: "#A78BFA",
        gradient: ["#8B5CF620", "#7C3AED20"],
        mantras: [
            {
                sanskrit: "ॐ नमो भगवते वासुदेवाय",
                transliteration: "Om Namo Bhagavate Vasudevaya",
                meaning: "I bow to Lord Vasudeva (Krishna), the Supreme Being",
                description: "A twelve-syllable mantra of surrender and gratitude. Expressing devotion to the all-pervading divine.",
                audioId: "217533938"
            },
            {
                sanskrit: "लोकाः समस्ताः सुखिनो भवन्तु",
                transliteration: "Lokah Samastah Sukhino Bhavantu",
                meaning: "May all beings everywhere be happy and free",
                description: "A closing prayer used in yoga. Expressing gratitude by wishing happiness for all of creation.",
                audioId: "305024877"
            }
        ]
    }
];

const MoodMantrasScreen = ({ navigation }) => {
    const { colors, isDark } = useTheme();
    const [selectedMood, setSelectedMood] = useState(null);
    const [playingIndex, setPlayingIndex] = useState(null);
    const [favorites, setFavorites] = useState(new Set());

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        fadeAnim.setValue(0);
        slideAnim.setValue(20);
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            })
        ]).start();
    }, [selectedMood]);

    const handleMoodSelect = (mood) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelectedMood(mood);
        setPlayingIndex(null);
    };

    const toggleFavorite = (mantraId) => {
        Haptics.selectionAsync();
        setFavorites(prev => {
            const newFavs = new Set(prev);
            if (newFavs.has(mantraId)) newFavs.delete(mantraId);
            else newFavs.add(mantraId);
            return newFavs;
        });
    };

    const copyMantra = async (mantra) => {
        const text = `${mantra.sanskrit}\n${mantra.transliteration}\n"${mantra.meaning}"`;
        await Clipboard.setStringAsync(text);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    };

    const shareMantra = async (mantra) => {
        try {
            await Share.share({
                message: `${mantra.sanskrit}\n\n${mantra.transliteration}\n\n"${mantra.meaning}"`,
            });
        } catch (error) {
            console.log(error);
        }
    };

    const getSoundCloudUrl = (trackId) =>
        `https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/${trackId}&color=%23d97706&auto_play=true&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false&visual=false`;

    const playSound = async (index) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        if (playingIndex === index) {
            setPlayingIndex(null);
        } else {
            setPlayingIndex(index);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            {}
            <View style={[styles.header, { borderBottomColor: colors.border + "40", backgroundColor: colors.background + 'CC' }]}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity
                        onPress={() => selectedMood ? setSelectedMood(null) : navigation.goBack()}
                        style={styles.backButton}
                    >
                        <Feather name="arrow-left" size={24} color={colors.mutedForeground} />
                    </TouchableOpacity>
                    <View style={styles.headerTitleContainer}>
                        <ThemedText style={styles.headerTitle}>
                            {selectedMood ? selectedMood.name : "Mood Mantras"}
                        </ThemedText>
                        <ThemedText style={styles.headerSubtitle}>
                            {selectedMood ? `Mantras for ${selectedMood.name.toLowerCase()}` : "भाव मन्त्र · For Every Feeling"}
                        </ThemedText>
                    </View>
                </View>
                {selectedMood ? (
                    <View style={[styles.moodIconSmall, { backgroundColor: selectedMood.color + '20' }]}>
                        <Ionicons name={selectedMood.icon.replace('-outline', '')} size={20} color={selectedMood.color} />
                    </View>
                ) : <View style={{ width: 40 }} />}
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {!selectedMood ? (
                    <Animated.View style={[styles.selectionView, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                        <ThemedText style={styles.prompt}>How are you feeling today?</ThemedText>
                        <View style={styles.moodGrid}>
                            {moods.map((mood) => (
                                <TouchableOpacity
                                    key={mood.id}
                                    style={styles.moodCard}
                                    onPress={() => handleMoodSelect(mood)}
                                >
                                    <LinearGradient
                                        colors={mood.gradient}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        style={styles.moodCardGradient}
                                    >
                                        <View style={[styles.moodIconCircle, { backgroundColor: isDark ? colors.card : "#FFF" }]}>
                                            <Ionicons name={mood.icon} size={28} color={mood.color} />
                                        </View>
                                        <ThemedText type="defaultSemiBold" style={styles.moodName}>{mood.name}</ThemedText>
                                    </LinearGradient>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </Animated.View>
                ) : (
                    <Animated.View style={[styles.mantraView, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                        {selectedMood.mantras.map((mantra, index) => {
                            const isPlaying = playingIndex === index;
                            const isFavorite = favorites.has(`${selectedMood.id}-${index}`);
                            return (
                                <View key={index} style={styles.mantraCard}>
                                    <View style={styles.mantraHeader}>
                                        <View style={[styles.mantraNumber, { backgroundColor: colors.border + "40" }]}>
                                            <ThemedText type="small">{index + 1}</ThemedText>
                                        </View>
                                        <View style={styles.sanskritContainer}>
                                            <ThemedText style={styles.sanskritText}>{mantra.sanskrit}</ThemedText>
                                        </View>
                                    </View>

                                    <ThemedText style={[styles.transliteration, { color: colors.primary }]}>
                                        {mantra.transliteration}
                                    </ThemedText>

                                    <ThemedText style={styles.meaning}>"{mantra.meaning}"</ThemedText>

                                    <View style={[styles.divider, { backgroundColor: colors.primary + "30" }]} />

                                    <ThemedText style={[styles.description, { color: colors.mutedForeground }]}>
                                        {mantra.description}
                                    </ThemedText>

                                    <View style={styles.actions}>
                                        <TouchableOpacity
                                            onPress={() => playSound(index)}
                                            style={[styles.actionBtn, { backgroundColor: isPlaying ? colors.primary : colors.primary + "15" }]}
                                        >
                                            <Feather name={isPlaying ? "pause" : "play"} size={16} color={isPlaying ? "#FFF" : colors.primary} />
                                            <ThemedText style={{ color: isPlaying ? "#FFF" : colors.primary, marginLeft: 8, fontSize: 13, fontWeight: "600" }}>
                                                {isPlaying ? "Playing" : "Listen"}
                                            </ThemedText>
                                        </TouchableOpacity>
                                        <View style={styles.rightActions}>
                                            <TouchableOpacity onPress={() => shareMantra(mantra)} style={styles.iconAction}>
                                                <Feather name="share-2" size={18} color={colors.mutedForeground} />
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => copyMantra(mantra)} style={styles.iconAction}>
                                                <Feather name="copy" size={18} color={colors.mutedForeground} />
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                onPress={() => toggleFavorite(`${selectedMood.id}-${index}`)}
                                                style={[styles.iconAction, isFavorite && { backgroundColor: '#FBBF2420' }]}
                                            >
                                                <Ionicons
                                                    name={isFavorite ? "star" : "star-outline"}
                                                    size={18}
                                                    color={isFavorite ? "#FBBF24" : colors.mutedForeground}
                                                />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                    {isPlaying && (
                                        <View style={styles.audioPlayerContainer}>
                                            <WebView
                                                source={{ uri: getSoundCloudUrl(mantra.audioId) }}
                                                style={styles.webViewPlayer}
                                                javaScriptEnabled={true}
                                                domStorageEnabled={true}
                                                allowsInlineMediaPlayback={true}
                                                mediaPlaybackRequiresUserAction={false}
                                                startInLoadingState={true}
                                            />
                                        </View>
                                    )}
                                </View>
                            );
                        })}

                        <ThemedText style={[styles.footerText, { color: colors.mutedForeground }]}>
                            ॐ · Chant with devotion and focus
                        </ThemedText>
                    </Animated.View>
                )}
            </ScrollView>

            {}
            {playingIndex !== null && selectedMood && selectedMood.mantras[playingIndex] && (
                <View style={[styles.bottomBar, { backgroundColor: colors.card, borderTopColor: colors.border + "40" }]}>
                    <View style={styles.bottomBarContent}>
                        <TouchableOpacity
                            onPress={() => setPlayingIndex(null)}
                            style={[styles.miniPlayBtn, { backgroundColor: colors.foreground }]}
                        >
                            <Feather name="pause" size={18} color={colors.background} />
                        </TouchableOpacity>
                        <View style={styles.miniInfo}>
                            <ThemedText type="small" style={{ fontWeight: "600" }} numberOfLines={1}>
                                {selectedMood.mantras[playingIndex].transliteration}
                            </ThemedText>
                            <ThemedText type="small" style={{ opacity: 0.6 }} numberOfLines={1}>
                                ॐ · Playing Mantra
                            </ThemedText>
                        </View>
                        <TouchableOpacity onPress={shareMantra.bind(null, selectedMood.mantras[playingIndex])} style={styles.miniIconBtn}>
                            <Feather name="share-2" size={18} color={colors.mutedForeground} />
                        </TouchableOpacity>
                    </View>
                </View>
            )}
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
        paddingVertical: 14,
        borderBottomWidth: 1,
        zIndex: 10,
    },
    headerLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    backButton: {
        padding: 4,
    },
    headerTitleContainer: {
        alignItems: "flex-start",
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "600",
    },
    headerSubtitle: {
        fontSize: 12,
        opacity: 0.6,
    },
    moodIconSmall: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: "center",
        alignItems: "center",
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    selectionView: {
        paddingTop: 20,
    },
    prompt: {
        textAlign: "center",
        fontSize: 18,
        opacity: 0.7,
        marginBottom: 30,
        fontWeight: '300',
    },
    moodGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
    },
    moodCard: {
        width: "48%",
        aspectRatio: 1,
        borderRadius: 24,
        marginBottom: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.05)",
    },
    moodCardGradient: {
        flex: 1,
        width: '100%',
        height: '100%',
        padding: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    moodIconCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 12,
        backgroundColor: "rgba(255,255,255,0.8)",
    },
    moodName: {
        fontSize: 13,
        textAlign: "center",
        fontWeight: '500',
    },
    mantraView: {
        paddingTop: 20,
    },
    mantraCard: {
        marginBottom: 32,
    },
    mantraHeader: {
        flexDirection: "row",
        marginBottom: 16,
    },
    mantraNumber: {
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
        marginTop: 4,
    },
    sanskritContainer: {
        flex: 1,
        alignItems: "flex-end",
    },
    sanskritText: {
        fontSize: 28,
        textAlign: "right",
        lineHeight: 42,
    },
    transliteration: {
        fontSize: 17,
        fontStyle: "italic",
        marginBottom: 8,
    },
    meaning: {
        fontSize: 16,
        marginBottom: 16,
        lineHeight: 24,
    },
    divider: {
        width: 40,
        height: 2,
        marginBottom: 16,
    },
    description: {
        fontSize: 14,
        lineHeight: 22,
        marginBottom: 20,
    },
    actions: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    actionBtn: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
    },
    rightActions: {
        flexDirection: "row",
        gap: 12,
    },
    iconAction: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(0,0,0,0.05)",
        justifyContent: "center",
        alignItems: "center",
    },
    footerText: {
        textAlign: "center",
        marginTop: 40,
        fontSize: 12,
        opacity: 0.5,
        marginBottom: 100,
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingBottom: 34, 
        borderTopWidth: 1,
        zIndex: 100,
    },
    bottomBarContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        gap: 12,
    },
    miniPlayBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    miniInfo: {
        flex: 1,
    },
    miniIconBtn: {
        padding: 4,
    },
    audioPlayerContainer: {
        height: 100,
        marginTop: 16,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    webViewPlayer: {
        flex: 1,
        backgroundColor: 'transparent',
    }
});

export default MoodMantrasScreen;
