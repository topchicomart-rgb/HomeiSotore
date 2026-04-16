# Firebase Collections Schema & Seed Data

## 📋 Collections to Create

### 1. `plans` Collection
**Purpose**: Store all IPTV plans
**Documents per plan**: 1 document

```json
{
  "docId": "1-month",
  "name": "IPTV 1-Month",
  "duration": "1 Month",
  "originalPrice": 25,
  "salePrice": 20,
  "discount": 5,
  "description": "Access for 1 month",
  "extraDiscount": 6,
  "isActive": true,
  "createdAt": "2026-04-10T00:00:00Z"
}

{
  "docId": "6-month",
  "name": "IPTV 6-Month",
  "duration": "6 Months",
  "originalPrice": 75,
  "salePrice": 65,
  "discount": 10,
  "description": "Access for 6 months",
  "extraDiscount": 19.5,
  "isActive": true,
  "createdAt": "2026-04-10T00:00:00Z"
}

{
  "docId": "12-month",
  "name": "IPTV 12-Month",
  "duration": "12 Months",
  "originalPrice": 120,
  "salePrice": 95,
  "discount": 25,
  "description": "Access for 12 months",
  "extraDiscount": 28.5,
  "isActive": true,
  "createdAt": "2026-04-10T00:00:00Z"
}
```

---

### 2. `paymentMethods` Collection
**Purpose**: Store payment options (Binance, Remitly, PayPal, CashApp)
**Documents**: 4 payment method docs

```json
{
  "docId": "binance",
  "name": "Binance",
  "icon": "🟡",
  "instructions": "Send USDT to Binance address",
  "accountInfo": "Your Binance wallet address here",
  "isActive": true
}

{
  "docId": "remitly",
  "name": "Remitly",
  "icon": "🔵",
  "instructions": "Send money via Remitly",
  "accountInfo": "Recipient details here",
  "isActive": true
}

{
  "docId": "paypal",
  "name": "PayPal",
  "icon": "💙",
  "instructions": "Pay via PayPal",
  "accountInfo": "PayPal email here",
  "isActive": true
}

{
  "docId": "cashapp",
  "name": "Cash App",
  "icon": "💚",
  "instructions": "Send via Cash App",
  "accountInfo": "Cash tag here",
  "isActive": true
}
```

---

### 3. `referralTiers` Collection
**Purpose**: Store referral reward tiers
**Documents**: 3 tier docs

```json
{
  "docId": "tier-1",
  "level": 1,
  "minReferrals": 2,
  "reward": "1 Month IPTV",
  "icon": "🎁",
  "bonus": 5,
  "description": "Get 5% commission at 2 referrals"
}

{
  "docId": "tier-2",
  "level": 2,
  "minReferrals": 5,
  "reward": "6 Months IPTV",
  "icon": "🌟",
  "bonus": 7,
  "description": "Get 7% commission at 5 referrals"
}

{
  "docId": "tier-3",
  "level": 3,
  "minReferrals": 10,
  "reward": "12 Months IPTV",
  "icon": "👑",
  "bonus": 10,
  "description": "Get 10% commission at 10 referrals"
}
```

---

### 4. `faqs` Collection
**Purpose**: Store all FAQ items (merged from 2 sources)
**Documents**: 12+ FAQ docs

```json
{
  "docId": "faq-1",
  "category": "Getting Started",
  "question": "How do I start using PrimexStream Pro?",
  "answer": "Sign up with your email, choose a plan, and start streaming immediately. It takes less than 2 minutes!",
  "order": 1
}

{
  "docId": "faq-2",
  "category": "Devices",
  "question": "What devices can I use?",
  "answer": "Smart TV, Firestick, Android Box, Mobile, Laptop, Tablet, MAG Box, and PC.",
  "order": 2
}

{
  "docId": "faq-3",
  "category": "Account",
  "question": "Can I share my account?",
  "answer": "Each account supports up to 4 simultaneous streams.",
  "order": 3
}

{
  "docId": "faq-4",
  "category": "Support",
  "question": "How do I get support?",
  "answer": "Contact us via WhatsApp, email, or use the support form on this page.",
  "order": 4
}

{
  "docId": "faq-5",
  "category": "Payment",
  "question": "Is there a money-back guarantee?",
  "answer": "Yes, 7-day money-back guarantee if you're not satisfied.",
  "order": 5
}

{
  "docId": "faq-6",
  "category": "Payment",
  "question": "Are there hidden fees?",
  "answer": "No, all pricing is transparent. No hidden charges.",
  "order": 6
}
```

---

### 5. `reviews` Collection
**Purpose**: Store customer reviews (merged from 2 sources)
**Documents**: 6 review docs

```json
{
  "docId": "review-1",
  "name": "Ahmed Hassan",
  "rating": 5,
  "text": "Excellent service! The IPTV streams are crystal clear and the referral program is amazing.",
  "date": "2 weeks ago",
  "verified": true
}

{
  "docId": "review-2",
  "name": "Sarah Johnson",
  "rating": 5,
  "text": "Best IPTV provider I've used. Customer support is responsive and helpful.",
  "date": "1 week ago",
  "verified": true
}

{
  "docId": "review-3",
  "name": "Marco Silva",
  "rating": 5,
  "text": "Very satisfied with the platform. Earning through referrals is easy and rewarding!",
  "date": "3 days ago",
  "verified": true
}
```

---

### 6. `services` Collection
**Purpose**: Store service categories
**Documents**: 4+ service docs

```json
{
  "docId": "service-iptv",
  "name": "IPTV Services",
  "icon": "Tv",
  "href": "/iptv",
  "color": "from-blue-500 to-blue-600",
  "description": "Premium IPTV streaming service"
}

{
  "docId": "service-repair",
  "name": "Home Repair",
  "icon": "Wrench",
  "href": "/home-repair",
  "color": "from-orange-500 to-orange-600",
  "description": "Professional home repair services"
}

{
  "docId": "service-earn",
  "name": "Earn Program",
  "icon": "TrendingUp",
  "href": "/earn",
  "color": "from-purple-500 to-purple-600",
  "description": "Earn money through referrals"
}

{
  "docId": "service-products",
  "name": "Custom Products",
  "icon": "Package",
  "href": "#",
  "color": "from-pink-500 to-pink-600",
  "description": "Customized product solutions"
}
```

---

### 7. `devices` Collection
**Purpose**: Store supported devices
**Documents**: 8 device docs

```json
{
  "docId": "device-smart-tv",
  "id": "smart-tv",
  "label": "Smart TV",
  "emoji": "📺"
}

{
  "docId": "device-firestick",
  "id": "firestick",
  "label": "Firestick",
  "emoji": "🔥"
}

{
  "docId": "device-android-box",
  "id": "android-box",
  "label": "Android Box",
  "emoji": "📦"
}

{
  "docId": "device-mobile",
  "id": "mobile",
  "label": "Mobile",
  "emoji": "📱"
}

// ... More devices
```

---

### 8. `settings/general` Document
**Purpose**: Store site-wide settings

```json
{
  "companyName": "PrimexStream Pro",
  "phoneNumber": "+1-XXX-XXX-XXXX",
  "email": "support@primexstream.pro",
  "whatsappNumber": "+1-XXX-XXX-XXXX",
  "paymentInstructions": "Send payment and receive access within 5 minutes",
  "homeTitle": "Premium IPTV Streaming & Earning Platform",
  "homeDescription": "Get instant access to 10,000+ channels, earn money through referrals",
  "updatedAt": "2026-04-10T00:00:00Z"
}
```

---

### 9. `users` Collection
**Purpose**: Store user profiles (Auto-created on signup)

```json
{
  "docId": "user-uid",
  "email": "user@example.com",
  "name": "User Name",
  "referralCode": "UNIQUE123",
  "totalReferrals": 0,
  "walletBalance": 0,
  "createdAt": "2026-04-10T00:00:00Z"
}
```

---

### 10. `orders` Collection
**Purpose**: Store customer orders (Auto-created on order)

```json
{
  "docId": "order-id",
  "userId": "user-uid",
  "userEmail": "user@example.com",
  "planId": "1-month",
  "planName": "IPTV 1-Month",
  "amount": 20,
  "finalPrice": 20,
  "status": "pending",
  "paymentMethod": "binance",
  "device": "smart-tv",
  "referredBy": "REFERRAL123",
  "createdAt": "2026-04-10T00:00:00Z"
}
```

---

### 11. `referrals` Collection
**Purpose**: Track referral relationships

```json
{
  "docId": "ref-id",
  "referrerId": "user-uid-1",
  "refereeId": "user-uid-2",
  "refereeEmail": "referee@example.com",
  "status": "completed",
  "commission": 2.00,
  "createdAt": "2026-04-10T00:00:00Z"
}
```

---

## 🎯 Migration Steps

### **Step 1: Create Collections in Firebase Console**
1. Go to Data → Add Collection
2. Name: `plans`
3. Add first document with ID: `1-month`
4. Repeat for all collections

### **Step 2: Add Documents**
Copy-paste the JSON above into Firebase

### **Step 3: Update Code to Read from Firebase**
Website will automatically read from these collections

### **Step 4: Build Admin Panel**
Create UI to edit/manage this data

---

## ✅ Firestore Security Rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public collections (read-only for users)
    match /plans/{document=**} {
      allow read: if true;
      allow write: if false;
    }
    
    match /paymentMethods/{document=**} {
      allow read: if true;
      allow write: if false;
    }
    
    match /referralTiers/{document=**} {
      allow read: if true;
      allow write: if false;
    }
    
    match /faqs/{document=**} {
      allow read: if true;
      allow write: if false;
    }
    
    match /reviews/{document=**} {
      allow read: if true;
      allow write: if false;
    }
    
    match /services/{document=**} {
      allow read: if true;
      allow write: if false;
    }
    
    match /devices/{document=**} {
      allow read: if true;
      allow write: if false;
    }
    
    // Admin only
    match /settings/{document=**} {
      allow read, write: if request.auth.uid != null && false; // TODO: Add admin check
    }
    
    match /users/{uid} {
      allow read, write: if request.auth.uid == uid;
    }
    
    match /orders/{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    match /referrals/{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

