"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Link from "next/link";
import { format } from "date-fns";
import { solToUsd, formatCurrency } from "@/lib/utils";

interface Ride {
  id: string;
  hostEmail: string;
  hostWallet: string;
  destination: string;
  departureTime: string;
  price: number;
  status: string;
  acceptedBy?: string;
  acceptedWallet?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { publicKey, connected } = useWallet();
  const [myRides, setMyRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (connected && publicKey) {
      fetchMyRides();
      const interval = setInterval(fetchMyRides, 5000);
      return () => clearInterval(interval);
    } else {
      setLoading(false);
    }
  }, [connected, publicKey]);

  const fetchMyRides = async () => {
    if (!publicKey) return;
    
    try {
      const response = await fetch(`/api/rides/my-rides?wallet=${publicKey.toString()}`);
      const data = await response.json();
      if (data.rides) {
        setMyRides(data.rides);
      }
    } catch (err) {
      console.error("Error fetching my rides:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </main>
    );
  }

  if (!connected) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8">
        <div className="w-full max-w-md text-center">
          <h1 className="text-4xl font-bold mb-4 text-red-600">Badger Pool</h1>
          <p className="mb-6">Please connect your wallet to continue</p>
          <WalletMultiButton className="!bg-red-600 hover:!bg-red-700" />
        </div>
      </main>
    );
  }

  const isHost = (ride: Ride) => ride.hostWallet === publicKey?.toString();
  const isRider = (ride: Ride) => ride.acceptedWallet === publicKey?.toString();

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-red-600">Badger Pool</h1>
          <WalletMultiButton className="!bg-red-600 hover:!bg-red-700" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link
            href="/post-ride"
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition cursor-pointer"
          >
            <h2 className="text-2xl font-semibold mb-2">Post a Ride</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Share your ride and let other students join you
            </p>
          </Link>

          <Link
            href="/find-ride"
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition cursor-pointer"
          >
            <h2 className="text-2xl font-semibold mb-2">Find a Ride</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Browse available rides and join other students
            </p>
          </Link>
        </div>

        {/* My Rides Section */}
        {myRides.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">My Rides</h2>
            <div className="space-y-4">
              {myRides.map((ride) => (
                <Link
                  key={ride.id}
                  href={`/ride-confirmed/${ride.id}`}
                  className="block bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-semibold">{ride.destination}</h3>
                        <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">
                          {isHost(ride) ? "Host" : "Rider"}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            ride.status === "accepted"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {ride.status === "accepted" ? "Confirmed" : ride.status}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-1">
                        <span className="font-medium">Departure:</span>{" "}
                        {format(new Date(ride.departureTime), "PPp")}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Price:</span> {ride.price} SOL (
                        {formatCurrency(solToUsd(ride.price))})
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-gray-500">View Details →</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

