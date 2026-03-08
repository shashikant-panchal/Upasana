import { createStackNavigator } from "@react-navigation/stack";
import CalendarDayDetails from "../../screens/CalendarDayDetails";
import CalendarScreen from "../../screens/CalendarScreen";

const CalendarStack = () => {
    const Stack = createStackNavigator();
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }} >
            <Stack.Screen name="CalendarScreen" component={CalendarScreen} />
            <Stack.Screen name="DayDetails" component={CalendarDayDetails} />
        </Stack.Navigator>
    );
};

export default CalendarStack;