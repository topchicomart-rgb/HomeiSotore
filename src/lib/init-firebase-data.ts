import { database } from '@/lib/firebase-config';
import { ref, set, get } from 'firebase/database';

export const PLANS = {
  '1-month': {
    id: '1-month',
    name: 'IPTV 1-Month',
    duration: '1 Month',
    originalPrice: 25,
    salePrice: 20,
    discount: 5,
    description: 'Access for 1 month',
    extraDiscount: 6, // 30% of 20 = 6
  },
  '6-month': {
    id: '6-month',
    name: 'IPTV 6-Month',
    duration: '6 Months',
    originalPrice: 75,
    salePrice: 65,
    discount: 10,
    description: 'Access for 6 months',
    extraDiscount: 19.5, // 30% of 65 = 19.5
  },
  '12-month': {
    id: '12-month',
    name: 'IPTV 12-Month',
    duration: '12 Months',
    originalPrice: 120,
    salePrice: 95,
    discount: 25,
    description: 'Access for 12 months',
    extraDiscount: 28.5, // 30% of 95 = 28.5
  },
};

export async function initializeFirebaseData() {
  try {
    console.log('Initializing Firebase plans...');
    
    const plansRef = ref(database, 'plans');
    const snapshot = await get(plansRef);
    
    // Only initialize if plans don't exist
    if (!snapshot.exists()) {
      await set(plansRef, PLANS);
      console.log('✅ Plans initialized successfully');
    } else {
      console.log('✅ Plans already exist');
    }
  } catch (error) {
    console.error('Error initializing Firebase data:', error);
  }
}
