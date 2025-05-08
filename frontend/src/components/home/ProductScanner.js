import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import {
    useCameraPermission,
    useCodeScanner,
} from 'react-native-vision-camera';
import Ionicons from 'react-native-vector-icons/Ionicons';
import GradientBackground from '../GradientBackground';
import Navbar from '../Navbar';
import { useUIStore } from '../../store/uiStore';

const ProductScanner = () => {
    const [cameraOn, setCameraOn] = useState(false);
    const device = useCameraDevice('back');
    const { hasPermission } = useCameraPermission();
    const setShowTabs = useUIStore((state) => state.setShowTabs);

    useEffect(() => {
        setShowTabs(!cameraOn);
    }, [cameraOn]);

    const codeScanner = useCodeScanner({
        codeTypes: ['qr', 'ean-13'],
        onCodeScanned: (codes) => {
            codes.forEach((code) => {
                console.log(`Scanned code value: ${code.value}`);
            });
            setCameraOn(false);
        },
    });

    if (!hasPermission) return <Text>No permission</Text>;
    if (device == null) return <Text>No camera device</Text>;

    return (
        <View className="h-full">
            <GradientBackground />
            <Navbar />

            {/* Camera layer (mounted always, only shown if cameraOn) */}
            <View
                style={[
                    StyleSheet.absoluteFill,
                    {
                        zIndex: 50,
                        display: cameraOn ? 'flex' : 'none',
                    },
                ]}
            >
                <Camera
                    style={StyleSheet.absoluteFill}
                    device={device}
                    isActive={cameraOn}
                    codeScanner={codeScanner}
                />
                <TouchableOpacity
                    onPress={() => setCameraOn(false)}
                    className="absolute top-20 left-5"
                >
                    <Ionicons name="arrow-back" size={40} color="white" />
                </TouchableOpacity>
            </View>

            {/* Scanner button */}
            {!cameraOn && (
                <View className="flex-1 justify-center items-center">
                    <TouchableOpacity onPress={() => setCameraOn(true)}>
                        <Text className="text-white text-xl font-semibold bg-primary p-4 rounded-full">
                            Scan a product
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

export default ProductScanner;
