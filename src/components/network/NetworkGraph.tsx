'use client'

import {
  Background,
  type Connection,
  Controls,
  type Edge,
  Handle,
  MarkerType,
  MiniMap,
  type Node,
  type NodeTypes,
  Position,
  ReactFlow,
  addEdge,
  useEdgesState,
  useNodesState,
} from '@xyflow/react'
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import '@xyflow/react/dist/style.css'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import type { Node as FlowNode } from '@xyflow/react'

interface GraphNode {
  id: string
  ens_name: string
  position_x: number
  position_y: number
}

interface GraphConnection {
  id: string
  source_node_id: string
  target_node_id: string
}

interface NetworkGraphProps {
  userId: string | null
  onNodeClick: (ensName: string) => void
}

export interface NetworkGraphRef {
  addNode: (ensName: string) => Promise<void>
}

// Custom node component with connection handles
function CustomNode({ data }: { data: { label: string } }) {
  return (
    <div className="px-4 py-2 bg-white dark:bg-gray-800 border-2 border-primary-500 rounded-lg shadow-lg min-w-[120px] text-center relative">
      {/* Source handle (output) - on the right side - white for visibility */}
      <Handle
        type="source"
        position={Position.Right}
        className="!w-4 !h-4 !bg-white hover:!bg-gray-100 !border-2 !border-primary-500 dark:!border-primary-400 !shadow-lg"
        style={{ right: -8, cursor: 'crosshair', zIndex: 10 }}
      />

      {/* Node content */}
      <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
        {data.label}
      </div>

      {/* Target handle (input) - on the left side - white for visibility */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-4 !h-4 !bg-white hover:!bg-gray-100 !border-2 !border-primary-500 dark:!border-primary-400 !shadow-lg"
        style={{ left: -8, cursor: 'crosshair', zIndex: 10 }}
      />
    </div>
  )
}

const nodeTypes: NodeTypes = {
  custom: CustomNode,
}

export const NetworkGraph = forwardRef<NetworkGraphRef, NetworkGraphProps>(
  ({ userId, onNodeClick }, ref) => {
    const [nodes, setNodes, onNodesChange] = useNodesState<Node>([] as Node[])
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([] as Edge[])
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const positionUpdateTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map())

    // Load graph data from API
    const loadGraphData = useCallback(async () => {
      if (!userId) {
        console.warn('loadGraphData called without userId')
        return
      }

      try {
        setIsLoading(true)
        const response = await fetch(`/api/graph?userId=${encodeURIComponent(userId)}`)

        if (!response.ok) {
          throw new Error(`Failed to fetch graph data: ${response.statusText}`)
        }

        const data = await response.json()

        // Handle both success and error responses
        if (data.error) {
          console.error('API error:', data.error)
          // Set empty arrays if there's an error (e.g., database not connected)
          setNodes([])
          setEdges([])
          return
        }

        if (data.nodes && data.connections) {
          // Convert database nodes to React Flow nodes
          const flowNodes: Node[] = data.nodes.map((node: GraphNode) => ({
            id: node.id,
            type: 'custom',
            position: { x: node.position_x, y: node.position_y },
            data: { label: node.ens_name },
          }))

          // Convert database connections to React Flow edges
          const flowEdges: Edge[] = data.connections.map((conn: GraphConnection) => ({
            id: conn.id,
            source: conn.source_node_id,
            target: conn.target_node_id,
            type: 'default', // bezier curve
            animated: true,
            markerEnd: {
              type: MarkerType.ArrowClosed,
            },
          }))

          setNodes(flowNodes)
          setEdges(flowEdges)
        } else {
          // No data yet, set empty arrays
          setNodes([])
          setEdges([])
        }
      } catch (error) {
        console.error('Failed to load graph data:', error)
        // Set empty arrays on error so the graph still renders
        setNodes([])
        setEdges([])
      } finally {
        setIsLoading(false)
      }
    }, [userId, setNodes, setEdges])

    // Load data on mount and when userId changes
    useEffect(() => {
      // Only load if userId is available and valid
      if (userId && typeof userId === 'string' && userId.trim().length > 0) {
        loadGraphData()
      } else {
        // If no userId, set loading to false and clear data
        setIsLoading(false)
        setNodes([])
        setEdges([])
      }
    }, [userId, loadGraphData])

    // Handle node position changes
    const handleNodesChange = useCallback(
      (changes: any) => {
        onNodesChange(changes)

        // Save position changes to database with debouncing
        changes.forEach((change: any) => {
          if (change.type === 'position' && change.position) {
            const nodeId = change.id

            // Clear existing timeout for this node
            const existingTimeout = positionUpdateTimeouts.current.get(nodeId)
            if (existingTimeout) {
              clearTimeout(existingTimeout)
            }

            // Set new timeout
            const timeoutId = setTimeout(async () => {
              const node = nodes.find((n) => n.id === nodeId)
              if (node) {
                try {
                  await fetch('/api/nodes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      userId,
                      ensName: node.data.label,
                      positionX: change.position.x,
                      positionY: change.position.y,
                    }),
                  })
                } catch (error) {
                  console.error('Failed to update node position:', error)
                }
              }
              positionUpdateTimeouts.current.delete(nodeId)
            }, 500)

            positionUpdateTimeouts.current.set(nodeId, timeoutId)
          }
        })
      },
      [onNodesChange, nodes, userId],
    )

    // Cleanup timeouts on unmount
    useEffect(() => {
      return () => {
        positionUpdateTimeouts.current.forEach((timeout) => clearTimeout(timeout))
        positionUpdateTimeouts.current.clear()
      }
    }, [])

    // Handle edge/connection creation
    const onConnect = useCallback(
      async (params: Connection) => {
        if (!params.source || !params.target) return

        // Find source and target node IDs
        const sourceNode = nodes.find((n) => n.id === params.source)
        const targetNode = nodes.find((n) => n.id === params.target)

        if (!sourceNode || !targetNode) return

        try {
          setIsSaving(true)
          const response = await fetch('/api/connections', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId,
              sourceNodeId: params.source,
              targetNodeId: params.target,
            }),
          })

          if (response.ok) {
            const data = await response.json()
            const newEdge: Edge = {
              id: data.connection.id,
              source: params.source!,
              target: params.target!,
              type: 'default', // bezier curve
              animated: true,
              markerEnd: {
                type: MarkerType.ArrowClosed,
              },
            }
            setEdges((eds) => addEdge(newEdge, eds))
          } else {
            const error = await response.json()
            console.error('Failed to create connection:', error.error)
            alert(error.error || 'Failed to create connection')
          }
        } catch (error) {
          console.error('Error creating connection:', error)
          alert('Failed to create connection')
        } finally {
          setIsSaving(false)
        }
      },
      [nodes, userId, setEdges],
    )

    // Handle edge deletion (on edge click)
    const onEdgeClick = useCallback(
      async (_event: React.MouseEvent, edge: Edge) => {
        if (confirm('Delete this connection?')) {
          try {
            const response = await fetch(
              `/api/connections?connectionId=${edge.id}&userId=${userId}`,
              { method: 'DELETE' },
            )

            if (response.ok) {
              setEdges((eds) => eds.filter((e) => e.id !== edge.id))
            } else {
              const error = await response.json()
              console.error('Failed to delete connection:', error.error)
              alert(error.error || 'Failed to delete connection')
            }
          } catch (error) {
            console.error('Error deleting connection:', error)
            alert('Failed to delete connection')
          }
        }
      },
      [userId, setEdges],
    )

    // Handle node click - redirect to domain page
    const onNodeClickHandler = useCallback(
      (_event: React.MouseEvent, node: FlowNode) => {
        const ensName = node.data?.label
        if (ensName && typeof ensName === 'string') {
          onNodeClick(ensName as string)
        }
      },
      [onNodeClick],
    )

    // Add node to graph
    const addNode = useCallback(
      async (ensName: string) => {
        if (!userId) {
          console.error('Cannot add node: userId is not available')
          alert('User ID not available. Please refresh the page.')
          return
        }

        // Check if node already exists
        const existingNode = nodes.find((n) => {
          const label = n.data?.label
          return label && typeof label === 'string' && label.toLowerCase() === ensName.toLowerCase()
        })
        if (existingNode) {
          // Optionally, you could focus on the existing node
          return
        }

        // Generate random position in center area
        // Use viewport dimensions or fallback to reasonable defaults
        const centerX = typeof window !== 'undefined' ? window.innerWidth / 2 : 500
        const centerY = typeof window !== 'undefined' ? window.innerHeight / 2 : 400
        const positionX = centerX + (Math.random() - 0.5) * 400
        const positionY = centerY + (Math.random() - 0.5) * 400

        try {
          setIsSaving(true)

          const response = await fetch('/api/nodes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId,
              ensName,
              positionX,
              positionY,
            }),
          })

          if (response.ok) {
            const data = await response.json()

            const newNode: Node = {
              id: data.node.id,
              type: 'custom',
              position: { x: data.node.position_x, y: data.node.position_y },
              data: { label: data.node.ens_name },
            }
            setNodes((nds) => [...nds, newNode])
          } else {
            const errorData = await response.json()
            console.error('Failed to add node:', errorData)
            alert(errorData.error || 'Failed to add node')
          }
        } catch (error) {
          console.error('Error adding node:', error)
          alert('Failed to add node. Please check the console for details.')
        } finally {
          setIsSaving(false)
        }
      },
      [userId, nodes, setNodes],
    )

    // Expose addNode function via ref
    useImperativeHandle(
      ref,
      () => ({
        addNode,
      }),
      [addNode],
    )

    // Early return if no userId (after all hooks)
    if (!userId) {
      return (
        <div className="flex items-center justify-center w-full h-full min-h-[400px]">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400">Waiting for user ID...</p>
          </div>
        </div>
      )
    }

    if (isLoading) {
      return (
        <div className="flex items-center justify-center w-full h-full min-h-[400px]">
          <div className="text-center">
            <LoadingSpinner />
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading network graph...</p>
          </div>
        </div>
      )
    }

    return (
      <div className="w-full h-full relative" style={{ minHeight: '400px' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClickHandler}
          onEdgeClick={onEdgeClick}
          nodeTypes={nodeTypes}
          fitView
          className="bg-gray-50 dark:bg-gray-900"
          style={{ width: '100%', height: '100%' }}
          defaultEdgeOptions={{
            type: 'default', // bezier curve
            animated: true,
            markerEnd: {
              type: MarkerType.ArrowClosed,
            },
          }}
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
        {isSaving && (
          <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-lg z-10">
            <div className="flex items-center gap-2">
              <LoadingSpinner size="sm" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Saving...</span>
            </div>
          </div>
        )}
      </div>
    )
  },
)

NetworkGraph.displayName = 'NetworkGraph'
