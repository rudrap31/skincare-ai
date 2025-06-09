import React, { forwardRef } from 'react';
import ActionSheet, { ScrollView, FlatList } from 'react-native-actions-sheet';
import { useRef, useState, useImperativeHandle, useEffect } from 'react';
import { Text, View, Image } from 'react-native';
import RatingCircle from '../RatingCircle';

const ProductSheet = forwardRef(({ selectedProduct }, ref) => {
    const actionSheetRef = useRef(null);
    const [parsedPros, setParsedPros] = useState([]);
    const [parsedCons, setParsedCons] = useState([]);

    useEffect(() => {
        if (selectedProduct) {
            setParsedPros(JSON.parse(selectedProduct.pros || '[]'));
            setParsedCons(JSON.parse(selectedProduct.cons || '[]'));
        }
    }, [selectedProduct]);

    useImperativeHandle(ref, () => ({
        show: () => {
            actionSheetRef.current?.show();
        },
        hide: () => {
            actionSheetRef.current?.hide();
        },
    }));

    return (
        <ActionSheet
            ref={actionSheetRef}
            snapPoints={[90, '50%']} // Adjust these snap points to fill the screen more
            drawUnderStatusBar={false}
            useBottomSafeAreaPadding
            containerStyle={{
                backgroundColor: '#1e1e1e', // Avoiding any background gaps
                borderTopLeftRadius: 20, // Optional: To add rounded corners to the top
                borderTopRightRadius: 20, // Optional: To add rounded corners to the top
                marginBottom: 0, // Ensures no white space at the bottom
            }}
        >
            {selectedProduct ? (
                <ScrollView>
                    <View className="px-4 pt-6 bg-[#1e1e1e] rounded-t-2xl">
                        <View className="flex-row mb-5">
                            <Image
                                source={{ uri: selectedProduct.image }}
                                className="w-56 h-56 rounded-2xl mr-4"
                                resizeMode="cover"
                            />
                            <View className="flex-1 justify-between">
                                <View className="items-start">
                                    <RatingCircle
                                        size={90}
                                        rating={selectedProduct.rating}
                                    />
                                </View>
                            </View>
                        </View>
                        <Text className="text-white text-xl font-bold mb-3">
                            {selectedProduct.product}
                        </Text>

                        {/* Summary section */}
                        <View className="mb-5">
                            <Text className="text-white text-lg font-semibold mb-3">
                                Summary
                            </Text>
                            <Text className="text-white/80 text-base leading-6">
                                {selectedProduct.summary}
                            </Text>
                        </View>

                        {/* Pros and Cons */}
                        <View className="gap-5">
                            {parsedPros.length > 0 && (
                                <View className="bg-green-500/10 border-l-4 border-green-400 rounded-xl p-4">
                                    <Text className="text-white text-base font-semibold mb-3">
                                        ✅ Pros
                                    </Text>
                                    {parsedPros.map((item, index) => (
                                        <View key={index} className="mb-2">
                                            <Text className="text-white/90 text-sm leading-5">
                                                • {item}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            )}

                            {parsedCons.length > 0 && (
                                <View className="bg-red-500/10 border-l-4 border-red-400 rounded-xl p-4">
                                    <Text className="text-white text-base font-semibold mb-3">
                                        ❌ Cons
                                    </Text>
                                    {parsedCons.map((item, index) => (
                                        <View key={index} className="mb-2">
                                            <Text className="text-white/90 text-sm leading-5">
                                                • {item}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </View>
                    </View>
                </ScrollView>
            ) : (
                <View className="items-center justify-center p-6">
                    <Text className="text-2xl font-semibold text-red-500 mt-4">
                        Something went wrong
                    </Text>
                    <Text className="text-center text-lg text-gray-400 mt-2 mb-20">
                        Make sure this is a valid skincare product.{'\n'}
                        We couldn’t read the product details right now.
                    </Text>
                </View>
            )}
        </ActionSheet>
    );
});

export default ProductSheet;
