export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          password_hash: string;
          coins: number;
          is_verified: boolean;
          is_disabled: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          password_hash: string;
          coins?: number;
          is_verified?: boolean;
          is_disabled?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          password_hash?: string;
          coins?: number;
          is_verified?: boolean;
          is_disabled?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      ads: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          tiktok_url: string;
          target_followers: number;
          current_followers: number;
          cost: number;
          status: 'active' | 'completed' | 'removed';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          tiktok_url: string;
          target_followers: number;
          current_followers?: number;
          cost: number;
          status?: 'active' | 'completed' | 'removed';
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          tiktok_url?: string;
          target_followers?: number;
          current_followers?: number;
          cost?: number;
          status?: 'active' | 'completed' | 'removed';
          created_at?: string;
        };
        Relationships: [];
      };
      follows: {
        Row: {
          id: string;
          user_id: string;
          ad_id: string;
          screenshot_url: string | null;
          status: 'pending' | 'approved' | 'rejected';
          rejection_reason: string | null;
          verified_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          ad_id: string;
          screenshot_url?: string | null;
          status?: 'pending' | 'approved' | 'rejected';
          rejection_reason?: string | null;
          verified_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          ad_id?: string;
          screenshot_url?: string | null;
          status?: 'pending' | 'approved' | 'rejected';
          rejection_reason?: string | null;
          verified_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          type: 'credit' | 'debit';
          amount: number;
          reason: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: 'credit' | 'debit';
          amount: number;
          reason: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: 'credit' | 'debit';
          amount?: number;
          reason?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      admin_users: {
        Row: {
          id: string;
          username: string;
          password_hash: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          username: string;
          password_hash: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          password_hash?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      otp_codes: {
        Row: {
          id: string;
          email: string;
          code: string;
          expires_at: string;
          used: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          code: string;
          expires_at: string;
          used?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          code?: string;
          expires_at?: string;
          used?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      contact_messages: {
        Row: {
          id: string;
          user_id: string | null;
          email: string;
          subject: string;
          message: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          email: string;
          subject: string;
          message: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          email?: string;
          subject?: string;
          message?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

export type User = Database['public']['Tables']['users']['Row'];
export type Ad = Database['public']['Tables']['ads']['Row'];
export type Follow = Database['public']['Tables']['follows']['Row'];
export type Transaction = Database['public']['Tables']['transactions']['Row'];
export type AdminUser = Database['public']['Tables']['admin_users']['Row'];
export type OtpCode = Database['public']['Tables']['otp_codes']['Row'];
export type ContactMessage = Database['public']['Tables']['contact_messages']['Row'];
