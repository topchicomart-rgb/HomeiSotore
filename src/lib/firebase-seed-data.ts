import { db } from '@/lib/firebase-config';
import { collection, doc, setDoc, query, where, getDocs } from 'firebase/firestore';

// ============ SEED DATA ============

const SEED_DATA = {
  // PLANS
  plans: [
    {
      id: '1-month',
      name: 'IPTV 1-Month',
      duration: '1 Month',
      originalPrice: 25,
      salePrice: 20,
      discount: 5,
      description: 'Access for 1 month',
      extraDiscount: 6,
      isActive: true,
    },
    {
      id: '6-month',
      name: 'IPTV 6-Month',
      duration: '6 Months',
      originalPrice: 75,
      salePrice: 65,
      discount: 10,
      description: 'Access for 6 months',
      extraDiscount: 19.5,
      isActive: true,
    },
    {
      id: '12-month',
      name: 'IPTV 12-Month',
      duration: '12 Months',
      originalPrice: 120,
      salePrice: 95,
      discount: 25,
      description: 'Access for 12 months',
      extraDiscount: 28.5,
      isActive: true,
    },
  ],

  // PAYMENT METHODS
  paymentMethods: [
    {
      id: 'remitly',
      name: 'Remitly',
      icon: '🔵',
      instructions: 'Send payment to our Remitly account. Provide transaction ID after payment.',
      accountInfo: 'Account owner: PrimexStream Pro\nEmail: support@primexstream.pro',
      isActive: true,
    },
    {
      id: 'binance',
      name: 'Binance',
      icon: '🟡',
      instructions: 'Send USDT or USDC to our Binance wallet. Fastest payment method with discounts!',
      accountInfo: 'Wallet Address: [To be configured in admin panel]\nNetwork: BSC (Binance Smart Chain)',
      isActive: true,
    },
    {
      id: 'paypal',
      name: 'PayPal',
      icon: '💙',
      instructions: 'Send payment via PayPal to our verified account.',
      accountInfo: 'PayPal: support@primexstream.pro',
      isActive: true,
    },
    {
      id: 'cashapp',
      name: 'Cash App',
      icon: '💚',
      instructions: 'Send payment via CashApp to our account.',
      accountInfo: 'CashApp: $PrimexStreamPro',
      isActive: true,
    },
  ],

  // REFERRAL TIERS
  referralTiers: [
    {
      id: '1',
      minReferrals: 2,
      reward: '1 Month IPTV Free',
      icon: '🎁',
      bonus: 5,
      description: 'Earn 5% commission when you refer 2 users',
    },
    {
      id: '2',
      minReferrals: 5,
      reward: '6 Months IPTV Free',
      icon: '🌟',
      bonus: 7,
      description: 'Earn 7% commission when you refer 5 users',
    },
    {
      id: '3',
      minReferrals: 10,
      reward: '12 Months IPTV Free',
      icon: '👑',
      bonus: 10,
      description: 'Earn 10% commission when you refer 10 users',
    },
  ],

  // FAQS
  faqs: [
    {
      id: '1',
      question: 'How do I start using PrimexStream Pro?',
      answer: 'Sign up with your email, choose a plan, and start streaming immediately. It takes less than 2 minutes! You can access on Smart TV, Android, iOS, and more.',
      category: 'Getting Started',
    },
    {
      id: '2',
      question: 'Can I cancel my plan anytime?',
      answer: 'Yes! You can cancel your subscription anytime without any penalties or hidden fees. Your service remains active until the end of your billing period.',
      category: 'Billing',
    },
    {
      id: '3',
      question: 'What devices are supported?',
      answer: 'Our service works on Smart TVs, Android devices, iOS, Windows, Mac, and web browsers. We support 9 different device types for maximum flexibility.',
      category: 'Devices',
    },
    {
      id: '4',
      question: 'How does the referral program work?',
      answer: 'Share your unique referral code with friends. When they sign up and make a purchase using your code, you earn a commission (5-10% depending on tier). No limits on earnings!',
      category: 'Referral Program',
    },
    {
      id: '5',
      question: 'Is there a free trial available?',
      answer: 'Yes! New users get a 7-day free trial to explore all our premium features. No credit card required to start the trial.',
      category: 'Getting Started',
    },
    {
      id: '6',
      question: 'How do I withdraw my earnings?',
      answer: 'Go to your Wallet section and click "Redeem". We support multiple withdrawal methods: Remitly, Binance, PayPal, and CashApp. Minimum withdrawal: $10.',
      category: 'Wallet',
    },
    {
      id: '7',
      question: 'Is my payment information secure?',
      answer: 'Yes! We use bank-level encryption (SSL/TLS) to protect your payments. All transactions are secured with industry-standard security protocols.',
      category: 'Security',
    },
    {
      id: '8',
      question: 'What payment methods do you accept?',
      answer: 'We accept Remitly, Binance, PayPal, and CashApp. We offer 30% extra discounts on Remitly and Binance payments!',
      category: 'Payment',
    },
  ],

  // REVIEWS
  reviews: [
    {
      id: '1',
      name: 'Ahmed Hassan',
      rating: 5,
      text: 'Excellent service! The IPTV streams are crystal clear and the referral program is amazing. I\'ve earned over $500 in just 2 months!',
      date: '2 weeks ago',
      verified: true,
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      rating: 5,
      text: 'Best IPTV provider I\'ve used. Customer support is responsive and helpful. They helped me set up everything in minutes.',
      date: '1 month ago',
      verified: true,
    },
    {
      id: '3',
      name: 'Marco Silva',
      rating: 5,
      text: 'Very satisfied with the platform. Earning through referrals is easy and rewarding! The interface is user-friendly and intuitive.',
      date: '3 days ago',
      verified: true,
    },
  ],

  // SERVICES
  services: [
    {
      id: 'iptv',
      label: 'IPTV Services',
      href: '/iptv',
      color: 'from-blue-500 to-blue-600',
      description: '10,000+ live channels & on-demand content',
      icon: '📺',
    },
    {
      id: 'home-repair',
      label: 'Home Repair',
      href: '/home-repair',
      color: 'from-orange-500 to-orange-600',
      description: 'Professional home repair services',
      icon: '🔧',
    },
    {
      id: 'earn',
      label: 'Earn Program',
      href: '/earn',
      color: 'from-purple-500 to-purple-600',
      description: 'Earn up to 10% commission on referrals',
      icon: '💰',
    },
    {
      id: 'products',
      label: 'Custom Products',
      href: '#',
      color: 'from-pink-500 to-pink-600',
      description: 'Premium hardware & accessories',
      icon: '🎁',
    },
  ],

  // DEVICES
  devices: [
    { id: 'smart-tv', label: 'Smart TV', emoji: '📺' },
    { id: 'firestick', label: 'Firestick', emoji: '🔥' },
    { id: 'android-box', label: 'Android Box', emoji: '📦' },
    { id: 'mobile', label: 'Mobile', emoji: '📱' },
    { id: 'laptop', label: 'Laptop', emoji: '💻' },
    { id: 'tablet', label: 'Tablet', emoji: '⌚' },
    { id: 'mag-box', label: 'MAG Box', emoji: '🖥️' },
    { id: 'pc', label: 'PC', emoji: '🖲️' },
  ],

  // SITE SETTINGS
  settings: {
    id: 'general',
    companyName: 'PrimexStream Pro',
    phoneNumber: '+1 (555) 123-4567',
    whatsappNumber: '+1 (555) 123-4567',
    email: 'support@primexstream.pro',
    paymentInstructions: 'Send your payment screenshot to our support team via WhatsApp after paying.',
    homeTitle: 'Premium IPTV & Referral Earnings',
    homeDescription: 'Stream 10,000+ channels and earn money by referring friends',
  },
};

// ============ INITIALIZE FIREBASE ============

export async function seedFirebaseData() {
  try {
    console.log('🚀 Starting Firebase data initialization...');

    // Initialize Plans
    console.log('📋 Setting up Plans...');
    for (const plan of SEED_DATA.plans) {
      await setDoc(doc(db, 'plans', plan.id), plan);
      console.log(`  ✅ Plan: ${plan.name}`);
    }

    // Initialize Payment Methods
    console.log('💳 Setting up Payment Methods...');
    for (const method of SEED_DATA.paymentMethods) {
      await setDoc(doc(db, 'paymentMethods', method.id), method);
      console.log(`  ✅ Payment: ${method.name}`);
    }

    // Initialize Referral Tiers
    console.log('🎁 Setting up Referral Tiers...');
    for (const tier of SEED_DATA.referralTiers) {
      await setDoc(doc(db, 'referralTiers', tier.id), tier);
      console.log(`  ✅ Tier: ${tier.minReferrals} referrals`);
    }

    // Initialize FAQs
    console.log('❓ Setting up FAQs...');
    for (const faq of SEED_DATA.faqs) {
      await setDoc(doc(db, 'faqs', faq.id), faq);
    }
    console.log(`  ✅ ${SEED_DATA.faqs.length} FAQs created`);

    // Initialize Reviews
    console.log('⭐ Setting up Reviews...');
    for (const review of SEED_DATA.reviews) {
      await setDoc(doc(db, 'reviews', review.id), review);
    }
    console.log(`  ✅ ${SEED_DATA.reviews.length} Reviews created`);

    // Initialize Services
    console.log('🔧 Setting up Services...');
    for (const service of SEED_DATA.services) {
      await setDoc(doc(db, 'services', service.id), service);
    }
    console.log(`  ✅ ${SEED_DATA.services.length} Services created`);

    // Initialize Devices
    console.log('📱 Setting up Devices...');
    for (const device of SEED_DATA.devices) {
      await setDoc(doc(db, 'devices', device.id), device);
    }
    console.log(`  ✅ ${SEED_DATA.devices.length} Devices created`);

    // Initialize Site Settings
    console.log('⚙️ Setting up Site Settings...');
    await setDoc(doc(db, 'settings', 'general'), SEED_DATA.settings);
    console.log('  ✅ Site Settings created');

    console.log('\n✨ Firebase initialization complete!');
    return { success: true, message: 'All data initialized successfully' };
  } catch (error) {
    console.error('❌ Error seeding Firebase:', error);
    throw error;
  }
}

// ============ FETCH ALL DATA FOR DISPLAY ============

export async function getAllSeedData() {
  return SEED_DATA;
}

// ============ CHECK IF DATA EXISTS ============

export async function checkIfDataExists() {
  try {
    const plansSnap = await getDocs(query(collection(db, 'plans')));
    return plansSnap.size > 0;
  } catch (error) {
    console.error('Error checking data:', error);
    return false;
  }
}
