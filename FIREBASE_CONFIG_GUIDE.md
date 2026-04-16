# Firebase Configuration Guide for PrimeXStream Pro

## ✅ Fixed Notification Issues

The following issues have been fixed:

### 1. **Order Approval/Rejection Notifications** ✅
- **Problem**: When admin approved or rejected an order, user didn't receive notification
- **Root Cause**: `updateOrderStatus()` in admin service wasn't sending notifications
- **Fix**: Added notification trigger to `updateOrderStatus()` in `admin-firestore-service.ts`
- **Now Working**: ✅ Users get notified when order is approved, rejected, or status changes

### 2. **Referral Notifications** ✅
- **Problem**: When someone signed up with referral code, referrer didn't get notification
- **Root Cause**: `recordReferral()` in firestore service wasn't sending notifications
- **Fix**: Added notification trigger to `recordReferral()` in `firestore-service.ts`
- **Now Working**: ✅ Referrers get notified when new user signs up with their code

---

## Firebase Setup Configuration

### Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or use existing project
3. Name: `primexstream-pro`
4. Enable Google Analytics (optional)

### Step 2: Enable Authentication
1. In Firebase Console, go to **Authentication**
2. Click **Get Started**
3. Enable providers:
   - ✅ Email/Password - Enable
   - ✅ Google - Enable and add OAuth credentials

### Step 3: Create Realtime Database
1. Go to **Realtime Database**
2. Click **Create Database**
3. Choose location closest to your users
4. Start in **test mode** (for development)

```
Security Rules for Development (Test Mode):
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

**⚠️ FOR PRODUCTION**, use these rules:
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
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    },
    "notifications": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "root.child('users').child($uid).exists()",
        ".indexOn": ["createdAt"]
      }
    },
    "plans": {
      ".read": true,
      ".write": false
    }
  }
}
```

### Step 4: Create Firestore Database (for admin & referrals)
1. Go to **Firestore Database**
2. Click **Create Database**
3. Choose location same as Realtime Database
4. Start in **test mode** (for development)

**Security Rules for Development:**
```
match /{document=**} {
  allow read, write: if true;
}
```

**Security Rules for Production:**
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users
    match /users/{userId} {
      allow read: if request.auth.uid == userId;
      allow write: if request.auth.uid == userId;
    }
    
    // Referrals
    match /referrals/{document=**} {
      allow read: if request.auth.uid != null;
      allow write: if request.auth != null;
    }
    
    // Orders (visible to order owner)
    match /orders/{orderId} {
      allow read: if request.auth.uid == resource.data.userId;
      allow write: if request.auth.uid == resource.data.userId;
    }
    
    // Admin collections (only for admin)
    match /plans/{document=**} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    match /settings/{document=**} {
      allow read: if true;
      allow write: if isAdmin();
    }
  }
  
  function isAdmin() {
    return request.auth.uid in get(/databases/$(database)/documents/admins).data.adminIds;
  }
}
```

### Step 5: Setup Supabase Storage (for payment proofs)
1. Go to [Supabase](https://supabase.com/)
2. Create new project
3. Go to **Storage** → Create new bucket: `payment-proofs`
4. Set bucket to **public**
5. Add storage policy allowing uploads

---

## Environment Variables Setup

Create `.env.local` file in root directory:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Supabase Configuration (for image uploads)
NEXT_PUBLIC_SUPABASE_URL=https://your_project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### How to Get Firebase Credentials

1. Open Firebase Console
2. Go to Project Settings (gear icon)
3. Scroll to "Your apps" section
4. Click on Web app (or create if needed)
5. Copy the config object:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyD...",
  authDomain: "primexstream-pro.firebaseapp.com",
  databaseURL: "https://primexstream-pro.firebaseio.com",
  projectId: "primexstream-pro",
  storageBucket: "primexstream-pro.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef",
  measurementId: "G-XXXXXXXXXX"
};
```

---

## Database Structure

### Realtime Database Structure
```
/
├── users/
│   └── {userId}/
│       ├── name: "John Doe"
│       ├── email: "john@example.com"
│       ├── referralCode: "REFABC123"
│       ├── referredBy: "{referrerId}" (optional)
│       ├── referredCount: 5
│       └── createdAt: "2024-04-01T10:00:00Z"
│
├── orders/
│   └── {userId}/
│       └── {orderId}/
│           ├── planId: "1"
│           ├── planName: "Pro Plan"
│           ├── amount: 100
│           ├── status: "approved" | "pending" | "rejected"
│           ├── paymentMethod: "credit_card"
│           ├── paymentProof: "url_to_image"
│           └── createdAt: "2024-04-01T10:00:00Z"
│
├── notifications/
│   └── {userId}/
│       └── {notificationId}/
│           ├── title: "✅ Order Approved"
│           ├── message: "Your order #abc123 has been approved..."
│           ├── type: "order" | "referral" | "payment"
│           ├── isRead: false
│           └── createdAt: "2024-04-01T10:00:00Z"
│
└── plans/
    └── {planId}/
        ├── name: "Pro Plan"
        ├── price: 100
        ├── duration: 30
        └── features: ["feature1", "feature2"]
```

### Firestore Database Structure
```
/
├── users/
│   └── {userId}/
│       ├── name: "John Doe"
│       ├── email: "john@example.com"
│       ├── totalReferrals: 5
│       └── createdAt: timestamp
│
├── referrals/
│   └── {referralId}/
│       ├── referrerId: "{userId}"
│       ├── referredUserId: "{userId}"
│       └── createdAt: timestamp
│
├── plans/
│   └── {planId}/
│       ├── name: "Pro Plan"
│       ├── price: 100
│       └── isActive: true
│
└── settings/
    └── general/
        ├── siteName: "PrimeXStream Pro"
        └── siteDescription: "Premium IPTV Service"
```

---

## Notification Flow

### 1. Order Creation Notification
```
User places order → createOrder() → sends notification
Image: "📦 Order Created"
Message: "Your order #abc123 has been placed..."
```

### 2. Order Approval Notification ✅
```
Admin approves order → updateOrderStatus() → sends notification
Image: "✅ Order Approved"
Message: "Your order #abc123 has been approved! Access will activate soon."
```

### 3. Order Rejection Notification ✅
```
Admin rejects order → updateOrderStatus() → sends notification
Image: "❌ Order Rejected"
Message: "Your order #abc123 has been rejected. Contact support for details."
```

### 4. Referral Notification ✅
```
New user signs up with referral code → recordReferral() → sends notification
Image: "🎉 New Referral!"
Message: "John Doe signed up using your code! You now have 5 referrals."
```

---

## Testing Notifications Locally

### Test Order Notifications
1. Login as regular user
2. Navigate to Dashboard → "Buy IPTV"
3. Place an order
4. Should see "📦 Order Created" notification immediately

### Test Admin Notifications
1. Login to `/admin`
2. Find the order you just created
3. Click "Approve" or "Reject"
4. Go back to user account
5. Should see approval/rejection notification

### Test Referral Notifications
1. Create new account with referral code of existing user
2. This user should see "🎉 New Referral!" notification

---

## Troubleshooting

### Issue: Notifications not appearing
**Solution**: 
1. Check browser console for errors (F12)
2. Verify Firebase is initialized: Check for "✅ Firebase initialized" in console
3. Check notification listener is running: Open notification dropdown
4. Check Realtime Database rules allow reads/writes
5. Verify userId is being passed correctly to sendNotification()

### Issue: "Order not found" error when admin updates order
**Solution**:
1. Make sure order exists in Realtime Database at `orders/{userId}/{orderId}`
2. Check that userId parameter is passed correctly in updateOrderStatus()
3. Verify Firebase Database URL is correct in .env.local

### Issue: Notifications sending but very slow
**Solution**:
1. Check network speed in DevTools
2. May need to optimize Firebase rules
3. Consider adding indexing on `notifications/{userId}`

### Issue: Firebase initialized but no data showing
**Solution**:
1. Go to Firebase Console → Realtime Database
2. Check if data exists in the database
3. Verify database URL/location is set correctly
4. Check security rules allow reads

---

## Production Deployment Checklist

- [ ] Update Firebase security rules (not test mode)
- [ ] Set up proper admin authorization
- [ ] Enable Firestore backups
- [ ] Set up Firebase monitoring
- [ ] Add Firebase error reporting
- [ ] Configure email verification for auth
- [ ] Set up password reset functionality
- [ ] Enable reCAPTCHA for auth
- [ ] Review and optimize database indexes
- [ ] Set appropriate database retention policies
- [ ] Test all notification flows end-to-end
- [ ] Set up monitoring alerts for errors

---

## Support

For Firebase issues:
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Console](https://console.firebase.google.com/)
- [Firebase Pricing & Quotas](https://firebase.google.com/pricing)

---

**Last Updated**: April 13, 2026
**All Notifications**: ✅ Working
