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

    // Add ordinal column if it doesn't exist
    await client.query(`ALTER TABLE public.collections ADD COLUMN IF NOT EXISTS ordinal INTEGER;`)
    console.log('Ensured collections.ordinal column exists')

    // Map known themes to ordinals (adjust as needed)
    const mapping = [
      { theme: 'PodiumStars', ord: 1 },
      { theme: 'PodiumStarsLegends', ord: 2 },
      { theme: 'HotProspects', ord: 3 },
    ]

    for (const m of mapping) {
      const res = await client.query('UPDATE public.collections SET ordinal = $1 WHERE theme = $2', [m.ord, m.theme])
      console.log(`Updated theme=${m.theme} -> ordinal=${m.ord} (rows: ${res.rowCount})`)
    }

    // For any remaining collections without ordinal, set to 999 (end)
    const res = await client.query('UPDATE public.collections SET ordinal = 999 WHERE ordinal IS NULL')
    console.log(`Set ordinal=999 for remaining collections (rows: ${res.rowCount})`)

    // Show current collections
    const coll = await client.query('SELECT id, theme, name, ordinal FROM public.collections ORDER BY ordinal NULLS LAST, theme')
    console.table(coll.rows)

  } catch (err) {
    console.error('DB operation failed:', err)
    process.exitCode = 1
  } finally {
    await client.end()
  }
}

run()
