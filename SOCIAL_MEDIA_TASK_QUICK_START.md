# Social Media Task System - Quick Start Guide

## ✅ What's Ready Now

### User Side (Earn Page)
1. **Social Media Task Card** - Beautiful card with gradient (purple to pink)
2. **6 Platform Options** - YouTube, Instagram, TikTok, Facebook, X, Telegram
3. **Interactive Selection** - Click platform to expand & fill details
4. **Form Fields** - Username input + proof file upload per platform
5. **Validation** - Min 3 platforms, all fields required
6. **Submit & Success** - Nice success message after submission
7. **Responsive Design** - Works on all screen sizes

**Location:** `src/app/earn/page.tsx` (Lines ~490-750)

### Admin Side (Verification Panel)
1. **Dashboard** - Statistics cards showing all submissions
2. **Filtering** - All, Pending, Approved, Rejected
3. **Submission Cards** - Shows all user info in expandable view
4. **Admin Notes** - Text area to add notes
5. **Approve/Reject** - Action buttons with confirmation
6. **Status Tracking** - Real-time updates from Firestore

**Location:** `src/app/admin/social-tasks/page.tsx`

---

## 🔧 How to Test It Now

### Step 1: Start the App
```bash
npm run dev
```

### Step 2: Test User Side
1. Go to `http://localhost:3000/earn`
2. Scroll down to "Social Media Task" card (purple/pink gradient)
3. Click on YouTube card → expands with fields
4. Enter: `@testchannel`
5. Upload: Any image file
6. Select 2 more platforms (Instagram, TikTok)
7. Click button: `Submit (3/3+)` → Success! ✅

### Step 3: Test Admin Side
1. Go to `http://localhost:3000/admin/social-tasks`
2. You should see your submission listed
3. Click on it to expand
4. Add note: "Verified following"
5. Click "Approve & Give Reward"
6. Status changes to ✅ APPROVED!

---

## 🎯 What Happens on Submission

**User fills form with:**
- Platform names (youtube, instagram, etc.)
- Their username on each platform
- Screenshot proof file

**System does:**
- Validates min 3 platforms selected
- Checks all fields are filled
- Saves to Firestore collection: `socialTaskSubmissions`

**Data saved:**
```javascript
{
  userId: "user-id",
  userName: "User Name",
  userEmail: "email@example.com",
  platforms: [
    { platform: "youtube", username: "@channel", proofFileName: "..." },
    { platform: "instagram", username: "@profile", proofFileName: "..." },
    { platform: "tiktok", username: "@account", proofFileName: "..." }
  ],
  approvalStatus: "pending",
  createdAt: "2026-04-16T10:30:00Z",
  adminNotes: ""
}
```

---

## 👨‍💼 Admin Verification Process

### For Pending Submissions:

1. **Review the submission**
   - Check user's details
   - See platforms they selected
   - Click "Proof" button to view screenshot

2. **Verify they actually followed**
   - Check user's screenshot shows follower count/profile
   - Confirm authentic follow (not fake)

3. **Make Decision**
   - ✅ **Approve** → Add reward (1 month free + ₹20)
   - ❌ **Reject** → Add reason in notes

4. **Add Notes** (optional)
   - "Verified authentic followers on all platforms"
   - Or rejection reason if rejecting

---

## 📊 Database Structure

### Firestore Collection: `socialTaskSubmissions`

**Sample Document:**
```
Document ID: auto_generated

userId: "user-12345"
userName: "Ahmed Khan"
userEmail: "ahmed@email.com"

platforms: [
  {
    platform: "youtube",
    username: "@AhmedKhanTV",
    proofFileName: "user-12345_youtube_1713264600000.jpg"
  },
  {
    platform: "instagram", 
    username: "@ahmtkhan",
    proofFileName: "user-12345_instagram_1713264600001.jpg"
  },
  {
    platform: "tiktok",
    username: "@ahmtkhan",
    proofFileName: "user-12345_tiktok_1713264600002.jpg"
  }
]

status: "submitted"
createdAt: "2026-04-16T10:30:00.000Z"

approvalStatus: "pending"
adminNotes: ""
reward: null
```

**After Admin Approves:**
```
approvalStatus: "approved"
adminNotes: "Verified authentic followers"
reward: {
  freeAccess: "1 month",
  walletCredit: 20
}
approvedAt: "2026-04-16T10:45:00.000Z"
```

---

## 🚀 Next Steps to Complete System

### 1. **Firebase Storage for Proof Files** 
```typescript
// Upload proof file when user submits
const storageRef = ref(storage, `social-tasks/${userId}/${platform}/proof.jpg`);
await uploadBytes(storageRef, file);
const url = await getDownloadURL(storageRef);
```

### 2. **Create Order When Approved**
```typescript
// Add to orders collection when admin approves
const order = {
  userId: submission.userId,
  planName: "Social Media Task",
  type: "social-task-completing",
  duration: "1 month",
  durationValue: 30,
  cost: 0,
  status: "active",
  startDate: new Date(),
  expiryDate: addMonths(new Date(), 1),
  platforms: submission.platforms.map(p => p.platform),
  submissionId: submission.id
};
```

### 3. **Add Wallet Credit**
```typescript
// Update user wallet when approved
const userRef = doc(db, "users", userId);
await updateDoc(userRef, {
  wallet: increment(20),
  walletHistory: arrayUnion({
    type: "social-task-reward",
    amount: 20,
    reason: "Social Media Task Completed",
    date: new Date(),
    submissionId: submission.id
  })
});
```

### 4. **Send Email Notification**
```typescript
// Send approval email to user
const mailOptions = {
  to: userEmail,
  subject: "Your Social Media Task Was Approved! 🎉",
  html: `
    <h2>Great News!</h2>
    <p>Your social media task has been approved.</p>
    <p>You've received:</p>
    <ul>
      <li>✓ 1 Month Free IPTV Access</li>
      <li>✓ ₹20 Wallet Credit</li>
    </ul>
    <p>Check your orders page to activate your free access!</p>
  `
};
```

---

## 📝 File Locations

| Component | File Path |
|-----------|-----------|
| User Form | `src/app/earn/page.tsx` |
| Admin Panel | `src/app/admin/social-tasks/page.tsx` |
| Firestore Config | `src/lib/firebase-config.ts` |
| Guide (This) | `SOCIAL_MEDIA_TASK_GUIDE.md` |

---

## 🔐 Firebase Settings Required

### 1. **Firestore Security Rules**
Add to your Firestore rules to allow submissions:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to create their own social task submissions
    match /socialTaskSubmissions/{submissionId} {
      allow read: if request.auth.uid != null;
      allow create: if request.auth.uid == request.resource.data.userId;
      allow update: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

### 2. **Firebase Storage Rules** (for proof files)
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /social-tasks/{userId}/{platform}/{fileName} {
      allow read: if request.auth.uid == userId || get(/databases/firestore/documents/users/$(request.auth.uid)).data.role == 'admin';
      allow write: if request.auth.uid == userId;
    }
  }
}
```

---

## ✨ Features Included

### User Features
- ✅ 6 social platform selection
- ✅ Interactive expandable cards
- ✅ File upload for each platform
- ✅ Form validation (min 3 platforms)
- ✅ Error messages
- ✅ Success confirmation
- ✅ Multiple submissions allowed
- ✅ Responsive mobile design
- ✅ Color-coded platforms
- ✅ Real-time feedback

### Admin Features
- ✅ Dashboard with statistics
- ✅ Filter by status (Pending/Approved/Rejected)
- ✅ View all submissions in cards
- ✅ Expandable details on click
- ✅ Download/view proof files
- ✅ Add admin notes
- ✅ Approve with one click
- ✅ Reject with confirmation
- ✅ Reward display (when approved)
- ✅ Real-time updates from Firestore

---

## 📱 UI/UX Notes

### Colors Used
- **Purple gradient** Social card background
- **Red** YouTube platform
- **Pink** Instagram platform  
- **Black** TikTok platform
- **Blue** Facebook platform
- **Sky** X (Twitter) platform
- **Cyan** Telegram platform

### Icons Used
```
CheckCircle2 - Approval status
XCircle - Rejection status
Clock - Pending status
Upload - Submit button
FileUp - File picker
Download - Download proof
AlertCircle - Error messages
Archive - Empty state
```

---

## 🧪 Example Test Cases

### Valid Submission
```
Platforms selected: YouTube, Instagram, TikTok ✓ (3 platforms)
YouTube username: @testchannel ✓
YouTube proof: screenshot.jpg ✓
Instagram username: @testprofile ✓
Instagram proof: proof.jpg ✓
TikTok username: @testtiktok ✓
TikTok proof: tiktok.png ✓
Result: ✅ APPROVED (can submit)
```

### Invalid Submission (Should show error)
```
Platforms selected: YouTube, Instagram ✗ (Only 2)
YouTube username: @testchannel ✓
YouTube proof: ✗ (No file)
Instagram username: ✓
Instagram proof: ✓
Result: ❌ ERROR - "Please select at least 3 platforms"
                - "Please upload proof for YouTube"
```

---

## 🎓 How It Works (Summary)

```
USER FLOW:
  1. Opens /earn page
  2. Sees "Social Media Task" card  
  3. Selects 3+ platforms
  4. Enters username for each
  5. Uploads proof screenshot
  6. Clicks Submit
  7. Data goes to Firestore
  8. Success message shown

ADMIN FLOW:
  1. Opens /admin/social-tasks
  2. Sees pending submissions
  3. Clicks to expand submission
  4. Reviews user & platforms
  5. Clicks Approve or Reject
  6. Firestore updated
  7. (Next: User gets reward notification)
```

---

## 🚨 Important Notes

1. **File uploads to Firestore** - Currently saves filename only, need Firebase Storage upload logic (marked in form handler)

2. **Reward distribution** - When approved, admin button works but actual order creation & wallet credit need backend implementation

3. **Email notifications** - Not yet integrated, need email service (SendGrid, Firebase, etc.)

4. **User verification** - Currently manual by admin, could add automated checks

5. **Proof file viewing** - "Proof" button doesn't download yet, needs file URL implementation

---

## 📞 Support

For errors:
- Check browser console (F12)
- Check Firestore rules allow access
- Verify Firebase is initialized
- Check user is logged in (required)
- Verify admin has `role: 'admin'` in Firestore

---

**Ready to test? Go to: `http://localhost:3000/earn`**

Good luck! 🚀
