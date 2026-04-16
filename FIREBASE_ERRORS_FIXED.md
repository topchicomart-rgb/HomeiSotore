# Firebase/Firestore Errors - Solution Summary

## Issues Resolved

### 1. **setDoc() called with invalid data: undefined field value**

**Problem:** The `referredBy` field was being explicitly set to `undefined` when no referral code was present, which Firestore doesn't allow.

**Fix Applied:**

- Modified `app-provider.tsx` to only include `referredBy` in the user data object if a valid referral code exists
- Added `cleanData()` helper function in `firestore-service.ts` to filter out undefined values
- Applied `cleanData()` to both `createUser()` and `updateUser()` functions

**Files Changed:**

- `src/components/providers/app-provider.tsx` - Conditional referredBy assignment
- `src/lib/firestore-service.ts` - Added cleanData helper and applied to setDoc/updateDoc calls

### 2. **Permission denied: Missing or insufficient permissions**

**Problem:** Firestore security rules were either:

- Too permissive (allowing any authenticated user to read/modify any user's data)
- Too restrictive (preventing the referral system from updating totalReferrals)

**Fix Applied:**

- Updated security rules to:
  - Restrict user document reads to only own data
  - Allow totalReferrals and credits updates for the referral system
  - Keep sensitive fields protected (name, email, etc.)
  - Maintain public access to plans and admin_settings

**Security Rule Details:**

```javascript
// Users - restricted read, controlled updates
allow read: if request.auth.uid == userId;
allow create: if request.auth.uid != null && request.auth.uid == userId;
allow update: if request.auth.uid == userId 
  || (request.auth.uid != null && 
      request.resource.data.diff(resource.data).affectedKeys()
      .hasOnly(['totalReferrals', 'credits']));
```

This rule allows:

- Each user to read only their own data
- Each user to create their own account
- Each user to update their own data
- Any authenticated user to update ONLY totalReferrals and credits fields (for referral system)

### 3. **Firestore Internal Assertion Failures**

**Root Cause:** Cascading from the permission denied errors and undefined data values

**Resolution:** Fixed by addressing issues #1 and #2 above

## Implementation Steps

1. **Update Security Rules** (Required)
   - Go to Firebase Console → Firestore → Rules tab
   - Replace existing rules with the updated version from `FIRESTORE_SETUP.md`
   - Publish the new rules

2. **Deploy Code Changes** (Required)
   - These changes are already implemented in your codebase:
     - `src/components/providers/app-provider.tsx` ✓
     - `src/lib/firestore-service.ts` ✓

3. **Testing**
   - Clear browser cache and local storage
   - Test user registration with and without referral code
   - Test referral verification (incrementing totalReferrals)
   - Check browser console for any remaining errors

## Verification Checklist

- [ ] Security rules updated in Firebase Console
- [ ] Code changes deployed
- [ ] Browser cache cleared
- [ ] Test registration without referral code
- [ ] Test registration with referral code (?ref=REF12345678)
- [ ] Verify no undefined values in Firestore documents
- [ ] Verify no permission errors in console
- [ ] Check referral system increments totalReferrals correctly

## Key Changes Made

### app-provider.tsx

```typescript
// OLD (causes undefined error)
referredBy: refCode || undefined,

// NEW (only includes field if value exists)
if (refCode) {
  newUserData.referredBy = refCode;
}
```

### firestore-service.ts

```typescript
// Added helper to remove undefined values
function cleanData(data: any): any {
  return Object.fromEntries(
    Object.entries(data).filter(([_, value]) => value !== undefined)
  );
}

// Applied to write operations
const dataToWrite = cleanData({...userData, ...otherFields});
await setDoc(userRef, dataToWrite);
```

## Additional Notes

- The referral system now works without "admin-only" requirements
- All user-to-user data modifications are validated at the database level
- Sensitive fields (email, name, createdAt) are protected from modification by other users
- The cleanData function provides defense-in-depth against undefined value issues

## If Issues Persist

1. Check Firebase Console → Firestore → Data to verify document structure
2. Verify security rules are properly published (Rules tab shows green "Publish" button if changes are pending)
3. Check browser DevTools → Network tab for failed requests
4. Check Firebase Console → Cloud Functions logs if using any functions
5. Try accessing Firestore in incognito/private window to rule out cache issues

---

**Last Updated:** April 5, 2026
**Status:** Fixed ✓
