'use client';

import { useState } from 'react';

interface FavoriteButtonProps {
  gameId: string;
  initialIsFavorited: boolean;
  isLoggedIn: boolean;
}

export default function FavoriteButton({ gameId, initialIsFavorited, isLoggedIn }: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited);
  const [isLoading, setIsLoading] = useState(false);

  const toggleFavorite = async () => {
    if (!isLoggedIn) {
      alert('Please log in to favorite games.');
      return;
    }

    if (isLoading) return;

    // Optimistic update
    setIsFavorited(!isFavorited);
    setIsLoading(true);

    try {
      const method = isFavorited ? 'DELETE' : 'POST';
      const res = await fetch(`/api/games/${gameId}/favorite`, { method });

      if (!res.ok) {
        // Revert on failure
        setIsFavorited(isFavorited);
        alert('Failed to update favorites. Please try again.');
      }
    } catch (err) {
      console.error(err);
      // Revert on failure
      setIsFavorited(isFavorited);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button 
      onClick={toggleFavorite}
      disabled={isLoading}
      title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
      style={{
        background: 'rgba(0,0,0,0.3)',
        border: '1px solid var(--color-surface-border)',
        borderRadius: '50%',
        width: '45px',
        height: '45px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: isLoggedIn ? 'pointer' : 'not-allowed',
        transition: 'all 0.2s ease',
        transform: isFavorited ? 'scale(1.05)' : 'scale(1)',
        backdropFilter: 'blur(4px)',
        color: isFavorited ? '#ff3b30' : '#fff'
      }}
      onMouseEnter={(e) => {
        if (isLoggedIn) e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
      }}
      onMouseLeave={(e) => {
        if (isLoggedIn) e.currentTarget.style.background = 'rgba(0,0,0,0.3)';
      }}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill={isFavorited ? 'currentColor' : 'none'} 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
      </svg>
    </button>
  );
}
