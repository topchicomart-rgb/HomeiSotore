# REFERRAL SYSTEM - VISUAL ARCHITECTURE GUIDE

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         PRIMEXSTREAM REFERRAL SYSTEM                │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                          USER FLOWS                                   │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  FLOW 1: SIGNUP WITH REFERRAL                                        │
│  ┌─────────────┐      ┌──────────────┐      ┌────────────────┐      │
│  │ User Signin │ ───> │ referralCode │ ───> │ Wallet Created │      │
│  │ ?ref=CODE   │      │   Validated  │      │ Referral Rec.  │      │
│  └─────────────┘      └──────────────┘      └────────────────┘      │
│                                                      │                 │
│                                                      v                 │
│                                             ┌────────────────┐        │
│                                             │ Notification   │        │
│                                             │ 🎉 New Referral│        │
│                                             └────────────────┘        │
│                                                                       │
│  ────────────────────────────────────────────────────────────────   │
│                                                                       │
│  FLOW 2: PURCHASE & REWARD                                           │
│  ┌──────────────┐     ┌──────────────┐      ┌────────────────┐      │
│  │ User Places  │ ──> │ Admin Panel  │ ───> │ Add to Wallet  │      │
│  │ Order        │     │ Approves     │      │ Calc Bonus     │      │
│  └──────────────┘     └──────────────┘      └────────────────┘      │
│                                                      │                 │
│                                                      v                 │
│                                             ┌────────────────┐        │
│                                             │ Notification   │        │
│                                             │ 💰 Reward $X   │        │
│                                             └────────────────┘        │
│                                                      │                 │
│                                                      v                 │
│                                             ┌────────────────┐        │
│                                             │ Check Level    │        │
│                                             │ Auto Upgrade?  │        │
│                                             └────────────────┘        │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                      DATA STRUCTURE                                   │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  USERS COLLECTION                                                    │
│  ├─ id                          USER RECORD                          │
│  ├─ name                                                              │
│  ├─ email                     ┌─────────────────────┐                │
│  ├─ referralCode (UNIQUE)     │  referralCode       │                │
│  ├─ referredBy (optional)  ─> │  REF1A2B3C4D (NEW)  │                │
│  ├─ totalReferrals            └─────────────────────┘                │
│  └─ createdAt                                                        │
│                                                                       │
│  WALLETS COLLECTION                                                  │
│  ├─ userId                                                            │
│  ├─ balance           $0 ──────┐                                    │
│  ├─ totalEarnings     $0       │  Purchase #1 ──> $5                │
│  ├─ updatedAt                  │  Purchase #2 ──> $10               │
│  │                             │  Purchase #3 ──> $15  (Level ups!)  │
│  └─ transactions/ (sub-coll)   │  Purchase #4 ──> $20  (Pro +5%)     │
│     ├─ id                       │  Purchase #5 ──> $25.25            │
│     ├─ amount                   │  ...                                │
│     ├─ reason                   │  Purchase #15 ──> $77.50           │
│     ├─ type                     │  (Elite +10%)                       │
│     └─ createdAt               └─────────────────────┘               │
│                                                                       │
│  REFERRALS COLLECTION                                                │
│  ├─ id                         STATUS FLOW                           │
│  ├─ referrerId                                                        │
│  ├─ referredUserId             signed_up ──────────> purchased       │
│  ├─ status         ────────┐   (Level)                 (Level+$Reward)
│  ├─ rewardGiven            │                                         │
│  ├─ rewardAmount           │                                         │
│  ├─ createdAt       Start  │   Progress Calc                         │
│  └─ purchasedAt      Point └─> - Check min referrals                 │
│                                 - Check min earnings                  │
│                                 - Auto upgrade if qualified           │
│                                 - Apply new bonus                     │
│                                                                       │
│  REWARDS COLLECTION                                                  │
│  ├─ id                         HISTORY LOG                           │
│  ├─ referrerId                                                        │
│  ├─ referredUserId             Signup: $2                            │
│  ├─ type (signup/purchase)     Purchase: $5 (+ bonus)                │
│  ├─ amount ($value)            Transaction audit trail               │
│  ├─ reason (text)              For reporting & verification          │
│  └─ createdAt                                                        │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                   LEVEL PROGRESSION SYSTEM                            │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  LEVEL TIERS                                                          │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Beginner (0%)                                              │   │
│  │  ├─ 0+ Referrals                                            │   │
│  │  ├─ $0+ Earned                                              │   │
│  │  └─ REWARD: $5                                              │   │
│  │         │                                                   │   │
│  │         v                                                   │   │
│  │  Pro (5%)                                                   │   │
│  │  ├─ 5+ Referrals  ✓ (User makes 5 purchases)               │   │
│  │  ├─ $25+ Earned   ✓ ($5 × 5 = $25)                         │   │
│  │  └─ REWARD: $5.25 (5% bonus!)                              │   │
│  │         │                                                   │   │
│  │         v                                                   │   │
│  │  Elite (10%)                                                │   │
│  │  ├─ 15+ Referrals ✓ (User makes 15 purchases)              │   │
│  │  ├─ $100+ Earned  ✓ (Acc. with bonuses)                    │   │
│  │  └─ REWARD: $5.50 (10% bonus!)                             │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  PROGRESSION PATH EXAMPLE:                                           │
│                                                                       │
│   Purchase #1-4    Purchase #5      Purchase #6-14    Purchase #15+  │
│  ┌─────────────┐  ┌────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │ Beginner    │  │ LEVEL UP!  │  │ Pro Level    │  │ LEVEL UP!  │ │
│  │ 0% bonus    │  │ ⬆️ Pro     │  │ 5% bonus     │  │ ⬆️ Elite   │ │
│  │             │  │ 5% Reward  │  │              │  │ 10% bonus  │ │
│  │ Each: $5    │  │ $5.25      │  │ Each: $5.25  │  │ Each: $5.50│ │
│  ├─────────────┤  ├────────────┤  ├──────────────┤  ├────────────┤ │
│  │ Total: $20  │  │ Total: $25 │  │ Total: $77.50│  │ Total +$X  │ │
│  └─────────────┘  └────────────┘  └──────────────┘  └────────────┘ │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                    FRONTEND COMPONENTS                                │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  EARN PAGE (/earn)                                                   │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                                                                │ │
│  │  HEADER                                                        │ │
│  │  ┌────────────────────────────────────────────────────────┐  │ │
│  │  │ Referral Rewards                                      │  │ │
│  │  │ Earn money by referring friends                       │  │ │
│  │  └────────────────────────────────────────────────────────┘  │ │
│  │                                                                │ │
│  │  STATS GRID (4 cards)                                         │ │
│  │  ┌──────────────┬──────────────┬──────────────┬──────────────┐ │
│  │  │ Wallet $77.50│ Total $77.50 │ Active Ref 14│ Purchases 15 │ │
│  │  └──────────────┴──────────────┴──────────────┴──────────────┘ │
│  │                                                                │ │
│  │  LEVEL DISPLAY                                                │ │
│  │  ┌────────────────────────────────────────────────────────┐  │ │
│  │  │  🏆 Elite                                      +10%  │  │ │
│  │  │  Progress: 100% (Max Level)                         │  │ │
│  │  └────────────────────────────────────────────────────────┘  │ │
│  │                                                                │ │
│  │  REFERRAL CODE SECTION                                        │ │
│  │  ┌────────────────────────────────────────────────────────┐  │ │
│  │  │ REF1A2B3C4D [COPY]                                    │  │ │
│  │  │ https://site.com/login?ref... [COPY]                 │  │ │
│  │  │ [SHARE WITH FRIENDS]                                  │  │ │
│  │  └────────────────────────────────────────────────────────┘  │ │
│  │                                                                │ │
│  │  REFERRALS LIST                                               │ │
│  │  ┌──────────────────────────────────────┐                   │ │
│  │  │ User a2b3c4d          +$5.50 [✓]   │  15 items...      │ │
│  │  │ User x9y8z7w          Pending[ ]   │  (scrollable)     │ │
│  │  └──────────────────────────────────────┘                   │ │
│  │                                                                │ │
│  │  REWARD HISTORY                                               │ │
│  │  ┌──────────────────────────────────────┐                   │ │
│  │  │ 📈 Purchase reward (Elite +10%)      │  15 items...      │ │
│  │  │    04/14/2026                  +$5.50│  (scrollable)     │ │
│  │  └──────────────────────────────────────┘                   │ │
│  │                                                                │ │
│  │  INFO CARDS                                                   │ │
│  │  ┌──────────────┬──────────────┬──────────────┐             │ │
│  │  │ 🎁 $2 Signup │ 💰 $5 Purch. │ 🏅 +10% Elite│             │ │
│  │  └──────────────┴──────────────┴──────────────┘             │ │
│  │                                                                │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│  Real-time Updates:                                                  │
│  ├─ Wallet balance updates instantly when rewards added             │
│  ├─ Referrals list updates when new users sign up                   │
│  ├─ Level changes when qualification reached                        │
│  └─ Notifications appear for all major events                       │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                   ADMIN INTEGRATION POINT                             │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ADMIN ORDERS PAGE (existing)                                        │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                                                                │ │
│  │  ORDERS TABLE                                                 │ │
│  │  ┌──────────────────────────────────────────────────────────┐│ │
│  │  │ ID │ User │ Plan │ Status │ Reward Status │ Action    ││ │
│  │  ├──────────────────────────────────────────────────────────┤│ │
│  │  │ o1 │ u123 │ 1mo  │ Pend.  │ -             │ [Approve] ││ │
│  │  │ o2 │ u456 │ 6mo  │ Auto.  │ ✓ Proc.       │ [Done]    ││ │
│  │  │ o3 │ u789 │ 12mo │ Rejec. │ N/A (no ref)  │ [Done]    ││ │
│  │  └──────────────────────────────────────────────────────────┘│ │
│  │                                                                │ │
│  │  ACTION: Click "Approve" ──> Behind the Scenes:               │ │
│  │  ┌────────────────────────────────────────────────────────┐  │ │
│  │  │ 1. updateOrder(id, { status: 'approved' })            │  │ │
│  │  │ 2. processOrderReward(userId, orderId)                │  │ │
│  │  │    ├─ Find referral for user                          │  │ │
│  │  │    ├─ Get user level & calculate bonus               │  │ │
│  │  │    ├─ Update wallet balance                           │  │ │
│  │  │    ├─ Mark referral as 'purchased'                   │  │ │
│  │  │    ├─ Record transaction                              │  │ │
│  │  │    ├─ Send notification to referrer                  │  │ │
│  │  │    └─ Auto-check & upgrade level if needed           │  │ │
│  │  └────────────────────────────────────────────────────────┘  │ │
│  │                                                                │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│  Code Changes Required:                                              │
│  ├─ Import processOrderReward from '@/lib/order-reward-hook'        │
│  └─ Call in approve button handler                                  │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                    NOTIFICATION SYSTEM                                │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Real-time Database (Firebase Realtime DB)                           │
│  notifications/{userId}/{notificationId}                             │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                                                              │  │
│  │  NOTIFICATION 1: SIGNUP                                     │  │
│  │  📢 🎉 New Referral!                                        │  │
│  │     "John Doe signed up using your code!"                  │  │
│  │     Sent to: Referrer                                       │  │
│  │     When: User signup complete                             │  │
│  │                                                              │  │
│  │  NOTIFICATION 2: PURCHASE REWARD                           │  │
│  │  📢 💰 Reward Earned!                                       │  │
│  │     "John Doe purchased! You earned $5.50"                 │  │
│  │     Sent to: Referrer                                       │  │
│  │     When: Admin approves order                              │  │
│  │                                                              │  │
│  │  NOTIFICATION 3: LEVEL UP (future)                         │  │
│  │  📢 🚀 Welcome to Elite!                                    │  │
│  │     "You've reached Elite level! +10% on all rewards"      │  │
│  │     Sent to: User                                           │  │
│  │     When: Auto-calculated after reaching requirements       │  │
│  │                                                              │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                    DATA CONSISTENCY MEASURES                          │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  DUPLICATE PREVENTION:                                               │
│  ├─ Query existing referrals before recording new one               │
│  ├─ Check rewardGiven flag before awarding                          │
│  └─ Only process signed_up status that hasn't been rewarded         │
│                                                                       │
│  ATOMIC TRANSACTIONS:                                                │
│  ├─ Batch writes: Wallet + Referral + Reward all or nothing        │
│  └─ Transaction history ensures audit trail                         │
│                                                                       │
│  ERROR HANDLING:                                                     │
│  ├─ Try/catch blocks on all async operations                        │
│  ├─ Graceful fallbacks                                              │
│  └─ Logging for debugging                                           │
│                                                                       │
│  SECURITY:                                                           │
│  ├─ Firestore Security Rules restrict unauthorized access           │
│  ├─ Write operations backend-only                                   │
│  └─ Read operations scoped to user's data                           │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘

```

---

## Quick Reference Table

| Component | Type | Location | Status |
|-----------|------|----------|--------|
| Referral Service | Core Logic | `src/lib/referral-service.ts` | ✅ Complete |
| Order Reward Hook | Integration | `src/lib/order-reward-hook.ts` | ✅ Complete |
| Firestore Service | Updated | `src/lib/firestore-service.ts` | ✅ Updated |
| Earn Page | UI | `src/app/earn/page.tsx` | ✅ Complete |
| Admin Integration | Pending | `src/app/admin/orders/page.tsx` | ⏳ Your Task |
| Documentation | Guides | Project root | ✅ Complete |

---

## Feature Checklist

```
IMPLEMENTED ✅
├─ Wallet creation on signup
├─ Referral tracking
├─ Real-time balance updates
├─ Reward calculation with bonuses
├─ Automatic level progression
├─ Transaction audit trail
├─ Duplicate prevention
├─ Notification integration
├─ Mobile responsive UI
├─ Dark mode support
└─ Comprehensive documentation

TODO ⏳
├─ Admin integration (next step!)
│   ├─ Import processOrderReward
│   └─ Call in approve handler
└─ Optional enhancements
    ├─ Wallet page
    ├─ Leaderboard
    └─ Analytics dashboard
```

---

**All diagrams are ASCII-based and represent the actual system flow. The boxes and arrows show data movement and system interactions.**
