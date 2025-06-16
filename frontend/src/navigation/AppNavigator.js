import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import LandingScreen from '../screens/LandingScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import HomeScreen from '../screens/HomeScreen';
import { ActivityIndicator, View } from 'react-native';
import ProfileScreen from '../screens/ProfileScreen';
import ScanResultsScreen from '../components/home/FaceResults';
import ImagePickerExample from '../components/home/ImagePicker';
import ChartsPage from '../components/home/ChartsPage';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
    const { user, hasCompletedOnboarding, onboardingStep, loading } = useAuth();

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#000" />
            </View>
        );
    }

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {/* Not signed in */}
            {!user ? (
                <>
                    <Stack.Screen name="Landing" component={LandingScreen} />
                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen name="Signup" component={SignupScreen} />
                </>
            ) : !hasCompletedOnboarding ? (
                <>
                    <Stack.Screen
                        name="Onboarding"
                        component={OnboardingScreen}
                    />
                </>
            ) : (
                <>
                    {/* Signed in and done onboarding */}
                    <Stack.Screen name="Home" component={HomeScreen} />
                    <Stack.Screen name="Profile" component={ProfileScreen} />
                    <Stack.Screen name="ImagePicker" component={ImagePickerExample} />
                    <Stack.Screen name="ScanResults" component={ScanResultsScreen} />
                    <Stack.Screen name="Charts" component={ChartsPage} />
                </>
            )}
        </Stack.Navigator>
    );
}
