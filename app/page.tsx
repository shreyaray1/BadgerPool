"use client";

import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export default function Home() {
  const { connected } = useWallet();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-5xl font-bold text-center mb-4 text-red-600">
          Badger Pool
        </h1>
        <p className="text-center text-xl text-gray-600 mb-12">
          Student Ride Sharing on Solana
        </p>
        
        <div className="flex flex-col items-center gap-8">
          {!connected && (
            <div className="mb-8">
              <WalletMultiButton className="!bg-red-600 hover:!bg-red-700" />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
            <Link
              href="/verify"
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 hover:shadow-xl transition text-center"
            >
              <h2 className="text-2xl font-semibold mb-4">Get Verified</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Verify your student status with your @wisc.edu email
              </p>
            </Link>

            {connected && (
              <Link
                href="/dashboard"
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 hover:shadow-xl transition text-center"
              >
                <h2 className="text-2xl font-semibold mb-4">Dashboard</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Post or find rides
                </p>
              </Link>
            )}
          </div>

          {!connected && (
            <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg max-w-md w-full">
              <p className="text-center text-gray-700 dark:text-gray-300">
                Connect your Solana wallet to get started
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

