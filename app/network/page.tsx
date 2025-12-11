'use client'

import { useRef } from 'react'
import { useRouter } from 'next/navigation'
import { NetworkGraph, type NetworkGraphRef } from '@/components/network/NetworkGraph'
import { ENSSearchInput } from '@/components/network/ENSSearchInput'
import { useUserId } from '@/hooks/useUserId'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export default function NetworkPage() {
  const router = useRouter()
  const graphRef = useRef<NetworkGraphRef>(null)
  const { userId, isLoading: isUserIdLoading } = useUserId()

  const handleNodeClick = (ensName: string) => {
    router.push(`/domain/${encodeURIComponent(ensName)}`)
  }

  const handleENSSelect = (ensName: string) => {
    console.log('handleENSSelect called with:', ensName)
    console.log('graphRef.current:', graphRef.current)
    
    if (graphRef.current) {
      console.log('Calling addNode on graphRef')
      graphRef.current.addNode(ensName).catch((error) => {
        console.error('Error in addNode:', error)
        alert('Failed to add node. Please check the console for details.')
      })
    } else {
      console.error('graphRef.current is null - NetworkGraph component not ready')
      alert('Graph not ready. Please wait a moment and try again.')
    }
  }

  if (isUserIdLoading || !userId) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Initializing...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
      {/* Search Bar */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl">
            <label
              htmlFor="ens-search"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Add ENS Domain to Network Graph
            </label>
            <ENSSearchInput onSelect={handleENSSelect} />
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Search for a valid ENS name and add it to your network graph.
              Click on nodes to view their profile, or drag to create
              connections.
            </p>
          </div>
        </div>
      </div>

      {/* Network Graph */}
      <div className="flex-1 relative overflow-hidden" style={{ minHeight: 0 }}>
        {userId && (
          <NetworkGraph
            ref={graphRef}
            userId={userId}
            onNodeClick={handleNodeClick}
          />
        )}
      </div>
    </div>
  )
}
