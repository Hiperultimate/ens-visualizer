'use client'

import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { publicClient } from '@/lib/ens-client'
import { getOwner } from '@ensdomains/ensjs/public'
import { useCallback, useEffect, useRef, useState } from 'react'
import { normalize } from 'viem/ens'

interface ENSSearchInputProps {
  onSelect: (ensName: string) => void
  disabled?: boolean
}

export function ENSSearchInput({ onSelect, disabled }: ENSSearchInputProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isValidating, setIsValidating] = useState(false)
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const currentQueryRef = useRef<string>('')

  // Simple check if ENS name exists (just checks owner, much faster)
  const checkENSExists = useCallback(async (name: string): Promise<boolean> => {
    try {
      const normalizedName = normalize(name)
      const owner = await getOwner(publicClient, { name: normalizedName })
      // If owner exists, the domain exists
      return !!owner?.owner
    } catch (_error) {
      return false
    }
  }, [])

  const validateENSName = useCallback(
    async (name: string) => {
      if (!name.trim()) {
        setIsValid(null)
        setError(null)
        setIsValidating(false)
        return
      }

      setError(null)

      try {
        // Normalize the name first
        const normalizedName = normalize(name)

        // Just check if domain exists (much faster than fetching all details)
        const exists = await checkENSExists(normalizedName)

        // Only update state if the search query still matches what we're validating
        // This prevents race conditions where user types while validation is running
        if (currentQueryRef.current.trim() === name.trim()) {
          if (exists) {
            setIsValid(true)
            setError(null)
          } else {
            setIsValid(false)
            setError('ENS name not found')
          }
        }
      } catch (error) {
        // Only update state if the search query still matches
        if (currentQueryRef.current.trim() === name.trim()) {
          setIsValid(false)
          setError(error instanceof Error ? error.message : 'Invalid ENS name or domain not found')
        }
      } finally {
        // Only clear validating if this validation is still relevant
        if (currentQueryRef.current.trim() === name.trim()) {
          setIsValidating(false)
        }
      }
    },
    [checkENSExists],
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Update input value immediately - never block typing
    setSearchQuery(value)
    currentQueryRef.current = value // Keep ref in sync

    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
      debounceTimeoutRef.current = null
    }

    // Reset validation state when user is typing
    setIsValid(null)
    setError(null)
    setIsValidating(false)

    // Don't validate if input is empty
    if (!value.trim()) {
      return
    }

    // Debounce validation - only validate after user stops typing for 800ms
    // This runs asynchronously and doesn't block typing at all
    debounceTimeoutRef.current = setTimeout(() => {
      // Check if the value is still the same (user stopped typing)
      const valueToValidate = currentQueryRef.current.trim()

      if (valueToValidate && valueToValidate === value.trim()) {
        setIsValidating(true)
        validateENSName(valueToValidate).catch((error) => {
          console.error('Validation error:', error)
          setIsValidating(false)
        })
      }
    }, 800)
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [])

  const handleSelect = useCallback(() => {
    if (isValid && searchQuery.trim()) {
      try {
        const normalizedName = normalize(searchQuery.trim())
        onSelect(normalizedName)
        // Reset state after selection
        setSearchQuery('')
        setIsValid(null)
        setError(null)
        setIsValidating(false)
      } catch (_error) {
        setError('Invalid ENS name format')
        setIsValid(false)
      }
    }
  }, [isValid, searchQuery, onSelect])

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && isValid && searchQuery.trim() && !isValidating) {
      e.preventDefault()
      handleSelect()
    }
  }

  return (
    <div className="w-full">
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Search ENS name (e.g., vitalik.eth)"
          disabled={disabled}
          className={`w-full px-4 py-2 pr-20 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
            isValid === true
              ? 'border-green-500 dark:border-green-400'
              : isValid === false
                ? 'border-red-500 dark:border-red-400'
                : 'border-gray-300 dark:border-gray-600'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 gap-2">
          {isValidating && (
            <div className="w-5 h-5">
              <LoadingSpinner size="sm" />
            </div>
          )}
          {isValid === true && !isValidating && (
            <button
              onClick={handleSelect}
              disabled={disabled}
              className="px-3 py-1 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add
            </button>
          )}
        </div>
      </div>
      {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
      {isValid === true && !error && (
        <p className="mt-1 text-sm text-green-600 dark:text-green-400">
          Valid ENS name - Click "Add" or press Enter
        </p>
      )}
    </div>
  )
}
