import { Feather, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    ScrollView, 
    StatusBar,
    StyleSheet,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { ThemedText } from "../../components/ThemedText";
import { useTheme } from "../../context/ThemeContext";

const { width } = Dimensions.get("window");

export default function NotificationPermissionScreen({ navigation }) {
    const { colors, isDark } = useTheme();
    const [isLoading, setIsLoading] = useState(false);
    const { session } = useSelector((state) => state.user);
    const dispatch = useDispatch();

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

    const handleEnableNotifications = async () => {
        setIsLoading(true);
        
        setTimeout(async () => {
            setIsLoading(false);
            await completeOnboarding();
            
        }, 1500);
    };

    const handleSkip = async () => {
        await completeOnboarding();
        
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
            {}
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

                {}
                <View style={styles.header}>
                    <View style={[styles.iconContainer, { backgroundColor: colors.primary }]}>
                        <Feather name="bell" size={48} color={isDark ? "#000" : "#fff"} />
                        <View style={[styles.sparkleBadge, {
                            backgroundColor: colors.secondary || "#FBBF24",
                            borderColor: colors.background
                        }]}>
                            <Ionicons name="sparkles" size={12} color={colors.foreground} />
                        </View>
                    </View>

                    <ThemedText style={[styles.title, { color: colors.foreground }]}>Stay Inspired Daily</ThemedText>
                    <ThemedText style={[styles.subtitle, { color: colors.mutedForeground }]}>
                        Enable notifications to receive a new sacred shloka each day, bringing wisdom and peace to your daily routine.
                    </ThemedText>
                </View>

                {}
                <View style={[styles.card, {
                    borderColor: colors.border,
                    backgroundColor: colors.card
                }]}>
                    <ThemedText style={[styles.cardTitle, { color: colors.foreground }]}>Daily Spiritual Nourishment</ThemedText>

                    <View style={styles.benefitRow}>
                        <View style={[styles.bullet, { backgroundColor: colors.primary }]} />
                        <ThemedText style={[styles.benefitText, { color: colors.mutedForeground }]}>
                            Receive a carefully selected shloka each morning
                        </ThemedText>
                    </View>

                    <View style={styles.benefitRow}>
                        <View style={[styles.bullet, { backgroundColor: "#FBBF24" }]} />
                        <ThemedText style={[styles.benefitText, { color: colors.mutedForeground }]}>
                            Start your day with ancient wisdom and reflection
                        </ThemedText>
                    </View>

                    <View style={styles.benefitRow}>
                        <View style={[styles.bullet, { backgroundColor: colors.primary }]} />
                        <ThemedText style={[styles.benefitText, { color: colors.mutedForeground }]}>
                            Build a consistent spiritual practice effortlessly
                        </ThemedText>
                    </View>
                </View>

                {}
                <View style={styles.actions}>
                    <TouchableOpacity
                        style={[styles.enableBtn, { backgroundColor: colors.primary }]}
                        onPress={handleEnableNotifications}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color={isDark ? "#000" : "#fff"} style={{ marginRight: 8 }} />
                        ) : (
                            <Feather name="bell" size={20} color={isDark ? "#000" : "#fff"} style={{ marginRight: 8 }} />
                        )}
                        <ThemedText style={[styles.enableBtnText, { color: isDark ? "#000" : "#fff" }]}>
                            {isLoading ? "Enabling..." : "Enable Notifications"}
                        </ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.skipBtn}
                        onPress={handleSkip}
                        disabled={isLoading}
                    >
                        <Feather name="bell-off" size={18} color={colors.mutedForeground} style={{ marginRight: 8 }} />
                        <ThemedText style={{ color: colors.mutedForeground, fontWeight: "600" }}>Skip for now</ThemedText>
                    </TouchableOpacity>

                    <ThemedText style={[styles.privacyText, { color: colors.mutedForeground }]}>
                        We respect your privacy. Notifications contain only spiritual content and can be disabled anytime in your device settings.
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
    content: {
        
        padding: 24,
        paddingTop: 40, 
        paddingBottom: 40, 
        alignItems: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: '10%',
    },
    iconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
        position: 'relative',
    },
    sparkleBadge: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 16,
        textAlign: 'center',
    },
    subtitle: {
        textAlign: 'center',
        lineHeight: 24,
        fontSize: 15,
        paddingHorizontal: 10,
    },
    card: {
        width: '100%',
        padding: 24,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 32,
    },
    cardTitle: {
        textAlign: 'center',
        marginBottom: 24,
        fontSize: 16,
        fontWeight: '600',
    },
    benefitRow: {
        flexDirection: 'row',
        marginBottom: 16,
        alignItems: 'flex-start',
    },
    bullet: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginTop: 6,
        marginRight: 12,
    },
    benefitText: {
        flex: 1,
        lineHeight: 20,
        fontSize: 14,
    },
    actions: {
        width: '100%',
        gap: 15,
    },
    enableBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 8,
        gap: 8,
        width: '80%',
        marginBottom: 16,
    },
    enableBtnText: {
        fontWeight: '600',
        fontSize: 14,
    },
    skipBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
        width: '100%',
    },
    privacyText: {
        textAlign: 'center',
        fontSize: 12,
        marginTop: 8,
        lineHeight: 18,
    }
});