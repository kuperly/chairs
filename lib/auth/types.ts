import { User as SupabaseUser } from '@supabase/supabase-js';
import { User } from '@/lib/db/entities';

/**
 * Session with both Supabase auth and our database user
 */
export interface Session {
  user: User;
  supabaseUser: SupabaseUser;
}

/**
 * Authentication error
 */
export interface AuthError {
  message: string;
  code?: string;
}

/**
 * Login credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Registration data
 */
export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  accountType: 'customer' | 'manufacturer';
  companyName?: string; // Required for manufacturers
}
