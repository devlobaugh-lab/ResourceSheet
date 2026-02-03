


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgsodium";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    INSERT INTO public.profiles (id, email, username)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'username');
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_updated_at"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."boost_custom_names" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "boost_id" "uuid" NOT NULL,
    "custom_name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "user_id" "uuid",
    CONSTRAINT "boost_custom_names_custom_name_length" CHECK (("char_length"(TRIM(BOTH FROM "custom_name")) <= 64)),
    CONSTRAINT "boost_custom_names_custom_name_not_empty" CHECK (("char_length"(TRIM(BOTH FROM "custom_name")) > 0))
);


ALTER TABLE "public"."boost_custom_names" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."boosts" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "icon" "text",
    "boost_stats" "jsonb",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "is_free" boolean DEFAULT false NOT NULL
);


ALTER TABLE "public"."boosts" OWNER TO "postgres";


COMMENT ON COLUMN "public"."boosts"."is_free" IS 'Indicates if this boost is a free boost for Track Guide recommendations';



CREATE TABLE IF NOT EXISTS "public"."car_parts" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "rarity" integer NOT NULL,
    "series" integer NOT NULL,
    "season_id" "uuid",
    "icon" "text",
    "cc_price" integer,
    "num_duplicates_after_unlock" integer,
    "collection_id" "text",
    "visual_override" "text",
    "collection_sub_name" "text",
    "car_part_type" integer NOT NULL,
    "stats_per_level" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."car_parts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."catalog_items" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "card_type" integer NOT NULL,
    "rarity" integer NOT NULL,
    "series" integer NOT NULL,
    "season_id" "uuid",
    "icon" "text",
    "cc_price" integer,
    "num_duplicates_after_unlock" integer,
    "collection_id" "text",
    "visual_override" "text",
    "collection_sub_name" "text",
    "car_part_type" integer,
    "tag_name" "text",
    "ordinal" integer,
    "min_gp_tier" integer,
    "stats_per_level" "jsonb",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "catalog_items_card_type_check" CHECK (("card_type" = ANY (ARRAY[0, 1])))
);


ALTER TABLE "public"."catalog_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."drivers" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "rarity" integer NOT NULL,
    "series" integer NOT NULL,
    "season_id" "uuid",
    "icon" "text",
    "cc_price" integer,
    "num_duplicates_after_unlock" integer,
    "collection_id" "text",
    "visual_override" "text",
    "collection_sub_name" "text",
    "min_gp_tier" integer,
    "tag_name" "text",
    "ordinal" integer,
    "stats_per_level" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."drivers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "email" "text",
    "username" "text",
    "is_admin" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."seasons" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "is_active" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."seasons" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tracks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "alt_name" "text",
    "laps" integer NOT NULL,
    "driver_track_stat" "text" NOT NULL,
    "car_track_stat" "text" NOT NULL,
    "season_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "tracks_car_track_stat_check" CHECK (("car_track_stat" = ANY (ARRAY['speed'::"text", 'cornering'::"text", 'powerUnit'::"text"]))),
    CONSTRAINT "tracks_driver_track_stat_check" CHECK (("driver_track_stat" = ANY (ARRAY['overtaking'::"text", 'defending'::"text", 'raceStart'::"text", 'tyreUse'::"text"]))),
    CONSTRAINT "tracks_laps_check" CHECK (("laps" > 0))
);


ALTER TABLE "public"."tracks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_boosts" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "boost_id" "uuid" NOT NULL,
    "level" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "count" integer DEFAULT 0
);


ALTER TABLE "public"."user_boosts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_car_parts" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "car_part_id" "uuid" NOT NULL,
    "level" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "card_count" integer DEFAULT 0
);


ALTER TABLE "public"."user_car_parts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_car_setups" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "notes" "text",
    "brake_id" "uuid",
    "gearbox_id" "uuid",
    "rear_wing_id" "uuid",
    "front_wing_id" "uuid",
    "suspension_id" "uuid",
    "engine_id" "uuid",
    "series_filter" integer DEFAULT 12,
    "bonus_percentage" numeric(5,2) DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."user_car_setups" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_drivers" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "driver_id" "uuid" NOT NULL,
    "level" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "card_count" integer DEFAULT 0
);


ALTER TABLE "public"."user_drivers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_items" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "catalog_item_id" "uuid" NOT NULL,
    "level" integer DEFAULT 0,
    "card_count" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."user_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_track_guide_drivers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "track_guide_id" "uuid" NOT NULL,
    "driver_id" "uuid" NOT NULL,
    "recommended_boost_id" "uuid",
    "track_strategy" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_track_guide_drivers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_track_guides" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "track_id" "uuid" NOT NULL,
    "gp_level" integer NOT NULL,
    "suggested_drivers" "jsonb" DEFAULT '[]'::"jsonb",
    "free_boost_id" "uuid",
    "suggested_boosts" "jsonb" DEFAULT '[]'::"jsonb",
    "saved_setup_id" "uuid",
    "setup_notes" "text",
    "dry_strategy" "text",
    "wet_strategy" "text",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "driver_1_id" "uuid",
    "driver_2_id" "uuid",
    "driver_1_boost_id" "uuid",
    "driver_2_boost_id" "uuid",
    "alt_driver_ids" "jsonb" DEFAULT '[]'::"jsonb",
    "alt_boost_ids" "jsonb" DEFAULT '[]'::"jsonb",
    "driver_1_dry_strategy" "text",
    "driver_1_wet_strategy" "text",
    "driver_2_dry_strategy" "text",
    "driver_2_wet_strategy" "text",
    "alternate_driver_ids" "jsonb" DEFAULT '[]'::"jsonb",
    CONSTRAINT "user_track_guides_gp_level_check" CHECK ((("gp_level" >= 0) AND ("gp_level" <= 3)))
);


ALTER TABLE "public"."user_track_guides" OWNER TO "postgres";


COMMENT ON TABLE "public"."user_track_guides" IS 'Track guides with separate driver configurations and strategies';



COMMENT ON COLUMN "public"."user_track_guides"."driver_1_id" IS 'Primary driver selection for the new layout';



COMMENT ON COLUMN "public"."user_track_guides"."driver_2_id" IS 'Secondary driver selection for the new layout';



COMMENT ON COLUMN "public"."user_track_guides"."driver_1_boost_id" IS 'Boost for driver 1';



COMMENT ON COLUMN "public"."user_track_guides"."driver_2_boost_id" IS 'Boost for driver 2';



COMMENT ON COLUMN "public"."user_track_guides"."alt_driver_ids" IS 'Array of alternate driver IDs for the Alt Drivers section';



COMMENT ON COLUMN "public"."user_track_guides"."alt_boost_ids" IS 'Array of alternate boost IDs for the Alt Boosts section';



COMMENT ON COLUMN "public"."user_track_guides"."alternate_driver_ids" IS 'Array of driver IDs for alternate driver suggestions (replaces positions 2-7 in suggested_drivers)';



ALTER TABLE ONLY "public"."boost_custom_names"
    ADD CONSTRAINT "boost_custom_names_boost_id_unique" UNIQUE ("boost_id");



ALTER TABLE ONLY "public"."boost_custom_names"
    ADD CONSTRAINT "boost_custom_names_custom_name_unique" UNIQUE ("custom_name");



ALTER TABLE ONLY "public"."boost_custom_names"
    ADD CONSTRAINT "boost_custom_names_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."boosts"
    ADD CONSTRAINT "boosts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."car_parts"
    ADD CONSTRAINT "car_parts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."catalog_items"
    ADD CONSTRAINT "catalog_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."drivers"
    ADD CONSTRAINT "drivers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."seasons"
    ADD CONSTRAINT "seasons_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tracks"
    ADD CONSTRAINT "tracks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."boost_custom_names"
    ADD CONSTRAINT "unique_boost_user" UNIQUE ("boost_id", "user_id");



ALTER TABLE ONLY "public"."user_boosts"
    ADD CONSTRAINT "user_boosts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_boosts"
    ADD CONSTRAINT "user_boosts_user_id_boost_id_key" UNIQUE ("user_id", "boost_id");



ALTER TABLE ONLY "public"."user_car_parts"
    ADD CONSTRAINT "user_car_parts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_car_parts"
    ADD CONSTRAINT "user_car_parts_user_id_car_part_id_key" UNIQUE ("user_id", "car_part_id");



ALTER TABLE ONLY "public"."user_car_setups"
    ADD CONSTRAINT "user_car_setups_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_drivers"
    ADD CONSTRAINT "user_drivers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_drivers"
    ADD CONSTRAINT "user_drivers_user_id_driver_id_key" UNIQUE ("user_id", "driver_id");



ALTER TABLE ONLY "public"."user_items"
    ADD CONSTRAINT "user_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_items"
    ADD CONSTRAINT "user_items_user_id_catalog_item_id_key" UNIQUE ("user_id", "catalog_item_id");



ALTER TABLE ONLY "public"."user_track_guide_drivers"
    ADD CONSTRAINT "user_track_guide_drivers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_track_guide_drivers"
    ADD CONSTRAINT "user_track_guide_drivers_track_guide_id_driver_id_key" UNIQUE ("track_guide_id", "driver_id");



ALTER TABLE ONLY "public"."user_track_guides"
    ADD CONSTRAINT "user_track_guides_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_track_guides"
    ADD CONSTRAINT "user_track_guides_user_id_track_id_gp_level_key" UNIQUE ("user_id", "track_id", "gp_level");



CREATE INDEX "idx_boost_custom_names_boost_id" ON "public"."boost_custom_names" USING "btree" ("boost_id");



CREATE INDEX "idx_boost_custom_names_custom_name" ON "public"."boost_custom_names" USING "btree" ("custom_name");



CREATE INDEX "idx_car_parts_rarity" ON "public"."car_parts" USING "btree" ("rarity");



CREATE INDEX "idx_car_parts_season_id" ON "public"."car_parts" USING "btree" ("season_id");



CREATE INDEX "idx_car_parts_series" ON "public"."car_parts" USING "btree" ("series");



CREATE INDEX "idx_car_parts_type" ON "public"."car_parts" USING "btree" ("car_part_type");



CREATE INDEX "idx_catalog_items_card_type" ON "public"."catalog_items" USING "btree" ("card_type");



CREATE INDEX "idx_catalog_items_rarity" ON "public"."catalog_items" USING "btree" ("rarity");



CREATE INDEX "idx_catalog_items_season_id" ON "public"."catalog_items" USING "btree" ("season_id");



CREATE INDEX "idx_catalog_items_series" ON "public"."catalog_items" USING "btree" ("series");



CREATE INDEX "idx_drivers_rarity" ON "public"."drivers" USING "btree" ("rarity");



CREATE INDEX "idx_drivers_season_id" ON "public"."drivers" USING "btree" ("season_id");



CREATE INDEX "idx_drivers_series" ON "public"."drivers" USING "btree" ("series");



CREATE INDEX "idx_tracks_car_track_stat" ON "public"."tracks" USING "btree" ("car_track_stat");



CREATE INDEX "idx_tracks_driver_track_stat" ON "public"."tracks" USING "btree" ("driver_track_stat");



CREATE INDEX "idx_tracks_season_id" ON "public"."tracks" USING "btree" ("season_id");



CREATE INDEX "idx_user_boosts_boost_id" ON "public"."user_boosts" USING "btree" ("boost_id");



CREATE INDEX "idx_user_boosts_card_count" ON "public"."user_boosts" USING "btree" ("count");



CREATE INDEX "idx_user_boosts_user_id" ON "public"."user_boosts" USING "btree" ("user_id");



CREATE INDEX "idx_user_car_parts_car_part_id" ON "public"."user_car_parts" USING "btree" ("car_part_id");



CREATE INDEX "idx_user_car_parts_card_count" ON "public"."user_car_parts" USING "btree" ("card_count");



CREATE INDEX "idx_user_car_parts_user_id" ON "public"."user_car_parts" USING "btree" ("user_id");



CREATE INDEX "idx_user_car_setups_created_at" ON "public"."user_car_setups" USING "btree" ("created_at");



CREATE INDEX "idx_user_car_setups_user_id" ON "public"."user_car_setups" USING "btree" ("user_id");



CREATE INDEX "idx_user_drivers_card_count" ON "public"."user_drivers" USING "btree" ("card_count");



CREATE INDEX "idx_user_drivers_driver_id" ON "public"."user_drivers" USING "btree" ("driver_id");



CREATE INDEX "idx_user_drivers_user_id" ON "public"."user_drivers" USING "btree" ("user_id");



CREATE INDEX "idx_user_id" ON "public"."boost_custom_names" USING "btree" ("user_id");



CREATE INDEX "idx_user_items_catalog_item_id" ON "public"."user_items" USING "btree" ("catalog_item_id");



CREATE INDEX "idx_user_items_user_id" ON "public"."user_items" USING "btree" ("user_id");



CREATE INDEX "idx_user_track_guide_drivers_driver_id" ON "public"."user_track_guide_drivers" USING "btree" ("driver_id");



CREATE INDEX "idx_user_track_guide_drivers_track_guide_id" ON "public"."user_track_guide_drivers" USING "btree" ("track_guide_id");



CREATE INDEX "idx_user_track_guides_driver_1_boost_id" ON "public"."user_track_guides" USING "btree" ("driver_1_boost_id");



CREATE INDEX "idx_user_track_guides_driver_1_id" ON "public"."user_track_guides" USING "btree" ("driver_1_id");



CREATE INDEX "idx_user_track_guides_driver_2_boost_id" ON "public"."user_track_guides" USING "btree" ("driver_2_boost_id");



CREATE INDEX "idx_user_track_guides_driver_2_id" ON "public"."user_track_guides" USING "btree" ("driver_2_id");



CREATE INDEX "idx_user_track_guides_gp_level" ON "public"."user_track_guides" USING "btree" ("gp_level");



CREATE INDEX "idx_user_track_guides_track_id" ON "public"."user_track_guides" USING "btree" ("track_id");



CREATE INDEX "idx_user_track_guides_user_id" ON "public"."user_track_guides" USING "btree" ("user_id");



CREATE OR REPLACE TRIGGER "handle_updated_at_boost_custom_names" BEFORE UPDATE ON "public"."boost_custom_names" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "handle_updated_at_boosts" BEFORE UPDATE ON "public"."boosts" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "handle_updated_at_car_parts" BEFORE UPDATE ON "public"."car_parts" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "handle_updated_at_catalog_items" BEFORE UPDATE ON "public"."catalog_items" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "handle_updated_at_drivers" BEFORE UPDATE ON "public"."drivers" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "handle_updated_at_profiles" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "handle_updated_at_seasons" BEFORE UPDATE ON "public"."seasons" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "handle_updated_at_tracks" BEFORE UPDATE ON "public"."tracks" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "handle_updated_at_user_boosts" BEFORE UPDATE ON "public"."user_boosts" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "handle_updated_at_user_car_parts" BEFORE UPDATE ON "public"."user_car_parts" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "handle_updated_at_user_car_setups" BEFORE UPDATE ON "public"."user_car_setups" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "handle_updated_at_user_drivers" BEFORE UPDATE ON "public"."user_drivers" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "handle_updated_at_user_items" BEFORE UPDATE ON "public"."user_items" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



ALTER TABLE ONLY "public"."boost_custom_names"
    ADD CONSTRAINT "boost_custom_names_boost_id_fkey" FOREIGN KEY ("boost_id") REFERENCES "public"."boosts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."car_parts"
    ADD CONSTRAINT "car_parts_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."catalog_items"
    ADD CONSTRAINT "catalog_items_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."drivers"
    ADD CONSTRAINT "drivers_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."boost_custom_names"
    ADD CONSTRAINT "fk_user_id" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."tracks"
    ADD CONSTRAINT "tracks_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_boosts"
    ADD CONSTRAINT "user_boosts_boost_id_fkey" FOREIGN KEY ("boost_id") REFERENCES "public"."boosts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_boosts"
    ADD CONSTRAINT "user_boosts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_car_parts"
    ADD CONSTRAINT "user_car_parts_car_part_id_fkey" FOREIGN KEY ("car_part_id") REFERENCES "public"."car_parts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_car_parts"
    ADD CONSTRAINT "user_car_parts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_car_setups"
    ADD CONSTRAINT "user_car_setups_brake_id_fkey" FOREIGN KEY ("brake_id") REFERENCES "public"."car_parts"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."user_car_setups"
    ADD CONSTRAINT "user_car_setups_engine_id_fkey" FOREIGN KEY ("engine_id") REFERENCES "public"."car_parts"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."user_car_setups"
    ADD CONSTRAINT "user_car_setups_front_wing_id_fkey" FOREIGN KEY ("front_wing_id") REFERENCES "public"."car_parts"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."user_car_setups"
    ADD CONSTRAINT "user_car_setups_gearbox_id_fkey" FOREIGN KEY ("gearbox_id") REFERENCES "public"."car_parts"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."user_car_setups"
    ADD CONSTRAINT "user_car_setups_rear_wing_id_fkey" FOREIGN KEY ("rear_wing_id") REFERENCES "public"."car_parts"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."user_car_setups"
    ADD CONSTRAINT "user_car_setups_suspension_id_fkey" FOREIGN KEY ("suspension_id") REFERENCES "public"."car_parts"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."user_car_setups"
    ADD CONSTRAINT "user_car_setups_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_drivers"
    ADD CONSTRAINT "user_drivers_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "public"."drivers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_drivers"
    ADD CONSTRAINT "user_drivers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_items"
    ADD CONSTRAINT "user_items_catalog_item_id_fkey" FOREIGN KEY ("catalog_item_id") REFERENCES "public"."catalog_items"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_items"
    ADD CONSTRAINT "user_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_track_guide_drivers"
    ADD CONSTRAINT "user_track_guide_drivers_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "public"."drivers"("id");



ALTER TABLE ONLY "public"."user_track_guide_drivers"
    ADD CONSTRAINT "user_track_guide_drivers_recommended_boost_id_fkey" FOREIGN KEY ("recommended_boost_id") REFERENCES "public"."boosts"("id");



ALTER TABLE ONLY "public"."user_track_guide_drivers"
    ADD CONSTRAINT "user_track_guide_drivers_track_guide_id_fkey" FOREIGN KEY ("track_guide_id") REFERENCES "public"."user_track_guides"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_track_guides"
    ADD CONSTRAINT "user_track_guides_driver_1_boost_id_fkey" FOREIGN KEY ("driver_1_boost_id") REFERENCES "public"."boosts"("id");



ALTER TABLE ONLY "public"."user_track_guides"
    ADD CONSTRAINT "user_track_guides_driver_1_id_fkey" FOREIGN KEY ("driver_1_id") REFERENCES "public"."drivers"("id");



ALTER TABLE ONLY "public"."user_track_guides"
    ADD CONSTRAINT "user_track_guides_driver_2_boost_id_fkey" FOREIGN KEY ("driver_2_boost_id") REFERENCES "public"."boosts"("id");



ALTER TABLE ONLY "public"."user_track_guides"
    ADD CONSTRAINT "user_track_guides_driver_2_id_fkey" FOREIGN KEY ("driver_2_id") REFERENCES "public"."drivers"("id");



ALTER TABLE ONLY "public"."user_track_guides"
    ADD CONSTRAINT "user_track_guides_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "public"."tracks"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_track_guides"
    ADD CONSTRAINT "user_track_guides_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



CREATE POLICY "Admins can manage boost custom names" ON "public"."boost_custom_names" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."is_admin" = true)))));



CREATE POLICY "Admins can view all profiles" ON "public"."profiles" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "profiles_1"
  WHERE (("profiles_1"."id" = "auth"."uid"()) AND ("profiles_1"."is_admin" = true)))));



CREATE POLICY "Anyone can read boost custom names" ON "public"."boost_custom_names" FOR SELECT USING (true);



CREATE POLICY "Anyone can read tracks" ON "public"."tracks" FOR SELECT USING (true);



CREATE POLICY "Boosts are viewable by authenticated users" ON "public"."boosts" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Boosts are viewable by everyone" ON "public"."boosts" FOR SELECT USING (true);



CREATE POLICY "Car parts are viewable by everyone" ON "public"."car_parts" FOR SELECT USING (true);



CREATE POLICY "Catalog items are viewable by authenticated users" ON "public"."catalog_items" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Drivers are viewable by everyone" ON "public"."drivers" FOR SELECT USING (true);



CREATE POLICY "Seasons are viewable by authenticated users" ON "public"."seasons" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Users can delete their own boosts" ON "public"."user_boosts" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own car parts" ON "public"."user_car_parts" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own car setups" ON "public"."user_car_setups" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own drivers" ON "public"."user_drivers" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own items" ON "public"."user_items" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own boosts" ON "public"."user_boosts" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own car parts" ON "public"."user_car_parts" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own car setups" ON "public"."user_car_setups" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own drivers" ON "public"."user_drivers" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own items" ON "public"."user_items" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own boosts" ON "public"."user_boosts" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own car parts" ON "public"."user_car_parts" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own car setups" ON "public"."user_car_setups" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own drivers" ON "public"."user_drivers" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own items" ON "public"."user_items" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own profile" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can view their own boosts" ON "public"."user_boosts" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own car parts" ON "public"."user_car_parts" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own car setups" ON "public"."user_car_setups" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own drivers" ON "public"."user_drivers" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own items" ON "public"."user_items" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own profile" ON "public"."profiles" FOR SELECT USING (("auth"."uid"() = "id"));



ALTER TABLE "public"."boost_custom_names" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."boosts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."car_parts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."catalog_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."drivers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."seasons" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tracks" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_boosts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_car_parts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_car_setups" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_drivers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_items" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";





GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";





























































































































































































GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "service_role";


















GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."boost_custom_names" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."boost_custom_names" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."boost_custom_names" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."boosts" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."boosts" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."boosts" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."car_parts" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."car_parts" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."car_parts" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."catalog_items" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."catalog_items" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."catalog_items" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."drivers" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."drivers" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."drivers" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."profiles" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."profiles" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."profiles" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."seasons" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."seasons" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."seasons" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."tracks" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."tracks" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."tracks" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."user_boosts" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."user_boosts" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."user_boosts" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."user_car_parts" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."user_car_parts" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."user_car_parts" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."user_car_setups" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."user_car_setups" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."user_car_setups" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."user_drivers" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."user_drivers" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."user_drivers" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."user_items" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."user_items" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."user_items" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."user_track_guide_drivers" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."user_track_guide_drivers" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."user_track_guide_drivers" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."user_track_guides" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."user_track_guides" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."user_track_guides" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLES TO "service_role";































