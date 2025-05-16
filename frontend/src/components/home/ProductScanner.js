import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Text,
    View,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    Button,
} from 'react-native';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import {
    useCameraPermission,
    useCodeScanner,
} from 'react-native-vision-camera';
import Ionicons from 'react-native-vector-icons/Ionicons';
import GradientBackground from '../GradientBackground';
import Navbar from '../Navbar';
import { useUIStore } from '../../store/uiStore';
import { useAuth } from '../../context/AuthContext';
import { useScannedProductsStore } from '../../store/scannedProductsStore';
import { ActivityIndicator } from 'react-native';
import ActionSheet from 'react-native-actions-sheet';
import RatingCircle from '../RatingCircle';
import { IP } from '../../Constants';

const ProductScanner = () => {
    const actionSheetRef = useRef(null);
    const device = useCameraDevice('back');
    const { hasPermission, requestPermission } = useCameraPermission();
    const setShowTabs = useUIStore((state) => state.setShowTabs);
    const { user } = useAuth();
    const scannedRef = useRef(false); // Doesn't trigger re-renders
    const { fetchScannedProducts, products, loading } =
        useScannedProductsStore();
    const [scanLoading, setScanLoading] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [cameraOn, setCameraOn] = useState(false);
    const [parsedPros, setParsedPros] = useState([]);
    const [parsedCons, setParsedCons] = useState([]);

    useEffect(() => {
        if (!hasPermission) {
            requestPermission();
        }
    }, []);

    useEffect(() => {
        if (selectedProduct) {
            setParsedPros(JSON.parse(selectedProduct.pros || '[]'));
            setParsedCons(JSON.parse(selectedProduct.cons || '[]'));
        }
    }, [selectedProduct]);

    useEffect(() => {
        if (user?.id) fetchScannedProducts(user.id);
    }, [user?.id]);

    useEffect(() => {
        setShowTabs(!cameraOn);
    }, [cameraOn]);

    const codeScanner = useCodeScanner({
        codeTypes: ['qr', 'ean-13'],
        onCodeScanned: async (codes) => {
            if (scannedRef.current) return;
            if (!codes?.[0]?.value) return;
            scannedRef.current = true; // Prevent immediate future scans

            setScanLoading(true);

            try {
                const user_id = user?.id;
                const upc = codes[0].value;
                const res = await fetch(
                    `http://${IP}:5111/api/product`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ upc, user_id }),
                    }
                );

                const { addProduct } = useScannedProductsStore.getState();

                const json = await res.json();
                if (json.success != "true") {
                    setSelectedProduct(null);
                    actionSheetRef.current?.show();
                    setScanLoading(false);
                    setCameraOn(false);
                    console.log('Scan result:', json);
                    return;
                }
                addProduct(json.data);

                setSelectedProduct(json.data);
                actionSheetRef.current?.show();

                console.log('Scan result:', json);
            } catch (error) {
                console.error('Scan request failed:', error);
            }
            setScanLoading(false);
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
            {scanLoading && (
                <View className="absolute inset-0 bg-black/70 z-50 justify-center items-center">
                    <Text className="text-white text-xl mb-4">Scanning...</Text>
                    <ActivityIndicator size="large" color="#fff" />
                </View>
            )}

            {!cameraOn && (
                <View className="flex-1 justify-center items-center">
                    <View className="flex-row items-center gap-8">
                        <Text className="text-white text-2xl font-semibold">
                            Recent Products
                        </Text>
                        <TouchableOpacity
                            onPress={() => {
                                scannedRef.current = false;
                                setCameraOn(true);
                            }}
                        >
                            <View className="bg-primary p-4 rounded-full flex-row items-center">
                                <Text className="text-white text-xl font-semibold pr-2">
                                    Scan
                                </Text>
                                <Ionicons
                                    name="search"
                                    size={30}
                                    color="white"
                                />
                            </View>
                        </TouchableOpacity>
                    </View>

                    <ScrollView className="w-full px-4 mt-4 z-10">
                        {loading && (
                            <Text className="text-white text-center">
                                Loading...
                            </Text>
                        )}
                        {scanLoading ? (
                            <Text className="text-white text-center">
                                Loading...
                            </Text>
                        ) : (
                            products.map((product) => (
                                <TouchableOpacity
                                    key={product.id}
                                    className="bg-white/10 p-4 rounded-xl mb-3 flex-row"
                                    onPress={() => {
                                        setSelectedProduct(null);
                                        actionSheetRef.current?.show();
                                    }} // need to define
                                >
                                    <Image
                                        source={{ uri: product.image }}
                                        className="w-20 h-20 rounded-lg mr-2"
                                        resizeMode="cover"
                                    />
                                    <View className="flex-1">
                                        <Text className="text-white text-lg font-semibold">
                                            {product.product}
                                        </Text>
                                    </View>
                                    <RatingCircle
                                        size={70}
                                        rating={product.rating}
                                    />
                                </TouchableOpacity>
                            ))
                        )}
                    </ScrollView>
                </View>
            )}
            <ActionSheet
                ref={actionSheetRef}
                snapPoints={[100, '50%']} // Adjust these snap points to fill the screen more
                drawUnderStatusBar={false}
                useBottomSafeAreaPadding
                containerStyle={{
                    backgroundColor: '#1e1e1e', // Avoiding any background gaps
                    borderTopLeftRadius: 20, // Optional: To add rounded corners to the top
                    borderTopRightRadius: 20, // Optional: To add rounded corners to the top
                    marginBottom: 0, // Ensures no white space at the bottom
                }}
            >
                {selectedProduct ? (
                    <View className="px-4 pt-6 bg-[#1e1e1e] rounded-t-2xl">
                        <View className="flex-row mb-2">
                            <Image
                                source={{ uri: selectedProduct.image }}
                                className="w-40 h-58 rounded-xl mr-4"
                                resizeMode="cover"
                            />
                            <View className="flex-1">
                                <Text className="text-white text-xl font-bold">
                                    {selectedProduct.product}
                                </Text>

                                <RatingCircle
                                    size={120}
                                    rating={selectedProduct.rating}
                                />
                            </View>
                        </View>

                        <Text className="text-white text-lg mb-4 ">
                            {selectedProduct.summary}
                        </Text>

                        <View className="mb-4">
                            {parsedPros.map((item, index) => (
                                <Text
                                    key={index}
                                    className="text-white text-base ml-2"
                                >
                                    ✅ {item}
                                </Text>
                            ))}
                            {parsedCons.map((item, index) => (
                                <Text
                                    key={index}
                                    className="text-white text-base ml-2"
                                >
                                    ❌ {item}
                                </Text>
                            ))}
                        </View>
                    </View>
                ) : (
                    <View className="items-center justify-center p-6">
                    <Text className="text-2xl font-semibold text-red-500 mt-4">Something went wrong</Text>
                    <Text className="text-center text-lg text-gray-400 mt-2 mb-20">
                      Make sure this is a valid skincare product.{"\n"}
                      We couldn’t read the product details right now.
                    </Text>
                  </View>
                )}
            </ActionSheet>
        </View>
    );
};

export default ProductScanner;
