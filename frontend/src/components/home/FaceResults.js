import { useEffect, useRef, useState } from 'react';
import * as React from "react";

import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
    Animated,
    Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import GradientBackground from '../GradientBackground';
import { getScoreColor } from '../../utils/helpers';
import { captureRef } from 'react-native-view-shot';
import Share from 'react-native-share';
import LotusIcon from '../../utils/LotusIcon';
const { width, height } = Dimensions.get('window');

const ScanResultsScreen = ({ navigation, route, scanImage, scanResults }) => {
    const image = scanImage || route?.params?.scanImage;
    const results = scanResults || route?.params?.scanResults;

    // State to control when branding should be visible
    const [isCapturing, setIsCapturing] = useState(false);

    const progressAnimations = useRef({
        redness: new Animated.Value(0),
        hydration: new Animated.Value(0),
        acne: new Animated.Value(0),
        overall: new Animated.Value(0),
    }).current;

    const defaultResults = {
        acne: 5,
        analysis:
            'Your skin shows moderate redness, mostly around the cheeks and nose, which is consistent with your sensitive skin type. There are a few visible active acne spots and some lingering post-inflammatory marks and hyperpigmentation, mainly on the cheeks and jawline.',
        hydration: 7,
        overall: 6.2,
        redness: 6.8,
        tips: [
            'Use a gentle, fragrance-free cleanser suitable for sensitive skin to avoid further irritation.',
            'Incorporate a hydrating serum with glycerin or hyaluronic acid after cleansing.',
            'Spot-treat acne with a mild product containing salicylic acid or benzoyl peroxide, used sparingly.',
        ],
    };

    const shareViewRef = useRef();
    const finalResults = results || defaultResults;

    const shareResult = async () => {
        try {
            setIsCapturing(true);

            const uri = await captureRef(shareViewRef, {
                format: 'png',
                quality: 0.9,
                result: 'tmpfile',
            });

            setIsCapturing(false);

            const options = {
                url: 'file://' + uri, 
                type: 'image/png',
                failOnCancel: false,
                showAppsToView: true,
                excludedActivityTypes: [],
                message: "Hey! Check out my face scan results I got using SimplySkin."
            };

            await Share.open(options)
        } catch (error) {
            setIsCapturing(false);
        }
    };

    useEffect(() => {
        const animations = Object.keys(progressAnimations).map((key) =>
            Animated.timing(progressAnimations[key], {
                toValue: finalResults[key] || 0,
                duration: 1500,
                delay: 200,
                useNativeDriver: false,
            })
        );

        Animated.stagger(100, animations).start();
    }, []);

    const handleBack = () => {
        if (navigation) {
            navigation.popTo('Home');
        }
    };

    const ScoreCard = ({ score, label, animatedValue }) => {
        return (
            <View className="flex-1 mx-2 bg-white/10 p-4 rounded-xl">
                <Text className="text-white text-md font-medium mb-1">
                    {label}
                </Text>
                <Text className="text-white text-3xl font-bold mb-2">
                    {score}
                </Text>
                <View className="w-full h-2 bg-gray-700 rounded-full">
                    <Animated.View
                        className="h-2 rounded-full"
                        style={{
                            width: animatedValue.interpolate({
                                inputRange: [0, 100],
                                outputRange: ['0%', '100%'],
                                extrapolate: 'clamp',
                            }),
                            backgroundColor: getScoreColor(score),
                        }}
                    />
                </View>
            </View>
        );
    };

    return (
        <View className="flex-1">
            <GradientBackground />

            {/* Header - only show when not capturing */}
            {!isCapturing && (
                <View className="flex-row items-center justify-between px-6 pt-2 pb-4 mt-6">
                    <TouchableOpacity
                        onPress={handleBack}
                        className="bg-white/10 rounded-full p-2"
                    >
                        <Icon name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text className="text-white text-xl font-semibold">
                        Scan Results
                    </Text>
                    <TouchableOpacity
                        onPress={shareResult}
                        className="bg-white/10 rounded-full p-2"
                    >
                        <Icon name="share-outline" size={24} color="white" />
                    </TouchableOpacity>
                </View>
            )}

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 40 }}
            >
                {/* Face Image */}
                <View className="items-center px-6 mb-8">
                    <View className="w-48 h-48 rounded-full overflow-hidden bg-gray-800 items-center justify-center mb-6">
                        {image ? (
                            <Image
                                source={{ uri: image }}
                                className="w-full h-full"
                                resizeMode="cover"
                            />
                        ) : (
                            <View className="items-center">
                                <Icon name="person" size={80} color="#9CA3AF" />
                                <Text className="text-gray-400 mt-2">
                                    Scan Image
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Score Cards Grid */}
                    <View className="bg-black/30 rounded-3xl p-6 w-full max-w-sm">
                        <View className="flex-row justify-between mb-4">
                            <ScoreCard
                                score={finalResults.redness}
                                label="Redness"
                                animatedValue={progressAnimations.redness}
                            />
                            <ScoreCard
                                score={finalResults.hydration}
                                label="Hydration"
                                animatedValue={progressAnimations.hydration}
                            />
                        </View>
                        <View className="flex-row justify-between">
                            <ScoreCard
                                score={finalResults.acne}
                                label="Acne"
                                animatedValue={progressAnimations.acne}
                            />
                            <ScoreCard
                                score={finalResults.overall}
                                label="Overall"
                                animatedValue={progressAnimations.overall}
                            />
                        </View>
                    </View>
                </View>

                {/* Analysis Section */}
                <View className="mx-6 mb-6">
                    <View className="bg-white/10 rounded-2xl p-6 border border-white/20">
                        <View className="flex-row items-center mb-4">
                            <Icon name="analytics" size={24} color="#8B5CF6" />
                            <Text className="text-white text-xl font-semibold ml-3">
                                Analysis & Recommendations
                            </Text>
                        </View>

                        <Text className="text-gray-200 text-base leading-6 mb-6">
                            {finalResults.analysis}
                        </Text>

                        {finalResults.tips && finalResults.tips.length > 0 && (
                            <View>
                                <Text className="text-white text-lg font-semibold mb-3">
                                    Recommendations:
                                </Text>
                                {finalResults.tips.map((tip, index) => (
                                    <View
                                        key={index}
                                        className="flex-row items-start mb-2"
                                    >
                                        <View className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3" />
                                        <Text className="text-gray-200 text-base flex-1">
                                            {tip}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>
                </View>

                {/* Action Buttons */}
                <View className="px-6">
                    <TouchableOpacity
                        onPress={handleBack}
                        className="bg-purple-600 rounded-2xl py-4 items-center mb-4"
                    >
                        <Text className="text-white text-lg font-semibold">
                            Done
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={shareResult}
                        className="bg-[#242128] rounded-2xl py-4 items-center"
                    >
                        <Text className="text-white text-lg font-semibold">
                            Share Results
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Hidden off-screen shareable content */}
            <View
                style={{
                    position: 'absolute',
                    top: -10000, // Move way off screen
                    left: 0,
                    width: 400,
                    opacity: isCapturing ? 1 : 0, // Only render when capturing
                }}
            >
                <View
                    ref={shareViewRef}
                    collapsable={false}
                    style={{
                        paddingTop: 20,
                        paddingBottom: 20,
                        backgroundColor: 'transparent',
                    }}
                >
                    {/* Gradient Background for captured image */}
                    <View
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                        }}
                    >
                        <GradientBackground />
                    </View>

                    {/* Branding Header */}
                    <View
                        className="items-center mb-6 px-6"
                        style={{ zIndex: 1 }}
                    >
                        <View className="flex-1 items-center">
                            <View className="flex-row items-center">
                                <LotusIcon/>
                                <Text className="text-white text-2xl font-bold ml-2">
                                    simplyskin
                                </Text>
                            </View>
                            <Text className="text-gray-300 text-sm mt-1">
                                Your Skin Analysis Results
                            </Text>
                        </View>
                    </View>

                    {/* Face Image */}
                    <View
                        className="items-center px-6 mb-8"
                        style={{ zIndex: 1 }}
                    >
                        <View className="w-48 h-48 rounded-full overflow-hidden bg-gray-800 items-center justify-center mb-6">
                            {image ? (
                                <Image
                                    source={{ uri: image }}
                                    className="w-full h-full"
                                    resizeMode="cover"
                                />
                            ) : (
                                <View className="items-center">
                                    <Icon
                                        name="person"
                                        size={80}
                                        color="#9CA3AF"
                                    />
                                    <Text className="text-gray-400 mt-2">
                                        Scan Image
                                    </Text>
                                </View>
                            )}
                        </View>

                        {/* Score Cards Grid - Static values for sharing */}
                        <View className="bg-black/30 rounded-3xl p-6 w-full max-w-sm">
                            <View className="flex-row justify-between mb-4">
                                <View className="flex-1 mx-2 bg-white/10 p-4 rounded-xl">
                                    <Text className="text-white text-md font-medium mb-1">
                                        Redness
                                    </Text>
                                    <Text className="text-white text-3xl font-bold mb-2">
                                        {finalResults.redness}
                                    </Text>
                                    <View className="w-full h-2 bg-gray-700 rounded-full">
                                        <View
                                            className="h-2 rounded-full"
                                            style={{
                                                width: `${Math.min(
                                                    finalResults.redness,
                                                    100
                                                )}%`,
                                                backgroundColor: getScoreColor(
                                                    finalResults.redness
                                                ),
                                            }}
                                        />
                                    </View>
                                </View>
                                <View className="flex-1 mx-2 bg-white/10 p-4 rounded-xl">
                                    <Text className="text-white text-md font-medium mb-1">
                                        Hydration
                                    </Text>
                                    <Text className="text-white text-3xl font-bold mb-2">
                                        {finalResults.hydration}
                                    </Text>
                                    <View className="w-full h-2 bg-gray-700 rounded-full">
                                        <View
                                            className="h-2 rounded-full"
                                            style={{
                                                width: `${Math.min(
                                                    finalResults.hydration,
                                                    100
                                                )}%`,
                                                backgroundColor: getScoreColor(
                                                    finalResults.hydration
                                                ),
                                            }}
                                        />
                                    </View>
                                </View>
                            </View>
                            <View className="flex-row justify-between">
                                <View className="flex-1 mx-2 bg-white/10 p-4 rounded-xl">
                                    <Text className="text-white text-md font-medium mb-1">
                                        Acne
                                    </Text>
                                    <Text className="text-white text-3xl font-bold mb-2">
                                        {finalResults.acne}
                                    </Text>
                                    <View className="w-full h-2 bg-gray-700 rounded-full">
                                        <View
                                            className="h-2 rounded-full"
                                            style={{
                                                width: `${Math.min(
                                                    finalResults.acne,
                                                    100
                                                )}%`,
                                                backgroundColor: getScoreColor(
                                                    finalResults.acne
                                                ),
                                            }}
                                        />
                                    </View>
                                </View>
                                <View className="flex-1 mx-2 bg-white/10 p-4 rounded-xl">
                                    <Text className="text-white text-md font-medium mb-1">
                                        Overall
                                    </Text>
                                    <Text className="text-white text-3xl font-bold mb-2">
                                        {finalResults.overall}
                                    </Text>
                                    <View className="w-full h-2 bg-gray-700 rounded-full">
                                        <View
                                            className="h-2 rounded-full"
                                            style={{
                                                width: `${Math.min(
                                                    finalResults.overall,
                                                    100
                                                )}%`,
                                                backgroundColor: getScoreColor(
                                                    finalResults.overall
                                                ),
                                            }}
                                        />
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Branding Footer */}
                    <View
                        className="items-center px-6 mt-4"
                        style={{ zIndex: 1 }}
                    >
                        <Text className="text-gray-400 text-xs">
                            Generated by simplyskin
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );
};

export default ScanResultsScreen;
