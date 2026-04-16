/**
 * ADMIN PANEL - ORDER APPROVAL INTEGRATION
 * 
 * Add this to your admin/orders page to enable referral rewards
 */

// Example integration in src/app/admin/orders/page.tsx

import { processOrderReward } from '@/lib/order-reward-hook';
import { updateOrder, getOrder } from '@/lib/firestore-service';

/**
 * When admin approves an order:
 * 
 * 1. Update order status to 'approved'
 * 2. Call processOrderReward() to creditreferrer
 * 3. Show success feedback
 */

interface OrderRow {
  id: string;
  userId: string;
  userEmail: string;
  planName: string;
  amount: number;
  status: string;
  // ... other fields
}

// Example button handler
const handleApproveOrder = async (order: OrderRow) => {
  try {
    setApproving(true);
    setError(null);

    // Step 1: Update order status
    await updateOrder(order.id, { status: 'approved' });

    // Step 2: Process referral reward
    const rewardProcessed = await processOrderReward(order.userId, order.id);

    // Step 3: Show feedback
    if (rewardProcessed) {
      toast.success('✅ Order approved & reward credited to referrer');
    } else {
      toast.success('✅ Order approved (user was not referred)');
    }

    // Refresh orders list
    await loadOrders();
  } catch (error) {
    console.error('Error approving order:', error);
    setError('Failed to approve order');
    toast.error('Failed to approve order');
  } finally {
    setApproving(false);
  }
};

/**
 * INTEGRATION POINTS
 */

// Add to admin orders page JSX:

// 1. Add "Reward Status" column to table
<TableCell>
  {order.status === 'approved' ? (
    <span className="text-emerald-600 dark:text-emerald-400 text-sm font-semibold">
      ✓ Processed
    </span>
  ) : (
    <span className="text-slate-500 text-sm">-</span>
  )}
</TableCell>

// 2. Update approve button
<Button 
  onClick={() => handleApproveOrder(order)}
  disabled={order.status === 'approved'}
  size="sm"
  className="gap-2"
>
  {order.status === 'approved' ? (
    <>
      <CheckCircle className="w-4 h-4" />
      Approved
    </>
  ) : (
    <>
      <Gift className="w-4 h-4" />
      Approve & Reward
    </>
  )}
</Button>

// 3. Show reward processing indicator
{order.status === 'approved' && (
  <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
    Referral reward processed
  </div>
)}

/**
 * BATCH OPERATIONS
 */

// Approve multiple orders at once
const handleBatchApprove = async (selectedOrders: OrderRow[]) => {
  try {
    setApproving(true);
    
    for (const order of selectedOrders) {
      // Update status
      await updateOrder(order.id, { status: 'approved' });
      
      // Process reward
      await processOrderReward(order.userId, order.id);
    }

    toast.success(`✅ ${selectedOrders.length} orders approved with rewards`);
    await loadOrders();
  } catch (error) {
    console.error('Error in batch approval:', error);
    toast.error('Some orders failed to process');
  } finally {
    setApproving(false);
  }
};

/**
 * MONITORING DASHBOARD
 */

// Optional: Add referral reward stats to admin dashboard

interface RewardStats {
  totalDistributed: number;
  todayDistributed: number;
  pendingRewards: number;
  activeReferrals: number;
}

const getRewardStats = async (): Promise<RewardStats> => {
  try {
    const rewards = await getDocs(collection(db, 'rewards'));
    const referrals = await getDocs(collection(db, 'referrals'));
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let totalDistributed = 0;
    let todayDistributed = 0;
    
    rewards.forEach(doc => {
      const reward = doc.data();
      const rewardDate = reward.createdAt?.toDate?.() || new Date();
      
      totalDistributed += reward.amount || 0;
      if (rewardDate >= today) {
        todayDistributed += reward.amount || 0;
      }
    });
    
    const pendingRewards = referrals.docs.filter(
      doc => doc.data().status === 'signed_up' && !doc.data().rewardGiven
    ).length;
    
    const activeReferrals = referrals.docs.filter(
      doc => doc.data().status === 'signed_up'
    ).length;
    
    return {
      totalDistributed: Math.round(totalDistributed * 100) / 100,
      todayDistributed: Math.round(todayDistributed * 100) / 100,
      pendingRewards,
      activeReferrals,
    };
  } catch (error) {
    console.error('Error calculating reward stats:', error);
    return { totalDistributed: 0, todayDistributed: 0, pendingRewards: 0, activeReferrals: 0 };
  }
};

// Display in admin dashboard
export function RewardStatsPanel() {
  const [stats, setStats] = useState<RewardStats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      const data = await getRewardStats();
      setStats(data);
      setLoading(false);
    };
    loadStats();
  }, []);

  if (loading || !stats) return <div>Loading...</div>;

  return (
    <div className="grid grid-cols-4 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-600">Total Distributed</p>
            <p className="text-2xl font-bold text-emerald-600">${stats.totalDistributed}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-600">Today</p>
            <p className="text-2xl font-bold text-blue-600">${stats.todayDistributed}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-600">Pending</p>
            <p className="text-2xl font-bold text-orange-600">{stats.pendingRewards}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-600">Active</p>
            <p className="text-2xl font-bold text-purple-600">{stats.activeReferrals}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * TROUBLESHOOTING
 */

// If reward not processing:

const debugRewardProcessing = async (orderId: string, userId: string) => {
  try {
    console.log('🔍 Debugging reward processing...');
    
    // 1. Check if user exists
    const user = await getUser(userId);
    console.log('User:', user);
    
    // 2. Check if user was referred
    console.log('Referred by:', user?.referredBy);
    if (!user?.referredBy) {
      console.warn('User was not referred');
      return;
    }
    
    // 3. Check existing referrals
    const referralQuery = query(
      collection(db, 'referrals'),
      where('referredUserId', '==', userId)
    );
    const referrals = await getDocs(referralQuery);
    console.log('Referrals found:', referrals.docs.length);
    referrals.forEach(doc => {
      console.log('Referral:', doc.data());
    });
    
    // 4. Check wallet
    const wallet = await getWallet(user.referredBy);
    console.log('Referrer wallet:', wallet);
    
    // 5. Can process reward
    const pending = referrals.docs.filter(
      doc => doc.data().status === 'signed_up' && !doc.data().rewardGiven
    );
    console.log('Pending rewards:', pending.length);
    
  } catch (error) {
    console.error('Debug error:', error);
  }
};

/**
 * CLOUD FUNCTIONS (Optional - for production)
 */

/*
If you want automatic reward processing via Cloud Functions:

functions/
├── index.ts
└── triggers/
    └── onOrderApproved.ts

// functions/triggers/onOrderApproved.ts

import * as functions from 'firebase-functions';
import { db } from '../config';

export const onOrderApproved = functions.firestore
  .document('orders/{orderId}')
  .onUpdate(async (change, context) => {
    const newData = change.after.data();
    const oldData = change.before.data();

    // Only process if status changed to 'approved'
    if (oldData.status !== 'approved' && newData.status === 'approved') {
      try {
        // Import reward function
        // await rewardReferralPurchase(newData.userId);
        console.log(`Processed reward for order ${context.params.orderId}`);
      } catch (error) {
        console.error('Error processing reward:', error);
        // Log to error collection for monitoring
      }
    }
  });

This would eliminate the need to call processOrderReward() manually.
*/
