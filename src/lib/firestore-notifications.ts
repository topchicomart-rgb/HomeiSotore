/**
 * REAL PRODUCTION NOTIFICATION SYSTEM
 * 
 * Firestore-backed persistent notifications
 * - Saves all notifications to Firestore
 * - Real-time listeners with onSnapshot
 * - Survives page refresh, logout, login
 * - Manual deletion only (no auto-hide)
 * - No temporary React state
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
} from 'firebase/firestore';
import { db } from '@/lib/firebase-config';

// ===== TYPES =====

export interface NotificationData {
  id: string;
  userId: string;
  type: 'order' | 'referral' | 'admin' | 'success' | 'reject' | 'reminder';
  title: string;
  message: string;
  link?: string;
  read: boolean;
  deleted: boolean;
  createdAt: Timestamp;
  data?: {
    orderId?: string;
    orderAmount?: number;
    orderPlan?: string;
    referrerId?: string;
    referredName?: string;
    rejectionReason?: string;
  };
}

// ===== ADMIN CONFIG =====

const ADMIN_EMAIL = 'zainashraf0326@gmail.com';

/**
 * Get admin user ID from their email address
 */
export async function getAdminUserId(): Promise<string | null> {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', ADMIN_EMAIL));
    const snapshot = await getDocs(q);
    
    if (snapshot.docs.length > 0) {
      return snapshot.docs[0].id;
    }
    
    console.warn(`⚠️ Admin user not found: ${ADMIN_EMAIL}`);
    return null;
  } catch (error) {
    console.error('Error getting admin user ID:', error);
    return null;
  }
}

// ===== CREATE NOTIFICATIONS =====

/**
 * Create notification in user's Firestore collection
 * REAL PERSISTENT - saved to Firestore immediately
 */
export async function createNotification(
  userId: string,
  type: NotificationData['type'],
  title: string,
  message: string,
  data?: NotificationData['data'],
  link?: string
): Promise<string | null> {
  try {
    const notifRef = collection(db, 'users', userId, 'notifications');
    const docRef = await addDoc(notifRef, {
      userId,
      type,
      title,
      message,
      link,
      read: false,
      deleted: false,
      createdAt: Timestamp.now(),
      data,
    });

    console.log(`✅ Notification created: ${docRef.id}`);
    return docRef.id;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
}

/**
 * Order created - notify user AND admin
 */
export async function notifyOrderCreated(
  userId: string,
  userName: string,
  orderData: {
    orderId: string;
    planName: string;
    amount: number;
  }
): Promise<void> {
  try {
    // Notify user
    await createNotification(
      userId,
      'order',
      '✅ Order Created',
      `Your order for ${orderData.planName} (₹${orderData.amount}) has been created. Awaiting admin approval.`,
      {
        orderId: orderData.orderId,
        orderAmount: orderData.amount,
        orderPlan: orderData.planName,
      },
      `/orders/${orderData.orderId}`
    );

    // Notify admin
    const adminId = await getAdminUserId();
    if (adminId) {
      await createNotification(
        adminId,
        'admin',
        '📋 New Order',
        `${userName} ordered ${orderData.planName} for ₹${orderData.amount}`,
        {
          orderId: orderData.orderId,
          orderAmount: orderData.amount,
          orderPlan: orderData.planName,
        },
        '/admin'
      );
    }
  } catch (error) {
    console.error('Error notifying order created:', error);
  }
}

/**
 * Order approved - notify user with credentials
 */
export async function notifyOrderApproved(
  userId: string,
  orderData: {
    orderId: string;
    planName: string;
    credentials?: {
      username: string;
      password: string;
      url: string;
      expiryDate: string;
    };
  }
): Promise<void> {
  try {
    const credText = orderData.credentials
      ? `\n📱 User: ${orderData.credentials.username}\n🔐 Pass: ${orderData.credentials.password}\n🌐 URL: ${orderData.credentials.url}\n📅 Valid: ${orderData.credentials.expiryDate}`
      : '';

    await createNotification(
      userId,
      'success',
      '🎉 Order Approved!',
      `Your order for ${orderData.planName} has been approved and is ready to use!${credText}`,
      {
        orderId: orderData.orderId,
        orderPlan: orderData.planName,
      },
      `/orders/${orderData.orderId}`
    );
  } catch (error) {
    console.error('Error notifying order approved:', error);
  }
}

/**
 * Order rejected - notify user
 */
export async function notifyOrderRejected(
  userId: string,
  orderData: {
    orderId: string;
    reason: string;
  }
): Promise<void> {
  try {
    await createNotification(
      userId,
      'reject',
      '❌ Order Rejected',
      `Your order has been rejected.\n\nReason: ${orderData.reason}`,
      {
        orderId: orderData.orderId,
        rejectionReason: orderData.reason,
      },
      `/orders/${orderData.orderId}`
    );
  } catch (error) {
    console.error('Error notifying order rejected:', error);
  }
}

/**
 * Referral joined - notify referrer
 */
export async function notifyReferralJoined(
  referrerUid: string,
  referredName: string
): Promise<void> {
  try {
    await createNotification(
      referrerUid,
      'referral',
      '🎯 New Referral!',
      `${referredName} joined using your referral code! They'll earn you rewards when they purchase.`,
      {
        referredName,
      },
      '/earn'
    );
  } catch (error) {
    console.error('Error notifying referral joined:', error);
  }
}

/**
 * Referral purchased - notify referrer with reward
 */
export async function notifyReferralPurchased(
  referrerUid: string,
  referredName: string,
  rewardAmount: number
): Promise<void> {
  try {
    await createNotification(
      referrerUid,
      'success',
      '💰 Reward Earned!',
      `${referredName} made a purchase! You earned ₹${rewardAmount} commission.`,
      {
        referredName,
      },
      '/earn'
    );
  } catch (error) {
    console.error('Error notifying referral purchased:', error);
  }
}

/**
 * Social task approved - notify user with rewards
 */
export async function notifySocialTaskApproved(
  userId: string,
  taskData: {
    platforms: string[];
    walletCredit: number;
    freeAccess: string;
  }
): Promise<void> {
  try {
    const platformsStr = taskData.platforms.join(', ');
    await createNotification(
      userId,
      'success',
      '✅ Social Task Approved!',
      `Your social task (${platformsStr}) has been approved!\n\n💰 Wallet Credit: ₹${taskData.walletCredit}\n📺 Free Access: ${taskData.freeAccess}`,
      {},
      '/earn'
    );
  } catch (error) {
    console.error('Error notifying social task approved:', error);
  }
}

/**
 * Social task rejected - notify user
 */
export async function notifySocialTaskRejected(
  userId: string,
  taskData: {
    platforms: string[];
    reason: string;
  }
): Promise<void> {
  try {
    const platformsStr = taskData.platforms.join(', ');
    await createNotification(
      userId,
      'reject',
      '❌ Social Task Rejected',
      `Your social task (${platformsStr}) was not approved.\n\nReason: ${taskData.reason || 'No specific reason provided. Please contact support.'}`,
      {},
      '/earn'
    );
  } catch (error) {
    console.error('Error notifying social task rejected:', error);
  }
}

// ===== READ / DELETE NOTIFICATIONS =====

/**
 * Mark single notification as read
 */
export async function markNotificationAsRead(
  userId: string,
  notificationId: string
): Promise<void> {
  try {
    const notifRef = doc(db, 'users', userId, 'notifications', notificationId);
    await updateDoc(notifRef, { read: true });
    console.log(`✅ Marked as read: ${notificationId}`);
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
}

/**
 * Soft delete notification (set deleted = true, keep in DB)
 */
export async function deleteNotification(
  userId: string,
  notificationId: string
): Promise<void> {
  try {
    const notifRef = doc(db, 'users', userId, 'notifications', notificationId);
    await updateDoc(notifRef, { deleted: true });
    console.log(`✅ Deleted notification: ${notificationId}`);
  } catch (error) {
    console.error('Error deleting notification:', error);
  }
}

/**
 * Mark all as read
 */
export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  try {
    const notifRef = collection(db, 'users', userId, 'notifications');
    const q = query(notifRef, where('deleted', '==', false), where('read', '==', false));
    const snapshot = await getDocs(q);

    const batch = writeBatch(db);
    snapshot.docs.forEach((doc) => {
      batch.update(doc.ref, { read: true });
    });

    await batch.commit();
    console.log(`✅ Marked all as read`);
  } catch (error) {
    console.error('Error marking all as read:', error);
  }
}

// ===== REAL-TIME LISTENERS =====

/**
 * Real-time listener for active (not deleted) notifications
 * This is the KEY function - it loads notifications from Firestore in real-time
 */
export function listenToNotifications(
  userId: string,
  callback: (notifications: NotificationData[]) => void
): () => void {
  try {
    const notifRef = collection(db, 'users', userId, 'notifications');
    const q = query(
      notifRef,
      where('deleted', '==', false),
      orderBy('createdAt', 'desc')
    );

    // Real-time listener - updates instantly when Firestore data changes
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const notifications = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as NotificationData));

        console.log(`📬 Loaded ${notifications.length} active notifications`);
        callback(notifications);
      },
      (error) => {
        console.error('Error listening to notifications:', error);
        // Don't clear notifications on error - keep showing existing ones
        console.warn('⚠️ Listener error but maintaining current state');
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up notifications listener:', error);
    return () => {};
  }
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(userId: string): Promise<number> {
  try {
    const notifRef = collection(db, 'users', userId, 'notifications');
    const q = query(
      notifRef,
      where('deleted', '==', false),
      where('read', '==', false)
    );
    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
}

// ===== WALLET UPDATES =====

/**
 * Add credit to user's wallet for social task approval or other rewards
 */
export async function addWalletCredit(
  userId: string,
  amount: number,
  reason: string,
  sourceId?: string
): Promise<boolean> {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      console.error(`User not found: ${userId}`);
      return false;
    }

    const currentBalance = userSnap.data()?.usableBalance || 0;
    const newBalance = currentBalance + amount;

    // Update user balance
    await updateDoc(userRef, {
      usableBalance: newBalance,
      lastWalletUpdate: Timestamp.now(),
    });

    // Add transaction history
    const historyRef = collection(db, 'users', userId, 'walletHistory');
    await addDoc(historyRef, {
      type: 'credit',
      amount,
      reason,
      sourceId,
      createdAt: Timestamp.now(),
      balanceBefore: currentBalance,
      balanceAfter: newBalance,
    });

    console.log(`✅ Added ₹${amount} to wallet for ${userId}`);
    return true;
  } catch (error) {
    console.error('Error adding wallet credit:', error);
    return false;
  }
}
