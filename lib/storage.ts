// Simple in-memory storage for development
// In production, replace with a proper database

interface VerificationCode {
  email: string;
  code: string;
  expiresAt: number;
  name: string;
}

interface User {
  email: string;
  name: string;
  walletAddress: string;
  verificationCode: string; // 16-digit code
  verified: boolean;
}

interface Ride {
  id: string;
  hostEmail: string;
  hostWallet: string;
  destination: string;
  departureTime: string;
  createdAt: number;
  acceptedBy?: string;
  acceptedWallet?: string;
  price: number; // in SOL (lamports)
  status: 'open' | 'accepted' | 'completed';
}

// Use global variables to ensure storage persists across Next.js API route instances
// This is necessary because Next.js can run API routes in separate processes
declare global {
  // eslint-disable-next-line no-var
  var __storage_verificationCodes: Map<string, VerificationCode> | undefined;
  // eslint-disable-next-line no-var
  var __storage_users: Map<string, User> | undefined;
  // eslint-disable-next-line no-var
  var __storage_rides: Map<string, Ride> | undefined;
}

// Initialize global storage if it doesn't exist
const verificationCodes = global.__storage_verificationCodes || new Map<string, VerificationCode>();
const users = global.__storage_users || new Map<string, User>();
const rides = global.__storage_rides || new Map<string, Ride>();

// Assign to global to ensure persistence
if (!global.__storage_verificationCodes) global.__storage_verificationCodes = verificationCodes;
if (!global.__storage_users) global.__storage_users = users;
if (!global.__storage_rides) global.__storage_rides = rides;

export const storage = {
  // Verification codes
  saveVerificationCode(email: string, code: string, name: string) {
    verificationCodes.set(email, {
      email,
      code,
      name,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    });
  },

  getVerificationCode(email: string): VerificationCode | undefined {
    const data = verificationCodes.get(email);
    if (data && data.expiresAt > Date.now()) {
      return data;
    }
    if (data) {
      verificationCodes.delete(email);
    }
    return undefined;
  },

  deleteVerificationCode(email: string) {
    verificationCodes.delete(email);
  },

  // Users
  saveUser(user: User) {
    users.set(user.email, user);
  },

  getUser(email: string): User | undefined {
    return users.get(email);
  },

  getUserByWallet(walletAddress: string): User | undefined {
    return Array.from(users.values()).find(u => u.walletAddress === walletAddress);
  },

  // Rides
  createRide(ride: Ride) {
    rides.set(ride.id, ride);
    console.log('Ride stored in Map. Total rides:', rides.size);
    console.log('All ride IDs:', Array.from(rides.keys()));
  },

  getRide(id: string): Ride | undefined {
    const ride = rides.get(id);
    console.log('Getting ride:', {
      requestedId: id,
      found: !!ride,
      totalRides: rides.size,
      allIds: Array.from(rides.keys()),
    });
    return ride;
  },

  getAllRides(): Ride[] {
    return Array.from(rides.values()).filter(r => r.status === 'open');
  },

  // Get all rides including accepted ones (for debugging)
  getAllRidesIncludingAccepted(): Ride[] {
    return Array.from(rides.values());
  },

  updateRide(id: string, updates: Partial<Ride>) {
    const ride = rides.get(id);
    if (ride) {
      const updated = { ...ride, ...updates };
      rides.set(id, updated);
      console.log('Ride updated:', {
        id,
        oldStatus: ride.status,
        newStatus: updated.status,
        updates,
      });
      return updated;
    } else {
      console.error('Cannot update ride - not found:', id);
      return null;
    }
  },
};

