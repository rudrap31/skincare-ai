import React, { useState, useEffect, useRef } from "react";
import { Animated, Text } from "react-native";

const tips = [
    "Apply sunscreen 15-30 minutes before going outside for optimal protection against UV damage.",
    "Drink plenty of water throughout the day to keep your skin hydrated.",
    "Remove makeup gently before going to bed to prevent clogged pores and breakouts.",
    "Use a moisturizer suitable for your skin type every morning and night.",
    "Avoid touching your face frequently to reduce bacteria transfer and irritation.",
    "Incorporate antioxidants like vitamin C into your routine to protect against environmental damage.",
    "Get enough sleep — it helps your skin repair and regenerate overnight.",
    "Exfoliate 1-2 times a week to remove dead skin cells and brighten your complexion.",
    "Avoid hot showers, as they can strip natural oils and dry out your skin.",
    "Use a gentle cleanser to avoid disrupting your skin’s natural barrier.",
    "Wear a wide-brimmed hat when spending long hours outdoors for extra sun protection.",
    "Keep your skincare products in a cool, dry place to maintain their effectiveness.",
    "Patch test new products before applying them all over your face to prevent irritation.",
    "Limit your exposure to blue light from screens by using screen protectors or taking breaks.",
    "Avoid smoking — it accelerates skin aging and causes dullness.",
  ]

const DailyTip = () => {
  const [tip, setTip] = useState("");
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    // Pick a random tip on mount
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    setTip(randomTip);

    // Animate fade and scale in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      className="bg-gradient-to-r from-purple-900 to-purple-800 rounded-2xl p-6"
      style={{
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }],
      }}
    >
      <Text className="text-white text-lg font-semibold mb-2">💡 Daily Tip</Text>
      <Text className="text-purple-200">{tip}</Text>
    </Animated.View>
  );
};

export default DailyTip;
