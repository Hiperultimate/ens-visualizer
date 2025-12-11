import type { DomainDetails } from '@/types/ens'
import type { FC } from 'react'
import { Card } from '../ui/Card'
import { CopyButton } from '../ui/CopyButton'

interface ResolverInfoProps {
  details: DomainDetails
}

export const ResolverInfo: FC<ResolverInfoProps> = ({ details }) => {
  const formatAddress = (address: string | null) => {
    if (!address) return 'N/A'
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  if (!details.resolverAddress) {
    return (
      <Card title="Resolver Details">
        <p className="text-sm text-gray-500 dark:text-gray-400">No resolver configured</p>
      </Card>
    )
  }

  return (
    <Card title="Resolver Details">
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Resolver Address
          </label>
          <div className="mt-1 flex items-center gap-2">
            <a
              href={`https://etherscan.io/address/${details.resolverAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-mono text-gray-900 dark:text-gray-100 hover:text-primary-600 dark:hover:text-primary-400"
            >
              {formatAddress(details.resolverAddress)}
            </a>
            <CopyButton text={details.resolverAddress} />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Resolver Type
          </label>
          <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
            {details.resolverType || 'Unknown'}
          </p>
        </div>

        {details.resolverVersion && (
          <div>
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Resolver Version
            </label>
            <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
              {details.resolverVersion}
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}
