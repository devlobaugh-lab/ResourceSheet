# Changelog

All notable changes to the F1 Resource Manager project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed
- **Parts Page User Data Sync**: Fixed parts page to show user ownership data (levels/card counts) by merging catalog and user data instead of showing only catalog data
- **Boost Display Icon Fallback**: Updated boost names to fall back to icon names (GP_China, etc.) instead of boost names for better readability
- **Boost Stats Display Fix**: Fixed boost tier values to display correctly by updating DataGrid component to use proper property names (`overtake`, `block`, etc.) instead of `_tier` suffixes
- **User Data Persistence**: Fixed parts page to retain user ownership data across page refreshes by correcting useMemo dependency array
- **Complete Stats Data Import**: Fixed seeding script to properly import driver/car part stats from JSON files using correct property names (`driverStatsPerLevel`, `carPartStatsPerLevel`)

### Added
- **Admin Tracks Page Complete Resolution**
  - **Authentication Issues**: Fixed 401 unauthorized errors by updating tracks API to properly validate JWT tokens from Authorization header
  - **RLS Policy Conflict**: Removed problematic tracks table RLS policy that caused infinite recursion with profiles table
  - **Database Migration**: Created `20260121084500_fix_tracks_rls_policy.sql` to drop conflicting policy
  - **JWT Token Handling**: Updated `/api/tracks` and `/api/tracks/[id]` to extract and validate tokens using `supabaseAdmin.auth.getUser(token)`
  - **Loading State Flash**: Added proper loading states to prevent "Access Denied" flash before profile loads
  - **Filter Defaults**: Track filter now defaults to current season instead of "All Seasons"
  - **Admin User Setup**: Ensured admin user (thomas.lobaugh@gmail.com) has proper authentication and database profile
  - **Database Seeding**: Complete seeding of admin user, seasons, drivers, car parts, and boosts data

### Added
- **Car Setups Feature - Complete Implementation**
  - **New Page**: `/setups` dedicated page for creating and managing car setups
  - **Setup Creator**: 2x3 grid interface with dropdowns for all 6 car part types (Brake, Gearbox, Rear Wing, Front Wing, Suspension, Engine)
  - **Real-time Stat Calculation**: Automatically calculates and displays total stats (Speed, Cornering, Power Unit, Qualifying, DRS, Pit Stop Time) from all selected parts
  - **Series Filtering**: Global "Max Series" filter (1-12) that restricts available parts in all dropdowns
  - **Bonus System**: Individual bonus checkboxes for each part with global bonus percentage input
  - **Bonus Logic**: Pit stop time decreases (better performance), all other stats increase with proper rounding (Math.ceil for increases, 2 decimal places for decreases)
  - **Save/Load Functionality**: Custom setup names with full CRUD operations (Create, Read, Update, Delete)
  - **Setup Management**: List view of all saved setups with load/delete actions and metadata display (notes truncated to 128 characters)
  - **Database Integration**: New `user_car_setups` table with proper RLS policies and user isolation
  - **API Endpoints**: Complete REST API (`/api/setups`, `/api/setups/[id]`) with authentication and validation
  - **Navigation Integration**: Added "Setups" link to both desktop and mobile navigation menus
  - **Responsive Design**: Two-column layout (creator left, display right) with mobile stacking
  - **Validation**: Requires all 6 parts to be selected before saving, proper name validation (1-100 characters), duplicate name prevention
  - **Local State Management**: Efficient React state with useMemo for filtered parts and calculated stats
  - **Error Handling**: Comprehensive error handling with user-friendly messages and loading states
  - **Authentication Required**: Setup creation and management requires user login with professional Card-based login prompt
  - **TypeScript Safety**: Full type coverage with proper interfaces and validation schemas
  - **UI Polish**: Rarity-colored part cards with level display, compact 3x4 stats grid with optimized spacing and colors, dynamic setup names, notes display after stats

- **Track Management System - Complete Implementation**
  - **Database Schema**: New `tracks` table with global track attributes (name, alt_name, laps, driver_track_stat, car_track_stat, season_id)
  - **Track Stats**: Limited to valid stat names - Driver: overtaking, defending, raceStart, tyreUse; Car: speed, cornering, powerUnit
  - **Admin Interface**: Full CRUD interface at `/admin/tracks` with table view and create/edit forms
  - **Season Integration**: Tracks belong to seasons with foreign key relationship and validation
  - **API Endpoints**: Complete REST API (`/api/tracks`, `/api/tracks/[id]`) with admin authentication and validation
  - **Profile Integration**: "Manage Tracks" button added to profile page (admin-only)
  - **Data Validation**: Server-side validation for stat names, season existence, and required fields
  - **UI Components**: Professional admin interface with season filtering, inline editing, and responsive design
  - **Security**: Row-Level Security (RLS) policies ensuring only admins can modify tracks, public read access
  - **TypeScript Support**: Complete type safety with Track interface and proper database integration
  - **Error Handling**: Comprehensive error messages and user feedback throughout the interface
- **Car Setups Feature - Complete Implementation**
  - **New Page**: `/setups` dedicated page for creating and managing car setups
  - **Setup Creator**: 2x3 grid interface with dropdowns for all 6 car part types (Brake, Gearbox, Rear Wing, Front Wing, Suspension, Engine)
  - **Real-time Stat Calculation**: Automatically calculates and displays total stats (Speed, Cornering, Power Unit, Qualifying, DRS, Pit Stop Time) from all selected parts
  - **Series Filtering**: Global "Max Series" filter (1-12) that restricts available parts in all dropdowns
  - **Bonus System**: Individual bonus checkboxes for each part with global bonus percentage input
  - **Bonus Logic**: Pit stop time decreases (better performance), all other stats increase with proper rounding (Math.ceil for increases, 2 decimal places for decreases)
  - **Save/Load Functionality**: Custom setup names with full CRUD operations (Create, Read, Update, Delete)
  - **Setup Management**: List view of all saved setups with load/delete actions and metadata display (Series filter, Bonus %)
  - **Database Integration**: New `user_car_setups` table with proper RLS policies and user isolation
  - **API Endpoints**: Complete REST API (`/api/setups`, `/api/setups/[id]`) with authentication and validation
  - **Navigation Integration**: Added "Setups" link to both desktop and mobile navigation menus
  - **Responsive Design**: Two-column layout (creator left, saved setups right) with mobile stacking
  - **Validation**: Requires all 6 parts to be selected before saving, proper name validation (1-100 characters)
  - **Local State Management**: Efficient React state with useMemo for filtered parts and calculated stats
  - **Error Handling**: Comprehensive error handling with user-friendly messages and loading states
  - **Authentication Required**: Setup creation and management requires user login with professional Card-based login prompt
  - **TypeScript Safety**: Full type coverage with proper interfaces and validation schemas

- **Driver Compare Page - Complete Feature Implementation**
  - **New Route**: `/compare/drivers` dedicated page for side-by-side driver comparison
  - **Unlimited Columns**: Add as many driver columns as needed with horizontal scrolling
  - **Column Management**: "Add Driver" button and individual "Remove" buttons per column
  - **Driver Selection**: Dropdown populated from drivers catalog, sorted by last name first
  - **Unique Driver Display**: No duplicate entries, formatted as "Last, First Initial"
  - **Rarity Auto-Adjustment**: Dropdown automatically adjusts max level based on rarity selection
  - **Level Validation**: Enforced rarity-based level restrictions (Common: 1-11, Rare: 1-9, Epic: 1-8, Legendary/Special: 1-7)
  - **Bonus System**: Individual checkboxes per driver column for bonus percentage application
  - **Global Bonus Input**: Single percentage input field affecting all checked drivers
  - **Comprehensive Statistics**: All 5 driver stats (Overtaking, Defending, Qualifying, Race Start, Tyre Use)
  - **Total Value Calculation**: Sum of all 5 driver stats displayed prominently
  - **Visual Performance Indicators**: Red-to-green color gradients based on relative stat strength
  - **Stat Calculations**: Full integration with existing `getStatValue` logic including bonuses
  - **Session Persistence**: Complete localStorage save/load for all settings and selections
  - **Responsive Design**: Proper horizontal scrolling and mobile compatibility
  - **Loading States**: Proper loading indicators and empty states
  - **TypeScript Safety**: Full type coverage with proper error handling

- **Driver Compare Page UI Enhancements**
  - **Name Row Addition**: New row above Bonus showing driver names with rarity background colors
  - **Compact Design**: Reduced bonus row height and improved checkbox centering
  - **Fixed Column Widths**: Static column widths instead of expanding to fill space
  - **Left Justification**: Table justified to left edge instead of centering
  - **Dark Label Styling**: All row labels use dark gray background with white text for visual hierarchy
  - **Professional Layout**: Clean separation between control rows and data sections

- **Driver Compare Page Technical Improvements**
  - **Component Architecture**: New `DriverCompareGrid.tsx` component with clean separation of concerns
  - **State Management**: React hooks for driver selections, settings, and localStorage integration
  - **Performance Optimization**: Efficient re-renders and calculations for large comparison grids
  - **Data Integration**: Seamless connection with existing drivers API and hooks
  - **Error Handling**: Robust error recovery and validation throughout the component

### Fixed
- **Navigation Menu Reordering**
  - Moved "Setups" navigation item to appear after "Data Input" in both desktop and mobile menus
  - Updated menu order in `src/app/client-navigation.tsx` for consistent user experience

- **Driver Compare Page Unique Driver Display**
  - Fixed driver dropdown to show only unique driver names (one per driver) instead of displaying duplicates
  - Implemented filtering logic to select driver with highest rarity when multiple versions exist
  - Maintains proper stat calculations and rarity-based level validation
  - Improved user experience by reducing dropdown clutter and preventing confusion

- **Driver Compare Integration Fix**
  - Fixed regression where clicking + button on Drivers page to add driver to compare didn't work
  - Updated handleAddToCompare function to use new data structure with driverName instead of id
  - Added toast notifications for successful additions and warnings for duplicates
  - Improved user feedback with success/error messages when adding drivers to compare

- **Drivers Page Sorting with Highest Level Toggle**
  - Fixed sorting logic to use displayed values instead of original level values when "Highest Level" toggle is enabled
  - Updated `getStatValueForSort` function to include `calculateHighestLevel` logic when `showHighestLevel` is true
  - Fixed column statistics calculation (`columnStats`) to also use highest level values for proper color coding
  - Added `showHighestLevel` to dependency arrays for proper reactivity when toggle changes
  - Now sorting by stat columns correctly reflects the displayed values when highest level toggle is active

- **Data Input Page Layout Optimization**
  - Reduced excessive whitespace above headings by changing outer container padding from `py-8` to `py-4`
  - Adjusted table container heights from `max-h-[73vh]` to `max-h-[50vh]` for better visual balance
  - Eliminated unnecessary vertical scrollbars when content fits within viewport
  - Applied consistent layout across all data-input tabs (Drivers, Parts, Boosts)

- **UI Consistency and Layout Improvements**
  - **Compare Drivers Page**: Fixed heading font size from `text-2xl` to `text-3xl` to match other pages
  - **Compare Drivers Page**: Adjusted spacing from `space-y-6` to `space-y-4` for consistent heading whitespace
  - **Data Input Page**: Removed centering container to left-align content like other pages
  - **Navigation Logo**: Restructured navigation to keep F1 Resource Manager logo left-aligned regardless of screen width
  - **Logo Link**: Changed logo link from Dashboard (/) to Drivers page (/drivers)
  - **Navigation Architecture**: Logo positioned outside centered container while preserving nav item and profile area behavior

### Added
- **Highest Level Calculations for Data Input and Asset Pages**
  - **Utility Function**: Added `calculateHighestLevel()` in `src/lib/utils.ts` to determine maximum upgradeable level based on current level, card count, and rarity restrictions
  - **Data Input Page Enhancements**: Added "Highest Level" column to both Drivers and Parts tabs showing red-highlighted levels when higher than current level
  - **Drivers Page Toggle**: Added "Highest Level" checkbox to drivers page header that switches stat display to show potential max levels instead of current levels
  - **Parts Page Toggle**: Added "Highest Level" checkbox to parts page header that switches stat display to show potential max levels instead of current levels
  - **Persistent Settings**: Toggle states saved to localStorage (drivers-show-highest-level, parts-show-highest-level) and restored on page load
  - **Upgrade Cost Logic**: Implements correct upgrade costs (lvl1-2:4, lvl2-3:10, lvl3-4:20, lvl4-5:50, lvl5-6:100, lvl6-7:200, lvl7-8:400, lvl8-9:1000, lvl9-10:2000, lvl10-11:4000)
  - **Rarity Restrictions**: Respects max levels by rarity (Basic/Common:11, Rare:9, Epic:8, Legendary/Special:7)
  - **Visual Indicators**: Red text highlighting for levels higher than current level to draw user attention
  - **Real-time Updates**: Stats recalculate immediately when toggle is changed, showing potential maximum stats for current card count

### Added
- **Bonus Percentage Feature for Drivers and Parts Pages**
  - **Bonus Input Field**: Added compact text input field (width `w-12`) to the right of "Max Series" dropdown on both drivers and parts pages
  - **Bonus Checkboxes**: Each driver/part row has a checkbox in the "Bonus" column that determines if the bonus percentage applies to that item
  - **Stat Calculation**: When bonus checkbox is checked and percentage entered, all stats are increased by the specified percentage
  - **Rounding Logic**: Always rounds up using `Math.ceil()` for performance stats, decreases pit stop time (better performance) and rounds to hundredths
  - **Persistence**: Bonus percentage and checked items automatically saved to localStorage and restored when returning to pages
  - **State Initialization**: Fixed timing issue by initializing bonusCheckedItems state directly from localStorage in useState initializer
  - **Real-time Updates**: Stats recalculate immediately when bonus settings change
  - **Independent Settings**: Separate localStorage keys for drivers vs parts pages to keep settings independent

- **Import/Export Collection Feature**
  - **Data Input UI Enhancement**: Removed number input incrementers (up/down arrows) from data input pages for drivers, car parts, and boosts
  - Plain text entry boxes now used for cleaner, more responsive data entry experience
  - Added global CSS to hide number input spin buttons across the application

- **Separated Custom Boost Names Export/Import**
  - **Separate Functionality**: Custom boost names export/import is now completely separate from collection data
  - **Admin-Only Access**: Only users with `is_admin = true` can access custom boost names export/import
  - **Dedicated Endpoints**: `/api/export-custom-names` and `/api/import-custom-names` for global custom names management
  - **Separate Files**: Custom names export as `f1-custom-names-backup-YYYY-MM-DD.json`
  - **Data Structure**: Export contains `boostCustomNames` array with `boost_id` and `custom_name` fields
  - **Validation**: All boost IDs are validated to exist before importing custom names
  - **Updated Character Validation**: Custom boost names now allow spaces between words but not at beginning/end
  - **UI Integration**: Separate buttons in profile page for admin users only

- **Sticky Table Headers UX Enhancement**
  - **DataGrid Component**: Added sticky headers to all DataGrid tables (Drivers, Parts, Boosts pages)
  - **Data Input Page**: Added sticky headers to all three tabs (Drivers, Parts, Boosts)
  - **Implementation**: `sticky top-0 z-10` on table headers with `max-h-[70vh]` container height
  - **Behavior**: Headers remain visible when scrolling through long tables
  - **Consistency**: Applied across all data tables for improved navigation

- **Input UX Improvements**
  - **Number Input Styling**: Removed incrementer arrows (spinner buttons) from all number inputs globally
  - **CSS Implementation**: Added global styles to hide `-webkit-outer-spin-button` and `-webkit-inner-spin-button`
  - **Clean Appearance**: Plain text entry boxes for better user experience
  - **Applied Everywhere**: Affects data input pages, forms, and any number inputs throughout the app

- **Import/Export Collection Feature**
  - **Export Functionality**: Added "Export Collection" button to profile page that downloads complete user data as JSON file
  - **Import Functionality**: Added "Import Collection" button that allows uploading previously exported JSON files
  - **Data Scope**: Exports all user-owned assets (user_items, user_boosts) with ownership levels and card counts
  - **File Format**: JSON with `exportedAt` timestamp, `userItems`, and `userBoosts` arrays
  - **Filename**: `f1-resource-backup-YYYY-MM-DD.json` with current date
  - **Validation**: Import validates that all item/boost IDs exist in catalog before accepting data
  - **Overwrite Behavior**: Import completely replaces existing user data for included data types
  - **Partial Import**: Accepts JSON with only certain data types (e.g., only userItems or only userBoosts)
  - **UI Feedback**: Loading spinners, success/error toasts, and proper error messages
  - **API Endpoints**: `/api/export-collection` (GET) and `/api/import-collection` (POST)
  - **Button Updates**: Changed "Import Data" to "Import Collection" for consistency

- **Colored Backgrounds for Driver Stat Strength**
  - **Color Coding Implementation**: Added colored backgrounds to all driver stat columns (Overtaking, Defending, Qualifying, Race Start, Tyre Use, Total Value) to indicate relative strength
  - **Color Mapping**: Max value gets `green-400`, median value gets `white`, min value gets `red-400`
  - **Gradient System**: Values below median use gradient from `red-400 → red-300 → red-200 → red-100 → white`
  - **Green Gradient**: Values above median use gradient from `white → green-100 → green-200 → green-300 → green-400`
  - **Column Statistics**: Calculates min, max, and median for each stat column using visible (filtered) drivers
  - **Dynamic Updates**: Colors recalculate automatically when filtering/sorting changes the visible drivers
  - **Bonus Integration**: Properly accounts for bonus percentages and checked items in stat calculations
  - **Symmetric Design**: Maintains visual balance with gradients centered around the white median

- **Colored Backgrounds for Car Part Stat Strength**
  - **Part-Type-Specific Color Coding**: Added colored backgrounds to all car part stat columns, but calculated separately for each part type (Brakes, Gearbox, Engine, Suspension, Front Wing, Rear Wing)
  - **Isolated Comparisons**: Brakes are only compared to other brakes, gearboxes to other gearboxes, etc., preventing cross-type stat mixing
  - **Same Color System**: Uses identical color mapping as drivers (max=green-400, median=white, min=red-400) with same gradient system
  - **Stat Columns**: Speed, Cornering, Power Unit, Qualifying, DRS, Pit Stop Time, Total Value (excluding Pit Stop Time)
  - **Reversed Logic for Pit Stop Time**: Lower pit stop times are better (green), higher times are worse (red), 0 values stay red and are excluded from calculations
  - **Level 0 Exclusion**: Ignores parts that users haven't owned/levelled up (0 values) from color calculations
  - **Bonus Integration**: Properly accounts for bonus percentages and checked items in stat calculations
  - **Dynamic Updates**: Colors recalculate automatically when filtering changes the visible parts per type
  - **Custom Parts Page Implementation**: Applied directly to the parts page's grouped table structure since it doesn't use the DataGrid component

- **UUID-Independent Backup/Restore System**
  - **Stable Export API**: `/api/export-collection-stable` exports collection data using stable identifiers instead of UUIDs
  - **Stable Import API**: `/api/import-collection-stable` imports data by matching stable identifiers, works across database reseeding
  - **Smart Matching Logic**: Drivers matched by `name + series + ordinal`, car parts by `name + car_part_type + series`, boosts by `name`
  - **Migration Safe**: Works when database is reseeded and UUIDs change, ensuring reliable backup/restore functionality
  - **Comprehensive Error Handling**: Detailed reporting of unmatched items with specific error messages
  - **UI Integration**: "Backup Collection" and "Restore Collection" buttons in profile page with intuitive loading states
  - **Data Validation**: Proper Zod schema validation for import format with clear error messages
  - **File Downloads**: Automatic download of `f1-stable-backup-YYYY-MM-DD.json` files for backups
  - **Cache Invalidation**: Automatic React Query cache updates after successful restore operations

### Changed
- **UI Layout Simplification & Column Sorting**: Streamlined the grid pages by removing most filter controls, repositioning search functionality, and restoring column header sorting
  - **Removed**: Rarity dropdown, Card Type dropdown, Owned filter, Sort By controls from DataGrid
  - **Restored**: Column header click-to-sort functionality with visual indicators (↑/↓)
  - **Repositioned**: Search field from DataGrid filter bar to page-level header area below page titles
  - **Updated**: Search placeholder to be context-specific ("Search drivers...", "Search parts...", "Search boosts...")
  - **Added**: "Max Series" filter for drivers and parts pages (dropdown 12-1, defaults to 12)
  - **Enhanced**: Max Series filter shows only items at selected series value or lower (e.g., select 6 shows series 1-6)
  - **Improved**: Search works on visible items after Max Series filtering is applied
  - **Refined**: Search field size limited to 20-30 characters (sm:w-64 class)
  - **Visual**: Added dropdown indicator (▼) to Max Series select element
  - **Cleaned**: Removed item count badge from grid headers (no longer shows "X items")

- **Dynamic User Navigation**: Made authentication buttons in header responsive to user login state
  - **Not logged in**: Shows "Sign In" and "Sign Up" buttons
  - **Logged in**: Shows only "Profile" button
  - **Architecture**: Split layout into server component (metadata) and client component (navigation)
  - **Responsive**: Consistent behavior across desktop and mobile navigation

- **Layout Architecture**: Properly separated Next.js server and client components
  - **Server Component**: `layout.tsx` with metadata export and static content
  - **Client Component**: `client-navigation.tsx` with authentication-dependent UI
  - **Compliance**: Fixed "use client" directive placement to resolve React Server Components errors

### Fixed
- **Data Input Performance**: Simplified data input interface to use save-on-blur approach. Removed complex debouncing and local state management. All input fields now save data immediately when the user leaves the field (onBlur event), providing predictable and reliable behavior without input lag or capture issues.

- **Max Level Validation Issue**: Fixed incorrect max level validation on data input page. Updated LEVEL_RANGES constant in `src/app/data-input/page.tsx` to set correct max levels: Basic (11), Common (11), Rare (9), Epic (8), Legendary (7), Special Edition (7).

- **Level 0 Stats Bug**: Fixed off-by-one error where drivers and car parts at level 0 were incorrectly showing level 1 stats instead of all 0 stats. Updated `getStatValue` and `getStatValueForSort` functions in DataGrid component to properly handle level 0 by returning 0 instead of accessing `stats[level - 1]`.

- **Driver Sorting Bug**: Fixed sorting on drivers page to include bonus calculations. Previously, sorting by stat columns only considered base values, but now includes bonus percentage increases from checked items. Updated `getStatValueForSort` function in DataGrid component to apply bonus calculations identical to display values.

- **Boost Data Input Issues - Complete Resolution**: Fixed all boost data input functionality issues including page reloads, data clearing, inconsistent display, and navigation problems. Implemented proper state management, cache invalidation, and cross-page data synchronization. Resolved authentication issues in `/api/user-boosts` endpoint with JWT token parsing fallback. Fixed boost sorting to use numeric extraction from boost names and proper card count comparisons.

- **Boosts Page Display Fixes**: Fixed boosts page to show all boosts with correct ownership counts by merging catalog data with user ownership data. Added proper API integration and error handling for both catalog and user boost queries.

### Added
- **Car Parts Page Grouped Sections** - Complete redesign with part type organization
  - **Grouped Display**: Parts organized into sections by type (Brakes, Gearbox, Rear Wing, Front Wing, Suspension, Engine)
  - **Section Headers**: Each part type shows count (e.g., "Brakes (8 parts)")
  - **Complete Statistics**: All columns included - Name, Rarity, Level, Bonus, Speed, Cornering, Power Unit, Qualifying, DRS, Pit Stop, Total Value, Series
  - **Smart Filtering**: Excludes starter components (series 0) from display
  - **Within-group Sorting**: Series → Rarity ascending within each part type
  - **Interactive Elements**: Bonus checkboxes and stat calculations
  - **Responsive Design**: Proper table overflow and mobile compatibility

- **Sort State Persistence** - Cross-session sort preferences for all grids
  - **localStorage Integration**: Automatic saving/loading of sort preferences
  - **Per-page Independence**: Separate preferences for Drivers, Parts, and Boosts pages
  - **Smart Defaults**: Main pages default to Data Input sorting logic (series/rarity/part type)
  - **Graceful Fallbacks**: Works in incognito mode, recovers from invalid data
  - **Real-time Saving**: Preferences saved immediately when sort changes
  - **Cross-session Continuity**: Sort choices persist between browser sessions

- **Boosts Page Enhancements** - Amount column and custom names
  - **Amount Column**: Added "Amount" column showing card count for each boost
  - **Custom Name Display**: Fixed custom boost names display for authenticated users
  - **API Integration**: Boosts API now includes custom names without requiring authentication
  - **Column Layout**: Name | Amount | Overtake | Defend | Corners | Tyre Use | Power Unit | Speed | Pit Stop | Race Start

- **User Data Input Interface** - Complete spreadsheet-style data entry system
  - **Data Input Page**: `/data-input` with tabbed interface for Drivers, Car Parts, and Boosts
  - **Auto-save Functionality**: Immediate saving on input change/blur with proper validation
  - **Level Validation**: Rarity-based level restrictions (Common: 1-11, Rare: 1-9, Epic: 1-8, Legendary/Special: 1-7)
  - **Tab-through Workflow**: Efficient keyboard navigation (level → card count → next item)
  - **Smart Filtering**: Excludes starter components (series 0) from parts, includes special drivers
  - **Custom Sorting**:
    - Drivers: Series → Rarity → Ordinal ascending
    - Parts: Brakes → Gearbox → Rear Wing → Front Wing → Suspension → Engine (by part type)
    - Boosts: Numerical sorting by extracted numbers from boost names
  - **Database Schema**: Added `card_count` fields to `user_drivers`, `user_car_parts`, and `user_boosts` tables
  - **API Endpoints**: Created update endpoints for all asset types with proper authentication
  - **Navigation**: Added "Data Input" link to main navigation menu
  - **UI Consistency**: Matches drivers page styling with dark headers, compact padding, rarity backgrounds
  - **Column Layout**: Optimized columns for each asset type (Name, Rarity, [Type], Series, Level, Amount)

- **Boost Custom Naming Feature**
  - **Database Schema**: Created `boost_custom_names` table with unique constraints
  - **API Endpoints**: `GET/PUT/DELETE /api/boosts/[id]/custom-name` with full validation
  - **Admin Authentication**: Proper Supabase Auth integration with admin role checking
  - **Inline Editing**: Click-to-edit boost names with real-time validation
  - **Character Validation**: A-Z, a-z, 0-9, hyphens, periods only (64 char limit)
  - **Duplicate Prevention**: Database-level constraints prevent duplicate custom names
  - **Fallback Logic**: `custom_name || icon || name` display hierarchy
  - **UI Integration**: Seamless integration with existing DataGrid component
  - **Real-time Updates**: Immediate UI refresh after successful name changes
  - **Admin Controls**: Only admin users (thomas.lobaugh@gmail.com) can edit names

- **Spreadsheet-Style Data Grid UI**
  - Created new `DataGrid` component to replace card-based `AssetGrid`
  - Implemented spreadsheet-style table layout for drivers, parts, and boosts
  - Added sortable columns with visual indicators (↑/↓)
  - Maintained all existing functionality: filtering, search, comparison
  - Added responsive design with horizontal scrolling for smaller screens
  - Preserved action buttons (Compare, Add to Collection, Remove)
  - **Enhanced Sorting**: Added comprehensive sorting for all stat columns including DRS
  - **Compact Design**: Reduced cell padding from `px-6 py-4` to `px-3 py-2` for better data density
  - **Content-Based Width**: Changed from `w-full` to `table` with `w-fit` container for optimal space usage
  - **Rarity Coloring**: Switched to background colors instead of text colors for better contrast
  - **Column Alignment**: Center-justified data columns, left-justified Name and Rarity
  - **User-Specific Columns**: Added Level, Bonus, and Total Value columns for authenticated users
  - **Stat Calculations**: Added Total Value calculations (drivers: sum of 5 stats, parts: sum of 5 stats excluding Pit Stop)

### Changed
- **Authentication System Overhaul**
  - Replaced deprecated `@supabase/auth-helpers-nextjs` with modern `@supabase/ssr`
  - Updated `AuthContext` to use proper Supabase client for client-side authentication
  - Fixed all API routes to use `createServerSupabaseClient` for server-side auth
  - Added `AuthProvider` to application providers for proper authentication context
  - **Local Development Fix**: Implemented JWT token parsing for local Supabase compatibility
  - **Provider Pattern**: Created `AuthProvider` interface with `MiddlewareAuthProvider` and `ClientAuthProvider` implementations

- **Car Parts Page Enhancements**
  - **Stat Names**: Fixed stat column names (Speed, Cornering, Power Unit, Qualifying, DRS, Pit Stop)
  - **DRS Column**: Added missing DRS stat column with proper sorting
  - **Part Types**: Corrected part type mapping (Gearbox, Brakes, Engine, Suspension, Front Wing, Rear Wing)
  - **Total Value**: Excluded Pit Stop time from Total Value calculation
  - **User Data**: Now uses `useUserCarParts` for user-specific level and ownership data

- **Drivers Page Improvements**
  - **Stat Sorting**: Added sorting for all driver stat columns (Overtaking, Defending, Qualifying, Tyre Use, Race Start)
  - **Total Value**: Calculated as sum of all 5 driver stats
  - **Authentication**: Requires user login with professional Card-based login prompt

- **Boosts Page Updates**
  - **Sortability**: Made Boost Type column sortable alongside all tier columns
  - **Authentication**: Added sign-in requirement with consistent login prompt design

- **Compare Page Enhancements**
  - **Authentication**: Added sign-in requirement for item comparison functionality
  - **Consistent UI**: Updated login prompt to match dashboard design

- **Boosts Page Major Improvements**
  - **Removed Boost Type Column**: Eliminated the 'boost type' column as requested
  - **Removed DRS Tier Column**: Completely removed DRS tier values and column
  - **Fixed Column Ordering**: Reordered boost columns to: Overtake, Defend, Corners, Tyre Use, Power Unit, Speed, Pit Stop, Race Start
  - **Value Display**: Changed boost stat values to display `value * 5` instead of raw tier values
  - **Color Coding**: Added tier-based color coding (1=blue, 2=green, 3=yellow, 4=orange, 5=red) for values > 0
  - **Icon Display**: Changed name column to display boost icon string instead of name string for boosts

- **UI Consistency Improvements**
  - **Login Prompts**: Standardized all sign-in required messages to use professional Card design
  - **Removed Debug Components**: Cleaned up AuthDebug component from production UI
  - **Navigation**: Maintained responsive navigation across all pages

### Changed
  **Global**
  - Updated driver and part bg colors to be more vivid
  - Added special Edition Driver Rarity to display and filter
  - 
- **Driver List UI**
  - Replaced card-based display with spreadsheet-style data grid
  - Updated `src/app/drivers/page.tsx` to use new `DataGrid` component
  - Maintained all filtering, sorting, and search capabilities
  - Improved data density for better comparison of multiple items
  - Moved "Race Start" column one position left (before "Tyre Use") for better stat flow

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
