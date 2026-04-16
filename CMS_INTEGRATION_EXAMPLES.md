# CMS Integration Examples

This file contains ready-to-use examples for common website pages.

## 1. Home Page (`src/app/page.tsx`)

```tsx
'use client';

import { useHomeContent, useSiteInfo, useFeatures, useSocialLinks } from '@/lib/useWebsiteContent';
import { Zap, Wifi, Lock, Play } from 'lucide-react';

export default function HomePage() {
  const { title, subtitle, description, cta, ctaLink, loading } = useHomeContent();
  const { name } = useSiteInfo();
  const { features } = useFeatures();
  const socialsLoading = useFeatures()[1];

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <main className="min-h-screen">
      {/* Hero Section - NOW EDITABLE FROM ADMIN */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-800 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-white mb-6">{title}</h1>
          <h2 className="text-2xl text-gray-300 mb-4">{subtitle}</h2>
          <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">{description}</p>
          <a
            href={ctaLink}
            className="inline-block bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-lg font-semibold transition"
          >
            {cta}
          </a>
        </div>
      </section>

      {/* Features Section - NOW EDITABLE FROM ADMIN */}
      <section className="py-20 px-4 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Why {name}?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div
                key={feature.id}
                className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow hover:shadow-lg transition"
              >
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
```

## 2. Footer Component (`src/components/footer.tsx`)

```tsx
'use client';

import { useContactInfo, useSocialLinks, useSiteInfo } from '@/lib/useWebsiteContent';
import { Facebook, Twitter, Instagram, Youtube, MessageCircle } from 'lucide-react';

export function Footer() {
  const { phone, email, address, hours } = useContactInfo();
  const { facebook, twitter, instagram, youtube, telegram, whatsapp } = useSocialLinks();
  const { name } = useSiteInfo();

  return (
    <footer className="bg-slate-900 text-white py-12 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Company Info */}
        <div>
          <h3 className="font-bold text-lg mb-4">{name}</h3>
          <p className="text-gray-400 text-sm">Premium IPTV Streaming Service</p>
        </div>

        {/* Contact Info - NOW FROM ADMIN */}
        <div>
          <h4 className="font-semibold mb-4">Contact</h4>
          <p className="text-gray-400 text-sm mb-2">📞 {phone}</p>
          <p className="text-gray-400 text-sm mb-2">✉️ {email}</p>
          <p className="text-gray-400 text-sm mb-2">📍 {address}</p>
          <p className="text-gray-400 text-sm">🕐 {hours}</p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li><a href="/pricing" className="hover:text-white">Pricing</a></li>
            <li><a href="/support" className="hover:text-white">Support</a></li>
            <li><a href="/login" className="hover:text-white">Login</a></li>
          </ul>
        </div>

        {/* Social Links - NOW FROM ADMIN */}
        <div>
          <h4 className="font-semibold mb-4">Follow Us</h4>
          <div className="flex gap-4">
            {facebook && <a href={facebook} title="Facebook"><Facebook size={20} className="hover:text-emerald-500" /></a>}
            {twitter && <a href={twitter} title="Twitter"><Twitter size={20} className="hover:text-emerald-500" /></a>}
            {instagram && <a href={instagram} title="Instagram"><Instagram size={20} className="hover:text-emerald-500" /></a>}
            {youtube && <a href={youtube} title="YouTube"><Youtube size={20} className="hover:text-emerald-500" /></a>}
            {telegram && <a href={telegram} title="Telegram"><MessageCircle size={20} className="hover:text-emerald-500" /></a>}
          </div>
        </div>
      </div>

      <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400 text-sm">
        <p>&copy; 2024 {name}. All rights reserved.</p>
      </div>
    </footer>
  );
}
```

## 3. Header Component (`src/components/header.tsx`)

```tsx
'use client';

import { useSiteInfo } from '@/lib/useWebsiteContent';

export function Header() {
  const { name, loading } = useSiteInfo();

  return (
    <header className="bg-white dark:bg-slate-900 shadow">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-emerald-600">
          {name}
        </h1>
        <nav className="flex gap-6">
          <a href="/" className="hover:text-emerald-600">Home</a>
          <a href="/pricing" className="hover:text-emerald-600">Pricing</a>
          <a href="/support" className="hover:text-emerald-600">Support</a>
        </nav>
      </div>
    </header>
  );
}
```

## 4. Payment Page (`src/app/payment/page.tsx`)

```tsx
'use client';

import { usePaymentSettings, useContactInfo } from '@/lib/useWebsiteContent';

export default function PaymentPage() {
  const { instructions, bankAccounts, methods, loading } = usePaymentSettings();
  const { phone, email, whatsapp } = useContactInfo();

  if (loading) {
    return <div className="text-center py-20">Loading payment information...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Payment Methods</h1>

      {/* Instructions - NOW FROM ADMIN */}
      <section className="mb-12 bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Payment Instructions</h2>
        <p className="whitespace-pre-wrap">{instructions}</p>
      </section>

      {/* Bank Accounts - NOW FROM ADMIN */}
      {bankAccounts && bankAccounts.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-6">Bank Transfer Details</h2>
          <div className="grid gap-6">
            {bankAccounts.map((account) => (
              <div key={account.id} className="border rounded-lg p-6">
                <h3 className="font-semibold text-lg mb-4">{account.bankName}</h3>
                <div className="space-y-2">
                  <p><span className="font-semibold">Account Holder:</span> {account.accountHolder}</p>
                  <p><span className="font-semibold">Account Number:</span> {account.accountNumber}</p>
                  {account.swiftCode && <p><span className="font-semibold">SWIFT Code:</span> {account.swiftCode}</p>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Contact Support - NOW FROM ADMIN */}
      <section>
        <h2 className="text-xl font-semibold mb-6">Need Help?</h2>
        <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
          <p className="mb-4">Contact our support team:</p>
          <ul className="space-y-2">
            <li>📧 Email: <a href={`mailto:${email}`} className="text-emerald-600 hover:underline">{email}</a></li>
            <li>📞 Phone: <a href={`tel:${phone}`} className="text-emerald-600 hover:underline">{phone}</a></li>
            <li>💬 WhatsApp: <a href={whatsapp} className="text-emerald-600 hover:underline">Chat with us</a></li>
          </ul>
        </div>
      </section>
    </div>
  );
}
```

## 5. Support/Contact Page (`src/app/support/page.tsx`)

```tsx
'use client';

import { useContactInfo, useSiteInfo } from '@/lib/useWebsiteContent';

export default function SupportPage() {
  const { phone, email, whatsapp, address, hours } = useContactInfo();
  const { name } = useSiteInfo();

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-12">Contact & Support</h1>

      {/* Contact Information - NOW FROM ADMIN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">📍 Address</h2>
          <p>{address}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">🕐 Business Hours</h2>
          <p>{hours}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">📞 Phone</h2>
          <a href={`tel:${phone}`} className="text-emerald-600 hover:underline font-semibold">
            {phone}
          </a>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">✉️ Email</h2>
          <a href={`mailto:${email}`} className="text-emerald-600 hover:underline font-semibold">
            {email}
          </a>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">💬 WhatsApp</h2>
          <a href={whatsapp} className="text-emerald-600 hover:underline font-semibold">
            Start Chat on WhatsApp
          </a>
        </div>
      </div>

      {/* Contact Form */}
      <section className="bg-blue-50 dark:bg-blue-900/20 p-8 rounded-lg">
        <h2 className="text-2xl font-semibold mb-6">Send us a Message</h2>
        <form className="space-y-4">
          <div>
            <label className="block font-semibold mb-2">Name</label>
            <input type="text" className="w-full border rounded p-2" placeholder="Your name" />
          </div>
          <div>
            <label className="block font-semibold mb-2">Email</label>
            <input type="email" className="w-full border rounded p-2" placeholder="Your email" />
          </div>
          <div>
            <label className="block font-semibold mb-2">Message</label>
            <textarea className="w-full border rounded p-2" rows={5} placeholder="Your message"></textarea>
          </div>
          <button className="bg-emerald-600 text-white px-6 py-2 rounded font-semibold hover:bg-emerald-700">
            Send Message
          </button>
        </form>
      </section>
    </div>
  );
}
```

## Integration Steps

1. **Copy the code** from the example for each page
2. **Replace your existing page** with the new version
3. **Test it locally** - Run `npm run dev`
4. **Go to admin panel** at `/admin/content`
5. **Edit content** and see changes in real-time!

## Customization

Feel free to:
- Add more styling/CSS
- Add animations
- Reorganize sections
- Add additional fields to Settings in the admin
- Create more custom hooks as needed

All changes to content in the admin panel will automatically reflect on your site without any code changes!
