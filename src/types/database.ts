export interface Database {
  public: {
    Tables: {
      seasons: {
        Row: {
          id: string
          name: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string | null
          username: string | null
          is_admin: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          username?: string | null
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          username?: string | null
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      catalog_items: {
        Row: {
          id: string
          name: string
          card_type: number // 0 = car part, 1 = driver
          rarity: number
          series: number
          season_id: string | null
          icon: string | null
          cc_price: number | null
          num_duplicates_after_unlock: number | null
          collection_id: string | null
          visual_override: string | null
          collection_sub_name: string | null
          car_part_type: number | null
          tag_name: string | null
          ordinal: number | null
          min_gp_tier: number | null
          stats_per_level: any | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          card_type: number
          rarity: number
          series: number
          season_id?: string | null
          icon?: string | null
          cc_price?: number | null
          num_duplicates_after_unlock?: number | null
          collection_id?: string | null
          visual_override?: string | null
          collection_sub_name?: string | null
          car_part_type?: number | null
          tag_name?: string | null
          ordinal?: number | null
          min_gp_tier?: number | null
          stats_per_level?: any | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          card_type?: number
          rarity?: number
          series?: number
          season_id?: string | null
          icon?: string | null
          cc_price?: number | null
          num_duplicates_after_unlock?: number | null
          collection_id?: string | null
          visual_override?: string | null
          collection_sub_name?: string | null
          car_part_type?: number | null
          tag_name?: string | null
          ordinal?: number | null
          min_gp_tier?: number | null
          stats_per_level?: any | null
          created_at?: string
          updated_at?: string
        }
      }
      user_items: {
        Row: {
          id: string
          user_id: string
          catalog_item_id: string
          level: number
          card_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          catalog_item_id: string
          level?: number
          card_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          catalog_item_id?: string
          level?: number
          card_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      boosts: {
        Row: {
          id: string
          name: string
          icon: string | null
          boost_type: string
          rarity: number
          boost_stats: any | null
          series: number | null
          season_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          icon?: string | null
          boost_type: string
          rarity: number
          boost_stats?: any | null
          series?: number | null
          season_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          icon?: string | null
          boost_type?: string
          rarity?: number
          boost_stats?: any | null
          series?: number | null
          season_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_boosts: {
        Row: {
          id: string
          user_id: string
          boost_id: string
          level: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          boost_id: string
          level?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          boost_id?: string
          level?: number
          created_at?: string
          updated_at?: string
        }
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

// Utility types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Specific table types
export type Season = Tables<'seasons'>
export type Profile = Tables<'profiles'>
export type CatalogItem = Tables<'catalog_items'>
export type UserItem = Tables<'user_items'>
export type Boost = Tables<'boosts'>
export type UserBoost = Tables<'user_boosts'>

// Business logic types
export interface UserAssetView {
  // From catalog_items
  id: string
  name: string
  card_type: number
  rarity: number
  series: number
  icon: string | null
  cc_price: number | null
  car_part_type: number | null
  stats_per_level: any | null
  tag_name: string | null
  collection_id: string | null
  visual_override: string | null
  collection_sub_name: string | null
  ordinal: number | null
  min_gp_tier: number | null
  num_duplicates_after_unlock: number | null
  
  // From user_items (or defaults if not owned)
  level: number
  card_count: number
  is_owned: boolean // derived: level > 0 || card_count > 0
}

export interface StatLevel {
  speed: number
  cornering: number
  powerUnit: number
  qualifying: number
  drs: number
  pitStopTime: number
  cardsToUpgrade: number
  softCurrencyToUpgrade: number
}
