'use client';

import Link from 'next/link';
import { signIn, signOut } from 'next-auth/react';
import type { Session } from 'next-auth';
import SearchBar from './SearchBar';

interface HeaderProps {
  session: Session | null;
}

export default function Header({ session }: HeaderProps) {
  const toggleTheme = () => {
    document.body.classList.toggle('light-theme');
  };

  return (
    <header className="navbar" style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-surface-border)', padding: '1rem 2rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
      <Link href="/" style={{ order: 1 }}>
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
                <button className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', background: '#ff9500', color: '#000' }}>
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
        <button className="btn btn-glass" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={toggleTheme}>
          Theme
        </button>
      </div>
    </header>
  );
}
