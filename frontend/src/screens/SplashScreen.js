import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';

const SplashScreen = ({ onFinish }) => {

    useEffect(() => {
        // App initialization
        const timer = setTimeout(() => {
            onFinish();
        }, 1500); 

        return () => clearTimeout(timer);
    }, [onFinish]);

    return (
        <View className="flex-1 justify-center items-center bg-black">

            {/* App Logo/Title */}
            <View className="items-center mb-16">
                <MaskedView
                    maskElement={
                        <Text className="text-6xl font-bold text-center">
                            simplyskin
                        </Text>
                    }
                >
                    <LinearGradient
                        colors={['#8b23d2', '#de264e']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <Text className="text-6xl font-bold text-center opacity-0">
                            simplyskin
                        </Text>
                    </LinearGradient>
                </MaskedView>

                <Text className="text-white/70 text-lg mt-4 text-center">
                    Your Personal Skincare Assistant Simplified
                </Text>
            </View>

            {/* Loading Indicator */}
            <ActivityIndicator size="large" color="#8b23d2" />
        </View>
    );
};

export default SplashScreen;
