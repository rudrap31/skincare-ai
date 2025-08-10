import React, { useEffect, useState, useRef } from 'react';
import { Text, View } from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { getScoreColor } from '../utils/helpers';

const RatingCircle = ({ size, rating, isAnimate = true }) => {
    const [displayedRating, setDisplayedRating] = useState(0);
    const [fillValue, setFillValue] = useState(0);
    const animationRef = useRef(null);
    const startTimeRef = useRef(null);

    const easeOutCubic = (t) => {
        return 1 - Math.pow(1 - t, 3);
    };

    useEffect(() => {
        if (!isAnimate) {
            // If no animation, set values immediately
            setDisplayedRating(rating);
            setFillValue((rating / 100) * 100);
            return;
          }
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
        }

        setDisplayedRating(0);
        setFillValue(0);
        startTimeRef.current = null;

        const duration = 1200;
        const targetFill = (rating / 100) * 100;

        const animate = (currentTime) => {
            if (!startTimeRef.current) {
                startTimeRef.current = currentTime;
            }

            const elapsed = currentTime - startTimeRef.current;
            const progress = Math.min(elapsed / duration, 1);

            const easedProgress = easeOutCubic(progress);

            // Calculate current values
            const currentRating = rating * easedProgress;
            const currentFill = targetFill * easedProgress;

            setDisplayedRating(currentRating);
            setFillValue(currentFill);

            if (progress < 1) {
                animationRef.current = requestAnimationFrame(animate);
            } else {
                setDisplayedRating(rating);
                setFillValue(targetFill);
            }
        };

        // Start animation with a small delay
        const timeoutId = setTimeout(() => {
            animationRef.current = requestAnimationFrame(animate);
        }, 100);

        return () => {
            clearTimeout(timeoutId);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [rating, size, isAnimate]);

    return (
        <AnimatedCircularProgress
            size={size}
            width={Math.max(4, size / 12)}
            fill={fillValue}
            tintColor={getScoreColor(displayedRating)}
            onAnimationComplete={() => {}}
            backgroundColor="#000000"
            rotation={0}
            lineCap="round"
            duration={0} // Disable built-in animation
        >
            {() => (
                <View className="justify-center items-center">
                    <Text
                        style={{
                            fontSize: Math.max(12, size / 4.5),
                            fontWeight: 'bold',
                            color: '#FFFFFF',
                            textAlign: 'center',
                        }}
                    >
                        {displayedRating.toFixed(0)}%{'\n'}
                        <Text
                            style={{
                                fontSize: Math.max(8, size / 10),
                                fontWeight: '600',
                                color: '#FFFFFF',
                            }}
                        >
                            Match
                        </Text>
                    </Text>
                </View>
            )}
        </AnimatedCircularProgress>
    );
};

export default RatingCircle;
