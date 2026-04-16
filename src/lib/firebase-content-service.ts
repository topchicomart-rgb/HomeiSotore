import { db } from '@/lib/firebase-config';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  setDoc,
  addDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';

// ============ TYPES ============

export interface Plan {
  id: string;
  name: string;
  duration: string;
  originalPrice: number;
  salePrice: number;
  discount: number;
  description: string;
  extraDiscount: number;
  isActive?: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  instructions: string;
  accountInfo?: string;
  isActive: boolean;
}

export interface Order {
  id: string;
  userId: string;
  userEmail: string;
  planId: string;
  planName: string;
  amount: number;
  finalPrice: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'active';
  paymentMethod: string;
  paymentProof?: string;
  username?: string;
  password?: string;
  url?: string;
  expiryDate?: string;
  rejectReason?: string;
  device?: string;
  referredBy?: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

export interface User {
  id: string;
  email: string;
  name: string;
  referralCode: string;
  totalReferrals: number;
  referredBy?: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

export interface Referral {
  id: string;
  referrerId: string;
  refereeId: string;
  refereeEmail: string;
  status: 'pending' | 'completed';
  commission: number;
  createdAt: Timestamp;
}

export interface SiteSettings {
  id: string;
  companyName: string;
  phoneNumber: string;
  email: string;
  whatsappNumber: string;
  paymentInstructions: string;
  homeTitle: string;
  homeDescription: string;
  updatedAt?: Timestamp;
}

// ============ PLANS ============

export async function getPlans(): Promise<Plan[]> {
  try {
    const querySnapshot = await getDocs(collection(db, 'plans'));
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Plan));
  } catch (error) {
    console.error('Error getting plans:', error);
    return [];
  }
}

export function listenToPlans(callback: (plans: Plan[]) => void) {
  try {
    return onSnapshot(collection(db, 'plans'), (snapshot) => {
      const plans = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as Plan));
      callback(plans);
    });
  } catch (error) {
    console.error('Error listening to plans:', error);
    return () => {};
  }
}

export async function updatePlan(planId: string, updates: Partial<Plan>) {
  try {
    const planRef = doc(db, 'plans', planId);
    await updateDoc(planRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating plan:', error);
    throw error;
  }
}

export async function createPlan(planData: Omit<Plan, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    const docRef = await addDoc(collection(db, 'plans'), {
      ...planData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating plan:', error);
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

// ============ PAYMENT METHODS ============

export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  try {
    const querySnapshot = await getDocs(collection(db, 'paymentMethods'));
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as PaymentMethod));
  } catch (error) {
    console.error('Error getting payment methods:', error);
    return [];
  }
}

export function listenToPaymentMethods(callback: (methods: PaymentMethod[]) => void) {
  try {
    return onSnapshot(collection(db, 'paymentMethods'), (snapshot) => {
      const methods = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as PaymentMethod));
      callback(methods);
    });
  } catch (error) {
    console.error('Error listening to payment methods:', error);
    return () => {};
  }
}

export async function updatePaymentMethod(methodId: string, updates: Partial<PaymentMethod>) {
  try {
    const methodRef = doc(db, 'paymentMethods', methodId);
    await updateDoc(methodRef, updates);
  } catch (error) {
    console.error('Error updating payment method:', error);
    throw error;
  }
}

// ============ ORDERS ============

export async function getOrders(): Promise<Order[]> {
  try {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Order));
  } catch (error) {
    console.error('Error getting orders:', error);
    return [];
  }
}

export function listenToOrders(callback: (orders: Order[]) => void) {
  try {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const orders = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as Order));
      callback(orders);
    });
  } catch (error) {
    console.error('Error listening to orders:', error);
    return () => {};
  }
}

export async function getUserOrders(userId: string): Promise<Order[]> {
  try {
    const q = query(collection(db, 'orders'), where('userId', '==', userId), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Order));
  } catch (error) {
    console.error('Error getting user orders:', error);
    return [];
  }
}

export async function createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    const docRef = await addDoc(collection(db, 'orders'), {
      ...orderData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}

export async function updateOrder(orderId: string, updates: Partial<Order>) {
  try {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating order:', error);
    throw error;
  }
}

// ============ USERS ============

export async function getUser(userId: string): Promise<User | null> {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return { id: userSnap.id, ...userSnap.data() } as User;
    }
    return null;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
}

export async function getUsers(): Promise<User[]> {
  try {
    const querySnapshot = await getDocs(collection(db, 'users'));
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as User));
  } catch (error) {
    console.error('Error getting users:', error);
    return [];
  }
}

// ============ REFERRALS ============

export async function getReferralsForUser(userId: string): Promise<Referral[]> {
  try {
    const q = query(collection(db, 'referrals'), where('referrerId', '==', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Referral));
  } catch (error) {
    console.error('Error getting referrals:', error);
    return [];
  }
}

export async function getReferralDetails(userId: string) {
  try {
    const referrals = await getReferralsForUser(userId);
    const referralDetails = await Promise.all(
      referrals.map(async (referral) => {
        const user = await getUser(referral.refereeId);
        const orders = await getUserOrders(referral.refereeId);
        const approvedOrders = orders.filter((o) => o.status === 'approved' || o.status === 'completed').length;
        return {
          ...user,
          ordersCount: orders.length,
          approvedOrders,
        };
      })
    );
    return referralDetails;
  } catch (error) {
    console.error('Error getting referral details:', error);
    return [];
  }
}

// ============ SITE SETTINGS ============

export async function getSiteSettings(): Promise<SiteSettings | null> {
  try {
    const settingsRef = doc(db, 'settings', 'general');
    const settingsSnap = await getDoc(settingsRef);
    if (settingsSnap.exists()) {
      return { id: settingsSnap.id, ...settingsSnap.data() } as SiteSettings;
    }
    return null;
  } catch (error) {
    console.error('Error getting site settings:', error);
    return null;
  }
}

export function listenToSiteSettings(callback: (settings: SiteSettings | null) => void) {
  try {
    const settingsRef = doc(db, 'settings', 'general');
    return onSnapshot(settingsRef, (snapshot) => {
      if (snapshot.exists()) {
        callback({ id: snapshot.id, ...snapshot.data() } as SiteSettings);
      } else {
        callback(null);
      }
    });
  } catch (error) {
    console.error('Error listening to site settings:', error);
    return () => {};
  }
}

export async function updateSiteSettings(updates: Partial<SiteSettings>) {
  try {
    const settingsRef = doc(db, 'settings', 'general');
    await setDoc(settingsRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    console.error('Error updating site settings:', error);
    throw error;
  }
}

// ============ STATS ============

export async function getDashboardStats() {
  try {
    const [orders, users, plans] = await Promise.all([
      getOrders(),
      getUsers(),
      getPlans(),
    ]);

    const totalOrders = orders.length;
    const pendingOrders = orders.filter((o) => o.status === 'pending').length;
    const approvedOrders = orders.filter((o) => o.status === 'approved' || o.status === 'completed').length;
    const rejectedOrders = orders.filter((o) => o.status === 'rejected').length;
    const totalRevenue = orders
      .filter((o) => o.status === 'approved' || o.status === 'completed')
      .reduce((sum, o) => sum + o.finalPrice, 0);

    return {
      totalOrders,
      pendingOrders,
      approvedOrders,
      rejectedOrders,
      totalRevenue,
      totalSales: totalRevenue,
      totalMembers: users.length,
      totalPlans: plans.length,
    };
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    return {
      totalOrders: 0,
      pendingOrders: 0,
      approvedOrders: 0,
      rejectedOrders: 0,
      totalRevenue: 0,
      totalSales: 0,
      totalMembers: 0,
      totalPlans: 0,
    };
  }
}

export function listenToDashboardStats(callback: (stats: any) => void) {
  let unsubscribers: Array<() => void> = [];

  try {
    unsubscribers.push(
      onSnapshot(collection(db, 'orders'), async () => {
        const stats = await getDashboardStats();
        callback(stats);
      })
    );

    unsubscribers.push(
      onSnapshot(collection(db, 'users'), async () => {
        const stats = await getDashboardStats();
        callback(stats);
      })
    );

    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  } catch (error) {
    console.error('Error listening to dashboard stats:', error);
    return () => {};
  }
}
