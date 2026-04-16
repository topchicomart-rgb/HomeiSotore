# 🔗 NOTIFICATION SYSTEM - QUICK REFERENCE

## Key Integration Points

### 1. Order Placement
**File:** `src/lib/firebase-service.ts`
```typescript
export async function createOrder(userId: string, order: any) {
  // ...
  // Sends notifications to user and admin automatically
  await notifyOrderCreated(userId, userName, {...});
  await notifyAdminNewOrder({...});
}
```

**When it fires:** User clicks "Confirm Order" button

---

### 2. Order Approval
**File:** `src/lib/admin-firestore-service.ts`
```typescript
export async function updateOrderStatus(
  orderId: string,
  status: 'approved' | 'rejected' | 'pending'
) {
  // ...
  if (status === 'approved') {
    await notifyOrderAccepted(userId, {...});
  }
}
```

**When it fires:** Admin clicks "Approved" in `/admin/orders`

---

### 3. Order Rejection
**File:** `src/lib/admin-firestore-service.ts`
```typescript
export async function updateOrderStatus(
  orderId: string,
  status: 'approved' | 'rejected' | 'pending',
  additionalData?: Partial<Order>
) {
  // ...
  if (status === 'rejected') {
    await notifyOrderRejected(userId, {
      orderId,
      planName: orderData?.plan,
      rejectionReason: additionalData?.rejectReason
    });
  }
}
```

**When it fires:** Admin clicks "Rejected" with a reason in `/admin/orders`

---

### 4. Referral Signup
**File:** `src/lib/referral-service.ts`
```typescript
export async function recordNewReferral(
  referrerId: string,
  referredUserId: string
) {
  // ...
  // Sends notification to referrer
  await notifyReferrerNewSignup(referrerId, referrerName, {
    referredId: referredUserId,
    referredName: userName,
    referralCount: referrerTotalReferrals
  });

  // Sends notification to referred user
  await notifyReferredUserWelcome(referredUserId, referrerName, 10);
}
```

**When it fires:** New user signs up with existing user's referral code

---

### 5. Referral Reminder
**File:** `src/lib/referral-service.ts`
```typescript
export async function sendReminderToReferral(
  referrerId: string,
  referralId: string,
  referrerName: string
) {
  // ...
  await notifySubscriptionReminder(referredUserId, referrerName, message);
}
```

**When it fires:** Referrer clicks "Send Reminder" button

---

### 6. UI Display
**File:** `src/components/notification-button.tsx`
```typescript
export function NotificationButton({ userId }: NotificationButtonProps) {
  const { notifications, unreadCount, loading } = useNotifications(userId);
  
  return (
    <div className="relative">
      {/* Bell icon with unread badge */}
      <button>
        <Bell />
        {unreadCount > 0 && <span>{unreadCount}</span>}
      </button>

      {/* Dropdown with notifications */}
      {isOpen && (
        <div>
          {notifications.map(notif => (
            <div key={notif.id}>
              <p>{notif.title}</p>
              <p>{notif.message}</p>
              <button onClick={() => markNotificationAsRead(notif.id)}>✓</button>
              <button onClick={() => deleteNotification(notif.id)}>🗑️</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

**Location:** Top navbar, accessible by all users

---

## Core Functions

### Send Notifications
```typescript
// Order notifications
notifyOrderCreated(userId, userName, orderData)
notifyOrderAccepted(userId, orderData)
notifyOrderRejected(userId, orderData)

// Referral notifications
notifyReferrerNewSignup(referrerId, referrerName, referralData)
notifyReferredUserWelcome(referredUserId, referrerName, discount)
notifySubscriptionReminder(userId, referrerName, message)

// Admin notifications
notifyAdminNewOrder(orderData)
```

### Manage Notifications
```typescript
// Get notifications
getActiveNotifications(userId)
getUnreadCount(userId)
getNotificationStats(userId)

// Update notifications
markNotificationAsRead(notificationId)
markMultipleAsRead(notificationIds)

// Delete notifications
deleteNotification(notificationId)
deleteMultipleNotifications(notificationIds)

// Real-time
onActiveNotificationsChange(userId, callback)
```

---

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    USER INTERACTION                         │
└──────────────┬──────────────────────────────────────────────┘
               │
     ┌─────────▼─────────┐
     │  Creates Order /   │
     │  Approves / etc    │
     └────────┬──────────┘
              │
     ┌────────▼──────────────────────────────┐
     │  Function Called in Service Layer     │
     │  (firebase-service, referral-service) │
     └────────┬──────────────────────────────┘
              │
     ┌────────▼──────────────────────────────┐
     │  Notification Service Function        │
     │  (notification-service.ts)             │
     └────────┬──────────────────────────────┘
              │
     ┌────────▼──────────────────────────────┐
     │  Adds to Firestore Collection         │
     │  (notifications/)                      │
     └────────┬──────────────────────────────┘
              │
     ┌────────▼──────────────────────────────┐
     │  Real-time Listener Updates UI        │
     │  (useNotifications hook)               │
     └────────┬──────────────────────────────┘
              │
     ┌────────▼──────────────────────────────┐
     │  Bell Icon Updates + Dropdown         │
     │  (notification-button.tsx)             │
     └──────────────┬──────────────────────────┘
                    │
        ┌───────────▼──────────────┐
        │  User Sees Notification   │
        │  in Dropdown              │
        └──────────────────────────┘
```

---

## Files at a Glance

| File | Lines | Purpose |
|------|-------|---------|
| `notification-service.ts` | 411 | Core notification logic |
| `useNotifications.ts` | 29 | React hook for UI |
| `notification-button.tsx` | 200+ | Bell icon + dropdown UI |
| `firebase-service.ts` | ~200 | Realtime DB + notifications |
| `firestore-service.ts` | ~500 | Firestore + notifications |
| `referral-service.ts` | ~500 | Referral + notifications |
| `admin-firestore-service.ts` | ~500 | Admin orders + notifications |
| `admin/orders/page.tsx` | ~400 | Admin form + rejection reason |

---

## Notification Types Quick Reference

| Type | Icon | Color | Trigger |
|------|------|-------|---------|
| `order_created` | ✅ | Green | User creates order |
| `order_accepted` | 🎉 | Emerald | Admin approves order |
| `order_rejected` | ❌ | Red | Admin rejects order |
| `referral` | 🎯 | Blue | Referral action (signup/reminder) |
| `reminder` | 🛍️ | Orange | Subscription reminder |
| `general` | 📢 | Gray | Generic notification |

---

## Query Examples

### Get All Notifications for User
```typescript
const notifications = await getActiveNotifications(userId);
```

### Listen to Notifications in Real-time
```typescript
onActiveNotificationsChange(userId, (notifs) => {
  console.log('New notifications:', notifs);
});
```

### Mark Multiple as Read
```typescript
const unreadIds = notifications
  .filter(n => !n.isRead)
  .map(n => n.id);
  
await markMultipleAsRead(unreadIds);
```

### Get Stats
```typescript
const stats = await getNotificationStats(userId);
// Returns: { total: 5, unread: 2, byType: { order_created: 2, referral: 3 } }
```

---

## Firestore Security Rules

```
match /notifications/{document=**} {
  // Anyone can create (app creates automatically)
  allow create: if request.auth != null;
  
  // User can read their own notifications
  // OR admin can read notifications sent to them (by email)
  allow read, update: if 
    resource.data.userId == request.auth.uid || 
    resource.data.userId == request.auth.token.email;
  
  // User can delete their own notifications
  allow delete: if 
    resource.data.userId == request.auth.uid ||
    resource.data.userId == request.auth.token.email;
}
```

---

## Debugging Commands

### Check notifications in console
```javascript
// Get all notifications
db.collection('notifications').where('userId', '==', 'user123').get()

// Get unread count
db.collection('notifications')
  .where('userId', '==', 'user123')
  .where('isDeleted', '==', false)
  .where('isRead', '==', false)
  .get()

// Check if notification exists
db.collection('notifications').doc('notif_id').get()
```

---

## Common Patterns

### Using in Component
```typescript
'use client';

import { useNotifications } from '@/lib/useNotifications';
import { markNotificationAsRead, deleteNotification } from '@/lib/notification-service';

export function MyNotifications({ userId }) {
  const { notifications, unreadCount } = useNotifications(userId);

  return (
    <div>
      <h2>Notifications ({unreadCount} unread)</h2>
      {notifications.map(n => (
        <div key={n.id}>
          <h3>{n.title}</h3>
          <p>{n.message}</p>
          <button onClick={() => markNotificationAsRead(n.id)}>Read</button>
          <button onClick={() => deleteNotification(n.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
```

### Sending from Service
```typescript
import { notifyOrderCreated } from '@/lib/notification-service';

// In your service function
await notifyOrderCreated(userId, userName, {
  orderId: 'unique_id',
  planName: 'Premium Plan',
  amount: 999,
  status: 'pending'
});
```

---

**Last Updated:** April 15, 2026  
**Status:** ✅ Complete
