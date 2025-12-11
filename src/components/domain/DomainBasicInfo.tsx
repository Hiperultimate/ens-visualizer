import type { DomainDetails } from '@/types/ens'
import type { FC } from 'react'
import { Card } from '../ui/Card'
import { CopyButton } from '../ui/CopyButton'

interface DomainBasicInfoProps {
  details: DomainDetails
}

export const DomainBasicInfo: FC<DomainBasicInfoProps> = ({ details }) => {
  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return 'N/A'
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatAddress = (address: string | null) => {
    if (!address) return 'N/A'
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const getDaysUntilExpiry = () => {
    if (!details.expiryDate) return null
    const now = Math.floor(Date.now() / 1000)
    const days = Math.floor((details.expiryDate - now) / (24 * 60 * 60))
    return days > 0 ? days : 0
  }

  const daysUntilExpiry = getDaysUntilExpiry()
  const isInGracePeriod = details.gracePeriodEndDate
    ? Math.floor(Date.now() / 1000) < details.gracePeriodEndDate
    : false

  return (
    <Card title="Basic Information">
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Domain Name
          </label>
          <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
            {details.beautifiedName}
          </p>
          {details.normalizedName !== details.beautifiedName && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Normalized: {details.normalizedName}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Owner</label>
            <div className="mt-1 flex items-center gap-2">
              {details.owner ? (
                <>
                  <a
                    href={`https://etherscan.io/address/${details.owner}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-mono text-gray-900 dark:text-gray-100 hover:text-primary-600 dark:hover:text-primary-400"
                  >
                    {formatAddress(details.owner)}
                  </a>
                  <CopyButton text={details.owner} />
                </>
              ) : (
                <span className="text-sm text-gray-500 dark:text-gray-400">N/A</span>
              )}
            </div>
          </div>

          {details.registrant && (
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Registrant
              </label>
              <div className="mt-1 flex items-center gap-2">
                <a
                  href={`https://etherscan.io/address/${details.registrant}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-mono text-gray-900 dark:text-gray-100 hover:text-primary-600 dark:hover:text-primary-400"
                >
                  {formatAddress(details.registrant)}
                </a>
                <CopyButton text={details.registrant} />
              </div>
            </div>
          )}

          {details.manager && (
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Manager/Controller
              </label>
              <div className="mt-1 flex items-center gap-2">
                <a
                  href={`https://etherscan.io/address/${details.manager}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-mono text-gray-900 dark:text-gray-100 hover:text-primary-600 dark:hover:text-primary-400"
                >
                  {formatAddress(details.manager)}
                </a>
                <CopyButton text={details.manager} />
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div>
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Registration Date
            </label>
            <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
              {formatDate(details.registrationDate)}
            </p>
          </div>

          {details.expiryDate && (
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Expiration Date
              </label>
              <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                {formatDate(details.expiryDate)}
              </p>
              {daysUntilExpiry !== null && (
                <p className="mt-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {daysUntilExpiry > 0 ? (
                    <span className="text-orange-600 dark:text-orange-400">
                      Expires in {daysUntilExpiry} day{daysUntilExpiry !== 1 ? 's' : ''}
                    </span>
                  ) : (
                    <span className="text-red-600 dark:text-red-400">Expired</span>
                  )}
                </p>
              )}
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Grace Period Status
            </label>
            <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
              {isInGracePeriod ? (
                <span className="text-orange-600 dark:text-orange-400 font-medium">
                  In Grace Period
                </span>
              ) : (
                <span className="text-gray-600 dark:text-gray-400">Not in Grace Period</span>
              )}
            </p>
            {details.gracePeriodEndDate && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Grace period ends: {formatDate(details.gracePeriodEndDate)}
              </p>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
