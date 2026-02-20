# Feature: Update Driver input and rarity handling

## Overview

The game has updated the way it is handling special edition drivers (rarity 5). These are now being grouped into collections that we need to consider and use. I had split rarity 5 drivers into rarity 5 & 6 based on logic. This logic is not scalable as the game is adding more collections. Now that we better understand how they will be structuring their data, we need to adjust and code in such a way to not need coding to support future collections

## Existing Implementation

- **SE Turbo Logic**: Rarity 5 drivers with `collectionSubName` ending in 'SUBTITLE_2' are converted to Rarity 6
- **Display Logic**: Rarity 5 shows as "SE Standard", Rarity 6 shows as "SE Turbo"
- **Background Colors**: Rarity 5 uses red, Rarity 6 uses rose/pink
- **Sorting**: Data Input page - Drivers sorted by rarity, then driver.ordinal

## New Implmentation

### Collections Data Structure

```typescript
interface Collection {
  id: string
  internalName: string
  season: number
  ordinal: number
  name: string
  theme: string  // e.g., "PodiumStars", "HotProspects"
}
```

### New Display Logic

- **Rarity 5 drivers**: Rarity display value is Collection.theme (e.g. "Stars")
- **If driver.collectionSubName not empty**: Grab last char of collectionSubName and append with hyphen to Rarity display value (e.g., "Stars-2")
- **Background**: All Rarity 5 drivers use same background color
- **Remove**: All Rarity 6 references

### Sorting Logic

- Primary: rarity
- Secondary (for Rarity 5): collection:ordinal
- Tertiary (for Rarity 5): driver:ordinal

## Changes needed

NOTE: This change only deals with drivers, and not boosts or part

- [ ] We need to pull the collections object given to us in the content-cache.json file into our database as part of the import for reference
- [ ] We need to remove the logic we have that maps rarity 5 to rarity 6 for drivers.
- [ ] We need to remove the logic we have that changes the rarity name (this will be handled dynamically based on info from the collection table in the future.)
- [ ] We need to make sure we are pulling in the collection id field on drivers. This will map to the collections table so is important.
- [ ] We need to remove any display logic that handles rarity name for rarity 5 & 6 drivers.
- [ ] Content-cache import should now be simpler as there will not need to be much, if any, driver pre-processing.  
- [ ] We will need a new function that handles display name for rarity 5 as it will vary based on the driver's collection theme. 
  - [ ] Logic is: Use the driver's collection id to map to the collection object and get the collection.theme. This is the base rarity to display for that driver
  - [ ] If the driver has a collectionSubTitle field, then we need to pull the last character of that field and append it to the base rarity (i.e. if base rarity is "Stars" and last char of subTitle is "5" then rarity to display will be "Stars-5")
- [ ] Data Input page - Driver sorting by rarity in the app should start with rarity #, but then for rarity #5, will sort by collection.ordinal, then driver.ordinal

## Draft Implementation Plan

### Phase 1: Database Schema Changes

- [ ] Create collections table migration
- [ ] Update database types
- [ ] Add proper RLS policies and indexes

### Phase 2: Data Import & Processing

- [ ] Update content cache import to handle collections
- [ ] Remove SE Turbo preprocessing logic (Rarity 5 → 6 conversion)

### Phase 3: UI & Display Updates

- [ ] Update all rarity display logic in components and/or utils
- [ ] Update background color logic (remove Rarity 6)
- [ ] Update sorting logic for Rarity 5 drivers on Data input page (collection:ordinal → driver:ordinal)

### Phase 4: API & Business Logic

- [ ] Update API endpoints to include collection and theme info
- [ ] Update helper functions for new rarity display and bg color logic
