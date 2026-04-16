/**
 * REAL PRODUCTION REFERRAL SYSTEM
 * 
 * Tracks referrals in Firestore with:
 * - Referrer/Referred relationship
 * - Purchase status tracking
 * - Reward claiming system
 * - Real-time listeners
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  writeBatch,
  runTransaction,
} from 'firebase/firestore';
import { db } from '@/lib/firebase-config';

// ===== TYPES =====

export interface ReferralRecord {
  id: string;
  referrerUid: string;
  referrerName?: string;
  referrerEmail?: string;
  referredUid: string;
  referredName?: string;
  referredEmail?: string;
  referralCode: string;
  joinedAt: Timestamp;
  purchasedPlan: boolean;
  purchasedAt?: Timestamp;
  purchasedPlanName?: string;
  rewardAmount: number;
  rewardClaimed: boolean;
  claimedAt?: Timestamp;
  status: 'joined' | 'purchased' | 'claimed';
}

// ===== CREATE REFERRAL RECORD =====

/**
 * Track referral when referred user joins
 * Call this when new user signs up with referral code
 */
export async function createReferralRecord(
  referrerUid: string,
  referredUid: string,
  referralCode: string,
  referrerName?: string,
  referrerEmail?: string,
  referredName?: string,
  referredEmail?: string
): Promise<string | null> {
  try {
    const referralRef = collection(db, 'referrals');
    const docRef = await addDoc(referralRef, {
      referrerUid,
      referrerName,
      referrerEmail,
      referredUid,
      referredName,
      referredEmail,
      referralCode,
      joinedAt: Timestamp.now(),
      purchasedPlan: false,
      purchasedAt: null,
      purchasedPlanName: null,
      rewardAmount: 5, // ₹5 reward per purchase
      rewardClaimed: false,
      claimedAt: null,
      status: 'joined',
    });

    console.log(`✅ Referral created: ${docRef.id}`);
    return docRef.id;
  } catch (error) {
    console.error('Error creating referral record:', error);
    return null;
  }
}

// ===== UPDATE REFERRAL STATUS =====

/**
 * Mark referral as purchased when referred user buys subscription
 * Called after successful order/payment
 */
export async function markReferralAsPurchased(
  referredUid: string,
  planName: string
): Promise<void> {
  try {
    // Find referral by referred user ID
    const referralRef = collection(db, 'referrals');
    const q = query(
      referralRef,
      where('referredUid', '==', referredUid),
      where('purchasedPlan', '==', false)
    );

    const snapshot = await getDocs(q);

    if (snapshot.docs.length === 0) {
      console.warn(`⚠️ No pending referral found for ${referredUid}`);
      return;
    }

    const referralDoc = snapshot.docs[0];
    await updateDoc(referralDoc.ref, {
      purchasedPlan: true,
      purchasedAt: Timestamp.now(),
      purchasedPlanName: planName,
      status: 'purchased',
    });

    console.log(`✅ Referral marked as purchased: ${referralDoc.id}`);
  } catch (error) {
    console.error('Error marking referral as purchased:', error);
  }
}

// ===== CLAIM REWARD =====

/**
 * Claim reward amount to referrer's wallet
 * Uses transaction to prevent duplicate claims
 */
export async function claimReferralReward(
  referrerUid: string,
  referralId: string,
  rewardAmount: number
): Promise<boolean> {
  try {
    const success = await runTransaction(db, async (transaction) => {
      // 1. Get referral document
      const referralRef = doc(db, 'referrals', referralId);
      const referralSnap = await transaction.get(referralRef);

      if (!referralSnap.exists()) {
        console.error(`Referral not found: ${referralId}`);
        return false;
      }

      const referral = referralSnap.data() as ReferralRecord;

      // Check if already claimed
      if (referral.rewardClaimed) {
        console.warn(`Reward already claimed for ${referralId}`);
        return false;
      }

      // Check if purchased
      if (!referral.purchasedPlan) {
        console.warn(`Referral not yet purchased: ${referralId}`);
        return false;
      }

      // 2. Update referral to mark as claimed
      transaction.update(referralRef, {
        rewardClaimed: true,
        claimedAt: Timestamp.now(),
        status: 'claimed',
      });

      // 3. Add to referrer's wallet balance
      const userRef = doc(db, 'users', referrerUid);
      const userSnap = await transaction.get(userRef);

      if (!userSnap.exists()) {
        console.error(`User not found: ${referrerUid}`);
        return false;
      }

      const currentBalance = userSnap.data()?.usableBalance || 0;
      transaction.update(userRef, {
        usableBalance: currentBalance + rewardAmount,
      });

      // 4. Add wallet transaction history
      const walletRef = collection(db, 'users', referrerUid, 'walletHistory');
      const historyRef = doc(walletRef);
      transaction.set(historyRef, {
        type: 'referral_reward',
        amount: rewardAmount,
        description: `Referral reward from ${referral.referredName || 'User'} purchase`,
        referralId,
        createdAt: Timestamp.now(),
        balanceBefore: currentBalance,
        balanceAfter: currentBalance + rewardAmount,
      });

      return true;
    });

    if (success) {
      console.log(`✅ Reward claimed: ₹${rewardAmount} added to wallet`);
      return true;
    } else {
      console.error('Failed to claim reward (already claimed or not purchased)');
      return false;
    }
  } catch (error) {
    console.error('Error claiming reward:', error);
    return false;
  }
}

// ===== REAL-TIME LISTENERS =====

/**
 * Listen to all referrals for a specific user (as referrer)
 * Returns real-time updates when status changes
 */
export function listenToMyReferrals(
  referrerUid: string,
  callback: (referrals: ReferralRecord[]) => void
): () => void {
  try {
    const referralRef = collection(db, 'referrals');
    const q = query(referralRef, where('referrerUid', '==', referrerUid), orderBy('joinedAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const referrals = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as ReferralRecord));

        console.log(`📊 Loaded ${referrals.length} referrals`);
        callback(referrals);
      },
      (error) => {
        console.error('Error listening to referrals:', error);
        callback([]);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up referrals listener:', error);
    return () => {};
  }
}

/**
 * Get referrals by status
 */
export function listenToReferralsByStatus(
  referrerUid: string,
  status: 'joined' | 'purchased' | 'claimed',
  callback: (referrals: ReferralRecord[]) => void
): () => void {
  try {
    const referralRef = collection(db, 'referrals');
    const q = query(
      referralRef,
      where('referrerUid', '==', referrerUid),
      where('status', '==', status),
      orderBy('joinedAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const referrals = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as ReferralRecord));

        callback(referrals);
      },
      (error) => {
        console.error(`Error listening to ${status} referrals:`, error);
        callback([]);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up referrals status listener:', error);
    return () => {};
  }
}

/**
 * Get referral stats
 */
export async function getReferralStats(referrerUid: string): Promise<{
  total: number;
  joined: number;
  purchased: number;
  claimed: number;
  totalEarnings: number;
  pendingRewards: number;
}> {
  try {
    const referralRef = collection(db, 'referrals');
    const q = query(referralRef, where('referrerUid', '==', referrerUid));
    const snapshot = await getDocs(q);

    const referrals = snapshot.docs.map((doc) => doc.data() as ReferralRecord);

    const stats = {
      total: referrals.length,
      joined: referrals.filter((r) => r.status === 'joined').length,
      purchased: referrals.filter((r) => r.status === 'purchased').length,
      claimed: referrals.filter((r) => r.status === 'claimed').length,
      totalEarnings: referrals.filter((r) => r.rewardClaimed).length * 5,
      pendingRewards: referrals.filter((r) => r.purchasedPlan && !r.rewardClaimed).length * 5,
    };

    return stats;
  } catch (error) {
    console.error('Error getting referral stats:', error);
    return {
      total: 0,
      joined: 0,
      purchased: 0,
      claimed: 0,
      totalEarnings: 0,
      pendingRewards: 0,
    };
  }
}

// ===== APPLY REFERRAL CODE =====

/**
 * Apply a referral code to current user
 * Validates code and creates referral relationship
 */
export async function applyReferralCode(
  currentUserId: string,
  referralCode: string
): Promise<{ success: boolean; message: string; referrerId?: string }> {
  try {
    if (!referralCode.trim()) {
      return { success: false, message: 'Please enter a referral code' };
    }

    if (!currentUserId) {
      return { success: false, message: 'Please login first' };
    }

    // Step 1: Find referrer by their referral code
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('referralCode', '==', referralCode.trim()));
    const referrerSnapshot = await getDocs(q);

    if (referrerSnapshot.empty) {
      return { success: false, message: 'Invalid referral code' };
    }

    const referrerId = referrerSnapshot.docs[0].id;
    const referrerData = referrerSnapshot.docs[0].data();

    // Step 2: Check if user is applying their own code
    if (referrerId === currentUserId) {
      return { success: false, message: 'You cannot use your own referral code' };
    }

    // Step 3: Check if already applied
    const referralRef = collection(db, 'referrals');
    const existingQ = query(
      referralRef,
      where('referredUid', '==', currentUserId),
      where('referrerUid', '==', referrerId)
    );
    const existingSnapshot = await getDocs(existingQ);

    if (!existingSnapshot.empty) {
      return { success: false, message: 'This code has already been applied' };
    }

    // Step 4: Check for circular referrals (current user hasn't referred the referrer)
    const circularQ = query(
      referralRef,
      where('referrerUid', '==', currentUserId),
      where('referredUid', '==', referrerId)
    );
    const circularSnapshot = await getDocs(circularQ);

    if (!circularSnapshot.empty) {
      return { success: false, message: 'Circular referrals are not allowed. You already referred this person!' };
    }

    // Step 5: Get current user data
    const currentUserRef = doc(db, 'users', currentUserId);
    const currentUserSnap = await getDoc(currentUserRef);
    const currentUserData = currentUserSnap.exists() ? currentUserSnap.data() : {};

    // Step 6: Create referral record
    const recordId = await createReferralRecord(
      referrerId,
      currentUserId,
      referralCode.trim(),
      referrerData.name || 'User',
      referrerData.email || '',
      currentUserData.name || 'User',
      currentUserData.email || ''
    );

    if (!recordId) {
      return { success: false, message: 'Failed to apply referral code. Please try again.' };
    }

    return {
      success: true,
      message: `You're now part of ${referrerData.name || 'their'} team! 🎉`,
      referrerId,
    };
  } catch (error: any) {
    console.error('Error applying referral code:', error);
    return {
      success: false,
      message: error?.message || 'Error applying code. Please try again.',
    };
  }
}
