import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rideId } = await params;
    
    const ride = storage.getRide(rideId);
    
    if (!ride) {
      return NextResponse.json(
        { error: 'Ride not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, ride });
  } catch (error) {
    console.error('Error fetching ride:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ride' },
      { status: 500 }
    );
  }
}

