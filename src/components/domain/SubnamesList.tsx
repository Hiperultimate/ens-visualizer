import type { FC } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Subname } from '@/types/ens'
import { Card } from '../ui/Card'
import { CopyButton } from '../ui/CopyButton'

interface SubnamesListProps {
  subnames: Subname[]
  parentDomain: string
}

export const SubnamesList: FC<SubnamesListProps> = ({ subnames }) => {
  const navigate = useNavigate()

  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return 'N/A'
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatAddress = (address: string | null) => {
    if (!address) return 'N/A'
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const handleSubnameClick = (subname: string | null) => {
    if (subname) {
      navigate(`/domain/${subname}`)
    }
  }

  if (subnames.length === 0) {
    return (
      <Card title="Subnames">
        <p className="text-sm text-gray-500 dark:text-gray-400">No subnames found</p>
      </Card>
    )
  }

  return (
    <Card title={`Subnames (${subnames.length})`}>
      <div className="space-y-4">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Subdomain
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Owner
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Expires
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {subnames.map((subname) => (
                <tr
                  key={subname.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                  onClick={() => handleSubnameClick(subname.name)}
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {subname.name || subname.truncatedName || subname.labelName || 'Unknown'}
                      </span>
                      {subname.name && (
                        <svg
                          className="w-4 h-4 text-gray-400"
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
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <a
                        href={`https://etherscan.io/address/${subname.owner}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-sm font-mono text-gray-900 dark:text-gray-100 hover:text-primary-600 dark:hover:text-primary-400"
                      >
                        {formatAddress(subname.owner)}
                      </a>
                      <CopyButton text={subname.owner} />
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(subname.createdAt)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(subname.expiryDate)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  )
}

