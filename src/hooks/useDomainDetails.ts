import { ENSService } from '@/services/ens.service'
import type { DomainDetails } from '@/types/ens'
import { useQuery } from '@tanstack/react-query'

export const useDomainDetails = (name: string | null) => {
  return useQuery<DomainDetails>({
    queryKey: ['domain', name],
    queryFn: () => {
      if (!name) throw new Error('Domain name is required')
      return ENSService.getDomainDetails(name)
    },
    enabled: !!name && name.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  })
}
