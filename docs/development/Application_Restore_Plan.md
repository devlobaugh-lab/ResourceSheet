# Plan to get application fully functional after Datbase rebuild

## Context
We recently had a database get completly deleted and removed and have worked to re-create the db needed to run our application and loaded a lot of data. Now that the major work of creating the db and getting the app is done, we are now at the stage of testing and fixing issues that still remain.  

Note: Database is a local Supabase instance. (no cloud)

## Plan

I want to address these issues in order 1 by 1. All of these issues are most likely database issues (missing/bad structure or permissions) and not code issues. The application was working almost perfectly before the db delete, so it doesn't make sense that we should need to make any code changes to get the app back to fully working shape. We really need to focus on getting the data and access right. If you do find an instance where you are convinced a code change is needed - STOP - ask me for help and for confirmation.

### ~~Step 1 - Admin not fully working (COMPLETED)~~

Admin does not appear to be fully functional.
It looks like there are 2 or more types of isAdmin variables that are in use and so while some admin features seem to work, others do not.  For example. I'm logged in as thomas.lobaugh@gmail.com. (this should be an admin user). I'm seeing the Admin menu item.  The admin check in the browser console.log says isAdmin = true. However the Admin check that show on the dev console shows isAdmin false and isAuthenticated false.  Maybe that check is old and not looking at the right data, but it has me concerned.  

In terms of fuctionality when logged in as thomas.lobaugh@gmail.com:
- I see the Admin menu item and can navigate to the admin dashboard
- I get an error if I try to save a custom boost name (this is an admin feature)
- I can't add/edit/deactiver/delete a user from user admin - get 500 error
- The status and type columns on the user admin page show incorrect info. It shows my user as Normal and inactive. 
- all imports from the admin dashboard fail with an error that admin access is required.  

### Step 2 - User testing

Have user test all admin features and other broken areas to see if the admin fix also fixed other things too.

### Step 3 - API issues

I'm getting 500 errors on several APIs. I'm not sure if these are permission issues or maybe the tables don't exist.
Here are the APIs not working (returning 500 errors):

- /api/tracks
- /api/ai-loadouts
- /api/series

### Step 4 - other issues

- random console errors - get this on most pages
    index.mjs:158  GET http://localhost:54321/rest/v1/collections?select=*&order=ordinal.asc 403 (Forbidden)
- rarity utility call from Drivers page
     rarityUtils.ts:84 Error fetching rarity options: Error: Failed to   fetch rarity options
        at getRarityOptions (rarityUtils.ts:78:13)
        at async fetchRarityOptions (DriverCompareGrid.tsx:108:25)