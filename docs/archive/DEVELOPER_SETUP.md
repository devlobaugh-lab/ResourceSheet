# Developer Setup Guide

This guide provides instructions for setting up the F1 Resource Manager development environment, including database initialization and seeding.

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase project (local or cloud)
- Git

## Initial Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ResourceSheet
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Configuration

Copy the example environment file and configure your settings:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase configuration:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 4. Database Setup

#### Option A: Using Supabase CLI (Recommended)

If you have the Supabase CLI installed:

```bash
# Start local Supabase development environment
supabase start

# Run migrations
supabase db migrate

# Seed the database
supabase db seed --file db/seeds/01_seasons.sql
supabase db seed --file db/seeds/02_car_parts.sql
supabase db seed --file db/seeds/03_drivers.sql
supabase db seed --file db/seeds/04_boosts.sql
```

#### Option B: Manual Database Initialization

If Supabase CLI is not available, use the provided initialization script:

```bash
# Initialize the database with all required data
npm run db:init
```

This will:
- Create all necessary tables and functions
- Seed seasons, car parts, drivers, and boosts
- Set up test users and admin accounts

### 5. Start Development Server

```bash
npm run dev
# or
yarn dev
```

Visit `http://localhost:3000` to see the application.

## Database Management

### Seeding Data

The application includes several seed files for different data types:

- `db/seeds/01_seasons.sql` - Season data (currently Season 6)
- `db/seeds/02_car_parts.sql` - Car part definitions
- `db/seeds/03_drivers.sql` - Driver data
- `db/seeds/04_boosts.sql` - Boost configurations

#### Individual Seeding

You can seed specific data types:

```bash
# Seed only seasons
node scripts/seed_seasons.js

# Seed only car parts
node scripts/seed_car_parts.js

# Seed only drivers
node scripts/seed_drivers.js

# Seed only boosts
node scripts/seed_boosts.js
```

#### Complete Re-seeding

To reset and re-seed all data:

```bash
# Reset database and re-seed everything
npm run db:reset
```

### Database Schema

The database schema is defined in `supabase/migrations/`. Key tables include:

- `seasons` - Season definitions with active status
- `catalog_items` - Game items (car parts, drivers)
- `user_items` - User-owned items
- `boosts` - Boost configurations
- `user_boosts` - User-owned boosts
- `profiles` - User profiles with admin flags
- `tracks` - Race track definitions

### Current Season Management

The application tracks the current active season using the `is_active` boolean field in the `seasons` table. Only one season should be active at a time.

To change the active season:

```sql
-- Deactivate current season
UPDATE seasons SET is_active = false WHERE is_active = true;

-- Activate new season
UPDATE seasons SET is_active = true WHERE name = 'Season 7';
```

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify your Supabase URL and keys in `.env.local`
   - Ensure your Supabase project is running
   - Check network connectivity

2. **Missing Seasons in Admin Panel**
   - Run `node scripts/seed_seasons.js` to ensure seasons are seeded
   - Verify the seasons table has data: `SELECT * FROM seasons;`

3. **Authentication Issues**
   - Ensure `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct
   - Check that your Supabase project has email authentication enabled

4. **Missing Dependencies**
   - Run `npm install` or `yarn install` to ensure all dependencies are installed
   - Check Node.js version compatibility

### Resetting Development Environment

If you encounter persistent issues, you can reset your development environment:

```bash
# Stop any running services
# Remove node_modules and reinstall
rm -rf node_modules
npm install

# Reset database (if using local Supabase)
supabase stop
supabase start

# Re-run migrations and seeds
supabase db migrate
npm run db:init
```

## Development Workflow

### Adding New Seasons

1. Add season data to `db/seeds/01_seasons.sql`
2. Update the active season if needed
3. Run the seasons seed script
4. Test in the admin panel

### Adding New Game Data

1. Add data to the appropriate seed file
2. Update any related API endpoints if needed
3. Test the new data in the application

### Database Changes

1. Create a new migration file in `supabase/migrations/`
2. Follow the naming convention: `YYYYMMDDHHMMSS_description.sql`
3. Include both the changes and rollback instructions
4. Test migrations locally before deploying

## Production Deployment

For production deployment:

1. Set up a production Supabase project
2. Configure environment variables for production
3. Run migrations: `supabase db migrate --db-url $DATABASE_URL`
4. Seed essential data
5. Deploy your application

## Support

If you encounter issues not covered in this guide:

1. Check the project's GitHub issues
2. Review the Supabase documentation
3. Ask for help in the project's communication channels