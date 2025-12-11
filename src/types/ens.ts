export interface DomainDetails {
  name: string
  normalizedName: string
  beautifiedName: string
  owner: string | null
  registrant: string | null
  manager: string | null
  registrationDate: number | null
  expiryDate: number | null
  gracePeriodEndDate: number | null
  resolverAddress: string | null
  resolverType: string | null
  resolverVersion: string | null
  texts: Record<string, string>
  coins: Record<string, string>
  contentHash: string | null
  isWrapped: boolean
  fuses?: {
    parent: Record<string, boolean>
    child: Record<string, boolean>
  }
  tokenId?: string
}

export interface SocialLinks {
  twitter?: string
  github?: string
  discord?: string
  telegram?: string
  reddit?: string
  linkedin?: string
}

export interface DomainProfile {
  displayName?: string
  bio?: string
  email?: string
  phone?: string
  location?: string
  website?: string
  avatar?: string
  socialLinks: SocialLinks
}

