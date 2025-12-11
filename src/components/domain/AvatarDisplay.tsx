import type { FC } from 'react'
import { useState, useEffect } from 'react'

interface AvatarDisplayProps {
  avatar?: string
  name: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export const AvatarDisplay: FC<AvatarDisplayProps> = ({
  avatar,
  name,
  size = 'md',
}) => {
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
    
    // Handle NFT avatars (eip155 format) - eip155:1/erc721:0x.../123
    if (avatar.startsWith('eip155:')) {
      // For POC, we'll try to extract and use a placeholder
      // Full NFT avatar resolution would require additional service
      return null
    }
    
    // Handle HTTP/HTTPS URLs
    if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
      return avatar
    }
    
    return null
  }

  useEffect(() => {
    if (avatar) {
      setImageError(false)
      setImageLoading(true)
      const url = getAvatarUrl(0)
      setCurrentUrl(url)
      setGatewayIndex(0)
      // Debug logging (remove in production)
      if (import.meta.env.DEV) {
        console.log('Avatar value:', avatar)
        console.log('Generated URL:', url)
      }
      // If no URL could be generated, mark as error immediately
      if (!url) {
        setImageError(true)
        setImageLoading(false)
      }
    } else {
      setCurrentUrl(null)
      setImageLoading(false)
      setImageError(false)
    }
  }, [avatar])

  const handleImageError = () => {
    // Try next IPFS gateway if available
    if (avatar?.startsWith('ipfs://') && gatewayIndex < ipfsGateways.length - 1) {
      const nextIndex = gatewayIndex + 1
      setGatewayIndex(nextIndex)
      setCurrentUrl(getAvatarUrl(nextIndex))
      setImageLoading(true)
    } else {
      setImageError(true)
      setImageLoading(false)
    }
  }

  const handleImageLoad = () => {
    setImageLoading(false)
    setImageError(false)
  }

  const showImage = currentUrl && !imageError

  return (
    <div className={`${sizes[size]} rounded-full flex items-center justify-center bg-gradient-to-br from-primary-400 to-primary-600 text-white font-semibold overflow-hidden flex-shrink-0 relative`}>
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
            crossOrigin="anonymous"
          />
        </>
      ) : (
        <span className="relative z-10">{getInitials(name)}</span>
      )}
    </div>
  )
}

