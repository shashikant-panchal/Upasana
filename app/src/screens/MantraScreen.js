import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useEffect, useRef, useState } from "react";
import {
    Animated,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { ThemedText } from "../components/ThemedText";
import { useTheme } from "../context/ThemeContext";

const mantras = [
    {
        id: 1,
        sanskrit: "ॐ शान्तिः शान्तिः शान्तिः",
        transliteration: "Om Shāntiḥ Shāntiḥ Shāntiḥ",
        meaning: "Om Peace Peace Peace",
        description: "The universal peace mantra, invoking peace at physical, mental, and spiritual levels",
        audioId: "305024877"
    },
    {
        id: 2,
        sanskrit: "सर्वे भवन्तु सुखिनः",
        transliteration: "Sarve Bhavantu Sukhinaḥ",
        meaning: "May all be happy",
        description: "A blessing for the happiness of all beings",
        audioId: "305024877"
    },
    {
        id: 3,
        sanskrit: "सर्वे सन्तु निरामयाः",
        transliteration: "Sarve Santu Nirāmayāḥ",
        meaning: "May all be free from illness",
        description: "A prayer for health and well-being of all",
        audioId: "305024877"
    },
    {
        id: 4,
        sanskrit: "ॐ नमो भगवते वासुदेवाय",
        transliteration: "Om Namo Bhagavate Vāsudevāya",
        meaning: "Salutations to Lord Vāsudeva",
        description: "A twelve-syllable mantra for spiritual liberation",
        audioId: "217533938"
    },
    {
        id: 5,
        sanskrit: "लोकाः समस्ताः सुखिनो भवन्तु",
        transliteration: "Lokāḥ Samastāḥ Sukhino Bhavantu",
        meaning: "May all worlds be happy",
        description: "A universal prayer for the welfare of all beings in all realms",
        audioId: "305024877"
    },
];

const MantraScreen = ({ navigation }) => {
    const { colors, isDark } = useTheme();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlay, setIsAutoPlay] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);

    const fadeAnim = useRef(new Animated.Value(1)).current;
    const slideAnim = useRef(new Animated.Value(0)).current;
    const omOpacity = useRef(new Animated.Value(0.5)).current;

    useEffect(() => {
        
        Animated.loop(
            Animated.sequence([
                Animated.timing(omOpacity, {
                    toValue: 1,
                    duration: 2000,
                    useNativeDriver: true,
                }),
                Animated.timing(omOpacity, {
                    toValue: 0.5,
                    duration: 2000,
                    useNativeDriver: true,
                })
            ])
        ).start();
    }, []);

    useEffect(() => {
        let timer;
        if (isAutoPlay) {
            timer = setInterval(() => {
                handleNext();
            }, 8000);
        }
        return () => clearInterval(timer);
    }, [isAutoPlay, currentIndex]);

    const transitionMantra = (callback) => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: -20,
                duration: 250,
                useNativeDriver: true,
            })
        ]).start(() => {
            callback();
            slideAnim.setValue(20);
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 250,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 250,
                    useNativeDriver: true,
                })
            ]).start();
        });
    };

    const handleNext = () => {
        Haptics.selectionAsync();
        transitionMantra(() => {
            setCurrentIndex((prev) => (prev + 1) % mantras.length);
        });
    };

    const handlePrev = () => {
        Haptics.selectionAsync();
        setIsPlaying(false);
        transitionMantra(() => {
            setCurrentIndex((prev) => (prev - 1 + mantras.length) % mantras.length);
        });
    };

    const toggleAutoPlay = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setIsAutoPlay(!isAutoPlay);
    };

    const mantra = mantras[currentIndex];

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Feather name="arrow-left" size={24} color={colors.mutedForeground} />
                </TouchableOpacity>
                <View style={styles.headerText}>
                    <ThemedText type="subtitle" style={{ color: colors.foreground }}>Mantra</ThemedText>
                    <ThemedText type="small" style={{ color: colors.mutedForeground }}> Sacred Sounds · मन्त्र</ThemedText>
                </View>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.main}>
                <Animated.Text style={[styles.omSymbol, { opacity: omOpacity }]}>
                    ॐ
                </Animated.Text>

                <View style={styles.contentContainer}>
                    <Animated.View style={[
                        styles.mantraContent,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }]
                        }
                    ]}>
                        <ThemedText style={styles.sanskritText}>
                            {mantra.sanskrit}
                        </ThemedText>
                        <ThemedText style={[styles.transliteration, { color: colors.primary }]}>
                            {mantra.transliteration}
                        </ThemedText>
                        <ThemedText style={[styles.meaning, { color: colors.foreground }]}>
                            {mantra.meaning}
                        </ThemedText>
                        <ThemedText style={[styles.description, { color: colors.mutedForeground }]}>
                            {mantra.description}
                        </ThemedText>

                        {}
                        <View style={styles.audioContainer}>
                            {!isPlaying ? (
                                <TouchableOpacity
                                    style={[styles.listenBtn, { backgroundColor: colors.primary + '15' }]}
                                    onPress={() => {
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                        setIsPlaying(true);
                                        setIsAutoPlay(false);
                                    }}
                                >
                                    <Ionicons name="play" size={16} color={colors.primary} />
                                    <ThemedText style={{ color: colors.primary, marginLeft: 8, fontSize: 13, fontWeight: "600" }}>
                                        Listen to Mantra
                                    </ThemedText>
                                </TouchableOpacity>
                            ) : (
                                <View style={styles.playerWrapper}>
                                    <View style={styles.webViewContainer}>
                                        <WebView
                                            source={{
                                                uri: `https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/${mantra.audioId}&color=%23d97706&auto_play=true&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false&visual=false`
                                            }}
                                            style={styles.webView}
                                            javaScriptEnabled={true}
                                            domStorageEnabled={true}
                                            allowsInlineMediaPlayback={true}
                                            mediaPlaybackRequiresUserAction={false}
                                        />
                                    </View>
                                    <TouchableOpacity
                                        style={styles.hideBtn}
                                        onPress={() => setIsPlaying(false)}
                                    >
                                        <ThemedText type="tiny" style={{ color: colors.mutedForeground }}>Hide player</ThemedText>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    </Animated.View>
                </View>

                {}
                <View style={styles.progressDots}>
                    {mantras.map((_, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={() => {
                                Haptics.selectionAsync();
                                transitionMantra(() => setCurrentIndex(index));
                            }}
                            style={[
                                styles.dot,
                                {
                                    backgroundColor: index === currentIndex ? colors.primary : colors.border + "40",
                                    width: index === currentIndex ? 20 : 8,
                                }
                            ]}
                        />
                    ))}
                </View>

                {}
                <View style={styles.controls}>
                    <TouchableOpacity
                        style={[styles.smallBtn, { borderColor: colors.border }]}
                        onPress={handlePrev}
                    >
                        <Ionicons name="chevron-back" size={24} color={colors.foreground} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.playBtn, { backgroundColor: colors.primary }]}
                        onPress={toggleAutoPlay}
                    >
                        <Ionicons
                            name={isAutoPlay ? "pause" : "play"}
                            size={32}
                            color="#FFF"
                            style={!isAutoPlay && { marginLeft: 4 }}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.smallBtn, { borderColor: colors.border }]}
                        onPress={handleNext}
                    >
                        <Ionicons name="chevron-forward" size={24} color={colors.foreground} />
                    </TouchableOpacity>
                </View>

                <ThemedText type="small" style={[styles.autoPlayText, { color: colors.mutedForeground }]}>
                    {isAutoPlay ? "Auto-advancing every 8 seconds" : "Tap to auto-advance"}
                </ThemedText>
            </View>
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
    main: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 30,
    },
    omSymbol: {
        fontSize: 100,
        color: "#F59E0B",
        marginBottom: 40,
    },
    contentContainer: {
        height: 250,
        justifyContent: "center",
        width: "100%",
    },
    mantraContent: {
        alignItems: "center",
    },
    sanskritText: {
        fontSize: 32,
        textAlign: "center",
        fontWeight: "300",
        marginBottom: 16,
        lineHeight: 48,
    },
    transliteration: {
        fontSize: 18,
        fontStyle: "italic",
        textAlign: "center",
        marginBottom: 12,
    },
    meaning: {
        fontSize: 16,
        textAlign: "center",
        marginBottom: 16,
        opacity: 0.9,
    },
    description: {
        fontSize: 14,
        textAlign: "center",
        lineHeight: 20,
        opacity: 0.7,
    },
    progressDots: {
        flexDirection: "row",
        gap: 8,
        marginVertical: 40,
        alignItems: "center",
    },
    dot: {
        height: 8,
        borderRadius: 4,
    },
    controls: {
        flexDirection: "row",
        alignItems: "center",
        gap: 24,
    },
    smallBtn: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    playBtn: {
        width: 72,
        height: 72,
        borderRadius: 36,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    autoPlayText: {
        marginTop: 30,
        opacity: 0.6,
    },
    audioContainer: {
        marginTop: 24,
        width: '100%',
        alignItems: 'center',
    },
    listenBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
    },
    playerWrapper: {
        width: '100%',
        alignItems: 'center',
    },
    webViewContainer: {
        width: '100%',
        height: 100,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    webView: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    hideBtn: {
        marginTop: 8,
        padding: 4,
    }
});

export default MantraScreen;
