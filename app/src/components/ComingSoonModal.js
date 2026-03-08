import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import {
    Animated,
    Dimensions,
    Modal,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { ThemedText } from "./ThemedText";

const { height: WINDOW_HEIGHT } = Dimensions.get("window");

const ComingSoonModal = ({ visible, onClose }) => {
    const { colors, isDark } = useTheme();
    const slideAnim = useRef(new Animated.Value(WINDOW_HEIGHT)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 400,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: WINDOW_HEIGHT,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible]);

    const styles = getStyles(colors, isDark);

    return (
        <Modal
            transparent
            visible={visible}
            onRequestClose={onClose}
            animationType="none"
        >
            <TouchableOpacity
                activeOpacity={1}
                style={styles.overlay}
                onPress={onClose}
            >
                <Animated.View style={[styles.backdrop, { opacity: opacityAnim }]} />
                <Animated.View
                    style={[
                        styles.content,
                        { transform: [{ translateY: slideAnim }] },
                    ]}
                >
                    <View style={styles.handle} />
                    <View style={styles.iconContainer}>
                        <Ionicons name="sparkles" size={50} color={colors.primary} />
                    </View>
                    <ThemedText type="heading" style={styles.title}>
                        Coming Soon!
                    </ThemedText>
                    <ThemedText style={styles.description}>
                        We are working hard to bring this feature to you. Stay tuned for updates!
                    </ThemedText>
                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: colors.primary }]}
                        onPress={onClose}
                    >
                        <ThemedText style={styles.buttonText}>Exciting!</ThemedText>
                    </TouchableOpacity>
                </Animated.View>
            </TouchableOpacity>
        </Modal>
    );
};

const getStyles = (colors, isDark) =>
    StyleSheet.create({
        overlay: {
            flex: 1,
            justifyContent: "flex-end",
        },
        backdrop: {
            ...StyleSheet.absoluteFillObject,
            backgroundColor: "rgba(0,0,0,0.5)",
        },
        content: {
            backgroundColor: colors.card,
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
            padding: 24,
            paddingBottom: 40,
            alignItems: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.1,
            shadowRadius: 10,
            elevation: 20,
        },
        handle: {
            width: 40,
            height: 4,
            borderRadius: 2,
            backgroundColor: colors.border,
            marginBottom: 24,
        },
        iconContainer: {
            width: 90,
            height: 90,
            borderRadius: 45,
            backgroundColor: colors.primary + "15",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 20,
        },
        title: {
            fontSize: 24,
            fontWeight: "700",
            marginBottom: 12,
            color: colors.foreground,
        },
        description: {
            fontSize: 16,
            textAlign: "center",
            color: colors.mutedForeground,
            lineHeight: 24,
            marginBottom: 32,
            paddingHorizontal: 20,
        },
        button: {
            width: "100%",
            height: 56,
            borderRadius: 16,
            justifyContent: "center",
            alignItems: "center",
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
        },
        buttonText: {
            color: "#fff",
            fontSize: 18,
            fontWeight: "700",
        },
    });

export default ComingSoonModal;
