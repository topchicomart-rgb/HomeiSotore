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
  QueryConstraint,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase-config';
import { v4 as uuidv4 } from 'uuid';
import { sendNotification } from '@/lib/firebase-service';
import {
  notifyOrderCreated,
  notifyOrderAccepted,
  notifyOrderRejected,
  notifyAdminNewOrder,
} from '@/lib/notification-service';
import { notifyReferralJoined } from '@/lib/firestore-notifications';

// Helper function to remove undefined values from objects
function cleanData(data: any): any {
  return Object.fromEntries(
    Object.entries(data).filter(([_, value]) => value !== undefined)
  );
}

// ===== USERS =====
export interface User {
  id: string;
  name: string;
  email: string;
  referralCode: string;
  referredBy?: string;
  totalReferrals: number;
  createdAt: Timestamp;
  credits?: number;
}

export async function createUser(userId: string, userData: Partial<User>) {
  try {
    const referralCode = `REF${uuidv4().slice(0, 8).toUpperCase()}`;
    const userRef = doc(collection(db, 'users'), userId);
    const dataToWrite = cleanData({
      ...userData,
      referralCode,
      totalReferrals: 0,
      createdAt: Timestamp.now(),
    });
    await setDoc(userRef, dataToWrite);

    // Initialize wallet for new user
    const { initializeWallet } = await import('@/lib/referral-service');
    await initializeWallet(userId).catch((error) => {
      console.warn('Failed to initialize wallet:', error);
    });

    // If user was referred, record the referral
    if (userData.referredBy) {
      const { recordNewReferral } = await import('@/lib/referral-service');
      await recordNewReferral(userData.referredBy as string, userId).catch(
        (error) => {
          console.warn('Failed to record referral:', error);
        }
      );
    }
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

export async function getUser(userId: string): Promise<User | null> {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return { id: userSnap.id, ...userSnap.data() } as User;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

export async function updateUser(userId: string, updates: Partial<User>) {
  try {
    const userRef = doc(db, 'users', userId);
    const cleanedUpdates = cleanData(updates);
    await updateDoc(userRef, cleanedUpdates);
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

export function onUserChange(userId: string, callback: (user: User | null) => void) {
  try {
    const userRef = doc(db, 'users', userId);
    return onSnapshot(
      userRef,
      (doc) => {
        if (doc.exists()) {
          callback({ id: doc.id, ...doc.data() } as User);
        } else {
          callback(null);
        }
      },
      (error) => {
        console.error('Error listening to user:', error);
        if (error.code === 'permission-denied') {
          console.warn('Permission denied: User may not have access to this document');
        }
      }
    );
  } catch (error) {
    console.error('Error setting up user listener:', error);
    return () => {};
  }
}

// ===== REFERRAL SYSTEM =====
export interface Referral {
  id: string;
  referrerId: string;
  referredUserId: string;
  createdAt: Timestamp;
}

export async function recordReferral(referrerId: string, referredUserId: string) {
  try {
    const referralRef = collection(db, 'referrals');
    await addDoc(referralRef, {
      referrerId,
      referredUserId,
      createdAt: Timestamp.now(),
    });

    // Increment referrer's totalReferrals
    const referrerRef = doc(db, 'users', referrerId);
    const referrerSnap = await getDoc(referrerRef);
    if (referrerSnap.exists()) {
      const currentTotal = referrerSnap.data().totalReferrals || 0;
      await updateDoc(referrerRef, { totalReferrals: currentTotal + 1 });
    }

    // Get referred user's name for notification
    const referredUserRef = doc(db, 'users', referredUserId);
    const referredUserSnap = await getDoc(referredUserRef);
    const referredUserName = referredUserSnap.exists() ? referredUserSnap.data().name : 'New User';

    // Send notification to referrer via Realtime Database (legacy)
    await sendNotification(referrerId, {
      title: '🎉 New Referral!',
      message: `${referredUserName} signed up using your referral code! You now have ${(referrerSnap.data()?.totalReferrals || 0) + 1} active referrals.`,
      type: 'referral',
      referralFromUserId: referredUserId,
      referralFromUserName: referredUserName,
    }).catch(error => {
      console.error('Failed to send referral notification via Realtime DB:', error);
    });

    // ALSO send notification via Firestore (new persistent system)
    await notifyReferralJoined(referrerId, referredUserName).catch(error => {
      console.error('Failed to send referral notification via Firestore:', error);
    });

  } catch (error) {
    console.error('Error recording referral:', error);
    throw error;
  }
}

export async function getReferralsForUser(referrerId: string): Promise<User[]> {
  try {
    const q = query(
      collection(db, 'referrals'),
      where('referrerId', '==', referrerId)
    );
    const referralSnaps = await getDocs(q);
    const referredUsers: User[] = [];

    for (const referralDoc of referralSnaps.docs) {
      const referrerId = referralDoc.data().referredUserId;
      const userRef = doc(db, 'users', referrerId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        referredUsers.push({ id: userSnap.id, ...userSnap.data() } as User);
      }
    }

    return referredUsers;
  } catch (error) {
    console.error('Error fetching referrals:', error);
    return [];
  }
}

export function onReferralsChange(
  referrerId: string,
  callback: (referrals: Referral[]) => void
) {
  try {
    const q = query(
      collection(db, 'referrals'),
      where('referrerId', '==', referrerId)
    );
    return onSnapshot(
      q,
      (snapshot) => {
        const referrals = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as Referral));
        callback(referrals);
      },
      (error) => {
        console.error('Error listening to referrals:', error);
        if (error.code === 'permission-denied') {
          console.warn('Permission denied: Cannot access referrals collection');
        }
      }
    );
  } catch (error) {
    console.error('Error setting up referrals listener:', error);
    return () => {};
  }
}

// ===== PLANS =====
export interface Plan {
  id: string;
  name: string;
  price: number;
  salePrice: number;
  discount: number;
  duration?: number;
  features?: string;
}

export async function getPlans(): Promise<Plan[]> {
  try {
    const plansRef = collection(db, 'plans');
    const plansSnap = await getDocs(plansRef);
    return plansSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Plan));
  } catch (error) {
    console.error('Error fetching plans:', error);
    return [];
  }
}

export function onPlansChange(callback: (plans: Plan[]) => void) {
  try {
    const plansRef = collection(db, 'plans');
    return onSnapshot(
      plansRef,
      (snapshot) => {
        const plans = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as Plan));
        callback(plans);
      },
      (error) => {
        console.error('Error listening to plans:', error);
        if (error.code === 'permission-denied') {
          console.warn('Permission denied: Cannot access plans collection');
        }
      }
    );
  } catch (error) {
    console.error('Error setting up plans listener:', error);
    return () => {};
  }
}

export async function updatePlan(planId: string, updates: Partial<Plan>) {
  try {
    const planRef = doc(db, 'plans', planId);
    await updateDoc(planRef, updates);
  } catch (error) {
    console.error('Error updating plan:', error);
    throw error;
  }
}

// ===== ORDERS =====
export interface Order {
  id: string;
  userId: string;
  plan: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'expired' | 'active';
  username?: string;
  password?: string;
  url?: string;
  expiryDate?: string;
  rejectionReason?: string;
  paymentMethod?: string;
  transactionId?: string;
  paymentProofUrl?: string;
  finalPrice?: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export async function createOrder(userId: string, orderData: Partial<Order>): Promise<Order> {
  try {
    const ordersRef = collection(db, 'orders');
    const docRef = await addDoc(ordersRef, {
      userId,
      ...orderData,
      status: 'pending',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    const docSnap = await getDoc(docRef);
    const order = {
      id: docSnap.id,
      ...docSnap.data(),
    } as Order;

    // Get user details for notification
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();
      const userName = userData?.name || 'User';

      // Send notification to user
      await notifyOrderCreated(userId, userName, {
        orderId: order.id,
        planName: order.plan,
        amount: order.finalPrice || 0,
        status: 'pending',
      });

      // Send notification to admin
      await notifyAdminNewOrder({
        orderId: order.id,
        userId,
        userName,
        userEmail: userData?.email || 'N/A',
        planName: order.plan,
        amount: order.finalPrice || 0,
      });
    } catch (notificationError) {
      console.warn('Failed to send notifications:', notificationError);
      // Don't throw - order was created successfully
    }

    return order;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}

export async function getUserOrders(userId: string): Promise<Order[]> {
  try {
    const q = query(
      collection(db, 'orders'),
      where('userId', '==', userId)
    );
    const ordersSnap = await getDocs(q);
    return ordersSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Order));
  } catch (error) {
    console.error('Error fetching user orders:', error);
    return [];
  }
}

export function onUserOrdersChange(userId: string, callback: (orders: Order[]) => void) {
  try {
    const q = query(
      collection(db, 'orders'),
      where('userId', '==', userId)
    );
    return onSnapshot(
      q,
      (snapshot) => {
        const orders = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as Order));
        callback(orders);
      },
      (error) => {
        console.error('Error listening to user orders:', error);
        if (error.code === 'permission-denied') {
          console.warn('Permission denied: Cannot access user orders');
        }
      }
    );
  } catch (error) {
    console.error('Error setting up user orders listener:', error);
    return () => {};
  }
}

export async function getAllOrders(): Promise<Order[]> {
  try {
    const ordersRef = collection(db, 'orders');
    const ordersSnap = await getDocs(ordersRef);
    return ordersSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Order));
  } catch (error) {
    console.error('Error fetching all orders:', error);
    return [];
  }
}

export function onAllOrdersChange(callback: (orders: Order[]) => void) {
  try {
    const ordersRef = collection(db, 'orders');
    return onSnapshot(
      ordersRef,
      (snapshot) => {
        const orders = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as Order));
        callback(orders);
      },
      (error) => {
        console.error('Error listening to all orders:', error);
        if (error.code === 'permission-denied') {
          console.warn('Permission denied: Cannot access orders collection');
        }
      }
    );
  } catch (error) {
    console.error('Error setting up all orders listener:', error);
    return () => {};
  }
}

export async function updateOrder(orderId: string, updates: Partial<Order>) {
  try {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating order:', error);
    throw error;
  }
}

/**
 * Accept/Approve an order and send notification to user
 */
export async function approveOrder(orderId: string, credentials?: {
  username: string;
  password: string;
  url: string;
  expiryDate: string;
}): Promise<void> {
  try {
    const orderRef = doc(db, 'orders', orderId);
    const orderSnap = await getDoc(orderRef);
    
    if (!orderSnap.exists()) {
      throw new Error('Order not found');
    }

    const order = orderSnap.data() as Order;

    // Update order status
    await updateDoc(orderRef, {
      status: 'approved',
      username: credentials?.username,
      password: credentials?.password,
      url: credentials?.url,
      expiryDate: credentials?.expiryDate,
      updatedAt: Timestamp.now(),
    });

    // Send notification to user
    try {
      await notifyOrderAccepted(order.userId, {
        orderId: order.id,
        planName: order.plan,
        credentials,
      });
    } catch (notificationError) {
      console.warn('Failed to send approval notification:', notificationError);
    }
  } catch (error) {
    console.error('Error approving order:', error);
    throw error;
  }
}

/**
 * Reject an order and send notification to user
 */
export async function rejectOrder(orderId: string, rejectionReason: string): Promise<void> {
  try {
    const orderRef = doc(db, 'orders', orderId);
    const orderSnap = await getDoc(orderRef);
    
    if (!orderSnap.exists()) {
      throw new Error('Order not found');
    }

    const order = orderSnap.data() as Order;

    // Update order status
    await updateDoc(orderRef, {
      status: 'rejected',
      rejectionReason,
      updatedAt: Timestamp.now(),
    });

    // Send notification to user
    try {
      await notifyOrderRejected(order.userId, {
        orderId: order.id,
        planName: order.plan,
        rejectionReason,
      });
    } catch (notificationError) {
      console.warn('Failed to send rejection notification:', notificationError);
    }
  } catch (error) {
    console.error('Error rejecting order:', error);
    throw error;
  }
}

// ===== ADMIN SETTINGS =====
export interface AdminSettings {
  payment: {
    methodName: string;
    instructions: string;
    accountInfo: string;
    extraDiscount?: number;
  };
}

export async function getAdminSettings(): Promise<AdminSettings | null> {
  try {
    const settingsRef = doc(db, 'admin_settings', 'payment');
    const settingsSnap = await getDoc(settingsRef);
    if (settingsSnap.exists()) {
      return settingsSnap.data() as AdminSettings;
    }
    return null;
  } catch (error) {
    console.error('Error fetching admin settings:', error);
    return null;
  }
}

export function onAdminSettingsChange(callback: (settings: AdminSettings | null) => void) {
  try {
    const settingsRef = doc(db, 'admin_settings', 'payment');
    return onSnapshot(
      settingsRef,
      (doc) => {
        if (doc.exists()) {
          callback(doc.data() as AdminSettings);
        } else {
          callback(null);
        }
      },
      (error) => {
        console.error('Error listening to admin settings:', error);
        if (error.code === 'permission-denied') {
          console.warn('Permission denied: Cannot access admin settings');
        }
      }
    );
  } catch (error) {
    console.error('Error setting up admin settings listener:', error);
    return () => {};
  }
}

export async function updateAdminSettings(updates: Partial<AdminSettings>) {
  try {
    const settingsRef = doc(db, 'admin_settings', 'payment');
    await updateDoc(settingsRef, updates);
  } catch (error) {
    console.error('Error updating admin settings:', error);
    throw error;
  }
}

// ===== UTILITY =====
export async function getUserByReferralCode(code: string): Promise<User | null> {
  try {
    const q = query(
      collection(db, 'users'),
      where('referralCode', '==', code)
    );
    const snapshot = await getDocs(q);
    if (snapshot.docs.length > 0) {
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() } as User;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user by referral code:', error);
    return null;
  }
}

export async function getAllUsers(): Promise<User[]> {
  try {
    const usersRef = collection(db, 'users');
    const usersSnap = await getDocs(usersRef);
    return usersSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as User));
  } catch (error) {
    console.error('Error fetching all users:', error);
    return [];
  }
}

export function onAllUsersChange(callback: (users: User[]) => void) {
  try {
    const usersRef = collection(db, 'users');
    return onSnapshot(
      usersRef,
      (snapshot) => {
        const users = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as User));
        callback(users);
      },
      (error) => {
        console.error('Error listening to all users:', error);
        if (error.code === 'permission-denied') {
          console.warn('Permission denied: Cannot access users collection');
        }
      }
    );
  } catch (error) {
    console.error('Error setting up all users listener:', error);
    return () => {};
  }
}

// ===== INCOME & EARNINGS =====
export interface UserIncome {
  userId: string;
  referralIncome: number;
  totalApprovedOrders: number;
  totalRejectedOrders: number;
  pendingOrders: number;
  earnedFromReferrals: number;
}

/** Calculate referral-based income for a user (commission from referred users' orders) */
export async function getUserIncomeFromReferrals(userId: string): Promise<number> {
  try {
    // Get all referrals made by this user
    const referralsQuery = query(
      collection(db, 'referrals'),
      where('referrerId', '==', userId)
    );
    const referralSnaps = await getDocs(referralsQuery);
    const referredUserIds = referralSnaps.docs.map((doc) => doc.data().referredUserId);

    if (referredUserIds.length === 0) return 0;

    let totalIncome = 0;

    // For each referred user, get their approved orders and calculate 5% commission
    for (const referredUserId of referredUserIds) {
      const ordersQuery = query(
        collection(db, 'orders'),
        where('userId', '==', referredUserId),
        where('status', '==', 'approved')
      );
      const orderSnaps = await getDocs(ordersQuery);

      for (const orderDoc of orderSnaps.docs) {
        const order = orderDoc.data() as Order;
        const commission = (order.finalPrice || 0) * 0.05; // 5% commission
        totalIncome += commission;
      }
    }

    return totalIncome;
  } catch (error) {
    console.error('Error calculating referral income:', error);
    return 0;
  }
}

/** Get comprehensive income data for a user */
export async function getUserIncomeData(userId: string): Promise<UserIncome> {
  try {
    // Get user's own orders
    const userOrdersQuery = query(
      collection(db, 'orders'),
      where('userId', '==', userId)
    );
    const userOrdersSnap = await getDocs(userOrdersQuery);
    const userOrders = userOrdersSnap.docs.map((doc) => doc.data() as Order);

    const totalApprovedOrders = userOrders.filter((o) => o.status === 'approved').length;
    const totalRejectedOrders = userOrders.filter((o) => o.status === 'rejected').length;
    const pendingOrders = userOrders.filter((o) => o.status === 'pending').length;

    // Get referral income
    const earnedFromReferrals = await getUserIncomeFromReferrals(userId);

    return {
      userId,
      referralIncome: earnedFromReferrals,
      totalApprovedOrders,
      totalRejectedOrders,
      pendingOrders,
      earnedFromReferrals,
    };
  } catch (error) {
    console.error('Error getting user income data:', error);
    return {
      userId,
      referralIncome: 0,
      totalApprovedOrders: 0,
      totalRejectedOrders: 0,
      pendingOrders: 0,
      earnedFromReferrals: 0,
    };
  }
}

/** Real-time listener for user income data */
export function onUserIncomeChange(
  userId: string,
  callback: (income: UserIncome) => void
) {
  try {
    // Listen to user's orders
    const unsubOrders = onUserOrdersChange(userId, async (orders) => {
      const incomeData = await getUserIncomeData(userId);
      callback(incomeData);
    });

    // Listen to referrals
    const unsubReferrals = onReferralsChange(userId, async () => {
      const incomeData = await getUserIncomeData(userId);
      callback(incomeData);
    });

    return () => {
      unsubOrders && unsubOrders();
      unsubReferrals && unsubReferrals();
    };
  } catch (error) {
    console.error('Error listening to user income:', error);
    return () => {};
  }
}

/** Get all registered referrals for a user with details */
export async function getReferralDetailsForUser(referrerId: string): Promise<
  (User & { ordersCount: number; approvedOrders: number })[]
> {
  try {
    const referralsQuery = query(
      collection(db, 'referrals'),
      where('referrerId', '==', referrerId)
    );
    const referralSnaps = await getDocs(referralsQuery);

    const referralDetails: (User & {
      ordersCount: number;
      approvedOrders: number;
    })[] = [];

    for (const referralDoc of referralSnaps.docs) {
      const referredUserId = referralDoc.data().referredUserId;
      const userRef = doc(db, 'users', referredUserId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const user = { id: userSnap.id, ...userSnap.data() } as User;

        // Count orders for this referred user
        const ordersQuery = query(
          collection(db, 'orders'),
          where('userId', '==', referredUserId)
        );
        const ordersSnap = await getDocs(ordersQuery);
        const orders = ordersSnap.docs.map((doc) => doc.data() as Order);
        const approvedOrders = orders.filter((o) => o.status === 'approved').length;

        referralDetails.push({
          ...user,
          ordersCount: orders.length,
          approvedOrders,
        });
      }
    }

    return referralDetails;
  } catch (error) {
    console.error('Error fetching referral details:', error);
    return [];
  }
}

// ===== REVIEWS =====
export interface Review {
  id: string;
  name: string;
  rating: number;
  text: string;
  date: string;
  createdAt: Timestamp;
}

export async function getReviews(): Promise<Review[]> {
  try {
    const reviewsRef = collection(db, 'reviews');
    const reviewsSnap = await getDocs(reviewsRef);
    return reviewsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Review));
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }
}

export function onReviewsChange(callback: (reviews: Review[]) => void) {
  try {
    const reviewsRef = collection(db, 'reviews');
    return onSnapshot(
      reviewsRef,
      (snapshot) => {
        const reviews = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as Review));
        callback(reviews);
      },
      (error) => {
        console.error('Error listening to reviews:', error);
        if (error.code === 'permission-denied') {
          console.warn('Permission denied: Cannot access reviews collection');
        }
      }
    );
  } catch (error) {
    console.error('Error setting up reviews listener:', error);
    return () => {};
  }
}

export async function addReview(reviewData: Omit<Review, 'id' | 'createdAt'>): Promise<Review> {
  try {
    const reviewsRef = collection(db, 'reviews');
    const docRef = await addDoc(reviewsRef, {
      ...reviewData,
      createdAt: Timestamp.now(),
    });
    const docSnap = await getDoc(docRef);
    return {
      id: docSnap.id,
      ...docSnap.data(),
    } as Review;
  } catch (error) {
    console.error('Error adding review:', error);
    throw error;
  }
}

// ===== FAQs =====
export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category?: string;
  order?: number;
  createdAt: Timestamp;
}

export async function getFAQs(): Promise<FAQ[]> {
  try {
    const faqsRef = collection(db, 'faqs');
    const faqsSnap = await getDocs(faqsRef);
    return faqsSnap.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as FAQ))
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    return [];
  }
}

export function onFAQsChange(callback: (faqs: FAQ[]) => void) {
  try {
    const faqsRef = collection(db, 'faqs');
    return onSnapshot(
      faqsRef,
      (snapshot) => {
        const faqs = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          } as FAQ))
          .sort((a, b) => (a.order || 0) - (b.order || 0));
        callback(faqs);
      },
      (error) => {
        console.error('Error listening to FAQs:', error);
        if (error.code === 'permission-denied') {
          console.warn('Permission denied: Cannot access FAQs collection');
        }
      }
    );
  } catch (error) {
    console.error('Error setting up FAQs listener:', error);
    return () => {};
  }
}

export async function addFAQ(faqData: Omit<FAQ, 'id' | 'createdAt'>): Promise<FAQ> {
  try {
    const faqsRef = collection(db, 'faqs');
    const docRef = await addDoc(faqsRef, {
      ...faqData,
      createdAt: Timestamp.now(),
    });
    const docSnap = await getDoc(docRef);
    return {
      id: docSnap.id,
      ...docSnap.data(),
    } as FAQ;
  } catch (error) {
    console.error('Error adding FAQ:', error);
    throw error;
  }
}

// ===== SERVICES =====
export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  icon?: string;
  category?: string;
  createdAt: Timestamp;
}

export async function getServices(): Promise<Service[]> {
  try {
    const servicesRef = collection(db, 'services');
    const servicesSnap = await getDocs(servicesRef);
    return servicesSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Service));
  } catch (error) {
    console.error('Error fetching services:', error);
    return [];
  }
}

export function onServicesChange(callback: (services: Service[]) => void) {
  try {
    const servicesRef = collection(db, 'services');
    return onSnapshot(
      servicesRef,
      (snapshot) => {
        const services = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as Service));
        callback(services);
      },
      (error) => {
        console.error('Error listening to services:', error);
        if (error.code === 'permission-denied') {
          console.warn('Permission denied: Cannot access services collection');
        }
      }
    );
  } catch (error) {
    console.error('Error setting up services listener:', error);
    return () => {};
  }
}

export async function addService(serviceData: Omit<Service, 'id' | 'createdAt'>): Promise<Service> {
  try {
    const servicesRef = collection(db, 'services');
    const docRef = await addDoc(servicesRef, {
      ...serviceData,
      createdAt: Timestamp.now(),
    });
    const docSnap = await getDoc(docRef);
    return {
      id: docSnap.id,
      ...docSnap.data(),
    } as Service;
  } catch (error) {
    console.error('Error adding service:', error);
    throw error;
  }
}

// ===== REFERRAL CONFIGURATION =====
export interface ReferralConfig {
  tiers: Array<{
    id: string;
    minReferrals: number;
    reward: string;
    bonus: number; // percentage like 5, 7, 10
    icon?: string;
  }>;
  baseCommission: number; // percentage for each approved order from referral
}

export async function getReferralConfig(): Promise<ReferralConfig | null> {
  try {
    const configRef = doc(db, 'admin_settings', 'referral_config');
    const configSnap = await getDoc(configRef);
    if (configSnap.exists()) {
      return configSnap.data() as ReferralConfig;
    }
    return null;
  } catch (error) {
    console.error('Error fetching referral config:', error);
    return null;
  }
}

export function onReferralConfigChange(callback: (config: ReferralConfig | null) => void) {
  try {
    const configRef = doc(db, 'admin_settings', 'referral_config');
    return onSnapshot(
      configRef,
      (doc) => {
        if (doc.exists()) {
          callback(doc.data() as ReferralConfig);
        } else {
          callback(null);
        }
      },
      (error) => {
        console.error('Error listening to referral config:', error);
        if (error.code === 'permission-denied') {
          console.warn('Permission denied: Cannot access referral config');
        }
      }
    );
  } catch (error) {
    console.error('Error setting up referral config listener:', error);
    return () => {};
  }
}

export async function updateReferralConfig(updates: Partial<ReferralConfig>) {
  try {
    const configRef = doc(db, 'admin_settings', 'referral_config');
    await updateDoc(configRef, updates);
  } catch (error) {
    console.error('Error updating referral config:', error);
    throw error;
  }
}

// ===== UPLOADS =====
export async function deleteUpload(uploadId: string) {
  try {
    const uploadRef = doc(db, 'uploads', uploadId);
    await deleteDoc(uploadRef);
    return true;
  } catch (error) {
    console.error('Error deleting upload:', error);
    throw error;
  }
}
