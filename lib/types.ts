export type MediaType = 'movie' | 'series';
export type WatchStatus = 'unwatched' | 'watching' | 'watched';
export type RoleSelection = 'boy_friend' | 'girl_friend' | 'alpha_male';
export type TimelineOrder = 'chronological' | 'release';
export type ScopeMode = 'essential' | 'completionist';

export interface MCUItem {
  id: string;
  title: string;
  releaseDate: string;
  chronologicalOrder: number;
  releaseOrder: number;
  isEssential: boolean;
  summary: string;
  imdbRating: number;
  mediaType: MediaType;
  rowIndex: number; // 0-indexed row for serpentine S-curve
  posterUrl: string;
  multiverseNote: string;
  runtime: string; // e.g. "2h 30m" or "6 Episodes"
  phase: number;
}

export interface UserProgress {
  movieId: string;
  status: WatchStatus;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  roleSelection: RoleSelection | null;
  partnerId?: string;
  partnerEmail?: string;
}

export interface PartnerProgress {
  partnerId: string;
  partnerEmail?: string;
  partnerRole?: RoleSelection;
  progress: Record<string, WatchStatus>;
}

export interface PartnerRequest {
  id: string;
  senderId: string;
  receiverId: string;
  senderEmail: string;
  receiverEmail: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}
