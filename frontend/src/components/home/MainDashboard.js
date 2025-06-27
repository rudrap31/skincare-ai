import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Animated,
    Dimensions,
    Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import GradientBackground from '../GradientBackground';
import Navbar from '../Navbar';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../supabase/supabase';
import { getScoreColor } from '../../utils/helpers';
import { useScannedProductsStore } from '../../store/scannedProductsStore';
import RatingCircle from '../RatingCircle';
import ProductSheet from './ProductSheet';
import ProductScanner from './ProductScanner';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const MainDashboard = ({ route }) => {
    const navigation = useNavigation();
    const { user } = useAuth();
    const userName = user?.name;
    
    // Face Analysis State
    const [hasRecentScan, setHasRecentScan] = useState(false);
    const [loadingScans, setLoadingScans] = useState(false);
    const [recentScans, setRecentScans] = useState([]);
    const [scanError, setScanError] = useState(false);
    const [skinMetrics, setSkinMetrics] = useState([
        { name: 'Redness', value: 0, trend: 'stable', color: '#8B5CF6' },
        { name: 'Hydration', value: 0, trend: 'stable', color: '#06B6D4' },
        { name: 'Acne', value: 0, trend: 'stable', color: '#EF4444' },
        { name: 'Overall', value: 0, trend: 'stable', color: '#10B981' },
    ]);

    // Product Scanner State
    const { fetchScannedProducts, products, loading } = useScannedProductsStore();
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showProductListModal, setShowProductListModal] = useState(false);
    const sheetRef = useRef(null);

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;

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

    // Face Analysis Functions
    const fetchRecentResults = async () => {
        if (recentScans && recentScans.length > 0) {
            setHasRecentScan(true);

            const currentScan = recentScans[0];

            const getTrend = (current, previous) => {
                const difference = current - previous;
                if (difference == 0) return 'stable';
                else if (difference < 0) return 'down';
                else return 'up';
            };

            const updatedMetrics = [...skinMetrics];
            updatedMetrics[0].value = currentScan.data.redness || 0;
            updatedMetrics[1].value = currentScan.data.hydration || 0;
            updatedMetrics[2].value = currentScan.data.acne || 0;
            updatedMetrics[3].value = currentScan.data.overall || 0;

            if (recentScans.length > 1) {
                const previousScan = recentScans[1];
                updatedMetrics[0].trend = getTrend(
                    currentScan.data.redness || 0,
                    previousScan.data.redness || 0
                );
                updatedMetrics[1].trend = getTrend(
                    currentScan.data.hydration || 0,
                    previousScan.data.hydration || 0
                );
                updatedMetrics[2].trend = getTrend(
                    currentScan.data.acne || 0,
                    previousScan.data.acne || 0
                );
                updatedMetrics[3].trend = getTrend(
                    currentScan.data.overall || 0,
                    previousScan.data.overall || 0
                );
            } else {
                updatedMetrics.forEach((metric) => {
                    metric.trend = 'stable';
                });
            }

            setSkinMetrics(updatedMetrics);
        } else {
            setHasRecentScan(false);
            const resetMetrics = skinMetrics.map((metric) => ({
                ...metric,
                value: 0,
                trend: 'stable',
            }));
            setSkinMetrics(resetMetrics);
        }
    };

    const fetchRecentScans = async () => {
        try {
            setLoadingScans(true);
            const { data: scans, error: scansError } = await supabase
                .from('scanned_faces')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(5);

            if (scansError) throw scansError;

            const scansWithUrls = await Promise.all(
                scans.map(async (scan) => {
                    let signedUrl = null;

                    if (scan.image_path) {
                        try {
                            const { data: urlData, error: urlError } =
                                await supabase.storage
                                    .from('face-images')
                                    .createSignedUrl(scan.image_path, 3600);

                            if (!urlError && urlData?.signedUrl) {
                                signedUrl = urlData.signedUrl;
                            }
                        } catch (urlError) {
                            console.error('Exception generating signed URL:', urlError);
                        }
                    }

                    return {
                        data: {
                            ...scan,
                            date: new Date(scan.created_at),
                        },
                        image_url: signedUrl,
                    };
                })
            );

            setRecentScans(scansWithUrls);
        } catch (error) {
            console.error('Error fetching recent scans:', error);
            setScanError(error.message);
        } finally {
            setLoadingScans(false);
        }
    };

    // Event Handlers
    const handleScanPress = () => {
        navigation.navigate('ImagePicker');
    };

    const handleMetricPress = (metric) => {
        navigation.navigate('Charts', { selectedMetric: metric.toLowerCase() });
    };

    const handleRecentScanPress = (scan) => {
        navigation.navigate('ScanResults', {
            scanImage: scan.image_url,
            scanResults: scan.data,
        });
    };

    const handleProductPress = (product) => {
        setSelectedProduct(product);
        sheetRef.current?.show();
    };

    const handleRefreshScans = () => {
        setScanError(false);
        fetchRecentScans();
    };

    const handleShowAllProducts = () => {
        setShowProductListModal(true);
    };

    // Effects
    useFocusEffect(
        React.useCallback(() => {
            if (user?.id) {
    //            fetchRecentScans();
                fetchScannedProducts(user.id);
            }
            
            // Handle scanned product from ProductScanner screen
            if (route.params?.hasOwnProperty('scannedProduct') && route.params.scannedProduct !== undefined) {
                const scannedProduct = route.params?.scannedProduct;
                setSelectedProduct(scannedProduct);
                sheetRef.current?.show();
                navigation.setParams({ scannedProduct: undefined });
            }
        }, [user?.id, route.params?.scannedProduct])
    );


    useEffect(() => {
        fetchRecentResults();
    }, [recentScans]);

    // Helper Functions
    const getTrendIcon = (trend) => {
        switch (trend) {
            case 'up': return 'trending-up';
            case 'down': return 'trending-down';
            case 'stable':
            default: return 'remove-outline';
        }
    };

    const getTrendColor = (trend) => {
        switch (trend) {
            case 'up': return '#10B981';
            case 'down': return '#EF4444';
            case 'stable':
            default: return '#6B7280';
        }
    };

    // Render Functions
    const renderRecentScansContent = () => {
        if (loadingScans) {
            return (
                <View className="items-center justify-center py-8">
                    <ActivityIndicator size="small" color="#8B5CF6" />
                    <Text className="text-gray-400 text-sm mt-2">Loading scans...</Text>
                </View>
            );
        }

        if (scanError) {
            return (
                <View className="items-center justify-center py-8">
                    <Text className="text-red-400 text-sm mb-2">Failed to load scans</Text>
                    <TouchableOpacity
                        onPress={handleRefreshScans}
                        className="bg-purple-600 px-4 py-2 rounded-lg"
                    >
                        <Text className="text-white text-sm">Retry</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        if (recentScans.length === 0) {
            return (
                <View className="items-center justify-center py-8">
                    <Icon name="camera-outline" size={32} color="#6B7280" />
                    <Text className="text-gray-400 text-lg mt-2">No scans yet</Text>
                    <Text className="text-gray-500 text-sm">Take your first scan to get started</Text>
                </View>
            );
        }

        return (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-2">
                {recentScans.map((scan) => (
                    <TouchableOpacity
                        key={scan.data.id}
                        onPress={() => handleRecentScanPress(scan)}
                        className="mx-2"
                        activeOpacity={0.8}
                    >
                        <View className="w-28 h-28 bg-gray-700 rounded-xl relative overflow-hidden">
                            {scan.image_url ? (
                                <Image
                                    source={{ uri: scan.image_url }}
                                    className="w-full h-full"
                                    resizeMode="cover"
                                />
                            ) : (
                                <View className="w-full h-full bg-gradient-to-br from-purple-600 to-blue-600 items-center justify-center">
                                    <Text className="text-white text-xs font-bold">SCAN</Text>
                                </View>
                            )}
                            
                            {scan.data.overall && (
                                <View className="absolute top-1 left-1 bg-black/90 rounded px-1">
                                    <Text
                                        className="text-sm font-bold"
                                        style={{ color: getScoreColor(scan.data.overall) }}
                                    >
                                        {Math.round(scan.data.overall)}
                                    </Text>
                                </View>
                            )}
                            
                            <View className="absolute bottom-0 left-0 right-0 bg-black/40 px-1">
                                <Text className="text-white font-semibold text-sm text-center">
                                    {scan.data.date.getMonth() + 1}/{scan.data.date.getDate()}
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        );
    };

    const renderRecentProducts = () => {
        if (loading) {
            return (
                <View className="items-center py-6">
                    <ActivityIndicator size="small" color="#8B5CF6" />
                    <Text className="text-gray-400 text-sm mt-2">Loading products...</Text>
                </View>
            );
        }

        if (products.length === 0) {
            return (
                <View className="items-center justify-center py-8">
                    <Icon name="scan-outline" size={32} color="#6B7280" />
                    <Text className="text-gray-400 text-sm mt-2">No products scanned</Text>
                    <Text className="text-gray-500 text-xs">Scan your first product to get started</Text>
                </View>
            );
        }

        return (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-2">
                {products.slice(0, 5).map((product, index) => (
                    <TouchableOpacity
                        key={product.id}
                        onPress={() => handleProductPress(product)}
                        className="mx-2"
                        activeOpacity={0.8}
                    >
                        <View className="w-32 bg-gray-700 rounded-xl p-3">
                            {product.image ? (
                                <Image
                                    source={{ uri: product.image }}
                                    className="w-full h-32 rounded-lg mb-2"
                                    resizeMode="cover"
                                />
                            ) : (
                                <View className="w-full h-20 bg-slate-300 rounded-lg mb-2 items-center justify-center">
                                    <MaterialCommunityIcons 
                                        name="hand-wash-outline" 
                                        size={24} 
                                        color="#6B7280"
                                    />
                                </View>
                            )}
                            <Text className="text-white text-xs font-medium mb-1" numberOfLines={2}>
                                {product.product}
                            </Text>
                            <Text className="text-gray-400 text-xs mb-2" numberOfLines={1}>
                                {product.brand}
                            </Text>
                            <View className="items-center">
                                <RatingCircle size={50} rating={product.rating} />
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        );
    };

    // Render Product List Modal
    const renderProductListModal = () => (
        <Modal
            visible={showProductListModal}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowProductListModal(false)}
        >
            {/* Backdrop overlay */}
            <View className="flex-1 bg-black/50 justify-center items-center p-4">
                {/* Modal content container */}
                <View className="bg-[#161b21] rounded-xl w-full max-w-lg h-5/6 shadow-2xl">
                    {/* Header with close button */}
                    <View className="flex-row justify-between items-center p-4 mx-2 mt-2">
                        <Text className="text-white text-xl font-semibold">Recently Scanned Products</Text>
                        <TouchableOpacity
                            className="p-2 bg-gray-800 rounded-full"
                            onPress={() => setShowProductListModal(false)}
                        >
                             <Icon name="close" size={20} color="white" />
                        </TouchableOpacity>
                    </View>
                    
                    {/* Modal body content */}
                    <ScrollView
                        className="flex-1 p-4"
                        contentContainerStyle={{
                            
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
                                    className="mb-4 rounded-2xl bg-[#2f343a]"
                                    
                                >
                                    <TouchableOpacity
                                        onPress={() => handleProductPress(product)}
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
                                            
                                        </View>
                                    </TouchableOpacity>
                                </Animated.View>
                            ))
                        )}
                    </ScrollView>
                </View>
            </View>
            <ProductSheet selectedProduct={selectedProduct} ref={sheetRef} />
        </Modal>
    ); 
    // if (showProductScanner) {
    //     return (
    //         <ProductScanner 
    //             onProductScanned={(product) => {
    //                 setSelectedProduct(product);
    //                 setShowProductScanner(false);
    //                 if (product) {
    //                     sheetRef.current?.show();
    //                 }
    //             }}
    //         />
    //     );
    // }

    return (
        <View className="h-full">
            <GradientBackground />

            <ScrollView
                className="flex-1 px-6"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                <Navbar />
                
                {/* Greeting */}
                <Animated.View 
                    className="mb-6 ml-4"
                    style={{
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }]
                    }}
                >
                    <Text className="text-white text-2xl font-semibold">
                        Hey {userName},
                    </Text>
                    <Text className="text-gray-400 text-base">
                        {hasRecentScan
                            ? 'Ready for your daily scan?'
                            : 'Take your first scan to get started'}
                    </Text>
                </Animated.View>

                {/* Quick Actions */}
                <Animated.View 
                    className="flex-row mb-6 gap-3"
                    style={{
                        opacity: fadeAnim,
                        transform: [{ scale: scaleAnim }]
                    }}
                >
                    <TouchableOpacity
                        onPress={handleScanPress}
                        className="flex-1 bg-gray-800/50 rounded-2xl p-4"
                        activeOpacity={0.8}
                    >
                        <View className="items-center">
                            <View className="bg-purple-600 w-12 h-12 rounded-full items-center justify-center mb-2">
                                <Icon name="camera" size={20} color="white" />
                            </View>
                            <Text className="text-white text-sm font-semibold">Face Analysis</Text>
                        </View>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                        onPress={() => navigation.navigate("BarcodePicker")}
                        className="flex-1 bg-gray-800/50 rounded-2xl p-4"
                        activeOpacity={0.8}
                    >
                        <View className="items-center">
                            <View className="bg-blue-600 w-12 h-12 rounded-full items-center justify-center mb-2">
                                <Icon name="scan-outline" size={20} color="white" />
                            </View>
                            <Text className="text-white text-sm font-semibold">Scan Product</Text>
                        </View>
                    </TouchableOpacity>
                </Animated.View>

                {/* Skin Metrics */}
                <Animated.View 
                    className="bg-gray-800/50 rounded-2xl p-6 mb-6"
                    style={{
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }]
                    }}
                >
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-white text-xl font-semibold">Your Skin</Text>
                        <TouchableOpacity onPress={() => navigation.navigate("Charts")}>
                            <Icon name="chevron-forward" size={20} color="#9CA3AF" />
                        </TouchableOpacity>
                    </View>

                    {!hasRecentScan ? (
                        <View className="items-center justify-center py-8">
                            <Icon name="analytics-outline" size={48} color="#6B7280" />
                            <Text className="text-gray-400 text-lg mt-3">No Data Yet</Text>
                            <Text className="text-gray-500 text-sm text-center mt-1">
                                Take your first scan to see your skin metrics
                            </Text>
                        </View>
                    ) : (
                        <View className="flex-row flex-wrap -mx-2">
                            {skinMetrics.map((metric) => (
                                <TouchableOpacity
                                    key={metric.name}
                                    onPress={() => handleMetricPress(metric.name)}
                                    className="w-1/2 px-2 mb-4"
                                    activeOpacity={0.7}
                                >
                                    <View className="bg-gray-700 rounded-xl p-4">
                                        <View className="flex-row justify-between items-center mb-2">
                                            <Text className="text-gray-300 text-sm">{metric.name}</Text>
                                            <Icon
                                                name={getTrendIcon(metric.trend)}
                                                size={16}
                                                color={getTrendColor(metric.trend)}
                                            />
                                        </View>
                                        <Text className="text-white text-2xl font-bold">
                                            {Math.round(metric.value)}%
                                        </Text>
                                        <View className="bg-gray-600 h-2 rounded-full mt-2">
                                            <View
                                                className="h-2 rounded-full"
                                                style={{
                                                    width: `${Math.min(metric.value, 100)}%`,
                                                    backgroundColor: metric.color,
                                                }}
                                            />
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </Animated.View>

                {/* Recent Scans */}
                <Animated.View 
                    className="bg-gray-800/50 rounded-2xl p-6 mb-6"
                    style={{
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }]
                    }}
                >
                    <Text className="text-white text-xl font-semibold mb-4">Recent Scans</Text>
                    {renderRecentScansContent()}
                </Animated.View>

                {/* Recent Products */}
                <Animated.View 
                    className="bg-gray-800/50 rounded-2xl p-6 mb-6"
                    style={{
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }]
                    }}
                >
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-white text-xl font-semibold">Recent Products</Text>
                        <TouchableOpacity onPress={handleShowAllProducts}>
                            <Icon name="chevron-forward" size={20} color="#9CA3AF" />
                        </TouchableOpacity>
                    </View>
                    {renderRecentProducts()}
                </Animated.View>

                {/* Daily Tip */}
                <Animated.View 
                    className="bg-gradient-to-r from-purple-900 to-purple-800 rounded-2xl p-6"
                    style={{
                        opacity: fadeAnim,
                        transform: [{ scale: scaleAnim }]
                    }}
                >
                    <Text className="text-white text-lg font-semibold mb-2">💡 Daily Tip</Text>
                    <Text className="text-purple-200">
                        Apply sunscreen 15-30 minutes before going outside for optimal protection against UV damage.
                    </Text>
                </Animated.View>
            </ScrollView>

            {/* Product List Modal */}
            {renderProductListModal()}

            <ProductSheet selectedProduct={selectedProduct} ref={sheetRef} />
        </View>
    );
};

export default MainDashboard;