/**
 * Web Configuration Service
 * Manages website settings stored in Firestore
 */

import {
  db,
} from '@/lib/firebase-config';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';

export interface WebConfigData {
  id: string;
  planPrices?: {
    [key: string]: number;
  };
  siteTitle?: string;
  siteDescription?: string;
  maintenanceMode?: boolean;
  features?: {
    referralEnabled: boolean;
    socialTasksEnabled: boolean;
    walletEnabled: boolean;
  };
  contact?: {
    email: string;
    phone: string;
    whatsapp: string;
  };
  updatedAt: Timestamp;
}

const CONFIG_COLLECTION = 'webConfig';
const CONFIG_DOC = 'siteConfig';

/**
 * Get current web configuration
 */
export const getWebConfig = async (): Promise<WebConfigData | null> => {
  try {
    const docRef = doc(db, CONFIG_COLLECTION, CONFIG_DOC);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as WebConfigData;
    }

    // Return default if doesn't exist
    return {
      id: CONFIG_DOC,
      planPrices: {},
      siteTitle: 'PrimexStream Pro',
      siteDescription: 'Premium IPTV Service',
      maintenanceMode: false,
      features: {
        referralEnabled: true,
        socialTasksEnabled: true,
        walletEnabled: true,
      },
      contact: {
        email: 'support@primexstream.com',
        phone: '',
        whatsapp: '',
      },
      updatedAt: Timestamp.now(),
    };
  } catch (error) {
    console.error('Error getting web config:', error);
    return null;
  }
};

/**
 * Update web configuration
 */
export const updateWebConfig = async (config: WebConfigData): Promise<boolean> => {
  try {
    const docRef = doc(db, CONFIG_COLLECTION, CONFIG_DOC);
    
    // Remove id field before saving
    const { id, ...configData } = config;
    
    await setDoc(
      docRef,
      {
        ...configData,
        updatedAt: Timestamp.now(),
      },
      { merge: true }
    );

    console.log('✅ Web config updated successfully');
    return true;
  } catch (error) {
    console.error('❌ Error updating web config:', error);
    throw error;
  }
};

/**
 * Get specific plan price
 */
export const getPlanPrice = async (planId: string): Promise<number | null> => {
  try {
    const config = await getWebConfig();
    if (config?.planPrices && config.planPrices[planId]) {
      return config.planPrices[planId];
    }
    return null;
  } catch (error) {
    console.error('Error getting plan price:', error);
    return null;
  }
};

/**
 * Update specific plan price
 */
export const updatePlanPrice = async (planId: string, price: number): Promise<boolean> => {
  try {
    const config = await getWebConfig();
    if (!config) return false;

    const updatedConfig = {
      ...config,
      planPrices: {
        ...(config.planPrices || {}),
        [planId]: price,
      },
    };

    return await updateWebConfig(updatedConfig);
  } catch (error) {
    console.error('Error updating plan price:', error);
    return false;
  }
};

/**
 * Initialize default web config if it doesn't exist
 */
export const initializeWebConfig = async (): Promise<void> => {
  try {
    const config = await getWebConfig();
    if (!config) {
      const defaultConfig: WebConfigData = {
        id: CONFIG_DOC,
        planPrices: {
          '1month': 100,
          '3month': 250,
          '6month': 450,
          '12month': 800,
        },
        siteTitle: 'PrimexStream Pro',
        siteDescription: 'Premium IPTV Service',
        maintenanceMode: false,
        features: {
          referralEnabled: true,
          socialTasksEnabled: true,
          walletEnabled: true,
        },
        contact: {
          email: 'support@primexstream.com',
          phone: '',
          whatsapp: '',
        },
        updatedAt: Timestamp.now(),
      };

      await updateWebConfig(defaultConfig);
      console.log('✅ Default web config initialized');
    }
  } catch (error) {
    console.error('Error initializing web config:', error);
  }
};
