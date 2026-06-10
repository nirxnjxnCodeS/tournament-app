// Auto-generate the real version with:
//   npx supabase gen types typescript --project-id <your-project-id> > lib/database.types.ts
//
// This stub keeps TypeScript happy until you've run the generator.
// Replace it entirely once you have a real Supabase project.

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export type Database = {
  public: {
    Tables: {
      players: {
        Row: {
          id: string
          name: string
          badge_url: string | null
          primary_color: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          badge_url?: string | null
          primary_color?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          badge_url?: string | null
          primary_color?: string
          created_at?: string
        }
        Relationships: []
      }
      admin_config: {
        Row: {
          id: number
          tournament_stage: 'setup' | 'league' | 'knockouts' | 'completed'
        }
        Insert: {
          id?: number
          tournament_stage?: 'setup' | 'league' | 'knockouts' | 'completed'
        }
        Update: {
          id?: number
          tournament_stage?: 'setup' | 'league' | 'knockouts' | 'completed'
        }
        Relationships: []
      }
      matches: {
        Row: {
          id: string
          player_a: string
          player_b: string
          score_a: number | null
          score_b: number | null
          stage: 'league' | 'sf1' | 'sf2' | 'final'
          status: 'pending' | 'played' | 'walkover'
          walkover_winner: string | null
          played_at: string | null
          created_at: string
          matchday_number: number | null
        }
        Insert: {
          id?: string
          player_a: string
          player_b: string
          score_a?: number | null
          score_b?: number | null
          stage?: 'league' | 'sf1' | 'sf2' | 'final'
          status?: 'pending' | 'played' | 'walkover'
          walkover_winner?: string | null
          played_at?: string | null
          created_at?: string
          matchday_number?: number | null
        }
        Update: {
          id?: string
          player_a?: string
          player_b?: string
          score_a?: number | null
          score_b?: number | null
          stage?: 'league' | 'sf1' | 'sf2' | 'final'
          status?: 'pending' | 'played' | 'walkover'
          walkover_winner?: string | null
          played_at?: string | null
          created_at?: string
          matchday_number?: number | null
        }
        Relationships: []
      }
      bracket_seeding: {
        Row: {
          id: number
          seed_1: string | null
          seed_2: string | null
          seed_3: string | null
          seed_4: string | null
          seeded_at: string | null
        }
        Insert: {
          id?: number
          seed_1?: string | null
          seed_2?: string | null
          seed_3?: string | null
          seed_4?: string | null
          seeded_at?: string | null
        }
        Update: {
          id?: number
          seed_1?: string | null
          seed_2?: string | null
          seed_3?: string | null
          seed_4?: string | null
          seeded_at?: string | null
        }
        Relationships: []
      }
      tournament_settings: {
        Row: {
          id: number
          league_match_duration: number
          semi_match_duration: number
          final_match_duration: number
        }
        Insert: {
          id?: number
          league_match_duration?: number
          semi_match_duration?: number
          final_match_duration?: number
        }
        Update: {
          id?: number
          league_match_duration?: number
          semi_match_duration?: number
          final_match_duration?: number
        }
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}
