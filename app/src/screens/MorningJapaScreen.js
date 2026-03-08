import {
  AntDesign,
  Feather,
  MaterialCommunityIcons,
} from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { useSelector } from 'react-redux';
import JapaRoomScreen from '../components/JapaRoomScreen';
import JapaTargetModal, { loadSavedTarget } from '../components/JapaTargetModal';
import MantraSelectionModal from '../components/MantraSelectionModal';
import { ThemedText } from '../components/ThemedText';
import { useTheme } from '../context/ThemeContext';
import { mantrasList } from '../data/bhajansData';
import * as JapaService from '../services/japaSessions';

const { width } = Dimensions.get('window');
const CURRENT_MANTRA_KEY = '@current_japa_mantra';
const DND_KEY = '@japa_dnd_mode';

const ProgressRing = ({ size, strokeWidth = 3, progress, color, trackColor }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <Svg width={size} height={size} style={{ position: 'absolute' }}>
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={trackColor}
        strokeWidth={strokeWidth}
        fill="none"
      />
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={strokeDashoffset}
        rotation="-90"
        originX={size / 2}
        originY={size / 2}
      />
    </Svg>
  );
};

const CelebrationOverlay = ({ visible, colors }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      scaleAnim.setValue(0.5);
      opacityAnim.setValue(0);
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, friction: 5, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.timing(opacityAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.celebrationOverlay, { opacity: opacityAnim }]} pointerEvents="none">
      <Animated.View style={[styles.celebrationCard, { transform: [{ scale: scaleAnim }] }]}>
        <ThemedText style={{ fontSize: 48 }}>🙏</ThemedText>
        <ThemedText style={styles.celebrationTitle}>Target Reached!</ThemedText>
        <ThemedText type="small" style={{ color: 'rgba(255,255,255,0.8)' }}>Well done!</ThemedText>
      </Animated.View>
    </Animated.View>
  );
};

import { LinearGradient } from 'expo-linear-gradient';

const MorningJapaScreen = () => {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const user = useSelector((state) => state.user.user);

  const [activeTab, setActiveTab] = useState('my-japa');

  const [loading, setLoading] = useState(true);
  const [todaySession, setTodaySession] = useState(null);
  const [stats, setStats] = useState({ totalRounds: 0, currentStreak: 0 });
  const [currentMantra, setCurrentMantra] = useState(mantrasList[0]);
  const [isMantraModalVisible, setMantraModalVisible] = useState(false);
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isDndEnabled, setIsDndEnabled] = useState(false);
  const [target, setTarget] = useState(null);
  const [isTargetModalVisible, setTargetModalVisible] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const timerRef = useRef(null);
  const countAnim = useRef(new Animated.Value(1)).current;
  const rippleAnim = useRef(new Animated.Value(0)).current;
  const rippleOpacity = useRef(new Animated.Value(0)).current;
  const hasReachedTargetRef = useRef(false);

  const roundsCompleted = todaySession?.completed_rounds || 0;
  const hasActiveSession = !!todaySession?.start_time;
  const isTargetReached = target && roundsCompleted >= target;
  const targetProgress = target ? Math.min((roundsCompleted / target) * 100, 100) : 0;

  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);

      const storedMantra = await AsyncStorage.getItem(CURRENT_MANTRA_KEY);
      if (storedMantra) setCurrentMantra(JSON.parse(storedMantra));

      const dndVal = await AsyncStorage.getItem(DND_KEY);
      setIsDndEnabled(dndVal === 'true');

      const savedTarget = await loadSavedTarget();
      setTarget(savedTarget);

      if (user?.id) await loadSessionAndStats();
    } catch (error) {
      console.error('Error loading initial data', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const loadSessionAndStats = async () => {
    try {
      const session = await JapaService.fetchTodaySession(user.id);
      setTodaySession(session);

      if (session?.start_time && !session.end_time) {
        const elapsed = Math.floor((Date.now() - new Date(session.start_time).getTime()) / 1000);
        setTime(elapsed > 0 ? elapsed : 0);
        setIsRunning(true);
        setIsPaused(false);
      } else {
        setIsRunning(false);
        setTime(0);
      }

      const sessions = await JapaService.fetchRecentSessions(user.id);
      setStats(JapaService.calculateStats(sessions));
    } catch (error) {
      console.error('Error loading session/stats', error);
    }
  };

  useEffect(() => {
    if (isRunning && !isPaused) {
      timerRef.current = setInterval(() => setTime((prev) => prev + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRunning, isPaused]);

  useEffect(() => {
    if (target && roundsCompleted >= target && !hasReachedTargetRef.current) {
      hasReachedTargetRef.current = true;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success), 300);
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    }
    if (target && roundsCompleted < target) {
      hasReachedTargetRef.current = false;
    }
  }, [roundsCompleted, target]);

  const triggerTouchAnimation = () => {
    countAnim.setValue(1);
    rippleAnim.setValue(0);
    rippleOpacity.setValue(0.5);
    Animated.parallel([
      Animated.sequence([
        Animated.timing(countAnim, { toValue: 1.1, duration: 80, useNativeDriver: true }),
        Animated.spring(countAnim, { toValue: 1, friction: 5, useNativeDriver: true }),
      ]),
      Animated.timing(rippleAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(rippleOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
  };

  const handleMantraSelect = async (mantra) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCurrentMantra(mantra);
    setMantraModalVisible(false);
    await AsyncStorage.setItem(CURRENT_MANTRA_KEY, JSON.stringify(mantra));
  };

  const toggleDnd = async () => {
    const nextVal = !isDndEnabled;
    setIsDndEnabled(nextVal);
    await AsyncStorage.setItem(DND_KEY, String(nextVal));
    await Haptics.selectionAsync();
  };

  const handleTargetChange = (newTarget) => {
    setTarget(newTarget);
    hasReachedTargetRef.current = newTarget ? roundsCompleted >= newTarget : false;
  };

  const handleTap = async () => {
    if (!user?.id || isPaused) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    triggerTouchAnimation();

    if (!isRunning && !todaySession?.start_time) {
      await JapaService.startSession(user.id);
      setIsRunning(true);
    }
    await JapaService.completeRound(user.id);
    await loadSessionAndStats();
  };

  const handlePauseResume = async () => {
    if (!hasActiveSession) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsPaused((prev) => !prev);
  };

  const handleReset = async () => {
    if (!user?.id) return;
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    await JapaService.resetSession(user.id);
    setIsRunning(false);
    setIsPaused(false);
    setTime(0);
    hasReachedTargetRef.current = false;
    await loadSessionAndStats();
  };

  const handleUndo = async () => {
    if (!user?.id) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await JapaService.undoRound(user.id);
    await loadSessionAndStats();
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const dynStyles = getDynStyles(colors, isDark);

  const TAP_SIZE = width - 40;

  const getGradientColors = () => {
    if (isTargetReached) {
      return isDark
        ? ['rgba(6, 78, 59, 0.1)', 'rgba(6, 95, 70, 0.2)'] 
        : ['rgba(16, 185, 129, 0.05)', 'rgba(16, 185, 129, 0.1)']; 
    }
    return isDark
      ? ['rgba(120, 53, 15, 0.05)', 'rgba(124, 45, 18, 0.1)'] 
      : ['rgba(245, 158, 11, 0.03)', 'rgba(245, 158, 11, 0.06)']; 
  };

  if (loading) {
    return (
      <SafeAreaView style={[dynStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.secondary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={dynStyles.container}>
      {}
      <CelebrationOverlay visible={showCelebration} colors={colors} />

      {}
      <View style={dynStyles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Feather name="chevron-left" size={28} color={colors.foreground} />
        </TouchableOpacity>
        <ThemedText style={{ fontSize: 20, fontWeight: '600', color: colors.primary }}>
          Japa Counter
        </ThemedText>
        <View style={{ width: 28 }} />
      </View>

      {}
      <View style={[dynStyles.tabBar, { backgroundColor: isDark ? colors.card : '#f1f5f8' }]}>
        {[
          { key: 'my-japa', label: 'My Japa' },
          { key: 'japa-room', label: 'Japa Room' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[dynStyles.tabChip, activeTab === tab.key && dynStyles.tabChipActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <ThemedText
              style={[
                dynStyles.tabLabel,
                { color: activeTab === tab.key ? (isDark ? colors.foreground : '#0000') : colors.mutedForeground },
              ]}
            >
              {tab.label}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>

      {}
      {activeTab === 'my-japa' && (
        <ScrollView contentContainerStyle={dynStyles.scrollContent} showsVerticalScrollIndicator={false}>

          {}
          <View style={dynStyles.topRow}>
            <View style={dynStyles.statsCard}>
              <View style={dynStyles.statItem}>
                <ThemedText style={dynStyles.statNumber}>{stats.currentStreak}</ThemedText>
                <ThemedText style={dynStyles.statLabel}>day streak</ThemedText>
              </View>
              <View style={dynStyles.statDivider} />
              <View style={dynStyles.statItem}>
                <ThemedText style={dynStyles.statNumber}>{stats.totalRounds}</ThemedText>
                <ThemedText style={dynStyles.statLabel}>total rounds</ThemedText>
              </View>
            </View>

            {}
            <TouchableOpacity
              style={dynStyles.iconBtn}
              onPress={toggleDnd}
              activeOpacity={0.7}
            >
              <Feather name={isDndEnabled ? "bell-off" : "bell"} size={20} color={colors.accent} />
            </TouchableOpacity>

            {}
            <TouchableOpacity
              style={[
                dynStyles.targetBtn,
                isTargetReached
                  ? { backgroundColor: '#10b981' + '20', borderColor: '#10b981' + '50' } 
                  : target
                    ? { backgroundColor: colors.secondary + '15', borderColor: colors.secondary + '40' } 
                    : { backgroundColor: isDark ? colors.card : '#F8F9FA', borderColor: '#E2E8F0' } 
              ]}
              onPress={() => setTargetModalVisible(true)}
              activeOpacity={0.7}
            >
              {isTargetReached ? (
                <MaterialCommunityIcons name="star-four-points" size={16} color="#10b981" />
              ) : (
                <Feather name="target" size={16} color={target ? colors.secondary : colors.mutedForeground} />
              )}
              <ThemedText style={{ color: isTargetReached ? '#10b981' : target ? colors.secondary : colors.mutedForeground, fontWeight: '500', fontSize: 14 }}>
                {target ? `${roundsCompleted}/${target}${isTargetReached ? ' ✓' : ''}` : 'Set Target'}
              </ThemedText>
            </TouchableOpacity>
          </View>

          {}
          <TouchableOpacity
            style={[dynStyles.mantraCard, { backgroundColor: isDark ? colors.card : '#FFFBEB', borderColor: isDark ? colors.border : colors.secondary + '30' }]}
            onPress={() => setMantraModalVisible(true)}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <ThemedText type="small" style={{ color: colors.mutedForeground, letterSpacing: 1, fontSize: 9, textTransform: 'uppercase' }}>
                ॥ Current Mantra ॥
              </ThemedText>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                <ThemedText type="small" style={{ color: colors.secondary, fontSize: 9, fontWeight: 'bold' }}>CHANGE</ThemedText>
                <Feather name="chevron-right" size={12} color={colors.secondary} />
              </View>
            </View>
            <ThemedText type="devanagari" style={{ fontSize: 16, color: colors.primary, lineHeight: 26 }}>
              {currentMantra.sanskrit || currentMantra.name}
            </ThemedText>
          </TouchableOpacity>

          {}
          <View style={dynStyles.counterWrapper}>
            {}
            {target && (
              <ProgressRing
                size={TAP_SIZE}
                strokeWidth={3}
                progress={targetProgress}
                color={isTargetReached ? '#10b981' : colors.secondary}
                trackColor={colors.border + '30'}
              />
            )}

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={handleTap}
              disabled={isPaused}
              style={[
                dynStyles.tapAreaContainer,
                { width: TAP_SIZE, height: TAP_SIZE },
                isPaused && { opacity: 0.5 },
              ]}
            >
              <LinearGradient
                colors={getGradientColors()}
                style={[
                  dynStyles.tapArea,
                  {
                    borderColor: isTargetReached ? 'rgba(16, 185, 129, 0.4)' : 'rgba(217, 119, 6, 0.2)', 
                  }
                ]}
              >
                {}
                <Animated.View
                  style={[
                    dynStyles.ripple,
                    {
                      transform: [{ scale: rippleAnim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 2.5] }) }],
                      opacity: rippleOpacity,
                      backgroundColor: isTargetReached ? '#10b981' : colors.secondary,
                    },
                  ]}
                />

                {}
                <Animated.Text
                  style={[
                    dynStyles.mainCount,
                    {
                      transform: [{ scale: countAnim }],
                      color: isTargetReached ? '#059669' : colors.foreground, 
                    },
                  ]}
                >
                  {roundsCompleted}
                </Animated.Text>

                <ThemedText style={{ color: isTargetReached ? 'rgba(5, 150, 105, 0.6)' : isDark ? 'rgba(251, 191, 36, 0.5)' : 'rgba(180, 83, 9, 0.6)', fontSize: 18, marginTop: 4 }}>
                  {isTargetReached ? '✓ target reached' : 'rounds'}
                </ThemedText>

                {target && !isTargetReached && roundsCompleted > 0 && (
                  <ThemedText type="small" style={{ color: colors.mutedForeground, opacity: 0.6, marginTop: 4 }}>
                    {target - roundsCompleted} more to go
                  </ThemedText>
                )}

                {roundsCompleted === 0 && !isPaused && (
                  <ThemedText type="small" style={{ color: isDark ? 'rgba(245, 158, 11, 0.3)' : 'rgba(217, 119, 6, 0.4)', marginTop: 24, textAlign: 'center' }}>
                    Tap anywhere to count
                  </ThemedText>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {}
          <View style={[dynStyles.timerBar, { backgroundColor: isPaused ? 'rgba(245, 158, 11, 0.1)' : isDark ? colors.card : 'rgba(226, 234, 244, 0.5)' }]}>
            <TouchableOpacity
              style={[
                dynStyles.pauseBtn,
                {
                  backgroundColor: !hasActiveSession
                    ? colors.border + '40'
                    : isPaused
                      ? '#F59E0B' 
                      : isDark ? colors.background : '#e2eaf4', 
                },
              ]}
              onPress={handlePauseResume}
              disabled={!hasActiveSession}
            >
              <Feather
                name={isPaused ? 'play' : 'pause'}
                size={18}
                color={isPaused ? '#fff' : hasActiveSession ? colors.foreground : colors.mutedForeground}
              />
            </TouchableOpacity>

            <View style={{ alignItems: 'center', minWidth: 80 }}>
              <ThemedText style={[dynStyles.timerText, { color: isPaused ? '#F59E0B' : colors.foreground }]}>
                {formatTime(time)}
              </ThemedText>
              {isPaused && (
                <ThemedText type="small" style={{ color: '#F59E0B', fontSize: 10 }}>Paused</ThemedText>
              )}
            </View>
          </View>

          {}
          <View style={{ alignItems: 'center', marginTop: 16, gap: 10, paddingBottom: 8 }}>
            {roundsCompleted > 0 && (
              <TouchableOpacity style={[dynStyles.finishBtn, { borderColor: colors.secondary + '50' }]} onPress={handleReset}>
                <AntDesign name="reload1" size={15} color={colors.secondary} />
                <ThemedText style={{ color: colors.secondary, marginLeft: 8, fontWeight: '600', fontSize: 14 }}>
                  Finish &amp; Start New Session
                </ThemedText>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={dynStyles.undoBtn}
              onPress={handleUndo}
              disabled={roundsCompleted === 0}
            >
              <MaterialCommunityIcons name="undo-variant" size={16} color={colors.mutedForeground} />
              <ThemedText style={{ color: colors.mutedForeground, marginLeft: 6, fontSize: 13 }}>Undo last round</ThemedText>
            </TouchableOpacity>
          </View>
        </ScrollView >
      )}

      {}
      {
        activeTab === 'japa-room' && user?.id && (
          <View style={{ flex: 1 }}>
            <JapaRoomScreen userId={user.id} />
          </View>
        )
      }
      {
        activeTab === 'japa-room' && !user?.id && (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
            <ThemedText style={{ color: colors.mutedForeground, textAlign: 'center' }}>
              Please log in to access Japa Rooms
            </ThemedText>
          </View>
        )
      }

      {}
      <MantraSelectionModal
        visible={isMantraModalVisible}
        onClose={() => setMantraModalVisible(false)}
        onSelect={handleMantraSelect}
        currentMantra={currentMantra}
      />
      <JapaTargetModal
        visible={isTargetModalVisible}
        onClose={() => setTargetModalVisible(false)}
        currentTarget={target}
        currentCount={roundsCompleted}
        onTargetChange={handleTargetChange}
      />
    </SafeAreaView >
  );
};

const getDynStyles = (colors, isDark) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8,
    },
    headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '500', color: colors.foreground },

    tabBar: {
      flexDirection: 'row', marginHorizontal: 16, borderRadius: 8, padding: 4, marginBottom: 8,
      backgroundColor: isDark ? '#1a2d52' : '#E2EAF4' 
    },
    tabChip: { flex: 1, borderRadius: 6, paddingVertical: 6, alignItems: 'center' },
    tabChipActive: {
      backgroundColor: colors.background,
      shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 1, elevation: 1
    },
    tabLabel: { fontSize: 14, fontWeight: '500' },

    topRow: { flexDirection: 'row', alignItems: 'stretch', marginHorizontal: 16, marginTop: 4, gap: 10, height: 56 },
    statsCard: {
      flex: 1, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center',
      borderRadius: 12, backgroundColor: isDark ? colors.card : 'rgba(226, 234, 244, 0.5)',
    },
    statItem: { alignItems: 'center' },
    statNumber: { fontSize: 20, fontWeight: '600', color: colors.foreground },
    statLabel: { fontSize: 12, color: colors.mutedForeground, marginTop: 2 },
    statDivider: { width: 1, height: 32, backgroundColor: colors.border },
    iconBtn: {
      width: 56, borderRadius: 12, justifyContent: 'center', alignItems: 'center',
      backgroundColor: isDark ? colors.card : 'rgba(226, 234, 244, 0.5)',
    },
    targetBtn: {
      flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12,
      borderRadius: 12, borderWidth: 1, borderColor: colors.border,
      backgroundColor: isDark ? colors.card : 'rgba(226, 234, 244, 0.5)',
      justifyContent: 'center', gap: 6,
    },

    mantraCard: {
      marginHorizontal: 16, marginTop: 10, padding: 14, borderRadius: 14,
      borderWidth: 1, borderColor: colors.border,
    },

    scrollContent: { paddingBottom: 40 },
    counterWrapper: { alignItems: 'center', justifyContent: 'center', padding: 16, position: 'relative' },
    tapAreaContainer: {
      borderRadius: 24,
      overflow: 'hidden',
      position: 'relative',
    },
    tapArea: {
      flex: 1,
      width: '100%',
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderStyle: 'dashed',
      borderRadius: 24,
    },
    ripple: { position: 'absolute', width: 120, height: 120, borderRadius: 60, zIndex: 0 },
    mainCount: {
      fontSize: 100, fontWeight: '300', zIndex: 1,
      fontVariant: ['tabular-nums'], color: colors.foreground,
    },

    timerBar: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      marginHorizontal: 16, paddingVertical: 12, paddingHorizontal: 16,
      borderRadius: 16, gap: 16,
      backgroundColor: isDark ? colors.card : 'rgba(226, 234, 244, 0.5)',
    },
    pauseBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    timerText: { fontSize: 24, fontWeight: '500', fontVariant: ['tabular-nums'] },

    finishBtn: {
      flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 16,
      borderRadius: 30, borderWidth: 1,
    },
    undoBtn: { flexDirection: 'row', alignItems: 'center', padding: 8 },
  });

const styles = StyleSheet.create({
  celebrationOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  celebrationCard: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 40,
    paddingVertical: 28,
    borderRadius: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
  },
  celebrationTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginVertical: 4,
  },
});

export default MorningJapaScreen;