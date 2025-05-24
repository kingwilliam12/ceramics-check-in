import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

// These values should be moved to environment variables in production
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'your-supabase-url';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-supabase-anon-key';

if (!supabaseUrl || supabaseUrl === 'your-supabase-url' || !supabaseAnonKey || supabaseAnonKey === 'your-supabase-anon-key') {
  console.error('CRITICAL: Supabase URL or Anon Key is missing or using placeholder values. URL:', supabaseUrl, 'Key:', supabaseAnonKey);
  throw new Error('Missing or placeholder Supabase URL or Anon Key. Please check your environment variables and ensure they are loaded correctly.');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Helper function to handle API errors
export const handleError = (error: any, context?: string) => {
  console.error(`Error${context ? ` in ${context}` : ''}:`, error);
  return {
    data: null,
    error: {
      message: error.message || 'An unexpected error occurred',
      details: error,
    },
  };
};

// Helper function to execute Supabase queries with error handling
export const executeQuery = async <T>(
  query: Promise<{ data: T | null; error: any }>,
  context?: string
): Promise<{ data: T | null; error: any }> => {
  try {
    const { data, error } = await query;
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return handleError(error, context);
  }
};

// Session management
export const getCurrentSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
};

// User management
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

// Check if user is authenticated
export const isAuthenticated = async () => {
  const session = await getCurrentSession();
  return !!session?.user;
};

// Check if user has a specific role
export const hasRole = async (role: string) => {
  const { data: userData, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', (await getCurrentUser())?.id)
    .single();
    
  if (error) {
    console.error('Error checking user role:', error);
    return false;
  }
  
  return userData?.role === role;
};
