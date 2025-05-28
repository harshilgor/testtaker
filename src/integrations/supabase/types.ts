export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
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
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          preferences: Json | null
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
          preferences?: Json | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          preferences?: Json | null
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
