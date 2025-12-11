// Test database connection and validate connection string
require('dotenv').config({ path: require('node:path').join(__dirname, '..', '.env') })
const { Pool } = require('pg')

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  console.error('❌ DATABASE_URL not found in .env file')
  process.exit(1)
}

console.log('🔍 Analyzing connection string...')
console.log('Format:', `${connectionString.substring(0, 30)}...`)

// Parse the connection string
try {
  const url = new URL(connectionString)
  console.log('✅ Connection string format is valid')
  console.log('   Protocol:', url.protocol)
  console.log('   Username:', url.username)
  console.log('   Hostname:', url.hostname)
  console.log('   Port:', url.port || '5432 (default)')
  console.log('   Database:', url.pathname.substring(1))
} catch (error) {
  console.error('❌ Invalid connection string format:', error.message)
  console.log('\n💡 Expected format:')
  console.log('   postgresql://username:password@host:port/database')
  console.log('\n💡 For Supabase:')
  console.log('   postgresql://postgres:[YOUR-PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres')
  console.log(
    '\n⚠️  Note: If your password contains special characters, you need to URL-encode them:',
  )
  console.log('   @ → %40')
  console.log('   : → %3A')
  console.log('   / → %2F')
  console.log('   # → %23')
  console.log('   ? → %3F')
  process.exit(1)
}

// Test connection
console.log('\n📡 Testing database connection...')
const pool = new Pool({
  connectionString,
  ssl: connectionString.includes('supabase.co') ? { rejectUnauthorized: false } : undefined,
  connectionTimeoutMillis: 5000,
})

pool
  .query('SELECT NOW() as current_time, version() as version')
  .then((result) => {
    console.log('✅ Connection successful!')
    console.log('   Current time:', result.rows[0].current_time)
    console.log(
      '   PostgreSQL version:',
      `${result.rows[0].version.split(' ')[0]} ${result.rows[0].version.split(' ')[1]}`,
    )
    return pool.end()
  })
  .then(() => {
    console.log('\n✨ Database connection is working!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Connection failed:', error.message)
    if (error.message.includes('ENOTFOUND')) {
      console.log('\n💡 DNS resolution failed. Possible issues:')
      console.log('   1. Check your internet connection')
      console.log('   2. Verify the hostname is correct')
      console.log('   3. For Supabase: Check if the project is active')
    } else if (error.message.includes('password authentication')) {
      console.log('\n💡 Authentication failed. Check:')
      console.log('   1. Password is correct')
      console.log('   2. Special characters in password are URL-encoded')
    } else if (error.message.includes('timeout')) {
      console.log('\n💡 Connection timeout. Check:')
      console.log('   1. Firewall settings')
      console.log('   2. Network connectivity')
    }
    process.exit(1)
  })
