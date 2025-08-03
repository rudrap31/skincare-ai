import { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../context/AuthContext';
import Toast from 'react-native-toast-message';

const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigation = useNavigation();
    const { signIn } = useAuth();

    const handleLogin = async () => {
        if (!email.trim()) {
            Toast.show({
                type: 'error',
                position: 'top',
                text1: 'Email Required',
                text2: 'Please enter your email address',
                visibilityTime: 2000,
            });
            return;
        }

        if (!password.trim()) {
            Toast.show({
                type: 'error',
                position: 'top',
                text1: 'Password Required',
                text2: 'Please enter your password',
                visibilityTime: 2000,
            });
            return;
        }

        setIsLoading(true);
        try {
            const { error } = await signIn({ email: email.trim(), password });
            
            if (error) throw error;
            
            // Success - navigation will be handled by AppNavigator
        } catch (error) {
            Toast.show({
                type: 'error',
                position: 'top',
                text1: 'Sign In Failed',
                text2: error.message || 'Invalid email or password',
                visibilityTime: 3000,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-black">
            {/* Gradient Background */}

            <KeyboardAvoidingView 
                className="flex-1" 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                {/* Header */}
                <View className="pt-14 px-6 flex-row items-center">
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        className="w-10 h-10 rounded-full bg-white/10 items-center justify-center"
                    >
                        <Ionicons name="arrow-back" size={20} color="white" />
                    </TouchableOpacity>
                    <Text className="text-white text-lg font-medium ml-4">
                        Sign In
                    </Text>
                </View>

                <View className="flex-1 justify-center px-6">
                    {/* Title */}
                    <View className="mb-8">
                        <Text className="text-white text-3xl font-bold mb-2">
                            Welcome back
                        </Text>
                        <Text className="text-white/70 text-base">
                            Sign in to continue your skincare journey
                        </Text>
                    </View>

                    {/* Form */}
                    <View className="space-y-4 mb-8">
                        <View className="mb-4">
                            <Text className="text-white/80 text-sm mb-2 ml-1">
                                Email
                            </Text>
                            <TextInput
                                placeholder="Enter your email"
                                placeholderTextColor="#666"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoComplete="email"
                                className="bg-white/10 text-white px-4 py-4 rounded-2xl border border-white/20"
                            />
                        </View>

                        <View>
                            <Text className="text-white/80 text-sm mb-2 ml-1">
                                Password
                            </Text>
                            <TextInput
                                placeholder="Enter your password"
                                placeholderTextColor="#666"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                                autoComplete="password"
                                className="bg-white/10 text-white px-4 py-4 rounded-2xl border border-white/20"
                            />
                        </View>
                    </View>

                    {/* Sign In Button */}
                    <TouchableOpacity
                        onPress={handleLogin}
                        disabled={isLoading}
                        className={`py-4 rounded-2xl items-center mb-6 ${
                            isLoading ? 'bg-gray-600' : 'bg-primary'
                        }`}
                    >
                        {isLoading ? (
                            <View className="flex-row items-center">
                                <Text className="text-white font-semibold text-lg mr-2">
                                    Signing In...
                                </Text>
                            </View>
                        ) : (
                            <Text className="text-white font-semibold text-lg">
                                Sign In
                            </Text>
                        )}
                    </TouchableOpacity>

                    {/* Sign Up Link */}
                    <View className="flex-row justify-center items-center">
                        <Text className="text-white/70 text-base">
                            Don't have an account? 
                        </Text>
                        <TouchableOpacity
                            onPress={() => {
                                navigation.goBack();
                                navigation.navigate('Signup');
                            }}
                        >
                            <Text className="text-primary text-base font-medium ml-1">
                                Sign Up
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
            <Toast/>
        </View>
    );
};

export default LoginScreen;