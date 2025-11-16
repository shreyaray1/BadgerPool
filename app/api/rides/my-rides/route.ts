import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const walletAddress = searchParams.get('wallet');

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required.' },
        { status: 400 }
      );
    }

    // Get all rides (including accepted ones)
    const allRides = storage.getAllRidesIncludingAccepted();
    
    // Filter rides where user is host or rider
    const myRides = allRides.filter(
      (ride) =>
        ride.hostWallet === walletAddress ||
        ride.acceptedWallet === walletAddress
    );

    return NextResponse.json({ rides: myRides });
  } catch (error) {
    console.error('Error fetching my rides:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rides' },
      { status: 500 }
    );
  }
}

