# Firestore Security Rules - Fix for Referral System

## ✅ Updated Security Rules

The Firestore security rules have been updated to support the referral system. The rules now allow:

1. **User Document Updates** - Any authenticated user can update referral-related fields (`totalReferrals`, `totalEarnings`) for any user. This enables the referral system to increment referral counts when new users sign up with a referral code.

2. **Referral Document Creation** - Any authenticated user can create a referral record where they are the referred user.

3. **Collection Reads** - Authenticated users can read user documents and their own referral records.

## 🔧 How to Apply These Rules

### Step 1: Open Firebase Console
1. Go to https://console.firebase.google.com
2. Select your project
3. Go to **Firestore Database** → **Rules**

### Step 2: Replace with New Rules
1. Delete all existing rules
2. Copy the complete content from: `FIRESTORE_SECURITY_RULES.txt`
3. Paste it into the Firebase Console Rules editor

### Step 3: Publish
Click the **Publish** button to apply the new rules.

## ⚠️ Important Security Note

These rules allow ANY authenticated user to update referral fields for other users. This is intentional for the referral system to work. However, for production:

- Consider implementing Cloud Functions to handle referral updates server-side
- Add additional validation to prevent abuse
- Implement rate limiting on referral creation
- Add audit logging for referral updates

## 🧪 Testing

After updating the rules, test the referral system:

1. Go to **Earn** page
2. Try applying a referral code in the "Apply Referral Code" box
3. You should see a success message without permission errors

## 📋 Collections Protected by These Rules

| Collection | Read | Create | Update |
|-----------|------|--------|--------|
| `users` | Authenticated | Only own | Own + referral fields |
| `referrals` | Authenticated | Only referred user | Referrer only |
| `rewards` | Own only | Own | Own |
| `wallets` | Own only | Own | Own |
| `plans` | All | Admin | Admin |
| `orders` | Own + Admin | All | Admin |
| `settings` | All (general) | Admin | Admin |

