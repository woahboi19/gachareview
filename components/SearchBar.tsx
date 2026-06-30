'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface SearchResult {
  games: Array<{ id: string; title: string }>;
  chapters: Array<{ id: string; gameId: string; title: string; chapterNum: number; game: { title: string } }>;
}

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult>({ games: [], chapters: [] });
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      if (query.trim().length === 0) {
        setResults({ games: [], chapters: [] });
        setIsOpen(false);
        return;
      }

      setIsLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data);
        setIsOpen(true);
      } catch (err) {
        console.error('Search failed', err);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchResults();
    }, 300); // 300ms debounce

    return () => clearTimeout(debounceTimer);
  }, [query]);

  const hasResults = results.games.length > 0 || results.chapters.length > 0;

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '300px' }}>
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          placeholder="Search games or chapters..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (query.trim()) setIsOpen(true); }}
          style={{
            width: '100%',
            padding: '0.6rem 1rem 0.6rem 2.5rem',
            borderRadius: '20px',
            border: '1px solid var(--color-surface-border)',
            background: 'var(--color-surface)',
            color: 'var(--color-text-main)',
            outline: 'none',
            fontSize: '0.9rem',
            transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
          }}
          onFocusCapture={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-primary)';
            e.currentTarget.style.boxShadow = '0 0 0 1px var(--color-primary)';
          }}
          onBlurCapture={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-surface-border)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        />
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: 'var(--color-text-muted)', pointerEvents: 'none' }}
        >
          <circle cx="11" cy="11" r="8" strokeWidth="2"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65" strokeWidth="2"></line>
        </svg>

        {query.length > 0 && (
          <button
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            style={{
              position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: 'var(--color-text-muted)', padding: '0.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
            title="Clear search"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ width: '16px', height: '16px' }}>
              <line x1="18" y1="6" x2="6" y2="18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></line>
              <line x1="6" y1="6" x2="18" y2="18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></line>
            </svg>
          </button>
        )}
      </div>

      {isOpen && query.trim().length > 0 && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '0.5rem',
          background: 'var(--color-surface)', border: '1px solid var(--color-surface-border)',
          borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', zIndex: 50,
          maxHeight: '400px', overflowY: 'auto'
        }}>
          {isLoading ? (
            <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Searching...</div>
          ) : !hasResults ? (
            <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>No results found</div>
          ) : (
            <div>
              {results.games.length > 0 && (
                <div style={{ padding: '0.5rem 0' }}>
                  <div style={{ padding: '0.2rem 1rem', fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Games
                  </div>
                  {results.games.map(game => (
                    <Link key={game.id} href={`/game/${game.id}`} onClick={() => setIsOpen(false)}>
                      <div style={{ padding: '0.5rem 1rem', cursor: 'pointer', transition: 'background 0.2s ease' }}
                           onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-hover)'}
                           onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        {game.title}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
              
              {results.chapters.length > 0 && (
                <div style={{ padding: '0.5rem 0', borderTop: results.games.length > 0 ? '1px solid var(--color-surface-border)' : 'none' }}>
                  <div style={{ padding: '0.2rem 1rem', fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Chapters
                  </div>
                  {results.chapters.map(chapter => (
                    <Link key={chapter.id} href={`/game/${chapter.gameId}/chapter/${chapter.id}`} onClick={() => setIsOpen(false)}>
                      <div style={{ padding: '0.5rem 1rem', cursor: 'pointer', transition: 'background 0.2s ease' }}
                           onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-hover)'}
                           onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.1rem' }}>
                          {chapter.game.title} - S1.E{chapter.chapterNum}
                        </div>
                        <div style={{ fontWeight: '500' }}>{chapter.title}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
