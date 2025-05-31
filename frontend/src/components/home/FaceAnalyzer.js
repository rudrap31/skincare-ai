import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import GradientBackground from '../GradientBackground';
import Navbar from '../Navbar';

const FaceAnalyzer = () => {
  // Mock data - replace with real data from your state/API
  const userName = "Sarah";
  const hasRecentScan = false; // Change to true when user has scanned before
  
  const skinMetrics = [
    { name: 'Redness', value: 65, trend: 'up', color: '#8B5CF6' },
    { name: 'Hydration', value: 78, trend: 'up', color: '#06B6D4' },
    { name: 'Acne', value: 45, trend: 'down', color: '#EF4444' },
    { name: 'Overall', value: 72, trend: 'up', color: '#10B981' },
  ];

  // Mock recent scans with photos and scores
  const recentScans = [
    { id: 1, score: 85, date: new Date(Date.now() - (1 * 24 * 60 * 60 * 1000)), imageUri: null },
    { id: 2, score: 78, date: new Date(Date.now() - (3 * 24 * 60 * 60 * 1000)), imageUri: null },
    { id: 3, score: 82, date: new Date(Date.now() - (5 * 24 * 60 * 60 * 1000)), imageUri: null },
    { id: 4, score: 74, date: new Date(Date.now() - (7 * 24 * 60 * 60 * 1000)), imageUri: null },
  ];

  const handleScanPress = () => {
    // Handle face scan button press
    console.log('Starting face scan...');
  };

  const handleMetricPress = (metric) => {
    // Handle metric card press - navigate to detailed chart
    console.log(`Viewing ${metric} chart details`);
  };

  const handleRecentScanPress = (scanId) => {
    // Handle recent scan press - will navigate to scan result screen later
    console.log(`Viewing scan result ${scanId}`);
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
              ? "Ready for your daily scan?" 
              : "Scan to get started"
            }
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
              Tap to analyze your skin condition and track improvements
            </Text>
          </View>
        </TouchableOpacity>

        {/* Charts Section */}
        <View className="bg-[#201e23] rounded-2xl p-6 mb-6 border border-[#332f38]">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-white text-xl font-semibold">Your Charts</Text>
            <TouchableOpacity>
              <Icon name="chevron-forward" size={20} color="#9CA3AF" />
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
                    <Text className="text-gray-300 text-sm">{metric.name}</Text>
                    <Icon 
                      name={metric.trend === 'up' ? 'trending-up' : 'trending-down'} 
                      size={16} 
                      color={metric.trend === 'up' ? '#10B981' : '#EF4444'} 
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
                        backgroundColor: metric.color 
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
            <Text className="text-white text-xl font-semibold">Recent Scans</Text>
            <TouchableOpacity>
              <Icon name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            className="-mx-2"
          >
            {recentScans.map((scan, index) => (
              <TouchableOpacity
                key={scan.id}
                onPress={() => handleRecentScanPress(scan.id)}
                className="mx-2"
                activeOpacity={0.8}
              >
                <View className="w-20 h-20 bg-gray-700 rounded-xl relative overflow-hidden">
                  {/* Placeholder for scan photo - replace with actual image when available */}
                  {scan.imageUri ? (
                    <Image 
                      source={{ uri: scan.imageUri }} 
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="w-full h-full bg-gradient-to-br from-purple-600 to-blue-600 items-center justify-center">
                      <Text className="text-white text-xs font-bold">SCAN</Text>
                    </View>
                  )}
                  
                  {/* Score overlay */}
                  <View className="absolute top-1 left-1 bg-black/70 rounded px-1">
                    <Text className="text-white text-xs font-bold">{scan.score}</Text>
                  </View>
                  
                  {/* Date at bottom */}
                  <View className="absolute bottom-0 left-0 right-0 bg-black/70 px-1">
                    <Text className="text-white text-xs text-center">
                      {scan.date.getDate()}/{scan.date.getMonth() + 1}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
            
            {/* Add more scans indicator */}
            <TouchableOpacity className="mx-2 items-center justify-center">
              <View className="w-20 h-20 bg-gray-700/50 rounded-xl items-center justify-center border-2 border-dashed border-gray-600">
                <Icon name="chevron-forward" size={24} color="#9CA3AF" />
              </View>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Daily Tip Section (Optional) */}
        <View className="bg-gradient-to-r from-purple-900 to-purple-800 rounded-2xl p-6 mt-6">
          <Text className="text-white text-lg font-semibold mb-2">💡 Daily Tip</Text>
          <Text className="text-purple-200">
            Apply sunscreen 15-30 minutes before going outside for optimal protection against UV damage.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default FaceAnalyzer;