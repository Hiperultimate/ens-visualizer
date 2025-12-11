'use client'

import { useDomainDetails } from '@/hooks/useDomainDetails'
import { ENSService } from '@/services/ens.service'
import type { FC } from 'react'
import { ErrorMessage } from '../ui/ErrorMessage'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { Tabs } from '../ui/Tabs'
import { AbiRecords } from './AbiRecords'
import { ContentHashDisplay } from './ContentHashDisplay'
import { DomainBasicInfo } from './DomainBasicInfo'
import { DomainProfile } from './DomainProfile'
import { OwnershipRoles } from './OwnershipRoles'
import { ResolverInfo } from './ResolverInfo'
import { SubnamesList } from './SubnamesList'

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
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading domain information...</p>
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

  const tabs = [
    {
      id: 'profile',
      label: 'Profile',
      content: <DomainProfile profile={profile} domainName={details.beautifiedName} />,
    },
    {
      id: 'basic',
      label: 'Basic Information',
      content: <DomainBasicInfo details={details} />,
    },
    {
      id: 'ownership',
      label: 'Ownership Roles',
      content: <OwnershipRoles details={details} />,
    },
    {
      id: 'resolver',
      label: 'Resolver Details',
      content: <ResolverInfo details={details} />,
    },
    {
      id: 'content-hash',
      label: 'Content Hash',
      content: (
        <ContentHashDisplay
          contentHashInfo={details.contentHashInfo}
          domainName={details.beautifiedName}
        />
      ),
    },
    {
      id: 'abi',
      label: 'ABI Records',
      content: <AbiRecords abiRecord={details.abiRecord} />,
    },
    {
      id: 'subnames',
      label: 'Subnames',
      content: <SubnamesList subnames={details.subnames} parentDomain={details.beautifiedName} />,
    },
  ]

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          {details.beautifiedName}
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">ENS Domain Information</p>
      </div>

      <Tabs tabs={tabs} defaultTab="profile" />
    </div>
  )
}
