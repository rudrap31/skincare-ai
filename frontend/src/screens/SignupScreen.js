import { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity } from 'react-native';
import GradientBackground from '../components/GradientBackground';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Toast from 'react-native-toast-message';
import { useAuth } from '../context/AuthContext';

const SignupScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const navigation = useNavigation();
    const { signUp } = useAuth();

    const handleSignup = async () => {
        if (!email) {
            Toast.show({
                type: 'error',
                position: 'top',
                text1: 'Missing Email!',
                text2: 'Please enter your email to sign up.',
                text1Style: { fontSize: 16, textAlign: 'center' },
                text2Style: { fontSize: 12, textAlign: 'center' },
            });
            return;
        }

        if (!password || !confirmPassword) {
            Toast.show({
                type: 'error',
                position: 'top',
                text1: 'Missing Password!',
                text2: 'Please enter and confirm your password.',
                text1Style: { fontSize: 16, textAlign: 'center' },
                text2Style: { fontSize: 12, textAlign: 'center' },
            });
            return;
        }

        if (password !== confirmPassword) {
            Toast.show({
                type: 'error',
                position: 'top',
                text1: "Passwords Don't Match!",
                text2: 'Please make sure both passwords are the same.',
                text1Style: { fontSize: 16, textAlign: 'center' },
                text2Style: { fontSize: 12, textAlign: 'center' },
            });
            return;
        }

        try {
            const { data, error } = await signUp({ email, password });

            if (error) throw error;

            Toast.show({
                type: 'success',
                position: 'top',
                text1: 'Signed Up Successfully!',
                text2: 'Please check your email to confirm your account.',
                text1Style: { fontSize: 16, textAlign: 'center' },
                text2Style: { fontSize: 12, textAlign: 'center' },
            });

            navigation.navigate('Login');
        } catch (err) {
            Toast.show({
                type: 'error',
                position: 'top',
                text1: 'Signup Failed!',
                text2: err.message || 'Something went wrong. Please try again.',
                text1Style: { fontSize: 16, textAlign: 'center' },
                text2Style: { fontSize: 12, textAlign: 'center' },
            });
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
                    Sign Up
                </Text>

                <TextInput
                    placeholder="Email"
                    placeholderTextColor="#aaa"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    className="mb-8 bg-[#1a1a1a] text-white mx-4 px-4 py-3 rounded-xl border border-[#333]"
                />

                <TextInput
                    placeholder="Password"
                    placeholderTextColor="#aaa"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    className="mb-8 bg-[#1a1a1a] text-white mx-4 px-4 py-3 rounded-xl border border-[#333]"
                />

                <TextInput
                    placeholder="Confirm Password"
                    placeholderTextColor="#aaa"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    className="mb-8 bg-[#1a1a1a] text-white mx-4 px-4 py-3 rounded-xl border border-[#333]"
                />

                <TouchableOpacity
                    onPress={handleSignup}
                    className="bg-primary mb-6 py-3 mx-4 rounded-xl items-center"
                >
                    <Text className="text-white font-bold text-lg">
                        Sign Up
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => navigation.navigate('Login')}
                    className="mx-4 rounded-xl items-center"
                >
                    <Text className="text-white font-semibold text-md">
                        Already have an account?
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default SignupScreen;
