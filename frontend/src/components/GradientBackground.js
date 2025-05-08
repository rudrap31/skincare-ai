import React from 'react';
import { View } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

const GradientBackground = () => {
    return (
        <View className="absolute inset-0 -z-10 bg-[#0d0d0d]">
            {/* Purple Blob */}
            <Svg
                height="400"
                width="400"
                style={{
                    position: 'absolute',
                    top: '30%',
                    left: '20%',
                    transform: [{ translateX: -100 }, { translateY: -50 }],
                    opacity: 0.45,
                }}
            >
                <Defs>
                    <RadialGradient id="purple" cx="50%" cy="50%" r="50%">
                        <Stop offset="0%" stopColor="#a855f7" stopOpacity="1" />
                        <Stop
                            offset="100%"
                            stopColor="#a855f7"
                            stopOpacity="0"
                        />
                    </RadialGradient>
                </Defs>
                <Rect
                    x="0"
                    y="0"
                    width="400"
                    height="400"
                    fill="url(#purple)"
                />
            </Svg>

            {/* Red Blob */}
            <Svg
                height="300"
                width="300"
                style={{
                    position: 'absolute',
                    top: '40%',
                    left: '65%',
                    transform: [{ translateX: -150 }, { translateY: -200 }],
                    opacity: 0.4,
                }}
            >
                <Defs>
                    <RadialGradient id="red" cx="50%" cy="50%" r="50%">
                        <Stop offset="0%" stopColor="#de264e" stopOpacity="1" />
                        <Stop
                            offset="100%"
                            stopColor="#de264e"
                            stopOpacity="0"
                        />
                    </RadialGradient>
                </Defs>
                <Rect x="0" y="0" width="300" height="300" fill="url(#red)" />
            </Svg>
        </View>
    );
};

export default GradientBackground;
