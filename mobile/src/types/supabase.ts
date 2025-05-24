export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      members: {
        Row: {
          id: string
          email: string
          full_name: string | null
          photo_url: string | null
          status: 'active' | 'inactive' | 'suspended'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name?: string | null
          photo_url?: string | null
          status?: 'active' | 'inactive' | 'suspended'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          photo_url?: string | null
          status?: 'active' | 'inactive' | 'suspended'
          created_at?: string
          updated_at?: string
        }
      }
      sessions: {
        Row: {
          id: string
          member_id: string
          check_in: string
          check_out: string | null
          auto_closed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          member_id: string
          check_in: string
          check_out?: string | null
          auto_closed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          member_id?: string
          check_in?: string
          check_out?: string | null
          auto_closed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      user_roles: {
        Row: {
          id: string
          user_id: string
          role: 'member' | 'admin' | 'super_admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role: 'member' | 'admin' | 'super_admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role?: 'member' | 'admin' | 'super_admin'
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_in: {
        Args: {
          p_member_id: string
          p_location?: Json
        }
        Returns: {
          id: string
          member_id: string
          check_in: string
          check_out: string | null
          auto_closed: boolean
        }[]
      }
      check_out: {
        Args: {
          p_member_id: string
        }
        Returns: {
          id: string
          member_id: string
          check_in: string
          check_out: string
          auto_closed: boolean
        }[]
      }
      get_current_member_sessions: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          member_id: string
          check_in: string
          check_out: string | null
          auto_closed: boolean
          created_at: string
          updated_at: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
