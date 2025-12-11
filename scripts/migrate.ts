import { readFileSync } from 'fs'
import { join } from 'path'
import { query } from '../src/lib/db'

async function migrate() {
  try {
    console.log('🚀 Starting database migration...')
    
    // Read the schema file
    const schemaPath = join(process.cwd(), 'database', 'schema.sql')
    const schema = readFileSync(schemaPath, 'utf-8')
    
    // Split by semicolons and execute each statement
    const statements = schema
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith('--'))
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`)
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      if (statement.trim()) {
        try {
          await query(statement)
          console.log(`✅ Executed statement ${i + 1}/${statements.length}`)
        } catch (error) {
          // Some statements might fail if they already exist (like CREATE IF NOT EXISTS)
          // This is expected and safe to ignore
          if (error instanceof Error && error.message.includes('already exists')) {
            console.log(`⚠️  Statement ${i + 1} already exists (skipping)`)
          } else {
            throw error
          }
        }
      }
    }
    
    // Verify tables were created
    console.log('\n🔍 Verifying tables...')
    const tables = await query<{ table_name: string }>(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'nodes', 'connections')
      ORDER BY table_name
    `)
    
    const expectedTables = ['users', 'nodes', 'connections']
    const createdTables = tables.map((t) => t.table_name)
    
    console.log('📊 Created tables:', createdTables.join(', '))
    
    const missingTables = expectedTables.filter(
      (t) => !createdTables.includes(t)
    )
    
    if (missingTables.length > 0) {
      console.error('❌ Missing tables:', missingTables.join(', '))
      process.exit(1)
    }
    
    // Verify indexes
    console.log('\n🔍 Verifying indexes...')
    const indexes = await query<{ indexname: string }>(`
      SELECT indexname 
      FROM pg_indexes 
      WHERE schemaname = 'public' 
      AND tablename IN ('users', 'nodes', 'connections')
      ORDER BY indexname
    `)
    
    console.log(`📊 Found ${indexes.length} indexes`)
    
    // Test a simple query
    console.log('\n🧪 Testing database connection...')
    const testResult = await query('SELECT NOW() as current_time')
    console.log('✅ Database connection successful!')
    console.log(`   Current database time: ${testResult[0]?.current_time}`)
    
    console.log('\n✨ Migration completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('\n❌ Migration failed:', error)
    if (error instanceof Error) {
      console.error('Error details:', error.message)
    }
    process.exit(1)
  }
}

// Run migration
migrate()
