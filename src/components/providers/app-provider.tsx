'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { auth } from '@/lib/firebase-config';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { 
  getUser, 
  createUser, 
  updateUser as updateUserFirestore,
  getUserByReferralCode,
  recordReferral,
  onUserChange
} from '@/lib/firestore-service';
import { database } from '@/lib/firebase-config';
import { ref, set } from 'firebase/database';

export interface User {
  id: string;
  name: string;
  email: string;
  referralCode: string;
  referredBy?: string;
  totalReferrals: number;
  credits?: number;
}

interface AppContextType {
  user: User | null;
  isLoggedIn: boolean;
  logout: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('🔄 AppProvider mounted - starting auth check');
    
    // Set a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.warn('⏱️ Firebase auth timeout - proceeding with unauthenticated state');
      setIsLoading(false);
    }, 10000); // 10 second timeout

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('✅ onAuthStateChanged fired:', firebaseUser ? `User: ${firebaseUser.email}` : 'No user');
      clearTimeout(timeoutId); // Clear timeout if Firebase responds
      
      if (firebaseUser) {
        try {
          // Try to get existing user from Firestore
          let userData = await getUser(firebaseUser.uid);
          
          if (!userData) {
            // Create new user in Firestore if doesn't exist
            const referralCode = `REF${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
            
            // Check if user was referred via ?ref= parameter
            const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
            const refCode = searchParams.get('ref');
            
            // Build user data, only include referredBy if it has a value
            const newUserData: any = {
              name: firebaseUser.displayName || 'User',
              email: firebaseUser.email || '',
              referralCode,
              totalReferrals: 0,
              credits: 0,
            };
            
            // Only add referredBy if there's a valid referral code
            if (refCode) {
              newUserData.referredBy = refCode;
            }
            
            await createUser(firebaseUser.uid, newUserData);
            
            // Record referral if user was referred
            if (refCode) {
              const referrer = await getUserByReferralCode(refCode);
              if (referrer) {
                await recordReferral(referrer.id, firebaseUser.uid);
              }
            }
            
            userData = await getUser(firebaseUser.uid);
          }
          
          if (userData) {
            setUser(userData);
            
            // Also save to Realtime Database for admin panel tracking
            try {
              const userRef = ref(database, `users/${firebaseUser.uid}`);
              await set(userRef, {
                id: firebaseUser.uid,
                name: userData.name,
                email: userData.email,
                referralCode: userData.referralCode,
                referredBy: userData.referredBy || null,
                totalReferrals: userData.totalReferrals || 0,
                credits: userData.credits || 0,
                createdAt: new Date().toISOString(),
              });
            } catch (realtimeError) {
              console.warn('⚠️ Could not save to Realtime DB:', realtimeError);
            }
            
            // Set up real-time listener for this user
            const unsubscribeListener = onUserChange(firebaseUser.uid, (updatedUser) => {
              if (updatedUser) {
                setUser(updatedUser);
              }
            });
            
            // Don't return here - let it continue to setIsLoading(false)
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          // Fallback user object
          const fallbackUser: User = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || 'User',
            email: firebaseUser.email || '',
            referralCode: 'REF' + Math.random().toString(36).substring(2, 8),
            totalReferrals: 0,
            credits: 0,
          };
          setUser(fallbackUser);
        }
      } else {
        setUser(null);
      }
      console.log('🏁 Setting isLoading to false');
      setIsLoading(false);
    });

    return () => {
      clearTimeout(timeoutId);
      unsubscribe();
    };
  }, []);

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const updateUser = async (updates: Partial<User>) => {
    if (user) {
      try {
        const updated = { ...user, ...updates };
        setUser(updated);
        // Update in Firestore
        await updateUserFirestore(user.id, updates);
      } catch (error) {
        console.error('Error updating user:', error);
      }
    }
  };

  return (
    <AppContext.Provider value={{ user, isLoggedIn: !!user, logout, updateUser, isLoading }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
