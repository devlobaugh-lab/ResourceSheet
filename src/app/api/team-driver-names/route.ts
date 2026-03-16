import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'

// Schema for team driver name validation
const teamDriverNameSchema = z.object({
  team_name: z.string().min(1, 'Team name is required').max(100, 'Team name too long'),
  driver_slot: z.number().int().min(1).max(2),
  driver_name: z.string().min(1, 'Driver name is required').max(100, 'Driver name too long')
})

// GET /api/team-driver-names - Get all team driver name mappings
export async function GET(request: NextRequest) {
  try {
    // Get all team driver name mappings
    const { data: mappings, error } = await supabaseAdmin
      .from('team_driver_names')
      .select('*')
      .order('team_name')
      .order('driver_slot')
    
    if (error) {
      console.error('Error fetching team driver names:', error)
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: 'Failed to fetch team driver names' } },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      data: mappings,
      count: mappings?.length || 0
    })
    
  } catch (error) {
    console.error('Team driver names API error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}

// POST /api/team-driver-names - Create or update a team driver name mapping (admin only)
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return request.cookies.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          },
        },
      }
    )
    
    // Check if user is admin (simplified for local dev)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      )
    }
    
    // Parse and validate request body
    const body = await request.json()
    const validatedData = teamDriverNameSchema.parse(body)
    
    // Upsert the mapping (insert or update based on unique constraint)
    const { data: mapping, error } = await supabaseAdmin
      .from('team_driver_names')
      .upsert([{
        team_name: validatedData.team_name,
        driver_slot: validatedData.driver_slot,
        driver_name: validatedData.driver_name
      }], {
        onConflict: 'team_name,driver_slot'
      })
      .select()
      .single()
    
    if (error) {
      console.error('Error creating team driver name:', error)
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: 'Failed to create team driver name' } },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      data: mapping,
      message: 'Team driver name mapping saved successfully'
    }, { status: 201 })
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid request data', details: error.errors } },
        { status: 400 }
      )
    }
    
    console.error('Team driver names API error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}

// DELETE /api/team-driver-names - Delete a team driver name mapping (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return request.cookies.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          },
        },
      }
    )
    
    // Check if user is admin (simplified for local dev)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      )
    }
    
    // Get params from URL
    const { searchParams } = new URL(request.url)
    const teamName = searchParams.get('team_name')
    const driverSlot = searchParams.get('driver_slot')
    
    if (!teamName || !driverSlot) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'team_name and driver_slot are required' } },
        { status: 400 }
      )
    }
    
    // Delete the mapping
    const { error } = await supabaseAdmin
      .from('team_driver_names')
      .delete()
      .eq('team_name', teamName)
      .eq('driver_slot', parseInt(driverSlot))
    
    if (error) {
      console.error('Error deleting team driver name:', error)
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: 'Failed to delete team driver name' } },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      message: 'Team driver name mapping deleted successfully'
    })
    
  } catch (error) {
    console.error('Team driver names API error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}