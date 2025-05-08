import React, { useState } from 'react';
import { View, TextInput, Button, Text, TouchableOpacity } from 'react-native';

const StepName = ({ name, onNext }) => {
    const [value, setValue] = useState(name);

    return (
        <View className="p-8 mb-10">
            <Text className="text-white font-semibold text-3xl text-center mb-4">
                What's your name?
            </Text>
            <TextInput
                placeholder="Name"
                placeholderTextColor="#aaa"
                value={value}
                onChangeText={setValue}
                autoCapitalize="none"
                className="mb-8 bg-[#1a1a1a] text-white mx-4 px-4 py-3 rounded-xl border border-[#333]"
            />
            <TouchableOpacity
                onPress={() => onNext(value)}
                disabled={!value.trim()}
                className="bg-primary p-3 mx-10 rounded-full"
            >
                <Text className="text-white text-center font-bold text-lg">
                    Next
                </Text>
            </TouchableOpacity>
        </View>
    );
};

export default StepName;
