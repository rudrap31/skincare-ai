import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import GradientBackground from '../GradientBackground';
import Navbar from '../Navbar';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import ImagePickerExample from './ImagePicker';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../supabase/supabase';
import { getScoreColor } from '../../utils/helpers';

const FaceAnalyzer = () => {
    // Mock data
    const navigation = useNavigation();
    const userName = 'Sarah';
    const hasRecentScan = false; // Change to true later with context
    const { user } = useAuth();
    const [loadingScans, setLoadingScans] = useState(false);
    const [recentScans, setRecentScans] = useState([]);
    const [scanError, setScanError] = useState(false)

    const skinMetrics = [
        { name: 'Redness', value: 65, trend: 'up', color: '#8B5CF6' },
        { name: 'Hydration', value: 78, trend: 'up', color: '#06B6D4' },
        { name: 'Acne', value: 45, trend: 'down', color: '#EF4444' },
        { name: 'Overall', value: 72, trend: 'up', color: '#10B981' },
    ];

    // Mock recent scans with photos and scores
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

    const handleScanPress = async () => {
        // Handle face scan button press
        console.log('Starting face scan...');

        navigation.navigate('ImagePicker');
    };

    const handleMetricPress = (metric) => {
        // Handle metric card press - navigate to detailed chart
        console.log(`Viewing ${metric} chart details`);
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
                      const { data: urlData, error: urlError } = await supabase.storage
                        .from('face-images') 
                        .createSignedUrl(scan.image_path, 3600); // 1 hour
                      
                      if (urlError) {
                        console.error('Signed URL error for scan', scan.id, ':', urlError);
                      } else if (urlData && urlData.signedUrl) {
                        signedUrl = urlData.signedUrl;
                      } else {
                        console.warn('No signed URL data returned for scan', scan.id);
                      }
                    } catch (urlError) {
                      console.error('Exception generating signed URL for scan:', scan.id, urlError);
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
                                    <Text className="text-sm font-bold"
                                    style={{ color: getScoreColor(scan.data.overall) }}>
                                        {Math.round(scan.data.overall)}
                                    </Text>
                                </View>
                            )}

                            {/* Date at bottom */}
                            <View className="absolute bottom-0 left-0 right-0 bg-black/40 px-1">
                                <Text className="text-white font-semibold text-sm text-center">
                                    
                                    {scan.data.date.getMonth() + 1}/{scan.data.date.getDate()}
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}

                {/* Add more scans indicator */}
                <TouchableOpacity
                    className="mx-2 items-center justify-center"
                    onPress={() => navigation.navigate('ScanHistory')} // Optional: navigate to full scan history
                >
                    <View className="w-28 h-28 bg-gray-700/50 rounded-xl items-center justify-center border-2 border-dashed border-gray-600">
                        <Icon
                            name="chevron-forward"
                            size={24}
                            color="#9CA3AF"
                        />
                    </View>
                </TouchableOpacity>
            </ScrollView>
        );
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
                            : 'Scan to get started'}
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
                        <TouchableOpacity>
                            <Icon
                                name="chevron-forward"
                                size={20}
                                color="#9CA3AF"
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Metrics Grid */}
                    <View className="flex-row flex-wrap -mx-2">
                        {skinMetrics.map((metric, index) => (
                            <TouchableOpacity
                                key={metric.name}
                                onPress={() => handleMetricPress(metric.name)}
                                className="w-1/2 px-2 mb-4"
                                activeOpacity={0.7}
                            >
                                <View className="bg-[#413c48] rounded-xl p-4">
                                    <View className="flex-row justify-between items-center mb-2">
                                        <Text className="text-gray-300 text-sm">
                                            {metric.name}
                                        </Text>
                                        <Icon
                                            name={
                                                metric.trend === 'up'
                                                    ? 'trending-up'
                                                    : 'trending-down'
                                            }
                                            size={16}
                                            color={
                                                metric.trend === 'up'
                                                    ? '#10B981'
                                                    : '#EF4444'
                                            }
                                        />
                                    </View>
                                    <Text className="text-white text-2xl font-bold">
                                        {metric.value}%
                                    </Text>
                                    <View className="bg-gray-600 h-2 rounded-full mt-2">
                                        <View
                                            className="h-2 rounded-full"
                                            style={{
                                                width: `${metric.value}%`,
                                                backgroundColor: metric.color,
                                            }}
                                        />
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
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

                {/* Daily Tip Section (Optional) */}
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
