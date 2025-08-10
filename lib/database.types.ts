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
      budget_entries: {
        Row: {
          actual_amount: number | null
          budgeted_amount: number
          category: string
          created_at: string | null
          description: string | null
          id: string
          updated_at: string | null
          week_end: string
          week_start: string
        }
        Insert: {
          actual_amount?: number | null
          budgeted_amount: number
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          updated_at?: string | null
          week_end: string
          week_start: string
        }
        Update: {
          actual_amount?: number | null
          budgeted_amount?: number
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          updated_at?: string | null
          week_end?: string
          week_start?: string
        }
        Relationships: []
      }
      companies: {
        Row: {
          address: string | null
          contact_person: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          contact_person?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          contact_person?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      components: {
        Row: {
          category: string | null
          created_at: string | null
          current_stock: number | null
          description: string | null
          id: string
          minimum_stock: number | null
          name: string
          reorder_level: number | null
          sku: string
          supplier: string | null
          unit_cost: number | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          current_stock?: number | null
          description?: string | null
          id?: string
          minimum_stock?: number | null
          name: string
          reorder_level?: number | null
          sku: string
          supplier?: string | null
          unit_cost?: number | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          current_stock?: number | null
          description?: string | null
          id?: string
          minimum_stock?: number | null
          name?: string
          reorder_level?: number | null
          sku?: string
          supplier?: string | null
          unit_cost?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      repair_components: {
        Row: {
          component_id: string | null
          cost_per_unit: number | null
          created_at: string | null
          id: string
          notes: string | null
          quantity_needed: number
          quantity_used: number | null
          repair_id: string | null
          total_cost: number | null
        }
        Insert: {
          component_id?: string | null
          cost_per_unit?: number | null
          created_at?: string | null
          id?: string
          notes?: string | null
          quantity_needed?: number
          quantity_used?: number | null
          repair_id?: string | null
        }
        Update: {
          component_id?: string | null
          cost_per_unit?: number | null
          created_at?: string | null
          id?: string
          notes?: string | null
          quantity_needed?: number
          quantity_used?: number | null
          repair_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "repair_components_component_id_fkey"
            columns: ["component_id"]
            isOneToOne: false
            referencedRelation: "components"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "repair_components_repair_id_fkey"
            columns: ["repair_id"]
            isOneToOne: false
            referencedRelation: "repairs"
            referencedColumns: ["id"]
          },
        ]
      }
      repairs: {
        Row: {
          actual_completion: string | null
          assigned_technician: string | null
          created_at: string | null
          customer_name: string | null
          device_model: string | null
          estimated_completion: string | null
          id: string
          issue_description: string
          labor_cost: number | null
          notes: string | null
          parts_cost: number | null
          priority: Database["public"]["Enums"]["repair_priority"] | null
          repair_id: string
          start_date: string | null
          status: Database["public"]["Enums"]["status_type"] | null
          total_cost: number | null
          updated_at: string | null
        }
        Insert: {
          actual_completion?: string | null
          assigned_technician?: string | null
          created_at?: string | null
          customer_name?: string | null
          device_model?: string | null
          estimated_completion?: string | null
          id?: string
          issue_description: string
          labor_cost?: number | null
          notes?: string | null
          parts_cost?: number | null
          priority?: Database["public"]["Enums"]["repair_priority"] | null
          repair_id: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["status_type"] | null
          updated_at?: string | null
        }
        Update: {
          actual_completion?: string | null
          assigned_technician?: string | null
          created_at?: string | null
          customer_name?: string | null
          device_model?: string | null
          estimated_completion?: string | null
          id?: string
          issue_description?: string
          labor_cost?: number | null
          notes?: string | null
          parts_cost?: number | null
          priority?: Database["public"]["Enums"]["repair_priority"] | null
          repair_id?: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["status_type"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      returns: {
        Row: {
          company_id: string | null
          created_at: string | null
          id: string
          notes: string | null
          reason: string | null
          return_date: string
          return_id: string
          status: Database["public"]["Enums"]["status_type"] | null
          total_items: number | null
          total_value: number | null
          updated_at: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          reason?: string | null
          return_date: string
          return_id: string
          status?: Database["public"]["Enums"]["status_type"] | null
          total_items?: number | null
          total_value?: number | null
          updated_at?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          reason?: string | null
          return_date?: string
          return_id?: string
          status?: Database["public"]["Enums"]["status_type"] | null
          total_items?: number | null
          total_value?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "returns_company_id_fkey"
            columns:
