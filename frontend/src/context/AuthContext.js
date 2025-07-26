import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabase/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(null);
    const [onboardingStep, setOnboardingStep] = useState(1);

    // User data states
    const [recentScans, setRecentScans] = useState([]);
    const [scannedProducts, setScannedProducts] = useState([]);
    const [dataLoading, setDataLoading] = useState(false);
    const [scanError, setScanError] = useState(null);

    const fetchRecentScans = async (userId) => { 
        try {
            setScanError(null);
            
            const { data: scans, error: scansError } = await supabase
                .from('scanned_faces')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(5);

            if (scansError) throw scansError;

            const scansWithUrls = await Promise.all(
                scans.map(async (scan) => {
                    let signedUrl = null;

                    if (scan.image_path) {
                        try {
                            const { data: urlData, error: urlError } =
                                await supabase.storage
                                    .from('face-images')
                                    .createSignedUrl(scan.image_path, 3600);

                            if (!urlError && urlData?.signedUrl) {
                                signedUrl = urlData.signedUrl;
                            }
                        } catch (urlError) {
                            console.error(
                                'Exception generating signed URL:',
                                urlError
                            );
                        }
                    }

                    return {
                        data: {
                            ...scan,
                            date: new Date(scan.created_at),
                        },
                        image_url: signedUrl,
                    };
                })
            );

            setRecentScans(scansWithUrls);
            return scansWithUrls;
        } catch (error) {
            console.error('Error fetching recent scans:', error);
            setScanError(error.message);
            setRecentScans([]); // Set empty array on error
            return [];
        }
    };

    const fetchScannedProducts = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('scanned_products')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Failed to fetch scanned products:', error.message);
                setScannedProducts([]);
                return [];
            }

            setScannedProducts(data || []);
            return data || [];
        } catch (error) {
            console.error('Error fetching scanned products:', error);
            setScannedProducts([]);
            return [];
        }
    };

    const fetchUserData = async (userId) => {
        try {
            setDataLoading(true);

            const [scansResult, productsResult] = await Promise.all([
                fetchRecentScans(userId),
                fetchScannedProducts(userId),
            ]);
        
        } catch (error) {
            console.error('Error fetching user data:', error);
        } finally {
            setDataLoading(false);
        }
    };

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                checkOnboardingStatus(session.user.id);
                fetchUserData(session.user.id);
            }
            setLoading(false);
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                checkOnboardingStatus(session.user.id);
                await fetchUserData(session.user.id);
            } else {
                // Clear data on logout
                setRecentScans([]);
                setScanError(null);
                setScannedProducts([]);
            }

            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const refreshUserData = () => {
        if (user?.id) {
            fetchUserData(user.id);
        }
    };

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
        recentScans,
        scannedProducts,
        fetchScannedProducts,
        dataLoading,
        refreshUserData,
        scanError,
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