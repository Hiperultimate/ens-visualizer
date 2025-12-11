'use client'

import type { FC } from 'react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export const HomePage: FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/domain/${searchQuery.trim()}`)
    }
  }

  const exampleDomains = ['vitalik.eth', 'ens.eth', 'ethereum.eth']

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-500 to-primary-700 dark:from-primary-600 dark:to-primary-800 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Explore ENS Domains
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-primary-100">
            Discover domain information, profiles, and relationships
          </p>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ENS domain (e.g., vitalik.eth)"
                className="w-full px-6 py-4 pl-12 pr-4 text-gray-900 text-lg rounded-lg focus:outline-none focus:ring-4 focus:ring-primary-300"
              />
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg
                  className="h-6 w-6 text-gray-400"
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
        </div>
      </div>

      {/* Featured Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Example Domains
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {exampleDomains.map((domain) => (
              <button
                key={domain}
                onClick={() => router.push(`/domain/${domain}`)}
                className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow text-left"
              >
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  {domain}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Click to explore
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Start Guide */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Quick Start Guide
          </h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <div>
              <h3 className="font-semibold mb-2">1. Search for a Domain</h3>
              <p>Enter an ENS domain name in the search bar above (e.g., vitalik.eth)</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">2. View Domain Information</h3>
              <p>See comprehensive domain details including owner, registration, and resolver information</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">3. Explore Profile</h3>
              <p>View user profile with avatar, bio, contact information, and social media links</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

