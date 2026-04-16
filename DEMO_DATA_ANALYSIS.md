# PrimexStream Pro - Demo Data & Hardcoded Values Analysis

## Summary
This document provides a comprehensive analysis of all demo data, mock/fake payment methods, hardcoded test data, and static arrays with fake information found in the PrimexStream Pro codebase.

---

## 1. DEMO DATA - Fake Balances & Credits

### File: [src/app/wallet/page.tsx](src/app/wallet/page.tsx#L16)
**Primary Issue: Hardcoded Fake Balance**
```typescript
const balance = user?.credits || 150.5;
```
- **Location**: Line 16
- **Problem**: When user doesn't have credits property, defaults to `150.5` (fake balance)
- **What Should Be**: Query from Firestore user document
- **Status**: DEMO DATA - Should use `user?.credits` which comes from Firestore User object

**Related Code**:
- Displays in balance card as: `${balance.toFixed(2)}` 
- Used in redeem section and balance overview
- Should pull from User interface credits field set during user creation

---

## 2. DEMO/FALLBACK DATA - Referral Code

### File: [src/app/earn/page.tsx](src/app/earn/page.tsx#L55)
**Fallback Referral Code**
```typescript
const referralCode = user?.referralCode || 'DEMO123';
```
- **Location**: Line 55
- **Problem**: Fallback to 'DEMO123' if referralCode doesn't exist
- **What Should Be**: Always use user?.referralCode from Firestore (auto-generated on signup)
- **Status**: Safe (unlikely to happen due to generation in createUser)
- **Improvement**: Add fallback error handling or ensure referralCode is always generated

---

## 3. HARDCODED DEMO PAYMENT DETAILS

### File: [src/app/payment/page.tsx](src/app/payment/page.tsx)
**Hardcoded Payment Method Details with Fake Account Info**

#### PAYMENT_DETAILS Object (Lines ~26-44):
```typescript
const PAYMENT_DETAILS: Record<PaymentMethod, { instructions: string; accountInfo: { name: string; value: string }[] }> = {
  remitly: {
    instructions: '1. Open your Remitly app\n2. Select "Send Money" to Philippines...',
    accountInfo: [
      { name: 'Account Holder', value: 'PrimeXstream Inc.' },
      { name: 'Account Number', value: '8762-5491-3847' },
      { name: 'Country', value: 'Philippines' },
    ],
  },
  binance: {
    instructions: '1. Go to Binance and select "Send"...',
    accountInfo: [
      { name: 'Wallet Address', value: '0x742d35Cc6634C0532925a3b844Bc924e50F4ff89' },
      { name: 'Network', value: 'Binance Smart Chain (BSC)' },
      { name: 'Accepted Coins', value: 'USDT, BUSD, BNB' },
    ],
  },
  paypal: {
    instructions: '1. Log in to your PayPal account...',
    accountInfo: [
      { name: 'PayPal Email', value: 'payment@primexstream.com' },
      { name: 'Business Name', value: 'PrimeXstream Services' },
      { name: 'Currency', value: 'USD' },
    ],
  },
  cashapp: {
    instructions: '1. Open Cash App\n2. Tap the "$" button...',
    accountInfo: [
      { name: 'Cash App Tag', value: '$PrimeXstream' },
      { name: 'Account Name', value: 'PrimeXstream' },
      { name: 'Note', value: '$1 minimum per transaction' },
    ],
  },
};
```

**Problems**:
- **Fake Account Numbers**: '8762-5491-3847' for Remitly
- **Fake Wallet Address**: '0x742d35Cc6634C0532925a3b844Bc924e50F4ff89' for Binance
- **Fake Email**: 'payment@primexstream.com'
- **Fake Identifiers**: '$PrimeXstream' for Cash App
- **Hardcoded Instructions**: All payment instructions are hardcoded

**What Should Be**:
- Store payment details in Firestore `admin_settings` collection
- Use `onAdminSettingsChange()` from firestore-service.ts to fetch real payment details
- Allow admins to update payment info from admin panel
- Current infrastructure supports this but isn't being used

**Impact**:
- Users see demo/fake payment details
- Changing payment info requires code change and redeployment
- Admin panel has settings management but payment details are hardcoded in UI

---

## 4. STATIC ARRAYS WITH DEMO DATA

### File: [src/app/dashboard/page.tsx](src/app/dashboard/page.tsx)

#### Reviews Array (Lines ~26-44):
```typescript
const reviews = [
  {
    id: 1,
    name: 'Ahmed Hassan',
    rating: 5,
    comment: 'Excellent service! The IPTV streams are crystal clear and the referral program is amazing.',
    avatar: '👨‍💼',
  },
  // ... 2 more fake reviews
];
```

**Problems**:
- Static array of 3 fake customer reviews
- Always shows same reviews regardless of real customer feedback

**What Should Be**:
- Fetch reviews from Firestore collection
- Set up real-time listener for new reviews
- Allow customers to submit reviews
- Display random sample or featured reviews

---

#### FAQs Array (Lines ~46-60):
```typescript
const faqs = [
  {
    id: 1,
    question: 'How do I start using PrimexStream Pro?',
    answer: 'Sign up with your email, choose a plan, and start streaming immediately. It takes less than 2 minutes!',
  },
  // ... 5 more hardcoded FAQs
];
```

**Problems**:
- 6 hardcoded FAQ entries
- No mechanism to update FAQs without code change
- Admin panel exists but FAQs not integrated

---

### File: [src/app/support/page.tsx](src/app/support/page.tsx)

#### Reviews Array (Lines ~16-36):
```typescript
const reviews: Review[] = [
  {
    id: '1',
    name: 'Ahmed Hassan',
    rating: 5,
    text: 'Best IPTV service I\'ve used! Quick installation and amazing picture quality. Highly recommended!',
    date: '2 weeks ago',
  },
  // ... 2 more fake reviews
];
```

**Problems**:
- Duplicate fake reviews from dashboard
- Static data hardcoded in component

---

#### FAQs Array (Lines ~38-96):
```typescript
const faqs: FAQItem[] = [
  {
    id: '1',
    question: 'Is my payment information secure?',
    answer: 'Yes! We use bank-level encryption (SSL/TLS) to protect your payments...',
  },
  // ... 5 more FAQs
];
```

**Problems**:
- 6 hardcoded FAQ entries
- Different FAQs than dashboard but still static
- No dynamic content management

---

### File: [src/app/iptv/page.tsx](src/app/iptv/page.tsx)

#### Payment Methods Array (Lines ~35-39):
```typescript
const paymentMethods = [
  { id: 'remitly', name: 'Remitly', icon: '🔵' },
  { id: 'binance', name: 'Binance', icon: '🟡' },
  { id: 'paypal', name: 'PayPal', icon: '💙' },
  { id: 'cashapp', name: 'Cash App', icon: '💚' },
];
```

**Status**: OK - This is UI metadata (names/icons), accounts are centralized in payment/page.tsx

---

### File: [src/app/home-repair/page.tsx](src/app/home-repair/page.tsx)

#### Services Array (Lines ~24-66):
```typescript
const services: Service[] = [
  {
    id: 'plumbing',
    name: 'Plumbing',
    icon: <Droplet className="w-8 h-8" />,
    color: 'from-blue-500 to-cyan-500',
    emoji: '💧',
    price: '$50-150',
    description: 'Leak fixes, pipe repairs, installations',
  },
  // ... 5 more demo services
];
```

**Problems**:
- 6 hardcoded home repair services
- Fake price ranges
- No backend connection to real services

**What Should Be**:
- Fetch from Firestore services collection
- Allow admin to manage available services

---

#### City Arrays (Lines ~70-71):
```typescript
const usaCities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', ...];
const ukCities = ['London', 'Manchester', 'Birmingham', ...];
```

**Status**: OK - These are helper lists, not critical demo data

---

## 5. HARDCODED PRICING DATA

### File: [src/lib/init-firebase-data.ts](src/lib/init-firebase-data.ts)

#### PLANS Configuration (Lines ~3-27):
```typescript
export const PLANS = {
  '1-month': {
    id: '1-month',
    name: 'IPTV 1-Month',
    duration: '1 Month',
    originalPrice: 25,
    salePrice: 20,
    discount: 5,
    description: 'Access for 1 month',
    extraDiscount: 6, // 30% of 20 = 6
  },
  '6-month': {
    id: '6-month',
    name: 'IPTV 6-Month',
    duration: '6 Months',
    originalPrice: 75,
    salePrice: 65,
    discount: 10,
    description: 'Access for 6 months',
    extraDiscount: 19.5, // 30% of 65 = 19.5
  },
  '12-month': {
    id: '12-month',
    name: 'IPTV 12-Month',
    duration: '12 Months',
    originalPrice: 120,
    salePrice: 95,
    discount: 25,
    description: 'Access for 12 months',
    extraDiscount: 28.5, // 30% of 95 = 28.5
  },
};
```

**Status**: MIXED
- These ARE the real plans stored in Firebase
- Used throughout app (payment, IPTV wizard, etc.)
- BUT: If needs to change, requires code redeploy
- Could be admin-configurable but currently initialized from code

**What Could Be Better**:
- Admin panel has `updatePlan()` function but UI not fully connected
- Consider making plans fully dynamic after initial setup

---

## 6. DEMO ORDERS & STATIC DATA

### File: [src/app/orders/page.tsx](src/app/orders/page.tsx)

**Status**: GOOD - Uses real-time Firestore listener
```typescript
const unsubscribe = onUserOrdersChange(user.id, (ordersData) => {
  setOrders(ordersData);
  setLoading(false);
});
```

No hardcoded demo orders - pulls from Firestore in real-time ✓

---

## 7. REFERRAL TIERS - Demo Rewards

### File: [src/app/earn/page.tsx](src/app/earn/page.tsx) - Lines ~11-26

#### referralTiers Array:
```typescript
const referralTiers = [
  {
    id: '1',
    referrals: 2,
    reward: '1 Month IPTV',
    icon: '🎁',
    bonus: '5%',
  },
  {
    id: '2',
    referrals: 5,
    reward: '6 Months IPTV',
    icon: '🌟',
    bonus: '7%',
  },
  {
    id: '3',
    referrals: 10,
    reward: '12 Months IPTV',
    icon: '👑',
    bonus: '10%',
  },
];
```

**Problems**:
- Hardcoded tier structure
- Hardcoded reward thresholds (2, 5, 10 referrals)
- Hardcoded bonus percentages (5%, 7%, 10%)

**What Should Be**:
- Store in Firestore `referral_tiers` collection
- Allow admin to create/edit tiers
- Use onSnapshot() to get real-time updates

**Note**: The tier claiming logic is implemented in UI but not fully wired to Firestore

---

## 8. HARDCODED ERROR/DEMO VALUES IN STATE

### File: [src/components/providers/app-provider.tsx](src/components/providers/app-provider.tsx)

#### Fallback User Object (Lines ~125-132):
```typescript
const fallbackUser: User = {
  id: firebaseUser.uid,
  name: firebaseUser.displayName || 'User',
  email: firebaseUser.email || '',
  referralCode: 'REF' + Math.random().toString(36).substring(2, 8),
  totalReferrals: 0,
  credits: 0,
};
setUser(fallbackUser);
```

**Status**: ACCEPTABLE
- Used as fallback if Firestore fetch fails
- Safe fallback pattern
- Generates random referralCode instead of using stored one

---

## SUMMARY TABLE

| Category | File | Line(s) | Issue | Priority | Type |
|----------|------|---------|-------|----------|------|
| Balance | wallet/page.tsx | 16 | `150.5` fallback | HIGH | Demo Data |
| Payment Accounts | payment/page.tsx | ~26-44 | Fake accts/emails/wallet | CRITICAL | Hardcoded |
| Reviews | dashboard/page.tsx | ~26-44 | 3 fake reviews | MEDIUM | Static Array |
| FAQs | dashboard/page.tsx | ~46-60 | 6 hardcoded FAQs | MEDIUM | Static Array |
| Reviews | support/page.tsx | ~16-36 | 3 fake reviews (duplicate) | MEDIUM | Static Array |
| FAQs | support/page.tsx | ~38-96 | 6 hardcoded FAQs | MEDIUM | Static Array |
| Services | home-repair/page.tsx | ~24-66 | 6 demo services | LOW | Demo Data |
| Tiers | earn/page.tsx | ~11-26 | Hardcoded tier config | HIGH | Hardcoded |
| Referral Code | earn/page.tsx | 55 | `DEMO123` fallback | LOW | Fallback |
| Plans | init-firebase-data.ts | ~3-27 | Hardcoded pricing | MEDIUM | Config |

---

## RECOMMENDATIONS BY PRIORITY

### 🔴 CRITICAL - Fix Immediately
1. **Payment Account Details** (payment/page.tsx)
   - Replace hardcoded account info with admin settings
   - Use existing `onAdminSettingsChange()` listener
   - Implement admin UI for updating payment details

### 🟠 HIGH - Fix Soon
2. **Wallet Balance Fallback** (wallet/page.tsx)
   - Ensure user.credits is always populated
   - Remove 150.5 fallback or ensure credits defaults to 0
   - Add error handling if credits missing

3. **Referral Tiers Configuration** (earn/page.tsx)
   - Move tiers to Firestore collection
   - Create admin UI for tier management
   - Update useEffect hooks to listen to real-time tier changes

### 🟡 MEDIUM - Fix Soon
4. **Reviews and FAQs** (dashboard/page.tsx, support/page.tsx)
   - Set up Firestore collections: `reviews` and `faqs`
   - Replace static arrays with real-time listeners
   - Create admin UI to manage content
   - Both pages duplicate same data - consolidate

5. **Plans Configuration** (init-firebase-data.ts)
   - Consider making fully admin-editable post-initial-setup
   - Admin panel has `updatePlan()` but UI limited

### 🟢 LOW - Future Enhancement
6. **Home Repair Services** (home-repair/page.tsx)
   - Move to Firestore collection
   - Admin management UI
   - Less critical if feature is planned for future development

---

## INFRASTRUCTURE ALREADY IN PLACE

Good news: The Firestore infrastructure exists to support real data:

✅ **Available Functions**:
- `onAdminSettingsChange()` - Real-time admin settings listener
- `updateAdminSettings()` - Update payment details
- `onPlansChange()` - Real-time plan updates
- `updatePlan()` - Admin plan updates
- `getReferralDetailsForUser()` - Real referral data
- `getUserIncomeFromReferrals()` - Real earnings calculation

✅ **Admin Panel**:
- Admin dashboard exists ([src/app/admin/page.tsx](src/app/admin/page.tsx))
- Has UI for approving orders and setting credentials
- Uses real-time Firestore listeners

🔧 **To Complete**:
- Wire up payment details admin management
- Create admin UI for FAQs/Reviews
- Create admin UI for referral tiers
- Hook hardcoded data to Firestore listeners

---

## NEXT STEPS

1. **Audit Payment Details** - Replace with admin settings
2. **Create Firestore Collections**:
   - `faqs` - For FAQ content
   - `reviews` - For customer reviews  
   - `referral_tiers` - For tier configuration
3. **Update Components** - Replace static arrays with listeners
4. **Enhance Admin Panel** - Add management UIs for above
5. **Remove Hardcoded Values** - Clean up constants once dynamic

---

**Document Generated**: April 9, 2026  
**Analysis Scope**: Full codebase (src/app/ and src/lib/)
