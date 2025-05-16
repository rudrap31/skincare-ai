import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';

const getRatingColor = (rating) => {
    const hue = (rating / 10) * 130; // 0 (red) 130 (green)
    return `hsl(${hue}, 80%, 40%)`;
};

const RatingCircle = ({ size, rating }) => {
    const [displayedRating, setDisplayedRating] = useState(0);

    useEffect(() => {
        const duration = size * 5; 
        const stepTime = 20;
        const totalSteps = duration / stepTime;
        let currentStep = 0;

        const interval = setInterval(() => {
            currentStep += 1;
            const newRating = (rating / totalSteps) * currentStep;
            setDisplayedRating(Math.min(newRating, rating));

            if (currentStep >= totalSteps) {
                clearInterval(interval);
            }
        }, stepTime);

        return () => clearInterval(interval);
    }, [rating]);

    return (
        <View className="items-center my-4">
            <AnimatedCircularProgress
                size={size}
                width={size / 10}
                fill={(displayedRating / 10) * 100}
                tintColor={getRatingColor(displayedRating)}
                backgroundColor="#1f2937"
                rotation={0}
                lineCap="round"
            >
                {() => (
                    <Text
                        style={{
                            color: getRatingColor(displayedRating),
                            fontWeight: 'bold',
                            fontSize: size / 10 + 10,
                        }}
                    >
                        {displayedRating.toFixed(1)}{' '}
                    </Text>
                )}
            </AnimatedCircularProgress>
        </View>
    );
};

export default RatingCircle;
