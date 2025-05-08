import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase/supabase';
import Toast from 'react-native-toast-message';

const SKIN_TYPES = ['Normal', 'Dry', 'Oily', 'Combination', 'Sensitive'];
const SKIN_CONCERNS = [
    'Acne',
    'Redness',
    'Dryness',
    'Oily skin',
    'Hyperpigmentation',
    'Fine lines',
    'Sensitivity',
];

const Profile = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState({
        name: '',
        skin_type: '',
        skin_concerns: [],
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) fetchProfile();
    }, [user]);

    const fetchProfile = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (error) {
            console.error('Error loading profile:', error.message);
        } else {
            setProfile({
                name: data.name || '',
                skin_type: data.skin_type || '',
                skin_concerns: data.skin_concerns || [],
            });
        }
        setLoading(false);
    };

    const handleChange = (field, value) => {
        setProfile((prev) => ({ ...prev, [field]: value }));
    };

    const handleSkinTypeSelect = (type) => {
        setProfile((prev) => ({ ...prev, skin_type: type }));
    };

    const handleSkinConcernToggle = (concern) => {
        setProfile((prev) => {
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
        const { error } = await supabase
            .from('profiles')
            .update(profile)
            .eq('user_id', user.id);

        if (error) {
            Toast.show({ type: 'error', text1: 'Error updating profile.' });
            console.error(error);
        } else {
            Toast.show({
                type: 'success',
                text1: 'Profile updated successfully!',
            });
        }
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#fff" />
                <Text className="text-white mt-6 text-lg font-semibold">
                    Loading Profile...
                </Text>
            </View>
        );
    }

    return (
        <ScrollView className="flex-1  px-6 pt-12 mt-20">
            <Text className="text-white text-3xl font-bold mb-10 text-center">
                Your Profile
            </Text>

            {/* Name */}
            <View className="mb-8">
                <Text className="text-white mb-2 ml-2">Name</Text>
                <TextInput
                    value={profile.name}
                    onChangeText={(text) => handleChange('name', text)}
                    placeholder="Enter your name"
                    placeholderTextColor="#aaa"
                    className="bg-[#1a1a1a] text-white px-4 py-3 rounded-xl border border-[#333]"
                />
            </View>

            {/* Email */}
            <View className="mb-8">
                <Text className="text-white mb-2 ml-2">Email</Text>
                <TextInput
                    value={user?.email}
                    editable={false}
                    className="bg-[#333333] text-white px-4 py-3 rounded-xl border border-[#333]"
                />
            </View>

            {/* Skin Type */}
            <View className="mb-8">
                <Text className="text-white mb-4 text-lg font-semibold text-center">
                    Skin Type
                </Text>
                <View className="flex-row flex-wrap justify-center gap-3">
                    {SKIN_TYPES.map((type) => (
                        <TouchableOpacity
                            key={type}
                            onPress={() => handleSkinTypeSelect(type)}
                            className={`px-4 py-2 rounded-full ${
                                profile.skin_type === type
                                    ? 'border bg-primary'
                                    : 'border border-gray-600'
                            }`}
                        >
                            <Text className="text-white">{type}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Skin Concerns */}
            <View className="mb-8">
                <Text className="text-white mb-4 text-lg font-semibold text-center">
                    Skin Concerns
                </Text>
                <View className="flex-row flex-wrap justify-center gap-3">
                    {SKIN_CONCERNS.map((concern) => (
                        <TouchableOpacity
                            key={concern}
                            onPress={() => handleSkinConcernToggle(concern)}
                            className={`px-4 py-2 rounded-full ${
                                profile.skin_concerns.includes(concern)
                                    ? 'border bg-primary'
                                    : 'border border-gray-600'
                            }`}
                        >
                            <Text className="text-white">{concern}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Save Button */}
            <TouchableOpacity
                onPress={handleSubmit}
                className="bg-primary py-4 rounded-full mx-10 mt-6"
            >
                <Text className="text-white text-center text-lg font-bold">
                    Save Changes
                </Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

export default Profile;
