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

    const collRes = await client.query("select * from collections order by id")
    console.log('Collections (full rows):')
    console.table(collRes.rows)

    const seasonsRes = await client.query("select season_id, count(*) as cnt from drivers group by season_id order by season_id")
    console.log('Driver counts by season:')
    console.table(seasonsRes.rows)
    const seasonsTable = await client.query("select * from seasons order by id")
    console.log('Seasons table:')
    console.table(seasonsTable.rows)

    const season6Row = await client.query("select id from seasons where is_active = true limit 1")
    const season6Id = season6Row.rows[0] && season6Row.rows[0].id
    console.log('Detected season 6 id:', season6Id)

    if (season6Id) {
      const season6Count = await client.query("select count(*) as cnt from drivers where season_id = $1", [season6Id])
      console.log('Drivers in season 6:')
      console.table(season6Count.rows)
      const season6Drivers = await client.query("select id, name, rarity, collection_id from drivers where season_id = $1 order by name limit 100", [season6Id])
      console.log('Sample drivers in season 6:')
      console.table(season6Drivers.rows)
    } else {
      console.log('No explicit season 6 found in seasons table')
    }

    const nullSeason = await client.query("select id, name, rarity, collection_id from drivers where season_id is null order by name limit 50")
    console.log('Sample drivers with NULL season_id:')
    console.table(nullSeason.rows)

    const drvRes = await client.query("select id, name, rarity, season_id, collection_id from drivers where rarity = 5 order by collection_id nulls first limit 200")
    console.log('Sample rarity-5 drivers:')
    console.table(drvRes.rows)
  } catch (err) {
    console.error('DB query failed:', err.message)
    process.exitCode = 1
  } finally {
    await client.end()
  }
}

run()
