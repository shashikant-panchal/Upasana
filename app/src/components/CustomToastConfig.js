import { AntDesign, Feather, MaterialIcons } from '@expo/vector-icons';
import { Platform, StyleSheet, Text, View } from 'react-native';
import Typography from '../constants/Typography';
import { useTheme } from '../context/ThemeContext';

const BaseToast = ({ text1, text2, type }) => {
    const { colors, isDark } = useTheme();

    const getIcon = () => {
        const iconColor = isDark ? colors.cardForeground : colors.primary;
        const size = 24;

        switch (type) {
            case 'success':
                return <Feather name="check-circle" size={size} color={colors.secondary} />;
            case 'error':
                return <MaterialIcons name="error-outline" size={size} color={colors.destructive} />;
            case 'info':
                return <AntDesign name="infocirlceo" size={size} color={colors.accent} />;
            default:
                return <AntDesign name="infocirlceo" size={size} color={colors.primary} />;
        }
    };

    const getBorderColor = () => {
        switch (type) {
            case 'success':
                return colors.secondary;
            case 'error':
                return colors.destructive;
            case 'info':
                return colors.accent;
            default:
                return colors.primary;
        }
    };

    return (
        <View style={[styles.container, {
            backgroundColor: colors.card,
            borderLeftColor: getBorderColor(),
            shadowColor: isDark ? '#000' : '#888',
        }]}>
            <View style={styles.iconContainer}>
                {getIcon()}
            </View>
            <View style={styles.textContainer}>
                {text1 && (
                    <Text style={[styles.title, {
                        color: colors.cardForeground,
                        fontFamily: Typography.family.interSemiBold 
                    }]}>
                        {text1}
                    </Text>
                )}
                {text2 && (
                    <Text style={[styles.message, {
                        color: colors.mutedForeground,
                        fontFamily: Typography.family.inter 
                    }]}>
                        {text2}
                    </Text>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '90%',
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderLeftWidth: 6,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6,
        marginTop: Platform.OS === 'android' ? 30 : 10,
    },
    iconContainer: {
        marginRight: 14,
    },
    textContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    title: {
        fontSize: 16,
        marginBottom: 2,
    },
    message: {
        fontSize: 14,
        lineHeight: 18,
    },
});

export const toastConfig = {
    success: (props) => <BaseToast {...props} type="success" />,
    error: (props) => <BaseToast {...props} type="error" />,
    info: (props) => <BaseToast {...props} type="info" />,
};

export default toastConfig;
