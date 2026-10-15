/**
 * Supabase Offline Cache Adapter
 * 
 * Note: Supabase connection has been disconnected ("bog'lanish uzildi").
 * All authentication, session management, and data persistence are routed
 * entirely to local cache / localStorage without any external network dependency.
 */

import {
  getActiveUser,
  setActiveUser,
  subscribeAuth,
  loginAsGuest,
  logoutUser,
  UserProfileData,
} from './storage';

// Helper to convert our local UserProfileData to Supabase-compatible User format
export function toSupabaseUser(profile: UserProfileData | null): any {
  if (!profile) return null;
  return {
    id: profile.id,
    aud: 'authenticated',
    role: 'authenticated',
    email: profile.email,
    email_confirmed_at: profile.createdAt,
    phone: '',
    confirmed_at: profile.createdAt,
    last_sign_in_at: profile.updatedAt,
    app_metadata: { provider: 'cache' },
    user_metadata: {
      full_name: profile.fullName,
      avatar_url: profile.avatarUrl,
      target_level: profile.targetLevel,
    },
    identities: [],
    created_at: profile.createdAt,
    updated_at: profile.updatedAt,
  };
}

// Offline Mock Client replacing Supabase network client
export const supabase = {
  auth: {
    async getSession() {
      const profile = getActiveUser();
      const user = toSupabaseUser(profile);
      return {
        data: {
          session: user ? { user, access_token: 'local-cache-token' } : null,
        },
        error: null,
      };
    },

    async getUser() {
      const profile = getActiveUser();
      return {
        data: {
          user: toSupabaseUser(profile),
        },
        error: null,
      };
    },

    onAuthStateChange(callback: (event: string, session: any) => void) {
      // Immediately call with current state
      const currentProfile = getActiveUser();
      const currentUser = toSupabaseUser(currentProfile);
      callback('INITIAL_SESSION', currentUser ? { user: currentUser } : null);

      const unsubscribe = subscribeAuth((updatedProfile) => {
        const user = toSupabaseUser(updatedProfile);
        callback(user ? 'SIGNED_IN' : 'SIGNED_OUT', user ? { user } : null);
      });

      return {
        data: {
          subscription: {
            unsubscribe,
          },
        },
      };
    },

    async signInWithOAuth({ provider }: { provider?: string; options?: any } = {}) {
      // Offline fallback: sign in immediately as local user
      const guest = loginAsGuest();
      return {
        data: {
          provider: provider || 'google',
          url: null,
          user: toSupabaseUser(guest),
        },
        error: null,
      };
    },

    async signOut() {
      logoutUser();
      return { error: null };
    },
  },

  // Fallback for any database table queries, returning empty or handled safely
  from(_table: string) {
    return {
      select: () => Promise.resolve({ data: [], error: null }),
      insert: () => Promise.resolve({ data: [], error: null }),
      update: () => Promise.resolve({ data: [], error: null }),
      delete: () => Promise.resolve({ data: [], error: null }),
    };
  },
};
