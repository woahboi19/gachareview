'use client';

import { useState } from 'react';

interface RatingStarsProps {
  rating: number;
  setRating?: (rating: number) => void;
  interactive?: boolean;
}

export default function RatingStars({ rating, setRating, interactive = false }: RatingStarsProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLSpanElement>, starIndex: number) => {
    if (!interactive || !setRating) return;
    const { left, width } = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - left) / width;
    const value = starIndex - 1 + (percent <= 0.5 ? 0.5 : 1);
    setHoverRating(value);
  };

  const handleMouseLeave = () => {
    if (!interactive) return;
    setHoverRating(null);
  };

  const handleClick = () => {
    if (!interactive || !setRating || hoverRating === null) return;
    setRating(hoverRating);
  };

  const displayRating = hoverRating !== null ? hoverRating : rating;

  return (
    <div style={{ display: 'inline-flex', gap: '4px' }} onMouseLeave={handleMouseLeave}>
      {[1, 2, 3, 4, 5].map((star) => {
        const isFull = displayRating >= star;
        const isHalf = displayRating >= star - 0.5 && displayRating < star;

        return (
          <span
            key={star}
            onMouseMove={(e) => handleMouseMove(e, star)}
            onClick={handleClick}
            style={{
              cursor: interactive ? 'pointer' : 'default',
              position: 'relative',
              display: 'inline-block',
              fontSize: '1.5rem',
              color: 'var(--color-surface-border)',
              transition: 'transform 0.1s ease',
            }}
          >
            ★
            {(isFull || isHalf) && (
              <span
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: isHalf ? '50%' : '100%',
                  overflow: 'hidden',
                  color: '#f5c518',
                }}
              >
                ★
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
}
