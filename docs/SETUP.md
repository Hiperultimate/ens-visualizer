# ENS Network Application - Setup Guide

## Quick Start

This guide will help you set up the ENS Network Application development environment.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 18.0.0 ([Download](https://nodejs.org/))
- **pnpm** >= 8.0.0 (Install: `npm install -g pnpm`)
- **Git** ([Download](https://git-scm.com/))
- **VS Code** (Recommended, [Download](https://code.visualstudio.com/))

## Installation Steps

### 1. Install Dependencies

```bash
pnpm install
```

This will install all required dependencies including:
- React 18 & TypeScript 5
- ensjs v4 & viem
- TanStack Query
- React Flow
- BiomeJS
- Vite
- Vitest

### 2. Configure VS Code (Recommended)

Install the recommended VS Code extension:

```bash
code --install-extension biomejs.biome
```

The project includes VS Code settings (`.vscode/settings.json`) that will:
- Format code on save using BiomeJS
- Organize imports automatically
- Enable TypeScript workspace support

### 3. Configure Environment Variables

Create a `.env` file in the project root (copy from template below):

```bash
# .env
VITE_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY
VITE_RPC_FALLBACK_1=https://mainnet.infura.io/v3/YOUR_API_KEY
VITE_RPC_FALLBACK_2=https://cloudflare-eth.com
VITE_ENS_SUBGRAPH_URL=https://api.thegraph.com/subgraphs/name/ensdomains/ens
```

**Getting API Keys:**

- **Alchemy** (Recommended): https://www.alchemy.com/
  - Sign up for free
  - Create new app on Ethereum Mainnet
  - Copy HTTP URL

- **Infura**: https://infura.io/
  - Sign up for free
  - Create new API key
  - Use with mainnet endpoint

**Note**: Public endpoints work but may have rate limits. For production, use your own API keys.

### 4. Verify Setup

Run the following commands to ensure everything is set up correctly:

```bash
# Type check
pnpm type-check

# Linting
pnpm lint

# Run tests (optional, no tests yet)
pnpm test
```

### 5. Start Development Server

```bash
pnpm dev
```

The application should open at `http://localhost:5173`

## Project Structure

```
ens-network/
├── .vscode/                 # VS Code settings
│   ├── settings.json       # Editor config
│   └── extensions.json     # Recommended extensions
├── src/                    # Source code (to be created)
│   ├── components/        # React components
│   ├── hooks/            # Custom hooks
│   ├── lib/              # Utilities
│   ├── services/         # ENS services
│   ├── types/            # TypeScript types
│   ├── App.tsx           # Main app
│   └── main.tsx          # Entry point
├── public/                # Static assets
├── tests/                 # Test files
├── biome.json            # BiomeJS config
├── vite.config.ts        # Vite config
├── vitest.config.ts      # Test config
├── tsconfig.json         # TypeScript config
├── package.json          # Dependencies
├── requirements.md       # Full requirements
├── SETUP.md             # This file
└── README.md            # Project overview
```

## Development Workflow

### Running the Application

```bash
# Development mode with hot reload
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

### Code Quality

```bash
# Check for issues
pnpm lint

# Fix issues automatically
pnpm lint:fix

# Format code
pnpm format

# Type checking
pnpm type-check
```

### Testing

```bash
# Run tests in watch mode
pnpm test

# Run tests with UI
pnpm test:ui

# Generate coverage report
pnpm test:coverage
```

## BiomeJS Configuration

The project uses BiomeJS for linting and formatting. Configuration is in `biome.json`.

### Key Features:

- **Fast**: 20-100x faster than ESLint + Prettier
- **Integrated**: Single tool for linting and formatting
- **Modern**: Built for TypeScript and React
- **Strict**: Enforces best practices

### Rules Configured:

- ✅ Complexity checks
- ✅ Correctness checks
- ✅ Security checks
- ✅ Style enforcement
- ✅ Accessibility (a11y) warnings
- ✅ Suspicious pattern detection

### Editor Integration:

BiomeJS formats on save and organizes imports automatically when using VS Code.

## TypeScript Configuration

The project uses strict TypeScript settings:

- Strict mode enabled
- No unused locals/parameters
- No unchecked indexed access
- Force consistent casing

Path aliases configured:
```typescript
import { Component } from '@/components/Component'
```

## Vite Configuration

Vite is configured for optimal performance:

- React Fast Refresh
- Path aliases
- Code splitting (vendor chunks)
- ESNext target
- Source maps

## Common Issues & Solutions

### Issue: `pnpm: command not found`

**Solution**: Install pnpm globally:
```bash
npm install -g pnpm
```

### Issue: Port 5173 already in use

**Solution**: Kill the process or change port in `vite.config.ts`:
```typescript
server: {
  port: 3000, // Change to any available port
}
```

### Issue: Type errors in node_modules

**Solution**: This is normal. Run:
```bash
pnpm install
pnpm type-check
```

### Issue: BiomeJS not formatting on save

**Solution**: 
1. Install BiomeJS extension in VS Code
2. Reload VS Code window
3. Check `.vscode/settings.json` exists

### Issue: RPC errors / Rate limiting

**Solution**: 
1. Add your own API keys to `.env`
2. Use Alchemy or Infura free tier
3. Implement request batching (coming in Phase 1)

## Next Steps

Now that setup is complete, you're ready to start development!

### Immediate Next Steps:

1. **Create Source Structure**:
   ```bash
   mkdir -p src/{components,hooks,lib,services,types}
   ```

2. **Set up Entry Points**:
   - Create `src/main.tsx` (app entry)
   - Create `src/App.tsx` (main component)
   - Create `public/index.html`

3. **Initialize ENS Client**:
   - Create `src/lib/ens-client.ts`
   - Configure viem client
   - Set up ensjs public client

4. **Build First Component**:
   - Create search component
   - Test ENS name resolution
   - Display basic domain info

See `requirements.md` for full feature specifications.

## Resources

### Documentation
- [ENS Docs](https://docs.ens.domains/)
- [ensjs GitHub](https://github.com/ensdomains/ensjs)
- [viem Docs](https://viem.sh/)
- [React Flow](https://reactflow.dev/)
- [TanStack Query](https://tanstack.com/query/latest)
- [BiomeJS](https://biomejs.dev/)

### ENS Resources
- ENS Registry: `0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e`
- ENS Subgraph: https://thegraph.com/explorer/subgraph/ensdomains/ens
- ENS App: https://app.ens.domains/

### Support
- GitHub Issues: [Project Issues]
- ENS Discord: https://chat.ens.domains/

## Development Guidelines

### Code Style
- Use TypeScript for all files
- Follow BiomeJS rules
- Write self-documenting code
- Add JSDoc comments for complex functions
- Use semantic variable names

### Component Structure
```typescript
// ComponentName.tsx
import type { FC } from 'react'

interface ComponentNameProps {
  // Props with JSDoc
}

export const ComponentName: FC<ComponentNameProps> = ({ prop }) => {
  // Component logic
  return <div>{/* JSX */}</div>
}
```

### Git Workflow
1. Create feature branch: `git checkout -b feature/name`
2. Make changes and commit: `git commit -m "feat: description"`
3. Run quality checks: `pnpm lint && pnpm type-check`
4. Push and create PR

### Commit Messages
Follow conventional commits:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `style:` - Formatting
- `refactor:` - Code restructuring
- `test:` - Tests
- `chore:` - Maintenance

## Production Deployment

### Build

```bash
# Create production build
pnpm build

# Output will be in /dist folder
```

### Deploy to Vercel (Recommended)

1. Install Vercel CLI: `pnpm add -g vercel`
2. Run: `vercel`
3. Follow prompts

### Deploy to Netlify

1. Build: `pnpm build`
2. Deploy: `netlify deploy --prod --dir=dist`

### Environment Variables

Remember to set environment variables in your deployment platform:
- `VITE_RPC_URL`
- `VITE_RPC_FALLBACK_1`
- `VITE_RPC_FALLBACK_2`
- `VITE_ENS_SUBGRAPH_URL`

## Performance Considerations

### Development
- Hot Module Replacement (HMR) enabled
- Fast refresh for React components
- TypeScript incremental compilation

### Production
- Code splitting by route and vendor
- Tree shaking
- Minification
- Gzip compression
- Source maps for debugging

## Security

### Best Practices
- Never commit `.env` files
- Use environment variables for API keys
- Validate all user inputs
- Sanitize ENS names
- No private key handling (read-only app)

### Dependencies
- Regular updates: `pnpm update`
- Security audit: `pnpm audit`
- Dependency check before production

## Troubleshooting

If you encounter any issues:

1. **Clear Cache**:
   ```bash
   rm -rf node_modules
   rm pnpm-lock.yaml
   pnpm install
   ```

2. **Reset Vite Cache**:
   ```bash
   rm -rf .vite
   pnpm dev
   ```

3. **Check Node Version**:
   ```bash
   node --version  # Should be >= 18.0.0
   ```

4. **Verify pnpm**:
   ```bash
   pnpm --version  # Should be >= 8.0.0
   ```

## Getting Help

- 📖 Check `requirements.md` for feature specs
- 📖 Check `README.md` for overview
- 🐛 Open an issue on GitHub
- 💬 Ask in ENS Discord

---

**Happy Coding! 🚀**

