import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase-admin'

// Schema for track name alias validation
const trackNameAliasSchema = z.object({
  system_name: z.string().min(1, 'System name is required'),
  display_name: z.string().min(1, 'Display name is required')
})

// Helper to get user from request
async function getUser(request: NextRequest) {
  let user = null
  const authHeader = request.headers.get('authorization')

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7)
    try {
      const parts = token.split('.')
      if (parts.length === 3) {
        const payload = JSON.parse(
          Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString()
        )
        if (payload.exp && payload.exp > Math.floor(Date.now() / 1000)) {
          user = { id: payload.sub, email: payload.email }
        }
      }
    } catch (error) {
      console.warn('JWT validation failed:', error)
    }
  }

  if (!user) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return request.cookies.getAll() },
          setAll() {},
        },
      }
    )
    const { data: { user: cookieUser } } = await supabase.auth.getUser()
    if (cookieUser) user = cookieUser
  }

  return user
}

// Helper to check if user is admin
async function isAdmin(userId: string): Promise<boolean> {
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('is_admin')
    .eq('id', userId)
    .single()
  
  return profile?.is_admin === true
}

// GET /api/track-name-aliases - List all aliases
export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabaseAdmin
      .from('track_name_aliases')
      .select('*')
      .order('system_name')
    
    if (error) {
      console.error('Error fetching track name aliases:', error)
      // Check if table doesn't exist
      if (error.code === '42P01') {
        return NextResponse.json({ 
          data: [], 
          message: 'Track name aliases table not found. Please run the migration.',
          migration_needed: true 
        })
      }
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: error.message || 'Failed to fetch track name aliases' } },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ data: data || [] })
  } catch (error: any) {
    console.error('Track name aliases API error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: error?.message || 'Internal server error' } },
      { status: 500 }
    )
  }
}

// POST /api/track-name-aliases - Create a new alias (admin only)
export async function POST(request: NextRequest) {
  try {
    const user = await getUser(request)
    if (!user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      )
    }

    // For now, allow any authenticated user to manage track name aliases
    // TODO: Uncomment the admin check below for production
    // const admin = await isAdmin(user.id)
    // if (!admin) {
    //   return NextResponse.json(
    //     { error: { code: 'FORBIDDEN', message: 'Admin access required' } },
    //     { status: 403 }
    //   )
    // }

    const body = await request.json()
    const validatedData = trackNameAliasSchema.parse(body)

    const { data, error } = await supabaseAdmin
      .from('track_name_aliases')
      .insert([validatedData])
      .select()
      .single()

    if (error) {
      console.error('Error creating track name alias:', error)
      if (error.code === '23505') {
        return NextResponse.json(
          { error: { code: 'DUPLICATE', message: 'An alias for this track already exists' } },
          { status: 409 }
        )
      }
      console.error('Error creating track name alias:', error)
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: 'Failed to create track name alias' } },
        { status: 500 }
      )
    }

    return NextResponse.json({ data, message: 'Track name alias created successfully' }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid request data', details: error.errors } },
        { status: 400 }
      )
    }
    console.error('Track name aliases API error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}

// PUT /api/track-name-aliases - Update an alias (admin only)
export async function PUT(request: NextRequest) {
  try {
    const user = await getUser(request)
    if (!user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      )
    }

    // For now, allow any authenticated user to manage track name aliases
    // TODO: Uncomment the admin check below for production
    // const admin = await isAdmin(user.id)
    // if (!admin) {
    //   return NextResponse.json(
    //     { error: { code: 'FORBIDDEN', message: 'Admin access required' } },
    //     { status: 403 }
    //   )
    // }

    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'ID is required' } },
        { status: 400 }
      )
    }

    const validatedData = trackNameAliasSchema.partial().parse(updateData)

    const { data, error } = await supabaseAdmin
      .from('track_name_aliases')
      .update(validatedData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating track name alias:', error)
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: 'Failed to update track name alias' } },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Track name alias not found' } },
        { status: 404 }
      )
    }

    return NextResponse.json({ data, message: 'Track name alias updated successfully' })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid request data', details: error.errors } },
        { status: 400 }
      )
    }
    console.error('Track name aliases API error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}

// DELETE /api/track-name-aliases - Delete an alias (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const user = await getUser(request)
    if (!user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      )
    }

    // For now, allow any authenticated user to manage track name aliases
    // TODO: Uncomment the admin check below for production
    // const admin = await isAdmin(user.id)
    // if (!admin) {
    //   return NextResponse.json(
    //     { error: { code: 'FORBIDDEN', message: 'Admin access required' } },
    //     { status: 403 }
    //   )
    // }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'ID is required' } },
        { status: 400 }
      )
    }

    const { error } = await supabaseAdmin
      .from('track_name_aliases')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting track name alias:', error)
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: 'Failed to delete track name alias' } },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Track name alias deleted successfully' })
  } catch (error) {
    console.error('Track name aliases API error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}