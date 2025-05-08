import React from 'react';
import { Text, View } from 'react-native';
import GradientBackground from '../GradientBackground';
import Navbar from '../Navbar';

const RoutineRater = () => {
    return (
        <View className="h-full">
            <GradientBackground />
            <Navbar />
            <Text>Routine Rater</Text>
        </View>
    );
};

export default RoutineRater;
