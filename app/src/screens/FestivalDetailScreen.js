import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
    Dimensions,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, {
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '../components/ThemedText';
import { useTheme } from '../context/ThemeContext';
import { festivalDetails } from '../data/festivalData';
import { calculateFestivalsForYear } from '../utils/hinduFestivals';

const { width } = Dimensions.get('window');

const AnimatedSection = ({ children, delay = 0 }) => {
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(20);

    useEffect(() => {
        opacity.value = withDelay(delay, withTiming(1, { duration: 500 }));
        translateY.value = withDelay(delay, withSpring(0, { damping: 20 }));
    }, [delay]);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateY: translateY.value }],
    }));

    return <Animated.View style={animatedStyle}>{children}</Animated.View>;
};

const SectionHeader = ({ icon, title, color, iconType = 'feather', gradient }) => {
    const { colors, typography } = useTheme();

    return (
        <View style={styles.sectionHeaderOuter}>
            {gradient && (
                <LinearGradient
                    colors={gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={StyleSheet.absoluteFill}
                />
            )}
            <View style={styles.sectionHeaderContainer}>
                <View style={[styles.sectionIconBg, { backgroundColor: gradient ? 'rgba(255,255,255,0.2)' : color + '15' }]}>
                    {iconType === 'feather' ? (
                        <Feather name={icon} size={16} color={gradient ? color : color} />
                    ) : iconType === 'material' ? (
                        <MaterialCommunityIcons name={icon} size={18} color={gradient ? color : color} />
                    ) : (
                        <Ionicons name={icon} size={18} color={gradient ? color : color} />
                    )}
                </View>
                <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: typography.family.sansBold }]}>
                    {title}
                </Text>
            </View>
        </View>
    );
};

const MantraAccordion = ({ mantra }) => {
    const { colors, typography } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const progress = useSharedValue(0);

    const toggle = () => {
        setIsOpen(!isOpen);
        progress.value = withSpring(isOpen ? 0 : 1);
    };

    const contentStyle = useAnimatedStyle(() => ({
        height: interpolate(progress.value, [0, 1], [0, 180]), 
        opacity: interpolate(progress.value, [0, 1], [0, 1]),
        overflow: 'hidden',
    }));

    const arrowStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${progress.value * 180}deg` }],
    }));

    return (
        <View style={[styles.mantraCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TouchableOpacity
                onPress={toggle}
                activeOpacity={0.7}
                style={styles.mantraHeader}
            >
                <View style={styles.mantraHeaderMain}>
                    <Text style={[styles.mantraSanskrit, { fontFamily: typography.family.sansBold }]}>{mantra.sanskrit}</Text>
                    <Text style={[styles.mantraTrans, { color: colors.mutedForeground, fontFamily: typography.family.sansSemiBold }]}>
                        {mantra.transliteration}
                    </Text>
                </View>
                <Animated.View style={arrowStyle}>
                    <Feather name="chevron-down" size={20} color={colors.mutedForeground} />
                </Animated.View>
            </TouchableOpacity>

            <Animated.View style={contentStyle}>
                <View style={styles.mantraDetails}>
                    <View style={[styles.mantraDivider, { backgroundColor: colors.border }]} />
                    <Text style={[styles.mantraMetaLabel, { fontFamily: typography.family.sansBold }]}>MEANING</Text>
                    <Text style={[styles.mantraText, { color: colors.foreground, fontFamily: typography.family.sansSemiBold }]}>
                        {mantra.meaning}
                    </Text>
                    <Text style={[styles.mantraMetaLabel, { fontFamily: typography.family.sansBold }]}>SIGNIFICANCE</Text>
                    <Text style={[styles.mantraText, { color: colors.mutedForeground, fontFamily: typography.family.sansSemiBold }]}>
                        {mantra.significance}
                    </Text>
                </View>
            </Animated.View>
        </View>
    );
};

const FestivalDetailScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { colors, isDark, typography } = useTheme();
    const festivalId = route.params?.festivalId;

    const festival = festivalId ? festivalDetails[festivalId] : null;

    if (!festival) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
                <ThemedText>Festival not found</ThemedText>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
                    <ThemedText color={colors.primary}>Go Back</ThemedText>
                </TouchableOpacity>
            </View>
        );
    }

    const currentYear = new Date().getFullYear();
    const festivals = [...calculateFestivalsForYear(currentYear), ...calculateFestivalsForYear(currentYear + 1)];
    const festivalItem = festivals.find(f => f.name === festival.name);
    const festivalDate = festivalItem?.date;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar style={isDark ? "light" : "dark"} />

            {}
            <View style={[styles.stickyHeader, { borderBottomColor: colors.border }]}>
                <BlurView intensity={Platform.OS === 'ios' ? 80 : 100} tint={isDark ? "dark" : "light"} style={StyleSheet.absoluteFill} />
                <SafeAreaView edges={['top']} style={styles.headerInner}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                    >
                        <Feather name="arrow-left" size={24} color={colors.foreground} />
                    </TouchableOpacity>
                    <View style={styles.headerTitleContainer}>
                        <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: typography.family.sansBold }]}>
                            {festival.name}
                        </Text>
                        <Text style={[styles.headerSubtitle, { color: colors.mutedForeground, fontFamily: typography.family.sansSemiBold }]}>
                            {festival.sanskritName} · {festival.subtitle}
                        </Text>
                    </View>
                </SafeAreaView>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {}
                <AnimatedSection delay={100}>
                    <LinearGradient
                        colors={festival.heroGradient}
                        style={styles.heroSection}
                    >
                        {}
                        <View style={[styles.heroEmojiContainer, { backgroundColor: isDark ? '#1e293b' : '#FFFFFF' }]}>
                            <Text style={styles.heroEmojiText}>{festival.heroEmoji}</Text>
                        </View>
                        <Text style={[styles.heroTitle, { color: colors.foreground, fontFamily: typography.family.sansBold }]}>
                            {festival.subtitle}
                        </Text>
                        <Text style={[styles.heroDesc, { color: colors.mutedForeground, fontFamily: typography.family.sansSemiBold }]}>
                            The most auspicious time for spiritual practice and devotion
                        </Text>
                    </LinearGradient>
                </AnimatedSection>

                <View style={styles.contentPadding}>

                    {}
                    {festivalDate && (
                        <AnimatedSection delay={200}>
                            <View style={[styles.dateBanner, { backgroundColor: isDark ? colors.card : '#fff7ed', borderColor: isDark ? colors.border : '#ffedd5' }]}>
                                <View style={[styles.dateIconContainer, { backgroundColor: isDark ? colors.muted + '20' : '#ffedd5' }]}>
                                    <Feather name="calendar" size={24} color="#d97706" />
                                </View>
                                <View>
                                    <Text style={[styles.dateLabel, { fontFamily: typography.family.sansBold }]}>FESTIVAL DATE</Text>
                                    <Text style={[styles.dateValue, { color: colors.foreground, fontFamily: typography.family.sansBold }]}>
                                        {festivalDate.toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            month: 'long',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </Text>
                                </View>
                            </View>
                        </AnimatedSection>
                    )}

                    {}
                    {festival.timing && (
                        <AnimatedSection delay={300}>
                            <View style={[styles.cardWrapper, { backgroundColor: isDark ? colors.card : '#FFFFFF', borderColor: colors.border, borderWidth: 1 }]}>
                                <SectionHeader
                                    icon="clock-outline"
                                    title="Observance Timing"
                                    color="#10b981"
                                    iconType="material"
                                    gradient={isDark ? undefined : ['rgba(16, 185, 129, 0.12)', 'rgba(20, 184, 166, 0.06)', 'rgba(16, 185, 129, 0.12)']}
                                />
                                <View style={styles.cardContent}>
                                    <View style={[styles.rowItem, { backgroundColor: colors.muted + '10', borderColor: colors.border, borderWidth: 0.5 }]}>
                                        <View style={[styles.rowIcon, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                                            <Ionicons name="play" size={14} color="#10b981" style={{ marginLeft: 2 }} />
                                        </View>
                                        <View style={styles.rowTextWrap}>
                                            <Text style={[styles.rowLabel, { fontFamily: typography.family.sansBold }]}>FASTING STARTS</Text>
                                            <Text style={[styles.rowValue, { color: colors.foreground, fontFamily: typography.family.sansSemiBold }]}>
                                                {festival.timing.fastingStarts}
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={[styles.rowItem, { backgroundColor: colors.muted + '10', borderColor: colors.border, borderWidth: 0.5 }]}>
                                        <View style={[styles.rowIcon, { backgroundColor: 'rgba(244, 63, 94, 0.1)' }]}>
                                            <Ionicons name="pause" size={14} color="#f43f5e" />
                                        </View>
                                        <View style={styles.rowTextWrap}>
                                            <Text style={[styles.rowLabel, { fontFamily: typography.family.sansBold }]}>FASTING ENDS</Text>
                                            <Text style={[styles.rowValue, { color: colors.foreground, fontFamily: typography.family.sansSemiBold }]}>
                                                {festival.timing.fastingEnds}
                                            </Text>
                                        </View>
                                    </View>

                                    {festival.timing.peakTime && (
                                        <View style={[styles.rowItemHighlight, { backgroundColor: 'rgba(245, 158, 11, 0.05)', borderColor: '#fde68a' }]}>
                                            <View style={[styles.rowIcon, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
                                                <Ionicons name="sparkles" size={14} color="#f59e0b" />
                                            </View>
                                            <View style={styles.rowTextWrap}>
                                                <Text style={[styles.rowLabelHighlight, { fontFamily: typography.family.sansBold }]}>PEAK WORSHIP TIME</Text>
                                                <Text style={[styles.rowValueHighlight, { color: colors.foreground, fontFamily: typography.family.sansSemiBold }]}>
                                                    {festival.timing.peakTime}
                                                </Text>
                                            </View>
                                        </View>
                                    )}
                                </View>
                            </View>
                        </AnimatedSection>
                    )}

                    {}
                    <AnimatedSection delay={400}>
                        <View style={[styles.cardWrapper, styles.significanceShadow, { backgroundColor: isDark ? colors.card : '#FFFFFF', borderColor: colors.border, borderWidth: 1 }]}>
                            <SectionHeader
                                icon="lightning-bolt"
                                title="Significance"
                                color="#6366f1"
                                iconType="material"
                                gradient={isDark ? undefined : ['rgba(99, 102, 241, 0.12)', 'rgba(168, 85, 247, 0.06)', 'rgba(99, 102, 241, 0.12)']}
                            />
                            <View style={styles.cardContent}>
                                <Text style={[styles.significanceText, { color: colors.mutedForeground, fontFamily: typography.family.sansSemiBold }]}>
                                    {festival.significance}
                                </Text>
                                <View style={styles.lunarGrid}>
                                    <View style={[styles.lunarItem, { backgroundColor: colors.muted + '05', borderColor: colors.border }]}>
                                        <View style={styles.lunarIconHeader}>
                                            <Feather name="moon" size={12} color="#6366f1" />
                                            <Text style={[styles.lunarLabel, { fontFamily: typography.family.sansBold }]}>LUNAR DAY</Text>
                                        </View>
                                        <Text style={[styles.lunarValue, { color: colors.foreground, fontFamily: typography.family.sansBold }]}>
                                            {festival.lunarTiming}
                                        </Text>
                                    </View>
                                    <View style={[styles.lunarItem, { backgroundColor: colors.muted + '05', borderColor: colors.border }]}>
                                        <View style={styles.lunarIconHeader}>
                                            <Feather name="calendar" size={12} color="#f59e0b" />
                                            <Text style={[styles.lunarLabel, { fontFamily: typography.family.sansBold }]}>MONTH</Text>
                                        </View>
                                        <Text style={[styles.lunarValue, { color: colors.foreground, fontFamily: typography.family.sansBold }]}>
                                            {festival.month}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </AnimatedSection>

                    {}
                    <AnimatedSection delay={500}>
                        <View style={[styles.cardWrapper, { backgroundColor: isDark ? colors.card : '#FFFFFF', borderColor: colors.border, borderWidth: 1 }]}>
                            <SectionHeader
                                icon="fire"
                                title="Sacred Rituals"
                                color="#f59e0b"
                                iconType="material"
                                gradient={isDark ? undefined : ['rgba(245, 158, 11, 0.12)', 'rgba(249, 115, 22, 0.06)', 'rgba(245, 158, 11, 0.12)']}
                            />
                            <View style={styles.cardContent}>
                                <View style={styles.ritualsGrid}>
                                    {festival.rituals.map((ritual, idx) => (
                                        <View key={idx} style={[styles.ritualCard, { backgroundColor: colors.muted + '05', borderColor: colors.border }]}>
                                            <View style={[styles.ritualIconCircle, { backgroundColor: colors.card }]}>
                                                <MaterialCommunityIcons
                                                    name={ritual.iconType === 'clock' ? 'clock-outline' :
                                                        ritual.iconType === 'flame' ? 'fire' :
                                                            ritual.iconType === 'music' ? 'music-clef-treble' :
                                                                ritual.iconType === 'heart' ? 'heart-outline' :
                                                                    ritual.iconType === 'moon' ? 'moon-waning-crescent' :
                                                                        ritual.iconType === 'sun' ? 'white-balance-sunny' :
                                                                            ritual.iconType === 'book' ? 'book-open-variant' : 'flower-outline'}
                                                    size={20}
                                                    color={ritual.iconType === 'clock' ? '#6366f1' :
                                                        ritual.iconType === 'flame' ? '#f59e0b' :
                                                            ritual.iconType === 'music' ? '#f43f5e' :
                                                                ritual.iconType === 'heart' ? '#10b981' :
                                                                    ritual.iconType === 'moon' ? '#3b82f6' :
                                                                        ritual.iconType === 'sun' ? '#f97316' :
                                                                            ritual.iconType === 'book' ? '#a855f7' : '#ec4899'}
                                                />
                                            </View>
                                            <Text style={[styles.ritualTitle, { color: colors.foreground, fontFamily: typography.family.sansBold }]}>
                                                {ritual.title}
                                            </Text>
                                            <Text style={[styles.ritualDesc, { color: colors.mutedForeground, fontFamily: typography.family.sansSemiBold }]}>
                                                {ritual.description}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        </View>
                    </AnimatedSection>

                    {}
                    {festival.prahars && (
                        <AnimatedSection delay={600}>
                            <View style={styles.sectionHeadingContainer}>
                                <Feather name="clock" size={18} color="#6366f1" />
                                <Text style={[styles.sectionHeading, { color: colors.foreground, fontFamily: typography.family.sansBold }]}>
                                    Night Watches (Prahars)
                                </Text>
                            </View>
                            <View style={[styles.praharsList, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                {festival.prahars.map((prahar, idx) => (
                                    <View key={idx} style={[styles.praharItem, idx !== festival.prahars.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
                                        <View style={[styles.praharNumber, { backgroundColor: '#f5f3ff' }]}>
                                            <Text style={[styles.praharNumberText, { fontFamily: typography.family.sansBold }]}>{idx + 1}</Text>
                                        </View>
                                        <View style={styles.praharInfo}>
                                            <Text style={[styles.praharTime, { color: colors.foreground, fontFamily: typography.family.sansBold }]}>
                                                {prahar.time}
                                            </Text>
                                            <Text style={[styles.praharDeity, { color: colors.mutedForeground, fontFamily: typography.family.sansSemiBold }]}>
                                                {prahar.deity}
                                            </Text>
                                        </View>
                                        <View style={[styles.offeringBadge, { backgroundColor: colors.muted + '20', borderColor: colors.border }]}>
                                            <Text style={[styles.offeringText, { color: colors.mutedForeground, fontFamily: typography.family.sansBold }]}>
                                                {prahar.offering}
                                            </Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </AnimatedSection>
                    )}

                    {}
                    <AnimatedSection delay={700}>
                        <View style={styles.sectionHeadingContainer}>
                            <Feather name="book-open" size={18} color="#f59e0b" />
                            <Text style={[styles.sectionHeading, { color: colors.foreground, fontFamily: typography.family.sansBold }]}>
                                Sacred Mantras
                            </Text>
                        </View>
                        {festival.mantras.map((mantra, idx) => (
                            <MantraAccordion key={idx} mantra={mantra} />
                        ))}
                    </AnimatedSection>

                    {}
                    <AnimatedSection delay={800}>
                        <View style={[styles.benefitsCard, { borderColor: '#fef3c7', borderWidth: 1 }]}>
                            <LinearGradient
                                colors={isDark ? [colors.card, colors.card] : ['#fffbeb', '#fff7ed']}
                                style={StyleSheet.absoluteFill}
                            />
                            <View style={styles.benefitsHeader}>
                                <Feather name="heart" size={20} color="#f43f5e" />
                                <Text style={[styles.benefitsTitle, { color: colors.foreground, fontFamily: typography.family.sansBold }]}>
                                    Benefits of Observance
                                </Text>
                            </View>
                            {festival.benefits.map((benefit, idx) => (
                                <View key={idx} style={styles.benefitRow}>
                                    <View style={[styles.benefitDot, { backgroundColor: '#f59e0b' }]} />
                                    <Text style={[styles.benefitText, { color: colors.mutedForeground, fontFamily: typography.family.sansSemiBold }]}>
                                        {benefit}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </AnimatedSection>

                    {}
                    <AnimatedSection delay={900}>
                        <View style={styles.quoteContainer}>
                            <Text style={[styles.quoteSanskrit, { color: '#6366f1', fontFamily: typography.family.sansBold }]}>
                                "{festival.quote.sanskrit}"
                            </Text>
                            <Text style={[styles.quoteTranslation, { color: colors.mutedForeground, fontFamily: typography.family.sansSemiBold }]}>
                                {festival.quote.translation}
                            </Text>
                        </View>
                    </AnimatedSection>

                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    stickyHeader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        borderBottomWidth: 0.5,
    },
    headerInner: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButton: {
        padding: 8,
        marginRight: 8,
    },
    headerTitleContainer: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 18,
    },
    headerSubtitle: {
        fontSize: 12,
    },
    scrollContent: {
        paddingTop: 100,
        paddingBottom: 60,
    },
    heroSection: {
        alignItems: 'center',
        paddingTop: 30,
        paddingBottom: 40,
        paddingHorizontal: 20,
    },
    heroEmojiContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
        ...Platform.select({
            ios: {
                shadowColor: "#6366f1",
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.15,
                shadowRadius: 20,
            },
            android: {
                elevation: 10,
            },
        }),
    },
    heroEmojiText: {
        fontSize: 50,
    },
    heroTitle: {
        fontSize: 28,
        textAlign: 'center',
        marginBottom: 10,
        letterSpacing: -0.5,
    },
    heroDesc: {
        fontSize: 14,
        textAlign: 'center',
        maxWidth: '85%',
        lineHeight: 20,
    },
    contentPadding: {
        paddingHorizontal: 16,
    },
    dateBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 18,
        borderWidth: 1,
        marginBottom: 20,
    },
    dateIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    dateLabel: {
        fontSize: 10,
        color: '#b45309',
        letterSpacing: 1,
        marginBottom: 2,
    },
    dateValue: {
        fontSize: 17,
    },
    cardWrapper: {
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 20,
    },
    significanceShadow: {
        ...Platform.select({
            ios: {
                shadowColor: "#6366f1",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.08,
                shadowRadius: 15,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    cardHeader: {
        paddingVertical: 4,
    },
    sectionHeaderOuter: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 0.5,
        borderBottomColor: 'rgba(0,0,0,0.05)',
        overflow: 'hidden',
    },
    sectionHeaderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        zIndex: 1,
    },
    sectionIconBg: {
        width: 32,
        height: 32,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    sectionTitle: {
        fontSize: 15,
    },
    cardContent: {
        padding: 12,
        paddingTop: 12,
    },
    rowItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 14,
        marginBottom: 10,
    },
    rowItemHighlight: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 14,
        borderWidth: 1,
    },
    rowIcon: {
        width: 34,
        height: 34,
        borderRadius: 17,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    rowTextWrap: {
        flex: 1,
    },
    rowLabel: {
        fontSize: 10,
        color: '#64748b',
        letterSpacing: 0.8,
        marginBottom: 2,
    },
    rowLabelHighlight: {
        fontSize: 10,
        color: '#b45309',
        letterSpacing: 0.8,
        marginBottom: 2,
    },
    rowValue: {
        fontSize: 15,
    },
    rowValueHighlight: {
        fontSize: 15,
    },
    significanceText: {
        fontSize: 15,
        lineHeight: 24,
        paddingHorizontal: 4,
        marginBottom: 16,
    },
    lunarGrid: {
        flexDirection: 'row',
        gap: 10,
    },
    lunarItem: {
        flex: 1,
        padding: 14,
        borderRadius: 16,
        borderWidth: 1,
    },
    lunarIconHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 6,
    },
    lunarLabel: {
        fontSize: 9,
        color: '#475569',
        letterSpacing: 0.5,
    },
    lunarValue: {
        fontSize: 14,
    },
    ritualsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    ritualCard: {
        width: (width - 60) / 2, 
        padding: 14,
        borderRadius: 18,
        borderWidth: 1,
        marginBottom: 10,
    },
    ritualIconCircle: {
        width: 40,
        height: 40,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    ritualTitle: {
        fontSize: 14,
        marginBottom: 6,
    },
    ritualDesc: {
        fontSize: 11.5,
        lineHeight: 17,
    },
    sectionHeadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginTop: 10,
        marginBottom: 16,
        paddingHorizontal: 4,
    },
    sectionHeading: {
        fontSize: 17,
    },
    praharsList: {
        borderRadius: 20,
        borderWidth: 1,
        marginBottom: 24,
        overflow: 'hidden',
    },
    praharItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    praharNumber: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    praharNumberText: {
        fontSize: 14,
        color: '#6366f1',
    },
    praharInfo: {
        flex: 1,
    },
    praharTime: {
        fontSize: 15,
    },
    praharDeity: {
        fontSize: 12,
    },
    offeringBadge: {
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 10,
        borderWidth: 1,
    },
    offeringText: {
        fontSize: 10,
    },
    mantraCard: {
        borderRadius: 18,
        borderWidth: 1,
        marginBottom: 12,
        overflow: 'hidden',
    },
    mantraHeader: {
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    mantraHeaderMain: {
        flex: 1,
    },
    mantraSanskrit: {
        fontSize: 18,
        color: '#d97706',
        marginBottom: 4,
    },
    mantraTrans: {
        fontSize: 14,
        fontStyle: 'italic',
    },
    mantraDetails: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    mantraDivider: {
        height: 1,
        marginBottom: 12,
    },
    mantraMetaLabel: {
        fontSize: 9,
        color: '#94a3b8',
        letterSpacing: 1.5,
        marginBottom: 6,
    },
    mantraText: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 14,
    },
    benefitsCard: {
        padding: 24,
        borderRadius: 24,
        marginBottom: 30,
        overflow: 'hidden',
        position: 'relative',
    },
    benefitsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
    },
    benefitsTitle: {
        fontSize: 16,
    },
    benefitRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    benefitDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginTop: 6,
    },
    benefitText: {
        fontSize: 14,
        lineHeight: 20,
        flex: 1,
    },
    quoteContainer: {
        alignItems: 'center',
        paddingVertical: 20,
        marginBottom: 40,
    },
    quoteSanskrit: {
        fontSize: 20,
        fontStyle: 'italic',
        textAlign: 'center',
        marginBottom: 8,
    },
    quoteTranslation: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 22,
    },
});

export default FestivalDetailScreen;
