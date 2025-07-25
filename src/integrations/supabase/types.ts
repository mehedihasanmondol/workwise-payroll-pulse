export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      bank_accounts: {
        Row: {
          account_holder_name: string
          account_number: string
          bank_name: string
          bsb_code: string | null
          created_at: string | null
          id: string
          is_primary: boolean | null
          opening_balance: number | null
          profile_id: string | null
          swift_code: string | null
          updated_at: string | null
        }
        Insert: {
          account_holder_name: string
          account_number: string
          bank_name: string
          bsb_code?: string | null
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          opening_balance?: number | null
          profile_id?: string | null
          swift_code?: string | null
          updated_at?: string | null
        }
        Update: {
          account_holder_name?: string
          account_number?: string
          bank_name?: string
          bsb_code?: string | null
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          opening_balance?: number | null
          profile_id?: string | null
          swift_code?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bank_accounts_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bank_transactions: {
        Row: {
          amount: number
          bank_account_id: string | null
          category: Database["public"]["Enums"]["transaction_category"]
          client_id: string | null
          created_at: string
          date: string
          description: string
          id: string
          profile_id: string | null
          project_id: string | null
          type: Database["public"]["Enums"]["bank_transaction_type"]
          updated_at: string
        }
        Insert: {
          amount: number
          bank_account_id?: string | null
          category: Database["public"]["Enums"]["transaction_category"]
          client_id?: string | null
          created_at?: string
          date?: string
          description: string
          id?: string
          profile_id?: string | null
          project_id?: string | null
          type: Database["public"]["Enums"]["bank_transaction_type"]
          updated_at?: string
        }
        Update: {
          amount?: number
          bank_account_id?: string | null
          category?: Database["public"]["Enums"]["transaction_category"]
          client_id?: string | null
          created_at?: string
          date?: string
          description?: string
          id?: string
          profile_id?: string | null
          project_id?: string | null
          type?: Database["public"]["Enums"]["bank_transaction_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bank_transactions_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bank_transactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bank_transactions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bank_transactions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      bulk_payroll: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          name: string
          pay_period_end: string
          pay_period_start: string
          processed_records: number | null
          status: Database["public"]["Enums"]["bulk_payroll_status"] | null
          total_amount: number | null
          total_records: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          name: string
          pay_period_end: string
          pay_period_start: string
          processed_records?: number | null
          status?: Database["public"]["Enums"]["bulk_payroll_status"] | null
          total_amount?: number | null
          total_records?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          name?: string
          pay_period_end?: string
          pay_period_start?: string
          processed_records?: number | null
          status?: Database["public"]["Enums"]["bulk_payroll_status"] | null
          total_amount?: number | null
          total_records?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bulk_payroll_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bulk_payroll_items: {
        Row: {
          bulk_payroll_id: string
          created_at: string
          error_message: string | null
          id: string
          payroll_id: string | null
          profile_id: string
          status: Database["public"]["Enums"]["bulk_payroll_item_status"] | null
        }
        Insert: {
          bulk_payroll_id: string
          created_at?: string
          error_message?: string | null
          id?: string
          payroll_id?: string | null
          profile_id: string
          status?:
            | Database["public"]["Enums"]["bulk_payroll_item_status"]
            | null
        }
        Update: {
          bulk_payroll_id?: string
          created_at?: string
          error_message?: string | null
          id?: string
          payroll_id?: string | null
          profile_id?: string
          status?:
            | Database["public"]["Enums"]["bulk_payroll_item_status"]
            | null
        }
        Relationships: [
          {
            foreignKeyName: "bulk_payroll_items_bulk_payroll_id_fkey"
            columns: ["bulk_payroll_id"]
            isOneToOne: false
            referencedRelation: "bulk_payroll"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bulk_payroll_items_payroll_id_fkey"
            columns: ["payroll_id"]
            isOneToOne: false
            referencedRelation: "payroll"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bulk_payroll_items_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          company: string
          created_at: string
          email: string
          id: string
          name: string
          phone: string | null
          status: Database["public"]["Enums"]["client_status"] | null
          updated_at: string
        }
        Insert: {
          company: string
          created_at?: string
          email: string
          id?: string
          name: string
          phone?: string | null
          status?: Database["public"]["Enums"]["client_status"] | null
          updated_at?: string
        }
        Update: {
          company?: string
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string | null
          status?: Database["public"]["Enums"]["client_status"] | null
          updated_at?: string
        }
        Relationships: []
      }
      employees: {
        Row: {
          created_at: string
          email: string
          hourly_rate: number
          id: string
          name: string
          phone: string | null
          role: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          hourly_rate?: number
          id?: string
          name: string
          phone?: string | null
          role: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          hourly_rate?: number
          id?: string
          name?: string
          phone?: string | null
          role?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      notification_permissions: {
        Row: {
          can_create_bulk_notifications: boolean
          can_create_notifications: boolean
          created_at: string
          id: string
          profile_id: string
        }
        Insert: {
          can_create_bulk_notifications?: boolean
          can_create_notifications?: boolean
          created_at?: string
          id?: string
          profile_id: string
        }
        Update: {
          can_create_bulk_notifications?: boolean
          can_create_notifications?: boolean
          created_at?: string
          id?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_permissions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_data: Json | null
          action_type:
            | Database["public"]["Enums"]["notification_action_type"]
            | null
          actioned_at: string | null
          created_at: string
          id: string
          is_actioned: boolean
          is_read: boolean
          message: string
          priority: Database["public"]["Enums"]["notification_priority"] | null
          read_at: string | null
          recipient_profile_id: string
          related_id: string | null
          sender_profile_id: string | null
          title: string
          type: string
        }
        Insert: {
          action_data?: Json | null
          action_type?:
            | Database["public"]["Enums"]["notification_action_type"]
            | null
          actioned_at?: string | null
          created_at?: string
          id?: string
          is_actioned?: boolean
          is_read?: boolean
          message: string
          priority?: Database["public"]["Enums"]["notification_priority"] | null
          read_at?: string | null
          recipient_profile_id: string
          related_id?: string | null
          sender_profile_id?: string | null
          title: string
          type: string
        }
        Update: {
          action_data?: Json | null
          action_type?:
            | Database["public"]["Enums"]["notification_action_type"]
            | null
          actioned_at?: string | null
          created_at?: string
          id?: string
          is_actioned?: boolean
          is_read?: boolean
          message?: string
          priority?: Database["public"]["Enums"]["notification_priority"] | null
          read_at?: string | null
          recipient_profile_id?: string
          related_id?: string | null
          sender_profile_id?: string | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_recipient_profile_id_fkey"
            columns: ["recipient_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_sender_profile_id_fkey"
            columns: ["sender_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll: {
        Row: {
          bank_account_id: string | null
          created_at: string
          deductions: number
          gross_pay: number
          hourly_rate: number
          id: string
          net_pay: number
          pay_period_end: string
          pay_period_start: string
          profile_id: string
          status: Database["public"]["Enums"]["payroll_status"] | null
          total_hours: number
          updated_at: string
        }
        Insert: {
          bank_account_id?: string | null
          created_at?: string
          deductions?: number
          gross_pay?: number
          hourly_rate?: number
          id?: string
          net_pay?: number
          pay_period_end: string
          pay_period_start: string
          profile_id: string
          status?: Database["public"]["Enums"]["payroll_status"] | null
          total_hours?: number
          updated_at?: string
        }
        Update: {
          bank_account_id?: string | null
          created_at?: string
          deductions?: number
          gross_pay?: number
          hourly_rate?: number
          id?: string
          net_pay?: number
          pay_period_end?: string
          pay_period_start?: string
          profile_id?: string
          status?: Database["public"]["Enums"]["payroll_status"] | null
          total_hours?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payroll_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payroll_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll_working_hours: {
        Row: {
          created_at: string
          id: string
          payroll_id: string
          working_hours_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          payroll_id: string
          working_hours_id: string
        }
        Update: {
          created_at?: string
          id?: string
          payroll_id?: string
          working_hours_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payroll_working_hours_payroll_id_fkey"
            columns: ["payroll_id"]
            isOneToOne: false
            referencedRelation: "payroll"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payroll_working_hours_working_hours_id_fkey"
            columns: ["working_hours_id"]
            isOneToOne: true
            referencedRelation: "working_hours"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          employment_type: Database["public"]["Enums"]["employment_type"] | null
          full_address: string | null
          full_name: string
          hourly_rate: number | null
          id: string
          is_active: boolean | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          salary: number | null
          start_date: string | null
          tax_file_number: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          employment_type?:
            | Database["public"]["Enums"]["employment_type"]
            | null
          full_address?: string | null
          full_name: string
          hourly_rate?: number | null
          id: string
          is_active?: boolean | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          salary?: number | null
          start_date?: string | null
          tax_file_number?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          employment_type?:
            | Database["public"]["Enums"]["employment_type"]
            | null
          full_address?: string | null
          full_name?: string
          hourly_rate?: number | null
          id?: string
          is_active?: boolean | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          salary?: number | null
          start_date?: string | null
          tax_file_number?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          budget: number | null
          client_id: string
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          name: string
          start_date: string
          status: Database["public"]["Enums"]["project_status"] | null
          updated_at: string
        }
        Insert: {
          budget?: number | null
          client_id: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          start_date: string
          status?: Database["public"]["Enums"]["project_status"] | null
          updated_at?: string
        }
        Update: {
          budget?: number | null
          client_id?: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          start_date?: string
          status?: Database["public"]["Enums"]["project_status"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          id: string
          permission: Database["public"]["Enums"]["app_permission"]
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          id?: string
          permission: Database["public"]["Enums"]["app_permission"]
          role: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          id?: string
          permission?: Database["public"]["Enums"]["app_permission"]
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: []
      }
      roster_profiles: {
        Row: {
          created_at: string
          id: string
          profile_id: string
          roster_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          profile_id: string
          roster_id: string
        }
        Update: {
          created_at?: string
          id?: string
          profile_id?: string
          roster_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "roster_profiles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "roster_profiles_roster_id_fkey"
            columns: ["roster_id"]
            isOneToOne: false
            referencedRelation: "rosters"
            referencedColumns: ["id"]
          },
        ]
      }
      rosters: {
        Row: {
          client_id: string
          created_at: string | null
          date: string
          end_date: string | null
          end_time: string
          expected_profiles: number | null
          id: string
          is_editable: boolean | null
          is_locked: boolean | null
          name: string | null
          notes: string | null
          per_hour_rate: number | null
          profile_id: string
          project_id: string
          start_time: string
          status: Database["public"]["Enums"]["roster_status"] | null
          total_hours: number
          updated_at: string | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          date: string
          end_date?: string | null
          end_time: string
          expected_profiles?: number | null
          id?: string
          is_editable?: boolean | null
          is_locked?: boolean | null
          name?: string | null
          notes?: string | null
          per_hour_rate?: number | null
          profile_id: string
          project_id: string
          start_time: string
          status?: Database["public"]["Enums"]["roster_status"] | null
          total_hours: number
          updated_at?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          date?: string
          end_date?: string | null
          end_time?: string
          expected_profiles?: number | null
          id?: string
          is_editable?: boolean | null
          is_locked?: boolean | null
          name?: string | null
          notes?: string | null
          per_hour_rate?: number | null
          profile_id?: string
          project_id?: string
          start_time?: string
          status?: Database["public"]["Enums"]["roster_status"] | null
          total_hours?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rosters_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rosters_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rosters_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      salary_templates: {
        Row: {
          bank_account_id: string | null
          base_hourly_rate: number | null
          client_id: string | null
          created_at: string
          deduction_percentage: number | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          overtime_multiplier: number | null
          profile_id: string | null
          project_id: string | null
          updated_at: string
        }
        Insert: {
          bank_account_id?: string | null
          base_hourly_rate?: number | null
          client_id?: string | null
          created_at?: string
          deduction_percentage?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          overtime_multiplier?: number | null
          profile_id?: string | null
          project_id?: string | null
          updated_at?: string
        }
        Update: {
          bank_account_id?: string | null
          base_hourly_rate?: number | null
          client_id?: string | null
          created_at?: string
          deduction_percentage?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          overtime_multiplier?: number | null
          profile_id?: string | null
          project_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "salary_templates_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "salary_templates_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "salary_templates_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "salary_templates_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      working_hours: {
        Row: {
          actual_hours: number | null
          client_id: string
          created_at: string
          date: string
          end_time: string
          hourly_rate: number | null
          id: string
          notes: string | null
          overtime_hours: number | null
          payable_amount: number | null
          profile_id: string
          project_id: string
          roster_id: string | null
          sign_in_time: string | null
          sign_out_time: string | null
          start_time: string
          status: Database["public"]["Enums"]["working_hours_status"]
          total_hours: number
          updated_at: string
        }
        Insert: {
          actual_hours?: number | null
          client_id: string
          created_at?: string
          date: string
          end_time: string
          hourly_rate?: number | null
          id?: string
          notes?: string | null
          overtime_hours?: number | null
          payable_amount?: number | null
          profile_id: string
          project_id: string
          roster_id?: string | null
          sign_in_time?: string | null
          sign_out_time?: string | null
          start_time: string
          status?: Database["public"]["Enums"]["working_hours_status"]
          total_hours: number
          updated_at?: string
        }
        Update: {
          actual_hours?: number | null
          client_id?: string
          created_at?: string
          date?: string
          end_time?: string
          hourly_rate?: number | null
          id?: string
          notes?: string | null
          overtime_hours?: number | null
          payable_amount?: number | null
          profile_id?: string
          project_id?: string
          roster_id?: string | null
          sign_in_time?: string | null
          sign_out_time?: string | null
          start_time?: string
          status?: Database["public"]["Enums"]["working_hours_status"]
          total_hours?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "working_hours_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "working_hours_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "working_hours_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "working_hours_roster_id_fkey"
            columns: ["roster_id"]
            isOneToOne: false
            referencedRelation: "rosters"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_roster_with_profiles: {
        Args: {
          p_profile_id: string
          p_client_id: string
          p_project_id: string
          p_date: string
          p_end_date: string
          p_start_time: string
          p_end_time: string
          p_total_hours: number
          p_notes: string
          p_status: Database["public"]["Enums"]["roster_status"]
          p_name: string
          p_expected_profiles: number
          p_per_hour_rate: number
          p_profile_ids: string[]
        }
        Returns: string
      }
      create_working_hours_for_roster: {
        Args: { p_roster_id: string }
        Returns: undefined
      }
      get_role_permissions: {
        Args: { user_role: Database["public"]["Enums"]["user_role"] }
        Returns: {
          permission: Database["public"]["Enums"]["app_permission"]
        }[]
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      has_permission: {
        Args: {
          user_id: string
          required_permission: Database["public"]["Enums"]["app_permission"]
        }
        Returns: boolean
      }
      role_has_permission: {
        Args: {
          user_role: Database["public"]["Enums"]["user_role"]
          required_permission: Database["public"]["Enums"]["app_permission"]
        }
        Returns: boolean
      }
    }
    Enums: {
      app_permission:
        | "dashboard_view"
        | "employees_view"
        | "employees_manage"
        | "clients_view"
        | "clients_manage"
        | "projects_view"
        | "projects_manage"
        | "working_hours_view"
        | "working_hours_manage"
        | "working_hours_approve"
        | "roster_view"
        | "roster_manage"
        | "payroll_view"
        | "payroll_manage"
        | "payroll_process"
        | "bank_balance_view"
        | "bank_balance_manage"
        | "reports_view"
        | "reports_generate"
        | "notifications_view"
      bank_transaction_type: "deposit" | "withdrawal"
      bulk_payroll_item_status: "pending" | "processed" | "failed"
      bulk_payroll_status: "draft" | "processing" | "completed" | "failed"
      client_status: "active" | "inactive"
      employment_type: "full-time" | "part-time" | "casual"
      notification_action_type:
        | "approve"
        | "confirm"
        | "grant"
        | "cancel"
        | "reject"
        | "none"
      notification_priority: "low" | "medium" | "high"
      payroll_status: "pending" | "approved" | "paid"
      project_status: "active" | "completed" | "on-hold"
      roster_status: "pending" | "confirmed" | "cancelled"
      transaction_category:
        | "income"
        | "expense"
        | "transfer"
        | "salary"
        | "equipment"
        | "materials"
        | "travel"
        | "office"
        | "utilities"
        | "marketing"
        | "other"
        | "opening_balance"
      user_role:
        | "admin"
        | "employee"
        | "accountant"
        | "operation"
        | "sales_manager"
      working_hours_status: "pending" | "approved" | "rejected" | "paid"
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
      app_permission: [
        "dashboard_view",
        "employees_view",
        "employees_manage",
        "clients_view",
        "clients_manage",
        "projects_view",
        "projects_manage",
        "working_hours_view",
        "working_hours_manage",
        "working_hours_approve",
        "roster_view",
        "roster_manage",
        "payroll_view",
        "payroll_manage",
        "payroll_process",
        "bank_balance_view",
        "bank_balance_manage",
        "reports_view",
        "reports_generate",
        "notifications_view",
      ],
      bank_transaction_type: ["deposit", "withdrawal"],
      bulk_payroll_item_status: ["pending", "processed", "failed"],
      bulk_payroll_status: ["draft", "processing", "completed", "failed"],
      client_status: ["active", "inactive"],
      employment_type: ["full-time", "part-time", "casual"],
      notification_action_type: [
        "approve",
        "confirm",
        "grant",
        "cancel",
        "reject",
        "none",
      ],
      notification_priority: ["low", "medium", "high"],
      payroll_status: ["pending", "approved", "paid"],
      project_status: ["active", "completed", "on-hold"],
      roster_status: ["pending", "confirmed", "cancelled"],
      transaction_category: [
        "income",
        "expense",
        "transfer",
        "salary",
        "equipment",
        "materials",
        "travel",
        "office",
        "utilities",
        "marketing",
        "other",
        "opening_balance",
      ],
      user_role: [
        "admin",
        "employee",
        "accountant",
        "operation",
        "sales_manager",
      ],
      working_hours_status: ["pending", "approved", "rejected", "paid"],
    },
  },
} as const
