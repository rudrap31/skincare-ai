import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase/supabase';
import StepName from '../components/onboarding/StepName';
import StepSkinType from '../components/onboarding/StepSkinType';
import StepSkinConcerns from '../components/onboarding/StepSkinConcerns';
import GradientBackground from '../components/GradientBackground';

const OnboardingScreen = () => {
    const { user, refreshOnboardingStatus } = useAuth();

    const [step, setStep] = useState(1);
    const [profileData, setProfileData] = useState({
        name: '',
        skin_type: '',
        skin_concerns: [],
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadProfile = async () => {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (!error && data) {
                setProfileData({
                    name: data.name || '',
                    skin_type: data.skin_type || '',
                    skin_concerns: data.skin_concerns || [],
                });

                // Resume where they left off
                if (!data.name || 'NULL') setStep(1);
                else if (!data.skin_type || 'NULL') setStep(2);
                else if (!data.skin_concerns?.length) setStep(3);
                else setStep(4);
            }
            setLoading(false);
        };

        if (user) loadProfile();
    }, [user]);

    const goNext = () => setStep((prev) => prev + 1);
    const goBack = () => setStep((prev) => Math.max(1, prev - 1));

    const updateProfile = async (updates) => {
        setProfileData((prev) => ({ ...prev, ...updates }));
        await supabase.from('profiles').update(updates).eq('user_id', user.id);
    };

    const finishOnboarding = async () => {
        await refreshOnboardingStatus();
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-black">
                <View className="items-center">
                    <ActivityIndicator size="large" color="#8B5CF6" />
                    <Text className="text-white text-lg font-semibold mt-4">
                        Loading your profile...
                    </Text>
                    <Text className="text-gray-300 text-base mt-2 text-center px-8">
                        We're setting up your personalized skin care journey
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, justifyContent: 'center' }}>
            <GradientBackground />
            {step === 1 && (
                <StepName
                    name={profileData.name}
                    onNext={(name) => {
                        updateProfile({ name });
                        goNext();
                    }}
                />
            )}
            {step === 2 && (
                <StepSkinType
                    selected={profileData.skin_type}
                    onNext={(skin_type) => {
                        updateProfile({ skin_type });
                        goNext();
                    }}
                    onBack={goBack}
                />
            )}
            {step === 3 && (
                <StepSkinConcerns
                    selectedConcerns={profileData.skin_concerns}
                    onNext={(skin_concerns) => {
                        updateProfile({ skin_concerns });
                        goNext();
                    }}
                    onBack={goBack}
                />
            )}
            {step === 4 && finishOnboarding()}
        </View>
    );
};

export default OnboardingScreen;
