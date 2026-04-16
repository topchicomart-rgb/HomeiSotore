# PrimexStream Pro - Development Guidelines

## Project Overview

PrimexStream Pro is a modern Next.js 14+ SaaS web application featuring:
- Premium IPTV service management
- 3-step purchasing wizard
- Multiple payment gateway integration
- Referral and affiliate program
- Wallet and fund management system
- Complete support and FAQ system

## Development Setup

### Installation
```bash
npm install
npm run dev
```

The app runs on http://localhost:3000

### Build & Production
```bash
npm run build
npm start
```

## Architecture

### Tech Stack
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: React Context API + localStorage

### Directory Structure
```
src/
├── app/              # Next.js App Router pages
├── components/       # Reusable components
│   ├── ui/          # Base UI components
│   └── providers/   # React Context providers
└── lib/             # Utilities and helpers
```

## Key Files

- `layout.tsx` - Root layout with theme and app providers
- `globals.css` - Global styles including Tailwind and custom animations
- `tailwind.config.ts` - Theme configuration with custom colors and animations
- `next.config.js` - Next.js configuration

## Component Architecture

### Base Components
- **Button** - Primary, secondary, outline variants
- **Card** - Glassmorphic card component with variants
- **Input** - Styled input with labels and error states

### Layout Components
- **AppLayout** - Main authenticated layout with navigation
- **BottomNavigation** - Mobile app-style navigation
- **ThemeToggle** - Dark mode switch

### Providers
- **ThemeProvider** - Dark mode support with localStorage persistence
- **AppProvider** - User authentication and state management

## Pages

### Public Routes
- `/login` - Login/Signup page
- `/` - Root redirect page

### Protected Routes (Require Authentication)
- `/dashboard` - Main dashboard with service cards
- `/iptv` - IPTV booking wizard
- `/payment` - Payment processing page
- `/earn` - Referral program page
- `/orders` - Order history and tracking
- `/wallet` - Wallet management
- `/support` - FAQ and contact form

## Authentication

### Implementation
- Uses Context API (AppProvider) for state management
- localStorage for persistence
- Fake auth system for demo purposes

### Flow
1. User logs in
2. User object stored in localStorage
3. useApp() hook provides user and auth functions
4. Pages redirect to /login if not authenticated

## Styling Guidelines

### Color Scheme
- **Primary Green**: #10b981 (Emerald)
- **Dark Background**: #0f172a, #1e293b
- **Accent Purple**: #8b5cf6
- **Accent Orange**: #fed7aa

### Glassmorphism
- Use `.glass` or `.glass-light` classes
- Applies backdrop blur and transparency
- Works in both light and dark modes

### Responsive Design
- Mobile-first approach
- Grid: 2 columns on mobile, auto on larger screens
- Bottom navigation takes 96px (pb-24)

## Form Handling

### Input Validation
- Check required fields before submission
- Show error messages below inputs
- Disable buttons during submission

### Form State
- Use useState for form values
- Single onChange handler per input
- Validation on blur or submit

## State Management

### Context Providers
```typescript
useApp() // User auth state
// Returns: { user, isLoggedIn, login, logout, updateUser }

useTheme() // Not directly exposed, handled by ThemeProvider
```

### localStorage Keys
- `user` - User object
- `theme` - 'light' or 'dark'

## Animation & UX

### CSS Animations
- `fade-in-up`: Fade + upward movement (0.5s)
- `pulse-soft`: Gentle pulsing (3s)
- Smooth transitions on all interactive elements

### Hover Effects
- Scale transforms on cards (1.05)
- Opacity changes on buttons
- Color transitions on text

## Best Practices

### Naming Conventions
- Components: PascalCase (e.g., `Dashboard.tsx`)
- Files: kebab-case in folders, PascalCase for components
- Constants: UPPER_SNAKE_CASE

### Imports
- Use absolute imports with `@/` alias
- Group imports: React, libraries, local
- Export defaults from page components

### TypeScript
- Define interfaces for props
- Use type for unions and simple types
- Strict null checks enabled

### Performance
- Use `'use client'` for interactive components
- Lazy load heavy components
- Optimize images and assets

## Common Tasks

### Adding a New Page
1. Create folder in `src/app/[page-name]/`
2. Create `page.tsx` in that folder
3. Use `AppLayout` wrapper for authenticated pages
4. Add route to bottom navigation if needed

### Creating a New Component
1. Create to `src/components/`
2. Use 'use client' if interactive
3. Define props interface
4. Export as named export

### Updating Theme Colors
1. Edit `tailwind.config.ts`
2. Update color definitions
3. Use class names in components
4. Test in both light and dark modes

## Debugging

### Common Issues
- **Dark mode not applying**: Check `document.documentElement.classList`
- **Styles not showing**: Verify Tailwind path includes file
- **Type errors**: Run `npm run build` to check TypeScript

### Development Commands
```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run start    # Run production build
npm run lint     # Run ESLint
```

## Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Connect repo in Vercel dashboard
3. Deploy automatically on push

### Environment Variables
No sensitive env vars needed for current demo. For production:
- Set up `.env.local`
- Configure payment API keys
- Set up email service credentials

## Code Quality

### TypeScript
- Strict mode enabled in tsconfig
- No implicit any
- Full type coverage for props

### ESLint
- Uses Next.js recommended config
- Run `npm run lint` before pushing

### CSS/Tailwind
- Use consistency in class application
- Avoid inline styles
- Leverage color system

## Contributing

### Branch Naming
- Feature: `feature/description`
- Bug fix: `bugfix/description`
- Release: `release/version`

### Commit Messages
- Use conventional commits
- Prefix: feat, fix, refactor, test, docs
- Example: `feat: add payment method selection`

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [Lucide React Icons](https://lucide.dev)
- [React Documentation](https://react.dev)

## Support

For questions about the codebase, check comments in components or create an issue in the repo.

---

**Last Updated**: April 2, 2026
**Version**: 1.0.0
