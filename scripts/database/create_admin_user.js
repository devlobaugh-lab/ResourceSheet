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

const adminEmail = process.env.ADMIN_EMAIL
const adminPassword = process.env.ADMIN_PASSWORD
const adminUsername = process.env.ADMIN_USERNAME || 'admin'

if (!adminEmail || !adminPassword) {
  console.error('Missing ADMIN_EMAIL or ADMIN_PASSWORD environment variables')
  process.exit(1)
}

async function createAdminUser() {
  try {
    console.log(`Setting up admin user: ${adminEmail}`)

    // First, try to find the existing user
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1000
    })

    if (listError) {
      console.error('Error listing users:', listError)
      return
    }

    const adminUser = existingUsers.users.find(user => user.email === adminEmail)

    if (!adminUser) {
      console.log('Creating new admin user...')

      // Create the user in auth.users
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
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
          email: adminEmail,
          username: adminUsername,
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

      // Update password for existing user
      const { error: passwordError } = await supabase.auth.admin.updateUserById(
        adminUser.id,
        { password: adminPassword, email_confirm: true }
      )

      if (passwordError) {
        console.error('Error updating password:', passwordError && passwordError.message ? passwordError.message : 'An error occurred while updating the password')
        return
      }

      console.log('Password updated successfully')

      // Update the profile record to ensure is_admin is true
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: adminUser.id,
          email: adminEmail,
          username: adminUsername,
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
    console.log(`Email: ${adminEmail}`)
    console.log('Password: (from ADMIN_PASSWORD env var)')

  } catch (error) {
    console.error('Unexpected error:', error)
    process.exit(1)
  }
}

createAdminUser()
