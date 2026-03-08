import { Feather } from "@expo/vector-icons";
import moment from "moment";
import { useEffect, useRef, useState } from "react";
import { Animated, FlatList, RefreshControl, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import NotificationCard from "../components/NotificationCard";
import { ThemedText } from "../components/ThemedText";
import { useTheme } from "../context/ThemeContext";

import { useNotifications } from "../hooks/useNotifications";

const NotificationScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { user } = useSelector((state) => state.user);
  const {
    notifications,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead
  } = useNotifications();

  const [refreshing, setRefreshing] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const bellRotate = useRef(new Animated.Value(0)).current;

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications(false);
    setRefreshing(false);
  };

  useEffect(() => {
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(bellRotate, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(bellRotate, {
          toValue: -1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(bellRotate, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.delay(3000),
      ])
    ).start();
  }, []);

  const bellRotation = bellRotate.interpolate({
    inputRange: [-1, 1],
    outputRange: ["-15deg", "15deg"],
  });

  const getNotificationConfig = (type, metadata) => {
    const notifType = metadata?.notification_type || type;
    switch (notifType) {
      case 'ekadashi':
        return { icon: 'moon', color: 'rgba(139, 92, 246, 0.1)', iconColor: '#8B5CF6' };
      case 'wisdom':
        return { icon: 'star', color: 'rgba(245, 158, 11, 0.1)', iconColor: '#F59E0B' };
      case 'japa':
        return { icon: 'infinite', color: 'rgba(59, 130, 246, 0.1)', iconColor: '#3B82F6' };
      case 'panchang':
        return { icon: 'time', color: 'rgba(16, 185, 129, 0.1)', iconColor: '#10B981' };
      case 'festival':
        return { icon: 'gift', color: 'rgba(236, 72, 153, 0.1)', iconColor: '#EC4899' };
      case 'admin':
      case 'announcement':
        return { icon: 'megaphone', color: 'rgba(249, 115, 22, 0.1)', iconColor: '#F97316' };
      case 'update':
        return { icon: 'sparkles', color: 'rgba(59, 130, 246, 0.1)', iconColor: '#3B82F6' };
      default:
        return { icon: 'notifications', color: 'rgba(107, 114, 128, 0.1)', iconColor: '#6B7280' };
    }
  };

  const renderNotificationList = () => (
    <FlatList
      data={notifications}
      keyExtractor={(item) => item.id}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
      renderItem={({ item }) => {
        const config = getNotificationConfig(item.type, item.metadata);
        return (
          <NotificationCard
            title={item.title}
            description={item.message}
            time={moment(item.created_at).fromNow()}
            unread={!item.read_at}
            tag={item.metadata?.notification_type?.toUpperCase() || item.type.toUpperCase()}
            {...config}
            onPress={() => {
              if (!item.read_at) markAsRead(item.id);
            }}
          />
        );
      }}
      contentContainerStyle={[styles.listContainer, { backgroundColor: isDark ? colors.muted : '#F3F3F3' }]}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <ThemedText type="small" style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
          RECENT NOTIFICATIONS
        </ThemedText>
      }
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <View style={styles.decorativeCircles}>
        <View style={[styles.circle, styles.circle1, { backgroundColor: colors.primary + '10' }]} />
        <View style={[styles.circle, styles.circle2, { backgroundColor: colors.primary + '05' }]} />
        <View style={[styles.circle, styles.circle3, { backgroundColor: colors.primary + '08' }]} />
      </View>

      <Animated.View style={[styles.iconContainer, {
        backgroundColor: isDark ? colors.muted : '#fff',
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }]
      }]}>
        <View style={[styles.iconInnerCircle, { backgroundColor: colors.primary + '15' }]}>
          <Animated.View style={{ transform: [{ rotate: bellRotation }] }}>
            <Feather name="bell" size={50} color={colors.primary} />
          </Animated.View>
        </View>
      </Animated.View>

      <View style={styles.textContent}>
        <ThemedText type="subtitle" style={styles.emptyTitle}>No Notifications Yet</ThemedText>
        <ThemedText style={[styles.emptyDescription, { color: colors.mutedForeground }]}>
          Stay tuned! We'll notify you about upcoming Ekadashis, wisdom quotes, and important updates.
        </ThemedText>
      </View>

      <View style={styles.featuresContainer}>
        {[
          { icon: 'calendar', text: 'Ekadashi Alerts' },
          { icon: 'book-open', text: 'Daily Wisdom' },
          { icon: 'bell', text: 'Panchang Updates' }
        ].map((feature, index) => (
          <View key={index} style={[styles.featurePill, { borderColor: colors.border, backgroundColor: colors.card }]}>
            <Feather name={feature.icon} size={14} color={colors.primary} />
            <ThemedText style={styles.featureText}>{feature.text}</ThemedText>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.headerContainer, { borderBottomColor: colors.border, borderBottomWidth: notifications.length > 0 ? 0.5 : 0 }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Feather
              name="arrow-left"
              size={24}
              color={colors.mutedForeground}
            />
          </TouchableOpacity>
          <ThemedText type="subtitle" style={styles.headerTitle}>
            Notifications
          </ThemedText>
          <TouchableOpacity
            onPress={markAllAsRead}
            style={styles.clearButton}
          >
            {notifications.some(n => !n.read_at) && <Feather name="check-square" size={20} color={colors.mutedForeground} />}
          </TouchableOpacity>
        </View>

        {notifications.length > 0 ? renderNotificationList() : renderEmptyState()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  clearButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    paddingTop: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 16,
    marginTop: 8,
  },
  emptyStateContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingBottom: 60,
  },
  decorativeCircles: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  circle: {
    position: "absolute",
    borderRadius: 1000,
  },
  circle1: {
    width: 300,
    height: 300,
    top: -50,
    right: -100,
  },
  circle2: {
    width: 200,
    height: 200,
    bottom: 100,
    left: -50,
  },
  circle3: {
    width: 150,
    height: 150,
    top: "40%",
    left: -30,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
    shadowColor: "#8B5CF6",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  iconInnerCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginTop: '5%'

  },
  textContent: {
    alignItems: "center",
    marginBottom: 32,
  },
  emptyTitle: {
    fontSize: 25,
    marginBottom: 12,
    textAlign: "center",
  },
  emptyDescription: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 24,
    opacity: 0.8,
  },
  featuresContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
    marginBottom: 40,
  },
  featurePill: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  featureText: {
    fontSize: 12,
    fontWeight: "600",
  },
});

export default NotificationScreen;