import { useEffect } from 'react';
import { Dimensions, Image, StyleSheet, Text, View } from 'react-native';
import Animated, {
    Easing,
    Extrapolation,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withTiming
} from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

const AnimatedSplashScreen = () => {
    const { colors } = useTheme();

    const logoOpacity = useSharedValue(0);
    const logoScale = useSharedValue(0.8);
    const textOpacity = useSharedValue(0);
    const textTranslateY = useSharedValue(20);
    const circle1Scale = useSharedValue(0.8);
    const circle2Scale = useSharedValue(0.7);

    useEffect(() => {
        
        logoOpacity.value = withTiming(1, {
            duration: 800,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        });

        logoScale.value = withTiming(1, {
            duration: 1000,
            easing: Easing.out(Easing.back(1.5)),
        });

        circle1Scale.value = withTiming(1, {
            duration: 1500,
            easing: Easing.out(Easing.quad),
        });

        circle2Scale.value = withTiming(1, {
            duration: 1800,
            easing: Easing.out(Easing.quad),
        });

        textOpacity.value = withDelay(
            400,
            withTiming(1, {
                duration: 800,
                easing: Easing.out(Easing.quad),
            })
        );

        textTranslateY.value = withDelay(
            400,
            withTiming(0, {
                duration: 800,
                easing: Easing.out(Easing.back(1)),
            })
        );
    }, []);

    const circle1AnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: circle1Scale.value }],
        opacity: interpolate(circle1Scale.value, [0.8, 1], [0, 1], Extrapolation.CLAMP),
    }));

    const circle2AnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: circle2Scale.value }],
        opacity: interpolate(circle2Scale.value, [0.7, 1], [0, 1], Extrapolation.CLAMP),
    }));

    const logoAnimatedStyle = useAnimatedStyle(() => {
        return {
            opacity: logoOpacity.value,
            transform: [{ scale: logoScale.value }],
        };
    });

    const textAnimatedStyle = useAnimatedStyle(() => {
        return {
            opacity: textOpacity.value,
            transform: [{ translateY: textTranslateY.value }],
        };
    });

    return (
        <View style={[styles.container, { backgroundColor: '#0a1929' }]}>
            <Animated.View style={[styles.content, logoAnimatedStyle]}>
                <View style={styles.logoContainer}>
                    <Image
                        source={require('../assets/images/icon.png')}
                        style={styles.logo}
                        resizeMode="cover"
                    />
                </View>
            </Animated.View>

            <Animated.View style={[styles.textContainer, textAnimatedStyle]}>
                <Text style={[styles.appName, { color: '#FFFFFF' }]}>Upāsanā</Text>
                <Text style={[styles.tagline, { color: 'rgba(255, 255, 255, 0.7)' }]}>Devotion in every moment</Text>
            </Animated.View>

            {}
            <View style={styles.decorationContainer} pointerEvents="none">
                <Animated.View style={[styles.circle, circle1AnimatedStyle, { borderColor: 'rgba(255, 255, 255, 0.05)', width: width * 0.8, height: width * 0.8 }]} />
                <Animated.View style={[styles.circle, circle2AnimatedStyle, { borderColor: 'rgba(255, 255, 255, 0.03)', width: width * 1.2, height: width * 1.2 }]} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
    },
    logoContainer: {
        width: 120,
        height: 120,
        borderRadius: 24,
        backgroundColor: '#FFFFFF',
        
        elevation: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden', 
    },
    logo: {
        width: '100%',
        height: '100%',
    },
    textContainer: {
        marginTop: 30,
        alignItems: 'center',
        zIndex: 2,
    },
    appName: {
        fontSize: 42,
        fontWeight: '700',
        letterSpacing: 2,
        fontFamily: 'Nunito-Bold',
    },
    tagline: {
        fontSize: 14,
        marginTop: 5,
        letterSpacing: 1,
        fontFamily: 'Inter-Regular',
    },
    decorationContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    circle: {
        position: 'absolute',
        borderWidth: 1,
        borderRadius: 999,
    }
});

export default AnimatedSplashScreen;
