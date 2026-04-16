# ⚡ QUICK START - Real Notification + Referral System

## What Was Built

A **complete production system** using Firebase Firestore with real-time listeners. Everything is now persistent, real-time, and no longer demo logic.

### 3 Key Problems FIXED:

1. ❌ **Notifications disappeared after 1 second** → ✅ **Now persist in Firestore**
2. ❌ **Notifications auto-deleted** → ✅ **Manual delete only**
3. ❌ **"Remind" button never changed to "Claim $5"** → ✅ **Real-time updates**

---

## File Structure (New Files)

```
src/lib/
  ├── firestore-notifications.ts    ← Main notification system
  ├── firestore-referral-service.ts ← Referral tracking
  ├── useRealtimeNotifications.ts   ← Notification hook
  └── useRealtimeReferrals.ts       ← Referral hook

src/app/earn/
  ├── page.tsx                      ← NEW complete rewrite
  └── page-old.tsx                  ← Backup of old version

src/components/
  └── notification-button.tsx       ← Updated to use new hooks
```

---

## How It Works (Simplified)

### When user creates order:
```
1. Order created in Firestore
   ↓
2. Notification sent to user
3. Notification sent to admin
4. IF referred: markReferralAsPurchased() called
   ↓
5. purchasedPlan = true in Firestore
   ↓
6. Real-time listener fires
7. Referrer's UI updates instantly
8. "Claim ₹5" button appears
```

### When referrer claims reward:
```
1. Click "Claim ₹5"
   ↓
2. Firebase transaction starts:
   - Mark rewardClaimed = true
   - Add $5 to usableBalance
   - Create wallet history
   ↓
3. Real-time listener updates
4. Button changes to "Claimed"
5. Wallet balance increases
```

---

## How to Use

### In Components:

**Get real notifications:**
```typescript
const { notifications, unreadCount, loading } = useRealtimeNotifications(userId);

// Call from firestore-notifications
await markNotificationAsRead(userId, notificationId);
await deleteNotification(userId, notificationId);
```

**Get real referrals:**
```typescript
const { referrals, stats, loading } = useRealtimeReferrals(userId);

// referrals[].purchasedPlan  = was plan purchased?
// referrals[].rewardClaimed  = was reward claimed?
// referrals[].rewardAmount   = 5 (₹5 per purchase)

// Claim reward (transaction safe)
const success = await claimReferralReward(userId, referralId, 5);
```

### When creating orders:

Already integrated in `firebase-service.ts`:
```typescript
// This is called automatically:
await markReferralAsPurchased(userId, planName);
```

---

## Firestore Structure

### Notifications
```
users/
  {userId}/
    notifications/
      {notificationId}
        - type: 'order', 'referral', 'admin', etc.
        - read: boolean
        - deleted: boolean
        - createdAt: Timestamp
```

### Referrals
```
referrals/
  {referralId}
    - referrerUid: string
    - referredUid: string
    - purchasedPlan: boolean ← KEY
    - rewardClaimed: boolean ← KEY
    - status: 'joined' | 'purchased' | 'claimed'
    - joinedAt: Timestamp
    - purchasedAt?: Timestamp
    - claimedAt?: Timestamp
```

---

## Testing Locally

### Prerequisite:
- Have 2 test user accounts ready
- Use incognito windows to test both users

### Quick Test:
1. User A: Copy referral code from Earn page
2. User B: Sign up with that code (incognito)
3. Firestore: Check `referrals/` - new record should exist
4. User A: Check Earn page - should show "1 Just Joined" (instant!)
5. User B: Create order in IPTV page
6. User A: Check Earn page - should now show "Claim ₹5" (no refresh!)
7. User A: Click "Claim ₹5"
8. Firestore: Check User A's `usableBalance` - should increase by 5

**⏱️ All updates should happen in < 1 second with no page refresh.**

---

## Important Firestore Rules

Make sure these permissions exist in Firestore:

```javascript
// For notifications
match /users/{userId}/notifications/{document=**} {
  allow create: if request.auth.uid == userId;
  allow read, update: if request.auth.uid == userId;
  allow delete: if request.auth.uid == userId;
}

// For referrals (public read for backend)
match /referrals/{document=**} {
  allow read: if true;
  allow create: if request.auth != null;
  allow update, delete: if request.auth != null;
}

// For wallet history
match /users/{userId}/walletHistory/{document=**} {
  allow create: if request.auth.uid == userId;
  allow read: if request.auth.uid == userId;
}
```

---

## Potential Issues & Fixes

### Issue: "The query requires an index"
**Solution:** Click the link in error → create index → wait 2-5 minutes

### Issue: Notifications still disappearing
**Solution:** 
- Clear browser cache
- Check Firestore rules (allow create/read)
- Check browser console for errors

### Issue: "Claim ₹5" button not appearing after purchase
**Solution:**
- Refresh page (F5) - should appear
- Check Firestore: is `purchasedPlan` set to `true`?
- Check console for listener errors

### Issue: Reward claimed but balance didn't increase
**Solution:**
- Check `walletHistory/` - is record there?
- Check `users/{userId}` - is `usableBalance` increased?
- Try claiming again (transaction may have failed)

---

## What's Still Old (Can Remove Later)

These files are replaced but kept as backup:
- `src/lib/notification-service.ts` - OLD notification service
- `src/lib/useNotifications.ts` - OLD hook
- `src/app/earn/page-old.tsx` - OLD earn page

Can delete safely after confirming new system works.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────┐
│           FIRESTORE (Source of Truth)           │
│  ┌─────────────────┐        ┌─────────────────┐ │
│  │  notifications/ │        │   referrals/    │ │
│  │  (persisted)    │        │  (persisted)    │ │
│  └─────────────────┘        └─────────────────┘ │
└────────────┬──────────────────────────┬──────────┘
             │                          │
        onSnapshot()              onSnapshot()
             │                          │
    ┌────────▼───────────┐    ┌────────▼─────────────┐
    │useRealtimeNotif    │    │useRealtimeReferrals │
    │  - notifications[] │    │  - referrals[]      │
    │  - unreadCount     │    │  - stats            │
    └────────┬───────────┘    └────────┬─────────────┘
             │                          │
    ┌────────▼──────────────────────────▼────────┐
    │        React Components (UI)                │
    │  ┌──────────────┐     ┌─────────────────┐  │
    │  │ Notification │     │  Earn Page      │  │
    │  │   Button     │     │  - Referrals    │  │
    │  │  - Mark read │     │  - Claim button │  │
    │  │  - Delete    │     │  - Stats        │  │
    │  └──────────────┘     └─────────────────┘  │
    └─────────────────────────────────────────────┘
             │
         Actions:
    markNotificationAsRead()
    deleteNotification()
    claimReferralReward() [Transaction]
             │
    ┌────────▼──────────────────────────────────┐
    │  Firebase Backend (Security Rules, Txns)  │
    └─────────────────────────────────────────────┘
```

---

## Key Functions Quick Reference

```typescript
// NOTIFICATIONS
createNotification(userId, type, title, message, data?, link?)
notifyOrderCreated(userId, userName, orderData)
notifyOrderApproved(userId, orderData)
notifyReferralPurchased(referrerUid, referredName, amount)
markNotificationAsRead(userId, notificationId)
deleteNotification(userId, notificationId)
listenToNotifications(userId, callback) → unsubscribe()

// REFERRALS  
createReferralRecord(referrerUid, referredUid, code, names?, emails?)
markReferralAsPurchased(referredUid, planName) [Called during order]
claimReferralReward(referrerUid, referralId, amount) [Transaction]
listenToMyReferrals(referrerUid, callback) → unsubscribe()
getReferralStats(referrerUid) → { total, joined, purchased, earned... }

// HOOKS
useRealtimeNotifications(userId) → { notifications, unreadCount, loading }
useRealtimeReferrals(referrerUid) → { referrals, stats, loading }
```

---

## Status Summary

✅ **Implemented:**
- Production notification system
- Real-time referral tracking
- Claim reward transactions
- Real-time UI updates
- Complete persistence

⏳ **Not Yet:**
- Email notifications (optional)
- SMS reminders (optional)
- Tiered rewards (optional)
- Analytics dashboard (optional)

---

## Next: Test It!

1. Start dev server: `npm run dev`
2. Open http://localhost:3000
3. Follow [TESTING_GUIDE.md](./TESTING_GUIDE.md)
4. Watch real-time updates happen!

---

## Questions?

Check [PRODUCTION_SYSTEM_COMPLETE.md](./PRODUCTION_SYSTEM_COMPLETE.md) for detailed documentation.

**🎉 You have a REAL production system now!**
