import { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity } from 'react-native';
import GradientBackground from '../components/GradientBackground';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../context/AuthContext';
import Toast from 'react-native-toast-message';

const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigation = useNavigation();

    const { signIn } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!email) {
            Toast.show({
                type: 'error',
                position: 'top',
                text1: 'Missing Email!',
                text1Style: { fontSize: 16, textAlign: 'center' },
                visibilityTime: 1500,
                autoHide: true,
            });
            return;
        }

        if (!password) {
            Toast.show({
                type: 'error',
                position: 'top',
                text1: 'Missing Password!',
                text1Style: { fontSize: 16, textAlign: 'center' },
                visibilityTime: 1500,
                autoHide: true,
            });
            return;
        }

        try {
            setEmail('supersaiyanbardock8@gmail.com');
            setPassword('tester');
            const { data, error } = await signIn({ email, password });

            if (error) throw error;
        } catch (error) {
            // Show error toast if login fails
            Toast.show({
                type: 'error',
                position: 'top',
                text1: 'Invalid Credentials!',
                text1Style: { fontSize: 16, textAlign: 'center' },
                visibilityTime: 1500,
                autoHide: true,
            });

            console.error('Sign in error:', error.message);
        }
    };

    return (
        <View className="flex-1 justify-center px-6">
            <GradientBackground />
            <TouchableOpacity
                onPress={() => navigation.popTo('Landing')}
                className="absolute top-20 left-5"
            >
                <Ionicons name="arrow-back" size={30} color="white" />
            </TouchableOpacity>

            <View className="bottom-10">
                <Text className="text-white text-4xl font-bold mb-8 text-center">
                    Log In
                </Text>

                {/* Email */}
                <TextInput
                    placeholder="Email"
                    placeholderTextColor="#aaa"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    className="mb-8 bg-[#1a1a1a] text-white mx-4 px-4 py-3 rounded-xl border border-[#333]"
                />

                {/* Password */}
                <TextInput
                    placeholder="Password"
                    placeholderTextColor="#aaa"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    className="mb-8 bg-[#1a1a1a] text-white mx-4 px-4 py-3 rounded-xl border border-[#333]"
                />

                {/* Login Button */}
                <TouchableOpacity
                    onPress={handleLogin}
                    className="bg-primary mb-6 py-3 mx-4 rounded-xl items-center"
                >
                    <Text className="text-white font-bold text-lg">Log In</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => navigation.navigate('Signup')}
                    className="mx-4 rounded-xl items-center"
                >
                    <Text className="text-white font-semibold text-md">
                        Don't have an account?
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default LoginScreen;
