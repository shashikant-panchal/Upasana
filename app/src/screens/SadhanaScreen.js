import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import moment from "moment";
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    Easing,
    Modal,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, {
    Circle,
    ClipPath,
    Defs,
    Ellipse,
    G,
    RadialGradient,
    Stop,
} from "react-native-svg";
import Toast from "react-native-toast-message";
import { useDispatch, useSelector } from "react-redux";
import CalendarModal from "../components/CalendarModal";
import ComingSoonModal from "../components/ComingSoonModal";
import { ThemedText } from "../components/ThemedText";
import { useTheme } from "../context/ThemeContext";
import { calculateMuhurta } from "../utils/muhurtaCalculator";
import { supabase } from "../utils/supabase";

const WINDOW_WIDTH = Dimensions.get("window").width;
const relativeWidth = (percentage) => WINDOW_WIDTH * (percentage / 100);

const AnimatedG = Animated.createAnimatedComponent(G);

const SiriOrb = () => {
    const SIZE = 180;
    const C = SIZE / 2;
    const R = SIZE / 2;

    const rot1 = useRef(new Animated.Value(0)).current;
    const rot2 = useRef(new Animated.Value(60)).current;
    const rot3 = useRef(new Animated.Value(120)).current;
    const rot4 = useRef(new Animated.Value(200)).current;
    const rot5 = useRef(new Animated.Value(300)).current;

    const orbScale = useRef(new Animated.Value(1)).current;
    const glowOpacity = useRef(new Animated.Value(0.8)).current;

    useEffect(() => {
        const makeSpin = (anim, duration) =>
            Animated.loop(
                Animated.timing(anim, {
                    toValue: anim._value + 360,
                    duration,
                    easing: Easing.linear,
                    useNativeDriver: true,
                })
            );

        const breathe = Animated.loop(
            Animated.sequence([
                Animated.timing(orbScale, { toValue: 1.04, duration: 2400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
                Animated.timing(orbScale, { toValue: 0.97, duration: 2400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
            ])
        );

        const glowAnim = Animated.loop(
            Animated.sequence([
                Animated.timing(glowOpacity, { toValue: 1.0, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
                Animated.timing(glowOpacity, { toValue: 0.55, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
            ])
        );

        const s1 = makeSpin(rot1, 6000);
        const s2 = makeSpin(rot2, 8500);
        const s3 = makeSpin(rot3, 11000);
        const s4 = makeSpin(rot4, 7200);
        const s5 = makeSpin(rot5, 9800);

        s1.start(); s2.start(); s3.start(); s4.start(); s5.start();
        breathe.start(); glowAnim.start();

        return () => {
            s1.stop(); s2.stop(); s3.stop(); s4.stop(); s5.stop();
            breathe.stop(); glowAnim.stop();
        };
    }, []);

    const toDeg = (anim) =>
        anim.interpolate({ inputRange: [0, 360], outputRange: ["0deg", "360deg"] });

    return (
        <Animated.View style={{ width: SIZE, height: SIZE, transform: [{ scale: orbScale }] }}>
            <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
                <Defs>
                    <ClipPath id="orbClip">
                        <Circle cx={C} cy={C} r={R - 1} />
                    </ClipPath>

                    <RadialGradient id="bgGrad" cx="50%" cy="50%" r="50%">
                        <Stop offset="0%" stopColor="#0e1535" stopOpacity="1" />
                        <Stop offset="60%" stopColor="#080c22" stopOpacity="1" />
                        <Stop offset="100%" stopColor="#030610" stopOpacity="1" />
                    </RadialGradient>

                    <RadialGradient id="gradCyan" cx="50%" cy="20%" r="80%">
                        <Stop offset="0%" stopColor="#00f8e8" stopOpacity="1" />
                        <Stop offset="45%" stopColor="#00bfbf" stopOpacity="0.7" />
                        <Stop offset="100%" stopColor="#003333" stopOpacity="0" />
                    </RadialGradient>

                    <RadialGradient id="gradTeal" cx="50%" cy="20%" r="80%">
                        <Stop offset="0%" stopColor="#00e8b5" stopOpacity="1" />
                        <Stop offset="45%" stopColor="#009977" stopOpacity="0.65" />
                        <Stop offset="100%" stopColor="#002211" stopOpacity="0" />
                    </RadialGradient>

                    <RadialGradient id="gradPurple" cx="50%" cy="20%" r="80%">
                        <Stop offset="0%" stopColor="#cc55ff" stopOpacity="1" />
                        <Stop offset="45%" stopColor="#8822cc" stopOpacity="0.65" />
                        <Stop offset="100%" stopColor="#220033" stopOpacity="0" />
                    </RadialGradient>

                    <RadialGradient id="gradPink" cx="50%" cy="20%" r="80%">
                        <Stop offset="0%" stopColor="#ff2299" stopOpacity="1" />
                        <Stop offset="45%" stopColor="#cc1166" stopOpacity="0.65" />
                        <Stop offset="100%" stopColor="#440011" stopOpacity="0" />
                    </RadialGradient>

                    <RadialGradient id="gradBlue" cx="50%" cy="20%" r="80%">
                        <Stop offset="0%" stopColor="#44bbff" stopOpacity="1" />
                        <Stop offset="45%" stopColor="#2266cc" stopOpacity="0.6" />
                        <Stop offset="100%" stopColor="#001133" stopOpacity="0" />
                    </RadialGradient>

                    <RadialGradient id="whiteCore" cx="50%" cy="50%" r="50%">
                        <Stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                        <Stop offset="25%" stopColor="#ffffff" stopOpacity="0.95" />
                        <Stop offset="55%" stopColor="#cce8ff" stopOpacity="0.5" />
                        <Stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                    </RadialGradient>

                    <RadialGradient id="rimLight" cx="30%" cy="20%" r="70%">
                        <Stop offset="0%" stopColor="#ffffff" stopOpacity="0.12" />
                        <Stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                    </RadialGradient>
                </Defs>

                <Circle cx={C} cy={C} r={R} fill="url(#bgGrad)" />

                <G clipPath="url(#orbClip)">
                    <AnimatedG
                        style={{ transform: [{ rotate: toDeg(rot1) }] }}
                        origin={`${C}, ${C}`}
                    >
                        <Ellipse cx={C - 14} cy={C - 26} rx={36} ry={60} fill="url(#gradCyan)" opacity={0.92} />
                    </AnimatedG>

                    <AnimatedG
                        style={{ transform: [{ rotate: toDeg(rot2) }] }}
                        origin={`${C}, ${C}`}
                    >
                        <Ellipse cx={C - 6} cy={C - 30} rx={28} ry={54} fill="url(#gradTeal)" opacity={0.82} />
                    </AnimatedG>

                    <AnimatedG
                        style={{ transform: [{ rotate: toDeg(rot3) }] }}
                        origin={`${C}, ${C}`}
                    >
                        <Ellipse cx={C + 14} cy={C - 24} rx={34} ry={56} fill="url(#gradPurple)" opacity={0.88} />
                    </AnimatedG>

                    <AnimatedG
                        style={{ transform: [{ rotate: toDeg(rot4) }] }}
                        origin={`${C}, ${C}`}
                    >
                        <Ellipse cx={C + 10} cy={C - 22} rx={32} ry={52} fill="url(#gradPink)" opacity={0.88} />
                    </AnimatedG>

                    <AnimatedG
                        style={{ transform: [{ rotate: toDeg(rot5) }] }}
                        origin={`${C}, ${C}`}
                    >
                        <Ellipse cx={C + 4} cy={C - 28} rx={26} ry={48} fill="url(#gradBlue)" opacity={0.78} />
                    </AnimatedG>

                    <Animated.View
                        style={{
                            position: 'absolute',
                            opacity: glowOpacity,
                        }}
                    >
                        <Circle cx={C} cy={C} r={36} fill="url(#whiteCore)" />
                    </Animated.View>
                    <Circle cx={C} cy={C} r={36} fill="url(#whiteCore)" />
                    <Circle cx={C} cy={C} r={16} fill="white" opacity={0.97} />
                    <Circle cx={C - 5} cy={C - 5} r={7} fill="white" opacity={0.55} />

                    <Circle cx={C} cy={C} r={R - 1} fill="url(#rimLight)" />
                </G>

                <Circle
                    cx={C}
                    cy={C}
                    r={R - 1}
                    fill="none"
                    stroke="rgba(70,130,220,0.18)"
                    strokeWidth={1.5}
                />
            </Svg>
        </Animated.View>
    );
};

const SadhanaScreen = () => {
    const navigation = useNavigation();
    const { colors, isDark, typography } = useTheme();
    const dispatch = useDispatch();
    const location = useSelector((state) => state.location);

    const [isCalendarVisible, setIsCalendarVisible] = useState(false);
    const [isDayResultVisible, setIsDayResultVisible] = useState(false);
    const [selectedDayDate, setSelectedDayDate] = useState(null);
    const [muhurtaResult, setMuhurtaResult] = useState(null);
    const [isCheckingDay, setIsCheckingDay] = useState(false);
    const [isComingSoonVisible, setIsComingSoonVisible] = useState(false);

    const modalScale = useState(new Animated.Value(0))[0];
    const modalOpacity = useState(new Animated.Value(0))[0];
    const modalRotate = useState(new Animated.Value(0))[0];
    const scoreAnimatedValue = useState(new Animated.Value(0))[0];
    const [displayScore, setDisplayScore] = useState(0);
    const [isCalculating, setIsCalculating] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");

    const loadingMessages = [
        "Consulting Celestial Alignments...",
        "Analyzing Tithi and Nakshatra...",
        "Calculating Spiritual Resonance...",
        "Determining Auspiciousness...",
        "Finalizing Muhurta Details..."
    ];

    const cardAnims = useRef([...Array(10)].map(() => ({
        fade: new Animated.Value(0),
        slide: new Animated.Value(20)
    }))).current;

    const headerPulse = useRef(new Animated.Value(1)).current;
    const breathPulse = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const animations = cardAnims.map((anim, index) => {
            return Animated.parallel([
                Animated.timing(anim.fade, {
                    toValue: 1,
                    duration: 500,
                    delay: index * 100,
                    useNativeDriver: true,
                }),
                Animated.timing(anim.slide, {
                    toValue: 0,
                    duration: 500,
                    delay: index * 100,
                    easing: Easing.out(Easing.back(1)),
                    useNativeDriver: true,
                })
            ]);
        });
        Animated.parallel(animations).start();

        Animated.loop(
            Animated.sequence([
                Animated.timing(headerPulse, {
                    toValue: 1.05,
                    duration: 2000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(headerPulse, {
                    toValue: 1,
                    duration: 2000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                })
            ])
        ).start();

        Animated.loop(
            Animated.sequence([
                Animated.timing(breathPulse, {
                    toValue: 1.2,
                    duration: 2000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(breathPulse, {
                    toValue: 1,
                    duration: 2000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                })
            ])
        ).start();
    }, []);

    const playSound = async (soundFile) => {
        try {
            const { sound } = await Audio.Sound.createAsync(soundFile);
            await sound.playAsync();
            sound.setOnPlaybackStatusUpdate(status => {
                if (status.didJustFinish) {
                    sound.unloadAsync();
                }
            });
        } catch (error) {
            console.log("Error playing sound:", error);
        }
    };

    const handleDaySelect = async (date) => {
        setSelectedDayDate(date);
        setIsCheckingDay(true);

        try {
            let latitude = location?.latitude || 19.0760;
            let longitude = location?.longitude || 72.8777;
            const dateString = moment(date).format('YYYY-MM-DD');

            const { data, error } = await supabase.functions.invoke('get-panchang', {
                body: { latitude, longitude, date: dateString }
            });

            if (error) throw error;

            const result = calculateMuhurta(
                data.tithi,
                data.nakshatra,
                data.yoga,
                data.karana,
                date
            );

            setMuhurtaResult(result);

            modalScale.setValue(0);
            modalOpacity.setValue(0);
            modalRotate.setValue(0);
            scoreAnimatedValue.setValue(0);
            setDisplayScore(0);

            setIsDayResultVisible(true);
            setIsCalculating(true);
            setLoadingMessage(loadingMessages[0]);

            Animated.parallel([
                Animated.spring(modalScale, { toValue: 1, friction: 6, tension: 50, useNativeDriver: true }),
                Animated.timing(modalOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
                Animated.timing(modalRotate, { toValue: 1, duration: 600, easing: Easing.out(Easing.back(1.5)), useNativeDriver: true })
            ]).start();

            for (let i = 1; i < loadingMessages.length; i++) {
                await new Promise(resolve => setTimeout(resolve, 600));
                setLoadingMessage(loadingMessages[i]);
            }

            await new Promise(resolve => setTimeout(resolve, 400));
            setIsCalculating(false);

            playSound(require('../../../assets/sounds/temple-bell.mp3'));
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            Animated.timing(scoreAnimatedValue, {
                toValue: result.score,
                duration: 1500,
                easing: Easing.out(Easing.quad),
                useNativeDriver: false,
            }).start();

            const scoreListener = scoreAnimatedValue.addListener(({ value }) => {
                setDisplayScore(Math.floor(value));
            });

            return () => scoreAnimatedValue.removeListener(scoreListener);

        } catch (error) {
            console.error('Day Checker error:', error);
            Toast.show({ type: 'error', text1: 'Checker Error', text2: 'Failed to check auspiciousness.' });
        } finally {
            setIsCheckingDay(false);
        }
    };

    const getResultIcon = (level) => {
        switch (level) {
            case 'excellent': return { name: 'sparkles', color: '#10B981', library: 'Ionicons' };
            case 'good': return { name: 'check-circle', color: '#16A34A', library: 'Feather' };
            case 'neutral': return { name: 'minus-circle', color: '#F59E0B', library: 'Feather' };
            case 'challenging': return { name: 'alert-circle', color: '#F97316', library: 'Feather' };
            case 'avoid': return { name: 'x-circle', color: '#EF4444', library: 'Feather' };
            default: return { name: 'minus-circle', color: '#6B7280', library: 'Feather' };
        }
    };

    const getScoreColor = (level) => {
        switch (level) {
            case 'excellent': return '#10B981';
            case 'good': return '#16A34A';
            case 'neutral': return '#F59E0B';
            case 'challenging': return '#F97316';
            case 'avoid': return '#EF4444';
            default: return '#9CA3AF';
        }
    };

    const getImpactColor = (impact) => {
        if (isDark) {
            switch (impact) {
                case 'positive': return { bg: 'rgba(16, 185, 129, 0.2)', text: '#34D399' };
                case 'neutral': return { bg: 'rgba(245, 158, 11, 0.2)', text: '#FBBF24' };
                case 'negative': return { bg: 'rgba(239, 68, 68, 0.2)', text: '#F87171' };
                default: return { bg: 'rgba(107, 114, 128, 0.2)', text: '#9CA3AF' };
            }
        } else {
            switch (impact) {
                case 'positive': return { bg: '#DCFCE7', text: '#15803D' };
                case 'neutral': return { bg: '#FEF3C7', text: '#B45309' };
                case 'negative': return { bg: '#FEE2E2', text: '#B91C1C' };
                default: return { bg: '#F3F4F6', text: '#4B5563' };
            }
        }
    };

    const styles = getStyles(colors, isDark);

    const mainActivities = [
        {
            id: 'breathing',
            title: "Breathing",
            subtitle: "5 techniques available",
            icon: "wind",
            iconType: "feather",
            color: "#0EA5E9",
            bgColor: isDark ? '#082f49' : '#F0F9FF',
            route: "Breathing",
            type: 'row',
            actionText: 'Begin'
        },
        {
            id: 'release',
            title: "Release",
            subtitle: "Let go of what weighs you",
            icon: "leaf",
            iconType: "ionicons",
            color: "#10B981",
            bgColor: isDark ? '#064e3b' : '#ECFDF5',
            route: "Release",
            type: 'row'
        },
        {
            id: 'reading',
            title: "Daily Reading",
            subtitle: "Bhagavad Gita wisdom",
            icon: "book-open",
            iconType: "feather",
            color: "#F59E0B",
            bgColor: isDark ? '#451a03' : '#FFFBEB',
            route: "DailyReading",
            type: 'row'
        },
        {
            id: 'chant',
            title: "Sacred Mantras",
            subtitle: "Listen & chant along",
            icon: "music",
            iconType: "feather",
            color: "#8B5CF6",
            bgColor: isDark ? '#2e1065' : '#F5F3FF',
            route: "Mantra",
            type: 'row'
        },
    ];

    const morePractices = [
        {
            id: 'library',
            title: "Library",
            subtitle: "Sacred texts",
            icon: "library",
            iconType: "material",
            color: "#F43F5E",
            bgColor: isDark ? '#4c0519' : '#FFF1F2',
            route: "Library",
        },
        {
            id: 'mood-mantras',
            title: "Mood Mantras",
            subtitle: "By feeling",
            icon: "sparkles",
            iconType: "ionicons",
            color: "#EC4899",
            bgColor: isDark ? '#500724' : '#FDF2F8',
            route: "MoodMantras",
        },
        {
            id: 'sattvic-foods',
            title: "Sāttvic Foods",
            subtitle: "Pure recipes",
            icon: "silverware-fork-knife",
            iconType: "material",
            color: "#22C55E",
            bgColor: isDark ? '#052e16' : '#F0FDF4',
            route: "SattvicFoods",
        },
        {
            id: 'call-krishna',
            title: "Call Krishna",
            subtitle: "Feel connected",
            icon: "phone",
            iconType: "feather",
            color: "#3B82F6",
            bgColor: isDark ? '#172554' : '#EFF6FF',
            route: "CallKrishna",
        },
    ];

    const handleActivityPress = (route, featureId) => {
        if (route) {
            navigation.navigate(route);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <View style={styles.headerTitleRow}>
                        <View style={styles.omBadge}>
                            <Animated.Text style={[styles.omSymbol, { transform: [{ scale: headerPulse }] }]}>
                                ॐ
                            </Animated.Text>
                        </View>
                        <View>
                            <ThemedText type="title" style={styles.headerTitle}>
                                Sādhanā
                            </ThemedText>
                            <ThemedText type="small" style={styles.headerSubtitle}>
                                Your spiritual practice
                            </ThemedText>
                        </View>
                    </View>
                </View>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Animated.View style={[
                    styles.dayCheckerCard,
                    {
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                        opacity: cardAnims[0].fade,
                        transform: [{ translateY: cardAnims[0].slide }]
                    }
                ]}>
                    <View style={styles.dayCheckerHeader}>
                        <View style={[styles.dayCheckerIconContainer, { backgroundColor: colors.lightBlueBg }]}>
                            <Ionicons name="calendar-outline" size={24} color={colors.primary} />
                        </View>
                        <View>
                            <ThemedText type="heading"
                                style={[styles.dayCheckerTitle, { color: colors.foreground }]}>Day Checker</ThemedText>
                            <ThemedText style={[styles.dayCheckerSubtitle, { color: colors.mutedForeground }]}>Is it a good day?</ThemedText>
                        </View>
                    </View>

                    <ThemedText style={[styles.dayCheckerDescription, { color: colors.mutedForeground }]}>
                        Check if any date is auspicious based on Hindu Panchang - Tithi, Nakshatra, Yoga & more.
                    </ThemedText>

                    <TouchableOpacity
                        style={[styles.dateSelector, { borderColor: colors.border }]}
                        onPress={() => {
                            Haptics.selectionAsync();
                            setIsCalendarVisible(true);
                        }}
                        disabled={isCheckingDay}
                    >
                        {isCheckingDay ? (
                            <ActivityIndicator size="small" color={colors.primary} />
                        ) : (
                            <Ionicons name="calendar-outline" size={20} color={colors.primary} style={{ marginRight: 10 }} />
                        )}
                        <ThemedText style={[styles.dateSelectorText, { color: colors.foreground }]}>
                            {isCheckingDay ? "Checking..." : "Select a date to check"}
                        </ThemedText>
                    </TouchableOpacity>
                </Animated.View>

                <Animated.View
                    style={{
                        opacity: cardAnims[1].fade,
                        transform: [{ translateY: cardAnims[1].slide }]
                    }}
                >
                    <LinearGradient
                        colors={
                            isDark
                                ? ['#3b0764', '#172554', '#1e1b4b']
                                : ['#F3E8FF', '#DBEAFE', '#E0E7FF']
                        }
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.challengeCard}
                    >
                        <View style={styles.challengeHeader}>
                            <LinearGradient
                                colors={["#A855F7", "#3B82F6"]}
                                start={{ x: 0, y: 0.5 }}
                                end={{ x: 1, y: 0.5 }}
                                style={styles.challengeIconBackground}
                            >
                                <View>
                                    <ThemedText style={styles.challengeIcon}>ॐ</ThemedText>
                                </View>
                            </LinearGradient>

                            <View>
                                <ThemedText
                                    type="heading"
                                    style={[styles.challengeTitle, { color: isDark ? '#E9D5FF' : '#1e1b4b' }]}
                                >
                                    Wisdom Challenge
                                </ThemedText>
                                <ThemedText style={{ fontSize: 13, color: isDark ? '#A78BFA' : '#6B7280' }}>
                                    Test your spiritual knowledge
                                </ThemedText>
                            </View>
                        </View>
                        <ThemedText
                            style={[
                                styles.challengeDescription,
                                { color: isDark ? '#C4B5FD' : '#4B5563' },
                            ]}
                        >
                            Answer questions from Bhagavad Gita & Mahabharata to grow spiritually.
                        </ThemedText>
                        <TouchableOpacity onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                            navigation.navigate("Challenge");
                        }}>
                            <LinearGradient
                                colors={["#A855F7", "#3B82F6"]}
                                start={{ x: 0, y: 0.5 }}
                                end={{ x: 1, y: 0.5 }}
                                style={styles.challengeButtonGradient}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <MaterialCommunityIcons name="play" size={20} color="#fff" style={{ marginRight: 8 }} />
                                    <ThemedText
                                        type="defaultSemiBold"
                                        style={styles.challengeButtonText}
                                    >
                                        Start Challenge
                                    </ThemedText>
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>
                    </LinearGradient>
                </Animated.View>

                <View style={styles.mainActivitiesContainer}>
                    {mainActivities.map((activity, index) => (
                        <Animated.View
                            key={activity.id}
                            style={{
                                opacity: cardAnims[index + 2].fade,
                                transform: [{ translateY: cardAnims[index + 2].slide }]
                            }}
                        >
                            <TouchableOpacity
                                style={[styles.rowActivityCard, { backgroundColor: colors.card }]}
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    handleActivityPress(activity.route, activity.id.toUpperCase().replace(/-/g, '_'));
                                }}
                            >
                                <View style={[styles.rowIconContainer, { backgroundColor: activity.bgColor }]}>
                                    {activity.id === 'breathing' && (
                                        <Animated.View
                                            style={[
                                                styles.pulseCircle,
                                                {
                                                    backgroundColor: activity.color + '40',
                                                    transform: [{ scale: breathPulse }]
                                                }
                                            ]}
                                        />
                                    )}
                                    {activity.iconType === "feather" ? (
                                        <Feather name={activity.icon} size={24} color={activity.color} />
                                    ) : activity.iconType === "material" ? (
                                        <MaterialCommunityIcons name={activity.icon} size={24} color={activity.color} />
                                    ) : (
                                        <Ionicons name={activity.icon} size={24} color={activity.color} />
                                    )}
                                </View>
                                <View style={styles.rowTextContainer}>
                                    <ThemedText type="defaultSemiBold" style={styles.rowTitle}>
                                        {activity.title}
                                    </ThemedText>
                                    <ThemedText type="small" style={styles.rowSubtitle}>
                                        {activity.subtitle}
                                    </ThemedText>
                                </View>
                                {activity.actionText ? (
                                    <View style={[styles.rowActionBtn, { backgroundColor: colors.primary }]}>
                                        <ThemedText style={styles.rowActionText}>{activity.actionText}</ThemedText>
                                        <Feather name="arrow-right" size={16} color="#fff" />
                                    </View>
                                ) : (
                                    <Feather name="arrow-right" size={20} color={colors.primary} />
                                )}
                            </TouchableOpacity>
                        </Animated.View>
                    ))}
                </View>

                <View style={styles.morePracticesHeader}>
                    <ThemedText type="small" style={{ fontWeight: '700', letterSpacing: 1 }}>MORE PRACTICES</ThemedText>
                </View>

                <View style={styles.activitiesGrid}>
                    {morePractices.map((activity, index) => (
                        <Animated.View
                            key={activity.id}
                            style={{
                                width: "47%",
                                marginHorizontal: "1.5%",
                                marginBottom: 16,
                                opacity: cardAnims[index + 6].fade,
                                transform: [{ translateY: cardAnims[index + 6].slide }]
                            }}
                        >
                            <TouchableOpacity
                                style={[styles.activityCard, { backgroundColor: colors.card, width: '100%', marginHorizontal: 0 }]}
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    handleActivityPress(activity.route, activity.id.toUpperCase().replace(/-/g, '_'));
                                }}
                                activeOpacity={0.7}
                            >
                                <View
                                    style={[
                                        styles.iconContainer,
                                        { backgroundColor: activity.bgColor },
                                    ]}
                                >
                                    {activity.iconType === "feather" ? (
                                        <Feather
                                            name={activity.icon}
                                            size={28}
                                            color={activity.color}
                                        />
                                    ) : activity.iconType === "material" ? (
                                        <MaterialCommunityIcons
                                            name={activity.icon}
                                            size={28}
                                            color={activity.color}
                                        />
                                    ) : (
                                        <Ionicons
                                            name={activity.icon}
                                            size={28}
                                            color={activity.color}
                                        />
                                    )}
                                </View>
                                <ThemedText type="defaultSemiBold" style={styles.activityTitle}>
                                    {activity.title}
                                </ThemedText>
                                <ThemedText type="small" style={styles.activitySubtitle}>
                                    {activity.subtitle}
                                </ThemedText>
                            </TouchableOpacity>
                        </Animated.View>
                    ))}
                </View>

                <View style={styles.quoteCard}>
                    <ThemedText type="devanagari" style={[styles.quoteText, { color: colors.mutedForeground, opacity: 0.6 }]}>
                        "योग: कर्मसु कौशलम्"
                    </ThemedText>
                    <ThemedText type="small" style={{ color: colors.mutedForeground, opacity: 0.4, marginTop: 6 }}>
                        Yoga is skill in action — Gita 2.50
                    </ThemedText>
                </View>
            </ScrollView>

            <Modal
                visible={isDayResultVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setIsDayResultVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <Animated.View style={[
                        styles.modalContent,
                        {
                            backgroundColor: colors.card,
                            borderColor: colors.border,
                            padding: 20,
                            maxHeight: Dimensions.get('window').height * 0.7,
                            transform: [
                                { scale: modalScale },
                                {
                                    rotate: modalRotate.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: ['15deg', '0deg']
                                    })
                                }
                            ],
                            opacity: modalOpacity
                        }
                    ]}>
                        <TouchableOpacity
                            style={styles.closeModalBtn}
                            onPress={() => setIsDayResultVisible(false)}
                        >
                            <Ionicons name="close-circle-outline" size={28} color={colors.mutedForeground} />
                        </TouchableOpacity>

                        {muhurtaResult && (
                            isCalculating ? (
                                <View style={styles.calculatingContainer}>
                                    <SiriOrb />
                                    <ThemedText type="heading" style={[styles.calculatingTitle, { color: colors.foreground }]}>
                                        Calculating...
                                    </ThemedText>
                                    <ThemedText style={[styles.calculatingText, { color: colors.mutedForeground }]}>
                                        {loadingMessage}
                                    </ThemedText>
                                </View>
                            ) : (
                                <ScrollView showsVerticalScrollIndicator={false}>
                                    <View style={styles.resultHeader}>
                                        {(() => {
                                            const icon = getResultIcon(muhurtaResult.level);
                                            if (icon.library === 'Ionicons') return <Ionicons name={icon.name} size={relativeWidth(8)} color={icon.color} />;
                                            return <Feather name={icon.name} size={relativeWidth(8)} color={icon.color} />;
                                        })()}
                                        <ThemedText type="subtitle" style={[styles.resultDateText, { color: colors.foreground }]}>
                                            {moment(selectedDayDate).format("dddd, MMMM D, YYYY")}
                                        </ThemedText>
                                    </View>

                                    <View style={styles.scoreContainer}>
                                        <View style={styles.scoreTextRow}>
                                            <ThemedText type="subtitle" style={[styles.scoreLabel, { color: colors.foreground }]}>
                                                {muhurtaResult.label}
                                            </ThemedText>
                                            <ThemedText type="subtitle" style={[styles.scoreValue, { color: colors.foreground }]}>
                                                {displayScore}/100
                                            </ThemedText>
                                        </View>
                                        <View style={[styles.progressBarBg, { backgroundColor: isDark ? '#374151' : '#E5E7EB' }]}>
                                            <View
                                                style={[
                                                    styles.progressBarFillSmall,
                                                    {
                                                        width: `${muhurtaResult.score}%`,
                                                        backgroundColor: getScoreColor(muhurtaResult.level)
                                                    }
                                                ]}
                                            />
                                        </View>
                                    </View>

                                    <ThemedText style={[styles.resultSummary, { color: colors.mutedForeground }]}>
                                        {muhurtaResult.summary}
                                    </ThemedText>

                                    <View style={styles.factorsSection}>
                                        <ThemedText type="defaultSemiBold" style={[styles.factorsTitle, { color: colors.foreground }]}>
                                            Panchang Factors
                                        </ThemedText>

                                        {muhurtaResult.factors.map((factor, index) => {
                                            const impactColors = getImpactColor(factor.impact);
                                            return (
                                                <View key={index} style={[
                                                    styles.factorCard,
                                                    {
                                                        borderColor: isDark ? colors.border : '#E2E8F0',
                                                        backgroundColor: isDark ? colors.muted : '#F1F5F9'
                                                    }
                                                ]}>
                                                    <View style={styles.factorHeader}>
                                                        <ThemedText type="defaultSemiBold" style={{ color: colors.foreground }}>{factor.name}</ThemedText>
                                                        <View style={[styles.impactBadge, { backgroundColor: impactColors.bg }]}>
                                                            <ThemedText style={[styles.impactText, { color: impactColors.text }]}>
                                                                {factor.impact === 'positive' ? 'Favorable' : factor.impact === 'neutral' ? 'Neutral' : 'Challenging'}
                                                            </ThemedText>
                                                        </View>
                                                    </View>
                                                    <ThemedText style={[styles.factorValue, { color: colors.foreground }]}>{factor.value}</ThemedText>
                                                    <ThemedText style={[styles.factorDesc, { color: colors.mutedForeground }]}>{factor.description}</ThemedText>
                                                </View>
                                            );
                                        })}
                                    </View>

                                    <ThemedText style={[styles.disclaimerText, { color: colors.mutedForeground }]}>
                                        * Based on Hindu Panchang calculations.
                                    </ThemedText>
                                </ScrollView>
                            )
                        )}
                    </Animated.View>
                </View>
            </Modal>

            <CalendarModal
                visible={isCalendarVisible}
                onClose={() => setIsCalendarVisible(false)}
                selectedDate={selectedDayDate}
                onDateSelect={handleDaySelect}
            />

            <ComingSoonModal
                visible={isComingSoonVisible}
                onClose={() => setIsComingSoonVisible(false)}
            />
        </SafeAreaView>
    );
};

const getStyles = (colors, isDark) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        header: {
            paddingHorizontal: 20,
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderBottomColor: colors.border + "40",
            backgroundColor: colors.card,
        },
        headerContent: {
            alignItems: "flex-start",
        },
        headerTitleRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 16,
        },
        omBadge: {
            width: 44,
            height: 44,
            borderRadius: 12,
            backgroundColor: colors.primary + '15',
            borderWidth: 1,
            borderColor: colors.primary + '30',
            justifyContent: 'center',
            alignItems: 'center',
        },
        omSymbol: {
            fontSize: 20,
            color: colors.primary,
        },
        headerTitle: {
            fontSize: 24,
            fontWeight: '700',
            color: colors.foreground,
        },
        headerSubtitle: {
            fontSize: 12,
            color: colors.mutedForeground,
            marginTop: -2,
        },
        scrollContent: {
            paddingBottom: 100,
            paddingTop: 16,
        },
        dayCheckerCard: {
            marginHorizontal: 16,
            marginBottom: 16,
            padding: 20,
            borderRadius: 15,
            borderWidth: 1,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.05,
            shadowRadius: 10,
            elevation: 2,
        },
        dayCheckerHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 16,
        },
        dayCheckerIconContainer: {
            width: 48,
            height: 48,
            borderRadius: 12,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 12,
        },
        dayCheckerTitle: {
            fontSize: 20,
            fontWeight: '700',
        },
        dayCheckerSubtitle: {
            fontSize: 14,
            marginTop: -2,
        },
        dayCheckerDescription: {
            fontSize: 14,
            lineHeight: 20,
            marginBottom: 16,
        },
        dateSelector: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 14,
            borderRadius: 12,
            borderWidth: 1,
            backgroundColor: colors.muted,
        },
        dateSelectorText: {
            fontSize: 15,
            fontWeight: '500',
        },
        challengeCard: {
            marginHorizontal: 16,
            marginBottom: 24,
            padding: 20,
            borderRadius: 15,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 2,
        },
        challengeHeader: {
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 12,
        },
        challengeIconBackground: {
            width: 48,
            height: 48,
            borderRadius: 14,
            justifyContent: "center",
            alignItems: "center",
            marginRight: 16,
        },
        challengeIcon: {
            fontSize: 24,
            color: "#fff",
        },
        challengeTitle: {
            fontSize: 20,
            fontWeight: "700",
        },
        challengeDescription: {
            fontSize: 15,
            lineHeight: 22,
            marginBottom: 20,
        },
        challengeButtonGradient: {
            paddingVertical: 14,
            borderRadius: 14,
            alignItems: "center",
        },
        challengeButtonText: {
            color: "#fff",
            fontSize: 16,
            fontWeight: "700",
        },
        mainActivitiesContainer: {
            paddingHorizontal: 16,
            marginBottom: 24,
        },
        rowActivityCard: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 16,
            borderRadius: 15,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: colors.border + '30',
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 5,
            elevation: 0.5,
        },
        rowIconContainer: {
            width: 52,
            height: 52,
            borderRadius: 25,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 16,
        },
        rowTextContainer: {
            flex: 1,
        },
        rowTitle: {
            fontSize: 17,
            fontWeight: '700',
        },
        rowSubtitle: {
            fontSize: 13,
            marginTop: 2,
        },
        pulseCircle: {
            position: 'absolute',
            width: 38,
            height: 38,
            borderRadius: 19,
        },
        rowActionBtn: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 20,
            gap: 4,
        },
        rowActionText: {
            color: '#fff',
            fontSize: 13,
            fontWeight: '700',
        },
        morePracticesHeader: {
            paddingHorizontal: 20,
            marginBottom: 16,
        },
        activitiesGrid: {
            flexDirection: "row",
            flexWrap: "wrap",
            paddingHorizontal: 12,
            justifyContent: "space-between",
        },
        activityCard: {
            width: "47%",
            marginHorizontal: "1.5%",
            marginBottom: 16,
            padding: 20,
            borderRadius: 15,
            alignItems: "flex-start",
            borderWidth: 1,
            borderColor: colors.border + "20",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 5,
            elevation: 0.5,
        },
        iconContainer: {
            width: 52,
            height: 52,
            borderRadius: 14,
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 16,
        },
        activityTitle: {
            fontSize: 16,
            fontWeight: '700',
            marginBottom: 4,
        },
        activitySubtitle: {
            fontSize: 13,
        },
        quoteCard: {
            marginTop: 32,
            paddingVertical: 40,
            paddingHorizontal: 40,
            alignItems: "center",
        },
        quoteText: {
            fontSize: 20,
            textAlign: "center",
            lineHeight: 30,
        },
        modalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.6)',
            justifyContent: 'center',
            alignItems: 'center',
        },
        modalContent: {
            width: '90%',
            borderRadius: 28,
            borderWidth: 1,
            overflow: 'hidden',
        },
        closeModalBtn: {
            position: 'absolute',
            top: 15,
            right: 15,
            zIndex: 10,
        },
        calculatingContainer: {
            height: 340,
            justifyContent: 'center',
            alignItems: 'center',
            gap: 16,
        },
        calculatingTitle: {
            fontSize: 22,
            marginBottom: 2,
        },
        calculatingText: {
            fontSize: 14,
            textAlign: 'center',
            paddingHorizontal: 20,
        },
        resultHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 20,
            marginTop: 10,
        },
        resultDateText: {
            marginLeft: 12,
            fontSize: 14,
            fontWeight: '600',
        },
        scoreContainer: {
            marginBottom: 24,
        },
        scoreTextRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: 8,
        },
        scoreLabel: {
            fontSize: 24,
            fontWeight: 'bold',
        },
        scoreValue: {
            fontSize: 14,
            fontWeight: '600',
        },
        progressBarBg: {
            height: 12,
            borderRadius: 6,
            overflow: 'hidden',
        },
        progressBarFillSmall: {
            height: '100%',
        },
        resultSummary: {
            fontSize: 15,
            lineHeight: 22,
            marginBottom: 24,
        },
        factorsSection: {
            marginBottom: 20,
        },
        factorsTitle: {
            fontSize: 18,
            marginBottom: 16,
        },
        factorCard: {
            padding: 16,
            borderRadius: 16,
            borderWidth: 1,
            marginBottom: 12,
        },
        factorHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 8,
        },
        impactBadge: {
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 8,
        },
        impactText: {
            fontSize: 11,
            fontWeight: '700',
        },
        factorValue: {
            fontSize: 16,
            fontWeight: '600',
            marginBottom: 4,
        },
        factorDesc: {
            fontSize: 13,
            lineHeight: 18,
        },
        disclaimerText: {
            fontSize: 11,
            textAlign: 'center',
            fontStyle: 'italic',
            marginTop: 10,
        },
    });

export default SadhanaScreen;