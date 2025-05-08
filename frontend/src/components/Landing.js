import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import GradientBackground from '../components/GradientBackground';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Octicons from 'react-native-vector-icons/Octicons';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';

const Landing = () => {
    const navigation = useNavigation();

    return (
        <View className="flex-1 relative">
            <GradientBackground />

            {/* Content */}
            <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                className="z-10"
            >
                <View className="mt-10 flex-row h-36 items-center">
                    <MaskedView
                        maskElement={
                            <Text className="text-4xl px-6 font-bold">
                                Skin.AI
                            </Text>
                        }
                    >
                        <LinearGradient
                            colors={['#8b23d2', '#de264e']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <Text className="text-4xl px-6 font-bold opacity-0">
                                Skin.AI
                            </Text>
                        </LinearGradient>
                    </MaskedView>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('Login')}
                        className="bg-primary px-6 py-2 rounded-full mb-4 ml-auto mr-4"
                    >
                        <Text className="text-white font-semibold text-lg">
                            Log In
                        </Text>
                    </TouchableOpacity>
                </View>

                <View className="mt-24 px-6">
                    <View className="items-center">
                        <Text className="text-4xl font-bold text-white text-center mb-6">
                            Your Personal Skincare AI Assistant
                        </Text>
                        <Text className="text-lg text-gray-200 text-center mb-8">
                            Discover personalized skincare recommendations
                            powered by AI. Analyze products, optimize your
                            routine, and track your skin's progress with our
                            advanced tools.
                        </Text>

                        <View className="flex flex-col space-y-4 w-full">
                            <TouchableOpacity
                                onPress={() => navigation.navigate('Signup')}
                                className="bg-primary py-4 rounded-full items-center mx-8"
                            >
                                <Text className="text-white text-lg font-semibold">
                                    Get Started
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Feature Sections in a Row */}
                <View className="mt-24 px-4 mb-20">
                    <View className="flex-row justify-between space-x-2">
                        {/* Feature 1 */}
                        <View className="flex-1 items-center p-4 rounded-xl">
                            <Ionicons
                                name="camera-outline"
                                color="white"
                                size="30"
                            />
                            <Text className="text-white font-bold text-base mb-1">
                                AI Analysis
                            </Text>
                            <Text className="text-gray-300 text-xs text-center">
                                Upload a selfie to get detailed analysis of
                                acne, redness, and more.
                            </Text>
                        </View>

                        {/* Feature 2 */}
                        <View className="flex-1 items-center p-4 rounded-xl">
                            <Octicons
                                name="checklist"
                                color="white"
                                size="28"
                            />
                            <Text className="text-white font-bold text-base mb-1 text-center">
                                Routine Rating
                            </Text>
                            <Text className="text-gray-300 text-xs text-center">
                                Enter your skincare routine and get AI-powered
                                feedback.
                            </Text>
                        </View>

                        {/* Feature 3 */}
                        <View className="flex-1 items-center p-4 rounded-xl">
                            <Ionicons
                                name="barcode-outline"
                                color="white"
                                size="30"
                            />
                            <Text className="text-white font-bold text-base mb-1">
                                Product Scan
                            </Text>
                            <Text className="text-gray-300 text-xs text-center">
                                Scan barcodes and find out if a product fits
                                your skin needs.
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

export default Landing;
