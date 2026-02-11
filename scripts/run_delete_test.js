const { Client } = require('pg')
const fetch = global.fetch || require('node-fetch')

function base64url(str) {
  return Buffer.from(str).toString('base64').replace(/=+$/,'').replace(/\+/g,'-').replace(/\//g,'_')
}

;(async () => {
  const client = new Client({
    host: process.env.PGHOST || 'localhost',
    port: parseInt(process.env.PGPORT || '54322', 10),
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || 'postgres',
    database: process.env.PGDATABASE || 'postgres',
  })

  await client.connect()

  const adminRes = await client.query("select id from profiles where is_admin=true limit 1")
  const trackRes = await client.query("select id from tracks limit 1")

  if (!adminRes.rows[0]) {
    console.error('No admin profile found')
    await client.end()
    process.exit(1)
  }
  if (!trackRes.rows[0]) {
    console.error('No track found')
    await client.end()
    process.exit(1)
  }

  const adminId = adminRes.rows[0].id
  const trackId = trackRes.rows[0].id

  const header = base64url(JSON.stringify({ alg: 'none', typ: 'JWT' }))
  const payload = base64url(JSON.stringify({ sub: adminId, email: 'dev@local', exp: Math.floor(Date.now() / 1000) + 3600 }))
  const token = `${header}.${payload}.`

  console.log('Using ADMIN_ID=', adminId)
  console.log('Using TRACK_ID=', trackId)
  console.log('Calling DELETE with cascade...')

  try {
    const res = await fetch(`http://localhost:3001/api/tracks/${trackId}?cascade=true`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    console.log('Status:', res.status)
    const text = await res.text()
    console.log('Body:', text)
  } catch (err) {
    console.error('Request failed:', err)
  }

  await client.end()
})()
