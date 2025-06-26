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
    const { hasPermission, requestPermission } = useCameraPermission();
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const { user } = useAuth();
    const [isServiceError, setIsServiceError] = useState(false);

    const [isActive, setIsActive] = useState(true);
    const actionSheetRef = useRef(null);

    useEffect(() => {
        const requestCameraPermission = async () => {
            if (!hasPermission) {
                const permission = await requestPermission();
                if (!permission) {
                    Alert.alert(
                        'Camera Permission Required',
                        'Please grant camera permission to use this feature.',
                        [{ text: 'OK', onPress: () => navigation.goBack() }]
                    );
                }
            }
        };

        requestCameraPermission();
    }, [hasPermission]);

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

    const processImage = async (imageUri, isFromCamera = false) => {
        try {
            setIsAnalyzing(true);

            const fileName = `${Date.now()}_face_analysis.jpg`;
            const filePath = `${user?.id}/${fileName}`;

            // Convert image to base64 and upload
            const responsePhoto = await fetch(imageUri);
            const blob = await responsePhoto.blob();

            const base64Data = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result.split(',')[1]);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });

            const arrayBuffer = decode(base64Data);

            const { data: uploadData, error: uploadError } =
                await supabase.storage
                    .from('face-images')
                    .upload(filePath, arrayBuffer, {
                        contentType: 'image/jpeg',
                        cacheControl: '3600',
                        upsert: false,
                    });

            if (uploadError)
                throw new Error(
                    `Failed to upload image: ${uploadError.message}`
                );

            // Call backend API
            const response = await fetch(`http://${IP}:5111/api/face`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    img: uploadData.path,
                    user_id: user.id,
                }),
            });

            if (!response.ok) {
                if (
                response.status === 400
            ) {
                setIsServiceError(false);
                actionSheetRef.current?.show();
            } else if (
                response.status === 503 
            ) {
                setIsServiceError(true);
                actionSheetRef.current?.show();
            }
            setIsAnalyzing(false);
            return;
        }
            const analysisData = await response.json();
            console.log(analysisData)

            navigation.navigate('ScanResults', {
                scanImage: imageUri,
                scanResults: analysisData.result,
            });
        } catch (error) {
            console.error('Error processing image:', error);
            Alert.alert('Error', 'Failed to process image. Please try again.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const takePicture = async () => {
        if (camera.current) {
            const photo = await camera.current.takePhoto({
                quality: 90,
                skipMetadata: true,
            });
            await processImage(`file://${photo.path}`, true);
        }
    };

    const pickImageFromGallery = async () => {
        try {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            });

            if (!result.canceled) {
                await processImage(result.assets[0].uri, false);
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'Failed to pick image. Please try again.');
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
            <View className="flex-1 items-center justify-center bg-black">
                <Text className="text-white text-lg text-center px-8">
                    Camera permission is required to use this feature
                </Text>
                <TouchableOpacity
                    onPress={requestPermission}
                    className="bg-blue-500 px-6 py-3 rounded-lg mt-4"
                >
                    <Text className="text-white font-semibold">
                        Grant Permission
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (!device) {
        return (
            <View className="flex-1 items-center justify-center bg-black">
                <Text className="text-white text-lg">Camera not available</Text>
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
                    {/* Upgrade Banner */}

                    {/* Capture Button */}
                    <View className="items-center mb-6">
                        <TouchableOpacity
                            onPress={takePicture}
                            className="w-20 h-20 border-4 border-white rounded-full items-center justify-center"
                        >
                            <View className="w-16 h-16 bg-white rounded-full" />
                        </TouchableOpacity>
                    </View>

                    {/* Bottom Actions */}
                    <View className="flex-row items-center justify-center space-x-4">
                        <TouchableOpacity
                            onPress={takePicture}
                            className="bg-white/20 flex-row items-center px-6 py-3 rounded-full flex-1 mx-4"
                        >
                            <Icon name="camera" size={20} color="white" />
                            <Text className="text-white font-semibold ml-2 text-center flex-1">
                                Photo
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={pickImageFromGallery}
                            className="bg-black/50 flex-row items-center px-6 py-3 rounded-full flex-1 mx-4"
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
                        {isServiceError
                            ? 'Our face analysis service is temporarily unavailable. Please try again in a few moments.'
                            : "We couldn't detect your face clearly in the photo. This might be due to poor lighting or the photo not showing your face properly."}
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
