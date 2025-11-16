# Badger Pool

A student ride-sharing application built on Solana, exclusively for University of Wisconsin-Madison students.

## Features

- 🔐 **Student Verification**: 3-step verification process using @wisc.edu email
  - Step 1: Enter name and email
  - Step 2: Verify 6-digit code sent to email
  - Step 3: Connect wallet and receive 16-digit verification code + NFT
- 🚗 **Ride Sharing**: Post and find rides with Solana payments
  - Post rides with destination and departure time
  - Accept rides and pay drivers automatically via Solana
- 🔗 **Solana Integration**: Full wallet connection (Phantom, Solflare, and more)
- ⚛️ **Next.js 14** with App Router
- 💅 **Tailwind CSS** for styling
- 📘 **TypeScript** for type safety

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. (Optional) Set up email configuration for verification codes:
   - Copy `.env.example` to `.env`
   - Add your SMTP credentials (Gmail, SendGrid, etc.)
   - If not configured, verification codes will be logged to console

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Application Flow

### Verification Process

1. **Get Verified** (`/verify`): Enter your name and @wisc.edu email
2. **Verify Code** (`/verify-code`): Enter the 6-digit code sent to your email
3. **Complete Verification** (`/complete-verification`): Connect your Solana wallet to receive your 16-digit verification code

### Ride Sharing

1. **Dashboard** (`/dashboard`): Main hub to post or find rides
2. **Post Ride** (`/post-ride`): Create a new ride with destination, time, and price
3. **Find Ride** (`/find-ride`): Browse available rides and accept them (payment is automatic)

## Wallet Configuration

The app is currently configured to use **Solana Devnet** by default. To switch to Mainnet:

1. Open `components/WalletProvider.tsx`
2. Change:
```typescript
const network = WalletAdapterNetwork.Devnet;
```
to:
```typescript
const network = WalletAdapterNetwork.Mainnet;
```

## Supported Wallets

- Phantom
- Solflare
- (More wallets can be added via `@solana/wallet-adapter-wallets`)

## Project Structure

```
badger-pool/
├── app/
│   ├── api/                    # API routes
│   │   ├── send-code/          # Send verification email
│   │   ├── verify-code/        # Verify 6-digit code
│   │   ├── complete-verification/  # Complete verification
│   │   ├── check-verification/     # Check verification status
│   │   └── rides/              # Ride management
│   ├── verify/                 # Step 1: Name & email
│   ├── verify-code/            # Step 2: Code verification
│   ├── complete-verification/  # Step 3: Wallet connection
│   ├── dashboard/              # Main dashboard
│   ├── post-ride/              # Post a new ride
│   ├── find-ride/              # Browse and accept rides
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Home page
│   └── globals.css             # Global styles
├── components/
│   └── WalletProvider.tsx      # Solana wallet provider
├── lib/
│   ├── storage.ts              # In-memory storage (replace with DB)
│   ├── email.ts                # Email sending service
│   └── nft.ts                  # NFT utilities
├── package.json
└── README.md
```

## Development Notes

- **Storage**: Currently uses in-memory storage. For production, replace with a database (PostgreSQL, MongoDB, etc.)
- **Email**: Configure SMTP in `.env` for production email sending. In development, codes are logged to console.
- **NFT Minting**: Currently returns a placeholder. Implement full NFT minting using Metaplex SDK for production.
- **Network**: Uses Solana Devnet by default. Change in `components/WalletProvider.tsx` for Mainnet.

## Build for Production

```bash
npm run build
npm start
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Solana Wallet Adapter](https://github.com/solana-labs/wallet-adapter)
- [Solana Web3.js](https://solana-labs.github.io/solana-web3.js/)

