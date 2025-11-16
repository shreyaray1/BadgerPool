import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { riderEmail, riderWallet } = await request.json();
    const resolvedParams = await params;
    const rideId = resolvedParams.id;
    
    console.log('Accept ride request:', {
      rideId,
      riderEmail,
      riderWallet,
      url: request.url,
    });

    if (!riderEmail || !riderWallet) {
      return NextResponse.json(
        { error: 'Rider email and wallet are required.' },
        { status: 400 }
      );
    }

    // Verification check removed - always allow accepting rides

    // Get ride
    const ride = storage.getRide(rideId);
    if (!ride) {
      const allRides = storage.getAllRidesIncludingAccepted();
      console.error('Ride not found:', {
        rideId,
        requestedId: rideId,
        allRideIds: allRides.map(r => r.id),
        totalRides: allRides.length,
        openRides: storage.getAllRides().length,
      });
      return NextResponse.json(
        { error: 'Ride not found. It may have been removed or the server was restarted.' },
        { status: 404 }
      );
    }
    
    console.log('Found ride:', {
      id: ride.id,
      status: ride.status,
      hostWallet: ride.hostWallet,
      price: ride.price,
    });

    // Verify wallet address is stored
    if (!ride.hostWallet) {
      console.error('Host wallet address missing for ride:', rideId);
      return NextResponse.json(
        { error: 'Host wallet address not found for this ride.' },
        { status: 500 }
      );
    }

    console.log('Accepting ride:', {
      rideId,
      hostWallet: ride.hostWallet,
      riderWallet,
      price: ride.price,
    });

    if (ride.status !== 'open') {
      return NextResponse.json(
        { error: 'Ride is no longer available.' },
        { status: 400 }
      );
    }

    // Prevent users from accepting their own ride
    // Check by both email and wallet address for better security
    if (ride.hostEmail === riderEmail.toLowerCase()) {
      return NextResponse.json(
        { error: 'Cannot accept your own ride.' },
        { status: 400 }
      );
    }

    if (ride.hostWallet === riderWallet) {
      return NextResponse.json(
        { error: 'Cannot accept your own ride.' },
        { status: 400 }
      );
    }

    // Update ride status to accepted (but don't delete it)
    const updateResult = storage.updateRide(rideId, {
      acceptedBy: riderEmail.toLowerCase(),
      acceptedWallet: riderWallet,
      status: 'accepted',
    });

    if (!updateResult) {
      console.error('Failed to update ride:', rideId);
      return NextResponse.json(
        { error: 'Failed to update ride status.' },
        { status: 500 }
      );
    }

    // Verify the ride was updated correctly
    const updatedRide = storage.getRide(rideId);
    if (!updatedRide) {
      console.error('Ride disappeared after update:', rideId);
      return NextResponse.json(
        { error: 'Ride was not found after update.' },
        { status: 500 }
      );
    }

    console.log('Ride successfully accepted:', {
      rideId,
      status: updatedRide.status,
      acceptedBy: updatedRide.acceptedBy,
    });

    // Return payment details for frontend to process
    return NextResponse.json({
      success: true,
      message: 'Ride confirmed! Payment details below.',
      ride: updatedRide,
      payment: {
        amount: ride.price,
        from: riderWallet,
        to: ride.hostWallet, // This is the wallet address stored when ride was posted
      },
    });
  } catch (error) {
    console.error('Error accepting ride:', error);
    return NextResponse.json(
      { error: 'Failed to accept ride' },
      { status: 500 }
    );
  }
}

