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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_logs: {
        Row: {
          action: Database["public"]["Enums"]["admin_action"]
          admin_id: string | null
          created_at: string | null
          details: Json | null
          id: string
          ip_address: string | null
          resource_id: string | null
          resource_type: string | null
          user_agent: string | null
        }
        Insert: {
          action: Database["public"]["Enums"]["admin_action"]
          admin_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: Database["public"]["Enums"]["admin_action"]
          admin_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_logs_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      content_reviews: {
        Row: {
          action_taken: string | null
          created_at: string | null
          id: string
          report_evidence: Json | null
          report_reason: string | null
          report_type: Database["public"]["Enums"]["report_type"]
          reporter_id: string | null
          resource_banned: boolean | null
          resource_id: string
          resource_type: string
          review_notes: string | null
          reviewed_at: string | null
          reviewer_id: string | null
          status: Database["public"]["Enums"]["review_status"] | null
        }
        Insert: {
          action_taken?: string | null
          created_at?: string | null
          id?: string
          report_evidence?: Json | null
          report_reason?: string | null
          report_type: Database["public"]["Enums"]["report_type"]
          reporter_id?: string | null
          resource_banned?: boolean | null
          resource_id: string
          resource_type: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewer_id?: string | null
          status?: Database["public"]["Enums"]["review_status"] | null
        }
        Update: {
          action_taken?: string | null
          created_at?: string | null
          id?: string
          report_evidence?: Json | null
          report_reason?: string | null
          report_type?: Database["public"]["Enums"]["report_type"]
          reporter_id?: string | null
          resource_banned?: boolean | null
          resource_id?: string
          resource_type?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewer_id?: string | null
          status?: Database["public"]["Enums"]["review_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "content_reviews_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      form_questions: {
        Row: {
          created_at: string | null
          form_id: string
          id: string
          logic_rules: Json | null
          options: Json | null
          order_index: number
          question_text: string
          question_type: string
          validation: Json | null
        }
        Insert: {
          created_at?: string | null
          form_id: string
          id?: string
          logic_rules?: Json | null
          options?: Json | null
          order_index: number
          question_text: string
          question_type: string
          validation?: Json | null
        }
        Update: {
          created_at?: string | null
          form_id?: string
          id?: string
          logic_rules?: Json | null
          options?: Json | null
          order_index?: number
          question_text?: string
          question_type?: string
          validation?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "form_questions_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
        ]
      }
      form_submissions: {
        Row: {
          answers: Json
          created_at: string | null
          duration_seconds: number | null
          form_id: string
          id: string
          session_id: string | null
          status: string | null
          submitter_ip: string | null
          submitter_location: Json | null
          submitter_user_agent: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          answers: Json
          created_at?: string | null
          duration_seconds?: number | null
          form_id: string
          id?: string
          session_id?: string | null
          status?: string | null
          submitter_ip?: string | null
          submitter_location?: Json | null
          submitter_user_agent?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          answers?: Json
          created_at?: string | null
          duration_seconds?: number | null
          form_id?: string
          id?: string
          session_id?: string | null
          status?: string | null
          submitter_ip?: string | null
          submitter_location?: Json | null
          submitter_user_agent?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "form_submissions_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      forms: {
        Row: {
          access_password: string | null
          access_type: string | null
          allowed_emails: string[] | null
          created_at: string | null
          description: string | null
          expires_at: string | null
          id: string
          ip_restrictions: string[] | null
          logo_url: string | null
          max_per_user: number | null
          max_responses: number | null
          published_at: string | null
          response_count: number | null
          results_password: string | null
          short_id: string
          show_results: boolean | null
          status: string | null
          theme_config: Json | null
          title: string
          type: string
          updated_at: string | null
          user_id: string | null
          view_count: number | null
        }
        Insert: {
          access_password?: string | null
          access_type?: string | null
          allowed_emails?: string[] | null
          created_at?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          ip_restrictions?: string[] | null
          logo_url?: string | null
          max_per_user?: number | null
          max_responses?: number | null
          published_at?: string | null
          response_count?: number | null
          results_password?: string | null
          short_id: string
          show_results?: boolean | null
          status?: string | null
          theme_config?: Json | null
          title: string
          type: string
          updated_at?: string | null
          user_id?: string | null
          view_count?: number | null
        }
        Update: {
          access_password?: string | null
          access_type?: string | null
          allowed_emails?: string[] | null
          created_at?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          ip_restrictions?: string[] | null
          logo_url?: string | null
          max_per_user?: number | null
          max_responses?: number | null
          published_at?: string | null
          response_count?: number | null
          results_password?: string | null
          short_id?: string
          show_results?: boolean | null
          status?: string | null
          theme_config?: Json | null
          title?: string
          type?: string
          updated_at?: string | null
          user_id?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "forms_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      guest_forms: {
        Row: {
          access_token: string | null
          created_at: string | null
          expires_at: string | null
          form_id: string
          guest_email: string | null
          id: string
          session_id: string
        }
        Insert: {
          access_token?: string | null
          created_at?: string | null
          expires_at?: string | null
          form_id: string
          guest_email?: string | null
          id?: string
          session_id: string
        }
        Update: {
          access_token?: string | null
          created_at?: string | null
          expires_at?: string | null
          form_id?: string
          guest_email?: string | null
          id?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guest_forms_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          content: Json | null
          created_at: string | null
          form_id: string | null
          id: string
          read: boolean | null
          type: string
          user_id: string | null
        }
        Insert: {
          content?: Json | null
          created_at?: string | null
          form_id?: string | null
          id?: string
          read?: boolean | null
          type: string
          user_id?: string | null
        }
        Update: {
          content?: Json | null
          created_at?: string | null
          form_id?: string | null
          id?: string
          read?: boolean | null
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          banned_at: string | null
          banned_reason: string | null
          bio: string | null
          created_at: string | null
          email: string
          email_verified: boolean | null
          form_count: number | null
          id: string
          last_login_at: string | null
          nickname: string | null
          preferences: Json | null
          role: Database["public"]["Enums"]["user_role"] | null
          status: Database["public"]["Enums"]["user_status"] | null
          storage_used: number | null
          submission_count: number | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          banned_at?: string | null
          banned_reason?: string | null
          bio?: string | null
          created_at?: string | null
          email: string
          email_verified?: boolean | null
          form_count?: number | null
          id: string
          last_login_at?: string | null
          nickname?: string | null
          preferences?: Json | null
          role?: Database["public"]["Enums"]["user_role"] | null
          status?: Database["public"]["Enums"]["user_status"] | null
          storage_used?: number | null
          submission_count?: number | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          banned_at?: string | null
          banned_reason?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string
          email_verified?: boolean | null
          form_count?: number | null
          id?: string
          last_login_at?: string | null
          nickname?: string | null
          preferences?: Json | null
          role?: Database["public"]["Enums"]["user_role"] | null
          status?: Database["public"]["Enums"]["user_status"] | null
          storage_used?: number | null
          submission_count?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          description: string | null
          key: string
          updated_at: string | null
          updated_by: string | null
          value: Json
        }
        Insert: {
          description?: string | null
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value: Json
        }
        Update: {
          description?: string | null
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "system_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      templates: {
        Row: {
          category: Database["public"]["Enums"]["template_category"]
          created_at: string | null
          created_by: string | null
          demo_form_id: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          preview_url: string | null
          sort_order: number | null
          tags: string[] | null
          title: string
          updated_at: string | null
          use_count: number | null
        }
        Insert: {
          category: Database["public"]["Enums"]["template_category"]
          created_at?: string | null
          created_by?: string | null
          demo_form_id?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          preview_url?: string | null
          sort_order?: number | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          use_count?: number | null
        }
        Update: {
          category?: Database["public"]["Enums"]["template_category"]
          created_at?: string | null
          created_by?: string | null
          demo_form_id?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          preview_url?: string | null
          sort_order?: number | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          use_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      uploaded_files: {
        Row: {
          created_at: string | null
          file_name: string
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          question_id: string
          storage_path: string | null
          submission_id: string | null
        }
        Insert: {
          created_at?: string | null
          file_name: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          question_id: string
          storage_path?: string | null
          submission_id?: string | null
        }
        Update: {
          created_at?: string | null
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          question_id?: string
          storage_path?: string | null
          submission_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "uploaded_files_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "form_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_submit_form: {
        Args: { form_uuid: string; user_uuid?: string }
        Returns: boolean
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      is_admin: { Args: never; Returns: boolean }
      is_authenticated: { Args: never; Returns: boolean }
      is_form_accessible: { Args: { form_uuid: string }; Returns: boolean }
      is_owner_or_admin: {
        Args: { resource_user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      admin_action:
        | "login"
        | "logout"
        | "view_user"
        | "update_user"
        | "ban_user"
        | "delete_user"
        | "view_form"
        | "update_form"
        | "delete_form"
        | "ban_form"
        | "approve_template"
        | "delete_template"
        | "update_settings"
        | "export_data"
        | "view_logs"
      report_type:
        | "inappropriate_content"
        | "spam"
        | "harassment"
        | "false_information"
        | "copyright"
        | "other"
      review_status: "pending" | "approved" | "rejected"
      template_category:
        | "vote"
        | "survey"
        | "rating"
        | "feedback"
        | "collection"
      user_role: "admin" | "creator" | "guest"
      user_status: "active" | "inactive" | "banned"
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
      admin_action: [
        "login",
        "logout",
        "view_user",
        "update_user",
        "ban_user",
        "delete_user",
        "view_form",
        "update_form",
        "delete_form",
        "ban_form",
        "approve_template",
        "delete_template",
        "update_settings",
        "export_data",
        "view_logs",
      ],
      report_type: [
        "inappropriate_content",
        "spam",
        "harassment",
        "false_information",
        "copyright",
        "other",
      ],
      review_status: ["pending", "approved", "rejected"],
      template_category: ["vote", "survey", "rating", "feedback", "collection"],
      user_role: ["admin", "creator", "guest"],
      user_status: ["active", "inactive", "banned"],
    },
  },
} as const
