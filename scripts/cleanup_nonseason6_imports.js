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

    const res = await client.query("select id, name from seasons where is_active = true limit 1")
    if (!res.rows || res.rows.length === 0) {
      console.error('No active season found; aborting cleanup')
      process.exitCode = 1
      return
    }
    const activeSeasonId = res.rows[0].id
    console.log('Active season id:', activeSeasonId)

    const before = await client.query('select count(*) as cnt from drivers')
    console.log('Total drivers before cleanup:', before.rows[0].cnt)

    const toDelete = await client.query('select count(*) as cnt from drivers where season_id is null or season_id <> $1', [activeSeasonId])
    console.log('Drivers to delete (not in active season):', toDelete.rows[0].cnt)

    if (parseInt(toDelete.rows[0].cnt, 10) === 0) {
      console.log('Nothing to delete.')
      return
    }

    const del = await client.query('delete from drivers where season_id is null or season_id <> $1', [activeSeasonId])
    console.log('Deleted drivers count:', del.rowCount)

    const after = await client.query('select count(*) as cnt from drivers')
    console.log('Total drivers after cleanup:', after.rows[0].cnt)
  } catch (err) {
    console.error('Cleanup failed:', err)
    process.exitCode = 1
  } finally {
    await client.end()
  }
}

run()
