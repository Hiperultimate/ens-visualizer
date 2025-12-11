import { addEnsContracts } from '@ensdomains/ensjs'
import { http, createPublicClient, fallback } from 'viem'
import { mainnet } from 'viem/chains'

// Multiple RPC endpoints with fallback
// Order: Custom RPC (if provided) -> Public endpoints (fallback chain)
const rpcUrls = [
  process.env.NEXT_PUBLIC_RPC_URL, // Custom RPC from env (optional)
  'https://eth.llamarpc.com', // LlamaRPC (reliable public endpoint)
  'https://rpc.ankr.com/eth', // Ankr (reliable public endpoint)
  'https://ethereum.publicnode.com', // PublicNode (reliable)
  'https://eth.drpc.org', // DRPC (reliable)
  'https://cloudflare-eth.com', // Cloudflare (last resort, often unreliable)
].filter(Boolean) as string[]

// Create fallback transport - tries each RPC in order
const transport = fallback(
  rpcUrls.map((url) =>
    http(url, {
      timeout: 10000, // 10 second timeout
      retryCount: 2, // Retry twice before moving to next
    }),
  ),
)

export const publicClient = createPublicClient({
  chain: addEnsContracts(mainnet),
  transport,
  batch: {
    multicall: true, // Enable multicall for batch requests
  },
})
