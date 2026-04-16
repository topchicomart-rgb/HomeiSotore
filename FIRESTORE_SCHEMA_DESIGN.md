# Firestore Schema Design for Hardcoded Data Migration

## Overview
This document defines the Firestore collections and documents needed to replace all hardcoded data in the codebase.

---

## Collections to Create

### 1. `plans` Collection

**Purpose**: Store IPTV subscription plans

**Document Structure**:
```
plans/
├── 1-month
│   ├── id: "1-month"
│   ├── name: "IPTV 1-Month"
│   ├── duration: "1 Month"
│   ├── durationDays: 30
│   ├── originalPrice: 25
│   ├── salePrice: 20
│   ├── discount: 5
│   ├── description: "Access for 1 month"
│   ├── extraDiscount: 6
│   ├── isActive: true
│   ├── devices: 2
│   ├── features: ["HD Streaming", "Multiple Devices", "24/7 Support"]
│   └── createdAt: timestamp
├── 6-month
│   ├── id: "6-month"
│   ├── name: "IPTV 6-Month"
│   ├── duration: "6 Months"
│   ├── durationDays: 180
│   ├── originalPrice: 75
│   ├── salePrice: 65
│   ├── discount: 10
│   ├── description: "Access for 6 months"
│   ├── extraDiscount: 19.5
│   ├── isActive: true
│   ├── devices: 3
│   ├── features: ["HD Streaming", "Multiple Devices", "24/7 Support", "Free Upgrade"]
│   └── createdAt: timestamp
└── 12-month
    ├── id: "12-month"
    ├── name: "IPTV 12-Month"
    ├── duration: "12 Months"
    ├── durationDays: 365
    ├── originalPrice: 120
    ├── salePrice: 95
    ├── discount: 25
    ├── description: "Access for 12 months"
    ├── extraDiscount: 28.5
    ├── isActive: true
    ├── devices: 4
    ├── features: ["4K Streaming", "Multiple Devices", "24/7 Support", "Free Upgrades", "Priority Support"]
    └── createdAt: timestamp
```

**Query Examples**:
```typescript
// Get all active plans
const q = query(collection(db, 'plans'), where('isActive', '==', true));

// Get plan by ID
const docRef = doc(db, 'plans', '1-month');
```

---

### 2. `paymentMethods` Collection

**Purpose**: Store payment gateway configurations

**Document Structure**:
```
paymentMethods/
├── remitly
│   ├── id: "remitly"
│   ├── name: "Remitly"
│   ├── icon: "🔵"
│   ├── isActive: true
│   ├── extraDiscount: 6
│   ├── order: 1
│   ├── instructions: "Send money via Remitly to..."
│   ├── accountInfo: {
│   │   name: "Account Holder Name",
│   │   email: "payment@example.com",
│   │   phoneNumber: "+1234567890"
│   │ }
│   └── createdAt: timestamp
├── binance
│   ├── id: "binance"
│   ├── name: "Binance"
│   ├── icon: "🟡"
│   ├── isActive: true
│   ├── extraDiscount: 6
│   ├── order: 2
│   ├── instructions: "Send cryptocurrency to..."
│   ├── accountInfo: {
│   │   walletAddress: "0x...",
│   │   network: "BNB Smart Chain"
│   │ }
│   └── createdAt: timestamp
├── paypal
│   ├── id: "paypal"
│   ├── name: "PayPal"
│   ├── icon: "💙"
│   ├── isActive: true
│   ├── extraDiscount: 0
│   ├── order: 3
│   ├── instructions: "Send payment to..."
│   ├── accountInfo: {
│   │   email: "paypal@example.com"
│   │ }
│   └── createdAt: timestamp
└── cashapp
    ├── id: "cashapp"
    ├── name: "Cash App"
    ├── icon: "💚"
    ├── isActive: true
    ├── extraDiscount: 0
    ├── order: 4
    ├── instructions: "Use $cashtag..."
    ├── accountInfo: {
    │   cashtag: "$primexstream"
    │ }
    └── createdAt: timestamp
```

**Query Examples**:
```typescript
// Get all active payment methods
const q = query(
  collection(db, 'paymentMethods'),
  where('isActive', '==', true),
  orderBy('order', 'asc')
);

// Get specific payment method
const docRef = doc(db, 'paymentMethods', 'remitly');
```

---

### 3. `referralTiers` Collection

**Purpose**: Store referral tier rewards and bonuses

**Document Structure**:
```
referralTiers/
├── tier1
│   ├── id: "tier1"
│   ├── name: "Silver"
│   ├── minReferrals: 2
│   ├── reward: "1 Month IPTV"
│   ├── icon: "🎁"
│   ├── bonus: 5
│   ├── order: 1
│   ├── description: "Get 1 free month after 2 referrals"
│   └── createdAt: timestamp
├── tier2
│   ├── id: "tier2"
│   ├── name: "Gold"
│   ├── minReferrals: 5
│   ├── reward: "6 Months IPTV"
│   ├── icon: "🌟"
│   ├── bonus: 7
│   ├── order: 2
│   ├── description: "Get 6 free months after 5 referrals"
│   └── createdAt: timestamp
└── tier3
    ├── id: "tier3"
    ├── name: "Platinum"
    ├── minReferrals: 10
    ├── reward: "12 Months IPTV"
    ├── icon: "👑"
    ├── bonus: 10
    ├── order: 3
    ├── description: "Get 12 free months after 10 referrals"
    └── createdAt: timestamp
```

**Query Examples**:
```typescript
// Get all referral tiers ordered
const q = query(
  collection(db, 'referralTiers'),
  orderBy('order', 'asc')
);
```

---

### 4. `reviews` Collection

**Purpose**: Store customer reviews and testimonials

**Document Structure**:
```
reviews/
├── review1
│   ├── id: "review1"
│   ├── name: "Ahmed Hassan"
│   ├── rating: 5
│   ├── text: "Excellent service! The IPTV streams are crystal clear..."
│   ├── date: "2 weeks ago"
│   ├── platform: "dashboard"
│   ├── verified: true
│   └── createdAt: timestamp
├── review2
│   ├── id: "review2"
│   ├── name: "Sarah Johnson"
│   ├── rating: 5
│   ├── text: "Best IPTV provider I've used..."
│   ├── date: "1 week ago"
│   ├── platform: "dashboard"
│   ├── verified: true
│   └── createdAt: timestamp
├── review3
│   ├── id: "review3"
│   ├── name: "Marco Silva"
│   ├── rating: 5
│   ├── text: "Very satisfied with the platform..."
│   ├── date: "3 days ago"
│   ├── platform: "dashboard"
│   ├── verified: true
│   └── createdAt: timestamp
├── review4
│   ├── id: "review4"
│   ├── name: "Maria Rodriguez"
│   ├── rating: 5
│   ├── text: "Excellent customer support team..."
│   ├── date: "1 month ago"
│   ├── platform: "support"
│   ├── verified: true
│   └── createdAt: timestamp
└── review5
    ├── id: "review5"
    ├── name: "John Smith"
    ├── rating: 4
    ├── text: "Great service with tons of channels..."
    ├── date: "3 weeks ago"
    ├── platform: "support"
    ├── verified: true
    └── createdAt: timestamp
```

**Query Examples**:
```typescript
// Get all verified reviews
const q = query(
  collection(db, 'reviews'),
  where('verified', '==', true)
);

// Get reviews for specific platform
const q = query(
  collection(db, 'reviews'),
  where('platform', '==', 'dashboard')
);
```

---

### 5. `faqs` Collection

**Purpose**: Store FAQ content

**Document Structure**:
```
faqs/
├── faq1
│   ├── id: "faq1"
│   ├── question: "How do I start using PrimexStream Pro?"
│   ├── answer: "Sign up with your email, choose a plan, and start streaming..."
│   ├── category: "getting-started"
│   ├── platform: ["dashboard", "support"]
│   ├── order: 1
│   └── createdAt: timestamp
├── faq2
│   ├── id: "faq2"
│   ├── question: "Can I cancel my plan anytime?"
│   ├── answer: "Yes! You can cancel your subscription anytime..."
│   ├── category: "billing"
│   ├── platform: ["dashboard", "support"]
│   ├── order: 2
│   └── createdAt: timestamp
├── faq3
│   ├── id: "faq3"
│   ├── question: "What devices are supported?"
│   ├── answer: "Our service works on Smart TVs, Android devices..."
│   ├── category: "devices"
│   ├── platform: ["dashboard", "support"]
│   ├── order: 3
│   └── createdAt: timestamp
├── faq4
│   ├── id: "faq4"
│   ├── question: "How does the referral program work?"
│   ├── answer: "Share your unique code with friends..."
│   ├── category: "referral"
│   ├── platform: ["dashboard"]
│   ├── order: 4
│   └── createdAt: timestamp
├── faq5
│   ├── id: "faq5"
│   ├── question: "Is there a free trial available?"
│   ├── answer: "Yes! New users get a 7-day free trial..."
│   ├── category: "trial"
│   ├── platform: ["dashboard"]
│   ├── order: 5
│   └── createdAt: timestamp
├── faq6
│   ├── id: "faq6"
│   ├── question: "How do I withdraw my earnings?"
│   ├── answer: "Go to your Wallet section and click Redeem..."
│   ├── category: "withdrawal"
│   ├── platform: ["dashboard"]
│   ├── order: 6
│   └── createdAt: timestamp
├── faq7
│   ├── id: "faq7"
│   ├── question: "Is my payment information secure?"
│   ├── answer: "Yes! We use bank-level encryption..."
│   ├── category: "security"
│   ├── platform: ["support"]
│   ├── order: 7
│   └── createdAt: timestamp
└── faq8
    ├── id: "faq8"
    ├── question: "Are your services legal and reliable?"
    ├── answer: "Yes! PrimexStream Pro is a licensed reseller..."
    ├── category: "legal"
    ├── platform: ["support"]
    ├── order: 8
    └── createdAt: timestamp
```

**Query Examples**:
```typescript
// Get FAQs for specific platform
const q = query(
  collection(db, 'faqs'),
  where('platform', 'array-contains', 'dashboard'),
  orderBy('order', 'asc')
);

// Get FAQs by category
const q = query(
  collection(db, 'faqs'),
  where('category', '==', 'billing')
);
```

---

### 6. `services` Collection

**Purpose**: Store home repair services

**Document Structure**:
```
services/
├── locksmith
│   ├── id: "locksmith"
│   ├── name: "Locksmith"
│   ├── description: "Lock repairs, key making, emergency lockout"
│   ├── emoji: "🔐"
│   ├── icon: "lock"
│   ├── type: "service"
│   ├── price: null
│   ├── order: 1
│   └── createdAt: timestamp
├── tree-trimming
│   ├── id: "tree-trimming"
│   ├── name: "Tree Trimming"
│   ├── description: "Tree pruning, cutting, removal services"
│   ├── emoji: "🌳"
│   ├── icon: "tree"
│   ├── type: "service"
│   ├── price: null
│   ├── order: 2
│   └── createdAt: timestamp
├── roofing
│   ├── id: "roofing"
│   ├── name: "Roofing"
│   ├── description: "Roof repair, installation, maintenance"
│   ├── emoji: "🏠"
│   ├── icon: "home"
│   ├── type: "service"
│   ├── price: null
│   ├── order: 3
│   └── createdAt: timestamp
├── plumbing
│   ├── id: "plumbing"
│   ├── name: "Plumbing"
│   ├── description: "Leak fixes, pipe repairs, installations"
│   ├── emoji: "💧"
│   ├── icon: "droplet"
│   ├── type: "service"
│   ├── price: null
│   ├── order: 4
│   └── createdAt: timestamp
├── electrician
│   ├── id: "electrician"
│   ├── name: "Electrician"
│   ├── description: "Wiring, outlets, electrical repairs"
│   ├── emoji: "⚡"
│   ├── icon: "zap"
│   ├── type: "service"
│   ├── price: null
│   ├── order: 5
│   └── createdAt: timestamp
└── custom
    ├── id: "custom"
    ├── name: "Custom Service"
    ├── description: "Request any service you need"
    ├── emoji: "✨"
    ├── icon: "sparkles"
    ├── type: "custom"
    ├── price: null
    ├── order: 6
    └── createdAt: timestamp
```

---

### 7. `team` Collection

**Purpose**: Store team member profiles

**Document Structure**:
```
team/
├── specialist1
│   ├── id: "specialist1"
│   ├── name: "Mike Johnson"
│   ├── title: "Master Locksmith"
│   ├── image: "👨‍🔧"
│   ├── years: "12 years"
│   ├── rating: 4.9
│   ├── service: "locksmith"
│   ├── bio: "Expert locksmith with 12+ years experience"
│   └── createdAt: timestamp
├── specialist2
│   ├── id: "specialist2"
│   ├── name: "Sarah Davis"
│   ├── title: "Tree Specialist"
│   ├── image: "👩‍🌾"
│   ├── years: "8 years"
│   ├── rating: 4.8
│   ├── service: "tree-trimming"
│   └── createdAt: timestamp
├── specialist3
│   ├── id: "specialist3"
│   ├── name: "Tom Wilson"
│   ├── title: "Roofing Expert"
│   ├── image: "👨‍🔨"
│   ├── years: "15 years"
│   ├── rating: 4.95
│   ├── service: "roofing"
│   └── createdAt: timestamp
├── specialist4
│   ├── id: "specialist4"
│   ├── name: "Lisa Brown"
│   ├── title: "Plumber"
│   ├── image: "👨‍🔧"
│   ├── years: "10 years"
│   ├── rating: 4.85
│   ├── service: "plumbing"
│   └── createdAt: timestamp
└── specialist5
    ├── id: "specialist5"
    ├── name: "John Smith"
    ├── title: "Electrician"
    ├── image: "⚡"
    ├── years: "14 years"
    ├── rating: 4.9
    ├── service: "electrician"
    └── createdAt: timestamp
```

---

### 8. `devices` Collection

**Purpose**: Store supported devices

**Document Structure**:
```
devices/
├── smarttv
│   ├── id: "smart-tv"
│   ├── label: "Smart TV"
│   ├── emoji: "📺"
│   ├── description: "Works on most modern smart TVs"
│   ├── order: 1
│   └── createdAt: timestamp
├── firestick
│   ├── id: "firestick"
│   ├── label: "Firestick"
│   ├── emoji: "🔥"
│   ├── description: "Amazon Fire TV Stick"
│   ├── order: 2
│   └── createdAt: timestamp
├── androidbox
│   ├── id: "android-box"
│   ├── label: "Android Box"
│   ├── emoji: "📦"
│   ├── description: "Android TV boxes"
│   ├── order: 3
│   └── createdAt: timestamp
└── ... (other devices)
```

---

### 9. `locations` Collection

**Purpose**: Store countries and cities

**Document Structure**:
```
locations/
├── usa
│   ├── id: "usa"
│   ├── country: "United States"
│   ├── code: "US"
│   ├── cities: ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose"]
│   └── createdAt: timestamp
└── uk
    ├── id: "uk"
    ├── country: "United Kingdom"
    ├── code: "GB"
    ├── cities: ["London", "Manchester", "Birmingham", "Leeds", "Glasgow", "Sheffield", "Bristol", "Edinburgh", "Liverpool", "Newcastle"]
    └── createdAt: timestamp
```

---

## Single Documents (Not Collections)

### `config` Document

**Purpose**: Store site-wide configuration

**Location**: `settings/config`

**Document Structure**:
```
settings/
└── config
    ├── site: {
    │   siteName: "PrimexStream Pro",
    │   maintenanceMode: false,
    │   maintenanceMessage: "",
    │   supportEmail: "support@primexstream.com",
    │   supportPhone: "+1234567890",
    │   whatsappNumber: "1234567890",
    │   currency: "USD",
    │   referralLink: "https://primexstream.pro?ref="
    │ }
    ├── orders: {
    │   minAmount: 10,
    │   maxAmount: 500,
    │   orderTimeout: 24,
    │   deliveryTime: 1
    │ }
    ├── referral: {
    │   isActive: true,
    │   commissionRate: 5,
    │   minReferrals: 1,
    │   bonusAmount: 0,
    │   payoutThreshold: 50
    │ }
    ├── payment: {
    │   defaultMethod: "remitly",
    │   acceptedMethods: ["remitly", "binance", "paypal", "cashapp"]
    │ }
    └── updatedAt: timestamp
```

**Query Example**:
```typescript
const docRef = doc(db, 'settings', 'config');
const docSnap = await getDoc(docRef);
if (docSnap.exists()) {
  return docSnap.data();
}
```

---

## Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public read-only collections
    match /plans/{document=**} {
      allow read: if true;
      allow write: if request.auth.token.admin == true;
    }
    match /paymentMethods/{document=**} {
      allow read: if true;
      allow write: if request.auth.token.admin == true;
    }
    match /referralTiers/{document=**} {
      allow read: if true;
      allow write: if request.auth.token.admin == true;
    }
    match /reviews/{document=**} {
      allow read: if true;
      allow write: if request.auth.token.admin == true;
    }
    match /faqs/{document=**} {
      allow read: if true;
      allow write: if request.auth.token.admin == true;
    }
    match /services/{document=**} {
      allow read: if true;
      allow write: if request.auth.token.admin == true;
    }
    match /team/{document=**} {
      allow read: if true;
      allow write: if request.auth.token.admin == true;
    }
    match /devices/{document=**} {
      allow read: if true;
      allow write: if request.auth.token.admin == true;
    }
    match /locations/{document=**} {
      allow read: if true;
      allow write: if request.auth.token.admin == true;
    }
    match /settings/{document=**} {
      allow read: if true;
      allow write: if request.auth.token.admin == true;
    }
  }
}
```

---

## Migration Script Template

```typescript
// scripts/migrateToFirestore.ts
import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase-config';
import { PLANS } from '@/lib/init-firebase-data';

export async function migratePlans() {
  const plansCollection = collection(db, 'plans');
  
  for (const [key, plan] of Object.entries(PLANS)) {
    await setDoc(doc(plansCollection, key), {
      ...plan,
      createdAt: new Date(),
    });
  }
  
  console.log('✅ Plans migrated to Firestore');
}

export async function migratePaymentMethods() {
  // Similar pattern for other collections
}

// Run migration
// import { migratePlans, migratePaymentMethods } from './scripts/migrateToFirestore';
// await migratePlans();
// await migratePaymentMethods();
```

---

## Next Steps

1. ✅ Review this schema with the team
2. ✅ Get approval from stakeholders
3. ✅ Create Firestore collections manually or via script
4. ✅ Populate initial data
5. ✅ Create data service layer (`src/lib/dataService.ts`)
6. ✅ Update components to fetch from Firestore
7. ✅ Build admin CMS for content management
8. ✅ Test data fetching and caching
9. ✅ Remove hardcoded defaults
10. ✅ Deploy to production
