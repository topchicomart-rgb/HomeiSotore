# Firebase Security Rules - CRITICAL UPDATE REQUIRED

**Status**: ⚠️ **Must be updated in Firebase Console immediately**

---

## 1. Realtime Database Rules

**Location**: Firebase Console → Realtime Database → Rules tab

**REPLACE ENTIRE RULES with:**

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "auth != null",
        ".write": "auth.uid == $uid || root.child('users').child(auth.uid).child('isAdmin').val() === true",
        ".validate": "newData.hasChildren(['email', 'name'])"
      }
    },
    "orders": {
      "$uid": {
        ".read": "auth != null && (auth.uid == $uid || root.child('users').child(auth.uid).child('isAdmin').val() === true)",
        ".write": "auth != null",
        "$orderId": {
          ".validate": "newData.hasChildren(['plan', 'amount', 'status'])"
        }
      }
    },
    "referrals": {
      ".read": "auth != null",
      ".write": "auth != null",
      "$refId": {
        ".validate": "newData.hasChildren(['referrerId', 'referredUserId'])"
      }
    },
    "config": {
      ".read": "auth != null",
      ".write": "auth != null && root.child('users').child(auth.uid).child('isAdmin').val() === true"
    },
    "admin_settings": {
      ".read": "auth != null",
      ".write": "auth != null && root.child('users').child(auth.uid).child('isAdmin').val() === true",
      "payment": {
        ".validate": "newData.hasChildren(['methodName', 'instructions', 'accountInfo'])"
      },
      "socialMedia": {
        ".validate": "newData.hasChildren(['youtube', 'instagram', 'facebook', 'tiktok', 'twitter', 'telegram'])"
      }
    },
    ".read": false,
    ".write": false
  }
}
```

---

## 2. Firestore Rules

**Location**: Firebase Console → Firestore Database → Rules tab

**ADD THIS RULE** (before the final `match /{document=**}` catch-all):

```
match /socialTaskSubmissions/{submissionId} {
  allow read: if isAdmin() || (isAuthenticated() && request.auth.uid == resource.data.userId);
  allow create: if isAuthenticated();
  allow update: if isAdmin();
  allow delete: if isAdmin();
}
```

Your complete Firestore rules should now look like:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    function isAdmin() {
      return isAuthenticated() && 
             request.auth.email == "zainashraf0326@gmail.com";
    }

    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && request.auth.uid == userId;
      allow update: if isAuthenticated() && (
                       isOwner(userId) ||
                       request.resource.data.diff(resource.data).affectedKeys()
                         .hasOnly(['totalReferrals', 'totalEarnings', 'completedPurchases', 'updatedAt', 'referralCode'])
                     );
      
      // USER NOTIFICATIONS SUB-COLLECTION
      match /notifications/{notificationId} {
        allow read: if isOwner(userId);
        allow create: if isAuthenticated();
        allow update, delete: if isOwner(userId) || isAdmin();
      }
    }

    match /notifications/{notificationId} {
      allow read: if isAuthenticated() && request.auth.uid == resource.data.userId;
      allow create: if isAuthenticated();
      allow update, delete: if isAuthenticated() && request.auth.uid == resource.data.userId;
    }

    match /referrals/{referralId} {
      allow read: if isAuthenticated() && 
                     (isOwner(resource.data.referrerId) || 
                      isOwner(resource.data.referredUserId));
      allow create: if isAuthenticated();
      allow update: if isAuthenticated() && (
                       isOwner(resource.data.referrerId) ||
                       isOwner(resource.data.referredUserId)
                     );
    }

    match /wallets/{userId} {
      allow read: if isOwner(userId);
      allow create: if isAuthenticated();
      allow update: if isAuthenticated();
      
      match /transactions/{transactionId} {
        allow read, write: if isOwner(userId);
      }
    }

    match /rewards/{rewardId} {
      allow read: if isAuthenticated();
      allow create, update: if isAuthenticated();
    }

    match /orders/{orderId} {
      allow read: if isAdmin() || 
                     (isAuthenticated() && request.auth.email == resource.data.userEmail);
      allow create: if request.resource.data.userEmail != null && 
                       request.resource.data.amount > 0;
      allow update: if isAdmin() || isAuthenticated();
    }

    match /plans/{planId} {
      allow read: if resource.data.isActive == true;
      allow create, update, delete: if isAdmin();
    }

    match /settings/{document=**} {
      allow read: if document == "general";
      allow write: if isAdmin();
    }

    match /adminContent/{document=**} {
      allow read: if isAdmin();
      allow write: if isAdmin();
    }

    match /socialTaskSubmissions/{submissionId} {
      allow read: if isAdmin() || (isAuthenticated() && request.auth.uid == resource.data.userId);
      allow create: if isAuthenticated();
      allow update: if isAdmin();
      allow delete: if isAdmin();
    }

    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## What This Fixes

### ✅ Admin Panel Data Access
- **Plan names, prices** - Loaded from Realtime Database `/config`
- **Payment info** - Loaded from Realtime Database `/admin_settings`
- **Social media links** - Loaded from Realtime Database `/admin_settings`
- **Social task submissions** - Admins can now read from Firestore

### ✅ User Pages
- **IPTV page** - Can read config (plan list, pricing)
- **Earn page** - Can read admin_settings (social media links)
- **Dashboard** - Can read referrals and user data

### ✅ Admin Operations
- **Admin panel** - Can save plan names, prices, payment methods
- **Admin panel** - Can approve/reject social task submissions
- **Admin panel** - Can view and manage all data

---

## Steps to Apply

### **Option A: Manual Update (Recommended)**
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Realtime Database** → **Rules** tab
4. Copy the JSON rules above and paste
5. Click **Publish**
6. Go to **Firestore Database** → **Rules** tab
7. Find line with `match /adminContent/{document=**}`
8. Add the `socialTaskSubmissions` rule before it
9. Click **Publish**

### **Option B: Using Firebase CLI**
```bash
firebase login
firebase deploy --only database
firebase deploy --only firestore:rules
```

---

## Verification Checklist

After updating rules:
- ✅ Admin panel loads without permission errors
- ✅ Can save payment methods
- ✅ Can save plan names and prices
- ✅ Can view social task submissions
- ✅ Can approve/reject tasks
- ✅ Users can see social media links on /earn page
- ✅ Users can see plans on /iptv page
- ✅ Browser console shows no permission errors

---

## If Still Getting Errors

1. **Clear browser cache** (Ctrl+Shift+Delete)
2. **Hard refresh** (Ctrl+Shift+R)
3. **Check Firebase Console** - Rules must show as "Published"
4. **Check user email** - Admin user must be `zainashraf0326@gmail.com`
5. **Verify isAdmin flag** - User must have `isAdmin: true` in Firebase Auth custom claims

