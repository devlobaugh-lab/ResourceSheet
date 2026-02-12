# Drivers Rarity 5 Issue Analysis

## Problem Summary

The drivers page is showing **29 rarity 5 drivers** instead of the expected **14 rarity 5 drivers**. The issue is caused by **legacy data accumulation** in the database from previous seasons/series.

## Root Cause Analysis

### 1. Database State
- **Current database**: 112 drivers total, 29 rarity 5 drivers
- **Expected state**: 97 drivers total, 14 rarity 5 drivers
- **Issue**: Database contains **extra drivers** that are not in the current season 6 content cache

### 2. Data Mismatch Problem
The database has accumulated **extra drivers** beyond what's in the current content:
- **Database has**: 112 drivers (29 rarity 5)
- **Content cache has**: 97 drivers (14 rarity 5)
- **Difference**: 15 extra drivers (15 extra rarity 5 drivers)

### 3. Source Data Verification
The current content cache (`globalContent/season_6.drivers.json`) contains exactly:
- **97 drivers total** across Series 1, 4, and 7
- **14 rarity 5 drivers**:
  - Oliver Bearman (Series 7 & 10)
  - Liam Lawson (Series 7 & 10) 
  - Gabriel Bortoleto (Series 7 & 10)
  - Andrea Kimi Antonelli (Series 7 & 10)
  - Franco Colapinto (Series 7 & 10)
  - Jack Doohan (Series 7 & 10)
  - Isack Hadjar (Series 7 & 10)

**Note**: Series 1-12 are available in every season. The issue is that the database contains drivers not present in the current season 6 content cache.

## Collections Data Status

### ✅ Collections Table is Correct
- **3 collections** with proper themes and ordinals:
  - `Collection 1` (Ordinal: 1) - Theme: "Series 1"
  - `Collection 2` (Ordinal: 2) - Theme: "Series 4" 
  - `Collection 3` (Ordinal: 3) - Theme: "Series 7"

### ✅ Collection IDs in Drivers are Correct
All drivers in the source data have correct `collection_id` values:
- Series 1 drivers → Collection 1
- Series 4 drivers → Collection 2  
- Series 7 drivers → Collection 3

## Solution

### Immediate Fix Required
The database needs to be refreshed using the **admin content-cache upload functionality** to:

1. **Remove extra drivers** that are not in the current season 6 content cache
2. **Ensure only drivers from the current content cache** remain
3. **Maintain proper collection relationships**

### Why Direct Database Manipulation Won't Work
- **Row Level Security (RLS)** policies prevent direct inserts/updates
- **Proper import mechanism** must be used to maintain data integrity
- **Content cache system** is designed to be the single source of truth

### Recommended Action
Use the admin panel's content-cache upload feature to refresh the drivers data from the current source files in `globalContent/season_6.drivers.json`.

## Verification Steps

After the refresh, verify:
1. Database has exactly **97 drivers**
2. Database has exactly **14 rarity 5 drivers**
3. All drivers are from the **current season 6 content cache** (Series 1, 4, and 7)
4. Collections table remains intact with 3 collections
5. Collection ordinals are preserved (1, 2, 3)
6. Drivers API returns correct sorting by collection ordinal

## Impact
This fix will resolve the rarity 5 driver count discrepancy and ensure the drivers page displays the correct data for the current season 6 content.