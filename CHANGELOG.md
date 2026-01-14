# Changelog

All notable changes to the F1 Resource Manager project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Spreadsheet-Style Data Grid UI**
  - Created new `DataGrid` component to replace card-based `AssetGrid`
  - Implemented spreadsheet-style table layout for drivers, parts, and boosts
  - Added sortable columns with visual indicators (↑/↓)
  - Maintained all existing functionality: filtering, search, comparison
  - Added responsive design with horizontal scrolling for smaller screens
  - Preserved action buttons (Compare, Add to Collection, Remove)

### Changed
- **Driver List UI**
  - Replaced card-based display with spreadsheet-style data grid
  - Updated `src/app/drivers/page.tsx` to use new `DataGrid` component
  - Maintained all filtering, sorting, and search capabilities
  - Improved data density for better comparison of multiple items

- **Car Parts List UI**
  - Replaced card-based display with spreadsheet-style data grid
  - Updated `src/app/parts/page.tsx` to use new `DataGrid` component
  - Added "Part Type" column specific to car parts
  - Preserved all existing functionality and filters

- **Boosts List UI**
  - Replaced card-based display with spreadsheet-style data grid
  - Updated `src/app/boosts/page.tsx` to use new `DataGrid` component
  - Added "Boost Type" column specific to boosts
  - Maintained all filtering and comparison features

### Fixed
- **Authentication System Overhaul**
  - Replaced deprecated `@supabase/auth-helpers-nextjs` with modern `@supabase/ssr`
  - Updated `AuthContext` to use proper Supabase client for client-side authentication
  - Fixed all API routes to use `createServerSupabaseClient` for server-side auth
  - Added `AuthProvider` to application providers for proper authentication context

- **API Route Data Handling**
  - Fixed data destructuring in all frontend components using API hooks
  - Updated dashboard, drivers, parts, boosts, and compare pages to properly handle response objects
  - Corrected `{ data: [...], pagination: {...} }` response structure handling
  - Resolved "catalogItems.filter is not a function" errors across all data pages

- **Database Schema Restoration**
  - Recreated complete database migration file from TypeScript types
  - Applied database schema with all tables, relationships, and RLS policies
  - Restored Supabase local development environment with proper migrations
  - Fixed authentication middleware to work with current Supabase setup

### Added
- **Complete API Development Layer**
  - Full REST API with 12 endpoints across all data types
  - Catalog items CRUD: `/api/catalog-items` with filtering, pagination, admin controls
  - User assets view: `/api/user-assets` showing all catalog items merged with user ownership
  - User items management: `/api/user-items` for user collection tracking
  - Boost management: `/api/boosts` with admin operations
  - Season management: `/api/seasons` for content organization
  - Admin bulk import: `/api/admin/import` for efficient data loading

- **User Asset Features**
  - Complete inventory view: Shows ALL catalog items for seasons (owned + unowned)
  - Ownership tracking: Level/count display for owned items, zeros for unowned
  - Rich filtering: By season, rarity, card type, ownership status
  - Advanced sorting: By name, rarity, series, level, card count

- **Security & Authentication**
  - Multi-layer security: Supabase Auth + Row-Level Security + Admin role checking
  - User isolation: Users only access their own data through RLS policies
  - Admin functionality: Role-based access for content management
  - Input validation: Comprehensive Zod schemas for all endpoints

- **TypeScript Integration**
  - Complete type coverage with Row/Insert/Update variants
  - Business logic types (UserAssetView, StatLevel)
  - Database connection types with proper Supabase integration
  - Full type safety across all API endpoints

### Frontend Component Architecture
- **Desktop-First Responsive Design**: Grid layouts optimized for desktop/tablet, scaling down to mobile
- **Component Library**: Modular UI components with consistent design system
- **React Query Integration**: Complete data fetching layer with caching and mutations
- **Asset Management Components**: AssetCard and AssetGrid with filtering, sorting, and comparison
- **TypeScript Safety**: Full type coverage across all components and props

### Frontend Components Created
- `src/components/ui/Card.tsx` - Base card component for layouts
- `src/components/ui/Button.tsx` - Button component with variants and loading states
- `src/components/ui/Input.tsx` - Input component with validation and icons
- `src/components/ui/Badge.tsx` - Status indicator badges
- `src/components/AssetCard.tsx` - Individual asset display with ownership status
- `src/components/AssetGrid.tsx` - Responsive asset grid with filtering and comparison
- `src/hooks/useApi.ts` - React Query hooks for all API endpoints
- `src/app/providers.tsx` - React Query provider setup
- `src/lib/utils.ts` - Utility functions for formatting and class merging

### Frontend Features Implemented
- **Rich Asset Display**: Comprehensive asset cards with rarity, stats, and ownership status
- **Advanced Filtering**: Multi-criteria filtering (search, rarity, type, ownership)
- **Smart Sorting**: Sort by name, rarity, series, level with ascending/descending options
- **Asset Comparison**: Built-in comparison functionality supporting up to 4 items
- **Ownership Tracking**: Clear display of owned vs available items
- **Responsive Design**: Desktop-first approach with mobile optimization
- **Interactive UI**: Hover effects, loading states, and user feedback

### Authentication Components
- `src/components/auth/AuthContext.tsx` - Supabase authentication context with session management
- `src/app/auth/login/page.tsx` - Email/password login page with validation
- `src/app/auth/register/page.tsx` - User registration with email confirmation
- `src/components/auth/ProtectedRoute.tsx` - Route protection for authenticated pages
- `src/components/auth/PublicRoute.tsx` - Redirect authenticated users from auth pages

### Profile & Asset Management
- `src/app/profile/page.tsx` - User profile with collection stats overview
- `src/components/AddAssetForm.tsx` - Single item entry with search/select
- `src/components/BulkEntryForm.tsx` - Multi-item bulk entry form
- `src/app/assets/add/page.tsx` - Dedicated page for adding items to collection
- Collection summary cards with completion tracking
- Rarity breakdown with visual progress bars
- Quick action buttons for common tasks

### Changed
- **Repository Structure Consolidation**
  - Merged nested `f1-resource-manager/` repository into root level
  - Moved all application files (`src/`, configuration files) to root directory
  - Removed duplicate `f1` package.json file
  - Restored `TASK.md` file from git history
  - Updated project structure to single unified repository
  - All functionality verified: `npm install`, `npm run build`, and `npm run type-check` all pass

### Technical Implementation
- **API Architecture**: Built on Next.js App Router with Supabase integration
- **Database Layer**: Complete PostgreSQL schema with 6 tables, RLS policies, indexes
- **Frontend Architecture**: Component-based React with TypeScript and Tailwind CSS
- **Development Quality**: Passes linting, type checking, follows Next.js best practices
- **Error Handling**: Consistent error responses with proper HTTP status codes
- **Performance**: Database indexes, efficient queries, pagination support, React Query caching

### New Files Created
- `src/lib/supabase.ts` - Supabase client configuration (server + client)
- `src/types/database.ts` - TypeScript database types and utility types
- `src/lib/validation.ts` - Zod validation schemas for all endpoints
- `src/lib/utils.ts` - Utility functions for formatting and class merging
- `src/app/api/catalog-items/` - Catalog management endpoints
- `src/app/api/user-assets/` - Merged catalog + user data view
- `src/app/api/user-items/` - User collection management
- `src/app/api/boosts/` - Boost management endpoints
- `src/app/api/seasons/` - Season management endpoints
- `src/app/api/admin/import/` - Bulk data import (admin only)
- `src/app/providers.tsx` - React Query provider configuration
- `src/hooks/useApi.ts` - Custom React Query hooks for all API endpoints
- `src/components/ui/` - Base UI component library (Card, Button, Input, Badge)
- `src/components/AssetCard.tsx` - Individual asset display component
- `src/components/AssetGrid.tsx` - Responsive asset grid with filtering and comparison
- `src/components/auth/AuthContext.tsx` - Authentication context provider
- `src/components/auth/ProtectedRoute.tsx` - Protected route wrapper
- `src/components/AddAssetForm.tsx` - Asset entry forms (single & bulk)
- `src/app/auth/login/page.tsx` - Login page
- `src/app/auth/register/page.tsx` - Registration page
- `src/app/profile/page.tsx` - User profile page
- `src/app/assets/add/page.tsx` - Add assets page

### API Endpoints Implemented
```
GET    /api/catalog-items         - List catalog items with filters
POST   /api/catalog-items         - Create item (admin)
GET    /api/catalog-items/[id]    - Get single item
PUT    /api/catalog-items/[id]    - Update item (admin)
DELETE /api/catalog-items/[id]    - Delete item (admin)

GET    /api/user-assets           - Merged catalog + user ownership view
GET    /api/user-items            - User's owned items
POST   /api/user-items            - Add item to collection
PUT    /api/user-items/[id]       - Update level/count
DELETE /api/user-items/[id]       - Remove from collection

GET    /api/boosts               - List boosts
POST   /api/boosts               - Create boost (admin)
GET    /api/boosts/[id]          - Get single boost
PUT    /api/boosts/[id]          - Update boost (admin)
DELETE /api/boosts/[id]          - Delete boost (admin)

GET    /api/seasons              - List seasons
POST   /api/seasons              - Create season (admin)
GET    /api/seasons/[id]         - Get single season
PUT    /api/seasons/[id]         - Update season (admin)
DELETE /api/seasons/[id]         - Delete season (admin)

POST   /api/admin/import         - Bulk import data (admin)
```

## [0.1.0] - 2025-01-03

### Added
- **Database Schema Foundation**
  - Complete PostgreSQL schema with 7 core tables: seasons, catalog_items, boosts, profiles, user_items, user_boosts
  - UUID primary keys for security and scalability
  - Foreign key relationships between all tables
  - Comprehensive database indexes for optimal query performance

- **Row-Level Security (RLS)**
  - RLS enabled on all user-facing tables
  - Public read access for catalog data (seasons, catalog_items, boosts)
  - User-specific access control for profiles, user_items, and user_boosts
  - Admin status checking function for administrative operations

- **Data Processing Infrastructure**
  - Node.js script (`scripts/process_data.js`) for processing JSON data files
  - Automated conversion of game data to SQL seed files
  - Support for seasons, car parts, drivers, and boosts data
  - Proper SQL escaping and data validation

- **Seed Data Generation**
  - 5 SQL seed files generated from game data:
    - `00_master_seed.sql`: Master orchestration file
    - `01_seasons.sql`: Season 6 data (1 record)
    - `02_car_parts.sql`: 60+ car parts with stats per level
    - `03_drivers.sql`: 20+ drivers with stats per level
    - `04_boosts.sql`: 15+ boosts with tier statistics

- **Database Automation**
  - Automatic profile creation trigger for new users
  - User-friendly database population commands
  - Data verification queries included in seed files

### Technical Details
- **Schema Design**: Unified `catalog_items` table for both car parts and drivers with flexible JSONB stats storage
- **Security**: Complete RLS policy implementation with admin functionality
- **Performance**: Strategic indexing on all foreign keys and commonly queried columns
- **Data Integrity**: Proper constraints and data validation throughout schema

### Migration Files
- `db/migrations/20250103000000_initial_schema.sql`: Core database schema
- `db/migrations/20250103000001_rls_policies.sql`: Security policies and admin functions

### Data Processing
- `scripts/process_data.js`: Main processing script
- Processes JSON files from `globalContent/` directory
- Outputs properly formatted SQL to `db/seeds/` directory

---

## [Added] - Error Handling & Loading States
- `src/components/ui/Toast.tsx` - Toast notification context with success/error/warning/info types
- `src/components/ErrorBoundary.tsx` - React error boundary for catching component errors
- `src/components/ui/Skeleton.tsx` - Loading skeleton components (Card, Grid, List, Profile, Form)
- `src/app/globals.css` - Custom animations for toasts and transitions
- `src/app/providers.tsx` - ToastProvider integrated in provider chain

## [Added] - Authentication & Profile Management
- `src/components/auth/AuthContext.tsx` - Supabase authentication context
- `src/app/auth/login/page.tsx` - Login page with validation
- `src/app/auth/register/page.tsx` - Registration page with confirmation flow
- `src/components/auth/ProtectedRoute.tsx` - Route protection wrapper
- `src/app/profile/page.tsx` - User profile with collection stats
- `src/components/AddAssetForm.tsx` - Single and bulk asset entry forms
- `src/app/assets/add/page.tsx` - Dedicated add assets page

## [Added] - Page Routes & Navigation
- `src/app/layout.tsx` - Responsive navigation with desktop/mobile menus
- `src/app/drivers/page.tsx` - Drivers listing with filtering and comparison
- `src/app/parts/page.tsx` - Car parts listing with filtering and comparison
- `src/app/boosts/page.tsx` - Boosts listing with rarity badges and stats
- `src/app/dashboard/page.tsx` - User dashboard with stats and quick actions
- `src/app/compare/page.tsx` - Side-by-side item comparison (up to 4 items)
- `src/app/providers.tsx` - ToastProvider integrated in provider chain

## [Added] - Major Refactoring: Separate Asset Types into Distinct Tables

### Database Schema Changes
- **Created new tables**: `drivers`, `car_parts`, `user_drivers`, `user_car_parts`
- **Added proper indexing**: Performance-optimized indexes for all new tables
- **Implemented RLS policies**: Row-Level Security for data protection
- **Created triggers**: Automatic `updated_at` timestamp updates
- **Migration file**: `supabase/migrations/20260109164845_separate_asset_tables.sql`

### TypeScript Interface Updates
- **Added new types**: `Driver`, `CarPart`, `UserDriver`, `UserCarPart`
- **Created view interfaces**: `DriverView`, `CarPartView`, `BoostView`
- **Updated database.ts**: Added all new table definitions and interfaces
- **Maintained backward compatibility**: Existing interfaces preserved

### API Endpoints Created
- **Drivers API**: `/api/drivers` and `/api/drivers/user`
- **Car Parts API**: `/api/car-parts` and `/api/car-parts/user`
- **Comprehensive filtering**: Season, rarity, series, search, pagination
- **Authentication**: Proper user authentication and authorization
- **Error handling**: Robust error handling and validation

### API Hooks Added
- **useDrivers()**: Fetch drivers catalog
- **useUserDrivers()**: Fetch user's drivers with ownership
- **useCarParts()**: Fetch car parts catalog
- **useUserCarParts()**: Fetch user's car parts with ownership
- **Type safety**: All hooks properly typed with new interfaces

### React Components Updated
- **Drivers Page**: Updated to use new driver endpoints
- **Parts Page**: Updated to use new car parts endpoints
- **DataGrid Component**: Enhanced to handle new types
- **Simplified logic**: Removed conditional `card_type` checks
- **Type-safe rendering**: Proper handling of `DriverView` and `CarPartView`

### Validation & Data Processing
- **Added validation schemas**: `driversFiltersSchema`, `carPartsFiltersSchema`
- **Created seeding script**: `scripts/seed_new_tables.js` for data migration
- **Batch processing**: Efficient data insertion with error handling
- **Created test scripts**: API endpoint testing and TypeScript type validation

### Files Created
- `supabase/migrations/20260109164845_separate_asset_tables.sql`
- `src/app/api/drivers/route.ts`
- `src/app/api/car-parts/route.ts`
- `scripts/seed_new_tables.js`
- `scripts/test_api_endpoints.js`
- `scripts/test_types.ts`
- `MIGRATION_GUIDE.md`

### Files Updated
- `src/types/database.ts` - Added new table types and interfaces
- `src/lib/validation.ts` - Added validation schemas
- `src/hooks/useApi.ts` - Added new API hooks
- `src/app/drivers/page.tsx` - Updated to use new structure
- `src/app/parts/page.tsx` - Updated to use new structure
- `src/components/DataGrid.tsx` - Enhanced to handle new types

### Benefits Achieved
- **Clean Architecture**: Each asset type has dedicated tables and structure
- **Type Safety**: No more runtime `card_type` checks or conditional logic
- **Performance**: Queries optimized for each specific asset type
- **Maintainability**: Future updates to one asset type won't affect others
- **Simplicity**: Components can be written specifically for each asset type
- **Scalability**: Easy to add new asset types in the future

### Implementation Status
- **✅ Database Migration**: Successfully executed - all tables created
- **✅ API Endpoints**: Tested and working - returning proper responses
- **✅ TypeScript Types**: Validated and compiling successfully
- **✅ React Components**: Updated and functional
- **✅ Documentation**: Comprehensive guides and changelog updated
- **✅ Data Seeding**: Successfully executed - 97 drivers, 53 car parts, 62 boosts seeded
- **✅ Authentication**: Fixed Supabase CLI configuration and authentication issues
- **✅ Web Pages**: Fixed drivers and parts pages to use correct API hooks
- **✅ API Route Conflicts**: Resolved by separating user endpoints
- **✅ CORS Headers**: Added to all API endpoints
- **✅ Validation**: Fixed validation schemas to handle string query parameters

### Additional Fixes Applied

#### **Seed Script Authentication**
- ✅ Fixed Supabase client initialization using service role key
- ✅ Added proper environment variable loading with dotenv
- ✅ Added validation for required environment variables
- ✅ Successfully seeded 97 drivers, 53 car parts, and 62 boosts

#### **Web Page Fixes**
- ✅ Fixed drivers page to use `useDrivers` instead of `useUserDrivers`
- ✅ Fixed parts page to use `useCarParts` instead of `useUserCarParts`

#### **API Route Conflicts**
- ✅ Separated user endpoints into their own route files
- ✅ Created `/api/drivers/user/route.ts` for user-specific drivers
- ✅ Created `/api/car-parts/user/route.ts` for user-specific car parts
- ✅ Removed conflicting GET_USER functions from main routes

#### **CORS and API Enhancements**
- ✅ Added CORS headers to all API endpoints
- ✅ APIs now properly handle OPTIONS requests
- ✅ Fixed validation schemas to handle string-to-number conversion for query parameters

#### **Validation Schema Fix**
- ✅ Updated drivers and car parts filter schemas to accept both string and number types
- ✅ Fixed validation issue with query parameters like `?page=1&limit=100`
- ✅ APIs now properly handle query parameters coming as strings
## [Added] - Major Refactoring: Separate Asset Types into Distinct Tables

### Database Schema Changes
- **Created new tables**: `drivers`, `car_parts`, `user_drivers`, `user_car_parts`
- **Added proper indexing**: Performance-optimized indexes for all new tables
- **Implemented RLS policies**: Row-Level Security for data protection
- **Created triggers**: Automatic `updated_at` timestamp updates
- **Migration file**: `supabase/migrations/20260109164845_separate_asset_tables.sql`

### TypeScript Interface Updates
- **Added new types**: `Driver`, `CarPart`, `UserDriver`, `UserCarPart`
- **Created view interfaces**: `DriverView`, `CarPartView`, `BoostView`
- **Updated database.ts**: Added all new table definitions and interfaces
- **Maintained backward compatibility**: Existing interfaces preserved

### API Endpoints Created
- **Drivers API**: `/api/drivers` and `/api/drivers/user`
- **Car Parts API**: `/api/car-parts` and `/api/car-parts/user`
- **Comprehensive filtering**: Season, rarity, series, search, pagination
- **Authentication**: Proper user authentication and authorization
- **Error handling**: Robust error handling and validation

### API Hooks Added
- **useDrivers()**: Fetch drivers catalog
- **useUserDrivers()**: Fetch user's drivers with ownership
- **useCarParts()**: Fetch car parts catalog
- **useUserCarParts()**: Fetch user's car parts with ownership
- **Type safety**: All hooks properly typed with new interfaces

### React Components Updated
- **Drivers Page**: Updated to use new driver endpoints
- **Parts Page**: Updated to use new car parts endpoints
- **DataGrid Component**: Enhanced to handle new types
- **Simplified logic**: Removed conditional `card_type` checks
- **Type-safe rendering**: Proper handling of `DriverView` and `CarPartView`

### Validation & Data Processing
- **Added validation schemas**: `driversFiltersSchema`, `carPartsFiltersSchema`
- **Created seeding script**: `scripts/seed_new_tables.js` for data migration
- **Batch processing**: Efficient data insertion with error handling
- **Created test scripts**: API endpoint testing and TypeScript type validation

### Files Created
- `supabase/migrations/20260109164845_separate_asset_tables.sql`
- `src/app/api/drivers/route.ts`
- `src/app/api/car-parts/route.ts`
- `scripts/seed_new_tables.js`
- `scripts/test_api_endpoints.js`
- `scripts/test_types.ts`
- `MIGRATION_GUIDE.md`

### Files Updated
- `src/types/database.ts` - Added new table types and interfaces
- `src/lib/validation.ts` - Added validation schemas
- `src/hooks/useApi.ts` - Added new API hooks
- `src/app/drivers/page.tsx` - Updated to use new structure
- `src/app/parts/page.tsx` - Updated to use new structure
- `src/components/DataGrid.tsx` - Enhanced to handle new types

### Benefits Achieved
- **Clean Architecture**: Each asset type has dedicated tables and structure
- **Type Safety**: No more runtime `card_type` checks or conditional logic
- **Performance**: Queries optimized for each specific asset type
- **Maintainability**: Future updates to one asset type won't affect others
- **Simplicity**: Components can be written specifically for each asset type
- **Scalability**: Easy to add new asset types in the future

### Implementation Status
- **✅ Database Migration**: Successfully executed - all tables created
- **✅ API Endpoints**: Tested and working - returning proper responses
- **✅ TypeScript Types**: Validated and compiling successfully
- **✅ React Components**: Updated and functional
- **✅ Documentation**: Comprehensive guides and changelog updated
- **✅ Data Seeding**: Successfully executed - 97 drivers, 53 car parts, 62 boosts seeded
- **✅ Authentication**: Fixed Supabase CLI configuration and authentication issues
- **✅ Web Pages**: Fixed drivers and parts pages to use correct API hooks
- **✅ API Route Conflicts**: Resolved by separating user endpoints
- **✅ CORS Headers**: Added to all API endpoints
- **✅ Validation**: Fixed validation schemas to handle string query parameters

### Additional Fixes Applied

#### **Seed Script Authentication**
- ✅ Fixed Supabase client initialization using service role key
- ✅ Added proper environment variable loading with dotenv
- ✅ Added validation for required environment variables
- ✅ Successfully seeded 97 drivers, 53 car parts, and 62 boosts

#### **Web Page Fixes**
- ✅ Fixed drivers page to use `useDrivers` instead of `useUserDrivers`
- ✅ Fixed parts page to use `useCarParts` instead of `useUserCarParts`

#### **API Route Conflicts**
- ✅ Separated user endpoints into their own route files
- ✅ Created `/api/drivers/user/route.ts` for user-specific drivers
- ✅ Created `/api/car-parts/user/route.ts` for user-specific car parts
- ✅ Removed conflicting GET_USER functions from main routes

#### **CORS and API Enhancements**
- ✅ Added CORS headers to all API endpoints
- ✅ APIs now properly handle OPTIONS requests
- ✅ Fixed validation schemas to handle string-to-number conversion for query parameters

#### **Validation Schema Fix**
- ✅ Updated drivers and car parts filter schemas to accept both string and number types
- ✅ Fixed validation issue with query parameters like `?page=1&limit=100`
- ✅ APIs now properly handle query parameters coming as strings

## Project Status
- ✅ **Phase 1**: Repository Setup - **COMPLETE**
- ✅ **Phase 2**: Database Schema Design - **COMPLETE**
- ✅ **Phase 3**: Data Processing - **COMPLETE**
- ✅ **Repository Consolidation** - **COMPLETE**
- ✅ **Phase 4**: API Development - **COMPLETE**
- 🔄 **Phase 5**: Frontend Components - **IN PROGRESS** (~85% complete)
- 📋 **Phase 6**: Admin Interface - **PENDING**
- 📋 **Phase 7**: Testing & Deployment - **PENDING**

---

## Next Steps
1. **Phase 5**: Complete tablet/desktop optimization, component testing
2. **Phase 6**: Build admin interface for content management
3. **Phase 7**: Implement testing suite and deployment pipeline
4. **Database Migration**: Run migration to create new tables
5. **Data Seeding**: Execute seeding script to populate new tables
6. **Testing**: Verify all endpoints and components work with new structure
