"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL } from "@solana/web3.js";

export default function CompleteVerificationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { publicKey, connected, sendTransaction } = useWallet();
  const { connection } = useConnection();

  const email = searchParams.get("email") || "";
  const verificationCode = searchParams.get("code") || "";
  const name = searchParams.get("name") || "";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [completed, setCompleted] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    // Check if already verified
    if (email) {
      fetch(`/api/check-verification?email=${encodeURIComponent(email)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.verified) {
            setCompleted(true);
            setUserData(data.user);
          }
        })
        .catch(() => {});
    }
  }, [email]);

  const handleComplete = async () => {
    if (!connected || !publicKey) {
      setError("Please connect your wallet first");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // Complete verification
      const response = await fetch("/api/complete-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          verificationCode,
          walletAddress: publicKey.toString(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to complete verification");
      }

      setCompleted(true);
      setUserData(data.user);

      // Store email in localStorage for later use
      if (typeof window !== "undefined") {
        localStorage.setItem("userEmail", email);
      }

      // Navigate to dashboard after a moment
      setTimeout(() => {
        router.push("/dashboard");
      }, 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (completed && userData) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8">
        <div className="w-full max-w-md">
          <h1 className="text-4xl font-bold text-center mb-2 text-red-600">
            Badger Pool
          </h1>
          <p className="text-center text-gray-600 mb-8">Verification Complete!</p>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold mb-2">Verified!</h2>
              <p className="text-gray-600">Your student verification is complete.</p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Wallet Address</p>
                <p className="font-mono text-sm break-all">{userData.walletAddress}</p>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Verification Code (16-digit)
                </p>
                <p className="font-mono text-lg font-semibold">{userData.verificationCode}</p>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Email</p>
                <p className="text-sm">{userData.email}</p>
              </div>
            </div>

            <p className="text-sm text-center text-gray-600 mb-4">
              Redirecting to dashboard...
            </p>
          </div>
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
        <p className="text-center text-gray-600 mb-8">Complete Verification</p>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold mb-6">Step 3: Connect Wallet</h2>
          <p className="text-sm text-gray-600 mb-6">
            Connect your Solana wallet to complete verification and receive your verification NFT.
          </p>

          <div className="space-y-4 mb-6">
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Email</p>
              <p className="text-sm">{email}</p>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Verification Code
              </p>
              <p className="font-mono text-lg font-semibold">{verificationCode}</p>
            </div>
          </div>

          <div className="flex justify-center mb-6">
            <WalletMultiButton className="!bg-red-600 hover:!bg-red-700" />
          </div>

          {connected && publicKey && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700 dark:text-green-300 mb-2">
                ✓ Wallet Connected
              </p>
              <p className="text-xs font-mono break-all text-green-600 dark:text-green-400">
                {publicKey.toString()}
              </p>
            </div>
          )}

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <button
            onClick={handleComplete}
            disabled={loading || !connected || !publicKey}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? "Completing..." : "Complete Verification"}
          </button>
        </div>
      </div>
    </main>
  );
}

