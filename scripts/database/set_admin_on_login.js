// Script to set admin status for the first user that logs in
// This can be run after a user logs in to grant them admin access

const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 54322,
  database: 'postgres',
  user: 'postgres',
  password: 'postgres'
});

async function setAdminForFirstUser() {
  try {
    await client.connect();
    
    // Check if any profiles exist
    const profilesResult = await client.query('SELECT id, email, is_admin FROM profiles ORDER BY created_at ASC LIMIT 1');
    
    if (profilesResult.rows.length > 0) {
      const profile = profilesResult.rows[0];
      await client.query('UPDATE profiles SET is_admin = true WHERE id = $1', [profile.id]);
      console.log(`Admin access granted to: ${profile.email}`);
    } else {
      console.log('No user profiles found. Please log in first to create a profile.');
    }
  } catch (error) {
    console.error('Error setting admin access:', error.message);
  } finally {
    await client.end();
  }
}

setAdminForFirstUser();