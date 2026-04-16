'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '@/components/providers/app-provider';
import { AppLayout } from '@/components/app-layout';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createOrder, uploadPaymentProof, getConfig, ConfigData } from '@/lib/firebase-service';
import { Loader, ChevronDown } from 'lucide-react';

type PaymentMethod = 'remitly' | 'binance' | 'paypal' | 'cashapp';

function PaymentContent() {
  const [showWelcomePopup, setShowWelcomePopup] = useState(true); // Welcome popup state
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [expandedMethod, setExpandedMethod] = useState<PaymentMethod | null>(null);
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [txId, setTxId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [receipt, setReceipt] = useState<{ orderId: string; transactionId: string } | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [config, setConfig] = useState<ConfigData | null>(null);
  const [configLoading, setConfigLoading] = useState(true);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoggedIn, isLoading, user } = useApp();

  // Load plan from config
  const planId = searchParams.get('plan') || '1month';
  const getPlanData = () => {
    if (!config) return null;
    if (planId === '1month') return config.plans.plan1Month;
    if (planId === '6month') return config.plans.plan6Month;
    if (planId === '12month') return config.plans.plan12Month;
    return null;
  };

  const plan = getPlanData();
  
  // Use default values while config is loading
  const originalPrice = plan?.price || (configLoading ? 0 : 20);
  const salePrice = plan?.salePrice || (configLoading ? 0 : 20);
  const saleDiscount = Math.max(0, originalPrice - salePrice);

  const isSpecialPayment = method === 'remitly' || method === 'binance';
  const extraDiscount = isSpecialPayment ? Math.round((salePrice * 0.30) * 100) / 100 : 0;
  const finalPrice = Math.max(0, salePrice - extraDiscount);
  const totalSavings = saleDiscount + extraDiscount;
  const totalSavingsPercent = originalPrice > 0 ? Math.round((totalSavings / originalPrice) * 100) : 0;

  const paymentMethods = [
    { id: 'remitly', name: 'Remitly', icon: '🔵' },
    { id: 'binance', name: 'Binance', icon: '🟡' },
    { id: 'paypal', name: 'PayPal', icon: '💙' },
    { id: 'cashapp', name: 'Cash App', icon: '💚' },
  ];

  // Get payment method details from config
  const getPaymentMethodDetails = (methodId: PaymentMethod) => {
    if (!config) return { instructions: 'Loading...', accountInfo: [] };
    
    let paymentMethod: any = null;
    
    if (methodId === 'remitly') paymentMethod = config.paymentMethods.remitly;
    else if (methodId === 'binance') paymentMethod = config.paymentMethods.binance;
    else if (methodId === 'paypal') paymentMethod = config.paymentMethods.paypal || { instructions: 'Contact support', accountInfo: '' };
    else if (methodId === 'cashapp') paymentMethod = config.paymentMethods.cashapp || { instructions: 'Contact support', accountInfo: '' };
    
    if (!paymentMethod) return { instructions: 'Loading...', accountInfo: [] };

    return {
      instructions: paymentMethod.instructions || 'Contact support for payment instructions',
      accountInfo: paymentMethod.accountInfo 
        ? [{ name: 'Account Info', value: paymentMethod.accountInfo }]
        : [],
    };
  };

  // Copy to clipboard function
  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Handle method selection and expand accordion
  const handleMethodSelect = (methodId: PaymentMethod) => {
    setMethod(methodId);
    setExpandedMethod(methodId);
  };

  // Handle continue to step 2
  const handleContinueToStep2 = () => {
    if (!method) {
      setError('Please select a payment method');
      return;
    }
    setError('');
    setCurrentStep(2);
  };

  useEffect(() => {
    if (isLoading) return;
    if (!isLoggedIn) {
      router.push('/login');
    }
  }, [isLoggedIn, isLoading, router]);

  // Load payment details from Firebase config
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const configData = await getConfig();
        setConfig(configData);
      } catch (err) {
        console.error('Error loading config:', err);
      } finally {
        setConfigLoading(false);
      }
    };

    loadConfig();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setScreenshot(file);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!user) {
        setError('User not found');
        return;
      }

      if (!method) {
        setError('Please select a payment method');
        return;
      }

      if (!screenshot) {
        setError('Please upload a payment proof');
        return;
      }

      if (!txId) {
        setError('Please enter transaction ID');
        return;
      }

      // Upload payment proof to Supabase
      const { path: proofPath, url: proofUrl } = await uploadPaymentProof(user.id, screenshot);

      // Create order in Firebase
      const order = await createOrder(user.id, {
        planId: planId,
        plan: plan?.name || 'IPTV Plan',
        originalPrice: originalPrice,
        salePrice: salePrice,
        finalPrice: finalPrice,
        paymentMethod: method,
        paymentProofPath: proofPath,
        paymentProof: proofUrl,
        transactionId: txId,
        status: 'pending',
        date: new Date().toLocaleDateString(),
        user: user.name,
      });

      // Show receipt instead of just success message
      setReceipt({
        orderId: order.id || 'ORD' + Date.now(),
        transactionId: txId,
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Error processing payment');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || configLoading) return (
    <AppLayout title="Payment">
      <div className="text-center py-12">
        <p className="text-slate-600 dark:text-slate-400">Loading payment options...</p>
      </div>
    </AppLayout>
  );

  return (
    <AppLayout title="Payment">
      <div className="w-full relative">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-8 py-12 lg:py-16">
          <div className="space-y-6">
            {/* WELCOME POPUP - Floating top notification */}
            {showWelcomePopup && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                <Card className="glass bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/40 dark:to-orange-900/40 border-2 border-red-300 dark:border-red-600 relative shadow-lg">
                  {/* Close Button X */}
                  <button
                    onClick={() => setShowWelcomePopup(false)}
                    className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-lg hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition z-10"
                  >
                    ✕
                  </button>

                  <CardContent className="pt-6 pb-6 space-y-5">
                    {/* Header */}
                    <div className="text-center space-y-3">
                      <p className="text-4xl animate-bounce">🎁</p>
                      <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">Special Offer!</h2>
                    </div>

                    {/* Main Message */}
                    <div className="bg-white/70 dark:bg-slate-800/70 rounded-2xl p-4 space-y-2 border border-red-200 dark:border-red-600/50">
                      <p className="text-center font-bold text-slate-900 dark:text-white">
                        Get <span className="text-2xl text-red-600 dark:text-red-400">+30% OFF</span>
                      </p>
                      <p className="text-center text-slate-700 dark:text-slate-300 font-semibold text-sm">
                        When paying with{' '}
                        <span className="text-blue-600 dark:text-blue-400 font-bold">Remitly</span>
                        {' '}or{' '}
                        <span className="text-yellow-600 dark:text-yellow-400 font-bold">Binance</span>
                      </p>
                    </div>

                    {/* Benefits List */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-xl">✨</span>
                        <p className="text-slate-700 dark:text-slate-300">Lowest prices guaranteed</p>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-xl">⚡</span>
                        <p className="text-slate-700 dark:text-slate-300">Instant confirmation</p>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-xl">🔒</span>
                        <p className="text-slate-700 dark:text-slate-300">Secure payment</p>
                      </div>
                    </div>

                    {/* Continue Button */}
                    <Button
                      onClick={() => setShowWelcomePopup(false)}
                      className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-bold py-2 text-sm rounded-xl"
                    >
                      ✓ Got It! Show Payment Methods
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {success && receipt && (
              <Card className="glass border-emerald-200 dark:border-emerald-700/30 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/30 dark:to-green-900/30 relative">
                {/* Close Button */}
                <button
                  onClick={() => {
                    setReceipt(null);
                    setSuccess(false);
                    router.push('/dashboard');
                  }}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-slate-700 hover:bg-slate-800 text-white flex items-center justify-center transition-all duration-200 z-10"
                  title="Close"
                >
                  <span className="text-xl font-bold">✕</span>
                </button>
                <CardContent className="pt-10 space-y-8">
                  {/* Receipt Header */}
                  <div className="text-center space-y-3 pb-6 border-b border-slate-200 dark:border-slate-700">
                    <p className="text-5xl">✅</p>
                    <h3 className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">Payment Successful!</h3>
                    <p className="text-slate-600 dark:text-slate-400">Your order has been received and is pending verification</p>
                  </div>

                  {/* Receipt Details */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-white/50 dark:bg-slate-800/30 rounded-lg">
                      <span className="text-slate-600 dark:text-slate-400 font-medium">Order ID:</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white text-lg">{receipt.orderId}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-white/50 dark:bg-slate-800/30 rounded-lg">
                      <span className="text-slate-600 dark:text-slate-400 font-medium">User Name:</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{user?.name || 'Customer'}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-white/50 dark:bg-slate-800/30 rounded-lg">
                      <span className="text-slate-600 dark:text-slate-400 font-medium">Plan Name:</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{plan?.name || 'IPTV Plan'}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-white/50 dark:bg-slate-800/30 rounded-lg">
                      <span className="text-slate-600 dark:text-slate-400 font-medium">Payment Method:</span>
                      <span className="font-semibold text-slate-900 dark:text-white capitalize">{method || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-white/50 dark:bg-slate-800/30 rounded-lg">
                      <span className="text-slate-600 dark:text-slate-400 font-medium">Total Paid:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xl">${finalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-white/50 dark:bg-slate-800/30 rounded-lg">
                      <span className="text-slate-600 dark:text-slate-400 font-medium">Transaction ID:</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">{receipt.transactionId}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-6 border-t border-slate-200 dark:border-slate-700">
                    <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => window.print()}>
                      📥 Download Receipt
                    </Button>
                    <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" onClick={() => navigator.share?.({ title: 'Payment Receipt', text: `Order #${receipt.orderId} - ${finalPrice}` })}>
                      📤 Share
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {!success && (
              <>
                {/* STEP 1: Payment Method Selection */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    {/* Step Indicator */}
                    <div className="flex items-center justify-between px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold">1</div>
                        <span className="font-semibold text-slate-900 dark:text-white">Select Payment Method</span>
                      </div>
                      <span className="text-sm text-slate-600 dark:text-slate-400">(Step 1 of 2)</span>
                    </div>

                    {/* Payment Methods */}
                    <Card className="glass">
                      <CardTitle className="mb-4">Select Your Payment Method</CardTitle>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          {paymentMethods.map((pm) => (
                            <button
                              key={pm.id}
                              onClick={() => handleMethodSelect(pm.id as PaymentMethod)}
                              className={`p-4 rounded-2xl transition-all duration-200 relative overflow-visible animate-shine ${
                                method === pm.id
                                  ? 'ring-2 ring-emerald-500 bg-emerald-50/20 dark:bg-emerald-900/20 scale-105'
                                  : 'bg-slate-100 dark:bg-slate-800 hover:scale-105'
                              }`}
                            >
                              {(pm.id === 'remitly' || pm.id === 'binance') && (
                                <div className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-lg z-10 whitespace-nowrap">
                                  🎁 +30% OFF
                                </div>
                              )}
                              <p className="text-3xl mb-2">{pm.icon}</p>
                              <p className="font-semibold text-slate-900 dark:text-white text-sm">{pm.name}</p>
                            </button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Accordion for Instructions and Account Info */}
                    {method && expandedMethod === method && (
                      <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                        {/* Instructions Box */}
                        <Card className="glass border-blue-200/50 dark:border-blue-700/30">
                          <div
                            onClick={() => setExpandedMethod(expandedMethod === method ? null : method)}
                            className="cursor-pointer flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">📋</span>
                              <h4 className="font-bold text-slate-900 dark:text-white">How to Send Payment</h4>
                            </div>
                            <ChevronDown className={`w-5 h-5 transition-transform ${expandedMethod === method ? 'rotate-180' : ''}`} />
                          </div>
                          <CardContent className="pt-2 pb-4 border-t border-slate-200 dark:border-slate-700">
                            <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                              {getPaymentMethodDetails(method).instructions}
                            </p>
                          </CardContent>
                        </Card>

                        {/* Account Holder Information Box */}
                        <Card className="glass border-green-200/50 dark:border-green-700/30">
                          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-t-2xl border-b border-slate-200 dark:border-slate-700">
                            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                              <span>🔐</span> Account Information
                            </h4>
                          </div>
                          <CardContent className="pt-4 space-y-3">
                            {getPaymentMethodDetails(method).accountInfo.map((info, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
                              >
                                <div>
                                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">{info.name}</p>
                                  <p className="text-sm font-mono font-bold text-slate-900 dark:text-white break-all">{info.value}</p>
                                </div>
                                <button
                                  onClick={() => copyToClipboard(info.value, info.name)}
                                  className={`ml-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                                    copiedField === info.name
                                      ? 'bg-emerald-500 text-white'
                                      : 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-600'
                                  }`}
                                >
                                  {copiedField === info.name ? '✓ Copied' : '📋 Copy'}
                                </button>
                              </div>
                            ))}
                          </CardContent>
                        </Card>

                        {/* Bonus Discount Info (for Remitly/Binance) */}
                        {isSpecialPayment && (
                          <Card className="glass border-red-200/50 dark:border-red-700/30 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20">
                            <CardContent className="pt-4">
                              <div className="flex items-start gap-3">
                                <span className="text-2xl">🎁</span>
                                <div>
                                  <p className="font-bold text-red-700 dark:text-red-300">You get +30% Extra Discount!</p>
                                  <p className="text-sm text-slate-600 dark:text-slate-400">Special bonus applied when paying with {method === 'remitly' ? 'Remitly' : 'Binance'}</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    )}

                    {error && <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-700/50 rounded-lg text-red-700 dark:text-red-300 text-sm">{error}</div>}

                    {/* Continue Button */}
                    <Button
                      onClick={handleContinueToStep2}
                      disabled={!method}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white py-3 text-lg"
                      size="lg"
                    >
                      → Continue to Payment Proof ({method ? `${method}` : 'Select a method'})
                    </Button>
                  </div>
                )}

                {/* STEP 2: Payment Proof Upload */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    {/* Step Indicator */}
                    <div className="flex items-center justify-between px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold">2</div>
                        <span className="font-semibold text-slate-900 dark:text-white">Upload Payment Proof</span>
                      </div>
                      <span className="text-sm text-slate-600 dark:text-slate-400">(Step 2 of 2)</span>
                    </div>

                    {/* Back Button */}
                    <Button
                      onClick={() => setCurrentStep(1)}
                      variant="outline"
                      className="w-full border-slate-300 dark:border-slate-600"
                    >
                      ← Back to Select Payment Method
                    </Button>

                    {/* Selected Payment Method Display */}
                    <Card className="glass bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200/50 dark:border-blue-700/30">
                      <CardContent className="pt-4">
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Selected Payment Method:</p>
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{paymentMethods.find(pm => pm.id === method)?.icon}</span>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white text-lg">{paymentMethods.find(pm => pm.id === method)?.name}</p>
                            {isSpecialPayment && <p className="text-xs text-red-600 dark:text-red-400 font-semibold">🎁 +30% Bonus Applied</p>}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Payment Proof */}
                    <Card className="glass">
                      <CardTitle className="mb-4">📸 Payment Proof</CardTitle>
                      <CardContent className="space-y-4">
                        <div>
                          <label htmlFor="payment-proof" className="block text-sm font-semibold text-slate-900 dark:text-white mb-3">Upload Screenshot</label>
                          <input
                            id="payment-proof"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            disabled={loading}
                            title="Upload payment proof screenshot"
                            className="w-full px-4 py-4 rounded-2xl bg-white dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-slate-100 dark:file:bg-slate-700 file:text-slate-700 dark:file:text-slate-300 hover:border-slate-400 dark:hover:border-slate-500 transition-colors"
                          />
                          {screenshot && <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2">✓ {screenshot.name}</p>}
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-3">Transaction ID</label>
                          <input
                            type="text"
                            placeholder="Enter transaction ID/reference"
                            value={txId}
                            onChange={(e) => setTxId(e.target.value)}
                            disabled={loading}
                            className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-emerald-500 dark:focus:border-emerald-500 focus:outline-none transition-colors"
                          />
                        </div>

                        {error && <p className="text-red-500 text-sm bg-red-50 dark:bg-red-950/30 p-3 rounded-lg">{error}</p>}
                      </CardContent>
                    </Card>

                    {/* Plan Summary */}
                    <Card className="glass border-emerald-200 dark:border-emerald-700/30">
                      <CardTitle className="mb-4">Plan Summary</CardTitle>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">{plan?.name || 'IPTV Plan'}</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{plan?.duration || 'Plan'}</p>
                          </div>
                          <div className="text-right">
                            <p className="line-through text-slate-400">${originalPrice.toFixed(2)}</p>
                            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">${salePrice.toFixed(2)}</p>
                          </div>
                        </div>

                        {isSpecialPayment && (
                          <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                            <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-xl p-4 mb-4 shadow-lg">
                              <p className="text-lg font-bold text-white mb-1">🎁 30% BONUS DISCOUNT!</p>
                              <p className="text-sm text-white/90">Special offer on Remitly & Binance</p>
                            </div>
                            <div className="bg-red-50 dark:bg-red-900/30 rounded-xl p-4 border-2 border-red-200 dark:border-red-700/50">
                              <div className="space-y-3">
                                <div className="flex justify-between">
                                  <span className="text-slate-600 dark:text-slate-400 font-medium">Sale Price:</span>
                                  <span className="font-semibold text-slate-900 dark:text-white">${salePrice.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between bg-red-100 dark:bg-red-900/50 rounded-lg p-2">
                                  <span className="text-red-700 dark:text-red-300 font-bold">Extra Discount (30%):</span>
                                  <span className="font-bold text-red-600 dark:text-red-400 text-lg">-${extraDiscount.toFixed(2)}</span>
                                </div>
                                <div className="h-px bg-slate-300 dark:bg-slate-600"></div>
                                <div className="flex justify-between pt-2">
                                  <span className="text-emerald-700 dark:text-emerald-300 font-bold text-lg">Your Final Price:</span>
                                  <span className="text-emerald-600 dark:text-emerald-400 font-bold text-2xl">${finalPrice.toFixed(2)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {!isSpecialPayment && (
                          <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                            <div className="flex justify-between text-lg font-bold">
                              <span className="text-emerald-600 dark:text-emerald-400">Total Amount:</span>
                              <span className="text-emerald-600 dark:text-emerald-400">${finalPrice.toFixed(2)}</span>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Submit Form */}
                    <form onSubmit={handleSubmit}>
                      <Button
                        type="submit"
                        disabled={!screenshot || !txId || loading}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
                        size="lg"
                      >
                        {loading ? (
                          <>
                            <Loader className="w-4 h-4 animate-spin mr-2" />
                            Processing...
                          </>
                        ) : (
                          `✓ Confirm Payment ($${finalPrice.toFixed(2)})`
                        )}
                      </Button>
                    </form>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <PaymentContent />
    </Suspense>
  );
}
