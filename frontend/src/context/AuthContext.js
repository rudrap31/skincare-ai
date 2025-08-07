import { createContext, useContext, useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { supabase } from '../supabase/supabase';

// Split contexts for better performance
const AuthStateContext = createContext();
const AuthActionsContext = createContext();
const UserDataContext = createContext();

// Image cache to store signed URLs
const imageCache = new Map();
const CACHE_EXPIRY_TIME = 55 * 60 * 1000; // 55 minutes

export const AuthProvider = ({ children }) => {
    // Auth state
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Onboarding state
    const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(null);
    const [onboardingStep, setOnboardingStep] = useState(1);
    
    // User data state
    const [recentScans, setRecentScans] = useState([]);
    const [scannedProducts, setScannedProducts] = useState([]);
    const [dataLoading, setDataLoading] = useState(false);
    const [scanError, setScanError] = useState(null);

    // Prevent refresh cascades
    const isRefreshingRef = useRef(false);
    const mountedRef = useRef(true);
    const isMounted = () => mountedRef.current;

    // Helper function to get signed URL with caching
    const getSignedUrlWithCache = useCallback(async (imagePath) => {
        if (!imagePath || !isMounted()) return null;

        const cacheKey = imagePath;
        const cachedData = imageCache.get(cacheKey);

        if (cachedData && Date.now() - cachedData.timestamp < CACHE_EXPIRY_TIME) {
            return cachedData.url;
        }

        try {
            const { data, error } = await supabase.storage
                .from('face-images')
                .createSignedUrl(imagePath, 3600);

            if (!error && data?.signedUrl && isMounted()) {
                imageCache.set(cacheKey, {
                    url: data.signedUrl,
                    timestamp: Date.now()
                });
                return data.signedUrl;
            }
        } catch (error) {
            if (isMounted()) {
                console.error('Exception generating signed URL:', error);
            }
        }

        return null;
    }, []);

    const clearExpiredCache = useCallback(() => {
        const now = Date.now();
        for (const [key, value] of imageCache.entries()) {
            if (now - value.timestamp >= CACHE_EXPIRY_TIME) {
                imageCache.delete(key);
            }
        }
    }, []);

    // Optimized fetch functions - batch state updates
    const fetchRecentScans = useCallback(async (userId, skipLoading = false) => {
        if (!userId || !isMounted()) return [];

        try {
            const { data: scans, error: scansError } = await supabase
                .from('scanned_faces')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(5);

            if (scansError) throw scansError;
            if (!isMounted()) return [];

            clearExpiredCache();

            const scansWithUrls = await Promise.all(
                scans.map(async (scan) => {
                    if (!isMounted()) return null;
                    const signedUrl = await getSignedUrlWithCache(scan.image_path);
                    return {
                        data: {
                            ...scan,
                            date: new Date(scan.created_at),
                        },
                        image_url: signedUrl,
                    };
                })
            );

            const validScans = scansWithUrls.filter(Boolean);
            return validScans;
        } catch (error) {
            if (isMounted()) {
                console.error('Error fetching recent scans:', error);
                if (!skipLoading) {
                    setScanError(error.message);
                }
            }
            return [];
        }
    }, [getSignedUrlWithCache, clearExpiredCache]);

    const fetchScannedProducts = useCallback(async (userId, skipLoading = false) => {
        if (!userId || !isMounted()) return [];

        try {
            const { data, error } = await supabase
                .from('scanned_products')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const products = data || [];
            return products;
        } catch (error) {
            if (isMounted()) {
                console.error('Error fetching scanned products:', error);
                if (!skipLoading) {
                    setScanError(prev => prev ? `${prev}. ${error.message}` : error.message);
                }
            }
            return [];
        }
    }, []);

    // KEY FIX: Batch state updates to prevent cascading re-renders
    const fetchUserData = useCallback(async (userId, options = {}) => {
        if (!userId || !isMounted() || isRefreshingRef.current) return;

        const { silent = false } = options;

        try {
            // Prevent multiple simultaneous refreshes
            isRefreshingRef.current = true;

            if (!silent && isMounted()) {
                setDataLoading(true);
                setScanError(null);
            }

            // Fetch all data concurrently
            const [scansResult, productsResult] = await Promise.allSettled([
                fetchRecentScans(userId, silent),
                fetchScannedProducts(userId, silent),
            ]);

            if (!isMounted()) return;

            // BATCH all state updates together to prevent multiple re-renders
            const newRecentScans = scansResult.status === 'fulfilled' ? scansResult.value : [];
            const newScannedProducts = productsResult.status === 'fulfilled' ? productsResult.value : [];
            
            let errorMessage = null;
            if (scansResult.status === 'rejected' && scansResult.reason?.name !== 'AbortError') {
                errorMessage = 'Failed to load recent scans';
            }
            if (productsResult.status === 'rejected' && productsResult.reason?.name !== 'AbortError') {
                errorMessage = errorMessage ? `${errorMessage}. Failed to load products` : 'Failed to load products';
            }

            // Single state update batch
            setRecentScans(newRecentScans);
            setScannedProducts(newScannedProducts);
            if (errorMessage && !silent) {
                setScanError(errorMessage);
            }

        } catch (error) {
            if (isMounted() && !silent) {
                console.error('Error fetching user data:', error);
                setScanError('Failed to load user data');
            }
        } finally {
            if (isMounted()) {
                if (!silent) setDataLoading(false);
                isRefreshingRef.current = false;
            }
        }
    }, [fetchRecentScans, fetchScannedProducts]);

    const checkOnboardingStatus = useCallback(async (userId) => {
        if (!userId || !isMounted()) return;

        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('name, skin_type, skin_concerns')
                .eq('user_id', userId)
                .single();

            if (!isMounted()) return;

            if (error) {
                if (error.code === 'PGRST116') {
                    setOnboardingStep(1);
                    setHasCompletedOnboarding(false);
                    return;
                }
                throw error;
            }

            setUser((prevUser) => ({
                ...prevUser,
                name: data.name,
                skin_type: data.skin_type,
                skin_concerns: data.skin_concerns,
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
            if (isMounted()) {
                console.error('Error checking onboarding status:', error);
                setHasCompletedOnboarding(false);
                setOnboardingStep(1);
            }
        }
    }, []);

    // Initialize auth state
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                
                if (!isMounted()) return;

                setUser(session?.user ?? null);
                
                if (session?.user) {
                    await Promise.allSettled([
                        checkOnboardingStatus(session.user.id),
                        fetchUserData(session.user.id)
                    ]);
                }
            } catch (error) {
                if (isMounted()) {
                    console.error('Error initializing auth:', error);
                }
            } finally {
                if (isMounted()) {
                    setLoading(false);
                }
            }
        };

        initializeAuth();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!isMounted()) return;

            setUser(session?.user ?? null);
            
            if (session?.user) {
                await Promise.allSettled([
                    checkOnboardingStatus(session.user.id),
                    fetchUserData(session.user.id)
                ]);
            } else {
                setRecentScans([]);
                setScanError(null);
                setScannedProducts([]);
                setHasCompletedOnboarding(null);
                setOnboardingStep(1);
                imageCache.clear();
            }

            if (isMounted()) {
                setLoading(false);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [checkOnboardingStatus, fetchUserData]);

    useEffect(() => {
        return () => {
            mountedRef.current = false;
        };
    }, []);

    // STABLE action functions that won't cause re-renders
    const refreshUserData = useCallback(async (options = {}) => {
        if (user?.id) {
            await fetchUserData(user.id, options);
        }
    }, [user?.id, fetchUserData]);

    const refreshOnboardingStatus = useCallback(async () => {
        if (user?.id) {
            await checkOnboardingStatus(user.id);
        }
    }, [user?.id, checkOnboardingStatus]);

    const clearImageCache = useCallback(() => {
        imageCache.clear();
    }, []);

    const fetchScannedProductsAction = useCallback(async (userId) => {
        return fetchScannedProducts(userId || user?.id);
    }, [user?.id, fetchScannedProducts]);

    // Completely stable actions object
    const authActions = useMemo(() => ({
        signUp: (data) => supabase.auth.signUp(data),
        signIn: (data) => supabase.auth.signInWithPassword(data),
        signOut: () => supabase.auth.signOut(),
        refreshUserData,           // Now stable!
        refreshOnboardingStatus,   // Now stable!
        clearImageCache,          // Now stable!
        fetchScannedProducts: fetchScannedProductsAction,
    }), [refreshUserData, refreshOnboardingStatus, clearImageCache, fetchScannedProductsAction]);

    // Memoized state values
    const authState = useMemo(() => ({
        user,
        loading,
        hasCompletedOnboarding,
        onboardingStep,
    }), [user, loading, hasCompletedOnboarding, onboardingStep]);

    const userData = useMemo(() => ({
        recentScans,
        scannedProducts,
        dataLoading,
        scanError,
    }), [recentScans, scannedProducts, dataLoading, scanError]);

    return (
        <AuthStateContext.Provider value={authState}>
            <AuthActionsContext.Provider value={authActions}>
                <UserDataContext.Provider value={userData}>
                    {!loading && children}
                </UserDataContext.Provider>
            </AuthActionsContext.Provider>
        </AuthStateContext.Provider>
    );
};

// Custom hooks
export const useAuthState = () => {
    const context = useContext(AuthStateContext);
    if (!context) {
        throw new Error('useAuthState must be used within an AuthProvider');
    }
    return context;
};

export const useAuthActions = () => {
    const context = useContext(AuthActionsContext);
    if (!context) {
        throw new Error('useAuthActions must be used within an AuthProvider');
    }
    return context;
};

export const useUserData = () => {
    const context = useContext(UserDataContext);
    if (!context) {
        throw new Error('useUserData must be used within an AuthProvider');
    }
    return context;
};

// Legacy hook for backward compatibility
export const useAuth = () => {
    const authState = useAuthState();
    const authActions = useAuthActions();
    const userData = useUserData();
    
    return {
        ...authState,
        ...authActions,
        ...userData,
    };
};