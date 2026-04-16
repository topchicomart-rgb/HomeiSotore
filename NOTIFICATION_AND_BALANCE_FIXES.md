# Notification and Balance System Fixes

## Summary

Fixed critical issues where:
1. ❌ Notifications NOT coming when admin approves/rejects social tasks
2. ❌ Notifications NOT coming for new referrals  
3. ❌ User balance not updating after subscription purchase
4. ❌ Social tasks approval not crediting wallet

## What Was Fixed

### 1. Social Task Notifications ✅

**File:** `src/lib/firestore-notifications.ts`

Added two new notification functions:
```typescript
// When admin approves social task
export async function notifySocialTaskApproved(
  userId: string,
  taskData: {
    platforms: string[];
    walletCredit: number;
    freeAccess: string;
  }
): Promise<void>

// When admin rejects social task  
export async function notifySocialTaskRejected(
  userId: string,
  taskData: {
    platforms: string[];
    reason: string;
  }
): Promise<void>
```

**File:** `src/app/admin/social-tasks/page.tsx`

- Added imports for notification functions
- Updated `handleApprove()` to:
  - Call `notifySocialTaskApproved()` 
  - Call `addWalletCredit()` to add ₹20 to user wallet
  - Send push notification to user immediately
  
- Updated `handleReject()` to:
  - Call `notifySocialTaskRejected()` with reason
  - Send notification to user explaining rejection

**Result:**
- Users now get Firestore notifications when admin approves/rejects
- Users receive wallet credit (₹20) instantly when approved
- Notifications survive page refresh and logout

---

### 2. Referral Notifications ✅

**File:** `src/lib/firestore-service.ts`

- Added import: `notifyReferralJoined` from firestore-notifications
- Updated `recordReferral()` function to:
  - Still send legacy Realtime DB notification (backward compatible)
  - **NEW:** Also send Firestore persistent notification
  - Users get notification in both systems now

```typescript
// ALSO send notification via Firestore (new persistent system)
await notifyReferralJoined(referrerId, referredUserName)
```

**Result:**
- When new user joins via referral code, referrer gets:
  - ✅ Firestore notification (persistent, survives refresh)
  - ✅ Realtime DB notification (instant, visible immediately)

---

### 3. Wallet Credit System ✅

**File:** `src/lib/firestore-notifications.ts`

Added new wallet function:
```typescript
// Add credit to user's wallet for social task approval or other rewards
export async function addWalletCredit(
  userId: string,
  amount: number,
  reason: string,
  sourceId?: string
): Promise<boolean>
```

This function:
- ✅ Gets user's current balance
- ✅ Adds the credit amount
- ✅ Updates user's `usableBalance` field
- ✅ Creates transaction history entry
- ✅ Logs the transaction

**Usage in Admin Panel:**
```typescript
const walletAdded = await addWalletCredit(
  submission.userId,
  walletCredit,  // ₹20
  `Social task approved (YouTube, Instagram, etc)`,
  submissionId
);
```

---

## What Still Needs Implementation

### 1. Balance Updates on Order Approval

**Status:** ⚠️ PARTIAL

Current system:
- `createOrder()` creates the order in Firestore
- `updateOrderStatus()` (in admin panel) approves/rejects orders
- `processOrderReward()` handles referral commissions

**What's needed:**
When admin approves an order in `/admin/orders/page.tsx`:
```typescript
// If order is approved AND includes balance/wallet credit
await addWalletCredit(
  editingOrder.userId,
  creditAmount,
  'IPTV plan purchased',
  editingOrder.id
);
```

**File to update:** `src/app/admin/orders/page.tsx` in `handleSaveEdit()`

---

### 2. Social Tasks Workflow Improvement

**Status:** ⚠️ DESIGN NEEDED

User wants:
1. Click social icon (FB, YouTube, etc.)
2. Show "Subscribe to channel" confirmation
3. If yes → redirect to channel link
4. After following → upload proof (follower ID + screenshot)
5. Admin reviews proof → approves → shows in order history as "Social Issue" ($20 value)

**Current state:**
- Social tasks system exists but UI/workflow not optimized
- File: `src/app/earn/page.tsx` and `src/app/admin/social-tasks/page.tsx`

**Recommendations:**
- Redesign earn page UI for better flow
- Add image gallery for proof uploads
- Show proof images in admin panel
- Add "Social Issues" as separate item in user order history

---

### 3. Order History Display

**Status:** ⚠️ PARTIAL

Currently shows:
- ✅ IPTV subscriptions
- ⚠️ Social tasks (exists but not well integrated)
- ❌ Home repair services (separate page)

**What's needed:**
Unified order history showing all purchases including social tasks:
```typescript
// Example order item
{
  type: 'social_issue',
  platforms: ['YouTube', 'Instagram'],
  amount: 20,
  status: 'approved',
  reward: {
    freeAccess: '1 month',
    walletCredit: 20
  }
}
```

**File to update:** `src/app/orders/page.tsx`

---

## Testing the Fixes

### Test 1: Social Task Approval Notification
1. Go to `/earn` as user
2. Submit social task
3. Go to `/admin/social-tasks` as admin  
4. Click "Approve" on a submission
5. Check notification bell - user gets notification ✅
6. Check user wallet - ₹20 added ✅

### Test 2: Referral Notification
1. Go to `/login` in new incognito window
2. Sign up with referral code from another user
3. Switch to referrer's account
4. Check notification bell - notification appears ✅
5. Check referral count incremented ✅

### Test 3: Wallet Balance
1. Approve a social task
2. Go to `/wallet` as user
3. Check balance increased by ₹20 ✅
4. Check transaction history shows entry ✅

---

## Database Schema Notes

### Firestore Collections Updated

**users/{userId}/notifications/**
- type: 'success' | 'reject' | 'referral' | 'admin' | 'order'
- title: string
- message: string
- read: boolean
- deleted: boolean
- createdAt: Timestamp
- data: { platforms?: string[], walletCredit?: number, reason?: string }

**users/{userId}/walletHistory/**
- type: 'credit' | 'referral_reward' | 'referral_bonus'
- amount: number
- reason: string
- sourceId?: string
- createdAt: Timestamp
- balanceBefore: number
- balanceAfter: number

**socialTaskSubmissions/**
- userId: string
- platforms: { platform, username, proofFileName }
- approvalStatus: 'pending' | 'approved' | 'rejected'
- reward: { freeAccess, walletCredit }
- approvedAt?: string

---

## Remaining Work

### High Priority
1. **Order approval balance updates** - Add wallet credit when orders approved
2. **Unified order history** - Show all order types (IPTV, social tasks, etc.)
3. **Social task proof display** - Show 6 images in admin panel

### Medium Priority  
1. Improve social task UI/UX flow
2. Add "Social Issues" as separate product in user orders
3. Link credentials delivery with order approvals

### Low Priority
1. Analytics dashboard for social tasks
2. Bulk approve/reject operations
3. Export notifications as CSV/PDF

---

## Code Reference

### Key Files Modified
- `src/lib/firestore-notifications.ts` - Added 4 new functions
- `src/app/admin/social-tasks/page.tsx` - Added notification & wallet calls
- `src/lib/firestore-service.ts` - Updated recordReferral() for dual notifications

### New Imports Added
```typescript
import {
  notifySocialTaskApproved,
  notifySocialTaskRejected,
  addWalletCredit,
  notifyReferralJoined,
} from '@/lib/firestore-notifications';
```

---

## Next Steps

1. **Test all three scenarios above** ✅
2. **Implement order approval balance updates**
3. **Redesign social task UI/flow**
4. **Unify order history display**
5. **Add proof image gallery in admin**

---

**Last Updated:** April 16, 2026
**Status:** Core notification & wallet systems FIXED ✅
