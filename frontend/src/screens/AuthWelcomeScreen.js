import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import MaskedView from '@react-native-masked-view/masked-view';
import Ionicons from 'react-native-vector-icons/Ionicons';

const AuthWelcomeScreen = () => {
    const navigation = useNavigation();

    return (
        <View className="flex-1 bg-[#0d0d0d]">
            {/* Gradient Background */}
            
            <View className="flex-1 justify-center px-6">
                {/* App Branding */}
                <View className="items-center mb-16">
                    <MaskedView
                        maskElement={
                            <Text className="text-5xl font-bold text-center">
                                simplyskin
                            </Text>
                        }
                    >
                        <LinearGradient
                            colors={['#8b23d2', '#de264e']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <Text className="text-5xl font-bold text-center opacity-0">
                                simplyskin
                            </Text>
                        </LinearGradient>
                    </MaskedView>

                    <Text className="text-white/80 text-lg mt-4 text-center max-w-sm">
                        AI-powered skincare analysis and personalized recommendations
                    </Text>
                </View>

                {/* Feature Highlights */}
                <View className="mb-12 space-y-4">
                    <View className="flex-row items-center px-4">
                        <Ionicons name="camera-outline" size={24} color="#8b23d2" />
                        <Text className="text-white/90 ml-4 text-base">
                            Analyze your skin with AI technology
                        </Text>
                    </View>
                    
                    <View className="flex-row items-center px-4">
                        <Ionicons name="checkmark-circle-outline" size={24} color="#8b23d2" />
                        <Text className="text-white/90 ml-4 text-base">
                            Get personalized advice on your products
                        </Text>
                    </View>
                    
                    <View className="flex-row items-center px-4">
                        <Ionicons name="trending-up-outline" size={24} color="#8b23d2" />
                        <Text className="text-white/90 ml-4 text-base">
                            Track your skin progress over time
                        </Text>
                    </View>
                </View>

                {/* Auth Buttons */}
                <View className="space-y-4 mt-4">
                    <TouchableOpacity
                        onPress={() => navigation.navigate('Signup')}
                        className="bg-primary py-4 rounded-2xl items-center shadow-lg mb-4"
                    >
                        <Text className="text-white text-lg font-semibold">
                            Get Started
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => navigation.navigate('Login')}
                        className="border border-white/20 py-4 rounded-2xl items-center"
                    >
                        <Text className="text-white text-lg font-medium">
                            Sign In
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Terms */}
                <Text className="text-white/50 text-xs text-center mt-8 px-4">
                    By continuing, you agree to our Terms of Service and Privacy Policy
                </Text>
            </View>
        </View>
    );
};

export default AuthWelcomeScreen;