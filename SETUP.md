# F1 Resource Manager - Development Setup Guide

## Overview

This guide provides step-by-step instructions to set up the F1 Resource Manager development environment locally.

## Prerequisites

### Required Software

- **Node.js**: Version 18+ (recommended: latest LTS)
- **npm** or **pnpm**: Package manager (pnpm recommended)
- **Docker**: For local Supabase development
- **Supabase CLI**: For database management

### Optional Tools

- **Git**: Version control
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

# Optional: Enable debug logging
DEBUG=1
```

To get your local Supabase keys:

```bash
supabase status
```

This displays the local URL and keys. Copy the `anon` key to your `.env.local` file.

### 5. Set Up Database

#### Run Migrations

```bash
supabase db push
```

This applies all database migrations and creates the necessary tables.

#### Seed Initial Data (Optional)

```bash
# Run the seed script
node scripts/seed_new_tables.js
```

This populates the database with sample data for development.

### 6. Start Development Server

```bash
npm run dev
```

or

```bash
pnpm dev
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Supabase Studio**: http://localhost:54323

## Development Workflow

### Database Development

#### Creating Migrations

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

#### Database Schema Changes

**Important**: Always use migrations for schema changes. Never modify the database directly in production.

#### Seeding Data

For development data:

```bash
# Run specific seed files
supabase db seed run

# Or use custom scripts
node scripts/seed_new_tables.js
```

### Code Development

#### File Structure

```
src/
├── app/              # Next.js App Router pages
├── components/       # Reusable React components
├── hooks/           # Custom React hooks
├── lib/             # Utility functions and Supabase clients
├── types/           # TypeScript type definitions
└── utils/           # Helper functions

supabase/
├── migrations/      # Database migration files
├── seeds/          # Seed data files
└── config.toml     # Supabase configuration
```

#### Adding New API Endpoints

1. **Create API route** in `src/app/api/`
2. **Add TypeScript types** in `src/types/`
3. **Create database migration** if needed
4. **Add React Query hooks** in `src/hooks/`

#### Adding New Pages

1. **Create page component** in `src/app/`
2. **Add navigation** in `src/app/client-navigation.tsx`
3. **Implement data fetching** using existing hooks

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

#### Custom Data Processing

For custom data imports:

1. **Create a new script** in `scripts/`
2. **Use the existing Supabase client** pattern
3. **Add proper error handling** and logging

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

# Test TypeScript types
node scripts/test_types.ts
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

#### Environment Variables

Ensure `.env.local` is properly configured and contains valid Supabase keys.

### Debug Tools

#### Next.js Debug Mode

Add to `.env.local`:
```env
DEBUG=1
NEXT_TELEMETRY_DISABLED=1
```

#### Supabase Debug Mode

Add to `.env.local`:
```env
SUPABASE_DEBUG=1
```

#### Browser Developer Tools

Use browser dev tools to:
- Inspect network requests
- Check console errors
- Monitor state changes

## Performance Optimization

### Development Performance

#### Next.js Optimizations

- **Enable Fast Refresh**: Automatic in development
- **Use Server Components**: Minimize client-side JavaScript
- **Implement Lazy Loading**: For heavy components

#### Database Performance

- **Use proper indexes**: Check query performance in Supabase dashboard
- **Avoid N+1 queries**: Use joins and includes
- **Cache frequently accessed data**: Use Next.js caching

### Production Considerations

#### Build Optimization

```bash
# Build for production
npm run build

# Analyze bundle size
npm run analyze
```

#### Environment Variables

For production deployment:

```env
# Production Supabase keys
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
```

## Deployment Preparation

### Environment Setup

#### Production Environment Variables

Required for production:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Optional:
- `DEBUG` (set to 0 for production)
- `NODE_ENV` (automatically set to production)

#### Database Setup

1. **Create production Supabase project**
2. **Run migrations**: `supabase db push --project-ref your-project-id`
3. **Seed data** if needed

### Build Process

```bash
# Install dependencies
npm install --production

# Build application
npm run build

# Start production server
npm start
```

## Troubleshooting

### Supabase Issues

#### Database Not Starting

```bash
# Check Docker status
docker ps

# Restart Docker
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

### Next.js Issues

#### Hot Reload Not Working

1. **Check file structure**: Ensure files are in correct locations
2. **Clear cache**: Delete `.next/` directory
3. **Restart development server**

#### Build Failures

```bash
# Check TypeScript errors
npx tsc --noEmit

# Check ESLint errors
npm run lint

# Clean and rebuild
rm -rf .next/
npm run build
```

### Authentication Issues

#### Magic Links Not Working

1. **Check email configuration** in Supabase dashboard
2. **Verify redirect URLs** are configured correctly
3. **Check browser console** for errors

#### RLS Policy Issues

1. **Test policies** in Supabase SQL editor
2. **Check auth context** with `set request.jwt.claim.sub`
3. **Verify user exists** in auth.users table

## Getting Help

### Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### Community

- **GitHub Issues**: For bug reports and feature requests
- **Supabase Discord**: For Supabase-specific questions
- **Next.js Discord**: For Next.js-related issues

### Development Tips

- **Use TypeScript**: Leverage type checking for better development experience
- **Follow conventions**: Use existing patterns for consistency
- **Test changes**: Always test locally before committing
- **Keep dependencies updated**: Regularly update packages for security and features

## Next Steps

After completing setup:

1. **Explore the codebase** to understand the application structure
2. **Run the application** and test basic functionality
3. **Review existing features** to understand implementation patterns
4. **Start with small changes** to get familiar with the development workflow

Happy coding! 🚀