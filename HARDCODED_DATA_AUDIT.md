# Hardcoded Data Audit - PrimexStream Pro

## Summary
Found **60+ hardcoded data items** across 13 files that should be moved to a database or configuration service.

---

## 1. IPTV PLANS & PRICING

### File: [src/lib/init-firebase-data.ts](src/lib/init-firebase-data.ts)

#### Lines 4-35: PLANS Object
```typescript
const PLANS = {
  '1-month': {
    id: '1-month',
    name: 'IPTV 1-Month',
    duration: '1 Month',
    originalPrice: 25,
    salePrice: 20,
    discount: 5,
    description: 'Access for 1 month',
    extraDiscount: 6,
  },
  '6-month': {
    id: '6-month',
    name: 'IPTV 6-Month',
    duration: '6 Months',
    originalPrice: 75,
    salePrice: 65,
    discount: 10,
    description: 'Access for 6 months',
    extraDiscount: 19.5,
  },
  '12-month': {
    id: '12-month',
    name: 'IPTV 12-Month',
    duration: '12 Months',
    originalPrice: 120,
    salePrice: 95,
    discount: 25,
    description: 'Access for 12 months',
    extraDiscount: 28.5,
  },
};
```

---

## 2. REFERRAL TIERS & REWARDS

### File: [src/app/earn/page.tsx](src/app/earn/page.tsx)

#### Lines 18-40: DEFAULT_REFERRAL_TIERS Array
```typescript
const DEFAULT_REFERRAL_TIERS = [
  {
    id: '1',
    minReferrals: 2,
    reward: '1 Month IPTV',
    icon: '🎁',
    bonus: 5,
  },
  {
    id: '2',
    minReferrals: 5,
    reward: '6 Months IPTV',
    icon: '🌟',
    bonus: 7,
  },
  {
    id: '3',
    minReferrals: 10,
    reward: '12 Months IPTV',
    icon: '👑',
    bonus: 10,
  },
];
```

---

## 3. REVIEWS & TESTIMONIALS

### File: [src/app/dashboard/page.tsx](src/app/dashboard/page.tsx)

#### Lines 51-73: DEFAULT_REVIEWS Array (Dashboard)
```typescript
const DEFAULT_REVIEWS = [
  {
    id: '1',
    name: 'Ahmed Hassan',
    rating: 5,
    text: 'Excellent service! The IPTV streams are crystal clear and the referral program is amazing.',
    date: '2 weeks ago',
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    rating: 5,
    text: 'Best IPTV provider I\'ve used. Customer support is responsive and helpful.',
    date: '1 week ago',
  },
  {
    id: '3',
    name: 'Marco Silva',
    rating: 5,
    text: 'Very satisfied with the platform. Earning through referrals is easy and rewarding!',
    date: '3 days ago',
  },
];
```

### File: [src/app/support/page.tsx](src/app/support/page.tsx)

#### Lines 27-50: DEFAULT_REVIEWS Array (Support)
```typescript
const DEFAULT_REVIEWS = [
  {
    id: '1',
    name: 'Ahmed Hassan',
    rating: 5,
    text: 'Best IPTV service I\'ve used! Quick installation and amazing picture quality. Highly recommended!',
    date: '2 weeks ago',
  },
  {
    id: '2',
    name: 'Maria Rodriguez',
    rating: 5,
    text: 'Excellent customer support team. They helped me set up everything in minutes. Worth every penny!',
    date: '1 month ago',
  },
  {
    id: '3',
    name: 'John Smith',
    rating: 4,
    text: 'Great service with tons of channels. Occasional buffering but overall very satisfied.',
    date: '3 weeks ago',
  },
];
```

---

## 4. FAQs - FREQUENTLY ASKED QUESTIONS

### File: [src/app/dashboard/page.tsx](src/app/dashboard/page.tsx)

#### Lines 76-110: DEFAULT_FAQS Array (Dashboard)
```typescript
const DEFAULT_FAQS = [
  {
    id: '1',
    question: 'How do I start using PrimexStream Pro?',
    answer: 'Sign up with your email, choose a plan, and start streaming immediately. It takes less than 2 minutes!',
  },
  {
    id: '2',
    question: 'Can I cancel my plan anytime?',
    answer: 'Yes! You can cancel your subscription anytime without any penalties or hidden fees.',
  },
  {
    id: '3',
    question: 'What devices are supported?',
    answer: 'Our service works on Smart TVs, Android devices, iOS, Windows, Mac, and web browsers.',
  },
  {
    id: '4',
    question: 'How does the referral program work?',
    answer: 'Share your unique code with friends. When they sign up and make a purchase, you earn a commission.',
  },
  {
    id: '5',
    question: 'Is there a free trial available?',
    answer: 'Yes! New users get a 7-day free trial to explore all our premium features.',
  },
  {
    id: '6',
    question: 'How do I withdraw my earnings?',
    answer: 'Go to your Wallet section and click Redeem. We support multiple withdrawal methods.',
  },
];
```

### File: [src/app/support/page.tsx](src/app/support/page.tsx)

#### Lines 52-86: DEFAULT_FAQS Array (Support)
```typescript
const DEFAULT_FAQS = [
  {
    id: '1',
    question: 'Is my payment information secure?',
    answer: 'Yes! We use bank-level encryption (SSL/TLS) to protect your payments. All transactions are secured with industry-standard security protocols. Your credit card data is never stored on our servers.',
  },
  {
    id: '2',
    question: 'What payment methods do you accept?',
    answer: 'We accept Remitly, Binance, PayPal, and CashApp. All payments are processed securely with fraud protection. We offer discounts for Remitly and Binance payments.',
  },
  {
    id: '3',
    question: 'Can I get a refund if I\'m not satisfied?',
    answer: 'Absolutely! We offer a 48-hour money-back guarantee on all plans. If you\'re not completely satisfied, contact our support team for a full refund, no questions asked.',
  },
  {
    id: '4',
    question: 'How many devices can I use simultaneously?',
    answer: 'Your subscription plan determines simultaneous streams: 1-Month (2 devices), 6-Month (3 devices), 12-Month (4 devices). Upgrade your plan to add more device access.',
  },
  {
    id: '5',
    question: 'What if I experience issues with my service?',
    answer: 'Our 24/7 support team is ready to help! Contact us via WhatsApp, Email, or Phone. We typically respond within 1 hour. We\'ll troubleshoot and resolve issues immediately.',
  },
  {
    id: '6',
    question: 'Are your services legal and reliable?',
    answer: 'Yes! PrimexStream Pro is a licensed reseller operating in full compliance. We maintain 99.9% uptime with redundant servers. Your service is backed by our reliability guarantee.',
  },
];
```

---

## 5. PAYMENT METHODS

### File: [src/app/iptv/page.tsx](src/app/iptv/page.tsx)

#### Lines 22-25: Payment Methods Array
```typescript
const paymentMethods = [
  { id: 'remitly', name: 'Remitly', icon: '🔵' },
  { id: 'binance', name: 'Binance', icon: '🟡' },
  { id: 'paypal', name: 'PayPal', icon: '💙' },
  { id: 'cashapp', name: 'Cash App', icon: '💚' },
];
```

### File: [src/app/payment/page.tsx](src/app/payment/page.tsx)

#### Lines 15-32: DEFAULT_PAYMENT_DETAILS Object
```typescript
const DEFAULT_PAYMENT_DETAILS: Record<PaymentMethod, { instructions: string; accountInfo: { name: string; value: string }[] }> = {
  remitly: {
    instructions: 'Contact support to set up payment details',
    accountInfo: [{ name: 'Status', value: 'Loading...' }],
  },
  binance: {
    instructions: 'Contact support to set up payment details',
    accountInfo: [{ name: 'Status', value: 'Loading...' }],
  },
  paypal: {
    instructions: 'Contact support to set up payment details',
    accountInfo: [{ name: 'Status', value: 'Loading...' }],
  },
  cashapp: {
    instructions: 'Contact support to set up payment details',
    accountInfo: [{ name: 'Status', value: 'Loading...' }],
  },
};
```

#### Lines 65-68: Payment Methods Repeated
```typescript
const paymentMethods = [
  { id: 'remitly', name: 'Remitly', icon: '🔵' },
  { id: 'binance', name: 'Binance', icon: '🟡' },
  { id: 'paypal', name: 'PayPal', icon: '💙' },
  { id: 'cashapp', name: 'Cash App', icon: '💚' },
];
```

### File: [src/app/new-payment/page.tsx](src/app/new-payment/page.tsx)

#### Lines 37-40: Payment Methods Array (Duplicate)
```typescript
const paymentMethods = [
  { id: 'remitly', name: 'Remitly', icon: '🔵' },
  { id: 'binance', name: 'Binance', icon: '🟡' },
  { id: 'paypal', name: 'PayPal', icon: '💙' },
  { id: 'cashapp', name: 'Cash App', icon: '💚' },
];
```

---

## 6. IPTV DEVICES

### File: [src/app/iptv/page.tsx](src/app/iptv/page.tsx)

#### Lines 5-18: Devices Array
```typescript
const devices: { id: Device; label: string; emoji: string }[] = [
  { id: 'smart-tv', label: 'Smart TV', emoji: '📺' },
  { id: 'firestick', label: 'Firestick', emoji: '🔥' },
  { id: 'android-box', label: 'Android Box', emoji: '📦' },
  { id: 'mobile', label: 'Mobile', emoji: '📱' },
  { id: 'laptop', label: 'Laptop', emoji: '💻' },
  { id: 'tablet', label: 'Tablet', emoji: '⌚' },
  { id: 'mag-box', label: 'MAG Box', emoji: '🖥️' },
  { id: 'pc', label: 'PC', emoji: '🖲️' },
];
```

---

## 7. HOME REPAIR SERVICES

### File: [src/app/home-repair/page.tsx](src/app/home-repair/page.tsx)

#### Lines 31-57: DEFAULT_SERVICES Array
```typescript
const DEFAULT_SERVICES: Service[] = [
  {
    id: 'locksmith',
    name: 'Locksmith',
    description: 'Lock repairs, key making, emergency lockout',
    emoji: '🔐',
    type: 'service',
  },
  {
    id: 'tree-trimming',
    name: 'Tree Trimming',
    description: 'Tree pruning, cutting, removal services',
    emoji: '🌳',
    type: 'service',
  },
  {
    id: 'roofing',
    name: 'Roofing',
    description: 'Roof repair, installation, maintenance',
    emoji: '🏠',
    type: 'service',
  },
  {
    id: 'plumbing',
    name: 'Plumbing',
    description: 'Leak fixes, pipe repairs, installations',
    emoji: '💧',
    type: 'service',
  },
  {
    id: 'electrician',
    name: 'Electrician',
    description: 'Wiring, outlets, electrical repairs',
    emoji: '⚡',
    type: 'service',
  },
  {
    id: 'custom',
    name: 'Custom Service',
    description: 'Request any service you need',
    emoji: '✨',
    type: 'custom',
  },
];
```

#### Lines 59-65: TEAM_STORIES Array
```typescript
const TEAM_STORIES = [
  { name: 'Mike Johnson', title: 'Master Locksmith', image: '👨‍🔧', years: '12 years', rating: 4.9 },
  { name: 'Sarah Davis', title: 'Tree Specialist', image: '👩‍🌾', years: '8 years', rating: 4.8 },
  { name: 'Tom Wilson', title: 'Roofing Expert', image: '👨‍🔨', years: '15 years', rating: 4.95 },
  { name: 'Lisa Brown', title: 'Plumber', image: '👨‍🔧', years: '10 years', rating: 4.85 },
  { name: 'John Smith', title: 'Electrician', image: '⚡', years: '14 years', rating: 4.9 },
];
```

#### Lines 67-68: PHONE_NUMBER Constant
```typescript
const PHONE_NUMBER = '+1 (555) 123-4567';
```

#### Lines 70-71: City Lists
```typescript
const usaCities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'];
const ukCities = ['London', 'Manchester', 'Birmingham', 'Leeds', 'Glasgow', 'Sheffield', 'Bristol', 'Edinburgh', 'Liverpool', 'Newcastle'];
```

---

## 8. DASHBOARD SERVICES

### File: [src/app/dashboard/page.tsx](src/app/dashboard/page.tsx)

#### Lines 43-46: Services Array
```typescript
const services = [
  { icon: Tv, label: 'IPTV Services', href: '/iptv', color: 'from-blue-500 to-blue-600' },
  { icon: Wrench, label: 'Home Repair', href: '/home-repair', color: 'from-orange-500 to-orange-600' },
  { icon: TrendingUp, label: 'Earn Program', href: '/earn', color: 'from-purple-500 to-purple-600' },
  { icon: Package, label: 'Custom Products', href: '#', color: 'from-pink-500 to-pink-600' },
];
```

---

## 9. CONTACT INFORMATION

### File: [src/components/whatsapp-button.tsx](src/components/whatsapp-button.tsx)

#### Line 18: WhatsApp Contact Number
```typescript
href="https://wa.me/1234567890"
```

### File: [src/lib/firebase-service.ts](src/lib/firebase-service.ts)

#### Lines 416-417: Support Contact Information
```typescript
supportEmail: 'support@primexstream.com',
supportPhone: '+1234567890',
```

---

## 10. FIREBASE CONFIGURATION

### File: [src/lib/firebase-config.ts](src/lib/firebase-config.ts)

#### Lines 6-14: Firebase Config Object
```typescript
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};
```

---

## 11. REFERRAL CODE DEFAULTS

### File: [src/app/earn/page.tsx](src/app/earn/page.tsx)

#### Line 65: Default Demo Referral Code
```typescript
const referralCode = user?.referralCode || 'DEMO123';
```

#### Line 66: Referral Link
```typescript
const referralLink = `https://primexstream.pro?ref=${referralCode}`;
```

---

## 12. ADMIN PAYMENT SETTINGS DEFAULTS

### File: [src/app/admin/page.tsx](src/app/admin/page.tsx)

#### Line 669: Default Payment Method Name
```typescript
defaultValue={adminSettings?.payment?.methodName || 'Binance'}
```

---

## 13. CONFIG DATA INTERFACE

### File: [src/lib/firebase-service.ts](src/lib/firebase-service.ts)

#### Lines 333-432: ConfigData Interface (Documents structure for site configuration)
```typescript
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
    plan1Month: { name: string; duration: number; price: number; salePrice: number; features: string };
    plan6Month: { name: string; duration: number; price: number; salePrice: number; features: string };
    plan12Month: { name: string; duration: number; price: number; salePrice: number; features: string };
    extraDiscount: number;
  };
  // Referral Settings
  referral: {
    isActive: boolean;
    commissionRate: number;
    minReferrals: number;
    bonusAmount: number;
    payoutThreshold: number;
  };
  // Payment Methods Settings
  paymentMethods: {
    binance: { isActive: boolean; extraDiscount: number };
    remitly: { isActive: boolean; extraDiscount: number };
    bankTransfer: { isActive: boolean; extraDiscount: number };
    crypto: { isActive: boolean; extraDiscount: number };
  };
}
```

---

## DATA MIGRATION RECOMMENDATIONS

### Priority 1 - Critical (Business Logic)
- [ ] Plans & Pricing → Firestore `plans` collection
- [ ] Referral Tiers → Firestore `referralTiers` collection
- [ ] Payment Methods → Firestore `paymentMethods` collection

### Priority 2 - Important (Content)
- [ ] Reviews/Testimonials → Firestore `reviews` collection
- [ ] FAQs → Firestore `faqs` collection
- [ ] Home Repair Services → Firestore `services` collection
- [ ] Team Stories → Firestore `team` collection

### Priority 3 - Configuration
- [ ] Contact Information → Firestore `config` document
- [ ] Firebase Config → Move to .env.local (already partially done)
- [ ] Device List → Firestore `devices` collection
- [ ] City Lists → Firestore `locations` collection

### Priority 4 - Deduplication
- [ ] Merge duplicate payment methods arrays (appears in 3 files)
- [ ] Merge duplicate reviews (2 different sets)
- [ ] Merge duplicate FAQs (2 different sets)
- [ ] Create single shared service layer

---

## FILES AFFECTED
1. [src/lib/init-firebase-data.ts](src/lib/init-firebase-data.ts) - Plans
2. [src/app/earn/page.tsx](src/app/earn/page.tsx) - Referral tiers, referral code
3. [src/app/dashboard/page.tsx](src/app/dashboard/page.tsx) - Reviews, FAQs, services
4. [src/app/support/page.tsx](src/app/support/page.tsx) - Reviews, FAQs
5. [src/app/iptv/page.tsx](src/app/iptv/page.tsx) - Devices, payment methods, plans
6. [src/app/payment/page.tsx](src/app/payment/page.tsx) - Payment methods, payment details
7. [src/app/new-payment/page.tsx](src/app/new-payment/page.tsx) - Payment methods
8. [src/app/home-repair/page.tsx](src/app/home-repair/page.tsx) - Services, team stories, cities, phone
9. [src/app/admin/page.tsx](src/app/admin/page.tsx) - Admin settings
10. [src/components/whatsapp-button.tsx](src/components/whatsapp-button.tsx) - Contact number
11. [src/lib/firebase-service.ts](src/lib/firebase-service.ts) - Support info, config interface
12. [src/lib/firebase-config.ts](src/lib/firebase-config.ts) - Firebase config

---

## TOTAL COUNT
- **13 Files** with hardcoded data
- **60+ Data Items** requiring migration
- **3 Duplicate Data Sets** (payment methods, reviews, FAQs)
- **Multiple Config Values** scattered across codebase
