#!/usr/bin/env node
/**
 * Database Connection Test Script
 * Tests database connection using DATABASE_URL from .env file
 * Validates connection string, tests connection, and checks for required tables
 */

const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')

// Load .env file manually
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env')
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf-8')
    envFile.split('\n').forEach((line) => {
      const trimmedLine = line.trim()
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=')
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').replace(/^["']|["']$/g, '')
          process.env[key.trim()] = value.trim()
        }
      }
    })
  }
}

// Load environment variables
loadEnv()

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  console.error('❌ DATABASE_URL not found in .env file')
  console.error('   Please add DATABASE_URL to your .env file')
  console.error('\n💡 Expected format:')
  console.error('   postgresql://username:password@host:port/database')
  console.error('\n💡 For Supabase:')
  console.error('   postgresql://postgres:[YOUR-PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres')
  process.exit(1)
}

// Mask sensitive parts of connection string for display
const maskedUrl = connectionString.replace(
  /:\/\/[^:]+:[^@]+@/,
  '://***:***@'
)

console.log('🔍 Testing database connection...\n')
console.log('📡 Connection String:', maskedUrl)

// Parse and validate connection string format
console.log('\n🔍 Analyzing connection string...')
try {
  const url = new URL(connectionString)
  console.log('✅ Connection string format is valid')
  console.log('   Protocol:', url.protocol.replace(':', ''))
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
  console.log('\n⚠️  Note: If your password contains special characters, you need to URL-encode them:')
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
  ssl: connectionString.includes('supabase.co')
    ? { rejectUnauthorized: false }
    : undefined,
  connectionTimeoutMillis: 5000,
})

pool
  .query('SELECT NOW() as current_time, version() as pg_version')
  .then((result) => {
    console.log('✅ Connection successful!')
    console.log('   Current database time:', result.rows[0].current_time)
    const pgVersion = result.rows[0].pg_version.split(' ').slice(0, 2).join(' ')
    console.log('   PostgreSQL version:', pgVersion)

    // Check if required tables exist
    console.log('\n🔍 Checking for required tables...')
    return pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'nodes', 'connections')
      ORDER BY table_name
    `)
  })
  .then((tablesResult) => {
    const existingTables = tablesResult.rows.map((row) => row.table_name)
    const requiredTables = ['users', 'nodes', 'connections']
    const missingTables = requiredTables.filter(
      (table) => !existingTables.includes(table)
    )

    if (existingTables.length > 0) {
      console.log(`✅ Found ${existingTables.length} required table(s):`)
      existingTables.forEach((table) => console.log(`   - ${table}`))
    }

    if (missingTables.length > 0) {
      console.log(`\n⚠️  Missing ${missingTables.length} table(s):`)
      missingTables.forEach((table) => console.log(`   - ${table}`))
      console.log('\n💡 Run the migration script to create missing tables:')
      console.log('   pnpm run migrate')
      console.log('   or')
      console.log('   node scripts/migrate.js')
    } else {
      console.log('\n✅ All required tables exist!')
    }

    // Test a simple query on users table if it exists
    if (existingTables.includes('users')) {
      console.log('\n🔄 Testing query on users table...')
      return pool.query('SELECT COUNT(*) as count FROM users').then((userCount) => {
        console.log(
          `✅ Query successful! Found ${userCount.rows[0].count} user(s) in database`
        )
      })
    }
  })
  .then(() => {
    return pool.end()
  })
  .then(() => {
    console.log('\n' + '='.repeat(60))
    console.log('✨ Database connection test completed successfully!')
    console.log('='.repeat(60))
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Connection failed!')
    console.error('\nError details:')
    console.error(`   Message: ${error.message}`)

    if (error.code) {
      console.error(`   Error code: ${error.code}`)
    }

    // Provide helpful error messages based on common issues
    if (error.message.includes('ENOTFOUND') || error.code === 'ENOTFOUND') {
      console.error('\n💡 DNS resolution failed. Possible issues:')
      console.error('   1. Check your internet connection')
      console.error('   2. Verify the hostname is correct')
      console.error('   3. For Supabase: Check if the project is active')
      console.error('   4. Firewall might be blocking the connection')
    } else if (
      error.message.includes('password authentication') ||
      error.code === '28P01'
    ) {
      console.error('\n💡 Authentication failed. Check:')
      console.error('   1. Password is correct')
      console.error('   2. Username is correct (should be "postgres" for Supabase)')
      console.error('   3. Special characters in password are URL-encoded')
    } else if (
      error.message.includes('timeout') ||
      error.code === 'ETIMEDOUT'
    ) {
      console.error('\n💡 Connection timeout. Check:')
      console.error('   1. Database server is running')
      console.error('   2. Firewall settings')
      console.error('   3. Network connectivity')
    } else if (
      error.message.includes('does not exist') ||
      error.code === '3D000'
    ) {
      console.error('\n💡 Database does not exist. Check:')
      console.error('   1. Database name is correct (usually "postgres")')
      console.error('   2. Database has been created')
    } else if (error.message.includes('SSL') || error.code === '08006') {
      console.error('\n💡 SSL connection issue. Check:')
      console.error('   1. SSL connection is required but not properly configured')
      console.error('   2. For Supabase, SSL is automatically handled')
    }

    console.error('\n📝 Check your DATABASE_URL format:')
    console.error('   postgresql://user:password@host:port/database')
    console.error(
      '   For Supabase: postgresql://postgres:[PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres'
    )

    pool.end().catch(() => {})
    process.exit(1)
  })
