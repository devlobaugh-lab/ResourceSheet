--
-- PostgreSQL database dump
--

\restrict EN2ekScfyFTu7AolQTu9OOl2FNGrpfNfn053iw1TCIq96t9YFVJSZpYfIysCFWz

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.8 (Ubuntu 17.8-1.pgdg22.04+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

DROP DATABASE IF EXISTS postgres;
--
-- Name: postgres; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE postgres WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = icu LOCALE = 'en_US.UTF-8' ICU_LOCALE = 'en-US';


ALTER DATABASE postgres OWNER TO postgres;

\unrestrict EN2ekScfyFTu7AolQTu9OOl2FNGrpfNfn053iw1TCIq96t9YFVJSZpYfIysCFWz
\connect postgres
\restrict EN2ekScfyFTu7AolQTu9OOl2FNGrpfNfn053iw1TCIq96t9YFVJSZpYfIysCFWz

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: DATABASE postgres; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON DATABASE postgres IS 'default administrative connection database';


--
-- Name: postgres; Type: DATABASE PROPERTIES; Schema: -; Owner: postgres
--

ALTER DATABASE postgres SET "app.settings.jwt_secret" TO 'super-secret-jwt-token-with-at-least-32-characters-long';
ALTER DATABASE postgres SET "app.settings.jwt_exp" TO '3600';


\unrestrict EN2ekScfyFTu7AolQTu9OOl2FNGrpfNfn053iw1TCIq96t9YFVJSZpYfIysCFWz
\connect postgres
\restrict EN2ekScfyFTu7AolQTu9OOl2FNGrpfNfn053iw1TCIq96t9YFVJSZpYfIysCFWz

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: _realtime; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA _realtime;


ALTER SCHEMA _realtime OWNER TO postgres;

--
-- Name: auth; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA auth;


ALTER SCHEMA auth OWNER TO supabase_admin;

--
-- Name: extensions; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA extensions;


ALTER SCHEMA extensions OWNER TO postgres;

--
-- Name: graphql; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA graphql;


ALTER SCHEMA graphql OWNER TO supabase_admin;

--
-- Name: graphql_public; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA graphql_public;


ALTER SCHEMA graphql_public OWNER TO supabase_admin;

--
-- Name: pg_net; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;


--
-- Name: EXTENSION pg_net; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_net IS 'Async HTTP';


--
-- Name: pgbouncer; Type: SCHEMA; Schema: -; Owner: pgbouncer
--

CREATE SCHEMA pgbouncer;


ALTER SCHEMA pgbouncer OWNER TO pgbouncer;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


--
-- Name: realtime; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA realtime;


ALTER SCHEMA realtime OWNER TO supabase_admin;

--
-- Name: storage; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA storage;


ALTER SCHEMA storage OWNER TO supabase_admin;

--
-- Name: supabase_functions; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA supabase_functions;


ALTER SCHEMA supabase_functions OWNER TO supabase_admin;

--
-- Name: vault; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA vault;


ALTER SCHEMA vault OWNER TO supabase_admin;

--
-- Name: pg_graphql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_graphql WITH SCHEMA graphql;


--
-- Name: EXTENSION pg_graphql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_graphql IS 'pg_graphql: GraphQL support';


--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;


--
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: supabase_vault; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS supabase_vault WITH SCHEMA vault;


--
-- Name: EXTENSION supabase_vault; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION supabase_vault IS 'Supabase Vault Extension';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: aal_level; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.aal_level AS ENUM (
    'aal1',
    'aal2',
    'aal3'
);


ALTER TYPE auth.aal_level OWNER TO supabase_auth_admin;

--
-- Name: code_challenge_method; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.code_challenge_method AS ENUM (
    's256',
    'plain'
);


ALTER TYPE auth.code_challenge_method OWNER TO supabase_auth_admin;

--
-- Name: factor_status; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.factor_status AS ENUM (
    'unverified',
    'verified'
);


ALTER TYPE auth.factor_status OWNER TO supabase_auth_admin;

--
-- Name: factor_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.factor_type AS ENUM (
    'totp',
    'webauthn',
    'phone'
);


ALTER TYPE auth.factor_type OWNER TO supabase_auth_admin;

--
-- Name: oauth_authorization_status; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.oauth_authorization_status AS ENUM (
    'pending',
    'approved',
    'denied',
    'expired'
);


ALTER TYPE auth.oauth_authorization_status OWNER TO supabase_auth_admin;

--
-- Name: oauth_client_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.oauth_client_type AS ENUM (
    'public',
    'confidential'
);


ALTER TYPE auth.oauth_client_type OWNER TO supabase_auth_admin;

--
-- Name: oauth_registration_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.oauth_registration_type AS ENUM (
    'dynamic',
    'manual'
);


ALTER TYPE auth.oauth_registration_type OWNER TO supabase_auth_admin;

--
-- Name: oauth_response_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.oauth_response_type AS ENUM (
    'code'
);


ALTER TYPE auth.oauth_response_type OWNER TO supabase_auth_admin;

--
-- Name: one_time_token_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.one_time_token_type AS ENUM (
    'confirmation_token',
    'reauthentication_token',
    'recovery_token',
    'email_change_token_new',
    'email_change_token_current',
    'phone_change_token'
);


ALTER TYPE auth.one_time_token_type OWNER TO supabase_auth_admin;

--
-- Name: action; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.action AS ENUM (
    'INSERT',
    'UPDATE',
    'DELETE',
    'TRUNCATE',
    'ERROR'
);


ALTER TYPE realtime.action OWNER TO supabase_admin;

--
-- Name: equality_op; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.equality_op AS ENUM (
    'eq',
    'neq',
    'lt',
    'lte',
    'gt',
    'gte',
    'in'
);


ALTER TYPE realtime.equality_op OWNER TO supabase_admin;

--
-- Name: user_defined_filter; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.user_defined_filter AS (
	column_name text,
	op realtime.equality_op,
	value text
);


ALTER TYPE realtime.user_defined_filter OWNER TO supabase_admin;

--
-- Name: wal_column; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.wal_column AS (
	name text,
	type_name text,
	type_oid oid,
	value jsonb,
	is_pkey boolean,
	is_selectable boolean
);


ALTER TYPE realtime.wal_column OWNER TO supabase_admin;

--
-- Name: wal_rls; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.wal_rls AS (
	wal jsonb,
	is_rls_enabled boolean,
	subscription_ids uuid[],
	errors text[]
);


ALTER TYPE realtime.wal_rls OWNER TO supabase_admin;

--
-- Name: buckettype; Type: TYPE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TYPE storage.buckettype AS ENUM (
    'STANDARD',
    'ANALYTICS',
    'VECTOR'
);


ALTER TYPE storage.buckettype OWNER TO supabase_storage_admin;

--
-- Name: email(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.email() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.email', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
  )::text
$$;


ALTER FUNCTION auth.email() OWNER TO supabase_auth_admin;

--
-- Name: FUNCTION email(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.email() IS 'Deprecated. Use auth.jwt() -> ''email'' instead.';


--
-- Name: jwt(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.jwt() RETURNS jsonb
    LANGUAGE sql STABLE
    AS $$
  select 
    coalesce(
        nullif(current_setting('request.jwt.claim', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb
$$;


ALTER FUNCTION auth.jwt() OWNER TO supabase_auth_admin;

--
-- Name: role(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.role() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$$;


ALTER FUNCTION auth.role() OWNER TO supabase_auth_admin;

--
-- Name: FUNCTION role(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.role() IS 'Deprecated. Use auth.jwt() -> ''role'' instead.';


--
-- Name: uid(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.uid() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;


ALTER FUNCTION auth.uid() OWNER TO supabase_auth_admin;

--
-- Name: FUNCTION uid(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.uid() IS 'Deprecated. Use auth.jwt() -> ''sub'' instead.';


--
-- Name: grant_pg_cron_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.grant_pg_cron_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_cron'
  )
  THEN
    grant usage on schema cron to postgres with grant option;

    alter default privileges in schema cron grant all on tables to postgres with grant option;
    alter default privileges in schema cron grant all on functions to postgres with grant option;
    alter default privileges in schema cron grant all on sequences to postgres with grant option;

    alter default privileges for user supabase_admin in schema cron grant all
        on sequences to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on tables to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on functions to postgres with grant option;

    grant all privileges on all tables in schema cron to postgres with grant option;
    revoke all on table cron.job from postgres;
    grant select on table cron.job to postgres with grant option;
  END IF;
END;
$$;


ALTER FUNCTION extensions.grant_pg_cron_access() OWNER TO supabase_admin;

--
-- Name: FUNCTION grant_pg_cron_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_cron_access() IS 'Grants access to pg_cron';


--
-- Name: grant_pg_graphql_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.grant_pg_graphql_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
DECLARE
    func_is_graphql_resolve bool;
BEGIN
    func_is_graphql_resolve = (
        SELECT n.proname = 'resolve'
        FROM pg_event_trigger_ddl_commands() AS ev
        LEFT JOIN pg_catalog.pg_proc AS n
        ON ev.objid = n.oid
    );

    IF func_is_graphql_resolve
    THEN
        -- Update public wrapper to pass all arguments through to the pg_graphql resolve func
        DROP FUNCTION IF EXISTS graphql_public.graphql;
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language sql
        as $$
            select graphql.resolve(
                query := query,
                variables := coalesce(variables, '{}'),
                "operationName" := "operationName",
                extensions := extensions
            );
        $$;

        -- This hook executes when `graphql.resolve` is created. That is not necessarily the last
        -- function in the extension so we need to grant permissions on existing entities AND
        -- update default permissions to any others that are created after `graphql.resolve`
        grant usage on schema graphql to postgres, anon, authenticated, service_role;
        grant select on all tables in schema graphql to postgres, anon, authenticated, service_role;
        grant execute on all functions in schema graphql to postgres, anon, authenticated, service_role;
        grant all on all sequences in schema graphql to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on tables to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on functions to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on sequences to postgres, anon, authenticated, service_role;

        -- Allow postgres role to allow granting usage on graphql and graphql_public schemas to custom roles
        grant usage on schema graphql_public to postgres with grant option;
        grant usage on schema graphql to postgres with grant option;
    END IF;

END;
$_$;


ALTER FUNCTION extensions.grant_pg_graphql_access() OWNER TO supabase_admin;

--
-- Name: FUNCTION grant_pg_graphql_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_graphql_access() IS 'Grants access to pg_graphql';


--
-- Name: grant_pg_net_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.grant_pg_net_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_net'
  )
  THEN
    GRANT USAGE ON SCHEMA net TO supabase_functions_admin, postgres, anon, authenticated, service_role;

    ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;
    ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;

    ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;
    ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;

    REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
    REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;

    GRANT EXECUTE ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
    GRANT EXECUTE ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
  END IF;
END;
$$;


ALTER FUNCTION extensions.grant_pg_net_access() OWNER TO supabase_admin;

--
-- Name: FUNCTION grant_pg_net_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_net_access() IS 'Grants access to pg_net';


--
-- Name: pgrst_ddl_watch(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.pgrst_ddl_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN SELECT * FROM pg_event_trigger_ddl_commands()
  LOOP
    IF cmd.command_tag IN (
      'CREATE SCHEMA', 'ALTER SCHEMA'
    , 'CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO', 'ALTER TABLE'
    , 'CREATE FOREIGN TABLE', 'ALTER FOREIGN TABLE'
    , 'CREATE VIEW', 'ALTER VIEW'
    , 'CREATE MATERIALIZED VIEW', 'ALTER MATERIALIZED VIEW'
    , 'CREATE FUNCTION', 'ALTER FUNCTION'
    , 'CREATE TRIGGER'
    , 'CREATE TYPE', 'ALTER TYPE'
    , 'CREATE RULE'
    , 'COMMENT'
    )
    -- don't notify in case of CREATE TEMP table or other objects created on pg_temp
    AND cmd.schema_name is distinct from 'pg_temp'
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


ALTER FUNCTION extensions.pgrst_ddl_watch() OWNER TO supabase_admin;

--
-- Name: pgrst_drop_watch(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.pgrst_drop_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  obj record;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_dropped_objects()
  LOOP
    IF obj.object_type IN (
      'schema'
    , 'table'
    , 'foreign table'
    , 'view'
    , 'materialized view'
    , 'function'
    , 'trigger'
    , 'type'
    , 'rule'
    )
    AND obj.is_temporary IS false -- no pg_temp objects
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


ALTER FUNCTION extensions.pgrst_drop_watch() OWNER TO supabase_admin;

--
-- Name: set_graphql_placeholder(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.set_graphql_placeholder() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
    DECLARE
    graphql_is_dropped bool;
    BEGIN
    graphql_is_dropped = (
        SELECT ev.schema_name = 'graphql_public'
        FROM pg_event_trigger_dropped_objects() AS ev
        WHERE ev.schema_name = 'graphql_public'
    );

    IF graphql_is_dropped
    THEN
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language plpgsql
        as $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;
    END IF;

    END;
$_$;


ALTER FUNCTION extensions.set_graphql_placeholder() OWNER TO supabase_admin;

--
-- Name: FUNCTION set_graphql_placeholder(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.set_graphql_placeholder() IS 'Reintroduces placeholder function for graphql_public.graphql';


--
-- Name: get_auth(text); Type: FUNCTION; Schema: pgbouncer; Owner: supabase_admin
--

CREATE FUNCTION pgbouncer.get_auth(p_usename text) RETURNS TABLE(username text, password text)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $_$
begin
    raise debug 'PgBouncer auth request: %', p_usename;

    return query
    select 
        rolname::text, 
        case when rolvaliduntil < now() 
            then null 
            else rolpassword::text 
        end 
    from pg_authid 
    where rolname=$1 and rolcanlogin;
end;
$_$;


ALTER FUNCTION pgbouncer.get_auth(p_usename text) OWNER TO supabase_admin;

--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    INSERT INTO public.profiles (id, email, username)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'username');
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.handle_new_user() OWNER TO postgres;

--
-- Name: handle_updated_at(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.handle_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.handle_updated_at() OWNER TO postgres;

--
-- Name: apply_rls(jsonb, integer); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer DEFAULT (1024 * 1024)) RETURNS SETOF realtime.wal_rls
    LANGUAGE plpgsql
    AS $$
declare
-- Regclass of the table e.g. public.notes
entity_ regclass = (quote_ident(wal ->> 'schema') || '.' || quote_ident(wal ->> 'table'))::regclass;

-- I, U, D, T: insert, update ...
action realtime.action = (
    case wal ->> 'action'
        when 'I' then 'INSERT'
        when 'U' then 'UPDATE'
        when 'D' then 'DELETE'
        else 'ERROR'
    end
);

-- Is row level security enabled for the table
is_rls_enabled bool = relrowsecurity from pg_class where oid = entity_;

subscriptions realtime.subscription[] = array_agg(subs)
    from
        realtime.subscription subs
    where
        subs.entity = entity_;

-- Subscription vars
roles regrole[] = array_agg(distinct us.claims_role::text)
    from
        unnest(subscriptions) us;

working_role regrole;
claimed_role regrole;
claims jsonb;

subscription_id uuid;
subscription_has_access bool;
visible_to_subscription_ids uuid[] = '{}';

-- structured info for wal's columns
columns realtime.wal_column[];
-- previous identity values for update/delete
old_columns realtime.wal_column[];

error_record_exceeds_max_size boolean = octet_length(wal::text) > max_record_bytes;

-- Primary jsonb output for record
output jsonb;

begin
perform set_config('role', null, true);

columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'columns') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

old_columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'identity') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

for working_role in select * from unnest(roles) loop

    -- Update `is_selectable` for columns and old_columns
    columns =
        array_agg(
            (
                c.name,
                c.type_name,
                c.type_oid,
                c.value,
                c.is_pkey,
                pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
            )::realtime.wal_column
        )
        from
            unnest(columns) c;

    old_columns =
            array_agg(
                (
                    c.name,
                    c.type_name,
                    c.type_oid,
                    c.value,
                    c.is_pkey,
                    pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
                )::realtime.wal_column
            )
            from
                unnest(old_columns) c;

    if action <> 'DELETE' and count(1) = 0 from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            -- subscriptions is already filtered by entity
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 400: Bad Request, no primary key']
        )::realtime.wal_rls;

    -- The claims role does not have SELECT permission to the primary key of entity
    elsif action <> 'DELETE' and sum(c.is_selectable::int) <> count(1) from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 401: Unauthorized']
        )::realtime.wal_rls;

    else
        output = jsonb_build_object(
            'schema', wal ->> 'schema',
            'table', wal ->> 'table',
            'type', action,
            'commit_timestamp', to_char(
                ((wal ->> 'timestamp')::timestamptz at time zone 'utc'),
                'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
            ),
            'columns', (
                select
                    jsonb_agg(
                        jsonb_build_object(
                            'name', pa.attname,
                            'type', pt.typname
                        )
                        order by pa.attnum asc
                    )
                from
                    pg_attribute pa
                    join pg_type pt
                        on pa.atttypid = pt.oid
                where
                    attrelid = entity_
                    and attnum > 0
                    and pg_catalog.has_column_privilege(working_role, entity_, pa.attname, 'SELECT')
            )
        )
        -- Add "record" key for insert and update
        || case
            when action in ('INSERT', 'UPDATE') then
                jsonb_build_object(
                    'record',
                    (
                        select
                            jsonb_object_agg(
                                -- if unchanged toast, get column name and value from old record
                                coalesce((c).name, (oc).name),
                                case
                                    when (c).name is null then (oc).value
                                    else (c).value
                                end
                            )
                        from
                            unnest(columns) c
                            full outer join unnest(old_columns) oc
                                on (c).name = (oc).name
                        where
                            coalesce((c).is_selectable, (oc).is_selectable)
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                    )
                )
            else '{}'::jsonb
        end
        -- Add "old_record" key for update and delete
        || case
            when action = 'UPDATE' then
                jsonb_build_object(
                        'old_record',
                        (
                            select jsonb_object_agg((c).name, (c).value)
                            from unnest(old_columns) c
                            where
                                (c).is_selectable
                                and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                        )
                    )
            when action = 'DELETE' then
                jsonb_build_object(
                    'old_record',
                    (
                        select jsonb_object_agg((c).name, (c).value)
                        from unnest(old_columns) c
                        where
                            (c).is_selectable
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                            and ( not is_rls_enabled or (c).is_pkey ) -- if RLS enabled, we can't secure deletes so filter to pkey
                    )
                )
            else '{}'::jsonb
        end;

        -- Create the prepared statement
        if is_rls_enabled and action <> 'DELETE' then
            if (select 1 from pg_prepared_statements where name = 'walrus_rls_stmt' limit 1) > 0 then
                deallocate walrus_rls_stmt;
            end if;
            execute realtime.build_prepared_statement_sql('walrus_rls_stmt', entity_, columns);
        end if;

        visible_to_subscription_ids = '{}';

        for subscription_id, claims in (
                select
                    subs.subscription_id,
                    subs.claims
                from
                    unnest(subscriptions) subs
                where
                    subs.entity = entity_
                    and subs.claims_role = working_role
                    and (
                        realtime.is_visible_through_filters(columns, subs.filters)
                        or (
                          action = 'DELETE'
                          and realtime.is_visible_through_filters(old_columns, subs.filters)
                        )
                    )
        ) loop

            if not is_rls_enabled or action = 'DELETE' then
                visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
            else
                -- Check if RLS allows the role to see the record
                perform
                    -- Trim leading and trailing quotes from working_role because set_config
                    -- doesn't recognize the role as valid if they are included
                    set_config('role', trim(both '"' from working_role::text), true),
                    set_config('request.jwt.claims', claims::text, true);

                execute 'execute walrus_rls_stmt' into subscription_has_access;

                if subscription_has_access then
                    visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
                end if;
            end if;
        end loop;

        perform set_config('role', null, true);

        return next (
            output,
            is_rls_enabled,
            visible_to_subscription_ids,
            case
                when error_record_exceeds_max_size then array['Error 413: Payload Too Large']
                else '{}'
            end
        )::realtime.wal_rls;

    end if;
end loop;

perform set_config('role', null, true);
end;
$$;


ALTER FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) OWNER TO supabase_admin;

--
-- Name: broadcast_changes(text, text, text, text, text, record, record, text); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text DEFAULT 'ROW'::text) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    -- Declare a variable to hold the JSONB representation of the row
    row_data jsonb := '{}'::jsonb;
BEGIN
    IF level = 'STATEMENT' THEN
        RAISE EXCEPTION 'function can only be triggered for each row, not for each statement';
    END IF;
    -- Check the operation type and handle accordingly
    IF operation = 'INSERT' OR operation = 'UPDATE' OR operation = 'DELETE' THEN
        row_data := jsonb_build_object('old_record', OLD, 'record', NEW, 'operation', operation, 'table', table_name, 'schema', table_schema);
        PERFORM realtime.send (row_data, event_name, topic_name);
    ELSE
        RAISE EXCEPTION 'Unexpected operation type: %', operation;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to process the row: %', SQLERRM;
END;

$$;


ALTER FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) OWNER TO supabase_admin;

--
-- Name: build_prepared_statement_sql(text, regclass, realtime.wal_column[]); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) RETURNS text
    LANGUAGE sql
    AS $$
      /*
      Builds a sql string that, if executed, creates a prepared statement to
      tests retrive a row from *entity* by its primary key columns.
      Example
          select realtime.build_prepared_statement_sql('public.notes', '{"id"}'::text[], '{"bigint"}'::text[])
      */
          select
      'prepare ' || prepared_statement_name || ' as
          select
              exists(
                  select
                      1
                  from
                      ' || entity || '
                  where
                      ' || string_agg(quote_ident(pkc.name) || '=' || quote_nullable(pkc.value #>> '{}') , ' and ') || '
              )'
          from
              unnest(columns) pkc
          where
              pkc.is_pkey
          group by
              entity
      $$;


ALTER FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) OWNER TO supabase_admin;

--
-- Name: cast(text, regtype); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime."cast"(val text, type_ regtype) RETURNS jsonb
    LANGUAGE plpgsql IMMUTABLE
    AS $$
    declare
      res jsonb;
    begin
      execute format('select to_jsonb(%L::'|| type_::text || ')', val)  into res;
      return res;
    end
    $$;


ALTER FUNCTION realtime."cast"(val text, type_ regtype) OWNER TO supabase_admin;

--
-- Name: check_equality_op(realtime.equality_op, regtype, text, text); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) RETURNS boolean
    LANGUAGE plpgsql IMMUTABLE
    AS $$
      /*
      Casts *val_1* and *val_2* as type *type_* and check the *op* condition for truthiness
      */
      declare
          op_symbol text = (
              case
                  when op = 'eq' then '='
                  when op = 'neq' then '!='
                  when op = 'lt' then '<'
                  when op = 'lte' then '<='
                  when op = 'gt' then '>'
                  when op = 'gte' then '>='
                  when op = 'in' then '= any'
                  else 'UNKNOWN OP'
              end
          );
          res boolean;
      begin
          execute format(
              'select %L::'|| type_::text || ' ' || op_symbol
              || ' ( %L::'
              || (
                  case
                      when op = 'in' then type_::text || '[]'
                      else type_::text end
              )
              || ')', val_1, val_2) into res;
          return res;
      end;
      $$;


ALTER FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) OWNER TO supabase_admin;

--
-- Name: is_visible_through_filters(realtime.wal_column[], realtime.user_defined_filter[]); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) RETURNS boolean
    LANGUAGE sql IMMUTABLE
    AS $_$
    /*
    Should the record be visible (true) or filtered out (false) after *filters* are applied
    */
        select
            -- Default to allowed when no filters present
            $2 is null -- no filters. this should not happen because subscriptions has a default
            or array_length($2, 1) is null -- array length of an empty array is null
            or bool_and(
                coalesce(
                    realtime.check_equality_op(
                        op:=f.op,
                        type_:=coalesce(
                            col.type_oid::regtype, -- null when wal2json version <= 2.4
                            col.type_name::regtype
                        ),
                        -- cast jsonb to text
                        val_1:=col.value #>> '{}',
                        val_2:=f.value
                    ),
                    false -- if null, filter does not match
                )
            )
        from
            unnest(filters) f
            join unnest(columns) col
                on f.column_name = col.name;
    $_$;


ALTER FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) OWNER TO supabase_admin;

--
-- Name: list_changes(name, name, integer, integer); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) RETURNS SETOF realtime.wal_rls
    LANGUAGE sql
    SET log_min_messages TO 'fatal'
    AS $$
      with pub as (
        select
          concat_ws(
            ',',
            case when bool_or(pubinsert) then 'insert' else null end,
            case when bool_or(pubupdate) then 'update' else null end,
            case when bool_or(pubdelete) then 'delete' else null end
          ) as w2j_actions,
          coalesce(
            string_agg(
              realtime.quote_wal2json(format('%I.%I', schemaname, tablename)::regclass),
              ','
            ) filter (where ppt.tablename is not null and ppt.tablename not like '% %'),
            ''
          ) w2j_add_tables
        from
          pg_publication pp
          left join pg_publication_tables ppt
            on pp.pubname = ppt.pubname
        where
          pp.pubname = publication
        group by
          pp.pubname
        limit 1
      ),
      w2j as (
        select
          x.*, pub.w2j_add_tables
        from
          pub,
          pg_logical_slot_get_changes(
            slot_name, null, max_changes,
            'include-pk', 'true',
            'include-transaction', 'false',
            'include-timestamp', 'true',
            'include-type-oids', 'true',
            'format-version', '2',
            'actions', pub.w2j_actions,
            'add-tables', pub.w2j_add_tables
          ) x
      )
      select
        xyz.wal,
        xyz.is_rls_enabled,
        xyz.subscription_ids,
        xyz.errors
      from
        w2j,
        realtime.apply_rls(
          wal := w2j.data::jsonb,
          max_record_bytes := max_record_bytes
        ) xyz(wal, is_rls_enabled, subscription_ids, errors)
      where
        w2j.w2j_add_tables <> ''
        and xyz.subscription_ids[1] is not null
    $$;


ALTER FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) OWNER TO supabase_admin;

--
-- Name: quote_wal2json(regclass); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.quote_wal2json(entity regclass) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
      select
        (
          select string_agg('' || ch,'')
          from unnest(string_to_array(nsp.nspname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
        )
        || '.'
        || (
          select string_agg('' || ch,'')
          from unnest(string_to_array(pc.relname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
          )
      from
        pg_class pc
        join pg_namespace nsp
          on pc.relnamespace = nsp.oid
      where
        pc.oid = entity
    $$;


ALTER FUNCTION realtime.quote_wal2json(entity regclass) OWNER TO supabase_admin;

--
-- Name: send(jsonb, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean DEFAULT true) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
  generated_id uuid;
  final_payload jsonb;
BEGIN
  BEGIN
    -- Generate a new UUID for the id
    generated_id := gen_random_uuid();

    -- Check if payload has an 'id' key, if not, add the generated UUID
    IF payload ? 'id' THEN
      final_payload := payload;
    ELSE
      final_payload := jsonb_set(payload, '{id}', to_jsonb(generated_id));
    END IF;

    -- Set the topic configuration
    EXECUTE format('SET LOCAL realtime.topic TO %L', topic);

    -- Attempt to insert the message
    INSERT INTO realtime.messages (id, payload, event, topic, private, extension)
    VALUES (generated_id, final_payload, event, topic, private, 'broadcast');
  EXCEPTION
    WHEN OTHERS THEN
      -- Capture and notify the error
      RAISE WARNING 'ErrorSendingBroadcastMessage: %', SQLERRM;
  END;
END;
$$;


ALTER FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) OWNER TO supabase_admin;

--
-- Name: subscription_check_filters(); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.subscription_check_filters() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    /*
    Validates that the user defined filters for a subscription:
    - refer to valid columns that the claimed role may access
    - values are coercable to the correct column type
    */
    declare
        col_names text[] = coalesce(
                array_agg(c.column_name order by c.ordinal_position),
                '{}'::text[]
            )
            from
                information_schema.columns c
            where
                format('%I.%I', c.table_schema, c.table_name)::regclass = new.entity
                and pg_catalog.has_column_privilege(
                    (new.claims ->> 'role'),
                    format('%I.%I', c.table_schema, c.table_name)::regclass,
                    c.column_name,
                    'SELECT'
                );
        filter realtime.user_defined_filter;
        col_type regtype;

        in_val jsonb;
    begin
        for filter in select * from unnest(new.filters) loop
            -- Filtered column is valid
            if not filter.column_name = any(col_names) then
                raise exception 'invalid column for filter %', filter.column_name;
            end if;

            -- Type is sanitized and safe for string interpolation
            col_type = (
                select atttypid::regtype
                from pg_catalog.pg_attribute
                where attrelid = new.entity
                      and attname = filter.column_name
            );
            if col_type is null then
                raise exception 'failed to lookup type for column %', filter.column_name;
            end if;

            -- Set maximum number of entries for in filter
            if filter.op = 'in'::realtime.equality_op then
                in_val = realtime.cast(filter.value, (col_type::text || '[]')::regtype);
                if coalesce(jsonb_array_length(in_val), 0) > 100 then
                    raise exception 'too many values for `in` filter. Maximum 100';
                end if;
            else
                -- raises an exception if value is not coercable to type
                perform realtime.cast(filter.value, col_type);
            end if;

        end loop;

        -- Apply consistent order to filters so the unique constraint on
        -- (subscription_id, entity, filters) can't be tricked by a different filter order
        new.filters = coalesce(
            array_agg(f order by f.column_name, f.op, f.value),
            '{}'
        ) from unnest(new.filters) f;

        return new;
    end;
    $$;


ALTER FUNCTION realtime.subscription_check_filters() OWNER TO supabase_admin;

--
-- Name: to_regrole(text); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.to_regrole(role_name text) RETURNS regrole
    LANGUAGE sql IMMUTABLE
    AS $$ select role_name::regrole $$;


ALTER FUNCTION realtime.to_regrole(role_name text) OWNER TO supabase_admin;

--
-- Name: topic(); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.topic() RETURNS text
    LANGUAGE sql STABLE
    AS $$
select nullif(current_setting('realtime.topic', true), '')::text;
$$;


ALTER FUNCTION realtime.topic() OWNER TO supabase_realtime_admin;

--
-- Name: can_insert_object(text, text, uuid, jsonb); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO "storage"."objects" ("bucket_id", "name", "owner", "metadata") VALUES (bucketid, name, owner, metadata);
  -- hack to rollback the successful insert
  RAISE sqlstate 'PT200' using
  message = 'ROLLBACK',
  detail = 'rollback successful insert';
END
$$;


ALTER FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) OWNER TO supabase_storage_admin;

--
-- Name: enforce_bucket_name_length(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.enforce_bucket_name_length() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
    if length(new.name) > 100 then
        raise exception 'bucket name "%" is too long (% characters). Max is 100.', new.name, length(new.name);
    end if;
    return new;
end;
$$;


ALTER FUNCTION storage.enforce_bucket_name_length() OWNER TO supabase_storage_admin;

--
-- Name: extension(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.extension(name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
_filename text;
BEGIN
	select string_to_array(name, '/') into _parts;
	select _parts[array_length(_parts,1)] into _filename;
	-- @todo return the last part instead of 2
	return reverse(split_part(reverse(_filename), '.', 1));
END
$$;


ALTER FUNCTION storage.extension(name text) OWNER TO supabase_storage_admin;

--
-- Name: filename(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.filename(name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[array_length(_parts,1)];
END
$$;


ALTER FUNCTION storage.filename(name text) OWNER TO supabase_storage_admin;

--
-- Name: foldername(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.foldername(name text) RETURNS text[]
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[1:array_length(_parts,1)-1];
END
$$;


ALTER FUNCTION storage.foldername(name text) OWNER TO supabase_storage_admin;

--
-- Name: get_common_prefix(text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_common_prefix(p_key text, p_prefix text, p_delimiter text) RETURNS text
    LANGUAGE sql IMMUTABLE
    AS $$
SELECT CASE
    WHEN position(p_delimiter IN substring(p_key FROM length(p_prefix) + 1)) > 0
    THEN left(p_key, length(p_prefix) + position(p_delimiter IN substring(p_key FROM length(p_prefix) + 1)))
    ELSE NULL
END;
$$;


ALTER FUNCTION storage.get_common_prefix(p_key text, p_prefix text, p_delimiter text) OWNER TO supabase_storage_admin;

--
-- Name: get_size_by_bucket(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_size_by_bucket() RETURNS TABLE(size bigint, bucket_id text)
    LANGUAGE plpgsql
    AS $$
BEGIN
    return query
        select sum((metadata->>'size')::int) as size, obj.bucket_id
        from "storage".objects as obj
        group by obj.bucket_id;
END
$$;


ALTER FUNCTION storage.get_size_by_bucket() OWNER TO supabase_storage_admin;

--
-- Name: list_multipart_uploads_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, next_key_token text DEFAULT ''::text, next_upload_token text DEFAULT ''::text) RETURNS TABLE(key text, id text, created_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(key COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                        substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1)))
                    ELSE
                        key
                END AS key, id, created_at
            FROM
                storage.s3_multipart_uploads
            WHERE
                bucket_id = $5 AND
                key ILIKE $1 || ''%'' AND
                CASE
                    WHEN $4 != '''' AND $6 = '''' THEN
                        CASE
                            WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                                substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                key COLLATE "C" > $4
                            END
                    ELSE
                        true
                END AND
                CASE
                    WHEN $6 != '''' THEN
                        id COLLATE "C" > $6
                    ELSE
                        true
                    END
            ORDER BY
                key COLLATE "C" ASC, created_at ASC) as e order by key COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_key_token, bucket_id, next_upload_token;
END;
$_$;


ALTER FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer, next_key_token text, next_upload_token text) OWNER TO supabase_storage_admin;

--
-- Name: list_objects_with_delimiter(text, text, text, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.list_objects_with_delimiter(_bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, start_after text DEFAULT ''::text, next_token text DEFAULT ''::text, sort_order text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, metadata jsonb, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    v_peek_name TEXT;
    v_current RECORD;
    v_common_prefix TEXT;

    -- Configuration
    v_is_asc BOOLEAN;
    v_prefix TEXT;
    v_start TEXT;
    v_upper_bound TEXT;
    v_file_batch_size INT;

    -- Seek state
    v_next_seek TEXT;
    v_count INT := 0;

    -- Dynamic SQL for batch query only
    v_batch_query TEXT;

BEGIN
    -- ========================================================================
    -- INITIALIZATION
    -- ========================================================================
    v_is_asc := lower(coalesce(sort_order, 'asc')) = 'asc';
    v_prefix := coalesce(prefix_param, '');
    v_start := CASE WHEN coalesce(next_token, '') <> '' THEN next_token ELSE coalesce(start_after, '') END;
    v_file_batch_size := LEAST(GREATEST(max_keys * 2, 100), 1000);

    -- Calculate upper bound for prefix filtering (bytewise, using COLLATE "C")
    IF v_prefix = '' THEN
        v_upper_bound := NULL;
    ELSIF right(v_prefix, 1) = delimiter_param THEN
        v_upper_bound := left(v_prefix, -1) || chr(ascii(delimiter_param) + 1);
    ELSE
        v_upper_bound := left(v_prefix, -1) || chr(ascii(right(v_prefix, 1)) + 1);
    END IF;

    -- Build batch query (dynamic SQL - called infrequently, amortized over many rows)
    IF v_is_asc THEN
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" >= $2 ' ||
                'AND o.name COLLATE "C" < $3 ORDER BY o.name COLLATE "C" ASC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" >= $2 ' ||
                'ORDER BY o.name COLLATE "C" ASC LIMIT $4';
        END IF;
    ELSE
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" < $2 ' ||
                'AND o.name COLLATE "C" >= $3 ORDER BY o.name COLLATE "C" DESC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" < $2 ' ||
                'ORDER BY o.name COLLATE "C" DESC LIMIT $4';
        END IF;
    END IF;

    -- ========================================================================
    -- SEEK INITIALIZATION: Determine starting position
    -- ========================================================================
    IF v_start = '' THEN
        IF v_is_asc THEN
            v_next_seek := v_prefix;
        ELSE
            -- DESC without cursor: find the last item in range
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_next_seek FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_prefix AND o.name COLLATE "C" < v_upper_bound
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSIF v_prefix <> '' THEN
                SELECT o.name INTO v_next_seek FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_prefix
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSE
                SELECT o.name INTO v_next_seek FROM storage.objects o
                WHERE o.bucket_id = _bucket_id
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            END IF;

            IF v_next_seek IS NOT NULL THEN
                v_next_seek := v_next_seek || delimiter_param;
            ELSE
                RETURN;
            END IF;
        END IF;
    ELSE
        -- Cursor provided: determine if it refers to a folder or leaf
        IF EXISTS (
            SELECT 1 FROM storage.objects o
            WHERE o.bucket_id = _bucket_id
              AND o.name COLLATE "C" LIKE v_start || delimiter_param || '%'
            LIMIT 1
        ) THEN
            -- Cursor refers to a folder
            IF v_is_asc THEN
                v_next_seek := v_start || chr(ascii(delimiter_param) + 1);
            ELSE
                v_next_seek := v_start || delimiter_param;
            END IF;
        ELSE
            -- Cursor refers to a leaf object
            IF v_is_asc THEN
                v_next_seek := v_start || delimiter_param;
            ELSE
                v_next_seek := v_start;
            END IF;
        END IF;
    END IF;

    -- ========================================================================
    -- MAIN LOOP: Hybrid peek-then-batch algorithm
    -- Uses STATIC SQL for peek (hot path) and DYNAMIC SQL for batch
    -- ========================================================================
    LOOP
        EXIT WHEN v_count >= max_keys;

        -- STEP 1: PEEK using STATIC SQL (plan cached, very fast)
        IF v_is_asc THEN
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_next_seek AND o.name COLLATE "C" < v_upper_bound
                ORDER BY o.name COLLATE "C" ASC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_next_seek
                ORDER BY o.name COLLATE "C" ASC LIMIT 1;
            END IF;
        ELSE
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" < v_next_seek AND o.name COLLATE "C" >= v_prefix
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSIF v_prefix <> '' THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" < v_next_seek AND o.name COLLATE "C" >= v_prefix
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" < v_next_seek
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            END IF;
        END IF;

        EXIT WHEN v_peek_name IS NULL;

        -- STEP 2: Check if this is a FOLDER or FILE
        v_common_prefix := storage.get_common_prefix(v_peek_name, v_prefix, delimiter_param);

        IF v_common_prefix IS NOT NULL THEN
            -- FOLDER: Emit and skip to next folder (no heap access needed)
            name := rtrim(v_common_prefix, delimiter_param);
            id := NULL;
            updated_at := NULL;
            created_at := NULL;
            last_accessed_at := NULL;
            metadata := NULL;
            RETURN NEXT;
            v_count := v_count + 1;

            -- Advance seek past the folder range
            IF v_is_asc THEN
                v_next_seek := left(v_common_prefix, -1) || chr(ascii(delimiter_param) + 1);
            ELSE
                v_next_seek := v_common_prefix;
            END IF;
        ELSE
            -- FILE: Batch fetch using DYNAMIC SQL (overhead amortized over many rows)
            -- For ASC: upper_bound is the exclusive upper limit (< condition)
            -- For DESC: prefix is the inclusive lower limit (>= condition)
            FOR v_current IN EXECUTE v_batch_query USING _bucket_id, v_next_seek,
                CASE WHEN v_is_asc THEN COALESCE(v_upper_bound, v_prefix) ELSE v_prefix END, v_file_batch_size
            LOOP
                v_common_prefix := storage.get_common_prefix(v_current.name, v_prefix, delimiter_param);

                IF v_common_prefix IS NOT NULL THEN
                    -- Hit a folder: exit batch, let peek handle it
                    v_next_seek := v_current.name;
                    EXIT;
                END IF;

                -- Emit file
                name := v_current.name;
                id := v_current.id;
                updated_at := v_current.updated_at;
                created_at := v_current.created_at;
                last_accessed_at := v_current.last_accessed_at;
                metadata := v_current.metadata;
                RETURN NEXT;
                v_count := v_count + 1;

                -- Advance seek past this file
                IF v_is_asc THEN
                    v_next_seek := v_current.name || delimiter_param;
                ELSE
                    v_next_seek := v_current.name;
                END IF;

                EXIT WHEN v_count >= max_keys;
            END LOOP;
        END IF;
    END LOOP;
END;
$_$;


ALTER FUNCTION storage.list_objects_with_delimiter(_bucket_id text, prefix_param text, delimiter_param text, max_keys integer, start_after text, next_token text, sort_order text) OWNER TO supabase_storage_admin;

--
-- Name: operation(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.operation() RETURNS text
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    RETURN current_setting('storage.operation', true);
END;
$$;


ALTER FUNCTION storage.operation() OWNER TO supabase_storage_admin;

--
-- Name: protect_delete(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.protect_delete() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Check if storage.allow_delete_query is set to 'true'
    IF COALESCE(current_setting('storage.allow_delete_query', true), 'false') != 'true' THEN
        RAISE EXCEPTION 'Direct deletion from storage tables is not allowed. Use the Storage API instead.'
            USING HINT = 'This prevents accidental data loss from orphaned objects.',
                  ERRCODE = '42501';
    END IF;
    RETURN NULL;
END;
$$;


ALTER FUNCTION storage.protect_delete() OWNER TO supabase_storage_admin;

--
-- Name: search(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    v_peek_name TEXT;
    v_current RECORD;
    v_common_prefix TEXT;
    v_delimiter CONSTANT TEXT := '/';

    -- Configuration
    v_limit INT;
    v_prefix TEXT;
    v_prefix_lower TEXT;
    v_is_asc BOOLEAN;
    v_order_by TEXT;
    v_sort_order TEXT;
    v_upper_bound TEXT;
    v_file_batch_size INT;

    -- Dynamic SQL for batch query only
    v_batch_query TEXT;

    -- Seek state
    v_next_seek TEXT;
    v_count INT := 0;
    v_skipped INT := 0;
BEGIN
    -- ========================================================================
    -- INITIALIZATION
    -- ========================================================================
    v_limit := LEAST(coalesce(limits, 100), 1500);
    v_prefix := coalesce(prefix, '') || coalesce(search, '');
    v_prefix_lower := lower(v_prefix);
    v_is_asc := lower(coalesce(sortorder, 'asc')) = 'asc';
    v_file_batch_size := LEAST(GREATEST(v_limit * 2, 100), 1000);

    -- Validate sort column
    CASE lower(coalesce(sortcolumn, 'name'))
        WHEN 'name' THEN v_order_by := 'name';
        WHEN 'updated_at' THEN v_order_by := 'updated_at';
        WHEN 'created_at' THEN v_order_by := 'created_at';
        WHEN 'last_accessed_at' THEN v_order_by := 'last_accessed_at';
        ELSE v_order_by := 'name';
    END CASE;

    v_sort_order := CASE WHEN v_is_asc THEN 'asc' ELSE 'desc' END;

    -- ========================================================================
    -- NON-NAME SORTING: Use path_tokens approach (unchanged)
    -- ========================================================================
    IF v_order_by != 'name' THEN
        RETURN QUERY EXECUTE format(
            $sql$
            WITH folders AS (
                SELECT path_tokens[$1] AS folder
                FROM storage.objects
                WHERE objects.name ILIKE $2 || '%%'
                  AND bucket_id = $3
                  AND array_length(objects.path_tokens, 1) <> $1
                GROUP BY folder
                ORDER BY folder %s
            )
            (SELECT folder AS "name",
                   NULL::uuid AS id,
                   NULL::timestamptz AS updated_at,
                   NULL::timestamptz AS created_at,
                   NULL::timestamptz AS last_accessed_at,
                   NULL::jsonb AS metadata FROM folders)
            UNION ALL
            (SELECT path_tokens[$1] AS "name",
                   id, updated_at, created_at, last_accessed_at, metadata
             FROM storage.objects
             WHERE objects.name ILIKE $2 || '%%'
               AND bucket_id = $3
               AND array_length(objects.path_tokens, 1) = $1
             ORDER BY %I %s)
            LIMIT $4 OFFSET $5
            $sql$, v_sort_order, v_order_by, v_sort_order
        ) USING levels, v_prefix, bucketname, v_limit, offsets;
        RETURN;
    END IF;

    -- ========================================================================
    -- NAME SORTING: Hybrid skip-scan with batch optimization
    -- ========================================================================

    -- Calculate upper bound for prefix filtering
    IF v_prefix_lower = '' THEN
        v_upper_bound := NULL;
    ELSIF right(v_prefix_lower, 1) = v_delimiter THEN
        v_upper_bound := left(v_prefix_lower, -1) || chr(ascii(v_delimiter) + 1);
    ELSE
        v_upper_bound := left(v_prefix_lower, -1) || chr(ascii(right(v_prefix_lower, 1)) + 1);
    END IF;

    -- Build batch query (dynamic SQL - called infrequently, amortized over many rows)
    IF v_is_asc THEN
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" >= $2 ' ||
                'AND lower(o.name) COLLATE "C" < $3 ORDER BY lower(o.name) COLLATE "C" ASC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" >= $2 ' ||
                'ORDER BY lower(o.name) COLLATE "C" ASC LIMIT $4';
        END IF;
    ELSE
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" < $2 ' ||
                'AND lower(o.name) COLLATE "C" >= $3 ORDER BY lower(o.name) COLLATE "C" DESC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" < $2 ' ||
                'ORDER BY lower(o.name) COLLATE "C" DESC LIMIT $4';
        END IF;
    END IF;

    -- Initialize seek position
    IF v_is_asc THEN
        v_next_seek := v_prefix_lower;
    ELSE
        -- DESC: find the last item in range first (static SQL)
        IF v_upper_bound IS NOT NULL THEN
            SELECT o.name INTO v_peek_name FROM storage.objects o
            WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_prefix_lower AND lower(o.name) COLLATE "C" < v_upper_bound
            ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
        ELSIF v_prefix_lower <> '' THEN
            SELECT o.name INTO v_peek_name FROM storage.objects o
            WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_prefix_lower
            ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
        ELSE
            SELECT o.name INTO v_peek_name FROM storage.objects o
            WHERE o.bucket_id = bucketname
            ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
        END IF;

        IF v_peek_name IS NOT NULL THEN
            v_next_seek := lower(v_peek_name) || v_delimiter;
        ELSE
            RETURN;
        END IF;
    END IF;

    -- ========================================================================
    -- MAIN LOOP: Hybrid peek-then-batch algorithm
    -- Uses STATIC SQL for peek (hot path) and DYNAMIC SQL for batch
    -- ========================================================================
    LOOP
        EXIT WHEN v_count >= v_limit;

        -- STEP 1: PEEK using STATIC SQL (plan cached, very fast)
        IF v_is_asc THEN
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_next_seek AND lower(o.name) COLLATE "C" < v_upper_bound
                ORDER BY lower(o.name) COLLATE "C" ASC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_next_seek
                ORDER BY lower(o.name) COLLATE "C" ASC LIMIT 1;
            END IF;
        ELSE
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" < v_next_seek AND lower(o.name) COLLATE "C" >= v_prefix_lower
                ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
            ELSIF v_prefix_lower <> '' THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" < v_next_seek AND lower(o.name) COLLATE "C" >= v_prefix_lower
                ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" < v_next_seek
                ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
            END IF;
        END IF;

        EXIT WHEN v_peek_name IS NULL;

        -- STEP 2: Check if this is a FOLDER or FILE
        v_common_prefix := storage.get_common_prefix(lower(v_peek_name), v_prefix_lower, v_delimiter);

        IF v_common_prefix IS NOT NULL THEN
            -- FOLDER: Handle offset, emit if needed, skip to next folder
            IF v_skipped < offsets THEN
                v_skipped := v_skipped + 1;
            ELSE
                name := split_part(rtrim(v_common_prefix, v_delimiter), v_delimiter, levels);
                id := NULL;
                updated_at := NULL;
                created_at := NULL;
                last_accessed_at := NULL;
                metadata := NULL;
                RETURN NEXT;
                v_count := v_count + 1;
            END IF;

            -- Advance seek past the folder range
            IF v_is_asc THEN
                v_next_seek := lower(left(v_common_prefix, -1)) || chr(ascii(v_delimiter) + 1);
            ELSE
                v_next_seek := lower(v_common_prefix);
            END IF;
        ELSE
            -- FILE: Batch fetch using DYNAMIC SQL (overhead amortized over many rows)
            -- For ASC: upper_bound is the exclusive upper limit (< condition)
            -- For DESC: prefix_lower is the inclusive lower limit (>= condition)
            FOR v_current IN EXECUTE v_batch_query
                USING bucketname, v_next_seek,
                    CASE WHEN v_is_asc THEN COALESCE(v_upper_bound, v_prefix_lower) ELSE v_prefix_lower END, v_file_batch_size
            LOOP
                v_common_prefix := storage.get_common_prefix(lower(v_current.name), v_prefix_lower, v_delimiter);

                IF v_common_prefix IS NOT NULL THEN
                    -- Hit a folder: exit batch, let peek handle it
                    v_next_seek := lower(v_current.name);
                    EXIT;
                END IF;

                -- Handle offset skipping
                IF v_skipped < offsets THEN
                    v_skipped := v_skipped + 1;
                ELSE
                    -- Emit file
                    name := split_part(v_current.name, v_delimiter, levels);
                    id := v_current.id;
                    updated_at := v_current.updated_at;
                    created_at := v_current.created_at;
                    last_accessed_at := v_current.last_accessed_at;
                    metadata := v_current.metadata;
                    RETURN NEXT;
                    v_count := v_count + 1;
                END IF;

                -- Advance seek past this file
                IF v_is_asc THEN
                    v_next_seek := lower(v_current.name) || v_delimiter;
                ELSE
                    v_next_seek := lower(v_current.name);
                END IF;

                EXIT WHEN v_count >= v_limit;
            END LOOP;
        END IF;
    END LOOP;
END;
$_$;


ALTER FUNCTION storage.search(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text) OWNER TO supabase_storage_admin;

--
-- Name: search_by_timestamp(text, text, integer, integer, text, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search_by_timestamp(p_prefix text, p_bucket_id text, p_limit integer, p_level integer, p_start_after text, p_sort_order text, p_sort_column text, p_sort_column_after text) RETURNS TABLE(key text, name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    v_cursor_op text;
    v_query text;
    v_prefix text;
BEGIN
    v_prefix := coalesce(p_prefix, '');

    IF p_sort_order = 'asc' THEN
        v_cursor_op := '>';
    ELSE
        v_cursor_op := '<';
    END IF;

    v_query := format($sql$
        WITH raw_objects AS (
            SELECT
                o.name AS obj_name,
                o.id AS obj_id,
                o.updated_at AS obj_updated_at,
                o.created_at AS obj_created_at,
                o.last_accessed_at AS obj_last_accessed_at,
                o.metadata AS obj_metadata,
                storage.get_common_prefix(o.name, $1, '/') AS common_prefix
            FROM storage.objects o
            WHERE o.bucket_id = $2
              AND o.name COLLATE "C" LIKE $1 || '%%'
        ),
        -- Aggregate common prefixes (folders)
        -- Both created_at and updated_at use MIN(obj_created_at) to match the old prefixes table behavior
        aggregated_prefixes AS (
            SELECT
                rtrim(common_prefix, '/') AS name,
                NULL::uuid AS id,
                MIN(obj_created_at) AS updated_at,
                MIN(obj_created_at) AS created_at,
                NULL::timestamptz AS last_accessed_at,
                NULL::jsonb AS metadata,
                TRUE AS is_prefix
            FROM raw_objects
            WHERE common_prefix IS NOT NULL
            GROUP BY common_prefix
        ),
        leaf_objects AS (
            SELECT
                obj_name AS name,
                obj_id AS id,
                obj_updated_at AS updated_at,
                obj_created_at AS created_at,
                obj_last_accessed_at AS last_accessed_at,
                obj_metadata AS metadata,
                FALSE AS is_prefix
            FROM raw_objects
            WHERE common_prefix IS NULL
        ),
        combined AS (
            SELECT * FROM aggregated_prefixes
            UNION ALL
            SELECT * FROM leaf_objects
        ),
        filtered AS (
            SELECT *
            FROM combined
            WHERE (
                $5 = ''
                OR ROW(
                    date_trunc('milliseconds', %I),
                    name COLLATE "C"
                ) %s ROW(
                    COALESCE(NULLIF($6, '')::timestamptz, 'epoch'::timestamptz),
                    $5
                )
            )
        )
        SELECT
            split_part(name, '/', $3) AS key,
            name,
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
        FROM filtered
        ORDER BY
            COALESCE(date_trunc('milliseconds', %I), 'epoch'::timestamptz) %s,
            name COLLATE "C" %s
        LIMIT $4
    $sql$,
        p_sort_column,
        v_cursor_op,
        p_sort_column,
        p_sort_order,
        p_sort_order
    );

    RETURN QUERY EXECUTE v_query
    USING v_prefix, p_bucket_id, p_level, p_limit, p_start_after, p_sort_column_after;
END;
$_$;


ALTER FUNCTION storage.search_by_timestamp(p_prefix text, p_bucket_id text, p_limit integer, p_level integer, p_start_after text, p_sort_order text, p_sort_column text, p_sort_column_after text) OWNER TO supabase_storage_admin;

--
-- Name: search_v2(text, text, integer, integer, text, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer DEFAULT 100, levels integer DEFAULT 1, start_after text DEFAULT ''::text, sort_order text DEFAULT 'asc'::text, sort_column text DEFAULT 'name'::text, sort_column_after text DEFAULT ''::text) RETURNS TABLE(key text, name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    v_sort_col text;
    v_sort_ord text;
    v_limit int;
BEGIN
    -- Cap limit to maximum of 1500 records
    v_limit := LEAST(coalesce(limits, 100), 1500);

    -- Validate and normalize sort_order
    v_sort_ord := lower(coalesce(sort_order, 'asc'));
    IF v_sort_ord NOT IN ('asc', 'desc') THEN
        v_sort_ord := 'asc';
    END IF;

    -- Validate and normalize sort_column
    v_sort_col := lower(coalesce(sort_column, 'name'));
    IF v_sort_col NOT IN ('name', 'updated_at', 'created_at') THEN
        v_sort_col := 'name';
    END IF;

    -- Route to appropriate implementation
    IF v_sort_col = 'name' THEN
        -- Use list_objects_with_delimiter for name sorting (most efficient: O(k * log n))
        RETURN QUERY
        SELECT
            split_part(l.name, '/', levels) AS key,
            l.name AS name,
            l.id,
            l.updated_at,
            l.created_at,
            l.last_accessed_at,
            l.metadata
        FROM storage.list_objects_with_delimiter(
            bucket_name,
            coalesce(prefix, ''),
            '/',
            v_limit,
            start_after,
            '',
            v_sort_ord
        ) l;
    ELSE
        -- Use aggregation approach for timestamp sorting
        -- Not efficient for large datasets but supports correct pagination
        RETURN QUERY SELECT * FROM storage.search_by_timestamp(
            prefix, bucket_name, v_limit, levels, start_after,
            v_sort_ord, v_sort_col, sort_column_after
        );
    END IF;
END;
$$;


ALTER FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer, levels integer, start_after text, sort_order text, sort_column text, sort_column_after text) OWNER TO supabase_storage_admin;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$;


ALTER FUNCTION storage.update_updated_at_column() OWNER TO supabase_storage_admin;

--
-- Name: http_request(); Type: FUNCTION; Schema: supabase_functions; Owner: supabase_functions_admin
--

CREATE FUNCTION supabase_functions.http_request() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'supabase_functions'
    AS $$
  DECLARE
    request_id bigint;
    payload jsonb;
    url text := TG_ARGV[0]::text;
    method text := TG_ARGV[1]::text;
    headers jsonb DEFAULT '{}'::jsonb;
    params jsonb DEFAULT '{}'::jsonb;
    timeout_ms integer DEFAULT 1000;
  BEGIN
    IF url IS NULL OR url = 'null' THEN
      RAISE EXCEPTION 'url argument is missing';
    END IF;

    IF method IS NULL OR method = 'null' THEN
      RAISE EXCEPTION 'method argument is missing';
    END IF;

    IF TG_ARGV[2] IS NULL OR TG_ARGV[2] = 'null' THEN
      headers = '{"Content-Type": "application/json"}'::jsonb;
    ELSE
      headers = TG_ARGV[2]::jsonb;
    END IF;

    IF TG_ARGV[3] IS NULL OR TG_ARGV[3] = 'null' THEN
      params = '{}'::jsonb;
    ELSE
      params = TG_ARGV[3]::jsonb;
    END IF;

    IF TG_ARGV[4] IS NULL OR TG_ARGV[4] = 'null' THEN
      timeout_ms = 1000;
    ELSE
      timeout_ms = TG_ARGV[4]::integer;
    END IF;

    CASE
      WHEN method = 'GET' THEN
        SELECT http_get INTO request_id FROM net.http_get(
          url,
          params,
          headers,
          timeout_ms
        );
      WHEN method = 'POST' THEN
        payload = jsonb_build_object(
          'old_record', OLD,
          'record', NEW,
          'type', TG_OP,
          'table', TG_TABLE_NAME,
          'schema', TG_TABLE_SCHEMA
        );

        SELECT http_post INTO request_id FROM net.http_post(
          url,
          payload,
          params,
          headers,
          timeout_ms
        );
      ELSE
        RAISE EXCEPTION 'method argument % is invalid', method;
    END CASE;

    INSERT INTO supabase_functions.hooks
      (hook_table_id, hook_name, request_id)
    VALUES
      (TG_RELID, TG_NAME, request_id);

    RETURN NEW;
  END
$$;


ALTER FUNCTION supabase_functions.http_request() OWNER TO supabase_functions_admin;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: extensions; Type: TABLE; Schema: _realtime; Owner: supabase_admin
--

CREATE TABLE _realtime.extensions (
    id uuid NOT NULL,
    type text,
    settings jsonb,
    tenant_external_id text,
    inserted_at timestamp(0) without time zone NOT NULL,
    updated_at timestamp(0) without time zone NOT NULL
);


ALTER TABLE _realtime.extensions OWNER TO supabase_admin;

--
-- Name: schema_migrations; Type: TABLE; Schema: _realtime; Owner: supabase_admin
--

CREATE TABLE _realtime.schema_migrations (
    version bigint NOT NULL,
    inserted_at timestamp(0) without time zone
);


ALTER TABLE _realtime.schema_migrations OWNER TO supabase_admin;

--
-- Name: tenants; Type: TABLE; Schema: _realtime; Owner: supabase_admin
--

CREATE TABLE _realtime.tenants (
    id uuid NOT NULL,
    name text,
    external_id text,
    jwt_secret text,
    max_concurrent_users integer DEFAULT 200 NOT NULL,
    inserted_at timestamp(0) without time zone NOT NULL,
    updated_at timestamp(0) without time zone NOT NULL,
    max_events_per_second integer DEFAULT 100 NOT NULL,
    postgres_cdc_default text DEFAULT 'postgres_cdc_rls'::text,
    max_bytes_per_second integer DEFAULT 100000 NOT NULL,
    max_channels_per_client integer DEFAULT 100 NOT NULL,
    max_joins_per_second integer DEFAULT 500 NOT NULL,
    suspend boolean DEFAULT false,
    jwt_jwks jsonb,
    notify_private_alpha boolean DEFAULT false,
    private_only boolean DEFAULT false NOT NULL,
    migrations_ran integer DEFAULT 0,
    broadcast_adapter character varying(255) DEFAULT 'gen_rpc'::character varying,
    max_presence_events_per_second integer DEFAULT 1000,
    max_payload_size_in_kb integer DEFAULT 3000,
    CONSTRAINT jwt_secret_or_jwt_jwks_required CHECK (((jwt_secret IS NOT NULL) OR (jwt_jwks IS NOT NULL)))
);


ALTER TABLE _realtime.tenants OWNER TO supabase_admin;

--
-- Name: audit_log_entries; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.audit_log_entries (
    instance_id uuid,
    id uuid NOT NULL,
    payload json,
    created_at timestamp with time zone,
    ip_address character varying(64) DEFAULT ''::character varying NOT NULL
);


ALTER TABLE auth.audit_log_entries OWNER TO supabase_auth_admin;

--
-- Name: TABLE audit_log_entries; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.audit_log_entries IS 'Auth: Audit trail for user actions.';


--
-- Name: flow_state; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.flow_state (
    id uuid NOT NULL,
    user_id uuid,
    auth_code text,
    code_challenge_method auth.code_challenge_method,
    code_challenge text,
    provider_type text NOT NULL,
    provider_access_token text,
    provider_refresh_token text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    authentication_method text NOT NULL,
    auth_code_issued_at timestamp with time zone,
    invite_token text,
    referrer text,
    oauth_client_state_id uuid,
    linking_target_id uuid,
    email_optional boolean DEFAULT false NOT NULL
);


ALTER TABLE auth.flow_state OWNER TO supabase_auth_admin;

--
-- Name: TABLE flow_state; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.flow_state IS 'Stores metadata for all OAuth/SSO login flows';


--
-- Name: identities; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.identities (
    provider_id text NOT NULL,
    user_id uuid NOT NULL,
    identity_data jsonb NOT NULL,
    provider text NOT NULL,
    last_sign_in_at timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    email text GENERATED ALWAYS AS (lower((identity_data ->> 'email'::text))) STORED,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE auth.identities OWNER TO supabase_auth_admin;

--
-- Name: TABLE identities; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.identities IS 'Auth: Stores identities associated to a user.';


--
-- Name: COLUMN identities.email; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.identities.email IS 'Auth: Email is a generated column that references the optional email property in the identity_data';


--
-- Name: instances; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.instances (
    id uuid NOT NULL,
    uuid uuid,
    raw_base_config text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE auth.instances OWNER TO supabase_auth_admin;

--
-- Name: TABLE instances; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.instances IS 'Auth: Manages users across multiple sites.';


--
-- Name: mfa_amr_claims; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_amr_claims (
    session_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    authentication_method text NOT NULL,
    id uuid NOT NULL
);


ALTER TABLE auth.mfa_amr_claims OWNER TO supabase_auth_admin;

--
-- Name: TABLE mfa_amr_claims; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_amr_claims IS 'auth: stores authenticator method reference claims for multi factor authentication';


--
-- Name: mfa_challenges; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_challenges (
    id uuid NOT NULL,
    factor_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    verified_at timestamp with time zone,
    ip_address inet NOT NULL,
    otp_code text,
    web_authn_session_data jsonb
);


ALTER TABLE auth.mfa_challenges OWNER TO supabase_auth_admin;

--
-- Name: TABLE mfa_challenges; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_challenges IS 'auth: stores metadata about challenge requests made';


--
-- Name: mfa_factors; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_factors (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    friendly_name text,
    factor_type auth.factor_type NOT NULL,
    status auth.factor_status NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    secret text,
    phone text,
    last_challenged_at timestamp with time zone,
    web_authn_credential jsonb,
    web_authn_aaguid uuid,
    last_webauthn_challenge_data jsonb
);


ALTER TABLE auth.mfa_factors OWNER TO supabase_auth_admin;

--
-- Name: TABLE mfa_factors; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_factors IS 'auth: stores metadata about factors';


--
-- Name: COLUMN mfa_factors.last_webauthn_challenge_data; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.mfa_factors.last_webauthn_challenge_data IS 'Stores the latest WebAuthn challenge data including attestation/assertion for customer verification';


--
-- Name: oauth_authorizations; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.oauth_authorizations (
    id uuid NOT NULL,
    authorization_id text NOT NULL,
    client_id uuid NOT NULL,
    user_id uuid,
    redirect_uri text NOT NULL,
    scope text NOT NULL,
    state text,
    resource text,
    code_challenge text,
    code_challenge_method auth.code_challenge_method,
    response_type auth.oauth_response_type DEFAULT 'code'::auth.oauth_response_type NOT NULL,
    status auth.oauth_authorization_status DEFAULT 'pending'::auth.oauth_authorization_status NOT NULL,
    authorization_code text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone DEFAULT (now() + '00:03:00'::interval) NOT NULL,
    approved_at timestamp with time zone,
    nonce text,
    CONSTRAINT oauth_authorizations_authorization_code_length CHECK ((char_length(authorization_code) <= 255)),
    CONSTRAINT oauth_authorizations_code_challenge_length CHECK ((char_length(code_challenge) <= 128)),
    CONSTRAINT oauth_authorizations_expires_at_future CHECK ((expires_at > created_at)),
    CONSTRAINT oauth_authorizations_nonce_length CHECK ((char_length(nonce) <= 255)),
    CONSTRAINT oauth_authorizations_redirect_uri_length CHECK ((char_length(redirect_uri) <= 2048)),
    CONSTRAINT oauth_authorizations_resource_length CHECK ((char_length(resource) <= 2048)),
    CONSTRAINT oauth_authorizations_scope_length CHECK ((char_length(scope) <= 4096)),
    CONSTRAINT oauth_authorizations_state_length CHECK ((char_length(state) <= 4096))
);


ALTER TABLE auth.oauth_authorizations OWNER TO supabase_auth_admin;

--
-- Name: oauth_client_states; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.oauth_client_states (
    id uuid NOT NULL,
    provider_type text NOT NULL,
    code_verifier text,
    created_at timestamp with time zone NOT NULL
);


ALTER TABLE auth.oauth_client_states OWNER TO supabase_auth_admin;

--
-- Name: TABLE oauth_client_states; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.oauth_client_states IS 'Stores OAuth states for third-party provider authentication flows where Supabase acts as the OAuth client.';


--
-- Name: oauth_clients; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.oauth_clients (
    id uuid NOT NULL,
    client_secret_hash text,
    registration_type auth.oauth_registration_type NOT NULL,
    redirect_uris text NOT NULL,
    grant_types text NOT NULL,
    client_name text,
    client_uri text,
    logo_uri text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    client_type auth.oauth_client_type DEFAULT 'confidential'::auth.oauth_client_type NOT NULL,
    token_endpoint_auth_method text NOT NULL,
    CONSTRAINT oauth_clients_client_name_length CHECK ((char_length(client_name) <= 1024)),
    CONSTRAINT oauth_clients_client_uri_length CHECK ((char_length(client_uri) <= 2048)),
    CONSTRAINT oauth_clients_logo_uri_length CHECK ((char_length(logo_uri) <= 2048)),
    CONSTRAINT oauth_clients_token_endpoint_auth_method_check CHECK ((token_endpoint_auth_method = ANY (ARRAY['client_secret_basic'::text, 'client_secret_post'::text, 'none'::text])))
);


ALTER TABLE auth.oauth_clients OWNER TO supabase_auth_admin;

--
-- Name: oauth_consents; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.oauth_consents (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    client_id uuid NOT NULL,
    scopes text NOT NULL,
    granted_at timestamp with time zone DEFAULT now() NOT NULL,
    revoked_at timestamp with time zone,
    CONSTRAINT oauth_consents_revoked_after_granted CHECK (((revoked_at IS NULL) OR (revoked_at >= granted_at))),
    CONSTRAINT oauth_consents_scopes_length CHECK ((char_length(scopes) <= 2048)),
    CONSTRAINT oauth_consents_scopes_not_empty CHECK ((char_length(TRIM(BOTH FROM scopes)) > 0))
);


ALTER TABLE auth.oauth_consents OWNER TO supabase_auth_admin;

--
-- Name: one_time_tokens; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.one_time_tokens (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    token_type auth.one_time_token_type NOT NULL,
    token_hash text NOT NULL,
    relates_to text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT one_time_tokens_token_hash_check CHECK ((char_length(token_hash) > 0))
);


ALTER TABLE auth.one_time_tokens OWNER TO supabase_auth_admin;

--
-- Name: refresh_tokens; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.refresh_tokens (
    instance_id uuid,
    id bigint NOT NULL,
    token character varying(255),
    user_id character varying(255),
    revoked boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    parent character varying(255),
    session_id uuid
);


ALTER TABLE auth.refresh_tokens OWNER TO supabase_auth_admin;

--
-- Name: TABLE refresh_tokens; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.refresh_tokens IS 'Auth: Store of tokens used to refresh JWT tokens once they expire.';


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: auth; Owner: supabase_auth_admin
--

CREATE SEQUENCE auth.refresh_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE auth.refresh_tokens_id_seq OWNER TO supabase_auth_admin;

--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: supabase_auth_admin
--

ALTER SEQUENCE auth.refresh_tokens_id_seq OWNED BY auth.refresh_tokens.id;


--
-- Name: saml_providers; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.saml_providers (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    entity_id text NOT NULL,
    metadata_xml text NOT NULL,
    metadata_url text,
    attribute_mapping jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    name_id_format text,
    CONSTRAINT "entity_id not empty" CHECK ((char_length(entity_id) > 0)),
    CONSTRAINT "metadata_url not empty" CHECK (((metadata_url = NULL::text) OR (char_length(metadata_url) > 0))),
    CONSTRAINT "metadata_xml not empty" CHECK ((char_length(metadata_xml) > 0))
);


ALTER TABLE auth.saml_providers OWNER TO supabase_auth_admin;

--
-- Name: TABLE saml_providers; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.saml_providers IS 'Auth: Manages SAML Identity Provider connections.';


--
-- Name: saml_relay_states; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.saml_relay_states (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    request_id text NOT NULL,
    for_email text,
    redirect_to text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    flow_state_id uuid,
    CONSTRAINT "request_id not empty" CHECK ((char_length(request_id) > 0))
);


ALTER TABLE auth.saml_relay_states OWNER TO supabase_auth_admin;

--
-- Name: TABLE saml_relay_states; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.saml_relay_states IS 'Auth: Contains SAML Relay State information for each Service Provider initiated login.';


--
-- Name: schema_migrations; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.schema_migrations (
    version character varying(255) NOT NULL
);


ALTER TABLE auth.schema_migrations OWNER TO supabase_auth_admin;

--
-- Name: TABLE schema_migrations; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.schema_migrations IS 'Auth: Manages updates to the auth system.';


--
-- Name: sessions; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sessions (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    factor_id uuid,
    aal auth.aal_level,
    not_after timestamp with time zone,
    refreshed_at timestamp without time zone,
    user_agent text,
    ip inet,
    tag text,
    oauth_client_id uuid,
    refresh_token_hmac_key text,
    refresh_token_counter bigint,
    scopes text,
    CONSTRAINT sessions_scopes_length CHECK ((char_length(scopes) <= 4096))
);


ALTER TABLE auth.sessions OWNER TO supabase_auth_admin;

--
-- Name: TABLE sessions; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sessions IS 'Auth: Stores session data associated to a user.';


--
-- Name: COLUMN sessions.not_after; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sessions.not_after IS 'Auth: Not after is a nullable column that contains a timestamp after which the session should be regarded as expired.';


--
-- Name: COLUMN sessions.refresh_token_hmac_key; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sessions.refresh_token_hmac_key IS 'Holds a HMAC-SHA256 key used to sign refresh tokens for this session.';


--
-- Name: COLUMN sessions.refresh_token_counter; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sessions.refresh_token_counter IS 'Holds the ID (counter) of the last issued refresh token.';


--
-- Name: sso_domains; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sso_domains (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    domain text NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "domain not empty" CHECK ((char_length(domain) > 0))
);


ALTER TABLE auth.sso_domains OWNER TO supabase_auth_admin;

--
-- Name: TABLE sso_domains; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sso_domains IS 'Auth: Manages SSO email address domain mapping to an SSO Identity Provider.';


--
-- Name: sso_providers; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sso_providers (
    id uuid NOT NULL,
    resource_id text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    disabled boolean,
    CONSTRAINT "resource_id not empty" CHECK (((resource_id = NULL::text) OR (char_length(resource_id) > 0)))
);


ALTER TABLE auth.sso_providers OWNER TO supabase_auth_admin;

--
-- Name: TABLE sso_providers; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sso_providers IS 'Auth: Manages SSO identity provider information; see saml_providers for SAML.';


--
-- Name: COLUMN sso_providers.resource_id; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sso_providers.resource_id IS 'Auth: Uniquely identifies a SSO provider according to a user-chosen resource ID (case insensitive), useful in infrastructure as code.';


--
-- Name: users; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.users (
    instance_id uuid,
    id uuid NOT NULL,
    aud character varying(255),
    role character varying(255),
    email character varying(255),
    encrypted_password character varying(255),
    email_confirmed_at timestamp with time zone,
    invited_at timestamp with time zone,
    confirmation_token character varying(255),
    confirmation_sent_at timestamp with time zone,
    recovery_token character varying(255),
    recovery_sent_at timestamp with time zone,
    email_change_token_new character varying(255),
    email_change character varying(255),
    email_change_sent_at timestamp with time zone,
    last_sign_in_at timestamp with time zone,
    raw_app_meta_data jsonb,
    raw_user_meta_data jsonb,
    is_super_admin boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    phone text DEFAULT NULL::character varying,
    phone_confirmed_at timestamp with time zone,
    phone_change text DEFAULT ''::character varying,
    phone_change_token character varying(255) DEFAULT ''::character varying,
    phone_change_sent_at timestamp with time zone,
    confirmed_at timestamp with time zone GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED,
    email_change_token_current character varying(255) DEFAULT ''::character varying,
    email_change_confirm_status smallint DEFAULT 0,
    banned_until timestamp with time zone,
    reauthentication_token character varying(255) DEFAULT ''::character varying,
    reauthentication_sent_at timestamp with time zone,
    is_sso_user boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    is_anonymous boolean DEFAULT false NOT NULL,
    CONSTRAINT users_email_change_confirm_status_check CHECK (((email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)))
);


ALTER TABLE auth.users OWNER TO supabase_auth_admin;

--
-- Name: TABLE users; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.users IS 'Auth: Stores user login data within a secure schema.';


--
-- Name: COLUMN users.is_sso_user; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.users.is_sso_user IS 'Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails.';


--
-- Name: boost_custom_names; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.boost_custom_names (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    boost_id uuid NOT NULL,
    user_id uuid NOT NULL,
    custom_name text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


ALTER TABLE public.boost_custom_names OWNER TO postgres;

--
-- Name: boosts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.boosts (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    name text NOT NULL,
    icon text,
    boost_type text,
    rarity integer,
    boost_stats jsonb,
    series integer,
    season_id uuid,
    is_free boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


ALTER TABLE public.boosts OWNER TO postgres;

--
-- Name: car_parts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.car_parts (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    name text NOT NULL,
    rarity integer NOT NULL,
    series integer NOT NULL,
    season_id uuid,
    icon text,
    cc_price integer,
    num_duplicates_after_unlock integer,
    collection_id text,
    visual_override text,
    collection_sub_name text,
    car_part_type integer NOT NULL,
    stats_per_level jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


ALTER TABLE public.car_parts OWNER TO postgres;

--
-- Name: collections; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.collections (
    id text NOT NULL,
    internal_name text,
    season integer,
    ordinal integer,
    name text,
    theme text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    description text,
    rarity integer
);


ALTER TABLE public.collections OWNER TO postgres;

--
-- Name: drivers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.drivers (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    name text NOT NULL,
    rarity integer NOT NULL,
    series integer NOT NULL,
    season_id uuid,
    icon text,
    cc_price integer,
    num_duplicates_after_unlock integer,
    collection_id text,
    visual_override text,
    collection_sub_name text,
    min_gp_tier integer,
    tag_name text,
    ordinal integer,
    stats_per_level jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


ALTER TABLE public.drivers OWNER TO postgres;

--
-- Name: profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    email text,
    username text,
    is_admin boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


ALTER TABLE public.profiles OWNER TO postgres;

--
-- Name: seasons; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.seasons (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    name text NOT NULL,
    is_active boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


ALTER TABLE public.seasons OWNER TO postgres;

--
-- Name: tracks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tracks (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    name text NOT NULL,
    alt_name text,
    laps integer NOT NULL,
    driver_track_stat text NOT NULL,
    car_track_stat text NOT NULL,
    season_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


ALTER TABLE public.tracks OWNER TO postgres;

--
-- Name: user_boosts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_boosts (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    boost_id uuid NOT NULL,
    level integer DEFAULT 0,
    count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


ALTER TABLE public.user_boosts OWNER TO postgres;

--
-- Name: user_car_parts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_car_parts (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    car_part_id uuid NOT NULL,
    level integer DEFAULT 0,
    card_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


ALTER TABLE public.user_car_parts OWNER TO postgres;

--
-- Name: user_car_setups; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_car_setups (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    name text NOT NULL,
    notes text,
    brake_id uuid,
    gearbox_id uuid,
    rear_wing_id uuid,
    front_wing_id uuid,
    suspension_id uuid,
    engine_id uuid,
    series_filter integer DEFAULT 0,
    bonus_percentage integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


ALTER TABLE public.user_car_setups OWNER TO postgres;

--
-- Name: user_drivers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_drivers (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    driver_id uuid NOT NULL,
    level integer DEFAULT 0,
    card_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


ALTER TABLE public.user_drivers OWNER TO postgres;

--
-- Name: user_track_guide_drivers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_track_guide_drivers (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    track_guide_id uuid NOT NULL,
    driver_id uuid NOT NULL,
    recommended_boost_id uuid,
    track_strategy text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


ALTER TABLE public.user_track_guide_drivers OWNER TO postgres;

--
-- Name: user_track_guides; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_track_guides (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    track_id uuid NOT NULL,
    gp_level integer NOT NULL,
    suggested_drivers jsonb,
    free_boost_id uuid,
    suggested_boosts jsonb,
    saved_setup_id uuid,
    setup_notes text,
    dry_strategy text,
    wet_strategy text,
    driver_1_dry_strategy text,
    driver_1_wet_strategy text,
    driver_2_dry_strategy text,
    driver_2_wet_strategy text,
    notes text,
    driver_1_id uuid,
    driver_2_id uuid,
    driver_1_boost_id uuid,
    driver_2_boost_id uuid,
    alt_driver_ids jsonb,
    alt_boost_ids jsonb,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    alternate_driver_ids jsonb
);


ALTER TABLE public.user_track_guides OWNER TO postgres;

--
-- Name: messages; Type: TABLE; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TABLE realtime.messages (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
)
PARTITION BY RANGE (inserted_at);


ALTER TABLE realtime.messages OWNER TO supabase_realtime_admin;

--
-- Name: messages_2026_02_24; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.messages_2026_02_24 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE realtime.messages_2026_02_24 OWNER TO supabase_admin;

--
-- Name: messages_2026_02_25; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.messages_2026_02_25 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE realtime.messages_2026_02_25 OWNER TO supabase_admin;

--
-- Name: messages_2026_02_26; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.messages_2026_02_26 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE realtime.messages_2026_02_26 OWNER TO supabase_admin;

--
-- Name: messages_2026_02_27; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.messages_2026_02_27 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE realtime.messages_2026_02_27 OWNER TO supabase_admin;

--
-- Name: messages_2026_02_28; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.messages_2026_02_28 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE realtime.messages_2026_02_28 OWNER TO supabase_admin;

--
-- Name: messages_2026_03_01; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.messages_2026_03_01 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE realtime.messages_2026_03_01 OWNER TO supabase_admin;

--
-- Name: messages_2026_03_02; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.messages_2026_03_02 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE realtime.messages_2026_03_02 OWNER TO supabase_admin;

--
-- Name: schema_migrations; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.schema_migrations (
    version bigint NOT NULL,
    inserted_at timestamp(0) without time zone
);


ALTER TABLE realtime.schema_migrations OWNER TO supabase_admin;

--
-- Name: subscription; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.subscription (
    id bigint NOT NULL,
    subscription_id uuid NOT NULL,
    entity regclass NOT NULL,
    filters realtime.user_defined_filter[] DEFAULT '{}'::realtime.user_defined_filter[] NOT NULL,
    claims jsonb NOT NULL,
    claims_role regrole GENERATED ALWAYS AS (realtime.to_regrole((claims ->> 'role'::text))) STORED NOT NULL,
    created_at timestamp without time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


ALTER TABLE realtime.subscription OWNER TO supabase_admin;

--
-- Name: subscription_id_seq; Type: SEQUENCE; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE realtime.subscription ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME realtime.subscription_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: buckets; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.buckets (
    id text NOT NULL,
    name text NOT NULL,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    public boolean DEFAULT false,
    avif_autodetection boolean DEFAULT false,
    file_size_limit bigint,
    allowed_mime_types text[],
    owner_id text,
    type storage.buckettype DEFAULT 'STANDARD'::storage.buckettype NOT NULL
);


ALTER TABLE storage.buckets OWNER TO supabase_storage_admin;

--
-- Name: COLUMN buckets.owner; Type: COMMENT; Schema: storage; Owner: supabase_storage_admin
--

COMMENT ON COLUMN storage.buckets.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: buckets_analytics; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.buckets_analytics (
    name text NOT NULL,
    type storage.buckettype DEFAULT 'ANALYTICS'::storage.buckettype NOT NULL,
    format text DEFAULT 'ICEBERG'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE storage.buckets_analytics OWNER TO supabase_storage_admin;

--
-- Name: buckets_vectors; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.buckets_vectors (
    id text NOT NULL,
    type storage.buckettype DEFAULT 'VECTOR'::storage.buckettype NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE storage.buckets_vectors OWNER TO supabase_storage_admin;

--
-- Name: iceberg_namespaces; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.iceberg_namespaces (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bucket_name text NOT NULL,
    name text NOT NULL COLLATE pg_catalog."C",
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    catalog_id uuid NOT NULL
);


ALTER TABLE storage.iceberg_namespaces OWNER TO supabase_storage_admin;

--
-- Name: iceberg_tables; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.iceberg_tables (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    namespace_id uuid NOT NULL,
    bucket_name text NOT NULL,
    name text NOT NULL COLLATE pg_catalog."C",
    location text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    remote_table_id text,
    shard_key text,
    shard_id text,
    catalog_id uuid NOT NULL
);


ALTER TABLE storage.iceberg_tables OWNER TO supabase_storage_admin;

--
-- Name: migrations; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.migrations (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    hash character varying(40) NOT NULL,
    executed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE storage.migrations OWNER TO supabase_storage_admin;

--
-- Name: objects; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.objects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bucket_id text,
    name text,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_accessed_at timestamp with time zone DEFAULT now(),
    metadata jsonb,
    path_tokens text[] GENERATED ALWAYS AS (string_to_array(name, '/'::text)) STORED,
    version text,
    owner_id text,
    user_metadata jsonb
);


ALTER TABLE storage.objects OWNER TO supabase_storage_admin;

--
-- Name: COLUMN objects.owner; Type: COMMENT; Schema: storage; Owner: supabase_storage_admin
--

COMMENT ON COLUMN storage.objects.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: s3_multipart_uploads; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.s3_multipart_uploads (
    id text NOT NULL,
    in_progress_size bigint DEFAULT 0 NOT NULL,
    upload_signature text NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    version text NOT NULL,
    owner_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_metadata jsonb
);


ALTER TABLE storage.s3_multipart_uploads OWNER TO supabase_storage_admin;

--
-- Name: s3_multipart_uploads_parts; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.s3_multipart_uploads_parts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    upload_id text NOT NULL,
    size bigint DEFAULT 0 NOT NULL,
    part_number integer NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    etag text NOT NULL,
    owner_id text,
    version text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE storage.s3_multipart_uploads_parts OWNER TO supabase_storage_admin;

--
-- Name: vector_indexes; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.vector_indexes (
    id text DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL COLLATE pg_catalog."C",
    bucket_id text NOT NULL,
    data_type text NOT NULL,
    dimension integer NOT NULL,
    distance_metric text NOT NULL,
    metadata_configuration jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE storage.vector_indexes OWNER TO supabase_storage_admin;

--
-- Name: hooks; Type: TABLE; Schema: supabase_functions; Owner: supabase_functions_admin
--

CREATE TABLE supabase_functions.hooks (
    id bigint NOT NULL,
    hook_table_id integer NOT NULL,
    hook_name text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    request_id bigint
);


ALTER TABLE supabase_functions.hooks OWNER TO supabase_functions_admin;

--
-- Name: TABLE hooks; Type: COMMENT; Schema: supabase_functions; Owner: supabase_functions_admin
--

COMMENT ON TABLE supabase_functions.hooks IS 'Supabase Functions Hooks: Audit trail for triggered hooks.';


--
-- Name: hooks_id_seq; Type: SEQUENCE; Schema: supabase_functions; Owner: supabase_functions_admin
--

CREATE SEQUENCE supabase_functions.hooks_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE supabase_functions.hooks_id_seq OWNER TO supabase_functions_admin;

--
-- Name: hooks_id_seq; Type: SEQUENCE OWNED BY; Schema: supabase_functions; Owner: supabase_functions_admin
--

ALTER SEQUENCE supabase_functions.hooks_id_seq OWNED BY supabase_functions.hooks.id;


--
-- Name: migrations; Type: TABLE; Schema: supabase_functions; Owner: supabase_functions_admin
--

CREATE TABLE supabase_functions.migrations (
    version text NOT NULL,
    inserted_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE supabase_functions.migrations OWNER TO supabase_functions_admin;

--
-- Name: messages_2026_02_24; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2026_02_24 FOR VALUES FROM ('2026-02-24 00:00:00') TO ('2026-02-25 00:00:00');


--
-- Name: messages_2026_02_25; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2026_02_25 FOR VALUES FROM ('2026-02-25 00:00:00') TO ('2026-02-26 00:00:00');


--
-- Name: messages_2026_02_26; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2026_02_26 FOR VALUES FROM ('2026-02-26 00:00:00') TO ('2026-02-27 00:00:00');


--
-- Name: messages_2026_02_27; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2026_02_27 FOR VALUES FROM ('2026-02-27 00:00:00') TO ('2026-02-28 00:00:00');


--
-- Name: messages_2026_02_28; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2026_02_28 FOR VALUES FROM ('2026-02-28 00:00:00') TO ('2026-03-01 00:00:00');


--
-- Name: messages_2026_03_01; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2026_03_01 FOR VALUES FROM ('2026-03-01 00:00:00') TO ('2026-03-02 00:00:00');


--
-- Name: messages_2026_03_02; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2026_03_02 FOR VALUES FROM ('2026-03-02 00:00:00') TO ('2026-03-03 00:00:00');


--
-- Name: refresh_tokens id; Type: DEFAULT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('auth.refresh_tokens_id_seq'::regclass);


--
-- Name: hooks id; Type: DEFAULT; Schema: supabase_functions; Owner: supabase_functions_admin
--

ALTER TABLE ONLY supabase_functions.hooks ALTER COLUMN id SET DEFAULT nextval('supabase_functions.hooks_id_seq'::regclass);


--
-- Data for Name: extensions; Type: TABLE DATA; Schema: _realtime; Owner: supabase_admin
--

COPY _realtime.extensions (id, type, settings, tenant_external_id, inserted_at, updated_at) FROM stdin;
b0d77cdb-e4a3-466a-948d-c30eff102728	postgres_cdc_rls	{"region": "us-east-1", "db_host": "cPOL3w2nB6/StEPqbnhjbZwWHqQgYKO+HJLmnURBCLU=", "db_name": "sWBpZNdjggEPTQVlI52Zfw==", "db_port": "+enMDFi1J/3IrrquHHwUmA==", "db_user": "uxbEq/zz8DXVD53TOI1zmw==", "slot_name": "supabase_realtime_replication_slot", "db_password": "sWBpZNdjggEPTQVlI52Zfw==", "publication": "supabase_realtime", "ssl_enforced": false, "poll_interval_ms": 100, "poll_max_changes": 100, "poll_max_record_bytes": 1048576}	realtime-dev	2026-02-27 00:24:10	2026-02-27 00:24:10
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: _realtime; Owner: supabase_admin
--

COPY _realtime.schema_migrations (version, inserted_at) FROM stdin;
20210706140551	2026-02-25 08:00:18
20220329161857	2026-02-25 08:00:18
20220410212326	2026-02-25 08:00:18
20220506102948	2026-02-25 08:00:18
20220527210857	2026-02-25 08:00:18
20220815211129	2026-02-25 08:00:18
20220815215024	2026-02-25 08:00:18
20220818141501	2026-02-25 08:00:18
20221018173709	2026-02-25 08:00:18
20221102172703	2026-02-25 08:00:18
20221223010058	2026-02-25 08:00:18
20230110180046	2026-02-25 08:00:18
20230810220907	2026-02-25 08:00:18
20230810220924	2026-02-25 08:00:18
20231024094642	2026-02-25 08:00:18
20240306114423	2026-02-25 08:00:18
20240418082835	2026-02-25 08:00:18
20240625211759	2026-02-25 08:00:18
20240704172020	2026-02-25 08:00:18
20240902173232	2026-02-25 08:00:18
20241106103258	2026-02-25 08:00:18
20250424203323	2026-02-25 08:00:18
20250613072131	2026-02-25 08:00:18
20250711044927	2026-02-25 08:00:18
20250811121559	2026-02-25 08:00:18
20250926223044	2026-02-25 08:00:18
20251204170944	2026-02-25 08:00:18
20251218000543	2026-02-25 08:00:18
\.


--
-- Data for Name: tenants; Type: TABLE DATA; Schema: _realtime; Owner: supabase_admin
--

COPY _realtime.tenants (id, name, external_id, jwt_secret, max_concurrent_users, inserted_at, updated_at, max_events_per_second, postgres_cdc_default, max_bytes_per_second, max_channels_per_client, max_joins_per_second, suspend, jwt_jwks, notify_private_alpha, private_only, migrations_ran, broadcast_adapter, max_presence_events_per_second, max_payload_size_in_kb) FROM stdin;
cf42a89c-230e-4c81-919b-80867bb30607	realtime-dev	realtime-dev	iNjicxc4+llvc9wovDvqymwfnj9teWMlyOIbJ8Fh6j2WNU8CIJ2ZgjR6MUIKqSmeDmvpsKLsZ9jgXJmQPpwL8w==	200	2026-02-27 00:24:10	2026-02-27 00:24:10	100	postgres_cdc_rls	100000	100	100	f	{"keys": [{"x": "M5Sjqn5zwC9Kl1zVfUUGvv9boQjCGd45G8sdopBExB4", "y": "P6IXMvA2WYXSHSOMTBH2jsw_9rrzGy89FjPf6oOsIxQ", "alg": "ES256", "crv": "P-256", "ext": true, "kid": "b81269f1-21d8-4f2e-b719-c2240a840d90", "kty": "EC", "use": "sig", "key_ops": ["verify"]}, {"k": "c3VwZXItc2VjcmV0LWp3dC10b2tlbi13aXRoLWF0LWxlYXN0LTMyLWNoYXJhY3RlcnMtbG9uZw", "kty": "oct"}]}	f	f	65	gen_rpc	1000	3000
\.


--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.audit_log_entries (instance_id, id, payload, created_at, ip_address) FROM stdin;
00000000-0000-0000-0000-000000000000	b4020625-466f-4d15-9ecb-acce11da87c7	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"thomas.lobaugh@gmail.com","user_id":"bf455f21-2e53-416a-a134-8b4a81588db3","user_phone":""}}	2026-02-26 00:27:24.86629+00	
00000000-0000-0000-0000-000000000000	e150b474-09d0-4db8-8778-98b400453af6	{"action":"login","actor_id":"bf455f21-2e53-416a-a134-8b4a81588db3","actor_name":"Test Admin User","actor_username":"thomas.lobaugh@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-26 00:27:41.581789+00	
00000000-0000-0000-0000-000000000000	5528a830-8e48-402d-826c-0b1b7b465bed	{"action":"logout","actor_id":"bf455f21-2e53-416a-a134-8b4a81588db3","actor_name":"Test Admin User","actor_username":"thomas.lobaugh@gmail.com","actor_via_sso":false,"log_type":"account"}	2026-02-26 00:31:19.270655+00	
00000000-0000-0000-0000-000000000000	328fae01-9029-452c-bd2e-14ae4c868708	{"action":"login","actor_id":"bf455f21-2e53-416a-a134-8b4a81588db3","actor_name":"Test Admin User","actor_username":"thomas.lobaugh@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-26 00:31:21.300742+00	
00000000-0000-0000-0000-000000000000	30da44ca-1944-4920-a774-e9bbce141c96	{"action":"token_refreshed","actor_id":"bf455f21-2e53-416a-a134-8b4a81588db3","actor_name":"Test Admin User","actor_username":"thomas.lobaugh@gmail.com","actor_via_sso":false,"log_type":"token"}	2026-02-26 01:29:41.32238+00	
00000000-0000-0000-0000-000000000000	7fafb3eb-68d1-4c84-9b5a-fece96ec2d9f	{"action":"token_revoked","actor_id":"bf455f21-2e53-416a-a134-8b4a81588db3","actor_name":"Test Admin User","actor_username":"thomas.lobaugh@gmail.com","actor_via_sso":false,"log_type":"token"}	2026-02-26 01:29:41.323657+00	
00000000-0000-0000-0000-000000000000	c0b416ea-e722-43c3-a888-510f333b1ef0	{"action":"logout","actor_id":"bf455f21-2e53-416a-a134-8b4a81588db3","actor_name":"Test Admin User","actor_username":"thomas.lobaugh@gmail.com","actor_via_sso":false,"log_type":"account"}	2026-02-26 01:47:58.280453+00	
00000000-0000-0000-0000-000000000000	db0066ba-702d-4091-a97f-6769e4106088	{"action":"login","actor_id":"bf455f21-2e53-416a-a134-8b4a81588db3","actor_name":"Test Admin User","actor_username":"thomas.lobaugh@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-26 01:48:00.923943+00	
00000000-0000-0000-0000-000000000000	a1fa3fbb-3039-4447-96c2-b717ec162e77	{"action":"token_refreshed","actor_id":"bf455f21-2e53-416a-a134-8b4a81588db3","actor_name":"Test Admin User","actor_username":"thomas.lobaugh@gmail.com","actor_via_sso":false,"log_type":"token"}	2026-02-26 02:46:08.452779+00	
00000000-0000-0000-0000-000000000000	cb64ad39-496c-4429-b739-d45b72cd25fb	{"action":"token_revoked","actor_id":"bf455f21-2e53-416a-a134-8b4a81588db3","actor_name":"Test Admin User","actor_username":"thomas.lobaugh@gmail.com","actor_via_sso":false,"log_type":"token"}	2026-02-26 02:46:08.453628+00	
00000000-0000-0000-0000-000000000000	499f627d-5326-4329-8a86-5c2d91d2f45f	{"action":"token_refreshed","actor_id":"bf455f21-2e53-416a-a134-8b4a81588db3","actor_name":"Test Admin User","actor_username":"thomas.lobaugh@gmail.com","actor_via_sso":false,"log_type":"token"}	2026-02-26 03:44:08.475077+00	
00000000-0000-0000-0000-000000000000	7a3996b3-c26b-4f85-93c1-427151adc22d	{"action":"token_revoked","actor_id":"bf455f21-2e53-416a-a134-8b4a81588db3","actor_name":"Test Admin User","actor_username":"thomas.lobaugh@gmail.com","actor_via_sso":false,"log_type":"token"}	2026-02-26 03:44:08.475799+00	
00000000-0000-0000-0000-000000000000	0cdc36f9-44e0-445a-bea9-1ebd8b343f71	{"action":"token_refreshed","actor_id":"bf455f21-2e53-416a-a134-8b4a81588db3","actor_name":"Test Admin User","actor_username":"thomas.lobaugh@gmail.com","actor_via_sso":false,"log_type":"token"}	2026-02-26 04:42:08.429421+00	
00000000-0000-0000-0000-000000000000	2a935b84-c6c6-4e87-8f1a-5931c676b4cd	{"action":"token_revoked","actor_id":"bf455f21-2e53-416a-a134-8b4a81588db3","actor_name":"Test Admin User","actor_username":"thomas.lobaugh@gmail.com","actor_via_sso":false,"log_type":"token"}	2026-02-26 04:42:08.430086+00	
00000000-0000-0000-0000-000000000000	c6c04faa-6323-4bf3-8b6c-1f8c4ffec0db	{"action":"token_refreshed","actor_id":"bf455f21-2e53-416a-a134-8b4a81588db3","actor_name":"Test Admin User","actor_username":"thomas.lobaugh@gmail.com","actor_via_sso":false,"log_type":"token"}	2026-02-26 05:40:08.503061+00	
00000000-0000-0000-0000-000000000000	12ccf816-0f8a-4dd1-9053-415c7a4c227b	{"action":"token_revoked","actor_id":"bf455f21-2e53-416a-a134-8b4a81588db3","actor_name":"Test Admin User","actor_username":"thomas.lobaugh@gmail.com","actor_via_sso":false,"log_type":"token"}	2026-02-26 05:40:08.50382+00	
00000000-0000-0000-0000-000000000000	1cee625a-19d0-4497-9f6b-211b5fb749e3	{"action":"token_refreshed","actor_id":"bf455f21-2e53-416a-a134-8b4a81588db3","actor_name":"Test Admin User","actor_username":"thomas.lobaugh@gmail.com","actor_via_sso":false,"log_type":"token"}	2026-02-26 22:44:54.742867+00	
00000000-0000-0000-0000-000000000000	69bad953-f5b7-4ea1-9340-27b814128d78	{"action":"token_revoked","actor_id":"bf455f21-2e53-416a-a134-8b4a81588db3","actor_name":"Test Admin User","actor_username":"thomas.lobaugh@gmail.com","actor_via_sso":false,"log_type":"token"}	2026-02-26 22:44:54.746176+00	
00000000-0000-0000-0000-000000000000	12fe90a9-aa0b-40b4-a338-24c783558994	{"action":"logout","actor_id":"bf455f21-2e53-416a-a134-8b4a81588db3","actor_name":"Test Admin User","actor_username":"thomas.lobaugh@gmail.com","actor_via_sso":false,"log_type":"account"}	2026-02-26 22:45:56.246156+00	
00000000-0000-0000-0000-000000000000	a1204d38-91d9-4190-830e-68f2beb968e0	{"action":"login","actor_id":"bf455f21-2e53-416a-a134-8b4a81588db3","actor_name":"Test Admin User","actor_username":"thomas.lobaugh@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-26 22:45:58.704556+00	
00000000-0000-0000-0000-000000000000	9befb251-9d9a-4525-a0be-c295474a0066	{"action":"token_refreshed","actor_id":"bf455f21-2e53-416a-a134-8b4a81588db3","actor_name":"Test Admin User","actor_username":"thomas.lobaugh@gmail.com","actor_via_sso":false,"log_type":"token"}	2026-02-26 23:44:27.868267+00	
00000000-0000-0000-0000-000000000000	84f16b87-9472-45cb-be62-6af22fcecaf9	{"action":"token_revoked","actor_id":"bf455f21-2e53-416a-a134-8b4a81588db3","actor_name":"Test Admin User","actor_username":"thomas.lobaugh@gmail.com","actor_via_sso":false,"log_type":"token"}	2026-02-26 23:44:27.869115+00	
00000000-0000-0000-0000-000000000000	b369a53f-e2ff-4338-9482-60a776de9ae8	{"action":"logout","actor_id":"bf455f21-2e53-416a-a134-8b4a81588db3","actor_name":"Test Admin User","actor_username":"thomas.lobaugh@gmail.com","actor_via_sso":false,"log_type":"account"}	2026-02-26 23:51:43.951002+00	
00000000-0000-0000-0000-000000000000	c1e33811-71f4-4c75-ba42-4acd69eab0d2	{"action":"login","actor_id":"bf455f21-2e53-416a-a134-8b4a81588db3","actor_name":"Test Admin User","actor_username":"thomas.lobaugh@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-26 23:51:45.860946+00	
00000000-0000-0000-0000-000000000000	5c2bd77a-c9ea-4ea4-bdf1-87319a843171	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"thomas.lobaugh@example.com","user_id":"f93f0ecf-47d2-4d40-a4b4-4c22a301c374","user_phone":""}}	2026-02-27 00:01:31.389478+00	
00000000-0000-0000-0000-000000000000	0800b30c-5168-422b-b5fa-76cc44163b6f	{"action":"logout","actor_id":"bf455f21-2e53-416a-a134-8b4a81588db3","actor_name":"Test Admin User","actor_username":"thomas.lobaugh@gmail.com","actor_via_sso":false,"log_type":"account"}	2026-02-27 00:14:22.639621+00	
00000000-0000-0000-0000-000000000000	60b6efd7-9ed0-4f12-b62d-156c1105c505	{"action":"login","actor_id":"bf455f21-2e53-416a-a134-8b4a81588db3","actor_name":"Test Admin User","actor_username":"thomas.lobaugh@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-27 00:14:25.331043+00	
00000000-0000-0000-0000-000000000000	9070b9ad-f37a-4094-9374-ba90ae0e9f40	{"action":"logout","actor_id":"bf455f21-2e53-416a-a134-8b4a81588db3","actor_name":"Test Admin User","actor_username":"thomas.lobaugh@gmail.com","actor_via_sso":false,"log_type":"account"}	2026-02-27 00:15:00.295345+00	
00000000-0000-0000-0000-000000000000	0ed4b6d8-45e9-486d-9065-9ec4fb8577b9	{"action":"login","actor_id":"bf455f21-2e53-416a-a134-8b4a81588db3","actor_name":"Test Admin User","actor_username":"thomas.lobaugh@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-27 00:15:13.044018+00	
00000000-0000-0000-0000-000000000000	0339e440-915c-4f4d-b67b-e83848643db1	{"action":"login","actor_id":"f93f0ecf-47d2-4d40-a4b4-4c22a301c374","actor_username":"thomas.lobaugh@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-27 00:19:01.872068+00	
00000000-0000-0000-0000-000000000000	b1ea9c1a-c7dd-4a84-888a-b1ac0189f336	{"action":"token_refreshed","actor_id":"bf455f21-2e53-416a-a134-8b4a81588db3","actor_name":"Test Admin User","actor_username":"thomas.lobaugh@gmail.com","actor_via_sso":false,"log_type":"token"}	2026-02-27 01:13:35.08711+00	
00000000-0000-0000-0000-000000000000	508fc360-ca31-4307-bf07-bade389e65e8	{"action":"token_revoked","actor_id":"bf455f21-2e53-416a-a134-8b4a81588db3","actor_name":"Test Admin User","actor_username":"thomas.lobaugh@gmail.com","actor_via_sso":false,"log_type":"token"}	2026-02-27 01:13:35.120636+00	
00000000-0000-0000-0000-000000000000	ba6738f5-6709-4f3d-915c-3b149300b5b2	{"action":"token_refreshed","actor_id":"bf455f21-2e53-416a-a134-8b4a81588db3","actor_name":"Test Admin User","actor_username":"thomas.lobaugh@gmail.com","actor_via_sso":false,"log_type":"token"}	2026-02-27 02:12:05.117248+00	
00000000-0000-0000-0000-000000000000	6b7ef2a8-ca07-4b22-b994-0f29cfd1789d	{"action":"token_revoked","actor_id":"bf455f21-2e53-416a-a134-8b4a81588db3","actor_name":"Test Admin User","actor_username":"thomas.lobaugh@gmail.com","actor_via_sso":false,"log_type":"token"}	2026-02-27 02:12:05.118075+00	
00000000-0000-0000-0000-000000000000	5cf2dbb3-78b2-4e66-b347-1fbc5684a80e	{"action":"logout","actor_id":"bf455f21-2e53-416a-a134-8b4a81588db3","actor_name":"Test Admin User","actor_username":"thomas.lobaugh@gmail.com","actor_via_sso":false,"log_type":"account"}	2026-02-27 03:04:14.51712+00	
00000000-0000-0000-0000-000000000000	bb18cdf7-b1a4-47d9-b49c-5e84ee57bb45	{"action":"login","actor_id":"bf455f21-2e53-416a-a134-8b4a81588db3","actor_name":"Test Admin User","actor_username":"thomas.lobaugh@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-27 03:04:24.255822+00	
00000000-0000-0000-0000-000000000000	44d31fec-c53f-42b4-ab85-a23c297ecfbd	{"action":"logout","actor_id":"bf455f21-2e53-416a-a134-8b4a81588db3","actor_name":"Test Admin User","actor_username":"thomas.lobaugh@gmail.com","actor_via_sso":false,"log_type":"account"}	2026-02-27 03:57:20.345003+00	
00000000-0000-0000-0000-000000000000	9587d456-e7ac-4252-ab60-0a1cb5eb9f3b	{"action":"login","actor_id":"bf455f21-2e53-416a-a134-8b4a81588db3","actor_name":"Test Admin User","actor_username":"thomas.lobaugh@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-27 03:57:42.74809+00	
00000000-0000-0000-0000-000000000000	a2c2562a-3cc0-4c91-964c-46111986eefe	{"action":"logout","actor_id":"bf455f21-2e53-416a-a134-8b4a81588db3","actor_name":"Test Admin User","actor_username":"thomas.lobaugh@gmail.com","actor_via_sso":false,"log_type":"account"}	2026-02-27 04:41:41.48903+00	
00000000-0000-0000-0000-000000000000	b99821a3-d148-4ee7-b632-1da33d46d225	{"action":"login","actor_id":"bf455f21-2e53-416a-a134-8b4a81588db3","actor_name":"Test Admin User","actor_username":"thomas.lobaugh@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-27 04:41:51.799884+00	
00000000-0000-0000-0000-000000000000	61d90f17-d4bb-4978-9500-7d6691e310a3	{"action":"token_refreshed","actor_id":"bf455f21-2e53-416a-a134-8b4a81588db3","actor_name":"Test Admin User","actor_username":"thomas.lobaugh@gmail.com","actor_via_sso":false,"log_type":"token"}	2026-02-27 05:39:53.88636+00	
00000000-0000-0000-0000-000000000000	090642dd-0f20-4136-b5fb-c75d4bf55b40	{"action":"token_revoked","actor_id":"bf455f21-2e53-416a-a134-8b4a81588db3","actor_name":"Test Admin User","actor_username":"thomas.lobaugh@gmail.com","actor_via_sso":false,"log_type":"token"}	2026-02-27 05:39:53.887856+00	
00000000-0000-0000-0000-000000000000	15d08f8d-edf2-4d20-b23d-93263cf1e360	{"action":"token_refreshed","actor_id":"bf455f21-2e53-416a-a134-8b4a81588db3","actor_name":"Test Admin User","actor_username":"thomas.lobaugh@gmail.com","actor_via_sso":false,"log_type":"token"}	2026-02-27 14:03:59.300519+00	
00000000-0000-0000-0000-000000000000	d4fb8137-2d17-4200-95d0-99cce0f93da2	{"action":"token_revoked","actor_id":"bf455f21-2e53-416a-a134-8b4a81588db3","actor_name":"Test Admin User","actor_username":"thomas.lobaugh@gmail.com","actor_via_sso":false,"log_type":"token"}	2026-02-27 14:03:59.301363+00	
00000000-0000-0000-0000-000000000000	4dbf1454-8a0e-46f4-9013-95d1be93ded9	{"action":"logout","actor_id":"bf455f21-2e53-416a-a134-8b4a81588db3","actor_name":"Test Admin User","actor_username":"thomas.lobaugh@gmail.com","actor_via_sso":false,"log_type":"account"}	2026-02-27 14:04:18.449967+00	
00000000-0000-0000-0000-000000000000	2a504455-57af-4223-81e4-cd0f3029823c	{"action":"login","actor_id":"bf455f21-2e53-416a-a134-8b4a81588db3","actor_name":"Test Admin User","actor_username":"thomas.lobaugh@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-27 14:04:20.3532+00	
00000000-0000-0000-0000-000000000000	3efccaa6-7393-4f92-acbd-39990756833e	{"action":"logout","actor_id":"bf455f21-2e53-416a-a134-8b4a81588db3","actor_name":"Test Admin User","actor_username":"thomas.lobaugh@gmail.com","actor_via_sso":false,"log_type":"account"}	2026-02-27 14:13:55.05765+00	
00000000-0000-0000-0000-000000000000	9538ae2f-d4b4-4b4d-8144-8e21db4a2b54	{"action":"login","actor_id":"bf455f21-2e53-416a-a134-8b4a81588db3","actor_name":"Test Admin User","actor_username":"thomas.lobaugh@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-27 14:13:57.244258+00	
00000000-0000-0000-0000-000000000000	4050609d-742d-4cc3-8999-350deba0c3c6	{"action":"logout","actor_id":"bf455f21-2e53-416a-a134-8b4a81588db3","actor_name":"Test Admin User","actor_username":"thomas.lobaugh@gmail.com","actor_via_sso":false,"log_type":"account"}	2026-02-27 14:27:12.297606+00	
00000000-0000-0000-0000-000000000000	41b48f31-d5c6-4c38-bdb5-a9dc329847e5	{"action":"login","actor_id":"bf455f21-2e53-416a-a134-8b4a81588db3","actor_name":"Test Admin User","actor_username":"thomas.lobaugh@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-27 14:27:24.221064+00	
00000000-0000-0000-0000-000000000000	a012880e-3a32-4018-91c9-d739bf013a9f	{"action":"logout","actor_id":"bf455f21-2e53-416a-a134-8b4a81588db3","actor_name":"Test Admin User","actor_username":"thomas.lobaugh@gmail.com","actor_via_sso":false,"log_type":"account"}	2026-02-27 14:27:57.733527+00	
00000000-0000-0000-0000-000000000000	8020b58f-fa54-455b-81cf-cd6041a0cc66	{"action":"login","actor_id":"bf455f21-2e53-416a-a134-8b4a81588db3","actor_name":"Test Admin User","actor_username":"thomas.lobaugh@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-27 14:29:29.239083+00	
00000000-0000-0000-0000-000000000000	5e0764c8-78ac-4881-b1b7-4a98ceda5a2d	{"action":"logout","actor_id":"bf455f21-2e53-416a-a134-8b4a81588db3","actor_name":"Test Admin User","actor_username":"thomas.lobaugh@gmail.com","actor_via_sso":false,"log_type":"account"}	2026-02-27 14:36:55.112183+00	
00000000-0000-0000-0000-000000000000	528b619d-21d0-4e92-b8ea-15ad90141bc5	{"action":"login","actor_id":"bf455f21-2e53-416a-a134-8b4a81588db3","actor_name":"Test Admin User","actor_username":"thomas.lobaugh@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-27 14:36:56.873404+00	
00000000-0000-0000-0000-000000000000	032067ea-c2be-40d2-97ce-e8801c070373	{"action":"token_refreshed","actor_id":"bf455f21-2e53-416a-a134-8b4a81588db3","actor_name":"Test Admin User","actor_username":"thomas.lobaugh@gmail.com","actor_via_sso":false,"log_type":"token"}	2026-02-27 15:35:18.584811+00	
00000000-0000-0000-0000-000000000000	0334b0e2-2b34-4ac4-b272-48a79fad08be	{"action":"token_revoked","actor_id":"bf455f21-2e53-416a-a134-8b4a81588db3","actor_name":"Test Admin User","actor_username":"thomas.lobaugh@gmail.com","actor_via_sso":false,"log_type":"token"}	2026-02-27 15:35:18.585667+00	
00000000-0000-0000-0000-000000000000	1a62fb01-b2b2-408f-bfc5-c816e47c5af7	{"action":"token_refreshed","actor_id":"bf455f21-2e53-416a-a134-8b4a81588db3","actor_name":"Test Admin User","actor_username":"thomas.lobaugh@gmail.com","actor_via_sso":false,"log_type":"token"}	2026-02-27 16:33:33.110965+00	
00000000-0000-0000-0000-000000000000	31230923-fc84-4755-888c-2748add079aa	{"action":"token_revoked","actor_id":"bf455f21-2e53-416a-a134-8b4a81588db3","actor_name":"Test Admin User","actor_username":"thomas.lobaugh@gmail.com","actor_via_sso":false,"log_type":"token"}	2026-02-27 16:33:33.112067+00	
00000000-0000-0000-0000-000000000000	f264c416-f93d-4a76-b0aa-014bb5be2f09	{"action":"token_refreshed","actor_id":"bf455f21-2e53-416a-a134-8b4a81588db3","actor_name":"Test Admin User","actor_username":"thomas.lobaugh@gmail.com","actor_via_sso":false,"log_type":"token"}	2026-02-27 17:31:33.18565+00	
00000000-0000-0000-0000-000000000000	3a18e6ab-048d-4019-969a-25972cf35c9b	{"action":"token_revoked","actor_id":"bf455f21-2e53-416a-a134-8b4a81588db3","actor_name":"Test Admin User","actor_username":"thomas.lobaugh@gmail.com","actor_via_sso":false,"log_type":"token"}	2026-02-27 17:31:33.186784+00	
00000000-0000-0000-0000-000000000000	c9d8af25-515c-46ba-82cd-1d8d6d54b891	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"dev.lobaugh@gmail.com","user_id":"f2e98c26-754e-4ce3-b6c5-dbde449262f8","user_phone":""}}	2026-02-27 17:45:48.22667+00	
00000000-0000-0000-0000-000000000000	466857b0-ee2a-4ba9-915d-6ef012dc14cc	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"dev.lobaugh@gmail.com","user_id":"f2e98c26-754e-4ce3-b6c5-dbde449262f8","user_phone":""}}	2026-02-27 17:45:48.286251+00	
00000000-0000-0000-0000-000000000000	0ed20efc-6bc8-460c-bff3-a3a5ce485ee0	{"action":"logout","actor_id":"bf455f21-2e53-416a-a134-8b4a81588db3","actor_name":"Test Admin User","actor_username":"thomas.lobaugh@gmail.com","actor_via_sso":false,"log_type":"account"}	2026-02-27 17:49:11.540716+00	
00000000-0000-0000-0000-000000000000	cf0b889a-dcfc-4c34-9973-c302a872746c	{"action":"login","actor_id":"bf455f21-2e53-416a-a134-8b4a81588db3","actor_name":"Test Admin User","actor_username":"thomas.lobaugh@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-27 17:49:13.424051+00	
00000000-0000-0000-0000-000000000000	6c30b6e2-0ba3-4fc0-922a-4c90fd2ec0ad	{"action":"token_refreshed","actor_id":"bf455f21-2e53-416a-a134-8b4a81588db3","actor_name":"Test Admin User","actor_username":"thomas.lobaugh@gmail.com","actor_via_sso":false,"log_type":"token"}	2026-02-27 18:47:38.216496+00	
00000000-0000-0000-0000-000000000000	9a9a12db-8eb5-4548-9e84-41876a68a05c	{"action":"token_revoked","actor_id":"bf455f21-2e53-416a-a134-8b4a81588db3","actor_name":"Test Admin User","actor_username":"thomas.lobaugh@gmail.com","actor_via_sso":false,"log_type":"token"}	2026-02-27 18:47:38.21742+00	
00000000-0000-0000-0000-000000000000	2682cfa5-4f00-486a-9e91-24def41677ee	{"action":"token_refreshed","actor_id":"bf455f21-2e53-416a-a134-8b4a81588db3","actor_name":"Test Admin User","actor_username":"thomas.lobaugh@gmail.com","actor_via_sso":false,"log_type":"token"}	2026-02-27 19:45:38.170446+00	
00000000-0000-0000-0000-000000000000	c2c332b9-8013-4a92-99fa-1e0302b4983e	{"action":"token_revoked","actor_id":"bf455f21-2e53-416a-a134-8b4a81588db3","actor_name":"Test Admin User","actor_username":"thomas.lobaugh@gmail.com","actor_via_sso":false,"log_type":"token"}	2026-02-27 19:45:38.171649+00	
00000000-0000-0000-0000-000000000000	3fb466af-b15b-4d9b-924e-5e99d5c91a86	{"action":"token_refreshed","actor_id":"bf455f21-2e53-416a-a134-8b4a81588db3","actor_name":"Test Admin User","actor_username":"thomas.lobaugh@gmail.com","actor_via_sso":false,"log_type":"token"}	2026-02-27 20:43:56.38078+00	
00000000-0000-0000-0000-000000000000	29b8a080-3858-4014-8720-e1bf0bdf373a	{"action":"token_revoked","actor_id":"bf455f21-2e53-416a-a134-8b4a81588db3","actor_name":"Test Admin User","actor_username":"thomas.lobaugh@gmail.com","actor_via_sso":false,"log_type":"token"}	2026-02-27 20:43:56.381701+00	
00000000-0000-0000-0000-000000000000	d472fcb0-641a-4608-bdb4-5c2985438a48	{"action":"token_refreshed","actor_id":"bf455f21-2e53-416a-a134-8b4a81588db3","actor_name":"Test Admin User","actor_username":"thomas.lobaugh@gmail.com","actor_via_sso":false,"log_type":"token"}	2026-02-27 21:41:56.363878+00	
00000000-0000-0000-0000-000000000000	d4a41126-1975-4684-b83b-060c2dfe8b43	{"action":"token_revoked","actor_id":"bf455f21-2e53-416a-a134-8b4a81588db3","actor_name":"Test Admin User","actor_username":"thomas.lobaugh@gmail.com","actor_via_sso":false,"log_type":"token"}	2026-02-27 21:41:56.369463+00	
\.


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.flow_state (id, user_id, auth_code, code_challenge_method, code_challenge, provider_type, provider_access_token, provider_refresh_token, created_at, updated_at, authentication_method, auth_code_issued_at, invite_token, referrer, oauth_client_state_id, linking_target_id, email_optional) FROM stdin;
\.


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, id) FROM stdin;
bf455f21-2e53-416a-a134-8b4a81588db3	bf455f21-2e53-416a-a134-8b4a81588db3	{"sub": "bf455f21-2e53-416a-a134-8b4a81588db3", "email": "thomas.lobaugh@gmail.com", "email_verified": false, "phone_verified": false}	email	2026-02-26 00:27:24.863644+00	2026-02-26 00:27:24.863698+00	2026-02-26 00:27:24.863698+00	dd7ad0a8-575d-4628-8fd7-adb86dd1ecaa
f93f0ecf-47d2-4d40-a4b4-4c22a301c374	f93f0ecf-47d2-4d40-a4b4-4c22a301c374	{"sub": "f93f0ecf-47d2-4d40-a4b4-4c22a301c374", "email": "thomas.lobaugh@example.com", "email_verified": false, "phone_verified": false}	email	2026-02-27 00:01:31.387983+00	2026-02-27 00:01:31.388054+00	2026-02-27 00:01:31.388054+00	a8c6a98c-276a-4e73-abd6-88db179af22a
\.


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.instances (id, uuid, raw_base_config, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_amr_claims (session_id, created_at, updated_at, authentication_method, id) FROM stdin;
cd5be78f-7ae5-44e0-aa89-69d4576e6c5f	2026-02-27 00:19:01.88097+00	2026-02-27 00:19:01.88097+00	password	d84c574f-ce65-4703-b1cf-1eb0b3c72439
2c8def62-76b6-40db-b754-7ee3bd7da51d	2026-02-27 17:49:13.429985+00	2026-02-27 17:49:13.429985+00	password	562485ee-7674-403a-8157-f4033737b9fd
\.


--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_challenges (id, factor_id, created_at, verified_at, ip_address, otp_code, web_authn_session_data) FROM stdin;
\.


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_factors (id, user_id, friendly_name, factor_type, status, created_at, updated_at, secret, phone, last_challenged_at, web_authn_credential, web_authn_aaguid, last_webauthn_challenge_data) FROM stdin;
\.


--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.oauth_authorizations (id, authorization_id, client_id, user_id, redirect_uri, scope, state, resource, code_challenge, code_challenge_method, response_type, status, authorization_code, created_at, expires_at, approved_at, nonce) FROM stdin;
\.


--
-- Data for Name: oauth_client_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.oauth_client_states (id, provider_type, code_verifier, created_at) FROM stdin;
\.


--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.oauth_clients (id, client_secret_hash, registration_type, redirect_uris, grant_types, client_name, client_uri, logo_uri, created_at, updated_at, deleted_at, client_type, token_endpoint_auth_method) FROM stdin;
\.


--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.oauth_consents (id, user_id, client_id, scopes, granted_at, revoked_at) FROM stdin;
\.


--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.one_time_tokens (id, user_id, token_type, token_hash, relates_to, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.refresh_tokens (instance_id, id, token, user_id, revoked, created_at, updated_at, parent, session_id) FROM stdin;
00000000-0000-0000-0000-000000000000	15	f4larojregdg	f93f0ecf-47d2-4d40-a4b4-4c22a301c374	f	2026-02-27 00:19:01.877695+00	2026-02-27 00:19:01.877695+00	\N	cd5be78f-7ae5-44e0-aa89-69d4576e6c5f
00000000-0000-0000-0000-000000000000	63	tdcc7m2owxrp	bf455f21-2e53-416a-a134-8b4a81588db3	t	2026-02-27 17:49:13.428034+00	2026-02-27 18:47:38.217947+00	\N	2c8def62-76b6-40db-b754-7ee3bd7da51d
00000000-0000-0000-0000-000000000000	64	fumja2izlerr	bf455f21-2e53-416a-a134-8b4a81588db3	t	2026-02-27 18:47:38.218564+00	2026-02-27 19:45:38.172404+00	tdcc7m2owxrp	2c8def62-76b6-40db-b754-7ee3bd7da51d
00000000-0000-0000-0000-000000000000	65	2cful3gxg272	bf455f21-2e53-416a-a134-8b4a81588db3	t	2026-02-27 19:45:38.173399+00	2026-02-27 20:43:56.382415+00	fumja2izlerr	2c8def62-76b6-40db-b754-7ee3bd7da51d
00000000-0000-0000-0000-000000000000	66	wt5igvo34nfc	bf455f21-2e53-416a-a134-8b4a81588db3	t	2026-02-27 20:43:56.383304+00	2026-02-27 21:41:56.370205+00	2cful3gxg272	2c8def62-76b6-40db-b754-7ee3bd7da51d
00000000-0000-0000-0000-000000000000	67	6tptzdurlb57	bf455f21-2e53-416a-a134-8b4a81588db3	f	2026-02-27 21:41:56.370826+00	2026-02-27 21:41:56.370826+00	wt5igvo34nfc	2c8def62-76b6-40db-b754-7ee3bd7da51d
\.


--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.saml_providers (id, sso_provider_id, entity_id, metadata_xml, metadata_url, attribute_mapping, created_at, updated_at, name_id_format) FROM stdin;
\.


--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.saml_relay_states (id, sso_provider_id, request_id, for_email, redirect_to, created_at, updated_at, flow_state_id) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.schema_migrations (version) FROM stdin;
20171026211738
20171026211808
20171026211834
20180103212743
20180108183307
20180119214651
20180125194653
00
20210710035447
20210722035447
20210730183235
20210909172000
20210927181326
20211122151130
20211124214934
20211202183645
20220114185221
20220114185340
20220224000811
20220323170000
20220429102000
20220531120530
20220614074223
20220811173540
20221003041349
20221003041400
20221011041400
20221020193600
20221021073300
20221021082433
20221027105023
20221114143122
20221114143410
20221125140132
20221208132122
20221215195500
20221215195800
20221215195900
20230116124310
20230116124412
20230131181311
20230322519590
20230402418590
20230411005111
20230508135423
20230523124323
20230818113222
20230914180801
20231027141322
20231114161723
20231117164230
20240115144230
20240214120130
20240306115329
20240314092811
20240427152123
20240612123726
20240729123726
20240802193726
20240806073726
20241009103726
20250717082212
20250731150234
20250804100000
20250901200500
20250903112500
20250904133000
20250925093508
20251007112900
20251104100000
20251111201300
20251201000000
20260115000000
20260121000000
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.sessions (id, user_id, created_at, updated_at, factor_id, aal, not_after, refreshed_at, user_agent, ip, tag, oauth_client_id, refresh_token_hmac_key, refresh_token_counter, scopes) FROM stdin;
cd5be78f-7ae5-44e0-aa89-69d4576e6c5f	f93f0ecf-47d2-4d40-a4b4-4c22a301c374	2026-02-27 00:19:01.87449+00	2026-02-27 00:19:01.87449+00	\N	aal1	\N	\N	curl/7.81.0	172.19.0.1	\N	\N	\N	\N	\N
2c8def62-76b6-40db-b754-7ee3bd7da51d	bf455f21-2e53-416a-a134-8b4a81588db3	2026-02-27 17:49:13.425768+00	2026-02-27 21:41:56.373096+00	\N	aal1	\N	2026-02-27 21:41:56.373013	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36	172.19.0.1	\N	\N	\N	\N	\N
\.


--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.sso_domains (id, sso_provider_id, domain, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.sso_providers (id, resource_id, created_at, updated_at, disabled) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at, is_anonymous) FROM stdin;
00000000-0000-0000-0000-000000000000	f93f0ecf-47d2-4d40-a4b4-4c22a301c374	authenticated	authenticated	thomas.lobaugh@example.com	$2a$10$5jyPzNi3HRkbtPdyHzt2qepa8s1dtszLgFyF1bJNjTnKD2bJsv.Gq	2026-02-27 00:01:31.391136+00	\N		\N		\N			\N	2026-02-27 00:19:01.874332+00	{"provider": "email", "providers": ["email"]}	{"username": "Thomas Lobaugh", "email_verified": true}	\N	2026-02-27 00:01:31.375675+00	2026-02-27 00:19:01.879891+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	bf455f21-2e53-416a-a134-8b4a81588db3	authenticated	authenticated	thomas.lobaugh@gmail.com	$2a$10$2iNQ7guZUXLpNxYnfbGZXeohG80scxOxCHD0Ismjcd6TZgftzbYDW	2026-02-26 00:27:24.870041+00	\N		\N		\N			\N	2026-02-27 17:49:13.425653+00	{"provider": "email", "providers": ["email"]}	{"full_name": "Test Admin User", "email_verified": true}	\N	2026-02-26 00:27:24.856675+00	2026-02-27 21:41:56.371873+00	\N	\N			\N		0	\N		\N	f	\N	f
\N	267a5730-adfc-47b9-8b0f-00d837238e7a	authenticated	authenticated	test@example.com	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-06 19:15:07.079+00	2026-02-06 19:15:07.079+00	\N	\N			\N		0	\N		\N	f	\N	f
\.


--
-- Data for Name: boost_custom_names; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.boost_custom_names (id, boost_id, user_id, custom_name, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: boosts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.boosts (id, name, icon, boost_type, rarity, boost_stats, series, season_id, is_free, created_at, updated_at) FROM stdin;
03dbcf8a-096d-40ea-98f9-f1976c4a4559	Boost 31	BoostIcon_Unstoppable	\N	\N	{"block": 0, "speed": 3, "corners": 0, "duration": 30, "overtake": 5, "pit_stop": 0, "tyre_use": 0, "power_unit": 2, "race_start": 0}	\N	\N	f	2026-02-12 03:27:03.265+00	2026-02-12 03:27:03.265+00
040549a0-9804-4e52-ae7b-6707451ab305	Boost 30	BoostIcon_GP_Easter	\N	\N	{"block": 3, "speed": 0, "corners": 0, "duration": 30, "overtake": 0, "pit_stop": 5, "tyre_use": 0, "power_unit": 2, "race_start": 0}	\N	\N	f	2026-02-12 03:27:03.273+00	2026-02-12 03:27:03.273+00
059a30e3-f649-4c3e-9345-7f4bc2606790	Boost 55	BoostIcon_Impact	\N	\N	{"block": 0, "speed": 2, "corners": 0, "duration": 30, "overtake": 3, "pit_stop": 0, "tyre_use": 0, "power_unit": 1, "race_start": 0}	\N	\N	f	2026-02-12 03:27:03.278+00	2026-02-12 03:27:03.278+00
0f03a4cb-a254-4d85-86eb-6cb3cf80cf2f	Boost 11	BoostIcon_GP_Brazil	\N	\N	{"block": 0, "speed": 1, "corners": 0, "duration": 30, "overtake": 0, "pit_stop": 4, "tyre_use": 0, "power_unit": 5, "race_start": 0}	\N	\N	f	2026-02-12 03:27:03.283+00	2026-02-12 03:27:03.283+00
1d16d89d-996a-4e8e-9582-a5bad9dc8086	Boost 24	BoostIcon_GP_Austria	\N	\N	{"block": 0, "speed": 2, "corners": 3, "duration": 30, "overtake": 0, "pit_stop": 5, "tyre_use": 0, "power_unit": 0, "race_start": 0}	\N	\N	f	2026-02-12 03:27:03.295+00	2026-02-12 03:27:03.295+00
2185b145-2c6c-4048-a9ad-188e83946a6d	Boost 23	BoostIcon_GP_France	\N	\N	{"block": 0, "speed": 0, "corners": 0, "duration": 30, "overtake": 4, "pit_stop": 0, "tyre_use": 0, "power_unit": 2, "race_start": 4}	\N	\N	f	2026-02-12 03:27:03.3+00	2026-02-12 03:27:03.3+00
2253190a-c67b-4e36-90c6-76535612cb0c	Boost 35	BoostIcon_GP_NYE	\N	\N	{"block": 0, "speed": 4, "corners": 0, "duration": 30, "overtake": 3, "pit_stop": 0, "tyre_use": 0, "power_unit": 0, "race_start": 3}	\N	\N	f	2026-02-12 03:27:03.306+00	2026-02-12 03:27:03.306+00
2672ad41-3213-43c0-855d-e7464ef6e044	Boost 21	BoostIcon_GP_Monaco	\N	\N	{"block": 2, "speed": 0, "corners": 4, "duration": 30, "overtake": 0, "pit_stop": 0, "tyre_use": 0, "power_unit": 0, "race_start": 4}	\N	\N	f	2026-02-12 03:27:03.318+00	2026-02-12 03:27:03.318+00
2d0556ef-eba9-4575-a688-c832d6f30195	Boost 17	BoostIcon_GP_Bahrain	\N	\N	{"block": 3, "speed": 0, "corners": 3, "duration": 30, "overtake": 0, "pit_stop": 0, "tyre_use": 0, "power_unit": 4, "race_start": 0}	\N	\N	f	2026-02-12 03:27:03.323+00	2026-02-12 03:27:03.323+00
376de140-20fa-4b3a-a503-47cdba8f9825	Boost 41	BoostIcon_GP_Saudi	\N	\N	{"block": 0, "speed": 0, "corners": 2, "duration": 30, "overtake": 3, "pit_stop": 5, "tyre_use": 0, "power_unit": 0, "race_start": 0}	\N	\N	f	2026-02-12 03:27:03.329+00	2026-02-12 03:27:03.329+00
37c217e0-ab0a-42c1-b4aa-1746144417b1	Boost 62	BoostIcon_LaunchPad	\N	\N	{"block": 0, "speed": 0, "corners": 0, "duration": 30, "overtake": 0, "pit_stop": 2, "tyre_use": 0, "power_unit": 3, "race_start": 5}	\N	\N	f	2026-02-12 03:27:03.338+00	2026-02-12 03:27:03.338+00
3d58c8d7-9f72-43e1-a155-0837c8c9f4c3	Boost 25	BoostIcon_GP_GreatBritain	\N	\N	{"block": 0, "speed": 0, "corners": 4, "duration": 30, "overtake": 2, "pit_stop": 0, "tyre_use": 0, "power_unit": 0, "race_start": 4}	\N	\N	f	2026-02-12 03:27:03.344+00	2026-02-12 03:27:03.344+00
3ff76b3b-382d-4e6f-a0d7-60765c58fc2c	Boost 19	BoostIcon_GP_Azerbaijan	\N	\N	{"block": 0, "speed": 3, "corners": 0, "duration": 30, "overtake": 5, "pit_stop": 0, "tyre_use": 2, "power_unit": 0, "race_start": 0}	\N	\N	f	2026-02-12 03:27:03.348+00	2026-02-12 03:27:03.348+00
412231f2-4e96-4919-8f98-39fb3c53ae42	Boost 61	BoostIcon_RookieReload	\N	\N	{"block": 0, "speed": 1, "corners": 4, "duration": 30, "overtake": 0, "pit_stop": 0, "tyre_use": 0, "power_unit": 5, "race_start": 0}	\N	\N	f	2026-02-12 03:27:03.354+00	2026-02-12 03:27:03.354+00
43b993a8-eff6-4a19-810d-273144b17c11	Boost 10	BoostIcon_GP_America	\N	\N	{"block": 0, "speed": 3, "corners": 0, "duration": 30, "overtake": 0, "pit_stop": 3, "tyre_use": 4, "power_unit": 0, "race_start": 0}	\N	\N	f	2026-02-12 03:27:03.36+00	2026-02-12 03:27:03.36+00
4b3aad32-87a8-4cdb-b119-75e5761b374b	Boost 60	BoostIcon_Genesis	\N	\N	{"block": 5, "speed": 2, "corners": 3, "duration": 30, "overtake": 0, "pit_stop": 0, "tyre_use": 0, "power_unit": 0, "race_start": 0}	\N	\N	f	2026-02-12 03:27:03.366+00	2026-02-12 03:27:03.366+00
4c77fd00-9ca3-4e94-93be-7c8724dcb0fe	Boost 20	BoostIcon_GP_Spain	\N	\N	{"block": 0, "speed": 4, "corners": 0, "duration": 30, "overtake": 1, "pit_stop": 0, "tyre_use": 0, "power_unit": 5, "race_start": 0}	\N	\N	f	2026-02-12 03:27:03.373+00	2026-02-12 03:27:03.373+00
4e4a458f-b583-470d-9a1c-684a6090765d	Boost 47	BoostIcon_GP_SummerBreak	\N	\N	{"block": 0, "speed": 0, "corners": 0, "duration": 30, "overtake": 0, "pit_stop": 0, "tyre_use": 1, "power_unit": 4, "race_start": 5}	\N	\N	f	2026-02-12 03:27:03.379+00	2026-02-12 03:27:03.379+00
502d8986-5e71-4135-8305-5aaa87c6451d	Boost 9	BoostIcon_GP_Mexico	\N	\N	{"block": 0, "speed": 5, "corners": 0, "duration": 30, "overtake": 3, "pit_stop": 0, "tyre_use": 0, "power_unit": 2, "race_start": 0}	\N	\N	f	2026-02-12 03:27:03.386+00	2026-02-12 03:27:03.386+00
5066ffc2-b9ab-4898-af4f-b23a3e9fde8e	Boost 13	BoostIcon_GP_Belgium	\N	\N	{"block": 4, "speed": 0, "corners": 0, "duration": 30, "overtake": 0, "pit_stop": 0, "tyre_use": 2, "power_unit": 4, "race_start": 0}	\N	\N	f	2026-02-12 03:27:03.391+00	2026-02-12 03:27:03.391+00
54eacc08-369e-4152-94a4-738997510723	Boost 22	BoostIcon_GP_Canada	\N	\N	{"block": 3, "speed": 0, "corners": 0, "duration": 30, "overtake": 0, "pit_stop": 5, "tyre_use": 2, "power_unit": 0, "race_start": 0}	\N	\N	f	2026-02-12 03:27:03.396+00	2026-02-12 03:27:03.396+00
566c5273-016f-4cf7-9511-0d3c77dbe2bf	Boost 12	BoostIcon_GP_AbuDhabi	\N	\N	{"block": 4, "speed": 0, "corners": 0, "duration": 30, "overtake": 0, "pit_stop": 0, "tyre_use": 4, "power_unit": 0, "race_start": 2}	\N	\N	f	2026-02-12 03:27:03.4+00	2026-02-12 03:27:03.4+00
192fcf08-1f37-4c1a-91c3-6cd26e89eeca	Boost 3	BoostIcon_3	\N	\N	{"block": 0, "speed": 0, "corners": 2, "duration": 30, "overtake": 0, "pit_stop": 1, "tyre_use": 0, "power_unit": 0, "race_start": 1}	\N	\N	t	2026-02-12 03:27:03.29+00	2026-02-27 16:25:59.601392+00
250b1fd6-924a-41b6-aefe-ce1de81d97ef	Boost 4	BoostIcon_4	\N	\N	{"block": 0, "speed": 0, "corners": 0, "duration": 30, "overtake": 0, "pit_stop": 0, "tyre_use": 1, "power_unit": 3, "race_start": 2}	\N	\N	t	2026-02-12 03:27:03.311+00	2026-02-27 16:26:00.350628+00
5a12527c-097d-4487-9540-331df6818e52	Boost 63	BoostIcon_FullSend	\N	\N	{"block": 0, "speed": 5, "corners": 0, "duration": 30, "overtake": 1, "pit_stop": 0, "tyre_use": 0, "power_unit": 4, "race_start": 0}	\N	\N	f	2026-02-12 03:27:03.409+00	2026-02-12 03:27:03.409+00
5e95bae0-76aa-4860-b2b1-a35c430676eb	Boost 44	BoostIcon_GP_Thanksgiving	\N	\N	{"block": 4, "speed": 0, "corners": 2, "duration": 30, "overtake": 4, "pit_stop": 0, "tyre_use": 0, "power_unit": 0, "race_start": 0}	\N	\N	f	2026-02-12 03:27:03.413+00	2026-02-12 03:27:03.413+00
6072b063-b550-4d42-b29a-b96de5f9f474	Boost 57	BoostIcon_Christmas25	\N	\N	{"block": 0, "speed": 4, "corners": 4, "duration": 30, "overtake": 2, "pit_stop": 0, "tyre_use": 0, "power_unit": 0, "race_start": 0}	\N	\N	f	2026-02-12 03:27:03.418+00	2026-02-12 03:27:03.418+00
60f51e95-bcf6-42a1-8ae9-65923de52d6f	Boost 56	BoostIcon_Crown	\N	\N	{"block": 1, "speed": 0, "corners": 0, "duration": 30, "overtake": 0, "pit_stop": 5, "tyre_use": 4, "power_unit": 0, "race_start": 0}	\N	\N	f	2026-02-12 03:27:03.423+00	2026-02-12 03:27:03.423+00
63b24b92-c50a-4468-9764-b76c3e39c40d	Boost 49	BoostIcon_GP_TheNuke	\N	\N	{"block": 0, "speed": 5, "corners": 0, "duration": 30, "overtake": 0, "pit_stop": 0, "tyre_use": 0, "power_unit": 3, "race_start": 2}	\N	\N	f	2026-02-12 03:27:03.428+00	2026-02-12 03:27:03.428+00
6751fb40-7dd8-4d0d-bcbc-a434ddff68f4	Boost 59	BoostIcon_RookieRush	\N	\N	{"block": 3, "speed": 0, "corners": 0, "duration": 30, "overtake": 0, "pit_stop": 0, "tyre_use": 5, "power_unit": 0, "race_start": 2}	\N	\N	f	2026-02-12 03:27:03.437+00	2026-02-12 03:27:03.437+00
76559b7a-76c4-4936-bcf9-8a894fb348bb	Boost 46	BoostIcon_GP_LegendaryDrivers	\N	\N	{"block": 0, "speed": 2, "corners": 5, "duration": 30, "overtake": 0, "pit_stop": 0, "tyre_use": 0, "power_unit": 0, "race_start": 3}	\N	\N	f	2026-02-12 03:27:03.448+00	2026-02-12 03:27:03.448+00
7e64c97f-c9ba-482a-99b4-fb3dc337a759	Boost 51	BoostIcon_Pumpkin	\N	\N	{"block": 0, "speed": 0, "corners": 4, "duration": 30, "overtake": 0, "pit_stop": 0, "tyre_use": 4, "power_unit": 0, "race_start": 2}	\N	\N	f	2026-02-12 03:27:03.452+00	2026-02-12 03:27:03.452+00
7fec7e9c-47bb-4314-b0b1-e04a65528009	Boost 14	BoostIcon_GP_Italy	\N	\N	{"block": 5, "speed": 0, "corners": 0, "duration": 30, "overtake": 0, "pit_stop": 0, "tyre_use": 0, "power_unit": 2, "race_start": 3}	\N	\N	f	2026-02-12 03:27:03.457+00	2026-02-12 03:27:03.457+00
8330ccff-eddb-413c-acd5-622090b5f26d	Boost 40	BoostIcon_GP_Earthday	\N	\N	{"block": 0, "speed": 0, "corners": 0, "duration": 30, "overtake": 0, "pit_stop": 1, "tyre_use": 4, "power_unit": 5, "race_start": 0}	\N	\N	f	2026-02-12 03:27:03.461+00	2026-02-12 03:27:03.461+00
8913ea40-314d-4934-af51-94fa40d5bbf6	Boost 16	BoostIcon_GP_Australia	\N	\N	{"block": 0, "speed": 3, "corners": 0, "duration": 30, "overtake": 2, "pit_stop": 0, "tyre_use": 0, "power_unit": 0, "race_start": 5}	\N	\N	f	2026-02-12 03:27:03.467+00	2026-02-12 03:27:03.467+00
8aa55439-e30f-47a9-be77-03e0545e44f1	Boost 36	BoostIcon_GP_Vietnam	\N	\N	{"block": 2, "speed": 0, "corners": 0, "duration": 30, "overtake": 0, "pit_stop": 3, "tyre_use": 0, "power_unit": 0, "race_start": 5}	\N	\N	f	2026-02-12 03:27:03.471+00	2026-02-12 03:27:03.471+00
8e8bf64e-0519-456f-938f-7e402a5b6aec	Boost 45	BoostIcon_GP_LasVegas	\N	\N	{"block": 0, "speed": 0, "corners": 3, "duration": 30, "overtake": 3, "pit_stop": 0, "tyre_use": 0, "power_unit": 4, "race_start": 0}	\N	\N	f	2026-02-12 03:27:03.475+00	2026-02-12 03:27:03.475+00
9117423b-6923-457c-b0d1-7955edbec45e	Boost 15	BoostIcon_GP_Singapore	\N	\N	{"block": 0, "speed": 3, "corners": 5, "duration": 30, "overtake": 0, "pit_stop": 2, "tyre_use": 0, "power_unit": 0, "race_start": 0}	\N	\N	f	2026-02-12 03:27:03.48+00	2026-02-12 03:27:03.48+00
92f72e84-3605-469d-88ea-47f181cf788f	Boost 7	BoostIcon_GP_Russia	\N	\N	{"block": 2, "speed": 0, "corners": 3, "duration": 30, "overtake": 0, "pit_stop": 0, "tyre_use": 5, "power_unit": 0, "race_start": 0}	\N	\N	f	2026-02-12 03:27:03.485+00	2026-02-12 03:27:03.485+00
973bbb3a-15f8-45f4-ac58-248e142dc342	Boost 37	BoostIcon_GP_Winter	\N	\N	{"block": 0, "speed": 0, "corners": 0, "duration": 30, "overtake": 0, "pit_stop": 0, "tyre_use": 5, "power_unit": 2, "race_start": 3}	\N	\N	f	2026-02-12 03:27:03.49+00	2026-02-12 03:27:03.49+00
9765fcc4-6180-4b15-9309-72ac52beb836	Boost 34	BoostIcon_GP_Turkey	\N	\N	{"block": 0, "speed": 0, "corners": 3, "duration": 30, "overtake": 0, "pit_stop": 0, "tyre_use": 3, "power_unit": 0, "race_start": 4}	\N	\N	f	2026-02-12 03:27:03.495+00	2026-02-12 03:27:03.495+00
a02cdf34-f7d7-4041-97e1-d00a1ca7883f	Boost 38	BoostIcon_GP_Netherlands	\N	\N	{"block": 2, "speed": 4, "corners": 0, "duration": 30, "overtake": 0, "pit_stop": 4, "tyre_use": 0, "power_unit": 0, "race_start": 0}	\N	\N	f	2026-02-12 03:27:03.5+00	2026-02-12 03:27:03.5+00
a2bbc757-8a1f-4dfa-8874-d9f711de7997	Boost 28	BoostIcon_DeadFast	\N	\N	{"block": 0, "speed": 5, "corners": 0, "duration": 30, "overtake": 0, "pit_stop": 0, "tyre_use": 1, "power_unit": 4, "race_start": 0}	\N	\N	f	2026-02-12 03:27:03.505+00	2026-02-12 03:27:03.505+00
aaf73338-e469-4413-a234-b8da2008f089	Boost 32	BoostIcon_GP_Portugal	\N	\N	{"block": 3, "speed": 0, "corners": 5, "duration": 30, "overtake": 0, "pit_stop": 0, "tyre_use": 0, "power_unit": 0, "race_start": 2}	\N	\N	f	2026-02-12 03:27:03.511+00	2026-02-12 03:27:03.511+00
bbc6ed61-5070-4efd-94f9-7d3d2bb95112	Boost 27	BoostIcon_GP_Hungary	\N	\N	{"block": 0, "speed": 0, "corners": 3, "duration": 30, "overtake": 2, "pit_stop": 0, "tyre_use": 0, "power_unit": 0, "race_start": 5}	\N	\N	f	2026-02-12 03:27:03.517+00	2026-02-12 03:27:03.517+00
bd884465-c323-4f1f-ba21-28ab9ac3c6c4	Boost 50	BoostIcon_GP_TireWater	\N	\N	{"block": 0, "speed": 0, "corners": 1, "duration": 30, "overtake": 0, "pit_stop": 1, "tyre_use": 2, "power_unit": 0, "race_start": 0}	\N	\N	f	2026-02-12 03:27:03.522+00	2026-02-12 03:27:03.522+00
bf993439-c805-43cd-8205-e39602660ae3	Boost 43	BoostIcon_GP_Pride	\N	\N	{"block": 5, "speed": 4, "corners": 0, "duration": 30, "overtake": 0, "pit_stop": 0, "tyre_use": 0, "power_unit": 0, "race_start": 1}	\N	\N	f	2026-02-12 03:27:03.527+00	2026-02-12 03:27:03.527+00
bfe138ee-c3e1-452f-9827-17c88d2948f2	Boost 39	BoostIcon_GP_Equinox	\N	\N	{"block": 0, "speed": 5, "corners": 0, "duration": 30, "overtake": 3, "pit_stop": 2, "tyre_use": 0, "power_unit": 0, "race_start": 0}	\N	\N	f	2026-02-12 03:27:03.531+00	2026-02-12 03:27:03.531+00
c8d6c623-d2ee-4eea-b9f6-e912bab8a5da	Boost 18	BoostIcon_GP_China	\N	\N	{"block": 0, "speed": 0, "corners": 0, "duration": 30, "overtake": 4, "pit_stop": 0, "tyre_use": 3, "power_unit": 3, "race_start": 0}	\N	\N	f	2026-02-12 03:27:03.536+00	2026-02-12 03:27:03.536+00
ccf58798-0358-4372-9226-39a9f820cb4d	Boost 8	BoostIcon_GP_Japan	\N	\N	{"block": 0, "speed": 0, "corners": 4, "duration": 30, "overtake": 0, "pit_stop": 3, "tyre_use": 0, "power_unit": 0, "race_start": 3}	\N	\N	f	2026-02-12 03:27:03.541+00	2026-02-12 03:27:03.541+00
d228465e-ae2d-4efe-b885-196903b759f0	Boost 26	BoostIcon_GP_Germany	\N	\N	{"block": 0, "speed": 0, "corners": 0, "duration": 30, "overtake": 0, "pit_stop": 2, "tyre_use": 5, "power_unit": 3, "race_start": 0}	\N	\N	f	2026-02-12 03:27:03.556+00	2026-02-12 03:27:03.556+00
e01f3c49-d239-45c1-80ab-cad61f397cea	Boost 64	BoostIcon_Heartbreaker	\N	\N	{"block": 0, "speed": 4, "corners": 0, "duration": 30, "overtake": 3, "pit_stop": 0, "tyre_use": 0, "power_unit": 0, "race_start": 4}	\N	\N	f	2026-02-12 03:27:03.563+00	2026-02-12 03:27:03.563+00
e6a4a99f-8ecd-43ec-85f0-d8f6c346b261	Boost 48	BoostIcon_GP_RoarOfTheThaiger	\N	\N	{"block": 0, "speed": 0, "corners": 0, "duration": 30, "overtake": 5, "pit_stop": 2, "tyre_use": 3, "power_unit": 0, "race_start": 0}	\N	\N	f	2026-02-12 03:27:03.598+00	2026-02-12 03:27:03.598+00
ef83bf5d-2e7f-4665-8ce1-55f9d9fe5aae	Boost 53	BoostIcon_GP_Handlebar	\N	\N	{"block": 5, "speed": 0, "corners": 2, "duration": 30, "overtake": 0, "pit_stop": 0, "tyre_use": 3, "power_unit": 0, "race_start": 0}	\N	\N	f	2026-02-12 03:27:03.604+00	2026-02-12 03:27:03.604+00
f9b628f5-9911-44d8-ae1b-6aaea82af145	SERVLOC_TXT_BOOST_NAME_52	BoostIcon_GhoulFuel	\N	\N	{"block": 0, "speed": 0, "corners": 0, "duration": 30, "overtake": 5, "pit_stop": 3, "tyre_use": 0, "power_unit": 2, "race_start": 0}	\N	\N	f	2026-02-12 03:27:03.611+00	2026-02-12 03:27:03.611+00
f9c50b1d-0928-4ecb-8d73-082d0b99c14b	Boost 33	BoostIcon_GP_Movember	\N	\N	{"block": 3, "speed": 0, "corners": 5, "duration": 30, "overtake": 0, "pit_stop": 0, "tyre_use": 2, "power_unit": 0, "race_start": 0}	\N	\N	f	2026-02-12 03:27:03.617+00	2026-02-12 03:27:03.617+00
fae0aae8-7aa1-4438-b65c-6e7169640584	Boost 58	BoostIcon_Confetti	\N	\N	{"block": 0, "speed": 0, "corners": 0, "duration": 30, "overtake": 2, "pit_stop": 3, "tyre_use": 0, "power_unit": 0, "race_start": 5}	\N	\N	f	2026-02-12 03:27:03.626+00	2026-02-12 03:27:03.626+00
fccbd6dc-f4bd-45f0-89d4-4b8b05de6aa8	Boost 29	BoostIcon_GP_Xmas	\N	\N	{"block": 4, "speed": 0, "corners": 2, "duration": 30, "overtake": 0, "pit_stop": 4, "tyre_use": 0, "power_unit": 0, "race_start": 0}	\N	\N	f	2026-02-12 03:27:03.632+00	2026-02-12 03:27:03.632+00
fe071b34-adcc-4acc-9612-f4a31adb40a0	Boost 42	BoostIcon_GP_Miami	\N	\N	{"block": 5, "speed": 2, "corners": 0, "duration": 30, "overtake": 0, "pit_stop": 0, "tyre_use": 0, "power_unit": 3, "race_start": 0}	\N	\N	f	2026-02-12 03:27:03.644+00	2026-02-12 03:27:03.644+00
599fd54b-4438-4928-9d4c-51eb3c0c5a24	Boost 1	BoostIcon_1	\N	\N	{"block": 0, "speed": 0, "corners": 1, "duration": 30, "overtake": 0, "pit_stop": 0, "tyre_use": 1, "power_unit": 1, "race_start": 0}	\N	\N	t	2026-02-12 03:27:03.405+00	2026-02-27 16:25:56.017595+00
645835dc-03d0-464f-9800-c974e6712fa8	Boost 2	BoostIcon_2	\N	\N	{"block": 1, "speed": 2, "corners": 0, "duration": 30, "overtake": 1, "pit_stop": 0, "tyre_use": 0, "power_unit": 0, "race_start": 0}	\N	\N	t	2026-02-12 03:27:03.432+00	2026-02-27 16:25:58.284194+00
cf38d7e6-437f-4518-ad84-ecf18d2e8b4a	Boost 5	BoostIcon_5	\N	\N	{"block": 2, "speed": 0, "corners": 1, "duration": 30, "overtake": 0, "pit_stop": 0, "tyre_use": 3, "power_unit": 0, "race_start": 0}	\N	\N	t	2026-02-12 03:27:03.55+00	2026-02-27 16:26:01.111971+00
fce48870-011d-4541-b3eb-fb85f6d5111b	Boost 6	BoostIcon_6	\N	\N	{"block": 0, "speed": 3, "corners": 0, "duration": 30, "overtake": 4, "pit_stop": 1, "tyre_use": 0, "power_unit": 0, "race_start": 0}	\N	\N	t	2026-02-12 03:27:03.638+00	2026-02-27 16:26:01.863913+00
\.


--
-- Data for Name: car_parts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.car_parts (id, name, rarity, series, season_id, icon, cc_price, num_duplicates_after_unlock, collection_id, visual_override, collection_sub_name, car_part_type, stats_per_level, created_at, updated_at) FROM stdin;
06af5368-987f-4432-b063-77d9163e3847	Equinox	3	1	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Suspension_24_Zenith	45	2	\N	\N	\N	3	[{"drs": 0, "speed": 4, "cornering": 2, "powerUnit": 9, "qualifying": 3, "pitStopTime": 0.93, "cardsToUpgrade": 4, "softCurrencyToUpgrade": 2000}, {"drs": 0, "speed": 5, "cornering": 3, "powerUnit": 12, "qualifying": 4, "pitStopTime": 0.9, "cardsToUpgrade": 10, "softCurrencyToUpgrade": 8000}, {"drs": 0, "speed": 6, "cornering": 4, "powerUnit": 14, "qualifying": 5, "pitStopTime": 0.86, "cardsToUpgrade": 20, "softCurrencyToUpgrade": 35000}, {"drs": 0, "speed": 7, "cornering": 5, "powerUnit": 17, "qualifying": 6, "pitStopTime": 0.83, "cardsToUpgrade": 50, "softCurrencyToUpgrade": 90000}, {"drs": 0, "speed": 9, "cornering": 6, "powerUnit": 19, "qualifying": 7, "pitStopTime": 0.79, "cardsToUpgrade": 100, "softCurrencyToUpgrade": 275000}, {"drs": 0, "speed": 10, "cornering": 7, "powerUnit": 22, "qualifying": 8, "pitStopTime": 0.76, "cardsToUpgrade": 200, "softCurrencyToUpgrade": 800000}, {"drs": 0, "speed": 11, "cornering": 8, "powerUnit": 24, "qualifying": 9, "pitStopTime": 0.72, "cardsToUpgrade": 400, "softCurrencyToUpgrade": 1600000}, {"drs": 0, "speed": 12, "cornering": 9, "powerUnit": 27, "qualifying": 10, "pitStopTime": 0.69, "cardsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.912+00	2026-02-12 03:27:02.912+00
07f552c7-0514-47a8-be21-9b35eac7a5b1	Starter	0	0	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_FrontWing_24_Starter	0	0	\N	\N	\N	4	[{"drs": 0, "speed": 1, "cornering": 1, "powerUnit": 1, "qualifying": 1, "pitStopTime": 1, "cardsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.919+00	2026-02-12 03:27:02.919+00
0d1e365b-31d7-47e4-b027-caf5b340450d	The Dash	1	1	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_FrontWing_24_Glide	5	2	\N	\N	\N	4	[{"drs": 0, "speed": 2, "cornering": 2, "powerUnit": 3, "qualifying": 1, "pitStopTime": 0.97, "cardsToUpgrade": 4, "softCurrencyToUpgrade": 2000}, {"drs": 0, "speed": 3, "cornering": 3, "powerUnit": 4, "qualifying": 2, "pitStopTime": 0.94, "cardsToUpgrade": 10, "softCurrencyToUpgrade": 8000}, {"drs": 0, "speed": 4, "cornering": 4, "powerUnit": 5, "qualifying": 3, "pitStopTime": 0.92, "cardsToUpgrade": 20, "softCurrencyToUpgrade": 35000}, {"drs": 0, "speed": 5, "cornering": 4, "powerUnit": 6, "qualifying": 4, "pitStopTime": 0.89, "cardsToUpgrade": 50, "softCurrencyToUpgrade": 90000}, {"drs": 0, "speed": 6, "cornering": 5, "powerUnit": 7, "qualifying": 5, "pitStopTime": 0.87, "cardsToUpgrade": 100, "softCurrencyToUpgrade": 275000}, {"drs": 0, "speed": 7, "cornering": 6, "powerUnit": 8, "qualifying": 6, "pitStopTime": 0.84, "cardsToUpgrade": 200, "softCurrencyToUpgrade": 800000}, {"drs": 0, "speed": 7, "cornering": 7, "powerUnit": 8, "qualifying": 7, "pitStopTime": 0.82, "cardsToUpgrade": 400, "softCurrencyToUpgrade": 1600000}, {"drs": 0, "speed": 8, "cornering": 8, "powerUnit": 9, "qualifying": 8, "pitStopTime": 0.79, "cardsToUpgrade": 1000, "softCurrencyToUpgrade": 2400000}, {"drs": 0, "speed": 9, "cornering": 8, "powerUnit": 10, "qualifying": 9, "pitStopTime": 0.77, "cardsToUpgrade": 2000, "softCurrencyToUpgrade": 3200000}, {"drs": 0, "speed": 10, "cornering": 9, "powerUnit": 11, "qualifying": 10, "pitStopTime": 0.74, "cardsToUpgrade": 4000, "softCurrencyToUpgrade": 4000000}, {"drs": 0, "speed": 11, "cornering": 10, "powerUnit": 12, "qualifying": 11, "pitStopTime": 0.72, "cardsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.925+00	2026-02-12 03:27:02.925+00
0f409d51-2c8d-419c-9c6f-d3b43024fee5	Starter	0	0	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Brakes_24_Starter	0	0	\N	\N	\N	1	[{"drs": 0, "speed": 1, "cornering": 1, "powerUnit": 1, "qualifying": 1, "pitStopTime": 1, "cardsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.93+00	2026-02-12 03:27:02.93+00
11599ab4-d8ac-4442-a453-7d76a2e74bff	Curler	2	9	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_FrontWing_24_TheBeast	190	5	\N	\N	\N	4	[{"drs": 0, "speed": 9, "cornering": 8, "powerUnit": 24, "qualifying": 10, "pitStopTime": 0.72, "cardsToUpgrade": 4, "softCurrencyToUpgrade": 9500000}, {"drs": 0, "speed": 10, "cornering": 9, "powerUnit": 26, "qualifying": 11, "pitStopTime": 0.69, "cardsToUpgrade": 10, "softCurrencyToUpgrade": 19000000}, {"drs": 0, "speed": 11, "cornering": 10, "powerUnit": 29, "qualifying": 12, "pitStopTime": 0.67, "cardsToUpgrade": 20, "softCurrencyToUpgrade": 45000000}, {"drs": 0, "speed": 11, "cornering": 10, "powerUnit": 31, "qualifying": 13, "pitStopTime": 0.64, "cardsToUpgrade": 50, "softCurrencyToUpgrade": 105000000}, {"drs": 0, "speed": 12, "cornering": 11, "powerUnit": 34, "qualifying": 14, "pitStopTime": 0.62, "cardsToUpgrade": 100, "softCurrencyToUpgrade": 199000000}, {"drs": 0, "speed": 13, "cornering": 12, "powerUnit": 36, "qualifying": 15, "pitStopTime": 0.59, "cardsToUpgrade": 200, "softCurrencyToUpgrade": 239000000}, {"drs": 0, "speed": 14, "cornering": 13, "powerUnit": 38, "qualifying": 16, "pitStopTime": 0.56, "cardsToUpgrade": 400, "softCurrencyToUpgrade": 278000000}, {"drs": 0, "speed": 14, "cornering": 13, "powerUnit": 41, "qualifying": 17, "pitStopTime": 0.54, "cardsToUpgrade": 1000, "softCurrencyToUpgrade": 317000000}, {"drs": 0, "speed": 15, "cornering": 14, "powerUnit": 43, "qualifying": 18, "pitStopTime": 0.51, "cardsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.936+00	2026-02-12 03:27:02.936+00
131bbbce-cc96-4753-b81a-275bbe42c087	Chaos Core	3	12	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Engine_25_ChaosCore	375	2	\N	\N	\N	2	[{"drs": 0, "speed": 48, "cornering": 19, "powerUnit": 19, "qualifying": 21, "pitStopTime": 0.54, "cardsToUpgrade": 4, "softCurrencyToUpgrade": 116000000}, {"drs": 0, "speed": 50, "cornering": 20, "powerUnit": 20, "qualifying": 23, "pitStopTime": 0.52, "cardsToUpgrade": 10, "softCurrencyToUpgrade": 232000000}, {"drs": 0, "speed": 52, "cornering": 21, "powerUnit": 21, "qualifying": 24, "pitStopTime": 0.5, "cardsToUpgrade": 20, "softCurrencyToUpgrade": 348000000}, {"drs": 0, "speed": 54, "cornering": 22, "powerUnit": 22, "qualifying": 25, "pitStopTime": 0.48, "cardsToUpgrade": 50, "softCurrencyToUpgrade": 464000000}, {"drs": 0, "speed": 56, "cornering": 23, "powerUnit": 23, "qualifying": 26, "pitStopTime": 0.46, "cardsToUpgrade": 100, "softCurrencyToUpgrade": 580000000}, {"drs": 0, "speed": 58, "cornering": 25, "powerUnit": 25, "qualifying": 27, "pitStopTime": 0.44, "cardsToUpgrade": 200, "softCurrencyToUpgrade": 696000000}, {"drs": 0, "speed": 60, "cornering": 26, "powerUnit": 26, "qualifying": 28, "pitStopTime": 0.42, "cardsToUpgrade": 400, "softCurrencyToUpgrade": 812000000}, {"drs": 0, "speed": 62, "cornering": 28, "powerUnit": 28, "qualifying": 29, "pitStopTime": 0.4, "cardsToUpgrade": 0, "softCurrencyToUpgrade": 812000000}]	2026-02-12 03:27:02.942+00	2026-02-12 03:27:02.942+00
13fdfb99-8ea3-4e45-9453-2db9eb9a2459	Gyro	2	9	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Suspension_24_TheArc	190	5	\N	\N	\N	3	[{"drs": 0, "speed": 10, "cornering": 30, "powerUnit": 12, "qualifying": 11, "pitStopTime": 0.65, "cardsToUpgrade": 4, "softCurrencyToUpgrade": 9500000}, {"drs": 0, "speed": 11, "cornering": 32, "powerUnit": 13, "qualifying": 12, "pitStopTime": 0.62, "cardsToUpgrade": 10, "softCurrencyToUpgrade": 19000000}, {"drs": 0, "speed": 12, "cornering": 35, "powerUnit": 14, "qualifying": 13, "pitStopTime": 0.59, "cardsToUpgrade": 20, "softCurrencyToUpgrade": 45000000}, {"drs": 0, "speed": 12, "cornering": 37, "powerUnit": 15, "qualifying": 14, "pitStopTime": 0.56, "cardsToUpgrade": 50, "softCurrencyToUpgrade": 105000000}, {"drs": 0, "speed": 13, "cornering": 40, "powerUnit": 16, "qualifying": 15, "pitStopTime": 0.53, "cardsToUpgrade": 100, "softCurrencyToUpgrade": 199000000}, {"drs": 0, "speed": 14, "cornering": 42, "powerUnit": 16, "qualifying": 15, "pitStopTime": 0.5, "cardsToUpgrade": 200, "softCurrencyToUpgrade": 239000000}, {"drs": 0, "speed": 15, "cornering": 44, "powerUnit": 17, "qualifying": 16, "pitStopTime": 0.47, "cardsToUpgrade": 400, "softCurrencyToUpgrade": 278000000}, {"drs": 0, "speed": 15, "cornering": 47, "powerUnit": 18, "qualifying": 17, "pitStopTime": 0.44, "cardsToUpgrade": 1000, "softCurrencyToUpgrade": 317000000}, {"drs": 0, "speed": 16, "cornering": 49, "powerUnit": 19, "qualifying": 18, "pitStopTime": 0.41, "cardsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.948+00	2026-02-12 03:27:02.948+00
156e3eac-b855-4a4c-9b6c-b2aeb1e7998a	Starter	0	0	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_RearWing_24_Starter	0	0	\N	\N	\N	5	[{"drs": 0, "speed": 1, "cornering": 1, "powerUnit": 1, "qualifying": 1, "pitStopTime": 1, "cardsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.954+00	2026-02-12 03:27:02.954+00
18268b4f-fa95-439c-a51c-3124a97dd38f	Mach I	1	1	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Engine_24_TheSynergy	5	2	\N	\N	\N	2	[{"drs": 0, "speed": 2, "cornering": 3, "powerUnit": 1, "qualifying": 2, "pitStopTime": 0.97, "cardsToUpgrade": 4, "softCurrencyToUpgrade": 2000}, {"drs": 0, "speed": 3, "cornering": 4, "powerUnit": 2, "qualifying": 3, "pitStopTime": 0.94, "cardsToUpgrade": 10, "softCurrencyToUpgrade": 8000}, {"drs": 0, "speed": 4, "cornering": 5, "powerUnit": 3, "qualifying": 4, "pitStopTime": 0.91, "cardsToUpgrade": 20, "softCurrencyToUpgrade": 35000}, {"drs": 0, "speed": 5, "cornering": 6, "powerUnit": 3, "qualifying": 5, "pitStopTime": 0.88, "cardsToUpgrade": 50, "softCurrencyToUpgrade": 90000}, {"drs": 0, "speed": 6, "cornering": 7, "powerUnit": 4, "qualifying": 6, "pitStopTime": 0.85, "cardsToUpgrade": 100, "softCurrencyToUpgrade": 275000}, {"drs": 0, "speed": 7, "cornering": 8, "powerUnit": 5, "qualifying": 7, "pitStopTime": 0.83, "cardsToUpgrade": 200, "softCurrencyToUpgrade": 800000}, {"drs": 0, "speed": 7, "cornering": 8, "powerUnit": 6, "qualifying": 7, "pitStopTime": 0.8, "cardsToUpgrade": 400, "softCurrencyToUpgrade": 1600000}, {"drs": 0, "speed": 8, "cornering": 9, "powerUnit": 7, "qualifying": 8, "pitStopTime": 0.77, "cardsToUpgrade": 1000, "softCurrencyToUpgrade": 2400000}, {"drs": 0, "speed": 9, "cornering": 10, "powerUnit": 7, "qualifying": 9, "pitStopTime": 0.74, "cardsToUpgrade": 2000, "softCurrencyToUpgrade": 3200000}, {"drs": 0, "speed": 10, "cornering": 11, "powerUnit": 8, "qualifying": 10, "pitStopTime": 0.71, "cardsToUpgrade": 4000, "softCurrencyToUpgrade": 4000000}, {"drs": 0, "speed": 11, "cornering": 12, "powerUnit": 9, "qualifying": 11, "pitStopTime": 0.69, "cardsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.959+00	2026-02-12 03:27:02.959+00
1a718124-8a1c-4a7a-98c8-185064831bb7	Spark-E	1	2	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Engine_24_TheAccord	30	10	\N	\N	\N	2	[{"drs": 0, "speed": 6, "cornering": 2, "powerUnit": 1, "qualifying": 3, "pitStopTime": 0.9, "cardsToUpgrade": 4, "softCurrencyToUpgrade": 6000}, {"drs": 0, "speed": 7, "cornering": 3, "powerUnit": 2, "qualifying": 4, "pitStopTime": 0.85, "cardsToUpgrade": 10, "softCurrencyToUpgrade": 30000}, {"drs": 0, "speed": 8, "cornering": 3, "powerUnit": 2, "qualifying": 4, "pitStopTime": 0.81, "cardsToUpgrade": 20, "softCurrencyToUpgrade": 95000}, {"drs": 0, "speed": 10, "cornering": 4, "powerUnit": 3, "qualifying": 5, "pitStopTime": 0.77, "cardsToUpgrade": 50, "softCurrencyToUpgrade": 300000}, {"drs": 0, "speed": 11, "cornering": 4, "powerUnit": 3, "qualifying": 6, "pitStopTime": 0.73, "cardsToUpgrade": 100, "softCurrencyToUpgrade": 950000}, {"drs": 0, "speed": 12, "cornering": 5, "powerUnit": 4, "qualifying": 7, "pitStopTime": 0.69, "cardsToUpgrade": 200, "softCurrencyToUpgrade": 1900000}, {"drs": 0, "speed": 13, "cornering": 6, "powerUnit": 5, "qualifying": 7, "pitStopTime": 0.64, "cardsToUpgrade": 400, "softCurrencyToUpgrade": 3750000}, {"drs": 0, "speed": 14, "cornering": 6, "powerUnit": 5, "qualifying": 8, "pitStopTime": 0.6, "cardsToUpgrade": 1000, "softCurrencyToUpgrade": 5600000}, {"drs": 0, "speed": 16, "cornering": 7, "powerUnit": 6, "qualifying": 9, "pitStopTime": 0.56, "cardsToUpgrade": 2000, "softCurrencyToUpgrade": 7450000}, {"drs": 0, "speed": 17, "cornering": 7, "powerUnit": 6, "qualifying": 9, "pitStopTime": 0.52, "cardsToUpgrade": 4000, "softCurrencyToUpgrade": 9300000}, {"drs": 0, "speed": 18, "cornering": 8, "powerUnit": 7, "qualifying": 10, "pitStopTime": 0.48, "cardsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.965+00	2026-02-12 03:27:02.965+00
1e1eca47-90fa-494b-9d7d-d485f4030fa9	Flow 1K	2	10	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Brakes_24_Stormbringer	210	5	\N	\N	\N	1	[{"drs": 0, "speed": 33, "cornering": 12, "powerUnit": 13, "qualifying": 11, "pitStopTime": 0.62, "cardsToUpgrade": 4, "softCurrencyToUpgrade": 22000000}, {"drs": 0, "speed": 35, "cornering": 13, "powerUnit": 14, "qualifying": 12, "pitStopTime": 0.59, "cardsToUpgrade": 10, "softCurrencyToUpgrade": 43000000}, {"drs": 0, "speed": 38, "cornering": 14, "powerUnit": 15, "qualifying": 13, "pitStopTime": 0.57, "cardsToUpgrade": 20, "softCurrencyToUpgrade": 65000000}, {"drs": 0, "speed": 40, "cornering": 15, "powerUnit": 16, "qualifying": 14, "pitStopTime": 0.55, "cardsToUpgrade": 50, "softCurrencyToUpgrade": 150000000}, {"drs": 0, "speed": 42, "cornering": 16, "powerUnit": 17, "qualifying": 15, "pitStopTime": 0.53, "cardsToUpgrade": 100, "softCurrencyToUpgrade": 284000000}, {"drs": 0, "speed": 44, "cornering": 17, "powerUnit": 18, "qualifying": 16, "pitStopTime": 0.51, "cardsToUpgrade": 200, "softCurrencyToUpgrade": 341000000}, {"drs": 0, "speed": 47, "cornering": 18, "powerUnit": 19, "qualifying": 17, "pitStopTime": 0.48, "cardsToUpgrade": 400, "softCurrencyToUpgrade": 398000000}, {"drs": 0, "speed": 49, "cornering": 19, "powerUnit": 20, "qualifying": 18, "pitStopTime": 0.46, "cardsToUpgrade": 1000, "softCurrencyToUpgrade": 455000000}, {"drs": 0, "speed": 51, "cornering": 20, "powerUnit": 21, "qualifying": 19, "pitStopTime": 0.44, "cardsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.971+00	2026-02-12 03:27:02.971+00
2072087c-bb0d-4364-b50d-39bb3440e9cd	Mach III	3	7	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Engine_24_TheJuggernaut	225	2	\N	\N	\N	2	[{"drs": 0, "speed": 14, "cornering": 36, "powerUnit": 13, "qualifying": 15, "pitStopTime": 0.55, "cardsToUpgrade": 4, "softCurrencyToUpgrade": 1950000}, {"drs": 0, "speed": 15, "cornering": 39, "powerUnit": 14, "qualifying": 16, "pitStopTime": 0.51, "cardsToUpgrade": 10, "softCurrencyToUpgrade": 3850000}, {"drs": 0, "speed": 16, "cornering": 41, "powerUnit": 15, "qualifying": 17, "pitStopTime": 0.48, "cardsToUpgrade": 20, "softCurrencyToUpgrade": 5800000}, {"drs": 0, "speed": 17, "cornering": 44, "powerUnit": 16, "qualifying": 18, "pitStopTime": 0.44, "cardsToUpgrade": 50, "softCurrencyToUpgrade": 7700000}, {"drs": 0, "speed": 17, "cornering": 46, "powerUnit": 16, "qualifying": 18, "pitStopTime": 0.41, "cardsToUpgrade": 100, "softCurrencyToUpgrade": 15750000}, {"drs": 0, "speed": 18, "cornering": 49, "powerUnit": 17, "qualifying": 19, "pitStopTime": 0.37, "cardsToUpgrade": 200, "softCurrencyToUpgrade": 28000000}, {"drs": 0, "speed": 19, "cornering": 51, "powerUnit": 18, "qualifying": 20, "pitStopTime": 0.34, "cardsToUpgrade": 400, "softCurrencyToUpgrade": 51750000}, {"drs": 0, "speed": 20, "cornering": 54, "powerUnit": 19, "qualifying": 21, "pitStopTime": 0.3, "cardsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.977+00	2026-02-12 03:27:02.977+00
2262835a-d3e6-4857-8cdb-615e2e631acc	Joltcoil	3	12	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Suspension_25_Joltcoil	375	2	\N	\N	\N	3	[{"drs": 0, "speed": 21, "cornering": 17, "powerUnit": 48, "qualifying": 21, "pitStopTime": 0.5, "cardsToUpgrade": 4, "softCurrencyToUpgrade": 116000000}, {"drs": 0, "speed": 23, "cornering": 18, "powerUnit": 50, "qualifying": 23, "pitStopTime": 0.48, "cardsToUpgrade": 10, "softCurrencyToUpgrade": 232000000}, {"drs": 0, "speed": 24, "cornering": 19, "powerUnit": 52, "qualifying": 24, "pitStopTime": 0.45, "cardsToUpgrade": 20, "softCurrencyToUpgrade": 348000000}, {"drs": 0, "speed": 25, "cornering": 20, "powerUnit": 54, "qualifying": 25, "pitStopTime": 0.43, "cardsToUpgrade": 50, "softCurrencyToUpgrade": 464000000}, {"drs": 0, "speed": 26, "cornering": 22, "powerUnit": 56, "qualifying": 26, "pitStopTime": 0.4, "cardsToUpgrade": 100, "softCurrencyToUpgrade": 580000000}, {"drs": 0, "speed": 27, "cornering": 23, "powerUnit": 58, "qualifying": 27, "pitStopTime": 0.38, "cardsToUpgrade": 200, "softCurrencyToUpgrade": 696000000}, {"drs": 0, "speed": 28, "cornering": 24, "powerUnit": 60, "qualifying": 28, "pitStopTime": 0.35, "cardsToUpgrade": 400, "softCurrencyToUpgrade": 812000000}, {"drs": 0, "speed": 29, "cornering": 25, "powerUnit": 62, "qualifying": 29, "pitStopTime": 0.33, "cardsToUpgrade": 0, "softCurrencyToUpgrade": 812000000}]	2026-02-12 03:27:02.981+00	2026-02-12 03:27:02.981+00
26e8bde5-fbc2-4434-9f63-473d34606f21	Quantum	2	7	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Suspension_24_Hustle	155	5	\N	\N	\N	3	[{"drs": 0, "speed": 24, "cornering": 7, "powerUnit": 11, "qualifying": 10, "pitStopTime": 0.76, "cardsToUpgrade": 4, "softCurrencyToUpgrade": 1950000}, {"drs": 0, "speed": 26, "cornering": 8, "powerUnit": 12, "qualifying": 11, "pitStopTime": 0.73, "cardsToUpgrade": 10, "softCurrencyToUpgrade": 3850000}, {"drs": 0, "speed": 29, "cornering": 9, "powerUnit": 13, "qualifying": 12, "pitStopTime": 0.7, "cardsToUpgrade": 20, "softCurrencyToUpgrade": 5800000}, {"drs": 0, "speed": 31, "cornering": 10, "powerUnit": 14, "qualifying": 13, "pitStopTime": 0.68, "cardsToUpgrade": 50, "softCurrencyToUpgrade": 7700000}, {"drs": 0, "speed": 33, "cornering": 11, "powerUnit": 15, "qualifying": 14, "pitStopTime": 0.65, "cardsToUpgrade": 100, "softCurrencyToUpgrade": 15750000}, {"drs": 0, "speed": 35, "cornering": 11, "powerUnit": 15, "qualifying": 14, "pitStopTime": 0.62, "cardsToUpgrade": 200, "softCurrencyToUpgrade": 28000000}, {"drs": 0, "speed": 38, "cornering": 12, "powerUnit": 16, "qualifying": 15, "pitStopTime": 0.6, "cardsToUpgrade": 400, "softCurrencyToUpgrade": 51750000}, {"drs": 0, "speed": 40, "cornering": 13, "powerUnit": 17, "qualifying": 16, "pitStopTime": 0.57, "cardsToUpgrade": 1000, "softCurrencyToUpgrade": 75500000}, {"drs": 0, "speed": 42, "cornering": 14, "powerUnit": 18, "qualifying": 17, "pitStopTime": 0.55, "cardsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.986+00	2026-02-12 03:27:02.986+00
28dd7403-f0d2-4c4e-9b8a-24bf62f79966	Grindlock	3	12	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Brakes_25_Grindlock	375	2	\N	\N	\N	1	[{"drs": 0, "speed": 19, "cornering": 17, "powerUnit": 49, "qualifying": 17, "pitStopTime": 0.52, "cardsToUpgrade": 4, "softCurrencyToUpgrade": 116000000}, {"drs": 0, "speed": 20, "cornering": 18, "powerUnit": 51, "qualifying": 18, "pitStopTime": 0.5, "cardsToUpgrade": 10, "softCurrencyToUpgrade": 232000000}, {"drs": 0, "speed": 21, "cornering": 19, "powerUnit": 53, "qualifying": 19, "pitStopTime": 0.48, "cardsToUpgrade": 20, "softCurrencyToUpgrade": 348000000}, {"drs": 0, "speed": 22, "cornering": 20, "powerUnit": 55, "qualifying": 20, "pitStopTime": 0.45, "cardsToUpgrade": 50, "softCurrencyToUpgrade": 464000000}, {"drs": 0, "speed": 23, "cornering": 22, "powerUnit": 57, "qualifying": 22, "pitStopTime": 0.42, "cardsToUpgrade": 100, "softCurrencyToUpgrade": 580000000}, {"drs": 0, "speed": 25, "cornering": 23, "powerUnit": 59, "qualifying": 23, "pitStopTime": 0.39, "cardsToUpgrade": 200, "softCurrencyToUpgrade": 696000000}, {"drs": 0, "speed": 26, "cornering": 25, "powerUnit": 61, "qualifying": 25, "pitStopTime": 0.36, "cardsToUpgrade": 400, "softCurrencyToUpgrade": 812000000}, {"drs": 0, "speed": 28, "cornering": 27, "powerUnit": 63, "qualifying": 27, "pitStopTime": 0.35, "cardsToUpgrade": 0, "softCurrencyToUpgrade": 812000000}]	2026-02-12 03:27:02.993+00	2026-02-12 03:27:02.993+00
562cc55b-41d1-46e4-a54a-fdb38fc30a20	Synergy	1	4	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_FrontWing_24_SparkE	55	10	\N	\N	\N	4	[{"drs": 0, "speed": 4, "cornering": 3, "powerUnit": 7, "qualifying": 2, "pitStopTime": 0.79, "cardsToUpgrade": 4, "softCurrencyToUpgrade": 64000}, {"drs": 0, "speed": 5, "cornering": 4, "powerUnit": 8, "qualifying": 3, "pitStopTime": 0.74, "cardsToUpgrade": 10, "softCurrencyToUpgrade": 130000}, {"drs": 0, "speed": 5, "cornering": 4, "powerUnit": 10, "qualifying": 3, "pitStopTime": 0.69, "cardsToUpgrade": 20, "softCurrencyToUpgrade": 190000}, {"drs": 0, "speed": 6, "cornering": 5, "powerUnit": 11, "qualifying": 4, "pitStopTime": 0.64, "cardsToUpgrade": 50, "softCurrencyToUpgrade": 1550000}, {"drs": 0, "speed": 6, "cornering": 5, "powerUnit": 13, "qualifying": 4, "pitStopTime": 0.59, "cardsToUpgrade": 100, "softCurrencyToUpgrade": 3300000}, {"drs": 0, "speed": 7, "cornering": 6, "powerUnit": 14, "qualifying": 5, "pitStopTime": 0.55, "cardsToUpgrade": 200, "softCurrencyToUpgrade": 6500000}, {"drs": 0, "speed": 8, "cornering": 7, "powerUnit": 15, "qualifying": 5, "pitStopTime": 0.5, "cardsToUpgrade": 400, "softCurrencyToUpgrade": 11250000}, {"drs": 0, "speed": 8, "cornering": 7, "powerUnit": 17, "qualifying": 6, "pitStopTime": 0.45, "cardsToUpgrade": 1000, "softCurrencyToUpgrade": 16000000}, {"drs": 0, "speed": 9, "cornering": 8, "powerUnit": 18, "qualifying": 6, "pitStopTime": 0.4, "cardsToUpgrade": 2000, "softCurrencyToUpgrade": 20750000}, {"drs": 0, "speed": 9, "cornering": 8, "powerUnit": 20, "qualifying": 7, "pitStopTime": 0.35, "cardsToUpgrade": 4000, "softCurrencyToUpgrade": 25500000}, {"drs": 0, "speed": 10, "cornering": 9, "powerUnit": 21, "qualifying": 7, "pitStopTime": 0.3, "cardsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:03.049+00	2026-02-12 03:27:03.049+00
5b8862f7-5376-4582-82b1-b0d44dff8537	Metronome	2	10	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Gearbox_24_TheGyro	210	5	\N	\N	\N	0	[{"drs": 0, "speed": 12, "cornering": 33, "powerUnit": 10, "qualifying": 14, "pitStopTime": 0.65, "cardsToUpgrade": 4, "softCurrencyToUpgrade": 22000000}, {"drs": 0, "speed": 13, "cornering": 36, "powerUnit": 11, "qualifying": 15, "pitStopTime": 0.62, "cardsToUpgrade": 10, "softCurrencyToUpgrade": 43000000}, {"drs": 0, "speed": 14, "cornering": 38, "powerUnit": 12, "qualifying": 16, "pitStopTime": 0.58, "cardsToUpgrade": 20, "softCurrencyToUpgrade": 65000000}, {"drs": 0, "speed": 15, "cornering": 41, "powerUnit": 13, "qualifying": 16, "pitStopTime": 0.55, "cardsToUpgrade": 50, "softCurrencyToUpgrade": 150000000}, {"drs": 0, "speed": 16, "cornering": 43, "powerUnit": 14, "qualifying": 17, "pitStopTime": 0.51, "cardsToUpgrade": 100, "softCurrencyToUpgrade": 284000000}, {"drs": 0, "speed": 16, "cornering": 46, "powerUnit": 14, "qualifying": 18, "pitStopTime": 0.48, "cardsToUpgrade": 200, "softCurrencyToUpgrade": 341000000}, {"drs": 0, "speed": 17, "cornering": 48, "powerUnit": 15, "qualifying": 19, "pitStopTime": 0.44, "cardsToUpgrade": 400, "softCurrencyToUpgrade": 398000000}, {"drs": 0, "speed": 18, "cornering": 51, "powerUnit": 16, "qualifying": 19, "pitStopTime": 0.41, "cardsToUpgrade": 1000, "softCurrencyToUpgrade": 455000000}, {"drs": 0, "speed": 19, "cornering": 53, "powerUnit": 17, "qualifying": 20, "pitStopTime": 0.37, "cardsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:03.056+00	2026-02-12 03:27:03.056+00
2abbf935-4403-41ef-a95d-85ca9845ed3d	Nexus	3	12	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Suspension_24_TheReactor	375	2	\N	\N	\N	3	[{"drs": 0, "speed": 16, "cornering": 17, "powerUnit": 42, "qualifying": 15, "pitStopTime": 0.48, "cardsToUpgrade": 4, "softCurrencyToUpgrade": 116000000}, {"drs": 0, "speed": 17, "cornering": 18, "powerUnit": 45, "qualifying": 16, "pitStopTime": 0.45, "cardsToUpgrade": 10, "softCurrencyToUpgrade": 232000000}, {"drs": 0, "speed": 18, "cornering": 19, "powerUnit": 47, "qualifying": 17, "pitStopTime": 0.43, "cardsToUpgrade": 20, "softCurrencyToUpgrade": 348000000}, {"drs": 0, "speed": 19, "cornering": 20, "powerUnit": 50, "qualifying": 18, "pitStopTime": 0.4, "cardsToUpgrade": 50, "softCurrencyToUpgrade": 464000000}, {"drs": 0, "speed": 20, "cornering": 21, "powerUnit": 52, "qualifying": 19, "pitStopTime": 0.38, "cardsToUpgrade": 100, "softCurrencyToUpgrade": 580000000}, {"drs": 0, "speed": 21, "cornering": 22, "powerUnit": 55, "qualifying": 20, "pitStopTime": 0.35, "cardsToUpgrade": 200, "softCurrencyToUpgrade": 696000000}, {"drs": 0, "speed": 22, "cornering": 23, "powerUnit": 57, "qualifying": 21, "pitStopTime": 0.33, "cardsToUpgrade": 400, "softCurrencyToUpgrade": 812000000}, {"drs": 0, "speed": 23, "cornering": 24, "powerUnit": 60, "qualifying": 22, "pitStopTime": 0.3, "cardsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.998+00	2026-02-12 03:27:02.998+00
2b73e93c-066a-426c-9765-04c7f6a9db2f	The Beast	3	12	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Gearbox_24_Beat	375	2	\N	\N	\N	0	[{"drs": 0, "speed": 42, "cornering": 15, "powerUnit": 17, "qualifying": 16, "pitStopTime": 0.48, "cardsToUpgrade": 4, "softCurrencyToUpgrade": 116000000}, {"drs": 0, "speed": 44, "cornering": 16, "powerUnit": 18, "qualifying": 17, "pitStopTime": 0.45, "cardsToUpgrade": 10, "softCurrencyToUpgrade": 232000000}, {"drs": 0, "speed": 47, "cornering": 17, "powerUnit": 19, "qualifying": 18, "pitStopTime": 0.42, "cardsToUpgrade": 20, "softCurrencyToUpgrade": 348000000}, {"drs": 0, "speed": 49, "cornering": 17, "powerUnit": 20, "qualifying": 19, "pitStopTime": 0.4, "cardsToUpgrade": 50, "softCurrencyToUpgrade": 464000000}, {"drs": 0, "speed": 51, "cornering": 18, "powerUnit": 21, "qualifying": 20, "pitStopTime": 0.37, "cardsToUpgrade": 100, "softCurrencyToUpgrade": 580000000}, {"drs": 0, "speed": 53, "cornering": 19, "powerUnit": 21, "qualifying": 20, "pitStopTime": 0.34, "cardsToUpgrade": 200, "softCurrencyToUpgrade": 696000000}, {"drs": 0, "speed": 56, "cornering": 20, "powerUnit": 22, "qualifying": 21, "pitStopTime": 0.32, "cardsToUpgrade": 400, "softCurrencyToUpgrade": 812000000}, {"drs": 0, "speed": 60, "cornering": 21, "powerUnit": 24, "qualifying": 23, "pitStopTime": 0.27, "cardsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:03.004+00	2026-02-12 03:27:03.004+00
35c26b98-27d8-4bdb-8f1f-241c399b36a8	Pivot	1	1	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Brakes_24_TheStabiliser	5	2	\N	\N	\N	1	[{"drs": 0, "speed": 2, "cornering": 2, "powerUnit": 1, "qualifying": 3, "pitStopTime": 0.97, "cardsToUpgrade": 4, "softCurrencyToUpgrade": 2000}, {"drs": 0, "speed": 3, "cornering": 3, "powerUnit": 2, "qualifying": 4, "pitStopTime": 0.94, "cardsToUpgrade": 10, "softCurrencyToUpgrade": 8000}, {"drs": 0, "speed": 4, "cornering": 4, "powerUnit": 3, "qualifying": 5, "pitStopTime": 0.91, "cardsToUpgrade": 20, "softCurrencyToUpgrade": 35000}, {"drs": 0, "speed": 5, "cornering": 5, "powerUnit": 3, "qualifying": 6, "pitStopTime": 0.88, "cardsToUpgrade": 50, "softCurrencyToUpgrade": 90000}, {"drs": 0, "speed": 6, "cornering": 6, "powerUnit": 4, "qualifying": 7, "pitStopTime": 0.85, "cardsToUpgrade": 100, "softCurrencyToUpgrade": 275000}, {"drs": 0, "speed": 7, "cornering": 7, "powerUnit": 5, "qualifying": 8, "pitStopTime": 0.83, "cardsToUpgrade": 200, "softCurrencyToUpgrade": 800000}, {"drs": 0, "speed": 7, "cornering": 7, "powerUnit": 6, "qualifying": 8, "pitStopTime": 0.8, "cardsToUpgrade": 400, "softCurrencyToUpgrade": 1600000}, {"drs": 0, "speed": 8, "cornering": 8, "powerUnit": 7, "qualifying": 9, "pitStopTime": 0.77, "cardsToUpgrade": 1000, "softCurrencyToUpgrade": 2400000}, {"drs": 0, "speed": 9, "cornering": 9, "powerUnit": 7, "qualifying": 10, "pitStopTime": 0.74, "cardsToUpgrade": 2000, "softCurrencyToUpgrade": 3200000}, {"drs": 0, "speed": 10, "cornering": 10, "powerUnit": 8, "qualifying": 11, "pitStopTime": 0.71, "cardsToUpgrade": 4000, "softCurrencyToUpgrade": 4000000}, {"drs": 0, "speed": 11, "cornering": 11, "powerUnit": 9, "qualifying": 12, "pitStopTime": 0.69, "cardsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:03.01+00	2026-02-12 03:27:03.01+00
3ece7764-6ee5-4982-9373-4e8f19d07b62	Slickshift	2	2	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Gearbox_24_ColdFusion	60	5	\N	\N	\N	0	[{"drs": 0, "speed": 3, "cornering": 2, "powerUnit": 7, "qualifying": 7, "pitStopTime": 0.9, "cardsToUpgrade": 4, "softCurrencyToUpgrade": 6000}, {"drs": 0, "speed": 4, "cornering": 3, "powerUnit": 9, "qualifying": 9, "pitStopTime": 0.87, "cardsToUpgrade": 10, "softCurrencyToUpgrade": 30000}, {"drs": 0, "speed": 4, "cornering": 3, "powerUnit": 11, "qualifying": 11, "pitStopTime": 0.84, "cardsToUpgrade": 20, "softCurrencyToUpgrade": 95000}, {"drs": 0, "speed": 5, "cornering": 4, "powerUnit": 12, "qualifying": 12, "pitStopTime": 0.82, "cardsToUpgrade": 50, "softCurrencyToUpgrade": 300000}, {"drs": 0, "speed": 6, "cornering": 5, "powerUnit": 14, "qualifying": 14, "pitStopTime": 0.79, "cardsToUpgrade": 100, "softCurrencyToUpgrade": 950000}, {"drs": 0, "speed": 6, "cornering": 5, "powerUnit": 16, "qualifying": 16, "pitStopTime": 0.76, "cardsToUpgrade": 200, "softCurrencyToUpgrade": 1900000}, {"drs": 0, "speed": 7, "cornering": 6, "powerUnit": 18, "qualifying": 18, "pitStopTime": 0.74, "cardsToUpgrade": 400, "softCurrencyToUpgrade": 3750000}, {"drs": 0, "speed": 7, "cornering": 6, "powerUnit": 19, "qualifying": 19, "pitStopTime": 0.71, "cardsToUpgrade": 1000, "softCurrencyToUpgrade": 5600000}, {"drs": 0, "speed": 8, "cornering": 7, "powerUnit": 21, "qualifying": 21, "pitStopTime": 0.69, "cardsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:03.016+00	2026-02-12 03:27:03.016+00
40701d2c-c9a6-4f4a-a4f8-0dc158a4dcb4	Curver 2.5	1	3	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Suspension_24_Curver20	40	10	\N	\N	\N	3	[{"drs": 0, "speed": 7, "cornering": 4, "powerUnit": 2, "qualifying": 7, "pitStopTime": 0.93, "cardsToUpgrade": 4, "softCurrencyToUpgrade": 22000}, {"drs": 0, "speed": 8, "cornering": 5, "powerUnit": 3, "qualifying": 8, "pitStopTime": 0.91, "cardsToUpgrade": 10, "softCurrencyToUpgrade": 45000}, {"drs": 0, "speed": 10, "cornering": 5, "powerUnit": 3, "qualifying": 10, "pitStopTime": 0.89, "cardsToUpgrade": 20, "softCurrencyToUpgrade": 135000}, {"drs": 0, "speed": 11, "cornering": 6, "powerUnit": 4, "qualifying": 11, "pitStopTime": 0.87, "cardsToUpgrade": 50, "softCurrencyToUpgrade": 450000}, {"drs": 0, "speed": 13, "cornering": 6, "powerUnit": 4, "qualifying": 13, "pitStopTime": 0.85, "cardsToUpgrade": 100, "softCurrencyToUpgrade": 1350000}, {"drs": 0, "speed": 14, "cornering": 7, "powerUnit": 5, "qualifying": 14, "pitStopTime": 0.83, "cardsToUpgrade": 200, "softCurrencyToUpgrade": 2800000}, {"drs": 0, "speed": 15, "cornering": 7, "powerUnit": 5, "qualifying": 15, "pitStopTime": 0.8, "cardsToUpgrade": 400, "softCurrencyToUpgrade": 5250000}, {"drs": 0, "speed": 17, "cornering": 8, "powerUnit": 6, "qualifying": 17, "pitStopTime": 0.78, "cardsToUpgrade": 1000, "softCurrencyToUpgrade": 7700000}, {"drs": 0, "speed": 18, "cornering": 8, "powerUnit": 6, "qualifying": 18, "pitStopTime": 0.76, "cardsToUpgrade": 2000, "softCurrencyToUpgrade": 10150000}, {"drs": 0, "speed": 20, "cornering": 9, "powerUnit": 7, "qualifying": 20, "pitStopTime": 0.74, "cardsToUpgrade": 4000, "softCurrencyToUpgrade": 12600000}, {"drs": 0, "speed": 21, "cornering": 9, "powerUnit": 7, "qualifying": 21, "pitStopTime": 0.72, "cardsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:03.022+00	2026-02-12 03:27:03.022+00
44f2228e-df6f-4a9b-bf64-98bf86a8a653	Starter	0	0	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Suspension_24_Starter	0	0	\N	\N	\N	3	[{"drs": 0, "speed": 1, "cornering": 1, "powerUnit": 1, "qualifying": 1, "pitStopTime": 1, "cardsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:03.027+00	2026-02-12 03:27:03.027+00
45b4e2d7-ca59-47ff-a987-2bcec2181d21	Mach II	2	4	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Engine_24_Thunderbolt	100	5	\N	\N	\N	2	[{"drs": 0, "speed": 8, "cornering": 16, "powerUnit": 6, "qualifying": 16, "pitStopTime": 0.79, "cardsToUpgrade": 4, "softCurrencyToUpgrade": 64000}, {"drs": 0, "speed": 9, "cornering": 18, "powerUnit": 7, "qualifying": 18, "pitStopTime": 0.77, "cardsToUpgrade": 10, "softCurrencyToUpgrade": 130000}, {"drs": 0, "speed": 10, "cornering": 20, "powerUnit": 8, "qualifying": 19, "pitStopTime": 0.75, "cardsToUpgrade": 20, "softCurrencyToUpgrade": 190000}, {"drs": 0, "speed": 10, "cornering": 21, "powerUnit": 8, "qualifying": 21, "pitStopTime": 0.72, "cardsToUpgrade": 50, "softCurrencyToUpgrade": 1550000}, {"drs": 0, "speed": 11, "cornering": 23, "powerUnit": 9, "qualifying": 23, "pitStopTime": 0.7, "cardsToUpgrade": 100, "softCurrencyToUpgrade": 3300000}, {"drs": 0, "speed": 12, "cornering": 25, "powerUnit": 10, "qualifying": 24, "pitStopTime": 0.68, "cardsToUpgrade": 200, "softCurrencyToUpgrade": 6500000}, {"drs": 0, "speed": 13, "cornering": 27, "powerUnit": 11, "qualifying": 26, "pitStopTime": 0.66, "cardsToUpgrade": 400, "softCurrencyToUpgrade": 11250000}, {"drs": 0, "speed": 13, "cornering": 28, "powerUnit": 11, "qualifying": 27, "pitStopTime": 0.64, "cardsToUpgrade": 1000, "softCurrencyToUpgrade": 16000000}, {"drs": 0, "speed": 14, "cornering": 30, "powerUnit": 12, "qualifying": 29, "pitStopTime": 0.62, "cardsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:03.032+00	2026-02-12 03:27:03.032+00
47cf77e9-29c7-4243-bb1b-809ea47c2e34	Aero Blade	2	9	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_RearWing_24_PowerLift	190	5	\N	\N	\N	5	[{"drs": 42, "speed": 10, "cornering": 12, "powerUnit": 33, "qualifying": 14, "pitStopTime": 0.97, "cardsToUpgrade": 4, "softCurrencyToUpgrade": 9500000}, {"drs": 45, "speed": 11, "cornering": 13, "powerUnit": 36, "qualifying": 15, "pitStopTime": 0.94, "cardsToUpgrade": 10, "softCurrencyToUpgrade": 19000000}, {"drs": 47, "speed": 12, "cornering": 14, "powerUnit": 38, "qualifying": 16, "pitStopTime": 0.91, "cardsToUpgrade": 20, "softCurrencyToUpgrade": 45000000}, {"drs": 50, "speed": 13, "cornering": 15, "powerUnit": 41, "qualifying": 16, "pitStopTime": 0.89, "cardsToUpgrade": 50, "softCurrencyToUpgrade": 105000000}, {"drs": 52, "speed": 14, "cornering": 16, "powerUnit": 43, "qualifying": 17, "pitStopTime": 0.86, "cardsToUpgrade": 100, "softCurrencyToUpgrade": 199000000}, {"drs": 54, "speed": 14, "cornering": 16, "powerUnit": 46, "qualifying": 18, "pitStopTime": 0.83, "cardsToUpgrade": 200, "softCurrencyToUpgrade": 239000000}, {"drs": 56, "speed": 15, "cornering": 17, "powerUnit": 48, "qualifying": 19, "pitStopTime": 0.81, "cardsToUpgrade": 400, "softCurrencyToUpgrade": 278000000}, {"drs": 58, "speed": 16, "cornering": 18, "powerUnit": 51, "qualifying": 19, "pitStopTime": 0.78, "cardsToUpgrade": 1000, "softCurrencyToUpgrade": 317000000}, {"drs": 60, "speed": 17, "cornering": 19, "powerUnit": 53, "qualifying": 20, "pitStopTime": 0.76, "cardsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:03.038+00	2026-02-12 03:27:03.038+00
527bb224-74b7-4d9c-afdf-eae043125382	The Dynamo	2	8	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Gearbox_24_TheQuantum	175	5	\N	\N	\N	0	[{"drs": 0, "speed": 11, "cornering": 8, "powerUnit": 27, "qualifying": 11, "pitStopTime": 0.69, "cardsToUpgrade": 4, "softCurrencyToUpgrade": 4500000}, {"drs": 0, "speed": 12, "cornering": 9, "powerUnit": 29, "qualifying": 12, "pitStopTime": 0.65, "cardsToUpgrade": 10, "softCurrencyToUpgrade": 9000000}, {"drs": 0, "speed": 13, "cornering": 10, "powerUnit": 31, "qualifying": 13, "pitStopTime": 0.62, "cardsToUpgrade": 20, "softCurrencyToUpgrade": 20000000}, {"drs": 0, "speed": 14, "cornering": 11, "powerUnit": 33, "qualifying": 14, "pitStopTime": 0.58, "cardsToUpgrade": 50, "softCurrencyToUpgrade": 42250000}, {"drs": 0, "speed": 15, "cornering": 12, "powerUnit": 36, "qualifying": 15, "pitStopTime": 0.55, "cardsToUpgrade": 100, "softCurrencyToUpgrade": 139250000}, {"drs": 0, "speed": 15, "cornering": 12, "powerUnit": 38, "qualifying": 15, "pitStopTime": 0.51, "cardsToUpgrade": 200, "softCurrencyToUpgrade": 167000000}, {"drs": 0, "speed": 16, "cornering": 13, "powerUnit": 40, "qualifying": 16, "pitStopTime": 0.48, "cardsToUpgrade": 400, "softCurrencyToUpgrade": 195000000}, {"drs": 0, "speed": 17, "cornering": 14, "powerUnit": 42, "qualifying": 17, "pitStopTime": 0.44, "cardsToUpgrade": 1000, "softCurrencyToUpgrade": 223000000}, {"drs": 0, "speed": 18, "cornering": 15, "powerUnit": 44, "qualifying": 18, "pitStopTime": 0.41, "cardsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:03.044+00	2026-02-12 03:27:03.044+00
64d7f0c9-f214-4c55-98e5-d41d3c4c9a1d	Motion	1	1	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_RearWing_24_TheBlaze	5	2	\N	\N	\N	5	[{"drs": 0, "speed": 2, "cornering": 3, "powerUnit": 2, "qualifying": 1, "pitStopTime": 0.79, "cardsToUpgrade": 4, "softCurrencyToUpgrade": 2000}, {"drs": 0, "speed": 3, "cornering": 4, "powerUnit": 3, "qualifying": 2, "pitStopTime": 0.76, "cardsToUpgrade": 10, "softCurrencyToUpgrade": 8000}, {"drs": 0, "speed": 4, "cornering": 5, "powerUnit": 4, "qualifying": 3, "pitStopTime": 0.73, "cardsToUpgrade": 20, "softCurrencyToUpgrade": 35000}, {"drs": 0, "speed": 4, "cornering": 6, "powerUnit": 5, "qualifying": 3, "pitStopTime": 0.7, "cardsToUpgrade": 50, "softCurrencyToUpgrade": 90000}, {"drs": 0, "speed": 5, "cornering": 7, "powerUnit": 6, "qualifying": 4, "pitStopTime": 0.66, "cardsToUpgrade": 100, "softCurrencyToUpgrade": 275000}, {"drs": 0, "speed": 6, "cornering": 8, "powerUnit": 7, "qualifying": 5, "pitStopTime": 0.63, "cardsToUpgrade": 200, "softCurrencyToUpgrade": 800000}, {"drs": 0, "speed": 7, "cornering": 8, "powerUnit": 7, "qualifying": 6, "pitStopTime": 0.6, "cardsToUpgrade": 400, "softCurrencyToUpgrade": 1600000}, {"drs": 0, "speed": 8, "cornering": 9, "powerUnit": 8, "qualifying": 7, "pitStopTime": 0.57, "cardsToUpgrade": 1000, "softCurrencyToUpgrade": 2400000}, {"drs": 0, "speed": 8, "cornering": 10, "powerUnit": 9, "qualifying": 7, "pitStopTime": 0.54, "cardsToUpgrade": 2000, "softCurrencyToUpgrade": 3200000}, {"drs": 0, "speed": 9, "cornering": 11, "powerUnit": 10, "qualifying": 8, "pitStopTime": 0.51, "cardsToUpgrade": 4000, "softCurrencyToUpgrade": 4000000}, {"drs": 0, "speed": 10, "cornering": 12, "powerUnit": 11, "qualifying": 9, "pitStopTime": 0.48, "cardsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:03.062+00	2026-02-12 03:27:03.062+00
67b4c4e4-1a29-4280-b784-40a520b24530	Supernova	3	3	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Brakes_24_TheFury	105	2	\N	\N	\N	1	[{"drs": 0, "speed": 15, "cornering": 5, "powerUnit": 6, "qualifying": 7, "pitStopTime": 0.83, "cardsToUpgrade": 4, "softCurrencyToUpgrade": 22000}, {"drs": 0, "speed": 18, "cornering": 6, "powerUnit": 7, "qualifying": 8, "pitStopTime": 0.8, "cardsToUpgrade": 10, "softCurrencyToUpgrade": 45000}, {"drs": 0, "speed": 20, "cornering": 7, "powerUnit": 8, "qualifying": 9, "pitStopTime": 0.77, "cardsToUpgrade": 20, "softCurrencyToUpgrade": 135000}, {"drs": 0, "speed": 23, "cornering": 8, "powerUnit": 9, "qualifying": 10, "pitStopTime": 0.74, "cardsToUpgrade": 50, "softCurrencyToUpgrade": 450000}, {"drs": 0, "speed": 25, "cornering": 8, "powerUnit": 10, "qualifying": 11, "pitStopTime": 0.71, "cardsToUpgrade": 100, "softCurrencyToUpgrade": 1350000}, {"drs": 0, "speed": 28, "cornering": 9, "powerUnit": 11, "qualifying": 12, "pitStopTime": 0.68, "cardsToUpgrade": 200, "softCurrencyToUpgrade": 2800000}, {"drs": 0, "speed": 30, "cornering": 10, "powerUnit": 12, "qualifying": 13, "pitStopTime": 0.65, "cardsToUpgrade": 400, "softCurrencyToUpgrade": 5250000}, {"drs": 0, "speed": 33, "cornering": 11, "powerUnit": 13, "qualifying": 14, "pitStopTime": 0.62, "cardsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:03.068+00	2026-02-12 03:27:03.068+00
6a454ff3-2918-4f9e-b789-94380069e132	X-Hale	3	4	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_RearWing_24_Motion	135	2	\N	\N	\N	5	[{"drs": 27, "speed": 17, "cornering": 16, "powerUnit": 7, "qualifying": 5, "pitStopTime": 0.72, "cardsToUpgrade": 4, "softCurrencyToUpgrade": 64000}, {"drs": 30, "speed": 19, "cornering": 18, "powerUnit": 8, "qualifying": 6, "pitStopTime": 0.69, "cardsToUpgrade": 10, "softCurrencyToUpgrade": 130000}, {"drs": 32, "speed": 21, "cornering": 19, "powerUnit": 9, "qualifying": 7, "pitStopTime": 0.65, "cardsToUpgrade": 20, "softCurrencyToUpgrade": 190000}, {"drs": 35, "speed": 23, "cornering": 21, "powerUnit": 10, "qualifying": 8, "pitStopTime": 0.62, "cardsToUpgrade": 50, "softCurrencyToUpgrade": 1550000}, {"drs": 37, "speed": 24, "cornering": 23, "powerUnit": 10, "qualifying": 8, "pitStopTime": 0.58, "cardsToUpgrade": 100, "softCurrencyToUpgrade": 3300000}, {"drs": 40, "speed": 26, "cornering": 25, "powerUnit": 11, "qualifying": 9, "pitStopTime": 0.55, "cardsToUpgrade": 200, "softCurrencyToUpgrade": 6500000}, {"drs": 42, "speed": 28, "cornering": 26, "powerUnit": 12, "qualifying": 10, "pitStopTime": 0.51, "cardsToUpgrade": 400, "softCurrencyToUpgrade": 11250000}, {"drs": 45, "speed": 30, "cornering": 28, "powerUnit": 13, "qualifying": 11, "pitStopTime": 0.48, "cardsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:03.074+00	2026-02-12 03:27:03.074+00
6ba19327-3649-49ee-96af-b3fdc9d7d247	Phantom Arc	3	12	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_RearWing_25_PhantomArc	375	2	\N	\N	\N	5	[{"drs": 46, "speed": 11, "cornering": 46, "powerUnit": 12, "qualifying": 13, "pitStopTime": 0.94, "cardsToUpgrade": 4, "softCurrencyToUpgrade": 116000000}, {"drs": 48, "speed": 12, "cornering": 48, "powerUnit": 13, "qualifying": 14, "pitStopTime": 0.94, "cardsToUpgrade": 10, "softCurrencyToUpgrade": 232000000}, {"drs": 50, "speed": 13, "cornering": 50, "powerUnit": 14, "qualifying": 15, "pitStopTime": 0.93, "cardsToUpgrade": 20, "softCurrencyToUpgrade": 348000000}, {"drs": 52, "speed": 14, "cornering": 52, "powerUnit": 15, "qualifying": 16, "pitStopTime": 0.93, "cardsToUpgrade": 50, "softCurrencyToUpgrade": 464000000}, {"drs": 54, "speed": 14, "cornering": 54, "powerUnit": 15, "qualifying": 16, "pitStopTime": 0.92, "cardsToUpgrade": 100, "softCurrencyToUpgrade": 580000000}, {"drs": 56, "speed": 15, "cornering": 56, "powerUnit": 16, "qualifying": 17, "pitStopTime": 0.92, "cardsToUpgrade": 200, "softCurrencyToUpgrade": 696000000}, {"drs": 58, "speed": 16, "cornering": 58, "powerUnit": 17, "qualifying": 18, "pitStopTime": 0.91, "cardsToUpgrade": 400, "softCurrencyToUpgrade": 812000000}, {"drs": 60, "speed": 17, "cornering": 60, "powerUnit": 18, "qualifying": 19, "pitStopTime": 0.9, "cardsToUpgrade": 0, "softCurrencyToUpgrade": 812000000}]	2026-02-12 03:27:03.079+00	2026-02-12 03:27:03.079+00
6f245ed7-bfa9-46d3-9369-a3fe87b651b3	The Descent	2	5	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Brakes_24_Monolith	115	5	\N	\N	\N	1	[{"drs": 0, "speed": 5, "cornering": 15, "powerUnit": 6, "qualifying": 14, "pitStopTime": 0.83, "cardsToUpgrade": 4, "softCurrencyToUpgrade": 220000}, {"drs": 0, "speed": 6, "cornering": 17, "powerUnit": 7, "qualifying": 16, "pitStopTime": 0.8, "cardsToUpgrade": 10, "softCurrencyToUpgrade": 445000}, {"drs": 0, "speed": 6, "cornering": 19, "powerUnit": 8, "qualifying": 17, "pitStopTime": 0.78, "cardsToUpgrade": 20, "softCurrencyToUpgrade": 665000}, {"drs": 0, "speed": 7, "cornering": 20, "powerUnit": 8, "qualifying": 19, "pitStopTime": 0.76, "cardsToUpgrade": 50, "softCurrencyToUpgrade": 2250000}, {"drs": 0, "speed": 8, "cornering": 22, "powerUnit": 9, "qualifying": 21, "pitStopTime": 0.74, "cardsToUpgrade": 100, "softCurrencyToUpgrade": 4750000}, {"drs": 0, "speed": 8, "cornering": 24, "powerUnit": 10, "qualifying": 22, "pitStopTime": 0.72, "cardsToUpgrade": 200, "softCurrencyToUpgrade": 13750000}, {"drs": 0, "speed": 9, "cornering": 26, "powerUnit": 11, "qualifying": 24, "pitStopTime": 0.69, "cardsToUpgrade": 400, "softCurrencyToUpgrade": 25500000}, {"drs": 0, "speed": 9, "cornering": 27, "powerUnit": 11, "qualifying": 25, "pitStopTime": 0.67, "cardsToUpgrade": 1000, "softCurrencyToUpgrade": 37250000}, {"drs": 0, "speed": 10, "cornering": 29, "powerUnit": 12, "qualifying": 27, "pitStopTime": 0.65, "cardsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:03.085+00	2026-02-12 03:27:03.085+00
7f6bd644-3ede-4a0f-9f74-4a7380073ab6	Swish	1	2	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Suspension_24_Nexus	30	10	\N	\N	\N	3	[{"drs": 0, "speed": 3, "cornering": 2, "powerUnit": 4, "qualifying": 3, "pitStopTime": 0.9, "cardsToUpgrade": 4, "softCurrencyToUpgrade": 6000}, {"drs": 0, "speed": 4, "cornering": 3, "powerUnit": 5, "qualifying": 4, "pitStopTime": 0.86, "cardsToUpgrade": 10, "softCurrencyToUpgrade": 30000}, {"drs": 0, "speed": 5, "cornering": 4, "powerUnit": 6, "qualifying": 5, "pitStopTime": 0.83, "cardsToUpgrade": 20, "softCurrencyToUpgrade": 95000}, {"drs": 0, "speed": 5, "cornering": 4, "powerUnit": 7, "qualifying": 5, "pitStopTime": 0.79, "cardsToUpgrade": 50, "softCurrencyToUpgrade": 300000}, {"drs": 0, "speed": 6, "cornering": 5, "powerUnit": 8, "qualifying": 6, "pitStopTime": 0.76, "cardsToUpgrade": 100, "softCurrencyToUpgrade": 950000}, {"drs": 0, "speed": 7, "cornering": 6, "powerUnit": 9, "qualifying": 7, "pitStopTime": 0.72, "cardsToUpgrade": 200, "softCurrencyToUpgrade": 1900000}, {"drs": 0, "speed": 8, "cornering": 7, "powerUnit": 10, "qualifying": 8, "pitStopTime": 0.69, "cardsToUpgrade": 400, "softCurrencyToUpgrade": 3750000}, {"drs": 0, "speed": 9, "cornering": 8, "powerUnit": 11, "qualifying": 9, "pitStopTime": 0.65, "cardsToUpgrade": 1000, "softCurrencyToUpgrade": 5600000}, {"drs": 0, "speed": 9, "cornering": 8, "powerUnit": 12, "qualifying": 9, "pitStopTime": 0.62, "cardsToUpgrade": 2000, "softCurrencyToUpgrade": 7450000}, {"drs": 0, "speed": 10, "cornering": 9, "powerUnit": 13, "qualifying": 10, "pitStopTime": 0.58, "cardsToUpgrade": 4000, "softCurrencyToUpgrade": 9300000}, {"drs": 0, "speed": 11, "cornering": 10, "powerUnit": 14, "qualifying": 11, "pitStopTime": 0.55, "cardsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:03.09+00	2026-02-12 03:27:03.09+00
7fb87658-22dd-4f77-9aab-0edf60bd5a00	The Spire	2	6	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_RearWing_24_AeroBlade	135	5	\N	\N	\N	5	[{"drs": 0, "speed": 6, "cornering": 5, "powerUnit": 15, "qualifying": 14, "pitStopTime": 0.79, "cardsToUpgrade": 4, "softCurrencyToUpgrade": 790000}, {"drs": 0, "speed": 7, "cornering": 5, "powerUnit": 17, "qualifying": 15, "pitStopTime": 0.77, "cardsToUpgrade": 10, "softCurrencyToUpgrade": 1600000}, {"drs": 0, "speed": 7, "cornering": 6, "powerUnit": 19, "qualifying": 17, "pitStopTime": 0.75, "cardsToUpgrade": 20, "softCurrencyToUpgrade": 2400000}, {"drs": 0, "speed": 8, "cornering": 6, "powerUnit": 20, "qualifying": 18, "pitStopTime": 0.73, "cardsToUpgrade": 50, "softCurrencyToUpgrade": 3200000}, {"drs": 0, "speed": 8, "cornering": 7, "powerUnit": 22, "qualifying": 20, "pitStopTime": 0.71, "cardsToUpgrade": 100, "softCurrencyToUpgrade": 6800000}, {"drs": 0, "speed": 9, "cornering": 7, "powerUnit": 24, "qualifying": 21, "pitStopTime": 0.69, "cardsToUpgrade": 200, "softCurrencyToUpgrade": 19500000}, {"drs": 0, "speed": 9, "cornering": 7, "powerUnit": 26, "qualifying": 22, "pitStopTime": 0.66, "cardsToUpgrade": 400, "softCurrencyToUpgrade": 36250000}, {"drs": 0, "speed": 10, "cornering": 8, "powerUnit": 27, "qualifying": 24, "pitStopTime": 0.64, "cardsToUpgrade": 1000, "softCurrencyToUpgrade": 53000000}, {"drs": 0, "speed": 10, "cornering": 8, "powerUnit": 29, "qualifying": 25, "pitStopTime": 0.62, "cardsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:03.097+00	2026-02-12 03:27:03.097+00
8190f0d2-3858-4dfa-b2a5-cd423d4bf44c	Vortex	3	6	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_FrontWing_24_TheSaber	195	2	\N	\N	\N	4	[{"drs": 0, "speed": 13, "cornering": 35, "powerUnit": 14, "qualifying": 15, "pitStopTime": 0.58, "cardsToUpgrade": 4, "softCurrencyToUpgrade": 790000}, {"drs": 0, "speed": 14, "cornering": 38, "powerUnit": 15, "qualifying": 16, "pitStopTime": 0.55, "cardsToUpgrade": 10, "softCurrencyToUpgrade": 1600000}, {"drs": 0, "speed": 15, "cornering": 40, "powerUnit": 16, "qualifying": 17, "pitStopTime": 0.52, "cardsToUpgrade": 20, "softCurrencyToUpgrade": 2400000}, {"drs": 0, "speed": 16, "cornering": 43, "powerUnit": 17, "qualifying": 18, "pitStopTime": 0.49, "cardsToUpgrade": 50, "softCurrencyToUpgrade": 3200000}, {"drs": 0, "speed": 16, "cornering": 46, "powerUnit": 18, "qualifying": 19, "pitStopTime": 0.46, "cardsToUpgrade": 100, "softCurrencyToUpgrade": 6800000}, {"drs": 0, "speed": 17, "cornering": 49, "powerUnit": 19, "qualifying": 20, "pitStopTime": 0.43, "cardsToUpgrade": 200, "softCurrencyToUpgrade": 19500000}, {"drs": 0, "speed": 18, "cornering": 51, "powerUnit": 20, "qualifying": 21, "pitStopTime": 0.4, "cardsToUpgrade": 400, "softCurrencyToUpgrade": 36250000}, {"drs": 0, "speed": 19, "cornering": 54, "powerUnit": 21, "qualifying": 22, "pitStopTime": 0.37, "cardsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:03.104+00	2026-02-12 03:27:03.104+00
826dc2e8-d559-4033-84c8-4c01dde93522	The Sabre	2	8	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_FrontWing_24_TurboJet	175	5	\N	\N	\N	4	[{"drs": 0, "speed": 15, "cornering": 13, "powerUnit": 5, "qualifying": 6, "pitStopTime": 0.79, "cardsToUpgrade": 4, "softCurrencyToUpgrade": 4500000}, {"drs": 0, "speed": 17, "cornering": 15, "powerUnit": 6, "qualifying": 7, "pitStopTime": 0.77, "cardsToUpgrade": 10, "softCurrencyToUpgrade": 9000000}, {"drs": 0, "speed": 19, "cornering": 16, "powerUnit": 7, "qualifying": 7, "pitStopTime": 0.75, "cardsToUpgrade": 20, "softCurrencyToUpgrade": 20000000}, {"drs": 0, "speed": 20, "cornering": 18, "powerUnit": 7, "qualifying": 8, "pitStopTime": 0.72, "cardsToUpgrade": 50, "softCurrencyToUpgrade": 42250000}, {"drs": 0, "speed": 22, "cornering": 20, "powerUnit": 8, "qualifying": 9, "pitStopTime": 0.7, "cardsToUpgrade": 100, "softCurrencyToUpgrade": 139250000}, {"drs": 0, "speed": 24, "cornering": 21, "powerUnit": 9, "qualifying": 9, "pitStopTime": 0.68, "cardsToUpgrade": 200, "softCurrencyToUpgrade": 167000000}, {"drs": 0, "speed": 26, "cornering": 23, "powerUnit": 10, "qualifying": 10, "pitStopTime": 0.66, "cardsToUpgrade": 400, "softCurrencyToUpgrade": 195000000}, {"drs": 0, "speed": 27, "cornering": 24, "powerUnit": 10, "qualifying": 10, "pitStopTime": 0.64, "cardsToUpgrade": 1000, "softCurrencyToUpgrade": 223000000}, {"drs": 0, "speed": 29, "cornering": 26, "powerUnit": 11, "qualifying": 11, "pitStopTime": 0.62, "cardsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:03.111+00	2026-02-12 03:27:03.111+00
8deac225-fd24-4963-ba49-81690f68bd31	Fluxspring	3	12	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Suspension_25_Fluxspring	375	2	\N	\N	\N	3	[{"drs": 0, "speed": 49, "cornering": 17, "powerUnit": 18, "qualifying": 20, "pitStopTime": 0.44, "cardsToUpgrade": 4, "softCurrencyToUpgrade": 116000000}, {"drs": 0, "speed": 51, "cornering": 18, "powerUnit": 19, "qualifying": 21, "pitStopTime": 0.42, "cardsToUpgrade": 10, "softCurrencyToUpgrade": 232000000}, {"drs": 0, "speed": 53, "cornering": 19, "powerUnit": 20, "qualifying": 22, "pitStopTime": 0.4, "cardsToUpgrade": 20, "softCurrencyToUpgrade": 348000000}, {"drs": 0, "speed": 55, "cornering": 20, "powerUnit": 21, "qualifying": 23, "pitStopTime": 0.38, "cardsToUpgrade": 50, "softCurrencyToUpgrade": 464000000}, {"drs": 0, "speed": 57, "cornering": 21, "powerUnit": 22, "qualifying": 24, "pitStopTime": 0.36, "cardsToUpgrade": 100, "softCurrencyToUpgrade": 580000000}, {"drs": 0, "speed": 59, "cornering": 22, "powerUnit": 23, "qualifying": 26, "pitStopTime": 0.34, "cardsToUpgrade": 200, "softCurrencyToUpgrade": 696000000}, {"drs": 0, "speed": 61, "cornering": 23, "powerUnit": 24, "qualifying": 28, "pitStopTime": 0.32, "cardsToUpgrade": 400, "softCurrencyToUpgrade": 812000000}, {"drs": 0, "speed": 63, "cornering": 25, "powerUnit": 26, "qualifying": 30, "pitStopTime": 0.3, "cardsToUpgrade": 0, "softCurrencyToUpgrade": 812000000}]	2026-02-12 03:27:03.117+00	2026-02-12 03:27:03.117+00
8f7b6e5c-4f9d-4b52-b5cf-aad3d21e1124	Behemoth	2	10	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Engine_24_MachIII	210	5	\N	\N	\N	2	[{"drs": 0, "speed": 24, "cornering": 8, "powerUnit": 10, "qualifying": 9, "pitStopTime": 0.72, "cardsToUpgrade": 4, "softCurrencyToUpgrade": 22000000}, {"drs": 0, "speed": 26, "cornering": 9, "powerUnit": 11, "qualifying": 10, "pitStopTime": 0.69, "cardsToUpgrade": 10, "softCurrencyToUpgrade": 43000000}, {"drs": 0, "speed": 29, "cornering": 10, "powerUnit": 12, "qualifying": 11, "pitStopTime": 0.65, "cardsToUpgrade": 20, "softCurrencyToUpgrade": 65000000}, {"drs": 0, "speed": 31, "cornering": 10, "powerUnit": 12, "qualifying": 11, "pitStopTime": 0.62, "cardsToUpgrade": 50, "softCurrencyToUpgrade": 150000000}, {"drs": 0, "speed": 34, "cornering": 11, "powerUnit": 13, "qualifying": 12, "pitStopTime": 0.58, "cardsToUpgrade": 100, "softCurrencyToUpgrade": 284000000}, {"drs": 0, "speed": 36, "cornering": 12, "powerUnit": 14, "qualifying": 13, "pitStopTime": 0.55, "cardsToUpgrade": 200, "softCurrencyToUpgrade": 341000000}, {"drs": 0, "speed": 38, "cornering": 13, "powerUnit": 15, "qualifying": 14, "pitStopTime": 0.51, "cardsToUpgrade": 400, "softCurrencyToUpgrade": 398000000}, {"drs": 0, "speed": 41, "cornering": 13, "powerUnit": 15, "qualifying": 14, "pitStopTime": 0.48, "cardsToUpgrade": 1000, "softCurrencyToUpgrade": 455000000}, {"drs": 0, "speed": 43, "cornering": 14, "powerUnit": 16, "qualifying": 15, "pitStopTime": 0.44, "cardsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:03.123+00	2026-02-12 03:27:03.123+00
9148801d-b9b3-4496-a312-b947201da93f	Edgecutter	3	12	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_FrontWing_25_Edgecutter	375	2	\N	\N	\N	4	[{"drs": 0, "speed": 46, "cornering": 20, "powerUnit": 19, "qualifying": 17, "pitStopTime": 0.51, "cardsToUpgrade": 4, "softCurrencyToUpgrade": 116000000}, {"drs": 0, "speed": 48, "cornering": 21, "powerUnit": 20, "qualifying": 18, "pitStopTime": 0.49, "cardsToUpgrade": 10, "softCurrencyToUpgrade": 232000000}, {"drs": 0, "speed": 50, "cornering": 22, "powerUnit": 21, "qualifying": 19, "pitStopTime": 0.47, "cardsToUpgrade": 20, "softCurrencyToUpgrade": 348000000}, {"drs": 0, "speed": 52, "cornering": 23, "powerUnit": 22, "qualifying": 20, "pitStopTime": 0.45, "cardsToUpgrade": 50, "softCurrencyToUpgrade": 464000000}, {"drs": 0, "speed": 55, "cornering": 24, "powerUnit": 23, "qualifying": 22, "pitStopTime": 0.43, "cardsToUpgrade": 100, "softCurrencyToUpgrade": 580000000}, {"drs": 0, "speed": 57, "cornering": 26, "powerUnit": 25, "qualifying": 23, "pitStopTime": 0.41, "cardsToUpgrade": 200, "softCurrencyToUpgrade": 696000000}, {"drs": 0, "speed": 59, "cornering": 28, "powerUnit": 26, "qualifying": 25, "pitStopTime": 0.39, "cardsToUpgrade": 400, "softCurrencyToUpgrade": 812000000}, {"drs": 0, "speed": 61, "cornering": 30, "powerUnit": 28, "qualifying": 27, "pitStopTime": 0.37, "cardsToUpgrade": 0, "softCurrencyToUpgrade": 812000000}]	2026-02-12 03:27:03.128+00	2026-02-12 03:27:03.128+00
b172c060-1384-4ca0-a883-6ccb3d0c1d3c	Hustle	1	1	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Gearbox_24_TheEquinox	5	2	\N	\N	\N	0	[{"drs": 0, "speed": 2, "cornering": 2, "powerUnit": 3, "qualifying": 1, "pitStopTime": 0.97, "cardsToUpgrade": 4, "softCurrencyToUpgrade": 2000}, {"drs": 0, "speed": 3, "cornering": 3, "powerUnit": 4, "qualifying": 2, "pitStopTime": 0.93, "cardsToUpgrade": 10, "softCurrencyToUpgrade": 8000}, {"drs": 0, "speed": 4, "cornering": 4, "powerUnit": 5, "qualifying": 3, "pitStopTime": 0.9, "cardsToUpgrade": 20, "softCurrencyToUpgrade": 35000}, {"drs": 0, "speed": 4, "cornering": 5, "powerUnit": 6, "qualifying": 3, "pitStopTime": 0.87, "cardsToUpgrade": 50, "softCurrencyToUpgrade": 90000}, {"drs": 0, "speed": 5, "cornering": 6, "powerUnit": 7, "qualifying": 4, "pitStopTime": 0.84, "cardsToUpgrade": 100, "softCurrencyToUpgrade": 275000}, {"drs": 0, "speed": 6, "cornering": 7, "powerUnit": 8, "qualifying": 5, "pitStopTime": 0.81, "cardsToUpgrade": 200, "softCurrencyToUpgrade": 800000}, {"drs": 0, "speed": 7, "cornering": 7, "powerUnit": 8, "qualifying": 6, "pitStopTime": 0.78, "cardsToUpgrade": 400, "softCurrencyToUpgrade": 1600000}, {"drs": 0, "speed": 8, "cornering": 8, "powerUnit": 9, "qualifying": 7, "pitStopTime": 0.74, "cardsToUpgrade": 1000, "softCurrencyToUpgrade": 2400000}, {"drs": 0, "speed": 8, "cornering": 9, "powerUnit": 10, "qualifying": 7, "pitStopTime": 0.71, "cardsToUpgrade": 2000, "softCurrencyToUpgrade": 3200000}, {"drs": 0, "speed": 9, "cornering": 10, "powerUnit": 11, "qualifying": 8, "pitStopTime": 0.68, "cardsToUpgrade": 4000, "softCurrencyToUpgrade": 4000000}, {"drs": 0, "speed": 10, "cornering": 11, "powerUnit": 12, "qualifying": 9, "pitStopTime": 0.65, "cardsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:03.179+00	2026-02-12 03:27:03.179+00
97b9354a-7166-4b69-b11e-aac333bb1353	Boombox	3	11	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Brakes_24_TheBehemoth	345	2	\N	\N	\N	1	[{"drs": 0, "speed": 16, "cornering": 42, "powerUnit": 17, "qualifying": 14, "pitStopTime": 0.44, "cardsToUpgrade": 4, "softCurrencyToUpgrade": 54000000}, {"drs": 0, "speed": 17, "cornering": 45, "powerUnit": 18, "qualifying": 15, "pitStopTime": 0.41, "cardsToUpgrade": 10, "softCurrencyToUpgrade": 107000000}, {"drs": 0, "speed": 18, "cornering": 47, "powerUnit": 19, "qualifying": 16, "pitStopTime": 0.37, "cardsToUpgrade": 20, "softCurrencyToUpgrade": 161000000}, {"drs": 0, "speed": 19, "cornering": 50, "powerUnit": 20, "qualifying": 17, "pitStopTime": 0.34, "cardsToUpgrade": 50, "softCurrencyToUpgrade": 215000000}, {"drs": 0, "speed": 19, "cornering": 52, "powerUnit": 20, "qualifying": 18, "pitStopTime": 0.3, "cardsToUpgrade": 100, "softCurrencyToUpgrade": 406000000}, {"drs": 0, "speed": 20, "cornering": 55, "powerUnit": 21, "qualifying": 19, "pitStopTime": 0.27, "cardsToUpgrade": 200, "softCurrencyToUpgrade": 487000000}, {"drs": 0, "speed": 21, "cornering": 57, "powerUnit": 22, "qualifying": 20, "pitStopTime": 0.23, "cardsToUpgrade": 400, "softCurrencyToUpgrade": 568000000}, {"drs": 0, "speed": 22, "cornering": 60, "powerUnit": 23, "qualifying": 21, "pitStopTime": 0.2, "cardsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:03.135+00	2026-02-12 03:27:03.135+00
99168952-d8e2-4f6c-bffc-9d32a6b5ff9c	The Valkyrie	3	11	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_RearWing_24_TheCyclone	345	2	\N	\N	\N	5	[{"drs": 17, "speed": 42, "cornering": 16, "powerUnit": 15, "qualifying": 17, "pitStopTime": 0.48, "cardsToUpgrade": 4, "softCurrencyToUpgrade": 54000000}, {"drs": 19, "speed": 45, "cornering": 17, "powerUnit": 16, "qualifying": 18, "pitStopTime": 0.45, "cardsToUpgrade": 10, "softCurrencyToUpgrade": 107000000}, {"drs": 21, "speed": 47, "cornering": 18, "powerUnit": 17, "qualifying": 19, "pitStopTime": 0.42, "cardsToUpgrade": 20, "softCurrencyToUpgrade": 161000000}, {"drs": 23, "speed": 50, "cornering": 19, "powerUnit": 18, "qualifying": 20, "pitStopTime": 0.39, "cardsToUpgrade": 50, "softCurrencyToUpgrade": 215000000}, {"drs": 24, "speed": 52, "cornering": 20, "powerUnit": 18, "qualifying": 21, "pitStopTime": 0.36, "cardsToUpgrade": 100, "softCurrencyToUpgrade": 406000000}, {"drs": 26, "speed": 55, "cornering": 21, "powerUnit": 19, "qualifying": 22, "pitStopTime": 0.33, "cardsToUpgrade": 200, "softCurrencyToUpgrade": 487000000}, {"drs": 28, "speed": 57, "cornering": 22, "powerUnit": 20, "qualifying": 23, "pitStopTime": 0.3, "cardsToUpgrade": 400, "softCurrencyToUpgrade": 568000000}, {"drs": 30, "speed": 60, "cornering": 23, "powerUnit": 21, "qualifying": 24, "pitStopTime": 0.27, "cardsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:03.141+00	2026-02-12 03:27:03.141+00
99d7d514-3994-4d53-b90e-23eaefc271e9	Flex XL	3	11	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_FrontWing_24_Nemesis	345	2	\N	\N	\N	4	[{"drs": 0, "speed": 17, "cornering": 42, "powerUnit": 15, "qualifying": 16, "pitStopTime": 0.48, "cardsToUpgrade": 4, "softCurrencyToUpgrade": 54000000}, {"drs": 0, "speed": 18, "cornering": 45, "powerUnit": 16, "qualifying": 17, "pitStopTime": 0.45, "cardsToUpgrade": 10, "softCurrencyToUpgrade": 107000000}, {"drs": 0, "speed": 19, "cornering": 47, "powerUnit": 17, "qualifying": 18, "pitStopTime": 0.43, "cardsToUpgrade": 20, "softCurrencyToUpgrade": 161000000}, {"drs": 0, "speed": 20, "cornering": 50, "powerUnit": 18, "qualifying": 19, "pitStopTime": 0.4, "cardsToUpgrade": 50, "softCurrencyToUpgrade": 215000000}, {"drs": 0, "speed": 22, "cornering": 52, "powerUnit": 18, "qualifying": 20, "pitStopTime": 0.38, "cardsToUpgrade": 100, "softCurrencyToUpgrade": 406000000}, {"drs": 0, "speed": 23, "cornering": 55, "powerUnit": 19, "qualifying": 21, "pitStopTime": 0.35, "cardsToUpgrade": 200, "softCurrencyToUpgrade": 487000000}, {"drs": 0, "speed": 24, "cornering": 57, "powerUnit": 20, "qualifying": 22, "pitStopTime": 0.33, "cardsToUpgrade": 400, "softCurrencyToUpgrade": 568000000}, {"drs": 0, "speed": 25, "cornering": 60, "powerUnit": 21, "qualifying": 23, "pitStopTime": 0.3, "cardsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:03.147+00	2026-02-12 03:27:03.147+00
a11783ee-e811-4c1d-8edc-4a7650961d84	Power Lift	2	7	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_RearWing_24_TheValkyrie	155	5	\N	\N	\N	5	[{"drs": 0, "speed": 30, "cornering": 12, "powerUnit": 10, "qualifying": 12, "pitStopTime": 0.69, "cardsToUpgrade": 4, "softCurrencyToUpgrade": 1950000}, {"drs": 0, "speed": 32, "cornering": 13, "powerUnit": 11, "qualifying": 13, "pitStopTime": 0.65, "cardsToUpgrade": 10, "softCurrencyToUpgrade": 3850000}, {"drs": 0, "speed": 35, "cornering": 14, "powerUnit": 12, "qualifying": 14, "pitStopTime": 0.62, "cardsToUpgrade": 20, "softCurrencyToUpgrade": 5800000}, {"drs": 0, "speed": 37, "cornering": 15, "powerUnit": 13, "qualifying": 15, "pitStopTime": 0.59, "cardsToUpgrade": 50, "softCurrencyToUpgrade": 7700000}, {"drs": 0, "speed": 39, "cornering": 16, "powerUnit": 14, "qualifying": 16, "pitStopTime": 0.56, "cardsToUpgrade": 100, "softCurrencyToUpgrade": 15750000}, {"drs": 0, "speed": 41, "cornering": 16, "powerUnit": 14, "qualifying": 16, "pitStopTime": 0.53, "cardsToUpgrade": 200, "softCurrencyToUpgrade": 28000000}, {"drs": 0, "speed": 44, "cornering": 17, "powerUnit": 15, "qualifying": 17, "pitStopTime": 0.5, "cardsToUpgrade": 400, "softCurrencyToUpgrade": 51750000}, {"drs": 0, "speed": 46, "cornering": 18, "powerUnit": 16, "qualifying": 18, "pitStopTime": 0.47, "cardsToUpgrade": 1000, "softCurrencyToUpgrade": 75500000}, {"drs": 0, "speed": 48, "cornering": 19, "powerUnit": 17, "qualifying": 19, "pitStopTime": 0.44, "cardsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:03.153+00	2026-02-12 03:27:03.153+00
ac3f6bfe-92b1-49eb-80a4-c28e3ce59b6c	Glide	1	2	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_FrontWing_24_Gallop	30	10	\N	\N	\N	4	[{"drs": 0, "speed": 5, "cornering": 2, "powerUnit": 2, "qualifying": 4, "pitStopTime": 0.97, "cardsToUpgrade": 4, "softCurrencyToUpgrade": 6000}, {"drs": 0, "speed": 6, "cornering": 3, "powerUnit": 3, "qualifying": 5, "pitStopTime": 0.94, "cardsToUpgrade": 10, "softCurrencyToUpgrade": 30000}, {"drs": 0, "speed": 8, "cornering": 3, "powerUnit": 3, "qualifying": 6, "pitStopTime": 0.92, "cardsToUpgrade": 20, "softCurrencyToUpgrade": 95000}, {"drs": 0, "speed": 9, "cornering": 4, "powerUnit": 4, "qualifying": 8, "pitStopTime": 0.89, "cardsToUpgrade": 50, "softCurrencyToUpgrade": 300000}, {"drs": 0, "speed": 10, "cornering": 4, "powerUnit": 4, "qualifying": 9, "pitStopTime": 0.87, "cardsToUpgrade": 100, "softCurrencyToUpgrade": 950000}, {"drs": 0, "speed": 12, "cornering": 5, "powerUnit": 5, "qualifying": 10, "pitStopTime": 0.84, "cardsToUpgrade": 200, "softCurrencyToUpgrade": 1900000}, {"drs": 0, "speed": 13, "cornering": 6, "powerUnit": 6, "qualifying": 11, "pitStopTime": 0.82, "cardsToUpgrade": 400, "softCurrencyToUpgrade": 3750000}, {"drs": 0, "speed": 14, "cornering": 6, "powerUnit": 6, "qualifying": 12, "pitStopTime": 0.79, "cardsToUpgrade": 1000, "softCurrencyToUpgrade": 5600000}, {"drs": 0, "speed": 15, "cornering": 7, "powerUnit": 7, "qualifying": 14, "pitStopTime": 0.77, "cardsToUpgrade": 2000, "softCurrencyToUpgrade": 7450000}, {"drs": 0, "speed": 17, "cornering": 7, "powerUnit": 7, "qualifying": 15, "pitStopTime": 0.74, "cardsToUpgrade": 4000, "softCurrencyToUpgrade": 9300000}, {"drs": 0, "speed": 18, "cornering": 8, "powerUnit": 8, "qualifying": 16, "pitStopTime": 0.72, "cardsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:03.16+00	2026-02-12 03:27:03.16+00
adc70ff3-8360-4042-a165-aa1d0143e912	The Reactor	1	6	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Engine_24_M4DDash	75	10	\N	\N	\N	2	[{"drs": 0, "speed": 5, "cornering": 4, "powerUnit": 12, "qualifying": 6, "pitStopTime": 0.86, "cardsToUpgrade": 4, "softCurrencyToUpgrade": 790000}, {"drs": 0, "speed": 6, "cornering": 5, "powerUnit": 14, "qualifying": 7, "pitStopTime": 0.84, "cardsToUpgrade": 10, "softCurrencyToUpgrade": 1600000}, {"drs": 0, "speed": 6, "cornering": 5, "powerUnit": 16, "qualifying": 7, "pitStopTime": 0.81, "cardsToUpgrade": 20, "softCurrencyToUpgrade": 2400000}, {"drs": 0, "speed": 7, "cornering": 6, "powerUnit": 18, "qualifying": 8, "pitStopTime": 0.79, "cardsToUpgrade": 50, "softCurrencyToUpgrade": 3200000}, {"drs": 0, "speed": 7, "cornering": 6, "powerUnit": 20, "qualifying": 8, "pitStopTime": 0.76, "cardsToUpgrade": 100, "softCurrencyToUpgrade": 6800000}, {"drs": 0, "speed": 8, "cornering": 7, "powerUnit": 22, "qualifying": 9, "pitStopTime": 0.74, "cardsToUpgrade": 200, "softCurrencyToUpgrade": 19500000}, {"drs": 0, "speed": 9, "cornering": 7, "powerUnit": 23, "qualifying": 10, "pitStopTime": 0.71, "cardsToUpgrade": 400, "softCurrencyToUpgrade": 36250000}, {"drs": 0, "speed": 9, "cornering": 8, "powerUnit": 25, "qualifying": 10, "pitStopTime": 0.69, "cardsToUpgrade": 1000, "softCurrencyToUpgrade": 53000000}, {"drs": 0, "speed": 10, "cornering": 8, "powerUnit": 27, "qualifying": 11, "pitStopTime": 0.66, "cardsToUpgrade": 2000, "softCurrencyToUpgrade": 69750000}, {"drs": 0, "speed": 10, "cornering": 9, "powerUnit": 29, "qualifying": 11, "pitStopTime": 0.64, "cardsToUpgrade": 4000, "softCurrencyToUpgrade": 86500000}, {"drs": 0, "speed": 11, "cornering": 9, "powerUnit": 31, "qualifying": 12, "pitStopTime": 0.62, "cardsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:03.167+00	2026-02-12 03:27:03.167+00
add95d79-506e-4125-97db-2aa92ba47f81	Gale Force	1	3	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_RearWing_24_TheSpire	40	10	\N	\N	\N	5	[{"drs": 0, "speed": 4, "cornering": 8, "powerUnit": 2, "qualifying": 2, "pitStopTime": 0.65, "cardsToUpgrade": 4, "softCurrencyToUpgrade": 22000}, {"drs": 0, "speed": 5, "cornering": 9, "powerUnit": 3, "qualifying": 3, "pitStopTime": 0.61, "cardsToUpgrade": 10, "softCurrencyToUpgrade": 45000}, {"drs": 0, "speed": 5, "cornering": 11, "powerUnit": 3, "qualifying": 3, "pitStopTime": 0.57, "cardsToUpgrade": 20, "softCurrencyToUpgrade": 135000}, {"drs": 0, "speed": 6, "cornering": 12, "powerUnit": 4, "qualifying": 4, "pitStopTime": 0.53, "cardsToUpgrade": 50, "softCurrencyToUpgrade": 450000}, {"drs": 0, "speed": 7, "cornering": 14, "powerUnit": 4, "qualifying": 4, "pitStopTime": 0.5, "cardsToUpgrade": 100, "softCurrencyToUpgrade": 1350000}, {"drs": 0, "speed": 8, "cornering": 15, "powerUnit": 5, "qualifying": 5, "pitStopTime": 0.46, "cardsToUpgrade": 200, "softCurrencyToUpgrade": 2800000}, {"drs": 0, "speed": 8, "cornering": 16, "powerUnit": 5, "qualifying": 5, "pitStopTime": 0.42, "cardsToUpgrade": 400, "softCurrencyToUpgrade": 5250000}, {"drs": 0, "speed": 9, "cornering": 18, "powerUnit": 6, "qualifying": 6, "pitStopTime": 0.38, "cardsToUpgrade": 1000, "softCurrencyToUpgrade": 7700000}, {"drs": 0, "speed": 10, "cornering": 19, "powerUnit": 6, "qualifying": 6, "pitStopTime": 0.34, "cardsToUpgrade": 2000, "softCurrencyToUpgrade": 10150000}, {"drs": 0, "speed": 10, "cornering": 21, "powerUnit": 7, "qualifying": 7, "pitStopTime": 0.3, "cardsToUpgrade": 4000, "softCurrencyToUpgrade": 12600000}, {"drs": 0, "speed": 11, "cornering": 22, "powerUnit": 7, "qualifying": 7, "pitStopTime": 0.27, "cardsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:03.174+00	2026-02-12 03:27:03.174+00
b5ce79c4-5c38-41ff-b372-b483d88f7bec	Jittershift	3	12	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Gearbox_25_Jittershift	375	2	\N	\N	\N	0	[{"drs": 0, "speed": 17, "cornering": 20, "powerUnit": 46, "qualifying": 19, "pitStopTime": 0.52, "cardsToUpgrade": 4, "softCurrencyToUpgrade": 116000000}, {"drs": 0, "speed": 18, "cornering": 21, "powerUnit": 48, "qualifying": 20, "pitStopTime": 0.5, "cardsToUpgrade": 10, "softCurrencyToUpgrade": 232000000}, {"drs": 0, "speed": 19, "cornering": 22, "powerUnit": 50, "qualifying": 21, "pitStopTime": 0.48, "cardsToUpgrade": 20, "softCurrencyToUpgrade": 348000000}, {"drs": 0, "speed": 20, "cornering": 23, "powerUnit": 52, "qualifying": 22, "pitStopTime": 0.46, "cardsToUpgrade": 50, "softCurrencyToUpgrade": 464000000}, {"drs": 0, "speed": 22, "cornering": 24, "powerUnit": 55, "qualifying": 23, "pitStopTime": 0.44, "cardsToUpgrade": 100, "softCurrencyToUpgrade": 580000000}, {"drs": 0, "speed": 23, "cornering": 26, "powerUnit": 57, "qualifying": 25, "pitStopTime": 0.42, "cardsToUpgrade": 200, "softCurrencyToUpgrade": 696000000}, {"drs": 0, "speed": 25, "cornering": 28, "powerUnit": 59, "qualifying": 26, "pitStopTime": 0.4, "cardsToUpgrade": 400, "softCurrencyToUpgrade": 812000000}, {"drs": 0, "speed": 27, "cornering": 30, "powerUnit": 61, "qualifying": 28, "pitStopTime": 0.38, "cardsToUpgrade": 0, "softCurrencyToUpgrade": 812000000}]	2026-02-12 03:27:03.186+00	2026-02-12 03:27:03.186+00
ca4d029a-908e-45c5-a4f9-1f4818a0deba	Teeter Totter	3	12	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Suspension_25_TheTeeterTotter	375	2	\N	\N	\N	3	[{"drs": 0, "speed": 21, "cornering": 46, "powerUnit": 19, "qualifying": 17, "pitStopTime": 0.48, "cardsToUpgrade": 4, "softCurrencyToUpgrade": 116000000}, {"drs": 0, "speed": 23, "cornering": 48, "powerUnit": 20, "qualifying": 18, "pitStopTime": 0.46, "cardsToUpgrade": 10, "softCurrencyToUpgrade": 232000000}, {"drs": 0, "speed": 24, "cornering": 50, "powerUnit": 21, "qualifying": 19, "pitStopTime": 0.44, "cardsToUpgrade": 20, "softCurrencyToUpgrade": 348000000}, {"drs": 0, "speed": 25, "cornering": 52, "powerUnit": 22, "qualifying": 20, "pitStopTime": 0.42, "cardsToUpgrade": 50, "softCurrencyToUpgrade": 464000000}, {"drs": 0, "speed": 26, "cornering": 55, "powerUnit": 23, "qualifying": 22, "pitStopTime": 0.4, "cardsToUpgrade": 100, "softCurrencyToUpgrade": 580000000}, {"drs": 0, "speed": 27, "cornering": 57, "powerUnit": 25, "qualifying": 23, "pitStopTime": 0.38, "cardsToUpgrade": 200, "softCurrencyToUpgrade": 696000000}, {"drs": 0, "speed": 28, "cornering": 59, "powerUnit": 26, "qualifying": 25, "pitStopTime": 0.36, "cardsToUpgrade": 400, "softCurrencyToUpgrade": 812000000}, {"drs": 0, "speed": 29, "cornering": 61, "powerUnit": 28, "qualifying": 27, "pitStopTime": 0.34, "cardsToUpgrade": 0, "softCurrencyToUpgrade": 812000000}]	2026-02-12 03:27:03.192+00	2026-02-12 03:27:03.192+00
d0708690-8064-481f-83ee-074302f8791e	The Arc	1	5	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Suspension_24_ThePulse	65	10	\N	\N	\N	3	[{"drs": 0, "speed": 4, "cornering": 12, "powerUnit": 5, "qualifying": 6, "pitStopTime": 0.69, "cardsToUpgrade": 4, "softCurrencyToUpgrade": 220000}, {"drs": 0, "speed": 5, "cornering": 14, "powerUnit": 6, "qualifying": 7, "pitStopTime": 0.64, "cardsToUpgrade": 10, "softCurrencyToUpgrade": 445000}, {"drs": 0, "speed": 5, "cornering": 15, "powerUnit": 6, "qualifying": 7, "pitStopTime": 0.59, "cardsToUpgrade": 20, "softCurrencyToUpgrade": 665000}, {"drs": 0, "speed": 6, "cornering": 17, "powerUnit": 7, "qualifying": 8, "pitStopTime": 0.55, "cardsToUpgrade": 50, "softCurrencyToUpgrade": 2250000}, {"drs": 0, "speed": 6, "cornering": 18, "powerUnit": 7, "qualifying": 9, "pitStopTime": 0.5, "cardsToUpgrade": 100, "softCurrencyToUpgrade": 4750000}, {"drs": 0, "speed": 7, "cornering": 20, "powerUnit": 8, "qualifying": 10, "pitStopTime": 0.46, "cardsToUpgrade": 200, "softCurrencyToUpgrade": 13750000}, {"drs": 0, "speed": 7, "cornering": 21, "powerUnit": 8, "qualifying": 10, "pitStopTime": 0.41, "cardsToUpgrade": 400, "softCurrencyToUpgrade": 25500000}, {"drs": 0, "speed": 8, "cornering": 23, "powerUnit": 9, "qualifying": 11, "pitStopTime": 0.37, "cardsToUpgrade": 1000, "softCurrencyToUpgrade": 37250000}, {"drs": 0, "speed": 8, "cornering": 24, "powerUnit": 9, "qualifying": 12, "pitStopTime": 0.32, "cardsToUpgrade": 2000, "softCurrencyToUpgrade": 49000000}, {"drs": 0, "speed": 9, "cornering": 26, "powerUnit": 10, "qualifying": 12, "pitStopTime": 0.28, "cardsToUpgrade": 4000, "softCurrencyToUpgrade": 60750000}, {"drs": 0, "speed": 9, "cornering": 27, "powerUnit": 10, "qualifying": 13, "pitStopTime": 0.23, "cardsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:03.199+00	2026-02-12 03:27:03.199+00
dd29e3be-2778-4a64-92b2-5acce08462c5	The Stabiliser	1	2	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Brakes_24_TheCorsair	30	10	\N	\N	\N	1	[{"drs": 0, "speed": 3, "cornering": 5, "powerUnit": 2, "qualifying": 1, "pitStopTime": 0.86, "cardsToUpgrade": 4, "softCurrencyToUpgrade": 6000}, {"drs": 0, "speed": 4, "cornering": 7, "powerUnit": 3, "qualifying": 2, "pitStopTime": 0.81, "cardsToUpgrade": 10, "softCurrencyToUpgrade": 30000}, {"drs": 0, "speed": 4, "cornering": 8, "powerUnit": 3, "qualifying": 2, "pitStopTime": 0.77, "cardsToUpgrade": 20, "softCurrencyToUpgrade": 95000}, {"drs": 0, "speed": 5, "cornering": 10, "powerUnit": 4, "qualifying": 3, "pitStopTime": 0.72, "cardsToUpgrade": 50, "softCurrencyToUpgrade": 300000}, {"drs": 0, "speed": 5, "cornering": 11, "powerUnit": 4, "qualifying": 3, "pitStopTime": 0.68, "cardsToUpgrade": 100, "softCurrencyToUpgrade": 950000}, {"drs": 0, "speed": 6, "cornering": 13, "powerUnit": 5, "qualifying": 4, "pitStopTime": 0.63, "cardsToUpgrade": 200, "softCurrencyToUpgrade": 1900000}, {"drs": 0, "speed": 6, "cornering": 14, "powerUnit": 5, "qualifying": 4, "pitStopTime": 0.59, "cardsToUpgrade": 400, "softCurrencyToUpgrade": 3750000}, {"drs": 0, "speed": 7, "cornering": 16, "powerUnit": 6, "qualifying": 5, "pitStopTime": 0.54, "cardsToUpgrade": 1000, "softCurrencyToUpgrade": 5600000}, {"drs": 0, "speed": 7, "cornering": 17, "powerUnit": 6, "qualifying": 5, "pitStopTime": 0.5, "cardsToUpgrade": 2000, "softCurrencyToUpgrade": 7450000}, {"drs": 0, "speed": 8, "cornering": 19, "powerUnit": 7, "qualifying": 6, "pitStopTime": 0.45, "cardsToUpgrade": 4000, "softCurrencyToUpgrade": 9300000}, {"drs": 0, "speed": 8, "cornering": 20, "powerUnit": 7, "qualifying": 6, "pitStopTime": 0.41, "cardsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:03.206+00	2026-02-12 03:27:03.206+00
e2355335-9768-48b4-b7d1-cff55cdc4b5a	Starter	0	0	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Gearbox_24_Starter	0	0	\N	\N	\N	0	[{"drs": 0, "speed": 1, "cornering": 1, "powerUnit": 1, "qualifying": 1, "pitStopTime": 1, "cardsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:03.212+00	2026-02-12 03:27:03.212+00
e6eff945-f1d0-45da-b5c2-233e91bc94e4	Beat	1	3	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Gearbox_24_Pivot	40	10	\N	\N	\N	0	[{"drs": 0, "speed": 2, "cornering": 8, "powerUnit": 4, "qualifying": 2, "pitStopTime": 0.79, "cardsToUpgrade": 4, "softCurrencyToUpgrade": 22000}, {"drs": 0, "speed": 3, "cornering": 9, "powerUnit": 5, "qualifying": 3, "pitStopTime": 0.74, "cardsToUpgrade": 10, "softCurrencyToUpgrade": 45000}, {"drs": 0, "speed": 3, "cornering": 11, "powerUnit": 5, "qualifying": 3, "pitStopTime": 0.69, "cardsToUpgrade": 20, "softCurrencyToUpgrade": 135000}, {"drs": 0, "speed": 4, "cornering": 12, "powerUnit": 6, "qualifying": 4, "pitStopTime": 0.64, "cardsToUpgrade": 50, "softCurrencyToUpgrade": 450000}, {"drs": 0, "speed": 4, "cornering": 14, "powerUnit": 7, "qualifying": 4, "pitStopTime": 0.59, "cardsToUpgrade": 100, "softCurrencyToUpgrade": 1350000}, {"drs": 0, "speed": 5, "cornering": 15, "powerUnit": 8, "qualifying": 5, "pitStopTime": 0.55, "cardsToUpgrade": 200, "softCurrencyToUpgrade": 2800000}, {"drs": 0, "speed": 5, "cornering": 16, "powerUnit": 8, "qualifying": 5, "pitStopTime": 0.5, "cardsToUpgrade": 400, "softCurrencyToUpgrade": 5250000}, {"drs": 0, "speed": 6, "cornering": 18, "powerUnit": 9, "qualifying": 6, "pitStopTime": 0.45, "cardsToUpgrade": 1000, "softCurrencyToUpgrade": 7700000}, {"drs": 0, "speed": 6, "cornering": 19, "powerUnit": 10, "qualifying": 6, "pitStopTime": 0.4, "cardsToUpgrade": 2000, "softCurrencyToUpgrade": 10150000}, {"drs": 0, "speed": 7, "cornering": 21, "powerUnit": 10, "qualifying": 7, "pitStopTime": 0.35, "cardsToUpgrade": 4000, "softCurrencyToUpgrade": 12600000}, {"drs": 0, "speed": 7, "cornering": 22, "powerUnit": 11, "qualifying": 7, "pitStopTime": 0.3, "cardsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:03.219+00	2026-02-12 03:27:03.219+00
e93cb5bc-e0dc-4212-bbff-90262e6790b4	Rumble	2	8	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Brakes_24_TheDynamo	175	5	\N	\N	\N	1	[{"drs": 0, "speed": 8, "cornering": 10, "powerUnit": 28, "qualifying": 11, "pitStopTime": 0.69, "cardsToUpgrade": 4, "softCurrencyToUpgrade": 4500000}, {"drs": 0, "speed": 9, "cornering": 11, "powerUnit": 30, "qualifying": 12, "pitStopTime": 0.65, "cardsToUpgrade": 10, "softCurrencyToUpgrade": 9000000}, {"drs": 0, "speed": 10, "cornering": 12, "powerUnit": 32, "qualifying": 13, "pitStopTime": 0.62, "cardsToUpgrade": 20, "softCurrencyToUpgrade": 20000000}, {"drs": 0, "speed": 11, "cornering": 13, "powerUnit": 34, "qualifying": 14, "pitStopTime": 0.59, "cardsToUpgrade": 50, "softCurrencyToUpgrade": 42250000}, {"drs": 0, "speed": 12, "cornering": 14, "powerUnit": 36, "qualifying": 15, "pitStopTime": 0.56, "cardsToUpgrade": 100, "softCurrencyToUpgrade": 139250000}, {"drs": 0, "speed": 12, "cornering": 15, "powerUnit": 38, "qualifying": 16, "pitStopTime": 0.53, "cardsToUpgrade": 200, "softCurrencyToUpgrade": 167000000}, {"drs": 0, "speed": 13, "cornering": 16, "powerUnit": 40, "qualifying": 17, "pitStopTime": 0.5, "cardsToUpgrade": 400, "softCurrencyToUpgrade": 195000000}, {"drs": 0, "speed": 14, "cornering": 17, "powerUnit": 42, "qualifying": 18, "pitStopTime": 0.47, "cardsToUpgrade": 1000, "softCurrencyToUpgrade": 223000000}, {"drs": 0, "speed": 15, "cornering": 18, "powerUnit": 44, "qualifying": 19, "pitStopTime": 0.44, "cardsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:03.225+00	2026-02-12 03:27:03.225+00
ec4bda00-28e6-436a-9c35-6ba64c03d6ca	Turbo Jet	3	12	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Engine_24_ThePowerhouse	375	2	\N	\N	\N	2	[{"drs": 0, "speed": 16, "cornering": 15, "powerUnit": 42, "qualifying": 17, "pitStopTime": 0.48, "cardsToUpgrade": 4, "softCurrencyToUpgrade": 116000000}, {"drs": 0, "speed": 17, "cornering": 16, "powerUnit": 45, "qualifying": 18, "pitStopTime": 0.45, "cardsToUpgrade": 10, "softCurrencyToUpgrade": 232000000}, {"drs": 0, "speed": 18, "cornering": 17, "powerUnit": 47, "qualifying": 19, "pitStopTime": 0.43, "cardsToUpgrade": 20, "softCurrencyToUpgrade": 348000000}, {"drs": 0, "speed": 19, "cornering": 18, "powerUnit": 50, "qualifying": 20, "pitStopTime": 0.4, "cardsToUpgrade": 50, "softCurrencyToUpgrade": 464000000}, {"drs": 0, "speed": 20, "cornering": 18, "powerUnit": 52, "qualifying": 22, "pitStopTime": 0.38, "cardsToUpgrade": 100, "softCurrencyToUpgrade": 580000000}, {"drs": 0, "speed": 21, "cornering": 19, "powerUnit": 55, "qualifying": 23, "pitStopTime": 0.35, "cardsToUpgrade": 200, "softCurrencyToUpgrade": 696000000}, {"drs": 0, "speed": 22, "cornering": 20, "powerUnit": 57, "qualifying": 24, "pitStopTime": 0.33, "cardsToUpgrade": 400, "softCurrencyToUpgrade": 812000000}, {"drs": 0, "speed": 23, "cornering": 21, "powerUnit": 60, "qualifying": 25, "pitStopTime": 0.3, "cardsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:03.232+00	2026-02-12 03:27:03.232+00
edb7bab6-ad41-4ede-af4e-3f7579f7f3db	Fury	3	5	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Gearbox_24_TheSurge	165	2	\N	\N	\N	0	[{"drs": 0, "speed": 17, "cornering": 5, "powerUnit": 7, "qualifying": 16, "pitStopTime": 0.76, "cardsToUpgrade": 4, "softCurrencyToUpgrade": 220000}, {"drs": 0, "speed": 19, "cornering": 6, "powerUnit": 8, "qualifying": 18, "pitStopTime": 0.72, "cardsToUpgrade": 10, "softCurrencyToUpgrade": 445000}, {"drs": 0, "speed": 21, "cornering": 7, "powerUnit": 9, "qualifying": 19, "pitStopTime": 0.69, "cardsToUpgrade": 20, "softCurrencyToUpgrade": 665000}, {"drs": 0, "speed": 23, "cornering": 8, "powerUnit": 10, "qualifying": 21, "pitStopTime": 0.65, "cardsToUpgrade": 50, "softCurrencyToUpgrade": 2250000}, {"drs": 0, "speed": 24, "cornering": 8, "powerUnit": 10, "qualifying": 23, "pitStopTime": 0.62, "cardsToUpgrade": 100, "softCurrencyToUpgrade": 4750000}, {"drs": 0, "speed": 26, "cornering": 9, "powerUnit": 11, "qualifying": 25, "pitStopTime": 0.58, "cardsToUpgrade": 200, "softCurrencyToUpgrade": 13750000}, {"drs": 0, "speed": 28, "cornering": 10, "powerUnit": 12, "qualifying": 26, "pitStopTime": 0.55, "cardsToUpgrade": 400, "softCurrencyToUpgrade": 25500000}, {"drs": 0, "speed": 30, "cornering": 11, "powerUnit": 13, "qualifying": 28, "pitStopTime": 0.51, "cardsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:03.24+00	2026-02-12 03:27:03.24+00
f16e4e8d-7379-47cd-a0ef-ecf59a399855	Starter	0	0	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Engine_24_Starter	0	0	\N	\N	\N	2	[{"drs": 0, "speed": 1, "cornering": 1, "powerUnit": 1, "qualifying": 1, "pitStopTime": 1, "cardsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:03.246+00	2026-02-12 03:27:03.246+00
\.


--
-- Data for Name: collections; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.collections (id, internal_name, season, ordinal, name, theme, metadata, created_at, updated_at, description, rarity) FROM stdin;
1a4d9853-13e3-40ea-82d6-4891601e41b8	\N	\N	1	SERVLOC_TXT_PODIUM_STARS_COLLECTION_TITLE	PodiumStars	{}	2026-02-27 14:40:29.687393+00	2026-02-27 14:40:29.687393+00	\N	\N
f187e5a1-bcaf-4aa4-af07-70d220cd0cb2	\N	\N	2	SERVLOC_TXT_PODIUM_STARS_LEGENDS_COLLECTION_TITLE	PodiumStarsLegends	{}	2026-02-27 14:40:29.696465+00	2026-02-27 14:40:29.696465+00	\N	\N
fa44edf3-f712-4e32-a94b-46f0187757c2	\N	\N	3	SERVLOC_TXT_HOT_PROSPECT_COLLECTION_TITLE	HotProspects	{}	2026-02-27 14:40:29.703306+00	2026-02-27 14:40:29.703306+00	\N	\N
\.


--
-- Data for Name: drivers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.drivers (id, name, rarity, series, season_id, icon, cc_price, num_duplicates_after_unlock, collection_id, visual_override, collection_sub_name, min_gp_tier, tag_name, ordinal, stats_per_level, created_at, updated_at) FROM stdin;
000bf551-c697-445a-91c6-b8450a783356	Nigel Mansell	4	9	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Driver_25_Mansell	10	10	\N	\N	\N	2	MAN	12	[{"tyreUse": 39, "blocking": 33, "raceStart": 57, "overtaking": 45, "qualifying": 51, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 5000, "softCurrencyToUpgrade": 1000000}, {"tyreUse": 44, "blocking": 38, "raceStart": 62, "overtaking": 50, "qualifying": 56, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 8000, "softCurrencyToUpgrade": 2300000}, {"tyreUse": 50, "blocking": 44, "raceStart": 68, "overtaking": 56, "qualifying": 62, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 12000, "softCurrencyToUpgrade": 5000000}, {"tyreUse": 56, "blocking": 50, "raceStart": 74, "overtaking": 62, "qualifying": 68, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 17000, "softCurrencyToUpgrade": 10000000}, {"tyreUse": 62, "blocking": 56, "raceStart": 80, "overtaking": 68, "qualifying": 74, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 23000, "softCurrencyToUpgrade": 32000000}, {"tyreUse": 68, "blocking": 62, "raceStart": 86, "overtaking": 74, "qualifying": 80, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 30000, "softCurrencyToUpgrade": 43000000}, {"tyreUse": 74, "blocking": 68, "raceStart": 92, "overtaking": 80, "qualifying": 86, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:01.75+00	2026-02-12 03:27:01.75+00
00278200-ae62-491b-ac68-114e4b96b755	Jack Doohan	1	1	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Driver_25_Doohan	25	10	\N	\N	\N	\N	DOO	2	[{"tyreUse": 5, "blocking": 6, "raceStart": 3, "overtaking": 2, "qualifying": 4, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 2000}, {"tyreUse": 9, "blocking": 10, "raceStart": 6, "overtaking": 4, "qualifying": 7, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 8000}, {"tyreUse": 12, "blocking": 13, "raceStart": 8, "overtaking": 6, "qualifying": 10, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 35000}, {"tyreUse": 15, "blocking": 17, "raceStart": 10, "overtaking": 8, "qualifying": 12, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 90000}, {"tyreUse": 18, "blocking": 20, "raceStart": 13, "overtaking": 10, "qualifying": 15, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 275000}, {"tyreUse": 21, "blocking": 24, "raceStart": 15, "overtaking": 12, "qualifying": 18, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 800000}, {"tyreUse": 24, "blocking": 27, "raceStart": 17, "overtaking": 14, "qualifying": 20, "cardsToUpgrade": 400, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 1600000}, {"tyreUse": 27, "blocking": 31, "raceStart": 19, "overtaking": 16, "qualifying": 23, "cardsToUpgrade": 1000, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 2400000}, {"tyreUse": 30, "blocking": 34, "raceStart": 22, "overtaking": 17, "qualifying": 26, "cardsToUpgrade": 2000, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 3200000}, {"tyreUse": 33, "blocking": 38, "raceStart": 24, "overtaking": 19, "qualifying": 28, "cardsToUpgrade": 4000, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 4000000}, {"tyreUse": 36, "blocking": 41, "raceStart": 26, "overtaking": 21, "qualifying": 31, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:01.764+00	2026-02-12 03:27:01.764+00
00b6f935-fb92-4232-9a35-b3df37c26fbf	Charles Leclerc	3	11	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Driver_25_Leclerc	460	2	\N	\N	\N	\N	LEC	15	[{"tyreUse": 48, "blocking": 53, "raceStart": 63, "overtaking": 58, "qualifying": 68, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 54000000}, {"tyreUse": 52, "blocking": 57, "raceStart": 67, "overtaking": 62, "qualifying": 72, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 107000000}, {"tyreUse": 55, "blocking": 60, "raceStart": 70, "overtaking": 65, "qualifying": 75, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 161000000}, {"tyreUse": 59, "blocking": 64, "raceStart": 74, "overtaking": 69, "qualifying": 79, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 215000000}, {"tyreUse": 63, "blocking": 68, "raceStart": 78, "overtaking": 73, "qualifying": 83, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 406000000}, {"tyreUse": 67, "blocking": 72, "raceStart": 82, "overtaking": 77, "qualifying": 87, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 487000000}, {"tyreUse": 71, "blocking": 76, "raceStart": 86, "overtaking": 81, "qualifying": 91, "cardsToUpgrade": 400, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 568000000}, {"tyreUse": 75, "blocking": 80, "raceStart": 90, "overtaking": 85, "qualifying": 95, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:01.777+00	2026-02-12 03:27:01.777+00
024d746e-c964-473a-bc40-ec5c1e8a42a5	Fernando Alonso	3	12	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Driver_25_Alonso	500	2	\N	\N	\N	\N	ALO	16	[{"tyreUse": 52, "blocking": 67, "raceStart": 72, "overtaking": 62, "qualifying": 57, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 116000000}, {"tyreUse": 56, "blocking": 71, "raceStart": 76, "overtaking": 66, "qualifying": 61, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 232000000}, {"tyreUse": 60, "blocking": 75, "raceStart": 80, "overtaking": 70, "qualifying": 65, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 348000000}, {"tyreUse": 64, "blocking": 79, "raceStart": 84, "overtaking": 74, "qualifying": 69, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 464000000}, {"tyreUse": 68, "blocking": 83, "raceStart": 88, "overtaking": 78, "qualifying": 73, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 580000000}, {"tyreUse": 71, "blocking": 86, "raceStart": 91, "overtaking": 81, "qualifying": 76, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 696000000}, {"tyreUse": 75, "blocking": 90, "raceStart": 95, "overtaking": 85, "qualifying": 80, "cardsToUpgrade": 400, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 812000000}, {"tyreUse": 79, "blocking": 94, "raceStart": 99, "overtaking": 89, "qualifying": 84, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:01.822+00	2026-02-12 03:27:01.822+00
02f72c61-eae2-4684-8b7a-4a35b80aa98d	Max Verstappen	1	5	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Driver_25_Verstappen	85	10	\N	\N	\N	\N	VER	20	[{"tyreUse": 17, "blocking": 32, "raceStart": 12, "overtaking": 22, "qualifying": 27, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 220000}, {"tyreUse": 20, "blocking": 35, "raceStart": 15, "overtaking": 25, "qualifying": 30, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 445000}, {"tyreUse": 23, "blocking": 38, "raceStart": 18, "overtaking": 28, "qualifying": 33, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 665000}, {"tyreUse": 25, "blocking": 40, "raceStart": 20, "overtaking": 30, "qualifying": 35, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 2250000}, {"tyreUse": 28, "blocking": 43, "raceStart": 23, "overtaking": 33, "qualifying": 38, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 4750000}, {"tyreUse": 31, "blocking": 46, "raceStart": 26, "overtaking": 36, "qualifying": 41, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 13750000}, {"tyreUse": 33, "blocking": 48, "raceStart": 28, "overtaking": 38, "qualifying": 43, "cardsToUpgrade": 400, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 25500000}, {"tyreUse": 36, "blocking": 51, "raceStart": 31, "overtaking": 41, "qualifying": 46, "cardsToUpgrade": 1000, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 37250000}, {"tyreUse": 39, "blocking": 54, "raceStart": 34, "overtaking": 44, "qualifying": 49, "cardsToUpgrade": 2000, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 49000000}, {"tyreUse": 41, "blocking": 56, "raceStart": 36, "overtaking": 46, "qualifying": 51, "cardsToUpgrade": 4000, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 60750000}, {"tyreUse": 44, "blocking": 59, "raceStart": 39, "overtaking": 49, "qualifying": 54, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:01.852+00	2026-02-12 03:27:01.852+00
06289415-f346-4ed5-b962-3defa32305ea	Liam Lawson	2	7	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Driver_25_Lawson	205	5	\N	\N	\N	\N	LAW	7	[{"tyreUse": 41, "blocking": 21, "raceStart": 26, "overtaking": 31, "qualifying": 36, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 1950000}, {"tyreUse": 44, "blocking": 24, "raceStart": 29, "overtaking": 34, "qualifying": 39, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 3850000}, {"tyreUse": 47, "blocking": 27, "raceStart": 32, "overtaking": 37, "qualifying": 42, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 5800000}, {"tyreUse": 50, "blocking": 30, "raceStart": 35, "overtaking": 40, "qualifying": 45, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 7700000}, {"tyreUse": 53, "blocking": 33, "raceStart": 38, "overtaking": 43, "qualifying": 48, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 15750000}, {"tyreUse": 57, "blocking": 37, "raceStart": 42, "overtaking": 47, "qualifying": 52, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 28000000}, {"tyreUse": 60, "blocking": 40, "raceStart": 45, "overtaking": 50, "qualifying": 55, "cardsToUpgrade": 400, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 51750000}, {"tyreUse": 63, "blocking": 43, "raceStart": 48, "overtaking": 53, "qualifying": 58, "cardsToUpgrade": 1000, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 75500000}, {"tyreUse": 67, "blocking": 47, "raceStart": 52, "overtaking": 57, "qualifying": 62, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:01.864+00	2026-02-12 03:27:01.864+00
0c78b852-f0da-4c94-98e4-edec2fb5db86	Jack Doohan	3	4	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Driver_25_Doohan	180	2	\N	\N	\N	\N	DOO	2	[{"tyreUse": 32, "blocking": 37, "raceStart": 22, "overtaking": 17, "qualifying": 27, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 64000}, {"tyreUse": 36, "blocking": 41, "raceStart": 26, "overtaking": 21, "qualifying": 31, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 130000}, {"tyreUse": 39, "blocking": 44, "raceStart": 29, "overtaking": 24, "qualifying": 34, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 190000}, {"tyreUse": 43, "blocking": 48, "raceStart": 33, "overtaking": 28, "qualifying": 38, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 1550000}, {"tyreUse": 47, "blocking": 52, "raceStart": 37, "overtaking": 32, "qualifying": 42, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 3300000}, {"tyreUse": 51, "blocking": 56, "raceStart": 41, "overtaking": 36, "qualifying": 46, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 6500000}, {"tyreUse": 55, "blocking": 60, "raceStart": 45, "overtaking": 40, "qualifying": 50, "cardsToUpgrade": 400, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 11250000}, {"tyreUse": 58, "blocking": 63, "raceStart": 48, "overtaking": 43, "qualifying": 53, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:01.889+00	2026-02-12 03:27:01.889+00
155d36be-2641-4267-add4-56fd12965b75	Carlos Sainz	5	12	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_SpecialDriver_PS25_Sainz	10	10	1a4d9853-13e3-40ea-82d6-4891601e41b8	\N	\N	3	SAI	18	[{"tyreUse": 85, "blocking": 88, "raceStart": 76, "overtaking": 71, "qualifying": 80, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 50000, "softCurrencyToUpgrade": 500000000}, {"tyreUse": 90, "blocking": 93, "raceStart": 80, "overtaking": 75, "qualifying": 84, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 100000, "softCurrencyToUpgrade": 900000000}, {"tyreUse": 95, "blocking": 98, "raceStart": 84, "overtaking": 79, "qualifying": 88, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 150000, "softCurrencyToUpgrade": 1300000000}, {"tyreUse": 100, "blocking": 103, "raceStart": 88, "overtaking": 83, "qualifying": 93, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 225000, "softCurrencyToUpgrade": 1800000000}, {"tyreUse": 104, "blocking": 107, "raceStart": 91, "overtaking": 87, "qualifying": 97, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 300000, "softCurrencyToUpgrade": 3150000000}, {"tyreUse": 109, "blocking": 112, "raceStart": 95, "overtaking": 91, "qualifying": 101, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 400000, "softCurrencyToUpgrade": 7000000000}, {"tyreUse": 114, "blocking": 117, "raceStart": 99, "overtaking": 95, "qualifying": 105, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:01.909+00	2026-02-12 03:27:01.909+00
52eca0e4-0074-4646-aa7d-3df7e95bfdb9	Carlos Sainz	1	4	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Driver_25_Sainz	70	10	\N	\N	\N	\N	SAI	13	[{"tyreUse": 23, "blocking": 28, "raceStart": 18, "overtaking": 8, "qualifying": 13, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 64000}, {"tyreUse": 25, "blocking": 30, "raceStart": 20, "overtaking": 10, "qualifying": 15, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 130000}, {"tyreUse": 28, "blocking": 33, "raceStart": 23, "overtaking": 13, "qualifying": 18, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 190000}, {"tyreUse": 31, "blocking": 36, "raceStart": 26, "overtaking": 16, "qualifying": 21, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 1550000}, {"tyreUse": 33, "blocking": 38, "raceStart": 28, "overtaking": 18, "qualifying": 23, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 3300000}, {"tyreUse": 36, "blocking": 41, "raceStart": 31, "overtaking": 21, "qualifying": 26, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 6500000}, {"tyreUse": 39, "blocking": 44, "raceStart": 34, "overtaking": 24, "qualifying": 29, "cardsToUpgrade": 400, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 11250000}, {"tyreUse": 41, "blocking": 46, "raceStart": 36, "overtaking": 26, "qualifying": 31, "cardsToUpgrade": 1000, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 16000000}, {"tyreUse": 44, "blocking": 49, "raceStart": 39, "overtaking": 29, "qualifying": 34, "cardsToUpgrade": 2000, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 20750000}, {"tyreUse": 47, "blocking": 52, "raceStart": 42, "overtaking": 32, "qualifying": 37, "cardsToUpgrade": 4000, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 25500000}, {"tyreUse": 50, "blocking": 55, "raceStart": 45, "overtaking": 35, "qualifying": 40, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.217+00	2026-02-12 03:27:02.217+00
1647ff04-bf90-4d74-acc1-dee02f13ffde	James Hunt	4	6	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Driver_24_Hunt	10	10	\N	\N	\N	1	HUN	7	[{"tyreUse": 19, "blocking": 31, "raceStart": 37, "overtaking": 43, "qualifying": 25, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 2000, "softCurrencyToUpgrade": 250000}, {"tyreUse": 25, "blocking": 37, "raceStart": 43, "overtaking": 49, "qualifying": 31, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 3000, "softCurrencyToUpgrade": 500000}, {"tyreUse": 31, "blocking": 43, "raceStart": 49, "overtaking": 55, "qualifying": 37, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 4500, "softCurrencyToUpgrade": 700000}, {"tyreUse": 37, "blocking": 49, "raceStart": 55, "overtaking": 61, "qualifying": 43, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 6000, "softCurrencyToUpgrade": 1000000}, {"tyreUse": 43, "blocking": 55, "raceStart": 61, "overtaking": 67, "qualifying": 49, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 8000, "softCurrencyToUpgrade": 1800000}, {"tyreUse": 49, "blocking": 61, "raceStart": 67, "overtaking": 73, "qualifying": 55, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 10000, "softCurrencyToUpgrade": 5500000}, {"tyreUse": 55, "blocking": 67, "raceStart": 73, "overtaking": 79, "qualifying": 61, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:01.927+00	2026-02-12 03:27:01.927+00
199d0864-4816-454a-b092-150d24c50301	Pierre Gasly	2	8	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Driver_25_Gasly	230	5	\N	\N	\N	\N	GAS	12	[{"tyreUse": 46, "blocking": 26, "raceStart": 36, "overtaking": 31, "qualifying": 41, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 4500000}, {"tyreUse": 49, "blocking": 29, "raceStart": 39, "overtaking": 34, "qualifying": 44, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 9000000}, {"tyreUse": 52, "blocking": 32, "raceStart": 42, "overtaking": 37, "qualifying": 47, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 20000000}, {"tyreUse": 56, "blocking": 36, "raceStart": 46, "overtaking": 41, "qualifying": 51, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 42250000}, {"tyreUse": 59, "blocking": 39, "raceStart": 49, "overtaking": 44, "qualifying": 54, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 139250000}, {"tyreUse": 62, "blocking": 42, "raceStart": 52, "overtaking": 47, "qualifying": 57, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 167000000}, {"tyreUse": 66, "blocking": 46, "raceStart": 56, "overtaking": 51, "qualifying": 61, "cardsToUpgrade": 400, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 195000000}, {"tyreUse": 69, "blocking": 49, "raceStart": 59, "overtaking": 54, "qualifying": 64, "cardsToUpgrade": 1000, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 223000000}, {"tyreUse": 72, "blocking": 52, "raceStart": 62, "overtaking": 57, "qualifying": 67, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:01.94+00	2026-02-12 03:27:01.94+00
1b04f2df-393c-4f43-b2fb-b453bb576d41	Fernando Alonso	2	9	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Driver_25_Alonso	255	5	\N	\N	\N	\N	ALO	16	[{"tyreUse": 30, "blocking": 45, "raceStart": 50, "overtaking": 40, "qualifying": 35, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 9500000}, {"tyreUse": 33, "blocking": 48, "raceStart": 53, "overtaking": 43, "qualifying": 38, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 19000000}, {"tyreUse": 37, "blocking": 52, "raceStart": 57, "overtaking": 47, "qualifying": 42, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 45000000}, {"tyreUse": 40, "blocking": 55, "raceStart": 60, "overtaking": 50, "qualifying": 45, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 105000000}, {"tyreUse": 43, "blocking": 58, "raceStart": 63, "overtaking": 53, "qualifying": 48, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 199000000}, {"tyreUse": 47, "blocking": 62, "raceStart": 67, "overtaking": 57, "qualifying": 52, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 239000000}, {"tyreUse": 50, "blocking": 65, "raceStart": 70, "overtaking": 60, "qualifying": 55, "cardsToUpgrade": 400, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 278000000}, {"tyreUse": 53, "blocking": 68, "raceStart": 73, "overtaking": 63, "qualifying": 58, "cardsToUpgrade": 1000, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 317000000}, {"tyreUse": 57, "blocking": 72, "raceStart": 77, "overtaking": 67, "qualifying": 62, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:01.949+00	2026-02-12 03:27:01.949+00
1c1d92ae-c086-4ce4-b342-915c3b702d99	Nico Hulkenberg	1	3	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Driver_25_Hulkenberg	55	10	\N	\N	\N	\N	HUL	11	[{"tyreUse": 18, "blocking": 3, "raceStart": 8, "overtaking": 13, "qualifying": 23, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 22000}, {"tyreUse": 21, "blocking": 6, "raceStart": 11, "overtaking": 16, "qualifying": 26, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 45000}, {"tyreUse": 24, "blocking": 9, "raceStart": 14, "overtaking": 19, "qualifying": 29, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 135000}, {"tyreUse": 26, "blocking": 11, "raceStart": 16, "overtaking": 21, "qualifying": 31, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 450000}, {"tyreUse": 29, "blocking": 14, "raceStart": 19, "overtaking": 24, "qualifying": 34, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 1350000}, {"tyreUse": 32, "blocking": 17, "raceStart": 22, "overtaking": 27, "qualifying": 37, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 2800000}, {"tyreUse": 34, "blocking": 19, "raceStart": 24, "overtaking": 29, "qualifying": 39, "cardsToUpgrade": 400, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 5250000}, {"tyreUse": 37, "blocking": 22, "raceStart": 27, "overtaking": 32, "qualifying": 42, "cardsToUpgrade": 1000, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 7700000}, {"tyreUse": 40, "blocking": 25, "raceStart": 30, "overtaking": 35, "qualifying": 45, "cardsToUpgrade": 2000, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 10150000}, {"tyreUse": 42, "blocking": 27, "raceStart": 32, "overtaking": 37, "qualifying": 47, "cardsToUpgrade": 4000, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 12600000}, {"tyreUse": 45, "blocking": 30, "raceStart": 35, "overtaking": 40, "qualifying": 50, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:01.958+00	2026-02-12 03:27:01.958+00
23a49c1b-2272-4b82-8c52-30abfda78e9d	Oliver Bearman	5	12	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_SpecialDriver_25_Bearman	10	10	fa44edf3-f712-4e32-a94b-46f0187757c2	\N	SERVLOC_TXT_HOT_PROSPECT_COLLECTION_SUBTITLE_2	3	BEA	12	[{"tyreUse": 67, "blocking": 57, "raceStart": 72, "overtaking": 77, "qualifying": 62, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 10000, "softCurrencyToUpgrade": 232000000}, {"tyreUse": 70, "blocking": 60, "raceStart": 75, "overtaking": 80, "qualifying": 65, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 20000, "softCurrencyToUpgrade": 348000000}, {"tyreUse": 73, "blocking": 63, "raceStart": 78, "overtaking": 83, "qualifying": 68, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 30000, "softCurrencyToUpgrade": 464000000}, {"tyreUse": 77, "blocking": 66, "raceStart": 82, "overtaking": 87, "qualifying": 72, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 40000, "softCurrencyToUpgrade": 580000000}, {"tyreUse": 82, "blocking": 69, "raceStart": 87, "overtaking": 92, "qualifying": 76, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 55000, "softCurrencyToUpgrade": 696000000}, {"tyreUse": 88, "blocking": 73, "raceStart": 93, "overtaking": 98, "qualifying": 81, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 75000, "softCurrencyToUpgrade": 812000000}, {"tyreUse": 95, "blocking": 77, "raceStart": 100, "overtaking": 106, "qualifying": 87, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:01.97+00	2026-02-12 03:27:01.97+00
248a163d-b485-4638-9350-6be2adbad057	Franco Colapinto	3	10	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Driver_25_Colapinto	420	2	\N	\N	\N	\N	COL	21	[{"tyreUse": 43, "blocking": 58, "raceStart": 63, "overtaking": 53, "qualifying": 48, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 22000000}, {"tyreUse": 47, "blocking": 62, "raceStart": 67, "overtaking": 57, "qualifying": 52, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 43000000}, {"tyreUse": 50, "blocking": 65, "raceStart": 70, "overtaking": 60, "qualifying": 55, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 65000000}, {"tyreUse": 53, "blocking": 68, "raceStart": 73, "overtaking": 63, "qualifying": 58, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 150000000}, {"tyreUse": 57, "blocking": 72, "raceStart": 77, "overtaking": 67, "qualifying": 62, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 284000000}, {"tyreUse": 61, "blocking": 76, "raceStart": 81, "overtaking": 71, "qualifying": 66, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 341000000}, {"tyreUse": 65, "blocking": 80, "raceStart": 85, "overtaking": 75, "qualifying": 70, "cardsToUpgrade": 400, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 398000000}, {"tyreUse": 69, "blocking": 84, "raceStart": 89, "overtaking": 79, "qualifying": 74, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:01.978+00	2026-02-12 03:27:01.978+00
25c9758f-4ccc-4c87-90a5-1a89eb250b8c	Lance Stroll	2	6	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Driver_25_Stroll	180	5	\N	\N	\N	\N	STR	6	[{"tyreUse": 37, "blocking": 22, "raceStart": 17, "overtaking": 32, "qualifying": 27, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 790000}, {"tyreUse": 40, "blocking": 25, "raceStart": 20, "overtaking": 35, "qualifying": 30, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 1600000}, {"tyreUse": 43, "blocking": 28, "raceStart": 23, "overtaking": 38, "qualifying": 33, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 2400000}, {"tyreUse": 47, "blocking": 32, "raceStart": 27, "overtaking": 42, "qualifying": 37, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 3200000}, {"tyreUse": 50, "blocking": 35, "raceStart": 30, "overtaking": 45, "qualifying": 40, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 6800000}, {"tyreUse": 53, "blocking": 38, "raceStart": 33, "overtaking": 48, "qualifying": 43, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 19500000}, {"tyreUse": 57, "blocking": 42, "raceStart": 37, "overtaking": 52, "qualifying": 47, "cardsToUpgrade": 400, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 36250000}, {"tyreUse": 60, "blocking": 45, "raceStart": 40, "overtaking": 55, "qualifying": 50, "cardsToUpgrade": 1000, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 53000000}, {"tyreUse": 63, "blocking": 48, "raceStart": 43, "overtaking": 58, "qualifying": 53, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:01.99+00	2026-02-12 03:27:01.99+00
90a7beec-10ce-4f80-be1c-b98486116d04	Gabriel Bortoleto	3	8	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Driver_25_Bortoleto	340	2	\N	\N	\N	\N	BOR	4	[{"tyreUse": 59, "blocking": 54, "raceStart": 39, "overtaking": 49, "qualifying": 44, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 4500000}, {"tyreUse": 63, "blocking": 58, "raceStart": 43, "overtaking": 53, "qualifying": 48, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 9000000}, {"tyreUse": 66, "blocking": 61, "raceStart": 46, "overtaking": 56, "qualifying": 51, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 20000000}, {"tyreUse": 69, "blocking": 64, "raceStart": 49, "overtaking": 59, "qualifying": 54, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 42250000}, {"tyreUse": 73, "blocking": 68, "raceStart": 53, "overtaking": 63, "qualifying": 58, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 139250000}, {"tyreUse": 77, "blocking": 72, "raceStart": 57, "overtaking": 67, "qualifying": 62, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 167000000}, {"tyreUse": 81, "blocking": 76, "raceStart": 61, "overtaking": 71, "qualifying": 66, "cardsToUpgrade": 400, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 195000000}, {"tyreUse": 85, "blocking": 80, "raceStart": 65, "overtaking": 75, "qualifying": 70, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.492+00	2026-02-12 03:27:02.492+00
9138cd6e-6570-4ba3-b0ab-ec113a0752a3	Lando Norris	1	5	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Driver_25_Norris	85	10	\N	\N	\N	\N	NOR	19	[{"tyreUse": 32, "blocking": 27, "raceStart": 12, "overtaking": 17, "qualifying": 22, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 220000}, {"tyreUse": 35, "blocking": 30, "raceStart": 15, "overtaking": 20, "qualifying": 25, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 445000}, {"tyreUse": 38, "blocking": 33, "raceStart": 18, "overtaking": 23, "qualifying": 28, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 665000}, {"tyreUse": 40, "blocking": 35, "raceStart": 20, "overtaking": 25, "qualifying": 30, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 2250000}, {"tyreUse": 43, "blocking": 38, "raceStart": 23, "overtaking": 28, "qualifying": 33, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 4750000}, {"tyreUse": 46, "blocking": 41, "raceStart": 26, "overtaking": 31, "qualifying": 36, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 13750000}, {"tyreUse": 48, "blocking": 43, "raceStart": 28, "overtaking": 33, "qualifying": 38, "cardsToUpgrade": 400, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 25500000}, {"tyreUse": 51, "blocking": 46, "raceStart": 31, "overtaking": 36, "qualifying": 41, "cardsToUpgrade": 1000, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 37250000}, {"tyreUse": 54, "blocking": 49, "raceStart": 34, "overtaking": 39, "qualifying": 44, "cardsToUpgrade": 2000, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 49000000}, {"tyreUse": 56, "blocking": 51, "raceStart": 36, "overtaking": 41, "qualifying": 46, "cardsToUpgrade": 4000, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 60750000}, {"tyreUse": 59, "blocking": 54, "raceStart": 39, "overtaking": 44, "qualifying": 49, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.498+00	2026-02-12 03:27:02.498+00
2aac823a-286d-463a-b66c-7bfdf7f348cc	George Russell	5	12	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_SpecialDriver_PS25_Russell	10	10	1a4d9853-13e3-40ea-82d6-4891601e41b8	\N	\N	3	RUS	20	[{"tyreUse": 91, "blocking": 74, "raceStart": 78, "overtaking": 86, "qualifying": 71, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 50000, "softCurrencyToUpgrade": 500000000}, {"tyreUse": 96, "blocking": 79, "raceStart": 83, "overtaking": 91, "qualifying": 76, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 100000, "softCurrencyToUpgrade": 900000000}, {"tyreUse": 100, "blocking": 84, "raceStart": 88, "overtaking": 95, "qualifying": 81, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 150000, "softCurrencyToUpgrade": 1300000000}, {"tyreUse": 105, "blocking": 90, "raceStart": 93, "overtaking": 100, "qualifying": 86, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 225000, "softCurrencyToUpgrade": 1800000000}, {"tyreUse": 109, "blocking": 95, "raceStart": 98, "overtaking": 105, "qualifying": 90, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 300000, "softCurrencyToUpgrade": 3150000000}, {"tyreUse": 114, "blocking": 100, "raceStart": 103, "overtaking": 109, "qualifying": 95, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 400000, "softCurrencyToUpgrade": 7000000000}, {"tyreUse": 118, "blocking": 105, "raceStart": 108, "overtaking": 114, "qualifying": 100, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.012+00	2026-02-12 03:27:02.012+00
2ac6af78-4b3b-44af-af1f-30a6799c6252	Charles Leclerc	1	4	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Driver_25_Leclerc	70	10	\N	\N	\N	\N	LEC	15	[{"tyreUse": 8, "blocking": 13, "raceStart": 23, "overtaking": 18, "qualifying": 28, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 64000}, {"tyreUse": 10, "blocking": 15, "raceStart": 25, "overtaking": 20, "qualifying": 30, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 130000}, {"tyreUse": 13, "blocking": 18, "raceStart": 28, "overtaking": 23, "qualifying": 33, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 190000}, {"tyreUse": 16, "blocking": 21, "raceStart": 31, "overtaking": 26, "qualifying": 36, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 1550000}, {"tyreUse": 18, "blocking": 23, "raceStart": 33, "overtaking": 28, "qualifying": 38, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 3300000}, {"tyreUse": 21, "blocking": 26, "raceStart": 36, "overtaking": 31, "qualifying": 41, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 6500000}, {"tyreUse": 24, "blocking": 29, "raceStart": 39, "overtaking": 34, "qualifying": 44, "cardsToUpgrade": 400, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 11250000}, {"tyreUse": 26, "blocking": 31, "raceStart": 41, "overtaking": 36, "qualifying": 46, "cardsToUpgrade": 1000, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 16000000}, {"tyreUse": 29, "blocking": 34, "raceStart": 44, "overtaking": 39, "qualifying": 49, "cardsToUpgrade": 2000, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 20750000}, {"tyreUse": 32, "blocking": 37, "raceStart": 47, "overtaking": 42, "qualifying": 52, "cardsToUpgrade": 4000, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 25500000}, {"tyreUse": 35, "blocking": 40, "raceStart": 50, "overtaking": 45, "qualifying": 55, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.034+00	2026-02-12 03:27:02.034+00
2af4fd3f-45e8-403f-8ce0-f98fc5950e9d	Damon Hill	4	9	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Driver_24_DHill	10	10	\N	\N	\N	2	HIL	11	[{"tyreUse": 39, "blocking": 57, "raceStart": 45, "overtaking": 33, "qualifying": 51, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 5000, "softCurrencyToUpgrade": 1000000}, {"tyreUse": 44, "blocking": 62, "raceStart": 50, "overtaking": 38, "qualifying": 56, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 8000, "softCurrencyToUpgrade": 2300000}, {"tyreUse": 50, "blocking": 68, "raceStart": 56, "overtaking": 44, "qualifying": 62, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 12000, "softCurrencyToUpgrade": 5000000}, {"tyreUse": 56, "blocking": 74, "raceStart": 62, "overtaking": 50, "qualifying": 68, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 17000, "softCurrencyToUpgrade": 10000000}, {"tyreUse": 62, "blocking": 80, "raceStart": 68, "overtaking": 56, "qualifying": 74, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 23000, "softCurrencyToUpgrade": 32000000}, {"tyreUse": 68, "blocking": 86, "raceStart": 74, "overtaking": 62, "qualifying": 80, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 30000, "softCurrencyToUpgrade": 43000000}, {"tyreUse": 74, "blocking": 92, "raceStart": 80, "overtaking": 68, "qualifying": 86, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.054+00	2026-02-12 03:27:02.054+00
2d32365c-a923-4ed7-9aeb-25c61b649dc0	Lance Stroll	3	10	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Driver_25_Stroll	420	2	\N	\N	\N	\N	STR	6	[{"tyreUse": 63, "blocking": 48, "raceStart": 43, "overtaking": 58, "qualifying": 53, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 22000000}, {"tyreUse": 67, "blocking": 52, "raceStart": 47, "overtaking": 62, "qualifying": 57, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 43000000}, {"tyreUse": 70, "blocking": 55, "raceStart": 50, "overtaking": 65, "qualifying": 60, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 65000000}, {"tyreUse": 73, "blocking": 58, "raceStart": 53, "overtaking": 68, "qualifying": 63, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 150000000}, {"tyreUse": 77, "blocking": 62, "raceStart": 57, "overtaking": 72, "qualifying": 67, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 284000000}, {"tyreUse": 81, "blocking": 66, "raceStart": 61, "overtaking": 76, "qualifying": 71, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 341000000}, {"tyreUse": 85, "blocking": 70, "raceStart": 65, "overtaking": 80, "qualifying": 75, "cardsToUpgrade": 400, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 398000000}, {"tyreUse": 89, "blocking": 74, "raceStart": 69, "overtaking": 84, "qualifying": 79, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.065+00	2026-02-12 03:27:02.065+00
2f72ac64-8889-4dec-8dc7-d71067dc4cf5	Carlos Sainz	2	8	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Driver_25_Sainz	230	5	\N	\N	\N	\N	SAI	13	[{"tyreUse": 41, "blocking": 46, "raceStart": 36, "overtaking": 26, "qualifying": 31, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 4500000}, {"tyreUse": 44, "blocking": 49, "raceStart": 39, "overtaking": 29, "qualifying": 34, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 9000000}, {"tyreUse": 47, "blocking": 52, "raceStart": 42, "overtaking": 32, "qualifying": 37, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 20000000}, {"tyreUse": 51, "blocking": 56, "raceStart": 46, "overtaking": 36, "qualifying": 41, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 42250000}, {"tyreUse": 54, "blocking": 59, "raceStart": 49, "overtaking": 39, "qualifying": 44, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 139250000}, {"tyreUse": 57, "blocking": 62, "raceStart": 52, "overtaking": 42, "qualifying": 47, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 167000000}, {"tyreUse": 61, "blocking": 66, "raceStart": 56, "overtaking": 46, "qualifying": 51, "cardsToUpgrade": 400, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 195000000}, {"tyreUse": 64, "blocking": 69, "raceStart": 59, "overtaking": 49, "qualifying": 54, "cardsToUpgrade": 1000, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 223000000}, {"tyreUse": 67, "blocking": 72, "raceStart": 62, "overtaking": 52, "qualifying": 57, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.073+00	2026-02-12 03:27:02.073+00
3556916d-f611-4449-93af-a1ae3a80dd8c	Oliver Bearman	3	6	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Driver_25_Bearman	260	2	\N	\N	\N	\N	BEA	3	[{"tyreUse": 36, "blocking": 26, "raceStart": 41, "overtaking": 46, "qualifying": 31, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 790000}, {"tyreUse": 39, "blocking": 29, "raceStart": 44, "overtaking": 49, "qualifying": 34, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 1600000}, {"tyreUse": 43, "blocking": 33, "raceStart": 48, "overtaking": 53, "qualifying": 38, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 2400000}, {"tyreUse": 47, "blocking": 37, "raceStart": 52, "overtaking": 57, "qualifying": 42, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 3200000}, {"tyreUse": 51, "blocking": 41, "raceStart": 56, "overtaking": 61, "qualifying": 46, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 6800000}, {"tyreUse": 55, "blocking": 45, "raceStart": 60, "overtaking": 65, "qualifying": 50, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 19500000}, {"tyreUse": 58, "blocking": 48, "raceStart": 63, "overtaking": 68, "qualifying": 53, "cardsToUpgrade": 400, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 36250000}, {"tyreUse": 62, "blocking": 52, "raceStart": 67, "overtaking": 72, "qualifying": 57, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.08+00	2026-02-12 03:27:02.08+00
39165d67-a5d1-4cda-9ba0-d45d3e31808c	Oliver Bearman	1	1	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Driver_25_Bearman	25	10	\N	\N	\N	\N	BEA	3	[{"tyreUse": 4, "blocking": 2, "raceStart": 5, "overtaking": 6, "qualifying": 3, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 2000}, {"tyreUse": 7, "blocking": 4, "raceStart": 9, "overtaking": 10, "qualifying": 6, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 8000}, {"tyreUse": 10, "blocking": 6, "raceStart": 12, "overtaking": 13, "qualifying": 8, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 35000}, {"tyreUse": 12, "blocking": 8, "raceStart": 15, "overtaking": 17, "qualifying": 10, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 90000}, {"tyreUse": 15, "blocking": 10, "raceStart": 18, "overtaking": 20, "qualifying": 13, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 275000}, {"tyreUse": 18, "blocking": 12, "raceStart": 21, "overtaking": 24, "qualifying": 15, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 800000}, {"tyreUse": 20, "blocking": 14, "raceStart": 24, "overtaking": 27, "qualifying": 17, "cardsToUpgrade": 400, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 1600000}, {"tyreUse": 23, "blocking": 16, "raceStart": 27, "overtaking": 31, "qualifying": 19, "cardsToUpgrade": 1000, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 2400000}, {"tyreUse": 26, "blocking": 17, "raceStart": 30, "overtaking": 34, "qualifying": 22, "cardsToUpgrade": 2000, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 3200000}, {"tyreUse": 28, "blocking": 19, "raceStart": 33, "overtaking": 38, "qualifying": 24, "cardsToUpgrade": 4000, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 4000000}, {"tyreUse": 31, "blocking": 21, "raceStart": 36, "overtaking": 41, "qualifying": 26, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.09+00	2026-02-12 03:27:02.09+00
3ab3e578-d903-4dfd-bedd-93010264ee63	Lewis Hamilton	2	9	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Driver_25_Hamilton	255	5	\N	\N	\N	\N	HAM	18	[{"tyreUse": 45, "blocking": 30, "raceStart": 35, "overtaking": 50, "qualifying": 40, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 9500000}, {"tyreUse": 48, "blocking": 33, "raceStart": 38, "overtaking": 53, "qualifying": 43, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 19000000}, {"tyreUse": 52, "blocking": 37, "raceStart": 42, "overtaking": 57, "qualifying": 47, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 45000000}, {"tyreUse": 55, "blocking": 40, "raceStart": 45, "overtaking": 60, "qualifying": 50, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 105000000}, {"tyreUse": 58, "blocking": 43, "raceStart": 48, "overtaking": 63, "qualifying": 53, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 199000000}, {"tyreUse": 62, "blocking": 47, "raceStart": 52, "overtaking": 67, "qualifying": 57, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 239000000}, {"tyreUse": 65, "blocking": 50, "raceStart": 55, "overtaking": 70, "qualifying": 60, "cardsToUpgrade": 400, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 278000000}, {"tyreUse": 68, "blocking": 53, "raceStart": 58, "overtaking": 73, "qualifying": 63, "cardsToUpgrade": 1000, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 317000000}, {"tyreUse": 72, "blocking": 57, "raceStart": 62, "overtaking": 77, "qualifying": 67, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.107+00	2026-02-12 03:27:02.107+00
c33b8b04-6396-4134-92ee-275bfc45fc03	Lewis Hamilton	1	5	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Driver_25_Hamilton	85	10	\N	\N	\N	\N	HAM	18	[{"tyreUse": 27, "blocking": 12, "raceStart": 17, "overtaking": 32, "qualifying": 22, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 220000}, {"tyreUse": 30, "blocking": 15, "raceStart": 20, "overtaking": 35, "qualifying": 25, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 445000}, {"tyreUse": 33, "blocking": 18, "raceStart": 23, "overtaking": 38, "qualifying": 28, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 665000}, {"tyreUse": 35, "blocking": 20, "raceStart": 25, "overtaking": 40, "qualifying": 30, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 2250000}, {"tyreUse": 38, "blocking": 23, "raceStart": 28, "overtaking": 43, "qualifying": 33, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 4750000}, {"tyreUse": 41, "blocking": 26, "raceStart": 31, "overtaking": 46, "qualifying": 36, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 13750000}, {"tyreUse": 43, "blocking": 28, "raceStart": 33, "overtaking": 48, "qualifying": 38, "cardsToUpgrade": 400, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 25500000}, {"tyreUse": 46, "blocking": 31, "raceStart": 36, "overtaking": 51, "qualifying": 41, "cardsToUpgrade": 1000, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 37250000}, {"tyreUse": 49, "blocking": 34, "raceStart": 39, "overtaking": 54, "qualifying": 44, "cardsToUpgrade": 2000, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 49000000}, {"tyreUse": 51, "blocking": 36, "raceStart": 41, "overtaking": 56, "qualifying": 46, "cardsToUpgrade": 4000, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 60750000}, {"tyreUse": 54, "blocking": 39, "raceStart": 44, "overtaking": 59, "qualifying": 49, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.634+00	2026-02-12 03:27:02.634+00
3ef19dd3-616c-4c7c-b19d-243152eee4a0	Mark Webber	4	3	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Driver_24_Webber	10	10	\N	\N	\N	\N	WEB	2	[{"tyreUse": 21, "blocking": 9, "raceStart": 17, "overtaking": 5, "qualifying": 13, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 1000, "softCurrencyToUpgrade": 2000}, {"tyreUse": 27, "blocking": 15, "raceStart": 23, "overtaking": 11, "qualifying": 19, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 1500, "softCurrencyToUpgrade": 7500}, {"tyreUse": 33, "blocking": 21, "raceStart": 29, "overtaking": 17, "qualifying": 25, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 2000, "softCurrencyToUpgrade": 25000}, {"tyreUse": 39, "blocking": 27, "raceStart": 35, "overtaking": 23, "qualifying": 31, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 3000, "softCurrencyToUpgrade": 75000}, {"tyreUse": 45, "blocking": 33, "raceStart": 41, "overtaking": 29, "qualifying": 37, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 4000, "softCurrencyToUpgrade": 250000}, {"tyreUse": 51, "blocking": 39, "raceStart": 47, "overtaking": 35, "qualifying": 43, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 5000, "softCurrencyToUpgrade": 500000}, {"tyreUse": 57, "blocking": 45, "raceStart": 53, "overtaking": 41, "qualifying": 49, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.131+00	2026-02-12 03:27:02.131+00
457bae19-cc8f-4a4c-95c0-d29a569d9797	Esteban Ocon	1	3	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Driver_25_Ocon	55	10	\N	\N	\N	\N	OCO	8	[{"tyreUse": 23, "blocking": 3, "raceStart": 18, "overtaking": 8, "qualifying": 13, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 22000}, {"tyreUse": 26, "blocking": 6, "raceStart": 21, "overtaking": 11, "qualifying": 16, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 45000}, {"tyreUse": 29, "blocking": 9, "raceStart": 24, "overtaking": 14, "qualifying": 19, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 135000}, {"tyreUse": 31, "blocking": 11, "raceStart": 26, "overtaking": 16, "qualifying": 21, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 450000}, {"tyreUse": 34, "blocking": 14, "raceStart": 29, "overtaking": 19, "qualifying": 24, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 1350000}, {"tyreUse": 37, "blocking": 17, "raceStart": 32, "overtaking": 22, "qualifying": 27, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 2800000}, {"tyreUse": 39, "blocking": 19, "raceStart": 34, "overtaking": 24, "qualifying": 29, "cardsToUpgrade": 400, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 5250000}, {"tyreUse": 42, "blocking": 22, "raceStart": 37, "overtaking": 27, "qualifying": 32, "cardsToUpgrade": 1000, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 7700000}, {"tyreUse": 45, "blocking": 25, "raceStart": 40, "overtaking": 30, "qualifying": 35, "cardsToUpgrade": 2000, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 10150000}, {"tyreUse": 47, "blocking": 27, "raceStart": 42, "overtaking": 32, "qualifying": 37, "cardsToUpgrade": 4000, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 12600000}, {"tyreUse": 50, "blocking": 30, "raceStart": 45, "overtaking": 35, "qualifying": 40, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.15+00	2026-02-12 03:27:02.15+00
4656b98f-d122-43a3-9c31-2e335c1ada79	Oscar Piastri	1	4	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Driver_25_Piastri	70	10	\N	\N	\N	\N	PIA	14	[{"tyreUse": 8, "blocking": 23, "raceStart": 18, "overtaking": 28, "qualifying": 13, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 64000}, {"tyreUse": 10, "blocking": 25, "raceStart": 20, "overtaking": 30, "qualifying": 15, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 130000}, {"tyreUse": 13, "blocking": 28, "raceStart": 23, "overtaking": 33, "qualifying": 18, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 190000}, {"tyreUse": 16, "blocking": 31, "raceStart": 26, "overtaking": 36, "qualifying": 21, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 1550000}, {"tyreUse": 18, "blocking": 33, "raceStart": 28, "overtaking": 38, "qualifying": 23, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 3300000}, {"tyreUse": 21, "blocking": 36, "raceStart": 31, "overtaking": 41, "qualifying": 26, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 6500000}, {"tyreUse": 24, "blocking": 39, "raceStart": 34, "overtaking": 44, "qualifying": 29, "cardsToUpgrade": 400, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 11250000}, {"tyreUse": 26, "blocking": 41, "raceStart": 36, "overtaking": 46, "qualifying": 31, "cardsToUpgrade": 1000, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 16000000}, {"tyreUse": 29, "blocking": 44, "raceStart": 39, "overtaking": 49, "qualifying": 34, "cardsToUpgrade": 2000, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 20750000}, {"tyreUse": 32, "blocking": 47, "raceStart": 42, "overtaking": 52, "qualifying": 37, "cardsToUpgrade": 4000, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 25500000}, {"tyreUse": 35, "blocking": 50, "raceStart": 45, "overtaking": 55, "qualifying": 40, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.167+00	2026-02-12 03:27:02.167+00
499fa3af-30ea-457e-8e27-6d3be79b62e2	Oliver Bearman	5	9	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Driver_25_Bearman	10	10	fa44edf3-f712-4e32-a94b-46f0187757c2	HotProspects_Alt	SERVLOC_TXT_HOT_PROSPECT_COLLECTION_SUBTITLE_1	2	BEA	5	[{"tyreUse": 51, "blocking": 41, "raceStart": 56, "overtaking": 61, "qualifying": 46, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 3500, "softCurrencyToUpgrade": 19000000}, {"tyreUse": 53, "blocking": 43, "raceStart": 58, "overtaking": 63, "qualifying": 48, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 5500, "softCurrencyToUpgrade": 45000000}, {"tyreUse": 56, "blocking": 46, "raceStart": 61, "overtaking": 66, "qualifying": 51, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 8500, "softCurrencyToUpgrade": 105000000}, {"tyreUse": 60, "blocking": 50, "raceStart": 65, "overtaking": 70, "qualifying": 55, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 12000, "softCurrencyToUpgrade": 199000000}, {"tyreUse": 65, "blocking": 55, "raceStart": 70, "overtaking": 75, "qualifying": 60, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 15000, "softCurrencyToUpgrade": 239000000}, {"tyreUse": 71, "blocking": 61, "raceStart": 76, "overtaking": 81, "qualifying": 66, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 20000, "softCurrencyToUpgrade": 278000000}, {"tyreUse": 77, "blocking": 67, "raceStart": 82, "overtaking": 87, "qualifying": 72, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.179+00	2026-02-12 03:27:02.179+00
4cc5f807-b7b7-46ba-bccc-701b168e9ab9	Lance Stroll	1	2	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Driver_25_Stroll	40	10	\N	\N	\N	\N	STR	6	[{"tyreUse": 17, "blocking": 5, "raceStart": 1, "overtaking": 13, "qualifying": 9, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 6000}, {"tyreUse": 20, "blocking": 7, "raceStart": 3, "overtaking": 16, "qualifying": 12, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 30000}, {"tyreUse": 23, "blocking": 10, "raceStart": 6, "overtaking": 18, "qualifying": 14, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 95000}, {"tyreUse": 26, "blocking": 13, "raceStart": 8, "overtaking": 21, "qualifying": 17, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 300000}, {"tyreUse": 28, "blocking": 15, "raceStart": 11, "overtaking": 24, "qualifying": 20, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 950000}, {"tyreUse": 31, "blocking": 18, "raceStart": 13, "overtaking": 27, "qualifying": 22, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 1900000}, {"tyreUse": 34, "blocking": 20, "raceStart": 16, "overtaking": 30, "qualifying": 25, "cardsToUpgrade": 400, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 3750000}, {"tyreUse": 37, "blocking": 23, "raceStart": 18, "overtaking": 32, "qualifying": 28, "cardsToUpgrade": 1000, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 5600000}, {"tyreUse": 40, "blocking": 25, "raceStart": 21, "overtaking": 35, "qualifying": 30, "cardsToUpgrade": 2000, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 7450000}, {"tyreUse": 43, "blocking": 28, "raceStart": 23, "overtaking": 38, "qualifying": 33, "cardsToUpgrade": 4000, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 9300000}, {"tyreUse": 46, "blocking": 31, "raceStart": 26, "overtaking": 41, "qualifying": 36, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.188+00	2026-02-12 03:27:02.188+00
4f633dbe-ccaa-4568-b151-bff7ad66f6d9	Graham Hill	4	9	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Driver_24_GHill	10	10	\N	\N	\N	2	HIL	14	[{"tyreUse": 39, "blocking": 57, "raceStart": 33, "overtaking": 51, "qualifying": 45, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 5000, "softCurrencyToUpgrade": 1000000}, {"tyreUse": 44, "blocking": 62, "raceStart": 38, "overtaking": 56, "qualifying": 50, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 8000, "softCurrencyToUpgrade": 2300000}, {"tyreUse": 50, "blocking": 68, "raceStart": 44, "overtaking": 62, "qualifying": 56, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 12000, "softCurrencyToUpgrade": 5000000}, {"tyreUse": 56, "blocking": 74, "raceStart": 50, "overtaking": 68, "qualifying": 62, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 17000, "softCurrencyToUpgrade": 10000000}, {"tyreUse": 62, "blocking": 80, "raceStart": 56, "overtaking": 74, "qualifying": 68, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 23000, "softCurrencyToUpgrade": 32000000}, {"tyreUse": 68, "blocking": 86, "raceStart": 62, "overtaking": 80, "qualifying": 74, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 30000, "softCurrencyToUpgrade": 43000000}, {"tyreUse": 74, "blocking": 92, "raceStart": 68, "overtaking": 86, "qualifying": 80, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.195+00	2026-02-12 03:27:02.195+00
52ced91f-772d-4bdf-8e83-537d4f400656	Yuki Tsunoda	2	7	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Driver_25_Tsunoda	205	5	\N	\N	\N	\N	TSU	10	[{"tyreUse": 26, "blocking": 31, "raceStart": 21, "overtaking": 41, "qualifying": 36, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 1950000}, {"tyreUse": 29, "blocking": 34, "raceStart": 24, "overtaking": 44, "qualifying": 39, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 3850000}, {"tyreUse": 32, "blocking": 37, "raceStart": 27, "overtaking": 47, "qualifying": 42, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 5800000}, {"tyreUse": 35, "blocking": 40, "raceStart": 30, "overtaking": 50, "qualifying": 45, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 7700000}, {"tyreUse": 38, "blocking": 43, "raceStart": 33, "overtaking": 53, "qualifying": 48, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 15750000}, {"tyreUse": 42, "blocking": 47, "raceStart": 37, "overtaking": 57, "qualifying": 52, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 28000000}, {"tyreUse": 45, "blocking": 50, "raceStart": 40, "overtaking": 60, "qualifying": 55, "cardsToUpgrade": 400, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 51750000}, {"tyreUse": 48, "blocking": 53, "raceStart": 43, "overtaking": 63, "qualifying": 58, "cardsToUpgrade": 1000, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 75500000}, {"tyreUse": 52, "blocking": 57, "raceStart": 47, "overtaking": 67, "qualifying": 62, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.205+00	2026-02-12 03:27:02.205+00
569534f6-4378-473a-aede-2626c11e5316	Alain Prost	4	12	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Driver_23_Prost	10	10	\N	\N	\N	3	PRO	18	[{"tyreUse": 58, "blocking": 61, "raceStart": 64, "overtaking": 55, "qualifying": 55, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 10000, "softCurrencyToUpgrade": 30000000}, {"tyreUse": 64, "blocking": 67, "raceStart": 70, "overtaking": 60, "qualifying": 61, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 20000, "softCurrencyToUpgrade": 60000000}, {"tyreUse": 70, "blocking": 73, "raceStart": 76, "overtaking": 66, "qualifying": 67, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 30000, "softCurrencyToUpgrade": 90000000}, {"tyreUse": 76, "blocking": 79, "raceStart": 82, "overtaking": 71, "qualifying": 73, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 40000, "softCurrencyToUpgrade": 110000000}, {"tyreUse": 82, "blocking": 85, "raceStart": 88, "overtaking": 77, "qualifying": 79, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 55000, "softCurrencyToUpgrade": 150000000}, {"tyreUse": 88, "blocking": 91, "raceStart": 94, "overtaking": 82, "qualifying": 85, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 75000, "softCurrencyToUpgrade": 170000000}, {"tyreUse": 93, "blocking": 96, "raceStart": 99, "overtaking": 87, "qualifying": 90, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.233+00	2026-02-12 03:27:02.233+00
5d0ff653-b359-4b68-b538-7bc70a51ecf4	Andrea Kimi Antonelli	2	6	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Driver_25_Antonelli	180	5	\N	\N	\N	\N	ANT	5	[{"tyreUse": 22, "blocking": 17, "raceStart": 27, "overtaking": 32, "qualifying": 37, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 790000}, {"tyreUse": 25, "blocking": 20, "raceStart": 30, "overtaking": 35, "qualifying": 40, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 1600000}, {"tyreUse": 28, "blocking": 23, "raceStart": 33, "overtaking": 38, "qualifying": 43, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 2400000}, {"tyreUse": 32, "blocking": 27, "raceStart": 37, "overtaking": 42, "qualifying": 47, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 3200000}, {"tyreUse": 35, "blocking": 30, "raceStart": 40, "overtaking": 45, "qualifying": 50, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 6800000}, {"tyreUse": 38, "blocking": 33, "raceStart": 43, "overtaking": 48, "qualifying": 53, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 19500000}, {"tyreUse": 42, "blocking": 37, "raceStart": 47, "overtaking": 52, "qualifying": 57, "cardsToUpgrade": 400, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 36250000}, {"tyreUse": 45, "blocking": 40, "raceStart": 50, "overtaking": 55, "qualifying": 60, "cardsToUpgrade": 1000, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 53000000}, {"tyreUse": 48, "blocking": 43, "raceStart": 53, "overtaking": 58, "qualifying": 63, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.254+00	2026-02-12 03:27:02.254+00
5deeef04-c803-4281-9423-fd85b03776c6	Liam Lawson	5	9	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Driver_25_Lawson	10	10	fa44edf3-f712-4e32-a94b-46f0187757c2	HotProspects_Alt	SERVLOC_TXT_HOT_PROSPECT_COLLECTION_SUBTITLE_1	2	LAW	4	[{"tyreUse": 62, "blocking": 47, "raceStart": 52, "overtaking": 57, "qualifying": 42, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 3500, "softCurrencyToUpgrade": 19000000}, {"tyreUse": 64, "blocking": 49, "raceStart": 54, "overtaking": 59, "qualifying": 44, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 5500, "softCurrencyToUpgrade": 45000000}, {"tyreUse": 67, "blocking": 52, "raceStart": 57, "overtaking": 62, "qualifying": 47, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 8500, "softCurrencyToUpgrade": 105000000}, {"tyreUse": 71, "blocking": 56, "raceStart": 61, "overtaking": 66, "qualifying": 51, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 12000, "softCurrencyToUpgrade": 199000000}, {"tyreUse": 76, "blocking": 61, "raceStart": 66, "overtaking": 71, "qualifying": 56, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 15000, "softCurrencyToUpgrade": 239000000}, {"tyreUse": 82, "blocking": 67, "raceStart": 72, "overtaking": 77, "qualifying": 62, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 20000, "softCurrencyToUpgrade": 278000000}, {"tyreUse": 88, "blocking": 73, "raceStart": 78, "overtaking": 83, "qualifying": 68, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.272+00	2026-02-12 03:27:02.272+00
5f531534-e23d-4bcc-a522-c993385b4fee	Franco Colapinto	2	6	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Driver_25_Colapinto	180	5	\N	\N	\N	\N	COL	21	[{"tyreUse": 17, "blocking": 32, "raceStart": 37, "overtaking": 27, "qualifying": 22, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 790000}, {"tyreUse": 20, "blocking": 35, "raceStart": 40, "overtaking": 30, "qualifying": 25, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 1600000}, {"tyreUse": 23, "blocking": 38, "raceStart": 43, "overtaking": 33, "qualifying": 28, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 2400000}, {"tyreUse": 27, "blocking": 42, "raceStart": 47, "overtaking": 37, "qualifying": 32, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 3200000}, {"tyreUse": 30, "blocking": 45, "raceStart": 50, "overtaking": 40, "qualifying": 35, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 6800000}, {"tyreUse": 33, "blocking": 48, "raceStart": 53, "overtaking": 43, "qualifying": 38, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 19500000}, {"tyreUse": 37, "blocking": 52, "raceStart": 57, "overtaking": 47, "qualifying": 42, "cardsToUpgrade": 400, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 36250000}, {"tyreUse": 40, "blocking": 55, "raceStart": 60, "overtaking": 50, "qualifying": 45, "cardsToUpgrade": 1000, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 53000000}, {"tyreUse": 43, "blocking": 58, "raceStart": 63, "overtaking": 53, "qualifying": 48, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.283+00	2026-02-12 03:27:02.283+00
5fb341fd-4f26-47bf-8548-7133cafc75a7	Gabriel Bortoleto	5	12	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_SpecialDriver_25_Bortoleto	10	10	fa44edf3-f712-4e32-a94b-46f0187757c2	\N	SERVLOC_TXT_HOT_PROSPECT_COLLECTION_SUBTITLE_2	3	BOR	10	[{"tyreUse": 77, "blocking": 72, "raceStart": 57, "overtaking": 67, "qualifying": 62, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 10000, "softCurrencyToUpgrade": 232000000}, {"tyreUse": 80, "blocking": 75, "raceStart": 60, "overtaking": 70, "qualifying": 65, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 20000, "softCurrencyToUpgrade": 348000000}, {"tyreUse": 83, "blocking": 78, "raceStart": 63, "overtaking": 73, "qualifying": 68, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 30000, "softCurrencyToUpgrade": 464000000}, {"tyreUse": 87, "blocking": 82, "raceStart": 66, "overtaking": 77, "qualifying": 72, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 40000, "softCurrencyToUpgrade": 580000000}, {"tyreUse": 92, "blocking": 87, "raceStart": 69, "overtaking": 82, "qualifying": 76, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 55000, "softCurrencyToUpgrade": 696000000}, {"tyreUse": 98, "blocking": 93, "raceStart": 73, "overtaking": 88, "qualifying": 81, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 75000, "softCurrencyToUpgrade": 812000000}, {"tyreUse": 106, "blocking": 100, "raceStart": 77, "overtaking": 95, "qualifying": 87, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.293+00	2026-02-12 03:27:02.293+00
c37b119f-bf91-4395-9459-e4e119f5950f	George Russell	1	5	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Driver_25_Russell	85	10	\N	\N	\N	\N	RUS	17	[{"tyreUse": 22, "blocking": 12, "raceStart": 17, "overtaking": 27, "qualifying": 32, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 220000}, {"tyreUse": 25, "blocking": 15, "raceStart": 20, "overtaking": 30, "qualifying": 35, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 445000}, {"tyreUse": 28, "blocking": 18, "raceStart": 23, "overtaking": 33, "qualifying": 38, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 665000}, {"tyreUse": 30, "blocking": 20, "raceStart": 25, "overtaking": 35, "qualifying": 40, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 2250000}, {"tyreUse": 33, "blocking": 23, "raceStart": 28, "overtaking": 38, "qualifying": 43, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 4750000}, {"tyreUse": 36, "blocking": 26, "raceStart": 31, "overtaking": 41, "qualifying": 46, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 13750000}, {"tyreUse": 38, "blocking": 28, "raceStart": 33, "overtaking": 43, "qualifying": 48, "cardsToUpgrade": 400, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 25500000}, {"tyreUse": 41, "blocking": 31, "raceStart": 36, "overtaking": 46, "qualifying": 51, "cardsToUpgrade": 1000, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 37250000}, {"tyreUse": 44, "blocking": 34, "raceStart": 39, "overtaking": 49, "qualifying": 54, "cardsToUpgrade": 2000, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 49000000}, {"tyreUse": 46, "blocking": 36, "raceStart": 41, "overtaking": 51, "qualifying": 56, "cardsToUpgrade": 4000, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 60750000}, {"tyreUse": 49, "blocking": 39, "raceStart": 44, "overtaking": 54, "qualifying": 59, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.64+00	2026-02-12 03:27:02.64+00
5fcd1711-0165-4e20-ad53-85c701db1f8e	Isack Hadjar	5	12	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_SpecialDriver_PS25_Hadjar	10	10	1a4d9853-13e3-40ea-82d6-4891601e41b8	\N	\N	3	HAD	15	[{"tyreUse": 77, "blocking": 69, "raceStart": 80, "overtaking": 73, "qualifying": 66, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 25000, "softCurrencyToUpgrade": 350000000}, {"tyreUse": 82, "blocking": 73, "raceStart": 85, "overtaking": 77, "qualifying": 70, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 50000, "softCurrencyToUpgrade": 700000000}, {"tyreUse": 86, "blocking": 77, "raceStart": 89, "overtaking": 81, "qualifying": 74, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 100000, "softCurrencyToUpgrade": 1000000000}, {"tyreUse": 91, "blocking": 82, "raceStart": 94, "overtaking": 86, "qualifying": 78, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 150000, "softCurrencyToUpgrade": 1500000000}, {"tyreUse": 96, "blocking": 86, "raceStart": 99, "overtaking": 90, "qualifying": 82, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 200000, "softCurrencyToUpgrade": 2500000000}, {"tyreUse": 100, "blocking": 90, "raceStart": 103, "overtaking": 94, "qualifying": 86, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 250000, "softCurrencyToUpgrade": 5200000000}, {"tyreUse": 105, "blocking": 94, "raceStart": 108, "overtaking": 98, "qualifying": 90, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.302+00	2026-02-12 03:27:02.302+00
62e6a7b0-61b6-46b5-929f-b2cc0a32d817	Andrea Kimi Antonelli	5	12	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_SpecialDriver_PS25_Antonelli	10	10	1a4d9853-13e3-40ea-82d6-4891601e41b8	\N	\N	3	ANT	17	[{"tyreUse": 69, "blocking": 73, "raceStart": 77, "overtaking": 66, "qualifying": 80, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 25000, "softCurrencyToUpgrade": 350000000}, {"tyreUse": 74, "blocking": 78, "raceStart": 82, "overtaking": 71, "qualifying": 85, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 50000, "softCurrencyToUpgrade": 700000000}, {"tyreUse": 78, "blocking": 83, "raceStart": 87, "overtaking": 75, "qualifying": 90, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 100000, "softCurrencyToUpgrade": 1000000000}, {"tyreUse": 83, "blocking": 88, "raceStart": 92, "overtaking": 80, "qualifying": 95, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 150000, "softCurrencyToUpgrade": 1500000000}, {"tyreUse": 88, "blocking": 93, "raceStart": 96, "overtaking": 85, "qualifying": 100, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 200000, "softCurrencyToUpgrade": 2500000000}, {"tyreUse": 92, "blocking": 98, "raceStart": 101, "overtaking": 89, "qualifying": 105, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 250000, "softCurrencyToUpgrade": 5200000000}, {"tyreUse": 97, "blocking": 103, "raceStart": 106, "overtaking": 94, "qualifying": 110, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.311+00	2026-02-12 03:27:02.311+00
630a65a6-44dc-4543-8d01-d2f7e9d7b2fd	Max Verstappen	2	9	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Driver_25_Verstappen	255	5	\N	\N	\N	\N	VER	20	[{"tyreUse": 35, "blocking": 50, "raceStart": 30, "overtaking": 40, "qualifying": 45, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 9500000}, {"tyreUse": 38, "blocking": 53, "raceStart": 33, "overtaking": 43, "qualifying": 48, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 19000000}, {"tyreUse": 42, "blocking": 57, "raceStart": 37, "overtaking": 47, "qualifying": 52, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 45000000}, {"tyreUse": 45, "blocking": 60, "raceStart": 40, "overtaking": 50, "qualifying": 55, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 105000000}, {"tyreUse": 48, "blocking": 63, "raceStart": 43, "overtaking": 53, "qualifying": 58, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 199000000}, {"tyreUse": 52, "blocking": 67, "raceStart": 47, "overtaking": 57, "qualifying": 62, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 239000000}, {"tyreUse": 55, "blocking": 70, "raceStart": 50, "overtaking": 60, "qualifying": 65, "cardsToUpgrade": 400, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 278000000}, {"tyreUse": 58, "blocking": 73, "raceStart": 53, "overtaking": 63, "qualifying": 68, "cardsToUpgrade": 1000, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 317000000}, {"tyreUse": 62, "blocking": 77, "raceStart": 57, "overtaking": 67, "qualifying": 72, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.33+00	2026-02-12 03:27:02.33+00
6b1121ce-ff49-4fd2-9234-05ab19d13b1e	Charles Leclerc	5	12	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_SpecialDriver_PS25_Leclerc	10	10	1a4d9853-13e3-40ea-82d6-4891601e41b8	\N	\N	3	LEC	19	[{"tyreUse": 79, "blocking": 72, "raceStart": 89, "overtaking": 75, "qualifying": 85, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 50000, "softCurrencyToUpgrade": 500000000}, {"tyreUse": 84, "blocking": 77, "raceStart": 94, "overtaking": 80, "qualifying": 90, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 100000, "softCurrencyToUpgrade": 900000000}, {"tyreUse": 89, "blocking": 81, "raceStart": 98, "overtaking": 85, "qualifying": 95, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 150000, "softCurrencyToUpgrade": 1300000000}, {"tyreUse": 94, "blocking": 86, "raceStart": 103, "overtaking": 91, "qualifying": 100, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 225000, "softCurrencyToUpgrade": 1800000000}, {"tyreUse": 99, "blocking": 90, "raceStart": 108, "overtaking": 96, "qualifying": 104, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 300000, "softCurrencyToUpgrade": 3150000000}, {"tyreUse": 104, "blocking": 95, "raceStart": 112, "overtaking": 101, "qualifying": 109, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 400000, "softCurrencyToUpgrade": 7000000000}, {"tyreUse": 109, "blocking": 99, "raceStart": 117, "overtaking": 106, "qualifying": 114, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.348+00	2026-02-12 03:27:02.348+00
6b48029d-ee33-4c75-b636-1e5f01bc3668	Charles Leclerc	2	8	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Driver_25_Leclerc	230	5	\N	\N	\N	\N	LEC	15	[{"tyreUse": 26, "blocking": 31, "raceStart": 41, "overtaking": 36, "qualifying": 46, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 4500000}, {"tyreUse": 29, "blocking": 34, "raceStart": 44, "overtaking": 39, "qualifying": 49, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 9000000}, {"tyreUse": 32, "blocking": 37, "raceStart": 47, "overtaking": 42, "qualifying": 52, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 20000000}, {"tyreUse": 36, "blocking": 41, "raceStart": 51, "overtaking": 46, "qualifying": 56, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 42250000}, {"tyreUse": 39, "blocking": 44, "raceStart": 54, "overtaking": 49, "qualifying": 59, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 139250000}, {"tyreUse": 42, "blocking": 47, "raceStart": 57, "overtaking": 52, "qualifying": 62, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 167000000}, {"tyreUse": 46, "blocking": 51, "raceStart": 61, "overtaking": 56, "qualifying": 66, "cardsToUpgrade": 400, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 195000000}, {"tyreUse": 49, "blocking": 54, "raceStart": 64, "overtaking": 59, "qualifying": 69, "cardsToUpgrade": 1000, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 223000000}, {"tyreUse": 52, "blocking": 57, "raceStart": 67, "overtaking": 62, "qualifying": 72, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.371+00	2026-02-12 03:27:02.371+00
74f3f3fd-7871-4949-9343-2ec1597e8b3d	Yuki Tsunoda	3	10	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Driver_25_Tsunoda	420	2	\N	\N	\N	\N	TSU	10	[{"tyreUse": 48, "blocking": 53, "raceStart": 43, "overtaking": 63, "qualifying": 58, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 22000000}, {"tyreUse": 52, "blocking": 57, "raceStart": 47, "overtaking": 67, "qualifying": 62, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 43000000}, {"tyreUse": 55, "blocking": 60, "raceStart": 50, "overtaking": 70, "qualifying": 65, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 65000000}, {"tyreUse": 58, "blocking": 63, "raceStart": 53, "overtaking": 73, "qualifying": 68, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 150000000}, {"tyreUse": 62, "blocking": 67, "raceStart": 57, "overtaking": 77, "qualifying": 72, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 284000000}, {"tyreUse": 66, "blocking": 71, "raceStart": 61, "overtaking": 81, "qualifying": 76, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 341000000}, {"tyreUse": 70, "blocking": 75, "raceStart": 65, "overtaking": 85, "qualifying": 80, "cardsToUpgrade": 400, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 398000000}, {"tyreUse": 74, "blocking": 79, "raceStart": 69, "overtaking": 89, "qualifying": 84, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.386+00	2026-02-12 03:27:02.386+00
f331b1b4-05f4-4b1a-b51d-04bc55d3e906	Isack Hadjar	2	6	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Driver_25_Hadjar	180	5	\N	\N	\N	\N	HAD	1	[{"tyreUse": 32, "blocking": 22, "raceStart": 27, "overtaking": 37, "qualifying": 17, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 790000}, {"tyreUse": 35, "blocking": 25, "raceStart": 30, "overtaking": 40, "qualifying": 20, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 1600000}, {"tyreUse": 38, "blocking": 28, "raceStart": 33, "overtaking": 43, "qualifying": 23, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 2400000}, {"tyreUse": 42, "blocking": 32, "raceStart": 37, "overtaking": 47, "qualifying": 27, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 3200000}, {"tyreUse": 45, "blocking": 35, "raceStart": 40, "overtaking": 50, "qualifying": 30, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 6800000}, {"tyreUse": 48, "blocking": 38, "raceStart": 43, "overtaking": 53, "qualifying": 33, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 19500000}, {"tyreUse": 52, "blocking": 42, "raceStart": 47, "overtaking": 57, "qualifying": 37, "cardsToUpgrade": 400, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 36250000}, {"tyreUse": 55, "blocking": 45, "raceStart": 50, "overtaking": 60, "qualifying": 40, "cardsToUpgrade": 1000, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 53000000}, {"tyreUse": 58, "blocking": 48, "raceStart": 53, "overtaking": 63, "qualifying": 43, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.853+00	2026-02-12 03:27:02.853+00
76b25394-2a3f-4ede-93f4-56fe518691a8	Gilles Villeneuve	4	9	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Driver_24_Villeneuve	10	10	\N	\N	\N	2	VIL	10	[{"tyreUse": 33, "blocking": 51, "raceStart": 57, "overtaking": 45, "qualifying": 39, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 5000, "softCurrencyToUpgrade": 1000000}, {"tyreUse": 38, "blocking": 56, "raceStart": 62, "overtaking": 50, "qualifying": 44, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 8000, "softCurrencyToUpgrade": 2300000}, {"tyreUse": 44, "blocking": 62, "raceStart": 68, "overtaking": 56, "qualifying": 50, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 12000, "softCurrencyToUpgrade": 5000000}, {"tyreUse": 50, "blocking": 68, "raceStart": 74, "overtaking": 62, "qualifying": 56, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 17000, "softCurrencyToUpgrade": 10000000}, {"tyreUse": 56, "blocking": 74, "raceStart": 80, "overtaking": 68, "qualifying": 62, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 23000, "softCurrencyToUpgrade": 32000000}, {"tyreUse": 62, "blocking": 80, "raceStart": 86, "overtaking": 74, "qualifying": 68, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 30000, "softCurrencyToUpgrade": 43000000}, {"tyreUse": 68, "blocking": 86, "raceStart": 92, "overtaking": 80, "qualifying": 74, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.398+00	2026-02-12 03:27:02.398+00
779aa53f-edab-4299-991e-c6937c966e1a	Yuki Tsunoda	1	3	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Driver_25_Tsunoda	55	10	\N	\N	\N	\N	TSU	10	[{"tyreUse": 8, "blocking": 13, "raceStart": 3, "overtaking": 23, "qualifying": 18, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 22000}, {"tyreUse": 11, "blocking": 16, "raceStart": 6, "overtaking": 26, "qualifying": 21, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 45000}, {"tyreUse": 14, "blocking": 19, "raceStart": 9, "overtaking": 29, "qualifying": 24, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 135000}, {"tyreUse": 16, "blocking": 21, "raceStart": 11, "overtaking": 31, "qualifying": 26, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 450000}, {"tyreUse": 19, "blocking": 24, "raceStart": 14, "overtaking": 34, "qualifying": 29, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 1350000}, {"tyreUse": 22, "blocking": 27, "raceStart": 17, "overtaking": 37, "qualifying": 32, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 2800000}, {"tyreUse": 24, "blocking": 29, "raceStart": 19, "overtaking": 39, "qualifying": 34, "cardsToUpgrade": 400, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 5250000}, {"tyreUse": 27, "blocking": 32, "raceStart": 22, "overtaking": 42, "qualifying": 37, "cardsToUpgrade": 1000, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 7700000}, {"tyreUse": 30, "blocking": 35, "raceStart": 25, "overtaking": 45, "qualifying": 40, "cardsToUpgrade": 2000, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 10150000}, {"tyreUse": 32, "blocking": 37, "raceStart": 27, "overtaking": 47, "qualifying": 42, "cardsToUpgrade": 4000, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 12600000}, {"tyreUse": 35, "blocking": 40, "raceStart": 30, "overtaking": 50, "qualifying": 45, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.406+00	2026-02-12 03:27:02.406+00
78f25c26-5f36-4265-9454-a5a9c9aad122	Andrea Kimi Antonelli	5	9	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Driver_25_Antonelli	10	10	fa44edf3-f712-4e32-a94b-46f0187757c2	HotProspects_Alt	SERVLOC_TXT_HOT_PROSPECT_COLLECTION_SUBTITLE_1	2	ANT	7	[{"tyreUse": 47, "blocking": 42, "raceStart": 52, "overtaking": 57, "qualifying": 62, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 3500, "softCurrencyToUpgrade": 19000000}, {"tyreUse": 49, "blocking": 44, "raceStart": 54, "overtaking": 59, "qualifying": 64, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 5500, "softCurrencyToUpgrade": 45000000}, {"tyreUse": 52, "blocking": 47, "raceStart": 57, "overtaking": 62, "qualifying": 67, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 8500, "softCurrencyToUpgrade": 105000000}, {"tyreUse": 56, "blocking": 51, "raceStart": 61, "overtaking": 66, "qualifying": 71, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 12000, "softCurrencyToUpgrade": 199000000}, {"tyreUse": 61, "blocking": 56, "raceStart": 66, "overtaking": 71, "qualifying": 76, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 15000, "softCurrencyToUpgrade": 239000000}, {"tyreUse": 67, "blocking": 62, "raceStart": 72, "overtaking": 77, "qualifying": 82, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 20000, "softCurrencyToUpgrade": 278000000}, {"tyreUse": 73, "blocking": 68, "raceStart": 78, "overtaking": 83, "qualifying": 88, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.414+00	2026-02-12 03:27:02.414+00
7c8a992f-510c-4e7d-8b4d-572ec1ed3725	Lando Norris	2	9	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Driver_25_Norris	255	5	\N	\N	\N	\N	NOR	19	[{"tyreUse": 50, "blocking": 45, "raceStart": 30, "overtaking": 35, "qualifying": 40, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 9500000}, {"tyreUse": 53, "blocking": 48, "raceStart": 33, "overtaking": 38, "qualifying": 43, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 19000000}, {"tyreUse": 57, "blocking": 52, "raceStart": 37, "overtaking": 42, "qualifying": 47, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 45000000}, {"tyreUse": 60, "blocking": 55, "raceStart": 40, "overtaking": 45, "qualifying": 50, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 105000000}, {"tyreUse": 63, "blocking": 58, "raceStart": 43, "overtaking": 48, "qualifying": 53, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 199000000}, {"tyreUse": 67, "blocking": 62, "raceStart": 47, "overtaking": 52, "qualifying": 57, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 239000000}, {"tyreUse": 70, "blocking": 65, "raceStart": 50, "overtaking": 55, "qualifying": 60, "cardsToUpgrade": 400, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 278000000}, {"tyreUse": 73, "blocking": 68, "raceStart": 53, "overtaking": 58, "qualifying": 63, "cardsToUpgrade": 1000, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 317000000}, {"tyreUse": 77, "blocking": 72, "raceStart": 57, "overtaking": 62, "qualifying": 67, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.429+00	2026-02-12 03:27:02.429+00
7da0615d-a2b7-4506-840e-69354ffed927	Max Verstappen	3	12	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Driver_25_Verstappen	500	2	\N	\N	\N	\N	VER	20	[{"tyreUse": 57, "blocking": 72, "raceStart": 52, "overtaking": 62, "qualifying": 67, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 116000000}, {"tyreUse": 61, "blocking": 76, "raceStart": 56, "overtaking": 66, "qualifying": 71, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 232000000}, {"tyreUse": 65, "blocking": 80, "raceStart": 60, "overtaking": 70, "qualifying": 75, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 348000000}, {"tyreUse": 69, "blocking": 84, "raceStart": 64, "overtaking": 74, "qualifying": 79, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 464000000}, {"tyreUse": 73, "blocking": 88, "raceStart": 68, "overtaking": 78, "qualifying": 83, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 580000000}, {"tyreUse": 76, "blocking": 91, "raceStart": 71, "overtaking": 81, "qualifying": 86, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 696000000}, {"tyreUse": 80, "blocking": 95, "raceStart": 75, "overtaking": 85, "qualifying": 90, "cardsToUpgrade": 400, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 812000000}, {"tyreUse": 84, "blocking": 99, "raceStart": 79, "overtaking": 89, "qualifying": 94, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.438+00	2026-02-12 03:27:02.438+00
825737bd-3b5c-445f-b2cc-97d08d5287d1	Ayrton Senna	4	12	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Driver_24_Senna	10	10	\N	\N	\N	3	SEN	21	[{"tyreUse": 59, "blocking": 62, "raceStart": 59, "overtaking": 68, "qualifying": 65, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 10000, "softCurrencyToUpgrade": 30000000}, {"tyreUse": 66, "blocking": 68, "raceStart": 66, "overtaking": 73, "qualifying": 71, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 20000, "softCurrencyToUpgrade": 60000000}, {"tyreUse": 73, "blocking": 75, "raceStart": 73, "overtaking": 79, "qualifying": 77, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 30000, "softCurrencyToUpgrade": 90000000}, {"tyreUse": 79, "blocking": 81, "raceStart": 79, "overtaking": 84, "qualifying": 82, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 40000, "softCurrencyToUpgrade": 110000000}, {"tyreUse": 86, "blocking": 87, "raceStart": 86, "overtaking": 89, "qualifying": 88, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 55000, "softCurrencyToUpgrade": 150000000}, {"tyreUse": 92, "blocking": 93, "raceStart": 92, "overtaking": 94, "qualifying": 93, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 75000, "softCurrencyToUpgrade": 170000000}, {"tyreUse": 99, "blocking": 99, "raceStart": 99, "overtaking": 99, "qualifying": 99, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.444+00	2026-02-12 03:27:02.444+00
88d1370d-f79a-4e89-a212-f821b1304dd2	Niki Lauda	5	12	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Driver_24_Lauda	10	10	f187e5a1-bcaf-4aa4-af07-70d220cd0cb2	\N	\N	3	LAU	25	[{"tyreUse": 94, "blocking": 86, "raceStart": 80, "overtaking": 90, "qualifying": 83, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 100000, "softCurrencyToUpgrade": 1000000000}, {"tyreUse": 99, "blocking": 92, "raceStart": 86, "overtaking": 95, "qualifying": 89, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 200000, "softCurrencyToUpgrade": 1800000000}, {"tyreUse": 104, "blocking": 97, "raceStart": 92, "overtaking": 101, "qualifying": 95, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 300000, "softCurrencyToUpgrade": 2600000000}, {"tyreUse": 109, "blocking": 103, "raceStart": 98, "overtaking": 106, "qualifying": 101, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 450000, "softCurrencyToUpgrade": 3500000000}, {"tyreUse": 114, "blocking": 109, "raceStart": 104, "overtaking": 111, "qualifying": 106, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 600000, "softCurrencyToUpgrade": 7000000000}, {"tyreUse": 119, "blocking": 114, "raceStart": 110, "overtaking": 117, "qualifying": 112, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 750000, "softCurrencyToUpgrade": 14000000000}, {"tyreUse": 124, "blocking": 120, "raceStart": 116, "overtaking": 122, "qualifying": 118, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.451+00	2026-02-12 03:27:02.451+00
89fd6084-ee69-4ec3-8ee4-617c18ba4d89	Carlos Sainz	3	11	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Driver_25_Sainz	460	2	\N	\N	\N	\N	SAI	13	[{"tyreUse": 63, "blocking": 68, "raceStart": 58, "overtaking": 48, "qualifying": 53, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 54000000}, {"tyreUse": 67, "blocking": 72, "raceStart": 62, "overtaking": 52, "qualifying": 57, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 107000000}, {"tyreUse": 70, "blocking": 75, "raceStart": 65, "overtaking": 55, "qualifying": 60, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 161000000}, {"tyreUse": 74, "blocking": 79, "raceStart": 69, "overtaking": 59, "qualifying": 64, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 215000000}, {"tyreUse": 78, "blocking": 83, "raceStart": 73, "overtaking": 63, "qualifying": 68, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 406000000}, {"tyreUse": 82, "blocking": 87, "raceStart": 77, "overtaking": 67, "qualifying": 72, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 487000000}, {"tyreUse": 86, "blocking": 91, "raceStart": 81, "overtaking": 71, "qualifying": 76, "cardsToUpgrade": 400, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 568000000}, {"tyreUse": 90, "blocking": 95, "raceStart": 85, "overtaking": 75, "qualifying": 80, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.457+00	2026-02-12 03:27:02.457+00
8a874046-3354-43e2-a779-59d64cead7f3	Oscar Piastri	2	8	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Driver_25_Piastri	230	5	\N	\N	\N	\N	PIA	14	[{"tyreUse": 26, "blocking": 41, "raceStart": 36, "overtaking": 46, "qualifying": 31, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 4500000}, {"tyreUse": 29, "blocking": 44, "raceStart": 39, "overtaking": 49, "qualifying": 34, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 9000000}, {"tyreUse": 32, "blocking": 47, "raceStart": 42, "overtaking": 52, "qualifying": 37, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 20000000}, {"tyreUse": 36, "blocking": 51, "raceStart": 46, "overtaking": 56, "qualifying": 41, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 42250000}, {"tyreUse": 39, "blocking": 54, "raceStart": 49, "overtaking": 59, "qualifying": 44, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 139250000}, {"tyreUse": 42, "blocking": 57, "raceStart": 52, "overtaking": 62, "qualifying": 47, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 167000000}, {"tyreUse": 46, "blocking": 61, "raceStart": 56, "overtaking": 66, "qualifying": 51, "cardsToUpgrade": 400, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 195000000}, {"tyreUse": 49, "blocking": 64, "raceStart": 59, "overtaking": 69, "qualifying": 54, "cardsToUpgrade": 1000, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 223000000}, {"tyreUse": 52, "blocking": 67, "raceStart": 62, "overtaking": 72, "qualifying": 57, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.462+00	2026-02-12 03:27:02.462+00
8a8f53bd-30c5-4dfa-90ec-1ec8ca5e7d65	Liam Lawson	1	2	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Driver_25_Lawson	40	10	\N	\N	\N	\N	LAW	7	[{"tyreUse": 17, "blocking": 1, "raceStart": 5, "overtaking": 9, "qualifying": 13, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 6000}, {"tyreUse": 20, "blocking": 3, "raceStart": 7, "overtaking": 12, "qualifying": 16, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 30000}, {"tyreUse": 23, "blocking": 6, "raceStart": 10, "overtaking": 14, "qualifying": 18, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 95000}, {"tyreUse": 26, "blocking": 8, "raceStart": 13, "overtaking": 17, "qualifying": 21, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 300000}, {"tyreUse": 28, "blocking": 11, "raceStart": 15, "overtaking": 20, "qualifying": 24, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 950000}, {"tyreUse": 31, "blocking": 13, "raceStart": 18, "overtaking": 22, "qualifying": 27, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 1900000}, {"tyreUse": 34, "blocking": 16, "raceStart": 20, "overtaking": 25, "qualifying": 30, "cardsToUpgrade": 400, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 3750000}, {"tyreUse": 37, "blocking": 18, "raceStart": 23, "overtaking": 28, "qualifying": 32, "cardsToUpgrade": 1000, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 5600000}, {"tyreUse": 40, "blocking": 21, "raceStart": 25, "overtaking": 30, "qualifying": 35, "cardsToUpgrade": 2000, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 7450000}, {"tyreUse": 43, "blocking": 23, "raceStart": 28, "overtaking": 33, "qualifying": 38, "cardsToUpgrade": 4000, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 9300000}, {"tyreUse": 46, "blocking": 26, "raceStart": 31, "overtaking": 36, "qualifying": 41, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.468+00	2026-02-12 03:27:02.468+00
8c305d1d-f8b1-4574-9962-9a6067273af6	Liam Lawson	3	10	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Driver_25_Lawson	420	2	\N	\N	\N	\N	LAW	7	[{"tyreUse": 63, "blocking": 43, "raceStart": 48, "overtaking": 53, "qualifying": 58, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 22000000}, {"tyreUse": 67, "blocking": 47, "raceStart": 52, "overtaking": 57, "qualifying": 62, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 43000000}, {"tyreUse": 70, "blocking": 50, "raceStart": 55, "overtaking": 60, "qualifying": 65, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 65000000}, {"tyreUse": 73, "blocking": 53, "raceStart": 58, "overtaking": 63, "qualifying": 68, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 150000000}, {"tyreUse": 77, "blocking": 57, "raceStart": 62, "overtaking": 67, "qualifying": 72, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 284000000}, {"tyreUse": 81, "blocking": 61, "raceStart": 66, "overtaking": 71, "qualifying": 76, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 341000000}, {"tyreUse": 85, "blocking": 65, "raceStart": 70, "overtaking": 75, "qualifying": 80, "cardsToUpgrade": 400, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 398000000}, {"tyreUse": 89, "blocking": 69, "raceStart": 74, "overtaking": 79, "qualifying": 84, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.474+00	2026-02-12 03:27:02.474+00
8e6fefee-efc9-4736-96b1-a1b8121ebbda	Mario Andretti	4	6	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Driver_23_Andretti	10	10	\N	\N	\N	1	AND	8	[{"tyreUse": 31, "blocking": 19, "raceStart": 25, "overtaking": 43, "qualifying": 37, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 2000, "softCurrencyToUpgrade": 250000}, {"tyreUse": 37, "blocking": 25, "raceStart": 31, "overtaking": 49, "qualifying": 43, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 3000, "softCurrencyToUpgrade": 500000}, {"tyreUse": 43, "blocking": 31, "raceStart": 37, "overtaking": 55, "qualifying": 49, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 4500, "softCurrencyToUpgrade": 700000}, {"tyreUse": 49, "blocking": 37, "raceStart": 43, "overtaking": 61, "qualifying": 55, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 6000, "softCurrencyToUpgrade": 1000000}, {"tyreUse": 55, "blocking": 43, "raceStart": 49, "overtaking": 67, "qualifying": 61, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 8000, "softCurrencyToUpgrade": 1800000}, {"tyreUse": 61, "blocking": 49, "raceStart": 55, "overtaking": 73, "qualifying": 67, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 10000, "softCurrencyToUpgrade": 5500000}, {"tyreUse": 67, "blocking": 55, "raceStart": 61, "overtaking": 79, "qualifying": 73, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.481+00	2026-02-12 03:27:02.481+00
906fb5cf-df19-4c53-a46d-91581e44cffa	Ayrton Senna	5	12	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Driver_24_Senna	10	10	f187e5a1-bcaf-4aa4-af07-70d220cd0cb2	\N	\N	3	SEN	29	[{"tyreUse": 92, "blocking": 92, "raceStart": 92, "overtaking": 92, "qualifying": 92, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 100000, "softCurrencyToUpgrade": 1000000000}, {"tyreUse": 98, "blocking": 98, "raceStart": 98, "overtaking": 98, "qualifying": 98, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 200000, "softCurrencyToUpgrade": 1800000000}, {"tyreUse": 104, "blocking": 104, "raceStart": 104, "overtaking": 104, "qualifying": 104, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 300000, "softCurrencyToUpgrade": 2600000000}, {"tyreUse": 111, "blocking": 111, "raceStart": 111, "overtaking": 111, "qualifying": 111, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 450000, "softCurrencyToUpgrade": 3500000000}, {"tyreUse": 117, "blocking": 117, "raceStart": 117, "overtaking": 117, "qualifying": 117, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 600000, "softCurrencyToUpgrade": 7000000000}, {"tyreUse": 123, "blocking": 123, "raceStart": 123, "overtaking": 123, "qualifying": 123, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 750000, "softCurrencyToUpgrade": 14000000000}, {"tyreUse": 129, "blocking": 129, "raceStart": 129, "overtaking": 129, "qualifying": 129, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.486+00	2026-02-12 03:27:02.486+00
96ca4b37-578d-4ae3-95e5-196c12ed5944	Franco Colapinto	5	12	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_SpecialDriver_25_Colapinto	10	10	fa44edf3-f712-4e32-a94b-46f0187757c2	\N	SERVLOC_TXT_HOT_PROSPECT_COLLECTION_SUBTITLE_2	3	COL	9	[{"tyreUse": 61, "blocking": 71, "raceStart": 76, "overtaking": 66, "qualifying": 56, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 10000, "softCurrencyToUpgrade": 232000000}, {"tyreUse": 64, "blocking": 74, "raceStart": 79, "overtaking": 69, "qualifying": 59, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 20000, "softCurrencyToUpgrade": 348000000}, {"tyreUse": 67, "blocking": 77, "raceStart": 82, "overtaking": 72, "qualifying": 62, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 30000, "softCurrencyToUpgrade": 464000000}, {"tyreUse": 71, "blocking": 81, "raceStart": 86, "overtaking": 76, "qualifying": 65, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 40000, "softCurrencyToUpgrade": 580000000}, {"tyreUse": 75, "blocking": 86, "raceStart": 91, "overtaking": 81, "qualifying": 68, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 55000, "softCurrencyToUpgrade": 696000000}, {"tyreUse": 80, "blocking": 92, "raceStart": 97, "overtaking": 87, "qualifying": 72, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 75000, "softCurrencyToUpgrade": 812000000}, {"tyreUse": 86, "blocking": 99, "raceStart": 105, "overtaking": 94, "qualifying": 76, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.504+00	2026-02-12 03:27:02.504+00
99afbb72-56df-4e64-8925-d3c1dd5ae3fa	Isack Hadjar	5	12	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_SpecialDriver_25_Hadjar	10	10	fa44edf3-f712-4e32-a94b-46f0187757c2	\N	SERVLOC_TXT_HOT_PROSPECT_COLLECTION_SUBTITLE_2	3	HAD	13	[{"tyreUse": 58, "blocking": 68, "raceStart": 73, "overtaking": 78, "qualifying": 63, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 10000, "softCurrencyToUpgrade": 232000000}, {"tyreUse": 61, "blocking": 71, "raceStart": 76, "overtaking": 81, "qualifying": 66, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 20000, "softCurrencyToUpgrade": 348000000}, {"tyreUse": 64, "blocking": 74, "raceStart": 79, "overtaking": 84, "qualifying": 69, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 30000, "softCurrencyToUpgrade": 464000000}, {"tyreUse": 67, "blocking": 78, "raceStart": 83, "overtaking": 88, "qualifying": 73, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 40000, "softCurrencyToUpgrade": 580000000}, {"tyreUse": 70, "blocking": 83, "raceStart": 88, "overtaking": 93, "qualifying": 77, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 55000, "softCurrencyToUpgrade": 696000000}, {"tyreUse": 74, "blocking": 89, "raceStart": 94, "overtaking": 99, "qualifying": 82, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 75000, "softCurrencyToUpgrade": 812000000}, {"tyreUse": 78, "blocking": 96, "raceStart": 101, "overtaking": 107, "qualifying": 88, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.511+00	2026-02-12 03:27:02.511+00
9d41ec96-e731-4c2f-aca0-350066d40834	Gabriel Bortoleto	2	1	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Driver_25_Bortoleto	55	5	\N	\N	\N	\N	BOR	4	[{"tyreUse": 14, "blocking": 11, "raceStart": 4, "overtaking": 9, "qualifying": 7, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 2000}, {"tyreUse": 18, "blocking": 15, "raceStart": 7, "overtaking": 13, "qualifying": 10, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 8000}, {"tyreUse": 21, "blocking": 18, "raceStart": 10, "overtaking": 16, "qualifying": 13, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 35000}, {"tyreUse": 25, "blocking": 22, "raceStart": 12, "overtaking": 19, "qualifying": 16, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 90000}, {"tyreUse": 29, "blocking": 26, "raceStart": 14, "overtaking": 22, "qualifying": 18, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 275000}, {"tyreUse": 33, "blocking": 29, "raceStart": 17, "overtaking": 25, "qualifying": 21, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 800000}, {"tyreUse": 37, "blocking": 32, "raceStart": 19, "overtaking": 28, "qualifying": 24, "cardsToUpgrade": 400, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 1600000}, {"tyreUse": 41, "blocking": 36, "raceStart": 22, "overtaking": 31, "qualifying": 27, "cardsToUpgrade": 1000, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 2400000}, {"tyreUse": 45, "blocking": 40, "raceStart": 25, "overtaking": 35, "qualifying": 30, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.516+00	2026-02-12 03:27:02.516+00
a491f88c-3a6d-4fd4-b015-89c2c7a70c1d	Franco Colapinto	5	9	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Driver_25_Colapinto	10	10	fa44edf3-f712-4e32-a94b-46f0187757c2	HotProspects_Alt	SERVLOC_TXT_HOT_PROSPECT_COLLECTION_SUBTITLE_1	2	COL	2	[{"tyreUse": 46, "blocking": 56, "raceStart": 61, "overtaking": 51, "qualifying": 41, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 3500, "softCurrencyToUpgrade": 19000000}, {"tyreUse": 48, "blocking": 58, "raceStart": 63, "overtaking": 53, "qualifying": 43, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 5500, "softCurrencyToUpgrade": 45000000}, {"tyreUse": 51, "blocking": 61, "raceStart": 66, "overtaking": 56, "qualifying": 46, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 8500, "softCurrencyToUpgrade": 105000000}, {"tyreUse": 55, "blocking": 65, "raceStart": 70, "overtaking": 60, "qualifying": 50, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 12000, "softCurrencyToUpgrade": 199000000}, {"tyreUse": 60, "blocking": 70, "raceStart": 75, "overtaking": 65, "qualifying": 55, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 15000, "softCurrencyToUpgrade": 239000000}, {"tyreUse": 66, "blocking": 76, "raceStart": 81, "overtaking": 71, "qualifying": 61, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 20000, "softCurrencyToUpgrade": 278000000}, {"tyreUse": 72, "blocking": 82, "raceStart": 87, "overtaking": 77, "qualifying": 67, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.522+00	2026-02-12 03:27:02.522+00
a57e4b1e-5be9-4287-8d82-4b6a5cb9f36a	Esteban Ocon	2	7	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Driver_25_Ocon	205	5	\N	\N	\N	\N	OCO	8	[{"tyreUse": 41, "blocking": 21, "raceStart": 36, "overtaking": 26, "qualifying": 31, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 1950000}, {"tyreUse": 44, "blocking": 24, "raceStart": 39, "overtaking": 29, "qualifying": 34, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 3850000}, {"tyreUse": 47, "blocking": 27, "raceStart": 42, "overtaking": 32, "qualifying": 37, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 5800000}, {"tyreUse": 50, "blocking": 30, "raceStart": 45, "overtaking": 35, "qualifying": 40, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 7700000}, {"tyreUse": 53, "blocking": 33, "raceStart": 48, "overtaking": 38, "qualifying": 43, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 15750000}, {"tyreUse": 57, "blocking": 37, "raceStart": 52, "overtaking": 42, "qualifying": 47, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 28000000}, {"tyreUse": 60, "blocking": 40, "raceStart": 55, "overtaking": 45, "qualifying": 50, "cardsToUpgrade": 400, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 51750000}, {"tyreUse": 63, "blocking": 43, "raceStart": 58, "overtaking": 48, "qualifying": 53, "cardsToUpgrade": 1000, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 75500000}, {"tyreUse": 67, "blocking": 47, "raceStart": 62, "overtaking": 52, "qualifying": 57, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.528+00	2026-02-12 03:27:02.528+00
a58db390-3e7a-41d7-b87e-c47813c1f4b5	Isack Hadjar	3	2	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Driver_25_Hadjar	100	2	\N	\N	\N	\N	HAD	1	[{"tyreUse": 15, "blocking": 15, "raceStart": 20, "overtaking": 30, "qualifying": 10, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 6000}, {"tyreUse": 19, "blocking": 19, "raceStart": 24, "overtaking": 34, "qualifying": 14, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 30000}, {"tyreUse": 21, "blocking": 21, "raceStart": 27, "overtaking": 36, "qualifying": 17, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 95000}, {"tyreUse": 25, "blocking": 25, "raceStart": 30, "overtaking": 40, "qualifying": 20, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 300000}, {"tyreUse": 29, "blocking": 29, "raceStart": 34, "overtaking": 44, "qualifying": 24, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 950000}, {"tyreUse": 33, "blocking": 33, "raceStart": 38, "overtaking": 48, "qualifying": 28, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 1900000}, {"tyreUse": 37, "blocking": 37, "raceStart": 42, "overtaking": 52, "qualifying": 32, "cardsToUpgrade": 400, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 3750000}, {"tyreUse": 41, "blocking": 41, "raceStart": 46, "overtaking": 56, "qualifying": 36, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.533+00	2026-02-12 03:27:02.533+00
a6c35329-4cbf-41c6-94aa-ae0fcfcdec7d	Alex Albon	3	10	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Driver_25_Albon	420	2	\N	\N	\N	\N	ALB	9	[{"tyreUse": 63, "blocking": 53, "raceStart": 43, "overtaking": 58, "qualifying": 48, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 22000000}, {"tyreUse": 67, "blocking": 57, "raceStart": 47, "overtaking": 62, "qualifying": 52, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 43000000}, {"tyreUse": 70, "blocking": 60, "raceStart": 50, "overtaking": 65, "qualifying": 55, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 65000000}, {"tyreUse": 73, "blocking": 63, "raceStart": 53, "overtaking": 68, "qualifying": 58, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 150000000}, {"tyreUse": 77, "blocking": 67, "raceStart": 57, "overtaking": 72, "qualifying": 62, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 284000000}, {"tyreUse": 81, "blocking": 71, "raceStart": 61, "overtaking": 76, "qualifying": 66, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 341000000}, {"tyreUse": 85, "blocking": 75, "raceStart": 65, "overtaking": 80, "qualifying": 70, "cardsToUpgrade": 400, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 398000000}, {"tyreUse": 89, "blocking": 79, "raceStart": 69, "overtaking": 84, "qualifying": 74, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.539+00	2026-02-12 03:27:02.539+00
a6ed8cc0-ca65-402e-80ae-a43855b48c21	Jack Doohan	5	9	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Driver_25_Doohan	10	10	fa44edf3-f712-4e32-a94b-46f0187757c2	HotProspects_Alt	SERVLOC_TXT_HOT_PROSPECT_COLLECTION_SUBTITLE_1	2	DOO	1	[{"tyreUse": 56, "blocking": 41, "raceStart": 51, "overtaking": 61, "qualifying": 46, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 3500, "softCurrencyToUpgrade": 19000000}, {"tyreUse": 58, "blocking": 43, "raceStart": 53, "overtaking": 63, "qualifying": 48, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 5500, "softCurrencyToUpgrade": 45000000}, {"tyreUse": 61, "blocking": 46, "raceStart": 56, "overtaking": 66, "qualifying": 51, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 8500, "softCurrencyToUpgrade": 105000000}, {"tyreUse": 65, "blocking": 50, "raceStart": 60, "overtaking": 70, "qualifying": 55, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 12000, "softCurrencyToUpgrade": 199000000}, {"tyreUse": 70, "blocking": 55, "raceStart": 65, "overtaking": 75, "qualifying": 60, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 15000, "softCurrencyToUpgrade": 239000000}, {"tyreUse": 76, "blocking": 61, "raceStart": 71, "overtaking": 81, "qualifying": 66, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 20000, "softCurrencyToUpgrade": 278000000}, {"tyreUse": 82, "blocking": 67, "raceStart": 77, "overtaking": 87, "qualifying": 72, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.547+00	2026-02-12 03:27:02.547+00
a9d0f78c-2ad8-4ca8-9972-989bc6ad2210	Jack Doohan	2	6	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Driver_25_Doohan	180	5	\N	\N	\N	\N	DOO	2	[{"tyreUse": 32, "blocking": 37, "raceStart": 22, "overtaking": 17, "qualifying": 27, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 790000}, {"tyreUse": 35, "blocking": 40, "raceStart": 25, "overtaking": 20, "qualifying": 30, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 1600000}, {"tyreUse": 38, "blocking": 43, "raceStart": 28, "overtaking": 23, "qualifying": 33, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 2400000}, {"tyreUse": 42, "blocking": 47, "raceStart": 32, "overtaking": 27, "qualifying": 37, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 3200000}, {"tyreUse": 45, "blocking": 50, "raceStart": 35, "overtaking": 30, "qualifying": 40, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 6800000}, {"tyreUse": 48, "blocking": 53, "raceStart": 38, "overtaking": 33, "qualifying": 43, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 19500000}, {"tyreUse": 52, "blocking": 57, "raceStart": 42, "overtaking": 37, "qualifying": 47, "cardsToUpgrade": 400, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 36250000}, {"tyreUse": 55, "blocking": 60, "raceStart": 45, "overtaking": 40, "qualifying": 50, "cardsToUpgrade": 1000, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 53000000}, {"tyreUse": 58, "blocking": 63, "raceStart": 48, "overtaking": 43, "qualifying": 53, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.553+00	2026-02-12 03:27:02.553+00
ad52d46b-59ba-451f-a0e3-97d2a22db53c	Pierre Gasly	1	4	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Driver_25_Gasly	70	10	\N	\N	\N	\N	GAS	12	[{"tyreUse": 28, "blocking": 8, "raceStart": 18, "overtaking": 13, "qualifying": 23, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 64000}, {"tyreUse": 30, "blocking": 10, "raceStart": 20, "overtaking": 15, "qualifying": 25, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 130000}, {"tyreUse": 33, "blocking": 13, "raceStart": 23, "overtaking": 18, "qualifying": 28, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 190000}, {"tyreUse": 36, "blocking": 16, "raceStart": 26, "overtaking": 21, "qualifying": 31, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 1550000}, {"tyreUse": 38, "blocking": 18, "raceStart": 28, "overtaking": 23, "qualifying": 33, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 3300000}, {"tyreUse": 41, "blocking": 21, "raceStart": 31, "overtaking": 26, "qualifying": 36, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 6500000}, {"tyreUse": 44, "blocking": 24, "raceStart": 34, "overtaking": 29, "qualifying": 39, "cardsToUpgrade": 400, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 11250000}, {"tyreUse": 46, "blocking": 26, "raceStart": 36, "overtaking": 31, "qualifying": 41, "cardsToUpgrade": 1000, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 16000000}, {"tyreUse": 49, "blocking": 29, "raceStart": 39, "overtaking": 34, "qualifying": 44, "cardsToUpgrade": 2000, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 20750000}, {"tyreUse": 52, "blocking": 32, "raceStart": 42, "overtaking": 37, "qualifying": 47, "cardsToUpgrade": 4000, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 25500000}, {"tyreUse": 55, "blocking": 35, "raceStart": 45, "overtaking": 40, "qualifying": 50, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.56+00	2026-02-12 03:27:02.56+00
b65ac0d4-36fc-4114-8310-4608748d6d01	Niki Lauda	4	12	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Driver_24_Lauda	10	10	\N	\N	\N	3	LAU	16	[{"tyreUse": 64, "blocking": 55, "raceStart": 61, "overtaking": 58, "qualifying": 55, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 10000, "softCurrencyToUpgrade": 30000000}, {"tyreUse": 70, "blocking": 61, "raceStart": 67, "overtaking": 64, "qualifying": 60, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 20000, "softCurrencyToUpgrade": 60000000}, {"tyreUse": 76, "blocking": 67, "raceStart": 73, "overtaking": 70, "qualifying": 66, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 30000, "softCurrencyToUpgrade": 90000000}, {"tyreUse": 82, "blocking": 73, "raceStart": 79, "overtaking": 76, "qualifying": 71, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 40000, "softCurrencyToUpgrade": 110000000}, {"tyreUse": 88, "blocking": 79, "raceStart": 85, "overtaking": 82, "qualifying": 77, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 55000, "softCurrencyToUpgrade": 150000000}, {"tyreUse": 94, "blocking": 85, "raceStart": 91, "overtaking": 88, "qualifying": 82, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 75000, "softCurrencyToUpgrade": 170000000}, {"tyreUse": 99, "blocking": 90, "raceStart": 96, "overtaking": 93, "qualifying": 87, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.567+00	2026-02-12 03:27:02.567+00
b7297703-e525-43f4-8a11-946fb9f6d5ae	Andrea Kimi Antonelli	3	1	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Driver_25_Antonelli	60	2	\N	\N	\N	\N	ANT	5	[{"tyreUse": 8, "blocking": 3, "raceStart": 18, "overtaking": 13, "qualifying": 23, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 2000}, {"tyreUse": 12, "blocking": 7, "raceStart": 22, "overtaking": 17, "qualifying": 27, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 8000}, {"tyreUse": 15, "blocking": 10, "raceStart": 25, "overtaking": 20, "qualifying": 30, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 35000}, {"tyreUse": 18, "blocking": 13, "raceStart": 28, "overtaking": 23, "qualifying": 33, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 90000}, {"tyreUse": 22, "blocking": 17, "raceStart": 32, "overtaking": 27, "qualifying": 37, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 275000}, {"tyreUse": 26, "blocking": 21, "raceStart": 36, "overtaking": 31, "qualifying": 41, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 800000}, {"tyreUse": 30, "blocking": 25, "raceStart": 40, "overtaking": 35, "qualifying": 45, "cardsToUpgrade": 400, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 1600000}, {"tyreUse": 34, "blocking": 29, "raceStart": 44, "overtaking": 39, "qualifying": 49, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.573+00	2026-02-12 03:27:02.573+00
b7983a9c-9e84-45c3-a4e5-8d4c0e5933d8	Jack Doohan	5	12	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_SpecialDriver_25_Doohan	10	10	fa44edf3-f712-4e32-a94b-46f0187757c2	\N	SERVLOC_TXT_HOT_PROSPECT_COLLECTION_SUBTITLE_2	3	DOO	8	[{"tyreUse": 71, "blocking": 56, "raceStart": 66, "overtaking": 76, "qualifying": 61, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 10000, "softCurrencyToUpgrade": 232000000}, {"tyreUse": 74, "blocking": 59, "raceStart": 69, "overtaking": 79, "qualifying": 64, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 20000, "softCurrencyToUpgrade": 348000000}, {"tyreUse": 77, "blocking": 62, "raceStart": 72, "overtaking": 82, "qualifying": 67, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 30000, "softCurrencyToUpgrade": 464000000}, {"tyreUse": 81, "blocking": 65, "raceStart": 76, "overtaking": 86, "qualifying": 71, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 40000, "softCurrencyToUpgrade": 580000000}, {"tyreUse": 86, "blocking": 68, "raceStart": 81, "overtaking": 91, "qualifying": 75, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 55000, "softCurrencyToUpgrade": 696000000}, {"tyreUse": 92, "blocking": 72, "raceStart": 87, "overtaking": 97, "qualifying": 80, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 75000, "softCurrencyToUpgrade": 812000000}, {"tyreUse": 99, "blocking": 76, "raceStart": 94, "overtaking": 105, "qualifying": 86, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.58+00	2026-02-12 03:27:02.58+00
b8d12405-5a88-40e6-a535-8c5182d06cae	David Coulthard	4	6	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Driver_23_Coulthard	10	10	\N	\N	\N	1	COU	5	[{"tyreUse": 43, "blocking": 31, "raceStart": 37, "overtaking": 19, "qualifying": 25, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 2000, "softCurrencyToUpgrade": 250000}, {"tyreUse": 49, "blocking": 37, "raceStart": 43, "overtaking": 25, "qualifying": 31, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 3000, "softCurrencyToUpgrade": 500000}, {"tyreUse": 55, "blocking": 43, "raceStart": 49, "overtaking": 31, "qualifying": 37, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 4500, "softCurrencyToUpgrade": 700000}, {"tyreUse": 61, "blocking": 49, "raceStart": 55, "overtaking": 37, "qualifying": 43, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 6000, "softCurrencyToUpgrade": 1000000}, {"tyreUse": 67, "blocking": 55, "raceStart": 61, "overtaking": 43, "qualifying": 49, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 8000, "softCurrencyToUpgrade": 1800000}, {"tyreUse": 73, "blocking": 61, "raceStart": 67, "overtaking": 49, "qualifying": 55, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 10000, "softCurrencyToUpgrade": 5500000}, {"tyreUse": 79, "blocking": 67, "raceStart": 73, "overtaking": 55, "qualifying": 61, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.587+00	2026-02-12 03:27:02.587+00
b9b519ff-96ec-4cae-9a99-2d716947bf6d	Jenson Button	4	6	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Driver_24_Button	10	10	\N	\N	\N	1	BUT	9	[{"tyreUse": 43, "blocking": 31, "raceStart": 19, "overtaking": 25, "qualifying": 37, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 2000, "softCurrencyToUpgrade": 250000}, {"tyreUse": 49, "blocking": 37, "raceStart": 25, "overtaking": 31, "qualifying": 43, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 3000, "softCurrencyToUpgrade": 500000}, {"tyreUse": 55, "blocking": 43, "raceStart": 31, "overtaking": 37, "qualifying": 49, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 4500, "softCurrencyToUpgrade": 700000}, {"tyreUse": 61, "blocking": 49, "raceStart": 37, "overtaking": 43, "qualifying": 55, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 6000, "softCurrencyToUpgrade": 1000000}, {"tyreUse": 67, "blocking": 55, "raceStart": 43, "overtaking": 49, "qualifying": 61, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 8000, "softCurrencyToUpgrade": 1800000}, {"tyreUse": 73, "blocking": 61, "raceStart": 49, "overtaking": 55, "qualifying": 67, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 10000, "softCurrencyToUpgrade": 5500000}, {"tyreUse": 79, "blocking": 67, "raceStart": 55, "overtaking": 61, "qualifying": 73, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.594+00	2026-02-12 03:27:02.594+00
bb4ddf42-108c-4f71-bd08-12f24a9a4b4c	Oliver Bearman	2	3	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Driver_25_Bearman	105	5	\N	\N	\N	\N	BEA	3	[{"tyreUse": 18, "blocking": 8, "raceStart": 23, "overtaking": 28, "qualifying": 13, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 22000}, {"tyreUse": 22, "blocking": 12, "raceStart": 27, "overtaking": 32, "qualifying": 17, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 45000}, {"tyreUse": 25, "blocking": 15, "raceStart": 30, "overtaking": 35, "qualifying": 20, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 135000}, {"tyreUse": 28, "blocking": 18, "raceStart": 33, "overtaking": 38, "qualifying": 23, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 450000}, {"tyreUse": 32, "blocking": 22, "raceStart": 37, "overtaking": 42, "qualifying": 27, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 1350000}, {"tyreUse": 35, "blocking": 25, "raceStart": 40, "overtaking": 45, "qualifying": 30, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 2800000}, {"tyreUse": 38, "blocking": 28, "raceStart": 43, "overtaking": 48, "qualifying": 33, "cardsToUpgrade": 400, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 5250000}, {"tyreUse": 41, "blocking": 31, "raceStart": 46, "overtaking": 51, "qualifying": 36, "cardsToUpgrade": 1000, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 7700000}, {"tyreUse": 45, "blocking": 35, "raceStart": 50, "overtaking": 55, "qualifying": 40, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.6+00	2026-02-12 03:27:02.6+00
bcc7e2c5-7a8f-4224-b5dc-514d23fbc875	Andrea Kimi Antonelli	1	2	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Driver_25_Antonelli	40	10	\N	\N	\N	\N	ANT	5	[{"tyreUse": 5, "blocking": 1, "raceStart": 9, "overtaking": 13, "qualifying": 17, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 6000}, {"tyreUse": 7, "blocking": 3, "raceStart": 12, "overtaking": 16, "qualifying": 20, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 30000}, {"tyreUse": 10, "blocking": 6, "raceStart": 14, "overtaking": 18, "qualifying": 23, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 95000}, {"tyreUse": 13, "blocking": 8, "raceStart": 17, "overtaking": 21, "qualifying": 26, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 300000}, {"tyreUse": 15, "blocking": 11, "raceStart": 20, "overtaking": 24, "qualifying": 28, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 950000}, {"tyreUse": 18, "blocking": 13, "raceStart": 22, "overtaking": 27, "qualifying": 31, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 1900000}, {"tyreUse": 20, "blocking": 16, "raceStart": 25, "overtaking": 30, "qualifying": 34, "cardsToUpgrade": 400, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 3750000}, {"tyreUse": 23, "blocking": 18, "raceStart": 28, "overtaking": 32, "qualifying": 37, "cardsToUpgrade": 1000, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 5600000}, {"tyreUse": 25, "blocking": 21, "raceStart": 30, "overtaking": 35, "qualifying": 40, "cardsToUpgrade": 2000, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 7450000}, {"tyreUse": 28, "blocking": 23, "raceStart": 33, "overtaking": 38, "qualifying": 43, "cardsToUpgrade": 4000, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 9300000}, {"tyreUse": 31, "blocking": 26, "raceStart": 36, "overtaking": 41, "qualifying": 46, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.606+00	2026-02-12 03:27:02.606+00
c1d92459-21f4-4936-8412-e3981b001e61	Nico Hulkenberg	2	7	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Driver_25_Hulkenberg	205	5	\N	\N	\N	\N	HUL	11	[{"tyreUse": 36, "blocking": 21, "raceStart": 26, "overtaking": 31, "qualifying": 41, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 1950000}, {"tyreUse": 39, "blocking": 24, "raceStart": 29, "overtaking": 34, "qualifying": 44, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 3850000}, {"tyreUse": 42, "blocking": 27, "raceStart": 32, "overtaking": 37, "qualifying": 47, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 5800000}, {"tyreUse": 45, "blocking": 30, "raceStart": 35, "overtaking": 40, "qualifying": 50, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 7700000}, {"tyreUse": 48, "blocking": 33, "raceStart": 38, "overtaking": 43, "qualifying": 53, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 15750000}, {"tyreUse": 52, "blocking": 37, "raceStart": 42, "overtaking": 47, "qualifying": 57, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 28000000}, {"tyreUse": 55, "blocking": 40, "raceStart": 45, "overtaking": 50, "qualifying": 60, "cardsToUpgrade": 400, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 51750000}, {"tyreUse": 58, "blocking": 43, "raceStart": 48, "overtaking": 53, "qualifying": 63, "cardsToUpgrade": 1000, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 75500000}, {"tyreUse": 62, "blocking": 47, "raceStart": 52, "overtaking": 57, "qualifying": 67, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.614+00	2026-02-12 03:27:02.614+00
c27c893f-3b15-46c2-8918-4f2bdc248f28	Isack Hadjar	5	9	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Driver_25_Hadjar	10	10	fa44edf3-f712-4e32-a94b-46f0187757c2	HotProspects_Alt	SERVLOC_TXT_HOT_PROSPECT_COLLECTION_SUBTITLE_1	2	HAD	6	[{"tyreUse": 42, "blocking": 52, "raceStart": 57, "overtaking": 62, "qualifying": 47, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 3500, "softCurrencyToUpgrade": 19000000}, {"tyreUse": 44, "blocking": 54, "raceStart": 59, "overtaking": 64, "qualifying": 49, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 5500, "softCurrencyToUpgrade": 45000000}, {"tyreUse": 47, "blocking": 57, "raceStart": 62, "overtaking": 67, "qualifying": 52, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 8500, "softCurrencyToUpgrade": 105000000}, {"tyreUse": 51, "blocking": 61, "raceStart": 66, "overtaking": 71, "qualifying": 56, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 12000, "softCurrencyToUpgrade": 199000000}, {"tyreUse": 56, "blocking": 66, "raceStart": 71, "overtaking": 76, "qualifying": 61, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 15000, "softCurrencyToUpgrade": 239000000}, {"tyreUse": 62, "blocking": 72, "raceStart": 77, "overtaking": 82, "qualifying": 67, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 20000, "softCurrencyToUpgrade": 278000000}, {"tyreUse": 68, "blocking": 78, "raceStart": 83, "overtaking": 88, "qualifying": 73, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.621+00	2026-02-12 03:27:02.621+00
c2e5162f-9c89-493c-aa5d-a346cf23ca5d	Gabriel Bortoleto	1	2	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Driver_25_Bortoleto	40	10	\N	\N	\N	\N	BOR	4	[{"tyreUse": 17, "blocking": 13, "raceStart": 1, "overtaking": 9, "qualifying": 5, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 6000}, {"tyreUse": 20, "blocking": 16, "raceStart": 3, "overtaking": 12, "qualifying": 7, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 30000}, {"tyreUse": 23, "blocking": 18, "raceStart": 6, "overtaking": 14, "qualifying": 10, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 95000}, {"tyreUse": 26, "blocking": 21, "raceStart": 8, "overtaking": 17, "qualifying": 13, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 300000}, {"tyreUse": 28, "blocking": 24, "raceStart": 11, "overtaking": 20, "qualifying": 15, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 950000}, {"tyreUse": 31, "blocking": 27, "raceStart": 13, "overtaking": 22, "qualifying": 18, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 1900000}, {"tyreUse": 34, "blocking": 30, "raceStart": 16, "overtaking": 25, "qualifying": 20, "cardsToUpgrade": 400, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 3750000}, {"tyreUse": 37, "blocking": 32, "raceStart": 18, "overtaking": 28, "qualifying": 23, "cardsToUpgrade": 1000, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 5600000}, {"tyreUse": 40, "blocking": 35, "raceStart": 21, "overtaking": 30, "qualifying": 25, "cardsToUpgrade": 2000, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 7450000}, {"tyreUse": 43, "blocking": 38, "raceStart": 23, "overtaking": 33, "qualifying": 28, "cardsToUpgrade": 4000, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 9300000}, {"tyreUse": 46, "blocking": 41, "raceStart": 26, "overtaking": 36, "qualifying": 31, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.626+00	2026-02-12 03:27:02.626+00
c55dea3c-d77f-4fb1-8cbb-310ec142363a	Jackie Stewart	4	12	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Driver_23_Stewart	10	10	\N	\N	\N	3	STE	17	[{"tyreUse": 55, "blocking": 64, "raceStart": 61, "overtaking": 58, "qualifying": 55, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 10000, "softCurrencyToUpgrade": 30000000}, {"tyreUse": 60, "blocking": 70, "raceStart": 67, "overtaking": 64, "qualifying": 61, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 20000, "softCurrencyToUpgrade": 60000000}, {"tyreUse": 66, "blocking": 76, "raceStart": 73, "overtaking": 70, "qualifying": 67, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 30000, "softCurrencyToUpgrade": 90000000}, {"tyreUse": 71, "blocking": 82, "raceStart": 79, "overtaking": 76, "qualifying": 73, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 40000, "softCurrencyToUpgrade": 110000000}, {"tyreUse": 77, "blocking": 88, "raceStart": 85, "overtaking": 82, "qualifying": 79, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 55000, "softCurrencyToUpgrade": 150000000}, {"tyreUse": 82, "blocking": 94, "raceStart": 91, "overtaking": 88, "qualifying": 85, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 75000, "softCurrencyToUpgrade": 170000000}, {"tyreUse": 87, "blocking": 99, "raceStart": 96, "overtaking": 93, "qualifying": 90, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.646+00	2026-02-12 03:27:02.646+00
c59159e4-5fa8-44da-a623-e171960dabf0	George Russell	3	12	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Driver_25_Russell	500	2	\N	\N	\N	\N	RUS	17	[{"tyreUse": 62, "blocking": 52, "raceStart": 57, "overtaking": 67, "qualifying": 72, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 116000000}, {"tyreUse": 66, "blocking": 56, "raceStart": 61, "overtaking": 71, "qualifying": 76, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 232000000}, {"tyreUse": 70, "blocking": 60, "raceStart": 65, "overtaking": 75, "qualifying": 80, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 348000000}, {"tyreUse": 74, "blocking": 64, "raceStart": 69, "overtaking": 79, "qualifying": 84, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 464000000}, {"tyreUse": 78, "blocking": 68, "raceStart": 73, "overtaking": 83, "qualifying": 88, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 580000000}, {"tyreUse": 81, "blocking": 71, "raceStart": 76, "overtaking": 86, "qualifying": 91, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 696000000}, {"tyreUse": 85, "blocking": 75, "raceStart": 80, "overtaking": 90, "qualifying": 95, "cardsToUpgrade": 400, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 812000000}, {"tyreUse": 89, "blocking": 79, "raceStart": 84, "overtaking": 94, "qualifying": 99, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.652+00	2026-02-12 03:27:02.652+00
c624a2cf-7cf9-442b-8ef8-40a347ff229a	George Russell	2	9	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Driver_25_Russell	255	5	\N	\N	\N	\N	RUS	17	[{"tyreUse": 40, "blocking": 30, "raceStart": 35, "overtaking": 45, "qualifying": 50, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 9500000}, {"tyreUse": 43, "blocking": 33, "raceStart": 38, "overtaking": 48, "qualifying": 53, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 19000000}, {"tyreUse": 47, "blocking": 37, "raceStart": 42, "overtaking": 52, "qualifying": 57, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 45000000}, {"tyreUse": 50, "blocking": 40, "raceStart": 45, "overtaking": 55, "qualifying": 60, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 105000000}, {"tyreUse": 53, "blocking": 43, "raceStart": 48, "overtaking": 58, "qualifying": 63, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 199000000}, {"tyreUse": 57, "blocking": 47, "raceStart": 52, "overtaking": 62, "qualifying": 67, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 239000000}, {"tyreUse": 60, "blocking": 50, "raceStart": 55, "overtaking": 65, "qualifying": 70, "cardsToUpgrade": 400, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 278000000}, {"tyreUse": 63, "blocking": 53, "raceStart": 58, "overtaking": 68, "qualifying": 73, "cardsToUpgrade": 1000, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 317000000}, {"tyreUse": 67, "blocking": 57, "raceStart": 62, "overtaking": 72, "qualifying": 77, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.657+00	2026-02-12 03:27:02.657+00
c69f43ed-007b-4e13-a9e1-9cff3fa5405f	Emerson Fittipaldi	4	9	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Driver_23_Fittipaldi	10	10	\N	\N	\N	2	FIT	13	[{"tyreUse": 33, "blocking": 51, "raceStart": 45, "overtaking": 57, "qualifying": 39, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 5000, "softCurrencyToUpgrade": 1000000}, {"tyreUse": 38, "blocking": 56, "raceStart": 50, "overtaking": 62, "qualifying": 44, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 8000, "softCurrencyToUpgrade": 2300000}, {"tyreUse": 44, "blocking": 62, "raceStart": 56, "overtaking": 68, "qualifying": 50, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 12000, "softCurrencyToUpgrade": 5000000}, {"tyreUse": 50, "blocking": 68, "raceStart": 62, "overtaking": 74, "qualifying": 56, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 17000, "softCurrencyToUpgrade": 10000000}, {"tyreUse": 56, "blocking": 74, "raceStart": 68, "overtaking": 80, "qualifying": 62, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 23000, "softCurrencyToUpgrade": 32000000}, {"tyreUse": 62, "blocking": 80, "raceStart": 74, "overtaking": 86, "qualifying": 68, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 30000, "softCurrencyToUpgrade": 43000000}, {"tyreUse": 68, "blocking": 86, "raceStart": 80, "overtaking": 92, "qualifying": 74, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.664+00	2026-02-12 03:27:02.664+00
c859623e-080a-4a88-8b24-82a211f3efa3	Alain Prost	5	12	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Driver_23_Prost	10	10	f187e5a1-bcaf-4aa4-af07-70d220cd0cb2	\N	\N	3	PRO	27	[{"tyreUse": 81, "blocking": 84, "raceStart": 95, "overtaking": 83, "qualifying": 95, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 100000, "softCurrencyToUpgrade": 1000000000}, {"tyreUse": 87, "blocking": 90, "raceStart": 100, "overtaking": 89, "qualifying": 100, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 200000, "softCurrencyToUpgrade": 1800000000}, {"tyreUse": 93, "blocking": 95, "raceStart": 105, "overtaking": 96, "qualifying": 105, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 300000, "softCurrencyToUpgrade": 2600000000}, {"tyreUse": 99, "blocking": 101, "raceStart": 111, "overtaking": 102, "qualifying": 111, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 450000, "softCurrencyToUpgrade": 3500000000}, {"tyreUse": 104, "blocking": 107, "raceStart": 116, "overtaking": 108, "qualifying": 116, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 600000, "softCurrencyToUpgrade": 7000000000}, {"tyreUse": 110, "blocking": 112, "raceStart": 121, "overtaking": 115, "qualifying": 121, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 750000, "softCurrencyToUpgrade": 14000000000}, {"tyreUse": 116, "blocking": 118, "raceStart": 126, "overtaking": 121, "qualifying": 126, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.67+00	2026-02-12 03:27:02.67+00
c98e3c8b-a160-4810-bf54-ad5b7a59ba2b	Gabriel Bortoleto	5	9	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Driver_25_Bortoleto	10	10	fa44edf3-f712-4e32-a94b-46f0187757c2	HotProspects_Alt	SERVLOC_TXT_HOT_PROSPECT_COLLECTION_SUBTITLE_1	2	BOR	3	[{"tyreUse": 61, "blocking": 56, "raceStart": 41, "overtaking": 51, "qualifying": 46, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 3500, "softCurrencyToUpgrade": 19000000}, {"tyreUse": 63, "blocking": 58, "raceStart": 43, "overtaking": 53, "qualifying": 48, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 5500, "softCurrencyToUpgrade": 45000000}, {"tyreUse": 66, "blocking": 61, "raceStart": 46, "overtaking": 56, "qualifying": 51, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 8500, "softCurrencyToUpgrade": 105000000}, {"tyreUse": 70, "blocking": 65, "raceStart": 50, "overtaking": 60, "qualifying": 55, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 12000, "softCurrencyToUpgrade": 199000000}, {"tyreUse": 75, "blocking": 70, "raceStart": 55, "overtaking": 65, "qualifying": 60, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 15000, "softCurrencyToUpgrade": 239000000}, {"tyreUse": 81, "blocking": 76, "raceStart": 61, "overtaking": 71, "qualifying": 66, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 20000, "softCurrencyToUpgrade": 278000000}, {"tyreUse": 87, "blocking": 82, "raceStart": 67, "overtaking": 77, "qualifying": 72, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.677+00	2026-02-12 03:27:02.677+00
c9c6f1b0-4516-44c9-af5d-e7b6158d177a	Jackie Stewart	5	12	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Driver_23_Stewart	10	10	f187e5a1-bcaf-4aa4-af07-70d220cd0cb2	\N	\N	3	STE	26	[{"tyreUse": 94, "blocking": 94, "raceStart": 83, "overtaking": 80, "qualifying": 84, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 100000, "softCurrencyToUpgrade": 1000000000}, {"tyreUse": 99, "blocking": 99, "raceStart": 89, "overtaking": 86, "qualifying": 90, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 200000, "softCurrencyToUpgrade": 1800000000}, {"tyreUse": 104, "blocking": 104, "raceStart": 94, "overtaking": 91, "qualifying": 96, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 300000, "softCurrencyToUpgrade": 2600000000}, {"tyreUse": 109, "blocking": 109, "raceStart": 100, "overtaking": 97, "qualifying": 103, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 450000, "softCurrencyToUpgrade": 3500000000}, {"tyreUse": 114, "blocking": 114, "raceStart": 106, "overtaking": 103, "qualifying": 109, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 600000, "softCurrencyToUpgrade": 7000000000}, {"tyreUse": 119, "blocking": 119, "raceStart": 111, "overtaking": 108, "qualifying": 115, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 750000, "softCurrencyToUpgrade": 14000000000}, {"tyreUse": 124, "blocking": 124, "raceStart": 117, "overtaking": 114, "qualifying": 121, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.683+00	2026-02-12 03:27:02.683+00
cb778598-6bc0-4060-8353-7b744d70badf	Lando Norris	3	12	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Driver_25_Norris	500	2	\N	\N	\N	\N	NOR	19	[{"tyreUse": 72, "blocking": 67, "raceStart": 52, "overtaking": 57, "qualifying": 62, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 116000000}, {"tyreUse": 76, "blocking": 71, "raceStart": 56, "overtaking": 61, "qualifying": 66, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 232000000}, {"tyreUse": 80, "blocking": 75, "raceStart": 60, "overtaking": 65, "qualifying": 70, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 348000000}, {"tyreUse": 84, "blocking": 79, "raceStart": 64, "overtaking": 69, "qualifying": 74, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 464000000}, {"tyreUse": 88, "blocking": 83, "raceStart": 68, "overtaking": 73, "qualifying": 78, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 580000000}, {"tyreUse": 91, "blocking": 86, "raceStart": 71, "overtaking": 76, "qualifying": 81, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 696000000}, {"tyreUse": 95, "blocking": 90, "raceStart": 75, "overtaking": 80, "qualifying": 85, "cardsToUpgrade": 400, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 812000000}, {"tyreUse": 99, "blocking": 94, "raceStart": 79, "overtaking": 84, "qualifying": 89, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.689+00	2026-02-12 03:27:02.689+00
cb91b79d-fbec-4537-8d80-65c754c5e16e	Felipe Massa	4	3	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Driver_23_Massa	10	10	\N	\N	\N	\N	MAS	3	[{"tyreUse": 13, "blocking": 17, "raceStart": 5, "overtaking": 21, "qualifying": 9, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 1000, "softCurrencyToUpgrade": 2000}, {"tyreUse": 19, "blocking": 23, "raceStart": 11, "overtaking": 27, "qualifying": 15, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 1500, "softCurrencyToUpgrade": 7500}, {"tyreUse": 25, "blocking": 29, "raceStart": 17, "overtaking": 33, "qualifying": 21, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 2000, "softCurrencyToUpgrade": 25000}, {"tyreUse": 31, "blocking": 35, "raceStart": 23, "overtaking": 39, "qualifying": 27, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 3000, "softCurrencyToUpgrade": 75000}, {"tyreUse": 37, "blocking": 41, "raceStart": 29, "overtaking": 45, "qualifying": 33, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 4000, "softCurrencyToUpgrade": 250000}, {"tyreUse": 43, "blocking": 47, "raceStart": 35, "overtaking": 51, "qualifying": 39, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 5000, "softCurrencyToUpgrade": 500000}, {"tyreUse": 49, "blocking": 53, "raceStart": 41, "overtaking": 57, "qualifying": 45, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.695+00	2026-02-12 03:27:02.695+00
ce5aee09-a8a3-460c-8087-0cff9cdc796f	Alex Albon	2	7	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Driver_25_Albon	205	5	\N	\N	\N	\N	ALB	9	[{"tyreUse": 41, "blocking": 31, "raceStart": 21, "overtaking": 36, "qualifying": 26, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 1950000}, {"tyreUse": 44, "blocking": 34, "raceStart": 24, "overtaking": 39, "qualifying": 29, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 3850000}, {"tyreUse": 47, "blocking": 37, "raceStart": 27, "overtaking": 42, "qualifying": 32, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 5800000}, {"tyreUse": 50, "blocking": 40, "raceStart": 30, "overtaking": 45, "qualifying": 35, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 7700000}, {"tyreUse": 53, "blocking": 43, "raceStart": 33, "overtaking": 48, "qualifying": 38, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 15750000}, {"tyreUse": 57, "blocking": 47, "raceStart": 37, "overtaking": 52, "qualifying": 42, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 28000000}, {"tyreUse": 60, "blocking": 50, "raceStart": 40, "overtaking": 55, "qualifying": 45, "cardsToUpgrade": 400, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 51750000}, {"tyreUse": 63, "blocking": 53, "raceStart": 43, "overtaking": 58, "qualifying": 48, "cardsToUpgrade": 1000, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 75500000}, {"tyreUse": 67, "blocking": 57, "raceStart": 47, "overtaking": 62, "qualifying": 52, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.702+00	2026-02-12 03:27:02.702+00
ceffe3f4-415b-4410-96b7-0d70585605d0	Max Verstappen	5	12	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_SpecialDriver_PS25_Verstappen	10	10	1a4d9853-13e3-40ea-82d6-4891601e41b8	\N	\N	3	VER	22	[{"tyreUse": 86, "blocking": 78, "raceStart": 74, "overtaking": 70, "qualifying": 92, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 50000, "softCurrencyToUpgrade": 500000000}, {"tyreUse": 91, "blocking": 83, "raceStart": 79, "overtaking": 75, "qualifying": 96, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 100000, "softCurrencyToUpgrade": 900000000}, {"tyreUse": 95, "blocking": 88, "raceStart": 85, "overtaking": 80, "qualifying": 100, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 150000, "softCurrencyToUpgrade": 1300000000}, {"tyreUse": 100, "blocking": 94, "raceStart": 90, "overtaking": 85, "qualifying": 105, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 225000, "softCurrencyToUpgrade": 1800000000}, {"tyreUse": 105, "blocking": 99, "raceStart": 95, "overtaking": 89, "qualifying": 109, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 300000, "softCurrencyToUpgrade": 3150000000}, {"tyreUse": 109, "blocking": 104, "raceStart": 101, "overtaking": 94, "qualifying": 113, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 400000, "softCurrencyToUpgrade": 7000000000}, {"tyreUse": 114, "blocking": 109, "raceStart": 106, "overtaking": 99, "qualifying": 117, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.709+00	2026-02-12 03:27:02.709+00
d0a05032-c184-4289-982b-0c35ee5d5941	Michael Schumacher	5	12	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Driver_23_Schumacher	10	10	f187e5a1-bcaf-4aa4-af07-70d220cd0cb2	\N	\N	3	MSC	28	[{"tyreUse": 84, "blocking": 96, "raceStart": 85, "overtaking": 96, "qualifying": 80, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 100000, "softCurrencyToUpgrade": 1000000000}, {"tyreUse": 90, "blocking": 101, "raceStart": 91, "overtaking": 101, "qualifying": 86, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 200000, "softCurrencyToUpgrade": 1800000000}, {"tyreUse": 95, "blocking": 107, "raceStart": 97, "overtaking": 107, "qualifying": 92, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 300000, "softCurrencyToUpgrade": 2600000000}, {"tyreUse": 101, "blocking": 112, "raceStart": 104, "overtaking": 112, "qualifying": 98, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 450000, "softCurrencyToUpgrade": 3500000000}, {"tyreUse": 107, "blocking": 117, "raceStart": 110, "overtaking": 117, "qualifying": 104, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 600000, "softCurrencyToUpgrade": 7000000000}, {"tyreUse": 112, "blocking": 123, "raceStart": 116, "overtaking": 123, "qualifying": 110, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 750000, "softCurrencyToUpgrade": 14000000000}, {"tyreUse": 118, "blocking": 128, "raceStart": 122, "overtaking": 128, "qualifying": 116, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.721+00	2026-02-12 03:27:02.721+00
d572b7a5-a9e0-4a4e-953b-cb7bd97b0975	Esteban Ocon	3	10	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Driver_25_Ocon	420	2	\N	\N	\N	\N	OCO	8	[{"tyreUse": 63, "blocking": 43, "raceStart": 58, "overtaking": 48, "qualifying": 53, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 22000000}, {"tyreUse": 67, "blocking": 47, "raceStart": 62, "overtaking": 52, "qualifying": 57, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 43000000}, {"tyreUse": 70, "blocking": 50, "raceStart": 65, "overtaking": 55, "qualifying": 60, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 65000000}, {"tyreUse": 73, "blocking": 53, "raceStart": 68, "overtaking": 58, "qualifying": 63, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 150000000}, {"tyreUse": 77, "blocking": 57, "raceStart": 72, "overtaking": 62, "qualifying": 67, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 284000000}, {"tyreUse": 81, "blocking": 61, "raceStart": 76, "overtaking": 66, "qualifying": 71, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 341000000}, {"tyreUse": 85, "blocking": 65, "raceStart": 80, "overtaking": 70, "qualifying": 75, "cardsToUpgrade": 400, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 398000000}, {"tyreUse": 89, "blocking": 69, "raceStart": 84, "overtaking": 74, "qualifying": 79, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.733+00	2026-02-12 03:27:02.733+00
d63aca7f-0fd1-4315-be5e-9ef314e413bf	Alex Albon	1	3	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Driver_25_Albon	55	10	\N	\N	\N	\N	ALB	9	[{"tyreUse": 23, "blocking": 13, "raceStart": 3, "overtaking": 18, "qualifying": 8, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 22000}, {"tyreUse": 26, "blocking": 16, "raceStart": 6, "overtaking": 21, "qualifying": 11, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 45000}, {"tyreUse": 29, "blocking": 19, "raceStart": 9, "overtaking": 24, "qualifying": 14, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 135000}, {"tyreUse": 31, "blocking": 21, "raceStart": 11, "overtaking": 26, "qualifying": 16, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 450000}, {"tyreUse": 34, "blocking": 24, "raceStart": 14, "overtaking": 29, "qualifying": 19, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 1350000}, {"tyreUse": 37, "blocking": 27, "raceStart": 17, "overtaking": 32, "qualifying": 22, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 2800000}, {"tyreUse": 39, "blocking": 29, "raceStart": 19, "overtaking": 34, "qualifying": 24, "cardsToUpgrade": 400, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 5250000}, {"tyreUse": 42, "blocking": 32, "raceStart": 22, "overtaking": 37, "qualifying": 27, "cardsToUpgrade": 1000, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 7700000}, {"tyreUse": 45, "blocking": 35, "raceStart": 25, "overtaking": 40, "qualifying": 30, "cardsToUpgrade": 2000, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 10150000}, {"tyreUse": 47, "blocking": 37, "raceStart": 27, "overtaking": 42, "qualifying": 32, "cardsToUpgrade": 4000, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 12600000}, {"tyreUse": 50, "blocking": 40, "raceStart": 30, "overtaking": 45, "qualifying": 35, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.739+00	2026-02-12 03:27:02.739+00
da58684f-a197-499c-a97d-ba93104de565	Franco Colapinto	1	2	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Driver_25_Colapinto	40	10	\N	\N	\N	\N	COL	21	[{"tyreUse": 1, "blocking": 13, "raceStart": 17, "overtaking": 9, "qualifying": 5, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 6000}, {"tyreUse": 3, "blocking": 16, "raceStart": 20, "overtaking": 12, "qualifying": 7, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 30000}, {"tyreUse": 6, "blocking": 18, "raceStart": 23, "overtaking": 14, "qualifying": 10, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 95000}, {"tyreUse": 8, "blocking": 21, "raceStart": 26, "overtaking": 17, "qualifying": 13, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 300000}, {"tyreUse": 11, "blocking": 24, "raceStart": 28, "overtaking": 20, "qualifying": 15, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 950000}, {"tyreUse": 13, "blocking": 27, "raceStart": 31, "overtaking": 22, "qualifying": 18, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 1900000}, {"tyreUse": 16, "blocking": 30, "raceStart": 34, "overtaking": 25, "qualifying": 20, "cardsToUpgrade": 400, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 3750000}, {"tyreUse": 18, "blocking": 32, "raceStart": 37, "overtaking": 28, "qualifying": 23, "cardsToUpgrade": 1000, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 5600000}, {"tyreUse": 21, "blocking": 35, "raceStart": 40, "overtaking": 30, "qualifying": 25, "cardsToUpgrade": 2000, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 7450000}, {"tyreUse": 23, "blocking": 38, "raceStart": 43, "overtaking": 33, "qualifying": 28, "cardsToUpgrade": 4000, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 9300000}, {"tyreUse": 26, "blocking": 41, "raceStart": 46, "overtaking": 36, "qualifying": 31, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.745+00	2026-02-12 03:27:02.745+00
da9bd825-9c13-4a37-96c8-2c07ba291dd2	Giancarlo Fisichella	4	3	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Driver_25_Fisichella	10	10	\N	\N	\N	\N	FIS	1	[{"tyreUse": 13, "blocking": 5, "raceStart": 21, "overtaking": 9, "qualifying": 17, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 1000, "softCurrencyToUpgrade": 2000}, {"tyreUse": 19, "blocking": 11, "raceStart": 27, "overtaking": 15, "qualifying": 23, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 1500, "softCurrencyToUpgrade": 7500}, {"tyreUse": 25, "blocking": 17, "raceStart": 33, "overtaking": 21, "qualifying": 29, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 2000, "softCurrencyToUpgrade": 25000}, {"tyreUse": 31, "blocking": 23, "raceStart": 39, "overtaking": 27, "qualifying": 35, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 3000, "softCurrencyToUpgrade": 75000}, {"tyreUse": 37, "blocking": 29, "raceStart": 45, "overtaking": 33, "qualifying": 41, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 4000, "softCurrencyToUpgrade": 250000}, {"tyreUse": 43, "blocking": 35, "raceStart": 51, "overtaking": 39, "qualifying": 47, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 5000, "softCurrencyToUpgrade": 500000}, {"tyreUse": 49, "blocking": 41, "raceStart": 57, "overtaking": 45, "qualifying": 53, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.751+00	2026-02-12 03:27:02.751+00
dd2ef0a1-0790-4646-951e-6494a19f6f58	Liam Lawson	5	12	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_SpecialDriver_25_Lawson	10	10	fa44edf3-f712-4e32-a94b-46f0187757c2	\N	SERVLOC_TXT_HOT_PROSPECT_COLLECTION_SUBTITLE_2	3	LAW	11	[{"tyreUse": 77, "blocking": 62, "raceStart": 67, "overtaking": 72, "qualifying": 57, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 10000, "softCurrencyToUpgrade": 232000000}, {"tyreUse": 80, "blocking": 65, "raceStart": 70, "overtaking": 75, "qualifying": 60, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 20000, "softCurrencyToUpgrade": 348000000}, {"tyreUse": 83, "blocking": 68, "raceStart": 73, "overtaking": 78, "qualifying": 63, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 30000, "softCurrencyToUpgrade": 464000000}, {"tyreUse": 87, "blocking": 72, "raceStart": 77, "overtaking": 82, "qualifying": 66, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 40000, "softCurrencyToUpgrade": 580000000}, {"tyreUse": 92, "blocking": 76, "raceStart": 82, "overtaking": 87, "qualifying": 69, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 55000, "softCurrencyToUpgrade": 696000000}, {"tyreUse": 98, "blocking": 81, "raceStart": 88, "overtaking": 93, "qualifying": 73, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 75000, "softCurrencyToUpgrade": 812000000}, {"tyreUse": 106, "blocking": 87, "raceStart": 95, "overtaking": 100, "qualifying": 77, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.757+00	2026-02-12 03:27:02.757+00
e38f5480-1d16-44c6-9a4a-65117700ee0c	Jack Brabham	4	12	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Driver_25_Brabham	10	10	\N	\N	\N	3	BRA	15	[{"tyreUse": 55, "blocking": 58, "raceStart": 61, "overtaking": 64, "qualifying": 55, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 10000, "softCurrencyToUpgrade": 30000000}, {"tyreUse": 61, "blocking": 64, "raceStart": 67, "overtaking": 70, "qualifying": 60, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 20000, "softCurrencyToUpgrade": 60000000}, {"tyreUse": 67, "blocking": 70, "raceStart": 73, "overtaking": 76, "qualifying": 66, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 30000, "softCurrencyToUpgrade": 90000000}, {"tyreUse": 73, "blocking": 76, "raceStart": 79, "overtaking": 82, "qualifying": 71, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 40000, "softCurrencyToUpgrade": 110000000}, {"tyreUse": 79, "blocking": 82, "raceStart": 85, "overtaking": 88, "qualifying": 77, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 55000, "softCurrencyToUpgrade": 150000000}, {"tyreUse": 85, "blocking": 88, "raceStart": 91, "overtaking": 94, "qualifying": 82, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 75000, "softCurrencyToUpgrade": 170000000}, {"tyreUse": 90, "blocking": 93, "raceStart": 96, "overtaking": 99, "qualifying": 87, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.764+00	2026-02-12 03:27:02.764+00
e49029a6-add6-4cdc-b410-ce6d496a8f1a	Nico Hulkenberg	3	11	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Driver_25_Hulkenberg	460	2	\N	\N	\N	\N	HUL	11	[{"tyreUse": 63, "blocking": 48, "raceStart": 53, "overtaking": 58, "qualifying": 68, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 54000000}, {"tyreUse": 67, "blocking": 52, "raceStart": 57, "overtaking": 62, "qualifying": 72, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 107000000}, {"tyreUse": 70, "blocking": 55, "raceStart": 60, "overtaking": 65, "qualifying": 75, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 161000000}, {"tyreUse": 74, "blocking": 59, "raceStart": 64, "overtaking": 69, "qualifying": 79, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 215000000}, {"tyreUse": 78, "blocking": 63, "raceStart": 68, "overtaking": 73, "qualifying": 83, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 406000000}, {"tyreUse": 82, "blocking": 67, "raceStart": 72, "overtaking": 77, "qualifying": 87, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 487000000}, {"tyreUse": 86, "blocking": 71, "raceStart": 76, "overtaking": 81, "qualifying": 91, "cardsToUpgrade": 400, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 568000000}, {"tyreUse": 90, "blocking": 75, "raceStart": 80, "overtaking": 85, "qualifying": 95, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.769+00	2026-02-12 03:27:02.769+00
e9f40e76-37d9-4c30-9b52-ec6ac6ab1c58	Nico Hülkenberg	5	12	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_SpecialDriver_PS25_Hulkenberg	10	10	1a4d9853-13e3-40ea-82d6-4891601e41b8	\N	\N	3	HUL	16	[{"tyreUse": 65, "blocking": 76, "raceStart": 68, "overtaking": 83, "qualifying": 73, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 25000, "softCurrencyToUpgrade": 350000000}, {"tyreUse": 69, "blocking": 81, "raceStart": 73, "overtaking": 88, "qualifying": 77, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 50000, "softCurrencyToUpgrade": 700000000}, {"tyreUse": 73, "blocking": 85, "raceStart": 77, "overtaking": 92, "qualifying": 81, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 100000, "softCurrencyToUpgrade": 1000000000}, {"tyreUse": 77, "blocking": 90, "raceStart": 82, "overtaking": 97, "qualifying": 85, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 150000, "softCurrencyToUpgrade": 1500000000}, {"tyreUse": 81, "blocking": 95, "raceStart": 86, "overtaking": 101, "qualifying": 89, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 200000, "softCurrencyToUpgrade": 2500000000}, {"tyreUse": 85, "blocking": 99, "raceStart": 91, "overtaking": 106, "qualifying": 93, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 250000, "softCurrencyToUpgrade": 5200000000}, {"tyreUse": 89, "blocking": 104, "raceStart": 95, "overtaking": 110, "qualifying": 97, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.777+00	2026-02-12 03:27:02.777+00
ebbf3acd-eebc-4824-b36c-2622804a0329	Oscar Piastri	3	11	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Driver_25_Piastri	460	2	\N	\N	\N	\N	PIA	14	[{"tyreUse": 48, "blocking": 63, "raceStart": 58, "overtaking": 68, "qualifying": 53, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 54000000}, {"tyreUse": 52, "blocking": 67, "raceStart": 62, "overtaking": 72, "qualifying": 57, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 107000000}, {"tyreUse": 55, "blocking": 70, "raceStart": 65, "overtaking": 75, "qualifying": 60, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 161000000}, {"tyreUse": 59, "blocking": 74, "raceStart": 69, "overtaking": 79, "qualifying": 64, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 215000000}, {"tyreUse": 63, "blocking": 78, "raceStart": 73, "overtaking": 83, "qualifying": 68, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 406000000}, {"tyreUse": 67, "blocking": 82, "raceStart": 77, "overtaking": 87, "qualifying": 72, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 487000000}, {"tyreUse": 71, "blocking": 86, "raceStart": 81, "overtaking": 91, "qualifying": 76, "cardsToUpgrade": 400, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 568000000}, {"tyreUse": 75, "blocking": 90, "raceStart": 85, "overtaking": 95, "qualifying": 80, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.795+00	2026-02-12 03:27:02.795+00
ec4f9fe2-75ee-41d4-91c0-264dfd4458ae	Nigel Mansell	5	12	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Driver_25_Mansell	10	10	f187e5a1-bcaf-4aa4-af07-70d220cd0cb2	\N	\N	3	MAN	24	[{"tyreUse": 84, "blocking": 79, "raceStart": 93, "overtaking": 81, "qualifying": 93, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 100000, "softCurrencyToUpgrade": 1000000000}, {"tyreUse": 90, "blocking": 85, "raceStart": 98, "overtaking": 87, "qualifying": 98, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 200000, "softCurrencyToUpgrade": 1800000000}, {"tyreUse": 95, "blocking": 91, "raceStart": 102, "overtaking": 93, "qualifying": 102, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 300000, "softCurrencyToUpgrade": 2600000000}, {"tyreUse": 101, "blocking": 97, "raceStart": 107, "overtaking": 99, "qualifying": 107, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 450000, "softCurrencyToUpgrade": 3500000000}, {"tyreUse": 107, "blocking": 102, "raceStart": 112, "overtaking": 104, "qualifying": 112, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 600000, "softCurrencyToUpgrade": 7000000000}, {"tyreUse": 112, "blocking": 108, "raceStart": 116, "overtaking": 110, "qualifying": 116, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 750000, "softCurrencyToUpgrade": 14000000000}, {"tyreUse": 118, "blocking": 114, "raceStart": 121, "overtaking": 116, "qualifying": 121, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.81+00	2026-02-12 03:27:02.81+00
ed244ebf-f9a9-41f4-980a-a00fc28b9fa6	Michael Schumacher	4	12	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Driver_23_Schumacher	10	10	\N	\N	\N	3	MSC	20	[{"tyreUse": 61, "blocking": 64, "raceStart": 55, "overtaking": 55, "qualifying": 58, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 10000, "softCurrencyToUpgrade": 30000000}, {"tyreUse": 67, "blocking": 70, "raceStart": 61, "overtaking": 60, "qualifying": 64, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 20000, "softCurrencyToUpgrade": 60000000}, {"tyreUse": 73, "blocking": 76, "raceStart": 67, "overtaking": 66, "qualifying": 70, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 30000, "softCurrencyToUpgrade": 90000000}, {"tyreUse": 79, "blocking": 82, "raceStart": 73, "overtaking": 71, "qualifying": 76, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 40000, "softCurrencyToUpgrade": 110000000}, {"tyreUse": 85, "blocking": 88, "raceStart": 79, "overtaking": 77, "qualifying": 82, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 55000, "softCurrencyToUpgrade": 150000000}, {"tyreUse": 91, "blocking": 94, "raceStart": 85, "overtaking": 82, "qualifying": 88, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 75000, "softCurrencyToUpgrade": 170000000}, {"tyreUse": 96, "blocking": 99, "raceStart": 90, "overtaking": 87, "qualifying": 93, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.822+00	2026-02-12 03:27:02.822+00
ed3a0524-36f4-451a-8f64-0ac897614a7a	Gerhard Berger	4	6	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Driver_24_Berger	10	10	\N	\N	\N	1	BER	4	[{"tyreUse": 31, "blocking": 43, "raceStart": 19, "overtaking": 37, "qualifying": 25, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 2000, "softCurrencyToUpgrade": 250000}, {"tyreUse": 37, "blocking": 49, "raceStart": 25, "overtaking": 43, "qualifying": 31, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 3000, "softCurrencyToUpgrade": 500000}, {"tyreUse": 43, "blocking": 55, "raceStart": 31, "overtaking": 49, "qualifying": 37, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 4500, "softCurrencyToUpgrade": 700000}, {"tyreUse": 49, "blocking": 61, "raceStart": 37, "overtaking": 55, "qualifying": 43, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 6000, "softCurrencyToUpgrade": 1000000}, {"tyreUse": 55, "blocking": 67, "raceStart": 43, "overtaking": 61, "qualifying": 49, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 8000, "softCurrencyToUpgrade": 1800000}, {"tyreUse": 61, "blocking": 73, "raceStart": 49, "overtaking": 67, "qualifying": 55, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 10000, "softCurrencyToUpgrade": 5500000}, {"tyreUse": 67, "blocking": 79, "raceStart": 55, "overtaking": 73, "qualifying": 61, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.83+00	2026-02-12 03:27:02.83+00
eeb49488-facb-4881-a23e-c9670489c823	Lando Norris	5	12	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_SpecialDriver_PS25_Norris	10	10	1a4d9853-13e3-40ea-82d6-4891601e41b8	\N	\N	3	NOR	23	[{"tyreUse": 90, "blocking": 90, "raceStart": 74, "overtaking": 76, "qualifying": 70, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 50000, "softCurrencyToUpgrade": 500000000}, {"tyreUse": 95, "blocking": 95, "raceStart": 80, "overtaking": 82, "qualifying": 76, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 100000, "softCurrencyToUpgrade": 900000000}, {"tyreUse": 99, "blocking": 99, "raceStart": 85, "overtaking": 88, "qualifying": 82, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 150000, "softCurrencyToUpgrade": 1300000000}, {"tyreUse": 104, "blocking": 104, "raceStart": 91, "overtaking": 94, "qualifying": 88, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 225000, "softCurrencyToUpgrade": 1800000000}, {"tyreUse": 109, "blocking": 109, "raceStart": 97, "overtaking": 99, "qualifying": 93, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 300000, "softCurrencyToUpgrade": 3150000000}, {"tyreUse": 113, "blocking": 113, "raceStart": 102, "overtaking": 105, "qualifying": 99, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 400000, "softCurrencyToUpgrade": 7000000000}, {"tyreUse": 118, "blocking": 118, "raceStart": 108, "overtaking": 111, "qualifying": 105, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.837+00	2026-02-12 03:27:02.837+00
f0ebc467-81c6-4c36-9c9c-9550f3cac760	Pierre Gasly	3	11	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Driver_25_Gasly	460	2	\N	\N	\N	\N	GAS	12	[{"tyreUse": 68, "blocking": 48, "raceStart": 58, "overtaking": 53, "qualifying": 63, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 54000000}, {"tyreUse": 72, "blocking": 52, "raceStart": 62, "overtaking": 57, "qualifying": 67, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 107000000}, {"tyreUse": 75, "blocking": 55, "raceStart": 65, "overtaking": 60, "qualifying": 70, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 161000000}, {"tyreUse": 79, "blocking": 59, "raceStart": 69, "overtaking": 64, "qualifying": 74, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 215000000}, {"tyreUse": 83, "blocking": 63, "raceStart": 73, "overtaking": 68, "qualifying": 78, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 406000000}, {"tyreUse": 87, "blocking": 67, "raceStart": 77, "overtaking": 72, "qualifying": 82, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 487000000}, {"tyreUse": 91, "blocking": 71, "raceStart": 81, "overtaking": 76, "qualifying": 86, "cardsToUpgrade": 400, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 568000000}, {"tyreUse": 95, "blocking": 75, "raceStart": 85, "overtaking": 80, "qualifying": 90, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.845+00	2026-02-12 03:27:02.845+00
f423c845-4b5c-4be1-b168-47d732abfcef	Oscar Piastri	5	12	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_SpecialDriver_PS25_Piastri	10	10	1a4d9853-13e3-40ea-82d6-4891601e41b8	\N	\N	3	PIA	21	[{"tyreUse": 71, "blocking": 76, "raceStart": 87, "overtaking": 93, "qualifying": 73, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 50000, "softCurrencyToUpgrade": 500000000}, {"tyreUse": 76, "blocking": 82, "raceStart": 92, "overtaking": 97, "qualifying": 79, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 100000, "softCurrencyToUpgrade": 900000000}, {"tyreUse": 81, "blocking": 88, "raceStart": 97, "overtaking": 102, "qualifying": 84, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 150000, "softCurrencyToUpgrade": 1300000000}, {"tyreUse": 87, "blocking": 94, "raceStart": 102, "overtaking": 106, "qualifying": 90, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 225000, "softCurrencyToUpgrade": 1800000000}, {"tyreUse": 92, "blocking": 99, "raceStart": 106, "overtaking": 110, "qualifying": 96, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 300000, "softCurrencyToUpgrade": 3150000000}, {"tyreUse": 97, "blocking": 105, "raceStart": 111, "overtaking": 115, "qualifying": 101, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 400000, "softCurrencyToUpgrade": 7000000000}, {"tyreUse": 102, "blocking": 111, "raceStart": 116, "overtaking": 119, "qualifying": 107, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.861+00	2026-02-12 03:27:02.861+00
f546e1d2-4646-4c31-a61c-62c44787d422	Lewis Hamilton	3	12	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Driver_25_Hamilton	500	2	\N	\N	\N	\N	HAM	18	[{"tyreUse": 67, "blocking": 52, "raceStart": 57, "overtaking": 72, "qualifying": 62, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 116000000}, {"tyreUse": 71, "blocking": 56, "raceStart": 61, "overtaking": 76, "qualifying": 66, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 232000000}, {"tyreUse": 75, "blocking": 60, "raceStart": 65, "overtaking": 80, "qualifying": 70, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 348000000}, {"tyreUse": 79, "blocking": 64, "raceStart": 69, "overtaking": 84, "qualifying": 74, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 464000000}, {"tyreUse": 83, "blocking": 68, "raceStart": 73, "overtaking": 88, "qualifying": 78, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 580000000}, {"tyreUse": 86, "blocking": 71, "raceStart": 76, "overtaking": 91, "qualifying": 81, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 696000000}, {"tyreUse": 90, "blocking": 75, "raceStart": 80, "overtaking": 95, "qualifying": 85, "cardsToUpgrade": 400, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 812000000}, {"tyreUse": 94, "blocking": 79, "raceStart": 84, "overtaking": 99, "qualifying": 89, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.868+00	2026-02-12 03:27:02.868+00
f74d63ae-07a3-4c68-8f2f-46893bbc9e9e	Fernando Alonso	1	5	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Driver_25_Alonso	85	10	\N	\N	\N	\N	ALO	16	[{"tyreUse": 12, "blocking": 27, "raceStart": 32, "overtaking": 22, "qualifying": 17, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 220000}, {"tyreUse": 15, "blocking": 30, "raceStart": 35, "overtaking": 25, "qualifying": 20, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 445000}, {"tyreUse": 18, "blocking": 33, "raceStart": 38, "overtaking": 28, "qualifying": 23, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 665000}, {"tyreUse": 20, "blocking": 35, "raceStart": 40, "overtaking": 30, "qualifying": 25, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 2250000}, {"tyreUse": 23, "blocking": 38, "raceStart": 43, "overtaking": 33, "qualifying": 28, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 4750000}, {"tyreUse": 26, "blocking": 41, "raceStart": 46, "overtaking": 36, "qualifying": 31, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 13750000}, {"tyreUse": 28, "blocking": 43, "raceStart": 48, "overtaking": 38, "qualifying": 33, "cardsToUpgrade": 400, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 25500000}, {"tyreUse": 31, "blocking": 46, "raceStart": 51, "overtaking": 41, "qualifying": 36, "cardsToUpgrade": 1000, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 37250000}, {"tyreUse": 34, "blocking": 49, "raceStart": 54, "overtaking": 44, "qualifying": 39, "cardsToUpgrade": 2000, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 49000000}, {"tyreUse": 36, "blocking": 51, "raceStart": 56, "overtaking": 46, "qualifying": 41, "cardsToUpgrade": 4000, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 60750000}, {"tyreUse": 39, "blocking": 54, "raceStart": 59, "overtaking": 49, "qualifying": 44, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.874+00	2026-02-12 03:27:02.874+00
f96adea7-cd29-4240-87ee-5f1b4fc0cc6b	Jacques Villeneuve	4	6	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Driver_23_Villeneuve	10	10	\N	\N	\N	1	VIL	6	[{"tyreUse": 31, "blocking": 19, "raceStart": 43, "overtaking": 25, "qualifying": 37, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 2000, "softCurrencyToUpgrade": 250000}, {"tyreUse": 37, "blocking": 25, "raceStart": 49, "overtaking": 31, "qualifying": 43, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 3000, "softCurrencyToUpgrade": 500000}, {"tyreUse": 43, "blocking": 31, "raceStart": 55, "overtaking": 37, "qualifying": 49, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 4500, "softCurrencyToUpgrade": 700000}, {"tyreUse": 49, "blocking": 37, "raceStart": 61, "overtaking": 43, "qualifying": 55, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 6000, "softCurrencyToUpgrade": 1000000}, {"tyreUse": 55, "blocking": 43, "raceStart": 67, "overtaking": 49, "qualifying": 61, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 8000, "softCurrencyToUpgrade": 1800000}, {"tyreUse": 61, "blocking": 49, "raceStart": 73, "overtaking": 55, "qualifying": 67, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 10000, "softCurrencyToUpgrade": 5500000}, {"tyreUse": 67, "blocking": 55, "raceStart": 79, "overtaking": 61, "qualifying": 73, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.88+00	2026-02-12 03:27:02.88+00
fd6f6a51-71ee-4a28-9f35-1cc7a6874683	Andrea Kimi Antonelli	5	12	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_SpecialDriver_25_Antonelli	10	10	fa44edf3-f712-4e32-a94b-46f0187757c2	\N	SERVLOC_TXT_HOT_PROSPECT_COLLECTION_SUBTITLE_2	3	ANT	14	[{"tyreUse": 64, "blocking": 59, "raceStart": 69, "overtaking": 74, "qualifying": 79, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 10000, "softCurrencyToUpgrade": 232000000}, {"tyreUse": 67, "blocking": 62, "raceStart": 72, "overtaking": 77, "qualifying": 82, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 20000, "softCurrencyToUpgrade": 348000000}, {"tyreUse": 70, "blocking": 65, "raceStart": 75, "overtaking": 80, "qualifying": 85, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 30000, "softCurrencyToUpgrade": 464000000}, {"tyreUse": 74, "blocking": 68, "raceStart": 79, "overtaking": 84, "qualifying": 89, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 40000, "softCurrencyToUpgrade": 580000000}, {"tyreUse": 78, "blocking": 71, "raceStart": 84, "overtaking": 89, "qualifying": 94, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 55000, "softCurrencyToUpgrade": 696000000}, {"tyreUse": 83, "blocking": 75, "raceStart": 90, "overtaking": 95, "qualifying": 100, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 75000, "softCurrencyToUpgrade": 812000000}, {"tyreUse": 89, "blocking": 79, "raceStart": 97, "overtaking": 102, "qualifying": 108, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.887+00	2026-02-12 03:27:02.887+00
ff8a3d96-c99b-4445-b591-89447639108d	Isack Hadjar	1	1	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Icon_Driver_25_Hadjar	25	10	\N	\N	\N	\N	HAD	1	[{"tyreUse": 5, "blocking": 3, "raceStart": 4, "overtaking": 6, "qualifying": 2, "cardsToUpgrade": 4, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 2000}, {"tyreUse": 9, "blocking": 6, "raceStart": 7, "overtaking": 10, "qualifying": 4, "cardsToUpgrade": 10, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 8000}, {"tyreUse": 12, "blocking": 8, "raceStart": 10, "overtaking": 13, "qualifying": 6, "cardsToUpgrade": 20, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 35000}, {"tyreUse": 15, "blocking": 10, "raceStart": 12, "overtaking": 17, "qualifying": 8, "cardsToUpgrade": 50, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 90000}, {"tyreUse": 18, "blocking": 13, "raceStart": 15, "overtaking": 20, "qualifying": 10, "cardsToUpgrade": 100, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 275000}, {"tyreUse": 21, "blocking": 15, "raceStart": 18, "overtaking": 24, "qualifying": 12, "cardsToUpgrade": 200, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 800000}, {"tyreUse": 24, "blocking": 17, "raceStart": 20, "overtaking": 27, "qualifying": 14, "cardsToUpgrade": 400, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 1600000}, {"tyreUse": 27, "blocking": 19, "raceStart": 23, "overtaking": 31, "qualifying": 16, "cardsToUpgrade": 1000, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 2400000}, {"tyreUse": 30, "blocking": 22, "raceStart": 26, "overtaking": 34, "qualifying": 17, "cardsToUpgrade": 2000, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 3200000}, {"tyreUse": 33, "blocking": 24, "raceStart": 28, "overtaking": 38, "qualifying": 19, "cardsToUpgrade": 4000, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 4000000}, {"tyreUse": 36, "blocking": 26, "raceStart": 31, "overtaking": 41, "qualifying": 21, "cardsToUpgrade": 0, "legacyPointsToUpgrade": 0, "softCurrencyToUpgrade": 0}]	2026-02-12 03:27:02.892+00	2026-02-12 03:27:02.892+00
\.


--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.profiles (id, email, username, is_admin, created_at, updated_at) FROM stdin;
267a5730-adfc-47b9-8b0f-00d837238e7a	test@example.com	\N	f	2026-02-26 07:25:36.008829+00	2026-02-26 07:25:36.008829+00
f93f0ecf-47d2-4d40-a4b4-4c22a301c374	thomas.lobaugh@example.com	Thomas Lobaugh	t	2026-02-27 00:01:31.375326+00	2026-02-27 03:13:22.623916+00
bf455f21-2e53-416a-a134-8b4a81588db3	thomas.lobaugh@gmail.com	Thomas Lobaugh	t	2026-02-27 14:31:03.222777+00	2026-02-27 14:31:03.222777+00
\.


--
-- Data for Name: seasons; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.seasons (id, name, is_active, created_at, updated_at) FROM stdin;
a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	Season 6	t	2026-02-06 19:14:37.382+00	2026-02-10 23:46:23.483+00
\.


--
-- Data for Name: tracks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tracks (id, name, alt_name, laps, driver_track_stat, car_track_stat, season_id, created_at, updated_at) FROM stdin;
00000000-0000-0000-0000-000000000002	Silverstone Circuit	\N	52	defending	speed	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	2026-02-06 19:14:37.396+00	2026-02-06 19:14:37.396+00
00000000-0000-0000-0000-000000000005	Suzuka International Racing Course	\N	53	tyreUse	cornering	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	2026-02-06 19:14:37.396+00	2026-02-06 19:14:37.396+00
00000000-0000-0000-0000-000000000003	Spa	\N	6	overtaking	powerUnit	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	2026-02-06 19:14:37.396+00	2026-02-10 15:46:48.904+00
3e1354cb-1d37-4b10-b20a-f1b1dbfab419	Monza		9	overtaking	speed	a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	2026-02-10 15:47:12.754+00	2026-02-10 15:47:12.754+00
\.


--
-- Data for Name: user_boosts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_boosts (id, user_id, boost_id, level, count, created_at, updated_at) FROM stdin;
0b5e56dd-1b3f-4c2c-82e7-de0957b73468	bf455f21-2e53-416a-a134-8b4a81588db3	599fd54b-4438-4928-9d4c-51eb3c0c5a24	0	15	2026-02-27 15:37:35.295149+00	2026-02-27 15:37:35.295149+00
d5eb9ce3-f677-4fe3-bb8b-0796f52dd386	bf455f21-2e53-416a-a134-8b4a81588db3	645835dc-03d0-464f-9800-c974e6712fa8	0	15	2026-02-27 15:37:35.3061+00	2026-02-27 15:37:35.3061+00
c7825b25-3536-4400-b341-d34bfa58104e	bf455f21-2e53-416a-a134-8b4a81588db3	192fcf08-1f37-4c1a-91c3-6cd26e89eeca	0	20	2026-02-27 15:37:35.314657+00	2026-02-27 15:37:35.314657+00
b7af9b87-0364-4520-b658-1a3ad9649a0f	bf455f21-2e53-416a-a134-8b4a81588db3	250b1fd6-924a-41b6-aefe-ce1de81d97ef	0	30	2026-02-27 15:37:35.326522+00	2026-02-27 15:37:35.326522+00
c9a1eac6-3fec-4724-8763-b31f74e07508	bf455f21-2e53-416a-a134-8b4a81588db3	cf38d7e6-437f-4518-ad84-ecf18d2e8b4a	0	15	2026-02-27 15:37:35.336439+00	2026-02-27 15:37:35.336439+00
cd282c65-665c-4918-ae04-3c23fe438df5	bf455f21-2e53-416a-a134-8b4a81588db3	fce48870-011d-4541-b3eb-fb85f6d5111b	0	12	2026-02-27 15:37:35.344519+00	2026-02-27 15:37:35.344519+00
847a7ff7-c846-48d0-844d-9c58ba2e85cf	bf455f21-2e53-416a-a134-8b4a81588db3	03dbcf8a-096d-40ea-98f9-f1976c4a4559	0	45	2026-02-27 15:37:35.354455+00	2026-02-27 15:37:35.354455+00
4ab5ba8c-6a0f-4bc7-8edb-095b76bf40ad	bf455f21-2e53-416a-a134-8b4a81588db3	040549a0-9804-4e52-ae7b-6707451ab305	0	1	2026-02-27 15:37:35.361218+00	2026-02-27 15:37:35.361218+00
206d6159-69a7-405f-9900-d2ff916ad15d	bf455f21-2e53-416a-a134-8b4a81588db3	059a30e3-f649-4c3e-9345-7f4bc2606790	0	364	2026-02-27 15:37:35.368644+00	2026-02-27 15:37:35.368644+00
0dea6c65-d4d6-4694-a6db-9af2bbb49dc1	bf455f21-2e53-416a-a134-8b4a81588db3	0f03a4cb-a254-4d85-86eb-6cb3cf80cf2f	0	21	2026-02-27 15:37:35.376817+00	2026-02-27 15:37:35.376817+00
5f88de1c-0593-4b3c-b186-773d5c292e39	bf455f21-2e53-416a-a134-8b4a81588db3	1d16d89d-996a-4e8e-9582-a5bad9dc8086	0	66	2026-02-27 15:37:35.384866+00	2026-02-27 15:37:35.384866+00
22664b97-3eb0-4d5c-8191-99c0e2cac476	bf455f21-2e53-416a-a134-8b4a81588db3	2185b145-2c6c-4048-a9ad-188e83946a6d	0	46	2026-02-27 15:37:35.393408+00	2026-02-27 15:37:35.393408+00
\.


--
-- Data for Name: user_car_parts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_car_parts (id, user_id, car_part_id, level, card_count, created_at, updated_at) FROM stdin;
f314992f-3d2d-4a6d-b352-b806e2bd0b42	bf455f21-2e53-416a-a134-8b4a81588db3	1e1eca47-90fa-494b-9d7d-d485f4030fa9	7	232	2026-02-27 15:37:34.873312+00	2026-02-27 15:37:34.873312+00
eaef70dc-edf4-42b0-8d1f-4656b0dbc459	bf455f21-2e53-416a-a134-8b4a81588db3	97b9354a-7166-4b69-b11e-aac333bb1353	4	15	2026-02-27 15:37:34.885959+00	2026-02-27 15:37:34.885959+00
80ef8b4c-b7c4-4c9a-923a-56870e5e6c12	bf455f21-2e53-416a-a134-8b4a81588db3	edb7bab6-ad41-4ede-af4e-3f7579f7f3db	7	375	2026-02-27 15:37:34.895671+00	2026-02-27 15:37:34.895671+00
73aab5d7-3697-45d3-8c0c-5e12f701d2ca	bf455f21-2e53-416a-a134-8b4a81588db3	b172c060-1384-4ca0-a883-6ccb3d0c1d3c	11	0	2026-02-27 15:37:34.907942+00	2026-02-27 15:37:34.907942+00
51649ec0-3dcf-4cb0-98f1-866bc362536d	bf455f21-2e53-416a-a134-8b4a81588db3	3ece7764-6ee5-4982-9373-4e8f19d07b62	9	0	2026-02-27 15:37:34.918683+00	2026-02-27 15:37:34.918683+00
3b50fdb1-6503-4fb2-b8ff-80ba1abb9d94	bf455f21-2e53-416a-a134-8b4a81588db3	e6eff945-f1d0-45da-b5c2-233e91bc94e4	11	0	2026-02-27 15:37:34.928984+00	2026-02-27 15:37:34.928984+00
8aa4e79f-505a-4f39-879a-fe2501ac300c	bf455f21-2e53-416a-a134-8b4a81588db3	527bb224-74b7-4d9c-afdf-eae043125382	8	686	2026-02-27 15:37:34.940561+00	2026-02-27 15:37:34.940561+00
a5e1f9fe-4262-486e-a5dd-c30e357c8e1f	bf455f21-2e53-416a-a134-8b4a81588db3	5b8862f7-5376-4582-82b1-b0d44dff8537	7	59	2026-02-27 15:37:34.947556+00	2026-02-27 15:37:34.947556+00
2be23bce-fd36-4500-93e5-5feb1e061841	bf455f21-2e53-416a-a134-8b4a81588db3	6a454ff3-2918-4f9e-b789-94380069e132	7	444	2026-02-27 15:37:34.957409+00	2026-02-27 15:37:34.957409+00
3a56e272-8518-48e2-971c-4b98181d2e24	bf455f21-2e53-416a-a134-8b4a81588db3	2b73e93c-066a-426c-9765-04c7f6a9db2f	3	6	2026-02-27 15:37:34.966038+00	2026-02-27 15:37:34.966038+00
b1927145-6d5f-4f62-bcc7-8df3de951269	bf455f21-2e53-416a-a134-8b4a81588db3	b5ce79c4-5c38-41ff-b372-b483d88f7bec	2	8	2026-02-27 15:37:34.975482+00	2026-02-27 15:37:34.975482+00
0208bc71-c35e-4af2-8adf-febf6a9e44b7	bf455f21-2e53-416a-a134-8b4a81588db3	6f245ed7-bfa9-46d3-9369-a3fe87b651b3	9	0	2026-02-27 15:37:34.985968+00	2026-02-27 15:37:34.985968+00
1bb1f25d-9131-40d3-a904-d007daac255c	bf455f21-2e53-416a-a134-8b4a81588db3	28dd7403-f0d2-4c4e-9b8a-24bf62f79966	2	5	2026-02-27 15:37:34.993773+00	2026-02-27 15:37:34.993773+00
eae0ae88-17be-44b5-a6c5-43f0d22586f8	bf455f21-2e53-416a-a134-8b4a81588db3	64d7f0c9-f214-4c55-98e5-d41d3c4c9a1d	11	0	2026-02-27 15:37:35.002178+00	2026-02-27 15:37:35.002178+00
95077eb9-831d-450a-8acc-450fbafd049c	bf455f21-2e53-416a-a134-8b4a81588db3	add95d79-506e-4125-97db-2aa92ba47f81	11	0	2026-02-27 15:37:35.00975+00	2026-02-27 15:37:35.00975+00
2cb7f4a2-5e44-41d8-b6ef-0512028e430e	bf455f21-2e53-416a-a134-8b4a81588db3	a11783ee-e811-4c1d-8edc-4a7650961d84	8	870	2026-02-27 15:37:35.016767+00	2026-02-27 15:37:35.016767+00
ac059369-3b69-4aae-bb61-887d7668e509	bf455f21-2e53-416a-a134-8b4a81588db3	7fb87658-22dd-4f77-9aab-0edf60bd5a00	9	0	2026-02-27 15:37:35.024851+00	2026-02-27 15:37:35.024851+00
cbf77dbf-55a5-4f7e-a390-0e6c25c3a8d8	bf455f21-2e53-416a-a134-8b4a81588db3	47cf77e9-29c7-4243-bb1b-809ea47c2e34	8	276	2026-02-27 15:37:35.03315+00	2026-02-27 15:37:35.03315+00
35d2022e-fbda-4001-9d68-b9d3fd2c6932	bf455f21-2e53-416a-a134-8b4a81588db3	99168952-d8e2-4f6c-bffc-9d32a6b5ff9c	4	44	2026-02-27 15:37:35.041311+00	2026-02-27 15:37:35.041311+00
2909d2a7-fa0d-4855-b7f3-641f89d474b3	bf455f21-2e53-416a-a134-8b4a81588db3	67b4c4e4-1a29-4280-b784-40a520b24530	8	0	2026-02-27 15:37:35.057829+00	2026-02-27 15:37:35.057829+00
9487e5a0-1eb7-4e55-92be-513f9aea17f4	bf455f21-2e53-416a-a134-8b4a81588db3	9148801d-b9b3-4496-a312-b947201da93f	4	25	2026-02-27 15:37:35.06561+00	2026-02-27 15:37:35.06561+00
2bc86995-2299-4f35-8368-6cee15f165fa	bf455f21-2e53-416a-a134-8b4a81588db3	06af5368-987f-4432-b063-77d9163e3847	7	378	2026-02-27 15:37:35.074185+00	2026-02-27 15:37:35.074185+00
e46a3d88-c036-446b-b974-3abe7b74338a	bf455f21-2e53-416a-a134-8b4a81588db3	13fdfb99-8ea3-4e45-9453-2db9eb9a2459	8	759	2026-02-27 15:37:35.082224+00	2026-02-27 15:37:35.082224+00
172698dd-c429-4516-9248-8b405d02ccd2	bf455f21-2e53-416a-a134-8b4a81588db3	8deac225-fd24-4963-ba49-81690f68bd31	2	9	2026-02-27 15:37:35.090472+00	2026-02-27 15:37:35.090472+00
18e61035-b6a9-4175-8d9d-80cd1241ffea	bf455f21-2e53-416a-a134-8b4a81588db3	ca4d029a-908e-45c5-a4f9-1f4818a0deba	3	19	2026-02-27 15:37:35.09717+00	2026-02-27 15:37:35.09717+00
69406408-ba6a-4913-aabc-973925257408	bf455f21-2e53-416a-a134-8b4a81588db3	adc70ff3-8360-4042-a165-aa1d0143e912	11	0	2026-02-27 15:37:35.104883+00	2026-02-27 15:37:35.104883+00
25f64b41-6c6a-4da1-a869-1a12c45d943e	bf455f21-2e53-416a-a134-8b4a81588db3	ec4bda00-28e6-436a-9c35-6ba64c03d6ca	3	7	2026-02-27 15:37:35.112137+00	2026-02-27 15:37:35.112137+00
b291b785-3e0c-498c-89dd-11536c1f6da0	bf455f21-2e53-416a-a134-8b4a81588db3	2072087c-bb0d-4364-b50d-39bb3440e9cd	8	0	2026-02-27 15:37:35.120406+00	2026-02-27 15:37:35.120406+00
5e50199c-594a-47e8-80a0-4d35f84f1381	bf455f21-2e53-416a-a134-8b4a81588db3	d0708690-8064-481f-83ee-074302f8791e	11	0	2026-02-27 15:37:35.127644+00	2026-02-27 15:37:35.127644+00
3d18e9be-f16a-4ee2-89dd-123c323d7ba4	bf455f21-2e53-416a-a134-8b4a81588db3	8f7b6e5c-4f9d-4b52-b5cf-aad3d21e1124	7	34	2026-02-27 15:37:35.135136+00	2026-02-27 15:37:35.135136+00
7961c6ed-cd9f-4450-a8e1-6ca1937be9ec	bf455f21-2e53-416a-a134-8b4a81588db3	131bbbce-cc96-4753-b81a-275bbe42c087	3	6	2026-02-27 15:37:35.143459+00	2026-02-27 15:37:35.143459+00
5dd9c0d8-c6a5-4099-9aee-ab2f0e4a6346	bf455f21-2e53-416a-a134-8b4a81588db3	dd29e3be-2778-4a64-92b2-5acce08462c5	11	0	2026-02-27 15:37:35.151541+00	2026-02-27 15:37:35.151541+00
2d34f9f7-9935-42cd-abb9-e1db8bb3b46b	bf455f21-2e53-416a-a134-8b4a81588db3	0d1e365b-31d7-47e4-b027-caf5b340450d	11	11	2026-02-27 15:37:35.159309+00	2026-02-27 15:37:35.159309+00
d637f0c2-91e4-4d37-b6b8-345dc97a0a84	bf455f21-2e53-416a-a134-8b4a81588db3	ac3f6bfe-92b1-49eb-80a4-c28e3ce59b6c	11	0	2026-02-27 15:37:35.166833+00	2026-02-27 15:37:35.166833+00
46d6c86b-1809-492c-8f67-2822ee8d8f8c	bf455f21-2e53-416a-a134-8b4a81588db3	562cc55b-41d1-46e4-a54a-fdb38fc30a20	11	0	2026-02-27 15:37:35.174811+00	2026-02-27 15:37:35.174811+00
4ec24917-c78d-4299-a16f-5bbcb639a9de	bf455f21-2e53-416a-a134-8b4a81588db3	8190f0d2-3858-4dfa-b2a5-cd423d4bf44c	8	0	2026-02-27 15:37:35.182801+00	2026-02-27 15:37:35.182801+00
c4c78520-3f6e-4dc6-b4d6-fdef9049108b	bf455f21-2e53-416a-a134-8b4a81588db3	7f6bd644-3ede-4a0f-9f74-4a7380073ab6	11	0	2026-02-27 15:37:35.190957+00	2026-02-27 15:37:35.190957+00
265b2ae4-d998-49cf-ac5e-79e8d0470a7b	bf455f21-2e53-416a-a134-8b4a81588db3	40701d2c-c9a6-4f4a-a4f8-0dc158a4dcb4	11	0	2026-02-27 15:37:35.198382+00	2026-02-27 15:37:35.198382+00
c79e23ad-5b65-4147-8d06-9526740dd127	bf455f21-2e53-416a-a134-8b4a81588db3	26e8bde5-fbc2-4434-9f63-473d34606f21	9	0	2026-02-27 15:37:35.206143+00	2026-02-27 15:37:35.206143+00
44df6608-ed10-4413-9781-9719fb7eeffe	bf455f21-2e53-416a-a134-8b4a81588db3	2262835a-d3e6-4857-8cdb-615e2e631acc	3	5	2026-02-27 15:37:35.213916+00	2026-02-27 15:37:35.213916+00
f720f861-412f-4198-abd1-ca23ad6e77cf	bf455f21-2e53-416a-a134-8b4a81588db3	2abbf935-4403-41ef-a95d-85ca9845ed3d	3	17	2026-02-27 15:37:35.221373+00	2026-02-27 15:37:35.221373+00
cf805755-cd2b-4495-9bba-86feae31a62e	bf455f21-2e53-416a-a134-8b4a81588db3	18268b4f-fa95-439c-a51c-3124a97dd38f	11	0	2026-02-27 15:37:35.2291+00	2026-02-27 15:37:35.2291+00
b9ea0ac0-d520-4dff-b1d2-6c06661e0e53	bf455f21-2e53-416a-a134-8b4a81588db3	1a718124-8a1c-4a7a-98c8-185064831bb7	11	0	2026-02-27 15:37:35.238162+00	2026-02-27 15:37:35.238162+00
79c8d4b4-8412-48af-a43c-60688f379680	bf455f21-2e53-416a-a134-8b4a81588db3	45b4e2d7-ca59-47ff-a987-2bcec2181d21	9	0	2026-02-27 15:37:35.246306+00	2026-02-27 15:37:35.246306+00
7f5843fa-7294-42f4-9ccd-a51af9896ff2	bf455f21-2e53-416a-a134-8b4a81588db3	e93cb5bc-e0dc-4212-bbff-90262e6790b4	8	892	2026-02-27 15:37:35.254742+00	2026-02-27 15:37:35.254742+00
4da93ed6-145c-4748-a06e-4ccb5ccc86af	bf455f21-2e53-416a-a134-8b4a81588db3	6ba19327-3649-49ee-96af-b3fdc9d7d247	4	16	2026-02-27 15:37:35.262534+00	2026-02-27 15:37:35.262534+00
cb3ef6f0-01f7-42ef-afc6-e0b742553c2e	bf455f21-2e53-416a-a134-8b4a81588db3	826dc2e8-d559-4033-84c8-4c01dde93522	8	573	2026-02-27 15:37:35.271015+00	2026-02-27 15:37:35.271015+00
de07148f-5e66-4e82-bc35-33d082d8e7c5	bf455f21-2e53-416a-a134-8b4a81588db3	11599ab4-d8ac-4442-a453-7d76a2e74bff	8	699	2026-02-27 15:37:35.278359+00	2026-02-27 15:37:35.278359+00
3690bec1-10cb-4dd7-ab93-7b27e3d20823	bf455f21-2e53-416a-a134-8b4a81588db3	99d7d514-3994-4d53-b90e-23eaefc271e9	4	12	2026-02-27 15:37:35.287206+00	2026-02-27 15:37:35.287206+00
7fab1bdc-444e-4615-8a33-07fcd9d2740c	bf455f21-2e53-416a-a134-8b4a81588db3	35c26b98-27d8-4bdb-8f1f-241c399b36a8	11	0	2026-02-27 15:37:35.049399+00	2026-02-27 15:39:03.301693+00
\.


--
-- Data for Name: user_car_setups; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_car_setups (id, user_id, name, notes, brake_id, gearbox_id, rear_wing_id, front_wing_id, suspension_id, engine_id, series_filter, bonus_percentage, created_at, updated_at) FROM stdin;
26604b4f-a8fe-4ae7-8248-33d6f1cf7c18	bf455f21-2e53-416a-a134-8b4a81588db3	test	\N	97b9354a-7166-4b69-b11e-aac333bb1353	edb7bab6-ad41-4ede-af4e-3f7579f7f3db	6ba19327-3649-49ee-96af-b3fdc9d7d247	9148801d-b9b3-4496-a312-b947201da93f	8deac225-fd24-4963-ba49-81690f68bd31	ec4bda00-28e6-436a-9c35-6ba64c03d6ca	12	0	2026-02-27 03:59:33.546117+00	2026-02-27 03:59:33.546117+00
fbba9695-c878-4924-b736-7bffe8727c0a	bf455f21-2e53-416a-a134-8b4a81588db3	Contender Speed	Swap Powerlift for Non-DRS\nSwap Mach 2 for Quali sensitive tracks	67b4c4e4-1a29-4280-b784-40a520b24530	edb7bab6-ad41-4ede-af4e-3f7579f7f3db	47cf77e9-29c7-4243-bb1b-809ea47c2e34	8190f0d2-3858-4dfa-b2a5-cd423d4bf44c	26e8bde5-fbc2-4434-9f63-473d34606f21	2072087c-bb0d-4364-b50d-39bb3440e9cd	9	10	2026-02-27 15:37:35.5282+00	2026-02-27 15:37:35.5282+00
7d7e11ab-a497-44c8-acd2-8d043c9883f8	bf455f21-2e53-416a-a134-8b4a81588db3	Suggested Cornering + Quali	test	6f245ed7-bfa9-46d3-9369-a3fe87b651b3	edb7bab6-ad41-4ede-af4e-3f7579f7f3db	6a454ff3-2918-4f9e-b789-94380069e132	8190f0d2-3858-4dfa-b2a5-cd423d4bf44c	13fdfb99-8ea3-4e45-9453-2db9eb9a2459	2072087c-bb0d-4364-b50d-39bb3440e9cd	9	0	2026-02-27 15:37:35.54093+00	2026-02-27 15:37:35.54093+00
0aeef6ea-381b-45c0-bb24-41ab2d3db970	bf455f21-2e53-416a-a134-8b4a81588db3	Suggested PU + Quali	\N	e93cb5bc-e0dc-4212-bbff-90262e6790b4	527bb224-74b7-4d9c-afdf-eae043125382	47cf77e9-29c7-4243-bb1b-809ea47c2e34	11599ab4-d8ac-4442-a453-7d76a2e74bff	13fdfb99-8ea3-4e45-9453-2db9eb9a2459	adc70ff3-8360-4042-a165-aa1d0143e912	9	0	2026-02-27 15:37:35.550883+00	2026-02-27 15:37:35.550883+00
86a66f70-6375-4a64-a303-9a69aadef57f	bf455f21-2e53-416a-a134-8b4a81588db3	Suggested Speed	test	1e1eca47-90fa-494b-9d7d-d485f4030fa9	2b73e93c-066a-426c-9765-04c7f6a9db2f	99168952-d8e2-4f6c-bffc-9d32a6b5ff9c	9148801d-b9b3-4496-a312-b947201da93f	8deac225-fd24-4963-ba49-81690f68bd31	131bbbce-cc96-4753-b81a-275bbe42c087	12	10	2026-02-27 17:38:36.286844+00	2026-02-27 17:38:36.286844+00
\.


--
-- Data for Name: user_drivers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_drivers (id, user_id, driver_id, level, card_count, created_at, updated_at) FROM stdin;
1db710de-2f75-4bb4-b858-1b3726dbd4b6	bf455f21-2e53-416a-a134-8b4a81588db3	f96adea7-cd29-4240-87ee-5f1b4fc0cc6b	1	4	2026-02-27 15:37:33.907008+00	2026-02-27 15:37:33.907008+00
ca8a0dd6-a16c-48d7-9afc-11bd96684639	bf455f21-2e53-416a-a134-8b4a81588db3	b9b519ff-96ec-4cae-9a99-2d716947bf6d	3	73	2026-02-27 15:37:33.923216+00	2026-02-27 15:37:33.923216+00
e0510e47-8216-4ef5-bc0c-c18e41edc625	bf455f21-2e53-416a-a134-8b4a81588db3	8e6fefee-efc9-4736-96b1-a1b8121ebbda	3	31	2026-02-27 15:37:33.93402+00	2026-02-27 15:37:33.93402+00
d4d38896-2b66-4903-862c-9ce9b301a2dd	bf455f21-2e53-416a-a134-8b4a81588db3	2f72ac64-8889-4dec-8dc7-d71067dc4cf5	8	458	2026-02-27 15:37:33.943207+00	2026-02-27 15:37:33.943207+00
85c6c08a-06a2-458c-b1aa-3126076c922e	bf455f21-2e53-416a-a134-8b4a81588db3	6b48029d-ee33-4c75-b636-1e5f01bc3668	8	441	2026-02-27 15:37:33.955355+00	2026-02-27 15:37:33.955355+00
b9f4e09b-6c96-4d5d-89a4-fb1432f1eac9	bf455f21-2e53-416a-a134-8b4a81588db3	00278200-ae62-491b-ac68-114e4b96b755	11	0	2026-02-27 15:37:33.977148+00	2026-02-27 15:37:33.977148+00
d5700d58-2d3f-4fea-87fb-7c8399aee26c	bf455f21-2e53-416a-a134-8b4a81588db3	39165d67-a5d1-4cda-9ba0-d45d3e31808c	11	0	2026-02-27 15:37:33.986819+00	2026-02-27 15:37:33.986819+00
89ce483e-f630-47b9-a919-a83a4739068f	bf455f21-2e53-416a-a134-8b4a81588db3	9d41ec96-e731-4c2f-aca0-350066d40834	9	0	2026-02-27 15:37:33.996559+00	2026-02-27 15:37:33.996559+00
e73c41e5-e798-4f97-93ff-864ed56545e9	bf455f21-2e53-416a-a134-8b4a81588db3	b7297703-e525-43f4-8a11-946fb9f6d5ae	8	0	2026-02-27 15:37:34.005699+00	2026-02-27 15:37:34.005699+00
fdc40910-8c6c-4ec8-b2b0-03cd15b5b45a	bf455f21-2e53-416a-a134-8b4a81588db3	c2e5162f-9c89-493c-aa5d-a346cf23ca5d	11	0	2026-02-27 15:37:34.014602+00	2026-02-27 15:37:34.014602+00
4e4795c2-2c09-45ca-aafe-608fd449314b	bf455f21-2e53-416a-a134-8b4a81588db3	bcc7e2c5-7a8f-4224-b5dc-514d23fbc875	11	0	2026-02-27 15:37:34.024292+00	2026-02-27 15:37:34.024292+00
84753989-bc17-4cb3-b70c-7b618712c545	bf455f21-2e53-416a-a134-8b4a81588db3	8a8f53bd-30c5-4dfa-90ec-1ec8ca5e7d65	11	0	2026-02-27 15:37:34.036714+00	2026-02-27 15:37:34.036714+00
83f4299c-de74-4ba1-8647-80e888613ef2	bf455f21-2e53-416a-a134-8b4a81588db3	da58684f-a197-499c-a97d-ba93104de565	11	0	2026-02-27 15:37:34.045775+00	2026-02-27 15:37:34.045775+00
c2a3660a-5691-4ef4-85a7-efeeee5804ad	bf455f21-2e53-416a-a134-8b4a81588db3	5d0ff653-b359-4b68-b538-7bc70a51ecf4	8	2368	2026-02-27 15:37:34.059821+00	2026-02-27 15:37:34.059821+00
7f574f96-bf80-47a6-86ee-97297ea4f639	bf455f21-2e53-416a-a134-8b4a81588db3	457bae19-cc8f-4a4c-95c0-d29a569d9797	11	0	2026-02-27 15:37:34.069704+00	2026-02-27 15:37:34.069704+00
adf7ec79-9291-4ca6-9a3e-438b505fc495	bf455f21-2e53-416a-a134-8b4a81588db3	d63aca7f-0fd1-4315-be5e-9ef314e413bf	11	0	2026-02-27 15:37:34.079102+00	2026-02-27 15:37:34.079102+00
5ee49cc0-1d6e-466b-8692-cd3262cf3b43	bf455f21-2e53-416a-a134-8b4a81588db3	779aa53f-edab-4299-991e-c6937c966e1a	11	0	2026-02-27 15:37:34.088678+00	2026-02-27 15:37:34.088678+00
95295c1a-569e-4713-8fea-1ef6f1879efa	bf455f21-2e53-416a-a134-8b4a81588db3	1c1d92ae-c086-4ce4-b342-915c3b702d99	11	0	2026-02-27 15:37:34.098376+00	2026-02-27 15:37:34.098376+00
320b427a-d3f4-4ea7-a150-4806d396ee2c	bf455f21-2e53-416a-a134-8b4a81588db3	bb4ddf42-108c-4f71-bd08-12f24a9a4b4c	9	0	2026-02-27 15:37:34.107934+00	2026-02-27 15:37:34.107934+00
d4d8c034-48f6-4991-b83a-29b56e2fde6f	bf455f21-2e53-416a-a134-8b4a81588db3	ad52d46b-59ba-451f-a0e3-97d2a22db53c	11	0	2026-02-27 15:37:34.119939+00	2026-02-27 15:37:34.119939+00
e0d144b3-6847-469a-ba7e-85e24d5def94	bf455f21-2e53-416a-a134-8b4a81588db3	52eca0e4-0074-4646-aa7d-3df7e95bfdb9	11	0	2026-02-27 15:37:34.13265+00	2026-02-27 15:37:34.13265+00
eacfeb7c-d00c-407c-adf2-82f7564037ba	bf455f21-2e53-416a-a134-8b4a81588db3	4656b98f-d122-43a3-9c31-2e335c1ada79	11	0	2026-02-27 15:37:34.145564+00	2026-02-27 15:37:34.145564+00
431b72bd-a7bc-4929-9931-0ef7b9c93137	bf455f21-2e53-416a-a134-8b4a81588db3	2ac6af78-4b3b-44af-af1f-30a6799c6252	11	0	2026-02-27 15:37:34.155919+00	2026-02-27 15:37:34.155919+00
47a66d8a-0d4f-41e0-9909-742431c685ad	bf455f21-2e53-416a-a134-8b4a81588db3	0c78b852-f0da-4c94-98e4-edec2fb5db86	8	0	2026-02-27 15:37:34.167834+00	2026-02-27 15:37:34.167834+00
b856f276-61e7-43c2-b474-0968ea71a0f2	bf455f21-2e53-416a-a134-8b4a81588db3	f74d63ae-07a3-4c68-8f2f-46893bbc9e9e	11	0	2026-02-27 15:37:34.179707+00	2026-02-27 15:37:34.179707+00
1aee86aa-6383-47e9-8bb7-e1f5b078c374	bf455f21-2e53-416a-a134-8b4a81588db3	c37b119f-bf91-4395-9459-e4e119f5950f	11	0	2026-02-27 15:37:34.196471+00	2026-02-27 15:37:34.196471+00
c8fc9c01-feb3-4a57-b779-17484f0aba6c	bf455f21-2e53-416a-a134-8b4a81588db3	c33b8b04-6396-4134-92ee-275bfc45fc03	11	0	2026-02-27 15:37:34.209976+00	2026-02-27 15:37:34.209976+00
4697e6f9-3f72-460e-9052-e4538f4f4fa0	bf455f21-2e53-416a-a134-8b4a81588db3	9138cd6e-6570-4ba3-b0ab-ec113a0752a3	11	0	2026-02-27 15:37:34.227919+00	2026-02-27 15:37:34.227919+00
68b180b8-c447-42dd-8f9a-ec2cbb7ef7b0	bf455f21-2e53-416a-a134-8b4a81588db3	02f72c61-eae2-4684-8b7a-4a35b80aa98d	11	0	2026-02-27 15:37:34.241426+00	2026-02-27 15:37:34.241426+00
ee2db9e8-d11a-498f-ab20-2d7d54b67950	bf455f21-2e53-416a-a134-8b4a81588db3	f331b1b4-05f4-4b1a-b51d-04bc55d3e906	9	0	2026-02-27 15:37:34.256827+00	2026-02-27 15:37:34.256827+00
4c776189-dd70-4ab8-aa1f-d0a90340e8f9	bf455f21-2e53-416a-a134-8b4a81588db3	a9d0f78c-2ad8-4ca8-9972-989bc6ad2210	9	0	2026-02-27 15:37:34.268861+00	2026-02-27 15:37:34.268861+00
4b000f7f-8e52-4fda-bc57-467dd44cf275	bf455f21-2e53-416a-a134-8b4a81588db3	06289415-f346-4ed5-b962-3defa32305ea	8	736	2026-02-27 15:37:34.279732+00	2026-02-27 15:37:34.279732+00
e5e8605f-aea7-41bc-90c8-c0abf9938abf	bf455f21-2e53-416a-a134-8b4a81588db3	25c9758f-4ccc-4c87-90a5-1a89eb250b8c	9	0	2026-02-27 15:37:34.291192+00	2026-02-27 15:37:34.291192+00
4e9d80a2-5d78-4f7c-983d-63d7cb92f2b3	bf455f21-2e53-416a-a134-8b4a81588db3	5f531534-e23d-4bcc-a522-c993385b4fee	9	0	2026-02-27 15:37:34.30482+00	2026-02-27 15:37:34.30482+00
d2e1f5b0-bbfe-43df-9805-ab85b31c3def	bf455f21-2e53-416a-a134-8b4a81588db3	3556916d-f611-4449-93af-a1ae3a80dd8c	8	0	2026-02-27 15:37:34.315922+00	2026-02-27 15:37:34.315922+00
5288a71e-33b4-457b-9ae1-209c9e8b080f	bf455f21-2e53-416a-a134-8b4a81588db3	a57e4b1e-5be9-4287-8d82-4b6a5cb9f36a	8	625	2026-02-27 15:37:34.327235+00	2026-02-27 15:37:34.327235+00
cd4efbea-e03f-4a7d-9846-feebaabcc54a	bf455f21-2e53-416a-a134-8b4a81588db3	52ced91f-772d-4bdf-8e83-537d4f400656	8	706	2026-02-27 15:37:34.336506+00	2026-02-27 15:37:34.336506+00
be6544db-f6ce-4c09-98e8-dfc92af4cd5e	bf455f21-2e53-416a-a134-8b4a81588db3	199d0864-4816-454a-b092-150d24c50301	8	503	2026-02-27 15:37:34.346969+00	2026-02-27 15:37:34.346969+00
21a17050-7060-4e4f-b9fa-e04c22242792	bf455f21-2e53-416a-a134-8b4a81588db3	8a874046-3354-43e2-a779-59d64cead7f3	8	569	2026-02-27 15:37:34.35721+00	2026-02-27 15:37:34.35721+00
cc924a4c-dd6f-47d9-9cd8-f50819c87fde	bf455f21-2e53-416a-a134-8b4a81588db3	90a7beec-10ce-4f80-be1c-b98486116d04	7	105	2026-02-27 15:37:34.36594+00	2026-02-27 15:37:34.36594+00
84c19f4d-d1ff-4ab9-ac63-7753a20dc0c0	bf455f21-2e53-416a-a134-8b4a81588db3	c624a2cf-7cf9-442b-8ef8-40a347ff229a	8	761	2026-02-27 15:37:34.376879+00	2026-02-27 15:37:34.376879+00
1fe590ad-237d-4aa0-a407-a7f034106285	bf455f21-2e53-416a-a134-8b4a81588db3	1b04f2df-393c-4f43-b2fb-b453bb576d41	9	0	2026-02-27 15:37:34.387512+00	2026-02-27 15:37:34.387512+00
977e61c2-3bdd-4385-b6f3-37cc6cec43d9	bf455f21-2e53-416a-a134-8b4a81588db3	3ab3e578-d903-4dfd-bedd-93010264ee63	8	738	2026-02-27 15:37:34.39691+00	2026-02-27 15:37:34.39691+00
b42c4244-6c2d-4ed1-a150-c2a19688562b	bf455f21-2e53-416a-a134-8b4a81588db3	7c8a992f-510c-4e7d-8b4d-572ec1ed3725	8	798	2026-02-27 15:37:34.407274+00	2026-02-27 15:37:34.407274+00
3031d7e2-4130-4ec0-b41d-5a52f619d162	bf455f21-2e53-416a-a134-8b4a81588db3	630a65a6-44dc-4543-8d01-d2f7e9d7b2fd	8	961	2026-02-27 15:37:34.418613+00	2026-02-27 15:37:34.418613+00
981aa255-b790-47b0-b1f3-714710d8a80a	bf455f21-2e53-416a-a134-8b4a81588db3	d572b7a5-a9e0-4a4e-953b-cb7bd97b0975	4	43	2026-02-27 15:37:34.427518+00	2026-02-27 15:37:34.427518+00
b748eba1-ca78-4123-99db-c18aea5f332d	bf455f21-2e53-416a-a134-8b4a81588db3	2d32365c-a923-4ed7-9aeb-25c61b649dc0	5	2	2026-02-27 15:37:34.439445+00	2026-02-27 15:37:34.439445+00
6560af07-dc49-4ed0-ba8e-48c866a6b406	bf455f21-2e53-416a-a134-8b4a81588db3	8c305d1d-f8b1-4574-9962-9a6067273af6	4	9	2026-02-27 15:37:34.450298+00	2026-02-27 15:37:34.450298+00
91cf6896-9742-463e-ae80-8fad6fdb24af	bf455f21-2e53-416a-a134-8b4a81588db3	a6c35329-4cbf-41c6-94aa-ae0fcfcdec7d	5	87	2026-02-27 15:37:34.461894+00	2026-02-27 15:37:34.461894+00
6ae9fc96-351e-429b-b2ab-9844976d3d21	bf455f21-2e53-416a-a134-8b4a81588db3	3ef19dd3-616c-4c7c-b19d-243152eee4a0	4	98	2026-02-27 15:37:34.474089+00	2026-02-27 15:37:34.474089+00
a0a91fce-9a47-4910-9ea1-b9407596ba51	bf455f21-2e53-416a-a134-8b4a81588db3	cb91b79d-fbec-4537-8d80-65c754c5e16e	1	149	2026-02-27 15:37:34.484295+00	2026-02-27 15:37:34.484295+00
ead3c53d-fa64-4f98-9219-6cf2ce34da74	bf455f21-2e53-416a-a134-8b4a81588db3	ed3a0524-36f4-451a-8f64-0ac897614a7a	1	33	2026-02-27 15:37:34.496275+00	2026-02-27 15:37:34.496275+00
8a4b8e21-dc79-4e45-bf49-d9dc30ec3af6	bf455f21-2e53-416a-a134-8b4a81588db3	b8d12405-5a88-40e6-a535-8c5182d06cae	4	56	2026-02-27 15:37:34.507815+00	2026-02-27 15:37:34.507815+00
3dd20e8d-671e-43ac-abb3-90d582e232a8	bf455f21-2e53-416a-a134-8b4a81588db3	a58db390-3e7a-41d7-b87e-c47813c1f4b5	7	240	2026-02-27 15:37:34.519752+00	2026-02-27 15:37:34.519752+00
72d01dea-2927-4fe9-aff6-edfa251ab7ab	bf455f21-2e53-416a-a134-8b4a81588db3	1647ff04-bf90-4d74-acc1-dee02f13ffde	2	75	2026-02-27 15:37:34.531671+00	2026-02-27 15:37:34.531671+00
33e7b754-cb17-4d81-a6ef-3072e49d3df4	bf455f21-2e53-416a-a134-8b4a81588db3	c1d92459-21f4-4936-8412-e3981b001e61	8	679	2026-02-27 15:37:34.543283+00	2026-02-27 15:37:34.543283+00
09ae2341-3f08-448c-b628-a5c9d2736a79	bf455f21-2e53-416a-a134-8b4a81588db3	ce5aee09-a8a3-460c-8087-0cff9cdc796f	8	730	2026-02-27 15:37:34.553856+00	2026-02-27 15:37:34.553856+00
7953b081-02de-441d-959d-62ac4bc2347b	bf455f21-2e53-416a-a134-8b4a81588db3	74f3f3fd-7871-4949-9343-2ec1597e8b3d	1	92	2026-02-27 15:37:34.563541+00	2026-02-27 15:37:34.563541+00
df7a0cc9-2de8-4d86-88ea-29aab5a03a11	bf455f21-2e53-416a-a134-8b4a81588db3	248a163d-b485-4638-9350-6be2adbad057	4	47	2026-02-27 15:37:34.573135+00	2026-02-27 15:37:34.573135+00
6b67055a-3b44-4b14-a4f9-4066f9beb0c2	bf455f21-2e53-416a-a134-8b4a81588db3	e49029a6-add6-4cdc-b410-ce6d496a8f1a	1	41	2026-02-27 15:37:34.582733+00	2026-02-27 15:37:34.582733+00
ccf61133-4162-4f94-976b-345f1954d885	bf455f21-2e53-416a-a134-8b4a81588db3	f0ebc467-81c6-4c36-9c9c-9550f3cac760	3	22	2026-02-27 15:37:34.593309+00	2026-02-27 15:37:34.593309+00
44ddb688-5b84-43e5-92cd-1e3b9c0f8310	bf455f21-2e53-416a-a134-8b4a81588db3	ebbf3acd-eebc-4824-b36c-2622804a0329	4	6	2026-02-27 15:37:34.602967+00	2026-02-27 15:37:34.602967+00
aa22e6ed-0c76-49ac-a91b-c183553eb213	bf455f21-2e53-416a-a134-8b4a81588db3	00b6f935-fb92-4232-9a35-b3df37c26fbf	4	5	2026-02-27 15:37:34.613679+00	2026-02-27 15:37:34.613679+00
2fcc21e8-ddd9-4ffa-a7b2-5ae641fc007d	bf455f21-2e53-416a-a134-8b4a81588db3	024d746e-c964-473a-bc40-ec5c1e8a42a5	4	41	2026-02-27 15:37:34.623302+00	2026-02-27 15:37:34.623302+00
0909f748-31ef-4b4f-95ed-34b900949a21	bf455f21-2e53-416a-a134-8b4a81588db3	c59159e4-5fa8-44da-a623-e171960dabf0	3	19	2026-02-27 15:37:34.633419+00	2026-02-27 15:37:34.633419+00
1ca52629-ccea-4ab1-8c0e-d2bb5aeb9a2e	bf455f21-2e53-416a-a134-8b4a81588db3	f546e1d2-4646-4c31-a61c-62c44787d422	4	18	2026-02-27 15:37:34.643891+00	2026-02-27 15:37:34.643891+00
13f7433b-eddf-4671-983a-fefdd08d6de8	bf455f21-2e53-416a-a134-8b4a81588db3	cb778598-6bc0-4060-8353-7b744d70badf	3	10	2026-02-27 15:37:34.652982+00	2026-02-27 15:37:34.652982+00
bcd097ca-66cf-438c-bc80-0a8ee8664293	bf455f21-2e53-416a-a134-8b4a81588db3	7da0615d-a2b7-4506-840e-69354ffed927	4	2	2026-02-27 15:37:34.661956+00	2026-02-27 15:37:34.661956+00
42523943-b3d4-43a5-99a4-706ad7f5c156	bf455f21-2e53-416a-a134-8b4a81588db3	da9bd825-9c13-4a37-96c8-2c07ba291dd2	5	215	2026-02-27 15:37:34.671595+00	2026-02-27 15:37:34.671595+00
296ea1c8-2197-4f84-bb71-785ae996ab44	bf455f21-2e53-416a-a134-8b4a81588db3	000bf551-c697-445a-91c6-b8450a783356	2	5	2026-02-27 15:37:34.680914+00	2026-02-27 15:37:34.680914+00
64347c7c-a05e-49ae-b152-f88060eb7f63	bf455f21-2e53-416a-a134-8b4a81588db3	a6ed8cc0-ca65-402e-80ae-a43855b48c21	1	10	2026-02-27 15:37:34.691323+00	2026-02-27 15:37:34.691323+00
ed70f260-42c5-47ec-bfbb-8c501da1e1c3	bf455f21-2e53-416a-a134-8b4a81588db3	a491f88c-3a6d-4fd4-b015-89c2c7a70c1d	1	22	2026-02-27 15:37:34.702554+00	2026-02-27 15:37:34.702554+00
2558d61f-f15c-4000-b859-125c320b1388	bf455f21-2e53-416a-a134-8b4a81588db3	c98e3c8b-a160-4810-bf54-ad5b7a59ba2b	1	50	2026-02-27 15:37:34.713136+00	2026-02-27 15:37:34.713136+00
c5768d0e-204b-41e7-b093-d21e4554b2ca	bf455f21-2e53-416a-a134-8b4a81588db3	499fa3af-30ea-457e-8e27-6d3be79b62e2	1	19	2026-02-27 15:37:34.722953+00	2026-02-27 15:37:34.722953+00
54e7b2c7-586a-42ef-8220-f40f4df6e07b	bf455f21-2e53-416a-a134-8b4a81588db3	c27c893f-3b15-46c2-8918-4f2bdc248f28	1	10	2026-02-27 15:37:34.731714+00	2026-02-27 15:37:34.731714+00
ad83a701-c4e7-4702-ae07-cc10169be6aa	bf455f21-2e53-416a-a134-8b4a81588db3	78f25c26-5f36-4265-9454-a5a9c9aad122	1	16	2026-02-27 15:37:34.742876+00	2026-02-27 15:37:34.742876+00
4fb5b829-a283-4ffd-bd47-e52199a35adb	bf455f21-2e53-416a-a134-8b4a81588db3	5fb341fd-4f26-47bf-8548-7133cafc75a7	3	6	2026-02-27 15:37:34.753573+00	2026-02-27 15:37:34.753573+00
2c0b0a1b-c99d-4f66-96a4-c003b09d4228	bf455f21-2e53-416a-a134-8b4a81588db3	99afbb72-56df-4e64-8925-d3c1dd5ae3fa	1	3	2026-02-27 15:37:34.762139+00	2026-02-27 15:37:34.762139+00
b1e6648d-5993-49c2-958c-e1fa08769c37	bf455f21-2e53-416a-a134-8b4a81588db3	fd6f6a51-71ee-4a28-9f35-1cc7a6874683	1	5	2026-02-27 15:37:34.773338+00	2026-02-27 15:37:34.773338+00
d9a9ef7f-d807-49d0-81e9-10cb82498f6f	bf455f21-2e53-416a-a134-8b4a81588db3	23a49c1b-2272-4b82-8c52-30abfda78e9d	1	1	2026-02-27 15:37:34.78063+00	2026-02-27 15:37:34.78063+00
9619178e-6d53-4172-828a-97199d7f52b9	bf455f21-2e53-416a-a134-8b4a81588db3	4cc5f807-b7b7-46ba-bccc-701b168e9ab9	11	0	2026-02-27 15:37:34.792436+00	2026-02-27 15:37:34.792436+00
ed050480-4cd8-4527-97d3-ed553caeeb91	bf455f21-2e53-416a-a134-8b4a81588db3	89fd6084-ee69-4ec3-8ee4-617c18ba4d89	4	2	2026-02-27 15:37:34.803617+00	2026-02-27 15:37:34.803617+00
1eea8023-dc94-4545-8eaf-78d60044dbce	bf455f21-2e53-416a-a134-8b4a81588db3	76b25394-2a3f-4ede-93f4-56fe518691a8	2	8	2026-02-27 15:37:34.812623+00	2026-02-27 15:37:34.812623+00
03d002d9-55db-4b05-a83b-7e085bada058	bf455f21-2e53-416a-a134-8b4a81588db3	2af4fd3f-45e8-403f-8ce0-f98fc5950e9d	2	39	2026-02-27 15:37:34.822554+00	2026-02-27 15:37:34.822554+00
494a0ecb-cb06-4b04-8282-01313fca8afa	bf455f21-2e53-416a-a134-8b4a81588db3	c69f43ed-007b-4e13-a9e1-9cff3fa5405f	1	13	2026-02-27 15:37:34.832592+00	2026-02-27 15:37:34.832592+00
20caf5f8-6f72-4fc8-8c61-c11971b137ff	bf455f21-2e53-416a-a134-8b4a81588db3	4f633dbe-ccaa-4568-b151-bff7ad66f6d9	2	35	2026-02-27 15:37:34.842443+00	2026-02-27 15:37:34.842443+00
3ca98f83-8f1a-4fc8-b3de-7b2025325973	bf455f21-2e53-416a-a134-8b4a81588db3	e38f5480-1d16-44c6-9a4a-65117700ee0c	1	4	2026-02-27 15:37:34.853375+00	2026-02-27 15:37:34.853375+00
a55b699d-dfda-4483-a45a-add4a6d935fd	bf455f21-2e53-416a-a134-8b4a81588db3	5deeef04-c803-4281-9423-fd85b03776c6	1	6	2026-02-27 15:37:34.862801+00	2026-02-27 15:37:34.862801+00
b21db3e8-7163-46c5-b2bc-1f87ab797f52	bf455f21-2e53-416a-a134-8b4a81588db3	ff8a3d96-c99b-4445-b591-89447639108d	11	0	2026-02-27 15:37:33.965644+00	2026-02-27 15:38:54.470562+00
\.


--
-- Data for Name: user_track_guide_drivers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_track_guide_drivers (id, track_guide_id, driver_id, recommended_boost_id, track_strategy, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: user_track_guides; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_track_guides (id, user_id, track_id, gp_level, suggested_drivers, free_boost_id, suggested_boosts, saved_setup_id, setup_notes, dry_strategy, wet_strategy, driver_1_dry_strategy, driver_1_wet_strategy, driver_2_dry_strategy, driver_2_wet_strategy, notes, driver_1_id, driver_2_id, driver_1_boost_id, driver_2_boost_id, alt_driver_ids, alt_boost_ids, created_at, updated_at, alternate_driver_ids) FROM stdin;
fc593d46-4c1b-4d3e-b1cb-d140dc4311a9	bf455f21-2e53-416a-a134-8b4a81588db3	3e1354cb-1d37-4b10-b20a-f1b1dbfab419	1	[]	\N	[]	\N	\N			\N	\N	\N	\N		\N	\N	\N	\N	[]	[]	2026-02-27 15:37:35.405142+00	2026-02-27 15:37:35.405142+00	\N
2d0ae854-a179-4a2f-8ade-0784640d6bef	bf455f21-2e53-416a-a134-8b4a81588db3	3e1354cb-1d37-4b10-b20a-f1b1dbfab419	2	[]	\N	[]	\N	\N			\N	\N	\N	\N		\N	\N	\N	\N	[]	[]	2026-02-27 15:37:35.418959+00	2026-02-27 15:37:35.418959+00	\N
8fd70d0f-e8ee-44a7-8a8a-cd6ccc12dca1	bf455f21-2e53-416a-a134-8b4a81588db3	3e1354cb-1d37-4b10-b20a-f1b1dbfab419	3	[]	\N	[]	\N	\N			\N	\N	\N	\N		\N	630a65a6-44dc-4543-8d01-d2f7e9d7b2fd	\N	\N	["da58684f-a197-499c-a97d-ba93104de565", "a58db390-3e7a-41d7-b87e-c47813c1f4b5", "4cc5f807-b7b7-46ba-bccc-701b168e9ab9"]	[]	2026-02-27 15:37:35.42939+00	2026-02-27 15:37:35.42939+00	\N
cc23cf9b-d782-4a81-a439-b14a065da354	bf455f21-2e53-416a-a134-8b4a81588db3	00000000-0000-0000-0000-000000000005	0	[]	\N	[]	\N	\N			\N	\N	\N	\N		\N	\N	\N	\N	[]	[]	2026-02-27 15:37:35.457457+00	2026-02-27 15:37:35.457457+00	\N
170a8b98-fb7f-4234-9691-39c13d7b693a	bf455f21-2e53-416a-a134-8b4a81588db3	00000000-0000-0000-0000-000000000005	2	[]	\N	[]	\N	Corner + Mach 3			4m3s	\N	3s4m	\N	Palm is boost\nPit Start\ndon't run on hards. switch to 2s2s3m if needed	90a7beec-10ce-4f80-be1c-b98486116d04	630a65a6-44dc-4543-8d01-d2f7e9d7b2fd	fe071b34-adcc-4acc-9612-f4a31adb40a0	fe071b34-adcc-4acc-9612-f4a31adb40a0	[]	[]	2026-02-27 15:37:35.465844+00	2026-02-27 15:37:35.465844+00	\N
778be223-fa53-40d4-93e5-8639250194eb	bf455f21-2e53-416a-a134-8b4a81588db3	00000000-0000-0000-0000-000000000005	3	[]	\N	[]	\N	\N			\N	\N	\N	\N		\N	\N	\N	\N	[]	[]	2026-02-27 15:37:35.47445+00	2026-02-27 15:37:35.47445+00	\N
322c52da-c3bf-4065-9c04-afda4d290d76	bf455f21-2e53-416a-a134-8b4a81588db3	00000000-0000-0000-0000-000000000005	1	[]	\N	[]	\N	\N			\N	\N	\N	\N		\N	\N	\N	\N	[]	[]	2026-02-27 15:37:35.482323+00	2026-02-27 15:37:35.482323+00	\N
a1de8523-d761-44ba-8c4b-129022154cfe	bf455f21-2e53-416a-a134-8b4a81588db3	3e1354cb-1d37-4b10-b20a-f1b1dbfab419	0	[]	\N	["fce48870-011d-4541-b3eb-fb85f6d5111b", "c8d6c623-d2ee-4eea-b9f6-e912bab8a5da", "2185b145-2c6c-4048-a9ad-188e83946a6d", "5e95bae0-76aa-4860-b2b1-a35c430676eb", "2d0556ef-eba9-4575-a688-c832d6f30195", "54eacc08-369e-4152-94a4-738997510723", "f9c50b1d-0928-4ecb-8d73-082d0b99c14b"]	\N	test			333	333	444	444	test	d63aca7f-0fd1-4315-be5e-9ef314e413bf	b7297703-e525-43f4-8a11-946fb9f6d5ae	3ff76b3b-382d-4e6f-a0d7-60765c58fc2c	03dbcf8a-096d-40ea-98f9-f1976c4a4559	["a58db390-3e7a-41d7-b87e-c47813c1f4b5", "da9bd825-9c13-4a37-96c8-2c07ba291dd2", "c2e5162f-9c89-493c-aa5d-a346cf23ca5d", "457bae19-cc8f-4a4c-95c0-d29a569d9797", "4cc5f807-b7b7-46ba-bccc-701b168e9ab9", "9d41ec96-e731-4c2f-aca0-350066d40834"]	[]	2026-02-27 15:37:35.490792+00	2026-02-27 15:37:35.490792+00	\N
\.


--
-- Data for Name: messages_2026_02_24; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.messages_2026_02_24 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- Data for Name: messages_2026_02_25; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.messages_2026_02_25 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- Data for Name: messages_2026_02_26; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.messages_2026_02_26 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- Data for Name: messages_2026_02_27; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.messages_2026_02_27 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- Data for Name: messages_2026_02_28; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.messages_2026_02_28 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- Data for Name: messages_2026_03_01; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.messages_2026_03_01 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- Data for Name: messages_2026_03_02; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.messages_2026_03_02 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.schema_migrations (version, inserted_at) FROM stdin;
20211116024918	2026-02-25 08:00:20
20211116045059	2026-02-25 08:00:20
20211116050929	2026-02-25 08:00:20
20211116051442	2026-02-25 08:00:20
20211116212300	2026-02-25 08:00:20
20211116213355	2026-02-25 08:00:20
20211116213934	2026-02-25 08:00:20
20211116214523	2026-02-25 08:00:20
20211122062447	2026-02-25 08:00:20
20211124070109	2026-02-25 08:00:20
20211202204204	2026-02-25 08:00:20
20211202204605	2026-02-25 08:00:20
20211210212804	2026-02-25 08:00:20
20211228014915	2026-02-25 08:00:20
20220107221237	2026-02-25 08:00:20
20220228202821	2026-02-25 08:00:20
20220312004840	2026-02-25 08:00:20
20220603231003	2026-02-25 08:00:20
20220603232444	2026-02-25 08:00:20
20220615214548	2026-02-25 08:00:20
20220712093339	2026-02-25 08:00:20
20220908172859	2026-02-25 08:00:20
20220916233421	2026-02-25 08:00:20
20230119133233	2026-02-25 08:00:20
20230128025114	2026-02-25 08:00:20
20230128025212	2026-02-25 08:00:20
20230227211149	2026-02-25 08:00:20
20230228184745	2026-02-25 08:00:20
20230308225145	2026-02-25 08:00:20
20230328144023	2026-02-25 08:00:20
20231018144023	2026-02-25 08:00:20
20231204144023	2026-02-25 08:00:20
20231204144024	2026-02-25 08:00:20
20231204144025	2026-02-25 08:00:20
20240108234812	2026-02-25 08:00:20
20240109165339	2026-02-25 08:00:20
20240227174441	2026-02-25 08:00:20
20240311171622	2026-02-25 08:00:20
20240321100241	2026-02-25 08:00:20
20240401105812	2026-02-25 08:00:20
20240418121054	2026-02-25 08:00:20
20240523004032	2026-02-25 08:00:20
20240618124746	2026-02-25 08:00:20
20240801235015	2026-02-25 08:00:20
20240805133720	2026-02-25 08:00:20
20240827160934	2026-02-25 08:00:20
20240919163303	2026-02-25 08:00:20
20240919163305	2026-02-25 08:00:20
20241019105805	2026-02-25 08:00:20
20241030150047	2026-02-25 08:00:20
20241108114728	2026-02-25 08:00:20
20241121104152	2026-02-25 08:00:20
20241130184212	2026-02-25 08:00:20
20241220035512	2026-02-25 08:00:20
20241220123912	2026-02-25 08:00:20
20241224161212	2026-02-25 08:00:20
20250107150512	2026-02-25 08:00:20
20250110162412	2026-02-25 08:00:20
20250123174212	2026-02-25 08:00:20
20250128220012	2026-02-25 08:00:20
20250506224012	2026-02-25 08:00:20
20250523164012	2026-02-25 08:00:20
20250714121412	2026-02-25 08:00:20
20250905041441	2026-02-25 08:00:20
20251103001201	2026-02-25 08:00:20
\.


--
-- Data for Name: subscription; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.subscription (id, subscription_id, entity, filters, claims, created_at) FROM stdin;
\.


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.buckets (id, name, owner, created_at, updated_at, public, avif_autodetection, file_size_limit, allowed_mime_types, owner_id, type) FROM stdin;
\.


--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.buckets_analytics (name, type, format, created_at, updated_at, id, deleted_at) FROM stdin;
\.


--
-- Data for Name: buckets_vectors; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.buckets_vectors (id, type, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: iceberg_namespaces; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.iceberg_namespaces (id, bucket_name, name, created_at, updated_at, metadata, catalog_id) FROM stdin;
\.


--
-- Data for Name: iceberg_tables; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.iceberg_tables (id, namespace_id, bucket_name, name, location, created_at, updated_at, remote_table_id, shard_key, shard_id, catalog_id) FROM stdin;
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.migrations (id, name, hash, executed_at) FROM stdin;
0	create-migrations-table	e18db593bcde2aca2a408c4d1100f6abba2195df	2026-02-25 08:00:24.067512
1	initialmigration	6ab16121fbaa08bbd11b712d05f358f9b555d777	2026-02-25 08:00:24.071648
2	storage-schema	f6a1fa2c93cbcd16d4e487b362e45fca157a8dbd	2026-02-25 08:00:24.073923
3	pathtoken-column	2cb1b0004b817b29d5b0a971af16bafeede4b70d	2026-02-25 08:00:24.083094
4	add-migrations-rls	427c5b63fe1c5937495d9c635c263ee7a5905058	2026-02-25 08:00:24.087998
5	add-size-functions	79e081a1455b63666c1294a440f8ad4b1e6a7f84	2026-02-25 08:00:24.089995
6	change-column-name-in-get-size	ded78e2f1b5d7e616117897e6443a925965b30d2	2026-02-25 08:00:24.092922
7	add-rls-to-buckets	e7e7f86adbc51049f341dfe8d30256c1abca17aa	2026-02-25 08:00:24.095726
8	add-public-to-buckets	fd670db39ed65f9d08b01db09d6202503ca2bab3	2026-02-25 08:00:24.097717
9	fix-search-function	af597a1b590c70519b464a4ab3be54490712796b	2026-02-25 08:00:24.099823
10	search-files-search-function	b595f05e92f7e91211af1bbfe9c6a13bb3391e16	2026-02-25 08:00:24.102165
11	add-trigger-to-auto-update-updated_at-column	7425bdb14366d1739fa8a18c83100636d74dcaa2	2026-02-25 08:00:24.104627
12	add-automatic-avif-detection-flag	8e92e1266eb29518b6a4c5313ab8f29dd0d08df9	2026-02-25 08:00:24.107259
13	add-bucket-custom-limits	cce962054138135cd9a8c4bcd531598684b25e7d	2026-02-25 08:00:24.109151
14	use-bytes-for-max-size	941c41b346f9802b411f06f30e972ad4744dad27	2026-02-25 08:00:24.11131
15	add-can-insert-object-function	934146bc38ead475f4ef4b555c524ee5d66799e5	2026-02-25 08:00:24.122208
16	add-version	76debf38d3fd07dcfc747ca49096457d95b1221b	2026-02-25 08:00:24.124632
17	drop-owner-foreign-key	f1cbb288f1b7a4c1eb8c38504b80ae2a0153d101	2026-02-25 08:00:24.126757
18	add_owner_id_column_deprecate_owner	e7a511b379110b08e2f214be852c35414749fe66	2026-02-25 08:00:24.128605
19	alter-default-value-objects-id	02e5e22a78626187e00d173dc45f58fa66a4f043	2026-02-25 08:00:24.131081
20	list-objects-with-delimiter	cd694ae708e51ba82bf012bba00caf4f3b6393b7	2026-02-25 08:00:24.133056
21	s3-multipart-uploads	8c804d4a566c40cd1e4cc5b3725a664a9303657f	2026-02-25 08:00:24.135911
22	s3-multipart-uploads-big-ints	9737dc258d2397953c9953d9b86920b8be0cdb73	2026-02-25 08:00:24.143188
23	optimize-search-function	9d7e604cddc4b56a5422dc68c9313f4a1b6f132c	2026-02-25 08:00:24.14839
24	operation-function	8312e37c2bf9e76bbe841aa5fda889206d2bf8aa	2026-02-25 08:00:24.150903
25	custom-metadata	d974c6057c3db1c1f847afa0e291e6165693b990	2026-02-25 08:00:24.153055
26	objects-prefixes	215cabcb7f78121892a5a2037a09fedf9a1ae322	2026-02-25 08:00:24.155392
27	search-v2	859ba38092ac96eb3964d83bf53ccc0b141663a6	2026-02-25 08:00:24.1573
28	object-bucket-name-sorting	c73a2b5b5d4041e39705814fd3a1b95502d38ce4	2026-02-25 08:00:24.159048
29	create-prefixes	ad2c1207f76703d11a9f9007f821620017a66c21	2026-02-25 08:00:24.160742
30	update-object-levels	2be814ff05c8252fdfdc7cfb4b7f5c7e17f0bed6	2026-02-25 08:00:24.162497
31	objects-level-index	b40367c14c3440ec75f19bbce2d71e914ddd3da0	2026-02-25 08:00:24.164257
32	backward-compatible-index-on-objects	e0c37182b0f7aee3efd823298fb3c76f1042c0f7	2026-02-25 08:00:24.165665
33	backward-compatible-index-on-prefixes	b480e99ed951e0900f033ec4eb34b5bdcb4e3d49	2026-02-25 08:00:24.167143
34	optimize-search-function-v1	ca80a3dc7bfef894df17108785ce29a7fc8ee456	2026-02-25 08:00:24.168657
35	add-insert-trigger-prefixes	458fe0ffd07ec53f5e3ce9df51bfdf4861929ccc	2026-02-25 08:00:24.17039
36	optimise-existing-functions	6ae5fca6af5c55abe95369cd4f93985d1814ca8f	2026-02-25 08:00:24.17197
37	add-bucket-name-length-trigger	3944135b4e3e8b22d6d4cbb568fe3b0b51df15c1	2026-02-25 08:00:24.173608
38	iceberg-catalog-flag-on-buckets	02716b81ceec9705aed84aa1501657095b32e5c5	2026-02-25 08:00:24.176002
39	add-search-v2-sort-support	6706c5f2928846abee18461279799ad12b279b78	2026-02-25 08:00:24.185927
40	fix-prefix-race-conditions-optimized	7ad69982ae2d372b21f48fc4829ae9752c518f6b	2026-02-25 08:00:24.187936
41	add-object-level-update-trigger	07fcf1a22165849b7a029deed059ffcde08d1ae0	2026-02-25 08:00:24.189833
42	rollback-prefix-triggers	771479077764adc09e2ea2043eb627503c034cd4	2026-02-25 08:00:24.19123
43	fix-object-level	84b35d6caca9d937478ad8a797491f38b8c2979f	2026-02-25 08:00:24.192956
44	vector-bucket-type	99c20c0ffd52bb1ff1f32fb992f3b351e3ef8fb3	2026-02-25 08:00:24.194543
45	vector-buckets	049e27196d77a7cb76497a85afae669d8b230953	2026-02-25 08:00:24.19658
46	buckets-objects-grants	fedeb96d60fefd8e02ab3ded9fbde05632f84aed	2026-02-25 08:00:24.201491
47	iceberg-table-metadata	649df56855c24d8b36dd4cc1aeb8251aa9ad42c2	2026-02-25 08:00:24.203366
48	iceberg-catalog-ids	e0e8b460c609b9999ccd0df9ad14294613eed939	2026-02-25 08:00:24.205629
49	buckets-objects-grants-postgres	072b1195d0d5a2f888af6b2302a1938dd94b8b3d	2026-02-25 08:00:24.222059
50	search-v2-optimised	6323ac4f850aa14e7387eb32102869578b5bd478	2026-02-25 08:00:24.224408
51	index-backward-compatible-search	2ee395d433f76e38bcd3856debaf6e0e5b674011	2026-02-25 08:00:24.235037
52	drop-not-used-indexes-and-functions	bb0cbc7f2206a5a41113363dd22556cc1afd6327	2026-02-25 08:00:24.236057
53	drop-index-lower-name	d0cb18777d9e2a98ebe0bc5cc7a42e57ebe41854	2026-02-25 08:00:24.241417
54	drop-index-object-level	6289e048b1472da17c31a7eba1ded625a6457e67	2026-02-25 08:00:24.24297
55	prevent-direct-deletes	262a4798d5e0f2e7c8970232e03ce8be695d5819	2026-02-25 08:00:24.244153
\.


--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.objects (id, bucket_id, name, owner, created_at, updated_at, last_accessed_at, metadata, version, owner_id, user_metadata) FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.s3_multipart_uploads (id, in_progress_size, upload_signature, bucket_id, key, version, owner_id, created_at, user_metadata) FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.s3_multipart_uploads_parts (id, upload_id, size, part_number, bucket_id, key, etag, owner_id, version, created_at) FROM stdin;
\.


--
-- Data for Name: vector_indexes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.vector_indexes (id, name, bucket_id, data_type, dimension, distance_metric, metadata_configuration, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: hooks; Type: TABLE DATA; Schema: supabase_functions; Owner: supabase_functions_admin
--

COPY supabase_functions.hooks (id, hook_table_id, hook_name, created_at, request_id) FROM stdin;
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: supabase_functions; Owner: supabase_functions_admin
--

COPY supabase_functions.migrations (version, inserted_at) FROM stdin;
initial	2026-02-25 08:00:08.618033+00
20210809183423_update_grants	2026-02-25 08:00:08.618033+00
\.


--
-- Data for Name: secrets; Type: TABLE DATA; Schema: vault; Owner: supabase_admin
--

COPY vault.secrets (id, name, description, secret, key_id, nonce, created_at, updated_at) FROM stdin;
\.


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('auth.refresh_tokens_id_seq', 67, true);


--
-- Name: subscription_id_seq; Type: SEQUENCE SET; Schema: realtime; Owner: supabase_admin
--

SELECT pg_catalog.setval('realtime.subscription_id_seq', 1, false);


--
-- Name: hooks_id_seq; Type: SEQUENCE SET; Schema: supabase_functions; Owner: supabase_functions_admin
--

SELECT pg_catalog.setval('supabase_functions.hooks_id_seq', 1, false);


--
-- Name: extensions extensions_pkey; Type: CONSTRAINT; Schema: _realtime; Owner: supabase_admin
--

ALTER TABLE ONLY _realtime.extensions
    ADD CONSTRAINT extensions_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: _realtime; Owner: supabase_admin
--

ALTER TABLE ONLY _realtime.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: tenants tenants_pkey; Type: CONSTRAINT; Schema: _realtime; Owner: supabase_admin
--

ALTER TABLE ONLY _realtime.tenants
    ADD CONSTRAINT tenants_pkey PRIMARY KEY (id);


--
-- Name: mfa_amr_claims amr_id_pk; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT amr_id_pk PRIMARY KEY (id);


--
-- Name: audit_log_entries audit_log_entries_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.audit_log_entries
    ADD CONSTRAINT audit_log_entries_pkey PRIMARY KEY (id);


--
-- Name: flow_state flow_state_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.flow_state
    ADD CONSTRAINT flow_state_pkey PRIMARY KEY (id);


--
-- Name: identities identities_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_pkey PRIMARY KEY (id);


--
-- Name: identities identities_provider_id_provider_unique; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_provider_id_provider_unique UNIQUE (provider_id, provider);


--
-- Name: instances instances_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.instances
    ADD CONSTRAINT instances_pkey PRIMARY KEY (id);


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_authentication_method_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_authentication_method_pkey UNIQUE (session_id, authentication_method);


--
-- Name: mfa_challenges mfa_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_pkey PRIMARY KEY (id);


--
-- Name: mfa_factors mfa_factors_last_challenged_at_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_last_challenged_at_key UNIQUE (last_challenged_at);


--
-- Name: mfa_factors mfa_factors_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_pkey PRIMARY KEY (id);


--
-- Name: oauth_authorizations oauth_authorizations_authorization_code_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_authorization_code_key UNIQUE (authorization_code);


--
-- Name: oauth_authorizations oauth_authorizations_authorization_id_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_authorization_id_key UNIQUE (authorization_id);


--
-- Name: oauth_authorizations oauth_authorizations_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_pkey PRIMARY KEY (id);


--
-- Name: oauth_client_states oauth_client_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_client_states
    ADD CONSTRAINT oauth_client_states_pkey PRIMARY KEY (id);


--
-- Name: oauth_clients oauth_clients_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_clients
    ADD CONSTRAINT oauth_clients_pkey PRIMARY KEY (id);


--
-- Name: oauth_consents oauth_consents_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_pkey PRIMARY KEY (id);


--
-- Name: oauth_consents oauth_consents_user_client_unique; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_user_client_unique UNIQUE (user_id, client_id);


--
-- Name: one_time_tokens one_time_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_token_unique; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_unique UNIQUE (token);


--
-- Name: saml_providers saml_providers_entity_id_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_entity_id_key UNIQUE (entity_id);


--
-- Name: saml_providers saml_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_pkey PRIMARY KEY (id);


--
-- Name: saml_relay_states saml_relay_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: sso_domains sso_domains_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_pkey PRIMARY KEY (id);


--
-- Name: sso_providers sso_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_providers
    ADD CONSTRAINT sso_providers_pkey PRIMARY KEY (id);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: boost_custom_names boost_custom_names_boost_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.boost_custom_names
    ADD CONSTRAINT boost_custom_names_boost_id_user_id_key UNIQUE (boost_id, user_id);


--
-- Name: boost_custom_names boost_custom_names_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.boost_custom_names
    ADD CONSTRAINT boost_custom_names_pkey PRIMARY KEY (id);


--
-- Name: boosts boosts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.boosts
    ADD CONSTRAINT boosts_pkey PRIMARY KEY (id);


--
-- Name: car_parts car_parts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.car_parts
    ADD CONSTRAINT car_parts_pkey PRIMARY KEY (id);


--
-- Name: collections collections_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.collections
    ADD CONSTRAINT collections_pkey PRIMARY KEY (id);


--
-- Name: drivers drivers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.drivers
    ADD CONSTRAINT drivers_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: seasons seasons_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.seasons
    ADD CONSTRAINT seasons_pkey PRIMARY KEY (id);


--
-- Name: tracks tracks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tracks
    ADD CONSTRAINT tracks_pkey PRIMARY KEY (id);


--
-- Name: user_boosts user_boosts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_boosts
    ADD CONSTRAINT user_boosts_pkey PRIMARY KEY (id);


--
-- Name: user_boosts user_boosts_user_id_boost_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_boosts
    ADD CONSTRAINT user_boosts_user_id_boost_id_key UNIQUE (user_id, boost_id);


--
-- Name: user_car_parts user_car_parts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_car_parts
    ADD CONSTRAINT user_car_parts_pkey PRIMARY KEY (id);


--
-- Name: user_car_parts user_car_parts_user_id_car_part_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_car_parts
    ADD CONSTRAINT user_car_parts_user_id_car_part_id_key UNIQUE (user_id, car_part_id);


--
-- Name: user_car_setups user_car_setups_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_car_setups
    ADD CONSTRAINT user_car_setups_pkey PRIMARY KEY (id);


--
-- Name: user_drivers user_drivers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_drivers
    ADD CONSTRAINT user_drivers_pkey PRIMARY KEY (id);


--
-- Name: user_drivers user_drivers_user_id_driver_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_drivers
    ADD CONSTRAINT user_drivers_user_id_driver_id_key UNIQUE (user_id, driver_id);


--
-- Name: user_track_guide_drivers user_track_guide_drivers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_track_guide_drivers
    ADD CONSTRAINT user_track_guide_drivers_pkey PRIMARY KEY (id);


--
-- Name: user_track_guides user_track_guides_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_track_guides
    ADD CONSTRAINT user_track_guides_pkey PRIMARY KEY (id);


--
-- Name: user_track_guides user_track_guides_user_id_track_id_gp_level_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_track_guides
    ADD CONSTRAINT user_track_guides_user_id_track_id_gp_level_key UNIQUE (user_id, track_id, gp_level);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE ONLY realtime.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2026_02_24 messages_2026_02_24_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages_2026_02_24
    ADD CONSTRAINT messages_2026_02_24_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2026_02_25 messages_2026_02_25_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages_2026_02_25
    ADD CONSTRAINT messages_2026_02_25_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2026_02_26 messages_2026_02_26_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages_2026_02_26
    ADD CONSTRAINT messages_2026_02_26_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2026_02_27 messages_2026_02_27_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages_2026_02_27
    ADD CONSTRAINT messages_2026_02_27_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2026_02_28 messages_2026_02_28_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages_2026_02_28
    ADD CONSTRAINT messages_2026_02_28_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2026_03_01 messages_2026_03_01_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages_2026_03_01
    ADD CONSTRAINT messages_2026_03_01_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2026_03_02 messages_2026_03_02_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages_2026_03_02
    ADD CONSTRAINT messages_2026_03_02_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: subscription pk_subscription; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.subscription
    ADD CONSTRAINT pk_subscription PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: buckets_analytics buckets_analytics_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.buckets_analytics
    ADD CONSTRAINT buckets_analytics_pkey PRIMARY KEY (id);


--
-- Name: buckets buckets_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.buckets
    ADD CONSTRAINT buckets_pkey PRIMARY KEY (id);


--
-- Name: buckets_vectors buckets_vectors_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.buckets_vectors
    ADD CONSTRAINT buckets_vectors_pkey PRIMARY KEY (id);


--
-- Name: iceberg_namespaces iceberg_namespaces_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.iceberg_namespaces
    ADD CONSTRAINT iceberg_namespaces_pkey PRIMARY KEY (id);


--
-- Name: iceberg_tables iceberg_tables_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.iceberg_tables
    ADD CONSTRAINT iceberg_tables_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_name_key; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_name_key UNIQUE (name);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: objects objects_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT objects_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_pkey PRIMARY KEY (id);


--
-- Name: vector_indexes vector_indexes_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.vector_indexes
    ADD CONSTRAINT vector_indexes_pkey PRIMARY KEY (id);


--
-- Name: hooks hooks_pkey; Type: CONSTRAINT; Schema: supabase_functions; Owner: supabase_functions_admin
--

ALTER TABLE ONLY supabase_functions.hooks
    ADD CONSTRAINT hooks_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: supabase_functions; Owner: supabase_functions_admin
--

ALTER TABLE ONLY supabase_functions.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (version);


--
-- Name: extensions_tenant_external_id_index; Type: INDEX; Schema: _realtime; Owner: supabase_admin
--

CREATE INDEX extensions_tenant_external_id_index ON _realtime.extensions USING btree (tenant_external_id);


--
-- Name: extensions_tenant_external_id_type_index; Type: INDEX; Schema: _realtime; Owner: supabase_admin
--

CREATE UNIQUE INDEX extensions_tenant_external_id_type_index ON _realtime.extensions USING btree (tenant_external_id, type);


--
-- Name: tenants_external_id_index; Type: INDEX; Schema: _realtime; Owner: supabase_admin
--

CREATE UNIQUE INDEX tenants_external_id_index ON _realtime.tenants USING btree (external_id);


--
-- Name: audit_logs_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX audit_logs_instance_id_idx ON auth.audit_log_entries USING btree (instance_id);


--
-- Name: confirmation_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX confirmation_token_idx ON auth.users USING btree (confirmation_token) WHERE ((confirmation_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_current_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX email_change_token_current_idx ON auth.users USING btree (email_change_token_current) WHERE ((email_change_token_current)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_new_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX email_change_token_new_idx ON auth.users USING btree (email_change_token_new) WHERE ((email_change_token_new)::text !~ '^[0-9 ]*$'::text);


--
-- Name: factor_id_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX factor_id_created_at_idx ON auth.mfa_factors USING btree (user_id, created_at);


--
-- Name: flow_state_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX flow_state_created_at_idx ON auth.flow_state USING btree (created_at DESC);


--
-- Name: identities_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX identities_email_idx ON auth.identities USING btree (email text_pattern_ops);


--
-- Name: INDEX identities_email_idx; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON INDEX auth.identities_email_idx IS 'Auth: Ensures indexed queries on the email column';


--
-- Name: identities_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX identities_user_id_idx ON auth.identities USING btree (user_id);


--
-- Name: idx_auth_code; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_auth_code ON auth.flow_state USING btree (auth_code);


--
-- Name: idx_oauth_client_states_created_at; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_oauth_client_states_created_at ON auth.oauth_client_states USING btree (created_at);


--
-- Name: idx_user_id_auth_method; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_user_id_auth_method ON auth.flow_state USING btree (user_id, authentication_method);


--
-- Name: mfa_challenge_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX mfa_challenge_created_at_idx ON auth.mfa_challenges USING btree (created_at DESC);


--
-- Name: mfa_factors_user_friendly_name_unique; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX mfa_factors_user_friendly_name_unique ON auth.mfa_factors USING btree (friendly_name, user_id) WHERE (TRIM(BOTH FROM friendly_name) <> ''::text);


--
-- Name: mfa_factors_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX mfa_factors_user_id_idx ON auth.mfa_factors USING btree (user_id);


--
-- Name: oauth_auth_pending_exp_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_auth_pending_exp_idx ON auth.oauth_authorizations USING btree (expires_at) WHERE (status = 'pending'::auth.oauth_authorization_status);


--
-- Name: oauth_clients_deleted_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_clients_deleted_at_idx ON auth.oauth_clients USING btree (deleted_at);


--
-- Name: oauth_consents_active_client_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_consents_active_client_idx ON auth.oauth_consents USING btree (client_id) WHERE (revoked_at IS NULL);


--
-- Name: oauth_consents_active_user_client_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_consents_active_user_client_idx ON auth.oauth_consents USING btree (user_id, client_id) WHERE (revoked_at IS NULL);


--
-- Name: oauth_consents_user_order_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_consents_user_order_idx ON auth.oauth_consents USING btree (user_id, granted_at DESC);


--
-- Name: one_time_tokens_relates_to_hash_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX one_time_tokens_relates_to_hash_idx ON auth.one_time_tokens USING hash (relates_to);


--
-- Name: one_time_tokens_token_hash_hash_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX one_time_tokens_token_hash_hash_idx ON auth.one_time_tokens USING hash (token_hash);


--
-- Name: one_time_tokens_user_id_token_type_key; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX one_time_tokens_user_id_token_type_key ON auth.one_time_tokens USING btree (user_id, token_type);


--
-- Name: reauthentication_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX reauthentication_token_idx ON auth.users USING btree (reauthentication_token) WHERE ((reauthentication_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: recovery_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX recovery_token_idx ON auth.users USING btree (recovery_token) WHERE ((recovery_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: refresh_tokens_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_instance_id_idx ON auth.refresh_tokens USING btree (instance_id);


--
-- Name: refresh_tokens_instance_id_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_instance_id_user_id_idx ON auth.refresh_tokens USING btree (instance_id, user_id);


--
-- Name: refresh_tokens_parent_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_parent_idx ON auth.refresh_tokens USING btree (parent);


--
-- Name: refresh_tokens_session_id_revoked_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_session_id_revoked_idx ON auth.refresh_tokens USING btree (session_id, revoked);


--
-- Name: refresh_tokens_updated_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_updated_at_idx ON auth.refresh_tokens USING btree (updated_at DESC);


--
-- Name: saml_providers_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_providers_sso_provider_id_idx ON auth.saml_providers USING btree (sso_provider_id);


--
-- Name: saml_relay_states_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_created_at_idx ON auth.saml_relay_states USING btree (created_at DESC);


--
-- Name: saml_relay_states_for_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_for_email_idx ON auth.saml_relay_states USING btree (for_email);


--
-- Name: saml_relay_states_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_sso_provider_id_idx ON auth.saml_relay_states USING btree (sso_provider_id);


--
-- Name: sessions_not_after_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sessions_not_after_idx ON auth.sessions USING btree (not_after DESC);


--
-- Name: sessions_oauth_client_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sessions_oauth_client_id_idx ON auth.sessions USING btree (oauth_client_id);


--
-- Name: sessions_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sessions_user_id_idx ON auth.sessions USING btree (user_id);


--
-- Name: sso_domains_domain_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX sso_domains_domain_idx ON auth.sso_domains USING btree (lower(domain));


--
-- Name: sso_domains_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sso_domains_sso_provider_id_idx ON auth.sso_domains USING btree (sso_provider_id);


--
-- Name: sso_providers_resource_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX sso_providers_resource_id_idx ON auth.sso_providers USING btree (lower(resource_id));


--
-- Name: sso_providers_resource_id_pattern_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sso_providers_resource_id_pattern_idx ON auth.sso_providers USING btree (resource_id text_pattern_ops);


--
-- Name: unique_phone_factor_per_user; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX unique_phone_factor_per_user ON auth.mfa_factors USING btree (user_id, phone);


--
-- Name: user_id_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX user_id_created_at_idx ON auth.sessions USING btree (user_id, created_at);


--
-- Name: users_email_partial_key; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX users_email_partial_key ON auth.users USING btree (email) WHERE (is_sso_user = false);


--
-- Name: INDEX users_email_partial_key; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON INDEX auth.users_email_partial_key IS 'Auth: A partial unique index that applies only when is_sso_user is false';


--
-- Name: users_instance_id_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_instance_id_email_idx ON auth.users USING btree (instance_id, lower((email)::text));


--
-- Name: users_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_instance_id_idx ON auth.users USING btree (instance_id);


--
-- Name: users_is_anonymous_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_is_anonymous_idx ON auth.users USING btree (is_anonymous);


--
-- Name: idx_boosts_rarity; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_boosts_rarity ON public.boosts USING btree (rarity);


--
-- Name: idx_boosts_season_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_boosts_season_id ON public.boosts USING btree (season_id);


--
-- Name: idx_car_parts_rarity; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_car_parts_rarity ON public.car_parts USING btree (rarity);


--
-- Name: idx_car_parts_season_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_car_parts_season_id ON public.car_parts USING btree (season_id);


--
-- Name: idx_car_parts_series; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_car_parts_series ON public.car_parts USING btree (series);


--
-- Name: idx_car_parts_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_car_parts_type ON public.car_parts USING btree (car_part_type);


--
-- Name: idx_collections_ordinal; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_collections_ordinal ON public.collections USING btree (ordinal);


--
-- Name: idx_collections_season; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_collections_season ON public.collections USING btree (season);


--
-- Name: idx_drivers_rarity; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_drivers_rarity ON public.drivers USING btree (rarity);


--
-- Name: idx_drivers_season_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_drivers_season_id ON public.drivers USING btree (season_id);


--
-- Name: idx_drivers_series; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_drivers_series ON public.drivers USING btree (series);


--
-- Name: idx_tracks_season_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tracks_season_id ON public.tracks USING btree (season_id);


--
-- Name: idx_user_boosts_boost_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_boosts_boost_id ON public.user_boosts USING btree (boost_id);


--
-- Name: idx_user_boosts_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_boosts_user_id ON public.user_boosts USING btree (user_id);


--
-- Name: idx_user_car_parts_car_part_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_car_parts_car_part_id ON public.user_car_parts USING btree (car_part_id);


--
-- Name: idx_user_car_parts_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_car_parts_user_id ON public.user_car_parts USING btree (user_id);


--
-- Name: idx_user_car_setups_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_car_setups_user_id ON public.user_car_setups USING btree (user_id);


--
-- Name: idx_user_drivers_driver_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_drivers_driver_id ON public.user_drivers USING btree (driver_id);


--
-- Name: idx_user_drivers_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_drivers_user_id ON public.user_drivers USING btree (user_id);


--
-- Name: idx_user_track_guides_track_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_track_guides_track_id ON public.user_track_guides USING btree (track_id);


--
-- Name: idx_user_track_guides_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_track_guides_user_id ON public.user_track_guides USING btree (user_id);


--
-- Name: ix_realtime_subscription_entity; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE INDEX ix_realtime_subscription_entity ON realtime.subscription USING btree (entity);


--
-- Name: messages_inserted_at_topic_index; Type: INDEX; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE INDEX messages_inserted_at_topic_index ON ONLY realtime.messages USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: messages_2026_02_24_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE INDEX messages_2026_02_24_inserted_at_topic_idx ON realtime.messages_2026_02_24 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: messages_2026_02_25_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE INDEX messages_2026_02_25_inserted_at_topic_idx ON realtime.messages_2026_02_25 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: messages_2026_02_26_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE INDEX messages_2026_02_26_inserted_at_topic_idx ON realtime.messages_2026_02_26 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: messages_2026_02_27_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE INDEX messages_2026_02_27_inserted_at_topic_idx ON realtime.messages_2026_02_27 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: messages_2026_02_28_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE INDEX messages_2026_02_28_inserted_at_topic_idx ON realtime.messages_2026_02_28 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: messages_2026_03_01_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE INDEX messages_2026_03_01_inserted_at_topic_idx ON realtime.messages_2026_03_01 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: messages_2026_03_02_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE INDEX messages_2026_03_02_inserted_at_topic_idx ON realtime.messages_2026_03_02 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: subscription_subscription_id_entity_filters_key; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE UNIQUE INDEX subscription_subscription_id_entity_filters_key ON realtime.subscription USING btree (subscription_id, entity, filters);


--
-- Name: bname; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX bname ON storage.buckets USING btree (name);


--
-- Name: bucketid_objname; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX bucketid_objname ON storage.objects USING btree (bucket_id, name);


--
-- Name: buckets_analytics_unique_name_idx; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX buckets_analytics_unique_name_idx ON storage.buckets_analytics USING btree (name) WHERE (deleted_at IS NULL);


--
-- Name: idx_iceberg_namespaces_bucket_id; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX idx_iceberg_namespaces_bucket_id ON storage.iceberg_namespaces USING btree (catalog_id, name);


--
-- Name: idx_iceberg_tables_location; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX idx_iceberg_tables_location ON storage.iceberg_tables USING btree (location);


--
-- Name: idx_iceberg_tables_namespace_id; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX idx_iceberg_tables_namespace_id ON storage.iceberg_tables USING btree (catalog_id, namespace_id, name);


--
-- Name: idx_multipart_uploads_list; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_multipart_uploads_list ON storage.s3_multipart_uploads USING btree (bucket_id, key, created_at);


--
-- Name: idx_objects_bucket_id_name; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_objects_bucket_id_name ON storage.objects USING btree (bucket_id, name COLLATE "C");


--
-- Name: idx_objects_bucket_id_name_lower; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_objects_bucket_id_name_lower ON storage.objects USING btree (bucket_id, lower(name) COLLATE "C");


--
-- Name: name_prefix_search; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX name_prefix_search ON storage.objects USING btree (name text_pattern_ops);


--
-- Name: vector_indexes_name_bucket_id_idx; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX vector_indexes_name_bucket_id_idx ON storage.vector_indexes USING btree (name, bucket_id);


--
-- Name: supabase_functions_hooks_h_table_id_h_name_idx; Type: INDEX; Schema: supabase_functions; Owner: supabase_functions_admin
--

CREATE INDEX supabase_functions_hooks_h_table_id_h_name_idx ON supabase_functions.hooks USING btree (hook_table_id, hook_name);


--
-- Name: supabase_functions_hooks_request_id_idx; Type: INDEX; Schema: supabase_functions; Owner: supabase_functions_admin
--

CREATE INDEX supabase_functions_hooks_request_id_idx ON supabase_functions.hooks USING btree (request_id);


--
-- Name: messages_2026_02_24_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2026_02_24_inserted_at_topic_idx;


--
-- Name: messages_2026_02_24_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2026_02_24_pkey;


--
-- Name: messages_2026_02_25_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2026_02_25_inserted_at_topic_idx;


--
-- Name: messages_2026_02_25_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2026_02_25_pkey;


--
-- Name: messages_2026_02_26_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2026_02_26_inserted_at_topic_idx;


--
-- Name: messages_2026_02_26_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2026_02_26_pkey;


--
-- Name: messages_2026_02_27_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2026_02_27_inserted_at_topic_idx;


--
-- Name: messages_2026_02_27_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2026_02_27_pkey;


--
-- Name: messages_2026_02_28_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2026_02_28_inserted_at_topic_idx;


--
-- Name: messages_2026_02_28_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2026_02_28_pkey;


--
-- Name: messages_2026_03_01_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2026_03_01_inserted_at_topic_idx;


--
-- Name: messages_2026_03_01_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2026_03_01_pkey;


--
-- Name: messages_2026_03_02_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2026_03_02_inserted_at_topic_idx;


--
-- Name: messages_2026_03_02_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2026_03_02_pkey;


--
-- Name: users on_auth_user_created; Type: TRIGGER; Schema: auth; Owner: supabase_auth_admin
--

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


--
-- Name: boost_custom_names handle_updated_at_boost_custom_names; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER handle_updated_at_boost_custom_names BEFORE UPDATE ON public.boost_custom_names FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: boosts handle_updated_at_boosts; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER handle_updated_at_boosts BEFORE UPDATE ON public.boosts FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: car_parts handle_updated_at_car_parts; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER handle_updated_at_car_parts BEFORE UPDATE ON public.car_parts FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: drivers handle_updated_at_drivers; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER handle_updated_at_drivers BEFORE UPDATE ON public.drivers FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: profiles handle_updated_at_profiles; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER handle_updated_at_profiles BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: seasons handle_updated_at_seasons; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER handle_updated_at_seasons BEFORE UPDATE ON public.seasons FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: tracks handle_updated_at_tracks; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER handle_updated_at_tracks BEFORE UPDATE ON public.tracks FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: user_boosts handle_updated_at_user_boosts; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER handle_updated_at_user_boosts BEFORE UPDATE ON public.user_boosts FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: user_car_parts handle_updated_at_user_car_parts; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER handle_updated_at_user_car_parts BEFORE UPDATE ON public.user_car_parts FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: user_car_setups handle_updated_at_user_car_setups; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER handle_updated_at_user_car_setups BEFORE UPDATE ON public.user_car_setups FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: user_drivers handle_updated_at_user_drivers; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER handle_updated_at_user_drivers BEFORE UPDATE ON public.user_drivers FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: user_track_guide_drivers handle_updated_at_user_track_guide_drivers; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER handle_updated_at_user_track_guide_drivers BEFORE UPDATE ON public.user_track_guide_drivers FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: user_track_guides handle_updated_at_user_track_guides; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER handle_updated_at_user_track_guides BEFORE UPDATE ON public.user_track_guides FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: subscription tr_check_filters; Type: TRIGGER; Schema: realtime; Owner: supabase_admin
--

CREATE TRIGGER tr_check_filters BEFORE INSERT OR UPDATE ON realtime.subscription FOR EACH ROW EXECUTE FUNCTION realtime.subscription_check_filters();


--
-- Name: buckets enforce_bucket_name_length_trigger; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER enforce_bucket_name_length_trigger BEFORE INSERT OR UPDATE OF name ON storage.buckets FOR EACH ROW EXECUTE FUNCTION storage.enforce_bucket_name_length();


--
-- Name: buckets protect_buckets_delete; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER protect_buckets_delete BEFORE DELETE ON storage.buckets FOR EACH STATEMENT EXECUTE FUNCTION storage.protect_delete();


--
-- Name: objects protect_objects_delete; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER protect_objects_delete BEFORE DELETE ON storage.objects FOR EACH STATEMENT EXECUTE FUNCTION storage.protect_delete();


--
-- Name: objects update_objects_updated_at; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER update_objects_updated_at BEFORE UPDATE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.update_updated_at_column();


--
-- Name: extensions extensions_tenant_external_id_fkey; Type: FK CONSTRAINT; Schema: _realtime; Owner: supabase_admin
--

ALTER TABLE ONLY _realtime.extensions
    ADD CONSTRAINT extensions_tenant_external_id_fkey FOREIGN KEY (tenant_external_id) REFERENCES _realtime.tenants(external_id) ON DELETE CASCADE;


--
-- Name: identities identities_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: mfa_challenges mfa_challenges_auth_factor_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_auth_factor_id_fkey FOREIGN KEY (factor_id) REFERENCES auth.mfa_factors(id) ON DELETE CASCADE;


--
-- Name: mfa_factors mfa_factors_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: oauth_authorizations oauth_authorizations_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: oauth_authorizations oauth_authorizations_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: oauth_consents oauth_consents_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: oauth_consents oauth_consents_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: one_time_tokens one_time_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: refresh_tokens refresh_tokens_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: saml_providers saml_providers_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_flow_state_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_flow_state_id_fkey FOREIGN KEY (flow_state_id) REFERENCES auth.flow_state(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_oauth_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_oauth_client_id_fkey FOREIGN KEY (oauth_client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: sso_domains sso_domains_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: boost_custom_names boost_custom_names_boost_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.boost_custom_names
    ADD CONSTRAINT boost_custom_names_boost_id_fkey FOREIGN KEY (boost_id) REFERENCES public.boosts(id) ON DELETE CASCADE;


--
-- Name: boost_custom_names boost_custom_names_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.boost_custom_names
    ADD CONSTRAINT boost_custom_names_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: boosts boosts_season_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.boosts
    ADD CONSTRAINT boosts_season_id_fkey FOREIGN KEY (season_id) REFERENCES public.seasons(id) ON DELETE SET NULL;


--
-- Name: car_parts car_parts_season_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.car_parts
    ADD CONSTRAINT car_parts_season_id_fkey FOREIGN KEY (season_id) REFERENCES public.seasons(id) ON DELETE SET NULL;


--
-- Name: drivers drivers_season_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.drivers
    ADD CONSTRAINT drivers_season_id_fkey FOREIGN KEY (season_id) REFERENCES public.seasons(id) ON DELETE SET NULL;


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: tracks tracks_season_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tracks
    ADD CONSTRAINT tracks_season_id_fkey FOREIGN KEY (season_id) REFERENCES public.seasons(id) ON DELETE SET NULL;


--
-- Name: user_boosts user_boosts_boost_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_boosts
    ADD CONSTRAINT user_boosts_boost_id_fkey FOREIGN KEY (boost_id) REFERENCES public.boosts(id) ON DELETE CASCADE;


--
-- Name: user_boosts user_boosts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_boosts
    ADD CONSTRAINT user_boosts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_car_parts user_car_parts_car_part_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_car_parts
    ADD CONSTRAINT user_car_parts_car_part_id_fkey FOREIGN KEY (car_part_id) REFERENCES public.car_parts(id) ON DELETE CASCADE;


--
-- Name: user_car_parts user_car_parts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_car_parts
    ADD CONSTRAINT user_car_parts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_car_setups user_car_setups_brake_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_car_setups
    ADD CONSTRAINT user_car_setups_brake_id_fkey FOREIGN KEY (brake_id) REFERENCES public.car_parts(id) ON DELETE SET NULL;


--
-- Name: user_car_setups user_car_setups_engine_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_car_setups
    ADD CONSTRAINT user_car_setups_engine_id_fkey FOREIGN KEY (engine_id) REFERENCES public.car_parts(id) ON DELETE SET NULL;


--
-- Name: user_car_setups user_car_setups_front_wing_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_car_setups
    ADD CONSTRAINT user_car_setups_front_wing_id_fkey FOREIGN KEY (front_wing_id) REFERENCES public.car_parts(id) ON DELETE SET NULL;


--
-- Name: user_car_setups user_car_setups_gearbox_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_car_setups
    ADD CONSTRAINT user_car_setups_gearbox_id_fkey FOREIGN KEY (gearbox_id) REFERENCES public.car_parts(id) ON DELETE SET NULL;


--
-- Name: user_car_setups user_car_setups_rear_wing_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_car_setups
    ADD CONSTRAINT user_car_setups_rear_wing_id_fkey FOREIGN KEY (rear_wing_id) REFERENCES public.car_parts(id) ON DELETE SET NULL;


--
-- Name: user_car_setups user_car_setups_suspension_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_car_setups
    ADD CONSTRAINT user_car_setups_suspension_id_fkey FOREIGN KEY (suspension_id) REFERENCES public.car_parts(id) ON DELETE SET NULL;


--
-- Name: user_car_setups user_car_setups_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_car_setups
    ADD CONSTRAINT user_car_setups_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_drivers user_drivers_driver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_drivers
    ADD CONSTRAINT user_drivers_driver_id_fkey FOREIGN KEY (driver_id) REFERENCES public.drivers(id) ON DELETE CASCADE;


--
-- Name: user_drivers user_drivers_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_drivers
    ADD CONSTRAINT user_drivers_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_track_guide_drivers user_track_guide_drivers_driver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_track_guide_drivers
    ADD CONSTRAINT user_track_guide_drivers_driver_id_fkey FOREIGN KEY (driver_id) REFERENCES public.drivers(id) ON DELETE CASCADE;


--
-- Name: user_track_guide_drivers user_track_guide_drivers_recommended_boost_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_track_guide_drivers
    ADD CONSTRAINT user_track_guide_drivers_recommended_boost_id_fkey FOREIGN KEY (recommended_boost_id) REFERENCES public.boosts(id) ON DELETE SET NULL;


--
-- Name: user_track_guide_drivers user_track_guide_drivers_track_guide_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_track_guide_drivers
    ADD CONSTRAINT user_track_guide_drivers_track_guide_id_fkey FOREIGN KEY (track_guide_id) REFERENCES public.user_track_guides(id) ON DELETE CASCADE;


--
-- Name: user_track_guides user_track_guides_driver_1_boost_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_track_guides
    ADD CONSTRAINT user_track_guides_driver_1_boost_id_fkey FOREIGN KEY (driver_1_boost_id) REFERENCES public.boosts(id) ON DELETE SET NULL;


--
-- Name: user_track_guides user_track_guides_driver_1_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_track_guides
    ADD CONSTRAINT user_track_guides_driver_1_id_fkey FOREIGN KEY (driver_1_id) REFERENCES public.drivers(id) ON DELETE SET NULL;


--
-- Name: user_track_guides user_track_guides_driver_2_boost_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_track_guides
    ADD CONSTRAINT user_track_guides_driver_2_boost_id_fkey FOREIGN KEY (driver_2_boost_id) REFERENCES public.boosts(id) ON DELETE SET NULL;


--
-- Name: user_track_guides user_track_guides_driver_2_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_track_guides
    ADD CONSTRAINT user_track_guides_driver_2_id_fkey FOREIGN KEY (driver_2_id) REFERENCES public.drivers(id) ON DELETE SET NULL;


--
-- Name: user_track_guides user_track_guides_free_boost_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_track_guides
    ADD CONSTRAINT user_track_guides_free_boost_id_fkey FOREIGN KEY (free_boost_id) REFERENCES public.boosts(id) ON DELETE SET NULL;


--
-- Name: user_track_guides user_track_guides_saved_setup_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_track_guides
    ADD CONSTRAINT user_track_guides_saved_setup_id_fkey FOREIGN KEY (saved_setup_id) REFERENCES public.user_car_setups(id) ON DELETE SET NULL;


--
-- Name: user_track_guides user_track_guides_track_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_track_guides
    ADD CONSTRAINT user_track_guides_track_id_fkey FOREIGN KEY (track_id) REFERENCES public.tracks(id) ON DELETE CASCADE;


--
-- Name: user_track_guides user_track_guides_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_track_guides
    ADD CONSTRAINT user_track_guides_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: iceberg_namespaces iceberg_namespaces_catalog_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.iceberg_namespaces
    ADD CONSTRAINT iceberg_namespaces_catalog_id_fkey FOREIGN KEY (catalog_id) REFERENCES storage.buckets_analytics(id) ON DELETE CASCADE;


--
-- Name: iceberg_tables iceberg_tables_catalog_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.iceberg_tables
    ADD CONSTRAINT iceberg_tables_catalog_id_fkey FOREIGN KEY (catalog_id) REFERENCES storage.buckets_analytics(id) ON DELETE CASCADE;


--
-- Name: iceberg_tables iceberg_tables_namespace_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.iceberg_tables
    ADD CONSTRAINT iceberg_tables_namespace_id_fkey FOREIGN KEY (namespace_id) REFERENCES storage.iceberg_namespaces(id) ON DELETE CASCADE;


--
-- Name: objects objects_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT "objects_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_upload_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_upload_id_fkey FOREIGN KEY (upload_id) REFERENCES storage.s3_multipart_uploads(id) ON DELETE CASCADE;


--
-- Name: vector_indexes vector_indexes_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.vector_indexes
    ADD CONSTRAINT vector_indexes_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets_vectors(id);


--
-- Name: audit_log_entries; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.audit_log_entries ENABLE ROW LEVEL SECURITY;

--
-- Name: flow_state; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.flow_state ENABLE ROW LEVEL SECURITY;

--
-- Name: identities; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.identities ENABLE ROW LEVEL SECURITY;

--
-- Name: instances; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.instances ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_amr_claims; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_amr_claims ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_challenges; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_challenges ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_factors; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_factors ENABLE ROW LEVEL SECURITY;

--
-- Name: one_time_tokens; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.one_time_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: refresh_tokens; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.refresh_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_providers; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.saml_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_relay_states; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.saml_relay_states ENABLE ROW LEVEL SECURITY;

--
-- Name: schema_migrations; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.schema_migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: sessions; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_domains; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sso_domains ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_providers; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sso_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles Admins can view all profiles; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.profiles profiles_1
  WHERE ((profiles_1.id = auth.uid()) AND (profiles_1.is_admin = true)))));


--
-- Name: boosts Boosts are viewable by authenticated users; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Boosts are viewable by authenticated users" ON public.boosts FOR SELECT USING ((auth.role() = 'authenticated'::text));


--
-- Name: car_parts Car parts are viewable by authenticated users; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Car parts are viewable by authenticated users" ON public.car_parts FOR SELECT USING ((auth.role() = 'authenticated'::text));


--
-- Name: collections Collections are viewable by authenticated users; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Collections are viewable by authenticated users" ON public.collections FOR SELECT USING ((auth.role() = 'authenticated'::text));


--
-- Name: drivers Drivers are viewable by authenticated users; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Drivers are viewable by authenticated users" ON public.drivers FOR SELECT USING ((auth.role() = 'authenticated'::text));


--
-- Name: seasons Seasons are viewable by authenticated users; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Seasons are viewable by authenticated users" ON public.seasons FOR SELECT USING ((auth.role() = 'authenticated'::text));


--
-- Name: tracks Tracks are viewable by authenticated users; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Tracks are viewable by authenticated users" ON public.tracks FOR SELECT USING ((auth.role() = 'authenticated'::text));


--
-- Name: boost_custom_names Users can delete their own boost custom names; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can delete their own boost custom names" ON public.boost_custom_names FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: user_boosts Users can delete their own boosts; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can delete their own boosts" ON public.user_boosts FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: user_car_parts Users can delete their own car parts; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can delete their own car parts" ON public.user_car_parts FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: user_car_setups Users can delete their own car setups; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can delete their own car setups" ON public.user_car_setups FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: user_drivers Users can delete their own drivers; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can delete their own drivers" ON public.user_drivers FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: user_track_guide_drivers Users can delete their own track guide drivers; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can delete their own track guide drivers" ON public.user_track_guide_drivers FOR DELETE USING ((auth.uid() IN ( SELECT user_track_guides.user_id
   FROM public.user_track_guides
  WHERE (user_track_guides.id = user_track_guide_drivers.track_guide_id))));


--
-- Name: user_track_guides Users can delete their own track guides; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can delete their own track guides" ON public.user_track_guides FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: boost_custom_names Users can insert their own boost custom names; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can insert their own boost custom names" ON public.boost_custom_names FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: user_boosts Users can insert their own boosts; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can insert their own boosts" ON public.user_boosts FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: user_car_parts Users can insert their own car parts; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can insert their own car parts" ON public.user_car_parts FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: user_car_setups Users can insert their own car setups; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can insert their own car setups" ON public.user_car_setups FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: user_drivers Users can insert their own drivers; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can insert their own drivers" ON public.user_drivers FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: user_track_guide_drivers Users can insert their own track guide drivers; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can insert their own track guide drivers" ON public.user_track_guide_drivers FOR INSERT WITH CHECK ((auth.uid() IN ( SELECT user_track_guides.user_id
   FROM public.user_track_guides
  WHERE (user_track_guides.id = user_track_guide_drivers.track_guide_id))));


--
-- Name: user_track_guides Users can insert their own track guides; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can insert their own track guides" ON public.user_track_guides FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: boost_custom_names Users can update their own boost custom names; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can update their own boost custom names" ON public.boost_custom_names FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: user_boosts Users can update their own boosts; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can update their own boosts" ON public.user_boosts FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: user_car_parts Users can update their own car parts; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can update their own car parts" ON public.user_car_parts FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: user_car_setups Users can update their own car setups; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can update their own car setups" ON public.user_car_setups FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: user_drivers Users can update their own drivers; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can update their own drivers" ON public.user_drivers FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: profiles Users can update their own profile; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING ((auth.uid() = id));


--
-- Name: user_track_guide_drivers Users can update their own track guide drivers; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can update their own track guide drivers" ON public.user_track_guide_drivers FOR UPDATE USING ((auth.uid() IN ( SELECT user_track_guides.user_id
   FROM public.user_track_guides
  WHERE (user_track_guides.id = user_track_guide_drivers.track_guide_id))));


--
-- Name: user_track_guides Users can update their own track guides; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can update their own track guides" ON public.user_track_guides FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: boost_custom_names Users can view their own boost custom names; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view their own boost custom names" ON public.boost_custom_names FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: user_boosts Users can view their own boosts; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view their own boosts" ON public.user_boosts FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: user_car_parts Users can view their own car parts; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view their own car parts" ON public.user_car_parts FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: user_car_setups Users can view their own car setups; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view their own car setups" ON public.user_car_setups FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: user_drivers Users can view their own drivers; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view their own drivers" ON public.user_drivers FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: profiles Users can view their own profile; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING ((auth.uid() = id));


--
-- Name: user_track_guide_drivers Users can view their own track guide drivers; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view their own track guide drivers" ON public.user_track_guide_drivers FOR SELECT USING ((auth.uid() IN ( SELECT user_track_guides.user_id
   FROM public.user_track_guides
  WHERE (user_track_guides.id = user_track_guide_drivers.track_guide_id))));


--
-- Name: user_track_guides Users can view their own track guides; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view their own track guides" ON public.user_track_guides FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: boost_custom_names; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.boost_custom_names ENABLE ROW LEVEL SECURITY;

--
-- Name: boosts; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.boosts ENABLE ROW LEVEL SECURITY;

--
-- Name: car_parts; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.car_parts ENABLE ROW LEVEL SECURITY;

--
-- Name: collections; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;

--
-- Name: drivers; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: seasons; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.seasons ENABLE ROW LEVEL SECURITY;

--
-- Name: tracks; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.tracks ENABLE ROW LEVEL SECURITY;

--
-- Name: user_boosts; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.user_boosts ENABLE ROW LEVEL SECURITY;

--
-- Name: user_car_parts; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.user_car_parts ENABLE ROW LEVEL SECURITY;

--
-- Name: user_car_setups; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.user_car_setups ENABLE ROW LEVEL SECURITY;

--
-- Name: user_drivers; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.user_drivers ENABLE ROW LEVEL SECURITY;

--
-- Name: user_track_guide_drivers; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.user_track_guide_drivers ENABLE ROW LEVEL SECURITY;

--
-- Name: user_track_guides; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.user_track_guides ENABLE ROW LEVEL SECURITY;

--
-- Name: messages; Type: ROW SECURITY; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets_analytics; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.buckets_analytics ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets_vectors; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.buckets_vectors ENABLE ROW LEVEL SECURITY;

--
-- Name: iceberg_namespaces; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.iceberg_namespaces ENABLE ROW LEVEL SECURITY;

--
-- Name: iceberg_tables; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.iceberg_tables ENABLE ROW LEVEL SECURITY;

--
-- Name: migrations; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: objects; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.s3_multipart_uploads ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads_parts; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.s3_multipart_uploads_parts ENABLE ROW LEVEL SECURITY;

--
-- Name: vector_indexes; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.vector_indexes ENABLE ROW LEVEL SECURITY;

--
-- Name: supabase_realtime; Type: PUBLICATION; Schema: -; Owner: postgres
--

CREATE PUBLICATION supabase_realtime WITH (publish = 'insert, update, delete, truncate');


ALTER PUBLICATION supabase_realtime OWNER TO postgres;

--
-- Name: DATABASE postgres; Type: ACL; Schema: -; Owner: postgres
--

GRANT CREATE ON DATABASE postgres TO supabase_etl_admin;
GRANT CREATE ON DATABASE postgres TO supabase_storage_admin;
GRANT ALL ON DATABASE postgres TO dashboard_user;


--
-- Name: SCHEMA auth; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA auth TO anon;
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT USAGE ON SCHEMA auth TO service_role;
GRANT ALL ON SCHEMA auth TO supabase_auth_admin;
GRANT ALL ON SCHEMA auth TO dashboard_user;
GRANT USAGE ON SCHEMA auth TO postgres;


--
-- Name: SCHEMA extensions; Type: ACL; Schema: -; Owner: postgres
--

GRANT USAGE ON SCHEMA extensions TO anon;
GRANT USAGE ON SCHEMA extensions TO authenticated;
GRANT USAGE ON SCHEMA extensions TO service_role;
GRANT ALL ON SCHEMA extensions TO dashboard_user;


--
-- Name: SCHEMA net; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA net TO supabase_functions_admin;
GRANT USAGE ON SCHEMA net TO postgres;
GRANT USAGE ON SCHEMA net TO anon;
GRANT USAGE ON SCHEMA net TO authenticated;
GRANT USAGE ON SCHEMA net TO service_role;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO service_role;


--
-- Name: SCHEMA realtime; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA realtime TO postgres;
GRANT USAGE ON SCHEMA realtime TO anon;
GRANT USAGE ON SCHEMA realtime TO authenticated;
GRANT USAGE ON SCHEMA realtime TO service_role;
GRANT ALL ON SCHEMA realtime TO supabase_realtime_admin;


--
-- Name: SCHEMA storage; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA storage TO postgres WITH GRANT OPTION;
GRANT USAGE ON SCHEMA storage TO anon;
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT USAGE ON SCHEMA storage TO service_role;
GRANT ALL ON SCHEMA storage TO supabase_storage_admin WITH GRANT OPTION;
GRANT ALL ON SCHEMA storage TO dashboard_user;


--
-- Name: SCHEMA supabase_functions; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA supabase_functions TO postgres;
GRANT USAGE ON SCHEMA supabase_functions TO anon;
GRANT USAGE ON SCHEMA supabase_functions TO authenticated;
GRANT USAGE ON SCHEMA supabase_functions TO service_role;
GRANT ALL ON SCHEMA supabase_functions TO supabase_functions_admin;


--
-- Name: SCHEMA vault; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA vault TO postgres WITH GRANT OPTION;
GRANT USAGE ON SCHEMA vault TO service_role;


--
-- Name: FUNCTION email(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.email() TO dashboard_user;


--
-- Name: FUNCTION jwt(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.jwt() TO postgres;
GRANT ALL ON FUNCTION auth.jwt() TO dashboard_user;


--
-- Name: FUNCTION role(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.role() TO dashboard_user;


--
-- Name: FUNCTION uid(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.uid() TO dashboard_user;


--
-- Name: FUNCTION armor(bytea); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.armor(bytea) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.armor(bytea) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION armor(bytea, text[], text[]); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.armor(bytea, text[], text[]) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.armor(bytea, text[], text[]) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION crypt(text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.crypt(text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.crypt(text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION dearmor(text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.dearmor(text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.dearmor(text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION decrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION decrypt_iv(bytea, bytea, bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION digest(bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.digest(bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.digest(bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION digest(text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.digest(text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.digest(text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION encrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION encrypt_iv(bytea, bytea, bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION gen_random_bytes(integer); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.gen_random_bytes(integer) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.gen_random_bytes(integer) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION gen_random_uuid(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.gen_random_uuid() TO dashboard_user;
GRANT ALL ON FUNCTION extensions.gen_random_uuid() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION gen_salt(text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.gen_salt(text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.gen_salt(text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION gen_salt(text, integer); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.gen_salt(text, integer) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.gen_salt(text, integer) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION grant_pg_cron_access(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION extensions.grant_pg_cron_access() FROM supabase_admin;
GRANT ALL ON FUNCTION extensions.grant_pg_cron_access() TO supabase_admin WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.grant_pg_cron_access() TO dashboard_user;


--
-- Name: FUNCTION grant_pg_graphql_access(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.grant_pg_graphql_access() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION grant_pg_net_access(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION extensions.grant_pg_net_access() FROM supabase_admin;
GRANT ALL ON FUNCTION extensions.grant_pg_net_access() TO supabase_admin WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.grant_pg_net_access() TO dashboard_user;


--
-- Name: FUNCTION hmac(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.hmac(bytea, bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.hmac(bytea, bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION hmac(text, text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.hmac(text, text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.hmac(text, text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_armor_headers(text, OUT key text, OUT value text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_key_id(bytea); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_key_id(bytea) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_key_id(bytea) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea, text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea, text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_pub_encrypt(text, bytea); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_pub_encrypt(text, bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_pub_encrypt_bytea(bytea, bytea); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_pub_encrypt_bytea(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_sym_decrypt(bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_sym_decrypt(bytea, text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_sym_decrypt_bytea(bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_sym_decrypt_bytea(bytea, text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_sym_encrypt(text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_sym_encrypt(text, text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_sym_encrypt_bytea(bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_sym_encrypt_bytea(bytea, text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgrst_ddl_watch(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgrst_ddl_watch() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgrst_drop_watch(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgrst_drop_watch() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION set_graphql_placeholder(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.set_graphql_placeholder() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_generate_v1(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_generate_v1() TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_generate_v1mc(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_generate_v1mc() TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1mc() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_generate_v3(namespace uuid, name text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_generate_v4(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_generate_v4() TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_generate_v4() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_generate_v5(namespace uuid, name text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_nil(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_nil() TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_nil() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_ns_dns(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_ns_dns() TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_ns_dns() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_ns_oid(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_ns_oid() TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_ns_oid() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_ns_url(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_ns_url() TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_ns_url() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_ns_x500(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_ns_x500() TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_ns_x500() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION graphql("operationName" text, query text, variables jsonb, extensions jsonb); Type: ACL; Schema: graphql_public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO postgres;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO anon;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO authenticated;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO service_role;


--
-- Name: FUNCTION http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer); Type: ACL; Schema: net; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
GRANT ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin;
GRANT ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO postgres;
GRANT ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO anon;
GRANT ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO authenticated;
GRANT ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO service_role;


--
-- Name: FUNCTION http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer); Type: ACL; Schema: net; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
GRANT ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin;
GRANT ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO postgres;
GRANT ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO anon;
GRANT ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO authenticated;
GRANT ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO service_role;


--
-- Name: FUNCTION pg_reload_conf(); Type: ACL; Schema: pg_catalog; Owner: supabase_admin
--

GRANT ALL ON FUNCTION pg_catalog.pg_reload_conf() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION get_auth(p_usename text); Type: ACL; Schema: pgbouncer; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION pgbouncer.get_auth(p_usename text) FROM PUBLIC;
GRANT ALL ON FUNCTION pgbouncer.get_auth(p_usename text) TO pgbouncer;


--
-- Name: FUNCTION apply_rls(wal jsonb, max_record_bytes integer); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO postgres;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO anon;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO authenticated;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO service_role;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO supabase_realtime_admin;


--
-- Name: FUNCTION broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) TO postgres;
GRANT ALL ON FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) TO dashboard_user;


--
-- Name: FUNCTION build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO postgres;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO anon;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO authenticated;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO service_role;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO supabase_realtime_admin;


--
-- Name: FUNCTION "cast"(val text, type_ regtype); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO postgres;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO dashboard_user;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO anon;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO authenticated;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO service_role;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO supabase_realtime_admin;


--
-- Name: FUNCTION check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO postgres;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO anon;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO authenticated;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO service_role;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO supabase_realtime_admin;


--
-- Name: FUNCTION is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO postgres;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO anon;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO authenticated;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO service_role;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO supabase_realtime_admin;


--
-- Name: FUNCTION list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO postgres;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO anon;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO authenticated;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO service_role;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO supabase_realtime_admin;


--
-- Name: FUNCTION quote_wal2json(entity regclass); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO postgres;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO anon;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO authenticated;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO service_role;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO supabase_realtime_admin;


--
-- Name: FUNCTION send(payload jsonb, event text, topic text, private boolean); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) TO postgres;
GRANT ALL ON FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) TO dashboard_user;


--
-- Name: FUNCTION subscription_check_filters(); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO postgres;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO dashboard_user;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO anon;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO authenticated;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO service_role;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO supabase_realtime_admin;


--
-- Name: FUNCTION to_regrole(role_name text); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO postgres;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO anon;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO authenticated;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO service_role;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO supabase_realtime_admin;


--
-- Name: FUNCTION topic(); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.topic() TO postgres;
GRANT ALL ON FUNCTION realtime.topic() TO dashboard_user;


--
-- Name: FUNCTION http_request(); Type: ACL; Schema: supabase_functions; Owner: supabase_functions_admin
--

REVOKE ALL ON FUNCTION supabase_functions.http_request() FROM PUBLIC;
GRANT ALL ON FUNCTION supabase_functions.http_request() TO postgres;
GRANT ALL ON FUNCTION supabase_functions.http_request() TO anon;
GRANT ALL ON FUNCTION supabase_functions.http_request() TO authenticated;
GRANT ALL ON FUNCTION supabase_functions.http_request() TO service_role;


--
-- Name: FUNCTION _crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault._crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault._crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea) TO service_role;


--
-- Name: FUNCTION create_secret(new_secret text, new_name text, new_description text, new_key_id uuid); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault.create_secret(new_secret text, new_name text, new_description text, new_key_id uuid) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault.create_secret(new_secret text, new_name text, new_description text, new_key_id uuid) TO service_role;


--
-- Name: FUNCTION update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault.update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault.update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid) TO service_role;


--
-- Name: TABLE audit_log_entries; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.audit_log_entries TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.audit_log_entries TO postgres;
GRANT SELECT ON TABLE auth.audit_log_entries TO postgres WITH GRANT OPTION;


--
-- Name: TABLE flow_state; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.flow_state TO postgres;
GRANT SELECT ON TABLE auth.flow_state TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.flow_state TO dashboard_user;


--
-- Name: TABLE identities; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.identities TO postgres;
GRANT SELECT ON TABLE auth.identities TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.identities TO dashboard_user;


--
-- Name: TABLE instances; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.instances TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.instances TO postgres;
GRANT SELECT ON TABLE auth.instances TO postgres WITH GRANT OPTION;


--
-- Name: TABLE mfa_amr_claims; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_amr_claims TO postgres;
GRANT SELECT ON TABLE auth.mfa_amr_claims TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_amr_claims TO dashboard_user;


--
-- Name: TABLE mfa_challenges; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_challenges TO postgres;
GRANT SELECT ON TABLE auth.mfa_challenges TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_challenges TO dashboard_user;


--
-- Name: TABLE mfa_factors; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_factors TO postgres;
GRANT SELECT ON TABLE auth.mfa_factors TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_factors TO dashboard_user;


--
-- Name: TABLE oauth_authorizations; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.oauth_authorizations TO postgres;
GRANT ALL ON TABLE auth.oauth_authorizations TO dashboard_user;


--
-- Name: TABLE oauth_client_states; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.oauth_client_states TO postgres;
GRANT ALL ON TABLE auth.oauth_client_states TO dashboard_user;


--
-- Name: TABLE oauth_clients; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.oauth_clients TO postgres;
GRANT ALL ON TABLE auth.oauth_clients TO dashboard_user;


--
-- Name: TABLE oauth_consents; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.oauth_consents TO postgres;
GRANT ALL ON TABLE auth.oauth_consents TO dashboard_user;


--
-- Name: TABLE one_time_tokens; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.one_time_tokens TO postgres;
GRANT SELECT ON TABLE auth.one_time_tokens TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.one_time_tokens TO dashboard_user;


--
-- Name: TABLE refresh_tokens; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.refresh_tokens TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.refresh_tokens TO postgres;
GRANT SELECT ON TABLE auth.refresh_tokens TO postgres WITH GRANT OPTION;


--
-- Name: SEQUENCE refresh_tokens_id_seq; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON SEQUENCE auth.refresh_tokens_id_seq TO dashboard_user;
GRANT ALL ON SEQUENCE auth.refresh_tokens_id_seq TO postgres;


--
-- Name: TABLE saml_providers; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.saml_providers TO postgres;
GRANT SELECT ON TABLE auth.saml_providers TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.saml_providers TO dashboard_user;


--
-- Name: TABLE saml_relay_states; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.saml_relay_states TO postgres;
GRANT SELECT ON TABLE auth.saml_relay_states TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.saml_relay_states TO dashboard_user;


--
-- Name: TABLE schema_migrations; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT SELECT ON TABLE auth.schema_migrations TO postgres WITH GRANT OPTION;


--
-- Name: TABLE sessions; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sessions TO postgres;
GRANT SELECT ON TABLE auth.sessions TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sessions TO dashboard_user;


--
-- Name: TABLE sso_domains; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sso_domains TO postgres;
GRANT SELECT ON TABLE auth.sso_domains TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sso_domains TO dashboard_user;


--
-- Name: TABLE sso_providers; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sso_providers TO postgres;
GRANT SELECT ON TABLE auth.sso_providers TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sso_providers TO dashboard_user;


--
-- Name: TABLE users; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.users TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.users TO postgres;
GRANT SELECT ON TABLE auth.users TO postgres WITH GRANT OPTION;


--
-- Name: TABLE pg_stat_statements; Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON TABLE extensions.pg_stat_statements TO postgres WITH GRANT OPTION;


--
-- Name: TABLE pg_stat_statements_info; Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON TABLE extensions.pg_stat_statements_info TO postgres WITH GRANT OPTION;


--
-- Name: TABLE boost_custom_names; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.boost_custom_names TO service_role;


--
-- Name: TABLE boosts; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.boosts TO service_role;


--
-- Name: TABLE car_parts; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.car_parts TO service_role;


--
-- Name: TABLE collections; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.collections TO service_role;


--
-- Name: TABLE drivers; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.drivers TO service_role;


--
-- Name: TABLE profiles; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.profiles TO service_role;


--
-- Name: TABLE seasons; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.seasons TO service_role;


--
-- Name: TABLE tracks; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.tracks TO service_role;


--
-- Name: TABLE user_boosts; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.user_boosts TO service_role;


--
-- Name: TABLE user_car_parts; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.user_car_parts TO service_role;


--
-- Name: TABLE user_car_setups; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.user_car_setups TO service_role;


--
-- Name: TABLE user_drivers; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.user_drivers TO service_role;


--
-- Name: TABLE user_track_guide_drivers; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.user_track_guide_drivers TO service_role;


--
-- Name: TABLE user_track_guides; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.user_track_guides TO service_role;


--
-- Name: TABLE messages; Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON TABLE realtime.messages TO postgres;
GRANT ALL ON TABLE realtime.messages TO dashboard_user;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO anon;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO authenticated;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO service_role;


--
-- Name: TABLE messages_2026_02_24; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.messages_2026_02_24 TO postgres;
GRANT ALL ON TABLE realtime.messages_2026_02_24 TO dashboard_user;


--
-- Name: TABLE messages_2026_02_25; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.messages_2026_02_25 TO postgres;
GRANT ALL ON TABLE realtime.messages_2026_02_25 TO dashboard_user;


--
-- Name: TABLE messages_2026_02_26; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.messages_2026_02_26 TO postgres;
GRANT ALL ON TABLE realtime.messages_2026_02_26 TO dashboard_user;


--
-- Name: TABLE messages_2026_02_27; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.messages_2026_02_27 TO postgres;
GRANT ALL ON TABLE realtime.messages_2026_02_27 TO dashboard_user;


--
-- Name: TABLE messages_2026_02_28; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.messages_2026_02_28 TO postgres;
GRANT ALL ON TABLE realtime.messages_2026_02_28 TO dashboard_user;


--
-- Name: TABLE messages_2026_03_01; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.messages_2026_03_01 TO postgres;
GRANT ALL ON TABLE realtime.messages_2026_03_01 TO dashboard_user;


--
-- Name: TABLE messages_2026_03_02; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.messages_2026_03_02 TO postgres;
GRANT ALL ON TABLE realtime.messages_2026_03_02 TO dashboard_user;


--
-- Name: TABLE schema_migrations; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.schema_migrations TO postgres;
GRANT ALL ON TABLE realtime.schema_migrations TO dashboard_user;
GRANT SELECT ON TABLE realtime.schema_migrations TO anon;
GRANT SELECT ON TABLE realtime.schema_migrations TO authenticated;
GRANT SELECT ON TABLE realtime.schema_migrations TO service_role;
GRANT ALL ON TABLE realtime.schema_migrations TO supabase_realtime_admin;


--
-- Name: TABLE subscription; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.subscription TO postgres;
GRANT ALL ON TABLE realtime.subscription TO dashboard_user;
GRANT SELECT ON TABLE realtime.subscription TO anon;
GRANT SELECT ON TABLE realtime.subscription TO authenticated;
GRANT SELECT ON TABLE realtime.subscription TO service_role;
GRANT ALL ON TABLE realtime.subscription TO supabase_realtime_admin;


--
-- Name: SEQUENCE subscription_id_seq; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO postgres;
GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO dashboard_user;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO anon;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO service_role;
GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO supabase_realtime_admin;


--
-- Name: TABLE buckets; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.buckets TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE storage.buckets TO service_role;
GRANT ALL ON TABLE storage.buckets TO authenticated;
GRANT ALL ON TABLE storage.buckets TO anon;


--
-- Name: TABLE buckets_analytics; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.buckets_analytics TO service_role;
GRANT ALL ON TABLE storage.buckets_analytics TO authenticated;
GRANT ALL ON TABLE storage.buckets_analytics TO anon;


--
-- Name: TABLE buckets_vectors; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT SELECT ON TABLE storage.buckets_vectors TO service_role;
GRANT SELECT ON TABLE storage.buckets_vectors TO authenticated;
GRANT SELECT ON TABLE storage.buckets_vectors TO anon;


--
-- Name: TABLE iceberg_namespaces; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.iceberg_namespaces TO service_role;
GRANT SELECT ON TABLE storage.iceberg_namespaces TO authenticated;
GRANT SELECT ON TABLE storage.iceberg_namespaces TO anon;


--
-- Name: TABLE iceberg_tables; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.iceberg_tables TO service_role;
GRANT SELECT ON TABLE storage.iceberg_tables TO authenticated;
GRANT SELECT ON TABLE storage.iceberg_tables TO anon;


--
-- Name: TABLE objects; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.objects TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE storage.objects TO service_role;
GRANT ALL ON TABLE storage.objects TO authenticated;
GRANT ALL ON TABLE storage.objects TO anon;


--
-- Name: TABLE s3_multipart_uploads; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.s3_multipart_uploads TO service_role;
GRANT SELECT ON TABLE storage.s3_multipart_uploads TO authenticated;
GRANT SELECT ON TABLE storage.s3_multipart_uploads TO anon;


--
-- Name: TABLE s3_multipart_uploads_parts; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.s3_multipart_uploads_parts TO service_role;
GRANT SELECT ON TABLE storage.s3_multipart_uploads_parts TO authenticated;
GRANT SELECT ON TABLE storage.s3_multipart_uploads_parts TO anon;


--
-- Name: TABLE vector_indexes; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT SELECT ON TABLE storage.vector_indexes TO service_role;
GRANT SELECT ON TABLE storage.vector_indexes TO authenticated;
GRANT SELECT ON TABLE storage.vector_indexes TO anon;


--
-- Name: TABLE hooks; Type: ACL; Schema: supabase_functions; Owner: supabase_functions_admin
--

GRANT ALL ON TABLE supabase_functions.hooks TO postgres;
GRANT ALL ON TABLE supabase_functions.hooks TO anon;
GRANT ALL ON TABLE supabase_functions.hooks TO authenticated;
GRANT ALL ON TABLE supabase_functions.hooks TO service_role;


--
-- Name: SEQUENCE hooks_id_seq; Type: ACL; Schema: supabase_functions; Owner: supabase_functions_admin
--

GRANT ALL ON SEQUENCE supabase_functions.hooks_id_seq TO postgres;
GRANT ALL ON SEQUENCE supabase_functions.hooks_id_seq TO anon;
GRANT ALL ON SEQUENCE supabase_functions.hooks_id_seq TO authenticated;
GRANT ALL ON SEQUENCE supabase_functions.hooks_id_seq TO service_role;


--
-- Name: TABLE migrations; Type: ACL; Schema: supabase_functions; Owner: supabase_functions_admin
--

GRANT ALL ON TABLE supabase_functions.migrations TO postgres;
GRANT ALL ON TABLE supabase_functions.migrations TO anon;
GRANT ALL ON TABLE supabase_functions.migrations TO authenticated;
GRANT ALL ON TABLE supabase_functions.migrations TO service_role;


--
-- Name: TABLE secrets; Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT SELECT,REFERENCES,DELETE,TRUNCATE ON TABLE vault.secrets TO postgres WITH GRANT OPTION;
GRANT SELECT,DELETE ON TABLE vault.secrets TO service_role;


--
-- Name: TABLE decrypted_secrets; Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT SELECT,REFERENCES,DELETE,TRUNCATE ON TABLE vault.decrypted_secrets TO postgres WITH GRANT OPTION;
GRANT SELECT,DELETE ON TABLE vault.decrypted_secrets TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON SEQUENCES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON FUNCTIONS TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON TABLES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON SEQUENCES TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON FUNCTIONS TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON TABLES TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON SEQUENCES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON FUNCTIONS TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON TABLES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: supabase_functions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: supabase_functions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: supabase_functions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON TABLES TO service_role;


--
-- Name: issue_graphql_placeholder; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_graphql_placeholder ON sql_drop
         WHEN TAG IN ('DROP EXTENSION')
   EXECUTE FUNCTION extensions.set_graphql_placeholder();


ALTER EVENT TRIGGER issue_graphql_placeholder OWNER TO supabase_admin;

--
-- Name: issue_pg_cron_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_cron_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_cron_access();


ALTER EVENT TRIGGER issue_pg_cron_access OWNER TO supabase_admin;

--
-- Name: issue_pg_graphql_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_graphql_access ON ddl_command_end
         WHEN TAG IN ('CREATE FUNCTION')
   EXECUTE FUNCTION extensions.grant_pg_graphql_access();


ALTER EVENT TRIGGER issue_pg_graphql_access OWNER TO supabase_admin;

--
-- Name: issue_pg_net_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_net_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_net_access();


ALTER EVENT TRIGGER issue_pg_net_access OWNER TO supabase_admin;

--
-- Name: pgrst_ddl_watch; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER pgrst_ddl_watch ON ddl_command_end
   EXECUTE FUNCTION extensions.pgrst_ddl_watch();


ALTER EVENT TRIGGER pgrst_ddl_watch OWNER TO supabase_admin;

--
-- Name: pgrst_drop_watch; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER pgrst_drop_watch ON sql_drop
   EXECUTE FUNCTION extensions.pgrst_drop_watch();


ALTER EVENT TRIGGER pgrst_drop_watch OWNER TO supabase_admin;

--
-- PostgreSQL database dump complete
--

\unrestrict EN2ekScfyFTu7AolQTu9OOl2FNGrpfNfn053iw1TCIq96t9YFVJSZpYfIysCFWz

