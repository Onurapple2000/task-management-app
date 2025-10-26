import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://epvoyacpattukyawoqhp.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwdm95YWNwYXR0dWt5YXdvcWhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5NTg0MDMsImV4cCI6MjA3MjUzNDQwM30.jJbq0w4NEJ6ztXIUn2eFx-dk4nihy-_XokONhGtbzsc'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
          surname: string
          created_at: string
        }
        Insert: {
          id: string
          name: string
          surname: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          surname?: string
          created_at?: string
        }
      }
      sprints: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          subject: string
          description: string | null
          status: 'Open' | 'Working' | 'Completed'
          parent_task_id: string | null
          estimated_hour: number
          sprint_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          subject: string
          description?: string | null
          status?: 'Open' | 'Working' | 'Completed'
          parent_task_id?: string | null
          estimated_hour: number
          sprint_id?: string | null
          assignee_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          subject?: string
          description?: string | null
          status?: 'Open' | 'Working' | 'Completed'
          parent_task_id?: string | null
          estimated_hour?: number
          sprint_id?: string | null
          assignee_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}


