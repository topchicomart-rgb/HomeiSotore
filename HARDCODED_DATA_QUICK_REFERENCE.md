# Hardcoded Data Quick Reference

## Summary Table

| # | Category | File | Lines | Data Type | Count | Values | Priority |
|---|----------|------|-------|-----------|-------|--------|----------|
| 1 | IPTV Plans | `src/lib/init-firebase-data.ts` | 4-35 | Array of objects | 3 plans | 1-month ($20), 6-month ($65), 12-month ($95) | **P1** |
| 2 | Referral Tiers | `src/app/earn/page.tsx` | 19-40 | Array of objects | 3 tiers | 2/5/10 referrals → 1M/6M/12M IPTV, 5%/7%/10% bonus | **P1** |
| 3 | Reviews (Dashboard) | `src/app/dashboard/page.tsx` | 51-73 | Array of objects | 3 reviews | Ahmed, Sarah, Marco testimonials | **P2** |
| 4 | FAQs (Dashboard) | `src/app/dashboard/page.tsx` | 76-110 | Array of objects | 6 FAQs | Getting started, cancellation, devices, referral, trial, withdrawal | **P2** |
| 5 | Reviews (Support) | `src/app/support/page.tsx` | 27-50 | Array of objects | 3 reviews | Ahmed, Maria, John testimonials (different from #3) | **P2** |
| 6 | FAQs (Support) | `src/app/support/page.tsx` | 52-86 | Array of objects | 6 FAQs | Security, payment methods, refund, devices, support, legal (different from #4) | **P2** |
| 7 | Payment Methods (IPTV) | `src/app/iptv/page.tsx` | 22-25 | Array of objects | 4 methods | Remitly 🔵, Binance 🟡, PayPal 💙, CashApp 💚 | **P1** |
| 8 | Payment Details | `src/app/payment/page.tsx` | 15-32 | Object with methods | 4 methods | Remitly, Binance, PayPal, CashApp (with instructions) | **P1** |
| 9 | Payment Methods (New Payment) | `src/app/new-payment/page.tsx` | 37-40 | Array of objects | 4 methods | Same as #7 (DUPLICATE) | **P1** |
| 10 | Payment Methods (Admin) | `src/app/payment/page.tsx` | 65-68 | Array of objects | 4 methods | Same as #7 (DUPLICATE) | **P1** |
| 11 | Devices | `src/app/iptv/page.tsx` | 5-18 | Array of objects | 8 devices | Smart TV, Firestick, Android Box, Mobile, Laptop, Tablet, MAG Box, PC | **P2** |
| 12 | Home Repair Services | `src/app/home-repair/page.tsx` | 31-57 | Array of objects | 6 services | Locksmith, Tree Trimming, Roofing, Plumbing, Electrician, Custom | **P2** |
| 13 | Team Stories | `src/app/home-repair/page.tsx` | 59-65 | Array of objects | 5 people | Mike, Sarah, Tom, Lisa, John with ratings 4.8-4.95 | **P2** |
| 14 | Phone Number | `src/app/home-repair/page.tsx` | 67 | String | 1 | `+1 (555) 123-4567` | **P3** |
| 15 | US Cities | `src/app/home-repair/page.tsx` | 70 | Array of strings | 10 cities | NY, LA, Chicago, Houston, Phoenix, Philly, San Antonio, San Diego, Dallas, San Jose | **P3** |
| 16 | UK Cities | `src/app/home-repair/page.tsx` | 71 | Array of strings | 10 cities | London, Manchester, Birmingham, Leeds, Glasgow, Sheffield, Bristol, Edinburgh, Liverpool, Newcastle | **P3** |
| 17 | Dashboard Services | `src/app/dashboard/page.tsx` | 43-46 | Array of objects | 4 services | IPTV, Home Repair, Earn Program, Custom Products | **P2** |
| 18 | WhatsApp Contact | `src/components/whatsapp-button.tsx` | 18 | String URL | 1 | `https://wa.me/1234567890` | **P3** |
| 19 | Support Email | `src/lib/firebase-service.ts` | 416 | String | 1 | `support@primexstream.com` | **P3** |
| 20 | Support Phone | `src/lib/firebase-service.ts` | 417 | String | 1 | `+1234567890` | **P3** |
| 21 | Default Referral Code | `src/app/earn/page.tsx` | 65 | String | 1 | `DEMO123` | **P3** |
| 22 | Referral Link Template | `src/app/earn/page.tsx` | 66 | String template | 1 | `https://primexstream.pro?ref={code}` | **P3** |
| 23 | Firebase Config | `src/lib/firebase-config.ts` | 6-14 | Object | 9 keys | apiKey, authDomain, databaseURL, projectId, etc. (using env vars) | **P3** |
| 24 | Config Interface | `src/lib/firebase-service.ts` | 333-432 | TypeScript interface | ~25 fields | Site settings, orders, plans, referral, payment methods | **P2** |

---

## Duplicate Data Items

### ❌ DUPLICATES TO CONSOLIDATE

**Payment Methods** (appears 3 times)
- [src/app/iptv/page.tsx](src/app/iptv/page.tsx#L22)
- [src/app/payment/page.tsx](src/app/payment/page.tsx#L65)
- [src/app/new-payment/page.tsx](src/app/new-payment/page.tsx#L37)

→ **Action**: Create `src/lib/constants/paymentMethods.ts`

**Reviews** (2 different sets)
- Dashboard: [Ahmed Hassan, Sarah Johnson, Marco Silva]
- Support: [Ahmed Hassan, Maria Rodriguez, John Smith]

→ **Action**: Merge into Firestore `reviews` collection

**FAQs** (2 different sets)
- Dashboard: [Getting started, Cancellation, Devices, Referral, Trial, Withdrawal]
- Support: [Security, Payment methods, Refund, Devices, Issues, Legal]

→ **Action**: Merge into Firestore `faqs` collection

---

## Migration Timeline Recommendation

### Phase 1: Critical Business Data (Week 1-2)
1. Create Firestore `plans` collection → Replace `PLANS` import
2. Create Firestore `paymentMethods` collection → Consolidate 3 duplicates
3. Create Firestore `referralTiers` collection → Replace `DEFAULT_REFERRAL_TIERS`

**Affected Files**: 6 files
**Estimated Time**: 8 hours

### Phase 2: Content/CMS Data (Week 2-3)
1. Create Firestore `reviews` collection → Merge 2 sets
2. Create Firestore `faqs` collection → Merge 2 sets
3. Create Firestore `services` collection → Replace `DEFAULT_SERVICES`
4. Create Firestore `team` collection → Replace `TEAM_STORIES`

**Affected Files**: 4 files
**Estimated Time**: 6 hours

### Phase 3: Configuration (Week 3)
1. Create `.env.local` reference guide for Firebase keys
2. Create Firestore `config` document for contact info
3. Create `locations` collection for country/city data

**Affected Files**: 5 files
**Estimated Time**: 4 hours

**Total Migration Time**: ~18 hours

---

## Quick Stats

- **Total Hardcoded Data Items**: 60+
- **Files to Modify**: 13
- **Duplicate Items**: 3 (payment methods, reviews, FAQs)
- **Firestore Collections Needed**: 9
  1. `plans` ← IPTV plans
  2. `paymentMethods` ← Payment gateways
  3. `referralTiers` ← Referral rewards
  4. `reviews` ← Customer testimonials
  5. `faqs` ← FAQ content
  6. `services` ← Home repair services
  7. `team` ← Team members/specialists
  8. `devices` ← Supported devices
  9. `locations` ← Countries/cities

- **Firestore Documents Needed**: 1
  1. `config` ← Site configuration

- **Constants to Extract**: 3
  1. `paymentMethods` → `src/lib/constants/paymentMethods.ts`
  2. `devices` → `src/lib/constants/devices.ts`
  3. `contactInfo` → `src/lib/constants/contactInfo.ts`

---

## Implementation Strategy

### Create Service Layer
```typescript
// src/lib/dataService.ts
export async function getPlans() { }
export async function getPaymentMethods() { }
export async function getReferralTiers() { }
export async function getReviews() { }
export async function getFAQs() { }
export async function getServices() { }
export async function getTeam() { }
export async function getLocations() { }
export async function getContactInfo() { }
export async function getDevices() { }
```

### Add Admin Panel Endpoints
- [ ] Plans Management (CRUD)
- [ ] Payment Methods Management (CRUD)
- [ ] Referral Tiers Management (CRUD)
- [ ] Reviews Management (CRUD)
- [ ] FAQs Management (CRUD)
- [ ] Services Management (CRUD)
- [ ] Team Management (CRUD)

---

## Security Considerations

⚠️ **Items containing sensitive data**:
1. WhatsApp number: `1234567890` - Not sensitive (demo)
2. Support email: `support@primexstream.com` - Not sensitive
3. Support phone: `+1234567890` - Not sensitive (demo)
4. Firebase config - ✅ Already using environment variables

✅ **All data is currently safe** - No real credentials are hardcoded.

---

## Next Steps

1. **Review this audit** with the team
2. **Prioritize** which data to migrate first
3. **Create Firestore schema** based on Priority 1 items
4. **Build data service layer** to abstract data source
5. **Implement admin CMS** for non-technical updates
6. **Migrate data** phase by phase
7. **Remove hardcoded defaults** as database becomes source of truth
