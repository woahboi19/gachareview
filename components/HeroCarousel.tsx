'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  chapterType?: string;
  chapterCode?: string | null;
  createdAt: Date;
  releaseDate: Date | null;
  game: Game;
}

interface HeroCarouselProps {
  chapters: Chapter[];
}

export default function HeroCarousel({ chapters }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { isSpoilerMode } = useSpoiler();
  const [revealedSpoilers, setRevealedSpoilers] = useState<Record<string, boolean>>({});

  // Touch swipe state
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEndEvent = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) {
      nextSlide();
    }
    if (isRightSwipe) {
      prevSlide();
    }
  };

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
    <div 
      className="carousel-wrapper" 
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEndEvent}
    >
      
      {/* Sliding Track */}
      <div 
        className="carousel-track"
        style={{
          transform: `translateX(-${currentIndex * 100}%)`,
        }}
      >
        {chapters.map((chapter) => {
          const bgImage = chapter.imageUrl || chapter.game.imageUrl || 'https://images.unsplash.com/photo-1618336362047-9dc49b788019?q=80&w=1200&auto=format&fit=crop';
          return (
            <div key={chapter.id} className="carousel-slide">
              
              {/* Contained Image Layer */}
              <div className="carousel-image">
                <Image 
                  src={bgImage} 
                  alt={chapter.title} 
                  fill
                  priority={true}
                  sizes="(max-width: 768px) 100vw, 80vw"
                  style={{ objectFit: 'cover', objectPosition: 'center center' }} 
                />
              </div>

              {/* Main Content Window */}
              <div className="carousel-content">
                <div className="carousel-text-area" style={{ marginLeft: chapters.length > 1 ? '3rem' : '0' }}>
                  <div className="carousel-meta-row">
                    <span className={`chapter-badge badge-${chapter.chapterType?.toLowerCase() || 'main'}`}>
                      {chapter.chapterType || 'MAIN'}
                    </span>
                    {chapter.chapterCode && (
                      <span className="chapter-code">{chapter.chapterCode}</span>
                    )}
                    <span className="carousel-badge" style={{ marginLeft: 'auto', marginRight: '1rem' }}>
                      {chapter.game.title}
                    </span>
                    <span className="carousel-date">
                      {chapter.releaseDate 
                        ? new Date(chapter.releaseDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                        : new Date(chapter.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>


                  <h2 className="carousel-title">
                    {chapter.title}
                  </h2>
                  
                  {(() => {
                    const isNew = new Date().getTime() - new Date(chapter.createdAt).getTime() < 30 * 24 * 60 * 60 * 1000;
                    const isBlurred = isSpoilerMode && isNew && !revealedSpoilers[chapter.id];

                    return (
                      <div 
                        className="carousel-summary-container"
                        style={{ cursor: isBlurred ? 'pointer' : 'default' }}
                        onClick={() => {
                          if (isBlurred) {
                            setRevealedSpoilers(prev => ({ ...prev, [chapter.id]: true }));
                          }
                        }}
                      >
                        <p className="carousel-summary" style={{ 
                          filter: isBlurred ? 'blur(8px)' : 'none',
                        }}>
                          {chapter.summary}
                        </p>
                        {isBlurred && (
                          <div className="carousel-spoiler-overlay">
                            <button className="btn animate-pulse-glow carousel-spoiler-btn">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                              </svg>
                              Click to reveal spoiler
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  <Link href={`/${chapter.game.slug}/${chapter.slug}`}>
                    <button className="btn btn-primary carousel-read-btn">
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
        <div className="carousel-arrows-container desktop-only">
          <button 
            className="carousel-arrow-btn left"
            onClick={prevSlide}
          >
            &#10094;
          </button>
          <button 
            className="carousel-arrow-btn right"
            onClick={nextSlide}
          >
            &#10095;
          </button>
        </div>
      )}

      {/* Pagination Dots */}
      {chapters.length > 1 && (
        <div className="carousel-pagination">
          {chapters.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`carousel-dot ${currentIndex === idx ? 'active' : 'inactive'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
