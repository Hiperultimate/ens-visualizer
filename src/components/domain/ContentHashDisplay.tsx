import type { FC } from 'react'
import type { ContentHashInfo } from '@/types/ens'
import { Card } from '../ui/Card'
import { CopyButton } from '../ui/CopyButton'

interface ContentHashDisplayProps {
  contentHashInfo: ContentHashInfo | null
  domainName: string
}

export const ContentHashDisplay: FC<ContentHashDisplayProps> = ({ contentHashInfo, domainName }) => {
  if (!contentHashInfo || !contentHashInfo.decoded) {
    return (
      <Card title="Content Hash">
        <p className="text-sm text-gray-500 dark:text-gray-400">No content hash configured</p>
      </Card>
    )
  }

  const { protocolType, decoded } = contentHashInfo

  const getProtocolLabel = () => {
    switch (protocolType) {
      case 'ipfs':
        return 'IPFS'
      case 'ipns':
        return 'IPNS'
      case 'ar':
        return 'Arweave'
      case 'bzz':
        return 'Swarm'
      case 'onion':
      case 'onion3':
        return 'Onion'
      case 'sia':
        return 'Sia'
      default:
        return 'Unknown'
    }
  }

  const getProtocolColor = () => {
    switch (protocolType) {
      case 'ipfs':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'ipns':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'ar':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'bzz':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'onion':
      case 'onion3':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 'sia':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    }
  }

  const getContentHashUri = () => {
    if (!protocolType) return decoded
    return `${protocolType}://${decoded}`
  }

  const getEnsWebsiteUrl = () => {
    return `https://${domainName}.limo/`
  }

  const contentHashUri = getContentHashUri()
  const ensWebsiteUrl = getEnsWebsiteUrl()

  return (
    <Card title="Content Hash">
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Protocol Type
          </label>
          <div className="mt-1">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getProtocolColor()}`}>
              {getProtocolLabel()}
            </span>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Content Hash
          </label>
          <div className="mt-1 flex items-center gap-2">
            <code className="flex-1 text-sm font-mono text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-900 px-3 py-2 rounded border border-gray-200 dark:border-gray-700 break-all">
              {contentHashUri}
            </code>
            <CopyButton text={contentHashUri} />
          </div>
        </div>

        <div>
          <a
            href={ensWebsiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 dark:bg-primary-500 rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors"
          >
            <span>Visit Website</span>
            <svg
              className="ml-2 w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        </div>
      </div>
    </Card>
  )
}

