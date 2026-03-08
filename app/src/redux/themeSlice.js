import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { Appearance } from 'react-native';

const THEME_STORAGE_KEY = 'ekadashi-theme';
const TEXT_SIZE_STORAGE_KEY = 'ekadashi-large-text';

export const loadTheme = createAsyncThunk(
    'theme/loadTheme',
    async () => {
        try {
            const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
            const savedTextSize = await AsyncStorage.getItem(TEXT_SIZE_STORAGE_KEY);

            return {
                theme: savedTheme || 'system',
                isLargeText: savedTextSize || 'false'
            };
        } catch (error) {
            console.error('Error loading theme:', error);
            return { theme: 'system', isLargeText: 'false' };
        }
    }
);

export const saveTheme = createAsyncThunk(
    'theme/saveTheme',
    async (theme, { dispatch }) => {
        try {
            await AsyncStorage.setItem(THEME_STORAGE_KEY, theme);
            return theme;
        } catch (error) {
            console.error('Error saving theme:', error);
            throw error;
        }
    }
);

export const saveTextSize = createAsyncThunk(
    'theme/saveTextSize',
    async (isLarge, { dispatch }) => {
        try {
            await AsyncStorage.setItem(TEXT_SIZE_STORAGE_KEY, String(isLarge));
            return isLarge;
        } catch (error) {
            console.error('Error saving text size:', error);
            throw error;
        }
    }
);

const getResolvedTheme = (theme) => {
    if (theme === 'system') {
        const colorScheme = Appearance.getColorScheme();
        return colorScheme === 'dark' ? 'dark' : 'light';
    }
    return theme;
};

const themeSlice = createSlice({
    name: 'theme',
    initialState: {
        theme: 'light',
        resolvedTheme: 'light',
        isLargeText: false,
        loading: true,
    },
    reducers: {
        setTheme: (state, action) => {
            state.theme = action.payload;
            state.resolvedTheme = getResolvedTheme(action.payload);
        },
        toggleTheme: (state) => {
            const newTheme = state.resolvedTheme === 'light' ? 'dark' : 'light';
            state.theme = newTheme;
            state.resolvedTheme = newTheme;
        },
        toggleLargeText: (state) => {
            state.isLargeText = !state.isLargeText;
        },
        updateSystemTheme: (state) => {
            if (state.theme === 'system') {
                state.resolvedTheme = getResolvedTheme('system');
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loadTheme.pending, (state) => {
                state.loading = true;
            })
            .addCase(loadTheme.fulfilled, (state, action) => {
                state.theme = action.payload.theme;
                state.isLargeText = action.payload.isLargeText === 'true';
                state.resolvedTheme = getResolvedTheme(action.payload.theme);
                state.loading = false;
            })
            .addCase(loadTheme.rejected, (state) => {
                state.loading = false;
            })
            .addCase(saveTheme.fulfilled, (state, action) => {
                state.theme = action.payload;
                state.resolvedTheme = getResolvedTheme(action.payload);
            })
            .addCase(saveTextSize.fulfilled, (state, action) => {
                state.isLargeText = action.payload;
            });
    },
});

export const { setTheme, toggleTheme, updateSystemTheme, toggleLargeText } = themeSlice.actions;
export default themeSlice.reducer;
