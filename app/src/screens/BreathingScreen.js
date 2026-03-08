import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import { Dimensions, StyleSheet, TouchableOpacity, View } from "react-native";
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "../components/ThemedText";
import { useTheme } from "../context/ThemeContext";

const { width } = Dimensions.get("window");

const BreathingScreen = ({ navigation }) => {
    const { colors } = useTheme();

    const scale = useSharedValue(1);
    const opacity = useSharedValue(0.4);

    useEffect(() => {
        
        scale.value = withRepeat(
            withTiming(1.8, {
                duration: 4000,
                easing: Easing.inOut(Easing.ease),
            }),
            -1,
            true
        );

        opacity.value = withRepeat(
            withTiming(0.1, {
                duration: 4000,
                easing: Easing.inOut(Easing.ease),
            }),
            -1,
            true
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }));

    const innerAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value * 0.6 }],
    }));

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            {}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.foreground} />
                </TouchableOpacity>
                <ThemedText type="subtitle" style={styles.headerTitle}>
                    Breathing
                </ThemedText>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.content}>
                {}
                <View style={styles.animationContainer}>
                    {}
                    <Animated.View
                        style={[
                            styles.breathRing,
                            { borderColor: colors.primary, borderWidth: 1 },
                            animatedStyle,
                        ]}
                    />
                    <Animated.View
                        style={[
                            styles.breathRing,
                            { borderColor: colors.primary, borderWidth: 0.5, opacity: 0.05 },
                            { transform: [{ scale: scale.value * 1.4 }] }
                        ]}
                    />

                    {}
                    <Animated.View
                        style={[
                            styles.mainOrb,
                            { backgroundColor: colors.primary },
                            innerAnimatedStyle,
                        ]}
                    />

                    {}
                    <View style={[styles.glow, { backgroundColor: colors.primary + '20' }]} />
                </View>

                {}
                <View style={styles.textContainer}>
                    <ThemedText type="title" style={styles.comingSoonText}>
                        Coming Soon
                    </ThemedText>
                    <ThemedText style={[styles.subtitle, { color: colors.mutedForeground }]}>
                        We are crafting a mindful experience to help you balance your breath and find deep inner peace.
                    </ThemedText>
                </View>

                <View style={styles.footer}>
                    <ThemedText type="devanagari" style={[styles.footerText, { color: colors.primary + '60' }]}>
                        प्राणायाम · Prāṇāyāma
                    </ThemedText>
                </View>
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
    headerTitle: {
        fontWeight: "600",
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 20,
    },
    content: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 40,
        paddingBottom: 60,
    },
    animationContainer: {
        width: width * 0.8,
        height: width * 0.8,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 60,
    },
    mainOrb: {
        width: 120,
        height: 120,
        borderRadius: 60,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 10,
        position: 'absolute',
    },
    breathRing: {
        position: "absolute",
        width: 160,
        height: 160,
        borderRadius: 80,
    },
    glow: {
        width: 200,
        height: 200,
        borderRadius: 100,
        position: 'absolute',
        zIndex: -1,
    },
    textContainer: {
        alignItems: "center",
    },
    comingSoonText: {
        fontSize: 34,
        fontWeight: "700",
        marginBottom: 16,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 16,
        textAlign: "center",
        lineHeight: 24,
        opacity: 0.8,
    },
    footer: {
        position: "absolute",
        bottom: 50,
    },
    footerText: {
        fontSize: 18,
        letterSpacing: 3,
        textAlign: 'center',
    },
});

export default BreathingScreen;
