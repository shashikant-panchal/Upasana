import { createStackNavigator } from "@react-navigation/stack";
import Challenge from "../../screens/Challenge";
import ProfileScreen from "../../screens/ProfileScreen";

const ProfileStack = () => {
    const Stack = createStackNavigator();
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }} >
            <Stack.Screen name="ProfileMain" component={ProfileScreen} />
            <Stack.Screen name="Challenge" component={Challenge} />
        </Stack.Navigator>
    );
};

export default ProfileStack;