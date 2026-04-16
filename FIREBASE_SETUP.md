# Firebase + Supabase Integration Guide

## ✅ Completed Setup

### Libraries Installed
- ✅ Firebase SDK (Authentication + Realtime Database)
- ✅ Supabase JS Client (Image Storage)

### Configuration Files Created
- ✅ `src/lib/firebase-config.ts` - Firebase initialization
- ✅ `src/lib/supabase-config.ts` - Supabase initialization
- ✅ `src/lib/firebase-service.ts` - Backend service functions

### Authentication Updated
- ✅ Login page now uses Firebase Auth (createUserWithEmailAndPassword, signInWithEmailAndPassword)
- ✅ App Provider reads user from Firebase Auth listener
- ✅ Automatic user database record creation on signup
- ✅ Real-time auth state synchronization

### Database Functions Available

#### Plans Management
```typescript
getPlans()                    // Get all IPTV plans
createPlan(plan)             // Create new plan
updatePlan(planId, updates)  // Edit plan price/name
deletePlan(planId)           // Remove plan
```

#### Orders Management
```typescript
createOrder(userId, order)         // Create new order
getUserOrders(userId)              // Get user's orders
updateOrder(userId, orderId, updates)  // Update order status
getAllOrders()                      // Get all orders (admin)
```

#### Users Management
```typescript
getUserData(userId)          // Get user profile
updateUserData(userId, data) // Update user info
getAllUsers()                // Get all users (admin)
```

#### File Storage (Supabase)
```typescript
uploadPaymentProof(userId, file)     // Upload payment screenshot
getPaymentProofUrl(path)             // Get public URL
deletePaymentProof(path)             // Delete uploaded file
```

#### Referrals
```typescript
addReferral(userId, referredUserId)  // Track referral
getUserReferrals(userId)             // Get user's referrals
```

---

## 🚀 Next Steps to Connect Pages

### 1. Dashboard Page
- Replace demo cards with Firebase data
- Show real user credits/balance
- Display actual order count from database

### 2. Payment Page
- Save orders to Firebase when "Confirm Payment" clicked
- Upload payment proof to Supabase
- Store proof path in order record

### 3. Admin Panel
- Load orders from Firebase (not demo data)
- Load plans from database
- Edit/approve orders with real database updates
- View uploaded proofs from Supabase URLs

### 4. Orders Page
- Load user's orders from Firebase
- Show real credentials from database
- Display rejection reasons from database
- View uploaded payment proofs

### 5. IPTV Page
- Load plans from Firebase database
- Save plan selections to user's pending orders

### 6. Earn Page
- Load referral data from Firebase
- Display real referral codes and counts

---

## 📊 Database Structure

```
Firebase Realtime Database:
├── users/
│   └── {userId}/
│       ├── id
│       ├── name
│       ├── email
│       ├── credits
│       ├── referralCode
│       ├── referredCount
│       ├── referredBy
│       └── createdAt
├── orders/
│   └── {userId}/
│       └── {orderId}/
│           ├── service
│           ├── plan
│           ├── price
│           ├── status (pending/approved/rejected/completed)
│           ├── user
│           ├── date
│           ├── paymentProofPath (Supabase path)
│           ├── rejectionReason
│           ├── credentials
│           │   ├── username
│           │   ├── password
│           │   ├── url
│           │   └── expiryDate
│           └── createdAt
└── plans/
    └── {planId}/
        ├── name
        ├── originalPrice
        ├── salePrice
        ├── discount
        └── description

Supabase Storage:
└── payment-proofs/
    └── {userId}/{timestamp}_{filename}
```

---

## 🔐 Admin Access

Current admin email: `zainashraf0326@gmail.com`

To change admin email, edit: `src/components/providers/admin-provider.tsx`

---

## 📝 Usage Examples

### Create New Order
```typescript
import { createOrder } from '@/lib/firebase-service';

const order = await createOrder(userId, {
  service: 'IPTV 6-Month',
  plan: '6 Months',
  price: 65,
  user: 'Ahmed Ali',
  date: new Date().toLocaleDateString(),
});
```

### Upload Payment Proof
```typescript
import { uploadPaymentProof } from '@/lib/firebase-service';

const file = /* file from input */;
const result = await uploadPaymentProof(userId, file);
// result: { path: 'path/to/file', url: 'public-url' }
```

### Get All Orders (Admin)
```typescript
import { getAllOrders } from '@/lib/firebase-service';

const orders = await getAllOrders();
// Returns all orders from all users with userId info
```

---

## ⚠️ Important Notes

1. **Firestore Rules**: Firebase Realtime Database must allow authenticated users to read/write their own data
2. **Supabase RLS**: Storage bucket must allow authenticated users to upload to `payment-proofs/` folder
3. **Admin Panel**: Only users with admin email can access the admin dashboard
4. **Demo Data**: All previous demo data has been removed - data now persists in Firebase

---

## 🔗 Configuration Status

✅ Firebase: Connected and ready  
✅ Supabase: Connected and ready  
❌ Pages: Need updates (in progress)  
❌ Admin Panel: Needs database integration  

---

## Support

For Firebase docs: https://firebase.google.com/docs  
For Supabase docs: https://supabase.com/docs
