import { publicClient } from '@/lib/ens-client'
import type { AbiRecord, ContentHashInfo, DomainDetails, DomainProfile, Subname } from '@/types/ens'
import {
  getAbiRecord,
  getExpiry,
  getOwner,
  getRecords,
  getResolver,
  getWrapperData,
} from '@ensdomains/ensjs/public'
import { getSubnames } from '@ensdomains/ensjs/subgraph'
import { normalize } from 'viem/ens'

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
          return null
        }),
      ])

      // Extract resolver information
      const resolverAddress = resolver || records?.resolverAddress || null
      const resolverType =
        resolverAddress === '0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63'
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
          const parsedAbi =
            typeof abiRecord.decoded === 'string'
              ? JSON.parse(abiRecord.decoded)
              : abiRecord.decoded

          abiRecordData = {
            contentType: abiRecord.contentType || 0,
            decoded:
              typeof abiRecord.decoded === 'string'
                ? abiRecord.decoded
                : JSON.stringify(abiRecord.decoded),
            abi: parsedAbi,
          }
        } catch (error) {
          console.error('Error parsing ABI:', error)
          // Still include the raw decoded value
          abiRecordData = {
            contentType: abiRecord.contentType || 0,
            decoded:
              typeof abiRecord.decoded === 'string'
                ? abiRecord.decoded
                : JSON.stringify(abiRecord.decoded),
            abi: null,
          }
        }
      }

      // Extract expiry information
      const expiryDate = expiry?.expiry ? Number(expiry.expiry.value) : null

      // Calculate registration date from expiry date
      // For .eth 2LD domains, we estimate registration date from expiry
      // Note: This is an approximation - domains can be renewed, so the actual
      // registration date may be earlier. For exact dates, we'd need to query
      // the NameRegistered event from the ENS Base Registrar contract.
      let registrationDate: number | null = null
      if (expiryDate) {
        // Check if this is a .eth 2LD domain
        const isEth2LD = normalizedName.split('.').length === 2 && normalizedName.endsWith('.eth')

        if (isEth2LD) {
          // Standard .eth registration period is 1 year (31536000 seconds)
          // Calculate registration date: expiry - 1 year
          // This works for initial registrations, but may be inaccurate for renewed domains
          const oneYearInSeconds = 31536000
          registrationDate = expiryDate - oneYearInSeconds

          // Ensure we don't get a negative or unreasonable date
          // Minimum reasonable date: January 1, 2017 (ENS launch)
          const ensLaunchDate = 1483228800 // Jan 1, 2017
          if (registrationDate < ensLaunchDate) {
            registrationDate = null // Invalid date, likely a renewed domain
          }
        }
      }

      const gracePeriodEndDate =
        expiry?.expiry && expiry.gracePeriod
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
          registrationDate: subname.registrationDate
            ? Number(subname.registrationDate.value)
            : null,
          expiryDate: subname.expiryDate ? Number(subname.expiryDate.value) : null,
          resolvedAddress: subname.resolvedAddress || null,
        }))
      } catch (error) {
        // Subgraph may not be available or may fail, silently continue
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
        fuses: wrapperData?.fuses
          ? {
              parent: wrapperData.fuses.parent as unknown as Record<string, boolean>,
              child: wrapperData.fuses.child as unknown as Record<string, boolean>,
            }
          : undefined,
        tokenId: undefined, // Not available in getWrapperData return type
      }
    } catch (error) {
      console.error('Error fetching domain details:', error)
      throw new Error(
        `Failed to fetch domain details: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }

  static extractProfile(details: DomainDetails): DomainProfile {
    return {
      displayName: details.texts?.name || details.beautifiedName,
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
