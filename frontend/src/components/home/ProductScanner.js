import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Text,
    View,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    Animated,
    Dimensions,
    StatusBar,
} from 'react-native';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import {
    useCameraPermission,
    useCodeScanner,
} from 'react-native-vision-camera';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import GradientBackground from '../GradientBackground';
import Navbar from '../Navbar';
import { useUIStore } from '../../store/uiStore';
import { useAuth } from '../../context/AuthContext';
import { useScannedProductsStore } from '../../store/scannedProductsStore';
import { ActivityIndicator } from 'react-native';
import RatingCircle from '../RatingCircle';
import { IP } from '../../Constants';
import ProductSheet from './ProductSheet';

const { width, height } = Dimensions.get('window');

const ProductScanner = () => {
    const device = useCameraDevice('back');
    const { hasPermission, requestPermission } = useCameraPermission();
    const setShowTabs = useUIStore((state) => state.setShowTabs);
    const { user } = useAuth();
    const scannedRef = useRef(false);
    const { fetchScannedProducts, products, loading } =
        useScannedProductsStore();
    const [scanLoading, setScanLoading] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [cameraOn, setCameraOn] = useState(false);
    const sheetRef = useRef(null);

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;

    useEffect(() => {
        if (!hasPermission) {
            requestPermission();
        }
    }, []);

    useEffect(() => {
        if (user?.id) fetchScannedProducts(user.id);
    }, [user?.id]);

    useEffect(() => {
        setShowTabs(!cameraOn);
    }, [cameraOn]);

    // Animate content on mount
    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const handleScanPress = () => {
        scannedRef.current = false;
        setCameraOn(true);
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
                if (json.success != true) {
                    setSelectedProduct(null);
                    sheetRef.current?.show();
                    setScanLoading(false);
                    setCameraOn(false);
                    return;
                }
                addProduct(json.data);

                setSelectedProduct(json.data);
                sheetRef.current?.show();

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
        <View className="h-full flex-1">
            <GradientBackground />
            <Navbar />

            {/* Camera layer */}
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

                {/* Camera overlay */}
                <View className="flex-1 bg-black/10">
                    <TouchableOpacity
                        onPress={() => setCameraOn(false)}
                        className="absolute top-16 left-5 z-50"
                    >
                        <View className="bg-black/60 rounded-full p-3">
                            <Ionicons
                                name="arrow-back"
                                size={24}
                                color="white"
                            />
                        </View>
                    </TouchableOpacity>

                    {/* Scanning frame */}
                    <View className="absolute top-1/2 left-1/2 w-64 h-64 -mt-32 -ml-32">
                        {/* Corner brackets */}
                        <Text className="absolute -top-14 left-0 right-0 text-center text-white text-lg font-medium">
                            Position barcode within frame
                        </Text>
                        <View className="absolute top-0 left-0 w-8 h-8 border-l-4 border-t-4 border-white rounded-tl-2xl" />
                        <View className="absolute top-0 right-0 w-8 h-8 border-r-4 border-t-4 border-white rounded-tr-2xl" />
                        <View className="absolute bottom-0 left-0 w-8 h-8 border-l-4 border-b-4 border-white rounded-bl-2xl" />
                        <View className="absolute bottom-0 right-0 w-8 h-8 border-r-4 border-b-4 border-white rounded-br-2xl" />
                    </View>
                </View>
            </View>

            {/* Loading overlay */}
            {scanLoading && (
                <Animated.View
                    className="absolute inset-0 bg-black/80 z-50 justify-center items-center"
                    style={{ opacity: fadeAnim }}
                >
                    <View className="items-center bg-white/10 rounded-xl p-8">
                        <ActivityIndicator size="large" color="#fff" />
                        <Text className="text-white text-lg font-semibold mt-4 text-center">
                            Analyzing product...
                        </Text>
                        <View className="flex-row mt-4 gap-2"></View>
                    </View>
                </Animated.View>
            )}

            {!cameraOn && (
                <Animated.View
                    className="flex-1 pt-5"
                    style={{
                        opacity: fadeAnim,
                        transform: [
                            { translateY: slideAnim },
                            { scale: scaleAnim },
                        ],
                    }}
                >
                    {/* Header section */}
                    <View className="flex-row justify-between items-center px-5 mb-5">
                        <Text className="text-white text-3xl font-bold">
                            Recent Products
                        </Text>
                        <TouchableOpacity
                            onPress={handleScanPress}
                            className="bg-primary px-4 py-3 rounded-full flex-row items-center gap-2 shadow-lg shadow-blue-500/30"
                            activeOpacity={0.8}
                        >
                            <Ionicons
                                name="scan-outline"
                                size={20}
                                color="white"
                            />
                            <Text className="text-white text-base font-semibold">
                                Scan Product
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Products list */}
                    <ScrollView
                        className="flex-1"
                        contentContainerStyle={{
                            paddingHorizontal: 20,
                            paddingBottom: 20,
                        }}
                        showsVerticalScrollIndicator={false}
                    >
                        {loading ? (
                            <View className="items-center py-10">
                                <ActivityIndicator size="large" color="#fff" />
                                <Text className="text-white text-lg font-semibold mt-4">
                                    Loading products...
                                </Text>
                            </View>
                        ) : (
                            products.map((product, index) => (
                                <Animated.View
                                    key={product.id}
                                    className="mb-4 rounded-2xl overflow-hidden bg-white/10"
                                    style={{
                                        opacity: fadeAnim,
                                        transform: [
                                            {
                                                translateY:
                                                    slideAnim.interpolate({
                                                        inputRange: [0, 50],
                                                        outputRange: [
                                                            0,
                                                            50 + index * 10,
                                                        ],
                                                    }),
                                            },
                                        ],
                                    }}
                                >
                                    <TouchableOpacity
                                        onPress={() => {
                                            setSelectedProduct(product);
                                            sheetRef.current?.show();
                                        }}
                                        className="flex-row p-4 items-center"
                                        activeOpacity={0.8}
                                    >
                                        {product.image? (<Image
                                            source={{ uri: product.image }}
                                            className="w-16 h-16 rounded-xl mr-4"
                                            resizeMode="cover"
                                        />) : (
                                        <View className="w-16 h-16 bg-slate-300 rounded-xl mr-4 items-center justify-center">
                                            <MaterialCommunityIcons name="hand-wash-outline" size={40} className="items-center justify-center"/> 
                                        </View>)}
                                        <View className="flex-1 mr-4">
                                            <Text
                                                className="text-white text-base font-semibold mb-1"
                                                numberOfLines={2}
                                            >
                                                {product.product}
                                            </Text>
                                            <Text
                                                className="text-white/70 text-sm"
                                                numberOfLines={1}
                                            >
                                                {product.brand}
                                            </Text>
                                        </View>
                                        <View className="items-center">
                                            <RatingCircle
                                                size={50}
                                                rating={product.rating}
                                            />
                                        </View>
                                    </TouchableOpacity>
                                </Animated.View>
                            ))
                        )}
                    </ScrollView>
                </Animated.View>
            )}

            <ProductSheet selectedProduct={selectedProduct} ref={sheetRef} />
        </View>
    );
};

export default ProductScanner;
