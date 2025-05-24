import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import { Member } from '../types';

type AuthContextType = {
  session: Session | null;
  user: Member | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (newPassword: string) => Promise<{ error: any }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<Member | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and set the session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        
        if (newSession?.user) {
          // Fetch user profile from members and profiles tables
          const { data: userData, error } = await supabase
            .from('members')
            .select(`
              *,
              profiles (
                role
              )
            `)
            .eq('id', newSession.user.id)
            .single();
            
          if (!error && userData) {
            // Merge member data with profile role
            const memberWithRole = {
              ...userData,
              role: userData.profiles?.[0]?.role || 'member' as const,
            };
            setUser(memberWithRole);
          }
        } else {
          setUser(null);
        }
        
        setIsLoading(false);
      }
    );

    // Check current session when the component mounts
    const getSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      
      if (currentSession?.user) {
        const { data: userData, error } = await supabase
          .from('members')
          .select(`
            *,
            profiles (
              role
            )
          `)
          .eq('id', currentSession.user.id)
          .single();
          
        if (!error && userData) {
          // Merge member data with profile role
          const memberWithRole = {
            ...userData,
            role: userData.profiles?.[0]?.role || 'member' as const,
          };
          setUser(memberWithRole);
        }
      } else {
        setUser(null);
      }
      
      setIsLoading(false);
    };
    
    getSession();

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      return { error: null };
    } catch (error) {
      console.error('Error signing in:', error);
      return { error };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      // 1. Sign up the user with Supabase Auth
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (signUpError) throw signUpError;
      if (!authData.user) throw new Error('No user returned after sign up');

      // 2. Create a corresponding member record in the database
      const { error: memberError } = await supabase
        .from('members')
        .insert([
          {
            id: authData.user.id,
            email,
            full_name: fullName,
            status: 'active',
            role: 'member', // Default role
          },
        ]);

      if (memberError) throw memberError;

      // 3. Create a profile record with default role
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: authData.user.id,
            email,
            full_name: fullName,
            role: 'member', // Default role
          },
        ]);

      if (profileError) throw profileError;

      return { error: null };
    } catch (error) {
      console.error('Error signing up:', error);
      // Clean up if there was an error after user was created
      if (authData?.user) {
        await supabase.auth.admin.deleteUser(authData.user.id);
        await supabase.from('members').delete().eq('id', authData.user.id);
      }
      return { error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error signing out:', error);
      return { error };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error resetting password:', error);
      return { error };
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error updating password:', error);
      return { error };
    }
  };

  const value = {
    session,
    user,
    isLoading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
