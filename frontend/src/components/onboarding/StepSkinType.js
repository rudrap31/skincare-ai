import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

const SKIN_TYPES = [
    { type: 'Normal', description: 'Balanced, not too oily or dry' },
    { type: 'Dry', description: 'Feels tight, may flake or appear dull' },
    { type: 'Oily', description: 'Shiny, prone to breakouts' },
    { type: 'Combination', description: 'Oily T-zone, normal to dry cheeks' },
    { type: 'Sensitive', description: 'Easily irritated or reactive' },
];

const StepSkinType = ({ selected, onNext, onBack }) => {
    const [selectedType, setSelectedType] = useState(selected);

    const SkinTypeOption = ({ skinType }) => {
        const isSelected = selectedType === skinType.type;
        return (
            <TouchableOpacity
                onPress={() => setSelectedType(skinType.type)}
                className={`mb-4 p-4 rounded-xl border ${
                    isSelected
                        ? 'bg-purple-600/30 border border-purple-500'
                        : 'bg-gray-800/50 border border-gray-700'
                }`}
            >
                <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                        <Text className={`text-lg font-semibold ${
                            isSelected ? 'text-purple-300' : 'text-white'
                        }`}>
                            {skinType.type}
                        </Text>
                        <Text className="text-gray-400 text-sm mt-1">
                            {skinType.description}
                        </Text>
                    </View>
                    {isSelected && (
                        <View className="w-6 h-6 bg-purple-500 rounded-full items-center justify-center ml-3">
                            <Text className="text-white text-sm">✓</Text>
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View className="flex-1 px-6 pt-8 justify-center">
            {/* Header */}
            <View className="items-center mb-8">
                <View className="w-16 h-16 bg-purple-600/20 rounded-full items-center justify-center mb-4">
                    <Text className="text-3xl">🧴</Text>
                </View>
                <Text className="text-white text-2xl font-bold text-center mb-2">
                    What's your skin type?
                </Text>
                <Text className="text-gray-400 text-center text-base">
                    This helps us recommend the right products
                </Text>
            </View>

                {/* Skin Type Options */}
                <View className="mb-6">
                    {SKIN_TYPES.map((skinType) => (
                        <SkinTypeOption key={skinType.type} skinType={skinType} />
                    ))}
                </View>


            {/* Navigation */}
            <View className="flex-row items-center justify-between mb-6">
                <TouchableOpacity
                    onPress={onBack}
                    className="flex-row items-center px-4 py-3"
                >
                    <Text className="text-purple-500 text-lg mr-2">←</Text>
                    <Text className="text-purple-500 text-lg">Back</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                    onPress={() => onNext(selectedType)}
                    disabled={!selectedType}
                    className={`py-3 px-8 rounded-xl ${
                        selectedType ? 'bg-purple-600' : 'bg-purple-600/50'
                    }`}
                >
                    <Text className="text-white text-lg font-bold">
                        Continue
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default StepSkinType;