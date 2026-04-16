# Admin Panel Setup Guide

## 🔐 Admin Panel Features

The admin panel is now fully integrated into your PrimeXstream Pro website with:

- **Hidden Route**: `/admin/login` (only accessible to admin email)
- **Plans Management**: Create, edit, delete IPTV plans
- **Orders Management**: Approve/reject orders with credentials
- **Dashboard**: Real-time statistics and overview
- **Settings**: Payment instructions, bank accounts, maintenance mode

## 📋 Environment Configuration

Add this to your `.env.local`:

```env
NEXT_PUBLIC_ADMIN_EMAIL=admin@primexstream.com
```

Change `admin@primexstream.com` to your actual admin email address.

## 🗄️ Firestore Collections Setup

The admin panel uses these Firestore collections:

### 1. `plans` Collection
```javascript
{
  name: string,              // Plan name (e.g., "Premium IPTV")
  price: number,             // Original price ($)
  discount: number,          // Discount amount ($)
  durationDays: number,      // Duration in days
  isActive: boolean,         // Whether plan is visible to customers
  createdAt: timestamp       // Auto-generated
}
```

### 2. `orders` Collection
```javascript
{
  userId: string (optional), // User ID if logged in
  userEmail: string,         // User email (required)
  planId: string,            // Plan ID
  planName: string,          // Plan name for reference
  amount: number,            // Order amount
  status: string,            // "pending" | "approved" | "rejected"
  paymentMethod: string,     // Payment method used
  paymentProof: string,      // URL to payment proof image
  credentials: {             // Only when approved
    username: string,
    password: string,
    url: string,
    expiryDate: string
  },
  rejectReason: string,      // Only when rejected
  createdAt: timestamp       // Auto-generated
}
```

### 3. `settings` Collection
Single document with ID `general`:
```javascript
{
  paymentInstructions: string,     // Payment guide for customers
  bankAccounts: [                  // Array of bank accounts
    {
      id: string,
      bankName: string,
      accountHolder: string,
      accountNumber: string,
      swiftCode: string
    }
  ],
  accountCreationLimit: number,    // Max accounts per user
  maintenanceMode: boolean         // Is site in maintenance?
}
```

## 🔑 authentication

### Admin Login
- Email: Your admin email (from `.env.local`)
- Password: Your Firebase password
- Route: `/admin/login`

Only the hardcoded admin email can access the panel.

### Security
- All routes except `/admin/login` require authentication
- Firestore security rules prevent unauthorized access (see below)

## 🔒 Firestore Security Rules

Apply these security rules in Firebase Console > Firestore > Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAdminEmail() {
      return request.auth != null && 
             request.auth.email == "REPLACE_WITH_YOUR_ADMIN_EMAIL";
    }

    // Plans: Public read active only, admin write
    match /plans/{document=**} {
      allow read: if resource.data.isActive == true;
      allow create, update, delete: if isAdminEmail();
    }

    // Orders: Admin read all, users read own, public create
    match /orders/{document=**} {
      allow read: if isAdminEmail() || 
                     (request.auth != null && request.auth.email == resource.data.userEmail);
      allow create: if request.auth == null || request.auth.email != null;
      allow update: if isAdminEmail();
    }

    // Settings: Public read selected fields, admin write
    match /settings/{document=**} {
      allow read: if document == "general";
      allow write: if isAdminEmail();
    }

    // Deny everything else
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

**Replace `"REPLACE_WITH_YOUR_ADMIN_EMAIL"` with your actual admin email!**

## 📄 Admin Panel Pages

### Dashboard (`/admin`)
- Total orders, pending orders, approved orders
- Revenue statistics
- Approval rate and average order value
- Real-time updates

### Plans Management (`/admin/plans`)
- View all plans
- Create new plans with name, price, discount, duration
- Edit plan details
- Toggle active/inactive status
- Delete plans
- All changes sync to Firestore in real-time

### Orders Management (`/admin/orders`)
- Filter: All / Pending / Approved / Rejected
- **For Pending Orders**:
  - Click "Approve" to enter credentials (username, password, URL, expiry date)
  - Click "Reject" to provide rejection reason
- **For Approved Orders**:
  - Click "View Credentials" to see stored account details
  - Copy-to-clipboard buttons for each field
- **For Rejected Orders**:
  - Click "View Reason" to see rejection message
- All updates are real-time

### Settings (`/admin/settings`)
- **Maintenance Mode**: Toggle on/off (shows maintenance page to users)
- **Payment Instructions**: Rich text for payment guide
- **Bank Accounts**: Add/remove bank account details
- **Account Limits**: Set maximum accounts per user

## 🚀 Hidden Route Security

The admin panel is accessible only through:

```
https://yourdomain.com/admin
https://yourdomain.com/admin/login
https://yourdomain.com/admin/plans
https://yourdomain.com/admin/orders
https://yourdomain.com/admin/settings
```

**Security Features:**
- ✅ Email verification (only admin email can login)
- ✅ Firebase Authentication required
- ✅ Redirect to login if not authenticated
- ✅ Firestore rules prevent unauthorized access
- ✅ No public links or hints to admin panel

## 📱 Public Order Tracking (Optional)

Users can track their order status at a public page. You can create `/track-order` route:

```typescript
// User enters their email
// System shows their orders and status
// If approved: Shows credentials with copy button
// If rejected: Shows rejection reason
```

## 🔄 Real-Time Updates

All pages use Firestore `onSnapshot()` listeners:
- Dashboard stats update instantly
- Orders show new submissions immediately
- Plans changes reflect instantly
- Settings updates apply in real-time

## 🛠️ Troubleshooting

### Admin can't login
1. Check `.env.local` has correct `NEXT_PUBLIC_ADMIN_EMAIL`
2. Verify Firebase credentials are valid
3. Ensure email is verified in Firebase Auth

### Can't approve orders
1. Check Firestore security rules allow admin write
2. Verify credentials have all required fields
3. Check browser console for errors

### Settings not syncing
1. Verify Firestore rules allow read/write
2. Check network tab for Firestore requests
3. Ensure `settings/general` document exists

### Changes not appearing
1. Check Firestore listeners are active
2. Verify user has read permissions
3. Clear browser cache and refresh

## 📦 Dependencies

Admin panel uses these packages:
- `react-hook-form` - Form validation
- `zod` - Schema validation
- `sonner` - Toast notifications
- `lucide-react` - Icons
- `firebase` - Authentication & Firestore

## 🎯 Next Steps

1. ✅ Set admin email in `.env.local`
2. ✅ Copy Firestore security rules
3. ✅ Create `settings/general` document in Firestore
4. ✅ Test admin login at `/admin/login`
5. ✅ Create first plan
6. ✅ Accept test orders
7. ✅ Deploy to production

## 📚 File Locations

- **Admin Provider**: `src/components/providers/admin-provider.tsx`
- **Admin Layout**: `src/components/admin-layout.tsx`
- **Admin Pages**:
  - Dashboard: `src/app/admin/page.tsx`
  - Plans: `src/app/admin/plans/page.tsx`
  - Orders: `src/app/admin/orders/page.tsx`
  - Settings: `src/app/admin/settings/page.tsx`
  - Login: `src/app/admin/login/page.tsx`
- **Services**: `src/lib/admin-firestore-service.ts`

## 🎨 Customization

### Change Admin Email
Edit `.env.local`:
```env
NEXT_PUBLIC_ADMIN_EMAIL=youremail@example.com
```

### Change Colors
Edit `src/components/admin-layout.tsx` and pages to update Tailwind classes.

### Add More Features
Use the `admin-firestore-service.ts` as a template to add more collections and features.

## ✨ Features Summary

| Feature | Status |
|---------|--------|
| Admin Authentication | ✅ Complete |
| Plans CRUD | ✅ Complete |
| Orders Management | ✅ Complete |
| Approve/Reject Orders | ✅ Complete |
| Credentials Management | ✅ Complete |
| Settings Panel | ✅ Complete |
| Real-Time Updates | ✅ Complete |
| Dark Mode | ✅ Complete |
| Mobile Responsive | ✅ Complete |
| Firestore Security Rules | ✅ Complete |

---

**Last Updated**: April 11, 2026
**Admin Panel Version**: 1.0.0
