import { DomainView } from '@/components/domain/DomainView'

interface DomainPageProps {
  params: Promise<{ name: string }>
}

export default async function DomainPage({ params }: DomainPageProps) {
  const { name } = await params
  return <DomainView domainName={decodeURIComponent(name)} />
}
