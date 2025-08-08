import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { StatusBar } from 'expo-status-bar';
import Toast from 'react-native-toast-message';
import { AuthProvider } from './src/context/AuthContext';
import "./global.css"
import 'react-native-gesture-handler';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import ErrorBoundary from './src/components/ErrorBoundary';

export default function App() {
  return (
    <NavigationContainer>
        <ErrorBoundary>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <AuthProvider>
                    <StatusBar style="light" />
                    <AppNavigator />
                    <Toast />
                </AuthProvider>
            </GestureHandlerRootView>
        </ErrorBoundary>
    </NavigationContainer>
  );
}

