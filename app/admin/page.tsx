import { prisma } from '../../lib/prisma';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const gamesCount = await prisma.game.count();
  const chaptersCount = await prisma.storyChapter.count();
  const reviewsCount = await prisma.review.count();
  const usersCount = await prisma.user.count();

  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '2rem' }}>Dashboard Overview</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
        
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
          <h3 style={{ color: 'var(--color-text-muted)', fontSize: '1.2rem', marginBottom: '1rem' }}>Total Games</h3>
          <p style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--color-primary)' }}>{gamesCount}</p>
        </div>

        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
          <h3 style={{ color: 'var(--color-text-muted)', fontSize: '1.2rem', marginBottom: '1rem' }}>Total Chapters</h3>
          <p style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--color-primary)' }}>{chaptersCount}</p>
        </div>

        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
          <h3 style={{ color: 'var(--color-text-muted)', fontSize: '1.2rem', marginBottom: '1rem' }}>Total Reviews</h3>
          <p style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--color-primary)' }}>{reviewsCount}</p>
        </div>

        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
          <h3 style={{ color: 'var(--color-text-muted)', fontSize: '1.2rem', marginBottom: '1rem' }}>Total Users</h3>
          <p style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--color-primary)' }}>{usersCount}</p>
        </div>

      </div>
    </div>
  );
}
