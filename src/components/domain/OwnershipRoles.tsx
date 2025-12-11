import type { DomainDetails } from '@/types/ens'
import type { FC } from 'react'
import { Card } from '../ui/Card'
import { CopyButton } from '../ui/CopyButton'

interface OwnershipRolesProps {
  details: DomainDetails
}

export const OwnershipRoles: FC<OwnershipRolesProps> = ({ details }) => {
  const formatAddress = (address: string | null) => {
    if (!address) return 'N/A'
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const roles = [
    {
      label: 'Owner',
      description: 'Controls domain ownership, can transfer and set resolver',
      address: details.owner,
    },
    {
      label: 'Registrant',
      description: 'Can renew the domain (for .eth domains)',
      address: details.registrant,
      show: !!details.registrant,
    },
    {
      label: 'Controller',
      description: 'Can set records (text, addresses, content hash)',
      address: details.manager,
      show: !!details.manager,
    },
  ].filter((role) => role.show !== false)

  return (
    <Card title="Ownership Roles">
      <div className="space-y-4">
        {roles.map((role) => (
          <div
            key={role.label}
            className="border-b border-gray-200 dark:border-gray-700 last:border-0 pb-4 last:pb-0"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {role.label}
                  </h4>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{role.description}</p>
                {role.address ? (
                  <div className="flex items-center gap-2">
                    <a
                      href={`https://etherscan.io/address/${role.address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-mono text-gray-900 dark:text-gray-100 hover:text-primary-600 dark:hover:text-primary-400"
                    >
                      {formatAddress(role.address)}
                    </a>
                    <CopyButton text={role.address} />
                  </div>
                ) : (
                  <span className="text-sm text-gray-500 dark:text-gray-400">N/A</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
