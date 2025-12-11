import { NextRequest, NextResponse } from 'next/server'
import { getDbPool, queryOne } from '@/lib/db'

// GET /api/users - Get or create a user by UUID
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId parameter is required' },
        { status: 400 }
      )
    }

    // Validate UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(userId)) {
      return NextResponse.json(
        { error: 'Invalid UUID format' },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await queryOne<{ id: string; created_at: Date }>(
      'SELECT id, created_at FROM users WHERE id = $1',
      [userId]
    )

    if (user) {
      return NextResponse.json({ userId: user.id, created_at: user.created_at })
    }

    // User doesn't exist, create new one
    const newUser = await queryOne<{ id: string; created_at: Date }>(
      'INSERT INTO users (id) VALUES ($1) RETURNING id, created_at',
      [userId]
    )

    if (!newUser) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      userId: newUser.id,
      created_at: newUser.created_at,
    })
  } catch (error) {
    console.error('Error in GET /api/users:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/users - Create a new user (generates UUID)
export async function POST() {
  try {
    const newUser = await queryOne<{ id: string; created_at: Date }>(
      'INSERT INTO users DEFAULT VALUES RETURNING id, created_at'
    )

    if (!newUser) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      userId: newUser.id,
      created_at: newUser.created_at,
    })
  } catch (error) {
    console.error('Error in POST /api/users:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
