'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { signIn, signOut } from 'next-auth/react';
import type { Session } from 'next-auth';
import SearchBar from './SearchBar';

interface HeaderProps {
  session: Session | null;
}

export default function Header({ session }: HeaderProps) {
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    setIsLight(document.body.classList.contains('light-theme'));
    const observer = new MutationObserver(() => {
      setIsLight(document.body.classList.contains('light-theme'));
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const toggleTheme = () => {
    document.body.classList.toggle('light-theme');
  };

  return (
    <header className="navbar" style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-surface-border)', padding: '1rem 2rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
      <Link href="/" style={{ order: 1 }} className="logo-hover">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <span style={{ background: 'var(--color-primary)', color: '#000', padding: '0.2rem 0.6rem', borderRadius: '4px', fontWeight: 900, fontSize: '1.4rem', letterSpacing: '-0.5px' }}>
              GR
            </span>
            <h1 className="navbar-title" style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-text-main)' }}>GachaReview</h1>
          </div>
        </Link>
      
      <div className="search-container" style={{ order: 2, flex: 1, display: 'flex', justifyContent: 'center' }}>
        <SearchBar />
      </div>

      <div className="navbar-actions" style={{ order: 3, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {session?.user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {session.user.role === 'ADMIN' && (
              <Link href="/admin">
                <button className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                  Admin Panel
                </button>
              </Link>
            )}
            <Link href="/profile" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', padding: '0.2rem 0.5rem', borderRadius: '4px', transition: 'background 0.2s' }}>
              <span className="navbar-username" style={{ color: 'var(--color-text-main)', fontSize: '0.9rem' }}>{session.user.name}</span>
              {session.user.image ? (
                <img src={session.user.image} alt="Avatar" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
              ) : (
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 'bold' }}>
                  {session.user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
            </Link>
            <button className="btn btn-glass" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={() => signOut()}>
              Logout
            </button>
          </div>
        ) : (
          <button className="btn btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }} onClick={() => signIn()}>
            Login
          </button>
        )}
        <button 
          className="btn btn-glass" 
          style={{ padding: '0.4rem', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }} 
          onClick={toggleTheme}
          title="Toggle Theme"
        >
          <div style={{
            position: 'absolute',
            transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s ease',
            transform: isLight ? 'translateY(-150%) rotate(90deg)' : 'translateY(0) rotate(0)',
            opacity: isLight ? 0 : 1
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
          </div>
          <div style={{
            position: 'absolute',
            transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s ease',
            transform: isLight ? 'translateY(0) rotate(0)' : 'translateY(150%) rotate(-90deg)',
            opacity: isLight ? 1 : 0
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
          </div>
        </button>
      </div>
    </header>
  );
}
