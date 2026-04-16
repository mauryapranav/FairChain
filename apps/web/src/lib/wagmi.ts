import { createConfig, http } from 'wagmi';
import { polygonAmoy } from 'wagmi/chains';
import { metaMask } from 'wagmi/connectors';

/**
 * MetaMask-only config on Polygon Amoy testnet.
 * Two wallets on two browsers both work independently — each browser
 * has its own MetaMask session so there is no conflict.
 */
export const wagmiConfig = createConfig({
  chains: [polygonAmoy],
  connectors: [metaMask()],
  transports: {
    [polygonAmoy.id]: http(),
  },
  ssr: true,
});
