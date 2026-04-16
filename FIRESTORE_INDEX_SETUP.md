# Firestore Index Setup Guide

## Issue
Notifications are stuck loading because Firestore composite indexes are missing.

## Required Indexes

### Composite Index 1: Notifications
**Collection:** `notifications`  
**Fields:**
- `isDeleted` (Ascending)
- `userId` (Ascending)
- `createdAt` (Descending)

**How to Create:**

1. Open the error message link in your browser (it shows in console), OR
2. Go to [Firebase Console](https://console.firebase.google.com)
3. Select your project: **top-chico-mart**
4. Navigate to: **Firestore Database** → **Indexes** → **Composite Indexes**
5. Click **Create Index**
6. Fill in:
   - **Collection ID:** `notifications`
   - **Fields to index:**
     - `isDeleted` - Ascending
     - `userId` - Ascending  
     - `createdAt` - Descending
7. Click **Create**

⏳ Index building takes 2-5 minutes. You'll see a "Building" status during this time.

Once completed, refresh your app and notifications should load.

## Alternative: Quick Link
Click this link from the error message in browser console to create automatically:
```
https://console.firebase.google.com/v1/r/project/top-chico-mart/firestore/indexes?create_composite=...
```

## Security Rules Issue (Separate)
If you see permission errors after index is created, check `FIRESTORE_SECURITY_RULES.txt` to ensure rules allow reading from `notifications` collection.
