import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { dw } from "../constants/Dimensions";
import { useTheme } from "../context/ThemeContext";
import { ThemedText } from "./ThemedText";

const DecorativeButton = ({ onPress, text, style, textStyle, iconName = "arrow-right" }) => {
    const { isDark } = useTheme();

    const gradientColors = isDark
        ? ["#4177b0ff", "#498095ff"]
        : ["#1a346cff", "#3258abff"];

    const leafOpacity = isDark ? 0.15 : 0.2;

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.8}
            style={[styles.container, style]}
        >
            <LinearGradient
                colors={gradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradient}
            >
                {}
                <MaterialCommunityIcons
                    name="leaf"
                    size={70}
                    color={`rgba(255, 255, 255, ${leafOpacity})`}
                    style={styles.mandalaLeft}
                />
                <MaterialCommunityIcons
                    name="leaf"
                    size={80}
                    color={`rgba(255, 255, 255, ${leafOpacity - 0.03})`}
                    style={styles.mandalaRight}
                />
                <MaterialCommunityIcons
                    name="leaf"
                    size={60}
                    color={`rgba(255, 255, 255, ${leafOpacity - 0.07})`}
                    style={styles.mandalaCenter}
                />

                <View style={styles.content}>
                    <ThemedText type="defaultSemiBold" style={[styles.buttonText, textStyle]}>
                        {text}
                    </ThemedText>
                    {iconName && (
                        <Feather
                            name={iconName}
                            size={18}
                            color="#FFFFFF"
                            style={styles.icon}
                        />
                    )}
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 12,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 5,
    },
    gradient: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        alignItems: "center",
        justifyContent: "center",
        minHeight: 48,
        flexDirection: "row",
        overflow: "hidden", 
    },
    mandalaLeft: {
        position: "absolute",
        left: -5,
        top: -10,
        transform: [{ rotate: "-15deg" }],
    },
    mandalaRight: {
        position: "absolute",
        right: -30,
        bottom: -30,
        transform: [{ rotate: "15deg" }],
    },
    mandalaCenter: {
        position: "absolute",
        right: dw * 0.2,
        top: -10,
        transform: [{ rotate: "180deg" }],
    },
    content: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1, 
    },
    buttonText: {
        color: "#FFFFFF",
        fontSize: 16,
        letterSpacing: 0.5,
    },
    icon: {
        marginLeft: 10,
    },
});

export default DecorativeButton;