/**
 * Represents stat progression for a driver or car part by level
 * Maps level number to stat values for that level
 * Example: { 1: { power: 100 }, 2: { power: 105 }, ... }
 */
export type StatsPerLevel = Record<string, number | Record<string, number>> | null

/**
 * Represents statistics for a boost
 * Contains boost effect values and properties
 */
export type BoostStats = Record<string, number | string | boolean> | null

/**
 * Array of driver IDs for track guides
 */
export type SuggestedDriverIds = string[] | null

/**
 * Array of boost IDs for track guides
 */
export type SuggestedBoostIds = string[] | null

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
          is_active: boolean
          active_season_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          username?: string | null
          is_admin?: boolean
          is_active?: boolean
          active_season_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          username?: string | null
          is_admin?: boolean
          is_active?: boolean
          active_season_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      boosts: {
        Row: {
          id: string
          name: string
          icon: string | null
          boost_stats: BoostStats
          is_free: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          icon?: string | null
          boost_stats?: BoostStats
          is_free?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          icon?: string | null
          boost_stats?: BoostStats
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
          stats_per_level: StatsPerLevel
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
          stats_per_level?: StatsPerLevel
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
          stats_per_level?: StatsPerLevel
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
          stats_per_level: StatsPerLevel
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
          stats_per_level?: StatsPerLevel
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
          stats_per_level?: StatsPerLevel
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
          created_at?: string
          updated_at?: string
        }
      }
      user_track_guides: {
        Row: {
          id: string
          user_id: string
          track_id: string
          season_id: string | null
          gp_level: number
          suggested_drivers: SuggestedDriverIds
          free_boost_id: string | null
          suggested_boosts: SuggestedBoostIds
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
          alt_driver_ids: SuggestedDriverIds
          alt_boost_ids: SuggestedBoostIds
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          track_id: string
          season_id?: string | null
          gp_level: number
          suggested_drivers?: SuggestedDriverIds
          free_boost_id?: string | null
          suggested_boosts?: SuggestedBoostIds
          saved_setup_id?: string | null
          setup_notes?: string | null
          dry_strategy?: string | null
          wet_strategy?: string | null
          driver_1_dry_strategy?: string | null
          driver_1_wet_strategy?: string | null
          driver_2_dry_strategy?: string | null
          driver_2_wet_strategy?: string | null
          notes?: string | null
          driver_1_id?: string | null
          driver_2_id?: string | null
          driver_1_boost_id?: string | null
          driver_2_boost_id?: string | null
          alt_driver_ids?: SuggestedDriverIds
          alt_boost_ids?: SuggestedBoostIds
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          track_id?: string
          season_id?: string | null
          gp_level?: number
          suggested_drivers?: SuggestedDriverIds
          free_boost_id?: string | null
          suggested_boosts?: SuggestedBoostIds
          saved_setup_id?: string | null
          setup_notes?: string | null
          dry_strategy?: string | null
          wet_strategy?: string | null
          driver_1_dry_strategy?: string | null
          driver_1_wet_strategy?: string | null
          driver_2_dry_strategy?: string | null
          driver_2_wet_strategy?: string | null
          notes?: string | null
          driver_1_id?: string | null
          driver_2_id?: string | null
          driver_1_boost_id?: string | null
          driver_2_boost_id?: string | null
          alt_driver_ids?: SuggestedDriverIds
          alt_boost_ids?: SuggestedBoostIds
          created_at?: string
          updated_at?: string
        }
      }
      user_gp_guides: {
        Row: {
          id: string
          user_id: string
          name: string
          start_date: string | null
          gp_level: number
          notes: string | null
          weekend_strategy_same: boolean
          season_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          start_date?: string | null
          gp_level: number
          notes?: string | null
          weekend_strategy_same?: boolean
          season_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          start_date?: string | null
          gp_level?: number
          notes?: string | null
          weekend_strategy_same?: boolean
          season_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_gp_guide_tracks: {
        Row: {
          id: string
          gp_guide_id: string
          track_id: string | null
          race_number: number
          race_type: 'qualifying' | 'opening' | 'final'
          is_wet: boolean
          is_ready: boolean
          driver_1_id: string | null
          driver_2_id: string | null
          driver_1_boost_id: string | null
          driver_2_boost_id: string | null
          alt_driver_ids: string[] | null
          alt_boost_ids: string[] | null
          saved_setup_id: string | null
          setup_notes: string | null
          driver_1_tire_strategy: string | null
          driver_2_tire_strategy: string | null
          strategy_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          gp_guide_id: string
          track_id?: string | null
          race_number: number
          race_type: 'qualifying' | 'opening' | 'final'
          is_wet?: boolean
          is_ready?: boolean
          driver_1_id?: string | null
          driver_2_id?: string | null
          driver_1_boost_id?: string | null
          driver_2_boost_id?: string | null
          alt_driver_ids?: string[] | null
          alt_boost_ids?: string[] | null
          saved_setup_id?: string | null
          setup_notes?: string | null
          driver_1_tire_strategy?: string | null
          driver_2_tire_strategy?: string | null
          strategy_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          gp_guide_id?: string
          track_id?: string | null
          race_number?: number
          race_type?: 'qualifying' | 'opening' | 'final'
          is_wet?: boolean
          is_ready?: boolean
          driver_1_id?: string | null
          driver_2_id?: string | null
          driver_1_boost_id?: string | null
          driver_2_boost_id?: string | null
          alt_driver_ids?: string[] | null
          alt_boost_ids?: string[] | null
          saved_setup_id?: string | null
          setup_notes?: string | null
          driver_1_tire_strategy?: string | null
          driver_2_tire_strategy?: string | null
          strategy_notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_gp_guide_results: {
        Row: {
          id: string
          gp_guide_id: string
          track_id: string
          results_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          gp_guide_id: string
          track_id: string
          results_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          gp_guide_id?: string
          track_id?: string
          results_notes?: string | null
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
      ai_track_loadouts: {
        Row: {
          id: string
          name: string
          track_name: string
          difficulty: string
          team_name: string
          driver_slot: number
          overtaking: number
          blocking: number
          qualifying: number
          tyre_use: number
          race_start: number
          car_parts: Record<string, any> | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          track_name: string
          difficulty: string
          team_name: string
          driver_slot: number
          overtaking?: number
          blocking?: number
          qualifying?: number
          tyre_use?: number
          race_start?: number
          car_parts?: Record<string, any> | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          track_name?: string
          difficulty?: string
          team_name?: string
          driver_slot?: number
          overtaking?: number
          blocking?: number
          qualifying?: number
          tyre_use?: number
          race_start?: number
          car_parts?: Record<string, any> | null
          created_at?: string
          updated_at?: string
        }
      }
      team_driver_names: {
        Row: {
          id: string
          team_name: string
          driver_slot: number
          driver_name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          team_name: string
          driver_slot: number
          driver_name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          team_name?: string
          driver_slot?: number
          driver_name?: string
          created_at?: string
          updated_at?: string
        }
      }
      user_custom_drivers: {
        Row: {
          id: string
          user_id: string
          name: string
          overtaking: number
          blocking: number
          qualifying: number
          tyre_use: number
          race_start: number
          car_parts: Record<string, any> | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          overtaking?: number
          blocking?: number
          qualifying?: number
          tyre_use?: number
          race_start?: number
          car_parts?: Record<string, any> | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          overtaking?: number
          blocking?: number
          qualifying?: number
          tyre_use?: number
          race_start?: number
          car_parts?: Record<string, any> | null
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
export type UserGpGuide = Tables<'user_gp_guides'>
export type UserGpGuideTrack = Tables<'user_gp_guide_tracks'>
export type UserGpGuideResult = Tables<'user_gp_guide_results'>
export type AITrackLoadout = Tables<'ai_track_loadouts'>
export type TeamDriverName = Tables<'team_driver_names'>
export type UserCustomDriver = Tables<'user_custom_drivers'>

// Track info as stored in series_data.track_info
export interface SeriesTrackInfo {
  name: string
  laps: number
  driverStat: string
  carStat: string
}

// Series data type (from series_data table)
export interface SeriesData {
  index: number
  entry_fee: number
  win_flags: number
  loss_flags: number
  win_rep: number
  flags_to_unlock: number
  max_flags: number
  track_ids: string[]
  track_names: string[]
  track_info?: SeriesTrackInfo[]
  bot_loadout: Record<string, any> | null
  ai_car_loadouts: Record<string, any> | null
  created_at: string
  updated_at: string
}

// Series with track info for display
export interface SeriesWithTracks extends Omit<SeriesData, 'track_ids' | 'track_names' | 'track_info'> {
  tracks: SeriesTrack[]
  track_names: string[]
  track_info?: SeriesTrackInfo[]
  common_track_stat: string | null
}

export interface SeriesTrack {
  id: string
  name: string
  display_name: string | null
  laps: number
  driver_track_stat: string
  car_track_stat: string
}

// Business logic types
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
  // Collection fields attached by API
  collection_theme?: string | null
  collection_ordinal?: number | null

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
  collection_theme?: string | null
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
  card_count: number // Alias for count (kept for backward compatibility)
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
  season_id: string | null
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

// Deprecated types - kept for backward compatibility with old components
// These types were from the old catalog_items table which has been removed
export interface CatalogItem {
  id: string
  name: string
  rarity: number
  series: number
  card_type: number // 0 = car part, 1 = driver
  stats_per_level: StatsPerLevel
  // Additional properties used by old components
  icon: string | null
  cc_price: number | null
  num_duplicates_after_unlock: number | null
  collection_id: string | null
  visual_override: string | null
  collection_sub_name: string | null
  collection_theme: string | null
  tag_name: string | null
  min_gp_tier: number | null
  ordinal: number | null
  car_part_type: number | null
  season_id: string | null
}

export interface UserAssetView extends CatalogItem {
  level: number
  card_count: number
  is_owned: boolean
}
