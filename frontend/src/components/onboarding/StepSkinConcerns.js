import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';

const SKIN_CONCERNS = [
    { concern: 'Acne', description: 'Breakouts, pimples, blackheads' },
    { concern: 'Redness', description: 'Irritation, rosacea, sensitivity' },
    { concern: 'Dryness', description: 'Flaky, tight, dehydrated skin' },
    { concern: 'Oily skin', description: 'Excess sebum, shine, large pores' },
    { concern: 'Hyperpigmentation', description: 'Dark spots, uneven tone' },
    { concern: 'Fine lines', description: 'Aging signs, wrinkles' },
    { concern: 'Sensitivity', description: 'Reactive, easily irritated' },
];

const StepSkinConcerns = ({ selectedConcerns = [], onNext, onBack }) => {
    const [selected, setSelected] = useState(new Set(selectedConcerns));

    const toggleConcern = (concern) => {
        const updated = new Set(selected);
        if (updated.has(concern)) {
            updated.delete(concern);
        } else {
            updated.add(concern);
        }
        setSelected(updated);
    };

    const ConcernOption = ({ skinConcern }) => {
        const isSelected = selected.has(skinConcern.concern);
        return (
            <TouchableOpacity
                onPress={() => toggleConcern(skinConcern.concern)}
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
                            {skinConcern.concern}
                        </Text>
                        <Text className="text-gray-400 text-sm mt-1">
                            {skinConcern.description}
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
        <View className="flex-1 px-6 pt-16 justify-center">
            {/* Header */}
            <View className="items-center mb-8">
                <View className="w-16 h-16 bg-purple-600/20 rounded-full items-center justify-center mb-4">
                    <Text className="text-3xl">🎯</Text>
                </View>
                <Text className="text-white text-2xl font-bold text-center mb-2">
                    What are your skin concerns?
                </Text>
                <Text className="text-gray-400 text-center text-base">
                    Select all that apply - we'll help address them
                </Text>
            </View>

            <ScrollView 
                showsVerticalScrollIndicator={false}
                className="flex-1"
            >
                {/* Concern Options */}
                <View className="mb-6">
                    {SKIN_CONCERNS.map((skinConcern) => (
                        <ConcernOption key={skinConcern.concern} skinConcern={skinConcern} />
                    ))}
                </View>

                {/* Selection Counter */}
                {selected.size > 0 && (
                    <View className="bg-purple-600/20 rounded-xl p-4 mb-6">
                        <Text className="text-purple-300 text-center text-sm">
                            {selected.size} concern{selected.size !== 1 ? 's' : ''} selected
                        </Text>
                    </View>
                )}
            </ScrollView>

            {/* Navigation */}
            <View className="flex-row items-center justify-between mb-6 pt-2">
                <TouchableOpacity
                    onPress={onBack}
                    className="flex-row items-center px-4 py-3"
                >
                    <Text className="text-purple-500 text-lg mr-2">←</Text>
                    <Text className="text-purple-500 text-lg">Back</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                    onPress={() => onNext(Array.from(selected))}
                    disabled={selected.size === 0}
                    className={`py-3 px-8 rounded-xl ${
                        selected.size > 0 ? 'bg-purple-600' : 'bg-purple-600/50'
                    }`}
                >
                    <Text className="text-white text-lg font-bold">
                        Complete Setup
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default StepSkinConcerns;