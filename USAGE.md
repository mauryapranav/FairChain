# FairChain — How It Works & Demo Flow Guide

> This guide walks through the complete user journey end-to-end, from connecting a wallet to scanning a verified product QR code on a phone.

---

## System Overview

```
[Artisan / Middleman / Seller]
           │
    Connect MetaMask
           │
    Register profile + KYC
           │
    Creator builds a Contract
    (product name, participants, payment splits, milestones)
           │
    Lock Contract on-chain
    (IPFS metadata stored + Polygon Amoy proof registered)
           │
    QR code generated for product
           │
    [Anyone] Scans QR on phone / desktop
           │
    ┌──────────────────────────────────┐
    │  Public visitor (no wallet)      │
    │  → sees: product name, category, │
    │  supply chain roles, IPFS proof  │
    │  → payment info is HIDDEN        │
    └──────────────────────────────────┘
    ┌──────────────────────────────────┐
    │  Authenticated participant       │
    │  → sees everything above PLUS:   │
    │  payment splits, amounts, escrow │
    │  milestone status                │
    └──────────────────────────────────┘
           │
    Payment via Razorpay (INR)
    → Escrow held until milestones complete
    → Funds released on-chain via MATIC gas
```

---

## Demo Flow — Step by Step

### 1. Connect Wallet & Register

1. Open http://localhost:3000 (or your deployed URL)
2. Click **"Connect Wallet"** in the navbar
3. MetaMask opens — approve the connection
4. You're prompted to sign a message (this proves you own the wallet — no gas fee)
5. If it's your first time → you're redirected to **`/onboard`**
6. Fill in: Name, Email (optional), Role (Artisan / Middleman / Seller)
7. Click **"Create My Profile"**
8. You're redirected to **`/kyc`** for identity verification

---

### 2. KYC Verification

1. Page shows your current KYC status
2. Click **"Start Identity Verification"**
3. In **development mode**: auto-verified after 3 seconds ✅
4. In **production**: redirected to KYC provider (DigiLocker / HyperVerge)
5. Page polls automatically — you'll see it flip to "Verified" with a green checkmark
6. After verification → redirected to your **Profile** page

---

### 3. Explore Participants

Visit **`/explore`** to browse registered artisans and middlemen.  
Filter by role, search by name or location. Each participant card shows:
- Name, role, KYC badge
- Reputation score
- Speciality / location

---

### 4. Create a Contract (Artisan or Middleman)

1. Click **"Get Started"** or navigate to **`/contract/new`**
2. Fill in the form:
   - Product Name (e.g. "Handwoven Pashmina Shawl")
   - Category (e.g. "Textiles")
   - Description
   - **Add Participants**: pick from existing users or paste wallet addresses
   - Set **payment splits** (must total 100%) e.g. Artisan: 70%, Middleman: 30%
   - Enable **milestones** if payment should release in stages
   - (Optional) upload a product image → stored on IPFS
3. Click **"Create Contract"**
4. Contract is created with `status: pending`

---

### 5. Lock the Contract (On-Chain Registration)

From the contract detail page (`/contract/:id`):

1. Review all participants and terms
2. Click **"Lock Contract on Blockchain"**
3. The system:
   - Uploads contract metadata to **IPFS** via Pinata
   - Registers a proof hash on **Polygon Amoy** via `ProofRegistry.sol`
   - Contract status changes to `locked`
   - All participants receive a real-time notification via WebSocket
4. A **QR code** tab appears — this is the product's scannable identity

---

### 6. Fund Escrow (Payment via Razorpay)

1. On the contract page, enter the payment amount (INR)
2. Click **"Fund Escrow"**
3. Razorpay checkout opens (test mode: use card `4111 1111 1111 1111`, any CVV/expiry)
4. On success, escrow is created and the blockchain deposit event is logged

---

### 7. Scan the Product QR (Any Device — Phone or Desktop)

**To generate the QR:**
1. Navigate to **`/scan`**
2. Switch to the **"Generate"** tab
3. Pick the contract from the dropdown
4. The QR code appears — click **Download PNG** to save
5. Print or share with the product

**To scan the QR:**

On mobile (iPhone / Android):
1. Open http://localhost:3000/scan (or the deployed URL)
2. The camera activates automatically
3. Point at the QR code
4. Instantly redirected to the product verification page

OR use the native camera app — if the QR URL resolves to your domain, it opens in the browser.

**What the scanner sees:**
- Products registered on FairChain redirect to `/verify/:contractId`
- If someone scans without a wallet → they see the public product page (authenticity only)
- If they connect their wallet → payment transparency section unlocks

---

### 8. Release Milestones / Complete Payment

From the contract page (authenticated as the contract creator):

1. Click **"Release Milestone 1"** when work is complete
2. Confirm the MetaMask signature (no gas — just a signature to prove identity)
3. Blockchain `releaseMilestone()` is called → funds distributed to participants
4. Real-time WebSocket notification sent to all participants
5. Repeat for each milestone until contract is `completed`

---

### 9. Raise a Dispute

If something goes wrong:
1. Any participant visits the contract page
2. Click **"Raise Dispute"**
3. Escrow is automatically frozen (cannot release milestones until resolved)
4. Admin reviews via the disputes API
5. Admin can release or refund

---

## Page Index

| Page | URL | Who can access |
|------|-----|----------------|
| Landing | `/` | Everyone |
| Explore Participants | `/explore` | Everyone |
| Scan / Generate QR | `/scan` | Everyone (Generate tab: wallet required) |
| Product Verification (public) | `/product/:id` | Everyone |
| Full Contract Verification | `/verify/:id` | Everyone (payment section: wallet required) |
| Register Profile | `/onboard` | Wallet connected |
| KYC Verification | `/kyc` | Registered users |
| My Profile | `/profile` | Registered users |
| Create Contract | `/contract/new` | Registered users |
| Contract Detail | `/contract/:id` | Registered users |

---

## Real-Time Features (WebSocket)

All users connected to a contract room receive live events:

| Event | When it fires |
|-------|--------------|
| `receive_message` | New chat message in contract room |
| `user_typing` | Typing indicator |
| `user_online` / `user_offline` | Participant joined/left room |
| `escrow_update` | Milestone released or refund issued |
| `contract_locked` | Contract was locked on-chain |

These events update the UI without page refresh.

---

## Blockchain Details

| Component | Network | Contract |
|-----------|---------|----------|
| `EscrowContract.sol` | Polygon Amoy (testnet) | Holds and releases milestone payments |
| `ProofRegistry.sol` | Polygon Amoy (testnet) | Immutable IPFS CID registry (one-time registration) |
| IPFS Storage | Pinata / ipfs.io | Contract metadata (participants, terms, product info) |
| Gas Currency | MATIC (test) | Free from faucet.polygon.technology |

Every on-chain transaction can be verified at: https://amoy.polygonscan.com

---

## Testing Without Real Keys (Mock Mode)

The server auto-detects missing keys and switches to mock mode:

| Missing Key | Mock Behaviour |
|-------------|---------------|
| `ESCROW_CONTRACT_ADDRESS` | Returns fake `0xMOCK_...` tx hashes |
| `PROOF_REGISTRY_ADDRESS` | Same |
| `PINATA_JWT` | Returns a fake IPFS CID |
| `RAZORPAY_KEY_ID` (placeholder) | Creates mock order, auto-approved |

**Everything UI-wise works the same in mock mode.** You can demo the full flow without any API keys.
