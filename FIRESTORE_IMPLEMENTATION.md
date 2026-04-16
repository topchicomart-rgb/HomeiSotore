# Cloud Firestore Implementation Guide - PrimexStream Pro

## Overview

Your project is now set up to use **Cloud Firestore** instead of Realtime Database. This guide covers setup, structure, and usage.

---

## Step 1: Set Up Firestore in Firebase Console

### 1.1 Enable Cloud Firestore

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your **primexstream-pro** project
3. Click **Firestore Database** from the left menu
4. Click **Create Database**
5. Choose **Start in production mode**
6. Select region: **us-central1** (or closest to you)
7. Click **Create**

### 1.2 Update Security Rules ⚠️ CRITICAL

Once Firestore is created, go to **Rules** tab and paste the rules below. These rules:
- Allow authenticated users to read/write their own data
- Allow reading public collections (plans, settings)
- Allow admins to update orders
- Prevent unauthorized access

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // ===== UTILITY FUNCTIONS =====
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      // Check custom claim or use email pattern
      return request.auth != null && 
             (request.auth.token.admin == true || 
              request.auth.token.email == 'zainashraf0326@gmail.com');
    }
    
    // ===== USERS COLLECTION =====
    match /users/{userId} {
      // Users can read their own data OR any admin can read all users
      allow read: if request.auth.uid == userId || isAdmin();
      
      // Users can write their own data
      allow write: if request.auth.uid == userId || isAdmin();
    }
    
    // ===== PLANS COLLECTION (PUBLIC READ) =====
    match /plans/{document=**} {
      // Everyone can read plans
      allow read: if true;
      
      // Only admins can write/update plans
      allow write: if isAdmin();
    }
    
    // ===== ORDERS COLLECTION =====
    match /orders/{orderId} {
      // Authenticated users can read orders (their own or all if admin)
      allow read: if isAuthenticated();
      
      // Users can create orders (must be their own)
      allow create: if isAuthenticated() && 
                       request.resource.data.userId == request.auth.uid;
      
      // Users can update their pending orders; admins can update all
      allow update: if isAuthenticated() && 
                      (isAdmin() || 
                       request.auth.uid == resource.data.userId);
      
      // Only admins can delete orders
      allow delete: if isAdmin();
    }
    
    // ===== REFERRALS COLLECTION =====
    match /referrals/{document=**} {
      // Authenticated users can read referrals
      allow read: if isAuthenticated();
      
      // Authenticated users can create referrals
      allow write: if isAuthenticated();
    }
    
    // ===== ADMIN SETTINGS (PUBLIC READ, ADMIN WRITE) =====
    match /admin_settings/{document=**} {
      // Everyone can read settings
      allow read: if true;
      
      // Only admins can write settings
      allow write: if isAdmin();
    }
  }
}
```

### 1.2.1 How to Enable Custom Admin Claims (Optional but Recommended)

To make admin detection more secure, set custom claims via Firebase Admin SDK or CLI:

```bash
firebase auth:import claims.json --hash-algo=bcrypt
```

Or in your backend:
```javascript
admin.auth().setCustomUserClaims(uid, { admin: true });
```

Then the rule `request.auth.token.admin == true` will work.

---

### 1.2.2 Click "Publish" to Apply Rules

1. Paste the rules above into the **Rules** tab
2. Click **Publish** to save and activate

⚠️ **Important:** Wait for the rules to be published (usually 1-2 minutes) before testing the app!

---

## Step 2: Create Collections & Documents

### 2.1 Create Users Collection

1. Click **Create collection** in Firestore
2. Name it: `users`
3. Click **Auto-generate ID** (will be created automatically by app)
4. For now, skip adding documents (they'll be created when users sign up)

### 2.2 Create Plans Collection

1. Click **Create collection**
2. Name it: `plans`
3. Click **Auto-generate ID**
4. Add these 3 documents manually:

**Document 1:**
- Document ID: `plan1-month`
- Add fields:
  ```
  name: "1 Month IPTV" (string)
  price: 25 (number)
  salePrice: 20 (number)
  discount: 20 (number)
  duration: 1 (number)
  features: "Full HD, 1000+ channels" (string)
  ```

**Document 2:**
- Document ID: `plan6-month`
- Add fields:
  ```
  name: "6 Months IPTV" (string)
  price: 100 (number)
  salePrice: 65 (number)
  discount: 35 (number)
  duration: 6 (number)
  features: "Full HD, 1000+ channels" (string)
  ```

**Document 3:**
- Document ID: `plan12-month`
- Add fields:
  ```
  name: "12 Months IPTV" (string)
  price: 200 (number)
  salePrice: 95 (number)
  discount: 52 (number)
  duration: 12 (number)
  features: "Full HD, 1000+ channels" (string)
  ```

### 2.3 Create Other Collections

Create these empty collections (documents will be added by app logic):
- `orders` - auto-generated
- `referrals` - auto-generated  
- `admin_settings` - create manually

**For admin_settings collection:**
1. Click **Create collection**
2. Name it: `admin_settings`
3. Add document with ID: `payment`
4. Add fields:
   ```
   methodName: "Binance Pay" (string)
   instructions: "Send payment to wallet address" (string)
   accountInfo: "0x1234567890abcdef" (string)
   extraDiscount: 30 (number)
   ```

---

## Step 3: Create Firestore Indexes (Automatic)

Firestore will auto-suggest composite indexes when you first query. Accept them when prompted. Or manually create these in **Indexes** tab:

1. Collection: `orders` → Fields: `userId` (Asc), `createdAt` (Desc)
2. Collection: `referrals` → Fields: `referrerId` (Asc), `createdAt` (Desc)

---

## Step 4: Available Functions

All functions are in `src/lib/firestore-service.ts`:

### Users

```typescript
// Create new user (auto-generated referral code)
await createUser(userId, {
  name: "John Doe",
  email: "john@example.com"
});

// Get user by ID
const user = await getUser(userId);

// Update user
await updateUser(userId, { credits: 100 });

// Real-time listener (updates instantly)
const unsubscribe = onUserChange(userId, (user) => {
  console.log('User updated:', user);
});

// Get all users
const allUsers = await getAllUsers();

// Real-time listener for all users
const unsubscribe = onAllUsersChange((users) => {
  console.log('All users:', users);
});

// Find user by referral code
const user = await getUserByReferralCode('REF12345678');
```

### Plans

```typescript
// Get all plans one-time
const plans = await getPlans();

// Real-time listener for all plans
const unsubscribe = onPlansChange((plans) => {
  console.log('Plans updated:', plants);
});

// Admin: Update a plan
await updatePlan('plan12-month', {
  salePrice: 90,
  discount: 55
});
```

### Orders

```typescript
// Create order
const order = await createOrder(userId, {
  plan: 'plan12-month',
  paymentMethod: 'binance',
  finalPrice: 66.5
});

// Get user's orders (one-time)
const orders = await getUserOrders(userId);

// Real-time listener for user's orders
const unsubscribe = onUserOrdersChange(userId, (orders) => {
  console.log('Your orders:', orders);
});

// Get all orders (admin)
const allOrders = await getAllOrders();

// Real-time listener for all orders (admin)
const unsubscribe = onAllOrdersChange((orders) => {
  console.log('All orders:', orders);
});

// Admin: Approve order
await updateOrder(orderId, {
  status: 'approved',
  username: 'johndoe',
  password: 'pass123',
  url: 'https://iptv.example.com/user/johndoe',
  expiryDate: '2025-04-03'
});

// Admin: Reject order
await updateOrder(orderId, {
  status: 'rejected',
  rejectionReason: 'Payment proof invalid'
});
```

### Referrals

```typescript
// Record a referral (when new user is referred)
await recordReferral(referrerId, newUserId);
// This automatically increments referrer's totalReferrals

// Get all referrals for a user
const referredUsers = await getReferralsForUser(userId);

// Real-time listener for referrals
const unsubscribe = onReferralsChange(userId, (referrals) => {
  console.log('My referrals:', referrals);
});
```

### Admin Settings

```typescript
// Get admin settings
const settings = await getAdminSettings();

// Real-time listener for admin settings (payment methods)
const unsubscribe = onAdminSettingsChange((settings) => {
  console.log('Admin settings:', settings);
});

// Admin: Update settings
await updateAdminSettings({
  payment: {
    methodName: "Binance Pay",
    instructions: "Send to wallet",
    accountInfo: "0xabcd...",
    extraDiscount: 30
  }
});
```

---

## Step 5: How App Uses Firestore

### Sign Up Flow

1. User signs up with Firebase Auth
2. `onAuthStateChanged` in `AppProvider` automatically:
   - Creates user in Firestore collection
   - Generates referral code
   - Checks for `?ref=CODE` parameter
   - Records referral if user was referred
3. User data is real-time synced

### Referral Flow

```
User A has referralCode: REF12345678
↓ (shares link: site.com?ref=REF12345678)
↓
User B signs up via that link
↓
recordReferral() is called
↓
User A's totalReferrals increments from 5 to 6
↓
Real-time listeners update admin dashboard instantly
```

### Payment Flow

```
User creates order
↓
Order saved to Firestore (status: pending)
↓
Admin panel shows pending orders real-time
↓
Admin clicks Approve, enters credentials
↓
updateOrder() saves to Firestore
↓
User dashboard shows credentials instantly (via real-time listener)
↓
User gets 30-day access
```

---

## Step 6: Access in Components

### Example: Show Plans Real-Time

```typescript
'use client';
import { useEffect, useState } from 'react';
import { onPlansChange } from '@/lib/firestore-service';

export function PlansList() {
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    const unsubscribe = onPlansChange((plans) => {
      setPlans(plans);
    });

    return () => unsubscribe(); // Clean up listener
  }, []);

  return (
    <div>
      {plans.map(plan => (
        <div key={plan.id}>
          <h3>{plan.name}</h3>
          <p>Sale: ${plan.salePrice}</p>
        </div>
      ))}
    </div>
  );
}
```

### Example: Show User's Orders Real-Time

```typescript
'use client';
import { useEffect, useState } from 'react';
import { onUserOrdersChange } from '@/lib/firestore-service';
import { useApp } from '@/components/providers/app-provider';

export function MyOrders() {
  const { user } = useApp();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = onUserOrdersChange(user.id, (orders) => {
      setOrders(orders);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <div>
      {orders.map(order => (
        <div key={order.id}>
          <p>Plan: {order.plan}</p>
          <p>Status: {order.status}</p>
          {order.status === 'approved' && (
            <div>
              <p>Username: {order.username}</p>
              <p>Password: {order.password}</p>
              <p>Expires: {order.expiryDate}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
```

---

## Database Structure Reference

```
Firestore Collections:
├── users/{userId}
│   ├── name: string
│   ├── email: string
│   ├── referralCode: string
│   ├── referredBy: string (optional)
│   ├── totalReferrals: number
│   ├── createdAt: timestamp
│   └── credits: number (optional)
│
├── plans/{planId}
│   ├── name: string
│   ├── price: number
│   ├── salePrice: number
│   ├── discount: number
│   ├── duration: number
│   └── features: string
│
├── orders/{orderId}
│   ├── userId: string
│   ├── plan: string
│   ├── status: string (pending/approved/rejected/completed/expired/active)
│   ├── username: string (after approval)
│   ├── password: string (after approval)
│   ├── url: string (after approval)
│   ├── expiryDate: string (after approval)
│   ├── rejectionReason: string (if rejected)
│   ├── paymentMethod: string
│   ├── transactionId: string
│   ├── paymentProofUrl: string
│   ├── finalPrice: number
│   ├── createdAt: timestamp
│   └── updatedAt: timestamp
│
├── referrals/{referralId}
│   ├── referrerId: string
│   ├── referredUserId: string
│   └── createdAt: timestamp
│
└── admin_settings/payment
    ├── methodName: string
    ├── instructions: string
    ├── accountInfo: string
    └── extraDiscount: number
```

---

## Summary

✅ **Firestore service layer** created with all functions  
✅ **Real-time listeners** (onSnapshot) in every function  
✅ **Auto referral code** generation on signup  
✅ **Referral tracking** with automatic totalReferrals increment  
✅ **Order approval** with credentials storage  
✅ **Admin settings** for payment method configuration  
✅ **Build successful** - ready to deploy!

Now:

1. **Go to Firebase Console** → **Firestore Database**
2. **Create collections** following Step 2 above
3. **Update security rules** with the JSON provided
4. **Start your app** with `npm run dev`
5. **Sign up** and test the referral system!

All data will sync instantly across all devices using real-time listeners!
