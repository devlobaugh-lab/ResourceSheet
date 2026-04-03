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
      ai_track_loadouts: {
        Row: {
          blocking: number | null
          car_parts: Json | null
          created_at: string | null
          difficulty: string
          driver_slot: number
          id: string
          name: string
          overtaking: number | null
          qualifying: number | null
          race_start: number | null
          season_id: string | null
          team_name: string
          track_name: string
          tyre_use: number | null
          updated_at: string | null
        }
        Insert: {
          blocking?: number | null
          car_parts?: Json | null
          created_at?: string | null
          difficulty: string
          driver_slot: number
          id?: string
          name: string
          overtaking?: number | null
          qualifying?: number | null
          race_start?: number | null
          season_id?: string | null
          team_name: string
          track_name: string
          tyre_use?: number | null
          updated_at?: string | null
        }
        Update: {
          blocking?: number | null
          car_parts?: Json | null
          created_at?: string | null
          difficulty?: string
          driver_slot?: number
          id?: string
          name?: string
          overtaking?: number | null
          qualifying?: number | null
          race_start?: number | null
          season_id?: string | null
          team_name?: string
          track_name?: string
          tyre_use?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_track_loadouts_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      boost_icon_data: {
        Row: {
          created_at: string | null
          custom_name: string | null
          icon_name: string
          id: string
          is_free: boolean
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          custom_name?: string | null
          icon_name: string
          id?: string
          is_free?: boolean
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          custom_name?: string | null
          icon_name?: string
          id?: string
          is_free?: boolean
          updated_at?: string | null
        }
        Relationships: []
      }
      boosts: {
        Row: {
          boost_stats: Json | null
          created_at: string
          icon: string | null
          id: string
          name: string
          season_id: string | null
          series: number | null
          updated_at: string
        }
        Insert: {
          boost_stats?: Json | null
          created_at?: string
          icon?: string | null
          id?: string
          name: string
          season_id?: string | null
          series?: number | null
          updated_at?: string
        }
        Update: {
          boost_stats?: Json | null
          created_at?: string
          icon?: string | null
          id?: string
          name?: string
          season_id?: string | null
          series?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "boosts_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      car_parts: {
        Row: {
          car_part_type: number
          cc_price: number | null
          collection_id: string | null
          collection_sub_name: string | null
          created_at: string
          icon: string | null
          id: string
          name: string
          num_duplicates_after_unlock: number | null
          rarity: number
          season_id: string | null
          series: number
          stats_per_level: Json
          updated_at: string
          visual_override: string | null
        }
        Insert: {
          car_part_type: number
          cc_price?: number | null
          collection_id?: string | null
          collection_sub_name?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          name: string
          num_duplicates_after_unlock?: number | null
          rarity: number
          season_id?: string | null
          series: number
          stats_per_level: Json
          updated_at?: string
          visual_override?: string | null
        }
        Update: {
          car_part_type?: number
          cc_price?: number | null
          collection_id?: string | null
          collection_sub_name?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          name?: string
          num_duplicates_after_unlock?: number | null
          rarity?: number
          season_id?: string | null
          series?: number
          stats_per_level?: Json
          updated_at?: string
          visual_override?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "car_parts_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      collections: {
        Row: {
          created_at: string
          id: string
          internal_name: string | null
          metadata: Json | null
          name: string | null
          ordinal: number | null
          season: number | null
          theme: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          internal_name?: string | null
          metadata?: Json | null
          name?: string | null
          ordinal?: number | null
          season?: number | null
          theme?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          internal_name?: string | null
          metadata?: Json | null
          name?: string | null
          ordinal?: number | null
          season?: number | null
          theme?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      drivers: {
        Row: {
          cc_price: number | null
          collection_id: string | null
          collection_sub_name: string | null
          created_at: string
          icon: string | null
          id: string
          min_gp_tier: number | null
          name: string
          num_duplicates_after_unlock: number | null
          ordinal: number | null
          rarity: number
          season_id: string | null
          series: number
          stats_per_level: Json
          tag_name: string | null
          updated_at: string
          visual_override: string | null
        }
        Insert: {
          cc_price?: number | null
          collection_id?: string | null
          collection_sub_name?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          min_gp_tier?: number | null
          name: string
          num_duplicates_after_unlock?: number | null
          ordinal?: number | null
          rarity: number
          season_id?: string | null
          series: number
          stats_per_level: Json
          tag_name?: string | null
          updated_at?: string
          visual_override?: string | null
        }
        Update: {
          cc_price?: number | null
          collection_id?: string | null
          collection_sub_name?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          min_gp_tier?: number | null
          name?: string
          num_duplicates_after_unlock?: number | null
          ordinal?: number | null
          rarity?: number
          season_id?: string | null
          series?: number
          stats_per_level?: Json
          tag_name?: string | null
          updated_at?: string
          visual_override?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "drivers_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          active_season_id: string | null
          created_at: string
          email: string | null
          id: string
          is_active: boolean | null
          is_admin: boolean | null
          updated_at: string
          username: string | null
        }
        Insert: {
          active_season_id?: string | null
          created_at?: string
          email?: string | null
          id: string
          is_active?: boolean | null
          is_admin?: boolean | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          active_season_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          is_admin?: boolean | null
          updated_at?: string
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_active_season_id_fkey"
            columns: ["active_season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      seasons: {
        Row: {
          activated_at: string | null
          content_cache_loaded: boolean
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          start_date: string | null
          updated_at: string
        }
        Insert: {
          activated_at?: string | null
          content_cache_loaded?: boolean
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          start_date?: string | null
          updated_at?: string
        }
        Update: {
          activated_at?: string | null
          content_cache_loaded?: boolean
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          start_date?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      series_data: {
        Row: {
          ai_car_loadouts: Json | null
          bot_loadout: Json | null
          created_at: string | null
          entry_fee: number | null
          flags_to_unlock: number | null
          id: string
          index: number
          loss_flags: number | null
          max_flags: number | null
          season_id: string | null
          track_ids: string[] | null
          track_info: Json | null
          track_names: string[] | null
          updated_at: string | null
          win_flags: number | null
          win_rep: number | null
        }
        Insert: {
          ai_car_loadouts?: Json | null
          bot_loadout?: Json | null
          created_at?: string | null
          entry_fee?: number | null
          flags_to_unlock?: number | null
          id?: string
          index: number
          loss_flags?: number | null
          max_flags?: number | null
          season_id?: string | null
          track_ids?: string[] | null
          track_info?: Json | null
          track_names?: string[] | null
          updated_at?: string | null
          win_flags?: number | null
          win_rep?: number | null
        }
        Update: {
          ai_car_loadouts?: Json | null
          bot_loadout?: Json | null
          created_at?: string | null
          entry_fee?: number | null
          flags_to_unlock?: number | null
          id?: string
          index?: number
          loss_flags?: number | null
          max_flags?: number | null
          season_id?: string | null
          track_ids?: string[] | null
          track_info?: Json | null
          track_names?: string[] | null
          updated_at?: string | null
          win_flags?: number | null
          win_rep?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "series_data_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      team_driver_names: {
        Row: {
          created_at: string | null
          driver_name: string
          driver_slot: number
          id: string
          team_name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          driver_name: string
          driver_slot: number
          id?: string
          team_name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          driver_name?: string
          driver_slot?: number
          id?: string
          team_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      track_name_aliases: {
        Row: {
          created_at: string | null
          display_name: string
          id: string
          system_name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          display_name: string
          id?: string
          system_name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          display_name?: string
          id?: string
          system_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      track_seasons: {
        Row: {
          id: string
          is_active: boolean
          season_id: string
          track_id: string
        }
        Insert: {
          id?: string
          is_active?: boolean
          season_id: string
          track_id: string
        }
        Update: {
          id?: string
          is_active?: boolean
          season_id?: string
          track_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "track_seasons_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "track_seasons_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      tracks: {
        Row: {
          car_track_stat: string
          created_at: string
          driver_track_stat: string
          id: string
          laps: number
          name: string
          track_guid: string | null
          updated_at: string
        }
        Insert: {
          car_track_stat: string
          created_at?: string
          driver_track_stat: string
          id?: string
          laps: number
          name: string
          track_guid?: string | null
          updated_at?: string
        }
        Update: {
          car_track_stat?: string
          created_at?: string
          driver_track_stat?: string
          id?: string
          laps?: number
          name?: string
          track_guid?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      tracks_backup: {
        Row: {
          alt_name: string | null
          car_track_stat: string | null
          created_at: string | null
          driver_track_stat: string | null
          id: string | null
          laps: number | null
          name: string | null
          season_id: string | null
          updated_at: string | null
        }
        Insert: {
          alt_name?: string | null
          car_track_stat?: string | null
          created_at?: string | null
          driver_track_stat?: string | null
          id?: string | null
          laps?: number | null
          name?: string | null
          season_id?: string | null
          updated_at?: string | null
        }
        Update: {
          alt_name?: string | null
          car_track_stat?: string | null
          created_at?: string | null
          driver_track_stat?: string | null
          id?: string | null
          laps?: number | null
          name?: string | null
          season_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_boosts: {
        Row: {
          boost_id: string
          count: number | null
          created_at: string
          id: string
          level: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          boost_id: string
          count?: number | null
          created_at?: string
          id?: string
          level?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          boost_id?: string
          count?: number | null
          created_at?: string
          id?: string
          level?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_boosts_boost_id_fkey"
            columns: ["boost_id"]
            isOneToOne: false
            referencedRelation: "boosts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_car_parts: {
        Row: {
          car_part_id: string
          card_count: number | null
          created_at: string
          id: string
          level: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          car_part_id: string
          card_count?: number | null
          created_at?: string
          id?: string
          level?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          car_part_id?: string
          card_count?: number | null
          created_at?: string
          id?: string
          level?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_car_parts_car_part_id_fkey"
            columns: ["car_part_id"]
            isOneToOne: false
            referencedRelation: "car_parts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_car_setups: {
        Row: {
          bonus_percentage: number | null
          brake_id: string | null
          created_at: string
          engine_id: string | null
          front_wing_id: string | null
          gearbox_id: string | null
          id: string
          name: string
          notes: string | null
          rear_wing_id: string | null
          season_id: string | null
          series_filter: number | null
          suspension_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          bonus_percentage?: number | null
          brake_id?: string | null
          created_at?: string
          engine_id?: string | null
          front_wing_id?: string | null
          gearbox_id?: string | null
          id?: string
          name: string
          notes?: string | null
          rear_wing_id?: string | null
          season_id?: string | null
          series_filter?: number | null
          suspension_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          bonus_percentage?: number | null
          brake_id?: string | null
          created_at?: string
          engine_id?: string | null
          front_wing_id?: string | null
          gearbox_id?: string | null
          id?: string
          name?: string
          notes?: string | null
          rear_wing_id?: string | null
          season_id?: string | null
          series_filter?: number | null
          suspension_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_car_setups_brake_id_fkey"
            columns: ["brake_id"]
            isOneToOne: false
            referencedRelation: "car_parts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_car_setups_engine_id_fkey"
            columns: ["engine_id"]
            isOneToOne: false
            referencedRelation: "car_parts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_car_setups_front_wing_id_fkey"
            columns: ["front_wing_id"]
            isOneToOne: false
            referencedRelation: "car_parts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_car_setups_gearbox_id_fkey"
            columns: ["gearbox_id"]
            isOneToOne: false
            referencedRelation: "car_parts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_car_setups_rear_wing_id_fkey"
            columns: ["rear_wing_id"]
            isOneToOne: false
            referencedRelation: "car_parts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_car_setups_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_car_setups_suspension_id_fkey"
            columns: ["suspension_id"]
            isOneToOne: false
            referencedRelation: "car_parts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_custom_drivers: {
        Row: {
          blocking: number | null
          car_parts: Json | null
          created_at: string | null
          id: string
          name: string
          overtaking: number | null
          qualifying: number | null
          race_start: number | null
          season_id: string | null
          tyre_use: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          blocking?: number | null
          car_parts?: Json | null
          created_at?: string | null
          id?: string
          name: string
          overtaking?: number | null
          qualifying?: number | null
          race_start?: number | null
          season_id?: string | null
          tyre_use?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          blocking?: number | null
          car_parts?: Json | null
          created_at?: string | null
          id?: string
          name?: string
          overtaking?: number | null
          qualifying?: number | null
          race_start?: number | null
          season_id?: string | null
          tyre_use?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_custom_drivers_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      user_drivers: {
        Row: {
          card_count: number | null
          created_at: string
          driver_id: string
          id: string
          level: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          card_count?: number | null
          created_at?: string
          driver_id: string
          id?: string
          level?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          card_count?: number | null
          created_at?: string
          driver_id?: string
          id?: string
          level?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_drivers_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
        ]
      }
      user_gp_guide_results: {
        Row: {
          created_at: string | null
          gp_guide_id: string
          id: string
          results_notes: string | null
          track_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          gp_guide_id: string
          id?: string
          results_notes?: string | null
          track_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          gp_guide_id?: string
          id?: string
          results_notes?: string | null
          track_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_gp_guide_results_gp_guide_id_fkey"
            columns: ["gp_guide_id"]
            isOneToOne: false
            referencedRelation: "user_gp_guides"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_gp_guide_results_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      user_gp_guide_tracks: {
        Row: {
          alt_boost_ids: Json | null
          alt_driver_ids: Json | null
          created_at: string | null
          driver_1_boost_id: string | null
          driver_1_id: string | null
          driver_1_tire_strategy: string | null
          driver_2_boost_id: string | null
          driver_2_id: string | null
          driver_2_tire_strategy: string | null
          gp_guide_id: string
          id: string
          is_ready: boolean
          is_wet: boolean
          race_number: number
          race_type: string
          saved_setup_id: string | null
          setup_notes: string | null
          strategy_notes: string | null
          track_id: string | null
          updated_at: string | null
        }
        Insert: {
          alt_boost_ids?: Json | null
          alt_driver_ids?: Json | null
          created_at?: string | null
          driver_1_boost_id?: string | null
          driver_1_id?: string | null
          driver_1_tire_strategy?: string | null
          driver_2_boost_id?: string | null
          driver_2_id?: string | null
          driver_2_tire_strategy?: string | null
          gp_guide_id: string
          id?: string
          is_ready?: boolean
          is_wet?: boolean
          race_number: number
          race_type: string
          saved_setup_id?: string | null
          setup_notes?: string | null
          strategy_notes?: string | null
          track_id?: string | null
          updated_at?: string | null
        }
        Update: {
          alt_boost_ids?: Json | null
          alt_driver_ids?: Json | null
          created_at?: string | null
          driver_1_boost_id?: string | null
          driver_1_id?: string | null
          driver_1_tire_strategy?: string | null
          driver_2_boost_id?: string | null
          driver_2_id?: string | null
          driver_2_tire_strategy?: string | null
          gp_guide_id?: string
          id?: string
          is_ready?: boolean
          is_wet?: boolean
          race_number?: number
          race_type?: string
          saved_setup_id?: string | null
          setup_notes?: string | null
          strategy_notes?: string | null
          track_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_gp_guide_tracks_driver_1_boost_id_fkey"
            columns: ["driver_1_boost_id"]
            isOneToOne: false
            referencedRelation: "boosts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_gp_guide_tracks_driver_1_id_fkey"
            columns: ["driver_1_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_gp_guide_tracks_driver_2_boost_id_fkey"
            columns: ["driver_2_boost_id"]
            isOneToOne: false
            referencedRelation: "boosts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_gp_guide_tracks_driver_2_id_fkey"
            columns: ["driver_2_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_gp_guide_tracks_gp_guide_id_fkey"
            columns: ["gp_guide_id"]
            isOneToOne: false
            referencedRelation: "user_gp_guides"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_gp_guide_tracks_saved_setup_id_fkey"
            columns: ["saved_setup_id"]
            isOneToOne: false
            referencedRelation: "user_car_setups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_gp_guide_tracks_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      user_gp_guides: {
        Row: {
          bonus_car_part_ids: string[]
          bonus_driver_ids: string[]
          bonus_percentage: number
          created_at: string | null
          gp_level: number
          id: string
          is_ready: boolean
          name: string
          notes: string | null
          season_id: string | null
          start_date: string | null
          updated_at: string | null
          user_id: string
          weekend_strategy_same: boolean
        }
        Insert: {
          bonus_car_part_ids?: string[]
          bonus_driver_ids?: string[]
          bonus_percentage?: number
          created_at?: string | null
          gp_level: number
          id?: string
          is_ready?: boolean
          name: string
          notes?: string | null
          season_id?: string | null
          start_date?: string | null
          updated_at?: string | null
          user_id: string
          weekend_strategy_same?: boolean
        }
        Update: {
          bonus_car_part_ids?: string[]
          bonus_driver_ids?: string[]
          bonus_percentage?: number
          created_at?: string | null
          gp_level?: number
          id?: string
          is_ready?: boolean
          name?: string
          notes?: string | null
          season_id?: string | null
          start_date?: string | null
          updated_at?: string | null
          user_id?: string
          weekend_strategy_same?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "user_gp_guides_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_gp_guides_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_track_guide_drivers: {
        Row: {
          created_at: string
          driver_id: string
          id: string
          recommended_boost_id: string | null
          track_guide_id: string
          track_strategy: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          driver_id: string
          id?: string
          recommended_boost_id?: string | null
          track_guide_id: string
          track_strategy?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          driver_id?: string
          id?: string
          recommended_boost_id?: string | null
          track_guide_id?: string
          track_strategy?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_track_guide_drivers_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_track_guide_drivers_recommended_boost_id_fkey"
            columns: ["recommended_boost_id"]
            isOneToOne: false
            referencedRelation: "boosts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_track_guide_drivers_track_guide_id_fkey"
            columns: ["track_guide_id"]
            isOneToOne: false
            referencedRelation: "user_track_guides"
            referencedColumns: ["id"]
          },
        ]
      }
      user_track_guides: {
        Row: {
          alt_boost_ids: Json | null
          alt_driver_ids: Json | null
          created_at: string
          driver_1_boost_id: string | null
          driver_1_dry_strategy: string | null
          driver_1_id: string | null
          driver_1_wet_strategy: string | null
          driver_2_boost_id: string | null
          driver_2_dry_strategy: string | null
          driver_2_id: string | null
          driver_2_wet_strategy: string | null
          dry_strategy: string | null
          free_boost_id: string | null
          gp_level: number
          id: string
          notes: string | null
          saved_setup_id: string | null
          season_id: string | null
          setup_notes: string | null
          suggested_boosts: Json | null
          suggested_drivers: Json | null
          track_id: string
          updated_at: string
          user_id: string
          wet_strategy: string | null
        }
        Insert: {
          alt_boost_ids?: Json | null
          alt_driver_ids?: Json | null
          created_at?: string
          driver_1_boost_id?: string | null
          driver_1_dry_strategy?: string | null
          driver_1_id?: string | null
          driver_1_wet_strategy?: string | null
          driver_2_boost_id?: string | null
          driver_2_dry_strategy?: string | null
          driver_2_id?: string | null
          driver_2_wet_strategy?: string | null
          dry_strategy?: string | null
          free_boost_id?: string | null
          gp_level: number
          id?: string
          notes?: string | null
          saved_setup_id?: string | null
          season_id?: string | null
          setup_notes?: string | null
          suggested_boosts?: Json | null
          suggested_drivers?: Json | null
          track_id: string
          updated_at?: string
          user_id: string
          wet_strategy?: string | null
        }
        Update: {
          alt_boost_ids?: Json | null
          alt_driver_ids?: Json | null
          created_at?: string
          driver_1_boost_id?: string | null
          driver_1_dry_strategy?: string | null
          driver_1_id?: string | null
          driver_1_wet_strategy?: string | null
          driver_2_boost_id?: string | null
          driver_2_dry_strategy?: string | null
          driver_2_id?: string | null
          driver_2_wet_strategy?: string | null
          dry_strategy?: string | null
          free_boost_id?: string | null
          gp_level?: number
          id?: string
          notes?: string | null
          saved_setup_id?: string | null
          season_id?: string | null
          setup_notes?: string | null
          suggested_boosts?: Json | null
          suggested_drivers?: Json | null
          track_id?: string
          updated_at?: string
          user_id?: string
          wet_strategy?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_track_guides_driver_1_boost_id_fkey"
            columns: ["driver_1_boost_id"]
            isOneToOne: false
            referencedRelation: "boosts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_track_guides_driver_1_id_fkey"
            columns: ["driver_1_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_track_guides_driver_2_boost_id_fkey"
            columns: ["driver_2_boost_id"]
            isOneToOne: false
            referencedRelation: "boosts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_track_guides_driver_2_id_fkey"
            columns: ["driver_2_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_track_guides_free_boost_id_fkey"
            columns: ["free_boost_id"]
            isOneToOne: false
            referencedRelation: "boosts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_track_guides_saved_setup_id_fkey"
            columns: ["saved_setup_id"]
            isOneToOne: false
            referencedRelation: "user_car_setups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_track_guides_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_track_guides_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const

