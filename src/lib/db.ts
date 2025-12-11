import { Pool } from 'pg'

// Database connection pool
// Reads connection string from DATABASE_URL environment variable
// Expected format: postgresql://user:password@host:port/database
// For Supabase: postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres

let pool: Pool | null = null

export function getDbPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL

    if (!connectionString) {
      throw new Error(
        'DATABASE_URL environment variable is not set. Please add it to your .env file.'
      )
    }

    pool = new Pool({
      connectionString,
      // Connection pool settings for optimal performance
      max: 20, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
      connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
      ssl: connectionString.includes('supabase.co')
        ? {
            rejectUnauthorized: false, // Supabase requires SSL but uses self-signed certs
          }
        : undefined,
    })

    // Handle pool errors
    pool.on('error', (err) => {
      console.error('Unexpected error on idle database client', err)
    })
  }

  return pool
}

// Helper function to execute queries with proper error handling
export async function query<T = unknown>(
  text: string,
  params?: unknown[]
): Promise<T[]> {
  const pool = getDbPool()
  try {
    const result = await pool.query(text, params)
    return result.rows as T[]
  } catch (error) {
    console.error('Database query error:', error)
    throw error
  }
}

// Helper function to execute a single row query
export async function queryOne<T = unknown>(
  text: string,
  params?: unknown[]
): Promise<T | null> {
  const rows = await query<T>(text, params)
  return rows[0] || null
}

// Close the pool (useful for cleanup in tests or shutdown)
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end()
    pool = null
  }
}
