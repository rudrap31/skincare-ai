import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useAuthState } from '../context/AuthContext';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const Navbar = () => {
    const { user } = useAuthState();
    const navigation = useNavigation();

    return (
        <View className="mt-10 flex-row h-32 items-center right-4">
            <MaskedView
                maskElement={
                    <Text className="text-3xl px-6 font-bold">simplyskin</Text>
                }
            >
                <LinearGradient
                    colors={['#8b23d2', '#de264e']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                >
                    <Text className="text-3xl px-6 font-bold opacity-0">
                        simplyskin
                    </Text>
                </LinearGradient>
            </MaskedView>
            {user? (<TouchableOpacity
                    onPress={() => navigation.navigate('Profile')}
                    className="bg-primary px-4 py-4 rounded-full ml-auto mr-4 left-3"
                >
                    <Ionicons name="person" size={16} color="white" className=""/>
                </TouchableOpacity>) : (
                <TouchableOpacity
                    onPress={() => navigation.navigate('Login')}
                    className="bg-primary px-6 py-2 rounded-full ml-auto mr-4"
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
