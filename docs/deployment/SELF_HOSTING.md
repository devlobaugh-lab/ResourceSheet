# Self-Hosting Guide

This guide covers running the ResourceSheet application on your own infrastructure while continuing to use Supabase for the database.

## Architecture

- **Frontend/API**: Next.js 15 application (Node.js)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth

## Prerequisites

- Node.js 18+
- npm or yarn
- A Supabase project (you can continue using your existing one)

## Environment Setup

1. Create `.env.local` in the project root with the following variables:

   ```env
   # Required: Supabase credentials
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

   # Required for password reset emails to work correctly
   NEXT_PUBLIC_SITE_URL=https://your-domain.com

   # Optional: set to 'debug', 'info', 'warn', 'error', or 'off' (default: 'off' in production)
   NEXT_PUBLIC_LOG_LEVEL=off
   ```

## Development

Run the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

## Production Build

1. Build the application:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

Or use a process manager like PM2:
```bash
npm install -g pm2
pm2 start npm --name "resourcesheet" -- start
```

## Database

Your existing Supabase project already contains the required database schema. The application uses:
- Row Level Security (RLS) for data protection
- Supabase Auth for user authentication

## Backup & Restore

See [BACKUP_RESTORE_README.md](../operations/BACKUP_RESTORE_README.md) for detailed backup instructions.

## Troubleshooting

### Port Already in Use
```bash
# Find and kill process on port 3000
lsof -i :3000
kill -9 <PID>
```

### Database Connection Issues
- Verify your Supabase URL and keys are correct
- Check that your Supabase project is active
- Ensure your IP is allowlisted if you have IP filtering enabled

### Authentication Problems
- Make sure `AUTH_SECRET` is set to a secure random string
- Clear browser cookies and try again
