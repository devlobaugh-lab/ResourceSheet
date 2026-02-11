const { Client } = require('pg')

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

    const userRes = await client.query('select id from profiles limit 1')
    if (!userRes.rows.length) {
      console.error('No profiles found; cannot create track guide')
      return
    }
    const userId = userRes.rows[0].id

    const trackRes = await client.query('select id from tracks limit 1')
    if (!trackRes.rows.length) {
      console.error('No tracks found; cannot create track guide')
      return
    }
    const trackId = trackRes.rows[0].id

    const boostRes = await client.query('select id from boosts limit 1')
    if (!boostRes.rows.length) {
      console.error('No boosts found; cannot set suggested_boosts')
      return
    }
    const boostId = boostRes.rows[0].id

    // Try to find an existing guide for this user
    const guideRes = await client.query('select id, suggested_boosts from user_track_guides where user_id = $1 limit 1', [userId])
    if (guideRes.rows.length) {
      const guide = guideRes.rows[0]
      console.log('Found existing guide:', guide.id, 'current suggested_boosts:', guide.suggested_boosts)
      const newBoosts = [boostId]
      await client.query('update user_track_guides set suggested_boosts = $1 where id = $2', [JSON.stringify(newBoosts), guide.id])
      const verify = await client.query('select id, suggested_boosts from user_track_guides where id = $1', [guide.id])
      console.log('Updated guide:', verify.rows[0])
    } else {
      console.log('No existing guide for user; inserting new guide')
      const insertRes = await client.query(
        `insert into user_track_guides (user_id, track_id, gp_level, suggested_boosts) values ($1, $2, $3, $4) returning id, suggested_boosts`,
        [userId, trackId, 0, JSON.stringify([boostId])]
      )
      console.log('Inserted guide:', insertRes.rows[0])
    }
  } catch (err) {
    console.error('DB operation failed:', err.message)
  } finally {
    await client.end()
  }
}

run()
