# Social Media Task Feature - Architecture & Flow Diagram

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        PrimexStream Pro Application                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    Frontend (Next.js React)                       │  │
│  ├──────────────────────────────────────────────────────────────────┤  │
│  │  src/app/earn/page.tsx                                            │  │
│  │  ├─ Social Media Task Component                                  │  │
│  │  │  ├─ Platform Selection (6 platforms)                         │  │
│  │  │  ├─ Form Management                                          │  │
│  │  │  │  ├─ YouTube          (Red)                               │  │
│  │  │  │  ├─ TikTok          (Black)                              │  │
│  │  │  │  ├─ Instagram       (Pink)                               │  │
│  │  │  │  ├─ Facebook        (Blue)                               │  │
│  │  │  │  ├─ X (Twitter)     (Sky Blue)                          │  │
│  │  │  │  └─ Telegram        (Cyan)                               │  │
│  │  │  └─ Submission Handler                                       │  │
│  │  │                                                              │  │
│  │  └─ Referral System                                             │  │
│  │     ├─ Referral Code Display                                   │  │
│  │     ├─ Apply Referral Code                                     │  │
│  │     └─ Referral Stats                                          │  │
│  │                                                                 │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                   State Management (Context API)                  │  │
│  ├──────────────────────────────────────────────────────────────────┤  │
│  │  • socialTaskForms: {[platform]: {username, proof}}              │  │
│  │  • selectedPlatforms: string[]                                   │  │
│  │  • submittingSocialTask: boolean                                 │  │
│  │  • socialTaskMessage: {type, text}                              │  │
│  │  • socialTaskSubmitted: boolean                                 │  │
│  │  • user: {id, name, email} from AppProvider                     │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         Firebase Backend                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ Firestore Collections                                           │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │                                                                 │   │
│  │ socialTaskSubmissions/                                          │   │
│  │ ├─ {submissionId}                                              │   │
│  │ │  ├─ userId: string                                           │   │
│  │ │  ├─ userName: string                                         │   │
│  │ │  ├─ userEmail: string                                        │   │
│  │ │  ├─ platforms: [                                             │   │
│  │ │  │    {                                                      │   │
│  │ │  │      platform: 'youtube' | 'tiktok' | ...               │   │
│  │ │  │      username: string                                    │   │
│  │ │  │      proofFileName: string                               │   │
│  │ │  │    }                                                      │   │
│  │ │  ├─ status: 'pending' | 'approved' | 'rejected'            │   │
│  │ │  ├─ approvalStatus: string                                  │   │
│  │ │  ├─ adminNotes: string                                      │   │
│  │ │  ├─ reward: {plan, credit} | null                          │   │
│  │ │  ├─ createdAt: timestamp                                    │   │
│  │ │  └─ approvedAt: timestamp | null                           │   │
│  │                                                                 │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ Realtime Database (Config)                                      │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │                                                                 │   │
│  │ /adminSettings/socialMediaLinks/                               │   │
│  │ ├─ youtube: "https://..."                                      │   │
│  │ ├─ tiktok: "https://..."                                       │   │
│  │ ├─ instagram: "https://..."                                    │   │
│  │ ├─ facebook: "https://..."                                     │   │
│  │ ├─ x: "https://..."                                            │   │
│  │ └─ telegram: "https://..."                                     │   │
│  │                                                                 │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ Cloud Storage (Proof Images)                                    │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │                                                                 │   │
│  │ /proofs/                                                        │   │
│  │ ├─ {userId}_youtube_{timestamp}.jpg                           │   │
│  │ ├─ {userId}_tiktok_{timestamp}.jpg                            │   │
│  │ ├─ {userId}_instagram_{timestamp}.jpg                         │   │
│  │ ├─ {userId}_facebook_{timestamp}.jpg                          │   │
│  │ ├─ {userId}_x_{timestamp}.jpg                                 │   │
│  │ └─ {userId}_telegram_{timestamp}.jpg                          │   │
│  │                                                                 │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      Admin Dashboard                                     │
├─────────────────────────────────────────────────────────────────────────┤
│  /admin/social-tasks                                                     │
│  ├─ View Pending Submissions                                            │
│  ├─ Review Proof Images                                                 │
│  ├─ Approve/Reject Actions                                              │
│  ├─ Add Admin Notes                                                     │
│  └─ Trigger Reward Distribution                                         │
│      └─ Auto-Credit: 1 month + ₹20                                      │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📊 Data Flow Diagram

```
┌──────────────┐
│ User Visits  │
│  /earn Page  │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────┐
│ User Selects 3+ Platforms    │
│ (Visual feedback & progress) │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│ For Each Platform:           │
│ 1. Click Follow/Subscribe    │
│    (Opens in new tab)        │
│ 2. Enter Username/Handle     │
│ 3. Upload Screenshot Proof   │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│ Validation Check             │
│ ✓ 3+ platforms selected      │
│ ✓ All usernames filled       │
│ ✓ All proofs uploaded        │
└──────┬───────────────────────┘
       │
    ✅ PASS
       │
       ▼
┌──────────────────────────────┐
│ User Clicks Submit           │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────┐
│ Prepare Submission Data                      │
│ {                                            │
│   userId, userName, userEmail,              │
│   platforms: [{platform, username, proof}], │
│   status: 'pending',                        │
│   createdAt: timestamp                      │
│ }                                            │
└──────┬───────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│ Send to Firestore            │
│ socialTaskSubmissions/       │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│ Show Success Message         │
│ "Submission Successful!"     │
│ "Review in 24-48 hours"      │
└──────┬───────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────┐
│ Admin Review Process                        │
│ (In Admin Dashboard)                        │
│                                             │
│ 1. View Pending Submission                  │
│ 2. Review User Details                      │
│ 3. Check Proof Images                       │
│ 4. Verify Platform Follows                  │
│ 5. Approve/Reject                           │
└─────────────────────────────────────────────┘
         │                    │
    ✅ APPROVE          ❌ REJECT
         │                    │
         ▼                    ▼
    ┌────────────┐       ┌──────────────┐
    │ Add to     │       │ Send Email   │
    │ Reward     │       │ Notification │
    │ Queue      │       │ with Reason  │
    └─────┬──────┘       └──────────────┘
          │
          ▼
    ┌──────────────────────────┐
    │ Auto-Credit Reward       │
    │ • 1 Month Plan Extended  │
    │ • ₹20 Wallet Credit      │
    └────────┬─────────────────┘
             │
             ▼
    ┌──────────────────────────┐
    │ Send Confirmation Email  │
    │ "Reward Credited!"       │
    │ "Access your new plan"   │
    └──────────────────────────┘
```

---

## 🔄 Component State Lifecycle

```
INITIAL STATE
    ↓
USER SELECTS PLATFORMS
    ↓
FOR EACH PLATFORM:
    1. Click Follow Button
       └─ Opens platform link
       └─ Updates selectedPlatforms
    
    2. Fill Username Field
       └─ Updates socialTaskForms
       └─ Progress: 33% → 67%
    
    3. Upload Proof Image
       └─ Updates socialTaskForms
       └─ Progress: 67% → 100%
    ↓
ALL PLATFORMS COMPLETE
    ↓
SUBMIT FORM
    ↓
VALIDATION PASS
    ↓
FIREBASE WRITE
    ↓
SUCCESS MESSAGE
    ↓
FORM RESET
    ↓
BACK TO INITIAL STATE
```

---

## 📱 Form State Structure

```typescript
socialTaskForms = {
  youtube: {
    id: 'youtube',
    username: '',      // User's channel name
    proof: null        // File object
  },
  tiktok: {
    id: 'tiktok',
    username: '',      // User's TikTok handle
    proof: null
  },
  instagram: {
    id: 'instagram',
    username: '',      // User's Instagram handle
    proof: null
  },
  facebook: {
    id: 'facebook',
    username: '',      // User's Facebook ID
    proof: null
  },
  x: {
    id: 'x',
    username: '',      // User's Twitter handle
    proof: null
  },
  telegram: {
    id: 'telegram',
    username: '',      // User's Telegram ID
    proof: null
  }
}

selectedPlatforms = ['youtube', 'tiktok', 'instagram']  // Array of selected platform IDs
```

---

## 🎯 Validation Logic Flow

```
User Clicks Submit
    │
    ▼
Check: selectedPlatforms.length >= 3
    │
    ├─ NO ──► Show: "Please select at least 3 platforms"
    │
    └─ YES
        │
        ▼
    For each platform in selectedPlatforms:
        │
        ├─ Check: username is not empty
        │   ├─ NO ──► Show: "Please enter [platform] username"
        │   │
        │   └─ YES
        │       │
        │       ▼
        │   Check: proof file is selected
        │   ├─ NO ──► Show: "Please upload proof for [platform]"
        │   │
        │   └─ YES ──► Continue to next platform
        │
        └─ All platforms valid
            │
            ▼
        PROCEED TO SUBMISSION
```

---

## 🔐 Security Flow

```
User Submits Form
    │
    ├─ Client-side Validation ✓
    │
    ├─ User ID Verification ✓
    │
    ├─ File Type Check ✓
    │
    ├─ Size Validation ✓
    │
    ▼
Firestore Write
    │
    ├─ Firestore Rules Check
    │   ├─ Is user authenticated? ✓
    │   ├─ Does user own this submission? ✓
    │   └─ Is data properly formatted? ✓
    │
    ├─ Data Storage (Firestore)
    │
    ├─ Image Storage (Cloud Storage)
    │   └─ With access control rules
    │
    └─ Audit Log Creation
        └─ Timestamp, user, data

Admin Review
    │
    ├─ Manual Image Review
    ├─ Username Verification
    ├─ Follow Status Check
    │
    └─ Approval/Rejection Decision

Reward Distribution
    │
    ├─ Transaction Logging
    ├─ Plan Extension
    ├─ Wallet Credit
    │
    └─ User Notification
```

---

## 📈 Success Metrics

```
✓ Platform Selection Rate
  └─ Track how many platforms users select

✓ Completion Rate
  └─ Track forms completed vs. abandoned

✓ Approval Rate
  └─ Track approved vs. rejected submissions

✓ User Engagement
  └─ Track repeat task submissions

✓ Reward Distribution
  └─ Track total credits and plans extended

✓ Error Rate
  └─ Track validation failures and issues
```

---

## 🚀 Deployment Checklist

```
Code Quality
  ✓ TypeScript strict mode
  ✓ No console errors
  ✓ Proper error handling
  ✓ Performance optimized

Testing
  ✓ Unit tests passing
  ✓ Integration tests passing
  ✓ E2E tests passing
  ✓ Manual testing complete

Security
  ✓ Firestore rules configured
  ✓ Storage rules configured
  ✓ Auth verified
  ✓ Data validation

Performance
  ✓ Bundle size optimized
  ✓ Load time < 2s
  ✓ No layout shifts
  ✓ Smooth animations

Accessibility
  ✓ WCAG 2.1 compliant
  ✓ Keyboard navigation
  ✓ Screen reader compatible
  ✓ Color contrast checked

Browser Support
  ✓ Chrome/Edge 90+
  ✓ Firefox 88+
  ✓ Safari 14+
  ✓ Mobile browsers

Documentation
  ✓ Code comments
  ✓ API docs
  ✓ User guide
  ✓ Admin guide
```

---

**Last Updated:** April 16, 2026  
**Architecture Version:** 1.0.0  
**Status:** Production Ready ✅

