import { getDbPool } from '@/lib/db'
import { NextResponse } from 'next/server'

// GET /api/test-db - Test database connection
export async function GET() {
  try {
    const pool = getDbPool()

    // Test basic connection
    const result = await pool.query('SELECT NOW() as current_time, version() as version')

    // Check if tables exist
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'nodes', 'connections')
      ORDER BY table_name
    `)

    const existingTables = tablesResult.rows.map((r: { table_name: string }) => r.table_name)
    const expectedTables = ['users', 'nodes', 'connections']
    const missingTables = expectedTables.filter((t) => !existingTables.includes(t))

    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      database: {
        currentTime: result.rows[0].current_time,
        version: `${result.rows[0].version.split(' ')[0]} ${result.rows[0].version.split(' ')[1]}`,
      },
      tables: {
        existing: existingTables,
        missing: missingTables,
        allPresent: missingTables.length === 0,
      },
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    // Provide helpful error messages
    let userMessage = 'Database connection failed'
    if (errorMessage.includes('ENOTFOUND')) {
      userMessage =
        'Cannot resolve database hostname. Your Supabase project might be paused. Please check your Supabase dashboard.'
    } else if (errorMessage.includes('password authentication')) {
      userMessage = 'Authentication failed. Please check your DATABASE_URL password.'
    } else if (errorMessage.includes('timeout')) {
      userMessage = 'Connection timeout. Please check your network connection.'
    }

    return NextResponse.json(
      {
        success: false,
        message: userMessage,
        error: errorMessage,
      },
      { status: 500 },
    )
  }
}
