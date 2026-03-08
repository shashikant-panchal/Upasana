import { Feather } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useDispatch, useSelector } from "react-redux";
import { ThemedText } from "../components/ThemedText";
import { useTheme } from "../context/ThemeContext";
import {
  clearError,
  resetPassword,
  resetRegistrationSuccess,
  signIn,
  signInWithGoogle,
  signUp,
} from "../redux/userSlice";
import NotificationService from "../services/NotificationService";

const { width } = Dimensions.get("window");

export default function Login() {
  const [activeTab, setActiveTab] = useState("signIn");
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: activeTab === "signIn" ? 0 : 1,
      useNativeDriver: true,
      friction: 8,
      tension: 50,
    }).start();
  }, [activeTab]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isSignInPasswordVisible, setIsSignInPasswordVisible] = useState(false);
  const [isSignUpPasswordVisible, setIsSignUpPasswordVisible] = useState(false);
  const [deviceToken, setDeviceToken] = useState(null);

  const [forgotPasswordModalVisible, setForgotPasswordModalVisible] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotEmailError, setForgotEmailError] = useState("");
  const [forgotEmailSent, setForgotEmailSent] = useState(false);
  const [forgotEmailLoading, setForgotEmailLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const dispatch = useDispatch();
  const { loading, error, registrationSuccess } = useSelector(
    (state) => state.user
  );
  const { colors, typography } = useTheme();

  useEffect(() => {
    const fetchToken = async () => {
      const token = await NotificationService.getDeviceToken();
      setDeviceToken(token);
    };
    fetchToken();
  }, []);

  useEffect(() => {
    if (error) {
      if (typeof error === 'string') {
        ToastAndroid.show(error, ToastAndroid.LONG);
      } else {
        ToastAndroid.show("An error occurred", ToastAndroid.LONG);
      }
      dispatch(clearError());
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (registrationSuccess) {
      ToastAndroid.show(
        "Registration succesfull and email has been sent to you for verificication",
        ToastAndroid.LONG
      );
      dispatch(resetRegistrationSuccess());
    }
  }, [registrationSuccess, dispatch]);

  const handleSignIn = () => {
    if (!email || !password) {
      ToastAndroid.show("Please enter both email and password.", ToastAndroid.SHORT);
      return;
    }
    dispatch(signIn({ email, password, deviceToken }));
  };

  const handleSignUp = () => {
    if (!email || !password) {
      ToastAndroid.show("Please enter email and password.", ToastAndroid.SHORT);
      return;
    }
    dispatch(signUp({ email, password, displayName, deviceToken }));
  };

  const handleGoogleSignIn = () => {
    dispatch(signInWithGoogle({ deviceToken }));
  };

  const handleForgotPassword = async () => {
    setForgotEmailError("");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!forgotEmail.trim() || !emailRegex.test(forgotEmail.trim())) {
      setForgotEmailError("Please enter a valid email address");
      return;
    }
    setForgotEmailLoading(true);
    try {
      const resultAction = await dispatch(resetPassword(forgotEmail.trim()));
      if (resetPassword.fulfilled.match(resultAction)) {
        setForgotEmailSent(true);
        startCountdown();
        Toast.show({
          type: "success",
          text1: "Email sent!",
          text2: "Check your inbox for the password reset link.",
        });
      } else {
        setForgotEmailError(resultAction.payload || "An unexpected error occurred.");
      }
    } catch (err) {
      setForgotEmailError("An unexpected error occurred. Please try again.");
    } finally {
      setForgotEmailLoading(false);
    }
  };

  const startCountdown = () => {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResendEmail = async () => {
    if (countdown > 0) return;
    setForgotEmailLoading(true);
    try {
      const resultAction = await dispatch(resetPassword(forgotEmail.trim()));
      if (resetPassword.fulfilled.match(resultAction)) {
        startCountdown();
        Toast.show({
          type: "success",
          text1: "Email resent!",
          text2: "Please check your inbox again.",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Failed to resend",
          text2: resultAction.payload || "Could not resend email.",
        });
      }
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to resend email.",
      });
    } finally {
      setForgotEmailLoading(false);
    }
  };

  const handleCloseForgotPassword = () => {
    setForgotPasswordModalVisible(false);
    setForgotEmail("");
    setForgotEmailError("");
    setForgotEmailSent(false);
    setCountdown(0);
  };

  const styles = getStyles(colors, typography);

  const renderSignIn = () => (
    <>
      <ThemedText type="subtitle" style={styles.formTitle}>
        Welcome Back
      </ThemedText>
      <ThemedText style={styles.formSubtitle}>
        Sign in to continue your spiritual journey
      </ThemedText>
      <View style={styles.inputContainer}>
        <ThemedText type="defaultSemiBold" style={styles.inputLabel}>
          Email
        </ThemedText>
        <View style={styles.inputWrapper}>
          <Feather
            name="mail"
            size={18}
            color={colors.mutedForeground}
            style={styles.icon}
          />
          <TextInput
            style={styles.textInput}
            placeholder="Enter your email"
            placeholderTextColor={colors.mutedForeground}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            allowFontScaling={false}
          />
        </View>
      </View>
      <View style={styles.inputContainer}>
        <ThemedText type="defaultSemiBold" style={styles.inputLabel}>
          Password
        </ThemedText>
        <View style={styles.inputWrapper}>
          <Feather
            name="lock"
            size={18}
            color={colors.mutedForeground}
            style={styles.icon}
          />
          <TextInput
            style={styles.textInput}
            placeholder="Enter your password"
            placeholderTextColor={colors.mutedForeground}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!isSignInPasswordVisible}
            allowFontScaling={false}
          />
          <TouchableOpacity
            onPress={() => setIsSignInPasswordVisible(!isSignInPasswordVisible)}
          >
            <Feather
              name={isSignInPasswordVisible ? "eye" : "eye-off"}
              size={18}
              color={colors.mutedForeground}
            />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.passwordOptions}>
        {}
        <TouchableOpacity onPress={() => {
          setForgotEmail(email);
          setForgotPasswordModalVisible(true);
        }}>
          <ThemedText type="small" style={styles.forgotPassword}>
            Forgot password?
          </ThemedText>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={styles.signInButton}
        onPress={handleSignIn}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <ThemedText type="defaultSemiBold" style={styles.signInButtonText}>
              Sign In
            </ThemedText>
            <Feather
              name="arrow-right"
              size={20}
              color="#fff"
              style={{ marginLeft: 10 }}
            />
          </>
        )}
      </TouchableOpacity>
      <View style={styles.dividerContainer}>
        <View style={styles.dividerLine} />
        <ThemedText type="caption" style={styles.orText}>OR CONTINUE WITH</ThemedText>
        <View style={styles.dividerLine} />
      </View>
      <TouchableOpacity onPress={handleGoogleSignIn} style={styles.googleButton}>
        <Image
          resizeMode="contain"
          source={{
            uri: "https://cdn-icons-png.flaticon.com/512/281/281764.png",
          }}
          style={styles.googleIcon}
        />
        <ThemedText type="defaultSemiBold" style={styles.googleButtonText}>Continue with Google</ThemedText>
      </TouchableOpacity>
    </>
  );

  const renderForgotPasswordModal = () => (
    <Modal
      visible={forgotPasswordModalVisible}
      transparent
      animationType="fade"
      onRequestClose={handleCloseForgotPassword}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <View style={styles.modalHeader}>
            <ThemedText type="subtitle" style={[styles.modalTitle, { color: colors.foreground }]}>
              {forgotEmailSent ? "Check Your Email" : "Reset Password"}
            </ThemedText>
            <TouchableOpacity onPress={handleCloseForgotPassword} style={styles.closeButton}>
              <Feather name="x" size={24} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          <ThemedText style={[styles.modalDescription, { color: colors.mutedForeground }]}>
            {forgotEmailSent
              ? "We've sent a password reset link to your email address."
              : "Enter your email address and we'll send you a link to reset your password."}
          </ThemedText>

          {forgotEmailSent ? (
            <View style={styles.successContainer}>
              <View style={styles.successIconContainer}>
                <Feather name="check-circle" size={48} color={colors.success || "#10B981"} />
              </View>

              <View style={styles.sentToContainer}>
                <ThemedText style={{ color: colors.mutedForeground }}>We sent a reset link to:</ThemedText>
                <ThemedText type="defaultSemiBold" style={{ color: colors.foreground }}>{forgotEmail}</ThemedText>
              </View>

              <View style={styles.resendContainer}>
                <ThemedText style={{ color: colors.mutedForeground }}>Didn't receive the email? </ThemedText>
                <TouchableOpacity onPress={handleResendEmail} disabled={countdown > 0 || forgotEmailLoading}>
                  <ThemedText style={[styles.resendLink, { color: colors.primary, opacity: countdown > 0 ? 0.5 : 1 }]}>
                    {forgotEmailLoading ? "Sending..." : countdown > 0 ? `Resend in ${countdown}s` : "Click to resend"}
                  </ThemedText>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.outlineButton, { borderColor: colors.border }]}
                onPress={handleCloseForgotPassword}
              >
                <Feather name="arrow-left" size={20} color={colors.foreground} style={{ marginRight: 8 }} />
                <ThemedText type="defaultSemiBold" style={{ color: colors.foreground }}>Back to Login</ThemedText>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <ThemedText type="defaultSemiBold" style={styles.inputLabel}>
                  Email Address
                </ThemedText>
                <View style={styles.inputWrapper}>
                  <Feather
                    name="mail"
                    size={18}
                    color={colors.mutedForeground}
                    style={styles.icon}
                  />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter your email"
                    placeholderTextColor={colors.mutedForeground}
                    value={forgotEmail}
                    onChangeText={setForgotEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    allowFontScaling={false}
                    autoFocus
                  />
                </View>
                {forgotEmailError ? (
                  <View style={styles.errorContainer}>
                    <Feather name="alert-circle" size={14} color={colors.destructive || "#EF4444"} />
                    <ThemedText style={[styles.errorText, { color: colors.destructive || "#EF4444" }]}>{forgotEmailError}</ThemedText>
                  </View>
                ) : null}
              </View>

              <TouchableOpacity
                style={[styles.signInButton, { marginTop: 10 }]}
                onPress={handleForgotPassword}
                disabled={forgotEmailLoading || !forgotEmail}
              >
                {forgotEmailLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Feather name="mail" size={20} color="#fff" style={{ marginRight: 10 }} />
                    <ThemedText type="defaultSemiBold" style={styles.signInButtonText}>
                      Send Reset Link
                    </ThemedText>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCloseForgotPassword}
              >
                <ThemedText style={{ color: colors.mutedForeground }}>Cancel</ThemedText>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );

  const renderSignUp = () => (
    <>
      <ThemedText type="subtitle" style={styles.formTitle}>
        Create Account
      </ThemedText>
      <ThemedText style={styles.formSubtitle}>
        Start your spiritual journey with us
      </ThemedText>
      <View style={styles.inputContainer}>
        <ThemedText type="defaultSemiBold" style={styles.inputLabel}>
          Display Name
        </ThemedText>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            placeholder="Enter your display name"
            placeholderTextColor={colors.mutedForeground}
            value={displayName}
            onChangeText={setDisplayName}
            allowFontScaling={false}
          />
        </View>
      </View>
      <View style={styles.inputContainer}>
        <ThemedText type="defaultSemiBold" style={styles.inputLabel}>
          Email
        </ThemedText>
        <View style={styles.inputWrapper}>
          <Feather
            name="mail"
            size={18}
            color={colors.mutedForeground}
            style={styles.icon}
          />
          <TextInput
            style={styles.textInput}
            placeholder="Enter your email"
            placeholderTextColor={colors.mutedForeground}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            allowFontScaling={false}
          />
        </View>
      </View>
      <View style={styles.inputContainer}>
        <ThemedText type="defaultSemiBold" style={styles.inputLabel}>
          Password
        </ThemedText>
        <View style={styles.inputWrapper}>
          <Feather
            name="lock"
            size={18}
            color={colors.mutedForeground}
            style={styles.icon}
          />
          <TextInput
            style={styles.textInput}
            placeholder="Enter your password"
            placeholderTextColor={colors.mutedForeground}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!isSignUpPasswordVisible}
            allowFontScaling={false}
          />
          <TouchableOpacity
            onPress={() => setIsSignUpPasswordVisible(!isSignUpPasswordVisible)}
          >
            <Feather
              name={isSignUpPasswordVisible ? "eye" : "eye-off"}
              size={18}
              color={colors.mutedForeground}
            />
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity
        style={styles.signInButton}
        onPress={handleSignUp}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Feather
              name="user-plus"
              size={20}
              color="#fff"
              style={{ marginRight: 10 }}
            />
            <ThemedText type="defaultSemiBold" style={styles.signInButtonText}>
              Create Account
            </ThemedText>
          </>
        )}
      </TouchableOpacity>
      <View style={styles.dividerContainer}>
        <View style={styles.dividerLine} />
        <ThemedText type="caption" style={styles.orText}>
          OR CONTINUE WITH
        </ThemedText>
        <View style={styles.dividerLine} />
      </View>
      <TouchableOpacity
        onPress={handleGoogleSignIn}
        style={styles.googleButton}
      >
        <Image
          resizeMode="contain"
          source={{
            uri: "https://cdn-icons-png.flaticon.com/512/281/281764.png",
          }}
          style={styles.googleIcon}
        />
        <ThemedText type="defaultSemiBold" style={styles.googleButtonText}>
          Continue with Google
        </ThemedText>
      </TouchableOpacity>
    </>
  );

  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: colors.background }]}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
            <View
              style={[
                styles.logoContainer,
                { backgroundColor: colors.lightBlueBg },
              ]}
            >
              <Image
                source={require("../assets/images/logo.png")}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <ThemedText type="title" style={styles.title}>
              Upāsanā
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              Your spiritual companion for Ekadashi observance and daily practice.
            </ThemedText>
            <View style={styles.card}>
              <View style={styles.tabContainer}>
                <Animated.View
                  style={[
                    styles.animatedTabBackground,
                    {
                      transform: [
                        {
                          translateX: slideAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [4, 95], // Adjusted for 190 width container and 91 width pill
                          }),
                        },
                      ],
                    },
                  ]}
                />
                <TouchableOpacity
                  onPress={() => setActiveTab("signIn")}
                  style={styles.tab}
                  activeOpacity={0.7}
                >
                  <ThemedText
                    style={[
                      styles.tabText,
                      activeTab === "signIn" && styles.activeTabText,
                    ]}
                  >
                    Sign In
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setActiveTab("signUp")}
                  style={styles.tab}
                  activeOpacity={0.7}
                >
                  <ThemedText
                    style={[
                      styles.tabText,
                      activeTab === "signUp" && styles.activeTabText,
                    ]}
                  >
                    Sign Up
                  </ThemedText>
                </TouchableOpacity>
              </View>
              {activeTab === "signIn" ? renderSignIn() : renderSignUp()}
              {renderForgotPasswordModal()}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider >
  );
}

const getStyles = (colors, typography) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
    },
    container: {
      flexGrow: 1,
      padding: 20,
      alignItems: "center",
      backgroundColor: colors.background,
    },
    logoContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 20,
    },
    logo: {
      width: 40,
      height: 40,
    },
    title: {
      fontSize: 28,
      color: colors.foreground,
      marginBottom: 10,
    },
    subtitle: {
      fontSize: 16,
      color: colors.mutedForeground,
      textAlign: "center",
      marginBottom: 30,
      paddingHorizontal: 20,
      lineHeight: 22,
    },
    card: {
      width: width * 0.9,
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    tabContainer: {
      flexDirection: "row",
      backgroundColor: colors.muted,
      borderRadius: 100,
      padding: 4,
      marginBottom: 30,
      position: "relative",
      height: 44,
      width: 190,
      alignItems: "center",
      alignSelf: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    animatedTabBackground: {
      position: "absolute",
      width: 91,
      height: 36,
      backgroundColor: colors.card,
      borderRadius: 100,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 4,
    },
    tab: {
      flex: 1,
      height: "100%",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1,
    },
    tabText: {
      fontSize: 15,
      fontWeight: "500",
      color: colors.mutedForeground,
    },
    activeTabText: {
      color: colors.foreground,
      fontWeight: "600",
    },
    formTitle: {
      fontSize: 22,
      color: colors.foreground,
      textAlign: "center",
      marginBottom: 5,
    },
    formSubtitle: {
      fontSize: 14,
      color: colors.mutedForeground,
      textAlign: "center",
      marginBottom: 25,
    },
    inputContainer: {
      marginBottom: 15,
    },
    inputLabel: {
      fontSize: 14,
      color: colors.foreground,
      marginBottom: 8,
    },
    inputWrapper: {
      flexDirection: "row",
      alignItems: "center",
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 15,
      backgroundColor: colors.muted,
    },
    icon: {
      marginRight: 10,
    },
    textInput: {
      flex: 1,
      height: 50,
      fontSize: 16,
      color: colors.foreground,
      fontFamily: typography?.family?.sans,
    },
    passwordOptions: {
      flexDirection: "row",
      justifyContent: "flex-end",
      alignItems: "center",
      marginBottom: 20,
    },
    checkboxContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    checkbox: {
      borderWidth: 1,
      borderRadius: 4,
      width: 18,
      height: 18,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 8,
    },
    checkboxLabel: {
      fontSize: 14,
      color: colors.mutedForeground,
    },
    forgotPassword: {
      fontSize: 14,
      color: colors.primary,
    },
    signInButton: {
      backgroundColor: colors.primary,
      borderRadius: 8,
      paddingVertical: 14,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 20,
    },
    signInButtonText: {
      fontSize: 16,
      color: "#fff",
    },
    dividerContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 20,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.border,
    },
    orText: {
      textAlign: "center",
      color: colors.mutedForeground,
      marginHorizontal: 10,
      fontSize: 12,
    },
    googleButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.card,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 8,
      paddingVertical: 12,
      marginBottom: 25,
    },
    googleIcon: {
      width: 20,
      height: 20,
      marginRight: 10,
    },
    googleButtonText: {
      fontSize: 16,
      color: colors.foreground,
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
      maxWidth: 400,
      borderRadius: 16,
      padding: 24,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 10,
      position: 'relative',
    },
    modalTitle: {
      fontSize: 20,
      textAlign: 'center',
    },
    closeButton: {
      position: 'absolute',
      right: 0,
      top: 0,
    },
    modalDescription: {
      textAlign: 'center',
      marginBottom: 24,
      fontSize: 14,
      lineHeight: 20,
    },
    formContainer: {
      width: '100%',
    },
    cancelButton: {
      alignItems: 'center',
      padding: 10,
      marginTop: 5,
    },
    errorContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8,
      gap: 6,
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      padding: 8,
      borderRadius: 6,
    },
    errorText: {
      fontSize: 12,
    },
    successContainer: {
      alignItems: 'center',
      width: '100%',
    },
    successIconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
    },
    sentToContainer: {
      alignItems: 'center',
      marginBottom: 20,
      gap: 4,
    },
    resendContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 24,
      flexWrap: 'wrap',
      justifyContent: 'center',
    },
    resendLink: {
      fontSize: 14,
      fontWeight: '500',
    },
    outlineButton: {
      width: '100%',
      paddingVertical: 12,
      borderRadius: 8,
      borderWidth: 1,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
  });