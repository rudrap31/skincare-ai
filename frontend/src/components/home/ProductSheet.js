import React from 'react';
import { ScrollView } from 'react-native-actions-sheet';
import { useState, useEffect } from 'react';
import { Text, View, Image } from 'react-native';
import RatingCircle from '../RatingCircle';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const ProductSheet = ({ selectedProduct }) => {
    const [parsedPros, setParsedPros] = useState([]);
    const [parsedCons, setParsedCons] = useState([]);

    useEffect(() => {
        if (selectedProduct) {
            setParsedPros(JSON.parse(selectedProduct.pros || '[]'));
            setParsedCons(JSON.parse(selectedProduct.cons || '[]'));
        }
    }, [selectedProduct]);

    return (
        <>
            {selectedProduct ? (
                <ScrollView>
                    <View className="px-4 pt-6 bg-[#1e1e1e] rounded-t-2xl">
                        <View className="flex-row mb-5">
                            {selectedProduct.image ? (
                                <Image
                                    source={{ uri: selectedProduct.image }}
                                    className="w-56 h-56 rounded-2xl mr-4"
                                    resizeMode="cover"
                                />
                            ) : (
                                <View className="w-56 h-56 bg-slate-200 rounded-xl mr-4 items-center justify-center">
                                    <MaterialCommunityIcons
                                        name="hand-wash-outline"
                                        size={90}
                                        className="items-center justify-center"
                                    />
                                    <Text className=" text-center font-semibold text-gray-700 pt-4">
                                        Sorry, we couldn't find the image
                                    </Text>
                                </View>
                            )}

                            <View className=" justify-center pl-3">
                                <RatingCircle
                                    size={130}
                                    rating={selectedProduct.rating}
                                />
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
        </>
    );
};

export default ProductSheet;
