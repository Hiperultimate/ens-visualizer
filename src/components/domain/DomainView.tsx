import type { FC } from 'react'
import { useDomainDetails } from '@/hooks/useDomainDetails'
import { ENSService } from '@/services/ens.service'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { ErrorMessage } from '../ui/ErrorMessage'
import { DomainBasicInfo } from './DomainBasicInfo'
import { ResolverInfo } from './ResolverInfo'
import { DomainProfile } from './DomainProfile'
import { ContentHashDisplay } from './ContentHashDisplay'
import { AbiRecords } from './AbiRecords'
import { SubnamesList } from './SubnamesList'
import { OwnershipRoles } from './OwnershipRoles'

interface DomainViewProps {
  domainName: string
}

export const DomainView: FC<DomainViewProps> = ({ domainName }) => {
  const { data: details, isLoading, error, refetch } = useDomainDetails(domainName)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading domain information...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <ErrorMessage
          message={error instanceof Error ? error.message : 'Failed to load domain details'}
          onRetry={() => refetch()}
        />
      </div>
    )
  }

  if (!details) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <ErrorMessage message="Domain not found" />
      </div>
    )
  }

  const profile = ENSService.extractProfile(details)

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          {details.beautifiedName}
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          ENS Domain Information
        </p>
      </div>

      <div className="space-y-6">
        {/* Feature 1.3: User Profile Display */}
        <DomainProfile profile={profile} domainName={details.beautifiedName} />

        {/* Feature 1.1: Basic Domain Information */}
        <DomainBasicInfo details={details} />

        {/* Ownership Roles */}
        <OwnershipRoles details={details} />

        {/* Feature 1.2: Resolver Details Panel */}
        <ResolverInfo details={details} />

        {/* Content Hash Display */}
        <ContentHashDisplay contentHashInfo={details.contentHashInfo} domainName={details.beautifiedName} />

        {/* ABI Records */}
        <AbiRecords abiRecord={details.abiRecord} />

        {/* Subnames List */}
        <SubnamesList subnames={details.subnames} parentDomain={details.beautifiedName} />
      </div>
    </div>
  )
}

