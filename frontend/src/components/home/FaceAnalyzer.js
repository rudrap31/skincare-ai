import React from 'react';
import { Text, View } from 'react-native';
import GradientBackground from '../GradientBackground';
import Navbar from '../Navbar';

const FaceAnalyzer = () => {
    return (
        <View className="h-full">
            <GradientBackground />
            <Navbar />
            <Text>Face Analyzer</Text>
        </View>
    );
};

export default FaceAnalyzer;
