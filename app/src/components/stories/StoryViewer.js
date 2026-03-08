import { Feather, Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import {
    Dimensions,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import Animated, {
    cancelAnimation,
    Easing,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { getFestivalId, hasFestivalDetails } from '../../data/festivalData';

const { width } = Dimensions.get('window');
const STORY_DURATION = 5000;

const StoryViewer = ({ stories, initialIndex, visible, onClose, onStoryViewed }) => {
    const { colors } = useTheme();
    
    const navigation = useNavigation();

    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const story = stories[currentIndex];

    const progress = useSharedValue(0);
    const isPaused = useSharedValue(false);
    const startTime = useSharedValue(0);
    const pausedProgress = useSharedValue(0);

    const containerScale = useSharedValue(0.9);
    const containerOpacity = useSharedValue(0);
    const contentScale = useSharedValue(0.5);
    const contentOpacity = useSharedValue(0);
    const textY = useSharedValue(20);
    const textOpacity = useSharedValue(0);
    const buttonY = useSharedValue(20);
    const buttonOpacity = useSharedValue(0);

    const startProgressBar = useCallback((fromValue = 0) => {
        progress.value = fromValue;
        const remainingDuration = STORY_DURATION * (1 - fromValue);

        progress.value = withTiming(1, {
            duration: remainingDuration,
            easing: Easing.linear,
        }, (finished) => {
            if (finished) {
                runOnJS(handleNext)();
            }
        });
    }, [progress, handleNext]);

    const handleNext = useCallback(() => {
        if (currentIndex < stories.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            onClose();
        }
    }, [currentIndex, stories.length, onClose]);

    const handlePrev = useCallback(() => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        } else {
            onClose();
        }
    }, [currentIndex, onClose]);

    const resetAnimations = useCallback(() => {
        progress.value = 0;
        contentScale.value = 0.5;
        contentOpacity.value = 0;
        textY.value = 20;
        textOpacity.value = 0;
        buttonY.value = 20;
        buttonOpacity.value = 0;

        contentScale.value = withDelay(100, withSpring(1, { damping: 20, stiffness: 200 }));
        contentOpacity.value = withDelay(100, withTiming(1, { duration: 400 }));
        textY.value = withDelay(200, withSpring(0));
        textOpacity.value = withDelay(200, withTiming(1, { duration: 400 }));
        buttonY.value = withDelay(300, withSpring(0));
        buttonOpacity.value = withDelay(300, withTiming(1, { duration: 400 }));

        startProgressBar(0);

        if (story) {
            onStoryViewed(story.id);
        }
    }, [progress, contentScale, contentOpacity, textY, textOpacity, buttonY, buttonOpacity, startProgressBar, story, onStoryViewed]);

    useEffect(() => {
        if (visible) {
            setCurrentIndex(initialIndex);
            containerScale.value = withSpring(1, { damping: 25, stiffness: 300 });
            containerOpacity.value = withTiming(1, { duration: 300 });
        } else {
            containerScale.value = 0.9;
            containerOpacity.value = 0;
            cancelAnimation(progress);
        }
    }, [visible, initialIndex]);

    useEffect(() => {
        if (visible && story) {
            resetAnimations();
        }
    }, [currentIndex, visible]);

    const handlePress = (event) => {
        const x = event.nativeEvent.locationX;
        if (x < width / 3) {
            handlePrev();
        } else {
            handleNext();
        }
    };

    const onLongPressStart = () => {
        isPaused.value = true;
        pausedProgress.value = progress.value;
        cancelAnimation(progress);
    };

    const onLongPressEnd = () => {
        if (isPaused.value) {
            isPaused.value = false;
            startProgressBar(pausedProgress.value);
        }
    };

    const progressStyle = useAnimatedStyle(() => ({
        width: `${progress.value * 100}%`,
    }));

    const containerAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: containerScale.value }],
        opacity: containerOpacity.value,
    }));

    const contentAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: contentScale.value }],
        opacity: contentOpacity.value,
    }));

    const textAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: textY.value }],
        opacity: textOpacity.value,
    }));

    const buttonAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: buttonY.value }],
        opacity: buttonOpacity.value,
    }));

    if (!story) return null;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                <StatusBar style="light" />

                <Animated.View style={[styles.backgroundWrapper, containerAnimatedStyle]}>
                    <LinearGradient
                        colors={[story.color + '4D', story.color + '26', '#000000']}
                        style={styles.background}
                    >
                        <SafeAreaView style={styles.safeArea}>
                            {}
                            <View style={styles.header}>
                                <View style={styles.progressContainer}>
                                    <View style={[styles.progressBackground, { backgroundColor: 'rgba(255,255,255,0.3)' }]}>
                                        <Animated.View style={[styles.progressFill, progressStyle, { backgroundColor: '#FFFFFF' }]} />
                                    </View>
                                </View>

                                <View style={styles.headerContent}>
                                    <View style={styles.userInfo}>
                                        <View style={[styles.avatarIcon, { backgroundColor: story.color + '40' }]}>
                                            <Text style={styles.avatarEmoji}>{story.emoji}</Text>
                                        </View>
                                        <View>
                                            <Text style={styles.userName}>{story.name}</Text>
                                            <Text style={styles.timeText}>
                                                {story.isToday ? 'Today' : `${story.daysUntil} days away`}
                                            </Text>
                                        </View>
                                    </View>
                                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                        <Feather name="x" size={24} color="#FFFFFF" />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {}
                            <TouchableWithoutFeedback
                                onPress={handlePress}
                                onLongPress={onLongPressStart}
                                onPressOut={onLongPressEnd}
                                delayLongPress={200}
                            >
                                <View style={styles.interactionLayer}>
                                    {}
                                    <View style={styles.content}>
                                        <Animated.View style={[styles.emojiContainer, contentAnimatedStyle]}>
                                            <Text style={styles.largeEmoji}>{story.emoji}</Text>
                                            <Text style={styles.title}>{story.name}</Text>
                                        </Animated.View>

                                        <Animated.View style={[styles.detailsContainer, textAnimatedStyle]}>
                                            <View style={styles.dateBadge}>
                                                <Feather name="calendar" size={16} color="rgba(255,255,255,0.8)" />
                                                <Text style={styles.dateText}>
                                                    {new Date(story.date).toLocaleDateString('en-US', {
                                                        weekday: 'long',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </Text>
                                            </View>

                                            {story.isToday && (
                                                <View style={styles.todayBadge}>
                                                    <Ionicons name="sparkles" size={16} color="#fbbf24" />
                                                    <Text style={styles.todayBadgeText}>Happening Today!</Text>
                                                </View>
                                            )}

                                            {!story.isToday && (
                                                <View style={styles.daysUntilBadge}>
                                                    <Text style={styles.daysUntilText}>
                                                        {story.daysUntil === 1 ? 'Tomorrow' : `In ${story.daysUntil} days`}
                                                    </Text>
                                                </View>
                                            )}

                                            {story.description && (
                                                <Text style={styles.description}>{story.description}</Text>
                                            )}
                                        </Animated.View>
                                    </View>
                                </View>
                            </TouchableWithoutFeedback>

                            {}
                            <Animated.View style={[styles.footer, buttonAnimatedStyle]}>
                                {story.type === 'festival' && hasFestivalDetails(story.name) && (
                                    <TouchableOpacity
                                        style={styles.detailsButton}
                                        onPress={() => {
                                            onClose();
                                            const id = getFestivalId(story.name);
                                            navigation.navigate('FestivalDetail', { festivalId: id });
                                        }}
                                        activeOpacity={0.8}
                                    >
                                        <BlurView intensity={30} tint="light" style={styles.blurButton}>
                                            <Text style={styles.detailsButtonText}>View Details</Text>
                                            <Feather name="chevron-right" size={18} color="#FFFFFF" />
                                        </BlurView>
                                    </TouchableOpacity>
                                )}

                                <Text style={styles.typeLabel}>
                                    {story.type === 'festival' ? '🎉 Festival' :
                                        story.type === 'purnima' ? '🌕 Full Moon' : '🌑 New Moon'}
                                </Text>
                            </Animated.View>
                        </SafeAreaView>
                    </LinearGradient>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    backgroundWrapper: {
        flex: 1,
    },
    background: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 16,
        zIndex: 20,
        paddingTop: 10,
    },
    progressContainer: {
        height: 3,
        width: '100%',
        marginBottom: 16,
    },
    progressBackground: {
        flex: 1,
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    avatarEmoji: {
        fontSize: 20,
    },
    userName: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
    },
    timeText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 12,
    },
    closeButton: {
        padding: 4,
    },
    interactionLayer: {
        flex: 1,
        zIndex: 10,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
    },
    emojiContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    largeEmoji: {
        fontSize: 100,
        marginBottom: 10,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: '#FFFFFF',
        textAlign: 'center',
        paddingHorizontal: 10,
    },
    detailsContainer: {
        alignItems: 'center',
        width: '100%',
    },
    dateBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginBottom: 16,
    },
    dateText: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 16,
        marginLeft: 8,
    },
    todayBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.15)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginBottom: 20,
    },
    todayBadgeText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 16,
        marginLeft: 8,
    },
    daysUntilBadge: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginBottom: 20,
    },
    daysUntilText: {
        color: 'rgba(255,255,255,0.9)',
        fontWeight: '600',
        fontSize: 16,
    },
    description: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
    },
    footer: {
        paddingBottom: 40,
        paddingHorizontal: 32,
        alignItems: 'center',
        zIndex: 20,
    },
    detailsButton: {
        width: '100%',
        borderRadius: 25,
        overflow: 'hidden',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    blurButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
    },
    detailsButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        marginRight: 4,
    },
    typeLabel: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 1.2,
        textTransform: 'uppercase',
    },
});

export default StoryViewer;
