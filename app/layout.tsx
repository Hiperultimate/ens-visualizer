import type { Metadata } from 'next'
import { QueryProvider } from '@/components/providers/QueryProvider'
import { Header } from '@/components/layout/Header'
import './globals.css'

export const metadata: Metadata = {
  title: 'ENS Network - Explore ENS Domains',
  description: 'Explore and visualize ENS domain relationships',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <QueryProvider>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Header />
            {children}
          </div>
        </QueryProvider>
      </body>
    </html>
  )
}

