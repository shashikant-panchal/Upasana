import { createNativeStackNavigator } from "@react-navigation/native-stack";
import BreathingScreen from "../../screens/BreathingScreen";
import CallKrishnaScreen from "../../screens/CallKrishnaScreen";
import ChallengeScreen from "../../screens/Challenge";
import DailyReading from "../../screens/DailyReading";
import DailyWisdom from "../../screens/DailyWisdom";
import LibraryScreen from "../../screens/LibraryScreen";
import MantraScreen from "../../screens/MantraScreen";
import MoodMantrasScreen from "../../screens/MoodMantrasScreen";
import MorningJapaScreen from "../../screens/MorningJapaScreen";
import MuhurtaScreen from "../../screens/MuhurtaScreen";
import ReleaseScreen from "../../screens/ReleaseScreen";
import SadhanaScreen from "../../screens/SadhanaScreen";
import SattvicFoodsScreen from "../../screens/SattvicFoodsScreen";

const Stack = createNativeStackNavigator();

const SadhanaStack = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="SadhanaMain" component={SadhanaScreen} />
            <Stack.Screen name="MorningJapa" component={MorningJapaScreen} />
            <Stack.Screen name="DailyWisdom" component={DailyWisdom} />
            <Stack.Screen name="Breathing" component={BreathingScreen} />
            <Stack.Screen name="Release" component={ReleaseScreen} />
            <Stack.Screen name="Mantra" component={MantraScreen} />
            <Stack.Screen name="Library" component={LibraryScreen} />
            <Stack.Screen name="Muhurta" component={MuhurtaScreen} />
            <Stack.Screen name="Challenge" component={ChallengeScreen} />
            <Stack.Screen name="MoodMantras" component={MoodMantrasScreen} />
            <Stack.Screen name="SattvicFoods" component={SattvicFoodsScreen} />
            <Stack.Screen name="CallKrishna" component={CallKrishnaScreen} />
            <Stack.Screen name="DailyReading" component={DailyReading} />

        </Stack.Navigator>
    );
};

export default SadhanaStack;
