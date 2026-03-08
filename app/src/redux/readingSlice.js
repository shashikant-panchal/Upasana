import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as ReadingService from '../services/readingProgress';

export const fetchReadingData = createAsyncThunk(
    'reading/fetchData',
    async (userId, { rejectWithValue }) => {
        if (!userId) return rejectWithValue('No user ID provided');
        try {
            const progressData = await ReadingService.fetchReadingProgress(userId);
            const chapters = ReadingService.calculateChapterProgress(progressData);
            const stats = ReadingService.calculateReadingStats(progressData, chapters);

            return {
                progress: progressData,
                chapterProgress: chapters,
                stats: stats
            };
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const markVerseRead = createAsyncThunk(
    'reading/markVerseRead',
    async ({ userId, chapter, verse, duration }, { dispatch, rejectWithValue }) => {
        if (!userId) return rejectWithValue('No user ID provided');
        try {
            const result = await ReadingService.markVerseComplete(userId, chapter, verse, duration);

            dispatch(fetchReadingData(userId));

            return result;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const initialState = {
    progress: [],
    chapterProgress: [],
    stats: {
        totalVersesRead: 0,
        chaptersCompleted: 0,
        currentStreak: 0,
        averageReadingTime: 0,
        totalReadingTime: 0,
    },
    loading: false,
    error: null,
    lastUpdated: null,
};

const readingSlice = createSlice({
    name: 'reading',
    initialState,
    reducers: {
        clearReadingData: (state) => {
            return initialState;
        }
    },
    extraReducers: (builder) => {
        
        builder
            .addCase(fetchReadingData.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchReadingData.fulfilled, (state, action) => {
                state.loading = false;
                state.progress = action.payload.progress;
                state.chapterProgress = action.payload.chapterProgress;
                state.stats = action.payload.stats;
                state.lastUpdated = Date.now();
            })
            .addCase(fetchReadingData.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        builder
            .addCase(markVerseRead.pending, (state) => {
                
            })
            .addCase(markVerseRead.rejected, (state, action) => {
                state.error = action.payload;
            });
    },
});

export const { clearReadingData } = readingSlice.actions;

export const selectReadingStats = (state) => state.reading.stats;
export const selectChapterProgress = (state) => state.reading.chapterProgress;
export const selectReadingLoading = (state) => state.reading.loading;

export default readingSlice.reducer;
