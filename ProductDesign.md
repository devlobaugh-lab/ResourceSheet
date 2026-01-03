__I. Product Design__

- __Data Model:__

  - Global Data (catalog_items): Drivers, Parts, Boosts (ID, name, stats, etc.)
  - User Data (user_items): Level, # of cards, associated with a specific catalog item and user.
  - Seasons: A season table to track the start and end dates of each season. The catalog_items table will need a season_id to differentiate assets between seasons.

- __User Interface:__

  - Data Entry Screen: Optimized for keyboard input, but usable on mobile. Input fields for level and # of cards.
  - Driver/Part/Boost Grids: Display asset info, sortable columns, filtering options.
  - Asset Comparison Screen: Allows users to select a handful of assets and compare them side-by-side.
  - Admin Screen: Accessible only to admins, for uploading global data files, user maintenance, and potentially a rollback feature.

- __User Roles:__

  - Admin: Can access the admin screen and perform admin functions.
  - Normal User: Can access the data entry screen, asset grids, and asset comparison screen.

- __Authentication:__
  - Supabase Auth with email magic links.

__II. Application Development Plan__

1. __Database Setup (Supabase):__

   - Create tables for catalog_items (drivers, parts, boosts), user_items, and seasons.
   - Implement RLS policies to ensure data isolation.
   - Create indexes for efficient querying.

2. __Backend Development (Next.js API Routes/Server Actions):__

   - Implement API endpoints for:

     - Fetching global data (drivers, parts, boosts)
     - Fetching user data (level, # of cards)
     - Updating user data
     - Admin functions (uploading global data, user maintenance)

   - Implement authentication using Supabase Auth.

3. __Frontend Development (Next.js Server Components/Client Components):__

   - Develop the data entry screen.
   - Develop the driver/part/boost grids with sorting and filtering.
   - Develop the asset comparison screen.
   - Develop the admin screen (accessible only to admins).
   - Implement responsive design for mobile and web.

4. __Admin Interface:__

   - Implement a screen where an admin can upload a new global data file.
   - Implement a rollback feature to recover from bad data dumps.
   - Implement user maintenance functions (add, update, delete).

5. __Testing:__

   - Implement unit tests for backend functions.
   - Implement integration tests for API endpoints.
   - Perform manual testing to ensure data isolation and functionality.

6. __Deployment (Vercel):__

   - Deploy the application to Vercel.
   - Configure environment variables.

__III. Next Steps__

1. __Gather Specific Driver Information:__ Get the specific driver information needed for the driver grid (name, stats, etc.) and the columns that need to be sortable and filterable.
2. __Define Asset Comparison Criteria:__ Define the specific criteria users should be able to compare for assets.
3. __Design Database Schema:__ Design the detailed database schema for catalog_items, user_items, and seasons, including data types and relationships.
4. __Create Mockups:__ Create mockups of the data entry screen, asset grids, asset comparison screen, and admin screen.
