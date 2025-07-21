import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { LineChart } from 'react-native-chart-kit';
import GradientBackground from '../GradientBackground';
import Navbar from '../Navbar';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../supabase/supabase';

const { width: screenWidth } = Dimensions.get('window');

const ChartsPage = ({ route, navigation }) => {
    const { selectedMetric: initialMetric = 'overall' } = route?.params || {};
    const { user } = useAuth();
    const [selectedMetric, setSelectedMetric] = useState(initialMetric);
    const [timeRange, setTimeRange] = useState('30d');
    const [chartData, setChartData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({});

    const timeRanges = [
        { label: '7D', value: '7d', days: 7 },
        { label: '1M', value: '30d', days: 30 },
        { label: '3M', value: '90d', days: 90 },
        { label: '6M', value: '180d', days: 180 },
        { label: '1Y', value: '365d', days: 365 }
    ];

    const metrics = [
        { key: 'overall', name: 'Overall', color: '#10B981' },
        { key: 'redness', name: 'Redness', color: '#8B5CF6' },
        { key: 'hydration', name: 'Hydration', color: '#06B6D4' },
        { key: 'acne', name: 'Acne', color: '#EF4444' },
    ];

    const fetchChartData = async () => {
        try {
            setLoading(true);
            setError(null);

            const selectedTimeRange = timeRanges.find(range => range.value === timeRange);
            const daysAgo = selectedTimeRange?.days || 30;
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - daysAgo);

            // Fetch scans 
            const { data: scans, error: scansError } = await supabase
                .from('scanned_faces')
                .select(`
                    id,
                    created_at,
                    overall,
                    redness,
                    hydration,
                    acne
                `)
                .eq('user_id', user.id)
                .gte('created_at', startDate.toISOString())
                .order('created_at', { ascending: true });

            if (scansError) throw scansError;

            // If we don't have enough data points for the time range, fall back to last N scans
            if (!scans || scans.length < 3) {                
                const { data: fallbackScans, error: fallbackError } = await supabase
                    .from('scanned_faces')
                    .select(`
                        id,
                        created_at,
                        overall,
                        redness,
                        hydration,
                        acne
                    `)
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(5);

                if (fallbackError) throw fallbackError;
                
                // Reverse for chronological order
                const processedScans = (fallbackScans || []).reverse();
                processChartData(processedScans, true);
            } else {
                processChartData(scans, false);
            }

        } catch (error) {
            console.error('Error fetching chart data:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const processChartData = (scans, isFallback = false) => {
        if (!scans || scans.length === 0) {
            setChartData(null);
            setStats({});
            return;
        }
    
        const processedData = {};
        const calculatedStats = {};
    
        metrics.forEach(metric => {
            const values = scans.map(scan => scan[metric.key] || 0);
            
            
    
            // Create evenly spaced labels (max 5)
            const maxLabels = 7;
            let displayLabels;
            
            if (scans.length <= maxLabels) {
                // Show all labels if we have few data points
                displayLabels = scans.map(scan => {
                    const date = new Date(scan.created_at);
                    return `${date.getMonth() + 1}/${date.getDate()}`;
                });
            } else {
                // Show evenly spaced labels
                displayLabels = scans.map((scan, index) => {
                    const date = new Date(scan.created_at);
                    const shouldShow = index === 0 || 
                                     index === scans.length - 1 || 
                                     index % Math.floor(scans.length / (maxLabels - 2)) === 0;
                    return shouldShow ? `${date.getMonth() + 1}/${date.getDate()}` : '';
                });
            }
    
            processedData[metric.key] = {
                labels: displayLabels,
                datasets: [{
                    data: values, // Only use actual data points, no padding
                    strokeWidth: 3,
                    color: (opacity = 1) => {
                        const hex = metric.color.replace('#', '');
                        const r = parseInt(hex.substr(0, 2), 16);
                        const g = parseInt(hex.substr(2, 2), 16);
                        const b = parseInt(hex.substr(4, 2), 16);
                        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
                    },
                    withDots: true, // Show dots on actual data points
                }]
            };
    
            // Stats calculation 
            const currentValue = values[values.length - 1] || 0;
            const previousValue = values[values.length - 2] || currentValue;
            const change = values.length > 1 ? currentValue - previousValue : 0;
            const changePercent = previousValue !== 0 ? ((change / previousValue) * 100).toFixed(1) : '0';
            const trend = change >= 0 ? 'up' : 'down';
    
            calculatedStats[metric.key] = {
                current: Math.round(currentValue),
                change: changePercent,
                trend: trend,
                changeText: `${change >= 0 ? '+' : ''}${changePercent}%`
            };
        });
    
        setChartData(processedData);
        setStats(calculatedStats);
    };

    useEffect(() => {
        if (user?.id) {
            fetchChartData();
        }
    }, [user?.id, timeRange]);

    const getCurrentMetricData = () => {
        return metrics.find(m => m.key === selectedMetric);
    };

    const getCurrentStats = () => {
        return stats[selectedMetric] || { current: 0, change: '0', trend: 'up', changeText: '+0%' };
    };

    const getDynamicChartConfig = (yAxisMin = 0, yAxisMax = 100) => {
        const currentMetric = getCurrentMetricData();
        
        return {
            decimalPlaces: 0,
            color: (opacity = 1) => {
                const hex = currentMetric?.color.replace('#', '') || '8B5CF6';
                const r = parseInt(hex.substring(0, 2), 16);
                const g = parseInt(hex.substring(2, 2), 16);
                const b = parseInt(hex.substring(4, 2), 16);
                return `rgba(${r}, ${g}, ${b}, ${opacity})`;
            },
            labelColor: (opacity = 1) => `rgba(156, 163, 175, ${opacity})`,
            style: {
                borderRadius: 16,
            },
            // Even Y-axis distribution with custom range
            segments: 4, // For 5 Y-axis labels
            formatYLabel: (value) => {
                return Math.round(parseFloat(value)).toString();
            },
            // Custom Y-axis range
            fromZero: false,
            yAxisSuffix: '',
            // Set the Y-axis bounds
            yAxisInterval: 1,
            // Custom styling for labels
            propsForHorizontalLabels: {
                fontSize: 12,
            },
            propsForVerticalLabels: {
                fontSize: 11,
            },
            paddingLeft: 50,
            paddingRight: 30,
            paddingTop: 20,
            paddingBottom: 20,
            // Add gradient fill under the line
            fillShadowGradient: currentMetric?.color || '#8B5CF6',
            fillShadowGradientOpacity: 0.3,
            fillShadowGradientFrom: currentMetric?.color || '#8B5CF6',
            fillShadowGradientTo: 'transparent',
            fillShadowGradientFromOpacity: 0.4,
            fillShadowGradientToOpacity: 0.2,
            useShadowColorFromDataset: false,
            // Force Y-axis range
            yLabelsOffset: 10,
            // Custom Y-axis configuration
            data: {
                yAxisMin,
                yAxisMax
            }
        };
    };

    // Safe way to get current chart data
    const getCurrentChartData = () => {
        if (!chartData || !selectedMetric || !chartData[selectedMetric]) {
            return null;
        }
        return chartData[selectedMetric];
    };

    const currentChartData = getCurrentChartData();
    const dynamicChartConfig = getDynamicChartConfig();

    if (loading) {
        return (
            <View className="flex-1">
                <GradientBackground />
                <Navbar title="Skin Analytics" />
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#8B5CF6" />
                    <Text className="text-white mt-4">Loading your analytics...</Text>
                </View>
            </View>
        );
    }

    if (error) {
        return (
            <View className="flex-1">
                <GradientBackground />
                <Navbar title="Skin Analytics" />
                <View className="flex-1 justify-center items-center px-6">
                    <Icon name="analytics-outline" size={64} color="#6B7280" />
                    <Text className="text-white text-lg font-semibold mt-4 mb-2">
                        Unable to load analytics
                    </Text>
                    <Text className="text-gray-400 text-center mb-4">
                        {error}
                    </Text>
                    <TouchableOpacity
                        onPress={fetchChartData}
                        className="bg-purple-600 px-6 py-3 rounded-lg"
                    >
                        <Text className="text-white font-semibold">Try Again</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    if (!chartData || Object.keys(chartData).length === 0) {
        return (
            <View className="flex-1">
                <GradientBackground />
                <Navbar title="Skin Analytics" />
                <View className="flex-1 justify-center items-center px-6">
                    <Icon name="analytics-outline" size={64} color="#6B7280" />
                    <Text className="text-white text-lg font-semibold mt-4 mb-2">
                        No scan data yet
                    </Text>
                    <Text className="text-gray-400 text-center mb-4">
                        Take your first scan to start tracking your skin progress
                    </Text>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('ImagePicker')}
                        className="bg-purple-600 px-6 py-3 rounded-lg"
                    >
                        <Text className="text-white font-semibold">Take First Scan</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    const currentMetric = getCurrentMetricData();
    const currentStats = getCurrentStats();

    return (
        <View className="flex-1">
            <GradientBackground />
            <ScrollView 
                className="flex-1 px-6"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                <Navbar/>
                {/* Header */}
                <View className="mb-6">
                    <Text className="text-white text-2xl font-bold">
                        Skin Analytics
                    </Text>
                    <Text className="text-gray-400 text-base">
                        Track your progress over time
                    </Text>
                </View>

                {/* Metric Selection Pills */}
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    className="mb-6 -mx-2"
                >
                    <View className="flex-row px-2 space-x-3 gap-2">
                        {metrics.map((metric) => (
                            <TouchableOpacity
                                key={metric.key}
                                onPress={() => setSelectedMetric(metric.key)}
                                className={`px-4 py-2 rounded-full ${
                                    selectedMetric === metric.key
                                        ? 'bg-purple-600'
                                        : 'bg-gray-700'
                                }`}
                                activeOpacity={0.8}
                            >
                                <Text className={`text-sm font-medium ${
                                    selectedMetric === metric.key
                                        ? 'text-white'
                                        : 'text-gray-300'
                                }`}>
                                    {metric.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>

                {/* Current Metric Stats */}
                <View className="bg-[#201e23] rounded-2xl p-6 mb-6 border border-[#332f38]">
                    <View className="flex-row justify-between items-center mb-4">
                        <View>
                            <Text className="text-white text-xl font-semibold">
                                {currentMetric?.name}
                            </Text>
                            <Text className="text-gray-400 text-sm">
                                Current level
                            </Text>
                        </View>
                        <View className="items-end">
                            <View className="flex-row items-center space-x-2">
                                <Text className="text-white text-3xl font-bold">
                                    {currentStats.current}%
                                </Text>
                                <Icon
                                    name={currentStats.trend === 'up' ? 'trending-up' : 'trending-down'}
                                    size={24}
                                    color={currentStats.trend === 'up' ? '#10B981' : '#EF4444'}
                                />
                            </View>
                            <Text className={`text-sm font-medium ${
                                currentStats.trend === 'up' ? 'text-green-400' : 'text-red-400'
                            }`}>
                                {currentStats.changeText} from last scan
                            </Text>
                        </View>
                    </View>

                    {/* Progress Bar */}
                    <View className="bg-gray-600 h-3 rounded-full overflow-hidden">
                        <View
                            className="h-3 rounded-full"
                            style={{
                                width: `${Math.min(currentStats.current, 100)}%`,
                                backgroundColor: currentMetric?.color,
                            }}
                        />
                    </View>
                </View>

                {/* Time Range Selector */}
                <View className="flex-row space-x-2 mb-6 gap-2">
                    {timeRanges.map((range) => (
                        <TouchableOpacity
                            key={range.value}
                            onPress={() => setTimeRange(range.value)}
                            className={`px-3 py-1 rounded-lg ${
                                timeRange === range.value
                                    ? 'bg-purple-600'
                                    : 'bg-gray-700'
                            }`}
                            activeOpacity={0.8}
                        >
                            <Text className={`text-sm font-medium ${
                                timeRange === range.value
                                    ? 'text-white'
                                    : 'text-gray-400'
                            }`}>
                                {range.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Chart */}
                <View className="bg-[#201e23] rounded-2xl p-4 mb-6 border border-[#332f38]">
                    <Text className="text-white text-lg font-semibold mb-4 px-2">
                        {currentMetric?.name} Trend
                    </Text>
                    {currentChartData && (
                        <LineChart
                            data={currentChartData}
                            width={screenWidth - 80}
                            height={240}
                            chartConfig={dynamicChartConfig}
                            bezier
                            style={{
                                marginVertical: 8,
                                borderRadius: 16,
                            }}
                            withDots={false}
                            withShadow={true}
                            withInnerLines={false}
                            withOuterLines={false}
                            fromZero={false}
                            segments={dynamicChartConfig.segments}
                        />
                    )}
                </View>

                {/* Summary Cards */}
                <View className="flex-row flex-wrap -mx-2 mb-6">
                    {metrics.map((metric) => {
                        const metricStats = stats[metric.key] || { current: 0, trend: 'up', changeText: '+0%' };
                        return (
                            <View key={metric.key} className="w-1/2 px-2 mb-4">
                                <TouchableOpacity
                                    onPress={() => setSelectedMetric(metric.key)}
                                    activeOpacity={0.8}
                                    className={`p-4 rounded-xl border ${
                                        selectedMetric === metric.key
                                            ? 'bg-purple-600/20 border-purple-500'
                                            : 'bg-[#201e23] border-[#332f38]'
                                    }`}
                                >
                                    <View className="flex-row justify-between items-center mb-2">
                                        <Text className="text-gray-300 text-sm">
                                            {metric.name}
                                        </Text>
                                        <Icon
                                            name={metricStats.trend === 'up' ? 'trending-up' : 'trending-down'}
                                            size={16}
                                            color={metricStats.trend === 'up' ? '#10B981' : '#EF4444'}
                                        />
                                    </View>
                                    <View className="flex-row items-center space-x-2">
                                        <Text className="text-white text-xl font-bold">
                                            {metricStats.current}%
                                        </Text>
                                        <Text className={`text-xs ${
                                            metricStats.trend === 'up' ? 'text-green-400' : 'text-red-400'
                                        }`}>
                                            {metricStats.changeText}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        );
                    })}
                </View>

                
            </ScrollView>
        </View>
    );
};

export default ChartsPage;