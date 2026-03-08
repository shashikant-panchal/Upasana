import { Feather, FontAwesome, Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '../components/ThemedText';
import { useTheme } from '../context/ThemeContext';
import { allQuestions } from '../data/ChallengeData';

const WINDOW_WIDTH = Dimensions.get('window').width;
const relativeWidth = (percentage) => WINDOW_WIDTH * (percentage / 100);

const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

const QUESTIONS_PER_SESSION = 10;

const Challenge = ({ navigation }) => {
    const { colors, isDark } = useTheme();

    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [showExplanation, setShowExplanation] = useState(false);
    const [score, setScore] = useState(0);
    const [isCompleted, setIsCompleted] = useState(false);
    const [answeredQuestions, setAnsweredQuestions] = useState([]);

    useEffect(() => {
        resetQuiz();
    }, []);

    const resetQuiz = () => {
        const shuffled = shuffleArray(allQuestions);
        const sessionQuestions = shuffled.slice(0, QUESTIONS_PER_SESSION);
        setQuestions(sessionQuestions);
        setCurrentQuestionIndex(0);
        setSelectedAnswer(null);
        setShowExplanation(false);
        setScore(0);
        setIsCompleted(false);
        setAnsweredQuestions(new Array(sessionQuestions.length).fill(false));
    };

    const currentQuestion = questions[currentQuestionIndex];

    const handleAnswerSelect = (answerIndex) => {
        if (showExplanation) return;

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setSelectedAnswer(answerIndex);
        setShowExplanation(true);

        if (answerIndex === currentQuestion.correctAnswer) {
            setScore(score + 1);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }

        const newAnswered = [...answeredQuestions];
        newAnswered[currentQuestionIndex] = true;
        setAnsweredQuestions(newAnswered);
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedAnswer(null);
            setShowExplanation(false);
        } else {
            setIsCompleted(true);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
    };

    const getScoreMessage = () => {
        const percentage = (score / questions.length) * 100;
        if (percentage >= 90) return { message: "Exceptional! You have deep spiritual wisdom.", icon: "trophy", color: "#CA8A04" };
        if (percentage >= 70) return { message: "Great work! Your understanding is growing.", icon: "star", color: "#9333EA" };
        if (percentage >= 50) return { message: "Good effort! Continue your spiritual journey.", icon: "thumbs-up", color: "#2563EB" };
        return { message: "Keep learning! Every step brings you closer to wisdom.", icon: "book", color: "#16A34A" };
    };

    if (!currentQuestion && !isCompleted) return null;

    if (isCompleted) {
        const scoreInfo = getScoreMessage();
        const percentage = (score / questions.length) * 100;

        return (
            <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
                <ScrollView contentContainerStyle={styles.resultScrollContent}>
                    <View style={[styles.resultCard, { backgroundColor: colors.card, borderColor: colors.border }]}>

                        <View style={styles.resultHeader}>
                            <ThemedText type="heading" style={[styles.resultTitle, { color: percentage >= 70 ? colors.primary : colors.foreground }]}>
                                {percentage >= 70 ? 'VICTORY' : 'COMPLETED'}
                            </ThemedText>
                        </View>

                        <View style={styles.scoreDisplayContainer}>
                            <View style={styles.scoreItem}>
                                <ThemedText type="heading" style={[styles.scoreValue, { color: colors.foreground }]}>{score}</ThemedText>
                                <View style={styles.scoreLabelRow}>
                                    <Feather name="check-circle" size={16} color="#16A34A" />
                                    <ThemedText style={styles.scoreLabelText}>Correct</ThemedText>
                                </View>
                            </View>
                            <ThemedText style={styles.scoreSeparator}>-</ThemedText>
                            <View style={styles.scoreItem}>
                                <ThemedText type="heading" style={[styles.scoreValue, { color: colors.foreground }]}>{questions.length - score}</ThemedText>
                                <View style={styles.scoreLabelRow}>
                                    <Feather name="x-circle" size={16} color="#DC2626" />
                                    <ThemedText style={styles.scoreLabelText}>Wrong</ThemedText>
                                </View>
                            </View>
                        </View>

                        <View style={styles.statsRow}>
                            <View style={[styles.statBox, { backgroundColor: colors.muted }]}>
                                <ThemedText style={styles.statLabel}>Accuracy</ThemedText>
                                <View style={styles.statValueRow}>
                                    <FontAwesome name="trophy" size={20} color={colors.primary} />
                                    <ThemedText type="defaultSemiBold" style={[styles.statValue, { color: colors.foreground }]}>{percentage.toFixed(0)}%</ThemedText>
                                </View>
                            </View>
                            <View style={[styles.statBox, { backgroundColor: colors.muted }]}>
                                <ThemedText style={styles.statLabel}>Total Score</ThemedText>
                                <View style={styles.statValueRow}>
                                    <Ionicons name="sparkles" size={20} color={colors.primary} />
                                    <ThemedText type="defaultSemiBold" style={[styles.statValue, { color: colors.foreground }]}>{score}/{questions.length}</ThemedText>
                                </View>
                            </View>
                        </View>

                        <View style={[styles.messageBox, { backgroundColor: colors.lightBlueBg }]}>
                            <ThemedText style={[styles.messageText, { color: colors.mutedForeground }]}>"{scoreInfo.message}"</ThemedText>
                        </View>

                        <View style={styles.actionButtonsContainer}>
                            <TouchableOpacity style={[styles.outlineButton, { borderColor: colors.border }]} onPress={resetQuiz}>
                                <ThemedText style={[styles.outlineButtonText, { color: colors.foreground }]}>Try Again</ThemedText>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.filledButton} onPress={() => navigation.goBack()}>
                                <LinearGradient
                                    colors={['#A556F6', '#437FF6']}
                                    start={{ x: 0, y: 0.5 }}
                                    end={{ x: 1, y: 0.5 }}
                                    style={styles.gradientButton}
                                >
                                    <ThemedText style={styles.filledButtonText}>Finish</ThemedText>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>

                    </View>
                </ScrollView>
            </SafeAreaView>
        );
    }

    const progress = ((currentQuestionIndex + (showExplanation ? 1 : 0)) / questions.length) * 100;

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { borderBottomColor: colors.border + "40", backgroundColor: colors.background + 'CC' }]}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Feather name="arrow-left" size={24} color={colors.mutedForeground} />
                    </TouchableOpacity>
                    <View style={styles.headerTitleContainer}>
                        <ThemedText style={styles.headerTitle}>Wisdom Challenge</ThemedText>
                        <ThemedText style={styles.headerSubtitle}>Questions for the soul</ThemedText>
                    </View>
                </View>
                <View style={styles.headerRight}>
                    <View style={[styles.questionBadge, { backgroundColor: colors.muted }]}>
                        <ThemedText type="small" style={[styles.questionBadgeText, { color: colors.foreground }]}>{currentQuestionIndex + 1}/{questions.length}</ThemedText>
                    </View>
                </View>
            </View>

            <View style={styles.progressContainer}>
                <View style={[styles.progressBarBackground, { backgroundColor: colors.border }]}>
                    <View style={[styles.progressBarFill, { width: `${progress}%`, backgroundColor: colors.primary }]} />
                </View>
                <ThemedText type="small" style={[styles.progressText, { color: colors.mutedForeground }]}>{Math.round(progress)}% complete</ThemedText>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>

                    <View style={styles.tagsRow}>
                        <View style={[styles.tag, { backgroundColor: colors.muted }]}>
                            <ThemedText type="caption" style={[styles.tagText, { color: colors.foreground }]}>{currentQuestion.category}</ThemedText>
                        </View>
                        <View style={[styles.tagOutline, { borderColor: colors.border }]}>
                            <ThemedText type="caption" style={[styles.tagText, { color: colors.foreground }]}>{currentQuestion.difficulty}</ThemedText>
                        </View>
                    </View>

                    <ThemedText type="heading" style={[styles.questionText, { color: colors.foreground }]}>{currentQuestion.question}</ThemedText>

                    <View style={styles.optionsContainer}>
                        {currentQuestion.options.map((option, index) => {
                            const isSelected = selectedAnswer === index;
                            const isCorrect = index === currentQuestion.correctAnswer;
                            const isWrong = isSelected && !isCorrect;

                            let backgroundColor = colors.card;
                            let borderColor = colors.border;
                            let textColor = colors.foreground;

                            if (showExplanation) {
                                if (isCorrect) {
                                    backgroundColor = isDark ? '#052e16' : '#ecfdf5'; 
                                    borderColor = '#22c55e'; 
                                    textColor = isDark ? '#d1fae5' : '#14532d'; 
                                } else if (isWrong) {
                                    backgroundColor = isDark ? '#450a0a' : '#fef2f2'; 
                                    borderColor = '#ef4444'; 
                                    textColor = isDark ? '#fee2e2' : '#7f1d1d'; 
                                }
                            } else if (isSelected) {
                                borderColor = colors.primary;
                            }

                            return (
                                <TouchableOpacity
                                    key={index}
                                    disabled={showExplanation}
                                    onPress={() => handleAnswerSelect(index)}
                                    style={[
                                        styles.optionButton,
                                        { backgroundColor, borderColor }
                                    ]}
                                >
                                    <View style={styles.optionContent}>
                                        <ThemedText style={[styles.optionText, { color: textColor }]}>{option}</ThemedText>
                                        {showExplanation && isCorrect && <Feather name="check-circle" size={20} color="#22c55e" />}
                                        {showExplanation && isWrong && <Feather name="x-circle" size={20} color="#ef4444" />}
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {showExplanation && (
                        <View style={styles.explanationContainer}>
                            <View style={[styles.explanationBox, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : '#eff6ff', borderColor: isDark ? 'rgba(59, 130, 246, 0.2)' : '#bfdbfe' }]}>
                                <View style={styles.explanationHeader}>
                                    <Ionicons name="bulb-outline" size={20} color={colors.primary} />
                                    <ThemedText type="small" style={[styles.explanationTitle, { color: colors.primary }]}>EXPLANATION</ThemedText>
                                </View>
                                <ThemedText style={[styles.explanationText, { color: colors.foreground }]}>{currentQuestion.explanation}</ThemedText>
                            </View>

                            {currentQuestion.verse && (
                                <View style={[styles.verseBox, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                                    <View style={styles.verseHeader}>
                                        <FontAwesome name="star-o" size={18} color={colors.mutedForeground} />
                                        <ThemedText style={[styles.verseText, { color: colors.mutedForeground }]}>{currentQuestion.verse}</ThemedText>
                                    </View>
                                </View>
                            )}
                        </View>
                    )}

                </View>
            </ScrollView>

            {showExplanation && (
                <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
                    <TouchableOpacity onPress={handleNextQuestion} style={styles.nextButton}>
                        <LinearGradient
                            colors={['#A556F6', '#437FF6']}
                            start={{ x: 0, y: 0.5 }}
                            end={{ x: 1, y: 0.5 }}
                            style={styles.gradientButton}
                        >
                            <ThemedText style={styles.nextButtonText}>
                                {currentQuestionIndex < questions.length - 1 ? "Next Question" : "Complete Challenge"}
                            </ThemedText>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            )}

        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        zIndex: 10,
    },
    headerLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    backButton: {
        padding: 4,
    },
    headerTitleContainer: {
        alignItems: "flex-start",
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "600",
    },
    headerSubtitle: {
        fontSize: 12,
        opacity: 0.6,
    },
    headerRight: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    questionBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    questionBadgeText: {
        fontSize: 12,
    },
    progressContainer: {
        padding: 16,
        paddingBottom: 8,
    },
    progressBarBackground: {
        height: 6,
        borderRadius: 3,
        width: '100%',
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 3,
    },
    progressText: {
        textAlign: 'center',
        fontSize: 12,
        marginTop: 8,
    },
    scrollContent: {
        padding: 16,
        paddingTop: 8,
    },
    card: {
        borderRadius: 16,
        borderWidth: 2,
        padding: 20,
        marginBottom: 20,
    },
    tagsRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 16,
    },
    tag: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    tagOutline: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
    },
    tagText: {
        fontSize: 12,
    },
    questionText: {
        fontSize: 20,
        marginBottom: 24,
        lineHeight: 28,
    },
    optionsContainer: {
        gap: 12,
    },
    optionButton: {
        borderWidth: 2,
        borderRadius: 12,
        padding: 16,
    },
    optionContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
    },
    optionText: {
        fontSize: 15,
        flex: 1,
    },
    explanationContainer: {
        marginTop: 24,
        gap: 12,
    },
    explanationBox: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
    },
    explanationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    explanationTitle: {
        fontSize: 12,
        letterSpacing: 0.5,
    },
    explanationText: {
        fontSize: 14,
        lineHeight: 20,
    },
    verseBox: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
    },
    verseHeader: {
        flexDirection: 'row',
        gap: 12,
    },
    verseText: {
        fontSize: 14,
        fontStyle: 'italic',
        lineHeight: 20,
        flex: 1,
    },
    footer: {
        padding: 16,
        borderTopWidth: 1,
    },
    nextButton: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    gradientButton: {
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    nextButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
    },

    resultScrollContent: {
        padding: 20,
        justifyContent: 'center',
        minHeight: '100%',
    },
    resultCard: {
        borderRadius: 24,
        borderWidth: 2,
        padding: 32,
        alignItems: 'center',
    },
    resultHeader: {
        marginBottom: 32,
    },
    resultTitle: {
        fontSize: 32,
        letterSpacing: 1,
    },
    scoreDisplayContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 32,
        marginBottom: 32,
    },
    scoreItem: {
        alignItems: 'center',
        gap: 8,
    },
    scoreValue: {
        fontSize: 48,
    },
    scoreLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    scoreLabelText: {
        fontSize: 14,
        color: '#64748B', 
    },
    scoreSeparator: {
        fontSize: 32,
        color: '#94A3B8', 
    },
    statsRow: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
        marginBottom: 32,
    },
    statBox: {
        flex: 1,
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        gap: 8,
    },
    statLabel: {
        fontSize: 12,
        color: '#64748B',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    statValueRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    statValue: {
        fontSize: 20,
    },
    messageBox: {
        padding: 24,
        borderRadius: 24,
        width: '100%',
        alignItems: 'center',
        marginBottom: 32,
    },
    messageText: {
        fontSize: 14,
        fontStyle: 'italic',
        textAlign: 'center',
        lineHeight: 20,
    },
    actionButtonsContainer: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    outlineButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 16,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    outlineButtonText: {
        fontSize: 14,
    },
    filledButton: {
        flex: 1,
        borderRadius: 16,
        overflow: 'hidden',
    },
    filledButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
    },
});

export default Challenge;