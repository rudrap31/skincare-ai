import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity } from 'react-native';

const StepName = ({ name, onNext }) => {
    const [value, setValue] = useState(name);

    return (
        <View className="flex-1 px-6 pt-8 justify-center">
            {/* Header */}
            <View className="items-center mb-8">
                <View className="w-16 h-16 bg-purple-600/20 rounded-full items-center justify-center mb-4">
                    <Text className="text-3xl">👋</Text>
                </View>
                <Text className="text-white text-2xl font-bold text-center mb-2">
                    What's your name?
                </Text>
                <Text className="text-gray-400 text-center text-base">
                    Let's personalize your experience
                </Text>
            </View>

            {/* Form Section */}
            <View className="bg-gray-800/50 rounded-2xl p-6 mb-6">
                <Text className="text-white text-lg font-semibold mb-4">
                    Personal Information
                </Text>
                <View>
                    <Text className="text-white mb-2 ml-2">Name</Text>
                    <TextInput
                        placeholder="Enter your full name"
                        placeholderTextColor="#666"
                        value={value}
                        onChangeText={setValue}
                        maxLength={25}
                        autoCapitalize="words"
                        className="bg-[#1a1a1a] text-white px-4 py-3 rounded-xl border border-[#333]"
                    />
                </View>
            </View>

            {/* Continue Button */}
            <TouchableOpacity
                onPress={() => onNext(value)}
                disabled={!value.trim()}
                className={`py-4 rounded-xl mx-4 mb-6 ${
                    value.trim() ? 'bg-purple-600' : 'bg-purple-600/50'
                }`}
            >
                <Text className="text-white text-center text-lg font-bold">
                    Continue
                </Text>
            </TouchableOpacity>

            {/* Footer */}
            <View className="items-center">
                <Text className="text-gray-500 text-sm text-center">
                    This helps us create your personalized profile
                </Text>
            </View>
        </View>
    );
};

export default StepName;