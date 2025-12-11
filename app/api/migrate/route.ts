import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { query } from '@/lib/db'
import { NextResponse } from 'next/server'

// POST /api/migrate - Run database migration
export async function POST() {
  try {
    // Read the schema file
    const schemaPath = join(process.cwd(), 'database', 'schema.sql')
    const schema = readFileSync(schemaPath, 'utf-8')

    // Split by semicolons and execute each statement
    const statements = schema
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith('--'))

    const executedStatements: string[] = []
    const skippedStatements: string[] = []
    const errors: string[] = []

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      if (statement && statement.trim()) {
        try {
          await query(statement)
          executedStatements.push(`Statement ${i + 1}`)
        } catch (error) {
          if (error instanceof Error && error.message.includes('already exists')) {
            skippedStatements.push(`Statement ${i + 1} (already exists)`)
          } else {
            errors.push(
              `Statement ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`,
            )
          }
        }
      }
    }

    // Verify tables were created
    const tables = await query<{ table_name: string }>(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'nodes', 'connections')
      ORDER BY table_name
    `)

    const expectedTables = ['users', 'nodes', 'connections']
    const createdTables = tables.map((t) => t.table_name)
    const missingTables = expectedTables.filter((t) => !createdTables.includes(t))

    return NextResponse.json({
      success: errors.length === 0 && missingTables.length === 0,
      message:
        errors.length === 0 && missingTables.length === 0
          ? 'Migration completed successfully'
          : 'Migration completed with warnings',
      executed: executedStatements.length,
      skipped: skippedStatements.length,
      errors: errors.length,
      tables: {
        created: createdTables,
        missing: missingTables,
      },
      details: {
        executedStatements,
        skippedStatements,
        errors,
      },
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    return NextResponse.json(
      {
        success: false,
        message: 'Migration failed',
        error: errorMessage,
      },
      { status: 500 },
    )
  }
}
