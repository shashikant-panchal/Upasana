import { createContext, useContext, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { DarkTheme, LightTheme } from '../constants/Colors';
import Typography from '../constants/Typography';

const ThemeContext = createContext({
    colors: LightTheme,
    isDark: false,
    theme: 'light',
    typography: Typography,
});

export const ThemeProvider = ({ children }) => {
    const { resolvedTheme, theme, isLargeText } = useSelector((state) => state.theme);

    const value = useMemo(() => ({
        colors: resolvedTheme === 'dark' ? DarkTheme : LightTheme,
        isDark: resolvedTheme === 'dark',
        theme: theme,
        isLargeText: isLargeText,
        typography: Typography,
    }), [resolvedTheme, theme, isLargeText]);

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export default ThemeContext;
