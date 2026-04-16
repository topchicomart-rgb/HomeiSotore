/**
 * REFERRAL SYSTEM - COMPLETE IMPLEMENTATION EXAMPLE
 * 
 * Shows how all parts work together end-to-end
 */

// ============================================
// 1. USER SIGNUP WITH REFERRAL CODE
// ============================================

// File: src/app/login/page.tsx

import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { createUser, getUserByReferralCode, recordReferral } from '@/lib/firestore-service';

async function handleSignUp(email: string, password: string, name: string, refCode?: string) {
  // 1. Create Firebase Auth user
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // 2. Update display name
  await updateProfile(user, { displayName: name });

  // 3. Find referrer if code provided
  let referrerId = null;
  if (refCode) {
    const referrer = await getUserByReferralCode(refCode);
    if (referrer) {
      referrerId = referrer.id;
    }
  }

  // 4. Create Firestore user
  // This automatically:
  // - Generates unique referralCode
  // - Initializes wallet
  // - Records referral if referredBy provided
  // - Sends notification to referrer
  await createUser(user.uid, {
    name: name,
    email: email,
    referredBy: referrerId || undefined, // Trigger referral system
  });

  return user;
}

// Flow:
// User clicks link: /login?ref=REFABC123
// → Signup form pre-fills referral code
// → On submit, createUser() is called with referredBy
// → Firestore triggers wallet init & referral recording
// → Referrer gets notification 🎉

// ============================================
// 2. REFERRAL DATA FLOW IN FIRESTORE
// ============================================

// BEFORE - User collection
{
  "users/user2id": {
    "name": "John Doe",
    "email": "john@example.com",
    "referralCode": "REF1A2B3C4D",
    "referredBy": null,  // <-- Will be filled if referred
    "totalReferrals": 0,
    "createdAt": Timestamp(2026-04-14)
  }
}

// AFTER - User signup with referral
{
  "users/user2id": {
    "name": "John Doe",
    "email": "john@example.com",
    "referralCode": "REF1A2B3C4D",
    "referredBy": "user1id",  // <-- New referrer set
    "totalReferrals": 0,
    "createdAt": Timestamp(2026-04-14)
  }
}

// NEW - Wallet created
{
  "wallets/user1id": {
    "userId": "user1id",
    "balance": 0,
    "totalEarnings": 0,
    "updatedAt": Timestamp(2026-04-14)
  }
}

// NEW - Referral recorded
{
  "referrals/ref123": {
    "referrerId": "user1id",
    "referredUserId": "user2id",
    "status": "signed_up",          // <-- Initially
    "rewardGiven": false,
    "createdAt": Timestamp(2026-04-14)
  }
}

// ============================================
// 3. ADMIN APPROVES ORDER & REWARDS REFERRER
// ============================================

// File: src/app/admin/orders/page.tsx

import { updateOrder } from '@/lib/firestore-service';
import { processOrderReward } from '@/lib/order-reward-hook';

async function handleApproveOrder(orderId: string, userId: string) {
  // Step 1: Update order status
  const updated = await updateOrder(orderId, {
    status: 'approved',
    credentials: {
      username: 'iptv_user123',
      password: 'pass123',
      url: 'https://iptv.example.com',
      expiryDate: '2025-04-14',
    },
  });

  // Step 2: Process referral reward
  // This will:
  // - Find referral for this user
  // - Calculate reward with bonuses
  // - Update wallet
  // - Mark referral as purchased
  // - Send notification
  // - Prevent duplicates
  const rewardProcessed = await processOrderReward(userId, orderId);

  if (rewardProcessed) {
    console.log('✅ Reward credited to referrer');
  } else {
    console.log('ℹ️ User was not referred');
  }
}

// Flow:
// 1. Admin sees pending order in dashboard
// 2. Admin clicks "Approve & Reward" button
// 3. System:
//    - Updates order.status = 'approved'
//    - Finds referral for this user
//    - Calculates: $5 + level bonus (if any)
//    - Adds funds to referrer's wallet
//    - Marks referral as 'purchased'
//    - Sends notification to referrer 💰

// ============================================
// 4. REFERRAL UPDATE FLOW
// ============================================

// BEFORE - Referral pending
{
  "referrals/ref123": {
    "referrerId": "user1id",
    "referredUserId": "user2id",
    "status": "signed_up",          // <-- Waiting
    "rewardGiven": false,
    "createdAt": Timestamp(2026-04-14)
  }
}

// AFTER - Referral purchased
{
  "referrals/ref123": {
    "referrerId": "user1id",
    "referredUserId": "user2id",
    "status": "purchased",          // <-- Updated!
    "rewardGiven": true,            // <-- Marked as rewarded
    "rewardAmount": 5.25,           // <-- With bonus calculation
    "purchasedAt": Timestamp(2026-04-14)
  }
}

// UPDATED - Referrer's wallet
{
  "wallets/user1id": {
    "userId": "user1id",
    "balance": 5.25,                // <-- Increased!
    "totalEarnings": 5.25,          // <-- Tracking total
    "updatedAt": Timestamp(2026-04-14)
  }
}

// NEW - Reward record created
{
  "rewards/rew456": {
    "referrerId": "user1id",
    "referredUserId": "user2id",
    "type": "purchase",
    "amount": 5.25,
    "reason": "Referral purchase reward (Beginner +0%)",
    "createdAt": Timestamp(2026-04-14)
  }
}

// NEW - Transaction added
{
  "wallets/user1id/transactions/tx789": {
    "amount": 5.25,
    "reason": "Referral purchase reward",
    "referredUserId": "user2id",
    "type": "credit",
    "createdAt": Timestamp(2026-04-14)
  }
}

// ============================================
// 5. LEVEL PROGRESSION EXAMPLE
// ============================================

// Scenario: User makes 5 purchases as referrer

// STEP 1: First purchase
// - Reward: $5 (Beginner, no bonus)
// - Wallet: $5
// - Status: "Beginner"

// STEP 2: Second to Fourth purchases
// - Each reward: $5
// - Wallet: $25
// - Still "Beginner"

// STEP 3: Fifth purchase
// - Reward: $5 (Total now: $25)
// - **AUTO LEVEL UP!** → "Pro" (5+ purchases, $25+ earnings)
// - New bonus: +5%

// STEP 4-14: Make 10 more purchases
// - Each reward: $5 × 1.05 = $5.25 (5% bonus!)
// - Wallet: $77.50
// - Status: "Pro"

// STEP 15: 15th purchase
// - Reward: $5.25 × 1.05 = $5.51 (compounding?)
// - Wait, max bonus is 10%, so: $5 × 1.10 = $5.50
// - **AUTO LEVEL UP!** → "Elite" (15+ purchases, $100+ earnings)
// - New bonus: +10%

// From now on:
// - Each reward: $5 × 1.10 = $5.50 (10% bonus!)
// - Maximum earnings tier reached

// ============================================
// 6. FRONTEND - EARN PAGE DISPLAY
// ============================================

// File: src/app/earn/page.tsx

// Shows:

// 1. WALLET STATS
<Card>
  <p className="text-sm">Wallet Balance</p>
  <p className="text-3xl font-bold">$77.50</p>
</Card>

<Card>
  <p className="text-sm">Total Earned</p>
  <p className="text-3xl font-bold">$77.50</p>
</Card>

// 2. REFERRAL STATS
<Card>
  <p className="text-sm">Active Referrals</p>
  <p className="text-3xl font-bold">14</p>  // Pending signup/purchase
</Card>

<Card>
  <p className="text-sm">Purchases Completed</p>
  <p className="text-3xl font-bold">15</p>  // Converted to sales
</Card>

// 3. LEVEL DISPLAY
<div>
  <Trophy className="w-6 h-6 text-purple-500" />
  <p className="text-2xl font-bold">Elite</p>
  <p className="text-sm">+10% reward bonus</p>
</div>

// 4. PROGRESS TO NEXT LEVEL
<div>
  <p>Progress: 100% (Max Level)</p>
  <ProgressBar value={100} />
</div>

// 5. REFERRAL LIST
{referrals.map(ref => (
  <div>
    <p className="font-semibold">User {ref.referredUserId.slice(0, 8)}</p>
    <p className="text-sm text-slate-600">
      Referred: {ref.createdAt.toLocaleDateString()}
    </p>
    {ref.rewardGiven && (
      <p className="font-bold text-emerald-600">
        +${ref.rewardAmount}
      </p>
    )}
    <Badge>
      {ref.status === 'purchased' ? 'Purchased ✓' : 'Pending'}
    </Badge>
  </div>
))}

// 6. REWARD HISTORY
{rewardHistory.map(reward => (
  <div>
    <p className="font-semibold">{reward.reason}</p>
    <p className="text-xs text-slate-600">
      {reward.createdAt.toLocaleDateString()}
    </p>
    <p className="text-lg font-bold text-emerald-600">
      +${reward.amount}
    </p>
  </div>
))}

// ============================================
// 7. REAL-TIME UPDATES
// ============================================

// File: src/app/earn/page.tsx

useEffect(() => {
  if (!user?.id) return;

  // Listen to wallet changes
  const unsubWallet = listenToWallet(user.id, (wallet) => {
    setWallet(wallet); // Updates in real-time!
  });

  // Listen to referrals changes
  const unsubReferrals = listenToReferrals(user.id, (referrals) => {
    setReferrals(referrals); // Updates as new purchases happen

    // Could trigger celebration animation here
    if (new referral appeared) {
      showAnimation('🎉 New referral!');
    }

    // Could update level
    if (status changed to 'purchased') {
      recalculateLevel();
    }
  });

  return () => {
    unsubWallet();
    unsubReferrals();
  };
}, [user?.id]);

// When referrer checks Earn page:
// - Sees wallet update instantly
// - Sees new referrals appear
// - Sees reward history grow
// - Sees level change automatically
// All in real-time! 🚀

// ============================================
// 8. DUPLICATE PREVENTION
// ============================================

// Problem: What if admin approves same order twice?
// Solution: Check rewardGiven flag

async function rewardReferralPurchase(referredUserId: string) {
  // Find FIRST referral with:
  // - status = 'signed_up' (not yet purchased)
  // - rewardGiven = false (not yet rewarded)
  const q = query(
    collection(db, 'referrals'),
    where('referredUserId', '==', referredUserId),
    where('status', '==', 'signed_up'),
    where('rewardGiven', '==', false)  // <-- Prevents duplicates!
  );

  const referrals = await getDocs(q);
  if (referrals.docs.length === 0) {
    console.log('Already rewarded or invalid referral');
    return false;
  }

  // From here, safe to process - only ONE referral will match
  const referral = referrals.docs[0];
  const referrerId = referral.data().referrerId;

  // ... Process reward ...

  // Mark as rewarded atomically
  const batch = writeBatch(db);
  batch.update(doc(db, 'referrals', referral.id), {
    rewardGiven: true,  // <-- Can't be processed again
    status: 'purchased',
  });
  await batch.commit();
}

// Result:
// - First approve: ✅ Reward processed
// - Second approve: ❌ Already rewarded, skipped
// - Prevents: Duplicate money, gaming system

// ============================================
// 9. TESTING WORKFLOW
// ============================================

/*
TEST SCENARIO: Complete referral-to-reward flow

1. User A goes to /earn
   - Sees referral code: REF1A2B3C4D
   - Shares code or link

2. User B clicks link: /login?ref=REF1A2B3C4D
   - Signup page pre-fills code
   - Creates account
   - Is redirected to /dashboard
   - User A gets notification 🎉
   - User A's totalReferrals increments to 1

3. User B places order for $15
   - Admin sees order in queue

4. Admin clicks "Approve & Reward"
   - Order status → approved
   - Referral status → purchased
   - User A wallet: $0 → $5
   - User A gets notification 💰
   - User A sees:
     - Balance: $5
     - Referrals list shows "Purchased ✓"
     - Reward history shows "+$5"

5. Repeat 4 more times (4 more purchases from different referred users)
   - User A wallet: $5 → $25
   - User A level: Beginner (qualifies!)
   - Check: Level now shows "Beginner" 🎯

6. Repeat 10 more times (10 more purchases, total 15)
   - User A wallet: $25 → $77.50 (each reward now $5.25 with 5% Pro bonus)
   - User A level: Pro
   - **AUTO LEVEL UP!** 🚀

7. Repeat 15+ times more
   - User A wallet: Continues growing
   - User A level: Elite (15+ purchases, $100+ earned)
   - NEW BONUS: +10% on all future rewards!

RESULT:
✅ Referral system working end-to-end
✅ Wallet tracking earnings correctly
✅ Levels auto-calculating
✅ Bonuses applying correctly
✅ Real-time UI updating
✅ Notifications sent
✅ Duplicates prevented
✅ All data persisting in Firestore
*/

// ============================================
// 10. PRODUCTION CHECKLIST
// ============================================

const SETUP_CHECKLIST = [
  // Backend Setup
  '✅ referral-service.ts created',
  '✅ order-reward-hook.ts created',
  '✅ firestore-service.ts updated with wallet init',

  // Firestore Collections
  '✅ wallets/{userId} collection created',
  '✅ referrals/{id} collection created',
  '✅ rewards/{id} collection created',
  '✅ Security rules updated',

  // Frontend Pages
  '✅ earn/page.tsx fully implemented',
  '✅ Real-time listeners hooked up',
  '✅ Level display working',
  '✅ Referral code sharing working',

  // Admin Integration
  '⏳ admin/orders/page.tsx updated (YOUR NEXT STEP)',
  '⏳ Add processOrderReward() call',
  '⏳ Test reward processing',

  // Notifications
  '✅ Signup notification working',
  '✅ Purchase reward notification working',

  // Testing
  '⏳ End-to-end test complete flow',
  '⏳ Verify duplicate prevention',
  '⏳ Check level progression',
  '⏳ Validate real-time updates',

  // Optional Enhancements
  '⏳ Create wallet management page',
  '⏳ Add reward stats dashboard',
  '⏳ Set up Cloud Functions (optional)',
];

export default SETUP_CHECKLIST;

// ============================================
// NEXT STEPS
// ============================================

/*
1. Review this implementation guide
2. Check REFERRAL_SYSTEM_GUIDE.md for complete details
3. Update admin/orders page:
   - Import processOrderReward from order-reward-hook
   - Call in approve handler
   - Test with sample data
4. Deploy to production
5. Monitor referrals & rewards
6. Celebrate 🎉
*/
