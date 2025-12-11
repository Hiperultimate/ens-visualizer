export interface ContentHashInfo {
  protocolType: 'ipfs' | 'ipns' | 'ar' | 'bzz' | 'onion' | 'onion3' | 'sia' | null
  decoded: string
}

export interface AbiRecord {
  contentType: number
  decoded: string
  abi: unknown // Parsed ABI object
}

export interface Subname {
  id: string
  name: string | null
  truncatedName: string | null
  labelName: string | null
  owner: string
  registrant: string | null
  createdAt: number | null
  registrationDate: number | null
  expiryDate: number | null
  resolvedAddress: string | null
}

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
  contentHash: string | null // Deprecated, use contentHashInfo
  contentHashInfo: ContentHashInfo | null
  abiRecord: AbiRecord | null
  subnames: Subname[]
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
