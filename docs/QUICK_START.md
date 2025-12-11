# Quick Start Guide - ENS Network Application

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies (2 minutes)

```bash
cd /Users/manakkumarsingh/Coding/ensnetwork
pnpm install
```

### Step 2: Configure Environment (1 minute)

Create a `.env` file:

```bash
cat > .env << 'EOF'
# Use public endpoint (works immediately, has rate limits)
VITE_RPC_URL=https://cloudflare-eth.com

# Or use Alchemy (better, requires free API key from alchemy.com)
# VITE_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY

# ENS Subgraph (free public endpoint)
VITE_ENS_SUBGRAPH_URL=https://api.thegraph.com/subgraphs/name/ensdomains/ens
EOF
```

### Step 3: Start Development Server (30 seconds)

```bash
pnpm dev
```

Browser opens automatically at `http://localhost:5173` 🎉

---

## 📋 Essential Commands

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm preview          # Preview production build

# Code Quality
pnpm lint             # Check for issues
pnpm lint:fix         # Fix issues automatically
pnpm format           # Format all files

# TypeScript
pnpm type-check       # Check types

# Testing
pnpm test             # Run tests
```

---

## 📁 Create Source Structure

```bash
# Create all necessary directories
mkdir -p src/{components,hooks,lib,services,types}
mkdir -p src/components/{ui,domain,graph,search}
mkdir -p public
mkdir -p tests

# Create main entry files
touch src/main.tsx
touch src/App.tsx
touch src/index.css
touch public/index.html
```

---

## 🎯 First Files to Create

### 1. `public/index.html`

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ENS Network - Visualize ENS Domains</title>
    <meta name="description" content="Explore and visualize ENS domain relationships" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### 2. `src/main.tsx`

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'
import './index.css'

const root = document.getElementById('root')
if (!root) throw new Error('Root element not found')

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

### 3. `src/App.tsx`

```typescript
import type { FC } from 'react'

export const App: FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">ENS Network</h1>
        <p className="text-gray-300">
          Welcome to ENS Network Application! 🚀
        </p>
      </div>
    </div>
  )
}
```

### 4. `src/index.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

### 5. `tailwind.config.js`

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### 6. `postcss.config.js`

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

---

## 🔧 Create ENS Client

### `src/lib/ens-client.ts`

```typescript
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { addEnsContracts } from '@ensdomains/ensjs'

// Create viem client
export const publicClient = createPublicClient({
  chain: addEnsContracts(mainnet),
  transport: http(import.meta.env.VITE_RPC_URL),
})

// You can now use this client with ensjs functions
```

### `src/services/ens.service.ts`

```typescript
import { getDetails, getName, getSubnames } from '@ensdomains/ensjs/public'
import { publicClient } from '@/lib/ens-client'

export const ensService = {
  // Get comprehensive domain details (primary method)
  async getDomainDetails(name: string) {
    return getDetails(publicClient, {
      name,
      records: {
        texts: true,      // All text records
        coins: true,      // All address records
        contentHash: true, // IPFS/IPNS content
      },
    })
  },

  // Get domain profile (essential fields only - faster)
  async getDomainProfile(name: string) {
    return getDetails(publicClient, {
      name,
      records: {
        texts: ['name', 'description', 'avatar', 'email', 'url', 
                'com.github', 'com.twitter', 'com.discord'],
        coins: ['ETH', 'BTC'],
        contentHash: true,
      },
    })
  },

  // Reverse resolution (address to name)
  async getNameForAddress(address: string) {
    return getName(publicClient, { address: address as `0x${string}` })
  },

  // Get subdomains
  async getSubdomains(name: string) {
    return getSubnames(publicClient, { name, pageSize: 100 })
  },
}
```

---

## 📚 Documentation Reference

| Document | Purpose | When to Read |
|----------|---------|--------------|
| **README.md** | Project overview | First read |
| **PROJECT_SUMMARY.md** | Complete setup summary | After README |
| **requirements.md** | Full specifications | Before coding features |
| **ARCHITECTURE.md** | Technical architecture | When designing |
| **SETUP.md** | Detailed setup guide | When troubleshooting |
| **QUICK_START.md** | This file | To get started fast |

---

## 🎨 Recommended VS Code Extensions

```bash
# Essential
code --install-extension biomejs.biome

# Recommended
code --install-extension bradlc.vscode-tailwindcss
code --install-extension esbenp.prettier-vscode
code --install-extension dbaeumer.vscode-eslint
```

---

## 🔥 Hot Tips

### 1. Use Path Aliases

```typescript
// ✅ Good
import { ensService } from '@/services/ens.service'

// ❌ Avoid
import { ensService } from '../../../services/ens.service'
```

### 2. TypeScript Strict Mode

```typescript
// Always type your props
interface ButtonProps {
  label: string
  onClick: () => void
}

export const Button: FC<ButtonProps> = ({ label, onClick }) => {
  // ...
}
```

### 3. Use TanStack Query for ENS Data

```typescript
import { useQuery } from '@tanstack/react-query'
import { ensService } from '@/services/ens.service'

// Get comprehensive domain details
export const useDomainDetails = (name: string) => {
  return useQuery({
    queryKey: ['domain', name],
    queryFn: () => ensService.getDomainDetails(name),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!name,  // Only fetch if name is provided
  })
}

// Get just profile essentials (faster initial load)
export const useDomainProfile = (name: string) => {
  return useQuery({
    queryKey: ['domain-profile', name],
    queryFn: () => ensService.getDomainProfile(name),
    staleTime: 5 * 60 * 1000,
  })
}
```

### 4. BiomeJS Auto-Fix

```bash
# Fix all issues before committing
pnpm lint:fix
pnpm format
```

---

## ⚡ Performance Tips

1. **Use React.memo for expensive components**
   ```typescript
   export const ExpensiveComponent = React.memo(({ data }) => {
     // Component logic
   })
   ```

2. **Lazy load heavy components**
   ```typescript
   const NetworkGraph = lazy(() => import('@/components/NetworkGraph'))
   ```

3. **Implement virtualization for lists**
   ```typescript
   // Use react-window or @tanstack/react-virtual
   ```

---

## 🐛 Common Issues

### Issue: "Cannot find module '@/...'"

**Fix**: Restart TypeScript server in VS Code
```
Cmd+Shift+P → TypeScript: Restart TS Server
```

### Issue: BiomeJS not working

**Fix**: 
```bash
pnpm add -D @biomejs/biome
code --install-extension biomejs.biome
# Reload VS Code
```

### Issue: Vite port in use

**Fix**: Change port in `vite.config.ts`:
```typescript
server: {
  port: 3000, // or any other port
}
```

---

## 🎯 Development Checklist

### Phase 1: Foundation (Week 1)
- [ ] Install dependencies
- [ ] Create source structure
- [ ] Create entry files
- [ ] Test dev server
- [ ] Verify hot reload

### Phase 2: ENS Integration (Week 2)
- [ ] Setup viem client
- [ ] Configure ensjs
- [ ] Create ENS service
- [ ] Test domain resolution
- [ ] Add error handling

### Phase 3: UI Components (Week 3)
- [ ] Create search component
- [ ] Build domain info display
- [ ] Add loading states
- [ ] Style with Tailwind
- [ ] Make responsive

### Phase 4: Visualization (Week 4)
- [ ] Setup React Flow
- [ ] Create basic graph
- [ ] Add interactions
- [ ] Implement layouts
- [ ] Optimize performance

---

## 📊 Expected Timeline

```
Day 1:  Setup + First Component (Search Bar)
Day 2:  ENS Integration (Domain Resolution)
Day 3:  Domain Info Display
Day 4:  Basic Graph Visualization
Day 5:  Graph Interactions
Week 2: Enhanced Features
Week 3: Polish & Testing
Week 4: Deploy to Production
```

---

## 🚀 Deploy in 2 Minutes

### Vercel (Recommended)

```bash
# Install Vercel CLI
pnpm add -g vercel

# Deploy
vercel

# Follow prompts, done! 🎉
```

### Environment Variables on Vercel

1. Go to Vercel Dashboard
2. Project Settings → Environment Variables
3. Add:
   - `VITE_RPC_URL`
   - `VITE_ENS_SUBGRAPH_URL`

---

## 🎓 Learning Path

### Day 1: Understand ENS
- Read [ENS Docs](https://docs.ens.domains/)
- Understand domains, records, resolvers
- Try examples in [ensjs repo](https://github.com/ensdomains/ensjs)

### Day 2: Master ensjs
- Read ensjs documentation
- Experiment with public client
- Test different queries
- Understand error handling

### Day 3: Build UI
- Create React components
- Style with Tailwind
- Add interactions
- Test responsiveness

### Day 4: Add Graphs
- Learn React Flow basics
- Create simple graph
- Add custom nodes
- Implement interactions

---

## 🔗 Quick Links

- **ENS Docs**: https://docs.ens.domains/
- **ensjs GitHub**: https://github.com/ensdomains/ensjs
- **viem Docs**: https://viem.sh/
- **React Flow**: https://reactflow.dev/
- **TanStack Query**: https://tanstack.com/query/latest
- **Tailwind CSS**: https://tailwindcss.com/
- **BiomeJS**: https://biomejs.dev/

---

## ✅ Ready to Code!

You now have everything you need. Start with:

```bash
pnpm dev
```

Then open `src/App.tsx` and start building! 🚀

---

**Good luck! You've got this! 💪**

