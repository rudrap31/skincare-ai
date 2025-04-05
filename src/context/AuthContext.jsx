import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabase/supabase';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkOnboardingStatus(session.user.id);
      }
      setLoading(false);
    });

    // Listen for changes on auth state (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
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

      const isComplete = data.name !== "NULL" && 
                        data.skin_type !== "NULL" && 
                        Array.isArray(data.skin_concerns) && 
                        data.skin_concerns.length > 0;

      setHasCompletedOnboarding(isComplete);
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setHasCompletedOnboarding(false);
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
    hasCompletedOnboarding,
    loading,
    refreshOnboardingStatus
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