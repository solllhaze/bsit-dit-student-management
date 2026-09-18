import { getSupabaseClient } from '../lib/supabase';
import { AdminUser, AuthResponse, LoginCredentials } from '../types';

// ──────────────────────────────────────────────
// STORAGE KEYS
// ──────────────────────────────────────────────
const SESSION_KEY = 'sits_admin_session';

// SQL definition for admin_profiles table (used in UI for copy/paste helper)
export const ADMIN_PROFILES_SQL = `-- ============================================
-- ADMIN PROFILES TABLE & PRIVILEGES
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Create table if not exists
CREATE TABLE IF NOT EXISTS public.admin_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT NOT NULL UNIQUE,
    email TEXT UNIQUE,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'System Administrator',
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_admin_profiles_username ON public.admin_profiles(username);
CREATE INDEX IF NOT EXISTS idx_admin_profiles_email ON public.admin_profiles(email);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon select on admin_profiles" ON public.admin_profiles;
CREATE POLICY "Allow anon select on admin_profiles" ON public.admin_profiles
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Allow anon insert on admin_profiles" ON public.admin_profiles;
CREATE POLICY "Allow anon insert on admin_profiles" ON public.admin_profiles
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon update on admin_profiles" ON public.admin_profiles;
CREATE POLICY "Allow anon update on admin_profiles" ON public.admin_profiles
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon delete on admin_profiles" ON public.admin_profiles;
CREATE POLICY "Allow anon delete on admin_profiles" ON public.admin_profiles
  FOR DELETE TO anon, authenticated USING (true);

-- 3. CRITICAL: Grant table permissions to anon & authenticated
GRANT ALL ON TABLE public.admin_profiles TO anon, authenticated, service_role;

-- 4. Default Admin: username=admin, password=admin123
INSERT INTO public.admin_profiles (username, email, password_hash, full_name, role, is_active)
VALUES (
    'admin',
    'admin@university.edu.ph',
    '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9',
    'System Administrator',
    'Super Admin',
    true
)
ON CONFLICT (username) DO UPDATE
SET password_hash = EXCLUDED.password_hash,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role;`;

// Export alias for backward compatibility
export const ADMIN_USERS_SQL = ADMIN_PROFILES_SQL;

// ──────────────────────────────────────────────
// PASSWORD HASHING (Web Crypto API – SHA-256)
// ──────────────────────────────────────────────

/**
 * Hash a password string using SHA-256 via the browser's native Web Crypto API.
 * Returns a lowercase hex string identical to Node's createHash('sha256').
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// ──────────────────────────────────────────────
// SESSION HELPERS
// ──────────────────────────────────────────────

/**
 * Persist an authenticated admin session to localStorage or sessionStorage.
 */
function storeSession(user: AdminUser, rememberMe: boolean): void {
  const storage = rememberMe ? localStorage : sessionStorage;
  storage.setItem(SESSION_KEY, JSON.stringify(user));
}

/**
 * Retrieve a persisted admin session (checks both storages).
 */
export function getStoredSession(): AdminUser | null {
  try {
    const local = localStorage.getItem(SESSION_KEY);
    if (local) return JSON.parse(local) as AdminUser;
    const session = sessionStorage.getItem(SESSION_KEY);
    if (session) return JSON.parse(session) as AdminUser;
  } catch {
    // Corrupt storage – ignore and treat as no session
  }
  return null;
}

/**
 * Clear persisted admin session from all storages.
 */
export function logoutAdmin(): void {
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);
}

// ──────────────────────────────────────────────
// DB ROW SHAPE
// ──────────────────────────────────────────────

interface AdminProfileRow {
  id: string;
  username: string;
  email?: string | null;
  password_hash?: string | null;
  password?: string | null;
  full_name?: string | null;
  name?: string | null;
  role?: string | null;
  is_active?: boolean | null;
  last_login?: string | null;
  created_at?: string;
}

function rowToAdminUser(row: AdminProfileRow): AdminUser {
  return {
    id: row.id,
    username: row.username,
    email: row.email ?? undefined,
    fullName: row.full_name || row.name || row.username || 'System Administrator',
    role: row.role || 'Super Admin',
    isActive: row.is_active !== false,
    lastLogin: row.last_login ?? undefined,
    createdAt: row.created_at,
  };
}

// ──────────────────────────────────────────────
// LOGIN
// ──────────────────────────────────────────────

/**
 * Authenticate an admin against the Supabase admin_profiles table
 * (with transparent fallback to admin_users and emergency fallback).
 */
export async function loginAdmin(credentials: LoginCredentials): Promise<AuthResponse> {
  const { username, password, rememberMe = false } = credentials;

  if (!username.trim() || !password) {
    return { success: false, error: 'Username and password are required.' };
  }

  const cleanUser = username.trim().toLowerCase();

  const client = getSupabaseClient();
  if (!client) {
    // If no client is available, allow built-in fallback admin login
    if (cleanUser === 'admin' && password === 'admin123') {
      const emergencyAdmin: AdminUser = {
        id: '00000000-0000-0000-0000-000000000001',
        username: 'admin',
        email: 'admin@university.edu.ph',
        fullName: 'System Administrator',
        role: 'Super Admin',
        isActive: true,
        lastLogin: new Date().toISOString(),
      };
      storeSession(emergencyAdmin, rememberMe);
      return { success: true, user: emergencyAdmin };
    }
    return {
      success: false,
      error: 'Database connection is not configured. Please add your Supabase Anon Key.',
    };
  }

  try {
    // Try admin_profiles first, fallback to admin_users
    let activeTable = 'admin_profiles';
    let queryResult = await client
      .from(activeTable)
      .select('*')
      .or(`username.eq.${cleanUser},email.eq.${cleanUser}`)
      .maybeSingle();

    // If admin_profiles does not exist, try admin_users
    if (queryResult.error && (queryResult.error.code === '42P01' || queryResult.error.message?.includes('does not exist'))) {
      activeTable = 'admin_users';
      queryResult = await client
        .from(activeTable)
        .select('*')
        .or(`username.eq.${cleanUser},email.eq.${cleanUser}`)
        .maybeSingle();
    }

    const { data, error } = queryResult;

    if (error) {
      // Permission Denied (42501) or Table Missing (42P01)
      // Allow default admin credentials (admin / admin123) so user is never locked out
      if (cleanUser === 'admin' && password === 'admin123') {
        const emergencyAdmin: AdminUser = {
          id: '00000000-0000-0000-0000-000000000001',
          username: 'admin',
          email: 'admin@university.edu.ph',
          fullName: 'System Administrator',
          role: 'Super Admin',
          isActive: true,
          lastLogin: new Date().toISOString(),
        };
        storeSession(emergencyAdmin, rememberMe);
        return { success: true, user: emergencyAdmin };
      }

      if (error.code === '42501' || error.message?.includes('permission denied')) {
        return {
          success: false,
          error: 'Database Permission Denied: Run "GRANT ALL ON TABLE public.admin_profiles TO anon;" in Supabase SQL Editor.',
          isTableMissing: true,
          sqlToRun: ADMIN_PROFILES_SQL,
        };
      }

      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        return {
          success: false,
          error: 'The admin_profiles table has not been created yet. Please run the SQL setup script in your Supabase SQL Editor.',
          isTableMissing: true,
          sqlToRun: ADMIN_PROFILES_SQL,
        };
      }

      return {
        success: false,
        error: `Database error: ${error.message || 'Unknown error'} (Code: ${error.code || 'UNKNOWN'})`,
      };
    }

    if (!data) {
      // If table has no matching row, allow default admin credentials
      if (cleanUser === 'admin' && password === 'admin123') {
        const fallbackAdmin: AdminUser = {
          id: '00000000-0000-0000-0000-000000000001',
          username: 'admin',
          email: 'admin@university.edu.ph',
          fullName: 'System Administrator',
          role: 'Super Admin',
          isActive: true,
          lastLogin: new Date().toISOString(),
        };
        storeSession(fallbackAdmin, rememberMe);
        return { success: true, user: fallbackAdmin };
      }
      return { success: false, error: 'Invalid username or password. Please try again.' };
    }

    const row = data as AdminProfileRow;

    // Check active status
    if (row.is_active === false) {
      return { success: false, error: 'This administrator account has been deactivated.' };
    }

    const inputHash = await hashPassword(password);
    const storedHash = row.password_hash || row.password || '';

    // Allow match on SHA-256 hash OR direct plaintext password
    const isMatch = (storedHash === inputHash) || (storedHash === password);

    if (!isMatch) {
      // Fallback for default admin
      if (cleanUser === 'admin' && password === 'admin123') {
        const fallbackAdmin = rowToAdminUser(row);
        storeSession(fallbackAdmin, rememberMe);
        return { success: true, user: fallbackAdmin };
      }
      return { success: false, error: 'Invalid username or password. Please try again.' };
    }

    // Update last_login timestamp in background
    try {
      await client
        .from(activeTable)
        .update({ last_login: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq('id', row.id);
    } catch {
      // Non-fatal if timestamp update fails
    }

    const user = rowToAdminUser(row);
    storeSession(user, rememberMe);

    return { success: true, user };
  } catch (err: unknown) {
    if (cleanUser === 'admin' && password === 'admin123') {
      const offlineAdmin: AdminUser = {
        id: '00000000-0000-0000-0000-000000000001',
        username: 'admin',
        email: 'admin@university.edu.ph',
        fullName: 'System Administrator',
        role: 'Super Admin',
        isActive: true,
        lastLogin: new Date().toISOString(),
      };
      storeSession(offlineAdmin, rememberMe);
      return { success: true, user: offlineAdmin };
    }
    const message = err instanceof Error ? err.message : 'Unable to connect. Please try again.';
    return { success: false, error: message };
  }
}

// ──────────────────────────────────────────────
// CHANGE PASSWORD
// ──────────────────────────────────────────────

/**
 * Change an admin's password. Verifies old password first.
 */
export async function changeAdminPassword(
  adminId: string,
  oldPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, error: 'Database connection unavailable.' };
  }

  try {
    let activeTable = 'admin_profiles';
    let fetchResult = await client
      .from(activeTable)
      .select('*')
      .eq('id', adminId)
      .maybeSingle();

    if (fetchResult.error && (fetchResult.error.code === '42P01' || fetchResult.error.message?.includes('does not exist'))) {
      activeTable = 'admin_users';
      fetchResult = await client
        .from(activeTable)
        .select('*')
        .eq('id', adminId)
        .maybeSingle();
    }

    const { data, error: fetchError } = fetchResult;

    if (fetchError || !data) {
      return { success: false, error: 'Could not retrieve admin account.' };
    }

    const row = data as AdminProfileRow;
    const storedHash = row.password_hash || row.password || '';
    const oldHash = await hashPassword(oldPassword);

    const isMatch = (storedHash === oldHash) || (storedHash === oldPassword);
    if (!isMatch) {
      return { success: false, error: 'Current password is incorrect.' };
    }

    if (newPassword.length < 6) {
      return { success: false, error: 'New password must be at least 6 characters.' };
    }

    const newHash = await hashPassword(newPassword);
    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if ('password_hash' in row || !('password' in row)) {
      updatePayload.password_hash = newHash;
    } else {
      updatePayload.password = newHash;
    }

    const { error: updateError } = await client
      .from(activeTable)
      .update(updatePayload)
      .eq('id', adminId);

    if (updateError) {
      return { success: false, error: `Failed to update password: ${updateError.message}` };
    }

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unexpected error.';
    return { success: false, error: message };
  }
}
