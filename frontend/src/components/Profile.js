import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,
    Alert,
    Linking
} from 'react-native';
import { useAuthState, useAuthActions } from '../context/AuthContext';
import { supabase } from '../supabase/supabase';
import Navbar from './Navbar';
import ContactUsModal from './ContactUs';
import EditSkinProfileModal from './EditSkinProfileModal';
import TermsModal from './TermsModal';

const Profile = () => {
    const { user } = useAuthState();
    const { signOut } = useAuthActions();
    
    const [profile, setProfile] = useState({
        name: '',
        skin_type: '',
        skin_concerns: [],
        created_at: null,
    });
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        streakDays: 0,
        totalScans: 0,
        memberLevel: 'Bronze',
    });
    const [showEditModal, setShowEditModal] = useState(false);
    const [showContactModal, setShowContactModal] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);


    useEffect(() => {
        if (user) {
            fetchProfile();
            fetchStats();
        }
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
                created_at: data.created_at,
            });
        }
        setLoading(false);
    };

    const fetchStats = async () => {
        // Mock stats for now - replace with actual database queries
        setStats({
            streakDays: 7,
            totalScans: 12,
            memberLevel: 'Gold',
        });
    };

    const handleSignOut = () => {
        Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Sign Out', style: 'destructive', onPress: signOut },
        ]);
    };

    const formatJoinDate = (dateString) => {
        if (!dateString) return 'Recently';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
        });
    };

    const ProfileHeader = () => (
        <View className="items-center mb-8">
            <View className="w-24 h-24 bg-purple-600 rounded-full items-center justify-center mb-4">
                <Text className="text-white text-3xl font-bold">
                    {profile.name
                        ? profile.name.charAt(0).toUpperCase()
                        : user?.email?.charAt(0).toUpperCase() || '?'}
                </Text>
            </View>
            <Text className="text-white text-2xl font-bold">
                {profile.name || 'User'}
            </Text>
            <Text className="text-gray-400 text-base">{user?.email}</Text>

            {/* Stats Row */}
            {/* <View className="flex-row mt-6 space-x-8">
                <View className="items-center">
                    <View className="w-12 h-12 bg-green-500/20 rounded-full items-center justify-center mb-2">
                        <Text className="text-green-500 text-lg">📅</Text>
                    </View>
                    <Text className="text-white font-bold text-lg">{stats.streakDays}</Text>
                    <Text className="text-gray-400 text-xs">Day Streak</Text>
                </View>
                <View className="items-center">
                    <View className="w-12 h-12 bg-blue-500/20 rounded-full items-center justify-center mb-2">
                        <Text className="text-blue-500 text-lg">🎯</Text>
                    </View>
                    <Text className="text-white font-bold text-lg">{stats.totalScans}</Text>
                    <Text className="text-gray-400 text-xs">Total Scans</Text>
                </View>
                <View className="items-center">
                    <View className="w-12 h-12 bg-purple-500/20 rounded-full items-center justify-center mb-2">
                        <Text className="text-purple-500 text-lg">🏆</Text>
                    </View>
                    <Text className="text-white font-bold text-lg">{stats.memberLevel}</Text>
                    <Text className="text-gray-400 text-xs">Member</Text>
                </View>
            </View> */}
        </View>
    );

    const SkinProfile = () => (
        <View className="bg-gray-800/50 rounded-2xl p-4 mb-6">
            <View className="flex-row items-center justify-between mb-4">
                <Text className="text-white text-lg font-semibold">
                    Skin Profile
                </Text>
                <TouchableOpacity
                    className="p-1"
                    onPress={() => {
                        // Navigate to edit profile screen
                        // navigation.navigate('EditProfile');
                        setShowEditModal(true);
                    }}
                >
                    <Text className="text-purple-500 text-base">✏️</Text>
                </TouchableOpacity>
            </View>

            <View className="mb-3">
                <Text className="text-gray-400 text-sm mb-1">Skin Type</Text>
                {profile.skin_type ? (
                    <View className="bg-purple-600/20 px-3 py-2 rounded-full self-start">
                        <Text className="text-purple-300 font-medium">
                            {profile.skin_type}
                        </Text>
                    </View>
                ) : (
                    <Text className="text-gray-500 italic">Not set</Text>
                )}
            </View>

            <View>
                <Text className="text-gray-400 text-sm mb-2">
                    Main Concerns
                </Text>
                {profile.skin_concerns.length > 0 ? (
                    <View className="flex-row flex-wrap gap-2">
                        {profile.skin_concerns.map((concern, index) => (
                            <View
                                key={index}
                                className="bg-gray-700 px-3 py-1 rounded-full"
                            >
                                <Text className="text-gray-300 text-sm">
                                    {concern}
                                </Text>
                            </View>
                        ))}
                    </View>
                ) : (
                    <Text className="text-gray-500 italic">None selected</Text>
                )}
            </View>
        </View>
    );

    const MenuButton = ({
        icon,
        title,
        subtitle,
        onPress,
        isDestructive = false,
    }) => (
        <TouchableOpacity
            onPress={onPress}
            className="bg-gray-800/50 rounded-2xl p-4 mb-3 flex-row items-center"
        >
            <View className="w-10 h-10 bg-gray-700 rounded-full items-center justify-center mr-4">
                <Text className="text-gray-400 text-lg">{icon}</Text>
            </View>
            <View className="flex-1">
                <Text
                    className={`font-medium ${
                        isDestructive ? 'text-red-400' : 'text-white'
                    }`}
                >
                    {title}
                </Text>
                {subtitle && (
                    <Text className="text-gray-400 text-sm">{subtitle}</Text>
                )}
            </View>
            {!isDestructive && <Text className="text-gray-400 text-xl">›</Text>}
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#8B5CF6" />
                <Text className="text-white mt-6 text-lg font-semibold">
                    Loading Profile...
                </Text>
            </View>
        );
    }

    return (
        <ScrollView
            className="flex-1 px-6"
            showsVerticalScrollIndicator={false}
        >
            <Navbar />
            <ProfileHeader />
            <SkinProfile />

            <View className="mb-8">
                <MenuButton
                    icon="📃"
                    title="Terms & Privacy"
                    subtitle="Read our policies"
                    onPress={() => {
                        setShowTermsModal(true);
                    }}
                />
                <MenuButton
                    icon="📊"
                    title="Edit Skin Profile"
                    subtitle="Update skin type and concerns"
                    onPress={() => {
                        setShowEditModal(true);
                    }}
                />
                <MenuButton
                    icon="❓"
                    title="Help & Support"
                    subtitle="Contact Us"
                    onPress={() => {
                        setShowContactModal(true);
                    }}
                />
                <MenuButton
                    icon="❤️"
                    title="Support us!"
                    subtitle="Tap to show appreciation"
                    onPress={() => Linking.openURL('https://buymeacoffee.com/simplyskin')}
                />
                <MenuButton
                    icon="🚪"
                    title="Sign Out"
                    onPress={handleSignOut}
                    isDestructive={true}
                />
            </View>

            <View className="items-center pb-8">
                <Text className="text-gray-500 text-sm">
                    Member since {formatJoinDate(profile.created_at)}
                </Text>
                <Text className="text-gray-600 text-xs mt-1 mb-16">
                    simplyskin v1.0.0
                </Text>
            </View>
            <EditSkinProfileModal
                visible={showEditModal}
                onClose={() => {setShowEditModal(false)
                    fetchProfile()
                }}
                profile={profile}
                
            />
            <ContactUsModal
                visible={showContactModal}
                onClose={() => setShowContactModal(false)}
            />
            <TermsModal 
                visible={showTermsModal}
                onClose={() => setShowTermsModal(false)}
            />
        </ScrollView>
    );
};

export default Profile;
