export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      arcade_scores: {
        Row: {
          created_at: string
          game_data: Json | null
          game_name: string
          id: string
          level_reached: number | null
          neon_multiplier: number | null
          score: number
          time_played: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          game_data?: Json | null
          game_name: string
          id?: string
          level_reached?: number | null
          neon_multiplier?: number | null
          score: number
          time_played?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          game_data?: Json | null
          game_name?: string
          id?: string
          level_reached?: number | null
          neon_multiplier?: number | null
          score?: number
          time_played?: number | null
          user_id?: string
        }
        Relationships: []
      }
      chat_rooms: {
        Row: {
          cosmic_theme: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          cosmic_theme?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          cosmic_theme?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      community_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_pinned: boolean | null
          likes: number | null
          tags: string[] | null
          type: string | null
          updated_at: string
          user_id: string
          vegas_flair: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_pinned?: boolean | null
          likes?: number | null
          tags?: string[] | null
          type?: string | null
          updated_at?: string
          user_id: string
          vegas_flair?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_pinned?: boolean | null
          likes?: number | null
          tags?: string[] | null
          type?: string | null
          updated_at?: string
          user_id?: string
          vegas_flair?: string | null
        }
        Relationships: []
      }
      cosmic_themes: {
        Row: {
          accent_color: string
          created_at: string | null
          display_name: string
          id: string
          is_active: boolean | null
          name: string
          primary_color: string
          secondary_color: string
        }
        Insert: {
          accent_color: string
          created_at?: string | null
          display_name: string
          id?: string
          is_active?: boolean | null
          name: string
          primary_color: string
          secondary_color: string
        }
        Update: {
          accent_color?: string
          created_at?: string | null
          display_name?: string
          id?: string
          is_active?: boolean | null
          name?: string
          primary_color?: string
          secondary_color?: string
        }
        Relationships: []
      }
      live_streams: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          ended_at: string | null
          id: string
          is_live: boolean | null
          max_viewers: number | null
          scheduled_for: string | null
          started_at: string | null
          stream_url: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          vegas_level: string | null
          viewer_count: number | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          ended_at?: string | null
          id?: string
          is_live?: boolean | null
          max_viewers?: number | null
          scheduled_for?: string | null
          started_at?: string | null
          stream_url?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          vegas_level?: string | null
          viewer_count?: number | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          ended_at?: string | null
          id?: string
          is_live?: boolean | null
          max_viewers?: number | null
          scheduled_for?: string | null
          started_at?: string | null
          stream_url?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          vegas_level?: string | null
          viewer_count?: number | null
        }
        Relationships: []
      }
      message_likes: {
        Row: {
          created_at: string
          id: string
          message_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_likes_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "community_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          message_type: string | null
          room_id: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          message_type?: string | null
          room_id?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          message_type?: string | null
          room_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          price: number
          product_id: string
          quantity: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          price: number
          product_id: string
          quantity?: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          price?: number
          product_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          id: string
          shipping_address: Json | null
          status: string | null
          stripe_payment_intent_id: string | null
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          shipping_address?: Json | null
          status?: string | null
          stripe_payment_intent_id?: string | null
          total_amount: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          shipping_address?: Json | null
          status?: string | null
          stripe_payment_intent_id?: string | null
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          artist: string
          audio_preview_url: string | null
          created_at: string
          description: string | null
          genre: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          price: number
          release_date: string | null
          stock_quantity: number | null
          type: string
          updated_at: string
          vegas_style_rating: number | null
        }
        Insert: {
          artist: string
          audio_preview_url?: string | null
          created_at?: string
          description?: string | null
          genre?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          price: number
          release_date?: string | null
          stock_quantity?: number | null
          type: string
          updated_at?: string
          vegas_style_rating?: number | null
        }
        Update: {
          artist?: string
          audio_preview_url?: string | null
          created_at?: string
          description?: string | null
          genre?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          price?: number
          release_date?: string | null
          stock_quantity?: number | null
          type?: string
          updated_at?: string
          vegas_style_rating?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          cosmic_level: number | null
          created_at: string
          email: string
          experience_points: number | null
          id: string
          opted_in_promotions: boolean | null
          phone: string | null
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          cosmic_level?: number | null
          created_at?: string
          email: string
          experience_points?: number | null
          id: string
          opted_in_promotions?: boolean | null
          phone?: string | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          cosmic_level?: number | null
          created_at?: string
          email?: string
          experience_points?: number | null
          id?: string
          opted_in_promotions?: boolean | null
          phone?: string | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      stream_chat_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          message_effect: string | null
          stream_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          message_effect?: string | null
          stream_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          message_effect?: string | null
          stream_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stream_chat_messages_stream_id_fkey"
            columns: ["stream_id"]
            isOneToOne: false
            referencedRelation: "live_streams"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_data: Json | null
          achievement_type: string
          id: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          achievement_data?: Json | null
          achievement_type: string
          id?: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          achievement_data?: Json | null
          achievement_type?: string
          id?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_favorites: {
        Row: {
          created_at: string
          id: string
          item_id: string
          item_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_id: string
          item_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string
          item_type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string | null
          id: string
          theme_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          theme_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          theme_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_theme_id_fkey"
            columns: ["theme_id"]
            isOneToOne: false
            referencedRelation: "cosmic_themes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          cosmic_title: string | null
          created_at: string | null
          display_name: string | null
          email: string
          id: string
          is_online: boolean | null
          last_seen: string | null
          password_hash: string
          updated_at: string | null
          username: string
        }
        Insert: {
          cosmic_title?: string | null
          created_at?: string | null
          display_name?: string | null
          email: string
          id?: string
          is_online?: boolean | null
          last_seen?: string | null
          password_hash: string
          updated_at?: string | null
          username: string
        }
        Update: {
          cosmic_title?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string
          id?: string
          is_online?: boolean | null
          last_seen?: string | null
          password_hash?: string
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

// Convenience types for common use cases
export type Profile = Tables<'profiles'>
export type Product = Tables<'products'>
export type Order = Tables<'orders'>
export type OrderItem = Tables<'order_items'>
export type ArcadeScore = Tables<'arcade_scores'>
export type CommunityMessage = Tables<'community_messages'>
export type LiveStream = Tables<'live_streams'>
export type UserAchievement = Tables<'user_achievements'>
export type UserFavorite = Tables<'user_favorites'>