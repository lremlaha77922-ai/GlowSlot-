import { supabase, isSupabaseConfigured } from '../../../lib/supabase';
import { UserSession, Gender } from '../../../types';

export interface ProfileRecord {
  id: string;
  phone?: string | null;
  full_name: string;
  gender?: Gender;
  email?: string;
  points: number;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

export const authService = {
  isConfigured(): boolean {
    return isSupabaseConfigured();
  },

  async signUpWithEmail(
    email: string,
    password: string,
    name: string,
    gender: Gender,
    referralCode?: string
  ): Promise<{ success: boolean; session?: UserSession; message?: string; error?: string }> {
    console.log('[GLOWSLOT AUTH] SIGNUP CALLED', Date.now());
    const cleanEmail = email.trim().toLowerCase();
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
    let urlHost = 'unconfigured';
    try {
      if (supabaseUrl) urlHost = new URL(supabaseUrl).hostname;
    } catch {
      urlHost = supabaseUrl;
    }

    console.log('[AUTH] Supabase signup started for:', cleanEmail, 'Target host:', urlHost);

    if (isSupabaseConfigured()) {
      try {
        const redirectUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              full_name: name,
              gender,
            },
          },
        });

        console.log('[AUTH] Signup result:', {
          userId: data?.user?.id || null,
          email: data?.user?.email || null,
          hasSession: !!data?.session,
          error: error?.message || null,
        });

        if (error) {
          console.error('[AUTH SIGNUP ERROR]', error.message);
          let friendlyError = error.message;
          const errLower = error.message.toLowerCase();

          if (
            errLower.includes('rate limit') ||
            errLower.includes('email rate limit') ||
            errLower.includes('email sending limit') ||
            errLower.includes('too many emails')
          ) {
            friendlyError =
              'Supabase email sending limit has been reached. Please wait before creating another account.';
          } else if (
            errLower.includes('already registered') ||
            errLower.includes('already exists') ||
            errLower.includes('user_already_exists')
          ) {
            friendlyError = 'An account with this email already exists.';
          } else if (
            errLower.includes('email signups are disabled') ||
            errLower.includes('signups are disabled') ||
            errLower.includes('provider is disabled')
          ) {
            friendlyError =
              'Email signups are disabled in your Supabase project settings. Please enable Email Provider in Supabase Dashboard (Authentication -> Providers -> Email -> Enable Email Provider & Allow New Users).';
          }

          return { success: false, error: friendlyError };
        }

        if (!data.user) {
          return { success: false, error: 'Registration failed. No user returned from Supabase.' };
        }

        console.log('[AUTH SIGNUP SUCCESS]', data.user.id, data.user.email);

        const userId = data.user.id;
        const refCode = `GLOW-${name.toUpperCase().replace(/\s+/g, '').slice(0, 4)}100`;

        // If email confirmation is enabled on Supabase project, session is null until confirmed
        if (!data.session) {
          return {
            success: true,
            message: 'Account created! Please check your email inbox to verify your account before logging in.',
          };
        }

        // Create or update profile row in public.profiles table using auth.users.id
        const profileRes = await this.updateProfile(userId, {
          full_name: name,
          gender,
          email: cleanEmail,
          referral_code: refCode,
          points: 100,
        });

        console.log('[AUTH] Profile creation result:', profileRes);

        const session: UserSession = {
          id: userId,
          email: data.user.email || cleanEmail,
          name,
          gender,
          points: 100,
          isNewUser: false,
        };

        return { success: true, session };
      } catch (err: any) {
        console.error('[AUTH SIGNUP EXCEPTION]', err);
        return { success: false, error: err?.message || 'Failed to create account.' };
      }
    }

    return {
      success: false,
      error: 'Supabase project is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
    };
  },

  async signInWithEmail(
    email: string,
    password: string
  ): Promise<{ success: boolean; session?: UserSession; error?: string }> {
    const cleanEmail = email.trim().toLowerCase();
    console.log('[AUTH] Supabase login started for:', cleanEmail);

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        console.log('[AUTH] Login result:', {
          userId: data?.user?.id || null,
          hasSession: !!data?.session,
          error: error?.message || null,
        });

        if (error || !data.user) {
          console.error('[AUTH LOGIN ERROR]', error?.message);
          let friendlyError = error?.message || 'Invalid email or password.';
          const errLower = (error?.message || '').toLowerCase();

          if (errLower.includes('invalid login credentials') || errLower.includes('invalid credentials')) {
            friendlyError = 'Invalid email or password. Please check your credentials or create a new account.';
          } else if (errLower.includes('email not confirmed')) {
            friendlyError = 'Your email address has not been confirmed yet. Please check your email inbox.';
          }

          return {
            success: false,
            error: friendlyError,
          };
        }

        console.log('[AUTH LOGIN SUCCESS]', data.user.id, data.user.email);

        const profile = await this.getProfile(data.user.id);
        const userSession: UserSession = {
          id: data.user.id,
          email: data.user.email || cleanEmail,
          name: profile?.full_name || data.user.user_metadata?.full_name || 'Nexora User',
          gender: profile?.gender || data.user.user_metadata?.gender || 'male',
          points: profile?.points ?? 100,
          phone: profile?.phone || undefined,
          avatarUrl: profile?.avatar_url || data.user.user_metadata?.avatar_url || undefined,
        };

        return { success: true, session: userSession };
      } catch (err: any) {
        console.error('[AUTH LOGIN EXCEPTION]', err);
        return { success: false, error: err?.message || 'Login error occurred.' };
      }
    }

    return {
      success: false,
      error: 'Supabase project is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
    };
  },

  async getCurrentUser(): Promise<{ user: any; profile: ProfileRecord | null }> {
    if (!isSupabaseConfigured()) return { user: null, profile: null };

    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) return { user: null, profile: null };

      const profile = await this.getProfile(user.id);
      return { user, profile };
    } catch {
      return { user: null, profile: null };
    }
  },

  async resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
    const cleanEmail = email.trim().toLowerCase();
    if (!isSupabaseConfigured()) {
      return {
        success: false,
        error: 'Supabase is not configured.',
      };
    }

    try {
      const redirectUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: redirectUrl,
      });

      if (error) {
        console.error('[AUTH RESET PASSWORD ERROR]', error.message);
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      console.error('[AUTH RESET PASSWORD EXCEPTION]', err);
      return { success: false, error: err?.message || 'Failed to send password reset link.' };
    }
  },

  async getProfile(userId: string): Promise<ProfileRecord | null> {
    if (!isSupabaseConfigured()) return null;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error || !data) return null;
      return data as ProfileRecord;
    } catch {
      return null;
    }
  },

  async updateProfile(
    userId: string,
    updates: {
      full_name?: string;
      gender?: Gender;
      email?: string;
      avatar_url?: string;
      referral_code?: string;
      points?: number;
    }
  ): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured()) return { success: false, error: 'Supabase not configured' };

    try {
      // 1. Verify active session if available to avoid unauthenticated RLS violations
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const activeUser = sessionData?.session?.user;

        // If there is an active session and it doesn't match the target user ID, skip remote sync
        if (activeUser && activeUser.id !== userId) {
          console.log('[Supabase Auth] Skipping profile sync: active session user differs from target user ID');
          return { success: true };
        }
      } catch {
        // Ignore session read errors
      }

      // 2. Sync to auth user metadata if supported
      try {
        const metaUpdates: Record<string, any> = {};
        if (updates.full_name) metaUpdates.full_name = updates.full_name;
        if (updates.gender) metaUpdates.gender = updates.gender;
        if (updates.avatar_url) metaUpdates.avatar_url = updates.avatar_url;
        if (updates.referral_code) metaUpdates.referral_code = updates.referral_code;
        if (Object.keys(metaUpdates).length > 0 && typeof supabase.auth.updateUser === 'function') {
          await supabase.auth.updateUser({ data: metaUpdates });
        }
      } catch {
        // Non-blocking metadata sync
      }

      // 3. Sync to public.profiles table
      const profileUpdates: Record<string, any> = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      const table = supabase.from('profiles') as any;

      // Try update first if available, since UPDATE only requires the UPDATE policy (auth.uid() = id).
      // UPSERT triggers INSERT policy check in PostgreSQL which fails if INSERT policy is not configured.
      if (typeof table.update === 'function') {
        let updateRes = await table
          .update(profileUpdates)
          .eq('id', userId)
          .select?.();

        if (updateRes?.error && updateRes.error.message?.includes("Could not find the 'email' column")) {
          delete profileUpdates.email;
          updateRes = await table.update(profileUpdates).eq('id', userId).select?.();
        }

        // If update succeeded and modified rows, we are done
        if (!updateRes?.error && updateRes?.data && updateRes.data.length > 0) {
          return { success: true };
        }
      }

      // Try upsert / insert
      const payload: Record<string, any> = {
        id: userId,
        ...profileUpdates,
      };

      let error: any = null;
      if (typeof table.upsert === 'function') {
        const res = await table.upsert(payload);
        error = res?.error;
      } else if (typeof table.insert === 'function') {
        const res = await table.insert(payload);
        error = res?.error;
      }

      if (error && error.message && error.message.includes("Could not find the 'email' column")) {
        console.warn('[Supabase Auth] Profiles schema lacks email column, retrying without email column...');
        delete payload.email;
        if (typeof table.upsert === 'function') {
          const retryRes = await table.upsert(payload);
          error = retryRes?.error;
        }
      }

      if (error) {
        // If the error is an RLS policy violation (e.g. anon session or policy restriction),
        // gracefully handle it without throwing fatal app crashes
        const isRls = error.message?.includes('row-level security policy') || error.code === '42501';
        if (isRls) {
          console.warn('[Supabase Auth] Profile write restricted by RLS policy; local & auth metadata preserved.');
          return { success: true };
        }

        console.error('[Supabase Auth] Profile upsert error:', error.message);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      console.error('[Supabase Auth] Profile upsert exception:', err);
      return { success: false, error: err?.message || 'Failed to update profile' };
    }
  },

  async signOut(): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch {
        // Ignore signout network errors
      }
    }
  },

  async deleteAccount(userId: string): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Supabase not configured' };
    }

    try {
      await supabase.from('profiles').delete().eq('id', userId);
      await supabase.auth.signOut();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to delete account' };
    }
  },

  onAuthStateChange(callback: (session: UserSession | null) => void) {
    if (!isSupabaseConfigured()) {
      return { unsubscribe: () => {} };
    }

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, sbSession) => {
        console.log('[Supabase Auth] Auth state change event:', event, 'User ID:', sbSession?.user?.id || null);
        
        if (event === 'SIGNED_OUT' || !sbSession?.user) {
          callback(null);
          return;
        }

        try {
          const profile = await this.getProfile(sbSession.user.id);
          callback({
            id: sbSession.user.id,
            email: sbSession.user.email,
            phone: profile?.phone || undefined,
            name: profile?.full_name || sbSession.user.user_metadata?.full_name || 'Nexora User',
            gender: profile?.gender || sbSession.user.user_metadata?.gender || 'male',
            points: profile?.points ?? 100,
            avatarUrl: profile?.avatar_url || sbSession.user.user_metadata?.avatar_url || undefined,
          });
        } catch (error) {
          console.error('[Supabase Auth] Error fetching profile on auth state change:', error);
          // Still callback with basic user info if profile fetch fails
          callback({
            id: sbSession.user.id,
            email: sbSession.user.email,
            name: sbSession.user.user_metadata?.full_name || 'Nexora User',
            gender: sbSession.user.user_metadata?.gender || 'male',
            points: 100,
            avatarUrl: sbSession.user.user_metadata?.avatar_url || undefined,
          });
        }
      }
    );

    return {
      unsubscribe: () => {
        authListener.subscription.unsubscribe();
      },
    };
  },
};
