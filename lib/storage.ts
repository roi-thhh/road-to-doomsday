import { UserProgress, RoleSelection, WatchStatus, UserProfile } from './types';

const STORAGE_KEYS = {
  USER_PROFILE: 'mcu_doomsday_user_profile',
  USER_PROGRESS: 'mcu_doomsday_user_progress',
  PARTNER_SIMULATION: 'mcu_doomsday_partner_sim',
  PARTNER_LINKED_ID: 'mcu_doomsday_partner_linked_id',
};

// Initial default partner progress simulation for demo/couples experience
const MOCK_PARTNER_INITIAL_PROGRESS: Record<string, WatchStatus> = {
  'm1': 'watched',
  'm6': 'watched',
  'm19': 'watched',
  'm24': 'watched',
  's10': 'watched',
  'm27': 'watched',
  'm30': 'watching',
  'm36': 'watched',
  'm37': 'watching',
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

export const setStoredUserProfile = (profile: UserProfile): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error('Error saving user profile', e);
  }
};

export const getStoredUserProgress = (): Record<string, WatchStatus> => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_PROGRESS);
    if (!raw) {
      // Default initial watched items for a fun starting experience
      const initial: Record<string, WatchStatus> = {
        'm1': 'watched',
        'm24': 'watched',
        's10': 'watching',
      };
      localStorage.setItem(STORAGE_KEYS.USER_PROGRESS, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
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
  if (typeof window === 'undefined') return MOCK_PARTNER_INITIAL_PROGRESS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PARTNER_SIMULATION);
    return raw ? JSON.parse(raw) : MOCK_PARTNER_INITIAL_PROGRESS;
  } catch (e) {
    return MOCK_PARTNER_INITIAL_PROGRESS;
  }
};

export const setStoredPartnerProgress = (partnerProgress: Record<string, WatchStatus>): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.PARTNER_SIMULATION, JSON.stringify(partnerProgress));
  } catch (e) {
    console.error('Error saving partner progress', e);
  }
};
