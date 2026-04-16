# PrimexStream Pro - Real Firebase Setup Guide

## 🔴 Current Status: Hybrid (Demo + Real)

### What's DEMO (Mock Data):
- Team success stories on home services page (hardcoded)
- Admin settings with fallback values
- Some sample data in referral system

### What's REAL (Connected to Firebase):
- ✅ User login/signup (if you set up Authentication)
- ✅ Order creation and tracking
- ✅ Payment records
- ✅ Referral tracking
- ✅ Database writes to Firebase Realtime Database

---

## 📋 Step 1: Create Firebase Project

### 1.1 Go to Firebase Console
- Visit: https://console.firebase.google.com
- Click "Add project" or select existing project
- Add a web app to your project

### 1.2 Get Your Firebase Credentials
After creating the web app, you'll get credentials like:
```json
{
  "apiKey": "ABC123xyz...",
  "authDomain": "your-project.firebaseapp.com",
  "projectId": "your-project-id",
  "storageBucket": "your-project.appspot.com",
  "messagingSenderId": "12345678",
  "appId": "1:12345:web:abc123"
}
```

---

## 🔑 Step 2: Set Up Environment Variables

### 2.1 Create `.env.local` file
Copy `.env.example` and rename to `.env.local`:

```bash
cp .env.example .env.local
```

### 2.2 Fill in Firebase credentials
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
```

**⚠️ Important:** Never commit `.env.local` to git - it's already in `.gitignore`

---

## 🗄️ Step 3: Set Up Firebase Realtime Database

### 3.1 Create Database
- Firebase Console → Realtime Database
- Click "Create Database"
- Start in **Test Mode** (for development)
- Region: Choose closest to your users

### 3.2 Database Security Rules (Test Mode - Not Safe for Production)
```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

### 3.3 Proper Security Rules (Production)
```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    },
    "orders": {
      "$orderId": {
        ".read": "root.child('orders').child($orderId).child('userId').val() === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin'",
        ".write": "root.child('orders').child($orderId).child('userId').val() === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin'"
      }
    },
    "admin_settings": {
      ".read": "root.child('users').child(auth.uid).child('role').val() === 'admin'",
      ".write": "root.child('users').child(auth.uid).child('role').val() === 'admin'"
    }
  }
}
```

---

## 🔐 Step 4: Enable Firebase Authentication

### 4.1 Enable Email/Password Auth
- Firebase Console → Authentication
- Click "Set up sign-in method"
- Enable "Email/Password"
- Optionally enable: Google, GitHub, Facebook

### 4.2 Test Users (Optional)
Create test users in Firebase Console for testing

---

## 💾 Step 5: Initialize Database with Sample Data

### 5.1 Using Firebase Console
Go to Realtime Database → Click "+" to add data:

```
firebase_root/
├── users/
│   └── user123/
│       ├── uid: "user123"
│       ├── displayName: "John User"
│       ├── email: "john@example.com"
│       ├── referralCode: "JOHN123"
│       └── role: "user"
├── orders/
│   └── order123/
│       ├── userId: "user123"
│       ├── plan: "1-month"
│       ├── amount: 25
│       ├── status: "pending"
│       └── createdAt: 1712710800000
├── admin_settings/
│   └── payment_methods/
│       ├── remitly": true
│       ├── binance": true
│       └── paypal": true
└── referrals/
    └── user123/
        ├── referralCode: "JOHN123"
        ├── referralLink: "https://app.com?ref=JOHN123"
        ├── referrals: 5
        └── totalEarnings: 125
```

### 5.2 Using Code (Optional)
Create `src/lib/seed-firebase.ts`:

```typescript
import { getDatabase, ref, set } from 'firebase/database';
import { db } from './firebase-config';

export async function seedDatabase() {
  const database = getDatabase(db);
  
  // Add admin settings
  await set(ref(database, 'admin_settings'), {
    payment_methods: {
      remitly: true,
      binance: true,
      paypal: true,
      cashapp: false,
    },
    plans: {
      '1-month': { name: '1 Month', price: 25, devices: 2 },
      '3-month': { name: '3 Months', price: 60, devices: 2 },
      '12-month': { name: '12 Months', price: 120, devices: 3 },
    },
  });
  
  console.log('✅ Database seeded!');
}
```

---

## 📊 Step 6: Database Structure

### Current Collections:

#### `users/`
```
users/{uid}
├── uid: string
├── email: string
├── displayName: string
├── photoURL: string (optional)
├── referralCode: string
├── createdAt: number (timestamp)
├── updatedAt: number
└── role: "user" | "admin"
```

#### `orders/`
```
orders/{orderId}
├── userId: string
├── userName: string
├── email: string
├── plan: string (e.g., "1-month", "iptv-1-year")
├── amount: number
├── paymentMethod: string (e.g., "remitly", "binance")
├── status: "pending" | "completed" | "failed"
├── transactionId: string (optional)
├── description: string
├── createdAt: number (timestamp)
├── updatedAt: number
├── proofFileUrl: string (optional, Supabase URL)
└── notes: string (admin notes)
```

#### `referrals/`
```
referrals/{userId}
├── referralCode: string
├── referralLink: string
├── referrals: array of {uid, joinDate, earnings}
├── totalEarnings: number
├── totalReferrals: number
├── commissionRate: number (%)
└── withdrawals: array of {amount, date, status}
```

#### `admin_settings/`
```
admin_settings/
├── payment_methods: {remitly, binance, paypal, cashapp}
├── plans: {1-month, 3-month, 12-month, ...}
├── referral_config: {commission_rate, max_commission}
├── support_email: string
├── whatsapp_number: string
└── terms_updated_at: number
```

---

## 🚀 Step 7: Update Service Functions

All functions are in `src/lib/firebase-service.ts`. Here's what's already implemented:

### ✅ Already Real:
- `createOrder()` - Creates order in Firebase
- `getUserOrders()` - Fetches user's orders
- `getPlans()` - Gets available plans
- `getReferralCode()` - Gets user's referral code
- `addReferral()` - Records new referral

### ✅ To Implement:
- `uploadPaymentProof()` - Upload to Supabase
- `getAdminSettings()` - With fallback data
- `getUserReferrals()` - Real referral data
- `processPayment()` - Payment verification

---

## 📧 Step 8: Verification Checklist

- [ ] Firebase project created
- [ ] `.env.local` file set up with real credentials
- [ ] Realtime Database created
- [ ] Authentication enabled
- [ ] Security Rules updated
- [ ] Test login works
- [ ] Create order test works
- [ ] Database shows real data

---

## 🧪 Testing Real Firebase

### Test 1: Login
1. Go to `/login`
2. Sign up with email/password
3. Should see "User logged in" in app provider

### Test 2: Create Order
1. Go to `/dashboard` → `/iptv`
2. Select plan → Go through checkout
3. Check Firebase Console → orders should show new entry

### Test 3: Check Database
1. Firebase Console → Realtime Database
2. Expand `orders/` - should see your test orders
3. Expand `users/` - should see your user profile

---

## 🔧 Troubleshooting

### "Permission denied" Error
**Fix:** Database rules deny read/write. Use Test Mode rules or update rules to allow your UID.

### "CORS error"
**Fix:** Firebase CORS is automatic. Check if NEXT_PUBLIC_* variables are set correctly.

### "Orders not saving"
**Fix:** Check:
1. User is logged in (useApp hook shows isLoggedIn: true)
2. Firebase initialized (check console)
3. User has proper permission in rules

### Test Mode Expired
**Fix:** Re-enable Test Mode in Firebase Console → Realtime Database → Rules

---

## 🛡️ Production Checklist

Before going live:

- [ ] Update security rules (no test mode)
- [ ] Enable Email Verification
- [ ] Set up Firebase Admin SDK for server
- [ ] Set up Cloud Functions for payment verification
- [ ] Enable HTTPS in production
- [ ] Set up Analytics
- [ ] Set up Error Monitoring (Sentry)
- [ ] Enable backups
- [ ] Set up proper email service

---

## 📚 Resources

- [Firebase Console](https://console.firebase.google.com)
- [Firebase Realtime Database Docs](https://firebase.google.com/docs/database)
- [Firebase Security Rules](https://firebase.google.com/docs/database/security)
- [Next.js Firebase Integration](https://firebase.google.com/docs/web/setup)

---

**Last Updated:** April 9, 2026
**Status:** Ready for Setup
