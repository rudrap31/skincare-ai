import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

const Navbar = () => {
    const { user, signOut } = useAuth();
    const navigation = useNavigation();

    const handleSignOut = async () => {
        try {
            const { error } = await signOut();
            if (error) throw error;
        } catch (error) {}
    };
    return (
        <View className="mt-10 flex-row h-36 items-center">
            <MaskedView
                maskElement={
                    <Text className="text-4xl px-6 font-bold">Skin.AI</Text>
                }
            >
                <LinearGradient
                    colors={['#8b23d2', '#de264e']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                >
                    <Text className="text-4xl px-6 font-bold opacity-0">
                        Skin.AI
                    </Text>
                </LinearGradient>
            </MaskedView>
            {user ? (
                <TouchableOpacity
                    onPress={() => navigation.navigate('Profile')}
                    className="bg-primary px-6 py-2 rounded-full mb-4 ml-auto mr-4"
                >
                    <Text className="text-white font-semibold text-lg">
                        Profile
                    </Text>
                </TouchableOpacity>
            ) : (
                <TouchableOpacity
                    onPress={() => navigation.navigate('Login')}
                    className="bg-primary px-6 py-2 rounded-full mb-4 ml-auto mr-4"
                >
                    <Text className="text-white font-semibold text-lg">
                        Log In
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

export default Navbar;
