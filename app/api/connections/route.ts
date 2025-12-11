import { query, queryOne } from '@/lib/db'
import { type NextRequest, NextResponse } from 'next/server'

// GET /api/connections - Get all connections for a user
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId parameter is required' }, { status: 400 })
    }

    const connections = await query<{
      id: string
      source_node_id: string
      target_node_id: string
      created_at: Date
    }>(
      'SELECT id, source_node_id, target_node_id, created_at FROM connections WHERE user_id = $1 ORDER BY created_at',
      [userId],
    )

    return NextResponse.json({ connections })
  } catch (error) {
    console.error('Error in GET /api/connections:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/connections - Create a new connection
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, sourceNodeId, targetNodeId } = body

    if (!userId || !sourceNodeId || !targetNodeId) {
      return NextResponse.json(
        { error: 'userId, sourceNodeId, and targetNodeId are required' },
        { status: 400 },
      )
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(userId)) {
      return NextResponse.json({ error: 'Invalid userId UUID format' }, { status: 400 })
    }

    // Prevent self-connections
    if (sourceNodeId === targetNodeId) {
      return NextResponse.json({ error: 'Cannot connect a node to itself' }, { status: 400 })
    }

    // Verify both nodes belong to the user
    const sourceNode = await queryOne<{ id: string }>(
      'SELECT id FROM nodes WHERE id = $1 AND user_id = $2',
      [sourceNodeId, userId],
    )

    const targetNode = await queryOne<{ id: string }>(
      'SELECT id FROM nodes WHERE id = $1 AND user_id = $2',
      [targetNodeId, userId],
    )

    if (!sourceNode || !targetNode) {
      return NextResponse.json(
        { error: 'One or both nodes not found or access denied' },
        { status: 404 },
      )
    }

    // Check if connection already exists
    const existingConnection = await queryOne<{ id: string }>(
      'SELECT id FROM connections WHERE user_id = $1 AND source_node_id = $2 AND target_node_id = $3',
      [userId, sourceNodeId, targetNodeId],
    )

    if (existingConnection) {
      return NextResponse.json({ error: 'Connection already exists' }, { status: 409 })
    }

    // Create new connection
    const newConnection = await queryOne<{
      id: string
      source_node_id: string
      target_node_id: string
    }>(
      'INSERT INTO connections (user_id, source_node_id, target_node_id) VALUES ($1, $2, $3) RETURNING id, source_node_id, target_node_id',
      [userId, sourceNodeId, targetNodeId],
    )

    if (!newConnection) {
      return NextResponse.json({ error: 'Failed to create connection' }, { status: 500 })
    }

    return NextResponse.json({ connection: newConnection }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/connections:', error)
    // Handle unique constraint violation
    if (error instanceof Error && error.message.includes('duplicate key value')) {
      return NextResponse.json({ error: 'Connection already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/connections - Delete a connection
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const connectionId = searchParams.get('connectionId')
    const userId = searchParams.get('userId')

    if (!connectionId || !userId) {
      return NextResponse.json(
        { error: 'connectionId and userId parameters are required' },
        { status: 400 },
      )
    }

    // Verify the connection belongs to the user before deleting
    const connection = await queryOne<{ id: string }>(
      'SELECT id FROM connections WHERE id = $1 AND user_id = $2',
      [connectionId, userId],
    )

    if (!connection) {
      return NextResponse.json({ error: 'Connection not found or access denied' }, { status: 404 })
    }

    // Delete the connection
    await query('DELETE FROM connections WHERE id = $1', [connectionId])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/connections:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
