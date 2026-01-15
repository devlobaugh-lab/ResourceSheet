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
      drivers: {
        Row: {
          id: string
          name: string
          rarity: number
          series: number
          season_id: string | null
          icon: string | null
          cc_price: number | null
          num_duplicates_after_unlock: number | null
          collection_id: string | null
          visual_override: string | null
          collection_sub_name: string | null
          min_gp_tier: number | null
          tag_name: string | null
          ordinal: number | null
          stats_per_level: any | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          rarity: number
          series: number
          season_id?: string | null
          icon?: string | null
          cc_price?: number | null
          num_duplicates_after_unlock?: number | null
          collection_id?: string | null
          visual_override?: string | null
          collection_sub_name?: string | null
          min_gp_tier?: number | null
          tag_name?: string | null
          ordinal?: number | null
          stats_per_level?: any | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          rarity?: number
          series?: number
          season_id?: string | null
          icon?: string | null
          cc_price?: number | null
          num_duplicates_after_unlock?: number | null
          collection_id?: string | null
          visual_override?: string | null
          collection_sub_name?: string | null
          min_gp_tier?: number | null
          tag_name?: string | null
          ordinal?: number | null
          stats_per_level?: any | null
          created_at?: string
          updated_at?: string
        }
      }
      car_parts: {
        Row: {
          id: string
          name: string
          rarity: number
          series: number
          season_id: string | null
          icon: string | null
          cc_price: number | null
          num_duplicates_after_unlock: number | null
          collection_id: string | null
          visual_override: string | null
          collection_sub_name: string | null
          car_part_type: number
          stats_per_level: any | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          rarity: number
          series: number
          season_id?: string | null
          icon?: string | null
          cc_price?: number | null
          num_duplicates_after_unlock?: number | null
          collection_id?: string | null
          visual_override?: string | null
          collection_sub_name?: string | null
          car_part_type: number
          stats_per_level?: any | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          rarity?: number
          series?: number
          season_id?: string | null
          icon?: string | null
          cc_price?: number | null
          num_duplicates_after_unlock?: number | null
          collection_id?: string | null
          visual_override?: string | null
          collection_sub_name?: string | null
          car_part_type?: number
          stats_per_level?: any | null
          created_at?: string
          updated_at?: string
        }
      }
      user_drivers: {
        Row: {
          id: string
          user_id: string
          driver_id: string
          level: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          driver_id: string
          level?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          driver_id?: string
          level?: number
          created_at?: string
          updated_at?: string
        }
      }
      user_car_parts: {
        Row: {
          id: string
          user_id: string
          car_part_id: string
          level: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          car_part_id: string
          level?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          car_part_id?: string
          level?: number
          created_at?: string
          updated_at?: string
        }
      }
      boost_custom_names: {
        Row: {
          id: string
          boost_id: string
          custom_name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          boost_id: string
          custom_name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          boost_id?: string
          custom_name?: string
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
export type BoostCustomName = Tables<'boost_custom_names'>
export type UserBoost = Tables<'user_boosts'>
export type Driver = Tables<'drivers'>
export type CarPart = Tables<'car_parts'>
export type UserDriver = Tables<'user_drivers'>
export type UserCarPart = Tables<'user_car_parts'>

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

// New specific asset types
export interface DriverView {
  // From drivers
  id: string
  name: string
  rarity: number
  series: number
  icon: string | null
  cc_price: number | null
  num_duplicates_after_unlock: number | null
  collection_id: string | null
  visual_override: string | null
  collection_sub_name: string | null
  min_gp_tier: number | null
  tag_name: string | null
  ordinal: number | null
  stats_per_level: any | null

  // From user_drivers (or defaults if not owned)
  level: number
  is_owned: boolean // derived: level > 0
}

export interface CarPartView {
  // From car_parts
  id: string
  name: string
  rarity: number
  series: number
  icon: string | null
  cc_price: number | null
  num_duplicates_after_unlock: number | null
  collection_id: string | null
  visual_override: string | null
  collection_sub_name: string | null
  car_part_type: number
  stats_per_level: any | null

  // From user_car_parts (or defaults if not owned)
  level: number
  is_owned: boolean // derived: level > 0
}

export interface BoostView {
  // From boosts
  id: string
  name: string
  icon: string | null
  boost_type: string
  rarity: number
  boost_stats: any | null
  series: number | null

  // From boost_custom_names (optional custom override)
  custom_name?: string | null

  // From user_boosts (or defaults if not owned)
  level: number
  is_owned: boolean // derived: level > 0
}

// Extended Boost type for API responses that include custom names from left join
export interface BoostWithCustomName extends Tables<'boosts'> {
  custom_name?: string | null
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
