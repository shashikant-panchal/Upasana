import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { dw } from '../../constants/Dimensions';
import { useTheme } from '../../context/ThemeContext';
import { generateStoryData } from '../../utils/storyUtils';
import { ThemedText } from '../ThemedText';
import StoryAvatar from './StoryAvatar';
import StoryViewer from './StoryViewer';

const VIEWED_STORIES_KEY = 'ekadashi-viewed-stories';

const StoryList = ({ refreshCount }) => {
    const { colors, isDark } = useTheme();
    const styles = getStyles(colors);
    const [stories, setStories] = useState([]);
    const [viewedStories, setViewedStories] = useState(new Set());
    const [selectedStory, setSelectedStory] = useState(null);

    useEffect(() => {
        const data = generateStoryData();
        setStories(data);
        loadViewedStories();
    }, [refreshCount]);

    const loadViewedStories = async () => {
        try {
            const stored = await AsyncStorage.getItem(VIEWED_STORIES_KEY);
            if (stored) {
                setViewedStories(new Set(JSON.parse(stored)));
            }
        } catch (e) {
            console.error('Failed to load viewed stories', e);
        }
    };

    const saveViewedStories = async (newViewed) => {
        try {
            await AsyncStorage.setItem(VIEWED_STORIES_KEY, JSON.stringify([...newViewed]));
        } catch (e) {
            console.error('Failed to save viewed stories', e);
        }
    };

    const handleStoryPress = (index) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        const story = stories[index];
        setSelectedStory({ index, ...story });

        if (!viewedStories.has(story.id)) {
            const newViewed = new Set([...viewedStories, story.id]);
            setViewedStories(newViewed);
            saveViewedStories(newViewed);
        }
    };

    const handleClose = () => {
        setSelectedStory(null);
    };

    if (stories.length === 0) return null;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <ThemedText type="small" style={styles.headerText}>
                    SACRED EVENTS IN 30 DAYS
                </ThemedText>
                <LinearGradient
                    colors={[isDark ? "#ffffff" : "#858e9eff", "transparent"]}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={styles.line}
                />
            </View>

            <FlatList
                data={stories}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                renderItem={({ item, index }) => (
                    <StoryAvatar
                        story={item}
                        isViewed={viewedStories.has(item.id)}
                        onPress={() => handleStoryPress(index)}
                    />
                )}
                contentContainerStyle={styles.listContent}
            />

            <StoryViewer
                stories={stories}
                initialIndex={selectedStory?.index ?? 0}
                visible={!!selectedStory}
                onClose={handleClose}
                onStoryViewed={(id) => {
                    if (!viewedStories.has(id)) {
                        const newViewed = new Set([...viewedStories, id]);
                        setViewedStories(newViewed);
                        saveViewedStories(newViewed);
                    }
                }}
            />
        </View>
    );
};

const getStyles = (colors) => StyleSheet.create({
    container: {
        paddingVertical: 12,
        marginHorizontal: 5,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        marginBottom: 12,
    },
    headerText: {
        fontSize: 14,
        color: colors.mutedForeground,
        letterSpacing: 1.5,
        marginRight: 8,
    },
    line: {
        flex: 1,
        maxWidth: dw * 0.4,
        height: 1.2,
    },
    listContent: {
        paddingHorizontal: 15,
    },
});

export default StoryList;
