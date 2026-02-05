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
          boost_stats: any | null
          is_free: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          icon?: string | null
          boost_stats?: any | null
          is_free?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          icon?: string | null
          boost_stats?: any | null
          is_free?: boolean
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
          count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          boost_id: string
          level?: number
          count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          boost_id?: string
          level?: number
          count?: number
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
          card_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          driver_id: string
          level?: number
          card_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          driver_id?: string
          level?: number
          card_count?: number
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
          card_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          car_part_id: string
          level?: number
          card_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          car_part_id?: string
          level?: number
          card_count?: number
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
      tracks: {
        Row: {
          id: string
          name: string
          alt_name: string | null
          laps: number
          driver_track_stat: string
          car_track_stat: string
          season_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          alt_name?: string | null
          laps: number
          driver_track_stat: string
          car_track_stat: string
          season_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          alt_name?: string | null
          laps?: number
          driver_track_stat?: string
          car_track_stat?: string
          season_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      user_track_guides: {
        Row: {
          id: string
          user_id: string
          track_id: string
          gp_level: number
          suggested_drivers: any | null
          free_boost_id: string | null
          suggested_boosts: any | null
          saved_setup_id: string | null
          setup_notes: string | null
          dry_strategy: string | null
          wet_strategy: string | null
          driver_1_dry_strategy: string | null
          driver_1_wet_strategy: string | null
          driver_2_dry_strategy: string | null
          driver_2_wet_strategy: string | null
          notes: string | null
          driver_1_id: string | null
          driver_2_id: string | null
          driver_1_boost_id: string | null
          driver_2_boost_id: string | null
          alt_driver_ids: any | null
          alt_boost_ids: any | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          track_id: string
          gp_level: number
          suggested_drivers?: any | null
          free_boost_id?: string | null
          suggested_boosts?: any | null
          saved_setup_id?: string | null
          setup_notes?: string | null
          dry_strategy?: string | null
          wet_strategy?: string | null
          notes?: string | null
          driver_1_id?: string | null
          driver_2_id?: string | null
          driver_1_boost_id?: string | null
          driver_2_boost_id?: string | null
          alt_driver_ids?: any | null
          alt_boost_ids?: any | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          track_id?: string
          gp_level?: number
          suggested_drivers?: any | null
          free_boost_id?: string | null
          suggested_boosts?: any | null
          saved_setup_id?: string | null
          setup_notes?: string | null
          dry_strategy?: string | null
          wet_strategy?: string | null
          notes?: string | null
          driver_1_id?: string | null
          driver_2_id?: string | null
          driver_1_boost_id?: string | null
          driver_2_boost_id?: string | null
          alt_driver_ids?: any | null
          alt_boost_ids?: any | null
          created_at?: string
          updated_at?: string
        }
      }
      user_track_guide_drivers: {
        Row: {
          id: string
          track_guide_id: string
          driver_id: string
          recommended_boost_id: string | null
          track_strategy: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          track_guide_id: string
          driver_id: string
          recommended_boost_id?: string | null
          track_strategy?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          track_guide_id?: string
          driver_id?: string
          recommended_boost_id?: string | null
          track_strategy?: string | null
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
export type Track = Tables<'tracks'>
export type UserTrackGuide = Tables<'user_track_guides'> & {
  alternate_driver_ids?: string[]
}
export type UserTrackGuideDriver = Tables<'user_track_guide_drivers'>

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
  card_count: number
  is_owned: boolean // derived: level > 0 || card_count > 0
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
  card_count: number
  is_owned: boolean // derived: level > 0 || card_count > 0
}

export interface BoostView {
  // From boosts
  id: string
  name: string
  icon: string | null
  boost_stats: any | null
  is_free: boolean

  // From boost_custom_names (optional custom override)
  boost_custom_names?: {
    custom_name?: string | null
  }

  // From user_boosts (or defaults if not owned)
  level: number
  count: number
  is_owned: boolean // derived: level > 0
}

// Extended Boost type for API responses that include custom names from left join
export interface BoostWithCustomName extends Tables<'boosts'> {
  custom_name?: string | null
}

// User Car Setup types
export interface UserCarSetup {
  id: string
  user_id: string
  name: string
  notes?: string | null
  brake_id: string | null
  gearbox_id: string | null
  rear_wing_id: string | null
  front_wing_id: string | null
  suspension_id: string | null
  engine_id: string | null
  series_filter: number
  bonus_percentage: number
  created_at: string
  updated_at: string
}

export interface UserCarSetupWithParts extends UserCarSetup {
  brake?: CarPartView
  gearbox?: CarPartView
  rear_wing?: CarPartView
  front_wing?: CarPartView
  suspension?: CarPartView
  engine?: CarPartView
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
