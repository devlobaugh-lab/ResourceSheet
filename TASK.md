# F1 Resource Manager - Task Tracking

## Current Status: Feature Complete - Ready for Production

### Project Overview

F1 Resource Manager is a comprehensive asset management system for Formula 1 game resources, featuring:

- Driver Management: Track and manage driver assets with detailed stats
- Car Parts Management: Organize and optimize car parts by type and performance
- Boost Management: Handle special boost items with unique properties
- User Collections: Track ownership, levels, and progression
- Comparison Tools: Side-by-side analysis of up to 4 items
- Admin Interface: Content management and data import tools
- Import/Export: Collection data and custom boost names management
- Sticky Headers: Enhanced UX for long data tables

## COMPLETED TASKS

### User Data Input Interface

- [x] Build interface for users to input card amounts and levels
- [x] Implement quick editing capabilities for multiple items
- [x] Add bulk update functionality
- [x] Create intuitive UI for rapid data entry
- [x] Include validation for data ranges and formats
- [x] Add save/cancel workflow with confirmation dialogs

### Import/Export of User Data

- [x] Connect import and export buttons to functionality
- [x] Export/import all user data to a JSON file
- [x] For Admin users, allow export of Custom Boost names to JSON file

### UUID-Independent Backup/Restore System - COMPLETE ✅

- [x] **Stable Export API** - `/api/export-collection-stable` exports data using stable identifiers (name, series, ordinal, part_type) instead of UUIDs
- [x] **Stable Import API** - `/api/import-collection-stable` matches items using stable identifiers, works across database reseeds
- [x] **Driver Matching** - Uses name + series + ordinal for precise matching
- [x] **Car Part Matching** - Uses name + car_part_type + series for precise matching
- [x] **Boost Matching** - Uses name (boost names are unique) for matching
- [x] **Error Handling** - Comprehensive error reporting for unmatched items with detailed messages
- [x] **Frontend Integration** - Renamed to "Backup Collection" and "Restore Collection" buttons in profile page
- [x] **Migration Support** - Works with data from different database versions and reseeded databases
- [x] **UI Cleanup** - Removed old UUID-based buttons, focused on stable backup system
- [x] **Data Validation** - Fixed export to conditionally include optional fields, preventing null value errors
- [x] **File Download** - Fixed frontend to properly download JSON files with correct filenames


### Misc QOL Changes

- [x] max level validation is wrong on data input (seems to be off by 1 level (common maxed at 9, rare at 8, etc.)  Common lvl max is 11, rare is 9, epic is 8, legendary and special are 7
- [x] Add colored background to stats to indicate strength. (see spreadsheet. )
- [x] Add Highest Level Toggle to Drivers and Parts pages
- [x] Add Highest Level Column to Data Input
- [x] Tune Debounce - seems a little agressive now (I can feel some lag when doing data entry) - Fixed with simple save-on-blur approach
- [x] Driver Sorting Bug - sorting by stat columns only considered base values, not bonus calculations. Fixed to include bonus percentage increases.
- [x] Fixed data-input page layout issues - reduced excessive whitespace above headings and optimized table container heights
- [x] Drivers Page Sorting with Highest Level Toggle - Fixed sorting logic to use displayed values instead of original level values when "Highest Level" toggle is enabled. Updated getStatValueForSort function to include calculateHighestLevel logic when showHighestLevel is true, and fixed column statistics calculation to also use highest level values for proper color coding.

### Bugs and issues

- [x] Move Setups nav item to after Data Input
- [x] Compare page. Driver drop down list should only show 1 of each driver. Rarity of the driver is determined by the rarity field.
- [x] Driver Compare Integration Fix - Fixed regression where clicking + button on Drivers page to add driver to compare didn't work. Updated handleAddToCompare function to use new data structure with driverName instead of id.
- [x] Added toast notifications for + button - When clicking + button to add driver to add driver to compare, show success/warning/error toast messages for user feedback.
- [x] **Boost Data Input Issues - COMPLETE FIXES**
  - [x] Fixed page reload issues when tabbing between boost input fields
  - [x] Resolved authentication issues in `/api/user-boosts` endpoint
  - [x] Fixed data clearing when leaving fields and not saving properly
  - [x] Fixed inconsistent display behavior between navigation
  - [x] Added proper cache invalidation for cross-page data consistency
  - [x] Implemented controlled inputs with proper state management
  - [x] Fixed boost amount column sorting (direct numeric comparison)
  - [x] Fixed boost name sorting (numeric extraction for proper ordering)
  - [x] Fixed custom name synchronization across boosts page and data input page
  - [x] **Boosts page now shows all boosts with correct ownership counts**
  - [x] **Data input boosts tab works seamlessly with proper saving and display**
- [x] **Admin Tracks Page Complete Resolution - COMPLETE FIXES**
  - [x] **Authentication Issues**: Fixed 401 unauthorized errors by updating tracks API to properly validate JWT tokens from Authorization header using `supabaseAdmin.auth.getUser(token)`
  - [x] **RLS Policy Conflict**: Removed problematic tracks table RLS policy that caused infinite recursion with profiles table
  - [x] **Database Migration**: Created `20260121084500_fix_tracks_rls_policy.sql` to drop conflicting policy
  - [x] **Loading State Flash**: Added proper loading states to prevent "Access Denied" flash before profile loads
  - [x] **Filter Defaults**: Track filter now defaults to current season instead of "All Seasons"
  - [x] **Admin User Setup**: Ensured admin user (thomas.lobaugh@gmail.com) has proper authentication and database profile
  - [x] **Database Seeding**: Complete seeding of admin user, seasons, drivers, car parts, and boosts data

### Setups page

- [ ] Would like to re-work Car setup interface. Maybe have the user click a part card and have it bring up a modal with available options instead of a separate form for data entry. Main card would be on left then, and could have an edit icon or an add new icon and then saved setups would be on right side. Another idea is that we may be able to load 2 setups side by side for compare. 
- [ ] Would like to add a feature to suggest a setup for a user. They input max series and style of setup (Speed, Speed + Quali, Corner + Quali, PU, PU + Quali, Balanced, other )  App would look at parts and suggest a setup that meets criteria
- [ ] Would like to have a suggested driver location too, for different GPs

### Track guides

- [ ] We will have a list of tracks with basic attributes (Track stats, # laps)
- [ ] User can create basic setups, suggested drivers, and boosts for the track at different GP Levels
- [ ] Can have a track rotation area to adjust strategy for current rotation
- [ ] **TODO: Clean up boost schema** - Boosts currently have rarity/series/level fields in schema but may only need name/icon for identification

### GP Guide

- [ ] User can setup a GP with data and by choosing tracks that will be involved. 
- [ ] will show Bonus, and boosted drivers and parts
- [ ] User can then take the basic setups for the tracks and adjust accordingly (app will highlight boosted #s and will show if RP bonus is not achieved)
- [ ] User can create a "one sheet" guide for a GP once they have tweaked each track's strategy
- [ ] User can input notes about performance (Quali position, PvP or bot, PVP boosts used, final result, other notes like safety car, etc.)
- [ ] Have way for user to update their main track guides based on what they learned from a GP

### Add User Notes and Guidance

- [x] User can create and save Car setups for different scenarios with name and notes
- [x] **Car Setups Feature - COMPLETE IMPLEMENTATION**
  - [x] Created dedicated `/setups` page with 2-column layout (creator left, display right)
  - [x] Implemented 6-part setup creator with brake, gearbox, rear wing, front wing, suspension, engine
  - [x] Added real-time stat calculation with live updates as parts are selected
  - [x] Integrated series filtering (1-12 max series) restricting available parts
  - [x] Added individual bonus checkboxes and global bonus percentage input
  - [x] Implemented bonus logic: pit stop time decreases (better), other stats increase with Math.ceil rounding
  - [x] Created save/load/delete functionality with custom setup names and validation
  - [x] Added setup management interface showing saved setups with notes truncated to 128 characters
  - [x] Built comprehensive database schema with user_car_setups table and RLS policies
  - [x] Created complete REST API (/api/setups, /api/setups/[id]) with authentication and validation
  - [x] Added "Setups" link to main navigation menu (desktop and mobile)
  - [x] Implemented responsive design with proper mobile stacking
  - [x] Added professional UI with rarity-colored part cards and compact 3x4 stats grid
  - [x] Included authentication requirements with Card-based login prompts
  - [x] Added TypeScript safety throughout with proper interfaces and validation
  - [x] Implemented duplicate name prevention and comprehensive error handling
- [ ] User can create and save Full setups including parts, drivers and boosts with name and notes
- [ ] List tracks and allow for recommended setups for each track at different GP Levels
- [ ] List GPs and allow user to build recommended setup for each track at different GP Levels
  - [ ] User can create a GP with name, tracks/races and special considerations

### Admin Interface Development

- [x] Implement data import/export functionality
- [ ] Create content management tools
- [ ] Build user management interface
- [ ] Add bulk editing capabilities

### Compare Page Development

- [x] **Driver Compare Page - Complete Implementation**
  - [x] Created `/src/app/compare/drivers/` directory and `page.tsx`
  - [x] Updated navigation to link to `/compare/drivers` instead of `/compare` (or add separate link)
  - [x] Created `DriverCompareGrid` component in `/src/components/`
  - [x] Implemented `DriverCompareGrid` with horizontal scrolling table layout
  - [x] Added column management: Add Driver button, remove (X) buttons per column
  - [x] Created driver selection dropdown (populated from `useDrivers()` API)
  - [x] Added rarity dropdown with auto-adjustment logic
  - [x] Added level dropdown (1-11) with rarity-based max level enforcement
  - [x] Added bonus checkbox per column
  - [x] Implemented stat rows: Overtaking, Defending, Qualifying, Race Start, Tyre Mgt, Total Value, Series
  - [x] Integrated existing `getStatValue` logic from DataGrid component
  - [x] Applied bonus percentage calculations (global bonus % affects checked columns)
  - [x] Calculated Total Value as sum of 5 driver stats (exclude Series from total)
  - [x] Implemented red-to-green color gradient using existing `getStatBackgroundColor` function
  - [x] Added global bonus % input at top of page
  - [x] Styled table with proper spacing, borders, and responsive design
  - [x] Added loading states and empty state when no drivers selected
  - [x] Implemented localStorage persistence for selected drivers and their settings
  - [x] Handled localStorage loading/saving with error handling
  - [x] Maintained state across page refreshes
  - [x] Added + button to drivers DataGrid rows
  - [x] Implemented logic to add driver to existing compare session
  - [x] Handled case where compare page hasn't been visited yet (create new session)
  - [x] Used `useDrivers()` hook for driver catalog data
  - [x] Implemented rarity-based level validation logic
  - [x] Handled driver stats_per_level data structure correctly
  - [x] Tested stat calculations match drivers page exactly
  - [x] Verified color coding works across different stat ranges
  - [x] Tested bonus percentage application
  - [x] Tested localStorage persistence
  - [x] Tested integration with drivers page + button
  - [x] Added driver name row with rarity background colors above bonus row
  - [x] Made columns fixed width, justified left instead of expanding
  - [x] Fixed driver names display in dropdowns (removed unique filtering)
  - [x] Made bonus row more compact with reduced padding
  - [x] Fixed checkbox centering issues with proper table cell alignment
  - [x] Updated label column styling with dark gray backgrounds
  - [x] Made Name text bold in driver name row
  - [x] Updated CHANGELOG.md with comprehensive driver compare page documentation

### Deployment Preparation

- [ ] Create deployment checklist
- [ ] Set up production environment
- [ ] Configure CI/CD pipeline
- [ ] Implement monitoring and logging
- [ ] Prepare rollback plan

### Code Review

- [ ] Establish code review checklist and standards
- [ ] Set up automated code quality checks
- [ ] Create review process documentation
- [ ] Implement pre-commit hooks for basic validation
- [ ] Add performance review guidelines
- [ ] Establish security review requirements

## ARCHIVED TASKS

### Major Refactoring: Separate Asset Types into Distinct Tables

#### Database Schema Refactoring

- Analyzed current database structure and identified issues
- Examined how assets are currently used in components and APIs
- Identified problematic code patterns and conditional logic
- Proposed solution for separating asset types into distinct tables
- Reviewed source data structure from JSON files
- Created detailed database schema for new tables
- Designed comprehensive refactoring plan
- Created database migration scripts (supabase/migrations/20260109164845_separate_asset_tables.sql)
- Added new tables: drivers, car_parts, user_drivers, user_car_parts
- Created proper indexing for performance optimization
- Implemented RLS policies for data security
- Added triggers for automatic timestamp updates

#### TypeScript Interface Updates

- Updated src/types/database.ts with new table definitions
- Added specific types: Driver, CarPart, UserDriver, UserCarPart
- Created view interfaces: DriverView, CarPartView, BoostView
- Maintained backward compatibility with existing interfaces
- Added all types to exports for use across the application

#### API Endpoint Development

- Created /api/drivers endpoint with full CRUD operations
- Created /api/drivers/user endpoint for user-specific driver data
- Created /api/car-parts endpoint with full CRUD operations
- Created /api/car-parts/user endpoint for user-specific car part data
- Implemented comprehensive filtering (season, rarity, series, search, pagination)
- Added proper authentication and authorization
- Implemented robust error handling and validation
- Added all endpoints to API documentation

#### API Hooks Implementation

- Added useDrivers() hook for fetching drivers catalog
- Added useUserDrivers() hook for user's drivers with ownership
- Added useCarParts() hook for fetching car parts catalog
- Added useUserCarParts() hook for user's car parts with ownership
- Added proper TypeScript typing for all new hooks
- Integrated hooks with React Query for caching and performance
- Added error handling and loading states

#### React Component Updates

- Updated src/app/drivers/page.tsx to use new driver endpoints
- Updated src/app/parts/page.tsx to use new car parts endpoints
- Enhanced src/components/DataGrid.tsx to handle new types
- Removed all conditional card_type checks
- Added proper type-safe rendering for DriverView and CarPartView
- Maintained all existing functionality and filters

#### Validation & Data Processing

- Added validation schemas: driversFiltersSchema, carPartsFiltersSchema
- Created seeding script: scripts/seed_new_tables.js for data migration
- Implemented batch processing for efficient data insertion
- Added proper error handling and table existence checks
- Created test scripts for API endpoint testing and TypeScript validation

#### Testing & Documentation

- Created comprehensive migration guide (MIGRATION_GUIDE.md)
- Tested all API endpoints (they work correctly)
- Verified existing functionality still works
- Updated CHANGELOG.md with all changes
- Updated TASK.md with current status
- Created step-by-step instructions for database migration
- Added troubleshooting guide for common issues

#### Car Parts Page Fixes

- Fix authentication on Car Parts page (useUserCarParts with proper auth headers)
- Update part type names (Transmission → Gearbox)
- Exclude Pit Stop from Total Value calculation for car parts
- Add missing DRS stat column with proper sorting
- Fix stat column names (speed, cornering, powerUnit, qualifying, drs, pitStopTime)
- Remove duplicate Series column from parts grid

#### Authentication Requirements

- Add sign-in required to Car Parts page (matches dashboard styling)
- Add sign-in required to Boosts page (matches dashboard styling)
- Add sign-in required to Compare page (matches dashboard styling)
- Standardize all login prompts to use Card-based design
- Remove Auth Debug component from production UI
- Update drivers page login prompt to match dashboard styling

#### Database Migration Execution

- Fix Supabase CLI configuration issue
- Run database migration to create new tables
- Verify all tables are created correctly
- Check that all indexes and triggers are working
- Execute data seeding script to populate new tables (script created, authentication fixed)
- Successfully seeded 97 drivers, 53 car parts, and 62 boosts

#### Final Testing & Validation

- Test all API endpoints with real data
- Verify all React components work with populated tables
- Test authentication and authorization flows
- Validate error handling and edge cases
- Fix validation schemas to handle string query parameters
- Fix API route conflicts by separating user endpoints
- Add CORS headers to all API endpoints
- Fix web pages to use correct API hooks
- Perform performance testing with large datasets

#### UI Screen Real Estate Optimization

- Remove max-width constraint from main layout container (max-w-7xl → no constraint)
- Update DataGrid table cell padding to compact spacing (px-6 py-4 → px-3 py-2)
- Ensure consistent compact density across all grid types (drivers, parts, boosts)
- Maintain horizontal padding for proper edge spacing
- Test layout renders correctly on different screen sizes
- Change table sizing from w-full to table for content-based width
- Add w-fit to table container for content-based grid sizing and left justification
- Update rarity coloring to use cell background colors with black text instead of text colors/badges
- Center justify all columns except Name and Rarity
- Add Level, Bonus, and Total Value columns to Drivers page
- Remove duplicate Series column from Drivers page
- Calculate Total Value as sum of 5 driver stats
- Fix Level column to show user level data from DriverView instead of assets
- Fix column alignment by conditionally showing Actions column only when actions are available
- Fix authentication issue by using useDrivers (catalog) instead of useUserDrivers (requires login)
- Make Bonus column conditional based on user data availability
- Fix column hide logic - remove Bonus column entirely for catalog data, show 0 for Level
- Require user authentication for drivers page access
- Always show Bonus column with checkbox for authenticated users
- Show actual user level values from DriverView instead of "N/A" or 0

#### Drivers Page Column Order Adjustment

- Move "Race Start" column one position left (before "Tyre Use") in drivers DataGrid
- Update both column definition order and table cell rendering order
- Verify change improves stat flow readability

#### Boosts Page Major Improvements

- Remove 'boost type' column completely as validity was questioned
- Remove DRS tier column and values entirely
- Fix column ordering: Overtake, Defend, Corners, Tyre Use, Power Unit, Speed, Pit Stop, Race Start
- Change boost stat values to display value * 5 instead of raw tier values
- Add color coding for values > 0: 1=blue, 2=green, 3=yellow, 4=orange, 5=red
- Change name column to display boost icon string instead of name string
- Verify BOOST_NAME_1 now shows correct values (Corners, Tyre Use, Power Unit set to 1)

#### Boost Custom Naming Feature

- Create database migration for boost_custom_names table with unique constraints
- Update TypeScript types (BoostCustomName, BoostView updates)
- Create API endpoints for custom name CRUD operations with validation
- Add character validation (A-Z, a-z, 0-9, -, .) and 64 char limit
- Implement duplicate name prevention with database constraints
- Update boosts API to include custom names in response with left join
- Create BoostNameEditor component with inline editing functionality
- Update DataGrid to display custom names with fallback logic (custom_name || name)
- Implement click-to-edit functionality in boosts grid with admin-only access
- Add real-time validation and save/cancel UX with toast notifications
- Fix authentication issues across all APIs (JWT header + cookie fallback)
- Test full functionality including edge cases and error handling
- Update CHANGELOG.md and TASK.md with complete implementation details

#### Level 0 Stats Bug Fix

- Identified off-by-one error where drivers and car parts at level 0 showed level 1 stats
- Fixed getStatValue function in DataGrid component to return 0 for level 0 instead of accessing stats[level - 1]
- Fixed getStatValueForSort function to properly handle level 0 stats for sorting
- Updated logic to use stats[level - 1] only when level > 0, ensuring level 0 shows all zeros
- Tested fix ensures level 0 items display correct 0 stats while higher levels show proper stat progression
- Updated CHANGELOG.md with bug fix details

#### UI Layout Simplification & Dynamic Navigation

- Removed most filter controls from DataGrid (rarity, card type, owned, sort dropdowns)
- Restored column header click-to-sort functionality with visual indicators (↑/↓)
- Moved search field from DataGrid to page-level header below titles
- Changed search placeholder to be context-specific ("Search drivers...", "Search parts...", "Search boosts...")
- Added "Max Series" dropdown (12-1) for drivers and parts pages (defaults to 12)
- Max Series filter shows items at selected series value or lower (e.g., 6 shows series 1-6)
- Added dropdown indicator (▼) to Max Series select element
- Limited search field size to 20-30 characters (sm:w-64 class)
- Search works on visible items after Max Series filtering is applied
- Made navigation buttons dynamic based on auth state (Sign In/Sign Up when not logged in, Profile when logged in)
- Updated drivers, parts, and boosts pages to use new page-level filters
- Ensured mobile responsiveness with vertical stacking where needed
- Removed item count badge from grid headers (no longer shows "X items")
- Fixed Next.js server/client component separation (metadata export in server component)
- Updated CHANGELOG.md with comprehensive UI layout changes

## Key Benefits Achieved

### Clean Architecture

- No more runtime card_type checks
- TypeScript properly validates each asset type
- Better IDE autocompletion and type checking
- Compile-time error detection

### Type Safety

- Queries optimized for specific asset types
- Proper indexing for faster lookups
- Reduced data transfer with targeted queries
- Efficient batch processing for data seeding

### Performance

- Future updates to one asset type won't affect others
- Clear separation of concerns
- Easier to understand and extend
- Consistent patterns across all asset types

### Maintainability

- Easy to add new asset types in the future
- Consistent pattern for all asset types
- Better foundation for growth
- Modular architecture for easy extension

### Scalability

- Easy to add new asset types in the future
- Consistent pattern for all asset types
- Better foundation for growth
- Modular architecture for easy extension

## Files Created/Modified

### New Files Created:

- supabase/migrations/20260109164845_separate_asset_tables.sql
- src/app/api/drivers/route.ts
- src/app/api/car-parts/route.ts
- scripts/seed_new_tables.js
- scripts/test_api_endpoints.js
- scripts/test_types.ts
- MIGRATION_GUIDE.md

### Files Updated:

- src/types/database.ts - Added new table types and interfaces
- src/lib/validation.ts - Added validation schemas
- src/hooks/useApi.ts - Added new API hooks
- src/app/drivers/page.tsx - Updated to use new structure
- src/app/parts/page.tsx - Updated to use new structure
- src/components/DataGrid.tsx - Enhanced to handle new types
- CHANGELOG.md - Updated with all changes
- TASK.md - Updated with current status

## Timeline

### Phase 1: Refactoring (COMPLETE)

- Duration: 2026-01-09
- Status: 100% Complete
- Deliverables: All code changes, TypeScript types, API endpoints, React components

### Phase 2: Migration & Testing (IN PROGRESS)

- Duration: 2026-01-09 - 2026-01-10
- Status: 90% Complete (pending database migration)
- Deliverables: Database migration, data seeding, comprehensive testing

### Phase 3: Deployment (PENDING)

- Duration: 2026-01-11 - 2026-01-12
- Status: 0% Complete
- Deliverables: Production deployment, monitoring setup, user documentation

## Summary

The core refactoring to separate drivers, parts, and boosts into distinct tables is 100% complete. All code changes have been implemented, tested, and documented.

What's Working:

- All API endpoints created and tested
- All TypeScript types validated and working
- All React components updated and functional
- Comprehensive documentation and guides created

What's Next:

- Run database migration (Supabase CLI configuration issue)
- Execute data seeding
- Final testing and validation
- Deployment to production

The refactoring successfully eliminates the problematic mixed asset approach and provides a clean, maintainable, and scalable architecture for the F1 Resource Manager application.
