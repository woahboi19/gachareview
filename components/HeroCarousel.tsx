'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Game {
  id: string;
  title: string;
  imageUrl: string | null;
}

interface Chapter {
  id: string;
  gameId: string;
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

  const activeChapter = chapters[currentIndex];
  // Use chapter's image if available, else fallback to game's image
  const bgImage = activeChapter.imageUrl || activeChapter.game.imageUrl || 'https://images.unsplash.com/photo-1618336362047-9dc49b788019?q=80&w=1200&auto=format&fit=crop';

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '1200px', margin: '0 auto 2rem', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 12px 24px rgba(0,0,0,0.6)' }}>
      {/* Background Image Container */}
      <div 
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transition: 'background-image 0.5s ease-in-out',
          zIndex: 0
        }}
      >
        {/* Gradient Overlay for text readability */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'linear-gradient(to right, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 50%, rgba(0,0,0,0.3) 100%)',
        }} />
      </div>

      {/* Main Content Window */}
      <div style={{ position: 'relative', zIndex: 1, padding: '4rem 3rem', height: '420px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        
        {/* Arrows */}
        {chapters.length > 1 && (
          <>
            <button 
              onClick={prevSlide}
              style={{
                position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)',
                background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none',
                width: '40px', height: '40px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'background 0.2s ease',
                fontSize: '1.2rem', backdropFilter: 'blur(4px)'
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
                width: '40px', height: '40px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'background 0.2s ease',
                fontSize: '1.2rem', backdropFilter: 'blur(4px)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            >
              &#10095;
            </button>
          </>
        )}

        <div style={{ maxWidth: '600px', marginLeft: chapters.length > 1 ? '3rem' : '0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <span style={{ 
              background: 'var(--color-primary)', 
              color: '#000', 
              padding: '0.3rem 0.8rem', 
              borderRadius: '4px', 
              fontSize: '0.85rem',
              fontWeight: 'bold',
              textTransform: 'uppercase'
            }}>
              {activeChapter.game.title}
            </span>
            <span style={{ color: '#ccc', fontSize: '0.9rem' }}>
              {new Date(activeChapter.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          </div>

          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
            <span style={{ color: 'var(--color-primary)', marginRight: '0.5rem' }}>S1.E{activeChapter.chapterNum}</span>
            <br />
            {activeChapter.title}
          </h2>
          
          <p style={{ color: '#ddd', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '2rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {activeChapter.summary}
          </p>

          <Link href={`/game/${activeChapter.gameId}/chapter/${activeChapter.id}`}>
            <button className="btn btn-primary" style={{ padding: '0.8rem 2rem', fontSize: '1.1rem' }}>
              Read Details & Reviews
            </button>
          </Link>
        </div>

        {/* Pagination Dots */}
        {chapters.length > 1 && (
          <div style={{ position: 'absolute', bottom: '1.5rem', left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
            {chapters.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                style={{
                  width: '10px', height: '10px', borderRadius: '50%',
                  background: currentIndex === idx ? 'var(--color-primary)' : 'rgba(255,255,255,0.3)',
                  border: 'none', cursor: 'pointer', transition: 'background 0.3s ease'
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
