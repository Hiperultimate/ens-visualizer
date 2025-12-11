import { getRecords, getOwner, getExpiry, getResolver, getWrapperData, getAbiRecord } from '@ensdomains/ensjs/public'
import { getSubnames } from '@ensdomains/ensjs/subgraph'
import { normalize } from 'viem/ens'
import { publicClient } from '@/lib/ens-client'
import type { DomainDetails, DomainProfile, ContentHashInfo, AbiRecord, Subname } from '@/types/ens'

export class ENSService {
  static async getDomainDetails(name: string): Promise<DomainDetails> {
    try {
      // Normalize the domain name
      const normalizedName = normalize(name)
      
      // Fetch all data in parallel for optimal performance
      // Note: getRecords needs specific text/coin keys to return them
      // We fetch common text records - expand this list as needed
      const [records, owner, expiry, resolver, wrapperData, abiRecord] = await Promise.all([
        getRecords(publicClient, {
          name: normalizedName,
          texts: [
            'name',
            'description',
            'email',
            'url',
            'avatar',
            'phone',
            'location',
            'com.twitter',
            'com.github',
            'com.discord',
            'org.telegram',
            'com.telegram',
            'com.reddit',
            'com.linkedin',
            'notice',
            'keywords',
            'vnd.twitter',
            'vnd.github',
          ],
          coins: [60, 0, 2, 3], // ETH, BTC, LTC, DOGE
          contentHash: true,
        }).catch((error) => {
          console.error('Error fetching records for', normalizedName, ':', error)
          // Don't return null immediately - let other calls succeed
          // This allows partial data to be returned
          return null
        }),
        getOwner(publicClient, { name: normalizedName }).catch((error) => {
          console.error('Error fetching owner:', error)
          return null
        }),
        getExpiry(publicClient, { name: normalizedName }).catch((error) => {
          console.error('Error fetching expiry:', error)
          return null
        }),
        getResolver(publicClient, { name: normalizedName }).catch((error) => {
          console.error('Error fetching resolver:', error)
          return null
        }),
        getWrapperData(publicClient, { name: normalizedName }).catch((error) => {
          console.error('Error fetching wrapper data:', error)
          return null
        }),
        getAbiRecord(publicClient, { name: normalizedName }).catch(() => {
          // ABI records are rare, so we silently fail
          if (process.env.NODE_ENV === 'development') {
            console.log('No ABI record found for', normalizedName)
          }
          return null
        }),
      ])

      // Extract resolver information
      const resolverAddress = resolver || records?.resolverAddress || null
      const resolverType = resolverAddress === '0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63'
        ? 'Public Resolver'
        : resolverAddress
          ? 'Custom Resolver'
          : null

      // Convert records arrays to objects for easier access
      const texts: Record<string, string> = {}
      if (records?.texts) {
        for (const text of records.texts) {
          texts[text.key] = text.value
        }
      }
      
      // Debug logging in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Fetched records for', normalizedName, ':', {
          texts,
          recordsCount: records?.texts?.length || 0,
          resolver: resolver || records?.resolverAddress,
        })
      }

      const coins: Record<string, string> = {}
      if (records?.coins) {
        for (const coin of records.coins) {
          coins[coin.id.toString()] = coin.value
        }
      }

      // Extract content hash information
      let contentHashInfo: ContentHashInfo | null = null
      if (records?.contentHash) {
        const protocolType = records.contentHash.protocolType as ContentHashInfo['protocolType']
        contentHashInfo = {
          protocolType,
          decoded: records.contentHash.decoded || '',
        }
      }

      // Extract ABI record
      let abiRecordData: AbiRecord | null = null
      if (abiRecord) {
        try {
          const parsedAbi = typeof abiRecord.decoded === 'string' 
            ? JSON.parse(abiRecord.decoded) 
            : abiRecord.decoded
          
          abiRecordData = {
            contentType: abiRecord.contentType || 0,
            decoded: typeof abiRecord.decoded === 'string' ? abiRecord.decoded : JSON.stringify(abiRecord.decoded),
            abi: parsedAbi,
          }
        } catch (error) {
          console.error('Error parsing ABI:', error)
          // Still include the raw decoded value
          abiRecordData = {
            contentType: abiRecord.contentType || 0,
            decoded: typeof abiRecord.decoded === 'string' ? abiRecord.decoded : JSON.stringify(abiRecord.decoded),
            abi: null,
          }
        }
      }

      // Extract expiry information
      const expiryDate = expiry?.expiry ? Number(expiry.expiry.value) : null
      const registrationDate = null // Not available in getExpiry return type
      const gracePeriodEndDate = expiry?.expiry && expiry.gracePeriod
        ? Number(expiry.expiry.value) + expiry.gracePeriod
        : null

      // Extract owner information
      const ownerAddress = owner?.owner || null
      const registrantAddress = owner?.registrant || null
      const managerAddress = null // Not available in getOwner return type

      // Determine if wrapped
      const isWrapped = wrapperData !== null

      // Fetch subnames (from subgraph, may fail silently)
      let subnames: Subname[] = []
      try {
        const subnamesData = await getSubnames(publicClient, {
          name: normalizedName,
          pageSize: 100,
          allowExpired: false,
          allowDeleted: false,
        })
        
        subnames = subnamesData.map((subname) => ({
          id: subname.id,
          name: subname.name,
          truncatedName: subname.truncatedName,
          labelName: subname.labelName,
          owner: subname.owner,
          registrant: subname.registrant || null,
          createdAt: subname.createdAt ? Number(subname.createdAt.value) : null,
          registrationDate: subname.registrationDate ? Number(subname.registrationDate.value) : null,
          expiryDate: subname.expiryDate ? Number(subname.expiryDate.value) : null,
          resolvedAddress: subname.resolvedAddress || null,
        }))
      } catch (error) {
        // Subgraph may not be available or may fail, silently continue
        if (process.env.NODE_ENV === 'development') {
          console.log('Could not fetch subnames for', normalizedName, ':', error)
        }
      }

      return {
        name: normalizedName,
        normalizedName,
        beautifiedName: name,
        owner: ownerAddress,
        registrant: registrantAddress,
        manager: managerAddress,
        registrationDate,
        expiryDate,
        gracePeriodEndDate,
        resolverAddress,
        resolverType,
        resolverVersion: null, // Will be fetched separately if needed
        texts,
        coins,
        contentHash: records?.contentHash?.decoded || null, // Keep for backward compatibility
        contentHashInfo,
        abiRecord: abiRecordData,
        subnames,
        isWrapped,
        fuses: wrapperData?.fuses ? {
          parent: wrapperData.fuses.parent as unknown as Record<string, boolean>,
          child: wrapperData.fuses.child as unknown as Record<string, boolean>,
        } : undefined,
        tokenId: undefined, // Not available in getWrapperData return type
      }
    } catch (error) {
      console.error('Error fetching domain details:', error)
      throw new Error(`Failed to fetch domain details: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  static extractProfile(details: DomainDetails): DomainProfile {
    return {
      displayName: details.texts?.['name'] || details.beautifiedName,
      bio: details.texts?.description,
      email: details.texts?.email,
      phone: details.texts?.phone,
      location: details.texts?.location,
      website: details.texts?.url,
      avatar: details.texts?.avatar,
      socialLinks: {
        twitter: details.texts?.['com.twitter'],
        github: details.texts?.['com.github'],
        discord: details.texts?.['com.discord'],
        telegram: details.texts?.['org.telegram'] || details.texts?.['com.telegram'],
        reddit: details.texts?.['com.reddit'],
        linkedin: details.texts?.['com.linkedin'],
      },
    }
  }
}
