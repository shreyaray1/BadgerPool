"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
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
  acceptedBy?: string;
  acceptedWallet?: string;
  createdAt: number;
}

export default function RideConfirmedPage() {
  const params = useParams();
  const router = useRouter();
  const { publicKey, connected } = useWallet();
  const rideId = params.id as string;

  const [ride, setRide] = useState<Ride | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (rideId) {
      fetchRideDetails();
    }
  }, [rideId]);

  const fetchRideDetails = async () => {
    try {
      const response = await fetch(`/api/rides/${rideId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch ride details");
      }

      setRide(data.ride);
    } catch (err: any) {
      setError(err.message || "Failed to load ride details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-gray-600">Loading ride details...</p>
      </main>
    );
  }

  if (error || !ride) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8">
        <div className="w-full max-w-md text-center">
          <h1 className="text-4xl font-bold mb-4 text-red-600">Badger Pool</h1>
          <p className="text-red-600 mb-4">{error || "Ride not found"}</p>
          <Link
            href="/find-ride"
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Back to Find Rides
          </Link>
        </div>
      </main>
    );
  }

  const isHost = connected && publicKey && ride.hostWallet === publicKey.toString();
  const isRider = connected && publicKey && ride.acceptedWallet === publicKey.toString();

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-red-600">Ride Confirmed!</h1>
          <div className="flex gap-4 items-center">
            <Link
              href="/find-ride"
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              Find More Rides
            </Link>
            <WalletMultiButton className="!bg-red-600 hover:!bg-red-700" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-6">
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
            <h2 className="text-2xl font-semibold mb-2">Your ride is confirmed!</h2>
            <p className="text-gray-600">
              Payment has been processed. You can now coordinate with your ride partner.
            </p>
          </div>

          <div className="space-y-6">
            {/* Ride Details */}
            <div className="border-t border-b border-gray-200 dark:border-gray-700 py-6">
              <h3 className="text-xl font-semibold mb-4">Ride Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Destination</p>
                  <p className="text-lg font-semibold">{ride.destination}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Departure Time</p>
                  <p className="text-lg font-semibold">
                    {format(new Date(ride.departureTime), "PPp")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Price</p>
                  <p className="text-lg font-semibold">
                    {ride.price} SOL ({formatCurrency(solToUsd(ride.price))})
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Status</p>
                  <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                    {ride.status === "accepted" ? "Confirmed" : ride.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Participants */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Participants</h3>
              <div className="space-y-4">
                {/* Host */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold">Host</span>
                        {isHost && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            You
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Email: {ride.hostEmail}
                      </p>
                      <p className="text-xs font-mono text-gray-500 break-all">
                        Wallet: {ride.hostWallet}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-green-600">Receives</p>
                      <p className="text-xs text-gray-500">
                        {formatCurrency(solToUsd(ride.price))}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Rider (if accepted) */}
                {ride.acceptedBy && ride.acceptedWallet && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold">Rider</span>
                          {isRider && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              You
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          Email: {ride.acceptedBy}
                        </p>
                        <p className="text-xs font-mono text-gray-500 break-all">
                          Wallet: {ride.acceptedWallet}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-red-600">Paid</p>
                        <p className="text-xs text-gray-500">
                          {formatCurrency(solToUsd(ride.price))}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Next Steps</h4>
              <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 list-disc list-inside">
                <li>Contact your ride partner using their email address</li>
                <li>Confirm the exact meeting location and time</li>
                <li>Share any additional details about the ride</li>
                <li>Enjoy your ride!</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-4">
          <Link
            href="/dashboard"
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Back to Dashboard
          </Link>
          <Link
            href="/find-ride"
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            Find More Rides
          </Link>
        </div>
      </div>
    </main>
  );
}

