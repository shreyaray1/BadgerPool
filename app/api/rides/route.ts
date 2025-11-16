import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  try {
    const rides = storage.getAllRides();
    return NextResponse.json({ rides });
  } catch (error) {
    console.error('Error fetching rides:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rides' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { hostEmail, hostWallet, destination, departureTime, price } = await request.json();

    if (!hostEmail || !hostWallet || !destination || !departureTime) {
      return NextResponse.json(
        { error: 'All fields are required.' },
        { status: 400 }
      );
    }

    // Verification check removed - always allow posting rides

    const ride = {
      id: uuidv4(),
      hostEmail: hostEmail.toLowerCase(),
      hostWallet, // Store the wallet address for payment
      destination,
      departureTime,
      createdAt: Date.now(),
      price: price || 0.1, // Default 0.1 SOL
      status: 'open' as const,
    };

    // Store the ride with wallet address
    storage.createRide(ride);
    
    console.log('Ride created:', {
      id: ride.id,
      hostWallet: ride.hostWallet,
      destination: ride.destination,
      price: ride.price,
    });

    return NextResponse.json({ success: true, ride });
  } catch (error) {
    console.error('Error creating ride:', error);
    return NextResponse.json(
      { error: 'Failed to create ride' },
      { status: 500 }
    );
  }
}

