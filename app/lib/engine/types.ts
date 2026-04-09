// ═══════════════════════════════════════════════════════
// CẦN & CÓ — Core Types (framework-agnostic)
// ═══════════════════════════════════════════════════════

export type IntentType = 'CAN' | 'CO';
export type IntentStatus = 'active' | 'matched' | 'expired' | 'completed' | 'hidden';
export type VerificationType = 'cccd' | 'sodo' | 'gps';
export type VerificationStatus = 'pending' | 'approved' | 'rejected';
export type VerificationLevel = 'none' | 'kyc' | 'verified';
export type MatchStatus = 'suggested' | 'viewed' | 'chatting' | 'completed' | 'rejected';

export interface Intent {
  id: string;
  user_id: string;
  type: IntentType;
  raw_text: string;
  title: string | null;
  parsed_data: Record<string, unknown>;
  category: string;
  subcategory: string | null;
  price: number | null;
  price_min: number | null;
  price_max: number | null;
  address: string | null;
  district: string | null;
  ward: string | null;
  city: string;
  lat: number | null;
  lng: number | null;
  trust_score: number;
  verification_level: VerificationLevel;
  comment_count: number;
  match_count: number;
  view_count: number;
  status: IntentStatus;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  is_bot?: boolean | null;
  bot_handle?: string | null;
  source_url?: string | null;
  images?: IntentImage[];
}

export interface IntentImage {
  id: string;
  intent_id: string;
  url: string;
  display_order: number;
  created_at: string;
}

export interface Match {
  id: string;
  can_intent_id: string;
  co_intent_id: string;
  similarity: number | null;
  explanation: string | null;
  status: MatchStatus;
  created_at: string;
  can_intent?: Intent;
  co_intent?: Intent;
}

export interface Verification {
  id: string;
  user_id: string;
  intent_id: string | null;
  type: VerificationType;
  status: VerificationStatus;
  data: Record<string, unknown> | null;
  image_url: string | null;
  gps_lat: number | null;
  gps_lng: number | null;
  gps_accuracy: number | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
}

export interface Conversation {
  id: string;
  intent_id: string | null;
  user_a: string;
  user_b: string;
  last_message_at: string | null;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  read_at: string | null;
  created_at: string;
}

export interface IntentComment {
  id: string;
  intent_id: string;
  user_id: string | null;
  bot_name: string | null;
  content: string;
  is_bot: boolean;
  parent_id: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string | null;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

export interface SearchIntent {
  districts: string[] | null;
  price_min: number | null;
  price_max: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  area_min: number | null;
  area_max: number | null;
  keywords: string[];
  preferences: string[];
}

export interface CccdData {
  id_number: string | null;
  full_name: string | null;
  date_of_birth: string | null;
  address: string | null;
  raw_text: string;
  confidence: number;
}

export interface SodoData {
  owner_name: string | null;
  land_number: string | null;
  address: string | null;
  raw_text: string;
  confidence: number;
}

export interface GpsVerifyResult {
  isNear: boolean;
  distance: number;
}

// Constants
export const HCM_DISTRICTS = [
  'Quận 1', 'Quận 3', 'Quận 4', 'Quận 5', 'Quận 6', 'Quận 7', 'Quận 8',
  'Quận 10', 'Quận 11', 'Quận 12', 'Bình Thạnh', 'Gò Vấp', 'Phú Nhuận',
  'Tân Bình', 'Tân Phú', 'Thủ Đức', 'Bình Tân', 'Nhà Bè',
  'Hóc Môn', 'Củ Chi', 'Cần Giờ', 'Bình Chánh',
] as const;

export const INTENT_CATEGORIES = [
  'real_estate', 'employment', 'home_service', 'vehicle', 'other',
] as const;
