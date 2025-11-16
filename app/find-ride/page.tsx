"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { format } from "date-fns";
import Link from "next/link";
import { solToUsd, formatCurrency } from "@/lib/utils";

interface Ride {
  id: string;
  hostEmail: string;
  hostWallet: string;
  destination: string;
  departureTime: string;
  price: number;
  status: string;
}

export default function FindRidePage() {
  const router = useRouter();
  const { publicKey, connected, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [walletBalance, setWalletBalance] = useState<number | null>(null);

  useEffect(() => {
    fetchRides();
    const interval = setInterval(fetchRides, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  // Fetch wallet balance when connected
  useEffect(() => {
    const fetchBalance = async () => {
      if (connected && publicKey && connection) {
        try {
          const balance = await connection.getBalance(publicKey);
          setWalletBalance(balance / LAMPORTS_PER_SOL); // Convert to SOL
        } catch (err) {
          console.error("Error fetching balance:", err);
          setWalletBalance(null);
        }
      } else {
        setWalletBalance(null);
      }
    };

    fetchBalance();
    // Refresh balance every 10 seconds
    const balanceInterval = setInterval(fetchBalance, 10000);
    return () => clearInterval(balanceInterval);
  }, [connected, publicKey, connection]);

  const fetchRides = async () => {
    try {
      const response = await fetch("/api/rides");
      const data = await response.json();
      if (data.rides) {
        setRides(data.rides);
      }
    } catch (err) {
      console.error("Error fetching rides:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRide = async (ride: Ride) => {
    if (!connected || !publicKey) {
      setError("Please connect your wallet");
      return;
    }

    // Prevent users from accepting their own ride
    if (ride.hostWallet === publicKey.toString()) {
      setError("You cannot accept your own ride");
      return;
    }

    // Check if user has enough balance
    if (walletBalance !== null) {
      // Add 0.001 SOL buffer for transaction fees
      const requiredAmount = ride.price + 0.001;
      if (walletBalance < requiredAmount) {
        setError(`Insufficient funds. You need ${requiredAmount.toFixed(3)} SOL but only have ${walletBalance.toFixed(3)} SOL.`);
        return;
      }
    }

    setAccepting(ride.id);
    setError("");

    try {
      // Get user email (in production, get from API)
      const email = localStorage.getItem("userEmail") || "";

      // Accept the ride
      const response = await fetch(`/api/rides/${ride.id}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          riderEmail: email || "test2@wisc.edu",
          riderWallet: publicKey.toString(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to accept ride");
      }

      // Get the host's wallet address from the response
      const hostWalletAddress = data.payment?.to || ride.hostWallet;
      
      if (!hostWalletAddress) {
        throw new Error("Host wallet address not found");
      }

      // Final balance check before sending transaction
      const currentBalance = await connection.getBalance(publicKey);
      const currentBalanceSOL = currentBalance / LAMPORTS_PER_SOL;
      const requiredAmount = ride.price + 0.001; // Price + transaction fee buffer
      
      if (currentBalanceSOL < requiredAmount) {
        throw new Error(`Insufficient funds. You need ${requiredAmount.toFixed(3)} SOL but only have ${currentBalanceSOL.toFixed(3)} SOL.`);
      }

      console.log('Creating payment transaction:', {
        from: publicKey.toString(),
        to: hostWalletAddress,
        amount: ride.price,
        lamports: Math.round(ride.price * LAMPORTS_PER_SOL),
        currentBalance: currentBalanceSOL,
      });

      // Create payment transaction to the host's wallet
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(hostWalletAddress),
          lamports: Math.round(ride.price * LAMPORTS_PER_SOL),
        })
      );

      // Send transaction
      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, "confirmed");

      console.log('Payment successful:', {
        signature,
        amount: ride.price,
        to: hostWalletAddress,
      });

      // Refresh rides
      fetchRides();
      
      // Navigate to confirmation page
      router.push(`/ride-confirmed/${ride.id}`);
    } catch (err: any) {
      setError(err.message || "Failed to accept ride");
    } finally {
      setAccepting(null);
    }
  };

  // Allow viewing rides without wallet connection
  // Wallet connection only required when accepting a ride

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-red-600">Find a Ride</h1>
            {connected && walletBalance !== null && (
              <p className="text-sm text-gray-600 mt-1">
                Wallet Balance: <span className="font-semibold">{walletBalance.toFixed(4)} SOL</span>
              </p>
            )}
            {!connected && (
              <p className="text-sm text-gray-500 mt-1">
                Connect your wallet to accept rides
              </p>
            )}
          </div>
          <div className="flex gap-4 items-center">
            <Link
              href="/post-ride"
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Post Ride
            </Link>
            <WalletMultiButton className="!bg-red-600 hover:!bg-red-700" />
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {loading ? (
          <p>Loading rides...</p>
        ) : rides.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
            <p className="text-gray-600 mb-4">No rides available at the moment.</p>
            <Link
              href="/post-ride"
              className="text-red-600 hover:underline"
            >
              Be the first to post a ride!
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {rides.map((ride) => (
              <div
                key={ride.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">{ride.destination}</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-1">
                      <span className="font-medium">Departure:</span>{" "}
                      {format(new Date(ride.departureTime), "PPp")}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 mb-1">
                      <span className="font-medium">Price:</span> {ride.price} SOL ({formatCurrency(solToUsd(ride.price))})
                    </p>
                    <p className="text-xs text-gray-500 font-mono mt-2">
                      Host: {ride.hostWallet.slice(0, 8)}...{ride.hostWallet.slice(-8)}
                    </p>
                  </div>
                  {!connected ? (
                    <div className="flex flex-col items-end gap-2">
                      <p className="text-sm text-gray-500">Connect wallet to accept</p>
                      <WalletMultiButton className="!bg-red-600 hover:!bg-red-700 !text-sm" />
                    </div>
                  ) : (
                    <button
                      onClick={() => handleAcceptRide(ride)}
                    disabled={
                      accepting === ride.id || 
                      ride.status !== "open" ||
                      (connected && publicKey && ride.hostWallet === publicKey.toString()) ||
                      (walletBalance !== null && walletBalance < ride.price + 0.001)
                    }
                      className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      title={
                        walletBalance !== null && walletBalance < ride.price + 0.001
                          ? `Insufficient funds. Need ${(ride.price + 0.001).toFixed(3)} SOL, have ${walletBalance.toFixed(3)} SOL`
                          : undefined
                      }
                    >
                      {accepting === ride.id 
                        ? "Processing..." 
                        : (connected && publicKey && ride.hostWallet === publicKey.toString())
                          ? "Your Ride"
                          : (walletBalance !== null && walletBalance < ride.price + 0.001)
                            ? "Insufficient Funds"
                            : "Accept Ride"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

