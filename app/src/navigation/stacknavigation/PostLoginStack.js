import { createStackNavigator } from "@react-navigation/stack";
import DailyWisdomScreen from "../../screens/onboarding/DailyWisdomScreen";
import BottomTab from "../bottomnavigation/BottomTab";

const Stack = createStackNavigator();

const PostLoginStack = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="DailyWisdom" component={DailyWisdomScreen} />
            {}
            <Stack.Screen name="MainApp" component={BottomTab} />
        </Stack.Navigator>
    );
};

export default PostLoginStack;
