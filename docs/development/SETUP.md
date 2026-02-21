# F1 Resource Manager - Development Setup Guide

This guide provides comprehensive instructions for setting up the F1 Resource Manager development environment, including database initialization, seeding, and development workflow.

## Prerequisites

### Required Software

- **Node.js**: Version 18+ (recommended: latest LTS)
- **npm** or **pnpm**: Package manager (pnpm recommended)
- **Docker**: For local Supabase development
- **Supabase CLI**: For database management
- **Git**: Version control

### Optional Tools

- **VS Code**: Recommended IDE with extensions
- **PostgreSQL client**: For database exploration (TablePlus, pgAdmin, etc.)

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/f1-resource-manager.git
cd f1-resource-manager
```

### 2. Install Dependencies

Using pnpm (recommended):
```bash
pnpm install
```

Using npm:
```bash
npm install
```

### 3. Set Up Supabase Locally

#### Install Supabase CLI

```bash
# Using npm
npm install -g @supabase/supabase-cli

# Using Homebrew (macOS)
brew install supabase/tap/supabase

# Using Docker (alternative)
docker pull supabase/supabase
```

#### Initialize Supabase Project

```bash
supabase init
```

This creates:
- `supabase/` directory with configuration
- `supabase/config.toml` file

#### Start Local Supabase Stack

```bash
supabase start
```

This starts:
- PostgreSQL database
- Supabase Auth
- Supabase Storage
- Supabase Studio (web interface)

**Note**: First run may take 2-3 minutes to download Docker images.

### 4. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-local-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional: Enable debug logging
DEBUG=1
```

To get your local Supabase keys:

```bash
supabase status
```

This displays the local URL and keys. Copy the `anon` key and `service_role` key to your `.env.local` file.

### 5. Set Up Database

#### Option A: Using Supabase CLI (Recommended)

```bash
# Run migrations
supabase db push

# Seed the database
supabase db seed --file db/seeds/01_seasons.sql
supabase db seed --file db/seeds/02_car_parts.sql
supabase db seed --file db/seeds/03_drivers.sql
supabase db seed --file db/seeds/04_boosts.sql
```

#### Option B: Using Custom Scripts

```bash
# Initialize the database with all required data
npm run db:init

# Or run individual seed scripts
node scripts/seed_seasons.js
node scripts/seed_new_tables.js
```

This populates the database with:
- Seasons data (currently Season 6)
- Car parts definitions
- Driver data with stats per level
- Boost configurations

### 6. Start Development Server

```bash
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Supabase Studio**: http://localhost:54323

## Database Management

### Database Schema

The database schema is defined in `supabase/migrations/`. Key tables include:

| Table | Description |
|-------|-------------|
| `seasons` | Season definitions with active status |
| `drivers` | Driver catalog with stats |
| `car_parts` | Car part catalog with stats |
| `boosts` | Boost configurations |
| `user_drivers` | User-owned drivers with levels |
| `user_car_parts` | User-owned car parts |
| `user_boosts` | User-owned boosts |
| `user_car_setups` | Saved car configurations |
| `user_track_guides` | Racing strategies per track |
| `profiles` | User profiles with admin flags |
| `tracks` | Race track definitions |

### Seeding Data

The application includes several seed files:

- `db/seeds/01_seasons.sql` - Season data
- `db/seeds/02_car_parts.sql` - Car part definitions
- `db/seeds/03_drivers.sql` - Driver data
- `db/seeds/04_boosts.sql` - Boost configurations

#### Complete Re-seeding

To reset and re-seed all data:

```bash
# Reset database and re-seed everything
npm run db:reset

# Or manually:
supabase db reset
supabase db push
node scripts/seed_new_tables.js
```

### Creating Migrations

When you need to modify the database schema:

1. **Create a new migration**:
   ```bash
   supabase migration new create_new_table
   ```

2. **Edit the migration file** in `supabase/migrations/`

3. **Apply the migration**:
   ```bash
   supabase db push
   ```

**Important**: Always use migrations for schema changes. Never modify the database directly in production.

## Development Workflow

### File Structure

```
src/
├── app/              # Next.js App Router pages
│   ├── api/         # API route handlers
│   ├── auth/        # Authentication pages
│   ├── admin/       # Admin dashboard pages
│   └── ...          # Feature pages
├── components/       # Reusable React components
│   ├── ui/          # Base UI components
│   └── auth/        # Auth-related components
├── hooks/           # Custom React hooks (useApi.ts)
├── lib/             # Utility functions and Supabase clients
├── types/           # TypeScript type definitions
└── utils/           # Helper functions

supabase/
├── migrations/      # Database migration files
├── seeds/          # Seed data files
└── config.toml     # Supabase configuration
```

### Adding New API Endpoints

1. **Create API route** in `src/app/api/`
2. **Add TypeScript types** in `src/types/`
3. **Create database migration** if needed
4. **Add React Query hooks** in `src/hooks/useApi.ts`

### Adding New Pages

1. **Create page component** in `src/app/`
2. **Add navigation** in `src/components/NavigationMenu.tsx`
3. **Implement data fetching** using existing hooks

### Current Season Management

The application tracks the current active season using the `is_active` boolean field in the `seasons` table. Only one season should be active at a time.

To change the active season:

```sql
-- Deactivate current season
UPDATE seasons SET is_active = false WHERE is_active = true;

-- Activate new season
UPDATE seasons SET is_active = true WHERE name = 'Season 7';
```

### Authentication Development

#### Local Auth Testing

Supabase provides a local auth system for development:

1. **Access Supabase Studio**: http://localhost:54323
2. **Go to Authentication** → **Users**
3. **Create test users** for development

#### Magic Link Testing

To test the magic link flow locally:

1. **Use a real email address** (Gmail, Outlook, etc.)
2. **Check your inbox** for the magic link
3. **Click the link** to complete authentication

### Data Processing

#### Importing External Data

The application includes scripts for processing external data:

```bash
# Preprocess large external data files
node scripts/preprocess_external_data.js

# Import processed data into database
node scripts/unified_data_processor.js
```

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Testing Database Operations

#### Manual Testing

1. **Use Supabase Studio** to inspect data
2. **Test API endpoints** with browser or curl
3. **Verify RLS policies** work correctly

#### Automated Testing

```bash
# Test API endpoints
node scripts/test_api_endpoints.js

# Run linting and type checking
npm run lint
npx tsc --noEmit
```

## Debugging

### Common Issues

#### Port Conflicts

If ports are in use:

```bash
# Check what's using port 3000
lsof -ti:3000

# Kill processes using port 3000
kill -9 $(lsof -ti:3000)
```

#### Database Connection Issues

```bash
# Check if Supabase is running
supabase status

# Restart Supabase
supabase stop
supabase start
```

#### Database Not Starting

```bash
# Check Docker status
docker ps

# Restart Docker (Linux)
sudo systemctl restart docker

# Clear Supabase data (nuclear option)
supabase stop
supabase reset
supabase start
```

#### Migration Failures

```bash
# Check migration status
supabase db status

# Reset and reapply migrations
supabase db reset
supabase db push
```

#### Authentication Issues

1. **Check email configuration** in Supabase dashboard
2. **Verify redirect URLs** are configured correctly
3. **Check browser console** for errors
4. **Ensure `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct**

### Debug Tools

#### Next.js Debug Mode

Add to `.env.local`:
```env
DEBUG=1
NEXT_TELEMETRY_DISABLED=1
```

#### Browser Developer Tools

Use browser dev tools to:
- Inspect network requests
- Check console errors
- Monitor state changes

## Performance Optimization

### Development Performance

- **Enable Fast Refresh**: Automatic in development
- **Use Server Components**: Minimize client-side JavaScript
- **Implement Lazy Loading**: For heavy components

### Build Optimization

```bash
# Build for production
npm run build

# Analyze bundle size
npm run analyze

# Check TypeScript errors
npx tsc --noEmit
```

## Deployment Preparation

### Production Environment Variables

Required for production:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (for admin operations)

Optional:
- `DEBUG` (set to 0 for production)
- `NODE_ENV` (automatically set to production)

### Database Setup for Production

1. **Create production Supabase project**
2. **Run migrations**: `supabase db push --project-ref your-project-id`
3. **Seed essential data** using the seed scripts

### Build Process

```bash
# Install dependencies
npm install --production

# Build application
npm run build

# Start production server
npm start
```

## Resetting Development Environment

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
supabase db push
node scripts/seed_new_tables.js
```

## Getting Help

### Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### Community

- **GitHub Issues**: For bug reports and feature requests
- **Supabase Discord**: For Supabase-specific questions
- **Next.js Discord**: For Next.js-related issues

## Next Steps

After completing setup:

1. **Explore the codebase** to understand the application structure
2. **Run the application** and test basic functionality
3. **Review existing features** to understand implementation patterns
4. **Start with small changes** to get familiar with the development workflow

---

**Last Updated:** February 2026