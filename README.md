# PrimexStream Pro

A modern, professional Next.js 14+ SaaS web application for premium IPTV services and earning programs. Built with App Router, Tailwind CSS, Lucide React icons, and designed with a mobile-app aesthetic.

## 🎯 Features

### Core Features
- **Authentication**: Simple login/signup with email and demo mode
- **Dashboard**: Personalized greeting, service cards, and quick access to plans
- **IPTV Services**: 3-step wizard for device selection, plan choice, and checkout
- **Payment System**: Multiple payment methods (Remitly, Binance, PayPal, CashApp) with discount offers
- **Referral Program**: Earn money through affiliate commissions with tiered levels
- **Order Management**: Track all your orders with real-time status updates
- **Wallet System**: Add funds, withdraw, and view transaction history
- **Support**: FAQ section and contact form with multiple support channels

### Design Features
- **Mobile App Feel**: Full-screen cards, bottom navigation, minimal top bar
- **Dark Mode**: Complete dark mode support with smooth transitions
- **Glassmorphism**: Modern glass effect on cards and navigation
- **Responsive Design**: Mobile-first and fully responsive
- **Smooth Animations**: Fade-in, slide-up, and pulse animations
- **Gradient Background**: Soft blue gradients with accent glows
- **Icons**: Lucide React icons throughout the app

### Color Scheme
- **Primary**: Emerald Green (#10b981)
- **Accent**: Purple dots and soft orange glows
- **Background**: Soft gradient (white + blue in light mode, dark blue in dark mode)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

The app will automatically redirect to the login page if not authenticated.

### Demo Credentials
You can use any email and password to sign up or log in. The authentication is simulated using localStorage for demo purposes.

## 📁 Project Structure

```
src/
├── app/
│   ├── layout.tsx           # Root layout with providers
│   ├── page.tsx             # Home redirect page
│   ├── globals.css          # Global styles
│   ├── login/               # Login/Signup page
│   ├── dashboard/           # Home dashboard
│   ├── iptv/                # IPTV service wizard
│   ├── payment/             # Payment page
│   ├── earn/                # Referral/earn page
│   ├── orders/              # Orders list
│   ├── wallet/              # Wallet management
│   └── support/             # Support & FAQ
├── components/
│   ├── providers/           # Theme and app providers
│   ├── ui/                  # Reusable UI components
│   ├── app-layout.tsx       # App wrapper layout
│   ├── bottom-navigation.tsx # Mobile navigation
│   ├── theme-toggle.tsx     # Dark mode toggle
│   └── whatsapp-button.tsx  # Floating WhatsApp button
└── lib/                     # Utilities and helpers
```

## 🎨 Design System

### Components
- **Button**: Primary, secondary, outline variants with sizes (sm, md, lg)
- **Card**: Glassmorphic cards with optional hover effects
- **Input**: Styled inputs with labels and error states
- **AppLayout**: Main layout wrapper with navigation and theme toggle

### Colors
All colors are defined in `tailwind.config.ts` with dark mode variants:
- Primary colors (emerald shades)
- Secondary colors (slate shades)
- Accent colors (purple, orange)

### Animations
- `fade-in-up`: Smooth fade-in with upward movement
- `pulse-soft`: Gentle pulsing effect
- Transition delays for smooth interactions

## 📱 Pages Overview

### Login Page
- Toggle between login and signup
- Email, password, and optional name fields
- Google sign-in button (demo)
- Form validation and error handling

### Dashboard
- Personalized greeting with user's name
- 4 service cards (IPTV, Home Repair, Earn, Products)
- Quick popular IPTV plans section
- Quick stats (credits, active plans)

### IPTV Page
- Step 1: Device selection (8 devices)
- Step 2: Plan selection (3 plans + custom)
- Step 3: Additional details (device count, requirements)
- Progress indicator and navigation

### Payment Page
- Discount popup highlighting 30% offer
- 4 payment methods with details
- Account information with copy button
- QR code display
- Payment proof upload
- Transaction ID input

### Earn Page
- Total earnings and referrals display
- Referral code and link with copy buttons
- Share functionality
- 3 commission levels (Beginner, Pro, Elite)
- How it works section

### Orders Page
- Order statistics
- Order list with status badges
- Device and plan information
- Expiry dates for active plans

### Wallet Page
- Current balance display
- Add funds with preset amounts
- Withdrawal with method selection
- Complete transaction history
- Status indicators for each transaction

### Support Page
- Quick contact options (WhatsApp, Email, Phone)
- Contact form for messages
- 6 FAQs with expandable/collapsible sections

## 🔧 Technologies

- **Next.js 14+**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS
- **Lucide React**: Icon library
- **React Hooks**: State management (Context API)
- **Local Storage**: Persistent user data

## 🎯 Key Implementation Details

### Authentication
- Simulated with localStorage
- User object persists across sessions
- Automatic redirect based on login status

### Dark Mode
- Uses system preference detection
- Manual toggle with persistence
- Smooth transitions between modes

### State Management
- AppProvider for user state
- ThemeProvider for dark mode
- Component-level useState for forms

### Responsive Design
- Mobile-first approach
- Grid layouts for services and features
- Adaptive navigation for different screen sizes

## 🚀 Deployment

### Build for Production
```bash
npm run build
npm start
```

### Deploy Options
- Vercel (recommended for Next.js)
- Netlify
- AWS Amplify
- Docker containers

## 📝 Environment Variables

Currently, no environment variables are required for the demo. For production:

```
NEXT_PUBLIC_API_URL=your_api_url
NEXT_PUBLIC_PAYMENT_KEY=your_payment_key
```

## 🐛 Known Limitations

- Authentication is simulated (use localStorage)
- Payment processing is demo only
- No real payment integrations
- No backend API (all data is simulated)

## 🔒 Security Notes

- This is a frontend demo
- Never store sensitive data in localStorage
- Implement proper authentication for production
- Use secure payment gateways
- Validate all inputs on the backend

## 📄 License

Private project. Designed and built for PrimexStream Pro.

## 👨‍💻 Development

### Code Style
- TypeScript for type safety
- Component-based architecture
- Tailwind CSS for styling
- Consistent naming conventions

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/feature-name

# Commit changes
git commit -m "feat: add feature description"

# Push to remote
git push origin feature/feature-name
```

## 📞 Support

For questions or issues, contact support@primexstream.com

---

Built with ❤️ using Next.js, React, and Tailwind CSS
