'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, where, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase-config';
import { useApp } from '@/components/providers/app-provider';
import { AppLayout } from '@/components/app-layout';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Copy,
  Share2,
  Users,
  Gift,
  CheckCircle,
  AlertCircle,
  DollarSign,
  TrendingUp,
  Trophy,
  Zap,
  ArrowUpRight,
} from 'lucide-react';
import {
  getReferralsForUser,
  listenToReferrals,
  getWallet,
  listenToWallet,
  getUserReferralLevel,
  getReferralLevelProgress,
  getRewardHistory,
  getReferralStats,
} from '@/lib/referral-service';

export default function EarnPage() {
  const { user, isLoggedIn, isLoading } = useApp();
  const router = useRouter();

  // State
  const [copied, setCopied] = useState<string | null>(null);
  const [wallet, setWallet] = useState<any>(null);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [level, setLevel] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [rewardHistory, setRewardHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [referralCodeInput, setReferralCodeInput] = useState('');
  const [appliedReferralCode, setAppliedReferralCode] = useState<string | null>(null);
  const [referrerName, setReferrerName] = useState<string | null>(null);
  const [applyingCode, setApplyingCode] = useState(false);
  const [codeApplyMessage, setCodeApplyMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [referralUsers, setReferralUsers] = useState<Record<string, any>>({});
  const [sendingReminder, setSendingReminder] = useState<string | null>(null);
  const [selectedReferral, setSelectedReferral] = useState<string | null>(null);

  // Authentication check
  useEffect(() => {
    if (isLoading) return;
    if (!isLoggedIn) {
      router.push('/login');
    }
  }, [isLoggedIn, isLoading, router]);

  // Load initial data (fast - only essential)
  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        // Load only essential data first
        const [
          walletData,
          referralData,
          statsData,
        ] = await Promise.all([
          getWallet(user.id),
          getReferralsForUser(user.id),
          getReferralStats(user.id),
        ]);

        setWallet(walletData);
        setReferrals(referralData);
        setStats(statsData);
        
        // Load non-critical data after (don't block UI)
        setTimeout(async () => {
          try {
            const [levelData, progressData, historyData] = await Promise.all([
              getUserReferralLevel(user.id),
              getReferralLevelProgress(user.id),
              getRewardHistory(user.id),
            ]);
            setLevel(levelData);
            setProgress(progressData);
            setRewardHistory(historyData);
          } catch (error) {
            console.error('Error loading secondary data:', error);
          }
        }, 0);
      } catch (error) {
        console.error('Error loading earn page data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.id]);

  // Real-time listeners
  useEffect(() => {
    if (!user?.id) return;

    const unsubscribeWallet = listenToWallet(user.id, (data) => {
      setWallet(data);
    });

    const unsubscribeReferrals = listenToReferrals(user.id, (data) => {
      setReferrals(data);
    });

    return () => {
      unsubscribeWallet();
      unsubscribeReferrals();
    };
  }, [user?.id]);

  // Batch fetch referral user details (optimized - no loop)
  useEffect(() => {
    if (referrals.length === 0) return;
    
    const fetchAllUserDetails = async () => {
      try {
        const userIds = referrals
          .map(r => r.referredUserId)
          .filter(id => !referralUsers[id]); // Only fetch missing ones
        
        if (userIds.length === 0) return;

        // Batch fetch instead of loop
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('__name__', 'in', userIds.slice(0, 10))); // Firestore limit
        const querySnap = await getDocs(q);
        
        const newUsers: Record<string, any> = {};
        querySnap.forEach(doc => {
          newUsers[doc.id] = doc.data();
        });
        
        setReferralUsers(prev => ({ ...prev, ...newUsers }));
      } catch (error) {
        console.error('Error batch fetching user details:', error);
      }
    };

    fetchAllUserDetails();
  }, [referrals, referralUsers]);

  // Copy to clipboard
  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  // Share referral link
  const handleShare = async () => {
    const referralCode = user?.referralCode || 'DEMO123';
    const link = typeof window !== 'undefined' 
      ? `${window.location.origin}/login?ref=${referralCode}`
      : `https://primexstream.pro/login?ref=${referralCode}`;
    const text = `Join PrimexStream Pro and get IPTV access! Use my referral code: ${referralCode}\n\n${link}`;

    if (navigator.share) {
      navigator.share({
        title: 'Join PrimexStream Pro',
        text: text,
      });
    } else {
      await handleCopy(link, 'share');
    }
  };

  // Apply referral code
  const handleApplyReferralCode = async () => {
    if (!referralCodeInput.trim()) {
      setCodeApplyMessage({ type: 'error', text: 'Please enter a referral code' });
      return;
    }

    if (!user?.id) {
      setCodeApplyMessage({ type: 'error', text: 'Please login first' });
      return;
    }

    // Check that it's not their own code
    if (referralCodeInput.trim() === user.referralCode) {
      setCodeApplyMessage({ type: 'error', text: 'You cannot use your own referral code' });
      return;
    }

    setApplyingCode(true);
    setCodeApplyMessage(null);

    try {
      // Find user with this referral code
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('referralCode', '==', referralCodeInput.trim()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setCodeApplyMessage({ type: 'error', text: 'Invalid referral code' });
        setApplyingCode(false);
        return;
      }

      const referrerId = querySnapshot.docs[0].id;
      
      // Check if already applied
      const { getReferralsForUser } = await import('@/lib/referral-service');
      const existingReferrals = await getReferralsForUser(user.id);
      const alreadyApplied = existingReferrals.some(ref => ref.referrerId === referrerId);
      
      if (alreadyApplied) {
        setCodeApplyMessage({ type: 'error', text: 'This code has already been applied' });
        setApplyingCode(false);
        return;
      }

      // Prevent circular referrals: Check if current user has already referred the referrer
      const hasReferredReferrer = existingReferrals.some(ref => ref.referredUserId === referrerId);
      if (hasReferredReferrer) {
        setCodeApplyMessage({ type: 'error', text: 'Circular referrals are not allowed. You already referred this person!' });
        setApplyingCode(false);
        return;
      }

      // Record the referral
      const { recordNewReferral } = await import('@/lib/referral-service');
      const result = await recordNewReferral(referrerId, user.id);

      if (result) {
        // Fetch referrer's name
        const referrerRef = doc(db, 'users', referrerId);
        const referrerSnap = await getDoc(referrerRef);
        const name = referrerSnap.exists() ? referrerSnap.data().name : 'Team Member';
        
        setAppliedReferralCode(referralCodeInput.trim());
        setReferrerName(name);
        setCodeApplyMessage({ type: 'success', text: `You're now part of ${name}'s team! 🎉` });
        setReferralCodeInput('');
        // Refresh referrals data
        const updatedReferrals = await getReferralsForUser(user.id);
        setReferrals(updatedReferrals);
      } else {
        setCodeApplyMessage({ type: 'error', text: 'This code has already been applied' });
      }
    } catch (error: any) {
      console.error('Error applying referral code:', error);
      const errorMsg = error?.message || 'Error applying code. Please try again.';
      setCodeApplyMessage({ type: 'error', text: errorMsg });
    } finally {
      setApplyingCode(false);
    }
  };

  // Handle send reminder
  const handleSendReminder = async (referralId: string) => {
    if (!user?.id) return;
    
    setSendingReminder(referralId);
    try {
      const { sendReminderToReferral } = await import('@/lib/referral-service');
      const success = await sendReminderToReferral(user.id, referralId, user.name || 'Your friend');
      
      if (success) {
        // Refresh referrals to show updated reminder time
        const { getReferralsForUser } = await import('@/lib/referral-service');
        const updatedReferrals = await getReferralsForUser(user.id);
        setReferrals(updatedReferrals);
      }
    } catch (error) {
      console.error('Error sending reminder:', error);
    } finally {
      setSendingReminder(null);
    }
  };

  // Handle redeem reward
  const handleRedeemReward = async (referralId: string) => {
    if (!user?.id) return;
    
    setSendingReminder(referralId);
    try {
      // Get the referral to find the referred user ID
      const referralRef = doc(db, 'referrals', referralId);
      const referralSnap = await getDoc(referralRef);
      
      if (!referralSnap.exists()) {
        throw new Error('Referral not found');
      }

      const referral = referralSnap.data() as any;
      
      // Mark the reward as claimed in Firebase
      await updateDoc(referralRef, {
        rewardGiven: true,
        claimedAt: new Date(),
      });

      // Refresh referrals to show updated status
      const { getReferralsForUser, getWallet } = await import('@/lib/referral-service');
      const updatedReferrals = await getReferralsForUser(user.id);
      const updatedWallet = await getWallet(user.id);
      setReferrals(updatedReferrals);
      if (updatedWallet) {
        setWallet(updatedWallet);
      }
    } catch (error) {
      console.error('Error redeeming reward:', error);
    } finally {
      setSendingReminder(null);
    }
  };

  if (isLoading || loading) {
    return (
      <AppLayout title="Earn & Refer">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            <p className="mt-4 text-slate-600 dark:text-slate-400">Loading...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  const referralCode = user?.referralCode || 'DEMO123';
  const referralLink = typeof window !== 'undefined'
    ? `${window.location.origin}/login?ref=${referralCode}`
    : `https://primexstream.pro/login?ref=${referralCode}`;

  return (
    <AppLayout title="Earn & Refer">
      <div className="w-full">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="space-y-12">
            {/* Header */}
            <div className="space-y-3">
              <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white">
                Referral Rewards
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
                Earn money by referring friends to PrimexStream Pro
              </p>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Wallet Balance */}
              <Card className="glass bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/30 dark:to-green-900/30 hover:scale-105 transition-transform">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">
                        Wallet Balance
                      </p>
                      <DollarSign className="w-5 h-5 text-emerald-600" />
                    </div>
                    <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                      ${(wallet?.balance || 0).toFixed(2)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Total Earnings */}
              <Card className="glass bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 hover:scale-105 transition-transform">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-widest">
                        Total Earned
                      </p>
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      ${(wallet?.totalEarnings || 0).toFixed(2)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Active Referrals */}
              <Card className="glass bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 hover:scale-105 transition-transform">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-purple-700 dark:text-purple-400 uppercase tracking-widest">
                        Active Referrals
                      </p>
                      <Users className="w-5 h-5 text-purple-600" />
                    </div>
                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                      {stats?.activeReferrals || 0}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Purchases Completed */}
              <Card className="glass bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/30 dark:to-amber-900/30 hover:scale-105 transition-transform">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-orange-700 dark:text-orange-400 uppercase tracking-widest">
                        Purchases
                      </p>
                      <CheckCircle className="w-5 h-5 text-orange-600" />
                    </div>
                    <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                      {stats?.completedPurchases || 0}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Referral Level */}
            {level && progress && (
              <Card className="glass">
                <CardContent className="pt-8">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                          Your Level
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">
                          Reach higher levels for better rewards
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 justify-end mb-2">
                          {level.level === 'Beginner' && (
                            <Zap className="w-6 h-6 text-yellow-500" />
                          )}
                          {level.level === 'Pro' && (
                            <TrendingUp className="w-6 h-6 text-blue-500" />
                          )}
                          {level.level === 'Elite' && (
                            <Trophy className="w-6 h-6 text-purple-500" />
                          )}
                          <span className="text-2xl font-bold text-slate-900 dark:text-white">
                            {level.level}
                          </span>
                        </div>
                        {level.bonus > 0 && (
                          <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                            +{level.bonus}% reward bonus
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {progress.nextLevel && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600 dark:text-slate-400">
                            Progress to {progress.nextLevel.level}
                          </span>
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {Math.min(progress.progress || 0, 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-300"
                            style={{ width: `${Math.min(progress.progress || 0, 100)}%` }}
                          ></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-xs mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                          <div>
                            <p className="text-slate-600 dark:text-slate-400">Referrals</p>
                            <p className="font-bold text-slate-900 dark:text-white">
                              {progress.referralCount} / {progress.nextLevel.minReferrals}
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-600 dark:text-slate-400">Earnings</p>
                            <p className="font-bold text-slate-900 dark:text-white">
                              ${progress.earnings.toFixed(2)} / ${progress.nextLevel.minEarnings}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Referral Code Section */}
            <Card className="glass border-2 border-emerald-200 dark:border-emerald-800">
              <CardContent className="pt-8">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                      Your Referral Code
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      Share this code or link with friends to earn rewards
                    </p>
                  </div>

                  <div className="space-y-3">
                    {/* Code */}
                    <div className="flex gap-2">
                      <Input
                        value={referralCode}
                        readOnly
                        className="text-lg font-mono font-bold"
                      />
                      <Button
                        onClick={() => handleCopy(referralCode, 'code')}
                        className="gap-2"
                        variant={copied === 'code' ? 'primary' : 'outline'}
                      >
                        {copied === 'code' ? (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            Copy Code
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Link */}
                    <div className="flex gap-2">
                      <Input value={referralLink} readOnly className="text-sm" />
                      <Button
                        onClick={() => handleCopy(referralLink, 'link')}
                        className="gap-2"
                        variant={copied === 'link' ? 'primary' : 'outline'}
                      >
                        {copied === 'link' ? (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            Copy Link
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Share Button */}
                    <Button onClick={handleShare} className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700">
                      <Share2 className="w-4 h-4" />
                      Share with Friends
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reward History */}
            {rewardHistory.length > 0 && (
              <Card className="glass">
                <CardContent className="pt-8">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Gift className="w-6 h-6 text-emerald-600" />
                        Reward History
                      </h3>
                    </div>

                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {rewardHistory
                        .sort(
                          (a, b) =>
                            new Date(b.createdAt?.toDate?.() || 0).getTime() -
                            new Date(a.createdAt?.toDate?.() || 0).getTime()
                        )
                        .map((reward, index) => (
                          <div
                            key={reward.id}
                            className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                  reward.type === 'purchase'
                                    ? 'bg-emerald-100 dark:bg-emerald-900'
                                    : 'bg-blue-100 dark:bg-blue-900'
                                }`}
                              >
                                {reward.type === 'purchase' ? (
                                  <ArrowUpRight className="w-5 h-5 text-emerald-600" />
                                ) : (
                                  <Users className="w-5 h-5 text-blue-600" />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-semibold text-slate-900 dark:text-white truncate">
                                  {reward.reason}
                                </p>
                                <p className="text-xs text-slate-600 dark:text-slate-400">
                                  {reward.createdAt?.toDate?.()?.toLocaleDateString?.() ||
                                    'Recent'}
                                </p>
                              </div>
                            </div>
                            <div className="text-right pl-4">
                              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                                +${reward.amount.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Referrals List */}
            {referrals.length > 0 && (
              <Card className="glass">
                <CardContent className="pt-8">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Users className="w-6 h-6 text-blue-600" />
                        Your Referrals ({referrals.length})
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Earn $5 when they purchase. 💰
                      </p>
                    </div>

                    <div className="space-y-3 max-h-[600px] overflow-y-auto">
                      {referrals.map((referral) => {
                        const referralUser = referralUsers[referral.referredUserId];
                        const isJustSignedUp = referral.status === 'signed_up';
                        const isPurchased = referral.status === 'purchased';
                        const isLoading = sendingReminder === referral.id;

                        return (
                          <div
                            key={referral.id}
                            onClick={() => setSelectedReferral(selectedReferral === referral.id ? null : referral.id)}
                            className={`p-5 rounded-lg border transition-all cursor-pointer ${
                              isPurchased
                                ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800 hover:border-emerald-400'
                                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="font-semibold text-slate-900 dark:text-white truncate">
                                    {referralUser?.name || `User ${referral.referredUserId.slice(0, 8)}`}
                                  </p>
                                  <div
                                    className={`px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0 ${
                                      isPurchased
                                        ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                                        : 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300'
                                    }`}
                                  >
                                    {isPurchased ? '✓ Purchased' : isJustSignedUp ? '👋 Just Signed Up' : '⏳ Pending'}
                                  </div>
                                </div>
                                
                                <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                                  {referralUser?.email || 'Email not available'}
                                </p>

                                <p className="text-xs text-slate-500 dark:text-slate-500">
                                  Referred: {referral.createdAt?.toDate?.()?.toLocaleDateString?.() || 'Recently'}
                                </p>

                                {/* Smart messaging for just signed up */}
                                {isJustSignedUp && (
                                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 italic">
                                    🎉 Your referral still just signed up, not purchased. Send them a reminder to help you redeem!
                                  </p>
                                )}
                              </div>

                              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                {isPurchased && (
                                  <div className="flex flex-col items-end">
                                    <p className="text-xs text-slate-600 dark:text-slate-400">Reward</p>
                                    <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                                      +$5
                                    </p>
                                  </div>
                                )}

                                {isJustSignedUp && (
                                  <div className="flex flex-col items-end">
                                    <p className="text-xs text-slate-600 dark:text-slate-400">Pending</p>
                                    <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                                      $5
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                              {isJustSignedUp && (
                                <Button
                                  onClick={() => handleSendReminder(referral.id)}
                                  disabled={isLoading}
                                  variant="outline"
                                  className="flex-1 gap-2 text-sm"
                                >
                                  {isLoading ? (
                                    <>
                                      <div className="w-3 h-3 rounded-full border-2 border-slate-400 border-t-slate-700 animate-spin"></div>
                                      Sending...
                                    </>
                                  ) : (
                                    <>
                                      📬 Send Reminder
                                    </>
                                  )}
                                </Button>
                              )}

                              {isPurchased && !referral.rewardGiven && (
                                <Button
                                  onClick={() => handleRedeemReward(referral.id)}
                                  disabled={isLoading}
                                  className="flex-1 gap-2 text-sm bg-emerald-600 hover:bg-emerald-700"
                                >
                                  {isLoading ? (
                                    <>
                                      <div className="w-3 h-3 rounded-full border-2 border-white border-t-emerald-700 animate-spin"></div>
                                      Redeeming...
                                    </>
                                  ) : (
                                    <>
                                      💰 Redeem $5
                                    </>
                                  )}
                                </Button>
                              )}

                              {isPurchased && referral.rewardGiven && (
                                <div className="flex-1 py-2 px-3 bg-emerald-100 dark:bg-emerald-900/30 rounded text-center">
                                  <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                                    ✓ Reward Claimed
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="glass">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <Gift className="w-8 h-8 text-emerald-600" />
                    <h4 className="font-bold text-slate-900 dark:text-white">
                      $5 Sign-up Bonus
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Earn $5 when someone signs up with your code
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <DollarSign className="w-8 h-8 text-blue-600" />
                    <h4 className="font-bold text-slate-900 dark:text-white">
                      $5 Purchase Reward
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Earn $5 when your referral makes a purchase
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30">
                <CardContent className="pt-6 space-y-4">
                  {!appliedReferralCode ? (
                    <>
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">
                          🔗 Apply Referral Code
                        </label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Enter referral code"
                            value={referralCodeInput}
                            onChange={(e) => setReferralCodeInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleApplyReferralCode()}
                            className="text-sm font-mono font-bold uppercase tracking-widest"
                            disabled={!!appliedReferralCode}
                          />
                          <Button
                            onClick={handleApplyReferralCode}
                            disabled={applyingCode || !!appliedReferralCode || !referralCodeInput.trim()}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4"
                          >
                            {applyingCode ? 'Apply...' : 'Apply'}
                          </Button>
                        </div>
                      </div>
                      {codeApplyMessage && (
                        <div className={`p-3 rounded text-sm font-medium ${
                          codeApplyMessage.type === 'success'
                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                        }`}>
                          {codeApplyMessage.text}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="p-4 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 border-2 border-emerald-300 dark:border-emerald-700">
                      <div className="flex items-center gap-3 mb-2">
                        <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                        <h4 className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
                          You are {referrerName}'s team member! 🎯
                        </h4>
                      </div>
                      <p className="text-sm text-emerald-600 dark:text-emerald-400">
                        Earn $5 when you make your first purchase. Your referrer will also earn $5!
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

