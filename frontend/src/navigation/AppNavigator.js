import React, { useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthState, useUserData } from '../context/AuthContext';

// Import screens
import SplashScreen from '../screens/SplashScreen';
import AuthWelcomeScreen from '../screens/AuthWelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ScanResultsScreen from '../components/home/FaceResults';
import ChartsPage from '../components/home/ChartsPage';
import ProductScanner from '../components/home/ProductScanner';
import CameraScanScreen from '../components/home/ImagePicker';
import MainDashboard from '../components/home/MainDashboard';

const Stack = createNativeStackNavigator();
export default function AppNavigator() {
    const { user, hasCompletedOnboarding, loading } = useAuthState();
    const { dataLoading } = useUserData();
    const [splashFinished, setSplashFinished] = useState(false);

    const isAppReady = !loading && !dataLoading && splashFinished;

    if (!isAppReady) {
        return <SplashScreen onFinish={() => setSplashFinished(true)}/>;
    }

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {!user ? (
                <>
                    <Stack.Screen name="AuthWelcome" component={AuthWelcomeScreen} />
                    <Stack.Screen name="Login" component={LoginScreen} options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
                    <Stack.Screen name="Signup" component={SignupScreen} options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
                </>
            ) : !hasCompletedOnboarding ? (
                <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            ) : (
                <>
                    <Stack.Screen name="Home" component={MainDashboard} />
                    <Stack.Screen name="Profile" component={ProfileScreen} />
                    <Stack.Screen name="ImagePicker" component={CameraScanScreen} options={{ presentation: 'modal', animation: 'slide_from_bottom', gestureEnabled: false }} />
                    <Stack.Screen name="BarcodePicker" component={ProductScanner} options={{ presentation: 'modal', animation: 'slide_from_bottom', gestureEnabled: false }} />
                    <Stack.Screen name="ScanResults" component={ScanResultsScreen} options={{ presentation: 'modal', animation: 'slide_from_right' }} />
                    <Stack.Screen name="Charts" component={ChartsPage} options={{ presentation: 'card', animation: 'slide_from_right' }} />
                </>
            )}
        </Stack.Navigator>
    );
}
