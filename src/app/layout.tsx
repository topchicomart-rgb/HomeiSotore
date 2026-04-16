import { ReactNode } from 'react';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { AppProvider } from '@/components/providers/app-provider';
import { AdminProvider } from '@/components/providers/admin-provider';
import { Navbar } from '@/components/navbar';
import { BottomNavigation } from '@/components/bottom-navigation';
import { GlowBackground } from '@/components/glow-background';
import { LoadingBar } from '@/components/loading-bar';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>PrimexStream Pro - Premium IPTV & Services</title>
        <meta name="description" content="Premium IPTV services, home repair, and earn programs" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased bg-white dark:bg-black min-h-screen">
        <ThemeProvider>
          <AppProvider>
            <AdminProvider>
              <GlowBackground />
              <LoadingBar />
              <Navbar />
              {children}
              <BottomNavigation />
            </AdminProvider>
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
