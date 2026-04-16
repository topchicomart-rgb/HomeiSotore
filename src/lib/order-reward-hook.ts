/**
 * Order Reward Hook
 * Integrates referral rewards into the order approval flow
 * Called when an order status changes to 'approved'
 */

import { rewardReferralPurchase } from '@/lib/referral-service';

/**
 * Process rewards when an order is approved
 * Call this function when order status is updated to 'approved'
 */
export async function processOrderReward(userId: string, orderId: string): Promise<boolean> {
  try {
    console.log(
      `🎁 Processing reward for order ${orderId} by user ${userId}`
    );

    // Reward the referrer by marking referral as purchased
    const { rewardReferralPurchase } = await import('@/lib/referral-service');
    const rewardSuccess = await rewardReferralPurchase(userId);

    if (rewardSuccess) {
      console.log(`✅ Reward processed successfully for order ${orderId}`);
      return true;
    } else {
      console.warn(`⚠️ No referral found or reward already given for order ${orderId}`);
      return false; // User was not referred or already rewarded
    }
  } catch (error) {
    console.error('Error processing order reward:', error);
    return false;
  }
}

/**
 * This function should be called in the admin panel when approving orders
 * Example usage in admin/orders page:
 *
 * const handleApproveOrder = async (orderId: string) => {
 *   try {
 *     await updateOrder(orderId, { status: 'approved' });
 *     const order = await getOrder(orderId);
 *     await processOrderReward(order.userId, orderId);
 *   } catch (error) {
 *     console.error('Error approving order:', error);
 *   }
 * };
 */
