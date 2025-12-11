# ENS Network Application - Requirements Specification

## Project Overview

A TypeScript-based React application for visualizing and exploring ENS (Ethereum Name Service) domain relationships through interactive network graphs. The application will read ENS records, metadata, and relationships to provide comprehensive insights into the ENS ecosystem.

## Core Objectives

1. **ENS Data Exploration**: Enable users to query and view comprehensive ENS domain information
2. **Network Visualization**: Display relationships between domains, subdomains, and addresses as interactive graphs
3. **Real-time Data**: Fetch live data from Ethereum mainnet and ENS subgraph
4. **Responsive UI**: Modern, intuitive interface with excellent UX

---

## Technical Stack

### Frontend
- **Framework**: React 18+ with TypeScript 5+
- **Build Tool**: Vite
- **ENS Integration**: @ensdomains/ensjs v4 (using `getDetails()` for comprehensive data)
- **Blockchain Library**: viem (required by ensjs)
- **State Management**: TanStack Query (React Query) + React hooks (useState, useReducer)
- **Graph Visualization**: 
  - Primary: `react-flow` or `@xyflow/react` (modern, React-based)
  - Alternative: `vis-network` or `d3.js` for complex visualizations
- **Styling**: 
  - Tailwind CSS for utility-first styling
  - shadcn/ui for component library (optional)
- **Linting/Formatting**: BiomeJS
- **Web3 Wallet Integration**: 
  - wagmi (for wallet connection)
  - RainbowKit or ConnectKit (for UI)

### Backend Decision

**Recommendation: Frontend-Only Architecture (Phase 1)**

**Reasoning:**
- ensjs supports direct RPC calls and subgraph queries
- Public endpoints available (Infura, Alchemy, ENS subgraph)
- Simpler deployment and maintenance
- Lower infrastructure costs

**When Backend Becomes Necessary (Phase 2):**
- Graph computation for 100+ nodes becomes slow
- Need for caching complex relationship queries
- Rate limiting issues with public endpoints
- Advanced analytics/indexing requirements
- Custom aggregation logic

**Suggested Backend Stack (if needed later):**
- Node.js/Express or Fastify
- GraphQL API (Apollo Server)
- Redis for caching
- PostgreSQL for indexed data
- ENS subgraph as data source

---

## Functional Requirements

### 1. ENS Domain Search & Display

#### 1.1 Domain Search
- **Input**: ENS domain name (e.g., "vitalik.eth", "ens.eth")
- **Features**:
  - Autocomplete suggestions
  - Validation of ENS name format
  - Support for subdomains
  - Recent search history
  - Bookmark favorite domains

#### 1.2 Domain Information Display
Display comprehensive domain data using **ensjs `getDetails()` method**:

**Basic Information:**
- Domain name (normalized and beautified)
- Owner address (with ENS name if available)
- Registrant address (for .eth 2LDs)
- Manager/Controller address
- Registration date (formatted timestamp)
- Expiration date (for .eth domains with countdown)
- Grace period status
- Resolver address (with details)

**Resolver Details:**
- Resolver contract address
- Resolver type (Public Resolver, Custom, etc.)
- Resolver version
- Supported interfaces (addr, text, contentHash, etc.)
- Is resolver wild card enabled
- Resolver deployment date

**User Profile Information:**
- **Avatar**: Display user's ENS avatar (image with fallback)
  - IPFS/HTTP URLs
  - NFT avatars (ERC721/ERC1155)
  - Fallback to generated avatar
- **Display Name**: User's chosen display name
- **Description/Bio**: User's profile description
- **Location**: Geographic location
- **Email**: Contact email (if public)
- **Phone**: Contact phone (if public)

**Social Media Profiles:**
- Twitter/X handle
- GitHub username
- Telegram username
- Discord username
- Reddit username
- LinkedIn profile
- Website/URL
- Custom social links

**Address Records (Multi-chain)**: 
- ETH address (addr)
- BTC (Bitcoin)
- LTC (Litecoin)
- DOGE (Dogecoin)
- SOL (Solana)
- MATIC (Polygon)
- All other supported coin types (60+ chains)

**Additional Text Records**:
- Notice (important announcements)
- Keywords/Tags
- Custom key-value pairs
- Legal information
- Terms of service

**Content Information:**
- Content Hash (IPFS/IPNS/Arweave/Onion)
- IPFS content preview
- Content type detection
- Content metadata

**Domain Status:**
- Is wrapped (NameWrapper status)
- Fuses (if wrapped)
- Parent-controlled fuses
- Child-controlled fuses
- Token ID (for wrapped names)

**Subdomains:**
- List all subdomains
- Recursive subdomain discovery
- Subdomain count
- Subdomain owners with profiles
- Subdomain creation dates

### 2. Network Graph Visualization

#### 2.1 Graph Types

**A. Ownership Graph**
- Nodes: ENS domains and Ethereum addresses
- Edges: Ownership relationships
- Direction: Address → Domain (owns)
- Use Case: See all domains owned by an address

**B. Subdomain Hierarchy Graph**
- Nodes: Domains and subdomains
- Edges: Parent-child relationships
- Direction: Parent → Child
- Use Case: Visualize domain hierarchy (e.g., ens.eth → vitalik.ens.eth)

**C. Cross-Reference Graph**
- Nodes: Domains and addresses
- Edges: References (e.g., domain A points to address that owns domain B)
- Direction: Bidirectional
- Use Case: Discover connected domains

**D. Resolver Graph**
- Nodes: Domains and resolver contracts
- Edges: Which domains use which resolvers
- Use Case: Identify resolver centralization/distribution

#### 2.2 Graph Interaction Features

**Navigation:**
- Pan and zoom
- Click node to focus/expand
- Double-click to load more connections
- Right-click for context menu
- Search/filter nodes
- Minimap for large graphs

**Layout Algorithms:**
- Force-directed layout (default)
- Hierarchical layout (for subdomain trees)
- Radial layout (for ownership clusters)
- Custom layouts

**Visual Encoding:**
- Node size: Based on number of connections or subdomains
- Node color: By type (domain/address/resolver)
- Edge thickness: Relationship strength
- Edge color: Relationship type
- Animated edges for active relationships

**Performance:**
- Lazy loading for large graphs
- Virtual rendering for 1000+ nodes
- Clustering for dense areas
- Level-of-detail rendering

#### 2.3 Graph Controls

- **Depth Control**: Limit relationship traversal depth (1-5 levels)
- **Filter Options**:
  - Show/hide expired domains
  - Filter by registration date range
  - Filter by record types
  - Include/exclude subdomains
- **Export Options**:
  - Export as PNG/SVG
  - Export data as JSON
  - Share view (URL with parameters)

### 3. Address Explorer

#### 3.1 Address Analysis
- Input: Ethereum address (0x...)
- Output:
  - Primary ENS name (reverse record)
  - All owned ENS domains
  - Domains pointing to this address
  - Transaction history related to ENS
  - Total value of ENS portfolio

### 4. Discovery & Analytics

#### 4.1 Trending & Statistics
- Recently registered domains
- Soon-to-expire domains
- Most popular resolvers
- Largest domain trees (most subdomains)
- Most connected addresses

#### 4.2 Search Features
- Advanced search with filters
- Search by owner address
- Search by text record content
- Search by registration date range

---

## Non-Functional Requirements

### Performance
- Initial page load: < 2 seconds
- Domain query response: < 1 second
- Graph rendering (100 nodes): < 3 seconds
- Smooth animations: 60 FPS
- Support for 1000+ nodes with virtualization

### Scalability
- Handle large domain hierarchies (e.g., ens.eth with 1000+ subdomains)
- Efficient caching strategy
- Progressive data loading
- Memory-efficient graph rendering

### Security
- Read-only operations (no private keys required for basic features)
- Validate all user inputs
- Sanitize ENS names
- CORS-safe API calls
- No sensitive data storage

### Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader support
- High contrast mode
- Responsive design (mobile-first)

### Browser Support
- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## User Interface Requirements

### 1. Layout Structure

**Navigation Bar:**
- Logo/Branding
- Search bar (prominent)
- Wallet connection button
- Theme toggle (light/dark)
- Navigation links (Home, Explorer, Analytics, About)

**Main Content Area:**
- Split view:
  - Left: Domain information panel (collapsible)
  - Right: Network graph visualization
- Alternatively: Tabbed interface

**Bottom Bar:**
- Status indicators (network, sync status)
- Quick stats
- Settings

### 2. Key Pages/Views

#### Home Page
- Hero section with search
- Featured/trending domains
- Quick start guide
- Example graphs

#### Explorer View
- Domain info sidebar
- Graph visualization
- Control panel
- Filters and settings

#### Address View
- Address details
- Owned domains list
- Relationship graph

#### Analytics Dashboard
- Statistics cards
- Charts and graphs
- Leaderboards

### 3. Design Principles
- **Modern & Clean**: Minimal clutter, focus on data
- **Dark Mode First**: Better for graph visualization
- **Responsive**: Mobile, tablet, desktop layouts
- **Accessible**: High contrast, clear labels
- **Performant**: Smooth interactions, instant feedback

---

## Data Requirements

### 1. Data Sources

**Primary:**
- Ethereum Mainnet (via RPC)
- ENS Public Resolver contracts
- ENS Registry contract
- ENS Registrar contracts

**Secondary:**
- ENS Subgraph (The Graph Protocol)
  - URL: https://api.thegraph.com/subgraphs/name/ensdomains/ens
- ENS metadata service

### 2. Caching Strategy

**Client-Side Caching:**
- TanStack Query cache (5-minute default)
- LocalStorage for:
  - Search history
  - Bookmarked domains
  - User preferences
- IndexedDB for:
  - Large graph data
  - Offline support

**Cache Invalidation:**
- Time-based (5-15 minutes depending on data type)
- Manual refresh option
- Event-based (on-chain events for owned domains)

---

## Development Phases

### Phase 1: MVP (Weeks 1-4)
**Goal**: Basic ENS data display and simple visualization

**Features:**
- Project setup with Vite, React, TypeScript
- BiomeJS configuration
- ENS integration (ensjs + viem)
- Basic domain search
- Display domain records
- Simple ownership graph
- Wallet connection (optional)

**Deliverables:**
- Functional prototype
- Domain search and display
- Basic network graph

### Phase 2: Enhanced Visualization (Weeks 5-8)
**Goal**: Advanced graph features and interactions

**Features:**
- Multiple graph types
- Interactive controls
- Graph filters
- Layout algorithms
- Export functionality
- Performance optimization

**Deliverables:**
- Full-featured graph visualization
- Responsive design
- Performance benchmarks

### Phase 3: Discovery & Analytics (Weeks 9-12)
**Goal**: Analytics and discovery features

**Features:**
- Address explorer
- Trending domains
- Analytics dashboard
- Advanced search
- Bookmark/favorites
- Share functionality

**Deliverables:**
- Complete application
- Documentation
- Deployment

### Phase 4: Optimization & Polish (Weeks 13-16)
**Goal**: Production readiness

**Features:**
- Performance optimization
- Accessibility audit
- SEO optimization
- Error handling
- Loading states
- User onboarding

**Deliverables:**
- Production-ready application
- User documentation
- Deployment to production

---

## Technical Considerations

### 1. RPC Provider Strategy

**Options:**
- Public endpoints (rate-limited)
- Infura (11M requests/month free tier)
- Alchemy (300M compute units/month free)
- QuickNode
- User's own RPC (via wallet)

**Implementation:**
- Fallback chain (primary → secondary → tertiary)
- Rate limit handling with exponential backoff
- Request batching where possible

### 2. State Management

**Global State:**
- Current domain/address being viewed
- Graph data and settings
- User preferences
- Wallet connection state

**Server State:**
- TanStack Query for all ENS data
- Automatic refetching
- Optimistic updates
- Error retry logic

### 3. Error Handling

**User-Facing Errors:**
- Domain not found
- Invalid ENS name
- Network errors
- Rate limit exceeded
- Wallet errors

**Error UI:**
- Toast notifications
- Inline error messages
- Retry buttons
- Helpful error descriptions

### 4. Testing Strategy

**Unit Tests:**
- Utility functions
- ENS data parsing
- Graph algorithms

**Integration Tests:**
- ENS data fetching
- Graph rendering
- User interactions

**E2E Tests:**
- Critical user flows
- Search → View → Graph
- Wallet connection

**Tools:**
- Vitest for unit/integration
- Playwright for E2E
- React Testing Library

---

## Deployment & Infrastructure

### Frontend Hosting
**Recommended: Vercel or Netlify**
- Automatic deployments from Git
- CDN distribution
- SSL included
- Custom domain support
- Environment variables

**Alternative: GitHub Pages, Cloudflare Pages**

### Domain
- Custom domain (e.g., ensnetwork.xyz)
- SSL/TLS certificate
- DNS configuration

### CI/CD
- GitHub Actions workflow
- Automated testing
- Build optimization
- Deploy previews for PRs

---

## Future Enhancements (Post-MVP)

### Advanced Features
1. **Transaction History**: Show ENS-related transactions
2. **Portfolio Tracking**: Track domain values over time
3. **Notification System**: Alert on expirations, changes
4. **Bulk Operations**: Analyze multiple domains
5. **Comparison Tool**: Compare domains side-by-side
6. **API Access**: Provide REST/GraphQL API for data
7. **Social Features**: Comments, ratings, tags
8. **Integration**: ENS marketplace integration
9. **Mobile App**: React Native version
10. **Backend Service**: For advanced analytics

### Backend Implementation (Future)
When traffic/complexity requires:
- **Database**: PostgreSQL with indexed ENS data
- **Cache Layer**: Redis for hot data
- **API**: GraphQL (Apollo) or REST
- **Indexer**: Custom ENS event indexer
- **Background Jobs**: For graph precomputation
- **Analytics**: Usage tracking, insights

---

## Success Metrics

### Technical Metrics
- Page load time < 2s
- API response time < 1s
- Graph render time < 3s (100 nodes)
- Uptime > 99.5%
- Zero critical bugs

### User Metrics
- Daily active users
- Average session duration
- Domains searched per session
- Graph interactions per visit
- Return user rate

---

## Security Considerations

1. **No Private Keys**: Application is read-only by default
2. **Input Validation**: Sanitize all ENS names and addresses
3. **Rate Limiting**: Implement client-side rate limiting
4. **HTTPS Only**: Force secure connections
5. **No Sensitive Storage**: Avoid storing user data
6. **CSP Headers**: Content Security Policy
7. **Regular Updates**: Keep dependencies updated

---

## Documentation Requirements

### Developer Documentation
- Setup instructions
- Architecture overview
- API documentation
- Contributing guidelines
- Code style guide

### User Documentation
- User guide
- FAQ
- Video tutorials
- Example use cases
- Troubleshooting

---

## Budget & Resources

### Development Time
- **Phase 1 (MVP)**: 4 weeks
- **Phase 2 (Visualization)**: 4 weeks
- **Phase 3 (Analytics)**: 4 weeks
- **Phase 4 (Polish)**: 4 weeks
- **Total**: 16 weeks (4 months)

### Infrastructure Costs (Monthly)
- **RPC Provider**: $0-50 (free tier → paid if needed)
- **Hosting**: $0 (Vercel/Netlify free tier)
- **Domain**: $10-20/year
- **Monitoring**: $0 (free tier)
- **Total**: ~$0-100/month

### Team
- 1-2 Frontend developers
- 1 Designer (part-time)
- 1 DevOps/Infrastructure (part-time)

---

## Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Rate limiting on public RPC | High | Medium | Implement multiple providers, caching |
| Large graphs performance | High | High | Virtualization, lazy loading, clustering |
| ENS data structure changes | Medium | Low | Abstract data layer, version handling |
| Browser compatibility | Medium | Low | Polyfills, progressive enhancement |
| User adoption | High | Medium | Great UX, marketing, SEO |

---

## Open Questions

1. Should we support ENS on L2s (Optimism, Arbitrum)?
2. Should we implement write operations (requires wallet + gas)?
3. Should we add ENS name registration within the app?
4. Should we support other naming services (Unstoppable Domains, etc.)?
5. Should we implement user accounts for saved searches/preferences?

---

## Conclusion

This ENS Network Application will provide a unique and valuable tool for exploring the ENS ecosystem. Starting with a frontend-only architecture keeps complexity low while delivering core value. The modular design allows for future expansion with a backend service if needed.

**Recommendation**: Begin with Phase 1 MVP focusing on core ENS data display and basic graph visualization. This validates the concept and provides immediate value to users while maintaining flexibility for future enhancements.

---

## Appendix

### A. Useful Resources
- ENS Documentation: https://docs.ens.domains/
- ensjs Documentation: https://github.com/ensdomains/ensjs
- viem Documentation: https://viem.sh/
- ENS Subgraph: https://thegraph.com/explorer/subgraph/ensdomains/ens
- React Flow: https://reactflow.dev/

### B. Similar Projects (for inspiration)
- ens.app (official ENS manager)
- ens.vision (ENS portfolio tracker)
- Graph visualization tools (D3 examples, Gephi)

### C. ENS Contract Addresses (Mainnet)
- ENS Registry: `0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e`
- ETH Registrar Controller: `0x253553366Da8546fC250F225fe3d25d0C782303b`
- Public Resolver: `0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63`

---

**Document Version**: 1.0  
**Last Updated**: December 10, 2025  
**Author**: Technical Specification Team  
**Status**: Draft → Review → Approved

