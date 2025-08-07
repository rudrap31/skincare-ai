import React from 'react';
import { View } from 'react-native';
import GradientBackground from '../components/GradientBackground';
import Profile from '../components/Profile';

const ProfileScreen = () => {

    return (
        <View className="flex-1 justify-center">
            <GradientBackground />
            <Profile />
        </View>
    );
};

export default ProfileScreen;
