import React, { useEffect, useRef } from 'react';
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

const { width, height } = Dimensions.get('window');

const ScanResultsScreen = ({
    navigation,
    route,
    // Props if passed directly, or use route.params
    scanImage,
    scanResults,
}) => {
    // Get data from route params or props
    const image = scanImage || route?.params?.scanImage;
    const results = scanResults || route?.params?.scanResults;

    // Animation refs for progress bars
    const progressAnimations = useRef({
        redness: new Animated.Value(0),
        hydration: new Animated.Value(0),
        acne: new Animated.Value(0),
        overall: new Animated.Value(0),
    }).current;

    // Mock data structure - replace with your actual API response
    const defaultResults = {
        acne: 5,
        analysis: "Your skin shows moderate redness, mostly around the cheeks and nose, which is consistent with your sensitive skin type. There are a few visible active acne spots and some lingering post-inflammatory marks and hyperpigmentation, mainly on the cheeks and jawline.",
        hydration: 7,
        overall: 6.2,
        redness: 6.8,
        tips: [
            "Use a gentle, fragrance-free cleanser suitable for sensitive skin to avoid further irritation.",
            "Incorporate a hydrating serum with glycerin or hyaluronic acid after cleansing.",
            "Spot-treat acne with a mild product containing salicylic acid or benzoyl peroxide, used sparingly."
        ]
    };

    const finalResults = results || defaultResults;

    useEffect(() => {
        // Animate progress bars on mount
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
            navigation.popTo("Home");
        }
    };

    const ScoreCard = ({ score, label, animatedValue }) => {
        return (
            <View className=" flex-1 mx-2 bg-white/10 p-4 rounded-xl">
                <Text className="text-white text-md font-medium mb-1">
                    {label}
                </Text>
                <Text className="text-white text-3xl font-bold mb-2">
                    {score}
                </Text>
                {/* Progress bar */}
                <View className="w-full h-2 bg-gray-700 rounded-full">
                    <Animated.View
                        className="h-2 rounded-full"
                        style={{
                            width: animatedValue.interpolate({
                                inputRange: [0, 100],
                                outputRange: ['0%', '100%'],
                                extrapolate: 'clamp',
                            }),
                            backgroundColor:
                                score >= 80
                                    ? '#10B981'
                                    : score >= 60
                                    ? '#F59E0B'
                                    : '#EF4444',
                        }}
                    />
                </View>
            </View>
        );
    };

    return (
        <View className="flex-1">
            <GradientBackground />

            {/* Header with back button */}
            <View className="flex-row items-center justify-between px-6 pt-12 pb-4 mt-6">
                <TouchableOpacity
                    onPress={handleBack}
                    className="bg-white/10 rounded-full p-2"
                >
                    <Icon name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text className="text-white text-xl font-semibold">
                    Scan Results
                </Text>
                <View className="w-10" />
            </View>

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

                        {/* Analysis Text */}
                        <Text className="text-gray-200 text-base leading-6 mb-6">
                            {finalResults.analysis}
                        </Text>

                        {/* Recommendations */}
                        {finalResults.tips &&
                            finalResults.tips.length > 0 && (
                                <View>
                                    <Text className="text-white text-lg font-semibold mb-3">
                                        Recommendations:
                                    </Text>
                                    {finalResults.tips.map(
                                        (tip, index) => (
                                            <View
                                                key={index}
                                                className="flex-row items-start mb-2"
                                            >
                                                <View className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3" />
                                                <Text className="text-gray-200 text-base flex-1">
                                                    {tip}
                                                </Text>
                                            </View>
                                        )
                                    )}
                                </View>
                            )}
                    </View>
                </View>

                {/* Action Buttons */}
                <View className="px-6">
                    <TouchableOpacity
                        onPress={handleBack}
                        className="bg-purple-600 rounded-2xl py-4 items-center"
                    >
                        <Text className="text-white text-lg font-semibold">
                            Done
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
};

export default ScanResultsScreen;
