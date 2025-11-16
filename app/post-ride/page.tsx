"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { solToUsd, formatCurrency } from "@/lib/utils";

export default function PostRidePage() {
  const router = useRouter();
  const { publicKey, connected } = useWallet();
  const [destination, setDestination] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [price, setPrice] = useState("0.1");
  const [priceInDollars, setPriceInDollars] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Update dollar amount when SOL price changes
  useEffect(() => {
    const solAmount = parseFloat(price) || 0;
    const usdAmount = solToUsd(solAmount);
    setPriceInDollars(formatCurrency(usdAmount));
  }, [price]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!connected || !publicKey) {
      setError("Please connect your wallet");
      return;
    }

    setLoading(true);

    try {
      // Get user email from storage (in production, get from API)
      const email = localStorage.getItem("userEmail") || "";

      const response = await fetch("/api/rides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hostEmail: email || "test@wisc.edu", // Fallback for development
          hostWallet: publicKey.toString(),
          destination,
          departureTime,
          price: parseFloat(price),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to post ride");
      }

      router.push("/find-ride");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!connected) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8">
        <div className="w-full max-w-md text-center">
          <h1 className="text-4xl font-bold mb-4 text-red-600">Badger Pool</h1>
          <p className="mb-6">Please connect your wallet to post a ride</p>
          <WalletMultiButton className="!bg-red-600 hover:!bg-red-700" />
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-bold text-center mb-2 text-red-600">
          Badger Pool
        </h1>
        <p className="text-center text-gray-600 mb-8">Post a Ride</p>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="flex justify-end mb-6">
            <WalletMultiButton className="!bg-red-600 hover:!bg-red-700" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="destination" className="block text-sm font-medium mb-2">
                Destination
              </label>
              <input
                id="destination"
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="e.g., O'Hare Airport"
              />
            </div>

            <div>
              <label htmlFor="departureTime" className="block text-sm font-medium mb-2">
                Departure Time
              </label>
              <input
                id="departureTime"
                type="datetime-local"
                value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-medium mb-2">
                Price (SOL)
              </label>
              <input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="0.1"
              />
              {priceInDollars && (
                <p className="text-sm text-gray-600 mt-1">
                  ≈ {priceInDollars} USD
                </p>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? "Posting..." : "Post Ride"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

