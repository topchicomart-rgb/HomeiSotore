# Firestore Setup Guide for PrimexStream Pro

## Step 1: Create Collections in Firebase Console

Go to Firebase Console → Firestore Database → Create Collection. Create these collections:

### 1. **users** collection
```
users/{userId}
  - name: string
  - email: string
  - referralCode: string (auto-generated)
  - referredBy: string (optional)
  - totalReferrals: number (default: 0)
  - createdAt: timestamp
  - credits: number (optional)
```

**Example document:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "referralCode": "REF12345678",
  "referredBy": "REFabcd1234",
  "totalReferrals": 5,
  "createdAt": "2024-04-03T22:00:00Z",
  "credits": 100
}
```

### 2. **plans** collection
```
plans/{planId}
  - name: string
  - price: number
  - salePrice: number
  - discount: number
  - duration: number (months)
  - features: string
```

**Example documents:**
```json
// Document ID: plan1-month
{
  "name": "1 Month IPTV",
  "price": 25,
  "salePrice": 20,
  "discount": 20,
  "duration": 1,
  "features": "Full HD, 1000+ channels"
}

// Document ID: plan6-month
{
  "name": "6 Month IPTV",
  "price": 100,
  "salePrice": 65,
  "discount": 35,
  "duration": 6,
  "features": "Full HD, 1000+ channels"
}

// Document ID: plan12-month
{
  "name": "12 Month IPTV",
  "price": 200,
  "salePrice": 95,
  "discount": 52,
  "duration": 12,
  "features": "Full HD, 1000+ channels"
}
```

### 3. **orders** collection
```
orders/{orderId}
  - userId: string
  - plan: string
  - status: string (pending, approved, rejected, completed, expired, active)
  - username: string (after approval)
  - password: string (after approval)
  - url: string (after approval)
  - expiryDate: string (after approval)
  - rejectionReason: string (if rejected)
  - paymentMethod: string
  - transactionId: string
  - paymentProofUrl: string
  - finalPrice: number
  - createdAt: timestamp
  - updatedAt: timestamp
```

**Example document:**
```json
{
  "userId": "user123",
  "plan": "plan12-month",
  "status": "approved",
  "username": "johndoe",
  "password": "pass123",
  "url": "https://iptv.example.com/user/johndoe",
  "expiryDate": "2025-04-03",
  "paymentMethod": "binance",
  "transactionId": "0x123abc",
  "paymentProofUrl": "https://cdn.example.com/proof.jpg",
  "finalPrice": 66.5,
  "createdAt": "2024-04-03T22:00:00Z",
  "updatedAt": "2024-04-03T22:15:00Z"
}
```

### 4. **referrals** collection
```
referrals/{referralId}
  - referrerId: string
  - referredUserId: string
  - createdAt: timestamp
```

**Example document:**
```json
{
  "referrerId": "user123",
  "referredUserId": "user456",
  "createdAt": "2024-04-03T22:00:00Z"
}
```

### 5. **admin_settings** collection
```
admin_settings/payment
  - methodName: string
  - instructions: string
  - accountInfo: string
  - extraDiscount: number (optional)
```

**Example document:**
```json
{
  "methodName": "Binance Pay",
  "instructions": "Send payment to this wallet address",
  "accountInfo": "0x1234567890abcdef",
  "extraDiscount": 30
}
```

## Step 2: Set Firestore Security Rules

Go to Firebase Console → Firestore → Rules tab and paste:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users - user can read own data, auth users can create and update totalReferrals/credits
    match /users/{userId} {
      allow read: if request.auth.uid == userId;
      allow create: if request.auth.uid != null && request.auth.uid == userId;
      allow update: if request.auth.uid == userId 
        || (request.auth.uid != null && 
            (request.resource.data.diff(resource.data).affectedKeys().hasOnly(['totalReferrals', 'credits'])));
    }
    
    // Plans - public read, no write (admin only via console)
    match /plans/{document=**} {
      allow read: if true;
      allow write: if false;
    }
    
    // Orders - user reads own, authenticated can create, update own
    match /orders/{orderId} {
      allow read: if request.auth != null && (resource.data.userId == request.auth.uid);
      allow create: if request.auth.uid != null && request.resource.data.userId == request.auth.uid;
      allow update: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    
    // Referrals - allow authenticated users to read/write
    match /referrals/{document=**} {
      allow read: if request.auth.uid != null;
      allow write: if request.auth.uid != null;
    }
    
    // Admin Settings - public read, no write
    match /admin_settings/{document=**} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

## Step 3: Create Indexes

Firestore will auto-suggest composite indexes. When you see warnings about missing indexes, click the link provided. You'll need these indexes:

1. Collection: `orders` 
   - Field: `userId` (Ascending)
   - Field: `createdAt` (Descending)

2. Collection: `referrals`
   - Field: `referrerId` (Ascending)
   - Field: `createdAt` (Descending)

## Step 4: Initialize Sample Data (Optional)

Add these documents to get started:

### Create 3 plans:
- ID: `plan1-month` with the data above
- ID: `plan6-month` with the data above  
- ID: `plan12-month` with the data above

### Create admin settings:
- Collection: `admin_settings`
- Document ID: `payment`
- Data: Payment method configuration

## How It Works in Code

Check `src/lib/firestore-service.ts` for all available functions:

```typescript
// Create a new user
await createUser(userId, { name, email });

// Listen to real-time user changes
const unsubscribe = onUserChange(userId, (user) => {
  console.log('User updated:', user);
});

// Get all plans (real-time)
const unsubscribe = onPlansChange((plans) => {
  console.log('Plans updated:', plans);
});

// Create an order
const order = await createOrder(userId, {
  plan: 'plan12-month',
  paymentMethod: 'binance',
  finalPrice: 66.5
});

// Approve an order
await updateOrder(orderId, {
  status: 'approved',
  username: 'johndoe',
  password: 'pass123',
  url: 'https://...',
  expiryDate: '2025-04-03'
});

// Record a referral
await recordReferral(referrerId, newUserId);

// Get all referrals for a user
const referrals = await getReferralsForUser(userId);
```

All functions include real-time listeners with `onSnapshot` for instant updates!
