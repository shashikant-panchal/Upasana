
export const LightTheme = {
    
    primary: '#052962',           
    primaryForeground: '#FFFFFF',

    secondary: '#FBC02D',         
    secondaryForeground: '#052962',

    accent: '#4071bf',            
    accentForeground: '#FFFFFF',

    background: '#F8F9FA',        
    foreground: '#052962',        

    card: '#FFFFFF',
    cardForeground: '#052962',

    muted: '#E6EAF5',
    mutedForeground: '#4071bf',

    border: '#CED9E3',
    input: '#CED9E3',

    destructive: '#EF4443',
    destructiveForeground: '#FFFFFF',

    grey: '#CED9E3',
    lightBlueBg: '#E9F0F8',

    gradientStart: 'rgb(233, 237, 241)',
    gradientEnd: '#F4F5F0',

    tabBarBackground: '#FAFBFA',
    tabBarBorder: '#CED9E4',
    tabActiveColor: '#16366B',
    tabInactiveColor: '#4071BF',
    tabActiveText: '#FFFFFF',
    tabInactiveText: '#4071BF',

    statusBarStyle: 'dark-content',
};

export const DarkTheme = {
    
    primary: '#5b9dff',           
    primaryForeground: '#FFFFFF',

    secondary: '#FBC02D',         
    secondaryForeground: '#0f1729',

    accent: '#5b9dff',            
    accentForeground: '#FFFFFF',

    background: '#0f1729',        
    foreground: '#E8F4FF',        

    card: '#132142',              
    cardForeground: '#E8F4FF',

    muted: '#1a2d52',
    mutedForeground: '#8ab4f8',

    border: '#2a4a7a',
    input: '#2a4a7a',

    destructive: '#f87171',
    destructiveForeground: '#FFFFFF',

    grey: '#3a5a8a',
    lightBlueBg: '#1a2d52',

    gradientStart: '#0f1729',
    gradientEnd: '#132142',

    tabBarBackground: '#0f1729',
    tabBarBorder: '#2a4a7a',
    tabActiveColor: '#5b9dff',
    tabInactiveColor: '#6b8ab8',
    tabActiveText: '#FFFFFF',
    tabInactiveText: '#8ab4f8',

    statusBarStyle: 'light-content',
};

export const DarkBlue = LightTheme.primary;
export const LightBlue = LightTheme.accent;
export const BackgroundGrey = LightTheme.muted;
export const AppYellow = LightTheme.secondary; 
export const GRADIENT_START = LightTheme.gradientStart;
export const GRADIENT_END = LightTheme.gradientEnd;
export const LIGHTBLUEBG = LightTheme.lightBlueBg;
export const Grey = LightTheme.grey;

export const getThemeColors = (isDark) => {
    return isDark ? DarkTheme : LightTheme;
};