import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "../../components/ThemedText";
import { useTheme } from "../../context/ThemeContext";
import SettingsScreen from "../../screens/SettingsScreen";
import CalendarStack from "../stacknavigation/CalendarStack";
import EkadashiStack from "../stacknavigation/EkadashiStack";
import HomeStack from "../stacknavigation/HomeStack";
import SadhanaStack from "../stacknavigation/SadhanaStack";

const Tab = createBottomTabNavigator();

const MAIN_SCREENS = [
  "HomeScreen",
  "CalendarScreen",
  "Ekadashi",
  "Settings",
  "Home",
  "Calendar",
  "Ekadashis",
  "Sadhana",
  "SadhanaMain",
];

const CustomTabBar = ({ state, descriptors, navigation }) => {
  const { colors, isDark } = useTheme();

  const focusedRoute = state.routes[state.index];
  const focusedRouteName =
    getFocusedRouteNameFromRoute(focusedRoute) || focusedRoute.name;

  if (!MAIN_SCREENS.includes(focusedRouteName)) {
    return null;
  }

  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === "android" ? insets.bottom : 0;
  const styles = getStyles(colors, isDark, bottomPadding);

  const ACTIVE_BORDER_WIDTH = 3;
  const ACTIVE_BORDER_RADIUS = 20;

  return (
    <View style={styles.tabBarWrapper}>
      <View style={styles.tabContainer}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel ?? options.title ?? route.name;
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const iconName = options.tabBarIconName;
          const iconColor = isFocused
            ? colors.tabActiveText
            : colors.tabInactiveText;
          const textColor = isFocused
            ? colors.tabActiveText
            : colors.tabInactiveText;

          const TabContent = () => (
            <>
              {options.tabBarIconType === "material" ? (
                <MaterialCommunityIcons name={iconName} size={24} color={iconColor} />
              ) : (
                <Feather name={iconName} size={24} color={iconColor} />
              )}
              <ThemedText style={[styles.tabLabel, { color: textColor }]} ignoreLargeText={true}>
                {String(label)}
              </ThemedText>
            </>
          );

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              style={styles.tabButton}
            >
              {isFocused ? (
                <View
                  style={[
                    styles.tabPillBorderWrapper,
                    {
                      minWidth: styles.tabPill.minWidth,
                      height: styles.tabPill.height,
                      borderRadius: ACTIVE_BORDER_RADIUS,
                      borderWidth: ACTIVE_BORDER_WIDTH,
                      borderColor: isDark ? colors.border : "#C2CAD5",
                    },
                  ]}
                >
                  <LinearGradient
                    colors={
                      isDark
                        ? [colors.primary, colors.accent]
                        : ["#34629E", "#16366B"]
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[
                      styles.tabPillGradient,
                      {
                        borderRadius:
                          ACTIVE_BORDER_RADIUS - ACTIVE_BORDER_WIDTH,
                      },
                    ]}
                  >
                    <TabContent />
                  </LinearGradient>
                </View>
              ) : (
                <View style={styles.tabPill}>
                  <TabContent />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const BottomTab = () => {

  const TAB_BAR_HEIGHT_WITHOUT_INSET = 76;

  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          paddingBottom: 0,
          height: TAB_BAR_HEIGHT_WITHOUT_INSET,
        },
        contentStyle: {
          marginBottom: TAB_BAR_HEIGHT_WITHOUT_INSET,
        }
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          tabBarLabel: "Home",
          tabBarIconName: "home",
        }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarStack}
        options={{
          tabBarLabel: "Calendar",
          tabBarIconName: "calendar",
        }}
      />
      <Tab.Screen
        name="Ekadashis"
        component={EkadashiStack}
        options={{
          tabBarLabel: "Ekadashis",
          tabBarIconName: "list",
        }}
      />
      <Tab.Screen
        name="Sadhana"
        component={SadhanaStack}
        options={{
          tabBarLabel: "Sādhanā",
          tabBarIconName: "fire",
          tabBarIconType: "material",
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: "Settings",
          tabBarIconName: "settings",
        }}
      />
    </Tab.Navigator>
  );
};

const getStyles = (colors, isDark, bottomInset) => {
  const styles = StyleSheet.create({
    screen: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.background,
    },
    screenText: {
      fontSize: 24,
      fontWeight: "bold",
    },
    tabBarWrapper: {
      backgroundColor: colors.tabBarBackground,
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,

      marginTop: 0,
      paddingTop: 0,

      borderTopWidth: 1,
      borderTopColor: colors.tabBarBorder,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 10,
      paddingBottom: bottomInset,
    },
    tabContainer: {
      flexDirection: "row",
      backgroundColor: "transparent",
      paddingHorizontal: 0,
      paddingBottom: 0,
      justifyContent: "space-around",
      alignItems: "center",
    },
    tabButton: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      height: 75,
    },
    tabPillBorderWrapper: {
      overflow: "hidden",
    },
    tabPill: {
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 4,
      paddingHorizontal: 6,
      minWidth: 70,
      height: 65,
    },
    tabPillGradient: {
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 4,
      paddingHorizontal: 6,
      minWidth: 70 - 3 * 2,
      height: 65 - 3 * 2,
    },
    tabLabel: {
      fontSize: 11,
      marginTop: 2,
      fontWeight: "600",
      textAlign: "center",
    },
  });
  return styles;
};

export default BottomTab;