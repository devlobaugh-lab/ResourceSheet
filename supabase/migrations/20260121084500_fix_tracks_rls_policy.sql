-- Fix infinite recursion in tracks table RLS policy
-- Migration: 20260121084500_fix_tracks_rls_policy

-- Remove the problematic admin policy that causes recursion
DROP POLICY IF EXISTS "Admins can manage tracks" ON public.tracks;

-- Keep only public read access - admin checks will be handled in API layer
-- This matches the pattern used by other admin-managed tables like boosts
