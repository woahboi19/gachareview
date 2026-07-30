'use client';

import { SessionProvider } from 'next-auth/react';
import { SpoilerProvider } from './SpoilerProvider';

export default function Providers({ children, initialSpoilerMode }: { children: React.ReactNode, initialSpoilerMode: boolean }) {
  return (
    <SessionProvider>
      <SpoilerProvider initialMode={initialSpoilerMode}>
        {children}
      </SpoilerProvider>
    </SessionProvider>
  );
}
