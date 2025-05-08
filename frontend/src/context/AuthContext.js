import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabase/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(null);
    const [onboardingStep, setOnboardingStep] = useState(1);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                checkOnboardingStatus(session.user.id);
            }
            setLoading(false);
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                checkOnboardingStatus(session.user.id);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const checkOnboardingStatus = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('name, skin_type, skin_concerns')
                .eq('user_id', userId)
                .single();

            if (error) throw error;

            setUser((prevUser) => ({
                ...prevUser,
                name: data.name,
            }));

            if (!data.name || data.name === 'NULL') {
                setOnboardingStep(1);
                setHasCompletedOnboarding(false);
            } else if (!data.skin_type || data.skin_type === 'NULL') {
                setOnboardingStep(2);
                setHasCompletedOnboarding(false);
            } else if (
                !Array.isArray(data.skin_concerns) ||
                data.skin_concerns.length === 0
            ) {
                setOnboardingStep(3);
                setHasCompletedOnboarding(false);
            } else {
                setOnboardingStep(4);
                setHasCompletedOnboarding(true);
            }
        } catch (error) {
            console.error('Error checking onboarding status:', error);
            setHasCompletedOnboarding(false);
            setOnboardingStep(1);
        }
    };

    const refreshOnboardingStatus = async () => {
        if (user) {
            await checkOnboardingStatus(user.id);
        }
    };

    const value = {
        signUp: (data) => supabase.auth.signUp(data),
        signIn: (data) => supabase.auth.signInWithPassword(data),
        signOut: () => supabase.auth.signOut(),
        user,
        loading,
        hasCompletedOnboarding,
        onboardingStep,
        refreshOnboardingStatus,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
