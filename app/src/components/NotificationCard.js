import { Ionicons as Icon } from '@expo/vector-icons';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { ThemedText } from './ThemedText';

const NotificationCard = ({
    icon,
    color,
    iconColor,
    title,
    description,
    time,
    tag,
    unread,
    descriptionStyle = {},
    onPress,
}) => {
    const { colors, isDark } = useTheme();

    return (
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={onPress}
            style={[
                styles.card,
                {
                    backgroundColor: colors.card,
                    borderColor: unread ? colors.primary + '30' : colors.border,
                    borderWidth: isDark ? 1 : 0.5,
                }
            ]}
        >
            <View style={[styles.iconContainer, { backgroundColor: isDark ? colors.muted : color }]}>
                <Icon name={icon} size={22} color={isDark ? colors.primary : iconColor} />
            </View>
            <View style={styles.contentContainer}>
                <View style={styles.titleRow}>
                    <ThemedText type="defaultSemiBold" style={[styles.title, { color: colors.foreground }]}>{title}</ThemedText>
                    {unread && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
                </View>
                <ThemedText type="small" style={[styles.description, { color: colors.mutedForeground }, descriptionStyle]}>{description}</ThemedText>
                <View style={styles.footerRow}>
                    <View style={styles.footerLeft}>
                        <ThemedText type="caption" style={[styles.time, { color: colors.mutedForeground }]}>{time}</ThemedText>
                        {tag && (
                            <View style={[styles.tag, { backgroundColor: colors.muted + '50' }]}>
                                <ThemedText type="caption" style={[styles.tagText, { color: colors.mutedForeground }]}>{tag}</ThemedText>
                            </View>
                        )}
                    </View>
                    <Icon name="chevron-forward" size={16} color={colors.mutedForeground} style={{ opacity: 0.5 }} />
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 0.5,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    contentContainer: {
        flex: 1,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 2,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    description: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 6,
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    footerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    time: {
        fontSize: 12,
    },
    tag: {
        borderRadius: 8,
        paddingVertical: 2,
        paddingHorizontal: 8,
    },
    tagText: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
});

export default NotificationCard;