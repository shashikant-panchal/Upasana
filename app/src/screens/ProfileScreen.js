import { Feather, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useDispatch, useSelector } from "react-redux";
import AvatarSelector from "../components/AvatarSelector";
import { ThemedText } from "../components/ThemedText";
import { useTheme } from "../context/ThemeContext";
import { setSession } from "../redux/userSlice";
import { supabase } from "../utils/supabase";

const WINDOW_WIDTH = Dimensions.get("window").width;
const WINDOW_HEIGHT = Dimensions.get("window").height;
const relativeWidth = (percentage) => WINDOW_WIDTH * (percentage / 100);
const relativeHeight = (percentage) => WINDOW_HEIGHT * (percentage / 100);

import { fetchReadingData } from "../redux/readingSlice";

const ProfileScreen = ({ navigation }) => {
  const { colors, isDark, typography } = useTheme();
  const { session } = useSelector((state) => state.user);
  const {
    stats: readingStats,
    loading: readingLoading
  } = useSelector((state) => state.reading);
  const dispatch = useDispatch();

  const [localStats, setLocalStats] = useState({
    ekadashisObserved: 0,
  });
  const [loading, setLoading] = useState(true);

  const [isEditNameModalVisible, setIsEditNameModalVisible] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState("");
  const [isUpdatingName, setIsUpdatingName] = useState(false);

  const [isAvatarModalVisible, setIsAvatarModalVisible] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(user?.user_metadata?.avatar_url || null);

  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const location = useSelector((state) => state.location);

  const user = session?.user;
  const displayName = user?.user_metadata?.display_name || "Devotee";

  useEffect(() => {
    fetchEkadashiStats();
    fetchProfileData();
    if (user?.id) {
      dispatch(fetchReadingData(user.id));
    }
  }, [user]);

  const fetchProfileData = async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('avatar_url, display_name')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data?.avatar_url) {
        setAvatarUrl(data.avatar_url);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const fetchEkadashiStats = async () => {
    if (!user) return;
    setLoading(true);
    try {
      
      const { count: ekadashiCount, error: ekadashiError } = await supabase
        .from('ekadashi_observances')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('observed', true);

      if (ekadashiError) console.error("Error fetching ekadashi stats:", ekadashiError);

      setLocalStats({
        ekadashisObserved: ekadashiCount || 0,
      });

    } catch (err) {
      console.error("Error in fetchEkadashiStats:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateName = async () => {
    if (!newDisplayName.trim()) {
      Toast.show({
        type: "error",
        text1: "Invalid Name",
        text2: "Display name cannot be empty.",
      });
      return;
    }

    setIsUpdatingName(true);
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: { display_name: newDisplayName.trim() }
      });

      if (error) throw error;

      const updatedUser = {
        ...user,
        user_metadata: {
          ...user.user_metadata,
          display_name: newDisplayName.trim()
        }
      };
      const updatedSession = { ...session, user: updatedUser };
      dispatch(setSession(updatedSession));

      Toast.show({
        type: "success",
        text1: "Name Updated",
        text2: "Your display name has been updated successfully.",
      });
      setIsEditNameModalVisible(false);

    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Update Failed",
        text2: error.message || "Could not update display name.",
      });
    } finally {
      setIsUpdatingName(false);
    }
  };

  const handleAvatarClick = () => {
    setIsAvatarModalVisible(true);
  };

  const handleAvatarSelect = (url) => {
    setAvatarUrl(url);
    
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") {
      Toast.show({
        type: "error",
        text1: "Invalid Confirmation",
        text2: "Please type DELETE to confirm.",
      });
      return;
    }

    setIsDeleting(true);
    try {
      const { data, error } = await supabase.functions.invoke('delete-my-account');
      if (error) throw error;

      if (data?.success) {
        Toast.show({
          type: "success",
          text1: "Account Deleted",
          text2: "Your account has been permanently removed.",
        });
        await supabase.auth.signOut();
        dispatch(setSession(null));
        
      } else {
        throw new Error(data?.error || "Deletion failed");
      }
    } catch (error) {
      console.error("Delete error:", error);
      Toast.show({
        type: "error",
        text1: "Deletion Failed",
        text2: error.message,
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteModalVisible(false);
      setDeleteConfirmText("");
    }
  };

  const openEditNameModal = () => {
    setNewDisplayName(displayName);
    setIsEditNameModalVisible(true);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
      >
        <View style={styles.headerContainer}>
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
            Profile
          </ThemedText>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.profileHeader}>
          <TouchableOpacity
            style={[
              styles.avatarContainer,
              { backgroundColor: colors.lightBlueBg },
            ]}
            onPress={handleAvatarClick}
            activeOpacity={0.7}
          >
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
            ) : (
              <Ionicons
                name="person-outline"
                size={relativeWidth(12)}
                color={colors.foreground}
              />
            )}
            <View style={[styles.cameraBadge, { backgroundColor: colors.primary }]}>
              <Ionicons name="camera" size={12} color="#fff" />
            </View>
          </TouchableOpacity>

          <View style={styles.nameContainer}>
            <ThemedText
              type="subtitle"
              style={[styles.username, { color: colors.foreground }]}
            >
              {displayName}
            </ThemedText>
            <TouchableOpacity onPress={openEditNameModal} style={styles.editIconBtn}>
              <Feather name="edit-2" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          <ThemedText
            type="small"
            style={[styles.profileSubtitle, { color: colors.mutedForeground }]}
          >
            Spiritual Journey Profile
          </ThemedText>
        </View>

        <View style={styles.statsContainer}>
          <LinearGradient
            colors={isDark ? ['#451a03', '#431407'] : ['#FFFBEB', '#FFF7ED']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.statCard,
              { borderColor: isDark ? '#92400e' : '#FDE68A' },
            ]}
          >
            <Feather
              name="calendar"
              size={relativeWidth(8)}
              color={isDark ? '#FBBF24' : '#D97706'}
            />
            <ThemedText
              type="title"
              style={[styles.statCount, { color: isDark ? '#FEF3C7' : '#B45309' }]}
            >
              {localStats.ekadashisObserved}
            </ThemedText>
            <ThemedText
              type="small"
              style={[styles.statLabel, { color: isDark ? '#FBBF24' : '#D97706' }]}
            >
              Ekadashis Observed
            </ThemedText>
          </LinearGradient>

          <LinearGradient
            colors={isDark ? ['#064e3b', '#065f46'] : ['#F0FDF4', '#ECFDF5']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.statCard,
              { borderColor: isDark ? '#166534' : '#BBF7D0' },
            ]}
          >
            <Feather
              name="book-open"
              size={relativeWidth(8)}
              color={isDark ? '#34D399' : '#16A34A'}
            />
            <ThemedText
              type="title"
              style={[styles.statCount, { color: isDark ? '#D1FAE5' : '#15803D' }]}
            >
              {readingStats?.totalVersesRead || 0}
            </ThemedText>
            <ThemedText
              type="small"
              style={[styles.statLabel, { color: isDark ? '#34D399' : '#16A34A' }]}
            >
              Verses Read
            </ThemedText>
          </LinearGradient>
        </View>

        {}
        <View style={styles.dangerZone}>
          <View style={[
            styles.deleteCard,
            {
              backgroundColor: isDark ? 'transparent' : '#fefefeff',
            }
          ]}>
            <View style={styles.deleteHeader}>
              <View style={[styles.deleteIconBg, { backgroundColor: isDark ? '#7f1d1d' : '#FEE2E2' }]}>
                <Ionicons name="warning-outline" size={24} color="#EF4444" />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText style={{ color: '#EF4444', fontSize: 16, fontWeight: '700' }}>Delete Account</ThemedText>
                <ThemedText style={{ color: isDark ? '#60a5fa' : '#3B82F6', fontSize: 14, marginTop: 4 }}>
                  Permanently delete your account and all associated data. This action cannot be undone.
                </ThemedText>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.deleteMainBtn, { backgroundColor: isDark ? 'transparent' : '#fff' }]}
              onPress={() => setIsDeleteModalVisible(true)}
            >
              <Ionicons name="trash-outline" size={16} color="#EF4444" style={{ marginRight: 10 }} />
              <ThemedText style={styles.deleteMainBtnText}>Delete My Account</ThemedText>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>

      {}
      <Modal
        visible={isEditNameModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsEditNameModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <ThemedText type="subtitle" style={[styles.modalTitle, { color: colors.foreground }]}>
                Edit Display Name
              </ThemedText>

              <TextInput
                style={[
                  styles.input,
                  {
                    color: colors.foreground,
                    backgroundColor: colors.muted,
                    borderColor: colors.border,
                    fontFamily: typography?.family?.sans
                  }
                ]}
                value={newDisplayName}
                onChangeText={setNewDisplayName}
                placeholder="Enter your name"
                placeholderTextColor={colors.mutedForeground}
                autoFocus
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton, { borderColor: colors.border }]}
                  onPress={() => setIsEditNameModalVisible(false)}
                  disabled={isUpdatingName}
                >
                  <ThemedText style={{ color: colors.foreground }}>Cancel</ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton, { backgroundColor: colors.primary }]}
                  onPress={handleUpdateName}
                  disabled={isUpdatingName}
                >
                  {isUpdatingName ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <ThemedText style={{ color: "#fff", fontWeight: "600" }}>Save</ThemedText>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {}
      <Modal
        visible={isDeleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsDeleteModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsDeleteModalVisible(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.modalCenterContainer}
          >
            <TouchableOpacity
              activeOpacity={1}
              style={[styles.deleteModalContent, { backgroundColor: isDark ? colors.card : '#fff' }]}
            >
              <View style={styles.deleteModalTitleRow}>
                <Ionicons name="warning-outline" size={24} color="#EF4444" />
                <ThemedText style={styles.deleteModalTitle}>Delete Account Permanently?</ThemedText>
              </View>

              <ThemedText style={[styles.deleteModalMessage, { color: isDark ? '#60a5fa' : '#3B82F6' }]}>
                This will permanently delete:
              </ThemedText>

              <View style={styles.bulletList}>
                <ThemedText style={[styles.bulletItem, { color: isDark ? '#93c5fd' : '#3B82F6' }]}>• Your profile and personal data</ThemedText>
                <ThemedText style={[styles.bulletItem, { color: isDark ? '#93c5fd' : '#3B82F6' }]}>• All Ekadashi observance records</ThemedText>
                <ThemedText style={[styles.bulletItem, { color: isDark ? '#93c5fd' : '#3B82F6' }]}>• All Japa session history</ThemedText>
                <ThemedText style={[styles.bulletItem, { color: isDark ? '#93c5fd' : '#3B82F6' }]}>• All reading progress</ThemedText>
                <ThemedText style={[styles.bulletItem, { color: isDark ? '#93c5fd' : '#3B82F6' }]}>• Notification preferences and settings</ThemedText>
              </View>

              <ThemedText style={styles.deleteModalWarning}>This action cannot be undone.</ThemedText>

              <View style={styles.deleteConfirmSection}>
                <ThemedText style={[styles.deleteConfirmLabel, { color: isDark ? '#60a5fa' : '#3B82F6' }]}>
                  Type <ThemedText style={{ fontWeight: 'bold', color: colors.foreground }}>DELETE</ThemedText> to confirm:
                </ThemedText>
                <TextInput
                  style={[
                    styles.deleteInput,
                    {
                      borderColor: isDark ? colors.border : '#E2E8F0',
                      color: colors.foreground,
                      backgroundColor: isDark ? colors.muted : 'transparent'
                    }
                  ]}
                  value={deleteConfirmText}
                  onChangeText={setDeleteConfirmText}
                  placeholder="Type DELETE"
                  placeholderTextColor={isDark ? colors.mutedForeground : "#94a3b8"}
                  autoFocus
                />
              </View>

              <View style={styles.deleteModalActions}>
                <TouchableOpacity
                  style={[styles.deleteModalBtn, styles.deleteCancelBtn, { borderColor: colors.foreground }]}
                  onPress={() => {
                    setIsDeleteModalVisible(false);
                    setDeleteConfirmText("");
                  }}
                >
                  <ThemedText style={{ color: colors.foreground, fontWeight: '500' }}>Cancel</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.deleteModalBtn, styles.deleteConfirmBtn, deleteConfirmText !== 'DELETE' && { opacity: 0.5 }]}
                  onPress={handleDeleteAccount}
                  disabled={deleteConfirmText !== 'DELETE' || isDeleting}
                >
                  {isDeleting ? <ActivityIndicator color="#fff" /> : <ThemedText style={{ color: '#fff', fontWeight: '500' }}>Delete Forever</ThemedText>}
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </TouchableOpacity>
      </Modal>

      <AvatarSelector
        visible={isAvatarModalVisible}
        onClose={() => setIsAvatarModalVisible(false)}
        onSelect={handleAvatarSelect}
        currentAvatarUrl={avatarUrl}
        userId={user?.id}
      />

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    
  },
  scrollViewContent: {
    paddingHorizontal: relativeWidth(4),
    paddingBottom: '20%',
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  profileHeader: {
    alignItems: "center",
    paddingBottom: relativeHeight(3),
  },
  avatarContainer: {
    width: relativeWidth(25),
    height: relativeWidth(25),
    borderRadius: relativeWidth(12.5),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: relativeHeight(1.5),
    position: 'relative',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: relativeWidth(12.5),
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  editIconBtn: {
    padding: 4,
  },
  username: {
    fontSize: relativeWidth(6),
  },
  profileSubtitle: {
    fontSize: relativeWidth(3.8),
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  statCard: {
    width: "47%",
    borderRadius: relativeWidth(3),
    padding: relativeWidth(4),
    alignItems: "center",
    borderWidth: 1,
  },
  statCount: {
    fontSize: relativeWidth(7),
    marginTop: relativeHeight(1),
  },
  statLabel: {
    textAlign: 'center',
    fontSize: relativeWidth(3.5),
    marginTop: relativeHeight(0.5),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 56,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 24,
    borderWidth: 1,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  saveButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  dangerZone: {
    marginTop: 20,
    marginBottom: 40,
  },
  deleteCard: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EF4444'
  },
  deleteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  deleteIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertIconBg: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteMainBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 16,
    marginTop: 20,
    borderColor: '#EF4444',
    borderWidth: 1,
  },
  deleteMainBtnText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '700',
  },
  modalCenterContainer: {
    width: '90%',
    maxWidth: 400,
  },
  deleteModalContent: {
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  deleteModalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  deleteModalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#EF4444',
  },
  deleteModalMessage: {
    fontSize: 16,
    color: '#3B82F6',
    marginBottom: 12,
  },
  bulletList: {
    marginBottom: 20,
  },
  bulletItem: {
    fontSize: 15,
    color: '#3B82F6',
    marginBottom: 8,
    paddingLeft: 4,
  },
  deleteModalWarning: {
    fontSize: 15,
    color: '#EF4444',
    marginBottom: 24,
    fontWeight: '600',
  },
  deleteConfirmSection: {
    marginBottom: 24,
  },
  deleteConfirmLabel: {
    fontSize: 15,
    color: '#3B82F6',
    marginBottom: 12,
  },
  deleteInput: {
    height: 56,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 20,
    fontSize: 16,
    color: '#1e1b4b',
  },
  deleteModalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  deleteModalBtn: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteCancelBtn: {
    borderWidth: 2,
    borderColor: '#1e1b4b',
  },
  deleteConfirmBtn: {
    backgroundColor: '#EF4444',
  },
});

export default ProfileScreen;
