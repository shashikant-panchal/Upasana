import { Feather } from "@expo/vector-icons";
import { useNavigation, useScrollToTop } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import {
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Extrapolate,
  interpolate,
  runOnJS,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import IllustrationCard from "../components/IllustrationCard";
import NextEkadashiCard from "../components/NextEkadashiCard";
import PanchangCard from "../components/PanchangCard";
import StoryList from "../components/stories/StoryList";
import { ThemedText } from "../components/ThemedText";
import { dw } from "../constants/Dimensions";
import {
  CalenderImg,
  DailyReadingImg,
  JapaImg,
  logo
} from "../constants/Images";
import { useTheme } from "../context/ThemeContext";
import { useNotifications } from "../hooks/useNotifications";

const REFRESH_THRESHOLD = 60;

const HomeScreen = () => {
  const navigation = useNavigation();
  const scrollRef = useRef(null);
  useScrollToTop(scrollRef);
  const { colors, isDark } = useTheme();
  const { unreadCount, fetchNotifications } = useNotifications();
  const [refreshing, setRefreshing] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);

  const scrollY = useSharedValue(0);
  const pullDistance = useSharedValue(0);
  const isRefreshing = useSharedValue(false);
  const loadingRotate = useSharedValue(0);

  const onRefresh = async () => {
    if (refreshing) return;
    setRefreshing(true);
    isRefreshing.value = true;

    try {
      await Promise.all([
        fetchNotifications(true),
        new Promise(resolve => setTimeout(resolve, 1500)) 
      ]);
      setRefreshCount(prev => prev + 1);
    } catch (error) {
      console.error("Refresh error:", error);
    }

    setRefreshing(false);
    isRefreshing.value = false;
    pullDistance.value = withSpring(0);
  };

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (isRefreshing.value) return;

      if (scrollY.value <= 5 && event.translationY > 0) {
        
        pullDistance.value = event.translationY / 2;
      } else if (pullDistance.value > 0) {
        
        pullDistance.value = event.translationY / 2;
      }
    })
    .onEnd(() => {
      if (isRefreshing.value) return;

      if (pullDistance.value > REFRESH_THRESHOLD) {
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Heavy);
        runOnJS(onRefresh)();
      } else {
        pullDistance.value = withSpring(0, { damping: 20 });
      }
    })
    .activeOffsetY(5)
    .failOffsetY(-5)
    .activeOffsetX([-20, 20]);

  const nativeGesture = Gesture.Native();
  const gesture = Gesture.Simultaneous(panGesture, nativeGesture);

  useEffect(() => {
    if (refreshing) {
      loadingRotate.value = withRepeat(withTiming(360, { duration: 1000 }), -1, false);
    } else {
      loadingRotate.value = withTiming(0, { duration: 300 });
    }
  }, [refreshing]);

  const animatedContentStyle = useAnimatedStyle(() => {
    if (isRefreshing.value) {
      return {
        transform: [{ translateY: withSpring(REFRESH_THRESHOLD, { damping: 15, stiffness: 100 }) }],
      };
    }

    return {
      transform: [{ translateY: pullDistance.value }],
    };
  });

  const animatedLoaderStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      pullDistance.value,
      [10, REFRESH_THRESHOLD],
      [0, 1],
      Extrapolate.CLAMP
    );

    const scale = interpolate(
      pullDistance.value,
      [0, REFRESH_THRESHOLD],
      [0.6, 1],
      Extrapolate.CLAMP
    );

    return {
      opacity: isRefreshing.value ? 1 : opacity,
      transform: [
        { scale: isRefreshing.value ? withSpring(1) : scale },
        { rotate: `${loadingRotate.value}deg` }
      ],
    };
  });

  const styles = getStyles(colors);

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      {}
      <LinearGradient
        colors={[colors.primary + "10", "transparent"]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />

      {}
      <View style={styles.loaderContainer}>
        <Animated.View style={[styles.loaderWrapper, animatedLoaderStyle]}>
          <Svg height="30" width="30" viewBox="0 0 40 40">
            <Path
              d="M20 2 L20 6 M20 34 L20 38 M2 20 L6 20 M34 20 L38 20 M7.27 7.27 L10.1 10.1 M29.9 29.9 L32.73 32.73 M7.27 32.73 L10.1 29.9 M29.9 10.1 L32.73 7.27"
              stroke={colors.primary}
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          </Svg>
        </Animated.View>
      </View>

      <GestureDetector gesture={gesture}>
        <Animated.ScrollView
          ref={scrollRef}
          onScroll={scrollHandler}
          scrollEventThrottle={8}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: '20%' }}
          bounces={false}
          overScrollMode="never"
        >
          <Animated.View style={[styles.contentWrapper, animatedContentStyle]}>
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <View
                  style={[styles.logoContainer, { backgroundColor: colors.card }]}
                >
                  <Image resizeMode="contain" source={logo} style={styles.logo} />
                </View>
                <View style={styles.titleContainer}>
                  <ThemedText
                    type="defaultSemiBold"
                    style={[styles.title, { color: colors.foreground }]}
                  >
                    Upāsanā
                  </ThemedText>
                  <ThemedText
                    type="small"
                    style={[styles.subtitle, { color: colors.primary }]}
                  >
                    Upgrade Your Inner Life
                  </ThemedText>
                </View>
              </View>
              <View style={styles.headerRight}>
                <TouchableOpacity
                  onPress={() => navigation.navigate("Notification")}
                  style={[
                    styles.notificationButton,
                    { backgroundColor: colors.card },
                  ]}
                >
                  <Feather name="bell" size={24} color={colors.foreground} />
                  {unreadCount > 0 && (
                    <View
                      style={[
                        styles.notificationDot,
                        { backgroundColor: colors.primary },
                      ]}
                    />
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => navigation.navigate("Profile")}
                  style={[
                    styles.profileButton,
                    { backgroundColor: colors.card },
                  ]}
                >
                  <Feather name="user" size={24} color={colors.foreground} />
                </TouchableOpacity>
              </View>
            </View>

            {}
            <View
              style={[styles.diyaSection, { backgroundColor: colors.lightBlueBg }]}
            >
              <ThemedText type="devanagari" style={styles.diyaIcon}>
                🪔
              </ThemedText>
              <View style={styles.mantraContainer}>
                <ThemedText
                  type="devanagari"
                  style={[styles.mantraText, { color: colors.mutedForeground }]}
                >
                  हरे कृष्ण हरे कृष्ण कृष्ण कृष्ण हरे हरे
                </ThemedText>
                <ThemedText
                  type="devanagari"
                  style={[styles.mantraText, { color: colors.mutedForeground }]}
                >
                  हरे राम हरे राम राम राम हरे हरे
                </ThemedText>
              </View>
              <ThemedText type="devanagari" style={styles.diyaIcon}>
                🪔
              </ThemedText>
            </View>

            {}
            <StoryList refreshCount={refreshCount} />

            <StatusBar
              style={isDark ? "light" : "auto"}
              backgroundColor={colors.background}
            />

            {}
            <NextEkadashiCard refreshCount={refreshCount} />

            {}
            <View style={[styles.cardsRow, { paddingHorizontal: 15, justifyContent: 'space-between' }]}>
              <IllustrationCard
                title={"Daily Reading"}
                subTitle={"Spiritual Guidance"}
                image={DailyReadingImg}
                onPress={() => navigation.navigate("DailyReading")}
                itemWidth={(dw - 40) / 2}
                style={{ marginRight: 5 }}
                type="split1"
              />
              <IllustrationCard
                title={"Calendar"}
                subTitle={"Monthly View"}
                image={CalenderImg}
                onPress={() => navigation.navigate("Calendar")}
                itemWidth={(dw - 40) / 2}
                style={{ marginLeft: 5 }}
                type="split2"
              />
            </View>

            {}
            <IllustrationCard
              title={"Japa Counter"}
              subTitle={"Count Your Rounds | \nJoin or Create a Japa Room"}
              image={JapaImg}
              onPress={() => navigation.navigate("MorningJapa")}
              style={{ marginHorizontal: 15, marginTop: 12, minHeight: 110 }}
              type="full"
              subTitleNumberOfLines={2}
            />

            {}
            <PanchangCard refreshCount={refreshCount} />

            {}
            <View style={styles.dividerContainer}>
              <Svg height="50" width="100%" viewBox="0 0 100 20" preserveAspectRatio="none">
                {}
                <Path
                  d="M0 10 Q 6.25 2, 12.5 10 T 25 10 T 37.5 10 T 50 10 T 62.5 10 T 75 10 T 87.5 10 T 100 10"
                  fill="none"
                  stroke={'#ABABAB'}
                  strokeWidth="0.5"
                  opacity={isDark ? 0.5 : 0.5}
                />

                {}
                <Path d="M6 6 Q 5 2, 4 4 Q 5 6, 6 6" fill={colors.primary} opacity={0.6} />
                <Path d="M19 6 Q 18 2, 17 4 Q 18 6, 19 6" fill={colors.primary} opacity={0.6} />
                <Path d="M31 6 Q 30 2, 29 4 Q 30 6, 31 6" fill={colors.primary} opacity={0.6} />
                <Path d="M44 6 Q 43 2, 42 4 Q 43 6, 44 6" fill={colors.primary} opacity={0.6} />
                <Path d="M56 6 Q 55 2, 54 4 Q 55 6, 56 6" fill={colors.primary} opacity={0.6} />
                <Path d="M69 6 Q 68 2, 67 4 Q 68 6, 69 6" fill={colors.primary} opacity={0.6} />
                <Path d="M81 6 Q 80 2, 79 4 Q 80 6, 81 6" fill={colors.primary} opacity={0.6} />
                <Path d="M94 6 Q 93 2, 92 4 Q 93 6, 94 6" fill={colors.primary} opacity={0.6} />

                {}
                <Path d="M11 14 Q 12 18, 13 16 Q 12 14, 11 14" fill={colors.primary} opacity={0.6} />
                <Path d="M24 14 Q 25 18, 26 16 Q 25 14, 24 14" fill={colors.primary} opacity={0.6} />
                <Path d="M36 14 Q 37 18, 38 16 Q 37 14, 36 14" fill={colors.primary} opacity={0.6} />
                <Path d="M49 14 Q 50 18, 51 16 Q 50 14, 49 14" fill={colors.primary} opacity={0.6} />
                <Path d="M61 14 Q 62 18, 63 16 Q 62 14, 61 14" fill={colors.primary} opacity={0.6} />
                <Path d="M74 14 Q 75 18, 76 16 Q 75 14, 74 14" fill={colors.primary} opacity={0.6} />
                <Path d="M86 14 Q 87 18, 88 16 Q 87 14, 86 14" fill={colors.primary} opacity={0.6} />
                <Path d="M99 14 Q 100 18, 101 16 Q 100 14, 99 14" fill={colors.primary} opacity={0.6} />

                {}
                <Path d="M12.5 10 A 1.2 1.2 0 1 1 12.51 10" fill={colors.secondary} opacity={0.8} />
                <Path d="M25 10 A 1.2 1.2 0 1 1 25.01 10" fill={colors.secondary} opacity={0.8} />
                <Path d="M37.5 10 A 1.2 1.2 0 1 1 37.51 10" fill={colors.secondary} opacity={0.8} />
                <Path d="M50 10 A 1.2 1.2 0 1 1 50.01 10" fill={colors.secondary} opacity={0.8} />
                <Path d="M62.5 10 A 1.2 1.2 0 1 1 62.51 10" fill={colors.secondary} opacity={0.8} />
                <Path d="M75 10 A 1.2 1.2 0 1 1 75.01 10" fill={colors.secondary} opacity={0.8} />
                <Path d="M87.5 10 A 1.2 1.2 0 1 1 87.51 10" fill={colors.secondary} opacity={0.8} />
                <Path d="M100 10 A 1.2 1.2 0 1 1 100.01 10" fill={colors.secondary} opacity={0.8} />
              </Svg>
            </View>

            {}
            <View style={styles.footer}>
              <ThemedText style={[styles.footerText, { color: '#ABABAB' }]}>
                Designed with 🧡 in Bengaluru
              </ThemedText>
            </View>
          </Animated.View>
        </Animated.ScrollView>
      </GestureDetector>
    </SafeAreaView>
  );
};

export default HomeScreen;

const getStyles = (colors) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 10,
      backgroundColor: "transparent",
    },
    gradient: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: "30%",
    },
    headerLeft: {
      flexDirection: "row",
      alignItems: "center",
    },
    headerRight: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    logoContainer: {
      width: 52,
      height: 52,
      marginRight: 12,
      borderRadius: 14,
      padding: 8,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 2,
      justifyContent: "center",
      alignItems: "center",
    },
    logo: {
      width: "100%",
      height: "100%",
    },
    titleContainer: {
      justifyContent: "center",
    },
    title: {
      fontSize: 18,
    },
    subtitle: {
      fontSize: 14,
      opacity: 0.8,
    },
    notificationButton: {
      borderRadius: 14,
      padding: 12,
      position: "relative",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 2,
    },
    notificationDot: {
      position: "absolute",
      top: 2,
      right: 2,
      width: 10,
      height: 10,
      borderRadius: 5,
    },
    profileButton: {
      borderRadius: 14,
      padding: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 2,
    },
    diyaSection: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-around",
      paddingVertical: 16,
      paddingHorizontal: 20,
      marginHorizontal: 15,
      marginVertical: 10,
      marginTop: 8,
      borderRadius: 16,
      borderWidth: 0.5,
      borderColor: colors.border,
    },
    diyaIcon: {
      fontSize: 25,
      textAlign: "center",
    },
    mantraContainer: {
      flex: 1,
      marginHorizontal: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    mantraText: {
      fontSize: 15,
      textAlign: "center",
      lineHeight: 24,
      flexWrap: "wrap",
    },
    cardsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      alignSelf: 'center'
    },
    footer: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: '10%',
      paddingHorizontal: 20,
      marginBottom: 10,
    },
    footerText: {
      fontSize: 16,
      textAlign: "center",
      letterSpacing: 0.3,
    },
    dividerContainer: {
      width: '100%',
      marginTop: '10%',
      marginBottom: 5,
      height: 40,
    },
    loaderContainer: {
      position: 'absolute',
      top: 20,
      left: 0,
      right: 0,
      height: 60,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 0,
    },
    loaderWrapper: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.card,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 5,
    },
    contentWrapper: {
      flex: 1,
      backgroundColor: 'transparent',
    },
  });
