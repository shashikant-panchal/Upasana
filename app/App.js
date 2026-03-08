import {
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import {
  NotoSansDevanagari_400Regular,
  NotoSansDevanagari_600SemiBold,
  NotoSansDevanagari_700Bold,
} from "@expo-google-fonts/noto-sans-devanagari";
import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
} from "@expo-google-fonts/nunito";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer } from "@react-navigation/native";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useCallback, useEffect, useState } from "react";
import { Appearance, Linking, StatusBar, StyleSheet } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { toastConfig } from "./src/components/CustomToastConfig";

import { Provider, useDispatch, useSelector } from "react-redux";
import AnimatedSplashScreen from "./src/components/AnimatedSplashScreen";
import { ThemeProvider, useTheme } from "./src/context/ThemeContext";
import "./src/i18n";
import BottomTab from "./src/navigation/bottomnavigation/BottomTab";
import PostLoginStack from "./src/navigation/stacknavigation/PostLoginStack";
import { store } from "./src/redux/store";
import { loadTheme, updateSystemTheme } from "./src/redux/themeSlice";
import { setRecoveryMode, setSession } from "./src/redux/userSlice";
import Login from "./src/screens/Login";
import ResetPassword from "./src/screens/ResetPassword";
import NotificationService from "./src/services/NotificationService";
import { supabase } from "./src/utils/supabase";

SplashScreen.preventAutoHideAsync();

function Root() {
  const { session, isPasswordRecovery } = useSelector((state) => state.user);
  const { loading: themeLoading } = useSelector((state) => state.theme);
  const { colors, isDark } = useTheme();
  const dispatch = useDispatch();
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  const [fontsLoaded] = useFonts({
    "Nunito-Regular": Nunito_400Regular,
    "Nunito-SemiBold": Nunito_600SemiBold,
    "Nunito-Bold": Nunito_700Bold,
    "Inter-Regular": Inter_400Regular,
    "Inter-SemiBold": Inter_600SemiBold,
    "Inter-Bold": Inter_700Bold,
    "NotoSansDevanagari-Regular": NotoSansDevanagari_400Regular,
    "NotoSansDevanagari-SemiBold": NotoSansDevanagari_600SemiBold,
    "NotoSansDevanagari-Bold": NotoSansDevanagari_700Bold,
  });

  useEffect(() => {
    dispatch(loadTheme());

    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      dispatch(updateSystemTheme());
    });

    return () => subscription?.remove();
  }, [dispatch]);

  const handleDeepLink = (url) => {
    if (!url) return;

    if (url.includes("access_token") && (url.includes("type=recovery") || url.includes("type=signup"))) {
      
      dispatch(setRecoveryMode(true));

      const fragment = url.split("#")[1];
      if (fragment) {
        const params = {};
        fragment.split("&").forEach(str => {
          const [key, value] = str.split("=");
          params[key] = value;
        });

        if (params.access_token && params.refresh_token) {
          supabase.auth.setSession({
            access_token: params.access_token,
            refresh_token: params.refresh_token,
          }).then(({ error }) => {
            if (error) {
              Toast.show({ type: 'error', text1: 'Session Error', text2: error.message });
            } else {
              
              dispatch(setRecoveryMode(true));
            }
          });
        }
      }
    }
  };

  useEffect(() => {
    
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink(url);
    });

    const subscription = Linking.addEventListener("url", ({ url }) => {
      handleDeepLink(url);
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      dispatch(setSession(session));
      setIsAuthChecked(true);
      if (session?.user?.id) {
        NotificationService.initialize(session.user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        dispatch(setRecoveryMode(true));
      }
      dispatch(setSession(session));
      if (session?.user?.id && (event === "SIGNED_IN" || event === "INITIAL_SESSION")) {
        NotificationService.initialize(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [dispatch]);

  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState(null);

  useEffect(() => {
    checkOnboardingStatus();
  }, [session]);

  const checkOnboardingStatus = async () => {
    if (session?.user?.id) {
      try {
        const value = await AsyncStorage.getItem(`onboarding_completed_${session.user.id}`);
        setIsOnboardingCompleted(value === 'true');
      } catch (error) {
        console.error("Error checking onboarding status:", error);
        setIsOnboardingCompleted(false);
      }
    } else {
      setIsOnboardingCompleted(false);
    }
  };

  const onLayoutRootView = useCallback(async () => {
    if (isAuthChecked && !themeLoading && fontsLoaded && (!session || isOnboardingCompleted !== null)) {
      
    }
  }, [isAuthChecked, themeLoading, fontsLoaded, session, isOnboardingCompleted]);

  const [isSplashReady, setIsSplashReady] = useState(false);
  const isLoading = !isAuthChecked || themeLoading || !fontsLoaded || (session && isOnboardingCompleted === null) || !isSplashReady;

  useEffect(() => {
    
    SplashScreen.hideAsync();

    setTimeout(() => {
      setIsSplashReady(true);
    }, 1500);
  }, []);

  if (isLoading) {
    return <AnimatedSplashScreen />;
  }

  return (
    <NavigationContainer onReady={onLayoutRootView}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />
      {isPasswordRecovery ? (
        <ResetPassword />
      ) : session ? (
        isOnboardingCompleted ? (
          <BottomTab />
        ) : (
          <PostLoginStack />
        )
      ) : (
        <Login />
      )}
    </NavigationContainer>
  );
}

import { GestureHandlerRootView } from "react-native-gesture-handler";

function AppContent() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <SafeAreaProvider>
          <Root />
          <Toast config={toastConfig} />
        </SafeAreaProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: '#0a1929', 
  },
  splashImage: {
    width: '100%',
    height: '100%',
  },
});
