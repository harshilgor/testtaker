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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      ai_insight_cache: {
        Row: {
          created_at: string
          data_hash: string
          id: string
          response: Json
          target_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data_hash: string
          id?: string
          response: Json
          target_date: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data_hash?: string
          id?: string
          response?: Json
          target_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_insight_calls: {
        Row: {
          call_date: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          call_date: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          call_date?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      leaderboard_stats: {
        Row: {
          display_name: string
          id: string
          last_updated: string
          marathon_questions_count: number
          mock_test_count: number
          quiz_count: number
          total_points: number
          user_id: string
          visibility: Database["public"]["Enums"]["leaderboard_visibility"]
        }
        Insert: {
          display_name: string
          id?: string
          last_updated?: string
          marathon_questions_count?: number
          mock_test_count?: number
          quiz_count?: number
          total_points?: number
          user_id: string
          visibility?: Database["public"]["Enums"]["leaderboard_visibility"]
        }
        Update: {
          display_name?: string
          id?: string
          last_updated?: string
          marathon_questions_count?: number
          mock_test_count?: number
          quiz_count?: number
          total_points?: number
          user_id?: string
          visibility?: Database["public"]["Enums"]["leaderboard_visibility"]
        }
        Relationships: [
          {
            foreignKeyName: "leaderboard_stats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      leaderboard_stats_v2: {
        Row: {
          display_name: string
          id: string
          last_updated: string | null
          marathon_questions_count: number
          mock_test_count: number
          quiz_count: number
          total_points: number
          user_id: string
          visibility: string | null
        }
        Insert: {
          display_name: string
          id?: string
          last_updated?: string | null
          marathon_questions_count?: number
          mock_test_count?: number
          quiz_count?: number
          total_points?: number
          user_id: string
          visibility?: string | null
        }
        Update: {
          display_name?: string
          id?: string
          last_updated?: string | null
          marathon_questions_count?: number
          mock_test_count?: number
          quiz_count?: number
          total_points?: number
          user_id?: string
          visibility?: string | null
        }
        Relationships: []
      }
      marathon_sessions: {
        Row: {
          adaptive_learning: boolean | null
          correct_answers: number | null
          created_at: string
          difficulty: string | null
          end_time: string | null
          id: string
          incorrect_answers: number | null
          show_answer_used: number | null
          start_time: string
          subjects: string[] | null
          time_goal_minutes: number | null
          timed_mode: boolean | null
          total_questions: number | null
          user_id: string
        }
        Insert: {
          adaptive_learning?: boolean | null
          correct_answers?: number | null
          created_at?: string
          difficulty?: string | null
          end_time?: string | null
          id?: string
          incorrect_answers?: number | null
          show_answer_used?: number | null
          start_time?: string
          subjects?: string[] | null
          time_goal_minutes?: number | null
          timed_mode?: boolean | null
          total_questions?: number | null
          user_id: string
        }
        Update: {
          adaptive_learning?: boolean | null
          correct_answers?: number | null
          created_at?: string
          difficulty?: string | null
          end_time?: string | null
          id?: string
          incorrect_answers?: number | null
          show_answer_used?: number | null
          start_time?: string
          subjects?: string[] | null
          time_goal_minutes?: number | null
          timed_mode?: boolean | null
          total_questions?: number | null
          user_id?: string
        }
        Relationships: []
      }
      mock_test_results: {
        Row: {
          completed_at: string
          detailed_results: Json | null
          english_score: number | null
          id: string
          math_score: number | null
          test_type: string
          time_taken: number | null
          total_score: number | null
          user_id: string
        }
        Insert: {
          completed_at?: string
          detailed_results?: Json | null
          english_score?: number | null
          id?: string
          math_score?: number | null
          test_type?: string
          time_taken?: number | null
          total_score?: number | null
          user_id: string
        }
        Update: {
          completed_at?: string
          detailed_results?: Json | null
          english_score?: number | null
          id?: string
          math_score?: number | null
          test_type?: string
          time_taken?: number | null
          total_score?: number | null
          user_id?: string
        }
        Relationships: []
      }
      monthly_leaderboard_stats: {
        Row: {
          created_at: string
          display_name: string
          id: string
          last_updated: string
          marathon_questions_count: number
          mock_test_count: number
          month_end_date: string
          month_start_date: string
          quiz_count: number
          total_points: number
          user_id: string
          visibility: Database["public"]["Enums"]["leaderboard_visibility"]
        }
        Insert: {
          created_at?: string
          display_name: string
          id?: string
          last_updated?: string
          marathon_questions_count?: number
          mock_test_count?: number
          month_end_date: string
          month_start_date: string
          quiz_count?: number
          total_points?: number
          user_id: string
          visibility?: Database["public"]["Enums"]["leaderboard_visibility"]
        }
        Update: {
          created_at?: string
          display_name?: string
          id?: string
          last_updated?: string
          marathon_questions_count?: number
          mock_test_count?: number
          month_end_date?: string
          month_start_date?: string
          quiz_count?: number
          total_points?: number
          user_id?: string
          visibility?: Database["public"]["Enums"]["leaderboard_visibility"]
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          leaderboard_visibility:
            | Database["public"]["Enums"]["leaderboard_visibility"]
            | null
          preferences: Json | null
          public_username: string | null
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
          leaderboard_visibility?:
            | Database["public"]["Enums"]["leaderboard_visibility"]
            | null
          preferences?: Json | null
          public_username?: string | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          leaderboard_visibility?:
            | Database["public"]["Enums"]["leaderboard_visibility"]
            | null
          preferences?: Json | null
          public_username?: string | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      question_attempts: {
        Row: {
          created_at: string
          difficulty: string
          flagged: boolean | null
          hints_used: number | null
          id: string
          is_correct: boolean
          question_id: string
          session_id: string | null
          show_answer_used: boolean | null
          subject: string
          time_spent: number | null
          topic: string
          user_id: string
        }
        Insert: {
          created_at?: string
          difficulty: string
          flagged?: boolean | null
          hints_used?: number | null
          id?: string
          is_correct: boolean
          question_id: string
          session_id?: string | null
          show_answer_used?: boolean | null
          subject: string
          time_spent?: number | null
          topic: string
          user_id: string
        }
        Update: {
          created_at?: string
          difficulty?: string
          flagged?: boolean | null
          hints_used?: number | null
          id?: string
          is_correct?: boolean
          question_id?: string
          session_id?: string | null
          show_answer_used?: boolean | null
          subject?: string
          time_spent?: number | null
          topic?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_attempts_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "marathon_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      question_attempts_v2: {
        Row: {
          created_at: string
          difficulty: string
          id: string
          is_correct: boolean
          points_earned: number
          question_id: string
          session_id: string | null
          session_type: string
          subject: string
          time_spent: number | null
          topic: string
          user_id: string
        }
        Insert: {
          created_at?: string
          difficulty: string
          id?: string
          is_correct: boolean
          points_earned?: number
          question_id: string
          session_id?: string | null
          session_type: string
          subject: string
          time_spent?: number | null
          topic: string
          user_id: string
        }
        Update: {
          created_at?: string
          difficulty?: string
          id?: string
          is_correct?: boolean
          points_earned?: number
          question_id?: string
          session_id?: string | null
          session_type?: string
          subject?: string
          time_spent?: number | null
          topic?: string
          user_id?: string
        }
        Relationships: []
      }
      question_bank: {
        Row: {
          assessment: string | null
          correct_answer: string | null
          correct_rationale: string | null
          difficulty: string | null
          domain: string | null
          id: number
          image: string | null
          incorrect_rationale_a: string | null
          incorrect_rationale_b: string | null
          incorrect_rationale_c: string | null
          incorrect_rationale_d: string | null
          option_a: string | null
          option_b: string | null
          option_c: string | null
          option_d: string | null
          question_prompt: string | null
          question_text: string | null
          skill: string | null
          test: string | null
        }
        Insert: {
          assessment?: string | null
          correct_answer?: string | null
          correct_rationale?: string | null
          difficulty?: string | null
          domain?: string | null
          id?: number
          image?: string | null
          incorrect_rationale_a?: string | null
          incorrect_rationale_b?: string | null
          incorrect_rationale_c?: string | null
          incorrect_rationale_d?: string | null
          option_a?: string | null
          option_b?: string | null
          option_c?: string | null
          option_d?: string | null
          question_prompt?: string | null
          question_text?: string | null
          skill?: string | null
          test?: string | null
        }
        Update: {
          assessment?: string | null
          correct_answer?: string | null
          correct_rationale?: string | null
          difficulty?: string | null
          domain?: string | null
          id?: number
          image?: string | null
          incorrect_rationale_a?: string | null
          incorrect_rationale_b?: string | null
          incorrect_rationale_c?: string | null
          incorrect_rationale_d?: string | null
          option_a?: string | null
          option_b?: string | null
          option_c?: string | null
          option_d?: string | null
          question_prompt?: string | null
          question_text?: string | null
          skill?: string | null
          test?: string | null
        }
        Relationships: []
      }
      question_sessions: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          questions_used: string[]
          session_id: string
          session_type: string
          started_at: string
          total_questions_available: number
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          questions_used?: string[]
          session_id: string
          session_type: string
          started_at?: string
          total_questions_available?: number
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          questions_used?: string[]
          session_id?: string
          session_type?: string
          started_at?: string
          total_questions_available?: number
          user_id?: string
        }
        Relationships: []
      }
      question_usage: {
        Row: {
          id: string
          question_id: string | null
          session_id: string | null
          session_type: string
          used_at: string
          user_id: string
        }
        Insert: {
          id?: string
          question_id?: string | null
          session_id?: string | null
          session_type: string
          used_at?: string
          user_id: string
        }
        Update: {
          id?: string
          question_id?: string | null
          session_id?: string | null
          session_type?: string
          used_at?: string
          user_id?: string
        }
        Relationships: []
      }
      quiz_results: {
        Row: {
          correct_answers: number
          created_at: string
          id: string
          score_percentage: number
          subject: string
          time_taken: number | null
          topics: string[]
          total_questions: number
          user_id: string
        }
        Insert: {
          correct_answers: number
          created_at?: string
          id?: string
          score_percentage: number
          subject: string
          time_taken?: number | null
          topics: string[]
          total_questions: number
          user_id: string
        }
        Update: {
          correct_answers?: number
          created_at?: string
          id?: string
          score_percentage?: number
          subject?: string
          time_taken?: number | null
          topics?: string[]
          total_questions?: number
          user_id?: string
        }
        Relationships: []
      }
      security_events: {
        Row: {
          created_at: string
          details: Json | null
          event_type: string
          id: string
          ip_address: unknown | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          details?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          details?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_goals: {
        Row: {
          created_at: string
          id: string
          period: string
          target: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          period: string
          target: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          period?: string
          target?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_quests: {
        Row: {
          completed: boolean
          completed_at: string | null
          created_at: string | null
          current_progress: number
          difficulty: string
          expires_at: string
          id: string
          points_reward: number
          quest_description: string
          quest_id: string
          quest_title: string
          quest_type: string
          target_count: number
          target_topic: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string | null
          current_progress?: number
          difficulty: string
          expires_at: string
          id?: string
          points_reward?: number
          quest_description: string
          quest_id: string
          quest_title: string
          quest_type: string
          target_count?: number
          target_topic: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string | null
          current_progress?: number
          difficulty?: string
          expires_at?: string
          id?: string
          points_reward?: number
          quest_description?: string
          quest_id?: string
          quest_title?: string
          quest_type?: string
          target_count?: number
          target_topic?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_streaks: {
        Row: {
          created_at: string
          current_streak: number
          id: string
          last_activity_date: string | null
          longest_streak: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_streak?: number
          id?: string
          last_activity_date?: string | null
          longest_streak?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_streak?: number
          id?: string
          last_activity_date?: string | null
          longest_streak?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      weekly_leaderboard_stats: {
        Row: {
          created_at: string
          display_name: string
          id: string
          last_updated: string
          marathon_questions_count: number
          mock_test_count: number
          quiz_count: number
          total_points: number
          user_id: string
          visibility: Database["public"]["Enums"]["leaderboard_visibility"]
          week_end_date: string
          week_start_date: string
        }
        Insert: {
          created_at?: string
          display_name: string
          id?: string
          last_updated?: string
          marathon_questions_count?: number
          mock_test_count?: number
          quiz_count?: number
          total_points?: number
          user_id: string
          visibility?: Database["public"]["Enums"]["leaderboard_visibility"]
          week_end_date: string
          week_start_date: string
        }
        Update: {
          created_at?: string
          display_name?: string
          id?: string
          last_updated?: string
          marathon_questions_count?: number
          mock_test_count?: number
          quiz_count?: number
          total_points?: number
          user_id?: string
          visibility?: Database["public"]["Enums"]["leaderboard_visibility"]
          week_end_date?: string
          week_start_date?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_points: {
        Args: { correct_answers: number; difficulty?: string }
        Returns: number
      }
      calculate_user_total_points: {
        Args: { target_user_id: string }
        Returns: number
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["user_role"]
      }
      get_questions_for_quiz: {
        Args: {
          p_difficulty?: string
          p_domain?: string
          p_exclude_ids?: number[]
          p_limit?: number
          p_section?: string
          p_skill?: string
        }
        Returns: {
          difficulty: string
          domain: string
          id: number
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          question_text: string
          question_type: string
          section: string
          skill: string
          test_name: string
        }[]
      }
      get_random_questions: {
        Args: {
          p_difficulty?: string
          p_domain?: string
          p_exclude_ids?: number[]
          p_limit?: number
          p_section?: string
          p_skill?: string
        }
        Returns: {
          correct_answer: string
          correct_rationale: string
          difficulty: string
          domain: string
          id: number
          incorrect_rationale_a: string
          incorrect_rationale_b: string
          incorrect_rationale_c: string
          incorrect_rationale_d: string
          metadata: Json
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          question_text: string
          question_type: string
          section: string
          skill: string
          test_name: string
        }[]
      }
      get_secure_questions_for_quiz: {
        Args: {
          p_difficulty?: string
          p_domain?: string
          p_exclude_ids?: number[]
          p_limit?: number
          p_section?: string
          p_skill?: string
        }
        Returns: {
          difficulty: string
          domain: string
          id: number
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          question_text: string
          question_type: string
          section: string
          skill: string
          test_name: string
        }[]
      }
      get_unused_questions_for_session: {
        Args: {
          p_difficulty?: string
          p_limit?: number
          p_section?: string
          p_session_id: string
          p_session_type: string
        }
        Returns: {
          correct_answer: string
          correct_rationale: string
          difficulty: string
          domain: string
          id: number
          incorrect_rationale_a: string
          incorrect_rationale_b: string
          incorrect_rationale_c: string
          incorrect_rationale_d: string
          metadata: Json
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          question_text: string
          question_type: string
          section: string
          skill: string
          test_name: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: boolean
      }
      import_questions_batch: {
        Args: { questions_data: Json }
        Returns: number
      }
      increment_user_points: {
        Args: {
          p_points: number
          p_user_id: string
        }
        Returns: undefined
      }
      mark_question_used_in_session: {
        Args: {
          p_question_id: string
          p_session_id: string
          p_session_type: string
          p_total_available?: number
        }
        Returns: undefined
      }
      refresh_all_leaderboard_stats: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_leaderboard_stats: {
        Args: Record<PropertyKey, never> | { target_user_id: string }
        Returns: undefined
      }
      update_leaderboard_stats_v2: {
        Args: { target_user_id: string }
        Returns: undefined
      }
      update_monthly_leaderboard_stats: {
        Args: { target_user_id: string }
        Returns: undefined
      }
      update_periodic_leaderboard_stats: {
        Args: { target_user_id: string }
        Returns: undefined
      }
      update_user_streak: {
        Args: { target_user_id: string }
        Returns: undefined
      }
      update_weekly_leaderboard_stats: {
        Args: { target_user_id: string }
        Returns: undefined
      }
      validate_answer_and_get_explanation: {
        Args: {
          p_question_id: number
          p_submitted_answer: string
          p_user_id?: string
        }
        Returns: {
          correct_answer: string
          correct_explanation: string
          incorrect_explanation: string
          is_correct: boolean
        }[]
      }
    }
    Enums: {
      leaderboard_visibility: "public" | "private"
      user_role: "admin" | "user"
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
    Enums: {
      leaderboard_visibility: ["public", "private"],
      user_role: ["admin", "user"],
    },
  },
} as const
