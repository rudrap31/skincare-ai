import React, { useRef, useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Alert,
    StatusBar,
    Dimensions,
    SafeAreaView,
    ActivityIndicator,
    Linking,
} from 'react-native';
import {
    Camera,
    useCameraDevice,
    useCameraPermission,
} from 'react-native-vision-camera';
import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../supabase/supabase';
import { decode } from 'base64-arraybuffer';
import { IP } from '../../Constants';
import ActionSheet from 'react-native-actions-sheet';

const { width, height } = Dimensions.get('window');

const CameraScanScreen = ({ navigation, route }) => {
    const camera = useRef(null);
    const device = useCameraDevice('front');
    const { hasPermission, requestPermission, status } = useCameraPermission();
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const { user, refreshUserData } = useAuth();
    const [isServiceError, setIsServiceError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const [isActive, setIsActive] = useState(true);
    const actionSheetRef = useRef(null);

    useEffect(() => {
        const checkPermission = async () => {
            if (!hasPermission) {
                const result = await requestPermission();
            }
        };

        checkPermission();
    }, []);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            setIsActive(true);
        });

        const unsubscribeBlur = navigation.addListener('blur', () => {
            setIsActive(false);
        });

        return () => {
            unsubscribe();
            unsubscribeBlur();
        };
    }, [navigation]);

    const showError = (message, isService = false) => {
        setErrorMessage(message);
        setIsServiceError(isService);
        actionSheetRef.current?.show();
    };

    const processImage = async (imageUri, isFromCamera = false) => {
        try {
            setIsAnalyzing(true);

            const fileName = `${Date.now()}_face_analysis.jpg`;
            const filePath = `${user?.id}/${fileName}`;

            // Convert image to base64 and upload
            let responsePhoto, blob, base64Data, arrayBuffer;

            try {
                responsePhoto = await fetch(imageUri);
                if (!responsePhoto.ok) {
                    throw new Error('Failed to load image');
                }
                blob = await responsePhoto.blob();
            } catch (error) {
                //console.error('Image fetch error:', error);
                throw new Error('Failed to process image file');
            }

            try {
                base64Data = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        const result = reader.result;
                        if (
                            typeof result === 'string' &&
                            result.includes(',')
                        ) {
                            resolve(result.split(',')[1]);
                        } else {
                            reject(new Error('Invalid base64 format'));
                        }
                    };
                    reader.onerror = () =>
                        reject(new Error('Failed to read image'));
                    reader.readAsDataURL(blob);
                });

                arrayBuffer = decode(base64Data);
            } catch (error) {
                //console.error('Base64 conversion error:', error);
                throw new Error('Failed to convert image format');
            }

            // Upload to Supabase
            let uploadData;
            try {
                const { data, error: uploadError } = await supabase.storage
                    .from('face-images')
                    .upload(filePath, arrayBuffer, {
                        contentType: 'image/jpeg',
                        cacheControl: '3600',
                        upsert: false,
                    });

                if (uploadError) {
                    //console.error('Upload error:', uploadError);
                    throw new Error('Failed to upload image to server');
                }

                uploadData = data;
            } catch (error) {
                //console.error('Supabase upload error:', error);
                throw new Error('Image upload failed');
            }

            // Call backend API with timeout
            let response;
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

                response = await fetch(`http://${IP}:5111/api/face`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        img: uploadData.path,
                        user_id: user.id,
                    }),
                    signal: controller.signal,
                });

                clearTimeout(timeoutId);
            } catch (error) {
                //console.error('Network error:', error);
                if (error.name === 'AbortError') {
                    showError(
                        'Analysis is taking too long. Please try again.',
                        true
                    );
                } else {
                    showError(
                        'Network connection failed. Please check your internet connection.',
                        true
                    );
                }
                return;
            }

            // Handle HTTP errors
            if (!response.ok) {
                let errorData;
                try {
                    errorData = await response.json();
                } catch (jsonError) {
                    //console.error('Failed to parse error response:', jsonError);
                    errorData = { error: 'Unknown server error' };
                }

                //console.error('API Error:', response.status, errorData);

                switch (response.status) {
                    case 400:
                        if (errorData.error?.code === 'INVALID_FACE_IMAGE') {
                            showError(
                                "We couldn't detect your face clearly in the photo. This might be due to poor lighting or the photo not showing your face properly.",
                                false
                            );
                        } else {
                            showError(
                                'Invalid image or missing data. Please try again.',
                                false
                            );
                        }
                        break;
                    case 500:
                        showError(
                            'Server error occurred during analysis. Please try again.',
                            true
                        );
                        break;
                    default:
                        showError(
                            `Analysis failed (Error ${response.status}). Please try again.`,
                            true
                        );
                }
                return;
            }

            // Parse response
            let analysisData;
            try {
                analysisData = await response.json();

                if (!analysisData.success || !analysisData.result) {
                    throw new Error('Invalid response format');
                }
            } catch (error) {
                //console.error('Response parsing error:', error);
                showError(
                    'Failed to process analysis results. Please try again.',
                    true
                );
                return;
            }

            // Success - navigate to results
            try {
                await refreshUserData();
                navigation.navigate('ScanResults', {
                    scanImage: imageUri,
                    scanResults: analysisData.result,
                });
            } catch (error) {
                //console.error('Navigation error:', error);
                // Still show results even if refresh fails
                navigation.navigate('ScanResults', {
                    scanImage: imageUri,
                    scanResults: analysisData.result,
                });
            }
        } catch (error) {
            //console.error('Error processing image:', error);

            // Show appropriate error message
            if (error.message.includes('authenticated')) {
                Alert.alert(
                    'Authentication Error',
                    'Please log in and try again.'
                );
            } else if (
                error.message.includes('upload') ||
                error.message.includes('convert')
            ) {
                showError(
                    'Failed to process image. Please try with a different photo or check your internet connection.',
                    false
                );
            } else {
                showError(
                    'An unexpected error occurred. Please try again.',
                    true
                );
            }
        } finally {
            setIsAnalyzing(false);
        }
    };

    const takePicture = async () => {
        try {
            if (!camera.current) {
                Alert.alert(
                    'Camera Error',
                    'Camera is not ready. Please try again.'
                );
                return;
            }

            const photo = await camera.current.takePhoto({
                quality: 90,
                skipMetadata: true,
            });

            if (!photo?.path) {
                throw new Error('Failed to capture photo');
            }

            await processImage(`file://${photo.path}`, true);
        } catch (error) {
            //console.error('Camera capture error:', error);
            Alert.alert(
                'Camera Error',
                'Failed to take photo. Please try again.'
            );
        }
    };

    const pickImageFromGallery = async () => {
        try {
            // Request permissions first
            const { status } =
                await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert(
                    'Permission Required',
                    'We need access to your photo library to select images.',
                    [
                        { text: 'Cancel', style: 'cancel' },
                        {
                            text: 'Open Settings',
                            onPress: () => Linking.openSettings(),
                        },
                    ]
                );
                return;
            }

            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            });

            if (!result.canceled && result.assets?.[0]?.uri) {
                await processImage(result.assets[0].uri, false);
            }
        } catch (error) {
            //console.error('Error picking image:', error);
            Alert.alert(
                'Gallery Error',
                'Failed to pick image from gallery. Please try again.'
            );
        }
    };

    const SimpleLoadingOverlay = ({ isVisible }) => {
        if (!isVisible) return null;

        return (
            <View className="absolute inset-0 bg-black/50 flex-1 justify-center items-center z-50">
                <View className="bg-white rounded-2xl p-8 mx-6 items-center shadow-lg">
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text className="text-lg font-semibold text-gray-800 mt-4 text-center">
                        Analyzing your skin...
                    </Text>
                    <Text className="text-sm text-gray-500 mt-2 text-center">
                        This may take a few moments
                    </Text>
                </View>
            </View>
        );
    };

    const handleClose = () => {
        navigation.goBack();
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
                                'We need access to your camera to scan your skin. Please open Settings to enable it.',
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

    if (!device) {
        return (
            <View className="flex-1 items-center justify-center bg-black">
                <Text className="text-white text-lg">Camera not available</Text>
                <TouchableOpacity
                    onPress={handleClose}
                    className="mt-4 bg-gray-600 px-6 py-3 rounded-xl"
                >
                    <Text className="text-white font-semibold">Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-black">
            <StatusBar hidden />

            {/* Camera View */}
            <Camera
                ref={camera}
                style={{ flex: 1 }}
                device={device}
                isActive={isActive}
                photo={true}
            />

            {/* Overlay UI */}
            <SafeAreaView className="absolute inset-0">
                {/* Top Bar */}
                <View className="flex-row items-center justify-between px-6 pt-4">
                    <TouchableOpacity
                        onPress={handleClose}
                        className="w-12 h-12 items-center justify-center bg-black/40 backdrop-blur-sm rounded-full border border-white/20"
                    >
                        <Icon name="close" size={24} color="white" />
                    </TouchableOpacity>

                    <View className="items-center ">
                        <Text className="text-white text-2xl font-bold">
                            simplyskin
                        </Text>
                        <View className="w-2 h-2 bg-green-500 rounded-full mt-1" />
                    </View>

                    <View className="w-10 h-10" />
                </View>

                {/* Instructions */}
                <View className="items-center mt-8 px-6">
                    <Text className="text-white text-lg font-medium text-center">
                        Take a photo of the front of your face
                    </Text>
                </View>

                {/* Camera Frame */}
                <View className="flex-1 items-center justify-center px-8 ">
                    <View
                        className="border-2 border-white/50 rounded-3xl"
                        style={{
                            width: width * 0.8,
                            height: width * 0.8,
                            backgroundColor: 'transparent',
                        }}
                    />
                </View>

                {/* Bottom Section */}
                <View className="pb-8">
                    {/* Capture Button */}
                    <View className="items-center mb-6">
                        <TouchableOpacity
                            onPress={takePicture}
                            disabled={isAnalyzing}
                            className="w-20 h-20 border-4 border-white rounded-full items-center justify-center"
                            style={{ opacity: isAnalyzing ? 0.5 : 1 }}
                        >
                            <View className="w-16 h-16 bg-white rounded-full" />
                        </TouchableOpacity>
                    </View>

                    {/* Bottom Actions */}
                    <View className="flex-row items-center justify-center space-x-4">
                        <TouchableOpacity
                            onPress={takePicture}
                            disabled={isAnalyzing}
                            className="bg-white/20 flex-row items-center px-6 py-3 rounded-full flex-1 mx-4"
                            style={{ opacity: isAnalyzing ? 0.5 : 1 }}
                        >
                            <Icon name="camera" size={20} color="white" />
                            <Text className="text-white font-semibold ml-2 text-center flex-1">
                                Photo
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={pickImageFromGallery}
                            disabled={isAnalyzing}
                            className="bg-black/50 flex-row items-center px-6 py-3 rounded-full flex-1 mx-4"
                            style={{ opacity: isAnalyzing ? 0.5 : 1 }}
                        >
                            <Icon name="images" size={20} color="white" />
                            <Text className="text-white font-semibold ml-2 text-center flex-1">
                                Gallery
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <SimpleLoadingOverlay isVisible={isAnalyzing} />
            </SafeAreaView>
            <ActionSheet
                ref={actionSheetRef}
                rawUnderStatusBar={false}
                useBottomSafeAreaPadding
                gestureEnabled={true}
                containerStyle={{
                    backgroundColor: '#1e1e1e',
                    borderTopLeftRadius: 20,
                    borderTopRightRadius: 20,
                    marginBottom: 0,
                }}
            >
                <View className="px-6 py-8 bg-[#1e1e1e] mb-1">
                    {/* Error Icon */}
                    <View className="items-center mb-6">
                        <Text className="text-6xl">
                            {isServiceError ? '🛠️' : '⚠️'}
                        </Text>
                    </View>

                    {/* Title */}
                    <Text className="text-2xl font-bold text-center text-gray-200 mb-4">
                        {isServiceError
                            ? 'Service Unavailable'
                            : 'Photo Not Detected'}
                    </Text>

                    {/* Description */}
                    <Text className="text-base text-gray-300 text-center mb-6 leading-6">
                        {errorMessage ||
                            (isServiceError
                                ? 'Our face analysis service is temporarily unavailable. Please try again in a few moments.'
                                : "We couldn't detect your face clearly in the photo. This might be due to poor lighting or the photo not showing your face properly.")}
                    </Text>

                    {/* Tips Section - Only show for face detection errors */}
                    {!isServiceError && (
                        <View className="bg-white/10 rounded-lg p-4 mb-8">
                            <Text className="text-lg font-semibold text-gray-200 mb-3">
                                Tips for a better photo:
                            </Text>
                            <View className="flex-row items-start mb-2">
                                <Text className="text-purple-400 mr-3 text-base">
                                    •
                                </Text>
                                <Text className="text-gray-400 flex-1 text-base">
                                    Make sure your face is clearly visible
                                </Text>
                            </View>
                            <View className="flex-row items-start mb-2">
                                <Text className="text-purple-400 mr-3 text-base">
                                    •
                                </Text>
                                <Text className="text-gray-400 flex-1 text-base">
                                    Use good lighting (avoid shadows)
                                </Text>
                            </View>

                            <View className="flex-row items-start">
                                <Text className="text-purple-400 mr-3 text-base">
                                    •
                                </Text>
                                <Text className="text-gray-400 flex-1 text-base">
                                    Remove any obstructions (sunglasses, hat,
                                    etc.)
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* Service Error Info */}
                    {isServiceError && (
                        <View className="bg-white/10 rounded-lg p-4 mb-8">
                            <Text className="text-lg font-semibold text-gray-200 mb-2">
                                What happened?
                            </Text>
                            <Text className="text-gray-400 text-base leading-6">
                                Our AI analysis service is experiencing
                                temporary issues. This usually resolves quickly.
                                You can try again in a few moments.
                            </Text>
                        </View>
                    )}

                    {/* Action Buttons */}
                    <View className="space-y-3">
                        <TouchableOpacity
                            onPress={() => actionSheetRef.current.hide()}
                            className="bg-purple-600 py-4 rounded-lg"
                        >
                            <Text className="text-white text-center font-semibold text-lg">
                                Try Again
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ActionSheet>
        </View>
    );
};

export default CameraScanScreen;
