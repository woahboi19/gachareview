import { prisma } from '../../../lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { auth } from '../../../auth';
import FavoriteButton from '../../../components/FavoriteButton';

interface GamePageProps {
  params: Promise<{ id: string }>;
}

export default async function GamePage({ params }: GamePageProps) {
  const { id } = await params;
  
  const game = await prisma.game.findUnique({
    where: { id },
    include: {
      chapters: {
        orderBy: { chapterNum: 'asc' },
        include: {
          reviews: true
        }
      }
    }
  });

  if (!game) {
    notFound();
  }

  const session = await auth();
  const userId = session?.user?.id;
  
  let isFavorited = false;
  if (userId) {
    const favorite = await prisma.favoriteGame.findUnique({
      where: {
        userId_gameId: {
          userId,
          gameId: id
        }
      }
    });
    isFavorited = !!favorite;
  }

  // Calculate game overall rating
  let totalRating = 0;
  let totalReviews = 0;

  game.chapters.forEach((chapter: any) => {
    chapter.reviews.forEach((review: any) => {
      totalRating += review.rating;
      totalReviews += 1;
    });
  });

  const averageRating = totalReviews > 0 ? (totalRating / totalReviews).toFixed(1) : null;

  // Group chapters by category
  const chaptersByCategory = game.chapters.reduce((acc, chapter) => {
    const cat = chapter.category || 'Main Story';
    if (!acc[cat]) {
      acc[cat] = [];
    }
    acc[cat].push(chapter);
    return acc;
  }, {} as Record<string, typeof game.chapters>);

  // Sort categories: Categories with at least one 'isMain' chapter come first
  const sortedCategories = Object.entries(chaptersByCategory).sort(([catA, chapsA], [catB, chapsB]) => {
    const aIsMain = chapsA.some(c => c.isMain);
    const bIsMain = chapsB.some(c => c.isMain);
    if (aIsMain && !bIsMain) return -1;
    if (!aIsMain && bIsMain) return 1;
    return catA.localeCompare(catB);
  });

  return (
    <div className="animate-fade-in">
      {/* Cinematic Header */}
      <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: '3rem', marginTop: '1rem' }}>
        {game.imageUrl && (
          <div style={{ flex: '0 0 250px', aspectRatio: '9/16', borderRadius: 'var(--radius-md)', overflow: 'hidden', boxShadow: '0 8px 16px rgba(0,0,0,0.3)', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'var(--color-surface-border)' }}>
            <img src={game.imageUrl} alt={game.title} style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', objectPosition: 'center' }} />
          </div>
        )}
        <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.2rem' }}>
                  <h1 style={{ fontSize: '3rem', fontWeight: 800, margin: 0 }}>{game.title}</h1>
                  <FavoriteButton gameId={game.id} initialIsFavorited={isFavorited} isLoggedIn={!!session} />
                </div>
                <p style={{ color: 'var(--color-primary)', fontWeight: '600', marginBottom: '1.5rem', fontSize: '1.1rem' }}>{game.developer}</p>
              </div>
              {/* IMDB Style Rating Widget */}
              <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '8px' }}>
                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.2rem' }}>Rating</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: '#f5c518', fontSize: '1.8rem' }}>★</span>
                  <div>
                    <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{averageRating || '-'}</span>
                    <span style={{ color: 'var(--color-text-muted)' }}>/5</span>
                  </div>
                </div>
                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                  {totalReviews} {totalReviews === 1 ? 'Review' : 'Reviews'}
                </div>
              </div>
            </div>
            

            <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem', lineHeight: 1.6 }}>{game.description}</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {sortedCategories.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)' }}>No chapters available yet.</p>
        ) : (
          sortedCategories.map(([category, chapters]) => (
            <div key={category}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', borderLeft: '4px solid var(--color-primary)', paddingLeft: '0.75rem' }}>
                <h2 style={{ fontSize: '1.25rem', margin: 0 }}>{category}</h2>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {chapters.map(chapter => {
                  const chapReviews = chapter.reviews.length;
                  const chapAvg = chapReviews > 0 
                    ? (chapter.reviews.reduce((acc, r) => acc + r.rating, 0) / chapReviews).toFixed(1)
                    : null;

                  return (
                    <Link key={chapter.id} href={`/game/${game.id}/chapter/${chapter.id}`}>
                      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <h3 style={{ marginBottom: '0.25rem', fontSize: '1.1rem' }}>
                            <span style={{ color: 'var(--color-text-muted)', marginRight: '0.5rem' }}>Ch.{chapter.chapterNum}</span> 
                            {chapter.title}
                          </h3>
                          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', margin: 0 }}>{chapter.summary.substring(0, 120)}...</p>
                        </div>
                        <div style={{ color: chapAvg ? 'var(--color-text-main)' : 'var(--color-primary)', fontSize: '1.2rem', fontWeight: chapAvg ? 'bold' : 'normal', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                          {chapAvg ? (
                            <>
                              <span style={{ color: '#f5c518' }}>★</span> {chapAvg}
                              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginLeft: '0.5rem' }}>({chapReviews})</span>
                            </>
                          ) : (
                            '★ Rate'
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
