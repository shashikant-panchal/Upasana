import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

const StoryAvatar = ({ story, isViewed, onPress }) => {
    const { colors, isDark } = useTheme();

    const getBorderColors = () => {
        if (isViewed) {
            return isDark
                ? ['rgba(255, 255, 255, 0.12)', 'rgba(255, 255, 255, 0.12)'] 
                : ['rgba(0, 0, 0, 0.08)', 'rgba(0, 0, 0, 0.08)']; 
        }
        if (story.isToday) return ['#fbbf24', '#f97316', '#f43f5e']; 
        return [colors.primary, colors.primary + '80', colors.primary + '60'];
    };

    const getDayLabel = () => {
        if (story.isToday) return 'Today';
        if (story.daysUntil === 1) return 'Tomorrow';
        return `${story.daysUntil} days`;
    };

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={() => onPress(story)}
            activeOpacity={0.7}
        >
            <View style={styles.avatarWrapper}>
                <LinearGradient
                    colors={getBorderColors()}
                    style={styles.gradientBorder}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <View style={[styles.innerCircle, { backgroundColor: colors.background }]}>
                        <View
                            style={[
                                styles.contentCircle,
                                { backgroundColor: story.color + '10' }
                            ]}
                        >
                            <Text style={styles.emoji}>{story.emoji}</Text>

                            {story.isToday && (
                                <View style={[styles.todayBadge, { backgroundColor: '#f59e0b' }]}>
                                    <Text style={styles.todayBadgeText}>TODAY</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </LinearGradient>

                {story.isToday && !isViewed && (
                    <View style={[styles.liveIndicator, { borderColor: colors.background }]}>
                        <View style={styles.liveDot} />
                    </View>
                )}
            </View>

            <Text
                style={[
                    styles.label,
                    { color: story.isToday ? colors.foreground : colors.mutedForeground },
                    story.isToday && styles.boldLabel
                ]}
                numberOfLines={1}
            >
                {story.isToday ? story.name.split(' ')[0] : getDayLabel()}
            </Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        marginRight: 14,
        width: 74,
    },
    avatarWrapper: {
        position: 'relative',
        marginBottom: 6,
    },
    gradientBorder: {
        width: 74,
        height: 74,
        borderRadius: 37,
        padding: 2.5,
    },
    innerCircle: {
        flex: 1,
        borderRadius: 35,
        padding: 2.5,
    },
    contentCircle: {
        flex: 1,
        borderRadius: 29,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        position: 'relative',
    },
    emoji: {
        fontSize: 28,
    },
    todayBadge: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingVertical: 1,
        alignItems: 'center',
    },
    todayBadgeText: {
        color: '#FFFFFF',
        fontSize: 6,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    liveIndicator: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#ef4444',
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    liveDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#FFFFFF',
    },
    label: {
        fontSize: 10,
        textAlign: 'center',
        fontWeight: '500',
    },
    boldLabel: {
        fontWeight: '700',
    },
});

export default StoryAvatar;
