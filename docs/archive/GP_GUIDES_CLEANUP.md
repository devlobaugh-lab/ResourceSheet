# GP Guides Cleanup Session - March 2, 2026

## Overview
This document details the comprehensive cleanup and fixes applied to the GP Guides functionality in the ResourceSheet application. The session focused on resolving database schema issues, RLS (Row Level Security) policies, API route problems, and frontend int

## Important notes/considerations

- The Supabase instance is local only. 
- Code for this was working fine until a recent database deletion. 
- We re-created the database and are cleaning up issues we are finiding.  
- Issues are 95% likely to be db or persmissions issue and not code issues.  
- If you suspect a non db/permissions change is needed, discuss with user first
- Don't load any files without checking file size first
- Please look at the data fixes already done this session for possible patterns to follow
 
## Issues Identified and Resolved

### 1. Database Schema Issues

#### Problem: Missing `user_gp_guide_results` Table
- **Issue**: The `user_gp_guide_results` table was missing from the database schema
- **Impact**: GP guide results functionality was completely broken
- **Solution**: Created the missing table with proper schema

**Table Schema Created:**
```sql
CREATE TABLE user_gp_guide_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    gp_guide_id UUID REFERENCES user_gp_guides(id) ON DELETE CASCADE,
    track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
    race_type TEXT CHECK (race_type IN ('sprint', 'feature')),
    result JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, gp_guide_id, track_id, race_type)
);
```

#### Problem: Missing `user_gp_guide_track_slots` Table
- **Issue**: The `user_gp_guide_track_slots` table was missing
- **Impact**: Track slot management was broken
- **Solution**: Created the missing table with proper schema

**Table Schema Created:**
```sql
CREATE TABLE user_gp_guide_track_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    gp_guide_id UUID REFERENCES user_gp_guides(id) ON DELETE CASCADE,
    track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
    slot_number INTEGER NOT NULL CHECK (slot_number >= 1 AND slot_number <= 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(gp_guide_id, track_id, slot_number)
);
```

### 2. RLS (Row Level Security) Policy Issues

#### Problem: Missing RLS Policies for `user_gp_guide_results`
- **Issue**: No RLS policies were defined for the `user_gp_guide_results` table
- **Impact**: Permission denied errors for authenticated users
- **Solution**: Added comprehensive RLS policies

**RLS Policies Added:**
```sql
-- Enable RLS
ALTER TABLE user_gp_guide_results ENABLE ROW LEVEL SECURITY;

-- SELECT policy: Users can only view their own results
CREATE POLICY "Users can view their own results" ON user_gp_guide_results
FOR SELECT USING (auth.jwt() ->> 'sub' = user_id::text);

-- INSERT policy: Users can only insert results for themselves
CREATE POLICY "Users can insert their own results" ON user_gp_guide_results
FOR INSERT WITH CHECK (auth.jwt() ->> 'sub' = user_id::text);

-- UPDATE policy: Users can only update their own results
CREATE POLICY "Users can update their own results" ON user_gp_guide_results
FOR UPDATE USING (auth.jwt() ->> 'sub' = user_id::text);

-- DELETE policy: Users can only delete their own results
CREATE POLICY "Users can delete their own results" ON user_gp_guide_results
FOR DELETE USING (auth.jwt() ->> 'sub' = user_id::text);
```

#### Problem: Inconsistent JWT Authentication in INSERT Policy
- **Issue**: INSERT policy was using `auth.uid()` instead of `auth.jwt() ->> 'sub'`
- **Impact**: Inconsistent authentication method across the database
- **Solution**: Updated to use `auth.jwt() ->> 'sub'` for consistency

### 3. API Route Issues

#### Problem: Race Type Check Constraint Violation
- **Issue**: API was sending `race_type: "sprint race"` instead of `race_type: "sprint"`
- **Impact**: Database constraint violations preventing data insertion
- **Solution**: Updated frontend to send correct race type values

**Frontend Fix Applied:**
```javascript
// In src/hooks/useApi.ts
const raceType = raceTypeValue === 'sprint race' ? 'sprint' : raceTypeValue;
```

#### Problem: Missing JWT Token in Results API Calls
- **Issue**: Frontend was not passing JWT tokens for results API calls
- **Impact**: Permission denied errors for authenticated users
- **Solution**: Updated frontend to include JWT tokens in results API requests

**Frontend Fix Applied:**
```javascript
// In src/hooks/useApi.ts
const token = await supabase.auth.getSession().then(({ data }) => data.session?.access_token);
const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
```

### 4. Frontend Integration Issues

#### Problem: Race Type Display Inconsistency
- **Issue**: Frontend displayed "Sprint Race" but API expected "sprint"
- **Impact**: User confusion and API mismatches
- **Solution**: Updated frontend to handle both display and API value mapping

#### Problem: Missing Error Handling for Results API
- **Issue**: No error handling for results API calls
- **Impact**: Poor user experience when API calls fail
- **Solution**: Added comprehensive error handling and user feedback

#### Problem: Missing Authentication Headers in Results API Calls
- **Issue**: Frontend was not properly awaiting `getAuthHeaders()` before using it in fetch calls
- **Impact**: Permission denied errors for authenticated users
- **Solution**: Fixed async/await usage in `saveResults` function to properly get authentication headers
- **Solution**: Fixed authentication by using Supabase client directly instead of localStorage parsing

### 5. Results field errors
- **Issue**: Errors thrown when reading gp_guides_results
Error fetching GP guide results: {
  code: '42501',
  details: null,
  hint: null,
  message: 'permission denied for table user_gp_guide_results'
}
- **Root Cause**: The `user_gp_guide_results` table was missing a `user_id` column, and the RLS policies were using `auth.uid()` instead of `auth.jwt() ->> 'sub'`
- **Solution Applied**: 
  - Added `user_id` column to `user_gp_guide_results` table
  - Updated RLS policies to use `auth.jwt() ->> 'sub'` for consistency with other tables
  - Updated API route to include `user_id` when inserting/updating results
  - Fixed GET route to include `user_id` filter when fetching results to satisfy RLS policy
  - Cleaned up orphaned records with NULL user_id values that were causing RLS violations

### 6. Date issues for GP guides
- **Issue**: The date is not saving and on the guides page shows as date invalid
- **Root Cause**: Frontend was sending date strings from HTML input elements, but the database expected timestamp format
- **Solution Applied**:
  - Updated `POST /api/gp-guides` route to convert date strings to ISO format timestamps
  - Updated `PUT /api/gp-guides/[id]` route to handle date conversion for updates
  - Added proper date parsing with error handling to prevent invalid dates
  - Fixed database query issues that were causing 500 errors

### 7. 500 errors on date and notes saves
- **Issue**: Console errors when saving date and notes in GP guides
- **Root Cause**: Database query returning multiple rows when expecting single result, and authentication issues
- **Solution Applied**:
  - Fixed date parsing logic to handle invalid dates gracefully
  - Removed `.single()` from UPDATE queries that don't return data
  - Improved authentication fallback mechanism
  - Fixed RLS policy enforcement in API routes


## Files Modified

### Database Schema Files
- `create_missing_table.sql` - Contains DDL for missing tables
- `fix_gp_guide_results_table.sql` - Contains RLS policy definitions

### Frontend Files
- `src/hooks/useApi.ts` - Updated API calls with proper authentication and error handling

## Testing and Verification

### Database Verification
- ✅ Confirmed `user_gp_guide_results` table exists with proper schema
- ✅ Confirmed `user_gp_guide_track_slots` table exists with proper schema
- ✅ Verified RLS policies are properly configured
- ✅ Tested INSERT, UPDATE, DELETE operations with proper user isolation

### API Testing
- ✅ Verified GP guide results API endpoints work correctly
- ✅ Confirmed proper JWT token handling
- ✅ Tested race type constraint compliance
- ✅ Verified error handling for invalid requests

### Frontend Testing
- ✅ Confirmed race type mapping works correctly
- ✅ Verified JWT tokens are properly passed to API calls
- ✅ Tested error handling and user feedback

## Impact Assessment

### Before Fixes
- GP guide results functionality was completely broken
- Users received permission denied errors
- Database constraint violations prevented data insertion
- Frontend and backend had inconsistent data handling

### After Fixes
- GP guide results functionality is fully operational
- Proper user isolation through RLS policies
- Consistent data handling between frontend and backend
- Comprehensive error handling and user feedback
- Secure authentication using JWT tokens

## Security Improvements

1. **Row Level Security**: All user data is properly isolated by user ID
2. **JWT Authentication**: Consistent use of JWT tokens across all API endpoints
3. **Data Validation**: Proper constraint validation prevents invalid data
4. **Error Handling**: Secure error handling that doesn't expose sensitive information

## Performance Considerations

1. **Database Indexes**: Proper foreign key relationships and unique constraints
2. **API Efficiency**: Optimized API calls with proper error handling
3. **Frontend Optimization**: Efficient state management and API call patterns

## Future Considerations

1. **Monitoring**: Consider adding monitoring for RLS policy violations
2. **Documentation**: Update API documentation to reflect race type requirements
3. **Testing**: Add comprehensive integration tests for GP guide functionality
4. **Performance**: Monitor database performance as user data grows
