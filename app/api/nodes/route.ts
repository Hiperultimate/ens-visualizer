import { query, queryOne } from '@/lib/db'
import { type NextRequest, NextResponse } from 'next/server'

// GET /api/nodes - Get all nodes for a user
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId parameter is required' }, { status: 400 })
    }

    const nodes = await query<{
      id: string
      ens_name: string
      position_x: number
      position_y: number
      created_at: Date
    }>(
      'SELECT id, ens_name, position_x, position_y, created_at FROM nodes WHERE user_id = $1 ORDER BY created_at',
      [userId],
    )

    return NextResponse.json({ nodes })
  } catch (error) {
    console.error('Error in GET /api/nodes:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/nodes - Create a new node
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, ensName, positionX, positionY } = body

    if (!userId || !ensName) {
      return NextResponse.json({ error: 'userId and ensName are required' }, { status: 400 })
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(userId)) {
      return NextResponse.json({ error: 'Invalid userId UUID format' }, { status: 400 })
    }

    // Check if user exists
    const user = await queryOne<{ id: string }>('SELECT id FROM users WHERE id = $1', [userId])

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if node already exists for this user
    const existingNode = await queryOne<{ id: string }>(
      'SELECT id FROM nodes WHERE user_id = $1 AND ens_name = $2',
      [userId, ensName],
    )

    if (existingNode) {
      // Update position if node exists
      const updatedNode = await queryOne<{
        id: string
        ens_name: string
        position_x: number
        position_y: number
      }>(
        'UPDATE nodes SET position_x = $1, position_y = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING id, ens_name, position_x, position_y',
        [positionX ?? 0, positionY ?? 0, existingNode.id],
      )

      return NextResponse.json({ node: updatedNode })
    }

    // Create new node
    const newNode = await queryOne<{
      id: string
      ens_name: string
      position_x: number
      position_y: number
    }>(
      'INSERT INTO nodes (user_id, ens_name, position_x, position_y) VALUES ($1, $2, $3, $4) RETURNING id, ens_name, position_x, position_y',
      [userId, ensName, positionX ?? 0, positionY ?? 0],
    )

    if (!newNode) {
      return NextResponse.json({ error: 'Failed to create node' }, { status: 500 })
    }

    return NextResponse.json({ node: newNode }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/nodes:', error)
    // Handle unique constraint violation
    if (error instanceof Error && error.message.includes('duplicate key value')) {
      return NextResponse.json({ error: 'Node already exists for this user' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/nodes - Delete a node
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const nodeId = searchParams.get('nodeId')
    const userId = searchParams.get('userId')

    if (!nodeId || !userId) {
      return NextResponse.json(
        { error: 'nodeId and userId parameters are required' },
        { status: 400 },
      )
    }

    // Verify the node belongs to the user before deleting
    const node = await queryOne<{ id: string }>(
      'SELECT id FROM nodes WHERE id = $1 AND user_id = $2',
      [nodeId, userId],
    )

    if (!node) {
      return NextResponse.json({ error: 'Node not found or access denied' }, { status: 404 })
    }

    // Delete the node (cascade will handle connections)
    await query('DELETE FROM nodes WHERE id = $1', [nodeId])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/nodes:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
