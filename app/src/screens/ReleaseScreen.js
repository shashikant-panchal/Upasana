import { Feather, Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle, Defs, Ellipse, Path, Rect, Stop, LinearGradient as SvgLinearGradient, RadialGradient as SvgRadialGradient } from "react-native-svg";
import { ThemedText } from "../components/ThemedText";
import { useTheme } from "../context/ThemeContext";

const { width, height } = Dimensions.get("window");

const FloatingChar = ({ char, index, total, binPosition, delay }) => {
    const anim = useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        Animated.timing(anim, {
            toValue: 1,
            duration: 1800,
            delay: delay + index * 40,
            useNativeDriver: true,
        }).start();
    }, []);

    const charWidth = 14;
    const startX = (index - total / 2) * charWidth;
    const angle = (index / total) * Math.PI * 2;
    const spiralRadius = 80 + Math.random() * 50;

    const translateX = anim.interpolate({
        inputRange: [0, 0.3, 0.7, 1],
        outputRange: [
            startX,
            startX + Math.cos(angle) * spiralRadius,
            binPosition.x + (Math.random() - 0.5) * 40,
            binPosition.x
        ],
    });

    const translateY = anim.interpolate({
        inputRange: [0, 0.3, 0.7, 1],
        outputRange: [
            0,
            50 + Math.random() * 40,
            binPosition.y - 80,
            binPosition.y
        ],
    });

    const scale = anim.interpolate({
        inputRange: [0, 0.3, 0.7, 1],
        outputRange: [1, 1.3, 0.5, 0],
    });

    const opacity = anim.interpolate({
        inputRange: [0, 0.1, 0.7, 1],
        outputRange: [0, 1, 0.8, 0],
    });

    const rotate = anim.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", (360 + Math.random() * 360) + "deg"],
    });

    const color = anim.interpolate({
        inputRange: [0, 0.3, 0.6, 1],
        outputRange: ["#FFFFFF", "#FBBF24", "#FB923C", "#EA580C"],
    });

    return (
        <Animated.View
            style={[
                styles.floatingChar,
                {
                    opacity,
                    transform: [
                        { translateX },
                        { translateY },
                        { scale },
                        { rotate }
                    ],
                },
            ]}
        >
            <Animated.Text style={[styles.charText, { color }]}>{char}</Animated.Text>
        </Animated.View>
    );
};

const EmberParticle = ({ delay, binPosition }) => {
    const anim = useRef(new Animated.Value(0)).current;
    const randomX = useRef((Math.random() - 0.5) * 80).current;
    const randomDrift = useRef((Math.random() - 0.5) * 120).current;

    React.useEffect(() => {
        Animated.timing(anim, {
            toValue: 1,
            duration: 2000,
            delay: delay,
            useNativeDriver: true,
        }).start();
    }, []);

    const translateX = anim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [binPosition.x + randomX, binPosition.x + randomX + randomDrift * 0.5, binPosition.x + randomX + randomDrift],
    });

    const translateY = anim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [binPosition.y - 30, binPosition.y - 120, binPosition.y - 220],
    });

    const scale = anim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0, 1.8, 0],
    });

    const opacity = anim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0, 1, 0],
    });

    return (
        <Animated.View
            style={[
                styles.ember,
                {
                    opacity,
                    transform: [{ translateX }, { translateY }, { scale }],
                },
            ]}
        />
    );
};

const SmokeWisp = ({ delay, binPosition }) => {
    const anim = useRef(new Animated.Value(0)).current;
    const wispWidth = useRef(30 + Math.random() * 40).current;
    const randomX = useRef((Math.random() - 0.5) * 50).current;
    const driftX = useRef((Math.random() - 0.5) * 80).current;

    React.useEffect(() => {
        Animated.timing(anim, {
            toValue: 1,
            duration: 2500,
            delay: delay,
            useNativeDriver: true,
        }).start();
    }, []);

    const translateX = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [binPosition.x + randomX, binPosition.x + randomX + driftX],
    });

    const translateY = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [binPosition.y - 40, binPosition.y - 180],
    });

    const scale = anim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0.5, 1.5, 2.5],
    });

    const opacity = anim.interpolate({
        inputRange: [0, 0.4, 1],
        outputRange: [0, 0.4, 0],
    });

    return (
        <Animated.View
            style={[
                styles.smoke,
                {
                    width: wispWidth,
                    height: wispWidth * 0.6,
                    opacity,
                    transform: [{ translateX }, { translateY }, { scale }],
                },
            ]}
        />
    );
};

const FloatingOrb = ({ delay, size, startX, color }) => {
    const anim = useRef(new Animated.Value(0)).current;
    const driftX = useRef((Math.random() - 0.5) * 180).current;
    const duration = useRef(7000 + Math.random() * 5000).current;

    React.useEffect(() => {
        const startAnimation = () => {
            anim.setValue(0);
            Animated.timing(anim, {
                toValue: 1,
                duration: duration,
                delay: delay,
                useNativeDriver: true,
            }).start(() => startAnimation());
        };
        startAnimation();
    }, []);

    const translateY = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [height * 0.1, -height * 0.9],
    });

    const translateX = anim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [startX, startX + driftX * 0.5, startX + driftX],
    });

    const opacity = anim.interpolate({
        inputRange: [0, 0.2, 0.8, 1],
        outputRange: [0, 0.7, 0.7, 0],
    });

    const scale = anim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0.4, 1.4, 0.3],
    });

    return (
        <Animated.View
            style={[
                styles.orb,
                {
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    backgroundColor: color,
                    opacity,
                    transform: [{ translateX }, { translateY }, { scale }],
                },
            ]}
        />
    );
};

const BreathingCircle = ({ size, delay, color }) => {
    const anim = useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(anim, {
                    toValue: 1,
                    duration: 4000,
                    delay: delay,
                    useNativeDriver: true,
                }),
                Animated.timing(anim, {
                    toValue: 0,
                    duration: 4000,
                    useNativeDriver: true,
                })
            ])
        ).start();
    }, []);

    const scale = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.3],
    });

    const opacity = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.2, 0.5],
    });

    return (
        <Animated.View
            style={[
                styles.breathingCircle,
                {
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    backgroundColor: color,
                    opacity,
                    transform: [{ scale }],
                },
            ]}
        />
    );
};

const Dustbin = ({ isOpen, isReceiving }) => {
    const lidAnim = useRef(new Animated.Value(0)).current;
    const glowAnim = useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        Animated.parallel([
            Animated.spring(lidAnim, {
                toValue: isOpen ? 1 : 0,
                useNativeDriver: true,
                friction: 8,
                tension: 40,
                delay: isOpen ? 0 : 600,
            }),
            Animated.timing(glowAnim, {
                toValue: isReceiving ? 1 : 0,
                duration: 500,
                useNativeDriver: true,
            })
        ]).start();
    }, [isOpen, isReceiving]);

    const lidRotateX = lidAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "-80deg"],
    });

    const lidTranslateY = lidAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -15],
    });

    return (
        <View style={styles.dustbinContainer}>
            {}
            <Animated.View style={[
                styles.binShadowGlow,
                {
                    opacity: glowAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 0.6]
                    }),
                }
            ]} />

            {}
            <Animated.View style={[
                styles.lidWrapper,
                {
                    zIndex: 20,
                    transform: [
                        { translateY: lidTranslateY },
                        { rotateX: lidRotateX }
                    ]
                }
            ]}>
                <Svg width="130" height="45" viewBox="0 0 120 40">
                    <Defs>
                        <SvgLinearGradient id="lidGradient3D" x1="0%" y1="0%" x2="0%" y2="100%">
                            <Stop offset="0%" stopColor="#a8a29e" />
                            <Stop offset="30%" stopColor="#78716c" />
                            <Stop offset="70%" stopColor="#57534e" />
                            <Stop offset="100%" stopColor="#44403c" />
                        </SvgLinearGradient>
                        <SvgLinearGradient id="lidTop" x1="0%" y1="0%" x2="0%" y2="100%">
                            <Stop offset="0%" stopColor="#d6d3d1" />
                            <Stop offset="100%" stopColor="#a8a29e" />
                        </SvgLinearGradient>
                    </Defs>
                    <Path
                        d="M10 28 L18 8 L102 8 L110 28 Z"
                        fill="url(#lidGradient3D)"
                    />
                    <Path
                        d="M18 8 L25 3 L95 3 L102 8 Z"
                        fill="url(#lidTop)"
                    />
                    <Rect
                        x="45"
                        y="-2"
                        width="30"
                        height="7"
                        rx="3.5"
                        fill="#57534e"
                        stroke="#78716c"
                        strokeWidth="1"
                    />
                </Svg>
            </Animated.View>

            {}
            <Svg width="110" height="135" viewBox="0 0 120 140">
                <Defs>
                    <SvgLinearGradient id="binBodyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <Stop offset="0%" stopColor="#3f3f46" />
                        <Stop offset="15%" stopColor="#52525b" />
                        <Stop offset="50%" stopColor="#71717a" />
                        <Stop offset="85%" stopColor="#52525b" />
                        <Stop offset="100%" stopColor="#3f3f46" />
                    </SvgLinearGradient>
                    <SvgLinearGradient id="binInnerDark" x1="0%" y1="0%" x2="0%" y2="100%">
                        <Stop offset="0%" stopColor="#18181b" />
                        <Stop offset="100%" stopColor="#09090b" />
                    </SvgLinearGradient>
                    <SvgLinearGradient id="rimGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <Stop offset="0%" stopColor="#a1a1aa" />
                        <Stop offset="50%" stopColor="#71717a" />
                        <Stop offset="100%" stopColor="#52525b" />
                    </SvgLinearGradient>
                </Defs>

                <Ellipse cx="60" cy="25" rx="42" ry="12" fill="url(#binInnerDark)" />
                <Path d="M18 25 L25 130 L95 130 L102 25 Z" fill="url(#binBodyGradient)" stroke="#27272a" strokeWidth="1" />
                <Ellipse cx="60" cy="25" rx="45" ry="13" fill="none" stroke="url(#rimGradient)" strokeWidth="3" />
                <Path d="M40 35 L42 125" stroke="#52525b" strokeWidth="1" opacity="0.4" />
                <Path d="M60 35 L60 125" stroke="#a1a1aa" strokeWidth="1.2" opacity="0.4" />
                <Path d="M80 35 L78 125" stroke="#52525b" strokeWidth="1" opacity="0.4" />
            </Svg>

            {!isOpen && isReceiving && (
                <Animated.View style={[
                    styles.sealEffect,
                    {
                        opacity: lidAnim.interpolate({
                            inputRange: [0, 0.5, 1],
                            outputRange: [0, 1, 0]
                        })
                    }
                ]}>
                    <LinearGradient
                        colors={['transparent', 'rgba(251, 191, 36, 0.5)', 'transparent']}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
                        style={styles.sealGradient}
                    />
                </Animated.View>
            )}
        </View>
    );
};

const ReleaseScreen = ({ navigation }) => {
    const { colors } = useTheme();
    const [thought, setThought] = useState("");
    const [isReleasing, setIsReleasing] = useState(false);
    const [showFloatingChars, setShowFloatingChars] = useState(false);
    const [showEmbers, setShowEmbers] = useState(false);
    const [binOpen, setBinOpen] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(true);

    const thoughtOpacity = useRef(new Animated.Value(1)).current;

    const playSound = async (soundFile) => {
        try {
            const { sound } = await Audio.Sound.createAsync(soundFile);
            await sound.playAsync();
            sound.setOnPlaybackStatusUpdate(status => {
                if (status.didJustFinish) sound.unloadAsync();
            });
        } catch (error) {
            console.log("Error playing sound:", error);
        }
    };

    const handleRelease = useCallback(async () => {
        if (!thought.trim()) return;

        Keyboard.dismiss();
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setIsReleasing(true);

        setTimeout(() => {
            setBinOpen(true);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }, 200);

        if (soundEnabled) {
            playSound(require('../../../assets/sounds/conch-shell.mp3'));
        }

        Animated.timing(thoughtOpacity, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
        }).start();

        setTimeout(() => {
            setShowFloatingChars(true);
            Haptics.selectionAsync();
        }, 400);

        setTimeout(() => {
            setShowEmbers(true);
        }, 1400);

        setTimeout(() => {
            setBinOpen(false);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        }, 2200);

        setTimeout(() => {
            setIsComplete(true);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            if (soundEnabled) {
                playSound(require('../../../assets/sounds/temple-bell.mp3'));
            }
        }, 3400);
    }, [thought, soundEnabled]);

    const handleReset = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setThought("");
        setIsReleasing(false);
        setShowFloatingChars(false);
        setShowEmbers(false);
        setBinOpen(false);
        setIsComplete(false);
        thoughtOpacity.setValue(1);
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { borderBottomColor: colors.border + "40", backgroundColor: colors.background + 'CC' }]}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Feather name="arrow-left" size={24} color={colors.mutedForeground} />
                    </TouchableOpacity>
                    <View style={styles.headerTitleContainer}>
                        <ThemedText style={styles.headerTitle}>Release</ThemedText>
                        <ThemedText style={styles.headerSubtitle}>Visarjana · विसर्जन</ThemedText>
                    </View>
                </View>
                <TouchableOpacity onPress={() => setSoundEnabled(!soundEnabled)} style={styles.backButton}>
                    <Ionicons name={soundEnabled ? "volume-medium-outline" : "volume-mute-outline"} size={22} color={colors.mutedForeground} />
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
                <View style={styles.main}>
                    {isComplete ? (
                        <View style={styles.completeView}>
                            <View style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]}>
                                {Array.from({ length: 12 }).map((_, i) => (
                                    <FloatingOrb
                                        key={`orb-${i}`}
                                        delay={i * 800}
                                        size={20 + Math.random() * 30}
                                        startX={(width / 12) * i - width / 2}
                                        color="rgba(52, 211, 153, 0.15)"
                                    />
                                ))}
                                <View style={styles.breathingContainer}>
                                    <BreathingCircle size={400} delay={0} color="rgba(52, 211, 153, 0.04)" />
                                    <BreathingCircle size={300} delay={1000} color="rgba(134, 239, 172, 0.06)" />
                                </View>
                            </View>

                            <View style={styles.lotusContainer}>
                                <Svg width="200" height="200" style={styles.lotusGlow}>
                                    <Defs>
                                        <SvgRadialGradient id="lotusGlowGrad" cx="50%" cy="50%" rx="50%" ry="50%">
                                            <Stop offset="0%" stopColor="rgba(52, 211, 153, 0.35)" />
                                            <Stop offset="100%" stopColor="transparent" />
                                        </SvgRadialGradient>
                                    </Defs>
                                    <Circle cx="100" cy="100" r="90" fill="url(#lotusGlowGrad)" />
                                </Svg>
                                <View style={[styles.lotusCircle, { borderColor: 'rgba(52, 211, 153, 0.3)' }]}>
                                    <ThemedText style={styles.lotusEmoji}>🪷</ThemedText>
                                </View>
                            </View>

                            <ThemedText style={styles.sanskritBlessing}>ॐ शान्तिः शान्तिः शान्तिः</ThemedText>
                            <ThemedText style={styles.englishBlessing}>Om Peace, Peace, Peace</ThemedText>
                            <View style={styles.divider} />

                            <View style={styles.messageGroup}>
                                <ThemedText style={styles.messageTitle}>You have let go</ThemedText>
                                <ThemedText style={styles.messageSub}>What was heavy is now light</ThemedText>
                            </View>

                            <View style={styles.completeActions}>
                                <TouchableOpacity style={[styles.actionBtnOutline, { borderColor: 'rgba(52, 211, 153, 0.3)' }]} onPress={handleReset}>
                                    <ThemedText style={{ color: colors.foreground }}>Release Another</ThemedText>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => navigation.goBack()}>
                                    <LinearGradient colors={['#059669', '#0D9488']} style={styles.actionBtnGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                                        <ThemedText style={{ color: '#FFF', fontWeight: '600' }}>Return to Peace</ThemedText>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.brandingBottom}>
                                <ThemedText style={styles.brandingText}>VISARJANA • विसर्जन</ThemedText>
                            </View>
                        </View>
                    ) : (
                        <View style={styles.inputSection}>
                            <ThemedText style={[styles.prompt, { opacity: isReleasing ? 0 : 1 }]}>What feels heavy right now?</ThemedText>

                            <View style={styles.thoughtContainer}>
                                <Animated.View style={{ opacity: thoughtOpacity }}>
                                    <TextInput
                                        style={[styles.input, { backgroundColor: colors.card, color: colors.foreground, borderColor: colors.border + "40" }]}
                                        placeholder="Just one thought..."
                                        placeholderTextColor={colors.mutedForeground + "50"}
                                        value={thought}
                                        onChangeText={(t) => setThought(t.slice(0, 120))}
                                        editable={!isReleasing}
                                        multiline
                                    />
                                    <ThemedText type="small" style={styles.charCount}>{thought.length}/120</ThemedText>
                                </Animated.View>

                                {showFloatingChars && (
                                    <View style={styles.animationLayer}>
                                        {thought.split("").map((char, i) => (
                                            <FloatingChar key={`char-${i}`} char={char} index={i} total={thought.length} binPosition={{ x: 0, y: 150 }} delay={0} />
                                        ))}
                                    </View>
                                )}

                                {showEmbers && (
                                    <View style={styles.animationLayer}>
                                        {Array.from({ length: 15 }).map((_, i) => (
                                            <EmberParticle key={`ember-${i}`} delay={i * 100} binPosition={{ x: 0, y: 150 }} />
                                        ))}
                                        {Array.from({ length: 6 }).map((_, i) => (
                                            <SmokeWisp key={`smoke-${i}`} delay={i * 200} binPosition={{ x: 0, y: 150 }} />
                                        ))}
                                    </View>
                                )}
                            </View>

                            <View style={styles.binSection}>
                                <Dustbin isOpen={binOpen} isReceiving={isReleasing} />
                            </View>

                            <View style={{ opacity: isReleasing ? 0 : 1 }}>
                                <TouchableOpacity onPress={handleRelease} disabled={!thought.trim() || isReleasing}>
                                    <LinearGradient colors={['#D97706', '#EA580C']} style={[styles.releaseBtn, (!thought.trim() || isReleasing) && { opacity: 0.5 }]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                                        <ThemedText style={styles.releaseBtnText}>Offer & Release</ThemedText>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>

                            <View style={[styles.privacyNote, { opacity: isReleasing ? 0 : 0.7 }]}>
                                <Ionicons name="lock-closed-outline" size={12} color={colors.mutedForeground} />
                                <ThemedText type="small" style={{ color: colors.mutedForeground, marginLeft: 6, fontSize: 12 }}>Your thoughts are never stored. This is your sacred space.</ThemedText>
                            </View>
                        </View>
                    )}
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, zIndex: 10 },
    headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
    backButton: { padding: 4 },
    headerTitleContainer: { alignItems: "flex-start" },
    headerTitle: { fontSize: 20, fontWeight: "600" },
    headerSubtitle: { fontSize: 12, opacity: 0.6 },
    main: { flex: 1, paddingHorizontal: 24, justifyContent: "center" },
    inputSection: { alignItems: "center" },
    prompt: { fontSize: 20, fontWeight: "300", marginBottom: 40, textAlign: "center" },
    thoughtContainer: { width: "100%", position: "relative", zIndex: 10 },
    input: { width: "100%", height: 100, borderRadius: 16, borderWidth: 1, padding: 20, fontSize: 18, textAlign: "center" },
    charCount: { textAlign: "right", marginTop: 8, opacity: 0.4, fontSize: 12 },
    animationLayer: { position: "absolute", top: 40, left: "50%", zIndex: 30 },
    floatingChar: { position: "absolute" },
    charText: { fontSize: 18, fontWeight: "600" },
    ember: { position: "absolute", width: 6, height: 6, borderRadius: 3, backgroundColor: "#FBBF24" },
    smoke: { position: "absolute", borderRadius: 20, backgroundColor: "rgba(120, 113, 108, 0.3)" },
    binSection: { marginVertical: 30 },
    dustbinContainer: { alignItems: "center", position: "relative" },
    binShadowGlow: { position: "absolute", bottom: 10, width: 120, height: 20, backgroundColor: "rgba(251, 191, 36, 0.4)", borderRadius: 60 },
    lidWrapper: { position: "absolute", top: -8 },
    sealEffect: { position: "absolute", top: 20, width: 100, height: 10, zIndex: 5 },
    sealGradient: { width: "100%", height: "100%", borderRadius: 5 },
    releaseBtn: { paddingHorizontal: 32, paddingVertical: 16, borderRadius: 30, shadowColor: "#D97706", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
    releaseBtnText: { color: "#FFF", fontWeight: "600", fontSize: 16 },
    privacyNote: { flexDirection: "row", alignItems: "center", marginTop: 30 },
    completeView: { alignItems: "center", flex: 1, paddingTop: height * 0.1 },
    lotusContainer: { width: 200, height: 200, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    lotusGlow: { position: 'absolute' },
    lotusCircle: { width: 100, height: 100, borderRadius: 50, borderWidth: 1, backgroundColor: 'rgba(52, 211, 153, 0.08)', justifyContent: 'center', alignItems: 'center' },
    lotusEmoji: { fontSize: 48 },
    sanskritBlessing: { fontSize: 26, color: '#10B981', marginBottom: 8, textAlign: 'center' },
    englishBlessing: { fontSize: 12, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 24 },
    divider: { width: 80, height: 1, backgroundColor: 'rgba(16, 185, 129, 0.2)', marginBottom: 30 },
    messageGroup: { alignItems: 'center', marginBottom: 50 },
    messageTitle: { fontSize: 22, fontWeight: '300', marginBottom: 6 },
    messageSub: { fontSize: 14, opacity: 0.5 },
    completeActions: { flexDirection: 'row', gap: 12 },
    actionBtnOutline: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10, borderWidth: 1 },
    actionBtnGradient: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
    brandingBottom: { position: 'absolute', bottom: 40 },
    brandingText: { fontSize: 11, opacity: 0.3, letterSpacing: 4 },
    breathingContainer: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
    breathingCircle: { position: 'absolute' },
    orb: { position: 'absolute' }
});

export default ReleaseScreen;
