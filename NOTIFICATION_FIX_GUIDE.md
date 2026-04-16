# Notification System Fix Guide

## Status Summary

### ✅ Issue 1: Referral Code Input FIXED
The referral code input box has been added back to the Earn page. Users can now:
- Paste a referral code from a friend
- Apply it to their account
- See success/error messages

**Changes Made:**
- Added `referralCodeInput` state to track the code being entered
- Added `applyingCode` state for loading state during submission
- Added `codeMessage` state for success/error feedback
- Implemented `handleApplyReferralCode` function that:
  - Validates the code isn't empty
  - Prevents self-referrals
  - Checks for circular referrals
  - Creates the referral relationship in Firestore
- Added UI section with input field and apply button

---

## ⏳ Issue 2 & 3: Notifications Not Showing

### Root Causes
1. **Missing Firestore Composite Index** - The notification query uses multiple conditions that require an index
2. **Firestore Rules Not Published** - Updated rules exist in the file but need to be published to Firebase

### Error Details

When you open the app, you see this error:
```
FirebaseError: The query requires an index. You can create it here: 
https://console.firebase.google.com/v1/r/project/top-chico-mart/firestore/indexes?create_composite=...
```

This is because the notification listener runs this query:
```javascript
where('deleted', '==', false)
orderBy('createdAt', 'desc')
```

Firestore requires a **composite index** when combining a `where` clause with `orderBy`.

---

## Fix Steps (Follow in Order)

### Step 1: Publish Updated Firestore Security Rules

**Why?** The rules were updated to allow access to the notifications sub-collection at `users/{userId}/notifications`

**How:**

1. Open Firebase Console: https://console.firebase.google.com
2. Select your project: **top-chico-mart**
3. Go to: **Firestore Database → Rules** tab
4. Click the **Edit Rules** button
5. **DELETE all existing content** and replace with the entire content from:
   `FIRESTORE_SECURITY_RULES.txt` (in project root)

6. Click **Publish** and wait for confirmation

**Verification:**
- You should see: "Rules published successfully"
- The status should change to "Published" (green)

---

### Step 2: Create Firestore Composite Index

**Why?** The notifications query needs this index to work

**Collection Details:**
- **Database:** default
- **Collection ID:** notifications (under users)
- **Key Path:** `users/{userId}/notifications`
- **Field 1:** `deleted` (Ascending ↑)
- **Field 2:** `createdAt` (Descending ↓)

**Option A: Auto-Create (Easiest)**

1. Open browser console in your app (F12 → Console tab)
2. Look for the Firestore error message
3. Click the long URL that says "You can create it here"
4. Firebase will open with index creation pre-filled
5. Click **"Create Index"** button
6. Wait for status: "Enabled (✓)" - Usually 1-2 minutes

**Option B: Manual Create**

1. Open Firebase Console: https://console.firebase.google.com  
2. Select project: **top-chico-mart**
3. Go to: **Firestore Database → Indexes** tab
4. Click **"Create Index"** button
5. Fill in:
   - **Collection ID:** `notifications`
   - **Scope:** Collection group (checkbox)
   - **Field 1:** `deleted` (Ascending ↑)
   - **Field 2:** `createdAt` (Descending ↓)
6. Click **"Create Index"**
7. Wait for status to show "Enabled" (green checkmark)

**Monitoring Index Creation:**
- Status will show: "Building..." then "Enabled"
- Takes 1-5 minutes typically
- Do NOT refresh the page during building

---

### Step 3: Restart Dev Server

1. Stop the dev server: Press `Ctrl+C` in terminal
2. Restart: `npm run dev`
3. Open app and check browser console

**Expected Results:**
- No more "The query requires an index" error
- Notifications panel loads instead of showing "Loading..."
- Notifications display correctly

---

## Testing

After completing all steps, test these scenarios:

### Test 1: Notification System
1. Open app on two devices (or two browser tabs)
2. Create an order on one device
3. Check notifications on both devices
4. Should see order notification appear

### Test 2: Referral Notifications  
1. Apply a referral code on the Earn page
2. Check notifications
3. Should see confirmation notification

### Test 3: Manual Referral Reward
1. Go to Earn page
2. Check if any referrals have purchased
3. Click "Claim ₹5" button
4. Check notifications for reward claim confirmation

---

## Troubleshooting

### Still Seeing "The query requires an index" Error?

**Solution:**
1. Hard refresh browser: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. Clear browser cache:
   - DevTools → Application → Cache → Clear
3. Check Firebase Console:
   - Firestore → Indexes
   - Verify index shows "Enabled" status
4. If index still shows "Building":
   - Wait a few more minutes
   - Don't close the browser

### Seeing "Permission denied" Error?

**Solution:**
1. Verify security rules were published:
   - Firebase Console → Firestore → Rules
   - Rules should show recent publish time
2. Confirm you're logged in with authenticated user
3. Hard refresh browser: `Ctrl+Shift+R`

### Notifications Still Not Appearing?

**Checklist:**
- [ ] Security rules published (check Firebase Console)
- [ ] Composite index "Enabled" status (check Firestore → Indexes)
- [ ] Browser hard-refreshed: `Ctrl+Shift+R`
- [ ] Dev server restarted: `npm run dev`
- [ ] User is logged in
- [ ] Check browser console for other errors

---

## What's Fixed in Code

### Earn Page (`src/app/earn/page.tsx`)
- ✅ Added import for `applyReferralCode`
- ✅ Added state for referral code input, loading, messages
- ✅ Added `handleApplyReferralCode` function
- ✅ Added UI section for applying codes
- ✅ Added success/error message display

### Firestore Referral Service (`src/lib/firestore-referral-service.ts`)
- ✅ Added `applyReferralCode` function that:
  - Validates referral code
  - Prevents self-referrals
  - Checks for circular referrals
  - Creates referral record in Firestore

### Security Rules (`FIRESTORE_SECURITY_RULES.txt`)
- ✅ Added sub-collection rules for `users/{userId}/notifications`
- ✅ Allows read to notification owner
- ✅ Allows create to authenticated users
- ✅ Allows delete to owner or admin

---

## Files Modified

1. `src/app/earn/page.tsx` - Added referral code input UI and handler
2. `src/lib/firestore-referral-service.ts` - Added `applyReferralCode` function
3. `FIRESTORE_SECURITY_RULES.txt` - Already updated with sub-collection rules

## Files to Use (But Not Edit)

1. `FIRESTORE_SECURITY_RULES.txt` - Copy/paste content to Firebase Console Rules
2. No code changes needed - just Firebase configuration

---

## Summary

| Issue | Status | Type | Action |
|-------|--------|------|--------|
| Referral code input missing | ✅ FIXED | Code | Deploy changes |
| Notifications not showing | ⏳ Needs Firebase Setup | Config | Create index + publish rules |
| Referral/Order notifications | ⏳ Depends on #2 | Config | Same as above |

**Next Steps:**
1. ✅ Pull latest code changes (referral code input)
2. Follow steps 1-3 above for Firebase setup
3. Restart dev server  
4. Test notifications
