import { useState } from 'react';
import {
    View,
    TextInput,
    Text,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Linking
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Toast from 'react-native-toast-message';
import { useAuth } from '../context/AuthContext';

const SignupScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigation = useNavigation();
    const { signUp } = useAuth();

    const validateEmail = (email) => {
        return email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    };

    const handleSignup = async () => {
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

        if (!validateEmail(email.trim())) {
            Toast.show({
                type: 'error',
                position: 'top',
                text1: 'Invalid Email',
                text2: 'Please enter a valid email address',
                visibilityTime: 2000,
            });
            return;
        }

        if (!password.trim()) {
            Toast.show({
                type: 'error',
                position: 'top',
                text1: 'Password Required',
                text2: 'Please enter a password',
                visibilityTime: 2000,
            });
            return;
        }

        if (password.length < 6) {
            Toast.show({
                type: 'error',
                position: 'top',
                text1: 'Password Too Short',
                text2: 'Password must be at least 6 characters',
                visibilityTime: 2000,
            });
            return;
        }

        if (password !== confirmPassword) {
            Toast.show({
                type: 'error',
                position: 'top',
                text1: "Passwords Don't Match",
                text2: 'Please make sure both passwords are identical',
                visibilityTime: 2000,
            });
            return;
        }

        setIsLoading(true);
        try {
            const { error } = await signUp({ email: email.trim(), password });

            if (error) throw error;

            Toast.show({
                type: 'success',
                position: 'top',
                text1: 'Account Created!',
                text2: 'Please check your email to verify your account',
                visibilityTime: 4000,
            });

            navigation.navigate('AuthWelcome');
        } catch (err) {
            Toast.show({
                type: 'error',
                position: 'top',
                text1: 'Sign Up Failed',
                text2: err.message || 'Something went wrong. Please try again.',
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
                <ScrollView
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header */}
                    <View className="pt-14 px-6 flex-row items-center">
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            className="w-10 h-10 rounded-full bg-white/10 items-center justify-center"
                        >
                            <Ionicons
                                name="arrow-back"
                                size={20}
                                color="white"
                            />
                        </TouchableOpacity>
                        <Text className="text-white text-lg font-medium ml-4">
                            Create Account
                        </Text>
                    </View>

                    <View className="flex-1 justify-center px-6 py-8">
                        {/* Title */}
                        <View className="mb-8">
                            <Text className="text-white text-3xl font-bold mb-2">
                                Join SimplySkin
                            </Text>
                            <Text className="text-white/70 text-base">
                                Create your account to start your personalized
                                skincare journey
                            </Text>
                        </View>

                        {/* Form */}
                        <View className="space-y-4 mb-8">
                            <View className="mb-2">
                                <Text className="text-white/80 text-sm mb-4 ml-1">
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

                            <View className="mb-2">
                                <Text className="text-white/80 text-sm mb-2 ml-1">
                                    Password
                                </Text>
                                <TextInput
                                    placeholder="Create a password"
                                    placeholderTextColor="#666"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry
                                    autoComplete="new-password"
                                    className="bg-white/10 text-white px-4 py-4 rounded-2xl border border-white/20"
                                />
                                <Text className="text-white/50 text-xs mt-1 ml-1">
                                    Must be at least 6 characters
                                </Text>
                            </View>

                            <View>
                                <Text className="text-white/80 text-sm mb-2 ml-1">
                                    Confirm Password
                                </Text>
                                <TextInput
                                    placeholder="Confirm your password"
                                    placeholderTextColor="#666"
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry
                                    autoComplete="new-password"
                                    className="bg-white/10 text-white px-4 py-4 rounded-2xl border border-white/20"
                                />
                            </View>
                        </View>

                        {/* Sign Up Button */}
                        <TouchableOpacity
                            onPress={handleSignup}
                            disabled={isLoading}
                            className={`py-4 rounded-2xl items-center mb-6 ${
                                isLoading ? 'bg-gray-600' : 'bg-primary'
                            }`}
                        >
                            {isLoading ? (
                                <Text className="text-white font-semibold text-lg">
                                    Creating Account...
                                </Text>
                            ) : (
                                <Text className="text-white font-semibold text-lg">
                                    Create Account
                                </Text>
                            )}
                        </TouchableOpacity>

                        {/* Terms */}
                        <Text className="text-white/50 text-xs text-center mb-6 px-4">
                            By creating an account, you agree to our{' '}
                            <Text
                                className="underline text-white/70"
                                onPress={() =>
                                    Linking.openURL(
                                        'https://simplyskin.vercel.app/terms'
                                    )
                                }
                            >
                                Terms of Service
                            </Text>{' '}
                            and{' '}
                            <Text
                                className="underline text-white/70"
                                onPress={() =>
                                    Linking.openURL(
                                        'https://simplyskin.vercel.app/privacy'
                                    )
                                }
                            >
                                Privacy Policy
                            </Text>
                            .
                        </Text>

                        {/* Sign In Link */}
                        <View className="flex-row justify-center items-center">
                            <Text className="text-white/70 text-base">
                                Already have an account?
                            </Text>
                            <TouchableOpacity
                                onPress={() => {
                                    navigation.goBack();
                                    navigation.navigate('Login');
                                }}
                            >
                                <Text className="text-primary text-base font-medium ml-1">
                                    Sign In
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
            <Toast />
        </View>
    );
};

export default SignupScreen;
