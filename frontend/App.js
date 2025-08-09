import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { StatusBar } from 'expo-status-bar';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';
import { AuthProvider } from './src/context/AuthContext';
import './global.css';
import 'react-native-gesture-handler';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import ErrorBoundary from './src/components/ErrorBoundary';

const toastConfig = {
    /*
      Overwrite 'success' type,
      by modifying the existing `BaseToast` component
    */
    success: (props) => (
        <BaseToast
            {...props}
            style={{ borderLeftColor: 'green' }}
            text1Style={{
                fontSize: 12,
            }}
            text2Style={{
                color: '#374151',
            }}
            text1NumberOfLines={0}
            text2NumberOfLines={0}
        />
    ),
    /*
      Overwrite 'error' type,
      by modifying the existing `ErrorToast` component
    */
    error: (props) => (
        <ErrorToast
            {...props}
            style={{ borderLeftColor: 'red' }}
            text1Style={{
                fontSize: 12,
            }}
            text2Style={{
                color: '#374151',
            }}
            text1NumberOfLines={0}
            text2NumberOfLines={0}
        />
    ),
};

export default function App() {
    return (
        <NavigationContainer>
            <ErrorBoundary>
                <GestureHandlerRootView style={{ flex: 1 }}>
                    <AuthProvider>
                        <StatusBar style="light" />
                        <AppNavigator />
                        <Toast config={toastConfig} />
                    </AuthProvider>
                </GestureHandlerRootView>
            </ErrorBoundary>
        </NavigationContainer>
    );
}
