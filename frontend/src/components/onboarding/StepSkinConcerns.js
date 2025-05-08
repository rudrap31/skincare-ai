import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';

const SKIN_CONCERNS = [
    'Acne',
    'Redness',
    'Dryness',
    'Oily skin',
    'Hyperpigmentation',
    'Fine lines',
    'Sensitivity',
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

    return (
        <ScrollView className="p-8 mt-24">
            <Text className="text-white font-semibold text-3xl text-center mb-6">
                What are your skin concerns?
            </Text>
            {SKIN_CONCERNS.map((concern) => {
                const isSelected = selected.has(concern);
                return (
                    <TouchableOpacity
                        key={concern}
                        onPress={() => toggleConcern(concern)}
                        className={`mb-3 px-4 py-3 rounded-xl border ${
                            isSelected
                                ? 'border-primary bg-primary/40'
                                : 'border-[#333] bg-[#1a1a1a]'
                        }`}
                    >
                        <Text className="text-white text-center text-lg">
                            {concern}
                        </Text>
                    </TouchableOpacity>
                );
            })}
            <View className="flex-row justify-between mt-10 mx-4">
                <TouchableOpacity onPress={onBack}>
                    <Text className="text-white text-base">← Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => onNext(Array.from(selected))}
                    disabled={selected.size === 0}
                    className={`p-3 rounded-full px-6 ${
                        selected.size > 0 ? 'bg-primary' : 'bg-gray-700'
                    }`}
                >
                    <Text className="text-white text-lg font-bold">Finish</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

export default StepSkinConcerns;
