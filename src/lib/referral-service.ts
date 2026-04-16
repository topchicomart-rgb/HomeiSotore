/**
 * REFERRAL REWARD SYSTEM
 * 
 * Features:
 * - Track referrals with unique codes
 * - Wallet-based rewards
 * - Reward percentage/fixed amounts
 * - Reward history and progress levels
 * - Duplicate prevention
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  addDoc,
  query,
  where,
  onSnapshot,
  Timestamp,
  increment,
  writeBatch,
} from 'firebase/firestore';
import { db } from '@/lib/firebase-config';
import { sendNotification } from '@/lib/firebase-service';
import { updateUser } from '@/lib/firestore-service';
import {
  notifyReferrerNewSignup,
  notifyReferredUserWelcome,
  notifySubscriptionReminder,
} from '@/lib/notification-service';

// ===== TYPES =====

export interface Referral {
  id: string;
  referrerId: string;
  referredUserId: string;
  status: 'signed_up' | 'purchased';
  rewardGiven: boolean;
  rewardAmount?: number;
  createdAt: Timestamp;
  purchasedAt?: Timestamp;
}

export interface Reward {
  id: string;
  referrerId: string;
  referredUserId: string;
  type: 'signup' | 'purchase';
  amount: number;
  reason: string;
  createdAt: Timestamp;
}

export interface Wallet {
  userId: string;
  balance: number;
  totalEarnings: number;
  updatedAt: Timestamp;
}

export interface ReferralLevel {
  level: 'Beginner' | 'Pro' | 'Elite';
  minReferrals: number;
  minEarnings: number;
  bonus: number; // bonus percentage/amount
}

// Referral level tiers
const REFERRAL_LEVELS: ReferralLevel[] = [
  { level: 'Beginner', minReferrals: 0, minEarnings: 0, bonus: 0 },
  { level: 'Pro', minReferrals: 5, minEarnings: 25, bonus: 5 },
  { level: 'Elite', minReferrals: 15, minEarnings: 100, bonus: 10 },
];

// Reward amounts
const REWARD_CONFIG = {
  SIGNUP: 5, // $5 for signup
  PURCHASE: 5, // $5 for purchase
};

// ===== WALLET MANAGEMENT =====

/**
 * Initialize wallet for new user
 */
export async function initializeWallet(userId: string): Promise<Wallet> {
  try {
    const walletRef = doc(db, 'wallets', userId);
    const wallet: Wallet = {
      userId,
      balance: 0,
      totalEarnings: 0,
      updatedAt: Timestamp.now(),
    };
    await setDoc(walletRef, wallet);
    return wallet;
  } catch (error) {
    console.error('Error initializing wallet:', error);
    throw error;
  }
}

/**
 * Get wallet for user
 */
export async function getWallet(userId: string): Promise<Wallet | null> {
  try {
    const walletRef = doc(db, 'wallets', userId);
    const snapshot = await getDoc(walletRef);
    if (snapshot.exists()) {
      return { ...snapshot.data() } as Wallet;
    }
    // Auto-create if doesn't exist
    return initializeWallet(userId);
  } catch (error) {
    console.error('Error fetching wallet:', error);
    return null;
  }
}

/**
 * Listen to wallet changes in real-time
 */
export function listenToWallet(userId: string, callback: (wallet: Wallet) => void) {
  try {
    const walletRef = doc(db, 'wallets', userId);
    return onSnapshot(
      walletRef,
      (snapshot) => {
        if (snapshot.exists()) {
          callback({ ...snapshot.data() } as Wallet);
        }
      },
      (error) => {
        console.error('Error listening to wallet:', error);
      }
    );
  } catch (error) {
    console.error('Error setting up wallet listener:', error);
    return () => {};
  }
}

/**
 * Add funds to wallet
 */
export async function addToWallet(
  userId: string,
  amount: number,
  reason: string
): Promise<boolean> {
  try {
    const walletRef = doc(db, 'wallets', userId);

    // Use batch write for atomic update
    const batch = writeBatch(db);

    // Update wallet
    batch.update(walletRef, {
      balance: increment(amount),
      totalEarnings: increment(amount),
      updatedAt: Timestamp.now(),
    });

    // Add transaction history
    const historyRef = collection(db, `wallets/${userId}/transactions`);
    const newHistory = doc(historyRef);
    batch.set(newHistory, {
      amount,
      reason,
      type: 'credit',
      createdAt: Timestamp.now(),
    });

    await batch.commit();
    return true;
  } catch (error) {
    console.error('Error adding to wallet:', error);
    return false;
  }
}

/**
 * Get wallet transaction history
 */
export async function getWalletHistory(userId: string): Promise<any[]> {
  try {
    const historyRef = collection(db, `wallets/${userId}/transactions`);
    const q = query(historyRef);
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error fetching wallet history:', error);
    return [];
  }
}

// ===== REFERRAL TRACKING =====

/**
 * Record new referral (called on signup)
 */
export async function recordNewReferral(
  referrerId: string,
  referredUserId: string
): Promise<Referral | null> {
  try {
    // Check for duplicate
    const q = query(
      collection(db, 'referrals'),
      where('referrerId', '==', referrerId),
      where('referredUserId', '==', referredUserId)
    );
    const existing = await getDocs(q);
    if (existing.docs.length > 0) {
      console.warn('Duplicate referral attempt prevented');
      return null;
    }

    // Prevent circular referrals: Check if referredUserId has already referred referrerId
    const circularCheck = query(
      collection(db, 'referrals'),
      where('referrerId', '==', referredUserId),
      where('referredUserId', '==', referrerId)
    );
    const circularExisting = await getDocs(circularCheck);
    if (circularExisting.docs.length > 0) {
      console.warn('Circular referral attempt prevented');
      return null; // User B already referred User A, so A cannot use B's code
    }

    // Create referral record
    const referralRef = collection(db, 'referrals');
    const newReferral = await addDoc(referralRef, {
      referrerId,
      referredUserId,
      status: 'signed_up',
      rewardGiven: false,
      rewardAmount: 0,
      createdAt: Timestamp.now(),
    } as Referral);

    // Get referrer info
    const referrerRef = doc(db, 'users', referrerId);
    const referrerSnap = await getDoc(referrerRef);
    const referrerName = referrerSnap.exists() ? referrerSnap.data().name : 'Your Friend';
    const referrerTotalReferrals = referrerSnap.exists() ? (referrerSnap.data().totalReferrals || 0) + 1 : 1;

    // Get referred user info
    const userRef = doc(db, 'users', referredUserId);
    const userSnap = await getDoc(userRef);
    const userName = userSnap.exists() ? userSnap.data().name : 'New User';

    // Add $5 signup bonus to referrer's wallet (NOT redeemable yet, only appears as balance)
    const signupBonus = REWARD_CONFIG.SIGNUP || 2;
    
    try {
      await addToWallet(referrerId, signupBonus, 'Referral signup bonus');
    } catch (error) {
      console.warn('Failed to add signup bonus to wallet:', error);
    }

    // Send notifications using new notification service
    try {
      // Notify referrer (Person A): "Noor is your new referral, encourage to buy subscription..."
      await notifyReferrerNewSignup(referrerId, referrerName, {
        referredId: referredUserId,
        referredName: userName,
        referralCount: referrerTotalReferrals,
      });
    } catch (error) {
      console.warn('Failed to send referrer notification:', error);
    }

    try {
      // Notify referred user (Person B): "Welcome to Zain team, please buy subscription..."
      await notifyReferredUserWelcome(referredUserId, referrerName, 10);
    } catch (error) {
      console.warn('Failed to send referred user welcome notification:', error);
    }

    // Update user's totalReferrals
    await updateUser(referrerId, {
      totalReferrals: referrerTotalReferrals,
    } as any);

    return {
      id: newReferral.id,
      referrerId,
      referredUserId,
      status: 'signed_up',
      rewardGiven: false,
      rewardAmount: 0,
      createdAt: Timestamp.now(),
    } as Referral;
  } catch (error) {
    console.error('Error recording referral:', error);
    throw error;
  }
}

/**
 * Mark referral as purchased and reward referrer
 * Called when referred user completes their first purchase
 */
export async function rewardReferralPurchase(referredUserId: string): Promise<boolean> {
  try {
    // Find referral for this user
    const q = query(
      collection(db, 'referrals'),
      where('referredUserId', '==', referredUserId),
      where('status', '==', 'signed_up'),
      where('rewardGiven', '==', false)
    );

    const referrals = await getDocs(q);
    if (referrals.docs.length === 0) {
      console.warn('No referral found for user:', referredUserId);
      return false;
    }

    const referralDoc = referrals.docs[0];
    const referral = referralDoc.data() as Referral;
    const referrerId = referral.referrerId;

    // Calculate reward with bonus
    const referrerLevel = await getUserReferralLevel(referrerId);
    const baseReward = REWARD_CONFIG.PURCHASE;
    const bonusPercentage = referrerLevel.bonus / 100;
    const totalReward = Math.round((baseReward * (1 + bonusPercentage)) * 100) / 100;

    // Use batch for atomic transaction
    const batch = writeBatch(db);

    // Update referral status
    batch.update(doc(db, 'referrals', referralDoc.id), {
      status: 'purchased',
      rewardGiven: true,
      rewardAmount: totalReward,
      purchasedAt: Timestamp.now(),
    });

    // Add to referrer's wallet
    const walletRef = doc(db, 'wallets', referrerId);
    batch.update(walletRef, {
      balance: increment(totalReward),
      totalEarnings: increment(totalReward),
      updatedAt: Timestamp.now(),
    });

    // Add transaction history
    const historyRef = doc(collection(db, `wallets/${referrerId}/transactions`));
    batch.set(historyRef, {
      amount: totalReward,
      reason: 'Referral purchase reward',
      referredUserId,
      type: 'credit',
      createdAt: Timestamp.now(),
    });

    // Add reward record
    const rewardRef = doc(collection(db, 'rewards'));
    batch.set(rewardRef, {
      referrerId,
      referredUserId,
      type: 'purchase',
      amount: totalReward,
      reason: `Referral purchase reward${referrerLevel.bonus > 0 ? ` (${referrerLevel.level} +${referrerLevel.bonus}%)` : ''}`,
      createdAt: Timestamp.now(),
    });

    await batch.commit();

    // Send notification
    const referrerRef = doc(db, 'users', referrerId);
    const referrerSnap = await getDoc(referrerRef);
    const referrerName = referrerSnap.exists() ? referrerSnap.data().name : 'User';

    const referredUserRef = doc(db, 'users', referredUserId);
    const referredUserSnap = await getDoc(referredUserRef);
    const referredUserName = referredUserSnap.exists()
      ? referredUserSnap.data().name
      : 'A user';

    await sendNotification(referrerId, {
      title: '💰 Reward Earned!',
      message: `${referredUserName} made a purchase! You earned $${totalReward.toFixed(2)}${referrerLevel.bonus > 0 ? ` (+${referrerLevel.bonus}% ${referrerLevel.level} bonus)` : ''}`,
      type: 'referral',
    }).catch((error) => {
      console.warn('Failed to send purchase reward notification:', error);
    });

    return true;
  } catch (error) {
    console.error('Error rewarding referral purchase:', error);
    return false;
  }
}

/**
 * Send reminder notification to referred user to complete purchase
 */
export async function sendReminderToReferral(
  referrerId: string,
  referralId: string,
  referrerName: string
): Promise<boolean> {
  try {
    // Get the referral details
    const referralRef = doc(db, 'referrals', referralId);
    const referralSnap = await getDoc(referralRef);
    
    if (!referralSnap.exists()) {
      console.warn('Referral not found:', referralId);
      return false;
    }

    const referral = referralSnap.data() as Referral;
    const referredUserId = referral.referredUserId;

    // Send reminder notification to referred user using new service
    try {
      await notifySubscriptionReminder(
        referredUserId,
        referrerName,
        `${referrerName} sent you a reminder! 📬\n\nComplete your subscription purchase and help them earn rewards! 🎁\n\nVisit the IPTV section to buy now and get your discount.`
      );
    } catch (error) {
      console.warn('Failed to send reminder notification:', error);
      return false;
    }

    // Update referral with reminder sent timestamp
    await updateDoc(referralRef, {
      reminderSentAt: Timestamp.now(),
      reminderCount: ((referralSnap.data() as any).reminderCount || 0) + 1,
    });

    return true;
  } catch (error) {
    console.error('Error sending reminder:', error);
    return false;
  }
}

/**
 * Get all referrals for a user
 */
export async function getReferralsForUser(referrerId: string): Promise<Referral[]> {
  try {
    const q = query(collection(db, 'referrals'), where('referrerId', '==', referrerId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Referral[];
  } catch (error) {
    console.error('Error fetching referrals:', error);
    return [];
  }
}

/**
 * Listen to referrals in real-time
 */
export function listenToReferrals(
  referrerId: string,
  callback: (referrals: Referral[]) => void
) {
  try {
    const q = query(collection(db, 'referrals'), where('referrerId', '==', referrerId));
    return onSnapshot(
      q,
      (snapshot) => {
        const referrals = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Referral[];
        callback(referrals);
      },
      (error) => {
        console.error('Error listening to referrals:', error);
      }
    );
  } catch (error) {
    console.error('Error setting up referrals listener:', error);
    return () => {};
  }
}

// ===== REFERRAL LEVELS =====

/**
 * Get user's referral level
 */
export async function getUserReferralLevel(userId: string): Promise<ReferralLevel> {
  try {
    const referrals = await getReferralsForUser(userId);
    const purchaseCount = referrals.filter((r) => r.status === 'purchased').length;

    const wallet = await getWallet(userId);
    const earnings = wallet?.totalEarnings || 0;

    // Find the highest level user qualifies for
    const level = REFERRAL_LEVELS.reverse().find(
      (l) => purchaseCount >= l.minReferrals && earnings >= l.minEarnings
    );

    return level || REFERRAL_LEVELS[0];
  } catch (error) {
    console.error('Error calculating referral level:', error);
    return REFERRAL_LEVELS[0];
  }
}

/**
 * Get progress to next referral level
 */
export async function getReferralLevelProgress(userId: string): Promise<{
  currentLevel: ReferralLevel;
  nextLevel: ReferralLevel | null;
  progress: number; // 0-100
  referralCount: number;
  earnings: number;
}> {
  try {
    const currentLevel = await getUserReferralLevel(userId);
    const referrals = await getReferralsForUser(userId);
    const purchaseCount = referrals.filter((r) => r.status === 'purchased').length;
    const wallet = await getWallet(userId);
    const earnings = wallet?.totalEarnings || 0;

    // Find next level
    const currentIndex = REFERRAL_LEVELS.findIndex((l) => l.level === currentLevel.level);
    const nextLevel =
      currentIndex < REFERRAL_LEVELS.length - 1
        ? REFERRAL_LEVELS[currentIndex + 1]
        : null;

    // Calculate progress
    let progress = 0;
    if (nextLevel) {
      const referralProgress =
        (purchaseCount / nextLevel.minReferrals) * 100;
      const earningsProgress = (earnings / nextLevel.minEarnings) * 100;
      progress = Math.min(referralProgress, earningsProgress, 100);
    } else {
      progress = 100; // Already at max level
    }

    return {
      currentLevel,
      nextLevel,
      progress,
      referralCount: purchaseCount,
      earnings,
    };
  } catch (error) {
    console.error('Error calculating referral level progress:', error);
    return {
      currentLevel: REFERRAL_LEVELS[0],
      nextLevel: REFERRAL_LEVELS[1],
      progress: 0,
      referralCount: 0,
      earnings: 0,
    };
  }
}

// ===== UTILITIES =====

/**
 * Get reward records for a user
 */
export async function getRewardHistory(userId: string): Promise<Reward[]> {
  try {
    const q = query(collection(db, 'rewards'), where('referrerId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Reward[];
  } catch (error) {
    console.error('Error fetching reward history:', error);
    return [];
  }
}

/**
 * Get total referral stats
 */
export async function getReferralStats(userId: string): Promise<{
  totalReferrals: number;
  activeReferrals: number;
  completedPurchases: number;
  totalRewards: number;
}> {
  try {
    const referrals = await getReferralsForUser(userId);
    const wallet = await getWallet(userId);

    return {
      totalReferrals: referrals.length,
      activeReferrals: referrals.filter((r) => r.status === 'signed_up').length,
      completedPurchases: referrals.filter((r) => r.status === 'purchased').length,
      totalRewards: wallet?.totalEarnings || 0,
    };
  } catch (error) {
    console.error('Error calculating referral stats:', error);
    return {
      totalReferrals: 0,
      activeReferrals: 0,
      completedPurchases: 0,
      totalRewards: 0,
    };
  }
}
