'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { signIn } from 'next-auth/react';

interface GameStatusSelectorProps {
  gameId: string;
  initialStatus: string | null;
  isLoggedIn: boolean;
}

export default function GameStatusSelector({ gameId, initialStatus, isLoggedIn }: GameStatusSelectorProps) {
  const [status, setStatus] = useState<string | null>(initialStatus);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleStatusChange = async (newStatus: string) => {
    if (!isLoggedIn) {
      toast.error('You must be logged in to update your status.');
      signIn();
      return;
    }

    setIsLoading(true);
    const previousStatus = status;
    setStatus(newStatus === 'NONE' ? null : newStatus);

    try {
      const res = await fetch(`/api/games/${gameId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        throw new Error('Failed to update status');
      }

      toast.success('Status updated');
      router.refresh();
    } catch (error) {
      console.error(error);
      setStatus(previousStatus);
      toast.error('Failed to update status');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <select 
        value={status || 'NONE'} 
        onChange={(e) => handleStatusChange(e.target.value)}
        disabled={isLoading}
        className="form-input"
        style={{ 
          padding: '0.4rem 2rem 0.4rem 1rem', 
          fontSize: '0.9rem', 
          borderRadius: '20px', 
          background: 'var(--color-surface)',
          border: '1px solid var(--color-surface-border)',
          color: 'var(--color-text-main)',
          cursor: isLoading ? 'not-allowed' : 'pointer'
        }}
      >
        <option value="NONE">Set Status...</option>
        <option value="PLAYING">Playing</option>
        <option value="COMPLETED">Completed</option>
        <option value="DROPPED">Dropped</option>
      </select>
    </div>
  );
}
