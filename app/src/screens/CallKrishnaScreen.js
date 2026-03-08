import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import {
    Animated,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "../components/ThemedText";

const CallKrishnaScreen = ({ navigation }) => {
    const [callState, setCallState] = useState("ringing");
    const [callDuration, setCallDuration] = useState(0);
    const [showMessage, setShowMessage] = useState(false);

    const ringAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const soundRef = useRef(null);

    useEffect(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        Animated.loop(
            Animated.sequence([
                Animated.timing(ringAnim, {
                    toValue: 1,
                    duration: 1500,
                    useNativeDriver: true,
                }),
                Animated.timing(ringAnim, {
                    toValue: 0,
                    duration: 0,
                    useNativeDriver: true,
                })
            ])
        ).start();

        const ringTimeout = setTimeout(() => {
            setCallState("connected");
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }, 2000);

        return () => {
            clearTimeout(ringTimeout);
            
            if (soundRef.current) {
                soundRef.current.unloadAsync().catch(err => console.log('Sound cleanup error:', err));
                soundRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        let interval;
        if (callState === "connected") {
            interval = setInterval(() => {
                setCallDuration((prev) => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [callState]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    const playEndingSound = async () => {
        try {
            
            if (soundRef.current) {
                await soundRef.current.unloadAsync();
                soundRef.current = null;
            }

            const { sound } = await Audio.Sound.createAsync(
                require("../../../assets/sounds/temple-bell.mp3") 
            );
            soundRef.current = sound;
            await sound.playAsync();

            sound.setOnPlaybackStatusUpdate(async (status) => {
                if (status.didJustFinish) {
                    await sound.unloadAsync();
                    soundRef.current = null;
                }
            });
        } catch (error) {
            console.log("Error playing ending sound:", error);
        }
    };

    const endCall = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        setCallState("ended");

        setTimeout(() => {
            setShowMessage(true);
            playEndingSound();
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    friction: 8,
                    useNativeDriver: true,
                })
            ]).start();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }, 500);
    };

    return (
        <LinearGradient
            colors={["#0c4a6e", "#1e3a8a", "#312e81"]}
            style={styles.container}
        >
            <SafeAreaView style={{ flex: 1 }}>
                {!showMessage ? (
                    <View style={styles.callLayer}>
                        {}
                        <View style={styles.profileSection}>
                            <View style={styles.avatarWrapper}>
                                {callState === "ringing" && (
                                    <Animated.View style={[
                                        styles.pulseRing,
                                        {
                                            transform: [{
                                                scale: ringAnim.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: [1, 1.5]
                                                })
                                            }],
                                            opacity: ringAnim.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [0.5, 0]
                                            })
                                        }
                                    ]} />
                                )}
                                <View style={styles.avatar}>
                                    <ThemedText style={{ fontSize: 40 }} type="title">🙏</ThemedText>
                                </View>
                            </View>

                            <ThemedText style={styles.krishnaName}>Shri Krishna</ThemedText>
                            <ThemedText style={styles.callStatus}>
                                {callState === "ringing" && "Calling..."}
                                {callState === "connected" && formatTime(callDuration)}
                                {callState === "ended" && "Call Ended"}
                            </ThemedText>
                        </View>

                        {}
                        <View style={styles.middleContent}>
                            {callState === "connected" && (
                                <View style={styles.wisdomContainer}>
                                    <ThemedText style={styles.wisdomText}>
                                        "Whenever and wherever there is a decline in virtue, O Arjuna, and a predominant rise of irreligion — at that time I descend Myself."
                                    </ThemedText>
                                    <ThemedText style={styles.wisdomRef}>
                                        — Bhagavad Gita 4.7
                                    </ThemedText>
                                </View>
                            )}
                        </View>

                        {}
                        <View style={styles.footer}>
                            {callState !== "ended" && (
                                <TouchableOpacity
                                    style={styles.endBtn}
                                    onPress={endCall}
                                >
                                    <MaterialCommunityIcons name="phone-hangup" size={32} color="#FFF" />
                                </TouchableOpacity>
                            )}

                            {}
                            <View style={styles.privacyNotice}>
                                <MaterialCommunityIcons name="shield-check-outline" size={16} color="rgba(186, 230, 253, 0.6)" />
                                <ThemedText style={styles.privacyText}>
                                    Your conversations are never stored. This is your sacred space.
                                </ThemedText>
                            </View>
                        </View>
                    </View>
                ) : (
                    <Animated.View style={[
                        styles.messageLayer,
                        {
                            opacity: fadeAnim,
                            transform: [{ scale: scaleAnim }]
                        }
                    ]}>
                        <View style={styles.messageIcon}>
                            <ThemedText style={{ fontSize: 40 }} type="title">🙏</ThemedText>
                        </View>
                        <ThemedText style={styles.messageTitle}>Krishna has heard you</ThemedText>
                        <ThemedText style={styles.messageSub}>Remain calm. He is always with you.</ThemedText>

                        <TouchableOpacity
                            style={styles.returnBtn}
                            onPress={() => navigation.goBack()}
                        >
                            <ThemedText style={styles.returnText}>Return</ThemedText>
                        </TouchableOpacity>
                    </Animated.View>
                )}
            </SafeAreaView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#082f49", 
    },
    callLayer: {
        flex: 1,
        paddingVertical: 60,
        paddingHorizontal: 24,
        justifyContent: "space-between",
    },
    profileSection: {
        alignItems: "center",
    },
    avatarWrapper: {
        width: 130,
        height: 130,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 24,
    },
    pulseRing: {
        position: "absolute",
        width: 130,
        height: 130,
        borderRadius: 65,
        backgroundColor: "rgba(56, 189, 248, 0.4)",
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: "#0ea5e9", 
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 4,
        borderColor: "rgba(125, 211, 252, 0.3)",
        elevation: 10,
        shadowColor: "#0ea5e9",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
    },
    krishnaName: {
        fontSize: 28,
        fontWeight: "600",
        color: "#FFF",
        marginBottom: 4,
    },
    callStatus: {
        fontSize: 18,
        color: "rgba(186, 230, 253, 0.8)",
    },
    middleContent: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    wisdomContainer: {
        paddingHorizontal: 20,
        alignItems: "center",
    },
    wisdomText: {
        fontSize: 16,
        color: "rgba(240, 249, 255, 0.7)",
        fontStyle: "italic",
        textAlign: "center",
        lineHeight: 24,
    },
    wisdomRef: {
        fontSize: 12,
        color: "rgba(240, 249, 255, 0.4)",
        marginTop: 12,
    },
    footer: {
        alignItems: "center",
        paddingBottom: 20,
    },
    endBtn: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: "#ef4444",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#ef4444",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 8,
    },
    privacyNotice: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 20,
        paddingHorizontal: 16,
        gap: 6,
    },
    privacyText: {
        fontSize: 12,
        color: "rgba(186, 230, 253, 0.6)",
        textAlign: "center",
        flexShrink: 1,
    },
    messageLayer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 30,
    },
    messageIcon: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: "#9c7718ff",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 32,
        elevation: 12,
        shadowColor: "#fbbf24",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
    },
    messageTitle: {
        fontSize: 26,
        fontWeight: "600",
        color: "#FFF",
        marginBottom: 12,
        textAlign: "center",
    },
    messageSub: {
        fontSize: 16,
        color: "rgba(186, 230, 253, 0.7)",
        marginBottom: 40,
        textAlign: "center",
    },
    returnBtn: {
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderRadius: 25,
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.2)",
    },
    returnText: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "500",
    }
});

export default CallKrishnaScreen;
