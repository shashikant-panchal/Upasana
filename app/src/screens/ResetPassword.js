import { Feather } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useDispatch } from "react-redux";
import { ThemedText } from "../components/ThemedText";
import { useTheme } from "../context/ThemeContext";
import { setRecoveryMode, signOut } from "../redux/userSlice";
import { supabase } from "../utils/supabase";

export default function ResetPassword() {
    const { colors, typography } = useTheme();
    const dispatch = useDispatch();

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
    const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [countdown, setCountdown] = useState(3);

    useEffect(() => {
        let timer;
        if (showSuccess) {
            timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [showSuccess]);

    useEffect(() => {
        if (countdown === 0 && showSuccess) {
            dispatch(setRecoveryMode(false));
        }
    }, [countdown, showSuccess, dispatch]);

    const styles = getStyles(colors, typography);

    const criteria = {
        length: newPassword.length >= 6,
        uppercase: /[A-Z]/.test(newPassword),
        number: /[0-9]/.test(newPassword),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
    };

    const strengthScore = Object.values(criteria).filter(Boolean).length;
    const strengthLabel =
        strengthScore <= 1 ? "Very Weak" :
            strengthScore === 2 ? "Weak" :
                strengthScore === 3 ? "Good" : "Very Strong";

    const strengthColor =
        strengthScore <= 1 ? "#EF4444" :
            strengthScore === 2 ? "#EAB308" :
                strengthScore === 3 ? "#3B82F6" : "#10B981";

    const handleResetPassword = async () => {
        if (newPassword !== confirmPassword) {
            Toast.show({
                type: "error",
                text1: "Passwords do not match",
                text2: "Please ensure both passwords are the same.",
            });
            return;
        }

        if (strengthScore < 4) {
            Toast.show({
                type: "error",
                text1: "Weak Password",
                text2: "Please ensure your password meets all criteria.",
            });
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (error) {
                throw error;
            }

            setShowSuccess(true);
        } catch (error) {
            Toast.show({
                type: "error",
                text1: "Reset Failed",
                text2: error.message,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleBackToLogin = () => {
        dispatch(setRecoveryMode(false));
        dispatch(signOut());
    };

    if (showSuccess) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.card}>
                    <View style={styles.successIconContainer}>
                        <Feather name="check-circle" size={48} color={colors.primary} />
                    </View>
                    <ThemedText type="subtitle" style={styles.title}>
                        Password Reset Successfully
                    </ThemedText>
                    <ThemedText style={styles.subtitle}>
                        Your password has been successfully updated.
                    </ThemedText>
                    <ThemedText type="defaultSemiBold" style={{ color: colors.primary, marginTop: 16 }}>
                        Logging you in in {countdown}...
                    </ThemedText>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.card}>
                <View style={styles.iconContainer}>
                    <Feather name="shield" size={32} color={colors.primary} />
                </View>
                <ThemedText type="subtitle" style={styles.title}>
                    Reset Password
                </ThemedText>
                <ThemedText style={styles.subtitle}>
                    Create a new secure password for your account
                </ThemedText>

                <View style={styles.formSection}>
                    <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Create New Password</ThemedText>
                    <ThemedText style={styles.sectionSubtitle}>Choose a strong password to protect your account</ThemedText>

                    {/* New Password */}
                    <View style={styles.inputContainer}>
                        <ThemedText style={styles.label}>New Password</ThemedText>
                        <View style={styles.inputWrapper}>
                            <Feather name="lock" size={18} color={colors.mutedForeground} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Enter new password"
                                placeholderTextColor={colors.mutedForeground}
                                secureTextEntry={!isNewPasswordVisible}
                                value={newPassword}
                                onChangeText={setNewPassword}
                            />
                            <TouchableOpacity onPress={() => setIsNewPasswordVisible(!isNewPasswordVisible)}>
                                <Feather name={isNewPasswordVisible ? "eye" : "eye-off"} size={18} color={colors.mutedForeground} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Strength Bar */}
                    <View style={styles.strengthContainer}>
                        <ThemedText style={styles.strengthLabel}>Password strength</ThemedText>
                        <ThemedText style={[styles.strengthValue, { color: strengthColor }]}>{strengthLabel}</ThemedText>
                    </View>
                    <View style={styles.strengthBarContainer}>
                        <View style={[styles.strengthBar, { width: `${(strengthScore / 4) * 100}%`, backgroundColor: strengthColor }]} />
                    </View>

                    {/* Criteria List */}
                    <View style={styles.criteriaContainer}>
                        {Object.entries({
                            length: "At least 6 characters",
                            uppercase: "One uppercase letter",
                            number: "One number",
                            special: "One special character"
                        }).map(([key, label]) => (
                            <View key={key} style={styles.criteriaItem}>
                                <Feather name={criteria[key] ? "check" : "circle"} size={14} color={criteria[key] ? "#10B981" : colors.mutedForeground} />
                                <ThemedText style={[styles.criteriaText, { color: criteria[key] ? "#10B981" : colors.mutedForeground }]}>{label}</ThemedText>
                            </View>
                        ))}
                    </View>

                    {/* Confirm Password */}
                    <View style={styles.inputContainer}>
                        <ThemedText style={styles.label}>Confirm Password</ThemedText>
                        <View style={[styles.inputWrapper, newPassword && confirmPassword && newPassword !== confirmPassword && { borderColor: '#EF4444' }]}>
                            <Feather name="lock" size={18} color={colors.mutedForeground} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Confirm new password"
                                placeholderTextColor={colors.mutedForeground}
                                secureTextEntry={!isConfirmPasswordVisible}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                            />
                            <TouchableOpacity onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}>
                                <Feather name={isConfirmPasswordVisible ? "eye" : "eye-off"} size={18} color={colors.mutedForeground} />
                            </TouchableOpacity>
                        </View>
                        {newPassword && confirmPassword && newPassword !== confirmPassword && (
                            <ThemedText style={styles.errorText}>Passwords do not match</ThemedText>
                        )}
                    </View>

                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleResetPassword}
                        disabled={loading}
                    >
                        {loading ? <ActivityIndicator color="#fff" /> : <ThemedText style={styles.buttonText}>Reset Password</ThemedText>}
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleBackToLogin} style={styles.backLink}>
                        <Feather name="arrow-left" size={16} color={colors.foreground} style={{ marginRight: 8 }} />
                        <ThemedText style={styles.backLinkText}>Back to Login</ThemedText>
                    </TouchableOpacity>

                </View>
            </View>
        </SafeAreaView>
    );
}

const getStyles = (colors, typography) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        padding: 20,
        justifyContent: 'center',
    },
    card: {
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        width: '100%',
        maxWidth: 400,
        alignSelf: 'center',
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: colors.lightBlueBg || 'rgba(59, 130, 246, 0.1)', // Fallback if lightBlueBg not defined
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
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
    title: {
        fontSize: 24,
        textAlign: 'center',
        marginBottom: 8,
        color: colors.foreground,
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        color: colors.mutedForeground,
        marginBottom: 32,
    },
    formSection: {
        width: '100%',
    },
    sectionTitle: {
        fontSize: 18,
        textAlign: 'center',
        color: colors.foreground,
        marginBottom: 4,
    },
    sectionSubtitle: {
        fontSize: 14,
        textAlign: 'center',
        color: colors.mutedForeground,
        marginBottom: 24,
    },
    inputContainer: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        color: colors.foreground,
        marginBottom: 8,
        fontWeight: '500',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 48,
        backgroundColor: colors.background,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        color: colors.foreground,
        fontSize: 16,
    },
    strengthContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    strengthLabel: {
        fontSize: 12,
        color: colors.mutedForeground,
    },
    strengthValue: {
        fontSize: 12,
        fontWeight: '600',
    },
    strengthBarContainer: {
        height: 4,
        backgroundColor: colors.border,
        borderRadius: 2,
        marginBottom: 16,
        overflow: 'hidden',
    },
    strengthBar: {
        height: '100%',
        borderRadius: 2,
    },
    criteriaContainer: {
        marginBottom: 24,
    },
    criteriaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    criteriaText: {
        fontSize: 12,
        marginLeft: 8,
    },
    errorText: {
        color: '#EF4444',
        fontSize: 12,
        marginTop: 4,
    },
    button: {
        backgroundColor: colors.primary,
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 24,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    backLink: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    backLinkText: {
        color: colors.foreground,
        fontSize: 14,
        fontWeight: '500',
    }
});
