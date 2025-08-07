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
    Alert,
    Linking,
} from 'react-native';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import {
    useCameraPermission,
    useCodeScanner,
} from 'react-native-vision-camera';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../context/AuthContext';
import { IP } from '../../Constants';
import { useNavigation } from '@react-navigation/native';
import ActionSheet from 'react-native-actions-sheet';

const { width } = Dimensions.get('window');

const ProductScanner = () => {
    const device = useCameraDevice('back');
    const { hasPermission, requestPermission } = useCameraPermission();
    const { user } = useAuth();
    const scannedRef = useRef(false);
    const [scanLoading, setScanLoading] = useState(false);
    const [cameraOn, setCameraOn] = useState(true);
    const [errorType, setErrorType] = useState(''); // 'not_skincare', 'not_found', 'network', 'service', 'profile'
    const [errorMessage, setErrorMessage] = useState('');
    const navigation = useNavigation();
    const actionSheetRef = useRef(null);

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
        setErrorMessage('');

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
        if (scanLoading) return;
        setCameraOn(false);
        navigation.goBack();
    };

    const showError = (type, message) => {
        setErrorType(type);
        setErrorMessage(message);
        setScanLoading(false);
        actionSheetRef.current?.show();
    };

    const handleRetry = () => {
        actionSheetRef.current?.hide();
        setErrorType('');
        setErrorMessage('');
        scannedRef.current = false;
    };

    const codeScanner = useCodeScanner({
        codeTypes: ['qr', 'ean-13'],
        onCodeScanned: async (codes) => {
            if (scannedRef.current) return;
            if (!codes?.[0]?.value) return;
            scannedRef.current = true;

            setScanLoading(true);

            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

                const user_id = user?.id;
                const upc = codes[0].value;
                const res = await fetch(`http://${IP}:5111/api/product`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ upc, user_id }),
                    signal: controller.signal,
                });

                clearTimeout(timeoutId);
                if (!res.ok) {
                    if (res.status === 503) {
                        showError(
                            'service',
                            'Our product analysis service is temporarily unavailable. Please try again in a few moments.'
                        );
                        return;
                    }
                }

                const json = await res.json();

                if (json.success !== true) {
                    // Handle specific error messages from backend
                    if (
                        json.error ===
                        'This does not appear to be a skincare product'
                    ) {
                        showError(
                            'not_skincare',
                            'This product is not a skincare item. Please scan a skincare product.'
                        );
                    } else if (json.error === 'Product not found') {
                        showError(
                            'not_found',
                            'Product not found in our database. Please try scanning again or check the barcode.'
                        );
                    } else if (json.error === 'Missing skin profile data') {
                        showError(
                            'profile',
                            'Please complete your skin profile first to get personalized product recommendations.'
                        );
                    } else {
                        showError(
                            'network',
                            'Unable to analyze this product. Please try again.'
                        );
                    }
                    return;
                }

                setScanLoading(false);
                setCameraOn(false);
                // Only navigate with valid product data
                navigation.popTo('Home', {
                    scannedProduct: json.data,
                });
            } catch (error) {
                if (error.name === 'AbortError') {
                    showError(
                        'timeout',
                        'Analysis is taking too long. Please try again.'
                    );
                } else {
                    //console.error('Scan request failed:', error);
                    showError(
                        'network',
                        'Network error. Please check your connection and try again.'
                    );
                }
            }
        },
    });

    const getErrorIcon = () => {
        switch (errorType) {
            case 'not_skincare':
                return '🧴';
            case 'not_found':
                return '🔍';
            case 'profile':
                return '👤';
            case 'service':
                return '🛠️';
            case 'timeout':
                return '⏱️';
            case 'network':
            default:
                return '📡';
        }
    };

    const getErrorTitle = () => {
        switch (errorType) {
            case 'not_skincare':
                return 'Not a Skincare Product';
            case 'not_found':
                return 'Product Not Found';
            case 'profile':
                return 'Profile Incomplete';
            case 'service':
                return 'Service Unavailable';
            case 'timeout':
                return 'Request Timeout';
            case 'network':
            default:
                return 'Connection Error';
        }
    };

    const getErrorTips = () => {
        switch (errorType) {
            case 'not_skincare':
                return [
                    "Make sure you're scanning a skincare product",
                    'Look for cleansers, moisturizers, serums, or treatments',
                    'Makeup and supplements are not supported',
                ];
            case 'not_found':
                return [
                    'Ensure the barcode is clearly visible',
                    'Try scanning from different angles',
                    "Make sure there's good lighting",
                ];
            case 'profile':
                return [
                    'Complete your skin type information',
                    'Add your skin concerns',
                    'This helps us provide personalized recommendations',
                ];
            case 'service':
                return [
                    'This is usually temporary',
                    'Try again in a few moments',
                    'Check your internet connection',
                ];
            case 'timeout':
                return [
                    'The analysis is taking longer than expected',
                    'Check your internet connection speed',
                    'Try scanning again with better network conditions',
                    'Make sure the barcode is clear and well-lit',
                ];
            case 'network':
            default:
                return [
                    'Check your internet connection',
                    "Make sure you're connected to WiFi or mobile data",
                    'Try moving to an area with better signal',
                ];
        }
    };

    const SimpleLoadingOverlay = ({ isVisible }) => {
        if (!isVisible) return null;

        return (
            <View className="absolute inset-0 bg-black/50 flex-1 justify-center items-center z-50">
                <View className="bg-white rounded-2xl p-8 mx-6 items-center shadow-lg">
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text className="text-lg font-semibold text-gray-800 mt-4 text-center">
                        Analyzing the product...
                    </Text>
                    <Text className="text-sm text-gray-500 mt-2 text-center">
                        This may take a few moments
                    </Text>
                </View>
            </View>
        );
    };

    if (!hasPermission) {
        return (
            <View className="flex-1 items-center justify-center bg-black px-6">
                <Text className="text-white text-lg text-center mb-6">
                    Camera permission is required to use this feature
                </Text>

                <View className="flex-row gap-1">
                    <TouchableOpacity
                        onPress={handleClose}
                        className="bg-gray-200 px-6 py-3 rounded-xl"
                    >
                        <Text className="text-gray-800 font-semibold text-center">
                            Cancel
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => {
                            Alert.alert(
                                'Camera Permission Required',
                                'We need access to your camera to scan the barcode. Please open Settings to enable it.',
                                [
                                    { text: 'Cancel', style: 'cancel' },
                                    {
                                        text: 'Open Settings',
                                        onPress: () => Linking.openSettings(),
                                    },
                                ]
                            );
                        }}
                        className="bg-primary px-6 py-3 rounded-xl"
                    >
                        <Text className="text-white font-semibold text-center">
                            Grant Permission
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
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
                        <Text className="text-white text-xl font-bold mt-4 text-center">
                            No Camera Found
                        </Text>
                        <Text className="text-gray-400 text-center mt-2 mb-6">
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
                <SimpleLoadingOverlay isVisible={scanLoading} />
            </SafeAreaView>

            {/* Error Action Sheet */}
            <ActionSheet
                ref={actionSheetRef}
                rawUnderStatusBar={false}
                useBottomSafeAreaPadding
                gestureEnabled={true}
                containerStyle={{
                    backgroundColor: '#1e1e1e',
                    borderTopLeftRadius: 20,
                    borderTopRightRadius: 20,
                    marginTop: 0,
                    marginBottom: 0,
                }}
                onClose={handleRetry}
            >
                <View className="px-6 py-8 bg-[#1e1e1e] mb-1">
                    {/* Error Icon */}
                    <View className="items-center mb-6">
                        <Text className="text-6xl">{getErrorIcon()}</Text>
                    </View>

                    {/* Title */}
                    <Text className="text-2xl font-bold text-center text-gray-200 mb-4">
                        {getErrorTitle()}
                    </Text>

                    {/* Description */}
                    <Text className="text-base text-gray-300 text-center mb-6 leading-6">
                        {errorMessage}
                    </Text>

                    {/* Tips Section */}
                    <View className="bg-white/10 rounded-lg p-4 mb-8">
                        <Text className="text-lg font-semibold text-gray-200 mb-3">
                            Tips to help:
                        </Text>
                        {getErrorTips().map((tip, index) => (
                            <View
                                key={index}
                                className="flex-row items-start mb-2"
                            >
                                <Text className="text-purple-400 mr-3 text-base">
                                    •
                                </Text>
                                <Text className="text-gray-400 flex-1 text-base">
                                    {tip}
                                </Text>
                            </View>
                        ))}
                    </View>

                    {/* Action Buttons */}
                    <View className="space-y-3">
                        <TouchableOpacity
                            onPress={handleRetry}
                            className="bg-purple-600 py-4 rounded-lg"
                        >
                            <Text className="text-white text-center font-semibold text-lg">
                                Try Again
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ActionSheet>
        </Animated.View>
    );
};

export default ProductScanner;
