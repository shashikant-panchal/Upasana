import {
  Feather,
  FontAwesome5,
  Ionicons,
  MaterialIcons
} from "@expo/vector-icons";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useFocusEffect, useScrollToTop } from "@react-navigation/native";
import * as Calendar from "expo-calendar";
import Constants from "expo-constants";
import * as FileSystem from "expo-file-system/legacy";
import { LinearGradient } from "expo-linear-gradient";
import * as Sharing from "expo-sharing";
import moment from "moment";
import { useCallback, useEffect, useRef, useState } from "react";
import Toast from "react-native-toast-message";
import SpInAppUpdates, {
  IAUUpdateKind,
} from "sp-react-native-in-app-updates";

import { useTranslation } from "react-i18next";
import NotificationSettingsModal from "../components/NotificationSettingsModal";
import NotificationService from "../services/NotificationService";
import StoreService from "../services/StoreService";

import { supabase } from "../utils/supabase";

import {
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Linking,
  Modal,
  PermissionsAndroid,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import RazorpayCheckout from "react-native-razorpay";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { useDispatch, useSelector } from "react-redux";
import { ThemedText } from "../components/ThemedText";
import { useTheme } from "../context/ThemeContext";
import { detectLocation, setAutoDetect } from "../redux/locationSlice";
import {
  saveTextSize,
  saveTheme,
  toggleLargeText,
  toggleTheme,
} from "../redux/themeSlice";
import { signOut } from "../redux/userSlice";
import { getEkadashiList } from "../services/api";

const { width, height } = Dimensions.get("window");
const dw = width / 100;
const dh = height / 100;

const BellIcon = ({ colors, dw }) => (
  <View
    style={{
      backgroundColor: colors.primary + "10",
      padding: 6,
      borderRadius: 8,
      marginRight: 8,
    }}
  >
    <Ionicons name="notifications-outline" size={18} color={colors.primary} />
  </View>
);

const LANGUAGES = [
  { key: "en", name: "English", native: "English" },
  { key: "hi", name: "Hindi", native: "हिंदी" },
  { key: "kn", name: "Kannada", native: "ಕನ್ನಡ" },
  { key: "bn", name: "Bengali", native: "বাংলা" },
  { key: "fr", name: "French", native: "Français" },
  { key: "de", name: "German", native: "Deutsch" },
];

const LanguageModal = ({
  modalVisible,
  setModalVisible,
  selectedLanguage,
  setSelectedLanguage,
  i18n,
  colors,
}) => {
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[modalStyles.listItem, { backgroundColor: colors.card }]}
      onPress={() => {
        setSelectedLanguage(item.name);
        i18n.changeLanguage(item.key);
        setModalVisible(false);
      }}
    >
      {selectedLanguage === item.name ? (
        <Feather
          name="check"
          size={5 * dw}
          color={colors.primary}
          style={modalStyles.checkIcon}
        />
      ) : (
        <View style={modalStyles.checkIconPlaceholder} />
      )}
      <ThemedText
        style={[modalStyles.listItemText, { color: colors.foreground }]}
      >
        {item.native}
      </ThemedText>
    </TouchableOpacity>
  );

  const topPosition = 35 * dh;
  const rightPosition = 6 * dw;

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <TouchableOpacity
        style={[
          modalStyles.centeredView,
          {
            backgroundColor: colors.isDark
              ? "rgba(0, 0, 0, 0.5)"
              : "rgba(0, 0, 0, 0.05)",
          },
        ]}
        activeOpacity={1}
        onPress={() => setModalVisible(false)}
      >
        <View
          style={[
            modalStyles.modalView,
            {
              top: topPosition,
              right: rightPosition,
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <FlatList
            data={LANGUAGES}
            renderItem={renderItem}
            keyExtractor={(item) => item.key}
            style={modalStyles.list}
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const SuccessModal = ({ visible, count, onClose, colors }) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0, 0, 0, 0.6)",
        }}
      >
        <View
          style={{
            backgroundColor: colors.card,
            padding: 25,
            borderRadius: 20,
            width: "80%",
            alignItems: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 10,
            elevation: 10,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <View
            style={{
              width: 70,
              height: 70,
              borderRadius: 35,
              backgroundColor: colors.primary + "20", 
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <Ionicons
              name="checkmark-circle"
              size={40}
              color={colors.primary}
            />
          </View>

          <ThemedText
            type="heading"
            style={{
              marginBottom: 10,
              color: colors.foreground,
              textAlign: "center",
            }}
          >
            Sync Complete!
          </ThemedText>

          <ThemedText
            style={{
              textAlign: "center",
              color: colors.mutedForeground,
              marginBottom: 25,
              lineHeight: 22,
            }}
          >
            Successfully added{" "}
            <ThemedText
              type="defaultSemiBold"
              style={{ color: colors.primary }}
            >
              {count} Ekadashi events
            </ThemedText>{" "}
            to your device calendar.
          </ThemedText>

          <TouchableOpacity
            style={{
              backgroundColor: colors.primary,
              paddingVertical: 12,
              paddingHorizontal: 40,
              borderRadius: 12,
              width: "100%",
            }}
            onPress={onClose}
          >
            <ThemedText
              type="defaultSemiBold"
              style={{ color: "#fff", textAlign: "center", fontSize: 16 }}
            >
              Great
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const DonationModal = ({ visible, onClose, onConfirm, colors, amount, setAmount }) => {
  return (
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0, 0, 0, 0.6)",
        }}
      >
        <View
          style={{
            backgroundColor: colors.card,
            padding: 25,
            borderRadius: 20,
            width: "85%",
            alignItems: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 10,
            elevation: 10,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <View
            style={{
              width: 70,
              height: 70,
              borderRadius: 35,
              backgroundColor: colors.primary + "20",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <SimpleLineIcons name="cup" size={30} color={colors.primary} />
          </View>

          <ThemedText
            type="heading"
            style={{
              marginBottom: 10,
              color: colors.foreground,
              textAlign: "center",
            }}
          >
            Support Upāsanā
          </ThemedText>

          <ThemedText
            style={{
              textAlign: "center",
              color: colors.mutedForeground,
              marginBottom: 20,
              lineHeight: 22,
            }}
          >
            Enter the amount you would like to donate to support our work.
          </ThemedText>

          <View
            style={{
              width: "100%",
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: colors.muted + "10",
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.border,
              paddingHorizontal: 15,
              marginBottom: 25,
            }}
          >
            <ThemedText style={{ fontSize: 20, fontWeight: "bold", color: colors.foreground }}>
              ₹
            </ThemedText>
            <TextInput
              style={{
                flex: 1,
                height: 50,
                fontSize: 20,
                fontWeight: "bold",
                color: colors.foreground,
                marginLeft: 10,
              }}
              placeholder="0"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
              autoFocus
            />
          </View>

          <View style={{ flexDirection: "row", width: "100%", gap: 12 }}>
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: colors.muted,
                paddingVertical: 12,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: colors.border,
              }}
              onPress={onClose}
            >
              <ThemedText
                type="defaultSemiBold"
                style={{
                  color: colors.foreground,
                  textAlign: "center",
                  fontSize: 16,
                }}
              >
                Cancel
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: colors.primary,
                paddingVertical: 12,
                borderRadius: 12,
                opacity: amount && parseFloat(amount) > 0 ? 1 : 0.5,
              }}
              disabled={!amount || parseFloat(amount) <= 0}
              onPress={() => onConfirm(amount)}
            >
              <ThemedText type="defaultSemiBold" style={{ color: "#fff", textAlign: "center", fontSize: 16 }}>
                Support
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const LogoutConfirmationModal = ({
  visible,
  onConfirm,
  onCancel,
  colors,
  t,
}) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onCancel}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0, 0, 0, 0.6)",
        }}
      >
        <View
          style={{
            backgroundColor: colors.card,
            padding: 25,
            borderRadius: 20,
            width: "85%",
            alignItems: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 10,
            elevation: 10,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <View
            style={{
              width: 70,
              height: 70,
              borderRadius: 35,
              backgroundColor: colors.destructive + "20",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <Ionicons
              name="log-out-outline"
              size={40}
              color={colors.destructive}
            />
          </View>

          <ThemedText
            type="heading"
            style={{
              marginBottom: 10,
              color: colors.foreground,
              textAlign: "center",
            }}
          >
            {t("settings.support.logout")}?
          </ThemedText>

          <ThemedText
            style={{
              textAlign: "center",
              color: colors.mutedForeground,
              marginBottom: 25,
              lineHeight: 22,
            }}
          >
            Are you sure you want to log out of your account?
          </ThemedText>

          <View style={{ flexDirection: "row", width: "100%", gap: 12 }}>
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: colors.muted,
                paddingVertical: 12,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: colors.border,
              }}
              onPress={onCancel}
            >
              <ThemedText
                type="defaultSemiBold"
                style={{
                  color: colors.foreground,
                  textAlign: "center",
                  fontSize: 16,
                }}
              >
                {t("common.cancel") || "Cancel"}
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: colors.destructive,
                paddingVertical: 12,
                borderRadius: 12,
              }}
              onPress={() => {
                console.log("Modal Logout button pressed");
                onConfirm();
              }}
            >
              <ThemedText
                type="defaultSemiBold"
                style={{ color: "#fff", textAlign: "center", fontSize: 16 }}
              >
                {t("settings.support.logout")}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const SettingsScreen = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const { colors, isDark } = useTheme();
  const scrollRef = useRef(null);
  useScrollToTop(scrollRef);
  const { session } = useSelector((state) => state.user);
  const { city, country, autoDetect, loading } = useSelector(
    (state) => state.location
  );
  const { resolvedTheme, isLargeText } = useSelector((state) => state.theme);

  const [ekadashiReminder, setEkadashiReminder] = useState(true);
  const [morningReminder, setMorningReminder] = useState(true);
  const [paranaReminder, setParanaReminder] = useState(true);

  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);

  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [languageModalVisible, setLanguageModalVisible] = useState(false);

  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [donationModalVisible, setDonationModalVisible] = useState(false);
  const [donationAmount, setDonationAmount] = useState("");

  const [prefs, setPrefs] = useState({
    ekadashi_reminders: true,
    morning_reminders: true,
    parana_reminders: true,
    japa_reminders: true,
    push_enabled: false,
    notification_time: "06:00",
    notification_sound: "default",
    repeat_enabled: true,
    repeat_days: ["sun", "mon", "tue", "wed", "thu", "fri", "sat"],
  });
  const [prefsLoading, setPrefsLoading] = useState(true);
  const [advancedModalVisible, setAdvancedModalVisible] = useState(false);

  const [appMetadata, setAppMetadata] = useState({
    version: Constants.expoConfig?.version || "1.0.0",
    lastUpdated: "Dec 17, 2025",
  });

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const fetchMetadata = async () => {
      const data = await StoreService.getStoreMetadata();
      if (data) setAppMetadata(data);
    };
    fetchMetadata();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchNotificationPreferences();

      const channel = supabase
        .channel(`profile-updates-${session?.user?.id}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "profiles",
            filter: `user_id=eq.${session?.user?.id}`,
          },
          (payload) => {
            console.log("Realtime update received:", payload);
            if (payload.new?.notification_preferences) {
              const dbPrefs = payload.new.notification_preferences;
              NotificationService.checkPermission().then((isGranted) => {
                setPrefs({
                  ekadashi_reminders: dbPrefs.ekadashi_reminders ?? true,
                  morning_reminders: dbPrefs.morning_reminders ?? true,
                  parana_reminders: dbPrefs.parana_reminders ?? true,
                  japa_reminders: dbPrefs.japa_reminders ?? true,
                  notification_time:
                    dbPrefs.notification_time?.slice(0, 5) || "06:00",
                  notification_sound: dbPrefs.notification_sound || "default",
                  repeat_enabled: dbPrefs.repeat_enabled ?? true,
                  repeat_days: dbPrefs.repeat_days || [
                    "sun",
                    "mon",
                    "tue",
                    "wed",
                    "thu",
                    "fri",
                    "sat",
                  ],
                  push_enabled: isGranted && (dbPrefs.push_enabled ?? false),
                });
              });
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }, [session?.user?.id])
  );

  const fetchNotificationPreferences = async () => {
    if (!session?.user?.id) return;
    setPrefsLoading(true);
    try {
      const isGranted = await NotificationService.checkPermission();

      const { data, error } = await supabase
        .from("profiles")
        .select("notification_preferences")
        .eq("user_id", session.user.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      if (data?.notification_preferences) {
        const dbPrefs = data.notification_preferences;
        setPrefs({
          ekadashi_reminders: dbPrefs.ekadashi_reminders ?? true,
          morning_reminders: dbPrefs.morning_reminders ?? true,
          parana_reminders: dbPrefs.parana_reminders ?? true,
          japa_reminders: dbPrefs.japa_reminders ?? true,
          notification_time: dbPrefs.notification_time?.slice(0, 5) || "06:00",
          notification_sound: dbPrefs.notification_sound || "default",
          repeat_enabled: dbPrefs.repeat_enabled ?? true,
          repeat_days: dbPrefs.repeat_days || [
            "sun",
            "mon",
            "tue",
            "wed",
            "thu",
            "fri",
            "sat",
          ],
          push_enabled: isGranted && (dbPrefs.push_enabled ?? false),
        });
      } else {
        setPrefs((prev) => ({ ...prev, push_enabled: isGranted }));
      }
    } catch (error) {
      console.error("Error fetching notification preferences:", error);
    } finally {
      setPrefsLoading(false);
    }
  };

  const handleEnablePush = async () => {
    if (!session?.user?.id) return;

    try {
      let granted = false;

      if (Platform.OS === 'android' && Platform.Version >= 33) {
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        granted = result === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        granted = await NotificationService.requestPermission();
      }

      if (granted) {
        await NotificationService.initialize(session.user.id);
        await handleUpdatePref("push_enabled", true);
      } else {
        Alert.alert(
          "Notifications Disabled",
          "To receive Ekadashi reminders, please enable notifications in your phone settings.",
          [
            {
              text: "Cancel",
              style: "cancel",
            },
            {
              text: "Open Settings",
              onPress: () => Linking.openSettings(),
            },
          ]
        );
      }
    } catch (error) {
      console.error("Error enabling push notifications:", error);
      Alert.alert("Error", "Something went wrong while enabling notifications.");
    }
  };

  const handleUpdatePref = async (key, value) => {
    if (!session?.user?.id) return;
    const newPrefs = { ...prefs, [key]: value };
    setPrefs(newPrefs);
    try {
      await NotificationService.updatePreferences(session.user.id, {
        [key]: value,
      });
    } catch (error) {
      console.error("Error updating preference:", error);
      
      setPrefs(prefs);
    }
  };

  const [showTimePicker, setShowTimePicker] = useState(false);

  const onTimeChange = (event, selectedDate) => {
    setShowTimePicker(false);
    if (selectedDate) {
      const timeString = moment(selectedDate).format("HH:mm");
      handleUpdatePref("notification_time", timeString);
    }
  };

  const handleToggleDarkMode = () => {
    dispatch(toggleTheme());
    dispatch(saveTheme(resolvedTheme === "dark" ? "light" : "dark"));
  };

  const handleToggleLargeText = (value) => {
    dispatch(toggleLargeText());
    dispatch(saveTextSize(value));
  };

  const handleCoffee = () => {
    setDonationAmount("");
    setDonationModalVisible(true);
  };

  const handleCheckForUpdates = () => {
    const inAppUpdates = new SpInAppUpdates(
      false 
    );
    inAppUpdates
      .checkNeedsUpdate({
        curVersion: Constants.expoConfig?.version || "1.0.0",
      })
      .then(async (result) => {
        if (result.shouldUpdate) {
          const updateOptions = {
            updateType: IAUUpdateKind.FLEXIBLE,
          };
          inAppUpdates.startUpdate(updateOptions);
        } else {
          
          const data = await StoreService.getStoreMetadata();
          if (data) setAppMetadata(data);

          Toast.show({
            type: "info",
            text1: "App is up to date",
            text2: "You are using the latest version of Upāsanā.",
          });
        }
      })
      .catch((error) => {
        console.log("Update Check Error:", error);

        let errorMsg = "Could not check for updates at this time.";
        let errorTitle = "Update Check Failed";

        if (error.toString().includes("-6") || error.toString().includes("Install Error(-6)")) {
          errorTitle = "Store Check Unavailable";
          errorMsg = "Update checks are only available for apps installed through the Google Play Store.";
        }

        Toast.show({
          type: "error",
          text1: errorTitle,
          text2: errorMsg,
        });
      });
  };

  const processCoffeePayment = (amount) => {
    const amountInPaise = Math.round(parseFloat(amount) * 100).toString();

    const options = {
      description: "Support Upāsanā - Buy Me a Coffee",
      image: "https://razorpay.com/favicon.png",
      currency: "INR",
      key: "rzp_live_S283tQisTl3co1",
      amount: amountInPaise,
      name: "Upāsanā Support",
      prefill: {
        email: session?.user?.email || "",
        contact: "",
        name: session?.user?.email?.split("@")[0] || "",
      },
      theme: { color: colors.primary },
    };

    setDonationModalVisible(false);

    RazorpayCheckout.open(options)
      .then((data) => {
        Toast.show({
          type: "success",
          text1: t("common.success") || "Success",
          text2: `Payment ID: ${data.razorpay_payment_id}`,
        });
      })
      .catch((error) => {
        if (error.code !== 2) {
          Toast.show({
            type: "error",
            text1: "Payment Failed",
            text2: error.description || `Error: ${error.code}`,
          });
        }
      });
  };

  const handleLogout = () => {
    console.log("handleLogout called - showing modal");
    setLogoutModalVisible(true);
  };

  const performLogout = () => {
    console.log("performLogout (sync) initiated");
    setLogoutModalVisible(false);

    if (session?.user?.id) {
      AsyncStorage.removeItem(`onboarding_completed_${session.user.id}`)
        .then(() => console.log("Onboarding removed (async success)"))
        .catch((err) => console.error("Onboarding removal error:", err));
    }

    console.log("Calling dispatch(signOut())");
    dispatch(signOut());
  };

  const [comingSoonModalVisible, setComingSoonModalVisible] = useState(false);
  const [syncSuccessVisible, setSyncSuccessVisible] = useState(false);
  const [syncCount, setSyncCount] = useState(0);

  const handleSyncToCalendar = async () => {
    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status !== "granted") {
        alert("Calendar permission is required.");
        return;
      }

      let calendarId;

      if (Platform.OS === "android") {
        const calendars = await Calendar.getCalendarsAsync(
          Calendar.EntityTypes.EVENT
        );
        let targetCalendar =
          calendars.find(
            (cal) => cal.isPrimary && cal.source.type === "com.google"
          ) ||
          calendars.find((cal) => cal.source.type === "com.google") ||
          calendars.find((cal) => cal.allowsModifications);

        if (!targetCalendar) {
          alert("Could not find a writable calendar.");
          return;
        }
        calendarId = targetCalendar.id;
      } else {
        const defaultCalendar = await Calendar.getDefaultCalendarAsync();
        const calendars = await Calendar.getCalendarsAsync(
          Calendar.EntityTypes.EVENT
        );
        const existingCalendar = calendars.find(
          (cal) => cal.title === "Ekadashi Din"
        );

        if (existingCalendar) {
          calendarId = existingCalendar.id;
        } else {
          calendarId = await Calendar.createCalendarAsync({
            title: "Ekadashi Din",
            color: colors.primary,
            entityType: Calendar.EntityTypes.EVENT,
            sourceId: defaultCalendar.source.id,
            source: defaultCalendar.source,
            name: "ekadashidin",
            ownerAccount: "personal",
            accessLevel: Calendar.CalendarAccessLevel.OWNER,
          });
        }
      }

      const year = moment().year();
      const ekadashiList = await getEkadashiList(year);

      let count = 0;
      for (const ekd of ekadashiList) {
        const rawDate = ekd.date || ekd.ekadashi_date;
        const mDate = moment(rawDate);

        let startDate, endDate;

        if (Platform.OS === "android") {
          
          startDate = new Date(
            mDate.year(),
            mDate.month(),
            mDate.date(),
            0,
            0,
            0
          );
          endDate = new Date(
            mDate.year(),
            mDate.month(),
            mDate.date(),
            23,
            59,
            59
          );
        } else {
          
          startDate = mDate.startOf("day").toDate();
          endDate = mDate.endOf("day").toDate();
        }

        await Calendar.createEventAsync(calendarId, {
          title: `${ekd.name || ekd.ekadashi_name} (Ekadashi)`,
          startDate,
          endDate,
          allDay: true,
          
          timeZone: Platform.OS === "ios" ? "GMT" : undefined,
          notes: ekd.description || "Ekadashi Vrat",
          availability: Calendar.Availability.FREE,
        });
        count++;
      }

      setSyncCount(count);
      setSyncSuccessVisible(true);
    } catch (e) {
      console.error(e);
      alert("Sync failed: " + e.message);
    }
  };

  const handleExportToICal = async () => {
    try {
      const year = moment().year();
      const ekadashiList = await getEkadashiList(year);

      let icsContent = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Ekadashi Din//NONSGML v1.0//EN",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
      ];

      ekadashiList.forEach((ekd) => {
        const dateStr = moment(ekd.date || ekd.ekadashi_date).format(
          "YYYYMMDD"
        );
        const title = ekd.name || ekd.ekadashi_name;
        const description =
          ekd.description || ekd.significance || "Ekadashi Vrat";

        icsContent.push("BEGIN:VEVENT");
        icsContent.push(
          `UID:${dateStr}-${title.replace(/\s+/g, "")}@ekadashidin.app`
        );
        icsContent.push(`DTSTAMP:${moment().format("YYYYMMDDTHHmmss")}Z`);
        icsContent.push(`DTSTART;VALUE=DATE:${dateStr}`);
        icsContent.push(
          `DTEND;VALUE=DATE:${moment(dateStr)
            .add(1, "days")
            .format("YYYYMMDD")}`
        );
        icsContent.push(`SUMMARY:${title} (Ekadashi)`);
        icsContent.push(`DESCRIPTION:${description}`);
        icsContent.push("END:VEVENT");
      });

      icsContent.push("END:VCALENDAR");

      const fileUri = FileSystem.cacheDirectory + "Ekadashi_Calendar.ics";
      await FileSystem.writeAsStringAsync(fileUri, icsContent.join("\r\n"));

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: "text/calendar",
          dialogTitle: "Export Ekadashi Calendar",
          UTI: "public.calendar-event", 
        });
      } else {
        alert("Sharing is not available on this device");
      }
    } catch (error) {
      console.log("Error exporting iCal:", error);
      alert("Failed to export iCal file");
    }
  };

  const styles = getStyles(colors, dw, dh);

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
        {}
        <ThemedText type="heading" style={styles.header}>
          {t("settings.title")}
        </ThemedText>
        <ThemedText type="small" style={styles.subHeader}>
          {t("settings.subtitle")}
        </ThemedText>
        <View style={styles.divider} />

        {}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Ionicons
              name="location-outline"
              size={18}
              color={colors.primary}
            />
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              {t("settings.location.title")}
            </ThemedText>
          </View>

          <View style={styles.rowBetween}>
            <View>
              <ThemedText style={styles.label}>
                {t("settings.location.current")}
              </ThemedText>
              <ThemedText type="small" style={styles.subLabel}>
                {loading
                  ? t("settings.location.detecting")
                  : city
                    ? `${city}, ${country}`
                    : t("settings.location.detected").replace(
                      "detected",
                      "Not detected"
                    )}
              </ThemedText>
            </View>
            <TouchableOpacity
              style={styles.smallBtn}
              onPress={() => dispatch(detectLocation())}
            >
              <ThemedText type="small" style={styles.smallBtnText}>
                {t("common.change")}
              </ThemedText>
            </TouchableOpacity>
          </View>

          <View style={styles.rowBetween}>
            <View>
              <ThemedText style={styles.label}>
                {t("settings.location.autoDetect")}
              </ThemedText>
              <ThemedText type="small" style={styles.subLabel}>
                {t("settings.location.autoDetectDesc")}
              </ThemedText>
            </View>
            <Switch
              trackColor={{ false: colors.muted, true: colors.primary }}
              thumbColor="#fff"
              value={autoDetect}
              onValueChange={(value) => {
                dispatch(setAutoDetect(value));
                if (value) {
                  dispatch(detectLocation());
                }
              }}
            />
          </View>
        </View>

        {}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <FontAwesome5 name="language" size={16} color={colors.primary} />
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              {t("settings.language.title")}
            </ThemedText>
          </View>

          <View
            style={[
              styles.rowBetween,
              {
                justifyContent: "space-between",
                borderBottomWidth: 0,
                marginVertical: 0,
              },
            ]}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Feather name="globe" size={20} color={colors.foreground} />
              <View style={{ marginHorizontal: 10 }}>
                <ThemedText style={styles.label}>
                  {t("settings.language.appLanguage")}
                </ThemedText>
                <ThemedText type="small" style={styles.subLabel}>
                  {selectedLanguage}
                </ThemedText>
              </View>
            </View>

            <TouchableOpacity
              style={styles.dropdownTrigger}
              onPress={() => setLanguageModalVisible(true)}
            >
              <ThemedText type="small" style={styles.dropdownText}>
                {selectedLanguage}
              </ThemedText>
              <MaterialIcons
                name="keyboard-arrow-down"
                size={22}
                color={colors.primary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {}
        <LanguageModal
          modalVisible={languageModalVisible}
          setModalVisible={setLanguageModalVisible}
          selectedLanguage={selectedLanguage}
          setSelectedLanguage={setSelectedLanguage}
          i18n={i18n}
          colors={colors}
        />

        {}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <BellIcon colors={colors} dw={dw} />
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              Notifications
            </ThemedText>
          </View>

          {}
          {!prefs.push_enabled && (
            <View
              style={[
                styles.banner,
                {
                  backgroundColor: colors.primary + "10",
                  borderColor: colors.primary + "20",
                },
              ]}
            >
              <View
                style={[
                  styles.bannerIcon,
                  { backgroundColor: colors.primary + "20" },
                ]}
              >
                <Ionicons
                  name="notifications"
                  size={20}
                  color={colors.primary}
                />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText type="defaultSemiBold">
                  Enable Push Notifications
                </ThemedText>
                <ThemedText
                  type="small"
                  style={{ color: colors.mutedForeground }}
                >
                  Get real-time reminders for Ekadashi, Parana times, and daily
                  sadhana
                </ThemedText>
                <TouchableOpacity
                  style={[
                    styles.enableBtn,
                    { backgroundColor: colors.primary },
                  ]}
                  onPress={handleEnablePush}
                >
                  <ThemedText style={styles.enableBtnText}>
                    Enable Notifications
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={styles.notificationItem}>
            <View>
              <ThemedText style={styles.label}>Ekadashi Reminders</ThemedText>
              <ThemedText style={styles.subLabel}>
                Day before notification
              </ThemedText>
            </View>

            <Switch
              trackColor={{ false: colors.muted, true: colors.primary }}
              thumbColor="#fff"
              value={prefs.ekadashi_reminders}
              onValueChange={(value) =>
                handleUpdatePref("ekadashi_reminders", value)
              }
            />
          </View>

          <View style={styles.notificationItem}>
            <View>
              <ThemedText style={styles.label}>Morning Reminders</ThemedText>
              <ThemedText style={styles.subLabel}>
                Fasting start notification
              </ThemedText>
            </View>

            <Switch
              trackColor={{ false: colors.muted, true: colors.primary }}
              thumbColor="#fff"
              value={prefs.morning_reminders}
              onValueChange={(value) =>
                handleUpdatePref("morning_reminders", value)
              }
            />
          </View>

          <View style={styles.notificationItem}>
            <View>
              <ThemedText style={styles.label}>Parana Reminders</ThemedText>
              <ThemedText style={styles.subLabel}>
                Fast breaking time
              </ThemedText>
            </View>

            <Switch
              trackColor={{ false: colors.muted, true: colors.primary }}
              thumbColor="#fff"
              value={prefs.parana_reminders}
              onValueChange={(value) =>
                handleUpdatePref("parana_reminders", value)
              }
            />
          </View>

          <View style={styles.notificationTimeRow}>
            <View>
              <ThemedText style={styles.label}>Notification Time</ThemedText>
              <ThemedText style={styles.subLabel}>
                {prefs.notification_time
                  ? moment(prefs.notification_time, "HH:mm").format("hh:mm A")
                  : "06:00 AM"}
              </ThemedText>
            </View>

            <TouchableOpacity
              style={styles.timeValueBox}
              onPress={() => setShowTimePicker(true)}
            >
              <ThemedText style={{ color: colors.primary, fontWeight: "600" }}>
                {prefs.notification_time}
              </ThemedText>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={colors.primary}
                style={{ marginLeft: 4 }}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.advancedBtn, { borderColor: colors.border }]}
            onPress={() => setAdvancedModalVisible(true)}
          >
            <ThemedText type="defaultSemiBold">
              Advanced Notification Settings
            </ThemedText>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.mutedForeground}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.testLink}
            onPress={() => NotificationService.sendLocalTestNotification()}
          >
            <ThemedText style={{ color: colors.primary, fontWeight: "600" }}>
              Send Test Notification
            </ThemedText>
          </TouchableOpacity>

          {showTimePicker && (
            <DateTimePicker
              value={moment(prefs.notification_time, "HH:mm").toDate()}
              mode="time"
              is24Hour={false}
              display="default"
              onChange={onTimeChange}
            />
          )}
        </View>

        {}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Feather name="eye" size={18} color={colors.primary} />
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              {t("settings.display.title")}
            </ThemedText>
          </View>

          <View style={styles.rowBetween}>
            <View>
              <ThemedText style={styles.label}>
                {t("settings.display.darkMode")}
              </ThemedText>
              <ThemedText type="small" style={styles.subLabel}>
                {t("settings.display.darkModeDesc")}
              </ThemedText>
            </View>
            <Switch
              trackColor={{ false: colors.muted, true: colors.primary }}
              thumbColor="#fff"
              value={isDark}
              onValueChange={handleToggleDarkMode}
            />
          </View>

          <View style={styles.rowBetween}>
            <View>
              <ThemedText style={styles.label}>
                {t("settings.display.largeText")}
              </ThemedText>
              <ThemedText type="small" style={styles.subLabel}>
                {t("settings.display.largeTextDesc")}
              </ThemedText>
            </View>
            <Switch
              trackColor={{ false: colors.muted, true: colors.primary }}
              thumbColor="#fff"
              value={isLargeText}
              onValueChange={handleToggleLargeText}
            />
          </View>
        </View>

        {}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Ionicons
              name="calendar-outline"
              size={18}
              color={colors.secondary}
            />
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              {t("settings.calendar.title")}
            </ThemedText>
          </View>

          <View style={styles.rowBetween}>
            <View>
              <ThemedText style={styles.label}>
                {t("settings.calendar.syncGoogle")}
              </ThemedText>
              <ThemedText type="small" style={styles.subLabel}>
                {t("settings.calendar.syncGoogleDesc")}
              </ThemedText>
            </View>
            <TouchableOpacity
              style={styles.smallBtn}
              onPress={handleSyncToCalendar}
            >
              <ThemedText type="small" style={styles.smallBtnText}>
                {t("common.connect")}
              </ThemedText>
            </TouchableOpacity>
          </View>

          <View style={styles.rowBetween}>
            <View>
              <ThemedText style={styles.label}>
                {t("settings.calendar.exportICal")}
              </ThemedText>
              <ThemedText type="small" style={styles.subLabel}>
                {t("settings.calendar.exportICalDesc")}
              </ThemedText>
            </View>
            <TouchableOpacity
              style={styles.smallBtn}
              onPress={handleExportToICal}
            >
              <ThemedText type="small" style={styles.smallBtnText}>
                {t("common.export")}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Feather name="info" size={18} color={colors.primary} />
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              {t("settings.appInfo.title")}
            </ThemedText>
          </View>

          <View style={styles.rowBetween}>
            <ThemedText style={styles.label}>
              {t("settings.appInfo.version")}
            </ThemedText>
            <ThemedText
              type="small"
              style={[styles.subLabel, { color: colors.primary }]}
            >
              {appMetadata.version}
            </ThemedText>
          </View>

          <View style={styles.rowBetween}>
            <ThemedText style={styles.label}>
              {t("settings.appInfo.lastUpdated")}
            </ThemedText>
            <ThemedText
              type="small"
              style={[styles.subLabel, { color: colors.primary }]}
            >
              {appMetadata.lastUpdated}
            </ThemedText>
          </View>

          <TouchableOpacity style={styles.updateBtn} onPress={handleCheckForUpdates}>
            <ThemedText type="defaultSemiBold" style={styles.updateText}>
              {t("settings.appInfo.checkUpdates")}
            </ThemedText>
          </TouchableOpacity>
        </View>

        {}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="feedback" size={18} color={colors.primary} />
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              Feedback
            </ThemedText>
          </View>

          <ThemedText
            type="small"
            style={[styles.subLabel, { marginBottom: 15 }]}
          >
            Help us improve by sharing your thoughts and suggestions.
          </ThemedText>

          <TouchableOpacity
            style={styles.coffeeBtn}
            onPress={() => setFeedbackModalVisible(true)}
          >
            <ThemedText
              type="defaultSemiBold"
              style={styles.coffeeText}
            >
              Share Feedback
            </ThemedText>
          </TouchableOpacity>
        </View>

        {}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Ionicons name="heart" size={22} color={colors.secondary} />
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              {t("settings.support.title")}
            </ThemedText>
          </View>

          <ThemedText style={styles.supportDescription}>
            {t("settings.support.description")}
          </ThemedText>

          <TouchableOpacity style={styles.coffeeCard} onPress={handleCoffee}>
            <LinearGradient
              colors={["rgba(245, 158, 11, 0.12)", "rgba(249, 115, 22, 0.08)", "rgba(245, 158, 11, 0.12)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
            <LinearGradient
              colors={["#e8a94cff", "#F57C00"]}
              style={styles.coffeeIconContainer}
            >
              <SimpleLineIcons name="cup" size={24} color="#FFF" />
            </LinearGradient>

            <View style={styles.coffeeContent}>
              <ThemedText type="defaultSemiBold" style={styles.coffeeTitle}>
                {t("settings.support.coffeeDesigner")}
              </ThemedText>
              <ThemedText style={styles.coffeeSubtitle}>
                {t("settings.support.supportOurWork")} ✨
              </ThemedText>
            </View>

            <Animated.View
              style={[
                styles.gemIconContainer,
                { transform: [{ scale: pulseAnim }], backgroundColor: colors.card, borderColor: '#f472b6', borderWidth: 1 },
              ]}
            >
              <Ionicons name="heart" size={14} color="#f472b6" />
            </Animated.View>

            <Ionicons name="chevron-forward" size={18} color={colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.logoutBtn, { borderColor: colors.destructive }]}
            onPress={handleLogout}
          >
            <View style={styles.logoutContent}>
              <Ionicons
                name="log-out-outline"
                size={22}
                color={colors.destructive}
              />
              <ThemedText style={styles.logoutText}>
                {t("settings.support.logout")}
              </ThemedText>
            </View>
          </TouchableOpacity>
        </View>
        <NotificationSettingsModal
          visible={advancedModalVisible}
          onClose={() => setAdvancedModalVisible(false)}
          preferences={prefs}
          userId={session?.user?.id}
          onSave={(updated) => setPrefs(updated)}
        />
      </ScrollView>

      {}
      <Modal
        animationType="slide"
        presentationStyle="pageSheet"
        visible={feedbackModalVisible}
        onRequestClose={() => setFeedbackModalVisible(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
          <View
            style={{
              padding: 10,
              flexDirection: "row",
              justifyContent: "flex-end",
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
          >
            <TouchableOpacity
              onPress={() => setFeedbackModalVisible(false)}
              style={{ padding: 5 }}
            >
              <Ionicons name="close" size={30} color={colors.foreground} />
            </TouchableOpacity>
          </View>
          <WebView
            source={{ uri: "https://tally.so/r/MeeZOp" }}
            style={{ flex: 1 }}
            startInLoadingState={true}
          />
        </SafeAreaView>
      </Modal>

      {}

      {}
      <Modal
        animationType="slide"
        transparent={true}
        visible={comingSoonModalVisible}
        onRequestClose={() => setComingSoonModalVisible(false)}
      >
        <TouchableOpacity
          style={[
            modalStyles.centeredView,
            { backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
          ]}
          activeOpacity={1}
          onPress={() => setComingSoonModalVisible(false)}
        >
          <View
            style={[
              {
                backgroundColor: colors.card,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                padding: 20,
                alignItems: "center",
                width: "100%",
                minHeight: height * 0.3,
              },
            ]}
          >
            <View
              style={{
                width: 40,
                height: 5,
                backgroundColor: colors.border,
                borderRadius: 3,
                marginBottom: 20,
              }}
            />

            <Ionicons
              name="time-outline"
              size={50}
              color={colors.primary}
              style={{ marginBottom: 15 }}
            />

            <ThemedText
              type="subtitle"
              style={{ marginBottom: 10, textAlign: "center" }}
            >
              Coming Soon
            </ThemedText>

            <ThemedText
              style={{
                textAlign: "center",
                color: colors.mutedForeground,
                marginBottom: 30,
              }}
            >
              The "Export to iCal" feature is currently under development. Stay
              tuned for future updates!
            </ThemedText>

            <TouchableOpacity
              style={[
                styles.coffeeBtn,
                {
                  backgroundColor: colors.primary,
                  width: "100%",
                  justifyContent: "center",
                },
              ]}
              onPress={() => setComingSoonModalVisible(false)}
            >
              <ThemedText style={{ color: "#fff", fontWeight: "bold" }}>
                Got it
              </ThemedText>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {}
      <SuccessModal
        visible={syncSuccessVisible}
        count={syncCount}
        onClose={() => setSyncSuccessVisible(false)}
        colors={colors}
      />

      {}
      <LogoutConfirmationModal
        visible={logoutModalVisible}
        onConfirm={() => performLogout()}
        onCancel={() => setLogoutModalVisible(false)}
        colors={colors}
        t={t}
      />

      {}
      <DonationModal
        visible={donationModalVisible}
        onClose={() => setDonationModalVisible(false)}
        onConfirm={processCoffeePayment}
        colors={colors}
        amount={donationAmount}
        setAmount={setDonationAmount}
      />
    </SafeAreaView>
  );
};

export default SettingsScreen;

const modalStyles = StyleSheet.create({
  centeredView: {
    flex: 1,
  },
  modalView: {
    position: "absolute",
    width: 50 * dw,
    borderRadius: 2 * dw,
    paddingVertical: 0.8 * dh,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 8,
    borderWidth: 1,
  },
  list: {
    maxHeight: 40 * dh,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 1.5 * dh,
    paddingHorizontal: 4 * dw,
  },
  listItemText: {
    fontSize: 4.5 * dw,
    fontWeight: "500",
  },
  checkIcon: {
    marginRight: 2 * dw,
  },
  checkIconPlaceholder: {
    width: 5 * dw,
    marginRight: 2 * dw,
  },
});

const getStyles = (colors, dw, dh) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      
    },
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 4 * dw,
    },
    header: {
      fontSize: 5 * dw,
      fontWeight: "700",
      color: colors.foreground,
    },
    subHeader: {
      fontSize: 3.5 * dw,
      color: colors.mutedForeground,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 2 * dh,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 3 * dw,
      padding: 4 * dw,
      marginBottom: 2 * dh,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 2 * dh,
    },
    sectionTitle: {
      fontSize: 4 * dw,
      fontWeight: "600",
      marginLeft: 1.5 * dw,
      color: colors.foreground,
    },
    rowBetween: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginVertical: 1.5 * dh,
      borderBottomColor: colors.border,
      paddingBottom: 1.5 * dh,
    },
    label: {
      fontSize: 3.8 * dw,
      fontWeight: "500",
      color: colors.foreground,
    },
    subLabel: {
      fontSize: 3.3 * dw,
      color: colors.mutedForeground,
    },
    smallBtn: {
      borderWidth: 0.5,
      borderColor: colors.primary,
      borderRadius: 1.5 * dw,
      paddingVertical: 0.8 * dh,
      paddingHorizontal: 3 * dw,
    },
    smallBtnText: {
      color: colors.primary,
      fontSize: 3.5 * dw,
      fontWeight: "500",
    },
    timeBtn: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.muted,
      borderRadius: 1.5 * dw,
      paddingVertical: 0.8 * dh,
      paddingHorizontal: 3 * dw,
    },
    timeText: {
      marginLeft: 1 * dw,
      color: colors.foreground,
      fontSize: 3.5 * dw,
      fontWeight: "500",
    },
    dropdownTrigger: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.muted,
      borderRadius: 1.5 * dw,
      paddingVertical: 0.8 * dh,
      paddingHorizontal: 3 * dw,
    },
    dropdownText: {
      marginRight: 1 * dw,
      color: colors.foreground,
      fontSize: 3.5 * dw,
      fontWeight: "500",
    },
    updateBtn: {
      height: 55,
      marginTop: 2 * dh,
      borderColor: colors.primary + '40',
      backgroundColor: colors.primary + '05',
      borderWidth: 1.5,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
    },
    updateText: {
      color: colors.primary,
      fontWeight: "600",
      fontSize: 16,
    },
    coffeeCard: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 2,
      borderColor: "rgba(245, 158, 11, 0.4)",
      borderRadius: 16,
      padding: 14,
      marginVertical: 10,
      position: "relative",
      overflow: 'hidden',
    },
    coffeeBtn: {
      height: 55,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1.5,
      borderColor: colors.primary + '40',
      backgroundColor: colors.primary + '05',
      borderRadius: 12,
      paddingHorizontal: 20,
    },
    coffeeText: {
      color: colors.primary,
      fontWeight: "600",
      fontSize: 16,
      textAlign: "center",
    },
    coffeeIcon: {
      marginRight: 8,
    },
    coffeeIconContainer: {
      width: 50,
      height: 50,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
      elevation: 4,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    coffeeContent: {
      flex: 1,
    },
    coffeeTitle: {
      fontSize: 16,
      color: colors.primary,
    },
    coffeeSubtitle: {
      fontSize: 14,
      color: colors.accent,
      marginTop: 2,
    },
    gemIconContainer: {
      position: "absolute",
      top: 3,
      right: 3,
      backgroundColor: "#FFF",
      borderRadius: 10,
      padding: 2,
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
    },
    supportDescription: {
      fontSize: 14,
      color: colors.accent,
      lineHeight: 20,
      marginBottom: 15,
    },
    logoutBtn: {
      height: 55,
      borderWidth: 1,
      borderRadius: 12,
      marginTop: 15,
      marginBottom: 5,
      backgroundColor: colors.card,
      justifyContent: "center",
      alignItems: "center",
    },
    logoutContent: {
      flexDirection: "row",
      alignItems: "center",
    },
    logoutText: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.destructive,
      marginLeft: 10,
    },
    banner: {
      flexDirection: "row",
      padding: 12,
      borderRadius: 12,
      borderWidth: 1,
      marginBottom: 16,
    },
    bannerIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    enableBtn: {
      marginTop: 8,
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 8,
      alignSelf: "flex-start",
    },
    enableBtnText: {
      color: "#fff",
      fontSize: 14,
      fontWeight: "600",
    },
    notificationItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    notificationTimeRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 12,
    },
    timeValueBox: {
      flexDirection: "row",
      alignItems: "center",
    },
    advancedBtn: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      marginTop: 8,
      marginBottom: 16,
    },
    testLink: {
      alignSelf: "center",
      paddingVertical: 8,
    },
  });
