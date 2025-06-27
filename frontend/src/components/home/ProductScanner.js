import React, { useState, useEffect, useRef } from 'react';
import {
    Text,
    View,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Dimensions,
    SafeAreaView,
    ActivityIndicator,
} from 'react-native';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import {
    useCameraPermission,
    useCodeScanner,
} from 'react-native-vision-camera';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../context/AuthContext';
import { useScannedProductsStore } from '../../store/scannedProductsStore';
import { IP } from '../../Constants';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const ProductScanner = () => {
    const device = useCameraDevice('back');
    const { hasPermission, requestPermission } = useCameraPermission();
    const { user } = useAuth();
    const scannedRef = useRef(false);
    const [scanLoading, setScanLoading] = useState(false);
    const [cameraOn, setCameraOn] = useState(true);
    const navigation = useNavigation();

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(300)).current;

    useEffect(() => {
        if (!hasPermission) {
            requestPermission();
        }
    }, []);

    useEffect(() => {
        // Reset scanner state when opening
        scannedRef.current = false;
        setCameraOn(true);
        setScanLoading(false);

        // Animate in
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const handleClose = () => {
        setCameraOn(false);
        onClose();
    };

    const codeScanner = useCodeScanner({
        codeTypes: ['qr', 'ean-13'],
        onCodeScanned: async (codes) => {
            if (scannedRef.current) return;
            if (!codes?.[0]?.value) return;
            scannedRef.current = true;

            setScanLoading(true);

            try {
                const user_id = user?.id;
                const upc = codes[0].value;
                const res = await fetch(`http://${IP}:5111/api/product`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ upc, user_id }),
                });

                const { addProduct } = useScannedProductsStore.getState();
                const json = await res.json();

                if (json.success !== true) {
                    setScanLoading(false);
                    setCameraOn(false);
                    navigation.popTo('Home', {
                        scannedProduct: null,
                    });
                    return;
                }

                addProduct(json.data);
                console.log('Scan result:', json);

                setScanLoading(false);
                setCameraOn(false);
                navigation.popTo('Home', {
                    scannedProduct: json.data,
                });
            } catch (error) {
                console.error('Scan request failed:', error);
                navigation.popTo('Home', {
                    scannedProduct: null,
                });
            }
        },
    });

    if (!hasPermission) {
        return (
            <Animated.View
                style={[
                    StyleSheet.absoluteFill,
                    {
                        zIndex: 1000,
                        backgroundColor: 'rgba(0,0,0,0.9)',
                        opacity: fadeAnim,
                    },
                ]}
            >
                <SafeAreaView className="flex-1 justify-center items-center px-6">
                    <Animated.View
                        className="bg-white rounded-2xl p-8 items-center shadow-2xl"
                        style={{
                            transform: [{ translateY: slideAnim }],
                        }}
                    >
                        <Ionicons
                            name="camera-outline"
                            size={64}
                            color="#9333ea"
                        />
                        <Text className="text-gray-800 text-xl font-bold mt-4 text-center">
                            Camera Permission Required
                        </Text>
                        <Text className="text-gray-600 text-center mt-2 mb-6">
                            We need access to your camera to scan product
                            barcodes
                        </Text>

                        <View className="flex-row space-x-3">
                            <TouchableOpacity
                                onPress={handleClose}
                                className="bg-gray-200 px-6 py-3 rounded-xl flex-1"
                            >
                                <Text className="text-gray-800 font-semibold text-center">
                                    Cancel
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={requestPermission}
                                className="bg-purple-600 px-6 py-3 rounded-xl flex-1"
                            >
                                <Text className="text-white font-semibold text-center">
                                    Grant Permission
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </SafeAreaView>
            </Animated.View>
        );
    }

    if (device == null) {
        return (
            <Animated.View
                style={[
                    StyleSheet.absoluteFill,
                    {
                        zIndex: 1000,
                        backgroundColor: 'rgba(0,0,0,0.9)',
                        opacity: fadeAnim,
                    },
                ]}
            >
                <SafeAreaView className="flex-1 justify-center items-center px-6">
                    <Animated.View
                        className="bg-black rounded-2xl p-8 items-center shadow-2xl"
                        style={{
                            transform: [{ translateY: slideAnim }],
                        }}
                    >
                        <Ionicons
                            name="camera-off-outline"
                            size={64}
                            color="#ef4444"
                        />
                        <Text className="text-gray-800 text-xl font-bold mt-4 text-center">
                            No Camera Found
                        </Text>
                        <Text className="text-gray-600 text-center mt-2 mb-6">
                            Unable to access camera device
                        </Text>

                        <TouchableOpacity
                            onPress={handleClose}
                            className="bg-gray-600 px-8 py-3 rounded-xl"
                        >
                            <Text className="text-white font-semibold">
                                Close
                            </Text>
                        </TouchableOpacity>
                    </Animated.View>
                </SafeAreaView>
            </Animated.View>
        );
    }

    return (
        <Animated.View
            style={[
                StyleSheet.absoluteFill,
                {
                    zIndex: 1000,
                    opacity: fadeAnim,
                },
            ]}
        >
            {/* Camera */}
            <Camera
                style={StyleSheet.absoluteFill}
                device={device}
                isActive={cameraOn}
                codeScanner={codeScanner}
            />

            {/* Loading overlay */}
            {scanLoading && (
                <Animated.View
                    className="absolute inset-0 bg-black/80 justify-center items-center"
                    style={{
                        transform: [{ translateY: slideAnim }],
                    }}
                >
                    <View className="items-center bg-white/10 backdrop-blur-sm rounded-2xl p-8 mx-6">
                        <ActivityIndicator size="large" color="#ffffff" />
                        <Text className="text-white text-lg font-semibold mt-4 text-center">
                            Analyzing product...
                        </Text>
                        <Text className="text-white/70 text-sm text-center mt-2">
                            Please wait while we look up the product information
                        </Text>
                    </View>
                </Animated.View>
            )}

            {/* Overlay UI */}
            <SafeAreaView className="absolute inset-0">
                {/* Top Bar */}
                <Animated.View
                    className="flex-row items-center justify-between px-6 pt-4"
                    style={{
                        transform: [{ translateY: slideAnim }],
                    }}
                >
                    <TouchableOpacity
                        onPress={handleClose}
                        className="w-12 h-12 items-center justify-center bg-black/40 backdrop-blur-sm rounded-full border border-white/20"
                    >
                        <Ionicons name="close" size={24} color="white" />
                    </TouchableOpacity>

                    <View className="items-center">
                        <Text className="text-white text-2xl font-bold drop-shadow-lg">
                            simplyskin
                        </Text>
                        <View className="w-2 h-2 bg-green-500 rounded-full mt-1" />
                    </View>

                    <View className="w-12 h-12" />
                </Animated.View>

                {/* Instructions */}
                <Animated.View
                    className="items-center mt-12 px-6"
                    style={{
                        transform: [{ translateY: slideAnim }],
                    }}
                >
                    <View className="bg-black/40 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/20">
                        <Text className="text-white text-lg font-medium text-center">
                            Point camera at barcode
                        </Text>
                        <Text className="text-white/70 text-sm text-center mt-1">
                            Ensure good lighting and steady hands
                        </Text>
                    </View>
                </Animated.View>

                {/* Camera Frame */}
                <View className="flex-1 items-center justify-center px-8 mb-20 bottom-16">
                    <Animated.View
                        style={[
                            {
                                width: width * 0.8,
                                height: width * 0.6,
                                backgroundColor: 'transparent',
                                transform: [{ translateY: slideAnim }],
                            },
                        ]}
                        className="border-2 border-white/70 rounded-3xl relative"
                    ></Animated.View>
                </View>
            </SafeAreaView>
        </Animated.View>
    );
};

export default ProductScanner;
