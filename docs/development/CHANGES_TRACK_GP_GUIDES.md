# Changes needed for Track Guides and GP Guides

I want to focus on fixes and tweaks to the Track Guides and GP Guides.

## Bugs

1. [x] Track Guide - if I select several alternate boosts, and then click save, the boosts go away. If I select these boosts after I have already hit save for any reason, this doesn't happen. (even if I did not select boosts before the first save). There is no console.error when this happens
   - **Fixed**: Updated the `/api/track-guides` POST handler to include all fields including `suggested_boosts`, `suggested_drivers`, and driver strategy fields. Also updated TypeScript types to include the missing fields.
2. [x] Track Guide and the GP Guide - The Boosts select modal screen on both pages show zeros in the amounts for the boosts listed. These should be pulling the same amounts as the boosts page does.
   - **Fixed**: Changed both pages to use `/api/user-boosts` instead of `/api/boosts` to get the `card_count` data.
3. [x] GP guide - The Race Results Notes is not using Track Display name but system track name
   - **Fixed**: Updated the Race Results Notes section to use `t.display_name || t.name` instead of just `t.name`.
4. [x] Track guide - Select Drivers should remember highest level selection
   - **Fixed**: Updated `DriverSelectionGrid` to persist `showHighestLevel` state to localStorage so it persists across modal opens.
5. [x] Track guides - On the guide listing page there are green circles that indicate if there is a guide to each tier of that track. A circle should not be green unless a Track guide for that tier has a driver, boost and a dry tyre strategy filled in for both drivers. This is the bare minimum needed for a track guide to be useful.
   - **Fixed**: Added `isGuideUseful()` function that checks for minimum required fields (driver, boost, dry strategy for both drivers) before showing green circle.

## Changes

1. [x] GP Guide - the notes field should be optional (it should not be used in the field count either.)
   - **Already implemented**: The notes field is not included in the `completedFields` array, so it's already optional and not counted.
2. [ ] Track Guide and GP Guide Driver select modal doesn't allow for bonus. Should have a percentage field and a checkbox next to drivers
3. [x] GP Guide - I like the concept of marking a race as ready, however, you are currently determining readiness by the number of fields that are complete. I'd like to change this and give the user a checkbox or toggle that allows them to call a guide's race ready. The workflow issue is that if we import a track guide, the race may show ready because it has been filled in, but the user has not reviewed it yet, so it may not be ready.  I don't want to get rid of the field complete counter i.e. 4/6
   - **Fixed**: Added `is_ready` field to `user_gp_guide_tracks` type and updated UI with a user-controlled "Ready" toggle button. Shows progress counter (e.g., 4/7) when not ready. The toggle allows users to explicitly mark a race as ready regardless of field completion.
   - **Database migration needed**: A migration is needed to add the `is_ready` boolean column to the `user_gp_guide_tracks` table (default false).

## Database Migration Required

To complete Change #3, run the following migration:

```sql
-- Add is_ready column to user_gp_guide_tracks
ALTER TABLE user_gp_guide_tracks 
ADD COLUMN is_ready boolean DEFAULT false;
```
