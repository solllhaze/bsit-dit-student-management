import { getSupabaseClient } from '../lib/supabase';
import { AdminUser, AuthResponse, LoginCredentials } from '../types';

// ──────────────────────────────────────────────
// STORAGE KEYS
// ──────────────────────────────────────────────
const SESSION_KEY = 'sits_admin_session';

// SQL definition for admin_users table (used in UI for copy/paste helper)
export const ADMIN_USERS_SQL = `-- ============================================
-- ADMIN USERS TABLE - Run in Supabase SQL Editor
-- ============================================
CREATE TABLE IF NOT EXISTS public.admin_users (
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

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon select on admin_users" ON public.admin_users;
CREATE POLICY "Allow anon select on admin_users" ON public.admin_users
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Allow anon insert on admin_users" ON public.admin_users;
CREATE POLICY "Allow anon insert on admin_users" ON public.admin_users
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon update on admin_users" ON public.admin_users;
CREATE POLICY "Allow anon update on admin_users" ON public.admin_users
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

GRANT ALL ON public.admin_users TO anon, authenticated, service_role;

-- Default Admin: username=admin, password=admin123
INSERT INTO public.admin_users (username, email, password_hash, full_name, role, is_active)
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

interface AdminUserRow {
  id: string;
  username: string;
  email?: string | null;
  password_hash: string;
  full_name: string;
  role: string;
  is_active: boolean;
  last_login?: string | null;
  created_at?: string;
}

function rowToAdminUser(row: AdminUserRow): AdminUser {
  return {
    id: row.id,
    username: row.username,
    email: row.email ?? undefined,
    fullName: row.full_name,
    role: row.role,
    isActive: row.is_active,
    lastLogin: row.last_login ?? undefined,
    createdAt: row.created_at,
  };
}

// ──────────────────────────────────────────────
// LOGIN
// ──────────────────────────────────────────────

/**
 * Authenticate an admin against the Supabase admin_users table.
 * Falls back gracefully when the table is missing (with SQL helper).
 */
export async function loginAdmin(credentials: LoginCredentials): Promise<AuthResponse> {
  const { username, password, rememberMe = false } = credentials;

  if (!username.trim() || !password) {
    return { success: false, error: 'Username and password are required.' };
  }

  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      error: 'Database connection is not configured. Please add your Supabase Anon Key in Settings.',
    };
  }

  try {
    const { data, error } = await client
      .from('admin_users')
      .select('id, username, email, password_hash, full_name, role, is_active, last_login, created_at')
      .eq('username', username.trim().toLowerCase())
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      // Table does not exist yet
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        return {
          success: false,
          error: 'The admin_users table has not been created yet. Please run the SQL setup script in your Supabase SQL Editor.',
          isTableMissing: true,
          sqlToRun: ADMIN_USERS_SQL,
        };
      }
      return {
        success: false,
        error: `Database error: ${error.message || 'Unknown error'} (Code: ${error.code || 'UNKNOWN'})`,
      };
    }

    if (!data) {
      return { success: false, error: 'Invalid username or password. Please try again.' };
    }

    const row = data as AdminUserRow;
    const inputHash = await hashPassword(password);

    if (inputHash !== row.password_hash) {
      return { success: false, error: 'Invalid username or password. Please try again.' };
    }

    // Update last_login timestamp
    await client
      .from('admin_users')
      .update({ last_login: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('id', row.id);

    const user = rowToAdminUser(row);
    storeSession(user, rememberMe);

    return { success: true, user };
  } catch (err: unknown) {
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
    const { data, error: fetchError } = await client
      .from('admin_users')
      .select('password_hash')
      .eq('id', adminId)
      .maybeSingle();

    if (fetchError || !data) {
      return { success: false, error: 'Could not retrieve admin account.' };
    }

    const oldHash = await hashPassword(oldPassword);
    if (oldHash !== (data as { password_hash: string }).password_hash) {
      return { success: false, error: 'Current password is incorrect.' };
    }

    if (newPassword.length < 6) {
      return { success: false, error: 'New password must be at least 6 characters.' };
    }

    const newHash = await hashPassword(newPassword);
    const { error: updateError } = await client
      .from('admin_users')
      .update({ password_hash: newHash, updated_at: new Date().toISOString() })
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
