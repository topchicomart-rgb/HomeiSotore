# 🧪 Complete Testing Guide - Real Notification + Referral System

## Prerequisites

Before testing, ensure:

1. ✅ Firebase Firestore is set up
2. ✅ Firebase Authentication is working
3. ✅ You have at least 2 test user accounts
4. ✅ Browser developer console is open to watch logs

---

## Test Scenario: Complete Referral Flow

### Setup

**Test User A (Referrer):**
- Email: `referrer@test.com`
- Has a referral code (e.g., `REF_USERB_12345`)
- Will be watching the Earn page

**Test User B (Referred):**
- Email: `referred@test.com`
- Will sign up using User A's code
- Will buy an IPTV subscription
- Will trigger the entire workflow

---

## Step 1: Verify User A's Referral Code

**On Earn Page (logged in as User A):**

1. Click **"Your Referral Code"** card
2. Verify:
   - ✅ Referral code is displayed
   - ✅ Copy button works
   - ✅ Share button works (on mobile)
3. Expected stats:
   - Total Referrals: 0
   - Just Joined: 0
   - Purchased: 0
   - Earned: ₹0

**In browser console:**
```
📊 Loaded 0 referrals
```

---

## Step 2: User B Signs Up With Code

**On Login/Signup Page (using incognito window as User B):**

1. Signup with email: `referred@test.com`
2. During signup, enter User A's code: `REF_USERB_12345`
   - Or apply after signup in wallet page
3. Verify:
   - ✅ Code accepted
   - ✅ Referral created in Firestore

**Check Firestore (Firebase Console):**
- Navigate to: `Firestore > referrals/`
- Should see new document with:
  ```
  referrerUid: "USER_A_UID"
  referredUid: "USER_B_UID"
  purchasedPlan: false
  status: "joined"
  joinedAt: [now]
  ```

**On User A's Earn Page (should update in real-time!):**
```
Total Referrals: 1
Just Joined: 1
Purchased: 0
Earned: ₹0
```

You should see User B listed as "⏳ Waiting for purchase..."

---

## Step 3: Check Notification

**User A should see notification:**

Click bell icon → should show:
```
🎯 New Referral!
referred@test.com joined using your referral code!
```

**In browser console:**
```
✅ Notification created: [notificationId]
📬 Loaded 1 active notifications
```

---

## Step 4: User B Buys Subscription

**As User B (in incognito window):**

1. Go to **IPTV page**
2. Select:
   - Device: Smart TV
   - Plan: 12 months
   - Payment Method: Any (Stripe, PayPal, etc.)
3. Complete payment
4. Click "Confirm Order"

**In browser console (User B):**
```
✅ Referral marked as purchased: [referralId]
✅ Notification created: [orderId]
```

**In Firestore, check `referrals/[referralId]`:**
```
purchasedPlan: true    ← CHANGED!
purchasedAt: [now]
status: "purchased"
```

---

## Step 5: Watch Real-Time Update (THE MAGIC!)

**Immediately (no page refresh needed), User A's Earn page should update:**

```
Total Referrals: 1
Just Joined: 0          ← Changed from 1
Purchased: 1            ← Changed from 0
Earned: ₹5              ← Now shows reward
```

**The referral card now shows:**
- Status: ✅ Purchased! Claim your reward
- Button: **"💰 Claim ₹5"** (instead of "Waiting...")
- Reward amount: +₹5

**User A receives notification:**
```
💰 Reward Earned!
referred@test.com made a purchase!
You earned ₹5 commission
```

**In browser console (User A):**
```
📊 Loaded 1 referrals
⚠️ Notification listener error - maintaining current state
✅ Loaded [count] active notifications
```

---

## Step 6: Claim the Reward

**As User A:**

1. On Earn page, click **"Claim ₹5"** button
2. Should show loading spinner briefly
3. Button changes to **"Claimed"** status

**In browser console (User A):**
```
✅ Reward claimed: ₹5 added to wallet
```

**In Firestore, check `referrals/[referralId]`:**
```
rewardClaimed: true     ← CHANGED!
claimedAt: [now]
status: "claimed"
```

**Check `users/USER_A_UID`:**
```
usableBalance: [previous] + 5   ← Increased by 5!
```

**Check `users/USER_A_UID/walletHistory/`:**
New document should show:
```
type: "referral_reward"
amount: 5
description: "Referral reward from referred@test.com purchase"
createdAt: [now]
balanceBefore: [old]
balanceAfter: [new]
```

**User A receives notification:**
```
✨ [Wallet Update]
₹5 added from referral reward
```

---

## Step 7: Verify Notification Persistence

**As User A:**

1. On Earn page, click **Bell icon** (notifications)
2. Should see all notifications:
   - 🎯 New Referral (from step 3)
   - 💰 Reward Earned (from step 5)
   - ✨ Wallet Update (from step 6)
3. Click **"Mark as read"** on one notification
   - Unread count decreases
   - Notification is still visible
4. Click **"Delete"** on one notification
   - It disappears from list
5. **Refresh page (F5)**
   - Notifications still there! (persisted in Firestore)
   - Delete one hasn't returned

---

## Verification Checklist

### Notifications System
- [ ] Notifications appear instantly (real-time)
- [ ] Notifications persist after page refresh
- [ ] "Mark as read" works and decreases unread count
- [ ] "Delete" removes notification
- [ ] Deleted notifications don't come back after refresh
- [ ] No auto-hide or timeout
- [ ] No duplicate notifications

### Referral System
- [ ] Referral created when User B signs up with code
- [ ] Status shows "⏳ Waiting..." initially
- [ ] Status instantly updates to "Claim ₹5" when purchase happens
- [ ] No page refresh needed for status update
- [ ] "Claim ₹5" button appears only when purchased
- [ ] "Claim ₹5" button disabled during claim process
- [ ] "Claimed" status shown after claim succeeds

### Reward System
- [ ] Reward amount (₹5) shows in referral card
- [ ] Wallet balance increases by ₹5 after claim
- [ ] Wallet history record created
- [ ] Can't claim twice (button shows "Claimed")
- [ ] Transaction is atomic (all or nothing)

### Real-Time Updates
- [ ] Stats update without page refresh
- [ ] Referral status changes instantly in list
- [ ] Unread count updates without refresh
- [ ] Earn page shows correct button state immediately

---

## 🐛 Debugging

### If notifications don't appear:
1. Check browser console for errors
2. Verify Firestore security rules allow creating notifications
3. Check permissions for `users/{uid}/notifications/{notificationId}`

**Expected permission entry:**
```
allow create: if request.auth != null;
allow read, update: if request.auth.uid == resource.data.userId;
```

### If "Claim ₹5" button never appears:
1. Check Firestore `referrals/{id}` - is `purchasedPlan` set to `true`?
2. Check browser console for errors when claiming
3. Verify `claimReferralReward()` function is being called

### If stats don't update:
1. Open Firestore console
2. Manually refresh the `referrals` collection
3. Check if `listenToMyReferrals()` is subscribed

**In browser console:**
```
console.log('Referrals:', referrals);
console.log('Stats:', stats);
```

### If Firestore shows "requires index" error:
1. Click the link in the error message
2. Firebase console will offer to create the index
3. Click "CREATE INDEX"
4. Wait 2-5 minutes for it to build
5. Refresh browser after index is ready

---

## 🎯 Expected Console Logs

**User A (Referrer) Console:**

```
// When earn page loads
📊 Loaded 0 referrals

// When User B signs up with code
📊 Loaded 1 referrals
📬 Loaded 1 active notifications

// When User B purchases
📊 Loaded 1 referrals (from listener updating)
📬 Loaded 3 active notifications (new: Purchased, Wallet update)

// When claiming reward
✅ Reward claimed: ₹5 added to wallet
```

**User B (Referred) Console:**

```
// When creating order
✅ Referral marked as purchased: [id]
✅ Notification created: [notificationId]

// For order notifications
✅ Order created successfully
```

---

## Multiple Referrals Test

**To test with multiple referrals:**

1. Create User C, User D, etc.
2. Each signs up with User A's code
3. Earn page should show:
   - Total Referrals: 3 (or however many)
   - Each with their own status
4. Only those who purchased show "Claim ₹5"
5. Stats show correct counts

---

## Edge Cases to Test

### 1. Try to claim twice
- After claiming, button shows "Claimed"
- Clicking should do nothing (button disabled)
- ✅ Prevents double-claiming with transaction

### 2. Delete notification, refresh page
- Notification stays deleted
- ✅ Soft delete works

### 3. Multiple browsers logged in as same user
- Updates appear in both
- ✅ Real-time listener syncs across instances

### 4. Slow network
- Claim button shows loading state
- Transaction either succeeds or fails (not half-done)
- ✅ Transaction safety works

---

## 📊 Success Metrics

✅ **System is working correctly if:**

1. No temporary demo logic
2. All data persists in Firestore
3. Real-time listeners update UI without refresh
4. Notifications don't auto-delete
5. Referral status changes instantly
6. "Claim ₹5" button appears/disappears correctly
7. Wallet balance actually increases
8. No duplicate notifications or claims
9. Works after page refresh (persistence)
10. Works across multiple browser windows

---

## 🎉 Complete!

If all tests pass, you have a **production-ready notification and referral system** with:
- ✅ Real Firestore persistence
- ✅ Real-time listeners
- ✅ Transaction safety
- ✅ No demo code
- ✅ Proper state management
- ✅ Cross-session persistence
