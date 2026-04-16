# FairChain 🔗

FairChain is a transparent supply chain contract and escrow platform designed to empower artisans, middlemen, and sellers by providing an immutable, on-chain record of agreements, product origins, and payments.

## 🌟 Key Features

- **Decentralized Product Registry**: Every product and its contract metadata are stored in IPFS and pinned to the Polygon blockchain.
- **Smart Contract Escrow**: Secure milestone-based payments ensure that all parties are compensated fairly as goods move through the supply chain.
- **Multi-Party Agreements**: Contracts support n-number of participants (e.g., Artisan, Middleman, Seller) with custom payment splits.
- **Transparent Status Tracking**: Real-time contract status tracking (Pending → Accepted → Locked → Completed) across all parties via WebSockets.
- **On-chain Proof**: Generated QR codes link back to verifiable blockchain proofs of the product's origin and the exact contract terms agreed upon.

## 🛠 Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS, Wagmi (for wallet connections), Socket.io-client.
- **Backend**: Express, Node.js, Socket.io (for real-time updates), Ethers.js v6.
- **Blockchain**: Solidity, Hardhat, Polygon Amoy Testnet.
- **Decentralized Storage**: IPFS via Pinata.

## 🚀 Getting Started

To get the project running locally, check out the detailed [SETUP.md](./SETUP.md). It covers:
- Monorepo setup using `pnpm`.
- Environment variable configuration.
- Deploying the smart contract to Polygon Amoy.

## 📖 Usage

For a detailed guide on how to use the platform (including creating contracts, accepting them, locking them on-chain, and handling escrow), please read the [USAGE.md](./USAGE.md).

## 🔒 Smart Contract Workflow

1. **Creation**: A participant creates a contract, specifying the product, category, terms, milestones, and other participants.
2. **Acceptance**: Other participants review and accept the contract.
3. **Locking & Proof**: The creator "locks" the contract. Metadata is uploaded to IPFS and the contract is permanently registered on the FairChainEscrow smart contract.
4. **Milestones**: Payment milestones are released securely via the escrow system.

## 📦 Monorepo Structure

- `apps/web`: Next.js frontend application.
- `apps/server`: Express backend API and Socket server.
- `packages/contracts`: Hardhat project with the Solidity smart contracts.
- `packages/shared`: Shared TypeScript types and utilities.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.
