'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

type SpoilerContextType = {
  isSpoilerMode: boolean;
  toggleSpoilerMode: () => void;
};

const SpoilerContext = createContext<SpoilerContextType>({
  isSpoilerMode: true,
  toggleSpoilerMode: () => {},
});

export const useSpoiler = () => useContext(SpoilerContext);

export function SpoilerProvider({ children, initialMode = true }: { children: React.ReactNode, initialMode?: boolean }) {
  const { status } = useSession();
  const [isSpoilerMode, setIsSpoilerMode] = useState(initialMode);

  useEffect(() => {
    if (status === 'unauthenticated') {
      const stored = localStorage.getItem('spoilerMode');
      if (stored !== null) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsSpoilerMode(stored === 'true');
      }
    } else if (status === 'authenticated') {
      setIsSpoilerMode(initialMode);
    }
  }, [status, initialMode]);

  const toggleSpoilerMode = async () => {
    const newMode = !isSpoilerMode;
    setIsSpoilerMode(newMode);

    if (status === 'unauthenticated') {
      localStorage.setItem('spoilerMode', newMode.toString());
    } else if (status === 'authenticated') {
      try {
        await fetch('/api/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ spoilerMode: newMode })
        });
      } catch (err) {
        console.error('Failed to update spoiler mode in DB', err);
      }
    }
  };

  return (
    <SpoilerContext.Provider value={{ isSpoilerMode, toggleSpoilerMode }}>
      {children}
    </SpoilerContext.Provider>
  );
}
