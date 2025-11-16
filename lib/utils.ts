// Utility functions

// SOL to USD conversion rate (approximate, update as needed)
// In production, fetch from an API like CoinGecko
const SOL_TO_USD_RATE = 150; // $150 per SOL (approximate)

export function solToUsd(solAmount: number): number {
  return solAmount * SOL_TO_USD_RATE;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

