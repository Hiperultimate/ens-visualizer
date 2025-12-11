// Check if database tables exist
require('dotenv').config({ path: require('node:path').join(__dirname, '..', '.env') })
const { Pool } = require('pg')

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  console.error('❌ DATABASE_URL not found in .env file')
  process.exit(1)
}

const pool = new Pool({
  connectionString,
  ssl: connectionString.includes('supabase.co') ? { rejectUnauthorized: false } : undefined,
})

async function checkTables() {
  try {
    console.log('🔍 Checking if tables exist...\n')

    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'nodes', 'connections')
      ORDER BY table_name
    `)

    const existingTables = result.rows.map((r) => r.table_name)
    const expectedTables = ['users', 'nodes', 'connections']
    const missingTables = expectedTables.filter((t) => !existingTables.includes(t))

    console.log(
      '📊 Existing tables:',
      existingTables.length > 0 ? existingTables.join(', ') : 'None',
    )

    if (missingTables.length > 0) {
      console.log('\n❌ Missing tables:', missingTables.join(', '))
      console.log('\n💡 You need to run the migration:')
      console.log('   node scripts/migrate.js')
      process.exit(1)
    } else {
      console.log('\n✅ All required tables exist!')
      process.exit(0)
    }
  } catch (error) {
    console.error('❌ Error checking tables:', error.message)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

checkTables()
