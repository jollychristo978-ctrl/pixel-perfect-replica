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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      call_bookings: {
        Row: {
          created_at: string
          id: string
          partner_name: string
          slot_start: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          partner_name: string
          slot_start: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          partner_name?: string
          slot_start?: string
          user_id?: string
        }
        Relationships: []
      }
      charity_invites: {
        Row: {
          active: boolean
          charity_name: string
          code: string
          coordinator_id: string
          created_at: string
          expires_at: string
          id: string
        }
        Insert: {
          active?: boolean
          charity_name: string
          code: string
          coordinator_id: string
          created_at?: string
          expires_at?: string
          id?: string
        }
        Update: {
          active?: boolean
          charity_name?: string
          code?: string
          coordinator_id?: string
          created_at?: string
          expires_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "charity_invites_coordinator_id_fkey"
            columns: ["coordinator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cinema_attempts: {
        Row: {
          line_index: number
          meaning: number
          pronunciation: number | null
          scene_id: string
          user_id: string
        }
        Insert: {
          line_index: number
          meaning: number
          pronunciation?: number | null
          scene_id: string
          user_id: string
        }
        Update: {
          line_index?: number
          meaning?: number
          pronunciation?: number | null
          scene_id?: string
          user_id?: string
        }
        Relationships: []
      }
      cinema_completions: {
        Row: {
          points: number
          scene_id: string
          stars: number
          user_id: string
        }
        Insert: {
          points: number
          scene_id: string
          stars: number
          user_id: string
        }
        Update: {
          points?: number
          scene_id?: string
          stars?: number
          user_id?: string
        }
        Relationships: []
      }
      clips: {
        Row: {
          created_at: string
          id: string
          quiz: Json
          title: string
          transcript: string
          translation: string
          user_id: string
          words: Json
        }
        Insert: {
          created_at?: string
          id?: string
          quiz?: Json
          title?: string
          transcript?: string
          translation?: string
          user_id: string
          words?: Json
        }
        Update: {
          created_at?: string
          id?: string
          quiz?: Json
          title?: string
          transcript?: string
          translation?: string
          user_id?: string
          words?: Json
        }
        Relationships: []
      }
      impact_counters: {
        Row: {
          bricks: number
          calls_held: number
          id: number
          lessons_unlocked: number
          students_helped: number
        }
        Insert: {
          bricks?: number
          calls_held?: number
          id: number
          lessons_unlocked?: number
          students_helped?: number
        }
        Update: {
          bricks?: number
          calls_held?: number
          id?: number
          lessons_unlocked?: number
          students_helped?: number
        }
        Relationships: []
      }
      practice_topics: {
        Row: {
          created_at: string
          id: string
          shared: boolean
          topic: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          shared?: boolean
          topic: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          shared?: boolean
          topic?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age_group: string
          coordinator_id: string | null
          country: string
          created_at: string
          display_name: string
          id: string
          interests: string[]
          learning_language: string
          native_language: string
          onboarded: boolean
          school: string
          timezone: string
          voice_twin_consented_at: string | null
          voice_twin_id: string | null
          voice_verified: boolean
        }
        Insert: {
          age_group?: string
          coordinator_id?: string | null
          country?: string
          created_at?: string
          display_name?: string
          id: string
          interests?: string[]
          learning_language?: string
          native_language?: string
          onboarded?: boolean
          school?: string
          timezone?: string
          voice_twin_consented_at?: string | null
          voice_twin_id?: string | null
          voice_verified?: boolean
        }
        Update: {
          age_group?: string
          coordinator_id?: string | null
          country?: string
          created_at?: string
          display_name?: string
          id?: string
          interests?: string[]
          learning_language?: string
          native_language?: string
          onboarded?: boolean
          school?: string
          timezone?: string
          voice_twin_consented_at?: string | null
          voice_twin_id?: string | null
          voice_verified?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "profiles_coordinator_id_fkey"
            columns: ["coordinator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      roleplay_ambience: {
        Row: {
          created_at: string
          path: string | null
          scene_id: string
          status: string
        }
        Insert: {
          created_at?: string
          path?: string | null
          scene_id: string
          status: string
        }
        Update: {
          created_at?: string
          path?: string | null
          scene_id?: string
          status?: string
        }
        Relationships: []
      }
      roleplay_sessions: {
        Row: {
          awarded: boolean
          created_at: string
          ended: boolean
          exchanges: number
          feedback: Json | null
          id: string
          level: string
          scene_id: string
          stars: number | null
          turns: Json
          user_id: string
        }
        Insert: {
          awarded?: boolean
          created_at?: string
          ended?: boolean
          exchanges?: number
          feedback?: Json | null
          id?: string
          level?: string
          scene_id: string
          stars?: number | null
          turns?: Json
          user_id: string
        }
        Update: {
          awarded?: boolean
          created_at?: string
          ended?: boolean
          exchanges?: number
          feedback?: Json | null
          id?: string
          level?: string
          scene_id?: string
          stars?: number | null
          turns?: Json
          user_id?: string
        }
        Relationships: []
      }
      saved_words: {
        Row: {
          created_at: string
          english: string
          id: string
          tamil: string
          transliteration: string
          user_id: string
        }
        Insert: {
          created_at?: string
          english?: string
          id?: string
          tamil: string
          transliteration?: string
          user_id: string
        }
        Update: {
          created_at?: string
          english?: string
          id?: string
          tamil?: string
          transliteration?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      xp_events: {
        Row: {
          created_at: string
          id: string
          points: number
          reason: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          points: number
          reason?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          points?: number
          reason?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_paalam_xp: {
        Args: { p_points: number; p_reason: string }
        Returns: undefined
      }
      book_paalam_call: {
        Args: { p_partner_name: string; p_slot_start: string }
        Returns: undefined
      }
      complete_cinema_scene: {
        Args: { p_scene: string; p_user: string }
        Returns: Json
      }
      consent_voice_twin: { Args: { p_voice_id: string }; Returns: undefined }
      create_charity_invite: {
        Args: { p_charity_name: string }
        Returns: string
      }
      delete_voice_twin: { Args: never; Returns: undefined }
      finish_roleplay_session: {
        Args: { p_session_id: string }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      save_paalam_profile: {
        Args: {
          p_age_group: string
          p_country: string
          p_display_name: string
          p_interests: string[]
          p_invite_code?: string
          p_learning_language: string
          p_native_language: string
          p_school: string
          p_timezone: string
        }
        Returns: undefined
      }
      set_paalam_staff_role: {
        Args: {
          p_role: Database["public"]["Enums"]["app_role"]
          p_user_id: string
        }
        Returns: undefined
      }
      set_voice_verified: {
        Args: { p_user_id: string; p_verified: boolean }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "learner_tamil" | "learner_english" | "coordinator" | "admin"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["learner_tamil", "learner_english", "coordinator", "admin"],
    },
  },
} as const
