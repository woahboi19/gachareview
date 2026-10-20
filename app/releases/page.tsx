import { getCachedRecentChapters, getCachedUpcomingChapters } from '../../lib/data';
import Link from 'next/link';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

export default async function ReleasesPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams;
  const isUpcoming = tab === 'upcoming';
  
  const chapters = isUpcoming ? await getCachedUpcomingChapters() : await getCachedRecentChapters();

  return (
    <div style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '3rem', margin: 0, fontFamily: 'var(--font-sora)' }}>Latest Chapter Releases</h1>
        <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, var(--color-surface-border), transparent)' }} />
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '3rem' }}>
        <Link href="/releases?tab=latest" style={{ 
          padding: '0.75rem 2rem', 
          borderRadius: '2rem',
          background: !isUpcoming ? 'var(--color-primary)' : 'rgba(255,255,255,0.05)',
          color: !isUpcoming ? '#fff' : 'var(--color-text-muted)',
          fontWeight: 600,
          border: !isUpcoming ? '1px solid transparent' : '1px solid var(--color-surface-border)',
          transition: 'all 0.2s'
        }}>
          Latest Updates
        </Link>
        <Link href="/releases?tab=upcoming" style={{ 
          padding: '0.75rem 2rem', 
          borderRadius: '2rem',
          background: isUpcoming ? 'var(--color-primary)' : 'rgba(255,255,255,0.05)',
          color: isUpcoming ? '#fff' : 'var(--color-text-muted)',
          fontWeight: 600,
          border: isUpcoming ? '1px solid transparent' : '1px solid var(--color-surface-border)',
          transition: 'all 0.2s'
        }}>
          Upcoming
        </Link>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {chapters.map(chapter => (
          <Link key={chapter.id} href={`/${chapter.game.slug}/${chapter.slug}`}>
            <div className="glass-panel card-hover" style={{ padding: '1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
              {(chapter.imageUrl || chapter.game.imageUrl) && (
                <div style={{ width: '80px', height: '120px', position: 'relative', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                  <Image src={chapter.imageUrl || chapter.game.imageUrl || ''} alt={chapter.title} fill sizes="(max-width: 768px) 100vw, 80px" style={{ objectFit: 'cover' }} />
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span className={`chapter-badge badge-${chapter.chapterType?.toLowerCase() || 'main'}`}>
                    {chapter.chapterType || 'MAIN'}
                  </span>
                  {chapter.chapterCode && (
                    <span className="chapter-code">{chapter.chapterCode}</span>
                  )}
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginLeft: 'auto' }}>
                    {chapter.game.title}
                  </span>
                </div>
                <h2 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-sora)', color: 'var(--color-text-main)', margin: 0 }}>
                  {chapter.title}
                </h2>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem', lineHeight: 1.5, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {chapter.summary}
                </p>
                {chapter.releaseDate && (
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
                    Released: {new Date(chapter.releaseDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
        {chapters.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
            No {isUpcoming ? 'upcoming' : 'recent'} releases found.
          </div>
        )}
      </div>
    </div>
  );
}
