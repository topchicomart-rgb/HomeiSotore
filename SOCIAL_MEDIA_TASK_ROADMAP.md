# Social Media Task - Implementation Roadmap

## Phase 1: ✅ COMPLETED - UI & Form System

### What's Done
- [x] Beautiful dual-platform form system (user & admin)
- [x] 6 social media platforms with proper styling
- [x] File upload inputs for proof screenshots
- [x] Form validation (minimum 3 platforms)
- [x] Admin dashboard with filters and expansion
- [x] Firestore collection structure ready
- [x] Responsive design (mobile & desktop)
- [x] Dark mode support

---

## Phase 2: 🚀 READY TO BUILD - File Storage

### What Needs to Happen

#### Task 1: Setup Firebase Storage Upload
**File:** `src/lib/social-task-service.ts` (CREATE NEW)

```typescript
import { storage } from '@/lib/firebase-config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export async function uploadProofFile(
  userId: string,
  platform: string,
  file: File
): Promise<string> {
  const fileName = `${userId}_${platform}_${Date.now()}`;
  const filePath = `social-tasks/${userId}/${platform}/${fileName}`;
  const storageRef = ref(storage, filePath);
  
  // Upload file
  await uploadBytes(storageRef, file);
  
  // Get download URL
  const downloadUrl = await getDownloadURL(storageRef);
  return downloadUrl;
}

export async function deleteProofFile(filePath: string): Promise<void> {
  const storageRef = ref(storage, filePath);
  // await deleteObject(storageRef);
}
```

#### Task 2: Update Earn Page to Upload Files
**File:** `src/app/earn/page.tsx` (UPDATE)

In `handleSubmitSocialTask` function, add:

```typescript
// After validation, before Firestore save:
const uploadedPlatforms = await Promise.all(
  selectedPlatforms.map(async (platform) => {
    const file = socialTaskForms[platform].proof;
    const downloadUrl = await uploadProofFile(
      user.id,
      platform,
      file
    );
    
    return {
      platform,
      username: socialTaskForms[platform].username,
      proofUrl: downloadUrl,  // NEW: Download URL
      proofFileName: `${platform}_proof`,
    };
  })
);

// Then save with URLs
const submissionData = {
  // ... existing fields
  platforms: uploadedPlatforms,  // Now includes proofUrl
};
```

#### Task 3: Update Admin Panel to Show/Download Proof
**File:** `src/app/admin/social-tasks/page.tsx` (UPDATE)

```typescript
// In Proof button onClick:
<Button
  onClick={(e) => {
    e.stopPropagation();
    if (platform.proofUrl) {
      window.open(platform.proofUrl, '_blank');
    }
  }}
>
  <Download className="w-3 h-3" />
  View
</Button>
```

#### Firebase Storage Rules Required
**Console:** Go to Firebase Console > Storage > Rules

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /social-tasks/{userId}/{platform}/{fileName} {
      allow read: if request.auth.uid == userId || 
                     get(/databases/firestore/documents/users/$(request.auth.uid)).data.role == 'admin';
      allow write: if request.auth.uid == userId;
      allow delete: if get(/databases/firestore/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

---

## Phase 3: 💰 Rewards System - Wallet & Orders

### What Needs to Happen

#### Task 1: Create Order on Approval
**File:** Create `src/lib/social-task-approval-service.ts`

```typescript
import { db } from '@/lib/firebase-config';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

export async function createFreeAccessOrder(
  userId: string,
  submissionId: string
): Promise<string> {
  const ordersRef = collection(db, 'orders');
  
  const order = {
    userId,
    planName: 'Social Media Task Completion',
    planType: 'SOCIAL_TASK_FREE',
    duration: 30, // days
    price: 0,
    discount: 0,
    finalPrice: 0,
    status: 'active',
    
    // Dates
    createdAt: Timestamp.now(),
    startDate: Timestamp.now(),
    expiryDate: Timestamp.fromDate(
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    ),
    
    // Reference
    submissionId,
    paymentMethod: 'social-task-reward',
    
    // Details
    device: 'all-devices',
    ipTVPlan: 'premium', // or whatever your package is
  };
  
  const docRef = await addDoc(ordersRef, order);
  return docRef.id;
}
```

#### Task 2: Add Wallet Credit
**File:** Create `src/lib/wallet-service.ts`

```typescript
import { db } from '@/lib/firebase-config';
import { doc, updateDoc, increment, arrayUnion, Timestamp } from 'firebase/firestore';

export async function addWalletCredit(
  userId: string,
  amount: number,
  reason: string,
  submissionId: string
): Promise<void> {
  const userRef = doc(db, 'users', userId);
  
  const transaction = {
    type: 'credit',
    amount,
    reason,
    submissionId,
    date: Timestamp.now(),
    balance: increment(amount), // Auto-increment
  };
  
  await updateDoc(userRef, {
    wallet: increment(amount),
    walletTransactions: arrayUnion(transaction),
  });
}
```

#### Task 3: Update Admin Panel to Call Approval
**File:** `src/app/admin/social-tasks/page.tsx` (UPDATE)

```typescript
const handleApprove = async (submissionId: string) => {
  setProcessingId(submissionId);
  try {
    const submissionRef = doc(db, 'socialTaskSubmissions', submissionId);
    const submission = submissions.find(s => s.id === submissionId);
    
    // 1. Update submission status
    await updateDoc(submissionRef, {
      approvalStatus: 'approved',
      adminNotes: adminNotesText,
      approvedAt: new Date().toISOString(),
    });
    
    // 2. Create free access order
    const orderId = await createFreeAccessOrder(
      submission.userId,
      submissionId
    );
    
    // 3. Add wallet credit
    await addWalletCredit(
      submission.userId,
      20,
      'Social Media Task Reward',
      submissionId
    );
    
    // 4. Update submission with reward info
    await updateDoc(submissionRef, {
      reward: {
        orderId,
        freeAccess: '1 month',
        walletCredit: 20,
      },
    });
    
    alert('✅ Approved! 1 month free + ₹20 wallet credit given to user');
    setSelectedSubmissionId(null);
    setAdminNotesText('');
  } catch (error) {
    console.error('Error:', error);
    alert('❌ Error approving submission');
  } finally {
    setProcessingId(null);
  }
};
```

#### Firestore Rules Update
Add to your Firestore security rules:

```
// Allow reading own data
match /users/{userId} {
  allow read: if request.auth.uid == userId || get(/databases/firestore/documents/users/$(request.auth.uid)).data.role == 'admin';
  allow update: if request.auth.uid == userId || get(/databases/firestore/documents/users/$(request.auth.uid)).data.role == 'admin';
}

// Allow creating orders
match /orders/{orderId} {
  allow read: if resource.data.userId == request.auth.uid || get(/databases/firestore/documents/users/$(request.auth.uid)).data.role == 'admin';
  allow create: if request.auth.uid != null;
  allow update: if get(/databases/firestore/documents/users/$(request.auth.uid)).data.role == 'admin';
}
```

---

## Phase 4: 📧 Email Notifications

### What Needs to Happen

#### Task 1: Setup Email Service
Choose one:
- **Firebase Functions + SendGrid** (Recommended)
- **Mailgun API**
- **AWS SES**
- **Custom SMTP**

#### Task 2: Create Cloud Function
**File:** `functions/src/social-task-emails.ts`

```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

exports.sendApprovalEmail = functions.firestore
  .document('socialTaskSubmissions/{submissionId}')
  .onUpdate(async (change, context) => {
    const newData = change.after.data();
    const oldData = change.before.data();
    
    // Only send if status changed to approved
    if (oldData.approvalStatus !== 'approved' && newData.approvalStatus === 'approved') {
      const msg = {
        to: newData.userEmail,
        from: 'rewards@primexstream.com',
        subject: '🎉 Your Social Media Task Was Approved!',
        html: `
          <h2>Congratulations, ${newData.userName}!</h2>
          <p>Your social media task submission has been approved! 🎊</p>
          
          <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Your Rewards:</h3>
            <ul>
              <li>✅ <strong>1 Month Free IPTV Access</strong> - Activated now</li>
              <li>💰 <strong>₹20 Wallet Credit</strong> - Added to your account</li>
            </ul>
          </div>
          
          <p><strong>Platforms Verified:</strong></p>
          <ul>
            ${newData.platforms.map((p: any) => `<li>${p.platform}: @${p.username}</li>`).join('')}
          </ul>
          
          <p>Check your orders page to see your new 1-month free subscription!</p>
          <p>Thank you for following us! Keep enjoying exclusive content.</p>
          
          <p>Best regards,<br/>PrimexStream Team</p>
        `,
      };
      
      await sgMail.send(msg);
    }
  });

exports.sendRejectionEmail = functions.firestore
  .document('socialTaskSubmissions/{submissionId}')
  .onUpdate(async (change, context) => {
    const newData = change.after.data();
    const oldData = change.before.data();
    
    // Only send if status changed to rejected
    if (oldData.approvalStatus !== 'rejected' && newData.approvalStatus === 'rejected') {
      const msg = {
        to: newData.userEmail,
        from: 'support@primexstream.com',
        subject: 'Social Media Task Submission - Not Approved',
        html: `
          <h2>Hello ${newData.userName},</h2>
          <p>Thanks for submitting your social media task!</p>
          
          <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Status:</strong> Not Approved</p>
            <p><strong>Reason:</strong> ${newData.adminNotes}</p>
          </div>
          
          <p>You can try again or contact support for assistance.</p>
          
          <p>Best regards,<br/>PrimexStream Team</p>
        `,
      };
      
      await sgMail.send(msg);
    }
  });
```

#### Task 3: Deploy Functions
```bash
cd functions
firebase deploy --only functions
```

---

## Phase 5: 🎯 Display in Orders Page

### What Needs to Happen

#### Task 1: Update Orders Page
**File:** `src/app/orders/page.tsx` (UPDATE)

Show social task orders differently:

```typescript
{order.planType === 'SOCIAL_TASK_FREE' && (
  <Card className="p-6 glass glass-light dark:glass border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-900/10">
    <div className="flex items-start justify-between mb-4">
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          🎉 Social Media Reward
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          1 Month Free - Earned by completing social media tasks
        </p>
      </div>
      <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-semibold rounded-full">
        ACTIVE
      </span>
    </div>
    
    <div className="grid grid-cols-2 gap-4">
      <div>
        <p className="text-xs text-slate-600 dark:text-slate-400">Earned on</p>
        <p className="text-sm font-bold text-slate-900 dark:text-white">
          {order.createdAt.toDate().toLocaleDateString()}
        </p>
      </div>
      <div>
        <p className="text-xs text-slate-600 dark:text-slate-400">Expiries on</p>
        <p className="text-sm font-bold text-slate-900 dark:text-white">
          {order.expiryDate.toDate().toLocaleDateString()}
        </p>
      </div>
    </div>
    
    {order.planDetails?.platforms && (
      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
          Platforms Followed:
        </p>
        <div className="flex flex-wrap gap-2">
          {order.planDetails.platforms.map((platform: string) => (
            <span key={platform} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs rounded">
              {platform}
            </span>
          ))}
        </div>
      </div>
    )}
  </Card>
)}
```

---

## Phase 6: 💎 Dashboard Statistics

### What Needs to Happen

#### Task 1: Add Stats Component
**File:** `src/app/admin/social-tasks/page.tsx` (UPDATE)

Add insights below the stats:

```typescript
<Card className="p-6 glass glass-light dark:glass">
  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
    Insights
  </h3>
  
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    <div>
      <p className="text-xs text-slate-600 dark:text-slate-400">Most Popular Platform</p>
      <p className="text-lg font-bold text-slate-900 dark:text-white">
        { /* Calculate from data */ }
      </p>
    </div>
    <div>
      <p className="text-xs text-slate-600 dark:text-slate-400">Approval Rate</p>
      <p className="text-lg font-bold text-green-600 dark:text-green-400">
        {stats.approved / stats.total * 100}%
      </p>
    </div>
    <div>
      <p className="text-xs text-slate-600 dark:text-slate-400">Rewards Given</p>
      <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
        ₹{(stats.approved * 20).toLocaleString()}
      </p>
    </div>
    <div>
      <p className="text-xs text-slate-600 dark:text-slate-400">Free Months Given</p>
      <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
        {stats.approved}
      </p>
    </div>
  </div>
</Card>
```

---

## Summary Table

| Phase | Status | Component | Est. Time |
|-------|--------|-----------|-----------|
| **1: UI & Forms** | ✅ DONE | User form + Admin panel | - |
| **2: File Storage** | 🚀 NEXT | Firebase Storage upload | 2-3 hours |
| **3: Rewards** | 📋 PLANNED | Orders + Wallet credit | 3-4 hours |
| **4: Emails** | 📋 PLANNED | Firebase Functions + SendGrid | 2-3 hours |
| **5: Orders Display** | 📋 PLANNED | Show in /orders page | 1-2 hours |
| **6: Analytics** | 📋 PLANNED | Dashboard stats | 1 hour |

**Total Time Remaining: ~10-12 hours of development**

---

## Quick Implementation Checklist

- [ ] **Phase 2:** Setup Firebase Storage + Update earn page + Admin panel
- [ ] **Phase 3:** Create approval service + Update admin button + Add Firestore rules
- [ ] **Phase 4:** Setup email service + Deploy Cloud Functions
- [ ] **Phase 5:** Update orders page layout
- [ ] **Phase 6:** Add analytics/insights cards
- [ ] **Testing:** Test full flow from submission → approval → rewards
- [ ] **Documentation:** Update user guides

---

## Git Commits Recommended

```bash
git add .
git commit -m "feat: add firebase storage for proof uploads"
git commit -m "feat: implement order creation and wallet credits"
git commit -m "feat: setup email notifications for approvals"
git commit -m "feat: display social task rewards on orders page"
git commit -m "feat: add analytics insights to admin dashboard"
```

---

Good luck with the implementation! 🚀
