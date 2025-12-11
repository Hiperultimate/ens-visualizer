import type { FC } from 'react'
import { useState } from 'react'
import type { AbiRecord } from '@/types/ens'
import { Card } from '../ui/Card'
import { CopyButton } from '../ui/CopyButton'

interface AbiRecordsProps {
  abiRecord: AbiRecord | null
}

export const AbiRecords: FC<AbiRecordsProps> = ({ abiRecord }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!abiRecord) {
    return (
      <Card title="ABI Record">
        <p className="text-sm text-gray-500 dark:text-gray-400">No ABI record configured</p>
      </Card>
    )
  }

  const formatAbi = () => {
    try {
      if (abiRecord.abi) {
        return JSON.stringify(abiRecord.abi, null, 2)
      }
      return abiRecord.decoded
    } catch {
      return abiRecord.decoded
    }
  }

  const formattedAbi = formatAbi()
  const abiLength = formattedAbi.length
  const previewLength = 200

  return (
    <Card title="ABI Record">
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Content Type
          </label>
          <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
            {abiRecord.contentType === 1 ? 'JSON' : `Type ${abiRecord.contentType}`}
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
              ABI Content
            </label>
            <div className="flex items-center gap-2">
              {abiLength > previewLength && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
                >
                  {isExpanded ? 'Collapse' : 'Expand'}
                </button>
              )}
              <CopyButton text={formattedAbi} />
            </div>
          </div>
          <div className="relative">
            <pre className="text-xs font-mono text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-900 px-4 py-3 rounded border border-gray-200 dark:border-gray-700 overflow-x-auto max-h-96 overflow-y-auto">
              {isExpanded || abiLength <= previewLength
                ? formattedAbi
                : `${formattedAbi.slice(0, previewLength)}...`}
            </pre>
            {!isExpanded && abiLength > previewLength && (
              <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-gray-50 dark:from-gray-900 to-transparent pointer-events-none" />
            )}
          </div>
          {!isExpanded && abiLength > previewLength && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Showing first {previewLength} characters. Click "Expand" to view full ABI.
            </p>
          )}
        </div>
      </div>
    </Card>
  )
}

