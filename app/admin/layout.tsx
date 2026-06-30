import { auth } from '../../auth';
import { redirect } from 'next/navigation';
import AdminNav from '../../components/admin/AdminNav';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/');
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
