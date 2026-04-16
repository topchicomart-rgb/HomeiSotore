# Referral Reward System - Complete Documentation

## Overview

A production-ready referral reward system for PrimexStream Pro with:
- Wallet management
- Tiered rewards (Signup & Purchase)
- Referral level progression (Beginner → Pro → Elite)
- Reward history tracking
- Duplicate prevention via Firestore transactions

---

## 1. FIRESTORE SCHEMA

### Collections Structure

```
firestore/
├── users/{userId}
│   ├── id: string
│   ├── name: string
│   ├── email: string
│   ├── referralCode: string (unique)
│   ├── referredBy: string (optional, userId of referrer)
│   ├── totalReferrals: number
│   ├── createdAt: Timestamp
│   └── credits: number (optional)
│
├── wallets/{userId}
│   ├── userId: string
│   ├── balance: number ($)
│   ├── totalEarnings: number ($)
│   ├── updatedAt: Timestamp
│   └── transactions/{transactionId}
│       ├── amount: number
│       ├── reason: string
│       ├── type: 'credit' | 'debit'
│       └── createdAt: Timestamp
│
├── referrals/{referralId}
│   ├── referrerId: string
│   ├── referredUserId: string
│   ├── status: 'signed_up' | 'purchased'
│   ├── rewardGiven: boolean
│   ├── rewardAmount: number (optional)
│   ├── createdAt: Timestamp
│   └── purchasedAt: Timestamp (optional)
│
├── rewards/{rewardId}
│   ├── referrerId: string
│   ├── referredUserId: string
│   ├── type: 'signup' | 'purchase'
│   ├── amount: number
│   ├── reason: string
│   └── createdAt: Timestamp
│
└── orders/{orderId} (existing)
    ├── status: 'pending' | 'approved' | 'rejected' | etc.
    └── ... (other fields)
```

### Firestore Security Rules

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read their own wallet
    match /wallets/{userId} {
      allow read: if request.auth.uid == userId;
      allow write: if false; // Only backend can write
    }

    // Users can read their own referrals
    match /referrals/{document=**} {
      allow read: if request.auth.uid == resource.data.referrerId || 
                     request.auth.uid == resource.data.referredUserId;
      allow write: if false; // Only backend can write
    }

    // Users can read their own rewards
    match /rewards/{document=**} {
      allow read: if request.auth.uid == resource.data.referrerId;
      allow write: if false; // Only backend can write
    }

    // Users can read their own profile
    match /users/{userId} {
      allow read: if request.auth.uid == userId;
      allow write: if false; // Handled via Cloud Functions
    }
  }
}
```

---

## 2. REWARD CONFIGURATION

Located in `src/lib/referral-service.ts`:

```typescript
// Reward amounts
const REWARD_CONFIG = {
  SIGNUP: 2,    // $2 for signup
  PURCHASE: 5,  // $5 for purchase
};

// Referral levels
const REFERRAL_LEVELS = [
  { level: 'Beginner', minReferrals: 0, minEarnings: 0, bonus: 0 },
  { level: 'Pro', minReferrals: 5, minEarnings: 25, bonus: 5 },
  { level: 'Elite', minReferrals: 15, minEarnings: 100, bonus: 10 },
];
```

**Interpretation:**
- **Beginner**: Default level, no bonus
- **Pro**: 5+ purchases + $25+ earnings = +5% bonus on all rewards
- **Elite**: 15+ purchases + $100+ earnings = +10% bonus on all rewards

---

## 3. CORE FUNCTIONS

### Referral Service (`src/lib/referral-service.ts`)

#### Wallet Management

```typescript
// Initialize wallet for new user
initializeWallet(userId: string) → Promise<Wallet>

// Get current wallet
getWallet(userId: string) → Promise<Wallet | null>

// Listen to real-time wallet updates
listenToWallet(userId: string, callback) → unsubscribe function

// Add funds to wallet with transaction history
addToWallet(userId: string, amount: number, reason: string) → Promise<boolean>

// Get transaction history
getWalletHistory(userId: string) → Promise<any[]>
```

#### Referral Tracking

```typescript
// Record new referral (called on signup)
recordNewReferral(referrerId: string, referredUserId: string) → Promise<Referral>

// Mark referral as purchased and reward referrer
rewardReferralPurchase(referredUserId: string) → Promise<boolean>

// Get all referrals for a user
getReferralsForUser(referrerId: string) → Promise<Referral[]>

// Listen to referrals in real-time
listenToReferrals(referrerId: string, callback) → unsubscribe function
```

#### Referral Levels & Progress

```typescript
// Get user's current level
getUserReferralLevel(userId: string) → Promise<ReferralLevel>

// Get progress to next level with breakdown
getReferralLevelProgress(userId: string) → Promise<{
  currentLevel: ReferralLevel,
  nextLevel: ReferralLevel | null,
  progress: number (0-100),
  referralCount: number,
  earnings: number
}>
```

#### Statistics & History

```typescript
// Get reward records for a user
getRewardHistory(userId: string) → Promise<Reward[]>

// Get total referral stats
getReferralStats(userId: string) → Promise<{
  totalReferrals: number,
  activeReferrals: number,
  completedPurchases: number,
  totalRewards: number
}>
```

---

## 4. INTEGRATION FLOW

### User Signup Flow

1. **Before**: User signs up via login page with referral code (if provided)
2. **In createUser()**: 
   - Generate unique referral code
   - Create wallet (automatic)
   - Record referral if `referredBy` provided
   - Send notification to referrer

```typescript
// In src/lib/firestore-service.ts - createUser()
await initializeWallet(userId);
if (userData.referredBy) {
  await recordNewReferral(userData.referredBy, userId);
}
```

### Purchase Approval Flow

1. **Admin approves order in admin panel**
2. **Call processOrderReward() function**:

```typescript
// In admin/orders/page.tsx
import { processOrderReward } from '@/lib/order-reward-hook';

const handleApproveOrder = async (orderId: string, userId: string) => {
  try {
    await updateOrder(orderId, { status: 'approved' });
    
    // Process referral reward
    await processOrderReward(userId, orderId);
    
    toast.success('Order approved and reward processed');
  } catch (error) {
    console.error('Error:', error);
    toast.error('Failed to approve order');
  }
};
```

3. **processOrderReward() will**:
   - Find referral for this user
   - Calculate reward with level bonus
   - Add funds to referrer wallet
   - Update referral status to 'purchased'
   - Send notification to referrer
   - Prevent duplicates via Firestore queries

---

## 5. UI PAGES

### Earn Page (`src/app/earn/page.tsx`)

Shows:
- **Wallet Stats**: Balance, Total Earnings
- **Referral Stats**: Active Referrals, Purchases Completed
- **User Level**: Current level with bonus%, next level progress
- **Referral Code**: With copy & share buttons
- **Referrals List**: All referrals with status
- **Reward History**: Transaction log
- **Info Cards**: Reward amounts and bonuses

Features:
- Real-time wallet & referral updates
- Copy to clipboard functionality
- Social share integration
- Responsive design
- Dark mode support

### Wallet Page (Recommended Enhancement)

```typescript
// src/app/wallet/page.tsx
- Display balance
- Transaction history
- Withdrawal requests (future)
- Referral breakdown
```

---

## 6. NOTIFICATIONS INTEGRATION

### Notification Types

**On Signup:**
```
Title: "🎉 New Referral!"
Message: "{UserName} signed up using your referral code!"
Type: 'referral'
```

**On Purchase:**
```
Title: "💰 Reward Earned!"
Message: "{UserName} made a purchase! You earned $X[+bonus%]"
Type: 'referral'
```

Using existing `sendNotification()` from `firebase-service.ts`:

```typescript
await sendNotification(referrerId, {
  title: '💰 Reward Earned!',
  message: `You earned $${amount}`,
  type: 'referral',
});
```

---

## 7. IMPLEMENTATION CHECKLIST

### Phase 1: Backend Setup ✅
- [x] Create `referral-service.ts`
- [x] Create `order-reward-hook.ts`
- [x] Update `firestore-service.ts` to initialize wallet on signup
- [x] Create Firestore collections (wallets, referrals, rewards)

### Phase 2: Frontend Setup ✅
- [x] Update Earn page with new UI
- [x] Add referral code display & sharing
- [x] Add wallet & level display
- [x] Add referral list & history

### Phase 3: Admin Integration
- [ ] Update admin/orders page to call `processOrderReward()`
- [ ] Add status indicator for reward processing
- [ ] Add referral stats to admin dashboard

### Phase 4: Enhancements (Optional)
- [ ] Create Wallet management page
- [ ] Add withdrawal request system
- [ ] Create referral analytics dashboard
- [ ] Add email notifications
- [ ] Create Cloud Functions for auto-rewards

---

## 8. EXAMPLE USAGE

### Initialize on User Signup

```typescript
// In login/page.tsx signup handler
const user = await createUserWithEmailAndPassword(auth, email, password);
await createUser(user.uid, {
  name: name,
  email: email,
  referredBy: referralCode || undefined, // From URL ?ref=
});
// Wallet auto-created, referral auto-recorded
```

### Approve Order with Reward

```typescript
// In admin/orders/page.tsx
const handleApproveOrder = async (order: Order) => {
  const success = await updateOrder(order.id, { status: 'approved' });
  if (success) {
    await processOrderReward(order.userId, order.id);
  }
};
```

### Display Referral Info

```typescript
// In src/app/earn/page.tsx (already implemented)
const referrals = await getReferralsForUser(user.id);
const wallet = await getWallet(user.id);
const level = await getUserReferralLevel(user.id);
```

---

## 9. DUPLICATE PREVENTION

System prevents duplicate rewards via:

1. **Firestore Queries**: Check existing referral before recording
```typescript
const existing = await getDocs(query(
  collection(db, 'referrals'),
  where('referrerId', '==', referrerId),
  where('referredUserId', '==', referredUserId)
));
if (existing.docs.length > 0) return null;
```

2. **Status Field**: Only reward once per referral
```typescript
// Find referrals with status='signed_up' and rewardGiven=false
where('status', '==', 'signed_up'),
where('rewardGiven', '==', false)
```

3. **Atomic Transactions**: Batch writes ensure consistency
```typescript
const batch = writeBatch(db);
batch.update(referralRef, { rewardGiven: true });
batch.update(walletRef, { balance: increment(amount) });
await batch.commit(); // All or nothing
```

---

## 10. TESTING CHECKLIST

### Manual Testing

```bash
# 1. Test signup with referral code
http://localhost:3000/login?ref=REF1234567890

# 2. Verify user data
- Check Firestore users collection
- Verify referralCode created
- Verify referredBy field

# 3. Verify wallet initialization
- Check Firestore wallets/{userId}
- Verify balance = 0, totalEarnings = 0

# 4. Test referral recording
- Check Firestore referrals collection
- Verify referral status = 'signed_up'
- Check notification sent to referrer

# 5. Test order approval reward
- Create order as referred user
- Approve order in admin panel
- Verify wallet balance increased
- Verify referral status = 'purchased'
- Check reward history

# 6. Test level progression
- Verify Beginner level displayed initially
- Create multiple referrals with purchases
- Watch level update to Pro/Elite
- Verify bonus % applied to new rewards
```

---

## 11. MONITORING & DEBUGGING

### Check Referral Flow
```typescript
// Query to find all referrals
db.collection('referrals')
  .where('referrerId', '==', 'USER_ID')
  .get()
```

### Check Wallet Transactions
```typescript
// Query to find all wallet transactions
db.collection('wallets')
  .doc('USER_ID')
  .collection('transactions')
  .orderBy('createdAt', 'desc')
  .get()
```

### Monitor Levels
```typescript
// Calculate user level manually
const referrals = getReferralsForUser(userId);
const purchased = referrals.filter(r => r.status === 'purchased').length;
// Level determined by: minReferrals ≤ purchased AND minEarnings ≤ earnings
```

---

## 12. ENVIRONMENT VARIABLES

No additional env vars required. Uses existing Firebase config from `firebase-config.ts`.

If adding optional features (email, analytics):
```env
NEXT_PUBLIC_ENABLE_EMAIL_REWARDS=true
NEXT_PUBLIC_ANALYTICS_TRACKING=true
```

---

## 13. FUTURE ENHANCEMENTS

### Level System Improvements
```typescript
// Add seasonal bonuses
{ level: 'Seasonal', minReferrals: 10, minEarnings: 50, bonus: 15, validUntil: Date }

// Add streak bonuses
trackReferralStreak(userId) // Bonus for consecutive referrals
```

### Withdrawal System
```typescript
// Create withdrawal requests
requestWithdrawal(userId, amount)
// Admin approves withdrawals
approveWithdrawal(withdrawalId)
// Track via withdrawals collection
```

### Analytics
```typescript
// Create analytics dashboard
getAggregatedStats() // Total rewards distributed, avg per user, etc.
getReferralChains() // Track 2nd-level referrals for viral growth
```

### Loyalty Tiers
```typescript
// Beyond money rewards
- Discount codes
- Premium features unlock
- Priority support
- Exclusive content access
```

---

## 14. TROUBLESHOOTING

| Issue | Solution |
|-------|----------|
| Wallet not created | Check `initializeWallet()` called in `createUser()` |
| Referral not recorded | Verify `referredBy` passed to `createUser()` |
| Reward not credited | Check admin called `processOrderReward()` |
| Level not updating | Verify purchases counted correctly (status='purchased') |
| Notifications not sent | Check `sendNotification()` implementation |
| Duplicate referrals | Check query filters for existing referrals |

---

## 15. API QUICK REFERENCE

```typescript
// Import
import {
  initializeWallet,
  getWallet,
  listenToWallet,
  addToWallet,
  getWalletHistory,
  
  recordNewReferral,
  rewardReferralPurchase,
  getReferralsForUser,
  listenToReferrals,
  
  getUserReferralLevel,
  getReferralLevelProgress,
  getRewardHistory,
  getReferralStats,
  
  type Referral,
  type Reward,
  type Wallet,
  type ReferralLevel,
} from '@/lib/referral-service';

// Use
const wallet = await getWallet(userId);
const referrals = await getReferralsForUser(userId);
const level = await getUserReferralLevel(userId);
const progress = await getReferralLevelProgress(userId);
```

---

## 16. FILE STRUCTURE

```
src/
├── lib/
│   ├── referral-service.ts          # Core referral logic
│   ├── order-reward-hook.ts         # Order approval integration
│   └── firestore-service.ts         # Updated for wallet initialization
│
├── app/
│   ├── earn/
│   │   └── page.tsx                 # Earn page with full UI
│   └── wallet/ (optional)
│       └── page.tsx                 # Wallet management page
│
└── components/
    └── providers/
        └── app-provider.tsx         # User context
```

---

## SUPPORT

For issues or questions:
1. Check existing referrals in Firestore
2. Monitor console logs for errors
3. Verify Cloud Function execution (if using)
4. Check Security Rules allow read/write
5. Test with Firestore emulator locally

---

**Last Updated**: April 2026  
**Version**: 1.0.0
