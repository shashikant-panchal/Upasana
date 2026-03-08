import { createStackNavigator } from "@react-navigation/stack";
import CalendarDayDetails from "../../screens/CalendarDayDetails";
import CalendarMonth from "../../screens/CalendarMonth";
import EkadashiScreen from "../../screens/EkadashisScreen";

const EkadashiStack = () => {
    const Stack = createStackNavigator();
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }} >
            <Stack.Screen name="Ekadashi" component={EkadashiScreen} />
            <Stack.Screen name="CalendarMonth" component={CalendarMonth} />
            <Stack.Screen name="DayDetails" component={CalendarDayDetails} />
        </Stack.Navigator>
    );
};

export default EkadashiStack;