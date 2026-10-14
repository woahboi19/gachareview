import { auth } from '../../auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import AdminNav from '../../components/admin/AdminNav';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  if (session.user.role !== 'ADMIN') {
    return (
      <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
        <div className="glass-panel" style={{ padding: '3rem', maxWidth: '480px', width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '0.5rem', color: '#ff4d4f' }}>Access Denied</h1>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
            Logged in as <strong>{session.user.name || session.user.email}</strong>.<br />
            Your current role is <span style={{ padding: '0.2rem 0.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', fontWeight: 600 }}>{session.user.role || 'USER'}</span>.<br />
            Administrator privileges are required to access this area.
          </p>
          <Link href="/" className="btn btn-primary" style={{ display: 'inline-block', padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-md)' }}>
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 73px)' }}>
      {/* Sidebar */}
      <aside style={{ width: '250px', background: '#1a1a1a', borderRight: '1px solid var(--color-surface-border)', padding: '2rem' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '2rem', color: 'var(--color-primary)' }}>Admin Panel</h2>
        <AdminNav />
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '2rem', background: '#0a0a0a' }}>
        {children}
      </main>
    </div>
  );
}
