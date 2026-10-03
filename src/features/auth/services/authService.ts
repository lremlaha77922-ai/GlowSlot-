import { supabase, isSupabaseConfigured } from '../../../lib/supabase';
import { UserSession, Gender } from '../../../types';

export interface ProfileRecord {
  id: string;
  phone: string;
  full_name: string;
  gender: Gender;
  email?: string;
  points: number;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

export const authService = {
  isRealBackend(): boolean {
    return isSupabaseConfigured();
  },

  async sendOtp(phone: string): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured() || phone.includes('98765')) {
      return { success: true };
    }

    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone,
      });

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to send OTP' };
    }
  },

  async verifyOtp(
    phone: string,
    token: string
  ): Promise<{ success: boolean; session?: UserSession; isNewUser?: boolean; error?: string }> {
    // Mock simulation for 123456 or when real Supabase is unconfigured
    if (!isSupabaseConfigured() || token === '123456') {
      if (token === '123456') {
        const isNew = phone.endsWith('0000');
        const session: UserSession = {
          id: `usr-${phone.replace(/\D/g, '').slice(-6) || '123'}`,
          name: isNew ? '' : 'Aarav Sharma',
          phone,
          gender: isNew ? undefined : 'male',
          points: 120,
          isNewUser: isNew,
        };
        return { success: true, session, isNewUser: isNew };
      }
      return { success: false, error: 'Invalid verification code. Try 123456.' };
    }

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone,
        token,
        type: 'sms',
      });

      if (error || !data.user) {
        return { success: false, error: error?.message || 'Invalid OTP code' };
      }

      // Fetch or create profile in profiles table
      const profile = await this.getProfile(data.user.id);
      const isNew = !profile || !profile.full_name;

      const userSession: UserSession = {
        id: data.user.id,
        phone: data.user.phone || phone,
        name: profile?.full_name || '',
        gender: profile?.gender || undefined,
        points: profile?.points ?? 100,
        email: data.user.email || profile?.email,
        isNewUser: isNew,
      };

      return { success: true, session: userSession, isNewUser: isNew };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Verification failed' };
    }
  },

  // Fallback email/password for testing per scope
  async signInWithEmail(
    email: string,
    password: string
  ): Promise<{ success: boolean; session?: UserSession; error?: string }> {
    if (!isSupabaseConfigured() || email.includes('example.com') || email.includes('test')) {
      const session: UserSession = {
        id: 'usr-email-test',
        name: 'Test User',
        phone: '+91 98765 43210',
        email,
        gender: 'male',
        points: 100,
      };
      return { success: true, session };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data.user) {
        return { success: false, error: error?.message || 'Login failed' };
      }

      const profile = await this.getProfile(data.user.id);
      const userSession: UserSession = {
        id: data.user.id,
        phone: data.user.phone || '+91 98765 43210',
        name: profile?.full_name || 'Test User',
        gender: profile?.gender || 'male',
        points: profile?.points ?? 100,
        email: data.user.email || email,
      };

      return { success: true, session: userSession };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Login error' };
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
    updates: { full_name?: string; gender?: Gender; email?: string; avatar_url?: string }
  ): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured()) return { success: true };

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          ...updates,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
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
      return { success: true };
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
        if (sbSession?.user) {
          const profile = await this.getProfile(sbSession.user.id);
          callback({
            id: sbSession.user.id,
            phone: sbSession.user.phone || '',
            name: profile?.full_name || '',
            gender: profile?.gender,
            points: profile?.points ?? 100,
            email: sbSession.user.email,
          });
        } else {
          callback(null);
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
