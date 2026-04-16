'use client';

export function LoadingBar() {
  return (
    <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/30 dark:via-white/20 to-transparent backdrop-blur-lg z-50 overflow-hidden">
      <div className="h-full bg-gradient-to-r from-transparent via-white/60 dark:via-white/40 to-transparent animate-glass-slide" />
    </div>
  );
}
