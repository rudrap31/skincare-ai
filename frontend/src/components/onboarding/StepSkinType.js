import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

const SKIN_TYPES = ['Oily', 'Dry', 'Combination', 'Normal', 'Sensitive'];

const StepSkinType = ({ selected, onNext, onBack }) => {
    const [selectedType, setSelectedType] = useState(selected);

    return (
        <View className="p-8 mb-10">
            <Text className="text-white font-semibold text-3xl text-center mb-6">
                What's your skin type?
            </Text>
            {SKIN_TYPES.map((type) => {
                const isSelected = selectedType === type;
                return (
                    <TouchableOpacity
                        key={type}
                        onPress={() => setSelectedType(type)}
                        className={`mb-3 px-4 py-3 rounded-xl border ${
                            isSelected
                                ? 'border-primary bg-primary/40'
                                : 'border-[#333] bg-[#1a1a1a]'
                        }`}
                    >
                        <Text className="text-white text-center text-lg">
                            {type}
                        </Text>
                    </TouchableOpacity>
                );
            })}
            <View className="flex-row justify-between mt-10 mx-4">
                <TouchableOpacity onPress={onBack}>
                    <Text className="text-white text-base">← Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => onNext(selectedType)}
                    disabled={!selectedType}
                    className={`p-3 rounded-full px-6 ${
                        selectedType ? 'bg-primary' : 'bg-gray-700'
                    }`}
                >
                    <Text className="text-white text-lg font-bold">Next</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default StepSkinType;
