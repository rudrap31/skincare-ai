import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    Modal,
    TextInput,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase/supabase';
import Toast from 'react-native-toast-message';

const EditSkinProfileModal = ({ visible, onClose, profile }) => {
    const { user } = useAuth();
    const [newProfile, setNewProfile] = useState(profile);
    const [saving, setSaving] = useState(false);

    const skinTypes = ['Normal', 'Dry', 'Oily', 'Combination', 'Sensitive'];
    const availableConcerns = [
        'Acne',
        'Redness',
        'Dryness',
        'Oily skin',
        'Hyperpigmentation',
        'Fine lines',
        'Sensitivity',
    ];

    const handleChange = (field, value) => {
        setNewProfile((prev) => ({ ...prev, [field]: value }));
    };

    const handleSkinTypeSelect = (type) => {
        setNewProfile((prev) => ({ ...prev, skin_type: type }));
    };

    const handleSkinConcernToggle = (concern) => {
        setNewProfile((prev) => {
            const isSelected = prev.skin_concerns.includes(concern);
            return {
                ...prev,
                skin_concerns: isSelected
                    ? prev.skin_concerns.filter((c) => c !== concern)
                    : [...prev.skin_concerns, concern],
            };
        });
    };

    const handleSubmit = async () => {
        if (saving) return;

        setSaving(true);

        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    name: newProfile.name,
                    skin_type: newProfile.skin_type,
                    skin_concerns: newProfile.skin_concerns,
                })
                .eq('user_id', user.id);

            if (error) {
                Toast.show({
                    type: 'error',
                    text1: 'Error updating profile',
                    text2: 'Please try again later'
                });
                console.error(error);
            } else {
                Toast.show({
                    type: 'success',
                    text1: 'Profile updated successfully!',
                    text2: 'Your changes have been saved',
                });

                setTimeout(() => {
                    onClose();
                }, 500);
            }
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Something went wrong',
                text2: 'Please check your connection and try again',
            });
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    const handleClose = () => {
        if (saving) return; // Prevent closing while saving
        onClose();
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={handleClose}
        >
            <KeyboardAvoidingView 
                className="flex-1 bg-black/90"
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <View className="flex-1 px-6 pt-8">
                    {/* Header */}
                    <View className="flex-row items-center justify-between mb-8">
                        <TouchableOpacity
                            onPress={handleClose}
                            disabled={saving}
                            className="p-2"
                        >
                            <Text className="text-purple-500 text-lg">✕</Text>
                        </TouchableOpacity>
                        <Text className="text-white text-xl font-bold">
                            Edit Profile
                        </Text>
                        <View className="w-8" />
                    </View>

                    <ScrollView 
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        className="flex-1"
                    >
                        {/* Intro */}
                        <View className="items-center mb-8">
                            <View className="w-16 h-16 bg-purple-600/20 rounded-full items-center justify-center mb-3">
                                <Text className="text-3xl">👤</Text>
                            </View>
                            <Text className="text-gray-400 text-center text-base">
                                Update your skin profile to get better personalized recommendations
                            </Text>
                        </View>

                        {/* Name Section */}
                        <View className="bg-gray-800/40 rounded-2xl p-4 mb-6">
                            <Text className="text-white text-lg font-semibold mb-4">
                                Personal Information
                            </Text>
                            <View>
                                <Text className="text-white mb-2 ml-2">Name</Text>
                                <TextInput
                                    value={newProfile.name}
                                    onChangeText={(text) => handleChange('name', text)}
                                    placeholder="Enter your name"
                                    placeholderTextColor="#666"
                                    className="bg-[#1a1a1a] text-white px-4 py-3 rounded-xl border border-[#333]"
                                    editable={!saving}
                                />
                            </View>
                        </View>

                        {/* Skin Type Section */}
                        <View className="bg-gray-800/40 rounded-2xl p-4 mb-6">
                            <Text className="text-white text-lg font-semibold mb-4">
                                Skin Type
                            </Text>
                            <Text className="text-gray-400 text-sm mb-4">
                                Select your primary skin type
                            </Text>
                            <View className="flex-row flex-wrap gap-3 ">
                                {skinTypes.map((type) => (
                                    <TouchableOpacity
                                        key={type}
                                        onPress={() => handleSkinTypeSelect(type)}
                                        disabled={saving}
                                        className={`px-4 py-2 rounded-full ${
                                            newProfile.skin_type === type
                                                ? 'bg-purple-600 border border-purple-500'
                                                : 'bg-gray-700 border border-gray-600'
                                        }`}
                                    >
                                        <Text className={`${
                                            newProfile.skin_type === type
                                                ? 'text-white'
                                                : 'text-gray-300'
                                        }`}>
                                            {type}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Skin Concerns Section */}
                        <View className="bg-gray-800/40 rounded-2xl p-4 mb-6">
                            <Text className="text-white text-lg font-semibold mb-4">
                                Skin Concerns
                            </Text>
                            <Text className="text-gray-400 text-sm mb-4">
                                Select all that apply to you
                            </Text>
                            <View className="flex-row flex-wrap gap-3">
                                {availableConcerns.map((concern) => (
                                    <TouchableOpacity
                                        key={concern}
                                        onPress={() => handleSkinConcernToggle(concern)}
                                        disabled={saving}
                                        className={`px-4 py-2 rounded-full ${
                                            newProfile.skin_concerns.includes(concern)
                                                ? 'bg-purple-600 border border-purple-500'
                                                : 'bg-gray-700 border border-gray-600'
                                        }`}
                                    >
                                        <Text className={`${
                                            newProfile.skin_concerns.includes(concern)
                                                ? 'text-white'
                                                : 'text-gray-300'
                                        }`}>
                                            {concern}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Save Button */}
                        <TouchableOpacity
                            onPress={handleSubmit}
                            disabled={saving}
                            className={`py-4 rounded-xl mx-4 mb-6 ${
                                saving ? 'bg-purple-600/50' : 'bg-purple-600'
                            }`}
                        >
                            {saving ? (
                                <View className="flex-row items-center justify-center">
                                    <ActivityIndicator size="small" color="white" />
                                    <Text className="text-white text-center text-lg font-bold ml-2">
                                        Saving...
                                    </Text>
                                </View>
                            ) : (
                                <Text className="text-white text-center text-lg font-bold">
                                    Save Changes
                                </Text>
                            )}
                        </TouchableOpacity>

                        {/* Footer */}
                        <View className="items-center pb-8">
                            <Text className="text-gray-500 text-sm text-center">
                                Your profile helps us provide better recommendations
                            </Text>
                        </View>
                    </ScrollView>
                </View>
                <Toast />
            </KeyboardAvoidingView>
        </Modal>
    );
};

export default EditSkinProfileModal;