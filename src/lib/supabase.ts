import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const DEFAULT_SUPABASE_URL = 'https://ppynzitnihxmdgeqsrjd.supabase.co';

const STORAGE_KEY_ANON = 'sits_supabase_anon_key';
const STORAGE_KEY_URL = 'sits_supabase_project_url';

/**
 * Retrieve the active Supabase Project URL (from Vite env or localStorage or default)
 */
export function getSupabaseUrl(): string {
  if (typeof window !== 'undefined') {
    const customUrl = localStorage.getItem(STORAGE_KEY_URL);
    if (customUrl && customUrl.trim()) {
      return customUrl.trim();
    }
  }
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  if (envUrl && envUrl.trim() && !envUrl.includes('MY_APP_URL')) {
    return envUrl.trim();
  }
  return DEFAULT_SUPABASE_URL;
}

/**
 * Retrieve the active Supabase Anon Key (from Vite env or localStorage)
 */
export function getSupabaseAnonKey(): string {
  if (typeof window !== 'undefined') {
    const customKey = localStorage.getItem(STORAGE_KEY_ANON);
    if (customKey && customKey.trim()) {
      return customKey.trim();
    }
  }
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (envKey && envKey.trim()) {
    return envKey.trim();
  }
  return '';
}

/**
 * Store credentials in browser local storage for instant runtime connection
 */
export function storeSupabaseCredentials(anonKey: string, url?: string): void {
  if (typeof window === 'undefined') return;
  if (anonKey.trim()) {
    localStorage.setItem(STORAGE_KEY_ANON, anonKey.trim());
  }
  if (url && url.trim()) {
    localStorage.setItem(STORAGE_KEY_URL, url.trim());
  }
  // Clear cached client so next getSupabaseClient re-instantiates
  cachedClient = null;
}

/**
 * Clear stored credentials
 */
export function clearStoredSupabaseCredentials(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY_ANON);
  localStorage.removeItem(STORAGE_KEY_URL);
  cachedClient = null;
}

let cachedClient: SupabaseClient | null = null;
let lastClientKey: string = '';

/**
 * Get or create the Supabase client instance
 */
export function getSupabaseClient(): SupabaseClient | null {
  const url = getSupabaseUrl();
  const anonKey = getSupabaseAnonKey();

  if (!anonKey) {
    return null;
  }

  const cacheToken = `${url}::${anonKey}`;
  if (cachedClient && lastClientKey === cacheToken) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    lastClientKey = cacheToken;
    return cachedClient;
  } catch (err) {
    console.error('Failed to create Supabase client:', err);
    return null;
  }
}

/**
 * Test connectivity to the Supabase students table
 */
export async function testSupabaseConnection(
  urlOverride?: string,
  keyOverride?: string
): Promise<{ success: boolean; message: string; rowCount?: number }> {
  const url = urlOverride?.trim() || getSupabaseUrl();
  const key = keyOverride?.trim() || getSupabaseAnonKey();

  if (!url) {
    return { success: false, message: 'Supabase Project URL is missing.' };
  }
  if (!key) {
    return {
      success: false,
      message: 'Supabase Anon Key is missing. Please provide your public client key.',
    };
  }

  try {
    const testClient = createClient(url, key);
    const { data, error, count } = await testClient
      .from('students')
      .select('*', { count: 'exact', head: true });

    if (error) {
      // If table doesn't exist yet (42P01 in Postgres), give clear helpful error
      if (error.code === '42P01' || error.message.includes('does not exist')) {
        return {
          success: false,
          message:
            'Connected to Supabase, but the "students" table does not exist yet. Please run the SQL schema in your Supabase SQL Editor.',
        };
      }
      return {
        success: false,
        message: `Database error: ${error.message} (Code: ${error.code || 'UNKNOWN'})`,
      };
    }

    return {
      success: true,
      message: 'Successfully connected to Supabase database!',
      rowCount: count ?? 0,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Unable to connect to the database. Please try again.',
    };
  }
}
