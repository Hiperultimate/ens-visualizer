'use client'

import { useRouter } from 'next/navigation'
import type { FC } from 'react'
import { useEffect, useState } from 'react'

export const Header: FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/domain/${searchQuery.trim()}`)
    }
  }

  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark')
    localStorage.setItem(
      'theme',
      document.documentElement.classList.contains('dark') ? 'dark' : 'light',
    )
  }

  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    if (
      savedTheme === 'dark' ||
      (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
      document.documentElement.classList.add('dark')
    }
  }, [])

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Navigation */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => router.push('/')}
              className="text-xl font-bold text-primary-600 dark:text-primary-400"
            >
              ENS Network
            </button>
            <nav className="hidden md:flex items-center gap-4">
              <button
                onClick={() => router.push('/')}
                className="text-sm text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                Home
              </button>
              <button
                onClick={() => router.push('/network')}
                className="text-sm text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                Network Graph
              </button>
            </nav>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-4">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ENS domain (e.g., vitalik.eth)"
                className="w-full px-4 py-2 pl-10 pr-4 text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </form>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle theme"
          >
            <svg
              className="w-5 h-5 text-gray-600 dark:text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}
