'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/components/providers/app-provider';
import { useAdmin } from '@/components/providers/admin-provider';
import AdminLayout from '@/components/admin-layout';
import { getWebConfig, updateWebConfig, WebConfigData } from '@/lib/webconfig-service';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, Save } from 'lucide-react';

export default function WebsiteConfigPage() {
  const { isLoggedIn, isLoading } = useApp();
  const { isAdmin } = useAdmin();
  const router = useRouter();
  const [config, setConfig] = useState<ConfigData | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (isLoading) return;
    if (!isLoggedIn || !isAdmin) {
      router.push('/admin/login');
    }
  }, [isLoggedIn, isAdmin, isLoading, router]);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      let data = await getConfig();
      // Ensure all nested properties exist
      if (!data.paymentMethods) {
        data.paymentMethods = {
          binance: { isActive: true, extraDiscount: 30, instructions: '', accountInfo: '' },
          remitly: { isActive: true, extraDiscount: 30, instructions: '', accountInfo: '' },
          paypal: { isActive: true, extraDiscount: 0, instructions: '', accountInfo: '' },
          cashapp: { isActive: true, extraDiscount: 0, instructions: '', accountInfo: '' }
        };
      }
      if (!data.homeServices) {
        data.homeServices = {
          locksmith: { name: 'Locksmith', phone: '' },
          plumbing: { name: 'Plumbing', phone: '' },
          electrician: { name: 'Electrician', phone: '' },
          roofing: { name: 'Roofing', phone: '' },
          treeTrimming: { name: 'Tree Trimming', phone: '' },
          custom: { name: 'Custom Service', phone: '' }
        };
      }
      setConfig(data);
    } catch (error) {
      console.error('Error loading config:', error);
      setMessage({ type: 'error', text: 'Failed to load configuration' });
    } finally {
      setPageLoading(false);
    }
  };

  const handleSave = async () => {
    if (!config) return;
    setLoading(true);
    try {
      const success = await updateConfig(config);
      if (success) {
        setMessage({ type: 'success', text: 'Configuration saved successfully!' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: 'Failed to save configuration' });
      }
    } catch (error) {
      console.error('Error saving config:', error);
      setMessage({ type: 'error', text: 'Error saving configuration' });
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || pageLoading) {
    return (
      <AdminLayout title="Website Configuration">
        <div className="text-center py-12">
          <p className="text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!config) {
    return (
      <AdminLayout title="Website Configuration">
        <div className="text-center py-12">
          <p className="text-slate-600 dark:text-slate-400">Failed to load configuration</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Website Configuration">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Message */}
        {message && (
          <div className={`p-4 rounded-lg flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 border border-green-200' : 'bg-red-50 dark:bg-red-900/20 border border-red-200'}`}>
            {message.type === 'success' ? <CheckCircle className="w-5 h-5 text-green-600" /> : <AlertCircle className="w-5 h-5 text-red-600" />}
            <p className={message.type === 'success' ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}>{message.text}</p>
          </div>
        )}

        {/* Site Settings */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Site Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Site Name</label>
              <Input
                value={config.site.siteName}
                onChange={(e) => setConfig({ ...config, site: { ...config.site, siteName: e.target.value } })}
                placeholder="Site Name"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Currency</label>
              <Input
                value={config.site.currency}
                onChange={(e) => setConfig({ ...config, site: { ...config.site, currency: e.target.value } })}
                placeholder="USD"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Support Email</label>
              <Input
                value={config.site.supportEmail}
                onChange={(e) => setConfig({ ...config, site: { ...config.site, supportEmail: e.target.value } })}
                placeholder="support@primexstream.com"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Support Phone</label>
              <Input
                value={config.site.supportPhone}
                onChange={(e) => setConfig({ ...config, site: { ...config.site, supportPhone: e.target.value } })}
                placeholder="+1234567890"
              />
            </div>
          </div>
        </Card>

        {/* Plans */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">IPTV Plans</h2>
          <div className="space-y-8">
            {/* 1 Month Plan */}
            <div className="border-b border-slate-200 dark:border-slate-700 pb-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">1 Month Plan</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Price</label>
                  <Input type="number" value={config.plans.plan1Month.price} onChange={(e) => setConfig({ ...config, plans: { ...config.plans, plan1Month: { ...config.plans.plan1Month, price: Number(e.target.value) } } })} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Sale Price</label>
                  <Input type="number" value={config.plans.plan1Month.salePrice} onChange={(e) => setConfig({ ...config, plans: { ...config.plans, plan1Month: { ...config.plans.plan1Month, salePrice: Number(e.target.value) } } })} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Features</label>
                  <Input value={config.plans.plan1Month.features} onChange={(e) => setConfig({ ...config, plans: { ...config.plans, plan1Month: { ...config.plans.plan1Month, features: e.target.value } } })} />
                </div>
              </div>
            </div>

            {/* 6 Month Plan */}
            <div className="border-b border-slate-200 dark:border-slate-700 pb-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">6 Month Plan</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Price</label>
                  <Input type="number" value={config.plans.plan6Month.price} onChange={(e) => setConfig({ ...config, plans: { ...config.plans, plan6Month: { ...config.plans.plan6Month, price: Number(e.target.value) } } })} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Sale Price</label>
                  <Input type="number" value={config.plans.plan6Month.salePrice} onChange={(e) => setConfig({ ...config, plans: { ...config.plans, plan6Month: { ...config.plans.plan6Month, salePrice: Number(e.target.value) } } })} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Features</label>
                  <Input value={config.plans.plan6Month.features} onChange={(e) => setConfig({ ...config, plans: { ...config.plans, plan6Month: { ...config.plans.plan6Month, features: e.target.value } } })} />
                </div>
              </div>
            </div>

            {/* 12 Month Plan */}
            <div className="pb-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">12 Month Plan</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Price</label>
                  <Input type="number" value={config.plans.plan12Month.price} onChange={(e) => setConfig({ ...config, plans: { ...config.plans, plan12Month: { ...config.plans.plan12Month, price: Number(e.target.value) } } })} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Sale Price</label>
                  <Input type="number" value={config.plans.plan12Month.salePrice} onChange={(e) => setConfig({ ...config, plans: { ...config.plans, plan12Month: { ...config.plans.plan12Month, salePrice: Number(e.target.value) } } })} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Features</label>
                  <Input value={config.plans.plan12Month.features} onChange={(e) => setConfig({ ...config, plans: { ...config.plans, plan12Month: { ...config.plans.plan12Month, features: e.target.value } } })} />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Extra Discount (%)</label>
              <Input type="number" value={config.plans.extraDiscount} onChange={(e) => setConfig({ ...config, plans: { ...config.plans, extraDiscount: Number(e.target.value) } })} />
            </div>
          </div>
        </Card>

        {/* Payment Methods */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Payment Methods</h2>
          <div className="space-y-8">
            {/* Binance */}
            <div className="border-b border-slate-200 dark:border-slate-700 pb-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Binance</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Discount (%)</label>
                  <Input type="number" value={config.paymentMethods?.binance?.extraDiscount ?? 30} onChange={(e) => setConfig({ ...config, paymentMethods: { ...config.paymentMethods, binance: { ...config.paymentMethods.binance, extraDiscount: Number(e.target.value) } } })} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Active</label>
                  <select value={(config.paymentMethods?.binance?.isActive ?? true) ? 'true' : 'false'} onChange={(e) => setConfig({ ...config, paymentMethods: { ...config.paymentMethods, binance: { ...config.paymentMethods.binance, isActive: e.target.value === 'true' } } })} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Instructions</label>
                  <textarea value={config.paymentMethods?.binance?.instructions || ''} onChange={(e) => setConfig({ ...config, paymentMethods: { ...config.paymentMethods, binance: { ...config.paymentMethods.binance, instructions: e.target.value } } })} placeholder="Payment instructions for Binance" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white h-24" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Account Information</label>
                  <textarea value={config.paymentMethods?.binance?.accountInfo || ''} onChange={(e) => setConfig({ ...config, paymentMethods: { ...config.paymentMethods, binance: { ...config.paymentMethods.binance, accountInfo: e.target.value } } })} placeholder="Account details, wallet address, etc." className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white h-24" />
                </div>
              </div>
            </div>

            {/* Remitly */}
            <div className="border-b border-slate-200 dark:border-slate-700 pb-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Remitly</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Discount (%)</label>
                  <Input type="number" value={config.paymentMethods?.remitly?.extraDiscount ?? 30} onChange={(e) => setConfig({ ...config, paymentMethods: { ...config.paymentMethods, remitly: { ...config.paymentMethods.remitly, extraDiscount: Number(e.target.value) } } })} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Active</label>
                  <select value={(config.paymentMethods?.remitly?.isActive ?? true) ? 'true' : 'false'} onChange={(e) => setConfig({ ...config, paymentMethods: { ...config.paymentMethods, remitly: { ...config.paymentMethods.remitly, isActive: e.target.value === 'true' } } })} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Instructions</label>
                  <textarea value={config.paymentMethods?.remitly?.instructions || ''} onChange={(e) => setConfig({ ...config, paymentMethods: { ...config.paymentMethods, remitly: { ...config.paymentMethods.remitly, instructions: e.target.value } } })} placeholder="Payment instructions for Remitly" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white h-24" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Account Information</label>
                  <textarea value={config.paymentMethods?.remitly?.accountInfo || ''} onChange={(e) => setConfig({ ...config, paymentMethods: { ...config.paymentMethods, remitly: { ...config.paymentMethods.remitly, accountInfo: e.target.value } } })} placeholder="Account details, recipient info, etc." className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white h-24" />
                </div>
              </div>
            </div>

            {/* PayPal */}
            <div className="border-b border-slate-200 dark:border-slate-700 pb-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">PayPal</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Discount (%)</label>
                  <Input type="number" value={config.paymentMethods?.paypal?.extraDiscount ?? 0} onChange={(e) => setConfig({ ...config, paymentMethods: { ...config.paymentMethods, paypal: { ...config.paymentMethods.paypal, extraDiscount: Number(e.target.value) } } })} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Active</label>
                  <select value={(config.paymentMethods?.paypal?.isActive ?? true) ? 'true' : 'false'} onChange={(e) => setConfig({ ...config, paymentMethods: { ...config.paymentMethods, paypal: { ...config.paymentMethods.paypal, isActive: e.target.value === 'true' } } })} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Instructions</label>
                  <textarea value={config.paymentMethods?.paypal?.instructions || ''} onChange={(e) => setConfig({ ...config, paymentMethods: { ...config.paymentMethods, paypal: { ...config.paymentMethods.paypal, instructions: e.target.value } } })} placeholder="PayPal payment instructions" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white h-24" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Account Information</label>
                  <textarea value={config.paymentMethods?.paypal?.accountInfo || ''} onChange={(e) => setConfig({ ...config, paymentMethods: { ...config.paymentMethods, paypal: { ...config.paymentMethods.paypal, accountInfo: e.target.value } } })} placeholder="PayPal email or account details" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white h-24" />
                </div>
              </div>
            </div>

            {/* Cash App */}
            <div className="pb-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Cash App</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Discount (%)</label>
                  <Input type="number" value={config.paymentMethods?.cashapp?.extraDiscount ?? 0} onChange={(e) => setConfig({ ...config, paymentMethods: { ...config.paymentMethods, cashapp: { ...config.paymentMethods.cashapp, extraDiscount: Number(e.target.value) } } })} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Active</label>
                  <select value={(config.paymentMethods?.cashapp?.isActive ?? true) ? 'true' : 'false'} onChange={(e) => setConfig({ ...config, paymentMethods: { ...config.paymentMethods, cashapp: { ...config.paymentMethods.cashapp, isActive: e.target.value === 'true' } } })} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Instructions</label>
                  <textarea value={config.paymentMethods?.cashapp?.instructions || ''} onChange={(e) => setConfig({ ...config, paymentMethods: { ...config.paymentMethods, cashapp: { ...config.paymentMethods.cashapp, instructions: e.target.value } } })} placeholder="Cash App payment instructions" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white h-24" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Account Information</label>
                  <textarea value={config.paymentMethods?.cashapp?.accountInfo || ''} onChange={(e) => setConfig({ ...config, paymentMethods: { ...config.paymentMethods, cashapp: { ...config.paymentMethods.cashapp, accountInfo: e.target.value } } })} placeholder="Cash App tag or account details" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white h-24" />
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Referral Settings */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Referral Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Commission Rate (%)</label>
              <Input type="number" value={config.referral.commissionRate} onChange={(e) => setConfig({ ...config, referral: { ...config.referral, commissionRate: Number(e.target.value) } })} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Bonus per Referral</label>
              <Input type="number" value={config.referral.bonusAmount} onChange={(e) => setConfig({ ...config, referral: { ...config.referral, bonusAmount: Number(e.target.value) } })} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Payout Threshold</label>
              <Input type="number" value={config.referral.payoutThreshold} onChange={(e) => setConfig({ ...config, referral: { ...config.referral, payoutThreshold: Number(e.target.value) } })} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Active</label>
              <select value={config.referral.isActive ? 'true' : 'false'} onChange={(e) => setConfig({ ...config, referral: { ...config.referral, isActive: e.target.value === 'true' } })} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Home Services */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Home Services (for services page)</h2>
          <div className="space-y-6">
            <div className="border-b border-slate-200 dark:border-slate-700 pb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Service 1: Locksmith</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Service Name</label>
                  <Input value={config.homeServices?.locksmith?.name || 'Locksmith'} onChange={(e) => setConfig({ ...config, homeServices: { ...config.homeServices, locksmith: { ...config.homeServices?.locksmith, name: e.target.value } } })} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Call Number</label>
                  <Input value={config.homeServices?.locksmith?.phone || ''} onChange={(e) => setConfig({ ...config, homeServices: { ...config.homeServices, locksmith: { ...config.homeServices?.locksmith, phone: e.target.value } } })} placeholder="+1-800-123-4567" />
                </div>
              </div>
            </div>

            <div className="border-b border-slate-200 dark:border-slate-700 pb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Service 2: Plumbing</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Service Name</label>
                  <Input value={config.homeServices?.plumbing?.name || 'Plumbing'} onChange={(e) => setConfig({ ...config, homeServices: { ...config.homeServices, plumbing: { ...config.homeServices?.plumbing, name: e.target.value } } })} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Call Number</label>
                  <Input value={config.homeServices?.plumbing?.phone || ''} onChange={(e) => setConfig({ ...config, homeServices: { ...config.homeServices, plumbing: { ...config.homeServices?.plumbing, phone: e.target.value } } })} placeholder="+1-800-123-4567" />
                </div>
              </div>
            </div>

            <div className="border-b border-slate-200 dark:border-slate-700 pb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Service 3: Electrician</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Service Name</label>
                  <Input value={config.homeServices?.electrician?.name || 'Electrician'} onChange={(e) => setConfig({ ...config, homeServices: { ...config.homeServices, electrician: { ...config.homeServices?.electrician, name: e.target.value } } })} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Call Number</label>
                  <Input value={config.homeServices?.electrician?.phone || ''} onChange={(e) => setConfig({ ...config, homeServices: { ...config.homeServices, electrician: { ...config.homeServices?.electrician, phone: e.target.value } } })} placeholder="+1-800-123-4567" />
                </div>
              </div>
            </div>

            <div className="border-b border-slate-200 dark:border-slate-700 pb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Service 4: Roofing</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Service Name</label>
                  <Input value={config.homeServices?.roofing?.name || 'Roofing'} onChange={(e) => setConfig({ ...config, homeServices: { ...config.homeServices, roofing: { ...config.homeServices?.roofing, name: e.target.value } } })} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Call Number</label>
                  <Input value={config.homeServices?.roofing?.phone || ''} onChange={(e) => setConfig({ ...config, homeServices: { ...config.homeServices, roofing: { ...config.homeServices?.roofing, phone: e.target.value } } })} placeholder="+1-800-123-4567" />
                </div>
              </div>
            </div>

            <div className="border-b border-slate-200 dark:border-slate-700 pb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Service 5: Tree Trimming</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Service Name</label>
                  <Input value={config.homeServices?.treeTrimming?.name || 'Tree Trimming'} onChange={(e) => setConfig({ ...config, homeServices: { ...config.homeServices, treeTrimming: { ...config.homeServices?.treeTrimming, name: e.target.value } } })} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Call Number</label>
                  <Input value={config.homeServices?.treeTrimming?.phone || ''} onChange={(e) => setConfig({ ...config, homeServices: { ...config.homeServices, treeTrimming: { ...config.homeServices?.treeTrimming, phone: e.target.value } } })} placeholder="+1-800-123-4567" />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Service 6: Custom Service</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Service Name</label>
                  <Input value={config.homeServices?.custom?.name || 'Custom Service'} onChange={(e) => setConfig({ ...config, homeServices: { ...config.homeServices, custom: { ...config.homeServices?.custom, name: e.target.value } } })} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Call Number</label>
                  <Input value={config.homeServices?.custom?.phone || ''} onChange={(e) => setConfig({ ...config, homeServices: { ...config.homeServices, custom: { ...config.homeServices?.custom, phone: e.target.value } } })} placeholder="+1-800-123-4567" />
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end gap-3">
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold rounded-lg transition-colors"
          >
            <Save size={20} />
            {loading ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
