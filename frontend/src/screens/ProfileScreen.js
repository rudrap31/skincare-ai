import React from 'react';
import { Text, View, ScrollView, TouchableOpacity } from 'react-native';
import GradientBackground from '../components/GradientBackground';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Octicons from 'react-native-vector-icons/Octicons';
import { useNavigation } from '@react-navigation/native';
import Profile from '../components/Profile';
import { useAuth } from '../context/AuthContext';

const ProfileScreen = () => {
    const navigation = useNavigation();
    const { signOut } = useAuth();

    const handleSignOut = async () => {
        try {
            const { error } = await signOut();
            if (error) throw error;
            Toast.show({
                type: 'success',
                position: 'top',
                text1: 'Signed Out!',
                text1Style: { fontSize: 16, textAlign: 'center' },
            });
        } catch (error) {
            Toast.show({
                type: 'error',
                position: 'top',
                text1: 'Something Went Wrong!',
                text1Style: { fontSize: 16, textAlign: 'center' },
            });
        }
    };

    return (
        <View className="flex-1 justify-center px-6">
            <GradientBackground />
            <TouchableOpacity
                onPress={() => navigation.goBack()}
                className="absolute top-20 left-5 z-10"
            >
                <Ionicons name="arrow-back" size={40} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
                onPress={() => handleSignOut()}
                className="absolute top-20 right-5 z-10"
            >
                <Octicons name="sign-out" size={40} color="red" />
            </TouchableOpacity>

            <Profile />
        </View>
    );
};

export default ProfileScreen;
