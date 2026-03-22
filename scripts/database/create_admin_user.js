#!/usr/bin/env node

require('dotenv').config({ path: './.env.local' })
const { Client } = require('pg')

const adminEmail = process.env.ADMIN_EMAIL
const adminPassword = process.env.ADMIN_PASSWORD
const adminUsername = process.env.ADMIN_USERNAME || 'admin'

if (!adminEmail || !adminPassword) {
  console.error('Missing ADMIN_EMAIL or ADMIN_PASSWORD environment variables')
  process.exit(1)
}

const DB_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@127.0.0.1:54322/postgres'

async function createAdminUser() {
  const client = new Client({ connectionString: DB_URL })
  await client.connect()

  try {
    console.log(`Setting up admin user: ${adminEmail}`)

    // Check if user already exists
    const { rows: existing } = await client.query(
      'SELECT id FROM auth.users WHERE email = $1',
      [adminEmail]
    )

    let userId

    if (existing.length === 0) {
      console.log('Creating new admin user...')

      const { rows } = await client.query(`
        INSERT INTO auth.users (
          instance_id, id, aud, role, email,
          encrypted_password, email_confirmed_at,
          confirmation_token, recovery_token, email_change_token_new, email_change,
          created_at, updated_at,
          raw_user_meta_data, is_super_admin, is_sso_user
        ) VALUES (
          '00000000-0000-0000-0000-000000000000',
          gen_random_uuid(),
          'authenticated', 'authenticated', $1,
          crypt($2, gen_salt('bf')),
          now(),
          '', '', '', '',
          now(), now(),
          '{"full_name": "Admin User"}'::jsonb,
          false, false
        )
        RETURNING id
      `, [adminEmail, adminPassword])

      userId = rows[0].id

      // Insert identity record required for email login
      await client.query(`
        INSERT INTO auth.identities (
          id, user_id, provider_id, provider,
          identity_data, created_at, updated_at, last_sign_in_at
        ) VALUES (
          gen_random_uuid(), $1::uuid, $2, 'email',
          jsonb_build_object('sub', $1::text, 'email', $2::text),
          now(), now(), now()
        )
      `, [userId, adminEmail])

      console.log('Auth user created:', userId)
    } else {
      userId = existing[0].id
      console.log('Admin user already exists:', userId)

      await client.query(
        "UPDATE auth.users SET encrypted_password = crypt($1, gen_salt('bf')), email_confirmed_at = now(), updated_at = now() WHERE id = $2",
        [adminPassword, userId]
      )
      console.log('Password updated successfully')
    }

    // Upsert profile
    await client.query(`
      INSERT INTO public.profiles (id, email, username, is_admin)
      VALUES ($1, $2, $3, true)
      ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        username = EXCLUDED.username,
        is_admin = true
    `, [userId, adminEmail, adminUsername])

    console.log('Profile created/updated successfully')
    console.log('Admin user setup complete!')
    console.log(`Email: ${adminEmail}`)
    console.log('Password: (from ADMIN_PASSWORD env var)')

  } catch (error) {
    console.error('Unexpected error:', error)
    process.exit(1)
  } finally {
    await client.end()
  }
}

createAdminUser()
