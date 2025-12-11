'use client'

import { publicClient } from '@/lib/ens-client'
import type { FC } from 'react'
import { useEffect, useState } from 'react'
import { normalize } from 'viem/ens'

interface AvatarDisplayProps {
  avatar?: string
  name: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export const AvatarDisplay: FC<AvatarDisplayProps> = ({ avatar, name, size = 'md' }) => {
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)
  const [currentUrl, setCurrentUrl] = useState<string | null>(null)
  const [gatewayIndex, setGatewayIndex] = useState(0)

  const sizes = {
    sm: 'w-12 h-12 text-sm',
    md: 'w-20 h-20 text-lg',
    lg: 'w-32 h-32 text-2xl',
    xl: 'w-40 h-40 text-3xl',
  }

  const getInitials = (name: string) => {
    const parts = name.split('.')
    const firstPart = parts[0] || name
    return firstPart.slice(0, 2).toUpperCase()
  }

  // Multiple IPFS gateways for fallback
  const ipfsGateways = [
    'https://cloudflare-ipfs.com/ipfs/',
    'https://ipfs.io/ipfs/',
    'https://gateway.pinata.cloud/ipfs/',
    'https://dweb.link/ipfs/',
  ]

  const getAvatarUrl = (gatewayIdx = 0): string | null => {
    if (!avatar) return null

    // Handle IPFS URLs
    if (avatar.startsWith('ipfs://')) {
      const cid = avatar.replace('ipfs://', '').replace(/^\/+/, '')
      if (gatewayIdx < ipfsGateways.length) {
        return `${ipfsGateways[gatewayIdx]}${cid}`
      }
      return null
    }

    // Handle IPNS URLs
    if (avatar.startsWith('ipns://')) {
      const ipns = avatar.replace('ipns://', '').replace(/^\/+/, '')
      return `https://cloudflare-ipfs.com/ipns/${ipns}`
    }

    // Handle NFT avatars (eip155 format) - will be resolved asynchronously
    if (avatar.startsWith('eip155:')) {
      // Return null here, we'll handle it in useEffect
      return null
    }

    // Handle HTTP/HTTPS URLs
    if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
      return avatar
    }

    return null
  }

  useEffect(() => {
    let isMounted = true

    const loadAvatar = async () => {
      setImageError(false)
      setImageLoading(true)

      try {
        // Use viem's getEnsAvatar which handles all avatar types (NFT, IPFS, HTTP)
        const normalizedName = normalize(name)
        const avatarUrl = await publicClient.getEnsAvatar({
          name: normalizedName,
        })

        if (isMounted) {
          if (avatarUrl) {
            setCurrentUrl(avatarUrl)
            setGatewayIndex(0)
            if (process.env.NODE_ENV === 'development') {
              console.log('Resolved avatar URL:', avatarUrl)
            }
          } else {
            // Fallback to avatar text record if getEnsAvatar returns null
            const url = getAvatarUrl(0)
            setCurrentUrl(url)
            setGatewayIndex(0)
            if (!url) {
              setImageError(true)
              setImageLoading(false)
            }
          }
        }
      } catch (error) {
        if (isMounted) {
          if (process.env.NODE_ENV === 'development') {
            console.error('Error loading avatar:', error)
          }
          // Fallback to avatar text record
          const url = getAvatarUrl(0)
          setCurrentUrl(url)
          setGatewayIndex(0)
          if (!url) {
            setImageError(true)
            setImageLoading(false)
          }
        }
      }
    }

    loadAvatar()

    return () => {
      isMounted = false
    }
  }, [name, avatar])

  const handleImageError = () => {
    // Try next IPFS gateway if available and current URL is from IPFS
    if (
      currentUrl &&
      (currentUrl.includes('/ipfs/') || currentUrl.includes('ipfs://')) &&
      gatewayIndex < ipfsGateways.length - 1
    ) {
      const nextIndex = gatewayIndex + 1
      setGatewayIndex(nextIndex)
      // Extract CID from current URL and try next gateway
      const cidMatch =
        currentUrl.match(/ipfs\/([a-zA-Z0-9]+)/) || currentUrl.match(/ipfs:\/\/([a-zA-Z0-9]+)/)
      if (cidMatch) {
        const cid = cidMatch[1]
        setCurrentUrl(`${ipfsGateways[nextIndex]}${cid}`)
        setImageLoading(true)
        return
      }
    }
    // Fallback to avatar text record if available
    if (avatar) {
      const url = getAvatarUrl(0)
      if (url && url !== currentUrl) {
        setCurrentUrl(url)
        setGatewayIndex(0)
        setImageLoading(true)
        return
      }
    }
    setImageError(true)
    setImageLoading(false)
  }

  const handleImageLoad = () => {
    setImageLoading(false)
    setImageError(false)
  }

  const showImage = currentUrl && !imageError

  return (
    <div
      className={`${sizes[size]} rounded-full flex items-center justify-center bg-gradient-to-br from-primary-400 to-primary-600 text-white font-semibold overflow-hidden flex-shrink-0 relative`}
    >
      {showImage ? (
        <>
          {imageLoading && (
            <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-full" />
          )}
          <img
            src={currentUrl}
            alt={`${name} avatar`}
            className="w-full h-full object-cover rounded-full"
            onError={handleImageError}
            onLoad={handleImageLoad}
            style={{ display: imageLoading ? 'none' : 'block' }}
          />
        </>
      ) : (
        <span className="relative z-10">{getInitials(name)}</span>
      )}
    </div>
  )
}
