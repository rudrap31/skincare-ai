import React from 'react';
import { Text, View, ScrollView, TouchableOpacity } from 'react-native';
import GradientBackground from '../components/GradientBackground';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Octicons from 'react-native-vector-icons/Octicons';
import { useNavigation } from '@react-navigation/native';
import Profile from '../components/Profile';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const ProfileScreen = () => {

    return (
        <View className="flex-1 justify-center">
            <GradientBackground />
            <Profile />
        </View>
    );
};

export default ProfileScreen;
