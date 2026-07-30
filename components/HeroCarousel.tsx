'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSpoiler } from './SpoilerProvider';

interface Game {
  id: string;
  slug: string;
  title: string;
  imageUrl: string | null;
}

interface Chapter {
  id: string;
  gameId: string;
  slug: string;
  title: string;
  chapterNum: number;
  summary: string;
  imageUrl: string | null;
  createdAt: Date;
  game: Game;
}

interface HeroCarouselProps {
  chapters: Chapter[];
}

export default function HeroCarousel({ chapters }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { isSpoilerMode } = useSpoiler();
  const [revealedSpoilers, setRevealedSpoilers] = useState<Record<string, boolean>>({});

  // Optional: Auto-slide
  useEffect(() => {
    if (chapters.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % chapters.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [chapters.length, currentIndex]);

  if (!chapters || chapters.length === 0) return null;

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % chapters.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? chapters.length - 1 : prev - 1));
  };

  return (
    <div className="carousel-wrapper" style={{ position: 'relative', width: '100%', maxWidth: '1200px', margin: '0 auto 2rem', overflow: 'hidden', border: '1px solid var(--color-surface-border)', borderTop: '2px solid var(--color-primary)', background: 'var(--color-surface)', height: '420px' }}>
      
      {/* Sliding Track */}
      <div 
        className="carousel-track"
        style={{
          display: 'flex',
          height: '100%',
          transition: 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)',
          transform: `translateX(-${currentIndex * 100}%)`,
        }}
      >
        {chapters.map((chapter) => {
          const bgImage = chapter.imageUrl || chapter.game.imageUrl || 'https://images.unsplash.com/photo-1618336362047-9dc49b788019?q=80&w=1200&auto=format&fit=crop';
          return (
            <div key={chapter.id} className="carousel-slide" style={{ minWidth: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
              
              {/* Solid Background Layer (Replaced Blur) */}
              <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'var(--color-surface)',
                backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(217, 70, 239, 0.05) 0%, transparent 40%)',
                zIndex: 0
              }} />

              {/* Contained Image Layer */}
              <div 
                className="carousel-image"
                style={{
                  position: 'absolute',
                  top: 0, left: '30%', right: 0, bottom: 0,
                  backgroundImage: `url(${bgImage})`,
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right center',
                  zIndex: 1
                }}
              />

              {/* Gradient Overlay */}
              <div className="carousel-gradient" style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                background: 'linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 45%, rgba(0,0,0,0) 100%)',
                zIndex: 2
              }} />

              {/* Main Content Window */}
              <div className="carousel-content" style={{ position: 'relative', zIndex: 3, padding: '4rem 3rem', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div className="carousel-text-area" style={{ maxWidth: '600px', marginLeft: chapters.length > 1 ? '3rem' : '0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                    <span style={{ 
                      background: 'var(--color-primary)', 
                      color: '#000', 
                      padding: '0.3rem 0.8rem', 
                      borderRadius: '4px', 
                      fontSize: '0.85rem',
                      fontWeight: 'bold',
                      textTransform: 'uppercase'
                    }}>
                      {chapter.game.title}
                    </span>
                    <span style={{ color: '#ccc', fontSize: '0.9rem' }}>
                      {new Date(chapter.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>

                  <div style={{ color: 'var(--color-primary)', fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '0.2rem', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                    S1.E{chapter.chapterNum}
                  </div>
                  <h2 className="carousel-title" style={{ 
                    color: '#fff',
                    fontSize: '2.5rem', 
                    fontWeight: 800, 
                    marginBottom: '0.5rem', 
                    textShadow: '0 2px 4px rgba(0,0,0,0.5)', 
                    height: '96px', 
                    display: '-webkit-box', 
                    WebkitLineClamp: 2, 
                    WebkitBoxOrient: 'vertical', 
                    overflow: 'hidden' 
                  }}>
                    {chapter.title}
                  </h2>
                  
                  {(() => {
                    const isNew = new Date().getTime() - new Date(chapter.createdAt).getTime() < 30 * 24 * 60 * 60 * 1000;
                    const isBlurred = isSpoilerMode && isNew && !revealedSpoilers[chapter.id];

                    return (
                      <div 
                        style={{ position: 'relative', marginBottom: '2rem', cursor: isBlurred ? 'pointer' : 'default' }}
                        onClick={() => {
                          if (isBlurred) {
                            setRevealedSpoilers(prev => ({ ...prev, [chapter.id]: true }));
                          }
                        }}
                      >
                        <p className="carousel-summary" style={{ 
                          color: '#ddd', 
                          fontSize: '1.05rem', 
                          lineHeight: 1.6, 
                          height: '80px', 
                          display: '-webkit-box', 
                          WebkitLineClamp: 3, 
                          WebkitBoxOrient: 'vertical', 
                          overflow: 'hidden',
                          filter: isBlurred ? 'blur(8px)' : 'none',
                          transition: 'filter 0.3s ease',
                          margin: 0
                        }}>
                          {chapter.summary}
                        </p>
                        {isBlurred && (
                          <div style={{
                            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'flex-start',
                            color: 'var(--color-primary)', fontWeight: 'bold', textShadow: '0 1px 3px rgba(0,0,0,0.8)'
                          }}>
                            <span>Click to reveal spoiler</span>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  <Link href={`/game/${chapter.game.slug}/chapter/${chapter.slug}`}>
                    <button className="btn btn-primary" style={{ padding: '0.8rem 2rem', fontSize: '1.1rem' }}>
                      Read Details & Reviews
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Arrows */}
      {chapters.length > 1 && (
        <>
          <button 
            onClick={prevSlide}
            style={{
              position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)',
              background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none',
              width: '40px', height: '40px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'background 0.2s ease',
              fontSize: '1.2rem', backdropFilter: 'blur(4px)', zIndex: 10
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          >
            &#10094;
          </button>
          <button 
            onClick={nextSlide}
            style={{
              position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)',
              background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none',
              width: '40px', height: '40px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'background 0.2s ease',
              fontSize: '1.2rem', backdropFilter: 'blur(4px)', zIndex: 10
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          >
            &#10095;
          </button>
        </>
      )}

      {/* Pagination Dots */}
      {chapters.length > 1 && (
        <div style={{ position: 'absolute', bottom: '1.5rem', left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: '0.5rem', zIndex: 10 }}>
          {chapters.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              style={{
                width: '12px', height: '12px', borderRadius: '0',
                background: currentIndex === idx ? 'var(--color-primary)' : 'rgba(255,255,255,0.3)',
                border: 'none', cursor: 'pointer', transition: 'background 0.3s ease'
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
