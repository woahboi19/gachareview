'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminNav() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/admin' && pathname === '/admin') return true;
    if (path !== '/admin' && pathname.startsWith(path)) return true;
    return false;
  };

  const navItemStyle = (path: string) => ({
    padding: '0.8rem 1rem',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background 0.2s, color 0.2s',
    background: isActive(path) ? 'var(--color-primary)' : 'var(--color-surface)',
    color: isActive(path) ? '#000' : 'var(--color-text)',
    fontWeight: isActive(path) ? 'bold' : 'normal'
  });

  return (
    <nav style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Link href="/admin">
        <div style={navItemStyle('/admin')}>
          Dashboard
        </div>
      </Link>
      <Link href="/admin/games">
        <div style={navItemStyle('/admin/games')}>
          Manage Games
        </div>
      </Link>
      <Link href="/admin/chapters">
        <div style={navItemStyle('/admin/chapters')}>
          Manage Chapters
        </div>
      </Link>
    </nav>
  );
}
