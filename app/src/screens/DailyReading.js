import { LinearGradient } from "expo-linear-gradient";
import * as Speech from 'expo-speech';
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Modal,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  ToastAndroid,
  TouchableOpacity,
  View
} from "react-native";
import Reanimated, {
  Easing,
  Extrapolation,
  FadeInDown,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import AntDesign from "react-native-vector-icons/AntDesign";
import Feather from "react-native-vector-icons/Feather";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useDispatch, useSelector } from "react-redux";
import { ThemedText } from "../components/ThemedText";
import { useTheme } from "../context/ThemeContext";
import { bhagavadGitaChapters, getTodaysVerse } from "../data/bhagavadGitaData";
import { fetchReadingData, markVerseRead } from "../redux/readingSlice";
import { fetchAllChapters, fetchChapterVerses } from "../services/gitaApi";

const getVerseTheme = (chapter, isDark = false) => {
  const themes = {
    1: {
      bg: isDark ? ["#1E1B4B", "#312E81", "#1E1B4B"] : ["#EEF2FF", "#E0E7FF"],
      accent: isDark ? "#C7D2FE" : "#4338CA",
      title: "Arjuna Vishada Yoga"
    },
    2: {
      bg: isDark ? ["#0F172A", "#1E293B", "#0F172A"] : ["#F0F9FF", "#EFF6FF"],
      accent: isDark ? "#BAE6FD" : "#0369A1",
      title: "Sankhya Yoga"
    },
    3: {
      bg: isDark ? ["#064E3B", "#065F46", "#064E3B"] : ["#ECFDF5", "#F0FDF4"],
      accent: isDark ? "#A7F3D0" : "#047857",
      title: "Karma Yoga"
    },
    4: {
      bg: isDark ? ["#1E293B", "#334155", "#1E293B"] : ["#F8FAFC", "#F1F5F9"],
      accent: isDark ? "#CBD5E1" : "#475569",
      title: "Jnana Karma Sanyasa Yoga"
    },
    5: {
      bg: isDark ? ["#4C1D95", "#5B21B6", "#4C1D95"] : ["#F5F3FF", "#FAF5FF"],
      accent: isDark ? "#DDD6FE" : "#6D28D9",
      title: "Karma Sanyasa Yoga"
    },
    6: {
      bg: isDark ? ["#164E63", "#155E75", "#164E63"] : ["#ECFEFF", "#F0FDFA"],
      accent: isDark ? "#A5F3FC" : "#0E7490",
      title: "Dhyana Yoga"
    },
    7: {
      bg: isDark ? ["#881337", "#9F1239", "#881337"] : ["#FFF1F2", "#FDF2F8"],
      accent: isDark ? "#FECDD3" : "#BE123C",
      title: "Jnana Vijnana Yoga"
    },
    8: {
      bg: isDark ? ["#312E81", "#3730A3", "#312E81"] : ["#EEF2FF", "#EFF6FF"],
      accent: isDark ? "#C7D2FE" : "#4338CA",
      title: "Akshara Brahma Yoga"
    },
    9: {
      bg: isDark ? ["#831843", "#9D174D", "#831843"] : ["#FDF2F8", "#FFF1F2"],
      accent: isDark ? "#FCE7F3" : "#BE185D",
      title: "Raja Vidya Guhya Yoga"
    },
    10: {
      bg: isDark ? ["#365314", "#3F6212", "#365314"] : ["#F7FEE7", "#F0FDF4"],
      accent: isDark ? "#ECFCCB" : "#4D7C0F",
      title: "Vibhuti Vistara Yoga"
    },
    11: {
      bg: isDark ? ["#312E81", "#4338CA", "#312E81"] : ["#E0E7FF", "#EEF2FF"],
      accent: isDark ? "#E0E7FF" : "#4F46E5",
      title: "Vishwarupa Darshana Yoga"
    },
    12: {
      bg: isDark ? ["#134E4A", "#115E59", "#134E4A"] : ["#F0FDFA", "#ECFEFF"],
      accent: isDark ? "#99F6E4" : "#0F766E",
      title: "Bhakti Yoga"
    },
    13: {
      bg: isDark ? ["#334155", "#475569", "#334155"] : ["#F8FAFC", "#F9FAFB"],
      accent: isDark ? "#E2E8F0" : "#334155",
      title: "Kshetra Kshetrajna Vibhaga Yoga"
    },
    14: {
      bg: isDark ? ["#581C87", "#6B21A8", "#581C87"] : ["#FAF5FF", "#F5F3FF"],
      accent: isDark ? "#F3E8FF" : "#7E22CE",
      title: "Gunatraya Vibhaga Yoga"
    },
    15: {
      bg: isDark ? ["#065F46", "#059669", "#065F46"] : ["#F0FDF4", "#ECFDF5"],
      accent: isDark ? "#D1FAE5" : "#15803D",
      title: "Purushottama Yoga"
    },
    16: {
      bg: isDark ? ["#7F1D1D", "#991B1B", "#7F1D1D"] : ["#FEF2F2", "#FFF1F2"],
      accent: isDark ? "#FEE2E2" : "#B91C1C",
      title: "Daivasura Sampad Vibhaga Yoga"
    },
    17: {
      bg: isDark ? ["#1E3A8A", "#1E40AF", "#1E3A8A"] : ["#EFF6FF", "#F0F9FF"],
      accent: isDark ? "#DBEAFE" : "#1D4ED8",
      title: "Shraddhatraya Vibhaga Yoga"
    },
    18: {
      bg: isDark ? ["#312E81", "#3E37A1", "#312E81"] : ["#EEF2FF", "#E0E7FF"],
      accent: isDark ? "#C7D2FE" : "#3730A3",
      title: "Moksha Sanyasa Yoga"
    },
  };
  return themes[chapter] || themes[1];
};

const sampleChapterVerses = {
  1: [
    {
      verse: 1,
      sanskrit:
        "धृतराष्ट्र उवाच | धर्मक्षेत्रे कुरुक्षेत्रे समवेता युयुत्सवः | मामकाः पाण्डवाश्चैव किमकुर्वत सञ्जय ||१-१||",
      transliteration:
        "dhṛtarāṣṭra uvāca . dharmakṣetre kurukṣetre samavetā yuyutsavaḥ . māmakāḥ pāṇḍavāścaiva kimakurvata sañjaya ||1-1||",
      translation:
        '1.1 The King Dhritarashtra asked: "O Sanjaya! What happened on the sacred battlefield of Kurukshetra, when my people gathered against the Pandavas?"',
      significance:
        "व्याख्या--'धर्मक्षेत्रे' 'कुरुक्षेत्रे' --कुरुक्षेत्रमें देवताओंने यज्ञ किया था। राजा कुरुने भी यहाँ तपस्या की थी। यज्ञादि धर्ममय कार्य होनेसे तथा राजा कुरुकी तपस्याभूमि होनेसे इसको धर्मभूमि कुरुक्षेत्र कहा गया है।",
    },
    {
      verse: 2,
      sanskrit:
        "सञ्जय उवाच | दृष्ट्वा तु पाण्डवानीकं व्यूढं दुर्योधनस्तदा | आचार्यमुपसङ्गम्य राजा वचनमब्रवीत् ||१-२||",
      transliteration:
        "sañjaya uvāca . dṛṣṭvā tu pāṇḍavānīkaṃ vyūḍhaṃ duryodhanastadā . ācāryamupasaṅgamya rājā vacanamabravīt ||1-2||",
      translation:
        "1.2 Sanjaya said: Having seen the army of the Pandavas drawn up in battle array, King Duryodhana approached his teacher Drona and spoke these words.",
      significance:
        "दुर्योधन ने पाण्डव सेना की व्यूह-रचना देखकर द्रोणाचार्य के पास जाकर उनसे बातचीत की।",
    },
  ],
  2: [
    {
      verse: 47,
      sanskrit:
        "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन | मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि ||",
      transliteration:
        "karmaṇy evādhikāras te mā phaleṣu kadācana | mā karma-phala-hetur bhūr mā te saṅgo 'stv akarmaṇi ||",
      translation:
        "You have a right to perform your prescribed duty, but not to the fruits of action. Never consider yourself the cause of the results of your activities, and never be attached to not doing your duty.",
      significance:
        "This verse encapsulates the essence of Karma Yoga. Krishna advises Arjuna to perform his duty without attachment to results.",
    },
    {
      verse: 48,
      sanskrit:
        "योगस्थः कुरु कर्माणि सङ्गं त्यक्त्वा धनञ्जय | सिद्ध्यसिद्ध्योः समो भूत्वा समत्वं योग उच्यते ||",
      transliteration:
        "yoga-sthaḥ kuru karmāṇi saṅgaṃ tyaktvā dhanañjaya | siddhy-asiddhyoḥ samo bhūtvā samatvaṃ yoga ucyate ||",
      translation:
        "Perform your duty equipoised, O Arjuna, abandoning all attachment to success or failure. Such equanimity is called yoga.",
      significance:
        "This verse defines yoga as equanimity of mind, maintaining balance in all circumstances.",
    },
  ],
};

const FadeInView = ({ children, style, duration = 800 }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(10);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: duration,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: duration,
        useNativeDriver: true,
      }),
    ]).start();
  }, [children]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

const getChapterVerses = (chapterId, verseCount) => {
  if (sampleChapterVerses[chapterId]) {
    return sampleChapterVerses[chapterId];
  }
  const chapter = bhagavadGitaChapters.find((c) => c.id === chapterId);
  return Array.from({ length: Math.min(verseCount, 5) }, (_, i) => ({
    verse: i + 1,
    sanskrit: `श्लोक ${i + 1} - अध्याय ${chapterId}`,
    transliteration: `Verse ${i + 1} - Chapter ${chapterId}`,
    translation: `This is verse ${i + 1} of Chapter ${chapterId}: ${chapter?.englishName || "Bhagavad Gita"
      }. Full translation coming soon.`,
    significance: `The significance of this verse will be available in a future update.`,
  }));
};

const ChapterListItem = ({
  chapterNumber,
  title,
  verseCount,
  progress,
  onPress,
  colors,
}) => (
  <Animated.View entering={FadeInDown.duration(400).delay(chapterNumber * 50)}>
    <TouchableOpacity
      style={[
        chapterStyles.itemContainer,
        { backgroundColor: colors.muted },
      ]}
      onPress={onPress}
    >
      <View
        style={[
          chapterStyles.numberContainer,
          { backgroundColor: progress === verseCount ? colors.primary : colors.card },
        ]}
      >
        {progress === verseCount ? (
          <AntDesign name="check" size={14} color="#fff" />
        ) : (
          <ThemedText
            style={[chapterStyles.numberText, { color: colors.foreground }]}
          >
            {chapterNumber}
          </ThemedText>
        )}
      </View>
      <View style={chapterStyles.textContainer}>
        <ThemedText
          type="defaultSemiBold"
          style={[chapterStyles.titleText, { color: colors.foreground }]}
        >{`Chapter ${chapterNumber}: ${title}`}</ThemedText>
        <ThemedText
          style={[
            chapterStyles.progressText,
            { color: colors.mutedForeground },
          ]}
        >{`${progress}/${verseCount} verses`}</ThemedText>
      </View>
      <Feather name="chevron-right" size={20} color={colors.mutedForeground} />
    </TouchableOpacity>
  </Animated.View>
);

const DailyReading = ({ navigation }) => {
  const user = useSelector((state) => state.user.user);
  const {
    stats,
    chapterProgress,
    loading: readingLoading
  } = useSelector((state) => state.reading);
  const dispatch = useDispatch();

  const { colors, isDark } = useTheme();
  const [todaysVerse, setTodaysVerse] = useState(null);
  const [liveChapters, setLiveChapters] = useState([]);
  const [chaptersLoading, setChaptersLoading] = useState(false);

  const loading = readingLoading && !stats.totalVersesRead;

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
  const [chapterVerses, setChapterVerses] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);

  const [detailModalVisible, setDetailModalVisible] = useState(false);

  const currentModalVerse = chapterVerses[currentVerseIndex];
  const totalVerseCount =
    selectedChapter?.verseCount ||
    selectedChapter?.totalVerses ||
    chapterVerses.length;

  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const flatListRef = useRef(null);
  const { height: screenHeight } = Dimensions.get('window');
  const cardHeight = screenHeight - 250;

  const handleScroll = (event) => {
    const yOffset = event.nativeEvent.contentOffset.y;
    const index = Math.round(yOffset / cardHeight);
    if (index !== currentVerseIndex && index >= 0 && index < chapterVerses.length) {
      setCurrentVerseIndex(index);
    }
  };

  const scrollToVerse = (index) => {
    if (flatListRef.current && index >= 0 && index < chapterVerses.length) {
      flatListRef.current.scrollToIndex({ index, animated: true });
    }
  };

  const handlePreviousVerseScroll = () => {
    if (currentVerseIndex > 0) {
      scrollToVerse(currentVerseIndex - 1);
    }
  };

  const handleNextVerseScroll = () => {
    if (currentVerseIndex < chapterVerses.length - 1) {
      scrollToVerse(currentVerseIndex + 1);
    }
  };

  const handleCopySanskrit = async (text) => {
    try {
      const { Clipboard } = require('react-native');
      Clipboard.setString(text);
      showToast("Sanskrit copied to clipboard! �");
    } catch (error) {
      showToast("Clipboard not available.");
    }
  };

  useEffect(() => {
    setChaptersLoading(true);
    fetchAllChapters()
      .then((chapters) => {
        if (chapters && chapters.length > 0) {
          setLiveChapters(chapters);
        }
      })
      .catch((err) => console.warn("fetchAllChapters failed:", err.message))
      .finally(() => setChaptersLoading(false));
  }, []);

  useEffect(() => {
    const verse = getTodaysVerse();
    setTodaysVerse(verse);

    if (user?.id) {
      dispatch(fetchReadingData(user.id));
    }
  }, [user?.id, dispatch]);

  useEffect(() => {
    let timer;
    if (modalVisible && currentModalVerse && user?.id) {
      timer = setTimeout(() => {
        handleModalMarkAsRead(true);
      }, 3000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [modalVisible, currentVerseIndex, user?.id]);

  const totalChapters = bhagavadGitaChapters.length;
  const studyProgress =
    totalChapters > 0 ? stats.chaptersCompleted / totalChapters : 0;

  const showToast = (message) => {
    if (Platform.OS === "android") {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert("Daily Reading", message);
    }
  };

  const handleMarkAsRead = async () => {
    if (!user?.id || !verse) {
      console.warn("No user logged in or no verse selected");
      showToast("Please log in to track your progress");
      return;
    }

    try {
      const resultAction = await dispatch(markVerseRead({
        userId: user.id,
        chapter: verse.chapter,
        verse: verse.verse
      }));

      if (markVerseRead.fulfilled.match(resultAction)) {
        const result = resultAction.payload;
        if (result?.already_read) {
          showToast("You've already read this verse today! �");
        } else {
          showToast("Verse marked as read! Hare Krishna! �");
        }
      } else {
        showToast("Error saving progress. Please try again.");
      }
    } catch (error) {
      console.error("Error marking verse as read:", error);
      showToast("Error saving progress. Please try again.");
    }
  };

  const handleOpenChapter = async (chapter) => {

    const chapterId = chapter.id || chapter.chapter;
    const verseCount = chapter.verseCount || chapter.totalVerses || 10;

    const chapterData = {
      id: chapterId,
      chapter: chapterId,
      englishName: chapter.title || chapter.englishName || `Chapter ${chapterId}`,
      verseCount: verseCount,
      totalVerses: verseCount
    };

    setSelectedChapter(chapterData);
    setCurrentVerseIndex(0);
    setModalVisible(true);
    setModalLoading(true);

    try {
      const verses = await fetchChapterVerses(chapterId);
      setChapterVerses(verses);
    } catch (error) {
      console.error("Error fetching chapter verses:", error);
      const fallbackVerses = getChapterVerses(chapterId, verseCount);
      setChapterVerses(fallbackVerses);
    } finally {
      setModalLoading(false);
    }
  };

  const handleModalMarkAsRead = async (silent = false) => {
    if (!user?.id) {
      if (!silent) showToast("Please log in to track your progress");
      return;
    }

    const currentVerse = chapterVerses[currentVerseIndex];
    if (!currentVerse) return;

    const chapterId = selectedChapter?.id || selectedChapter?.chapter;

    try {
      const resultAction = await dispatch(markVerseRead({
        userId: user.id,
        chapter: chapterId,
        verse: currentVerse.verse
      }));

      if (markVerseRead.fulfilled.match(resultAction)) {
        const result = resultAction.payload;
        if (!silent) {
          if (result?.already_read) {
            showToast("You've already read this verse! �");
          } else {
            showToast("Verse marked as read! Hare Krishna! �");
          }
        }
      }
    } catch (error) {
      console.error("Error marking verse as read:", error);
      if (!silent) showToast("Error saving progress. Please try again.");
    }
  };

  const handleShare = async () => {
    const verse = currentModalVerse || todaysVerse;
    if (!verse) return;

    const shareText = `Bhagavad Gita ${verse.chapter}.${verse.verse}\n\n${verse.sanskrit || verse.text || verse.slok}\n\n${verse.translation || verse.meaning}`;

    try {
      await Share.share({
        message: shareText,
        title: `Bhagavad Gita ${verse.chapter}.${verse.verse}`,
      });
    } catch (error) {
      console.error("Error sharing verse:", error);
    }
  };

  const handleCloseModal = () => {
    Speech.stop();
    setModalVisible(false);
    setSelectedChapter(null);
    setChapterVerses([]);
    setCurrentVerseIndex(0);
  };

  const speakVerse = async (verseItem) => {
    if (!verseItem) return;

    Speech.stop();

    const textToSpeak = `Verse ${verseItem.verse}. ${verseItem.sanskrit || verseItem.text || verseItem.slok}`;
    console.log("Speaking text:", textToSpeak);

    const speechOptions = {
      language: 'en-IN',
      pitch: 1.0,
      rate: 0.75,
    };

    if (typeof Speech.getVoicesAsync === 'function') {
      try {
        const voices = await Speech.getVoicesAsync();
        const indianVoice = voices.find(v =>
          v.language.toLowerCase().includes('en-in') ||
          v.language.toLowerCase().includes('hi-in')
        );

        if (indianVoice) {
          speechOptions.voice = indianVoice.identifier;
          speechOptions.language = indianVoice.language;
        }
      } catch (error) {
        console.warn("Error getting voices:", error);
      }
    }

    Speech.speak(textToSpeak, speechOptions);
  };

  const verse = todaysVerse || {
    chapter: 4,
    verse: 7,
    sanskrit:
      "यदा यदा हि धर्मस्य ग्लानिर्भवति भारत।\nअभ्युत्थानमधर्मस्य तदात्मानं सृजाम्यहम्॥",
    transliteration:
      "yadā yadā hi dharmasya glānirbhavati bhārata |\nabhyutthānam adharmasya tadātmānaṃ sṛjāmy aham ||",
    translation:
      "Whenever and wherever there is a decline in religious practice, O descendant of Bharata, and a predominant rise of irreligion—at that time I descend Myself.",
    purport:
      "The Supreme Lord appears in this world to reestablish dharma (righteousness) and protect the devotees. This verse assures us that divine intervention comes whenever darkness threatens to overcome light.",
  };

  const sanskritVerse = verse.sanskrit;
  const transliteration = verse.transliteration;
  const englishMeaning = verse.translation;
  const significance =
    verse.purport ||
    "This famous verse explains the purpose of divine incarnation - to restore dharma when it declines.";

  const chapterEnglishName = selectedChapter?.englishName || "";

  const styles = getStyles(colors);
  const mStyles = getModalStyles(colors, isDark);

  if (loading && !todaysVerse) {
    return (
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: colors.background }]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <ThemedText
            style={[styles.loadingText, { color: colors.mutedForeground }]}
          >
            Loading reading progress...
          </ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  const chaptersToDisplay = liveChapters.length > 0
    ? liveChapters.map((lc) => {
      const progress = chapterProgress.find((cp) => cp.chapter === lc.chapter || cp.id === lc.chapter);
      return { ...lc, completedVerses: progress?.completedVerses || 0, isCompleted: progress?.isCompleted || false };
    })
    : chapterProgress.length > 0
      ? chapterProgress
      : bhagavadGitaChapters.map((ch) => ({
        chapter: ch.id, id: ch.id, title: ch.englishName, englishName: ch.englishName,
        totalVerses: ch.verseCount, verseCount: ch.verseCount, completedVerses: 0, isCompleted: false,
      }));

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Feather
              name="arrow-left"
              size={24}
              color={colors.mutedForeground}
            />
            <ThemedText
              type="link"
              style={{
                paddingHorizontal: 10,
                color: colors.mutedForeground,
              }}
            >
              Back
            </ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.headerTitleContainer}>
          <View
            style={[
              styles.headerIconBg,
              { backgroundColor: colors.lightBlueBg },
            ]}
          >
            <Ionicons name="book-outline" size={32} color={colors.primary} />
          </View>
          <ThemedText
            type="heading"
            style={[styles.headerTitle, { color: colors.foreground }]}
          >
            Daily Reading
          </ThemedText>
          <ThemedText
            style={[styles.headerSubtitle, { color: colors.mutedForeground }]}
          >
            Bhagavad Gita study
          </ThemedText>
        </View>
        <View style={styles.placeholderRight} />

        <Animated.View
          entering={FadeInDown.duration(600).delay(200)}
          style={[styles.progressCard, { backgroundColor: colors.card }]}
        >
          <View style={styles.progressHeader}>
            <ThemedText
              type="subtitle"
              style={[styles.progressTitle, { color: colors.foreground }]}
            >
              Study Progress
            </ThemedText>
            <ThemedText
              style={[
                styles.progressCounter,
                { color: colors.mutedForeground },
              ]}
            >
              {stats.chaptersCompleted}/{totalChapters} chapters
            </ThemedText>
          </View>

          <View
            style={[
              styles.progressBarContainer,
              { backgroundColor: colors.muted },
            ]}
          >
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${studyProgress * 100}%`,
                  backgroundColor: colors.secondary,
                },
              ]}
            />
          </View>

          <View style={styles.progressStats}>
            <View style={styles.statItem}>
              <ThemedText
                type="heading"
                style={[styles.statValue, { color: colors.foreground }]}
              >
                {stats.chaptersCompleted}
              </ThemedText>
              <ThemedText
                style={[styles.statLabel, { color: colors.mutedForeground }]}
              >
                Completed
              </ThemedText>
            </View>
            <View
              style={[styles.statDivider, { backgroundColor: colors.border }]}
            />
            <View style={styles.statItem}>
              <ThemedText
                type="heading"
                style={[styles.statValue, { color: colors.foreground }]}
              >
                {stats.currentStreak}
              </ThemedText>
              <ThemedText
                style={[styles.statLabel, { color: colors.mutedForeground }]}
              >
                Days streak
              </ThemedText>
            </View>
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.duration(600).delay(400)}
          style={[styles.verseCard, { backgroundColor: colors.card }]}
        >
          <View style={styles.verseHeader}>
            <Feather name="book-open" size={20} color={colors.foreground} />
            <ThemedText
              type="subtitle"
              style={[styles.verseTitle, { color: colors.foreground }]}
            >
              Today's Verse
            </ThemedText>
            <TouchableOpacity
              style={{ marginLeft: 'auto' }}
              onPress={() => speakVerse(verse)}
            >
              <Ionicons name="volume-medium-outline" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <ThemedText
            style={[styles.verseChapter, { color: colors.mutedForeground }]}
          >
            Chapter {verse.chapter}, Verse {verse.verse}
          </ThemedText>

          <View
            style={[
              styles.verseContent,
              { backgroundColor: colors.lightBlueBg },
            ]}
          >
            <ThemedText
              type="devanagari"
              style={[styles.sanskritText, { color: colors.foreground }]}
            >
              {sanskritVerse}
            </ThemedText>
            <ThemedText
              style={[styles.transliterationText, { color: colors.primary }]}
            >
              {transliteration}
            </ThemedText>
          </View>

          <ThemedText
            style={[styles.englishMeaningText, { color: colors.foreground }]}
          >
            {englishMeaning}
          </ThemedText>

          <ThemedText
            style={[styles.significanceText, { color: colors.mutedForeground }]}
          >
            <ThemedText type="defaultSemiBold">Significance:</ThemedText>
            {significance.replace("Significance: ", "")}
          </ThemedText>

          <TouchableOpacity
            style={[
              styles.markAsReadButton,
              { backgroundColor: colors.primary },
            ]}
            onPress={handleMarkAsRead}
            disabled={loading}
          >
            <ThemedText
              type="defaultSemiBold"
              style={styles.markAsReadButtonText}
            >
              Mark as Read
            </ThemedText>
          </TouchableOpacity>
        </Animated.View>

        <View
          style={[
            styles.chapterSection,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <ThemedText
            type="subtitle"
            style={[styles.chapterSectionTitle, { color: colors.foreground }]}
          >
            Bhagavad Gita Chapters
          </ThemedText>

          {chaptersToDisplay.map((chapter) => (
            <ChapterListItem
              key={chapter.chapter || chapter.id}
              chapterNumber={chapter.chapter || chapter.id}
              title={chapter.title || chapter.englishName}
              verseCount={chapter.totalVerses || chapter.verseCount}
              progress={chapter.completedVerses || 0}
              onPress={() => handleOpenChapter(chapter)}
              colors={colors}
            />
          ))}
        </View>

        <View style={styles.footerMetricsContainer}>
          <View
            style={[styles.footerMetricCard, { backgroundColor: colors.card }]}
          >
            <MaterialCommunityIcons
              name="clock-outline"
              size={32}
              color={colors.secondary}
            />
            <ThemedText
              type="heading"
              style={[styles.footerMetricValue, { color: colors.foreground }]}
            >
              {stats.averageReadingTime}
            </ThemedText>
            <ThemedText
              style={[
                styles.footerMetricLabel,
                { color: colors.mutedForeground },
              ]}
            >
              Avg minutes
            </ThemedText>
          </View>
          <View
            style={[styles.footerMetricCard, { backgroundColor: colors.card }]}
          >
            <Ionicons name="book-outline" size={32} color={colors.primary} />
            <ThemedText
              type="heading"
              style={[styles.footerMetricValue, { color: colors.foreground }]}
            >
              {stats.totalVersesRead}
            </ThemedText>
            <ThemedText
              style={[
                styles.footerMetricLabel,
                { color: colors.mutedForeground },
              ]}
            >
              Verses read
            </ThemedText>
          </View>
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={handleCloseModal}
      >
        <SafeAreaView
          style={[mStyles.container, { backgroundColor: colors.background }]}
        >
          <View style={[mStyles.fixedHeader, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={handleCloseModal} style={mStyles.headerIconButton}>
              <Feather name="arrow-left" size={24} color={colors.foreground} />
            </TouchableOpacity>

            <View style={mStyles.headerTitleArea}>
              <ThemedText style={[mStyles.headerChapterText, { color: colors.foreground }]}>
                Chapter {selectedChapter?.id || selectedChapter?.chapter}
              </ThemedText>
              <ThemedText style={[mStyles.headerTitleText, { color: colors.mutedForeground }]}>
                {getVerseTheme(selectedChapter?.id || selectedChapter?.chapter, isDark).title}
              </ThemedText>
            </View>

            <TouchableOpacity onPress={handleShare} style={mStyles.headerIconButton}>
              <Feather name="share-2" size={22} color={colors.foreground} />
            </TouchableOpacity>
          </View>

          <View style={mStyles.progressWrapper}>
            <View style={mStyles.progressInfo}>
              <ThemedText style={[mStyles.progressText, { color: colors.mutedForeground }]}>
                Verse {currentVerseIndex + 1} of {totalVerseCount}
              </ThemedText>
              <ThemedText style={[mStyles.progressText, { color: colors.mutedForeground }]}>
                {Math.round(((currentVerseIndex + 1) / totalVerseCount) * 100)}%
              </ThemedText>
            </View>
            <View style={[mStyles.progressBarBase, { backgroundColor: colors.muted }]}>
              <View
                style={[
                  mStyles.progressBarFill,
                  {
                    width: `${((currentVerseIndex + 1) / totalVerseCount) * 100}%`,
                    backgroundColor: colors.primary
                  }
                ]}
              />
            </View>
          </View>

          <View style={{ flex: 1 }}>
            {modalLoading ? (
              <View style={mStyles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <ThemedText style={[mStyles.loadingText, { color: colors.mutedForeground }]}>
                  Loading verses...
                </ThemedText>
              </View>
            ) : chapterVerses.length > 0 ? (
              <Reanimated.FlatList
                ref={flatListRef}
                data={chapterVerses}
                keyExtractor={(item, index) => `${item.chapter}-${item.verse}-${index}`}
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                pagingEnabled
                showsVerticalScrollIndicator={false}
                snapToInterval={cardHeight}
                snapToAlignment="start"
                decelerationRate="fast"
                onMomentumScrollEnd={handleScroll}
                getItemLayout={(data, index) => ({
                  length: cardHeight,
                  offset: cardHeight * index,
                  index,
                })}
                renderItem={({ item: verseItem, index }) => (
                  <VerseCardWrapper
                    verseItem={verseItem}
                    index={index}
                    scrollY={scrollY}
                    cardHeight={cardHeight}
                    onPress={() => setDetailModalVisible(true)}
                    speakVerse={speakVerse}
                    selectedChapter={selectedChapter}
                    isDark={isDark}
                    colors={colors}
                  />
                )}
              />
            ) : (
              <View style={mStyles.noDataContainer}>
                <Ionicons name="book-outline" size={48} color={colors.mutedForeground} style={{ opacity: 0.5 }} />
                <ThemedText style={{ color: colors.mutedForeground, marginTop: 10 }}>No verse data available</ThemedText>
              </View>
            )}
          </View>

          <View style={mStyles.floatingNavContainer}>
            <TouchableOpacity
              style={[mStyles.floatingNavButton, { backgroundColor: colors.card }]}
              onPress={handlePreviousVerseScroll}
              disabled={currentVerseIndex === 0}
            >
              <Feather name="chevron-up" size={24} color={currentVerseIndex === 0 ? colors.muted : colors.foreground} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[mStyles.floatingNavButton, { backgroundColor: colors.card }]}
              onPress={handleNextVerseScroll}
              disabled={currentVerseIndex >= chapterVerses.length - 1}
            >
              <Feather name="chevron-down" size={24} color={currentVerseIndex >= chapterVerses.length - 1 ? colors.muted : colors.foreground} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        <Modal
          animationType="slide"
          visible={detailModalVisible}
          onRequestClose={() => setDetailModalVisible(false)}
        >
          <SafeAreaView style={[mStyles.detailContainer, { backgroundColor: colors.background }]}>
            <View style={[mStyles.detailHeader, { borderBottomColor: colors.border }]}>
              <View style={mStyles.detailHeaderLeft}>
                <View style={[mStyles.detailIconBox, { backgroundColor: colors.primary + '20' }]}>
                  <Ionicons name="book-outline" size={22} color={colors.primary} />
                </View>
                <View>
                  <ThemedText style={mStyles.detailTitle}>Verse {currentModalVerse?.chapter}.{currentModalVerse?.verse}</ThemedText>
                  <ThemedText style={[mStyles.detailSubtitle, { color: colors.mutedForeground }]}>Chapter {currentModalVerse?.chapter} of Bhagavad Gita</ThemedText>
                </View>
              </View>
              <TouchableOpacity onPress={() => setDetailModalVisible(false)} style={mStyles.detailCloseButton}>
                <Ionicons name="close" size={26} color={colors.foreground} />
              </TouchableOpacity>
            </View>

            <ScrollView style={mStyles.detailScroll} contentContainerStyle={mStyles.detailScrollContent}>
              <View style={mStyles.detailSection}>
                <View style={mStyles.sectionHeader}>
                  <ThemedText style={mStyles.sectionTitle}>
                    <Ionicons name="sparkles-outline" size={16} color={colors.primary} /> Sanskrit
                  </ThemedText>
                  <TouchableOpacity onPress={() => handleCopySanskrit(currentModalVerse?.sanskrit || currentModalVerse?.text)}>
                    <ThemedText style={[mStyles.copyButtonText, { color: colors.primary }]}>
                      <Feather name="copy" size={14} /> Copy
                    </ThemedText>
                  </TouchableOpacity>
                </View>
                <View style={[mStyles.sanskritBox, { backgroundColor: colors.primary + '05', borderColor: colors.primary + '15' }]}>
                  <ThemedText type="devanagari" style={[mStyles.sanskritTextLarge, { color: colors.primary }]}>
                    {currentModalVerse?.sanskrit || currentModalVerse?.text || currentModalVerse?.slok}
                  </ThemedText>
                </View>
              </View>

              <View style={mStyles.detailSection}>
                <ThemedText style={mStyles.sectionHeaderSimple}>Transliteration</ThemedText>
                <View style={[mStyles.mutedBox, { backgroundColor: colors.muted + '50' }]}>
                  <ThemedText style={[mStyles.transliterationTextDetail, { color: colors.mutedForeground }]}>
                    {currentModalVerse?.transliteration}
                  </ThemedText>
                </View>
              </View>

              <View style={mStyles.detailSection}>
                <ThemedText style={mStyles.sectionHeaderSimple}>
                  <Ionicons name="chatbubble-outline" size={16} color={colors.secondary} /> Translation
                </ThemedText>
                <View style={[mStyles.accentBox, { backgroundColor: colors.secondary + '05', borderColor: colors.secondary + '15' }]}>
                  <ThemedText style={[mStyles.translationTextDetail, { color: colors.foreground }]}>
                    {currentModalVerse?.translation || currentModalVerse?.meaning}
                  </ThemedText>
                </View>
              </View>

              <View style={mStyles.detailSectionLast}>
                <ThemedText style={mStyles.sectionHeaderSimple}>
                  <Ionicons name="library-outline" size={16} color={colors.primary} /> Significance & Commentary
                </ThemedText>
                <View style={[mStyles.commentaryBox, { backgroundColor: colors.primary + '03', borderColor: colors.primary + '10' }]}>
                  <ThemedText style={[mStyles.commentaryTextDetail, { color: colors.mutedForeground }]}>
                    {currentModalVerse?.significance || currentModalVerse?.commentary || currentModalVerse?.purport || "Full commentary for this verse will be available soon."}
                  </ThemedText>
                </View>
              </View>

              <View style={mStyles.detailActions}>
                <TouchableOpacity
                  style={[mStyles.detailMainButton, { backgroundColor: colors.primary }]}
                  onPress={handleShare}
                >
                  <Feather name="share-2" size={18} color="#FFF" />
                  <ThemedText style={mStyles.detailMainButtonText}>Share Verse</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[mStyles.detailSecondaryButton, { borderColor: colors.primary }]}
                  onPress={() => setDetailModalVisible(false)}
                >
                  <ThemedText style={[mStyles.detailSecondaryButtonText, { color: colors.primary }]}>Continue Reading</ThemedText>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </SafeAreaView>
        </Modal>
      </Modal>
    </SafeAreaView>
  );
};

const VerseCardWrapper = ({
  verseItem,
  index,
  scrollY,
  cardHeight,
  onPress,
  speakVerse,
  selectedChapter,
  isDark,
  colors
}) => {
  // One-time mount fade — separate from scroll-driven opacity to avoid blink conflicts
  const mountOpacity = useSharedValue(0);

  useEffect(() => {
    // Small stagger delay so cards don't all flash in at once
    const delay = index * 60;
    const timer = setTimeout(() => {
      mountOpacity.value = withTiming(1, {
        duration: 350,
        easing: Easing.out(Easing.quad),
      });
    }, delay);
    return () => clearTimeout(timer);
    
  }, []);

  const mountStyle = useAnimatedStyle(() => ({
    opacity: mountOpacity.value,
  }));

  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * cardHeight,
      index * cardHeight,
      (index + 1) * cardHeight
    ];

    const scale = interpolate(
      scrollY.value,
      inputRange,
      [0.88, 1, 0.88],
      Extrapolation.CLAMP
    );

    const rotateX = interpolate(
      scrollY.value,
      inputRange,
      [12, 0, -12],
      Extrapolation.CLAMP
    );

    const translateY = interpolate(
      scrollY.value,
      inputRange,
      [cardHeight * 0.05, 0, -cardHeight * 0.05],
      Extrapolation.CLAMP
    );

    return {
      transform: [
        { perspective: 1200 },
        { scale },
        { rotateX: `${rotateX}deg` },
        { translateY },
      ],
      
    };
  });

  const mStyles = getModalStyles(colors, isDark);

  return (
    <Reanimated.View
      style={[{ height: cardHeight, paddingVertical: 12, paddingHorizontal: 16 }, animatedStyle, mountStyle]}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={onPress}
        style={[mStyles.verseCardContainer, { flex: 1 }]}
      >
        <LinearGradient
          colors={getVerseTheme(selectedChapter?.id || selectedChapter?.chapter, isDark).bg}
          style={[
            mStyles.themedCard,
            {
              flex: 1,
              minHeight: 0,
              borderWidth: isDark ? 1.5 : 0,
              borderColor: isDark
                ? getVerseTheme(selectedChapter?.id || selectedChapter?.chapter, isDark).accent + '30'
                : 'transparent'
            }
          ]}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: 12, flexGrow: 1, justifyContent: 'center' }}
            nestedScrollEnabled={true}
          >
            <View style={[mStyles.cardHeader, { marginBottom: 8 }]}>
              <View style={mStyles.badgeRow}>
                <View style={mStyles.verseBadge}>
                  <ThemedText style={[mStyles.verseBadgeText, { color: getVerseTheme(selectedChapter?.id || selectedChapter?.chapter, isDark).accent }]}>
                    Verse {(verseItem.chapter || selectedChapter?.id || selectedChapter?.chapter)}.{verseItem.verse}
                  </ThemedText>
                </View>
                <View style={[
                  mStyles.readStatusBadge,
                  { backgroundColor: isDark ? 'rgba(34, 197, 94, 0.15)' : 'rgba(220, 252, 231, 0.8)' }
                ]}>
                  <AntDesign name="check" size={12} color={isDark ? "#4ade80" : "#16a34a"} />
                  <ThemedText style={[mStyles.readStatusText, { color: isDark ? "#4ade80" : "#16a34a" }]}>Read</ThemedText>
                </View>
              </View>

              <TouchableOpacity
                style={mStyles.audioButton}
                activeOpacity={0.7}
                onPress={() => speakVerse(verseItem)}
              >
                <Ionicons name="volume-medium-outline" size={24} color={getVerseTheme(selectedChapter?.id || selectedChapter?.chapter, isDark).accent} />
              </TouchableOpacity>
            </View>

            <View style={mStyles.verseTextArea}>
              <ThemedText type="devanagari" style={[mStyles.sanskritMain, { color: getVerseTheme(selectedChapter?.id || selectedChapter?.chapter, isDark).accent }]}>
                {verseItem.sanskrit || verseItem.text || verseItem.slok}
              </ThemedText>
              <ThemedText style={[mStyles.transliterationMain, { color: colors.foreground }]}>
                {verseItem.transliteration}
              </ThemedText>
            </View>

            <View style={mStyles.translationArea}>
              <ThemedText style={mStyles.sectionLabel}>TRANSLATION</ThemedText>
              <ThemedText style={[mStyles.translationMainText, { color: colors.foreground }]}>
                {verseItem.translation || verseItem.meaning}
              </ThemedText>
            </View>

            <View style={[mStyles.hintArea, { marginTop: 8 }]}>
              <ThemedText style={[mStyles.hintText, { color: colors.mutedForeground }]}>
                Tap for full commentary • Swipe for next reel
              </ThemedText>
            </View>
          </ScrollView>
        </LinearGradient>
      </TouchableOpacity>
    </Reanimated.View>
  );
};

const CARD_BASE_STYLE = {
  borderRadius: 12,
  marginHorizontal: 16,
  marginBottom: 16,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.1,
  shadowRadius: 2,
  elevation: 2,
};

const getStyles = (colors) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
    },
    scrollViewContent: {
      paddingBottom: 20,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingTop: Platform.OS === "android" ? 10 : 0,
    },
    backButton: {
      padding: 8,
      flexDirection: "row",
      alignItems: "center",
    },
    headerTitleContainer: {
      flex: 1,
      alignItems: "center",
      marginVertical: "5%",
    },
    headerIconBg: {
      width: 60,
      height: 60,
      borderRadius: 15,
      justifyContent: "center",
      alignItems: "center",
    },
    headerTitle: {
      fontSize: 22,
      fontWeight: "bold",
      marginBottom: 4,
    },
    headerSubtitle: {
      fontSize: 14,
      textAlign: "center",
    },
    placeholderRight: {
      width: 40,
    },
    progressCard: {
      ...CARD_BASE_STYLE,
      padding: 16,
    },
    progressHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    progressTitle: {
      fontSize: 18,
      fontWeight: "bold",
    },
    progressCounter: {
      fontSize: 14,
    },
    progressBarContainer: {
      height: 8,
      borderRadius: 4,
      overflow: "hidden",
      marginBottom: 16,
    },
    progressBarFill: {
      height: "100%",
      borderRadius: 4,
    },
    progressStats: {
      flexDirection: "row",
      justifyContent: "space-around",
      paddingTop: 10,
    },
    statItem: {
      alignItems: "center",
      flex: 1,
    },
    statValue: {
      fontSize: 24,
      fontWeight: "bold",
    },
    statLabel: {
      fontSize: 14,
    },
    statDivider: {
      width: 1,
      height: "80%",
      alignSelf: "center",
    },
    verseCard: {
      ...CARD_BASE_STYLE,
      paddingHorizontal: 16,
      paddingVertical: 20,
    },
    verseHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },
    verseTitle: {
      fontSize: 18,
      fontWeight: "bold",
      marginLeft: 8,
    },
    verseChapter: {
      fontSize: 14,
      marginBottom: 16,
      marginLeft: 4,
    },
    verseContent: {
      alignItems: "flex-start",
      marginBottom: 16,
      borderRadius: 10,
      padding: "5%",
    },
    sanskritText: {
      fontSize: 20,
      lineHeight: 30,
      fontWeight: "600",
      fontFamily: Platform.OS === "android" ? "sans-serif" : "Arial",
    },
    transliterationText: {
      fontSize: 12,
      lineHeight: 18,
      fontStyle: "italic",
      marginTop: 4,
    },
    englishMeaningText: {
      fontSize: 16,
      lineHeight: 24,
      marginBottom: 16,
      fontWeight: "500",
    },
    significanceText: {
      fontSize: 14,
      lineHeight: 20,
      marginBottom: 20,
    },
    markAsReadButton: {
      borderRadius: 8,
      paddingVertical: 14,
      alignItems: "center",
    },
    markAsReadButtonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "bold",
    },
    chapterSection: {
      marginHorizontal: 16,
      borderRadius: 10,
      borderWidth: 0.5,
      marginBottom: 20,
    },
    chapterSectionTitle: {
      fontSize: 20,
      fontWeight: "bold",
      margin: 10,
    },
    footerMetricsContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginHorizontal: 16,
      marginTop: 10,
    },
    footerMetricCard: {
      ...CARD_BASE_STYLE,
      flex: 1,
      marginHorizontal: 5,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 20,
    },
    footerMetricValue: {
      fontSize: 28,
      fontWeight: "bold",
      marginTop: 8,
    },
    footerMetricLabel: {
      fontSize: 14,
      textAlign: "center",
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    loadingText: {
      marginTop: 10,
      fontSize: 16,
    },
  });

const chapterStyles = StyleSheet.create({
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginVertical: 6,
    marginHorizontal: 16,
  },
  numberContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  numberText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  textContainer: {
    flex: 1,
    marginRight: 10,
  },
  titleText: {
    fontSize: 16,
    fontWeight: "500",
  },
  progressText: {
    fontSize: 12,
    marginTop: 2,
  },
  continueButton: {
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderWidth: 0.5,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "bold",
  },
});

const getModalStyles = (colors, isDark = false) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    fixedHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
    },
    headerIconButton: {
      padding: 8,
    },
    headerTitleArea: {
      alignItems: "center",
      flex: 1,
    },
    headerChapterText: {
      fontSize: 16,
      fontWeight: "700",
    },
    headerTitleText: {
      fontSize: 12,
      fontWeight: "500",
    },
    progressWrapper: {
      paddingHorizontal: 16,
      paddingVertical: 10,
    },
    progressInfo: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 6,
    },
    progressText: {
      fontSize: 12,
      fontWeight: "500",
    },
    progressBarBase: {
      height: 4,
      borderRadius: 2,
      overflow: "hidden",
    },
    progressBarFill: {
      height: "100%",
      borderRadius: 2,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 40,
    },
    verseCardContainer: {
      padding: 10,
      paddingTop: 8,
    },
    themedCard: {
      borderRadius: 24,
      padding: 0,
      minHeight: 400,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 10,
      elevation: 5,
    },
    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    badgeRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    verseBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      backgroundColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.6)",
      borderRadius: 20,
    },
    verseBadgeText: {
      fontSize: 14,
      fontWeight: "700",
    },
    readStatusBadge: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 20,
      gap: 4,
    },
    readStatusText: {
      fontSize: 12,
      color: "#16a34a",
      fontWeight: "600",
    },
    audioButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.6)",
      justifyContent: "center",
      alignItems: "center",
    },
    verseTextArea: {
      backgroundColor: isDark ? "rgba(0, 0, 0, 0.4)" : "rgba(255, 255, 255, 0.5)",
      borderRadius: 16,
      padding: 20,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: isDark ? "rgba(255, 255, 255, 0.15)" : "rgba(255, 255, 255, 0.3)",
    },
    sanskritMain: {
      fontSize: 22,
      textAlign: "center",
      lineHeight: 34,
      fontWeight: "600",
      marginBottom: 8,
    },
    transliterationMain: {
      fontSize: 15,
      textAlign: "center",
      lineHeight: 22,
      fontWeight: "500",
      opacity: 0.8,
    },
    translationArea: {
      gap: 4,
    },
    sectionLabel: {
      fontSize: 11,
      fontWeight: "700",
      letterSpacing: 1,
      opacity: 0.6,
    },
    translationMainText: {
      fontSize: 15,
      lineHeight: 24,
      fontWeight: "500",
    },
    hintArea: {
      marginTop: 16,
      alignItems: "center",
    },
    hintText: {
      fontSize: 13,
      fontWeight: "500",
    },
    floatingNavContainer: {
      position: "absolute",
      right: 16,
      bottom: 24,
      gap: 12,
    },
    floatingNavButton: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4,
    },
    noDataContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 100,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 100,
    },
    loadingText: {
      marginTop: 15,
      fontSize: 16,
    },
    gestureWrapper: {
      flex: 1,
    },
    detailContainer: {
      flex: 1,
    },
    detailHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
    },
    detailHeaderLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    detailIconBox: {
      width: 44,
      height: 44,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
    },
    detailTitle: {
      fontSize: 18,
      fontWeight: "700",
    },
    detailSubtitle: {
      fontSize: 13,
    },
    detailCloseButton: {
      padding: 4,
    },
    detailScroll: {
      flex: 1,
    },
    detailScrollContent: {
      padding: 20,
      paddingBottom: 40,
    },
    detailSection: {
      marginBottom: 30,
    },
    detailSectionLast: {
      marginBottom: 40,
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: "700",
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    copyButtonText: {
      fontSize: 13,
      fontWeight: "600",
    },
    sanskritBox: {
      borderRadius: 16,
      padding: 24,
      borderWidth: 1,
      alignItems: "center",
    },
    sanskritTextLarge: {
      fontSize: 24,
      textAlign: "center",
      lineHeight: 38,
      fontWeight: "600",
    },
    sectionHeaderSimple: {
      fontSize: 15,
      fontWeight: "700",
      marginBottom: 12,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    mutedBox: {
      borderRadius: 16,
      padding: 16,
    },
    transliterationTextDetail: {
      fontSize: 15,
      fontStyle: "italic",
      lineHeight: 22,
    },
    accentBox: {
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
    },
    translationTextDetail: {
      fontSize: 16,
      lineHeight: 26,
      fontWeight: "500",
    },
    commentaryBox: {
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
    },
    commentaryTextDetail: {
      fontSize: 15,
      lineHeight: 24,
    },
    detailActions: {
      flexDirection: "row",
      gap: 12,
      marginTop: 20,
    },
    detailMainButton: {
      flex: 2,
      height: 52,
      borderRadius: 14,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    detailMainButtonText: {
      color: "#FFF",
      fontSize: 16,
      fontWeight: "700",
    },
    detailSecondaryButton: {
      flex: 1,
      height: 52,
      borderRadius: 14,
      borderWidth: 1.5,
      alignItems: "center",
      justifyContent: "center",
    },
    detailSecondaryButtonText: {
      fontSize: 14,
      fontWeight: "700",
    },
  });

export default DailyReading;
