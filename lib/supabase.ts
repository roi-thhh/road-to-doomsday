import { createClient } from '@supabase/supabase-js';
import { WatchStatus, UserProfile } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export const isSupabaseConfigured = () => {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co' &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'placeholder-anon-key'
  );
};

// Database Helper Functions for Real Backend Sync

export async function fetchDbUserProfile(userId: string): Promise<UserProfile | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) return null;
    return {
      id: data.id,
      email: data.email,
      roleSelection: data.role_selection,
      partnerId: data.partner_id,
    };
  } catch (e) {
    console.error('Fetch DB profile error', e);
    return null;
  }
}

export async function saveDbUserProfile(profile: UserProfile): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const { error } = await supabase.from('users').upsert({
      id: profile.id,
      email: profile.email,
      role_selection: profile.roleSelection,
      partner_id: profile.partnerId || null,
      updated_at: new Date().toISOString(),
    });

    if (error) throw error;
    return true;
  } catch (e) {
    console.error('Save DB profile error', e);
    return false;
  }
}

export async function fetchDbUserProgress(userId: string): Promise<Record<string, WatchStatus>> {
  if (!isSupabaseConfigured()) return {};
  try {
    const { data, error } = await supabase
      .from('user_progress')
      .select('movie_id, status')
      .eq('user_id', userId);

    if (error || !data) return {};

    const progressMap: Record<string, WatchStatus> = {};
    data.forEach((row: any) => {
      progressMap[row.movie_id] = row.status as WatchStatus;
    });
    return progressMap;
  } catch (e) {
    console.error('Fetch DB progress error', e);
    return {};
  }
}

export async function saveDbUserProgress(
  userId: string,
  movieId: string,
  status: WatchStatus
): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const { error } = await supabase.from('user_progress').upsert({
      user_id: userId,
      movie_id: movieId,
      status: status,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id,movie_id'
    });

    if (error) throw error;
    return true;
  } catch (e) {
    console.error('Save DB progress error', e);
    return false;
  }
}

export async function fetchDbPartnerProgress(partnerIdOrEmail: string): Promise<Record<string, WatchStatus>> {
  if (!isSupabaseConfigured() || !partnerIdOrEmail) return {};
  try {
    let targetUserId = partnerIdOrEmail;

    // If partner is passed as email, look up user ID first
    if (partnerIdOrEmail.includes('@')) {
      const { data: userMatch } = await supabase
        .from('users')
        .select('id')
        .eq('email', partnerIdOrEmail)
        .single();
      if (userMatch) targetUserId = userMatch.id;
    }

    return await fetchDbUserProgress(targetUserId);
  } catch (e) {
    console.error('Fetch DB partner progress error', e);
    return {};
  }
}
