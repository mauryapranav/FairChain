import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import type { Config } from 'wagmi';
import { polygonAmoy } from 'wagmi/chains';

const WC_PROJECT_ID = process.env['NEXT_PUBLIC_WC_PROJECT_ID'] ?? 'fallback-dev-id';

export const wagmiConfig: Config = getDefaultConfig({
  appName: 'FairChain',
  projectId: WC_PROJECT_ID,
  chains: [polygonAmoy],
  ssr: true, // Required for Next.js App Router
});
