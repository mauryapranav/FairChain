# FairChain — Setup Guide

> Follow this guide **once** to get everything running. After that, use `pnpm dev` to start locally or Docker to deploy anywhere.

---

## Prerequisites

| Tool | Minimum version | Install |
|------|----------------|---------|
| Node.js | 20 | https://nodejs.org |
| pnpm | 9 | `npm install -g pnpm@9` |
| Docker Desktop | latest | https://www.docker.com/products/docker-desktop |
| MetaMask browser extension | latest | https://metamask.io |

---

## Step 1 — Clone & Install

```bash
git clone <your-repo-url>
cd FAIRCHAIN
pnpm install
```

---

## Step 2 — Environment Files

### Copy the example files

```bash
copy apps\server\.env.example apps\server\.env
copy apps\web\.env.local.example apps\web\.env.local
```

### `apps/server/.env` — values you MUST set

| Key | Where to get it | Example |
|-----|----------------|---------|
| `MONGODB_URI` | Run MongoDB locally (see Step 3) OR use [MongoDB Atlas free tier](https://www.mongodb.com/atlas) | `mongodb://localhost:27017/fairchain` |
| `JWT_SECRET` | Generate at https://generate-secret.vercel.app/64 — copy the result | `a1b2c3d4...` (64 chars) |
| `RAZORPAY_KEY_ID` | [Razorpay Dashboard](https://dashboard.razorpay.com) → Settings → API Keys. **Use Test Mode keys** | `rzp_test_XXXXXXXXXX` |
| `RAZORPAY_KEY_SECRET` | Same as above | `XXXXXXXXXXXXXXXXXXXXXXXXXX` |
| `PINATA_JWT` | [Pinata.cloud](https://app.pinata.cloud) → API Keys → New Key (free tier gives 1 GB) | `eyJ...` |

> **Blockchain keys (optional for local dev — mock mode works without them):**

| Key | Where to get it |
|-----|----------------|
| `DEPLOY_WALLET_PRIVATE_KEY` | See Step 5 below |
| `ESCROW_CONTRACT_ADDRESS` | After running Step 6 (deploy) |
| `PROOF_REGISTRY_ADDRESS` | After running Step 6 (deploy) |
| `ADMIN_WALLET` | Your MetaMask wallet address (starting with `0x`) |
| `POLYGON_RPC_URL` | Default `https://rpc-amoy.polygon.technology` — no change needed |

### `apps/web/.env.local` — values to set

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```
That's it for local dev. For production, change to your deployed server URL.

---

## Step 3 — Start MongoDB Locally

```bash
# Option A: Docker (easiest)
docker run -d --name fairchain-mongo -p 27017:27017 mongo:7

# Option B: Install MongoDB Community locally
# https://www.mongodb.com/try/download/community
```

---

## Step 4 — Run in Development

```bash
# Terminal 1 — Express API (port 4000)
pnpm --filter @fairchain/server dev

# Terminal 2 — Next.js frontend (port 3000)
pnpm --filter @fairchain/web dev
```

Open http://localhost:3000 — you should see the FairChain landing page.

> **No blockchain/Razorpay/IPFS keys yet?** That's fine — mock mode is active. Everything works with fake data.

---

## Step 5 — Export MetaMask Private Key (for Polygon Amoy deployment)

> ⚠️ **NEVER share your private key with anyone. Never commit it to Git.**

1. Open MetaMask
2. Click the three dots (⋮) next to your account name
3. Click **Account Details** → **Show Private Key**
4. Enter your MetaMask password
5. Copy the 64-character hex string (starts with no `0x`)
6. Paste into `apps/server/.env`:
   ```env
   DEPLOY_WALLET_PRIVATE_KEY=your_64_char_private_key_here
   ```
7. Also paste into `packages/contracts/.env` (create this file):
   ```env
   DEPLOY_WALLET_PRIVATE_KEY=your_64_char_private_key_here
   POLYGON_RPC_URL=https://rpc-amoy.polygon.technology
   ```

### Get Amoy Testnet MATIC (free)

Your wallet needs test MATIC to pay gas fees for deployment:

1. Go to https://faucet.polygon.technology
2. Select **Polygon Amoy**
3. Paste your MetaMask wallet address
4. Click **Submit** — you'll receive 0.5 test MATIC in ~30 seconds
5. Switch MetaMask to "Polygon Amoy" network (chainId: 80002)
   - Network Name: `Polygon Amoy`
   - RPC URL: `https://rpc-amoy.polygon.technology`
   - Chain ID: `80002`
   - Currency: `MATIC`
   - Block Explorer: `https://amoy.polygonscan.com`

---

## Step 6 — Deploy Smart Contracts to Polygon Amoy

```bash
cd packages/contracts
pnpm install
pnpm hardhat run scripts/deploy.ts --network polygonAmoy
```

You will see output like:
```
✅ EscrowContract deployed to: 0xABC...
✅ ProofRegistry deployed to: 0xDEF...
```

Copy those addresses into `apps/server/.env`:
```env
ESCROW_CONTRACT_ADDRESS=0xABC...
PROOF_REGISTRY_ADDRESS=0xDEF...
```

Verify on block explorer: https://amoy.polygonscan.com/address/0xABC...

---

## Step 7 — Run with Docker (local, no dependencies needed)

```bash
# Create a .env file at the project root
copy .env.example .env       # edit the values inside

# Build and start all services (MongoDB + server + web)
docker compose up --build

# Or run in background
docker compose up --build -d
```

Open http://localhost:3000. All three containers start automatically.

**Useful commands:**
```bash
docker compose logs -f server    # watch server logs
docker compose logs -f web       # watch web logs
docker compose down              # stop everything
docker compose down -v           # stop + delete database volume
```

---

## Step 8 — Deploy to Railway (free, always-on)

### One-time Railway setup

1. Sign up at https://railway.app — free, no credit card needed
2. Install Railway CLI: `npm install -g @railway/cli`
3. Login: `railway login`

### Deploy

```bash
# Link this directory to a new Railway project
railway init

# Deploy both services
railway up
```

Railway detects the `railway.toml` automatically. For each service, set the environment variables in the Railway dashboard under **Variables**:

**fairchain-server variables:**
- `MONGODB_URI` → Create a MongoDB plugin in Railway or use Atlas free tier URI
- `JWT_SECRET` → 64-char random string
- `CORS_ORIGIN` → Your web service URL (shown after first deploy)
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` → your Razorpay test keys
- `PINATA_JWT` → your Pinata JWT
- (Optional) `ESCROW_CONTRACT_ADDRESS`, `PROOF_REGISTRY_ADDRESS`, `DEPLOY_WALLET_PRIVATE_KEY`

**fairchain-web variables:**
- `API_URL` → your server service URL (e.g. `https://fairchain-server.up.railway.app`)
- `NEXT_PUBLIC_API_URL` → same value

After all variables are set, trigger a redeploy from the Railway dashboard.

---

## Root `.env` file (for docker-compose)

Create `FAIRCHAIN/.env`:
```env
# Required
JWT_SECRET=replace-with-64-char-random-string

# Optional — mock mode used if empty
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
PINATA_JWT=
ESCROW_CONTRACT_ADDRESS=
PROOF_REGISTRY_ADDRESS=
DEPLOY_WALLET_PRIVATE_KEY=
ADMIN_WALLET=

# Only needed in production
CORS_ORIGIN=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:4000
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `MongooseError: connection refused` | Make sure MongoDB is running (Step 3) |
| `Cannot find module @fairchain/shared` | Run `pnpm install` from the root |
| MetaMask shows wrong network | Switch to Polygon Amoy in MetaMask (Step 5) |
| QR camera says "access denied" | Use HTTPS or `localhost` — camera APIs require a secure context |
| `pnpm: command not found` | Run `npm install -g pnpm@9` |
| Docker build fails at `pnpm install` | Make sure `pnpm-lock.yaml` is committed and up to date |
