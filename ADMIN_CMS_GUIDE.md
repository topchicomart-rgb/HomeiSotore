# Admin CMS Implementation Guide

## Overview

I've built a comprehensive admin Content Management System (CMS) that allows you to manage ALL dynamic website content from the admin panel. Changes are instantly saved to Firebase and automatically update on your website.

## What's New

### 1. **Enhanced Admin Panel** (`/admin/content`)
   - **Website General Settings** - Site name, description, URL, maintenance mode
   - **Home Page Content** - Hero titles, subtitles, descriptions, CTA buttons
   - **Contact Information** - Phone, email, WhatsApp, address, business hours
   - **Payment Settings** - Payment instructions and methods
   - **Social Media Links** - All social platforms (Facebook, Twitter, Instagram, YouTube, Telegram, WhatsApp)
   - **SEO Settings** - Meta titles, descriptions, keywords

### 2. **Updated Firebase Schema**
   Extended `Settings` interface with comprehensive fields for all website content:

```typescript
Settings {
  // Basic
  siteName: string
  siteDescription: string
  siteUrl: string
  
  // Home Page
  homeTitle: string
  homeSubtitle: string
  homeDescription: string
  homeCta: string
  homeCtaLink: string
  
  // Contact
  contactInfo: {
    phone: string
    email: string
    whatsapp: string
    address: string
    hours: string
  }
  
  // Payment
  paymentInstructions: string
  paymentMethods: PaymentMethod[]
  bankAccounts: BankAccount[]
  
  // Social Links
  socialLinks: {
    facebook: string
    twitter: string
    instagram: string
    youtube: string
    telegram: string
    whatsapp: string
  }
  
  // SEO
  seoTitle: string
  seoDescription: string
  seoKeywords: string
  
  // Other
  maintenanceMode: boolean
  accountCreationLimit: number
  paymentInstructions: string
}
```

### 3. **Custom Hooks for Website Pages**
   Located in `/src/lib/useWebsiteContent.ts`

## Using the Hooks in Your Website Pages

### Example 1: Update Home Page

**Before (Hardcoded):**
```tsx
export default function HomePage() {
  return (
    <section>
      <h1>Premium IPTV Streaming</h1>
      <p>Watch Your Favorite Shows Anytime</p>
      <a href="#pricing">Get Started</a>
    </section>
  );
}
```

**After (Dynamic):**
```tsx
'use client';

import { useHomeContent } from '@/lib/useWebsiteContent';

export default function HomePage() {
  const { title, subtitle, description, cta, ctaLink, loading } = useHomeContent();

  if (loading) return <div>Loading...</div>;

  return (
    <section>
      <h1>{title}</h1>
      <p>{subtitle}</p>
      <p>{description}</p>
      <a href={ctaLink}>{cta}</a>
    </section>
  );
}
```

### Example 2: Update Contact Page

**Before (Hardcoded):**
```tsx
export default function ContactPage() {
  return (
    <section>
      <p>Phone: +1 (555) 123-4567</p>
      <p>Email: support@primexstream.pro</p>
      <p>WhatsApp: +1 (555) 123-4567</p>
      <p>Address: 123 Main Street, City, State</p>
    </section>
  );
}
```

**After (Dynamic):**
```tsx
'use client';

import { useContactInfo } from '@/lib/useWebsiteContent';

export default function ContactPage() {
  const { phone, email, whatsapp, address, hours } = useContactInfo();

  return (
    <section>
      <p>Phone: {phone}</p>
      <p>Email: {email}</p>
      <p>WhatsApp: {whatsapp}</p>
      <p>Address: {address}</p>
      <p>Hours: {hours}</p>
    </section>
  );
}
```

### Example 3: Update Header/Footer with Social Links

```tsx
'use client';

import { useSocialLinks } from '@/lib/useWebsiteContent';

export function Footer() {
  const { facebook, twitter, instagram, youtube, telegram } = useSocialLinks();

  return (
    <footer>
      <div className="social-links">
        {facebook && <a href={facebook}>Facebook</a>}
        {twitter && <a href={twitter}>Twitter</a>}
        {instagram && <a href={instagram}>Instagram</a>}
        {youtube && <a href={youtube}>YouTube</a>}
        {telegram && <a href={telegram}>Telegram</a>}
      </div>
    </footer>
  );
}
```

### Example 4: Payment Information Page

```tsx
'use client';

import { usePaymentSettings } from '@/lib/useWebsiteContent';

export default function PaymentPage() {
  const { instructions, bankAccounts, loading } = usePaymentSettings();

  if (loading) return <div>Loading...</div>;

  return (
    <section>
      <h2>Payment Instructions</h2>
      <p>{instructions}</p>
      
      <h3>Bank Accounts</h3>
      {bankAccounts.map((account) => (
        <div key={account.id}>
          <p>Bank: {account.bankName}</p>
          <p>Account Holder: {account.accountHolder}</p>
          <p>Account Number: {account.accountNumber}</p>
        </div>
      ))}
    </section>
  );
}
```

## All Available Hooks

```typescript
// Entire settings object
const { settings, loading } = useWebsiteSettings();

// Home page content
const { title, subtitle, description, cta, ctaLink, loading } = useHomeContent();

// Contact information
const { phone, email, whatsapp, address, hours, loading } = useContactInfo();

// Social links
const { facebook, twitter, instagram, youtube, telegram, whatsapp, loading } = useSocialLinks();

// Site info & SEO
const { name, description, url, seoTitle, seoDescription, seoKeywords, loading } = useSiteInfo();

// Payment settings
const { instructions, methods, bankAccounts, loading } = usePaymentSettings();

// Features list
const { features, loading } = useFeatures();

// Services list
const { services, loading } = useServices();

// Maintenance mode check
const { isEnabled, loading } = useMaintenanceMode();
```

## Admin Navigation

The admin panel now has a sidebar with links to:
- **Dashboard** - Overview and statistics
- **Orders** - Manage user orders
- **Website Content** ← NEW - Manage all website content
- **Settings** - General settings

## How to Update Website Content

1. **Go to Admin Panel** at `/admin`
2. **Click "Website Content"** in the sidebar
3. **Select a tab** (General, Home Page, Contact, Payment, Social, SEO)
4. **Edit the content**
5. **Click "Save Changes"**
6. **Changes appear instantly on the website!**

## Implementation Checklist

- [ ] Update `/page.tsx` to use `useHomeContent()`
- [ ] Update `/support` page to show contact info from admin
- [ ] Update `/wallet` or `/payment` page to show payment settings
- [ ] Update footer to use `useSocialLinks()`
- [ ] Update header/layout to use `useSiteInfo()` for site name
- [ ] Add any other pages that need dynamic content

## Example: Complete Home Page Implementation

```tsx
'use client';

import { useHomeContent, useSiteInfo, useSocialLinks, useFeatures } from '@/lib/useWebsiteContent';
import { Link } from 'next/link';

export default function HomePage() {
  const { title, subtitle, description, cta, ctaLink } = useHomeContent();
  const { name } = useSiteInfo();
  const { instagram, facebook, youtube } = useSocialLinks();
  const { features } = useFeatures();

  return (
    <div>
      {/* Hero Section */}
      <section className="hero py-20">
        <h1>{title}</h1>
        <h2>{subtitle}</h2>
        <p>{description}</p>
        <a href={ctaLink} className="btn btn-primary">{cta}</a>
      </section>

      {/* Features Section */}
      <section className="features py-20">
        <h2>Why Choose {name}?</h2>
        <div className="grid">
          {features.map((feature) => (
            <div key={feature.id} className="feature-card">
              {feature.icon && <img src={feature.icon} alt="" />}
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Social Links */}
      <section className="footer py-20">
        <div className="social-links">
          {facebook && <a href={facebook}>Facebook</a>}
          {instagram && <a href={instagram}>Instagram</a>}
          {youtube && <a href={youtube}>YouTube</a>}
        </div>
      </section>
    </div>
  );
}
```

## Real-Time Updates

All hooks use Firebase's real-time listeners (`onSnapshot`). This means:

1. ✅ When you update content in the admin panel
2. ✅ Changes are saved to Firebase immediately
3. ✅ Website pages listening to that content will re-render automatically
4. ✅ Multiple browsers/tabs see changes in real-time

## Next Steps

1. **Identify all hardcoded content** on your website
2. **Replace with hooks** from `useWebsiteContent.ts`
3. **Test changes** by updating content in admin panel
4. **Enjoy a fully dynamic website!**

## File Locations

- Admin CMS Page: `src/app/admin/content/page.tsx`
- Hooks: `src/lib/useWebsiteContent.ts`
- Firebase Service: `src/lib/admin-firestore-service.ts`
- Admin Layout: `src/components/admin-layout.tsx`

## Questions?

All hooks are fully typed with TypeScript and include JSDoc comments explaining usage. Check each hook's comments for detailed information.
