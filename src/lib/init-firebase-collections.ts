import { db } from '@/lib/firebase-config';
import { collection, doc, setDoc } from 'firebase/firestore';

/**
 * Run this once to populate Firebase with initial data
 * Call it from your admin panel or an initialization page
 */

export async function initializeFirebaseCollections() {
  try {
    console.log('🚀 Starting Firebase initialization...');

    // 1. Initialize Plans
    await initPlans();
    console.log('✅ Plans initialized');

    // 2. Initialize Payment Methods
    await initPaymentMethods();
    console.log('✅ Payment Methods initialized');

    // 3. Initialize Referral Tiers
    await initReferralTiers();
    console.log('✅ Referral Tiers initialized');

    // 4. Initialize FAQs
    await initFAQs();
    console.log('✅ FAQs initialized');

    // 5. Initialize Reviews
    await initReviews();
    console.log('✅ Reviews initialized');

    // 6. Initialize Services
    await initServices();
    console.log('✅ Services initialized');

    // 7. Initialize Devices
    await initDevices();
    console.log('✅ Devices initialized');

    // 8. Initialize Site Settings
    await initSiteSettings();
    console.log('✅ Site Settings initialized');

    console.log('🎉 Firebase initialization complete!');
    return true;
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error);
    throw error;
  }
}

// ============ INITIALIZATION FUNCTIONS ============

async function initPlans() {
  const plansData = {
    '1-month': {
      name: 'IPTV 1-Month',
      duration: '1 Month',
      originalPrice: 25,
      salePrice: 20,
      discount: 5,
      description: 'Access for 1 month',
      extraDiscount: 6,
      isActive: true,
    },
    '6-month': {
      name: 'IPTV 6-Month',
      duration: '6 Months',
      originalPrice: 75,
      salePrice: 65,
      discount: 10,
      description: 'Access for 6 months',
      extraDiscount: 19.5,
      isActive: true,
    },
    '12-month': {
      name: 'IPTV 12-Month',
      duration: '12 Months',
      originalPrice: 120,
      salePrice: 95,
      discount: 25,
      description: 'Access for 12 months',
      extraDiscount: 28.5,
      isActive: true,
    },
  };

  for (const [id, data] of Object.entries(plansData)) {
    await setDoc(doc(db, 'plans', id), data);
  }
}

async function initPaymentMethods() {
  const paymentsData = {
    binance: {
      name: 'Binance',
      icon: '🟡',
      instructions: 'Send USDT to the Binance address provided. You will receive access within 5 minutes.',
      accountInfo: 'Binance Wallet: [Your Binance Address]',
      isActive: true,
    },
    remitly: {
      name: 'Remitly',
      icon: '🔵',
      instructions: 'Send money via Remitly to the phone number. Confirm receipt and get access.',
      accountInfo: 'Remitly Recipient: [Your Number]',
      isActive: true,
    },
    paypal: {
      name: 'PayPal',
      icon: '💙',
      instructions: 'Pay via PayPal using Friends & Family to avoid fees.',
      accountInfo: 'PayPal Email: [Your PayPal Email]',
      isActive: true,
    },
    cashapp: {
      name: 'Cash App',
      icon: '💚',
      instructions: 'Send via Cash App to get instant access.',
      accountInfo: 'Cash App Tag: [Your Tag]',
      isActive: true,
    },
  };

  for (const [id, data] of Object.entries(paymentsData)) {
    await setDoc(doc(db, 'paymentMethods', id), data);
  }
}

async function initReferralTiers() {
  const tiersData = {
    'tier-1': {
      level: 1,
      minReferrals: 2,
      reward: '1 Month IPTV',
      icon: '🎁',
      bonus: 5,
      description: 'Get 5% commission at 2 referrals',
    },
    'tier-2': {
      level: 2,
      minReferrals: 5,
      reward: '6 Months IPTV',
      icon: '🌟',
      bonus: 7,
      description: 'Get 7% commission at 5 referrals',
    },
    'tier-3': {
      level: 3,
      minReferrals: 10,
      reward: '12 Months IPTV',
      icon: '👑',
      bonus: 10,
      description: 'Get 10% commission at 10 referrals',
    },
  };

  for (const [id, data] of Object.entries(tiersData)) {
    await setDoc(doc(db, 'referralTiers', id), data);
  }
}

async function initFAQs() {
  const faqsData = [
    {
      category: 'Getting Started',
      question: 'How do I start using PrimexStream Pro?',
      answer: 'Sign up with your email, choose a plan, and start streaming immediately. It takes less than 2 minutes!',
      order: 1,
    },
    {
      category: 'Devices',
      question: 'What devices can I use?',
      answer: 'Smart TV, Firestick, Android Box, Mobile, Laptop, Tablet, MAG Box, and PC. Basically any device with internet connection!',
      order: 2,
    },
    {
      category: 'Account',
      question: 'Can I share my account?',
      answer: 'Each account supports up to 4 simultaneous streams. You can share with family members.',
      order: 3,
    },
    {
      category: 'Support',
      question: 'How do I get support?',
      answer: 'Contact us via WhatsApp, email, or use the support form on this website 24/7.',
      order: 4,
    },
    {
      category: 'Payment',
      question: 'Is there a money-back guarantee?',
      answer: 'Yes! 7-day money-back guarantee if you\'re not satisfied with our service.',
      order: 5,
    },
    {
      category: 'Payment',
      question: 'Are there hidden fees?',
      answer: 'No, all pricing is transparent. No hidden charges or surprise fees. What you see is what you pay.',
      order: 6,
    },
  ];

  for (let i = 0; i < faqsData.length; i++) {
    await setDoc(doc(db, 'faqs', `faq-${i + 1}`), faqsData[i]);
  }
}

async function initReviews() {
  const reviewsData = [
    {
      name: 'Ahmed Hassan',
      rating: 5,
      text: 'Excellent service! The IPTV streams are crystal clear and the referral program is amazing.',
      date: '2 weeks ago',
      verified: true,
    },
    {
      name: 'Sarah Johnson',
      rating: 5,
      text: 'Best IPTV provider I\'ve used. Customer support is responsive and helpful.',
      date: '1 week ago',
      verified: true,
    },
    {
      name: 'Marco Silva',
      rating: 5,
      text: 'Very satisfied with the platform. Earning through referrals is easy and rewarding!',
      date: '3 days ago',
      verified: true,
    },
  ];

  for (let i = 0; i < reviewsData.length; i++) {
    await setDoc(doc(db, 'reviews', `review-${i + 1}`), reviewsData[i]);
  }
}

async function initServices() {
  const servicesData = {
    'service-iptv': {
      name: 'IPTV Services',
      icon: 'Tv',
      href: '/iptv',
      color: 'from-blue-500 to-blue-600',
      description: 'Premium IPTV streaming service',
    },
    'service-repair': {
      name: 'Home Repair',
      icon: 'Wrench',
      href: '/home-repair',
      color: 'from-orange-500 to-orange-600',
      description: 'Professional home repair services',
    },
    'service-earn': {
      name: 'Earn Program',
      icon: 'TrendingUp',
      href: '/earn',
      color: 'from-purple-500 to-purple-600',
      description: 'Earn money through referrals',
    },
    'service-products': {
      name: 'Custom Products',
      icon: 'Package',
      href: '#',
      color: 'from-pink-500 to-pink-600',
      description: 'Customized product solutions',
    },
  };

  for (const [id, data] of Object.entries(servicesData)) {
    await setDoc(doc(db, 'services', id), data);
  }
}

async function initDevices() {
  const devicesData = [
    { id: 'smart-tv', label: 'Smart TV', emoji: '📺' },
    { id: 'firestick', label: 'Firestick', emoji: '🔥' },
    { id: 'android-box', label: 'Android Box', emoji: '📦' },
    { id: 'mobile', label: 'Mobile', emoji: '📱' },
    { id: 'laptop', label: 'Laptop', emoji: '💻' },
    { id: 'tablet', label: 'Tablet', emoji: '⌚' },
    { id: 'mag-box', label: 'MAG Box', emoji: '🖥️' },
    { id: 'pc', label: 'PC', emoji: '🖲️' },
  ];

  for (let i = 0; i < devicesData.length; i++) {
    await setDoc(doc(db, 'devices', `device-${i + 1}`), devicesData[i]);
  }
}

async function initSiteSettings() {
  const settingsData = {
    companyName: 'PrimexStream Pro',
    phoneNumber: '+1-800-IPTV-PRO', // TODO: Update with real number
    email: 'support@primexstream.pro', // TODO: Update with real email
    whatsappNumber: '+1-800-IPTV-PRO', // TODO: Update with real number
    paymentInstructions: 'Send payment and receive access within 5 minutes. Available 24/7.',
    homeTitle: 'Premium IPTV Streaming & Earning Platform',
    homeDescription: 'Get instant access to 10,000+ channels in HD. Earn money by referring friends.',
  };

  await setDoc(doc(db, 'settings', 'general'), settingsData);
}
