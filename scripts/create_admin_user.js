#!/usr/bin/env node

require('dotenv').config({ path: './.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createAdminUser() {
  try {
    console.log('Setting up admin user: thomas.lobaugh@gmail.com')

    // First, try to find the existing user
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1000
    })

    if (listError) {
      console.error('Error listing users:', listError)
      return
    }

    const adminUser = existingUsers.users.find(user => user.email === 'thomas.lobaugh@gmail.com')

    if (!adminUser) {
      console.log('Creating new admin user...')

      // Create the user in auth.users
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: 'thomas.lobaugh@gmail.com',
        password: 'password123', // Simple password for testing
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          full_name: 'Test Admin User'
        }
      })

      if (authError) {
        console.error('Error creating auth user:', authError)
        return
      }

      console.log('Auth user created:', authData.user.id)

      // Create/update the profile record
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: authData.user.id,
          email: 'thomas.lobaugh@gmail.com',
          username: 'test_admin',
          is_admin: true
        }, {
          onConflict: 'id'
        })

      if (profileError) {
        console.error('Error creating profile:', profileError)
        return
      }

      console.log('Profile created/updated successfully')
    } else {
      console.log('Admin user already exists:', adminUser.id)

      // Update the profile record to ensure is_admin is true
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: adminUser.id,
          email: 'thomas.lobaugh@gmail.com',
          username: 'test_admin',
          is_admin: true
        }, {
          onConflict: 'id'
        })

      if (profileError) {
        console.error('Error updating profile:', profileError)
        return
      }

      console.log('Profile updated successfully')
    }

    console.log('Admin user setup complete!')
    console.log('Login credentials:')
    console.log('Email: thomas.lobaugh@gmail.com')
    console.log('Password: password123')

  } catch (error) {
    console.error('Unexpected error:', error)
    process.exit(1)
  }
}

createAdminUser()
