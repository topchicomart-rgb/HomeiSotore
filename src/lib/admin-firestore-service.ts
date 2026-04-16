import {
  db,
} from '@/lib/firebase-config';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  serverTimestamp,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { database } from '@/lib/firebase-config';
import { ref, get, onValue, update } from 'firebase/database';
import { sendNotification } from '@/lib/firebase-service';
import {
  notifyOrderAccepted,
  notifyOrderRejected,
} from '@/lib/notification-service';

// ============ TYPES ============

export interface Plan {
  id: string;
  name: string;
  price: number;
  discount?: number;
  durationDays: number;
  isActive: boolean;
  createdAt: Timestamp;
}

export interface Credentials {
  username: string;
  password: string;
  url: string;
  expiryDate: string;
}

export interface Order {
  id: string;
  userId?: string;
  userEmail: string;
  planId: string;
  planName: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  paymentMethod: string;
  paymentProof?: string;
  credentials?: Credentials;
  rejectReason?: string;
  createdAt: Timestamp;
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  swiftCode?: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  instructions: string;
  icon?: string;
  isActive: boolean;
}

export interface Feature {
  id: string;
  title: string;
  description: string;
  icon?: string;
  order: number;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price?: number;
  features?: string[];
  icon?: string;
}

export interface ContactInfo {
  phone: string;
  email: string;
  whatsapp: string;
  address: string;
  hours?: string;
}

export interface SocialLinks {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  whatsapp?: string;
  telegram?: string;
  youtube?: string;
}

export interface Settings {
  id: string;
  paymentInstructions: string;
  bankAccounts: BankAccount[];
  accountCreationLimit: number;
  maintenanceMode: boolean;

  // Website General Settings
  siteName: string;
  siteDescription: string;
  siteUrl: string;

  // Home/Hero Section
  homeTitle: string;
  homeSubtitle: string;
  homeDescription: string;
  homeCta?: string;
  homeCtaLink?: string;

  // Contact Information
  contactInfo?: ContactInfo;

  // Payment Methods
  paymentMethods?: PaymentMethod[];

  // Features List
  features?: Feature[];

  // Services
  services?: Service[];

  // Social Links
  socialLinks?: SocialLinks;

  // SEO Settings
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
}

// ============ PLANS ============

export async function createPlan(data: Omit<Plan, 'id' | 'createdAt'>) {
  try {
    const docRef = await addDoc(collection(db, 'plans'), {
      ...data,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating plan:', error);
    throw error;
  }
}

export async function updatePlan(planId: string, data: Partial<Plan>) {
  try {
    await updateDoc(doc(db, 'plans', planId), data);
  } catch (error) {
    console.error('Error updating plan:', error);
    throw error;
  }
}

export async function deletePlan(planId: string) {
  try {
    await deleteDoc(doc(db, 'plans', planId));
  } catch (error) {
    console.error('Error deleting plan:', error);
    throw error;
  }
}

export function listenToPlans(callback: (plans: Plan[]) => void) {
  const q = query(collection(db, 'plans'));
  return onSnapshot(q, (snapshot) => {
    const plans = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Plan));
    callback(plans);
  });
}

export async function getActivePlans(): Promise<Plan[]> {
  try {
    const q = query(collection(db, 'plans'), where('isActive', '==', true));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Plan));
  } catch (error) {
    console.error('Error getting active plans:', error);
    throw error;
  }
}

// ============ ORDERS ============

export async function updateOrderStatus(
  orderId: string,
  status: 'approved' | 'rejected' | 'pending',
  additionalData?: Partial<Order>,
  userId?: string
) {
  try {
    // Update in Realtime Database (where orders are stored)
    // Need to find the order first if userId not provided
    if (!userId) {
      // Search for the order across all users
      const ordersRef = ref(database, 'orders');
      const snapshot = await get(ordersRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        for (const uid of Object.keys(data)) {
          if (data[uid][orderId]) {
            userId = uid;
            break;
          }
        }
      }
    }
    
    if (!userId) {
      throw new Error('Order not found');
    }
    
    const orderRef = ref(database, `orders/${userId}/${orderId}`);
    const orderSnapshot = await get(orderRef);
    const orderData = orderSnapshot.val();

    // Update order status
    await update(orderRef, {
      status,
      ...additionalData,
    });

    // Send notification to user based on status change
    try {
      if (status === 'approved') {
        await notifyOrderAccepted(userId, {
          orderId,
          planName: orderData?.plan || orderData?.planName || 'Your Plan',
          credentials: additionalData?.credentials,
        });
        
        // ✅ UPDATE REFERRAL STATUS TO 'purchased' when order is approved
        try {
          const referralsRef = collection(db, 'referrals');
          const q = query(referralsRef, where('referredUserId', '==', userId));
          const referralSnap = await getDocs(q);
          
          if (referralSnap.docs.length > 0) {
            const referralDoc = referralSnap.docs[0];
            await updateDoc(referralDoc.ref, {
              status: 'purchased',
              purchasedAt: serverTimestamp(),
            });
            console.log(`✅ Updated referral status to 'purchased' for user ${userId}`);
          }
        } catch (referralError) {
          console.warn('Failed to update referral status:', referralError);
          // Don't throw - order update was successful
        }
      } else if (status === 'rejected') {
        await notifyOrderRejected(userId, {
          orderId,
          planName: orderData?.plan || orderData?.planName || 'Your Plan',
          rejectionReason: additionalData?.rejectReason || 'No reason provided',
        });
      }
    } catch (notificationError) {
      console.warn('Failed to send notification:', notificationError);
      // Don't throw - order update was successful
    }
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
}

export function listenToOrders(callback: (orders: Order[]) => void) {
  try {
    // Read from Realtime Database (same as website) instead of Firestore
    const ordersRef = ref(database, 'orders');
    return onValue(ordersRef, (snapshot) => {
      const allOrders: Order[] = [];
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        // data is {userId: {orderId: orderData, ...}, ...}
        Object.keys(data).forEach(userId => {
          Object.keys(data[userId]).forEach(orderId => {
            allOrders.push({
              id: orderId,
              userId: userId,
              ...data[userId][orderId],
            } as Order);
          });
        });
      }
      
      // Sort by most recent first
      const sorted = allOrders.sort((a, b) => {
        // Handle both ISO strings and Timestamp objects
        let dateA = 0;
        let dateB = 0;
        
        if (typeof a.createdAt === 'string') {
          dateA = new Date(a.createdAt).getTime();
        } else if (a.createdAt?.toMillis) {
          dateA = a.createdAt.toMillis();
        } else if (a.createdAt?.seconds) {
          dateA = a.createdAt.seconds * 1000;
        }
        
        if (typeof b.createdAt === 'string') {
          dateB = new Date(b.createdAt).getTime();
        } else if (b.createdAt?.toMillis) {
          dateB = b.createdAt.toMillis();
        } else if (b.createdAt?.seconds) {
          dateB = b.createdAt.seconds * 1000;
        }
        
        return dateB - dateA;
      });
      
      callback(sorted);
    }, (error) => {
      console.error('Error listening to orders:', error);
      callback([]);
    });
  } catch (error) {
    console.error('Error setting up orders listener:', error);
    return () => {};
  }
}

export function listenToOrdersByStatus(
  status: string,
  callback: (orders: Order[]) => void
) {
  try {
    const ordersRef = ref(database, 'orders');
    return onValue(ordersRef, (snapshot) => {
      const allOrders: Order[] = [];
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        Object.keys(data).forEach(userId => {
          Object.keys(data[userId]).forEach(orderId => {
            const order = { id: orderId, userId, ...data[userId][orderId] } as Order;
            if (order.status === status) {
              allOrders.push(order);
            }
          });
        });
      }
      
      const sorted = allOrders.sort((a, b) => {
        // Handle both ISO strings and Timestamp objects
        let dateA = 0;
        let dateB = 0;
        
        if (typeof a.createdAt === 'string') {
          dateA = new Date(a.createdAt).getTime();
        } else if (a.createdAt?.toMillis) {
          dateA = a.createdAt.toMillis();
        } else if (a.createdAt?.seconds) {
          dateA = a.createdAt.seconds * 1000;
        }
        
        if (typeof b.createdAt === 'string') {
          dateB = new Date(b.createdAt).getTime();
        } else if (b.createdAt?.toMillis) {
          dateB = b.createdAt.toMillis();
        } else if (b.createdAt?.seconds) {
          dateB = b.createdAt.seconds * 1000;
        }
        
        return dateB - dateA;
      });
      
      callback(sorted);
    }, (error) => {
      console.error('Error listening to orders by status:', error);
      callback([]);
    });
  } catch (error) {
    console.error('Error setting up orders by status listener:', error);
    return () => {};
  }
}

export async function getUserOrdersByEmail(email: string): Promise<Order[]> {
  try {
    const q = query(collection(db, 'orders'), where('userEmail', '==', email));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Order));
  } catch (error) {
    console.error('Error getting user orders:', error);
    throw error;
  }
}

// ============ SETTINGS ============

export const defaultSettings: Settings = {
  id: 'general',
  maintenanceMode: false,
  paymentInstructions: 'Send payment to the account details provided',
  bankAccounts: [],
  accountCreationLimit: 5,
  siteName: 'PrimexStream Pro',
  siteDescription: 'Premium IPTV Streaming Service',
  siteUrl: 'https://primexstream.pro',
  homeTitle: 'Premium IPTV Streaming',
  homeSubtitle: 'Watch Your Favorite Shows Anytime, Anywhere',
  homeDescription: 'Experience unlimited streaming with our premium IPTV service',
  homeCta: 'Get Started',
  homeCtaLink: '#pricing',
  contactInfo: {
    phone: '+1 (555) 123-4567',
    email: 'support@primexstream.pro',
    whatsapp: '+1 (555) 123-4567',
    address: '123 Main Street, City, State',
    hours: 'Mon - Fri: 9AM - 6PM',
  },
  paymentMethods: [],
  features: [],
  services: [],
  socialLinks: {
    facebook: 'https://facebook.com/primexstream',
    twitter: 'https://twitter.com/primexstream',
    instagram: 'https://instagram.com/primexstream',
    whatsapp: 'https://wa.me/1234567890',
    telegram: 'https://t.me/primexstream',
    youtube: 'https://youtube.com/@primexstream',
  },
  seoTitle: 'PrimexStream Pro - Premium IPTV Streaming',
  seoDescription: 'Watch unlimited IPTV channels with PrimexStream Pro',
  seoKeywords: 'IPTV, streaming, premium, channels',
};

export async function getSettings(): Promise<Settings> {
  try {
    const settingsDoc = doc(db, 'settings', 'general');
    const snapshot = await getDocs(collection(db, 'settings'));
    const data = snapshot.docs.find((d) => d.id === 'general');
    if (data) {
      const docData = data.data();
      return {
        ...defaultSettings,
        ...docData,
        id: data.id,
      } as Settings;
    }
    return defaultSettings;
  } catch (error) {
    console.error('Error getting settings:', error);
    return defaultSettings;
  }
}

export function listenToSettings(callback: (settings: Settings) => void) {
  const settingsDoc = doc(db, 'settings', 'general');
  return onSnapshot(settingsDoc, (docSnapshot) => {
    if (docSnapshot.exists()) {
      const docData = docSnapshot.data();
      callback({
        ...defaultSettings,
        ...docData,
        id: docSnapshot.id,
      } as Settings);
    } else {
      callback(defaultSettings);
    }
  });
}

export async function updateSettings(data: Partial<Settings>) {
  try {
    const settingsDoc = doc(db, 'settings', 'general');
    await updateDoc(settingsDoc, data);
  } catch (error) {
    console.error('Error updating settings:', error);
    throw error;
  }
}

// ============ USERS ============

export function listenToUsers(callback: (users: any[]) => void) {
  try {
    const usersRef = ref(database, 'users');
    return onValue(usersRef, (snapshot) => {
      const users: any[] = [];
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        Object.keys(data).forEach(userId => {
          users.push({
            id: userId,
            ...data[userId],
          });
        });
      }
      
      callback(users);
    });
  } catch (error) {
    console.error('Error listening to users:', error);
    return () => {};
  }
}

// ============ DASHBOARD STATS ============

export function listenToDashboardStats(
  callback: (stats: {
    totalOrders: number;
    pendingOrders: number;
    approvedOrders: number;
    rejectedOrders: number;
    totalRevenue: number;
    totalMembers?: number;
    totalSales?: number;
  }) => void
) {
  try {
    // Read from Realtime Database (same as website)
    const ordersRef = ref(database, 'orders');
    const usersRef = ref(database, 'users');
    
    // Listen to both orders and users
    let unsubscribeOrders: () => void;
    let unsubscribeUsers: () => void;
    let allOrders: Order[] = [];
    let totalMembers = 0;

    // Orders listener
    unsubscribeOrders = onValue(ordersRef, (snapshot) => {
      allOrders = [];
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        Object.keys(data).forEach(userId => {
          Object.keys(data[userId]).forEach(orderId => {
            allOrders.push({
              id: orderId,
              userId: userId,
              ...data[userId][orderId],
            } as Order);
          });
        });
      }

      // Calculate and return stats
      const stats = {
        totalOrders: allOrders.length,
        pendingOrders: allOrders.filter((o) => o.status === 'pending').length,
        approvedOrders: allOrders.filter((o) => o.status === 'approved').length,
        rejectedOrders: allOrders.filter((o) => o.status === 'rejected').length,
        totalRevenue: allOrders
          .filter((o) => o.status === 'approved')
          .reduce((sum, o) => sum + (o.amount || 0), 0),
        totalMembers,
        totalSales: allOrders
          .filter((o) => o.status === 'approved')
          .reduce((sum, o) => sum + (o.amount || 0), 0),
      };

      callback(stats);
    });

    // Users listener (for totalMembers)
    unsubscribeUsers = onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        totalMembers = Object.keys(data).length;
      } else {
        totalMembers = 0;
      }

      // Calculate and return stats
      const stats = {
        totalOrders: allOrders.length,
        pendingOrders: allOrders.filter((o) => o.status === 'pending').length,
        approvedOrders: allOrders.filter((o) => o.status === 'approved').length,
        rejectedOrders: allOrders.filter((o) => o.status === 'rejected').length,
        totalRevenue: allOrders
          .filter((o) => o.status === 'approved')
          .reduce((sum, o) => sum + (o.amount || 0), 0),
        totalMembers,
        totalSales: allOrders
          .filter((o) => o.status === 'approved')
          .reduce((sum, o) => sum + (o.amount || 0), 0),
      };

      callback(stats);
    });

    // Return cleanup function
    return () => {
      if (unsubscribeOrders) unsubscribeOrders();
      if (unsubscribeUsers) unsubscribeUsers();
    };
  } catch (error) {
    console.error('Error listening to dashboard stats:', error);
    return () => {};
  }
}
