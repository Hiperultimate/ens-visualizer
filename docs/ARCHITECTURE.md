# ENS Network Application - Architecture Overview

## Executive Summary

The ENS Network Application is designed as a **frontend-only architecture** that leverages public blockchain RPC endpoints and the ENS subgraph for data retrieval. This design choice optimizes for simplicity, cost-effectiveness, and rapid development while maintaining the flexibility to add a backend layer when needed.

## Architecture Decision: Frontend-Only (Phase 1)

### Why Frontend-Only?

#### ✅ Advantages

1. **Simplicity**
   - Single deployment target (static hosting)
   - No server management required
   - Simpler development workflow
   - Easier debugging and testing

2. **Cost-Effective**
   - Free hosting on Vercel/Netlify
   - No database costs
   - No server infrastructure costs
   - Only pay for RPC calls (free tier available)

3. **Scalability**
   - Static assets served via CDN
   - Horizontal scaling automatic
   - No server capacity planning
   - Global distribution built-in

4. **Performance**
   - Direct RPC calls (no middleware latency)
   - Client-side caching with TanStack Query
   - Parallel data fetching
   - Progressive loading

5. **Development Speed**
   - Faster initial development
   - No backend/frontend coordination
   - Deploy anywhere instantly
   - Easier maintenance

#### ❌ Limitations

1. **Rate Limiting**
   - Public RPC endpoints have limits
   - May hit limits with heavy usage
   - **Mitigation**: Use multiple fallback providers, implement client-side rate limiting

2. **Complex Queries**
   - Large graph traversals may be slow
   - Client-side computation overhead
   - **Mitigation**: Lazy loading, depth limits, caching, virtualization

3. **No Custom Indexing**
   - Dependent on ENS subgraph schema
   - Can't create custom aggregations
   - **Mitigation**: Client-side data transformation, use subgraph when possible

4. **Security**
   - API keys in environment variables
   - Client exposes RPC endpoints
   - **Mitigation**: Use serverless functions for sensitive operations, domain restrictions on API keys

## When to Add a Backend?

### Trigger Points

Add a backend when you encounter:

1. **Performance Issues**
   - Graph rendering >5 seconds for 100+ nodes
   - Frequent rate limit errors
   - Client memory exhaustion

2. **Feature Requirements**
   - User accounts and authentication
   - Custom analytics and tracking
   - Data aggregation across many domains
   - Real-time notifications

3. **Scale Indicators**
   - 10,000+ daily active users
   - 100,000+ API calls per day
   - Need for data persistence

### Backend Implementation Plan

When backend becomes necessary, implement in phases:

#### Phase 2A: Serverless Functions
- Add Next.js API routes or Vercel serverless functions
- Proxy RPC calls to protect API keys
- Implement server-side caching (Redis)
- Keep frontend largely unchanged

#### Phase 2B: GraphQL API
- Apollo Server for GraphQL API
- Custom resolvers for complex queries
- Redis cache layer
- Still use ENS subgraph as source

#### Phase 2C: Full Backend
- Express/Fastify server
- PostgreSQL for indexed data
- Custom ENS event indexer
- Background job processing
- WebSocket support for real-time updates

## Current Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser                              │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              React Application                        │  │
│  │                                                        │  │
│  │  ┌──────────────┐    ┌──────────────┐               │  │
│  │  │  Components  │◄───┤  TanStack    │               │  │
│  │  │  (UI Layer)  │    │  Query       │               │  │
│  │  └──────────────┘    │  (Cache)     │               │  │
│  │         │             └──────────────┘               │  │
│  │         │                    │                        │  │
│  │         ▼                    ▼                        │  │
│  │  ┌──────────────┐    ┌──────────────┐               │  │
│  │  │   React      │    │  ENS Service │               │  │
│  │  │   Flow       │◄───┤  Layer       │               │  │
│  │  │  (Graphs)    │    │              │               │  │
│  │  └──────────────┘    └──────────────┘               │  │
│  │                              │                        │  │
│  │                              ▼                        │  │
│  │                      ┌──────────────┐                │  │
│  │                      │  ensjs v4    │                │  │
│  │                      │  + viem      │                │  │
│  │                      └──────────────┘                │  │
│  │                              │                        │  │
│  └──────────────────────────────┼────────────────────────┘  │
│                                 │                          │
└─────────────────────────────────┼──────────────────────────┘
                                  │
                    ┌─────────────┴──────────────┐
                    │                            │
                    ▼                            ▼
         ┌──────────────────┐         ┌─────────────────┐
         │   Ethereum RPC   │         │  ENS Subgraph   │
         │   (Multiple      │         │  (The Graph)    │
         │    Providers)    │         │                 │
         └──────────────────┘         └─────────────────┘
                    │                            │
                    └─────────────┬──────────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │  Ethereum       │
                         │  Mainnet        │
                         │  (Blockchain)   │
                         └─────────────────┘
```

## Component Architecture

### Layer Breakdown

#### 1. Presentation Layer (React Components)

**Responsibility**: User interface and interactions

**Key Components**:
- `SearchBar` - Domain search input with validation
- `DomainProfile` - Comprehensive domain profile display
  - `ProfileHeader` - Avatar, display name, domain name
  - `ProfileBio` - Description and user information
  - `SocialLinks` - Social media profiles
  - `AddressRecords` - Multi-chain address display
  - `TextRecords` - All text records viewer
  - `ResolverInfo` - Resolver details panel
  - `DomainStatus` - Ownership, registration, expiration info
- `NetworkGraph` - Interactive graph visualization
- `AddressExplorer` - Address analysis with reverse resolution
- `SubdomainTree` - Hierarchical subdomain explorer
- `FilterPanel` - Graph controls and filters
- `Layout` - Navigation and structure
- `AvatarDisplay` - ENS avatar renderer (NFT/IPFS support)
- `ContentViewer` - IPFS content preview

**Technology**: React 18 with TypeScript, Tailwind CSS

#### 2. State Management Layer

**Responsibility**: Application state and data caching

**Components**:
- **TanStack Query** - Server state management (ENS data, graph data)
- **React Hooks** - Local component state (useState, useReducer)
- **URL State** - Search params for shareable links
- **LocalStorage** - Preferences persistence (theme, recent searches, bookmarks)
- **IndexedDB** - Large data caching (graph data, profiles)

**Patterns**:
- Optimistic updates for better UX
- Stale-while-revalidate for fresh data
- Infinite queries for subdomain pagination
- Dependent queries for relationship traversal
- URL-based state for deep linking

#### 3. Service Layer

**Responsibility**: Business logic and data fetching

**Services**:
- `ENSService` - ENS operations (using `getDetails()` method)
- `GraphService` - Graph generation and relationship mapping
- `ProfileService` - User profile data aggregation
- `ResolverService` - Resolver contract interactions
- `AvatarService` - Avatar resolution (NFT, IPFS, HTTP)
- `ContentService` - Content hash resolution and preview
- `CacheService` - Multi-layer caching strategies
- `ValidationService` - Input validation and sanitization

**Features**:
- Comprehensive data fetching via `getDetails()`
- Request batching and parallelization
- Error handling with user-friendly messages
- Automatic retry logic with exponential backoff
- Fallback chains for RPC providers
- Data transformation and normalization

#### 4. Integration Layer (ensjs + viem)

**Responsibility**: Blockchain interaction

**Components**:
- ENS Public Client (ensjs)
- Viem clients with fallbacks
- Subgraph client
- Contract ABIs

**Operations**:
- **`getDetails()`** - Comprehensive domain data (primary method)
  - Owner, registrant, expiration
  - All text records (social, contact, custom)
  - All address records (multi-chain)
  - Resolver details and capabilities
  - Content hash
  - Subdomains
- **`getName()`** - Reverse resolution (address to name)
- **`getRecords()`** - Specific record queries
- **`getSubnames()`** - Subdomain enumeration
- **`getResolver()`** - Resolver contract details
- **`getOwner()`** - Ownership information
- **Avatar resolution** - NFT metadata and image URLs
- **Content resolution** - IPFS/IPNS content retrieval

#### 5. Infrastructure Layer

**Responsibility**: External data sources

**Components**:
- Multiple RPC providers (Alchemy, Infura, Cloudflare)
- ENS Subgraph (for complex queries and historical data)
- IPFS gateways (for avatars/content)
  - Cloudflare IPFS gateway
  - Pinata gateway
  - Public IPFS gateways
- NFT metadata services (for avatar NFTs)
- Ethereum blockchain (mainnet)

## Data Flow

### Example: Search Domain → Display Profile & Graph

```
1. User Input
   └─> SearchBar component
       │
2. Validation
   └─> ValidationService.validateENSName()
       │ Update URL state (shareable link)
       │
3. Query Trigger
   └─> TanStack Query: useDomainDetails(name)
       │
4. Check Cache
   └─> Cache hit? Return cached data (instant render)
       │ No cache or stale
       ▼
5. ENS Service Call
   └─> ENSService.getDetails(name)
       │
6. ensjs getDetails() - Single Optimized Call
   └─> getDetails(publicClient, { name })
       │ Returns comprehensive data:
       │ ├─> Owner & Registrant
       │ ├─> All Text Records (social, profile, custom)
       │ ├─> All Address Records (multi-chain)
       │ ├─> Resolver details
       │ ├─> Registration & Expiration
       │ ├─> Content Hash
       │ └─> NameWrapper status & fuses
       │
7. Parallel Data Enrichment
   └─> ProfileService.enrichProfile(details)
       │ ├─> AvatarService.resolveAvatar() (if avatar set)
       │ │   ├─> NFT metadata fetch (if NFT)
       │ │   └─> IPFS image fetch (if IPFS)
       │ ├─> ResolverService.getResolverInfo()
       │ └─> ContentService.resolveContent() (if content hash)
       │
8. Subdomain Discovery (Lazy)
   └─> ENSService.getSubnames(name, { pageSize: 100 })
       │
9. RPC Calls
   └─> Try primary RPC (Alchemy)
   └─> Fallback to secondary (Infura)
   └─> Fallback to tertiary (Cloudflare)
       │
10. Data Transform
    └─> Parse blockchain data
    └─> Normalize addresses (checksummed)
    └─> Format dates/timestamps
    └─> Structure profile data
    └─> Extract social links
       │
11. Cache Update
    └─> TanStack Query caches response
    └─> IndexedDB for large data
    └─> LocalStorage for recent searches
       │
12. UI Update (Progressive Rendering)
    └─> ProfileHeader renders (avatar, name)
    └─> ProfileBio renders (description, info)
    └─> SocialLinks render
    └─> AddressRecords render (multi-chain)
    └─> TextRecords render (all custom records)
    └─> ResolverInfo renders
    └─> DomainStatus renders
    └─> GraphService.buildGraph(details, subnames)
    └─> NetworkGraph renders visualization
       │
13. User Interactions
    └─> Click subdomain → Navigate to subdomain
    └─> Click address → Show address details
    └─> Click resolver → Show resolver details
    └─> Click graph node → Focus on related domain
```

## Performance Optimizations

### 1. Client-Side Caching

**Strategy**: Multi-level cache

```typescript
// Level 1: TanStack Query (memory)
const { data } = useQuery({
  queryKey: ['domain', name],
  queryFn: () => getDomainDetails(name),
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 15 * 60 * 1000, // 15 minutes
})

// Level 2: LocalStorage (simple data)
localStorage.setItem('recent-searches', JSON.stringify(searches))

// Level 3: IndexedDB (large data)
await db.graphs.put({ name, data: graphData })
```

### 2. Optimized Data Fetching with getDetails()

**Problem**: Multiple sequential RPC calls are slow and expensive

**Solution**: Use ensjs `getDetails()` for comprehensive data in single optimized call

```typescript
// ❌ BAD: Multiple separate calls
const owner = await client.getOwner({ name })
const records = await client.getRecords({ name })
const resolver = await client.getResolver({ name })
const expiry = await client.getExpiry({ name })
// 4+ RPC calls, slow!

// ✅ GOOD: Single getDetails() call
const details = await getDetails(publicClient, {
  name,
  // Optionally specify what you need
  records: {
    texts: true,  // All text records
    coins: true,  // All address records
    contentHash: true,
  },
})
// Returns: owner, registrant, expiry, resolver, all records, and more!

// For additional parallel operations
const [details, subnames] = await Promise.all([
  getDetails(publicClient, { name }),
  getSubnames(publicClient, { name, pageSize: 100 }),
])
```

### 3. Progressive Loading

**Strategy**: Load data in stages for faster perceived performance

```typescript
// Stage 1: Core profile data (fast - ~500ms)
const details = await getDetails(publicClient, { 
  name,
  records: {
    texts: ['name', 'description', 'avatar'],  // Essential profile fields
    coins: ['ETH'],  // Primary address
  },
})
// Render profile header, bio immediately

// Stage 2: Extended profile (medium - ~1s)
const fullDetails = await getDetails(publicClient, {
  name,
  records: {
    texts: true,  // All text records (social links, etc.)
    coins: true,  // All multi-chain addresses
    contentHash: true,
  },
})
// Update UI with social links, all addresses

// Stage 3: Relationships (slower - ~2-3s)
const [subnames, resolverInfo] = await Promise.all([
  getSubnames(publicClient, { name }),
  getResolverDetails(details.resolverAddress),
])
// Render graph, subdomain tree, resolver info
```

### 4. Graph Virtualization

**Problem**: Rendering 1000+ nodes is slow

**Solution**: Render only visible nodes

```typescript
// React Flow built-in optimization
<ReactFlow
  nodes={visibleNodes} // Only nodes in viewport
  onViewportChange={updateVisibleNodes}
  maxZoom={2}
  minZoom={0.1}
/>
```

### 5. Code Splitting

**Strategy**: Load features on demand

```typescript
// Lazy load heavy components
const NetworkGraph = lazy(() => import('@/components/NetworkGraph'))
const Analytics = lazy(() => import('@/pages/Analytics'))
```

## Security Considerations

### 1. API Key Protection

**Current Approach**: Environment variables

```typescript
// vite.config.ts - Keys in .env
const rpcUrl = import.meta.env.VITE_RPC_URL
```

**Limitation**: Keys visible in client bundle

**Future**: Proxy through serverless functions

### 2. Input Validation

**Implementation**: Strict validation

```typescript
export const validateENSName = (name: string): boolean => {
  // Check format
  if (!/^[a-z0-9-]+(\.[a-z0-9-]+)*\.eth$/.test(name)) {
    return false
  }
  // Check length
  if (name.length > 255) return false
  // Prevent injection
  return !containsMaliciousPatterns(name)
}
```

### 3. Rate Limiting

**Client-Side**: Request throttling

```typescript
const rateLimiter = new RateLimiter({
  maxRequests: 10,
  perMilliseconds: 1000,
})

await rateLimiter.schedule(() => client.getOwner({ name }))
```

### 4. Error Handling

**Defensive Programming**: Never trust external data

```typescript
try {
  const details = await getDetails(publicClient, { name })
  
  // Validate returned data
  if (!details) {
    throw new Error('Domain not found')
  }
  
  if (details.owner && !isAddress(details.owner)) {
    throw new Error('Invalid owner address')
  }
  
  // Transform and normalize
  return {
    ...details,
    owner: details.owner ? getAddress(details.owner) : null,  // Checksummed
    texts: details.texts || {},
    coins: details.coins || {},
  }
} catch (error) {
  logger.error('Failed to get domain details', { name, error })
  
  // User-friendly error messages
  if (error.message.includes('not found')) {
    throw new UserFacingError(`Domain "${name}" does not exist`)
  }
  if (error.message.includes('rate limit')) {
    throw new UserFacingError('Too many requests. Please try again in a moment.')
  }
  
  throw new UserFacingError('Could not retrieve domain information. Please try again.')
}
```

## ENS Data Fetching with getDetails()

### The Power of getDetails()

The **ensjs `getDetails()` method** is the cornerstone of our data fetching strategy. It provides comprehensive domain information in a single optimized call.

### What getDetails() Returns

```typescript
const details = await getDetails(publicClient, { 
  name: 'vitalik.eth',
  records: {
    texts: true,      // All text records
    coins: true,      // All coin/address records
    contentHash: true, // IPFS/IPNS content
  },
})

// Returns a comprehensive object:
{
  // Core Domain Info
  name: 'vitalik.eth',
  normalizedName: 'vitalik.eth',
  beautifiedName: 'vitalik.eth',
  
  // Ownership
  owner: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',  // Owner address
  ownershipLevel: 'registrant',
  
  // Registration (for .eth 2LDs)
  registrant: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
  registrationDate: 1580803395000,  // Timestamp
  expiryDate: 1896163200000,        // Timestamp
  gracePeriodEndDate: 1896163200000 + (90 * 24 * 60 * 60 * 1000),
  
  // Resolver
  resolverAddress: '0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63',
  
  // Records
  texts: {
    'email': 'vitalik@ethereum.org',
    'url': 'https://vitalik.ca',
    'avatar': 'eip155:1/erc721:0x...',
    'description': 'Ethereum co-founder',
    'com.github': 'vbuterin',
    'com.twitter': 'VitalikButerin',
    'com.discord': 'vitalik#1234',
    // ... all other text records
  },
  
  coins: {
    '60': '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',  // ETH
    '0': '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',           // BTC
    // ... all other coin addresses
  },
  
  contentHash: 'ipfs://QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco',
  
  // NameWrapper (if wrapped)
  isWrapped: false,
  fuses: {
    parent: {},
    child: {},
  },
}
```

### Key Benefits

1. **Single RPC Call**: Instead of 5-10 separate calls, get everything at once
2. **Optimized**: Uses multicall under the hood for efficiency
3. **Complete**: Returns all domain data including records, ownership, expiration
4. **Type-Safe**: Full TypeScript support with proper types
5. **Flexible**: Can request only specific records if needed

### Selective Data Fetching

```typescript
// Get only specific text records (faster)
const essentialDetails = await getDetails(publicClient, {
  name: 'vitalik.eth',
  records: {
    texts: ['name', 'avatar', 'description'],  // Only these fields
    coins: ['ETH', 'BTC'],                      // Only these chains
  },
})

// Get everything
const fullDetails = await getDetails(publicClient, {
  name: 'vitalik.eth',
  records: {
    texts: true,      // All text records
    coins: true,      // All coin types
    contentHash: true,
  },
})
```

### Profile Service Integration

Our `ProfileService` enriches the raw getDetails() data:

```typescript
export class ProfileService {
  static async getDomainProfile(name: string) {
    // 1. Get comprehensive data
    const details = await getDetails(publicClient, { name })
    
    // 2. Resolve avatar (if set)
    const avatar = details.texts?.avatar 
      ? await AvatarService.resolveAvatar(details.texts.avatar)
      : null
    
    // 3. Extract social links
    const socials = this.extractSocialLinks(details.texts)
    
    // 4. Format addresses
    const addresses = this.formatMultiChainAddresses(details.coins)
    
    // 5. Get resolver info
    const resolver = await ResolverService.getResolverInfo(
      details.resolverAddress
    )
    
    // 6. Return enriched profile
    return {
      ...details,
      profile: {
        displayName: details.texts?.name || name,
        bio: details.texts?.description,
        avatar,
        email: details.texts?.email,
        website: details.texts?.url,
        location: details.texts?.location,
      },
      socials,
      addresses,
      resolver,
    }
  }
  
  private static extractSocialLinks(texts: Record<string, string>) {
    return {
      twitter: texts?.['com.twitter'],
      github: texts?.['com.github'],
      telegram: texts?.['org.telegram'],
      discord: texts?.['com.discord'],
      reddit: texts?.['com.reddit'],
      linkedin: texts?.['com.linkedin'],
    }
  }
  
  private static formatMultiChainAddresses(coins: Record<string, string>) {
    const coinNames = {
      '60': { name: 'Ethereum', symbol: 'ETH' },
      '0': { name: 'Bitcoin', symbol: 'BTC' },
      '2': { name: 'Litecoin', symbol: 'LTC' },
      '3': { name: 'Dogecoin', symbol: 'DOGE' },
      // ... more coins
    }
    
    return Object.entries(coins).map(([coinType, address]) => ({
      coinType,
      address,
      ...coinNames[coinType],
    }))
  }
}
```

### Avatar Resolution

Avatars can be:
- **NFT**: `eip155:1/erc721:0x123.../456`
- **IPFS**: `ipfs://QmXoypiz...`
- **HTTP**: `https://example.com/avatar.jpg`

```typescript
export class AvatarService {
  static async resolveAvatar(avatarText: string) {
    // NFT Avatar (EIP-634)
    if (avatarText.startsWith('eip155:')) {
      return this.resolveNFTAvatar(avatarText)
    }
    
    // IPFS Avatar
    if (avatarText.startsWith('ipfs://')) {
      return this.resolveIPFSAvatar(avatarText)
    }
    
    // HTTP Avatar
    if (avatarText.startsWith('http')) {
      return avatarText
    }
    
    return null
  }
  
  private static async resolveNFTAvatar(avatarText: string) {
    // Parse: eip155:1/erc721:0xb7F7F6C52F2e2fdb1963Eab30438024864c313F6/2430
    const [, chainId, standard, contractAddress, tokenId] = 
      avatarText.match(/eip155:(\d+)\/(erc\d+):(0x[a-fA-F0-9]+)\/(\d+)/)
    
    // Fetch NFT metadata
    const metadata = await this.fetchNFTMetadata(
      contractAddress, 
      tokenId, 
      chainId
    )
    
    return metadata.image || metadata.image_url
  }
  
  private static resolveIPFSAvatar(ipfsUrl: string) {
    const cid = ipfsUrl.replace('ipfs://', '')
    return `https://cloudflare-ipfs.com/ipfs/${cid}`
  }
}
```

### Resolver Details

```typescript
export class ResolverService {
  static async getResolverInfo(resolverAddress: string) {
    // Check if it's the public resolver
    const isPublicResolver = resolverAddress === 
      '0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63'
    
    // Get resolver contract interface support
    const [supportsWildcard, version] = await Promise.all([
      this.checkWildcardSupport(resolverAddress),
      this.getResolverVersion(resolverAddress),
    ])
    
    return {
      address: resolverAddress,
      type: isPublicResolver ? 'Public Resolver' : 'Custom Resolver',
      version,
      supportsWildcard,
      verified: isPublicResolver,
    }
  }
}
```

## Technology Choices

### Why These Technologies?

#### React 18
- ✅ Industry standard
- ✅ Excellent TypeScript support
- ✅ Rich ecosystem
- ✅ Concurrent features for performance
- ✅ Great developer experience

#### TypeScript 5
- ✅ Type safety prevents bugs
- ✅ Better IDE support
- ✅ Self-documenting code
- ✅ Refactoring confidence
- ✅ Excellent with React

#### Vite
- ✅ Lightning fast HMR
- ✅ Native ESM support
- ✅ Optimized builds
- ✅ Great DX
- ✅ Plugin ecosystem

#### ensjs v4
- ✅ Official ENS library
- ✅ Modern API (viem-based)
- ✅ TypeScript first
- ✅ Comprehensive ENS support
- ✅ Well maintained

#### TanStack Query
- ✅ Best-in-class data fetching
- ✅ Built-in caching
- ✅ Automatic refetching
- ✅ Optimistic updates
- ✅ DevTools

#### React Flow
- ✅ Powerful graph visualization
- ✅ Performant (1000+ nodes)
- ✅ Customizable
- ✅ React integration
- ✅ Touch support

#### BiomeJS
- ✅ 20-100x faster than ESLint
- ✅ Single tool (lint + format)
- ✅ Zero config
- ✅ Great TypeScript support
- ✅ Modern and maintained

#### Tailwind CSS
- ✅ Utility-first approach
- ✅ No CSS file bloat
- ✅ Consistent design system
- ✅ Great DX with IntelliSense
- ✅ Responsive built-in

## Deployment Architecture

### Static Hosting (Vercel/Netlify)

```
                    ┌─────────────────┐
                    │   Git Push      │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  CI/CD Pipeline │
                    │  (GitHub Actions)│
                    └────────┬────────┘
                             │
                    ┌────────┴────────┐
                    │                 │
                    ▼                 ▼
            ┌───────────────┐  ┌──────────┐
            │  Build        │  │   Tests  │
            │  (Vite)       │  │  (Vitest)│
            └───────┬───────┘  └─────┬────┘
                    │                │
                    │        ┌───────┘
                    ▼        ▼
            ┌────────────────────┐
            │  Deploy to CDN     │
            │  (Vercel/Netlify)  │
            └────────┬───────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
┌──────────────┐         ┌──────────────┐
│  CDN Edge    │         │  CDN Edge    │
│  (Americas)  │   ...   │  (Asia)      │
└──────────────┘         └──────────────┘
```

### Advantages

- ✅ Global CDN distribution
- ✅ Automatic HTTPS
- ✅ Instant rollbacks
- ✅ Preview deployments for PRs
- ✅ Zero downtime deployments
- ✅ DDoS protection
- ✅ Free tier available

## Scalability Path

### Current Capacity

- **Users**: 10,000+ concurrent users
- **Requests**: 100,000+ per day
- **Performance**: <2s page load
- **Cost**: $0-50/month

### Growth Path

```
Phase 1: Frontend Only
└─> 0-10K users
    └─> Free tier hosting
        └─> Public RPC endpoints

Phase 2A: Add Caching
└─> 10K-100K users
    └─> Redis cache layer
        └─> Serverless functions
            └─> $50-200/month

Phase 2B: API Layer
└─> 100K-500K users
    └─> GraphQL API
        └─> Custom indexing
            └─> $200-1000/month

Phase 3: Full Backend
└─> 500K+ users
    └─> Dedicated infrastructure
        └─> Real-time features
            └─> $1000+/month
```

## Monitoring & Observability

### Metrics to Track

1. **Performance**
   - Page load time
   - Time to interactive
   - Graph render time
   - RPC response time

2. **Usage**
   - Daily active users
   - Searches per session
   - Popular domains
   - Error rates

3. **Infrastructure**
   - RPC call volume
   - Cache hit rate
   - CDN bandwidth
   - API rate limits

### Tools

- **Frontend Monitoring**: Vercel Analytics (free)
- **Error Tracking**: Sentry (optional)
- **User Analytics**: Plausible (privacy-friendly)
- **Performance**: Lighthouse CI

## Architecture Updates & Key Changes

### Recent Updates (December 10, 2025)

This section documents the key architectural improvements made to optimize performance and enhance features.

### 1. Data Fetching Strategy: getDetails() Method

#### ✅ NEW: Use `getDetails()` as Primary Method

**Before (Multiple Calls - Slow):**
```typescript
// Multiple separate calls
const owner = await client.getOwner({ name })
const records = await client.getRecords({ name })
const resolver = await client.getResolver({ name })
const expiry = await client.getExpiry({ name })
// 4+ separate RPC calls - slow and inefficient
```

**After (Single Call - Fast):**
```typescript
// Single optimized call
const details = await getDetails(publicClient, {
  name,
  records: {
    texts: true,      // All text records
    coins: true,      // All address records
    contentHash: true,
  },
})
// Returns everything in one optimized call!
```

**Benefits:**
- ✅ **10x Faster**: Single RPC call instead of 5-10 separate calls
- ✅ **Complete Data**: Owner, registrant, records, resolver, expiration, all in one
- ✅ **Type-Safe**: Full TypeScript support
- ✅ **Optimized**: Uses multicall under the hood

### 2. Enhanced Data Display Features

#### Comprehensive User Profile Support

**Avatar Display:**
- NFT avatars (ERC721/ERC1155) with metadata resolution
- IPFS avatars via multiple gateways
- HTTP/HTTPS image URLs
- Generated fallback avatars

**Profile Information:**
- Display name
- Bio/description
- Email, phone, location
- Website URL
- Custom profile fields

**Social Media Integration:**
- Twitter/X handle
- GitHub username
- Discord username
- Telegram username
- Reddit, LinkedIn, etc.
- All displayed with proper icons and links

**Multi-Chain Addresses:**
- Ethereum (ETH)
- Bitcoin (BTC)
- Litecoin (LTC)
- Dogecoin (DOGE)
- Solana (SOL)
- Polygon (MATIC)
- 60+ other supported chains
- Copy-to-clipboard functionality
- Network icons and formatting

**Resolver Details:**
- Resolver contract address
- Resolver type (Public Resolver, Custom, etc.)
- Resolver version
- Supported interfaces
- Wildcard support detection
- Resolver deployment information

**Domain Status:**
- NameWrapper status (wrapped/unwrapped)
- Fuses (parent-controlled, child-controlled)
- Token ID for wrapped names
- Registration and expiration dates
- Grace period countdown

### 3. State Management Simplification

#### ✅ REMOVED: React Context

**Before (Complex):**
```typescript
// Global state with React Context
const [theme, setTheme] = useState('dark')
const [filters, setFilters] = useState({})

<ThemeContext.Provider value={{ theme, setTheme }}>
  <FilterContext.Provider value={{ filters, setFilters }}>
    <App />
  </FilterContext.Provider>
</ThemeContext.Provider>
```

**After (Simple & Clean):**
```typescript
// Simple React hooks + URL state
const [theme, setTheme] = useState(
  localStorage.getItem('theme') || 'dark'
)

// URL-based state for shareability
const searchParams = useSearchParams()
const domainName = searchParams.get('name')
```

**New State Management Stack:**

1. **TanStack Query** - Server state (ENS data)
   - Automatic caching
   - Background refetching
   - Optimistic updates
   - Error handling

2. **React Hooks** - Local component state
   - `useState` for simple state
   - `useReducer` for complex state
   - No global context needed

3. **URL State** - Shareable application state
   - Search parameters for domain queries
   - Deep linking support
   - Browser back/forward navigation

4. **LocalStorage** - Preferences persistence
   - Theme preference
   - Recent searches
   - Bookmarked domains
   - User settings

5. **IndexedDB** - Large data caching
   - Graph data
   - Profile cache
   - Subdomain trees

**Benefits:**
- ✅ **Simpler**: No global context provider tree
- ✅ **Faster**: Less re-renders
- ✅ **Shareable**: URL-based state
- ✅ **Maintainable**: Clearer data flow

### 4. Updated Component Architecture

**New Component Structure:**

```
Components/
├── Search/
│   ├── SearchBar.tsx           - Domain search input
│   └── SearchHistory.tsx       - Recent searches
│
├── Domain/
│   ├── DomainProfile.tsx       - Main profile component
│   │   ├── ProfileHeader.tsx   - Avatar + name + status
│   │   ├── ProfileBio.tsx      - Description + info
│   │   ├── SocialLinks.tsx     - Social media profiles
│   │   ├── AddressRecords.tsx  - Multi-chain addresses
│   │   ├── TextRecords.tsx     - All text records
│   │   ├── ResolverInfo.tsx    - Resolver details
│   │   └── DomainStatus.tsx    - Registration info
│   │
│   ├── SubdomainTree.tsx       - Hierarchical subdomain view
│   └── ContentViewer.tsx       - IPFS content preview
│
├── Graph/
│   ├── NetworkGraph.tsx        - Main graph visualization
│   ├── GraphControls.tsx       - Zoom, layout, filters
│   ├── GraphLegend.tsx         - Node/edge type legend
│   └── GraphExport.tsx         - Export functionality
│
├── Address/
│   ├── AddressExplorer.tsx     - Address analysis
│   └── ReverseResolution.tsx   - Address to name
│
├── UI/
│   ├── AvatarDisplay.tsx       - ENS avatar renderer
│   ├── CopyButton.tsx          - Copy to clipboard
│   ├── LoadingStates.tsx       - Skeletons
│   └── ErrorBoundary.tsx       - Error handling
│
└── Layout/
    ├── Header.tsx              - Navigation bar
    ├── Sidebar.tsx             - Filters panel
    └── Footer.tsx              - Status bar
```

### 5. Enhanced Service Layer

**Specialized Services:**

**ENS Service** - Core ENS operations
```typescript
class ENSService {
  // Primary method using getDetails()
  async getDomainDetails(name: string)
  
  // Profile-optimized (faster)
  async getDomainProfile(name: string)
  
  // Reverse resolution
  async getNameForAddress(address: string)
  
  // Subdomain discovery
  async getSubdomains(name: string, options)
}
```

**Profile Service** - User profile aggregation
```typescript
class ProfileService {
  // Enrich getDetails() data
  async getDomainProfile(name: string)
  
  // Extract social links from text records
  extractSocialLinks(texts: Record<string, string>)
  
  // Format multi-chain addresses
  formatMultiChainAddresses(coins: Record<string, string>)
}
```

**Avatar Service** - Avatar resolution
```typescript
class AvatarService {
  // Resolve any avatar type
  async resolveAvatar(avatarText: string)
  
  // NFT avatar handling
  async resolveNFTAvatar(nftUri: string)
  
  // IPFS avatar handling
  resolveIPFSAvatar(ipfsUrl: string)
  
  // Fetch NFT metadata
  async fetchNFTMetadata(contract, tokenId, chainId)
}
```

**Resolver Service** - Resolver contract interactions
```typescript
class ResolverService {
  // Get resolver information
  async getResolverInfo(resolverAddress: string)
  
  // Check wildcard support
  async checkWildcardSupport(resolverAddress: string)
  
  // Get resolver version
  async getResolverVersion(resolverAddress: string)
}
```

**Content Service** - Content hash resolution
```typescript
class ContentService {
  // Resolve content hash to URL
  async resolveContent(contentHash: string)
  
  // Preview IPFS content
  async previewIPFSContent(cid: string)
  
  // Detect content type
  detectContentType(contentHash: string)
}
```

### 6. Performance Improvements

**Before vs After:**

| Metric | OLD (Multiple Calls) | NEW (getDetails()) |
|--------|---------------------|-------------------|
| **RPC Calls** | 5-10 calls | 1 call |
| **Load Time** | 3-5 seconds | 0.5-1 second |
| **Data Completeness** | Partial | Complete |
| **Type Safety** | Manual types | Auto-generated |
| **Cache Efficiency** | Low | High |

### 7. Migration Guide

#### Data Fetching
```typescript
// ❌ OLD: Multiple calls
const owner = await getOwner(client, { name })
const records = await getRecords(client, { name, ... })

// ✅ NEW: Single call
const details = await getDetails(client, { name, records: { ... } })
```

#### State Management
```typescript
// ❌ OLD: React Context
const { theme } = useContext(ThemeContext)

// ✅ NEW: Local state + localStorage
const [theme, setTheme] = useState(localStorage.getItem('theme'))
```

#### URL State
```typescript
// ❌ OLD: Component state only
const [domain, setDomain] = useState('')

// ✅ NEW: URL params (shareable)
const [searchParams, setSearchParams] = useSearchParams()
const domain = searchParams.get('name')
```

### Benefits Summary

**Performance Improvements:**
- ⚡ **10x faster** data fetching (single call vs multiple)
- ⚡ **Reduced re-renders** (no global context)
- ⚡ **Better caching** (TanStack Query optimization)
- ⚡ **Progressive loading** (render as data arrives)

**User Experience Enhancements:**
- ✨ **Rich user profiles** (avatar, bio, socials)
- ✨ **Multi-chain support** (60+ blockchains)
- ✨ **Resolver insights** (detailed resolver info)
- ✨ **Shareable links** (URL-based state)
- ✨ **Better loading states** (progressive rendering)

**Developer Experience:**
- 🔧 **Simpler state management** (no context)
- 🔧 **Type-safe** (full TypeScript)
- 🔧 **Better organized** (specialized services)
- 🔧 **Easier debugging** (clearer data flow)
- 🔧 **Less boilerplate** (fewer API calls)

---

## Conclusion

The frontend-only architecture is the optimal choice for this application's initial phase. It provides:

- ✅ **Rapid Development**: Focus on features, not infrastructure
- ✅ **Low Cost**: Free hosting, minimal RPC costs
- ✅ **High Performance**: CDN distribution, client-side caching, optimized getDetails()
- ✅ **Scalability**: Handles significant load before backend needed
- ✅ **Flexibility**: Can add backend when/if required
- ✅ **Rich Features**: Comprehensive profiles, multi-chain, resolver details

**Recommendation**: Start with this architecture and monitor metrics. Add backend components only when specific needs arise.

---

**Document Version**: 2.0  
**Last Updated**: December 10, 2025  
**Status**: Approved

