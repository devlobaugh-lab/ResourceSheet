const { Client } = require('pg')
const { execSync } = require('child_process')
const path = require('path')

async function run() {
  const client = new Client({
    host: process.env.PGHOST || 'localhost',
    port: parseInt(process.env.PGPORT || '54322', 10),
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || 'postgres',
    database: process.env.PGDATABASE || 'postgres',
  })

  try {
    await client.connect()
    console.log('Connected to Postgres')

    // WARNING: This will delete boost rows and boost custom names
    console.log('Clearing references to boosts from user tables, then deleting boosts')
    await client.query('BEGIN')
    // Null out direct FK columns in user_track_guides
    await client.query("UPDATE user_track_guides SET free_boost_id = NULL, driver_1_boost_id = NULL, driver_2_boost_id = NULL, suggested_boosts = '[]'::json, alt_boost_ids = '[]'::json")
    // Null out recommended boost references in guide drivers
    await client.query('UPDATE user_track_guide_drivers SET recommended_boost_id = NULL')
    // Remove user_boosts which reference boosts
    await client.query('DELETE FROM user_boosts')
    // Remove boost custom names
    await client.query('DELETE FROM boost_custom_names')
    // Finally delete boosts
    await client.query('DELETE FROM boosts')
    await client.query('COMMIT')
    console.log('Cleared references and deleted boosts and custom names')

    // Upload content cache via local admin endpoint
    const filePath = path.resolve(__dirname, '..', 'external_data', 'content_cache.json')
    console.log('Uploading content cache file:', filePath)

    const curlCmd = `curl -i -X POST -H "Authorization: Bearer a.b.c" -F "file=@${filePath}" -F "allow_modifications=true" http://localhost:3001/api/admin/content-cache/upload`
    console.log('Running:', curlCmd)

    const output = execSync(curlCmd, { stdio: 'pipe' }).toString()
    console.log('Upload response:\n', output)

    // Quick check: count boosts
    const res = await client.query('SELECT count(*) as cnt FROM boosts')
    console.log('Boosts count after import:', res.rows[0].cnt)
  } catch (err) {
    console.error('Operation failed:', err.message)
    try { await client.query('ROLLBACK') } catch (e) {}
  } finally {
    await client.end()
  }
}

run()
