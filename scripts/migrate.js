// Simple migration script using Node.js
const { Pool } = require('pg')
const fs = require('node:fs')
const path = require('node:path')

async function migrate() {
  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    console.error('❌ DATABASE_URL environment variable is not set')
    console.error('   Please add DATABASE_URL to your .env file')
    process.exit(1)
  }

  const pool = new Pool({
    connectionString,
    ssl: connectionString.includes('supabase.co') ? { rejectUnauthorized: false } : undefined,
  })

  try {
    console.log('🚀 Starting database migration...')
    console.log('📡 Connecting to database...')

    // Test connection
    await pool.query('SELECT NOW()')
    console.log('✅ Database connection successful!')

    // Read the schema file
    const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql')
    const schema = fs.readFileSync(schemaPath, 'utf-8')

    // Execute the entire schema as one transaction
    // This ensures all statements run in the correct order
    console.log('📝 Executing database schema...\n')

    try {
      await pool.query(schema)
      console.log('✅ Schema executed successfully')
    } catch (error) {
      // If it's an "already exists" error, that's okay for CREATE IF NOT EXISTS
      if (error.message?.includes('already exists')) {
        console.log('⚠️  Some objects already exist (this is okay)')
      } else {
        throw error
      }
    }

    // Verify tables were created
    console.log('\n🔍 Verifying tables...')
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'nodes', 'connections')
      ORDER BY table_name
    `)

    const expectedTables = ['users', 'nodes', 'connections']
    const createdTables = tablesResult.rows.map((t) => t.table_name)

    console.log('📊 Created tables:', createdTables.join(', '))

    const missingTables = expectedTables.filter((t) => !createdTables.includes(t))

    if (missingTables.length > 0) {
      console.error('❌ Missing tables:', missingTables.join(', '))
      process.exit(1)
    }

    // Verify indexes
    console.log('\n🔍 Verifying indexes...')
    const indexesResult = await pool.query(`
      SELECT indexname 
      FROM pg_indexes 
      WHERE schemaname = 'public' 
      AND tablename IN ('users', 'nodes', 'connections')
      ORDER BY indexname
    `)

    console.log(`📊 Found ${indexesResult.rows.length} indexes`)

    // Test insert/select
    console.log('\n🧪 Testing database operations...')
    const testUser = await pool.query('INSERT INTO users DEFAULT VALUES RETURNING id, created_at')
    console.log('✅ Test user created:', testUser.rows[0].id)

    await pool.query('DELETE FROM users WHERE id = $1', [testUser.rows[0].id])
    console.log('✅ Test user deleted')

    console.log('\n✨ Migration completed successfully!')
    console.log('🎉 Database is ready to use!')
    process.exit(0)
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message)

    if (error.message?.includes('ENOTFOUND')) {
      console.error('\n💡 DNS resolution failed. This usually means:')
      console.error('   1. Your Supabase project might be paused')
      console.error('   2. Check your internet connection')
      console.error('   3. Verify the hostname in your connection string')
      console.error('\n   To fix: Go to Supabase dashboard and ensure your project is active')
    } else if (error.message?.includes('password authentication')) {
      console.error('\n💡 Authentication failed. Check your password in DATABASE_URL')
    } else if (error.stack) {
      console.error('\nStack trace:', error.stack)
    }
    process.exit(1)
  } finally {
    await pool.end()
  }
}

// Load environment variables from .env file
if (require('node:fs').existsSync(path.join(__dirname, '..', '.env'))) {
  require('dotenv').config({ path: path.join(__dirname, '..', '.env') })
}

// Run migration
migrate()
