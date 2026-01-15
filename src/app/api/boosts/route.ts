import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin, createServerSupabaseClient } from '@/lib/supabase'
import { createBoostSchema } from '@/lib/validation'

// GET /api/boosts - List boosts with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Build query with custom names
    let query = supabaseAdmin
      .from('boosts')
      .select(`
        *,
        boost_custom_names!left(custom_name)
      `, { count: 'exact' })
      .order('name', { ascending: true })
    
    // Apply filters
    const seasonId = searchParams.get('season_id')
    const rarity = searchParams.get('rarity')
    const series = searchParams.get('series')
    const search = searchParams.get('search')
    
    if (seasonId) {
      query = query.eq('season_id', seasonId)
    }
    
    if (rarity) {
      query = query.eq('rarity', parseInt(rarity))
    }
    
    if (series) {
      query = query.eq('series', parseInt(series))
    }
    
    if (search) {
      query = query.ilike('name', `%${search}%`)
    }
    
    const { data, error, count } = await query
    
    if (error) {
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: error.message } },
        { status: 500 }
      )
    }
    
    // Apply pagination
    const page = Number(searchParams.get('page')) || 1
    const limit = Number(searchParams.get('limit')) || 20
    const start = (page - 1) * limit
    const end = start + limit - 1
    
    const paginatedData = (data || []).slice(start, end)
    
    return NextResponse.json({
      data: paginatedData,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
    
  } catch (error) {
    console.error('Boosts GET error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}

// POST /api/boosts - Create new boost (admin only)
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const supabase = createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      )
    }
    
    // Check admin status
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()
    
    if (!profile?.is_admin) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Admin access required' } },
        { status: 403 }
      )
    }
    
    const body = await request.json()
    const validatedData = createBoostSchema.parse(body)
    
    const { data, error } = await supabaseAdmin
      .from('boosts')
      .insert(validatedData)
      .select()
      .single()
    
    if (error) {
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: error.message } },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ data }, { status: 201 })
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid request data', details: error.errors } },
        { status: 400 }
      )
    }
    
    console.error('Boosts POST error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
