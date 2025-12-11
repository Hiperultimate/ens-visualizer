import { query } from '@/lib/db'
import { type NextRequest, NextResponse } from 'next/server'

// GET /api/graph - Get complete graph data (nodes + connections) for a user
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId parameter is required' }, { status: 400 })
    }

    // Fetch nodes
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

    // Fetch connections
    const connections = await query<{
      id: string
      source_node_id: string
      target_node_id: string
      created_at: Date
    }>(
      'SELECT id, source_node_id, target_node_id, created_at FROM connections WHERE user_id = $1 ORDER BY created_at',
      [userId],
    )

    return NextResponse.json({
      nodes,
      connections,
    })
  } catch (error) {
    console.error('Error in GET /api/graph:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
