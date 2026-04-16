'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/components/providers/app-provider';
import { AppLayout } from '@/components/app-layout';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { getConfig, ConfigData } from '@/lib/firebase-service';

type Device = 'smart-tv' | 'firestick' | 'android-box' | 'mobile' | 'laptop' | 'tablet' | 'mag-box' | 'pc';
type PaymentMethod = 'remitly' | 'binance' | 'paypal' | 'cashapp';

interface WizardState {
  device: Device | null;
  plan: string | null;
  paymentMethod: PaymentMethod | null;
}

const devices: { id: Device; label: string; emoji: string }[] = [
  { id: 'smart-tv', label: 'Smart TV', emoji: '📺' },
  { id: 'firestick', label: 'Firestick', emoji: '🔥' },
  { id: 'android-box', label: 'Android Box', emoji: '📦' },
  { id: 'mobile', label: 'Mobile', emoji: '📱' },
  { id: 'laptop', label: 'Laptop', emoji: '💻' },
  { id: 'tablet', label: 'Tablet', emoji: '⌚' },
  { id: 'mag-box', label: 'MAG Box', emoji: '🖥️' },
  { id: 'pc', label: 'PC', emoji: '🖲️' },
];

const paymentMethods = [
  { id: 'remitly', name: 'Remitly', icon: '🔵' },
  { id: 'binance', name: 'Binance', icon: '🟡' },
  { id: 'paypal', name: 'PayPal', icon: '💙' },
  { id: 'cashapp', name: 'Cash App', icon: '💚' },
];

export default function IPTVPage() {
  const [step, setStep] = useState(1);
  const [state, setState] = useState<WizardState>({
    device: null,
    plan: null,
    paymentMethod: null,
  });
  const [config, setConfig] = useState<ConfigData | null>(null);
  const router = useRouter();
  const { isLoggedIn, isLoading } = useApp();

  useEffect(() => {
    if (isLoading) return;
    if (!isLoggedIn) {
      router.push('/login');
    }
  }, [isLoggedIn, isLoading, router]);

  // Load config from Firebase
  useEffect(() => {
    const loadConfig = async () => {
      const configData = await getConfig();
      setConfig(configData);
    };
    loadConfig();
  }, []);

  const handlePlanSelect = (planId: string) => {
    setState({ ...state, plan: planId });
  };

  // Get current plan details from config
  const plans = config ? {
    '1month': { 
      duration: '1 Month', 
      originalPrice: config.plans.plan1Month.price, 
      salePrice: config.plans.plan1Month.salePrice,
      extraDiscount: 0
    },
    '6month': { 
      duration: '6 Months', 
      originalPrice: config.plans.plan6Month.price, 
      salePrice: config.plans.plan6Month.salePrice,
      extraDiscount: config.plans.plan6Month.extraDiscount || 0
    },
    '12month': { 
      duration: '12 Months', 
      originalPrice: config.plans.plan12Month.price, 
      salePrice: config.plans.plan12Month.salePrice,
      extraDiscount: config.plans.plan12Month.extraDiscount || 0
    },
  } : {};
  
  const currentPlan = state.plan && plans[state.plan as keyof typeof plans] ? plans[state.plan as keyof typeof plans] : null;
  const isSpecialPayment = state.paymentMethod === 'remitly' || state.paymentMethod === 'binance';

  // When payment method is selected, navigate to payment page
  useEffect(() => {
    if (state.device && state.plan && state.paymentMethod && currentPlan) {
      setTimeout(() => {
        const queryParams = new URLSearchParams({
          plan: state.plan || '',
          device: state.device || '',
          paymentMethod: state.paymentMethod || '',
          originalPrice: currentPlan?.originalPrice?.toString() || '0',
          salePrice: currentPlan?.salePrice?.toString() || '0',
        });
        router.push(`/payment?${queryParams.toString()}`);
      }, 300);
    }
  }, [state.device, state.plan, state.paymentMethod, currentPlan, router]);

  return (
    <AppLayout title="IPTV Services">
      <div className="w-full">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-8 py-12 lg:py-16">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-200 ${
                    s <= step
                      ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {s < step ? <Check className="w-5 h-5" /> : s}
                </div>
                {s < 3 && (
                  <div
                    className={`flex-1 h-1 mx-2 rounded-full transition-all duration-200 ${
                      s < step
                        ? 'bg-emerald-500'
                        : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
            {step === 1 && 'Step 1: Select Device'}
            {step === 2 && 'Step 2: Select Plan'}
            {step === 3 && 'Step 3: Select Payment Method'}
          </p>
        </div>

        {/* Step 1: Select Device */}
        {step === 1 && (
          <div className="space-y-4">
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Which device will you use for IPTV?
            </p>
            <div className="grid grid-cols-2 gap-3">
              {devices.map((device) => (
                <button
                  key={device.id}
                  onClick={() => {
                    setState({ ...state, device: device.id });
                    setStep(2);
                  }}
                  className={`glass rounded-2xl p-4 flex flex-col items-center justify-center gap-2 transition-all duration-200 ${
                    state.device === device.id
                      ? 'ring-2 ring-emerald-500 bg-emerald-50/20 dark:bg-emerald-900/20'
                      : 'hover:scale-105'
                  }`}
                >
                  <span className="text-3xl">{device.emoji}</span>
                  <span className="text-sm font-medium text-slate-900 dark:text-white text-center">
                    {device.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Select Plan */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setStep(1)}
                className="rounded-full"
              >
                ← Back
              </Button>
              <p className="text-slate-600 dark:text-slate-400">
                {devices.find(d => d.id === state.device)?.label}
              </p>
            </div>

            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Choose your subscription plan
            </p>
            <div className="grid grid-cols-2 gap-3">
              {config ? Object.entries(plans).map(([id, plan]) => (
                <button
                  key={id}
                  onClick={() => {
                    handlePlanSelect(id);
                    setTimeout(() => setStep(3), 200);
                  }}
                  className={`glass rounded-2xl p-4 text-center transition-all duration-200 relative flex flex-col items-center justify-center ${
                    state.plan === id
                      ? 'ring-2 ring-emerald-500 bg-emerald-50/20 dark:bg-emerald-900/20'
                      : 'hover:scale-102'
                  }`}
                >
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white text-base">
                      {plan.duration}
                    </p>
                    {id === '6month' && (
                      <span className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-1 rounded-full inline-block mt-2">
                        Most Popular
                      </span>
                    )}
                    {id === '12month' && (
                      <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-full inline-block mt-2 ml-2">
                        Best Value
                      </span>
                    )}
                  </div>
                  <div className="text-center mt-3">
                    <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                      ${plan.salePrice}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-through">
                      ${plan.originalPrice}
                    </p>
                  </div>
                </button>
              )) : (
                <div className="col-span-2 text-center py-8">
                  <p className="text-slate-600 dark:text-slate-400">Loading plans...</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Select Payment Method */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setStep(2)}
                className="rounded-full"
              >
                ← Back
              </Button>
              <p className="text-slate-600 dark:text-slate-400">
                {currentPlan?.duration} - ${currentPlan?.salePrice}
              </p>
            </div>

            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Select your payment method and see your savings!
            </p>

            {/* Payment Methods Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {paymentMethods.map((pm) => (
                <button
                  key={pm.id}
                  onClick={() => setState({ ...state, paymentMethod: pm.id as PaymentMethod })}
                  className={`glass rounded-2xl p-5 transition-all duration-200 relative overflow-visible animate-shine flex flex-col items-center justify-center ${
                    state.paymentMethod === pm.id
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

            {/* Discount Breakdown */}
            {state.paymentMethod && currentPlan && (
              <Card className="glass border-emerald-200 dark:border-emerald-700/30">
                <CardContent className="pt-4">
                  <h4 className="font-bold text-slate-900 dark:text-white mb-4">💰 Your Savings:</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 dark:text-slate-400">Original Price:</span>
                      <span className="font-bold text-slate-900 dark:text-white line-through text-slate-400">
                        ${currentPlan.originalPrice}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 dark:text-slate-400">Sale Price:</span>
                      <span className="font-bold text-slate-900 dark:text-white">${currentPlan.salePrice}</span>
                    </div>
                    {isSpecialPayment && (
                      <div className="flex justify-between items-center bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">
                        <span className="text-red-700 dark:text-red-300 font-semibold">Extra Discount (30%):</span>
                        <span className="font-bold text-red-600 dark:text-red-400">-${currentPlan.extraDiscount}</span>
                      </div>
                    )}
                    <div className="h-px bg-slate-300 dark:bg-slate-600"></div>
                    <div className="flex justify-between items-center pt-2 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 p-3 rounded-lg">
                      <span className="text-emerald-700 dark:text-emerald-300 font-bold">Final Price:</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold text-lg">
                        ${isSpecialPayment ? (currentPlan.salePrice - currentPlan.extraDiscount).toFixed(2) : currentPlan.salePrice}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Continue Button */}
            <Button
              onClick={() => {}}
              disabled={!state.paymentMethod}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white py-3 text-lg mt-6"
              size="lg"
            >
              → Continue to Payment
            </Button>
          </div>
        )}
      </div>
    </div>
    </AppLayout>
  );
}
