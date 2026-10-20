import { getCachedTopReviews } from '../../lib/data';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function ReviewsPage() {
  const reviews = await getCachedTopReviews();

  return (
    <div style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '3rem', margin: 0, fontFamily: 'var(--font-sora)' }}>Top Reviews</h1>
        <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, var(--color-surface-border), transparent)' }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {reviews.map(review => (
          <div key={review.id} className="glass-panel card-hover" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(45deg, var(--color-primary), #9c27b0)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem', color: '#fff' }}>
                  {review.user.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: '#fff' }}>{review.user.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{new Date(review.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'rgba(255,255,255,0.05)', padding: '0.25rem 0.75rem', borderRadius: '1rem', border: '1px solid var(--color-surface-border)' }}>
                  <span style={{ color: '#ff3b30' }}>♥</span>
                  <span style={{ fontWeight: 600, color: '#fff' }}>{review.upvotes?.length || 0}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'rgba(255,255,255,0.05)', padding: '0.25rem 0.75rem', borderRadius: '1rem', border: '1px solid var(--color-surface-border)' }}>
                  <span style={{ color: '#ffb400' }}>★</span>
                  <span style={{ fontWeight: 600, color: '#fff' }}>{review.rating.toFixed(1)}</span>
                </div>
              </div>
            </div>
            
            <div>
              {review.game && (
                <Link href={`/${review.game.slug}`} style={{ fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {review.game.title}
                </Link>
              )}
              {review.chapter && review.game && (
                <Link href={`/${review.game.slug}/${review.chapter.slug}`} style={{ fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {review.game.title} - S1.E{review.chapter.chapterNum}
                </Link>
              )}
            </div>

            <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.6, margin: 0, fontStyle: 'italic', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              &quot;{review.content}&quot;
            </p>
          </div>
        ))}
        {reviews.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
            No reviews yet. Be the first to share your thoughts!
          </div>
        )}
      </div>
    </div>
  );
}
