import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
    ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import GradientBackground from '../GradientBackground';
import Navbar from '../Navbar';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../supabase/supabase';
import { getScoreColor } from '../../utils/helpers';

const FaceAnalyzer = () => {
    const navigation = useNavigation();
    const { user } = useAuth();
    const userName = user?.name;
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

    // Mock recent scans data
    const recentScanss = [
        {
            id: 1,
            overall: 85,
            date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            imageUri: null,
        },
        {
            id: 2,
            overall: 78,
            date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            imageUri: null,
        },
        {
            id: 3,
            overall: 82,
            date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            imageUri: null,
        },
        {
            id: 4,
            overall: 74,
            date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            imageUri: null,
        },
    ];

    const fetchRecentResults = async () => {
        if (recentScans && recentScans.length > 0) {
            setHasRecentScan(true);

            const currentScan = recentScans[0];

            // Helper function to determine trend
            const getTrend = (current, previous) => {
                const difference = current - previous;

                if (difference == 0) {
                    return 'stable';
                } else if (difference < 0) {
                    return 'down';
                } else {
                    return 'up';
                }
            };

            // Create updated metrics array
            const updatedMetrics = [...skinMetrics];

            // Update values
            updatedMetrics[0].value = currentScan.data.redness || 0;
            updatedMetrics[1].value = currentScan.data.hydration || 0;
            updatedMetrics[2].value = currentScan.data.acne || 0;
            updatedMetrics[3].value = currentScan.data.overall || 0;

            // Get trends if previous scan data
            if (recentScans.length > 1) {
                const previousScan = recentScans[1];
                console.log('Previous scan data:', previousScan.data);

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
                // No previous data, so set trends to stable
                updatedMetrics.forEach((metric) => {
                    metric.trend = 'stable';
                });
            }

            setSkinMetrics(updatedMetrics);

            console.log('Updated skin metrics:', updatedMetrics);
        } else {
            console.log('No recent scans found');
            setHasRecentScan(false);

            // Reset to default values when no data
            const resetMetrics = skinMetrics.map((metric) => ({
                ...metric,
                value: 0,
                trend: 'stable',
            }));
            setSkinMetrics(resetMetrics);
        }
    };

    const handleScanPress = async () => {
        // Handle face scan button press
        navigation.navigate('ImagePicker');
    };

    const handleMetricPress = (metric) => {
        // Handle metric card press 
        console.log(`Viewing ${metric} chart details`);
        navigation.navigate('Charts', { selectedMetric: metric.toLowerCase() });
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

            if (scansError) {
                throw scansError;
            }

            const scansWithUrls = await Promise.all(
                scans.map(async (scan) => {
                    let signedUrl = null;

                    if (scan.image_path) {
                        try {
                            const { data: urlData, error: urlError } =
                                await supabase.storage
                                    .from('face-images')
                                    .createSignedUrl(scan.image_path, 3600); // 1 hour

                            if (urlError) {
                                console.error(
                                    'Signed URL error for scan',
                                    scan.id,
                                    ':',
                                    urlError
                                );
                            } else if (urlData && urlData.signedUrl) {
                                signedUrl = urlData.signedUrl;
                            } else {
                                console.warn(
                                    'No signed URL data returned for scan',
                                    scan.id
                                );
                            }
                        } catch (urlError) {
                            console.error(
                                'Exception generating signed URL for scan:',
                                scan.id,
                                urlError
                            );
                        }
                    } else {
                        console.log('No image_path for scan:', scan.id);
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

    useFocusEffect(
        React.useCallback(() => {
            if (user?.id) {
                fetchRecentScans();
            }
        }, [user?.id])
    );

    useEffect(() => {
        fetchRecentResults();
    }, [recentScans]);

    const handleRecentScanPress = (scan) => {
        // Handle recent scan press - will navigate to scan result screen later
        navigation.navigate('ScanResults', {
            scanImage: scan.image_url,
            scanResults: scan.data,
        });
        console.log(scan);
    };

    const renderRecentScansContent = () => {
        if (loadingScans) {
            return (
                <View className="items-center justify-center py-8">
                    <ActivityIndicator size="small" color="#8B5CF6" />
                    <Text className="text-gray-400 text-sm mt-2">
                        Loading scans...
                    </Text>
                </View>
            );
        }

        if (scanError) {
            return (
                <View className="items-center justify-center py-8">
                    <Text className="text-red-400 text-sm mb-2">
                        Failed to load scans
                    </Text>
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
                    <Text className="text-gray-400 text-sm mt-2">
                        No scans yet
                    </Text>
                    <Text className="text-gray-500 text-xs">
                        Take your first scan to get started
                    </Text>
                </View>
            );
        }

        return (
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="-mx-2"
            >
                {recentScans.map((scan) => (
                    <TouchableOpacity
                        key={scan.id}
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
                                    <Text className="text-white text-xs font-bold">
                                        SCAN
                                    </Text>
                                </View>
                            )}

                            {/* Score overlay */}
                            {scan.data.overall && (
                                <View className="absolute top-1 left-1 bg-black/90 rounded px-1">
                                    <Text
                                        className="text-sm font-bold"
                                        style={{
                                            color: getScoreColor(
                                                scan.data.overall
                                            ),
                                        }}
                                    >
                                        {Math.round(scan.data.overall)}
                                    </Text>
                                </View>
                            )}

                            {/* Date at bottom */}
                            <View className="absolute bottom-0 left-0 right-0 bg-black/40 px-1">
                                <Text className="text-white font-semibold text-sm text-center">
                                    {scan.data.date.getMonth() + 1}/
                                    {scan.data.date.getDate()}
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        );
    };

    const getTrendIcon = (trend) => {
        switch (trend) {
            case 'up':
                return 'trending-up';
            case 'down':
                return 'trending-down';
            case 'stable':
            default:
                return 'remove-outline';
        }
    };

    const getTrendColor = (trend) => {
        switch (trend) {
            case 'up':
                return '#10B981';
            case 'down':
                return '#EF4444';
            case 'stable':
            default:
                return '#6B7280';
        }
    };
    return (
        <View className="h-full">
            <GradientBackground />
            <Navbar />

            {/* Scrollable Content */}
            <ScrollView
                className="flex-1 px-6"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                {/* Greeting */}
                <View className="mb-6 ml-4">
                    <Text className="text-white text-2xl font-semibold">
                        Hey {userName},
                    </Text>
                    <Text className="text-gray-400 text-base">
                        {hasRecentScan
                            ? 'Ready for your daily scan?'
                            : 'Take your first scan to get started'}
                    </Text>
                </View>

                {/* Scan Button Area */}
                <TouchableOpacity
                    onPress={handleScanPress}
                    className="bg-[#201e23] rounded-2xl p-6 mb-6 border border-[#332f38]"
                    activeOpacity={0.8}
                >
                    <View className="items-center">
                        <View className="bg-purple-600 w-20 h-20 rounded-full items-center justify-center mb-4">
                            <Icon name="camera" size={32} color="white" />
                        </View>
                        <Text className="text-white text-lg font-semibold mb-2">
                            Start Face Analysis
                        </Text>
                        <Text className="text-gray-400 text-center">
                            Tap to analyze your skin condition and track
                            improvements
                        </Text>
                    </View>
                </TouchableOpacity>

                {/* Charts Section */}
                <View className="bg-[#201e23] rounded-2xl p-6 mb-6 border border-[#332f38]">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-white text-xl font-semibold">
                            Your Charts
                        </Text>
                        <TouchableOpacity onPress={() => navigation.navigate("Charts")}>
                            <Icon
                                name="chevron-forward"
                                size={20}
                                color="#9CA3AF"
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Show empty state if no scans, otherwise show metrics */}
                    {!hasRecentScan ? (
                        <View className="items-center justify-center py-8">
                            <Icon
                                name="analytics-outline"
                                size={48}
                                color="#6B7280"
                            />
                            <Text className="text-gray-400 text-lg mt-3">
                                No Data Yet
                            </Text>
                            <Text className="text-gray-500 text-sm text-center mt-1">
                                Take your first scan to see your skin metrics
                            </Text>
                        </View>
                    ) : (
                        /* Metrics Grid */
                        <View className="flex-row flex-wrap -mx-2">
                            {skinMetrics.map((metric, index) => (
                                <TouchableOpacity
                                    key={metric.name}
                                    onPress={() =>
                                        handleMetricPress(metric.name)
                                    }
                                    className="w-1/2 px-2 mb-4"
                                    activeOpacity={0.7}
                                >
                                    <View className="bg-[#413c48] rounded-xl p-4">
                                        <View className="flex-row justify-between items-center mb-2">
                                            <Text className="text-gray-300 text-sm">
                                                {metric.name}
                                            </Text>
                                            <Icon
                                                name={getTrendIcon(
                                                    metric.trend
                                                )}
                                                size={16}
                                                color={getTrendColor(
                                                    metric.trend
                                                )}
                                            />
                                        </View>
                                        <Text className="text-white text-2xl font-bold">
                                            {Math.round(metric.value)}%
                                        </Text>
                                        <View className="bg-gray-600 h-2 rounded-full mt-2">
                                            <View
                                                className="h-2 rounded-full"
                                                style={{
                                                    width: `${Math.min(
                                                        metric.value,
                                                        100
                                                    )}%`,
                                                    backgroundColor:
                                                        metric.color,
                                                }}
                                            />
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>

                {/* Recent Scans */}
                <View className="bg-[#201e23] rounded-2xl p-6 border border-[#332f38]">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-white text-xl font-semibold">
                            Recent Scans
                        </Text>
                    </View>

                    {renderRecentScansContent()}
                </View>

                {/* Daily Tip Section */}
                <View className="bg-gradient-to-r from-purple-900 to-purple-800 rounded-2xl p-6 mt-6">
                    <Text className="text-white text-lg font-semibold mb-2">
                        💡 Daily Tip
                    </Text>
                    <Text className="text-purple-200">
                        Apply sunscreen 15-30 minutes before going outside for
                        optimal protection against UV damage.
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
};

export default FaceAnalyzer;
