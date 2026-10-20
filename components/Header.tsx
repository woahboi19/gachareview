'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { signIn, signOut } from 'next-auth/react';
import type { Session } from 'next-auth';
import SearchBar from './SearchBar';
import { useSpoiler } from './SpoilerProvider';

interface HeaderProps {
  session: Session | null;
}

export default function Header({ session }: HeaderProps) {
  const [isLight, setIsLight] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isSpoilerMode, toggleSpoilerMode } = useSpoiler();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLight(document.body.classList.contains('light-theme'));
    const observer = new MutationObserver(() => {
      setIsLight(document.body.classList.contains('light-theme'));
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isMobileMenuOpen]);

  const toggleTheme = () => {
    document.body.classList.toggle('light-theme');
  };

  return (
    <>
      <header className="navbar header-container">
      {/* Top row containing Logo and Hamburger */}
      <div className="header-top-row mobile-header-top">
        <div className="header-brand-container">
        <Link href="/" className="logo-hover">
          <div className="header-brand-logo">
              <span className="header-brand-icon">
                GR
              </span>
              <h1 className="navbar-title header-brand-title">GachaReview</h1>
            </div>
        </Link>
        
        <nav className="desktop-nav desktop-only header-desktop-nav">
          <Link href="/games" className="header-nav-link">Games</Link>
          <Link href="/releases" className="header-nav-link">Releases</Link>
          <Link href="/reviews" className="header-nav-link">Top Reviews</Link>
        </nav>
      </div>
      
      <div className="search-container desktop-search desktop-only header-search-container">
        <SearchBar />
      </div>

      <div className="navbar-actions desktop-only header-actions-container">
        {session?.user ? (
          <div className="header-user-actions">
            {session.user.role === 'ADMIN' && (
              <Link href="/admin">
                <button className="btn btn-primary header-admin-btn">
                  Admin Panel
                </button>
              </Link>
            )}
            <Link href="/profile" className="header-profile-link">
              <span className="navbar-username" style={{ color: 'var(--color-text-main)', fontSize: '0.9rem' }}>{session.user.name}</span>
              {session.user.image ? (
                <Image src={session.user.image} alt="Avatar" width={32} height={32} className="header-avatar" />
              ) : (
                <div className="header-avatar-fallback">
                  {session.user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
            </Link>
            <button className="btn" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', borderRadius: '20px', background: 'transparent', border: '1px solid var(--color-surface-border)', color: 'var(--color-text-main)' }} onClick={() => signOut()}>
              Logout
            </button>
          </div>
        ) : (
          <button className="btn btn-primary" style={{ padding: '0.4rem 1.2rem', fontSize: '0.85rem', borderRadius: '20px', boxShadow: '0 4px 12px var(--color-primary-glow)' }} onClick={() => signIn()}>
            Login
          </button>
        )}
        <button 
          className="btn btn-glass header-icon-btn" 
          onClick={toggleSpoilerMode}
          title={isSpoilerMode ? "Spoiler Mode ON (Blur Enabled)" : "Spoiler Mode OFF (Show Spoilers)"}
        >
          {isSpoilerMode ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
          )}
        </button>
        <button 
          className="btn btn-glass header-icon-btn header-theme-toggle" 
          onClick={toggleTheme}
          title="Toggle Theme"
        >
          <div className="header-theme-icon" style={{
            transform: isLight ? 'translateY(-150%) rotate(90deg)' : 'translateY(0) rotate(0)',
            opacity: isLight ? 0 : 1
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
          </div>
          <div className="header-theme-icon" style={{
            transform: isLight ? 'translateY(0) rotate(0)' : 'translateY(150%) rotate(-90deg)',
            opacity: isLight ? 1 : 0
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
          </div>
        </button>
      </div>

      {/* Mobile Search Bar (placed inside top row) */}
      <div className="search-container mobile-search mobile-only" style={{ flex: 1, display: 'none', margin: '0 0.5rem' }}>
        <SearchBar />
      </div>

      {/* Hamburger Button */}
      <button 
        className="btn btn-glass mobile-only mobile-menu-btn" 
        style={{ padding: '0.5rem', display: 'none' }} 
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {isMobileMenuOpen ? (
            <><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></>
          ) : (
            <><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></>
          )}
        </svg>
      </button>
      </div>
    </header>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="header-mobile-drawer-overlay"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Side Panel */}
      <div 
        className="mobile-drawer header-mobile-drawer"
        style={{
          right: isMobileMenuOpen ? 0 : '-100%',
        }}
      >
        <div className="header-mobile-drawer-close">
          <button className="btn btn-glass" style={{ padding: '0.5rem', borderRadius: '50%' }} onClick={() => setIsMobileMenuOpen(false)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <nav className="header-mobile-nav">
          <Link href="/games" onClick={() => setIsMobileMenuOpen(false)}>Games</Link>
          <Link href="/releases" onClick={() => setIsMobileMenuOpen(false)}>Releases</Link>
          <Link href="/reviews" onClick={() => setIsMobileMenuOpen(false)}>Top Reviews</Link>
        </nav>

        <div className="header-mobile-settings">
          <div className="header-mobile-setting-item">
            <span className="header-mobile-setting-label">Spoiler Mode</span>
            <button className="btn btn-glass header-icon-btn" onClick={toggleSpoilerMode}>
              {isSpoilerMode ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              )}
            </button>
          </div>
          
          <div className="header-mobile-setting-item">
            <span className="header-mobile-setting-label">Theme</span>
            <button className="btn btn-glass header-icon-btn" onClick={toggleTheme}>
              {isLight ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
              )}
            </button>
          </div>
        </div>

        <div className="header-mobile-footer">
          {session?.user ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {session.user.image ? (
                  <Image src={session.user.image} alt="Avatar" width={40} height={40} className="header-avatar" />
                ) : (
                  <div className="header-avatar-fallback" style={{ width: '40px', height: '40px' }}>
                    {session.user.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
                <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>{session.user.name}</span>
              </Link>
              {session.user.role === 'ADMIN' && (
                <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)}>
                  <button className="btn btn-primary" style={{ width: '100%' }}>Admin Panel</button>
                </Link>
              )}
              <button className="btn btn-glass" style={{ width: '100%' }} onClick={() => signOut()}>Logout</button>
            </div>
          ) : (
            <button className="btn btn-primary" style={{ width: '100%', padding: '1rem' }} onClick={() => signIn()}>Login</button>
          )}
        </div>
      </div>
    </>
  );
}
