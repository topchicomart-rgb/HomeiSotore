# 🔍 PrimexStream Pro - Complete Data Audit

## 📍 All Hardcoded Data Found in Website

### 1️⃣ IPTV PLANS (src/lib/init-firebase-data.ts)
```javascript
✓ 1-Month Plan: $25 → $20 (save $5)
✓ 6-Month Plan: $75 → $65 (save $10)  
✓ 12-Month Plan: $120 → $95 (save $25)
```
**Location**: Used in IPTV booking wizard page

---

### 2️⃣ PAYMENT METHODS (Duplicated in 3 places!)

#### Instance 1: src/app/iptv/page.tsx
```javascript
- Remitly
- Binance
- PayPal
- Cash App
```

#### Instance 2: src/app/payment/page.tsx
```javascript
- Remitly (Same)
- Binance (Same)
- PayPal (Same)
- Cash App (Same)
```

#### Instance 3: src/components/ui/card.tsx
```javascript
Similar payment method references
```

**⚠️ ACTION**: Consolidate into Firebase `paymentMethods` collection

---

### 3️⃣ REFERRAL TIERS (src/app/earn/page.tsx)
```javascript
Tier 1: 2 referrals → 1 Month IPTV + 5% bonus
Tier 2: 5 referrals → 6 Months IPTV + 7% bonus
Tier 3: 10 referrals → 12 Months IPTV + 10% bonus
```

---

### 4️⃣ REVIEWS - SET A (src/app/dashboard/page.tsx)
```javascript
1. Ahmed Hassan - 5⭐ - "Excellent service! The IPTV streams are crystal clear..."
2. Sarah Johnson - 5⭐ - "Best IPTV provider I've used..."
3. Marco Silva - 5⭐ - "Very satisfied with the platform..."
```

---

### 5️⃣ REVIEWS - SET B (src/app/support/page.tsx)
```javascript
Different set of 3 reviews shown elsewhere
```

**⚠️ ACTION**: Merge both sets or pick one

---

### 6️⃣ FAQs - SET A (src/app/dashboard/page.tsx)
```javascript
1. "How do I start using PrimexStream Pro?"
2. "What devices can I use?"
3. "Can I share my account?"
4. "How do I get support?"
5. "Is there a money-back guarantee?"
6. "Are there hidden fees?"
+ More... (12 total FAQs)
```

---

### 7️⃣ FAQs - SET B (src/app/support/page.tsx)
```javascript
Different FAQ questions about:
- IPTV services
- Account management
- Billing
+ More...
```

**⚠️ ACTION**: Merge all FAQs into one master list

---

### 8️⃣ SERVICES/CATEGORIES (src/app/dashboard/page.tsx)
```javascript
1. IPTV Services (Blue icon) → /iptv
2. Home Repair (Orange icon) → /home-repair
3. Earn Program (Purple icon) → /earn
4. Custom Products (Pink icon) → #
```

---

### 9️⃣ DEVICES (src/app/iptv/page.tsx)
```javascript
- Smart TV (📺)
- Firestick (🔥)
- Android Box (📦)
- Mobile (📱)
- Laptop (💻)
- Tablet (⌚)
- MAG Box (🖥️)
- PC (🖲️)
```

---

### 🔟 CONTACT INFO (Scattered)
Found in multiple places but NOT fully hardcoded:
- Phone number: NOT SET (need to add)
- Email: NOT SET (need to add)
- WhatsApp: NOT SET (need to add)
- Address: NOT SET (need to add)
- Support email: NOT SET (need to add)

---

### 1️⃣1️⃣ HOME PAGE CONTENT
- Company description
- Features list  
- Call-to-action buttons
- Trust badges

---

### 1️⃣2️⃣ UI CONSTANTS
- Colors (emerald, blue, purple, orange, pink)
- Font sizes & weights
- Animation timings
- Spacing values
- *(These are OK to keep in code)*

---

## 📊 Summary Table

| Data Type | Count | Priority | Status |
|-----------|-------|----------|--------|
| IPTV Plans | 3 | P1 | ✅ Found |
| Payment Methods | 4 (×3 duplicates) | P1 | ⚠️ Duplicated |
| Referral Tiers | 3 | P1 | ✅ Found |
| Reviews | 6 (×2 sets) | P2 | ⚠️ Duplicated |
| FAQs | 12 (×2 sets) | P2 | ⚠️ Duplicated |
| Services | 6 | P2 | ✅ Found |
| Devices | 8 | P2 | ✅ Found |
| Contact Info | 5 | P3 | ❌ Missing |
| **TOTAL** | **60+** | | |

---

## 🚀 Migration Priority

### **Phase 1 (Critical) - Must do first:**
1. ✅ Plans → Firebase
2. ✅ Payment Methods → Firebase (remove duplicates)
3. ✅ Referral Tiers → Firebase

### **Phase 2 (Important):**
1. ✅ Reviews → Firebase (merge sets)
2. ✅ FAQs → Firebase (merge sets)
3. ✅ Services → Firebase
4. ✅ Devices → Firebase

### **Phase 3 (Nice to have):**
1. ✅ Contact Info → Firebase (add missing)
2. ✅ Home content → Firebase

---

## 📁 Files Affected (13 total)

1. **src/lib/init-firebase-data.ts** - Plans
2. **src/app/iptv/page.tsx** - Payment methods, Devices
3. **src/app/payment/page.tsx** - Payment methods (duplicate)
4. **src/app/dashboard/page.tsx** - Plans, Reviews, FAQs, Services
5. **src/app/earn/page.tsx** - Referral tiers
6. **src/app/support/page.tsx** - FAQs (different set), Reviews
7. **src/app/orders/page.tsx** - Order data (currently empty/testing)
8. **src/app/wallet/page.tsx** - Wallet info (mostly empty)
9. **src/app/settings/page.tsx** - Settings placeholders
10. **src/components/ui/card.tsx** - UI constants (OK)
11. **src/components/app-layout.tsx** - Navigation (OK)
12. **src/lib/firebase-service.ts** - Firebase calls
13. **src/components/providers/app-provider.tsx** - Auth context

---

## 💾 Next: Firebase Collections to Create

See **FIREBASE_SCHEMA.md** for Firestore structure to create.

