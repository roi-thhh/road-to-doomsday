import { WatchStatus, UserProfile } from './types';

const STORAGE_KEYS = {
  USER_PROFILE: 'mcu_doomsday_user_profile',
  USER_PROGRESS: 'mcu_doomsday_user_progress',
  PARTNER_PROGRESS: 'mcu_doomsday_partner_progress',
};

export const getStoredUserProfile = (): UserProfile | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error('Error loading user profile', e);
    return null;
  }
};

export const setStoredUserProfile = (profile: UserProfile | null): void => {
  if (typeof window === 'undefined') return;
  try {
    if (profile) {
      localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
    }
  } catch (e) {
    console.error('Error saving user profile', e);
  }
};

export const getStoredUserProgress = (): Record<string, WatchStatus> => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_PROGRESS);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.error('Error loading user progress', e);
    return {};
  }
};

export const setStoredUserProgress = (progress: Record<string, WatchStatus>): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.USER_PROGRESS, JSON.stringify(progress));
  } catch (e) {
    console.error('Error saving user progress', e);
  }
};

export const getStoredPartnerProgress = (): Record<string, WatchStatus> => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PARTNER_PROGRESS);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
};

export const setStoredPartnerProgress = (partnerProgress: Record<string, WatchStatus>): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.PARTNER_PROGRESS, JSON.stringify(partnerProgress));
  } catch (e) {
    console.error('Error saving partner progress', e);
  }
};
