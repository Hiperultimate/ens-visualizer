import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Header } from './components/layout/Header'
import { HomePage } from './components/layout/HomePage'
import { DomainView } from './components/domain/DomainView'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 2,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Header />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/domain/:name" element={<DomainViewWrapper />} />
          </Routes>
        </div>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

function DomainViewWrapper() {
  const { name } = useParams<{ name: string }>()
  return <DomainView domainName={name || ''} />
}

export default App

