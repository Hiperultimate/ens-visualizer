import { useEffect, useState } from 'react'

const USER_ID_STORAGE_KEY = 'ens_network_user_id'

export function useUserId() {
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Get userId from localStorage or create a new one
    const storedUserId = localStorage.getItem(USER_ID_STORAGE_KEY)

    if (storedUserId) {
      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      if (uuidRegex.test(storedUserId)) {
        setUserId(storedUserId)
        setIsLoading(false)
        // Ensure user exists in backend
        fetch(`/api/users?userId=${storedUserId}`)
          .then((res) => res.json())
          .catch(() => {
            // Silently fail - user will be created on first API call
          })
        return
      }
    }

    // Create new user
    fetch('/api/users', { method: 'POST' })
      .then((res) => res.json())
      .then((data) => {
        if (data.userId) {
          localStorage.setItem(USER_ID_STORAGE_KEY, data.userId)
          setUserId(data.userId)
        }
      })
      .catch((error) => {
        console.error('Failed to create user:', error)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  return { userId, isLoading }
}
