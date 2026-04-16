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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      attachments: {
        Row: {
          created_at: string | null
          filename: string
          id: string
          step_id: string | null
          storage_path: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string | null
          filename: string
          id?: string
          step_id?: string | null
          storage_path: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string | null
          filename?: string
          id?: string
          step_id?: string | null
          storage_path?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attachments_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "project_steps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attachments_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      offer_lines: {
        Row: {
          client_unit_price: number
          description: string
          id: string
          internal_unit_cost: number
          offer_id: string | null
          quantity: number
          service_id: string | null
          sort_order: number | null
        }
        Insert: {
          client_unit_price: number
          description: string
          id?: string
          internal_unit_cost: number
          offer_id?: string | null
          quantity: number
          service_id?: string | null
          sort_order?: number | null
        }
        Update: {
          client_unit_price?: number
          description?: string
          id?: string
          internal_unit_cost?: number
          offer_id?: string | null
          quantity?: number
          service_id?: string | null
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "offer_lines_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offer_lines_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      offers: {
        Row: {
          client_name: string
          created_at: string | null
          created_by: string | null
          id: string
          payment_schedule: Json | null
          status: Database["public"]["Enums"]["offer_status"] | null
          title: string
          updated_at: string | null
          vat_rate: number | null
        }
        Insert: {
          client_name: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          payment_schedule?: Json | null
          status?: Database["public"]["Enums"]["offer_status"] | null
          title: string
          updated_at?: string | null
          vat_rate?: number | null
        }
        Update: {
          client_name?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          payment_schedule?: Json | null
          status?: Database["public"]["Enums"]["offer_status"] | null
          title?: string
          updated_at?: string | null
          vat_rate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "offers_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          full_name: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          created_at?: string | null
          full_name: string
          id: string
          role?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          created_at?: string | null
          full_name?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: []
      }
      project_steps: {
        Row: {
          assignee_id: string | null
          completed_at: string | null
          deadline: string | null
          id: string
          parent_step_id: string | null
          project_id: string | null
          sort_order: number | null
          title: string
        }
        Insert: {
          assignee_id?: string | null
          completed_at?: string | null
          deadline?: string | null
          id?: string
          parent_step_id?: string | null
          project_id?: string | null
          sort_order?: number | null
          title: string
        }
        Update: {
          assignee_id?: string | null
          completed_at?: string | null
          deadline?: string | null
          id?: string
          parent_step_id?: string | null
          project_id?: string | null
          sort_order?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_steps_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_steps_parent_step_id_fkey"
            columns: ["parent_step_id"]
            isOneToOne: false
            referencedRelation: "project_steps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_steps_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          client_name: string
          created_at: string | null
          deadline: string | null
          id: string
          offer_id: string | null
          pm_id: string | null
          status: Database["public"]["Enums"]["project_status"] | null
          title: string
        }
        Insert: {
          client_name: string
          created_at?: string | null
          deadline?: string | null
          id?: string
          offer_id?: string | null
          pm_id?: string | null
          status?: Database["public"]["Enums"]["project_status"] | null
          title: string
        }
        Update: {
          client_name?: string
          created_at?: string | null
          deadline?: string | null
          id?: string
          offer_id?: string | null
          pm_id?: string | null
          status?: Database["public"]["Enums"]["project_status"] | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_pm_id_fkey"
            columns: ["pm_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          created_at: string | null
          created_by: string | null
          generated_pdf_path: string | null
          id: string
          project_id: string | null
          status: Database["public"]["Enums"]["report_status"] | null
          step_ids: string[] | null
          title: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          generated_pdf_path?: string | null
          id?: string
          project_id?: string | null
          status?: Database["public"]["Enums"]["report_status"] | null
          step_ids?: string[] | null
          title: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          generated_pdf_path?: string | null
          id?: string
          project_id?: string | null
          status?: Database["public"]["Enums"]["report_status"] | null
          step_ids?: string[] | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          active: boolean | null
          client_price: number
          id: string
          internal_cost: number
          name: string
          unit: string
          vat_applicable: boolean | null
        }
        Insert: {
          active?: boolean | null
          client_price: number
          id?: string
          internal_cost: number
          name: string
          unit: string
          vat_applicable?: boolean | null
        }
        Update: {
          active?: boolean | null
          client_price?: number
          id?: string
          internal_cost?: number
          name?: string
          unit?: string
          vat_applicable?: boolean | null
        }
        Relationships: []
      }
      step_comments: {
        Row: {
          author_id: string | null
          body: string
          created_at: string | null
          id: string
          step_id: string | null
        }
        Insert: {
          author_id?: string | null
          body: string
          created_at?: string | null
          id?: string
          step_id?: string | null
        }
        Update: {
          author_id?: string | null
          body?: string
          created_at?: string | null
          id?: string
          step_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "step_comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "step_comments_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "project_steps"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      offer_status: "draft" | "sent" | "accepted" | "rejected" | "expired"
      project_status: "active" | "paused" | "done"
      report_status: "draft" | "sent" | "approved"
      user_role: "admin" | "pm" | "sales"
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
      offer_status: ["draft", "sent", "accepted", "rejected", "expired"],
      project_status: ["active", "paused", "done"],
      report_status: ["draft", "sent", "approved"],
      user_role: ["admin", "pm", "sales"],
    },
  },
} as const
