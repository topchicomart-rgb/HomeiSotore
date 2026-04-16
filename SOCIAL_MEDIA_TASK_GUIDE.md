# Social Media Task System - Complete Guide

## Overview
The Social Media Task system allows users to follow your platform on social media channels and earn rewards (1 month free access + ₹20 wallet credit).

---

## User Side (Earn Page)

### Where It Lives
**Path:** `src/app/earn/page.tsx`

### How Users Use It

#### 1. **Selecting Platforms**
- Users see 6 platform options:
  - YouTube (Red)
  - Instagram (Pink)
  - TikTok (Black/Slate)
  - Facebook (Blue)
  - X/Twitter (Sky Blue)
  - Telegram (Cyan)

- **Minimum requirement:** Select at least 3 platforms
- **Click on any platform card** to expand and fill details

#### 2. **Filling Details for Each Platform**
For each selected platform, users must:

**a) Enter Account ID/Username**
- Placeholder text shown per platform
- Example: `@yourchannelname` for YouTube

**b) Upload Proof Screenshot**
- Click on the dashed border area to select file
- Accepted formats: Images, PDF, DOC, DOCX
- Shows filename after selection

#### 3. **Submit**
- Click **"Submit (3/3+)"** button (shows count of selected platforms)
- System validates:
  - ✓ Minimum 3 platforms selected
  - ✓ Username entered for each
  - ✓ Proof file uploaded for each

#### 4. **Success Message**
After submission:
- Green success card appears
- Message: "Submission Successful!"
- "Submit Another Task" button available
- User can submit multiple times (one person = 4-6 images proof)

### Features
- **Real-time UI feedback** - Form expands when platform selected
- **Color-coded platforms** - Easy to identify
- **File validation** - Ensures proof is uploaded
- **Responsive design** - Works on mobile & desktop

---

## Admin Side (Social Tasks Verification)

### Where It Lives
**Path:** `src/app/admin/social-tasks/page.tsx`

### Admin Dashboard Features

#### 1. **Statistics Cards**
Top of page shows:
- **Total Submissions** - All submissions ever
- **Pending Review** - Awaiting admin action (orange)
- **Approved** - Rewards given (green)
- **Rejected** - Not approved (red)

#### 2. **Filter Buttons**
Filter submissions by status:
- All
- Pending (shows only pending)
- Approved (shows only approved)
- Rejected (shows only rejected)

#### 3. **Submission Cards**
Each card shows:

**Header Section:**
- User name
- Status badge (PENDING / APPROVED / REJECTED)
- Email address
- Date submitted

**Platforms Section:**
- List of all platforms submitted
- Each platform shows:
  - Icon (color-coded)
  - Platform name
  - Username entered by user
  - **"Proof" button** - Click to download/view proof file

**Expandable Details (Click card to expand):**
- **Admin Notes textarea** - Add notes about this submission
- **Action Buttons** (only for pending):
  - ✅ **Approve & Give Reward** (Green)
    - Marks submission as APPROVED
    - User receives: 1 month free access + ₹20 wallet credit
    - Saves admin notes
  - ❌ **Reject** (Red outline)
    - Marks submission as REJECTED
    - Requires confirmation click
    - Saves rejection reason in admin notes

**Reward Display (for approved):**
- Shows green box with:
  - Free access: 1 month
  - Wallet credit: ₹20

---

## Database Structure (Firestore)

### Collection: `socialTaskSubmissions`

**Document Fields:**

```javascript
{
  id: "auto-generated",
  userId: "user-id-from-auth",
  userName: "User's Name",
  userEmail: "user@email.com",
  
  // Array of platforms submitted
  platforms: [
    {
      platform: "youtube",
      username: "@channelname",
      proofFileName: "userid_youtube_timestamp.jpg"
    },
    {
      platform: "instagram",
      username: "@profilename",
      proofFileName: "userid_instagram_timestamp.jpg"
    }
    // ... more platforms
  ],
  
  status: "submitted",
  createdAt: "2026-04-16T10:30:00.000Z",
  
  // Admin fields
  approvalStatus: "pending" | "approved" | "rejected",
  adminNotes: "Optional admin notes",
  reward: {
    freeAccess: "1 month",
    walletCredit: 20
  } | null,
  approvedAt: "2026-04-16T11:00:00.000Z" (if approved),
  rejectedAt: "2026-04-16T11:00:00.000Z" (if rejected)
}
```

---

## Workflow

### User Journey
```
1. User visits /earn page
2. Sees "Social Media Task" card with 6 platform options
3. Clicks on 3+ platforms they want to follow
4. Enters their username/ID for each platform
5. Uploads proof screenshot for each
6. Clicks "Submit (count/3+)"
7. System validates all fields
8. Submission sent to Firestore collection
9. Success message shown
10. Can submit again if needed
```

### Admin Workflow
```
1. Admin visits /admin/social-tasks
2. Sees dashboard with stats
3. Filters by "Pending" to see new submissions
4. Clicks on submission card to expand
5. Reviews user info & platform details
6. Downloads proof files to verify
7. Adds admin notes if needed
8. Clicks "Approve & Give Reward" OR "Reject"
9. System updates Firestore
10. User receives notification/reward (TO BE IMPLEMENTED)
```

---

## Implementation Status

### ✅ Completed
- [x] User form with 6 platforms (UI fully styled)
- [x] File upload for proof per platform
- [x] Form validation (min 3 platforms)
- [x] Firestore submission collection
- [x] Admin dashboard with filtering
- [x] Status tracking (pending/approved/rejected)
- [x] Admin notes system
- [x] Responsive design (mobile & desktop)

### ⏳ To Be Implemented (Next Steps)

#### 1. **File Upload Storage**
```
When user submits, upload proof files to Firebase Storage:
- Path: /social-tasks/{userId}/{platform}/{timestamp}.extension
- Link stored in proofFileName field
```

#### 2. **User Notifications**
```
When admin approves:
- Send email to user
- Show in-app notification
- Message: "Your social media task was approved! 1 month free + ₹20 added"
```

#### 3. **Order Creation**
```
When admin approves, create order for 1 month free:
- Collection: orders
- Plan: Social Media Task Completion
- Duration: 1 month
- Cost: Free (0 ₹)
- Status: active
```

#### 4. **Wallet Credit Addition**
```
When admin approves:
- Update user wallet: +₹20
- Create wallet transaction entry
- Show in user's wallet history
```

#### 5. **Orders Page Display**
```
Show in /orders page:
- Order type: "Social Task Earning"
- Platforms completed: "YouTube, Instagram, TikTok"
- Reward: "1 month free"
- Date approved: "YYYY-MM-DD"
```

#### 6. **Email Templates**
```
Create email templates for:
- Submission confirmation
- Approval notification with reward details
- Rejection notification with reason
```

---

## Key Features Explained

### Platform Colors
| Platform | Color | Icon | Primary Color |
|----------|-------|------|--------------|
| YouTube | Red | Play | #ef4444 |
| Instagram | Pink | Camera | #ec4899 |
| TikTok | Black | Music | #000000 |
| Facebook | Blue | Facebook | #2563eb |
| X (Twitter) | Sky | Mail | #0ea5e9 |
| Telegram | Cyan | Send | #06b6d4 |

### Form Validation Rules
```javascript
// User side
- Minimum 3 platforms selected
- Each platform must have:
  - Username/ID filled (non-empty)
  - Proof file uploaded
  
// Admin side
- Can approve: adds reward to Firestore
- Can reject: with optional rejection reason
- Can add notes: visible in record
```

### Status Flow
```
PENDING (Initial)
   ↓
APPROVED (Admin clicks approve)
   ├→ User gets reward
   └→ Shows in admin dashboard as APPROVED
   
OR
   ↓
REJECTED (Admin clicks reject)
   └→ Shows in admin dashboard as REJECTED
```

---

## Admin Manual Verification Process

Since this requires **manual human verification**, the admin should:

### Step 1: Open Admin Dashboard
- Go to `/admin/social-tasks`
- Filter by "Pending"

### Step 2: Review Each Submission
- Click submission card to expand
- Check: User name, email, submitted date
- Review platforms selected

### Step 3: Verify Proof Files
- Click "Proof" button for each platform
- Download or view the screenshot
- Verify user actually followed the account

### Step 4: Make Decision
- ✅ If real follower: Click "Approve & Give Reward"
- ❌ If fake/no proof: Click "Reject"
- Add notes explaining decision

### Step 5: Reward Processing
- When approved, user automatically receives:
  - 1 month free IPTV access (appears in orders)
  - ₹20 wallet credit (appears in wallet)
  - Email notification

---

## User Experience Flow (Visual)

```
EARN PAGE
├── Stats Cards (Revenue, etc.)
├── Referral Code & Link
├── Apply Referral Code
├── Your Referrals List
│
└── SOCIAL MEDIA TASK CARD (NEW)
    ├── Header: "Social Media Task"
    ├── Rewards: "1 month free + ₹20 wallet"
    ├── Instructions box
    │
    ├── 6 Platform Cards (expandable grid)
    │   ├── YouTube
    │   ├── Instagram
    │   ├── TikTok
    │   ├── Facebook
    │   ├── X (Twitter)
    │   └── Telegram
    │
    ├── Each Platform (when selected):
    │   ├── Username input
    │   └── Proof file upload
    │
    ├── Selected count display
    └── Submit button (disabled if < 3 selected)
```

---

## Admin Experience Flow (Visual)

```
ADMIN - SOCIAL TASKS PAGE
├── Header: "Social Tasks Verification"
│
├── Statistics Cards
│   ├── Total: X
│   ├── Pending: Y (orange)
│   ├── Approved: Z (green)
│   └── Rejected: W (red)
│
├── Filter Buttons: [ALL] [PENDING] [APPROVED] [REJECTED]
│
└── Submission Cards (List)
    ├── Each card shows:
    │   ├── User name + Status badge
    │   ├── Email + Submission date
    │   ├── Platforms with usernames
    │   └── [Proof] buttons for each
    │
    └── Click card to expand:
        ├── Admin Notes textarea
        ├── [Approve & Give Reward] button
        ├── [Reject] button
        └── Reward summary (if approved)
```

---

## API Endpoints & Functions (To Be Created)

```typescript
// approval.ts
export async function approveSocialTask(
  submissionId: string,
  adminNotes: string
): Promise<void> {
  // 1. Update submission status to approved
  // 2. Create order for 1 month free
  // 3. Add ₹20 to user wallet
  // 4. Send notification email
}

export async function rejectSocialTask(
  submissionId: string,
  rejectionReason: string
): Promise<void> {
  // 1. Update submission status to rejected
  // 2. Save rejection reason
  // 3. Send rejection email
}

// notification.ts
export async function sendApprovalEmail(
  userEmail: string,
  userName: string,
  platforms: string[]
): Promise<void> {
  // Send email with approval notification & reward details
}
```

---

## Testing Checklist

### User Side
- [ ] Can select 1-2 platforms (button disabled)
- [ ] Can select 3+ platforms (button enabled)
- [ ] Platform cards expand when selected
- [ ] Can enter username for each platform
- [ ] Can upload file for each platform
- [ ] Validation shows error if missing username
- [ ] Validation shows error if missing proof
- [ ] Success message shows after submission
- [ ] Can submit again after first submission
- [ ] Mobile layout works (all platforms visible)
- [ ] Proof file shows filename after selection

### Admin Side
- [ ] Can see all submissions on dashboard
- [ ] Statistics cards show correct counts
- [ ] Filters work (Pending, Approved, Rejected)
- [ ] Can click submission to expand
- [ ] Can add admin notes
- [ ] Can approve submission
- [ ] Can reject submission
- [ ] Status changes reflect immediately
- [ ] Approved shows reward details
- [ ] Proof button is clickable
- [ ] Multiple submissions display correctly

---

## Questions & Support

For issues or clarifications:
1. Check the Todo list at top of page.tsx
2. Review the Firestore collection structure
3. Verify Firebase security rules allow reads/writes
4. Check browser console for errors

---

**Version:** 1.0.0  
**Last Updated:** April 16, 2026
