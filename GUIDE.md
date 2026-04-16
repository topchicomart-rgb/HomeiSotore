# 🚀 PrimexStream Pro - Quick Start Guide

Welcome to PrimexStream Pro! This comprehensive guide will help you get started with the application.

## 🎯 What is PrimexStream Pro?

PrimexStream Pro is a modern SaaS platform that provides:
- **Premium IPTV Services** - Streaming content on multiple devices
- **Flexible Plans** - 1-month, 6-month, 12-month, and custom options
- **Multiple Payment Methods** - Remitly, Binance, PayPal, CashApp
- **Referral Program** - Earn money by inviting friends
- **Account Management** - Wallet, orders, and support

## 🏃 Getting Started

### 1. First Time Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

### 2. Login/Sign Up

- **No real credentials needed** - Use any email and password as a demo
- Click "Sign Up" to create a new account
- Or use the "Continue with Google" button for quick access
- Your data persists in browser's localStorage

### 3. Explore the Dashboard

After login, you'll see:
- **Personalized greeting** with your name
- **Service cards** for IPTV, Home Repair, Earn, and Products
- **Quick popular plans** showing pricing
- **Quick stats** showing your credits and active plans

## 📱 Main Features

### IPTV Services (3-Step Process)
1. **Select Device** - Choose from 8 device types
2. **Select Plan** - Pick 1-month, 6-month, 12-month, or custom
3. **Confirm Details** - Specify number of devices and requirements

### Payment System
- **Get 30% discount** when paying with Remitly or Binance
- **View account details** for each payment method
- **Copy account info** with one click
- **Upload proof** of payment and transaction ID

### Referral Program (Earn Page)
- **Share your code** with friends and family
- **Earn commissions** on every purchase
- **Climb levels** from Beginner to Elite
- **Increase commission rate** as you refer more people

### Order Management
- **Track all orders** with real-time status
- **View order details** including device and plan info
- **Monitor expiry dates** for active subscriptions
- **See order statistics** at a glance

### Wallet System
- **Add funds** using preset amounts or custom input
- **Withdraw earnings** via multiple methods
- **Track transactions** with complete history
- **Check balance** anytime

### Support & Help
- **Quick contact options** (WhatsApp, Email, Phone)
- **Contact form** for detailed inquiries
- **6 comprehensive FAQs** with expandable sections

## 🎨 Design Features

### Dark Mode
- **Auto-detect** system preference on first load
- **Manual toggle** using the moon/sun icon in the top bar
- **Smooth transitions** between light and dark themes
- **Persists** your preference in localStorage

### Mobile App Feel
- **Bottom navigation** like a real mobile app
- **Full-screen cards** for immersive experience
- **Minimal top bar** with branding and theme toggle
- **Floating WhatsApp button** for quick support

### Visual Polish
- **Glassmorphism effects** on cards and navigation
- **Soft gradients** for elegant backgrounds
- **Smooth animations** on scroll and interaction
- **Accent glows** in purple and orange
- **Emerald green** primary color throughout

## 📊 Demo Data

The app comes with sample data:

### Sample Orders
```
#ORD2024001 - 6 Month IPTV (Smart TV) - Active
#ORD2024002 - 1 Month IPTV (Mobile) - Processing  
#ORD2024003 - 12 Month IPTV (Android Box) - Pending
#ORD2023001 - 6 Month IPTV (Firestick) - Expired
```

### Sample Wallet
```
Current Balance: $150.50
Credits: $150.50
Referral Earnings: $250.50
Active Referrals: 8
Commission Level: Pro (10%)
```

### Sample Plans
```
1 Month - $20
6 Months - $65 (Most Popular)
12 Months - $90 (Best Value)
Custom - Contact us
```

## 🔧 Customization

### Change Colors
Edit `tailwind.config.ts`:
```typescript
colors: {
  primary: {
    600: '#10b981', // Change this to your color
  },
  accent: {
    purple: '#8b5cf6',
    orange: '#fed7aa',
  },
}
```

### Update Branding
Edit `src/app/layout.tsx`:
```typescript
<title>Your Brand - Premium IPTV & Services</title>
```

### Modify Plans
Edit `src/app/iptv/page.tsx`:
```typescript
const plans = [
  { id: '1-month', duration: '1 Month', price: 20 },
  // Add or modify plans here
]
```

### Add Payment Methods
Edit `src/app/payment/page.tsx`:
```typescript
const paymentMethods = [
  { id: 'paypal', name: 'PayPal', ... },
  // Add new methods here
]
```

## 📝 Sample Workflows

### Workflow 1: Purchase IPTV (New User)
1. Click "IPTV Services" on dashboard
2. Select "Smart TV" device
3. Select "6 Months - Most Popular" plan
4. Set number of devices to 2
5. Add special requirements if needed
6. Click "Continue to Payment"
7. Select "Remitly" for 30% discount
8. Copy account info and send payment
9. Upload screenshot and transaction ID
10. Receive "Payment Pending Verification"

### Workflow 2: Invite Friends (Referral)
1. Go to "Earn" section
2. Copy your referral code: `DEMO123`
3. Share with friends via WhatsApp
4. They sign up with your code
5. When they purchase, you earn commission
6. Track earnings and referrals in real-time

### Workflow 3: Add Funds to Wallet
1. Go to "Wallet" section
2. Click "Add Funds"
3. Select $25 preset or enter custom amount
4. Click "Proceed to Payment"
5. Complete payment via your chosen method
6. Funds appear in wallet immediately

## 🎓 Tips & Tricks

### Browser LocalStorage
- Your user account is stored in localStorage
- Open DevTools → Application → Local Storage to see `user` object
- Modify it directly to test different scenarios

### Test Multiple Users
- Open app in different browser or incognito mode
- Each instance has its own localStorage
- Useful for testing referral system

### Modify Sample Data
- Edit `const transactions`, `const orders`, etc. in each page
- Add more entries for realistic testing
- Customize fields as needed

### Theme Testing
- Use DevTools to toggle `dark` class on `<html>`
- Verify colors work in both light and dark modes
- Check contrast ratios for accessibility

## 🐛 Troubleshooting

### App Won't Start
```bash
# Clear cache and reinstall
rm -r node_modules
rm package-lock.json
npm install
npm run dev
```

### Dark Mode Not Working
- Check if localStorage has `theme` key
- Open DevTools: `localStorage.setItem('theme', 'dark')`
- Refresh page

### Styles Not Showing
- Verify Tailwind path in `tailwind.config.ts`
- Check globals.css is imported in layout
- Restart dev server

### Page Redirect to Login
- You're not authenticated
- User data missing from localStorage
- Try logging in again

## 📚 File Organization

```
src/
├── app/
│   ├── login/page.tsx       # Authentication
│   ├── dashboard/page.tsx   # Home page
│   ├── iptv/page.tsx        # Booking wizard
│   ├── payment/page.tsx     # Payment processing
│   ├── earn/page.tsx        # Referral program
│   ├── orders/page.tsx      # Order history
│   ├── wallet/page.tsx      # Fund management
│   ├── support/page.tsx     # Help & FAQ
│   └── layout.tsx           # Root layout
├── components/
│   ├── ui/                  # Base components
│   ├── providers/           # Context providers
│   └── app-layout.tsx       # Main wrapper
└── lib/                     # Utilities
```

## 🚀 Production Deployment

### Build Package
```bash
npm run build
npm start
```

### Deploy to Vercel
```bash
npm install -g vercel
vercel
```

### Deploy to Other Platforms
- **Netlify**: Connect GitHub repo directly
- **AWS Amplify**: Use Amplify CLI
- **Docker**: Create Dockerfile for containerization

## ⚡ Performance Tips

- Use production build: `npm run build && npm start`
- Enable caching in Next.js config
- Optimize images before using
- Use lazy loading for heavy components

## 🔒 Security Notes

**This is a demo app.** For production:

- ❌ Never store passwords in localStorage
- ✅ Implement proper JWT authentication
- ❌ Don't expose API keys in frontend
- ✅ Use secure backend for payments
- ❌ Validate everything client-side only
- ✅ Always validate on backend
- ❌ Don't use fake auth in production
- ✅ Implement OAuth or Auth0

## 📞 Support

For questions or issues:
- Check the FAQ section in the Support page
- Review comments in component files
- Check `.github/copilot-instructions.md` for dev guidelines

## 🎉 You're Ready!

Start by exploring the dashboard, trying different features, and customizing the app to your needs!

---

**Happy coding! 🚀**

**PrimexStream Pro v1.0.0** | Built with Next.js 14 + React + Tailwind CSS
