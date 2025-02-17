import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import {createAppKit} from '@reown/appkit/react'

import { solana} from '@reown/appkit/networks'
import type {AppKitNetwork} from '@reown/appkit/networks'
import {SolanaAdapter} from "@reown/appkit-adapter-solana";

const projectId = 'bb79d7a195d725ed834d25548e6fb328'


// 2. Create a metadata object - optional
const metadata = {
    name: 'AppKit',
    description: 'AppKit Example',
    url: 'https://example.com', // origin must match your domain & subdomain
    icons: ['https://avatars.githubusercontent.com/u/179229932']
}

// 3. Set the networks
export const networks = [solana] as [AppKitNetwork, ...AppKitNetwork[]]

// 4. Create Wagmi Adapter
const solanaWeb3JsAdapter = new SolanaAdapter()

// 5. Create modal
createAppKit({
    adapters: [solanaWeb3JsAdapter],
    networks,
    projectId,
    metadata,
})



createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
