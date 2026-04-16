import { database, db } from '@/lib/firebase-config';
import { supabase, isSupabaseConfigured } from '@/lib/supabase-config';
import { ref, get, set, update, push, query, orderByChild, equalTo, remove, onValue } from 'firebase/database';
import {
  doc,
  getDoc,
  collection,
  query as firestoreQuery,
  where,
  getDocs,
} from 'firebase/firestore';
import {
  notifyOrderCreated,
  getAdminUserId,
} from '@/lib/firestore-notifications';
import { markReferralAsPurchased } from '@/lib/firestore-referral-service';

// ===== TYPES =====
export interface User {
  id: string;
  name: string;
  email: string;
  totalReferrals?: number;
  referralCode?: string;
  appliedReferralCode?: string;
  ordersCount?: number;
  approvedOrders?: number;
  credits?: number;
  [key: string]: any;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'referral' | 'order' | 'payment' | 'reminder' | 'general';
  isRead: boolean;
  createdAt: string;
  referralFromUserId?: string;
  referralFromUserName?: string;
}

// ===== NOTIFICATIONS =====
export async function sendNotification(
  userId: string,
  notification: Omit<Notification, 'id' | 'userId' | 'createdAt' | 'isRead'>
): Promise<string | null> {
  try {
    const notificationsRef = ref(database, `notifications/${userId}`);
    const newNotifRef = push(notificationsRef);
    const notificationData = {
      ...notification,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    await set(newNotifRef, notificationData);
    return newNotifRef.key;
  } catch (error) {
    console.error('Error sending notification:', error);
    return null;
  }
}

export async function getNotifications(userId: string): Promise<Notification[]> {
  try {
    const notificationsRef = ref(database, `notifications/${userId}`);
    const snapshot = await get(notificationsRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.keys(data).map(key => ({ id: key, userId, ...data[key] }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
}

export function listenToNotifications(userId: string, callback: (notifications: Notification[]) => void) {
  try {
    const notificationsRef = ref(database, `notifications/${userId}`);
    return onValue(notificationsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const notifications = Object.keys(data)
          .map(key => ({ id: key, userId, ...data[key] }))
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        callback(notifications);
      } else {
        callback([]);
      }
    }, (error) => {
      console.error('Error listening to notifications:', error);
      callback([]);
    });
  } catch (error) {
    console.error('Error setting up notifications listener:', error);
    return () => {};
  }
}

export async function markNotificationAsRead(userId: string, notificationId: string): Promise<boolean> {
  try {
    const notifRef = ref(database, `notifications/${userId}/${notificationId}`);
    await update(notifRef, { isRead: true });
    return true;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
}

export async function deleteNotification(userId: string, notificationId: string): Promise<boolean> {
  try {
    const notifRef = ref(database, `notifications/${userId}/${notificationId}`);
    await remove(notifRef);
    return true;
  } catch (error) {
    console.error('Error deleting notification:', error);
    return false;
  }
}

// ===== PLANS =====
export async function getPlans() {
  try {
    const plansRef = ref(database, 'plans');
    const snapshot = await get(plansRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.keys(data).map(key => ({ id: key, ...data[key] }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching plans:', error);
    return [];
  }
}

export async function createPlan(plan: any) {
  try {
    const plansRef = ref(database, 'plans');
    const newPlanRef = push(plansRef);
    await set(newPlanRef, plan);
    return { id: newPlanRef.key, ...plan };
  } catch (error) {
    console.error('Error creating plan:', error);
    throw error;
  }
}

export async function updatePlan(planId: string, updates: any) {
  try {
    const planRef = ref(database, `plans/${planId}`);
    await update(planRef, updates);
  } catch (error) {
    console.error('Error updating plan:', error);
    throw error;
  }
}

export async function deletePlan(planId: string) {
  try {
    const planRef = ref(database, `plans/${planId}`);
    await remove(planRef);
  } catch (error) {
    console.error('Error deleting plan:', error);
    throw error;
  }
}

// ===== ORDERS =====
export async function createOrder(userId: string, order: any) {
  try {
    const ordersRef = ref(database, `orders/${userId}`);
    const newOrderRef = push(ordersRef);
    const orderData = {
      ...order,
      createdAt: new Date().toISOString(),
      status: 'pending',
    };
    await set(newOrderRef, orderData);
    
    const orderId = newOrderRef.key || 'Unknown';

    // Send notifications using new notification service
    try {
      // Get user details for notification from FIRESTORE (not Realtime DB!)
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.exists() ? userSnap.data() : {};
      const userName = userData?.name || 'User';
      const userEmail = userData?.email || 'N/A';

      // Send notification to user
      await notifyOrderCreated(userId, userName, {
        orderId,
        planName: order.plan || order.planName || 'Unknown Plan',
        amount: order.finalPrice || order.amount || 0,
      });

      // Send notification to admin via new notification service
      const adminId = await getAdminUserId();
      if (adminId) {
        const { createNotification } = await import('@/lib/firestore-notifications');
        await createNotification(
          adminId,
          'admin',
          '📋 New Order',
          `${userName} ordered ${order.plan || order.planName} for ₹${order.finalPrice || order.amount}`,
          {
            orderId,
            orderAmount: order.finalPrice || order.amount,
            orderPlan: order.plan || order.planName,
          },
          '/admin'
        );
      }
    } catch (notificationError) {
      console.warn('Failed to send notifications:', notificationError);
      // Don't throw - order was created successfully
    }

    // CRITICAL: Mark referral as purchased (if user was referred)
    try {
      await markReferralAsPurchased(userId, order.plan || order.planName || 'Plan');
      console.log('✅ Referral market as purchased');
    } catch (referralError) {
      console.warn('⚠️ Failed to update referral status:', referralError);
      // Don't fail the order if referral update fails
    }
    
    return { id: orderId, ...orderData };
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}

export async function getUserOrders(userId: string) {
  try {
    const ordersRef = ref(database, `orders/${userId}`);
    const snapshot = await get(ordersRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.keys(data).map(key => ({ id: key, ...data[key] }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
}

export async function updateOrder(userId: string, orderId: string, updates: any) {
  try {
    const orderRef = ref(database, `orders/${userId}/${orderId}`);
    await update(orderRef, updates);
    
    // Send notification when status changes
    if (updates.status) {
      const statusMessages: { [key: string]: string } = {
        'approved': `✅ Order #${orderId.slice(0, 6)} has been approved! Your IPTV access will be activated soon.`,
        'rejected': `❌ Order #${orderId.slice(0, 6)} has been rejected. Please contact support for more details.`,
        'active': `🎉 Order #${orderId.slice(0, 6)} is now active! You can start enjoying premium IPTV services.`,
        'completed': `✨ Order #${orderId.slice(0, 6)} has been completed. Thank you for your purchase!`,
      };
      
      const message = statusMessages[updates.status] || `Order #${orderId.slice(0, 6)} status updated to ${updates.status}`;
      
      await sendNotification(userId, {
        title: updates.status === 'approved' ? '✅ Order Approved' : 
               updates.status === 'rejected' ? '❌ Order Rejected' : 
               updates.status === 'active' ? '🎉 Order Active' : '📋 Order Updated',
        message: message,
        type: 'order',
      });
    }
  } catch (error) {
    console.error('Error updating order:', error);
    throw error;
  }
}

export function listenToUserOrders(userId: string, callback: (orders: any[]) => void) {
  try {
    const ordersRef = ref(database, `orders/${userId}`);
    return onValue(ordersRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const orders = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        callback(orders);
      } else {
        callback([]);
      }
    }, (error) => {
      console.error('Error listening to user orders:', error);
      callback([]);
    });
  } catch (error) {
    console.error('Error setting up user orders listener:', error);
    return () => {};
  }
}

export async function getAllOrders() {
  try {
    const ordersRef = ref(database, 'orders');
    const snapshot = await get(ordersRef);
    const allOrders: any[] = [];
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      Object.keys(data).forEach(userId => {
        Object.keys(data[userId]).forEach(orderId => {
          allOrders.push({
            id: orderId,
            userId: userId,
            ...data[userId][orderId]
          });
        });
      });
    }
    
    return allOrders;
  } catch (error) {
    console.error('Error fetching all orders:', error);
    return [];
  }
}

export function listenToAllOrders(callback: (orders: any[]) => void) {
  try {
    const ordersRef = ref(database, 'orders');
    return onValue(ordersRef, (snapshot) => {
      const allOrders: any[] = [];
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        Object.keys(data).forEach(userId => {
          if (data[userId]) {
            Object.keys(data[userId]).forEach(orderId => {
              allOrders.push({
                id: orderId,
                userId: userId,
                ...data[userId][orderId]
              });
            });
          }
        });
      }
      
      // Sort by most recent first
      const sorted = allOrders.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      });
      
      callback(sorted);
    }, (error) => {
      console.error('Error listening to all orders:', error);
      callback([]);
    });
  } catch (error) {
    console.error('Error setting up all orders listener:', error);
    return () => {};
  }
}

// ===== USERS =====
export async function getUserData(userId: string) {
  try {
    const userRef = ref(database, `users/${userId}`);
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
      return snapshot.val();
    }
    return null;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

export async function updateUserData(userId: string, updates: any) {
  try {
    const userRef = ref(database, `users/${userId}`);
    await update(userRef, updates);
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

export async function getAllUsers() {
  try {
    const usersRef = ref(database, 'users');
    const snapshot = await get(usersRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.keys(data).map(key => ({ id: key, ...data[key] }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}

// ===== SUPABASE STORAGE - IMAGE UPLOADS =====
export async function uploadPaymentProof(userId: string, file: File) {
  try {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Image storage service is not available. Please try again later.');
    }

    const fileName = `${userId}/${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage
      .from('payment-proofs')
      .upload(fileName, file);
    
    if (error) throw error;
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('payment-proofs')
      .getPublicUrl(fileName);
    
    return {
      path: data?.path,
      url: urlData?.publicUrl,
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

export async function getPaymentProofUrl(path: string) {
  try {
    if (!isSupabaseConfigured || !supabase) {
      return null;
    }

    const { data } = supabase.storage
      .from('payment-proofs')
      .getPublicUrl(path);
    return data?.publicUrl;
  } catch (error) {
    console.error('Error getting URL:', error);
    return null;
  }
}

export async function deletePaymentProof(path: string) {
  try {
    if (!isSupabaseConfigured || !supabase) {
      console.warn('Supabase is not configured, skipping file deletion');
      return;
    }

    const { error } = await supabase.storage
      .from('payment-proofs')
      .remove([path]);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
}

// ===== REFERRALS =====
export async function addReferral(userId: string, referredUserId: string) {
  try {
    // Update referred user's referredBy
    await updateUserData(referredUserId, { referredBy: userId });
    
    // Increment user's referredCount
    const userData = await getUserData(userId);
    const currentCount = userData?.referredCount || 0;
    await updateUserData(userId, { referredCount: currentCount + 1 });
    
    // Get referred user's name
    const referredUserData = await getUserData(referredUserId);
    const referredUserName = referredUserData?.name || 'New User';
    
    // Send notification to referrer
    await sendNotification(userId, {
      title: '🎉 New Referral!',
      message: `${referredUserName} signed up using your referral code! You now have ${currentCount + 1} active referrals.`,
      type: 'referral',
      referralFromUserId: referredUserId,
      referralFromUserName: referredUserName,
    });
  } catch (error) {
    console.error('Error adding referral:', error);
    throw error;
  }
}

export async function getUserReferrals(userId: string) {
  try {
    const usersRef = ref(database, 'users');
    const snapshot = await get(usersRef);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.keys(data)
        .filter(key => data[key].referredBy === userId)
        .map(key => ({ id: key, ...data[key] }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching referrals:', error);
    return [];
  }
}

export async function getReferralDetailsForUser(userId: string): Promise<(User & { ordersCount: number; approvedOrders: number })[]> {
  try {
    const referralsData = await getUserReferrals(userId);
    const detailedReferrals: any[] = [];
    
    for (const referral of referralsData) {
      const userOrders = await getUserOrders(referral.id);
      const approvedOrders = userOrders.filter(o => o.status === 'approved' || o.status === 'active').length;
      
      detailedReferrals.push({
        ...referral,
        ordersCount: userOrders.length,
        approvedOrders,
      });
    }
    
    return detailedReferrals;
  } catch (error) {
    console.error('Error fetching referral details:', error);
    return [];
  }
}

export async function getUserIncomeFromReferrals(userId: string): Promise<number> {
  try {
    const referralsData = await getUserReferrals(userId);
    let totalEarnings = 0;
    
    for (const referral of referralsData) {
      const userOrders = await getUserOrders(referral.id);
      const approvedOrders = userOrders.filter(o => o.status === 'approved' || o.status === 'active');
      
      // Calculate 5% commission on each approved order's final price
      for (const order of approvedOrders) {
        const finalPrice = order.finalPrice || order.price || 0;
        totalEarnings += finalPrice * 0.05; // 5% commission
      }
    }
    
    return totalEarnings;
  } catch (error) {
    console.error('Error calculating referral income:', error);
    return 0;
  }
}

// ===== CONFIG =====
export interface ConfigData {
  // Site Settings
  site: {
    siteName: string;
    maintenanceMode: boolean;
    maintenanceMessage: string;
    supportEmail: string;
    supportPhone: string;
    currency: string;
  };
  // Order Settings
  orders: {
    minAmount: number;
    maxAmount: number;
    orderTimeout: number; // in hours
    deliveryTime: number; // in days
  };
  // Plan Pricing Settings
  plans: {
    plan1Month: {
      name: string;
      duration: number;
      price: number;
      salePrice: number;
      features: string;
    };
    plan6Month: {
      name: string;
      duration: number;
      price: number;
      salePrice: number;
      features: string;
    };
    plan12Month: {
      name: string;
      duration: number;
      price: number;
      salePrice: number;
      features: string;
    };
    extraDiscount: number; // percentage
  };
  // Referral Settings
  referral: {
    isActive: boolean;
    commissionRate: number; // percentage per referral
    minReferrals: number; // minimum referrals to payout
    bonusAmount: number; // bonus amount per referral
    payoutThreshold: number; // minimum amount to request payout
  };
  // Payment Methods Settings
  paymentMethods: {
    binance: {
      isActive: boolean;
      extraDiscount: number;
      instructions?: string;
      accountInfo?: string;
    };
    remitly: {
      isActive: boolean;
      extraDiscount: number;
      instructions?: string;
      accountInfo?: string;
    };
    paypal: {
      isActive: boolean;
      extraDiscount: number;
      instructions?: string;
      accountInfo?: string;
    };
    cashapp: {
      isActive: boolean;
      extraDiscount: number;
      instructions?: string;
      accountInfo?: string;
    };
  };
  // Home Services
  homeServices?: {
    locksmith?: { name: string; phone: string };
    plumbing?: { name: string; phone: string };
    electrician?: { name: string; phone: string };
    roofing?: { name: string; phone: string };
    treeTrimming?: { name: string; phone: string };
    custom?: { name: string; phone: string };
  };
}

const DEFAULT_CONFIG: ConfigData = {
  site: {
    siteName: 'PrimexStream Pro',
    maintenanceMode: false,
    maintenanceMessage: '',
    supportEmail: 'support@primexstream.com',
    supportPhone: '+1234567890',
    currency: 'USD'
  },
  orders: {
    minAmount: 5,
    maxAmount: 10000,
    orderTimeout: 24,
    deliveryTime: 1
  },
  plans: {
    plan1Month: {
      name: '1 Month IPTV',
      duration: 1,
      price: 20,
      salePrice: 20,
      features: 'Full HD, 1000+ channels'
    },
    plan6Month: {
      name: '6 Months IPTV',
      duration: 6,
      price: 100,
      salePrice: 65,
      features: 'Full HD, 1000+ channels'
    },
    plan12Month: {
      name: '12 Months IPTV',
      duration: 12,
      price: 200,
      salePrice: 95,
      features: 'Full HD, 1000+ channels'
    },
    extraDiscount: 30
  },
  referral: {
    isActive: true,
    commissionRate: 10,
    minReferrals: 1,
    bonusAmount: 2,
    payoutThreshold: 10
  },
  paymentMethods: {
    binance: {
      isActive: true,
      extraDiscount: 30,
      instructions: 'Send payment to Binance wallet address',
      accountInfo: ''
    },
    remitly: {
      isActive: true,
      extraDiscount: 30,
      instructions: 'Use Remitly app to send payment',
      accountInfo: ''
    },
    paypal: {
      isActive: true,
      extraDiscount: 0,
      instructions: 'PayPal payment instructions',
      accountInfo: ''
    },
    cashapp: {
      isActive: true,
      extraDiscount: 0,
      instructions: 'Cash App payment instructions',
      accountInfo: ''
    }
  },
  homeServices: {
    locksmith: { name: 'Locksmith', phone: '' },
    plumbing: { name: 'Plumbing', phone: '' },
    electrician: { name: 'Electrician', phone: '' },
    roofing: { name: 'Roofing', phone: '' },
    treeTrimming: { name: 'Tree Trimming', phone: '' },
    custom: { name: 'Custom Service', phone: '' }
  }
};

export async function initializeConfig(): Promise<ConfigData> {
  try {
    const configRef = ref(database, 'config');
    await set(configRef, DEFAULT_CONFIG);
    return DEFAULT_CONFIG;
  } catch (error) {
    console.error('Error initializing config:', error);
    return DEFAULT_CONFIG;
  }
}

export async function getConfig(): Promise<ConfigData> {
  try {
    const configRef = ref(database, 'config');
    const snapshot = await get(configRef);
    if (snapshot.exists()) {
      return snapshot.val() as ConfigData;
    }
    // If config doesn't exist, initialize it
    return await initializeConfig();
  } catch (error: any) {
    if (error?.code === 'PERMISSION_DENIED' || error?.message?.includes('permission')) {
      console.warn('Config permission denied, using default config');
      return DEFAULT_CONFIG;
    }
    console.error('Error getting config:', error);
    return DEFAULT_CONFIG;
  }
}

export async function updateConfig(configData: ConfigData): Promise<boolean> {
  try {
    const configRef = ref(database, 'config');
    await set(configRef, configData);
    return true;
  } catch (error) {
    console.error('Error updating config:', error);
    return false;
  }
}

export function onConfigChange(callback: (config: ConfigData) => void) {
  const configRef = ref(database, 'config');
  return onValue(configRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val());
    }
  });
}

// ===== ADMIN SETTINGS - PAYMENT =====
export interface AdminSettings {
  payment?: {
    methodName?: string;
    instructions?: string;
    accountInfo?: string;
    extraDiscount?: number;
  };
  socialMedia?: {
    youtube?: string;
    tiktok?: string;
    instagram?: string;
    facebook?: string;
    twitter?: string;
    telegram?: string;
  };
}

export async function getAdminSettings(): Promise<AdminSettings | null> {
  try {
    const settingsRef = ref(database, 'admin_settings');
    const snapshot = await get(settingsRef);
    if (snapshot.exists()) {
      return snapshot.val() as AdminSettings;
    }
    return null;
  } catch (error) {
    console.error('Error fetching admin settings:', error);
    return null;
  }
}

export function onAdminSettingsChange(callback: (settings: AdminSettings | null) => void) {
  try {
    const settingsRef = ref(database, 'admin_settings');
    return onValue(
      settingsRef,
      (snapshot) => {
        if (snapshot.exists()) {
          callback(snapshot.val() as AdminSettings);
        } else {
          callback(null);
        }
      },
      (error) => {
        console.error('Error listening to admin settings:', error);
        callback(null);
      }
    );
  } catch (error) {
    console.error('Error setting up admin settings listener:', error);
    return () => {};
  }
}

export async function updateAdminSettings(updates: Partial<AdminSettings>) {
  try {
    const settingsRef = ref(database, 'admin_settings');
    await update(settingsRef, updates);
  } catch (error) {
    console.error('Error updating admin settings:', error);
    throw error;
  }
}

// ===== SOCIAL MEDIA MANAGEMENT =====

export async function getSocialMediaLinks(): Promise<AdminSettings['socialMedia'] | null> {
  try {
    const settings = await getAdminSettings();
    return settings?.socialMedia || null;
  } catch (error) {
    console.error('Error fetching social media links:', error);
    return null;
  }
}

export async function updateSocialMediaLinks(links: AdminSettings['socialMedia']): Promise<void> {
  try {
    const settingsRef = ref(database, 'admin_settings');
    await update(settingsRef, { socialMedia: links });
    console.log('✅ Social media links updated');
  } catch (error) {
    console.error('Error updating social media links:', error);
    throw error;
  }
}

export function onSocialMediaChange(callback: (links: AdminSettings['socialMedia'] | null) => void) {
  try {
    const settingsRef = ref(database, 'admin_settings');
    return onValue(settingsRef, (snapshot) => {
      if (snapshot.exists()) {
        const settings = snapshot.val() as AdminSettings;
        callback(settings?.socialMedia || null);
      } else {
        callback(null);
      }
    });
  } catch (error) {
    console.error('Error setting up social media listener:', error);
    return () => {};
  }
}

// ===== ORDER APPROVAL SYSTEM =====
export interface OrderApprovalData {
  status: 'pending' | 'approved' | 'rejected';
  credentials?: {
    username: string;
    password: string;
    url: string;
    expiryDate: string;
  };
  rejectionReason?: string;
  approvedAt?: string;
  decisionMadeBy?: string;
}

export async function approveOrder(
  userId: string, 
  orderId: string, 
  credentials: { username: string; password: string; url: string; expiryDate: string }
): Promise<boolean> {
  try {
    const orderRef = ref(database, `orders/${userId}/${orderId}`);
    await update(orderRef, {
      status: 'approved',
      credentials: credentials,
      approvedAt: new Date().toISOString(),
      decisionMadeBy: 'admin'
    });
    return true;
  } catch (error) {
    console.error('Error approving order:', error);
    return false;
  }
}

export async function rejectOrder(
  userId: string, 
  orderId: string, 
  rejectionReason: string
): Promise<boolean> {
  try {
    const orderRef = ref(database, `orders/${userId}/${orderId}`);
    await update(orderRef, {
      status: 'rejected',
      rejectionReason: rejectionReason,
      approvedAt: new Date().toISOString(),
      decisionMadeBy: 'admin'
    });
    return true;
  } catch (error) {
    console.error('Error rejecting order:', error);
    return false;
  }
}

export async function getAllPendingOrders(): Promise<Array<any>> {
  try {
    const ordersRef = ref(database, 'orders');
    const snapshot = await get(ordersRef);
    if (!snapshot.exists()) return [];

    const allOrders: any[] = [];
    const usersData = snapshot.val();

    for (const userId in usersData) {
      const userOrders = usersData[userId];
      for (const orderId in userOrders) {
        const order = userOrders[orderId];
        if (order.status === 'pending') {
          allOrders.push({
            id: orderId,
            userId,
            ...order
          });
        }
      }
    }

    return allOrders;
  } catch (error) {
    console.error('Error fetching pending orders:', error);
    return [];
  }
}

// ===== REFERRAL VALIDATION =====
// Find a user by their referral code
export async function getUserByReferralCode(referralCode: string): Promise<string | null> {
  try {
    // Get all users
    const usersRef = ref(database, 'users');
    const snapshot = await get(usersRef);
    
    if (!snapshot.exists()) {
      return null;
    }

    const users = snapshot.val();
    // Find the user who has this referral code
    for (const userId in users) {
      if (users[userId].referralCode === referralCode) {
        return userId;
      }
    }

    return null; // Referral code not found
  } catch (error) {
    console.error('Error finding user by referral code:', error);
    return null;
  }
}

export async function validateReferral(
  referringUserId: string, 
  referralCode: string
): Promise<{ valid: boolean; reason?: string }> {
  try {
    // Check 1: Self-referral prevention
    if (referringUserId === referralCode) {
      return { valid: false, reason: 'You cannot refer yourself' };
    }

    // Check 2: Find the user who owns the referral code
    const codeOwnerUserId = await getUserByReferralCode(referralCode);
    if (!codeOwnerUserId) {
      return { valid: false, reason: 'Referral code does not exist' };
    }

    // Check 3: Self-referral prevention (using actual user ID)
    if (referringUserId === codeOwnerUserId) {
      return { valid: false, reason: 'You cannot refer yourself' };
    }

    // Check 4: Circular referral prevention
    // Check if the referral code owner has already referred the current user
    const referredByRef = ref(database, `referrals/${codeOwnerUserId}`);
    const referredBySnapshot = await get(referredByRef);
    
    if (referredBySnapshot.exists()) {
      const referralsOfCodeOwner = referredBySnapshot.val();
      if (referralsOfCodeOwner[referringUserId]) {
        return { valid: false, reason: 'Circular referral not allowed. This user has already referred you.' };
      }
    }

    return { valid: true };
  } catch (error) {
    console.error('Error validating referral:', error);
    return { valid: false, reason: 'Error validating referral' };
  }
}

// Apply a valid referral code to a user
export async function applyReferralCode(userId: string, referralCode: string): Promise<{ success: boolean; newReferralCount?: number; error?: string }> {
  try {
    // First validate the referral code
    const validation = await validateReferral(userId, referralCode);
    if (!validation.valid) {
      return { success: false, error: validation.reason || 'Invalid referral code' };
    }

    // Find the user who owns the referral code
    const codeOwnerId = await getUserByReferralCode(referralCode);
    if (!codeOwnerId) {
      return { success: false, error: 'Referral code does not exist' };
    }

    // Get current user data for name
    const currentUserData = await getUserData(userId);
    const currentUserName = currentUserData?.name || 'User';

    // Update current user to set referrer
    await updateUserData(userId, { 
      referredBy: codeOwnerId,
      appliedReferralCode: referralCode
    });

    // Increment the referrer's total referrals count
    const referrerData = await getUserData(codeOwnerId);
    const newTotalReferrals = (referrerData?.totalReferrals || 0) + 1;
    await updateUserData(codeOwnerId, { totalReferrals: newTotalReferrals });

    // Create referral entry in referral list
    const referralListRef = ref(database, `users/${codeOwnerId}/referralList/${userId}`);
    await set(referralListRef, {
      userId: userId,
      userName: currentUserName,
      status: 'signup', // 'signup' or 'purchased'
      appliedAt: new Date().toISOString(),
      purchasedAt: null,
      reminderSentAt: null
    });

    // Send notification to referrer that new user signed up
    await sendNotification(codeOwnerId, {
      title: 'New Referral!',
      message: `${currentUserName} signed up using your referral code. Encourage them to buy a subscription!`,
      type: 'referral',
      referralFromUserId: userId,
      referralFromUserName: currentUserName
    });

    return { success: true, newReferralCount: newTotalReferrals };
  } catch (error) {
    console.error('Error applying referral code:', error);
    return { success: false, error: 'Error applying referral code' };
  }
}

// Send reminder notification to a referred user
export async function sendReminderToReferral(
  referrerId: string,
  referredUserId: string,
  referrerName: string
): Promise<boolean> {
  try {
    // Send notification to referred user
    await sendNotification(referredUserId, {
      title: 'Special Offer from Your Referrer!',
      message: `${referrerName} is inviting you to buy a subscription! Get 30% discount or $5 cash back!`,
      type: 'reminder'
    });

    // Update referral list with reminder sent time
    const referralRef = ref(database, `users/${referrerId}/referralList/${referredUserId}`);
    await update(referralRef, { reminderSentAt: new Date().toISOString() });

    return true;
  } catch (error) {
    console.error('Error sending reminder:', error);
    return false;
  }
}

// Mark referral reward as claimed
export async function markReferralAsClaimed(
  referrerId: string,
  referredUserId: string
): Promise<boolean> {
  try {
    const referralRef = ref(database, `users/${referrerId}/referralList/${referredUserId}`);
    await update(referralRef, {
      status: 'claimed',
      claimedAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('Error marking referral as claimed:', error);
    return false;
  }
}

// Get referral list for user with real-time updates
export function listenToUserReferralList(
  userId: string,
  callback: (referrals: any[]) => void
) {
  try {
    const referralListRef = ref(database, `users/${userId}/referralList`);
    return onValue(referralListRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const referrals = Object.keys(data)
          .map(key => ({ id: key, ...data[key] }))
          .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());
        callback(referrals);
      } else {
        callback([]);
      }
    }, (error) => {
      console.error('Error listening to referral list:', error);
      callback([]);
    });
  } catch (error) {
    console.error('Error setting up referral list listener:', error);
    return () => {};
  }
}

// Get referral list for user (single fetch)
export async function getUserReferralList(userId: string): Promise<any[]> {
  try {
    const referralListRef = ref(database, `users/${userId}/referralList`);
    const snapshot = await get(referralListRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.keys(data)
        .map(key => ({ id: key, ...data[key] }))
        .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());
    }
    return [];
  } catch (error) {
    console.error('Error fetching referral list:', error);
    return [];
  }
}

// ===== ADMIN CONTENT MANAGEMENT =====
export interface AdminContent {
  homeServices?: {
    locksmith?: { name: string; phone: string };
    treeTrimming?: { name: string; phone: string };
    roofing?: { name: string; phone: string };
    plumbing?: { name: string; phone: string };
    electrician?: { name: string; phone: string };
    custom?: { name: string; phone: string };
  };
  paymentMethods?: {
    remitly?: { isActive: boolean; instructions: string; accountInfo: string; discount: number };
    binance?: { isActive: boolean; instructions: string; accountInfo: string; discount: number };
    paypal?: { isActive: boolean; instructions: string; accountInfo: string; discount: number };
    cashapp?: { isActive: boolean; instructions: string; accountInfo: string; discount: number };
  };
  discounts?: {
    generalDiscount: number;
    referralBonus: number;
  };
}

export async function getAdminContent(): Promise<AdminContent | null> {
  try {
    const contentRef = ref(database, 'admin_content');
    const snapshot = await get(contentRef);
    if (snapshot.exists()) {
      return snapshot.val() as AdminContent;
    }
    return null;
  } catch (error) {
    console.error('Error fetching admin content:', error);
    return null;
  }
}

export async function updateAdminContent(updates: Partial<AdminContent>): Promise<boolean> {
  try {
    const contentRef = ref(database, 'admin_content');
    await update(contentRef, updates);
    return true;
  } catch (error) {
    console.error('Error updating admin content:', error);
    return false;
  }
}

export function onAdminContentChange(callback: (content: AdminContent | null) => void) {
  try {
    const contentRef = ref(database, 'admin_content');
    return onValue(
      contentRef,
      (snapshot) => {
        if (snapshot.exists()) {
          callback(snapshot.val() as AdminContent);
        } else {
          callback(null);
        }
      },
      (error) => {
        console.error('Error listening to admin content:', error);
        callback(null);
      }
    );
  } catch (error) {
    console.error('Error setting up admin content listener:', error);
    return () => {};
  }
}
