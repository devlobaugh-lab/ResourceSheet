# Vercel Hosting Guide

This document outlines the steps to deploy this Next.js application to Vercel with Supabase Cloud.

## Overview

- **Frontend/API**: Vercel (Next.js)
- **Database & Auth**: Supabase Cloud (Free tier)
- **Cost**: Free forever (both platforms have excellent free tiers)

## Prerequisites

- Git hosting account (GitHub or GitLab) with this repository
- Email for Supabase account

---

## Step 1: Set Up Supabase Cloud

### 1.1 Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in the details:
   - **Organization**: Your name or organization
   - **Name**: `resource-sheet` (or your preferred name)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose one closest to you
4. Click "Create new project"
5. Wait 1-2 minutes for the project to be ready

### 1.2 Get Supabase Credentials

Once ready, go to **Project Settings → API**:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Copy the "Project URL" |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Copy the "anon public" key |
| `SUPABASE_SERVICE_ROLE_KEY` | Copy the "service_role" key (⚠️ Keep secret!) |

### 1.3 Set Up Database Schema

Use the Supabase CLI to push all migrations to your cloud project:

```bash
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

Your project ref is found in **Project Settings → General** in the Supabase dashboard.

> **Note**: Do not run migrations manually via SQL Editor — there are multiple migration files that must all be applied in order.

### 1.4 Configure Authentication (Optional)

Supabase Auth is pre-configured. The app uses email/password authentication by default.

To customize:
1. Go to **Authentication → Providers → Email**
2. Enable "Confirm email" if desired

---

## Step 2: Deploy to Vercel

### 2.1 Connect Your Git Provider to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in (you can use GitHub, GitLab, or email)
2. Click "Add New..." → "Project"
3. If not already connected, click "Adjust Git Scope" or "Connect Git Provider" to link your GitLab account
4. Import your `ResourceSheet` repository
5. Configure the project:

| Setting | Value |
|---------|-------|
| Framework Preset | Next.js |
| Build Command | `next build` |
| Output Directory | `.next` |

> **Note for GitLab Users**: The import process is identical to GitHub. Vercel's GitLab integration supports automatic deployments and preview environments just like GitHub.

### 2.2 Add Environment Variables

In the Vercel project dashboard, go to **Settings → Environment Variables** and add:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SITE_URL=https://your-project.vercel.app
```

> `NEXT_PUBLIC_SITE_URL` should be your production URL. It is used for password reset email redirects. Update it if you add a custom domain.

### 2.3 Deploy

1. Click "Deploy"
2. Wait 2-3 minutes for build to complete
3. Your app is now live at `https://your-project.vercel.app`

---

## Step 3: Update Local Development (Optional)

To connect your local development to the cloud Supabase, create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## Step 4: Set Up CI/CD (Optional)

Vercel automatically deploys on every push to main.

### Manual Production Deploy

```bash
# Just push to main branch
git push origin main
```

### Preview Deployments

Vercel automatically creates preview deployments for:
- **GitHub**: Pull Requests (PRs)
- **GitLab**: Merge Requests (MRs)

These preview URLs allow you to review changes before merging.

---

## Step 5: Custom Domain (Optional)

1. Go to **Settings → Domains** in Vercel
2. Add your domain
3. Update DNS records as instructed
4. SSL is automatic

---

## Costs

| Service | Free Tier Limits | Your Usage (Est.) |
|---------|-----------------|-------------------|
| **Vercel** | 100GB bandwidth/month | < 1GB |
| **Vercel** | 5000 builds/month | ~30 |
| **Supabase** | 500MB database | ~50MB |
| **Supabase** | 50K auth users | 5 |
| **Supabase** | 1GB storage | < 100MB |

**Total Cost**: $0/month

---

## Troubleshooting

### Build Fails
- Check environment variables are set in Vercel
- Ensure Node.js version is 18 or higher

### Database Connection Errors
- Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
- Check Supabase project is active (not paused)

### Auth Issues
- Make sure `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set
- Check RLS policies in Supabase dashboard

---

## Next Steps

1. Test the deployment thoroughly
2. Set up regular database backups (Supabase has built-in point-in-time recovery on Pro, manual on Free)
3. Consider setting up monitoring/logs in Vercel dashboard
