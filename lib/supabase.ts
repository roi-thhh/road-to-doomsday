import { createClient } from '@supabase/supabase-js';
import { WatchStatus, UserProfile, PartnerRequest } from './types';

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
  if (!isSupabaseConfigured() || !userId) return null;
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error || !data) return null;

    let partnerEmail = undefined;
    if (data.partner_id) {
      const { data: partnerData } = await supabase
        .from('users')
        .select('email')
        .eq('id', data.partner_id)
        .maybeSingle();
      if (partnerData) partnerEmail = partnerData.email;
    }

    return {
      id: data.id,
      email: data.email,
      roleSelection: data.role_selection,
      partnerId: data.partner_id,
      partnerEmail,
    };
  } catch (e) {
    console.error('Fetch DB profile error', e);
    return null;
  }
}

export async function saveDbUserProfile(profile: UserProfile): Promise<boolean> {
  if (!isSupabaseConfigured() || !profile.id) return false;
  try {
    const { error } = await supabase.from('users').upsert({
      id: profile.id,
      email: profile.email.toLowerCase().trim(),
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

// ----------------------------------------------------
// BIDIRECTIONAL PARTNER REQUEST ENGINE
// ----------------------------------------------------

export async function sendPartnerRequest(
  senderId: string,
  senderEmail: string,
  targetEmail: string
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase credentials are not configured.' };
  }

  const cleanTargetEmail = targetEmail.trim().toLowerCase();
  const cleanSenderEmail = senderEmail.trim().toLowerCase();

  if (cleanSenderEmail === cleanTargetEmail) {
    return { success: false, error: 'You cannot send a partner request to yourself!' };
  }

  try {
    // 1. Verify target user ALREADY HAS AN ACCOUNT
    const { data: targetUser, error: findError } = await supabase
      .from('users')
      .select('id, email, partner_id')
      .eq('email', cleanTargetEmail)
      .maybeSingle();

    if (findError || !targetUser) {
      return { 
        success: false, 
        error: `No registered account found with email "${cleanTargetEmail}". They must create an account first!` 
      };
    }

    if (targetUser.partner_id === senderId) {
      return { success: false, error: 'You are already connected as partners!' };
    }

    // 2. Check if pending request already exists
    const { data: existingReq } = await supabase
      .from('partner_requests')
      .select('id, status')
      .eq('sender_id', senderId)
      .eq('receiver_id', targetUser.id)
      .eq('status', 'pending')
      .maybeSingle();

    if (existingReq) {
      return { success: false, error: 'A pending partner request has already been sent to this email!' };
    }

    // 3. Create Partner Request
    const { error: insertError } = await supabase.from('partner_requests').insert({
      sender_id: senderId,
      receiver_id: targetUser.id,
      sender_email: cleanSenderEmail,
      receiver_email: cleanTargetEmail,
      status: 'pending',
    });

    if (insertError) throw insertError;

    return { success: true };
  } catch (e: any) {
    console.error('Send partner request error', e);
    return { success: false, error: e.message || 'Failed to send partner request.' };
  }
}

export async function fetchPendingPartnerRequests(userEmail: string): Promise<PartnerRequest[]> {
  if (!isSupabaseConfigured() || !userEmail) return [];
  try {
    const { data, error } = await supabase
      .from('partner_requests')
      .select('*')
      .eq('receiver_email', userEmail.trim().toLowerCase())
      .eq('status', 'pending');

    if (error || !data) return [];

    return data.map((r: any) => ({
      id: r.id,
      senderId: r.sender_id,
      receiverId: r.receiver_id,
      senderEmail: r.sender_email,
      receiverEmail: r.receiver_email,
      status: r.status,
      createdAt: r.created_at,
    }));
  } catch (e) {
    console.error('Fetch pending partner requests error', e);
    return [];
  }
}

export async function acceptPartnerRequest(req: PartnerRequest): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) return { success: false };
  try {
    // 1. Mark request as accepted
    await supabase
      .from('partner_requests')
      .update({ status: 'accepted', updated_at: new Date().toISOString() })
      .eq('id', req.id);

    // 2. Bi-directionally link both user profiles in users table!
    await supabase
      .from('users')
      .update({ partner_id: req.senderId, updated_at: new Date().toISOString() })
      .eq('id', req.receiverId);

    await supabase
      .from('users')
      .update({ partner_id: req.receiverId, updated_at: new Date().toISOString() })
      .eq('id', req.senderId);

    return { success: true };
  } catch (e: any) {
    console.error('Accept partner request error', e);
    return { success: false, error: e.message };
  }
}

export async function declinePartnerRequest(requestId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const { error } = await supabase
      .from('partner_requests')
      .update({ status: 'declined', updated_at: new Date().toISOString() })
      .eq('id', requestId);

    return !error;
  } catch (e) {
    console.error('Decline partner request error', e);
    return false;
  }
}

export async function unlinkPartner(userId: string, partnerId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    await supabase
      .from('users')
      .update({ partner_id: null, updated_at: new Date().toISOString() })
      .eq('id', userId);

    if (partnerId) {
      await supabase
        .from('users')
        .update({ partner_id: null, updated_at: new Date().toISOString() })
        .eq('id', partnerId);
    }
    return true;
  } catch (e) {
    console.error('Unlink partner error', e);
    return false;
  }
}

// ----------------------------------------------------
// WATCH PROGRESS REAL-TIME ENGINE
// ----------------------------------------------------

export async function fetchDbUserProgress(userId: string): Promise<Record<string, WatchStatus>> {
  if (!isSupabaseConfigured() || !userId) return {};
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
  if (!isSupabaseConfigured() || !userId) return false;
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
    let targetUserId = partnerIdOrEmail.trim();

    // If partner is passed as email, look up user ID first
    if (partnerIdOrEmail.includes('@')) {
      const { data: userMatch } = await supabase
        .from('users')
        .select('id')
        .eq('email', partnerIdOrEmail.trim().toLowerCase())
        .maybeSingle();

      if (userMatch) targetUserId = userMatch.id;
    }

    return await fetchDbUserProgress(targetUserId);
  } catch (e) {
    console.error('Fetch DB partner progress error', e);
    return {};
  }
}
