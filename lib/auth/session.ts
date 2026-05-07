import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { Session } from './types';

/**
 * Get the current session from cookies (server-side)
 * Use this in API routes and Server Components
 * @returns Session object or null if not authenticated
 */
export async function getSession(): Promise<Session | null> {
  try {
    // Create SSR Supabase client
    const supabase = await createClient();

    // Get session from Supabase
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error || !session) {
      return null;
    }

    // Get our database user - use 'id' not 'supabaseAuthId'
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (userError || !user) {
      console.error('User not found in database:', userError);
      return null;
    }

    return {
      user,
      supabaseUser: session.user,
    };
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

/**
 * Require authentication - throw error if not logged in
 * Use this in API routes that require authentication
 * @returns Session object
 * @throws Error if not authenticated
 */
export async function requireSession(): Promise<Session> {
  const session = await getSession();

  if (!session) {
    throw new Error('Authentication required');
  }

  return session;
}

/**
 * Get user ID from current session
 * @returns User ID or null
 */
export async function getUserId(): Promise<string | null> {
  const session = await getSession();
  return session?.user.id || null;
}
