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
      boost_custom_names: {
        Row: {
          boost_id: string
          created_at: string | null
          custom_name: string
          id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          boost_id: string
          created_at?: string | null
          custom_name: string
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          boost_id?: string
          created_at?: string | null
          custom_name?: string
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "boost_custom_names_boost_id_fkey"
            columns: ["boost_id"]
            isOneToOne: true
            referencedRelation: "boosts"
            referencedColumns: ["id"]
          },
        ]
      }
      boosts: {
        Row: {
          boost_stats: Json | null
          created_at: string
          icon: string | null
          id: string
          is_free: boolean
          name: string
          updated_at: string
        }
        Insert: {
          boost_stats?: Json | null
          created_at?: string
          icon?: string | null
          id?: string
          is_free?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          boost_stats?: Json | null
          created_at?: string
          icon?: string | null
          id?: string
          is_free?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
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
      catalog_items: {
        Row: {
          car_part_type: number | null
          card_type: number
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
          stats_per_level: Json | null
          tag_name: string | null
          updated_at: string
          visual_override: string | null
        }
        Insert: {
          car_part_type?: number | null
          card_type: number
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
          stats_per_level?: Json | null
          tag_name?: string | null
          updated_at?: string
          visual_override?: string | null
        }
        Update: {
          car_part_type?: number | null
          card_type?: number
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
          stats_per_level?: Json | null
          tag_name?: string | null
          updated_at?: string
          visual_override?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "catalog_items_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
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
          created_at: string
          email: string | null
          id: string
          is_admin: boolean | null
          updated_at: string
          username: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          is_admin?: boolean | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          is_admin?: boolean | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      seasons: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      tracks: {
        Row: {
          alt_name: string | null
          car_track_stat: string
          created_at: string | null
          driver_track_stat: string
          id: string
          laps: number
          name: string
          season_id: string
          updated_at: string | null
        }
        Insert: {
          alt_name?: string | null
          car_track_stat: string
          created_at?: string | null
          driver_track_stat: string
          id?: string
          laps: number
          name: string
          season_id: string
          updated_at?: string | null
        }
        Update: {
          alt_name?: string | null
          car_track_stat?: string
          created_at?: string | null
          driver_track_stat?: string
          id?: string
          laps?: number
          name?: string
          season_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tracks_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
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
            foreignKeyName: "user_car_setups_suspension_id_fkey"
            columns: ["suspension_id"]
            isOneToOne: false
            referencedRelation: "car_parts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_car_setups_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      user_items: {
        Row: {
          card_count: number | null
          catalog_item_id: string
          created_at: string
          id: string
          level: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          card_count?: number | null
          catalog_item_id: string
          created_at?: string
          id?: string
          level?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          card_count?: number | null
          catalog_item_id?: string
          created_at?: string
          id?: string
          level?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_items_catalog_item_id_fkey"
            columns: ["catalog_item_id"]
            isOneToOne: false
            referencedRelation: "catalog_items"
            referencedColumns: ["id"]
          },
        ]
      }
      user_track_guide_drivers: {
        Row: {
          created_at: string | null
          driver_id: string
          id: string
          recommended_boost_id: string | null
          track_guide_id: string
          track_strategy: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          driver_id: string
          id?: string
          recommended_boost_id?: string | null
          track_guide_id: string
          track_strategy?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          driver_id?: string
          id?: string
          recommended_boost_id?: string | null
          track_guide_id?: string
          track_strategy?: string | null
          updated_at?: string | null
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
          created_at: string | null
          dry_strategy: string | null
          free_boost_id: string | null
          gp_level: number
          id: string
          notes: string | null
          saved_setup_id: string | null
          setup_notes: string | null
          suggested_boosts: Json | null
          suggested_drivers: Json | null
          track_id: string
          updated_at: string | null
          user_id: string
          wet_strategy: string | null
        }
        Insert: {
          created_at?: string | null
          dry_strategy?: string | null
          free_boost_id?: string | null
          gp_level: number
          id?: string
          notes?: string | null
          saved_setup_id?: string | null
          setup_notes?: string | null
          suggested_boosts?: Json | null
          suggested_drivers?: Json | null
          track_id: string
          updated_at?: string | null
          user_id: string
          wet_strategy?: string | null
        }
        Update: {
          created_at?: string | null
          dry_strategy?: string | null
          free_boost_id?: string | null
          gp_level?: number
          id?: string
          notes?: string | null
          saved_setup_id?: string | null
          setup_notes?: string | null
          suggested_boosts?: Json | null
          suggested_drivers?: Json | null
          track_id?: string
          updated_at?: string | null
          user_id?: string
          wet_strategy?: string | null
        }
        Relationships: [
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
            foreignKeyName: "user_track_guides_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_track_guides_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

