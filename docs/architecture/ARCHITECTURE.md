# F1 Resource Manager - System Architecture

## Overview

F1 Resource Manager is a modern web application built with Next.js and Supabase, designed to help Formula 1 game players track and manage their in-game resources. This document outlines the system architecture, design decisions, and technical implementation details.

## Architecture Principles

### 1. Separation of Concerns
- **Global Data**: Catalog items (drivers, parts, boosts) shared across all users
- **User Data**: Personal collections and preferences isolated per user
- **Business Logic**: Clean separation between frontend and backend concerns

### 2. Security First
- **Row-Level Security (RLS)**: All user data is automatically isolated
- **Authentication**: Supabase Auth with email magic links and dual-client architecture
- **Data Validation**: Comprehensive input validation and sanitization
- **Admin System**: Secure admin operations with proper privilege detection

### 3. Performance Optimized
- **Caching Strategy**: Aggressive caching for global data, fresh fetches for user data
- **Database Indexing**: Strategic indexes for optimal query performance
- **Server Components**: Next.js App Router for efficient server-side rendering

### 4. Cost Conscious
- **Free Tier Compatible**: Designed to stay within Supabase and Vercel free tiers
- **Efficient Queries**: Minimize database reads and writes
- **Smart Caching**: Reduce API calls through intelligent caching

## Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Query for data fetching and caching
- **UI Components**: Custom component library built on Tailwind

### Backend
- **Platform**: Supabase
- **Database**: PostgreSQL with RLS policies
- **Authentication**: Supabase Auth (email magic links)
- **API**: Next.js API routes with server-side Supabase client

### Infrastructure
- **Hosting**: Vercel (Free tier)
- **Database**: Supabase PostgreSQL
- **Development**: Docker for local Supabase development

## Database Design

### Schema Overview (14 tables)

#### Catalog Tables (global, shared across users)

| Table | Key fields |
|-------|-----------|
| `drivers` | `name`, `rarity`, `series`, `season_id`, `collection_id`, `collection_sub_name`, `visual_override`, `stats_per_level` |
| `car_parts` | `name`, `rarity`, `series`, `season_id`, `car_part_type`, `stats_per_level` |
| `boosts` | `name`, `icon`, `boost_stats`, `is_free` |
| `seasons` | `name`, `is_active` |
| `tracks` | `name`, `alt_name`, `laps`, `driver_track_stat`, `car_track_stat`, `season_id` |
| `collections` | `name`, `season_id` |

#### User Data Tables (RLS-protected, isolated per user)

| Table | Key fields |
|-------|-----------|
| `user_drivers` | `user_id`, `driver_id`, `level`, `card_count`, `bonus_percent` |
| `user_car_parts` | `user_id`, `car_part_id`, `level`, `card_count`, `bonus_percent` |
| `user_boosts` | `user_id`, `boost_id`, `level` |
| `user_car_setups` | `user_id`, `name`, `notes`, `max_series`, `bonus_percent`, six `*_id` FK columns to `car_parts` |
| `user_track_guides` | `user_id`, `track_id`, `gp_level`, `boost_recommendations`, `car_setup_id`, tire strategy fields, `notes` |
| `user_track_guide_drivers` | `user_track_guide_id`, `driver_id`, `slot_order` |

#### System Tables

| Table | Key fields |
|-------|-----------|
| `profiles` | `id` (= `auth.users.id`), `email`, `username`, `is_admin` |
| `boost_custom_names` | `boost_id`, `custom_name` |

### Row-Level Security (RLS)

All user-specific tables implement RLS policies:

```sql
-- Enable RLS
ALTER TABLE user_drivers ENABLE ROW LEVEL SECURITY;

-- Read policy
CREATE POLICY "Users can read their own drivers" ON user_drivers
FOR SELECT USING (auth.uid() = user_id);

-- Insert policy
CREATE POLICY "Users can insert their own drivers" ON user_drivers
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Update policy
CREATE POLICY "Users can update their own drivers" ON user_drivers
FOR UPDATE USING (auth.uid() = user_id);

-- Delete policy
CREATE POLICY "Users can delete their own drivers" ON user_drivers
FOR DELETE USING (auth.uid() = user_id);
```

### Indexing Strategy

```sql
-- User data indexes
CREATE INDEX idx_user_drivers_user_id ON user_drivers(user_id);
CREATE INDEX idx_user_drivers_driver_id ON user_drivers(driver_id);
CREATE INDEX idx_user_car_parts_user_id ON user_car_parts(user_id);
CREATE INDEX idx_user_boosts_user_id ON user_boosts(user_id);

-- Catalog data indexes
CREATE INDEX idx_drivers_rarity ON drivers(rarity);
CREATE INDEX idx_drivers_series ON drivers(series);
CREATE INDEX idx_car_parts_type ON car_parts(car_part_type);
CREATE INDEX idx_car_parts_series ON car_parts(series);
```

### Row-Level Security (RLS)

All user-specific tables implement RLS policies:

```sql
-- Enable RLS
ALTER TABLE user_drivers ENABLE ROW LEVEL SECURITY;

-- Read policy
CREATE POLICY "Users can read their own drivers" ON user_drivers
FOR SELECT USING (auth.uid() = user_id);

-- Insert policy  
CREATE POLICY "Users can insert their own drivers" ON user_drivers
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Update policy
CREATE POLICY "Users can update their own drivers" ON user_drivers
FOR UPDATE USING (auth.uid() = user_id);

-- Delete policy
CREATE POLICY "Users can delete their own drivers" ON user_drivers
FOR DELETE USING (auth.uid() = user_id);
```

### Indexing Strategy

```sql
-- User data indexes
CREATE INDEX idx_user_drivers_user_id ON user_drivers(user_id);
CREATE INDEX idx_user_drivers_driver_id ON user_drivers(driver_id);
CREATE INDEX idx_user_car_parts_user_id ON user_car_parts(user_id);
CREATE INDEX idx_user_boosts_user_id ON user_boosts(user_id);

-- Catalog data indexes
CREATE INDEX idx_drivers_rarity ON drivers(rarity);
CREATE INDEX idx_drivers_series ON drivers(series);
CREATE INDEX idx_car_parts_type ON car_parts(car_part_type);
CREATE INDEX idx_car_parts_series ON car_parts(series);
```

## Application Structure

### Next.js App Router Structure

```
/app
├── /auth                # Auth pages (public)
│   ├── /login
│   ├── /register
│   ├── /reset-password
│   └── /update-password
├── /dashboard           # Main overview (protected)
├── /drivers             # Driver collection management
├── /parts               # Car parts management
├── /boosts              # Boost inventory
├── /setups              # Saved car setups
├── /track-guides        # Per-track GP strategies
│   └── /[id]            # Individual track guide detail
├── /gp-guides           # GP guide creation and management
│   └── /[id]            # Individual GP guide detail
├── /compare             # Comparison hub
│   ├── /drivers         # Side-by-side driver comparison
│   └── /ai              # AI loadout comparison
├── /data-input          # Spreadsheet-style bulk data entry (Drivers/Parts/Boosts tabs)
├── /series              # Series overview
├── /series-max-loadouts # Series optimization / max loadout calculator
├── /tracks              # Track list
├── /assets/add          # Asset submission form
├── /profile             # User profile settings
├── /admin               # Admin panel (requires is_admin)
│   ├── /users           # User management
│   ├── /content-cache   # Content cache upload
│   └── /track-aliases   # Track name alias management
└── /api                 # API routes (see API.md for full inventory)
```

### Key Components

#### Supabase Client Setup

Three clients are defined in `src/lib/supabase.ts`:

```typescript
// Service role client — full DB access, API routes only
export const supabaseAdmin = createClient(url, serviceRoleKey)

// Anon client — RLS enforced, for browser use
export const supabase = createClient(url, anonKey)

// Cookie-based server clients for authenticated API routes
export function createServerSupabaseClient(): SupabaseClient
export function createAuthenticatedSupabaseClient(request: NextRequest): SupabaseClient
```

#### API Layer
```typescript
// app/api/drivers/route.ts
export async function GET() {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('drivers')
    .select('*')
    .order('name');
    
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  
  return NextResponse.json(data);
}
```

#### Data Access Patterns
```typescript
// hooks/useApi.ts - React Query hooks
export function useDrivers() {
  return useQuery({
    queryKey: ['drivers'],
    queryFn: async () => {
      const { data } = await supabase.from('drivers').select('*');
      return data;
    },
    staleTime: 600000, // 10 minutes
  });
}

export function useUserDrivers() {
  return useQuery({
    queryKey: ['user_drivers'],
    queryFn: async () => {
      const { data } = await supabase.from('user_drivers').select('*');
      return data;
    },
  });
}
```

## Data Flow

### Read Operations
1. **Global Data**: Cached aggressively (1+ hours) via Next.js ISR
2. **User Data**: Fetched fresh on each request, filtered by RLS
3. **Mixed Views**: Server-side joins with appropriate caching

### Write Operations
1. **Validation**: Client-side validation with Zod schemas
2. **Mutation**: Server Actions or API routes with RLS enforcement
3. **Cache Invalidation**: `revalidatePath()` to update cached data

### Authentication Flow
1. **Login**: Email magic link via Supabase Auth
2. **Session**: HTTP-only cookies managed by Supabase
3. **Authorization**: RLS policies enforce data isolation automatically

## Performance Optimization

### Caching Strategy
- **Global Catalog**: Long-lived cache (1-6 hours) via `revalidate`
- **User Data**: No cache or short cache (0-60 seconds)
- **Mixed Views**: Page-level caching with user context

### Database Optimization
- **Indexes**: Strategic indexes on all foreign keys and query columns
- **Query Optimization**: Use `SELECT specific_columns` instead of `SELECT *`
- **Connection Pooling**: Supabase handles connection management

### Frontend Optimization
- **Server Components**: Minimize client-side JavaScript
- **Lazy Loading**: Load heavy components only when needed
- **Image Optimization**: Next.js image optimization for assets

## Security Considerations

### Data Isolation
- **RLS Policies**: Automatic user data isolation
- **No Service Role**: Application never uses service role keys
- **Input Validation**: Comprehensive validation on all inputs

### Authentication Security
- **Magic Links**: No password management required
- **Session Management**: Secure cookie handling
- **CSRF Protection**: Built-in with Supabase

### API Security
- **Rate Limiting**: Vercel and Supabase built-in limits
- **Input Sanitization**: All inputs validated and sanitized
- **Error Handling**: Generic error messages to prevent information leakage

## Deployment Architecture

### Development Environment
- **Local Supabase**: Docker-based local development
- **Hot Reload**: Next.js development server
- **Database Migrations**: Supabase CLI for schema management

### Production Environment
- **Vercel**: Serverless deployment with edge network
- **Supabase**: Managed PostgreSQL with RLS
- **Environment Variables**: Secure configuration management

### Monitoring & Observability
- **Supabase Dashboard**: Database query monitoring
- **Vercel Analytics**: Performance and usage metrics
- **Error Tracking**: Built-in error handling and logging

## Scalability Considerations

### Current Scale
- **Users**: Designed for ≤ 100 users
- **Data**: Optimized for moderate data volumes
- **Cost**: Target $0/month on free tiers

### Future Scaling
- **Database**: PostgreSQL scaling via Supabase plans
- **Caching**: Redis integration for advanced caching
- **CDN**: Vercel edge network for global performance
- **Monitoring**: Enhanced monitoring for production scale

## Migration Strategy

### Database Migrations
- **Supabase CLI**: Standard migration workflow
- **Rollback Support**: Version-controlled migration scripts
- **Data Seeding**: Automated seeding for development

### Code Deployment
- **Git Workflow**: Standard Git-based deployment
- **Environment Parity**: Consistent environments across dev/staging/prod
- **Rollback Capability**: Vercel deployment history and rollback

This architecture provides a solid foundation for the F1 Resource Manager application, balancing performance, security, and maintainability while keeping costs minimal.