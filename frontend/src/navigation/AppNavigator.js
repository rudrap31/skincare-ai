import React, { useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { ActivityIndicator, View } from 'react-native';

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
    const { user, hasCompletedOnboarding, loading } = useAuth();
    const [showSplash, setShowSplash] = useState(true);

    // Show splash screen initially
    if (showSplash) {
        return (
            <SplashScreen onFinish={() => setShowSplash(false)} />
        );
    }

    // Show loading if auth is still determining state
    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-black">
                <ActivityIndicator size="large" color="#8b23d2" />
            </View>
        );
    }

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {!user ? (
                // Not authenticated - show auth flow
                <>
                    <Stack.Screen name="AuthWelcome" component={AuthWelcomeScreen} />
                    <Stack.Screen 
                        name="Login" 
                        component={LoginScreen}
                        options={{
                            presentation: 'modal',
                            animation: 'slide_from_bottom'
                        }}
                    />
                    <Stack.Screen 
                        name="Signup" 
                        component={SignupScreen}
                        options={{
                            presentation: 'modal',
                            animation: 'slide_from_bottom'
                        }}
                    />
                </>
            ) : !hasCompletedOnboarding ? (
                // Authenticated but needs onboarding
                <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            ) : (
                // Authenticated and onboarded - show main app
                <>
                   <Stack.Screen name="Home" component={MainDashboard} />
                   <Stack.Screen name="Profile" component={ProfileScreen} />
                    {/* Modal screens that can be accessed from tabs */}
                    <Stack.Screen 
                        name="ImagePicker" 
                        component={CameraScanScreen}
                        options={{
                            presentation: 'modal',
                            animation: 'slide_from_bottom'
                        }}
                    />
                    <Stack.Screen 
                        name="BarcodePicker" 
                        component={ProductScanner}
                        options={{
                            presentation: 'modal',
                            animation: 'slide_from_bottom'
                        }}
                    />
                    <Stack.Screen 
                        name="ScanResults" 
                        component={ScanResultsScreen}
                        options={{
                            presentation: 'modal',
                            animation: 'slide_from_right'
                        }}
                    />
                    <Stack.Screen 
                        name="Charts" 
                        component={ChartsPage}
                        options={{
                            presentation: 'card',
                            animation: 'slide_from_right'
                        }}
                    />
                </>
            )}
        </Stack.Navigator>
    );
}