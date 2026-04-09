// Verification status enum
export type VerificationStatus = 'unverified' | 'partial' | 'verified' | 'debunked'

// Source type for posts
export interface Source {
  url: string
  title: string
  credibility: number
  confirmed_at?: string
}

// Bot type
export interface Bot {
  id: string
  name: string
  handle: string
  avatar_url: string | null
  color_accent: string | null
  bio: string | null
  expertise: string[]
  personality: string | null
  system_prompt: string | null
  posts_count: number
  followers_count: number
  accuracy_rate: number
  created_at: string
  updated_at: string
}

// Post type
export interface Post {
  id: string
  bot_id: string
  content: string
  verification_status: VerificationStatus
  verification_note: string | null
  sources: Source[]
  comments_count: number
  likes_count: number
  saves_count: number
  importance_score: number
  created_at: string
  updated_at: string
  bot?: Bot
}

// Post with bot (for feed display)
export interface PostWithBot extends Post {
  bot: Bot
}

// Profile type
export interface Profile {
  id: string
  display_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

// Comment type
export interface Comment {
  id: string
  post_id: string
  user_id: string | null
  bot_id: string | null
  parent_id: string | null
  content: string
  created_at: string
  user?: Profile
  bot?: Bot
}

// Follow type
export interface Follow {
  user_id: string
  bot_id: string
  created_at: string
}

// Like type
export interface Like {
  user_id: string
  post_id: string
  created_at: string
}

// Save type
export interface Save {
  user_id: string
  post_id: string
  created_at: string
}

// Post Update (history)
export interface PostUpdate {
  id: string
  post_id: string
  old_status: VerificationStatus | null
  new_status: VerificationStatus
  note: string | null
  created_at: string
}

// Database types for Supabase
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at' | 'updated_at'> & {
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Profile>
      }
      bots: {
        Row: Bot
        Insert: Omit<Bot, 'id' | 'created_at' | 'updated_at' | 'posts_count' | 'followers_count' | 'accuracy_rate'> & {
          id?: string
          created_at?: string
          updated_at?: string
          posts_count?: number
          followers_count?: number
          accuracy_rate?: number
        }
        Update: Partial<Bot>
      }
      posts: {
        Row: Omit<Post, 'bot' | 'sources'> & { sources: Source[] | null }
        Insert: Omit<Post, 'id' | 'created_at' | 'updated_at' | 'comments_count' | 'likes_count' | 'saves_count' | 'bot' | 'sources'> & {
          id?: string
          created_at?: string
          updated_at?: string
          comments_count?: number
          likes_count?: number
          saves_count?: number
          sources?: Source[] | null
        }
        Update: Partial<Omit<Post, 'bot' | 'sources'> & { sources: Source[] | null }>
      }
      post_updates: {
        Row: PostUpdate
        Insert: Omit<PostUpdate, 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<PostUpdate>
      }
      comments: {
        Row: Omit<Comment, 'user' | 'bot'>
        Insert: Omit<Comment, 'id' | 'created_at' | 'user' | 'bot'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Omit<Comment, 'user' | 'bot'>>
      }
      follows: {
        Row: Follow
        Insert: Omit<Follow, 'created_at'> & { created_at?: string }
        Update: Partial<Follow>
      }
      likes: {
        Row: Like
        Insert: Omit<Like, 'created_at'> & { created_at?: string }
        Update: Partial<Like>
      }
      saves: {
        Row: Save
        Insert: Omit<Save, 'created_at'> & { created_at?: string }
        Update: Partial<Save>
      }
    }
    Enums: {
      verification_status: VerificationStatus
    }
  }
}

// Verification status config for UI
export const VERIFICATION_CONFIG = {
  unverified: {
    label: 'Đang xác minh',
    color: 'bg-status-unverified',
    textColor: 'text-status-unverified',
    borderColor: 'border-status-unverified',
    icon: '🔴',
  },
  partial: {
    label: 'Một phần xác minh',
    color: 'bg-status-partial',
    textColor: 'text-status-partial',
    borderColor: 'border-status-partial',
    icon: '🟡',
  },
  verified: {
    label: 'Đã xác minh',
    color: 'bg-status-verified',
    textColor: 'text-status-verified',
    borderColor: 'border-status-verified',
    icon: '🟢',
  },
  debunked: {
    label: 'Đã bác bỏ',
    color: 'bg-status-debunked',
    textColor: 'text-status-debunked',
    borderColor: 'border-status-debunked',
    icon: '⚫',
  },
} as const

// Bot handle to color mapping
export const BOT_COLORS: Record<string, string> = {
  minh_ai: '#8B5CF6',
  lan_startup: '#F97316',
  nam_gadget: '#06B6D4',
}
