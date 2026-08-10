import { prisma } from '../../lib/prisma';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { auth } from '../../auth';
import FavoriteButton from '../../components/FavoriteButton';
import EmptyState from '../../components/EmptyState';
import GameStatusSelector from '../../components/GameStatusSelector';
import ReviewSection from '../../components/ReviewSection';

import { getCachedGameBySlug } from '../../lib/data';

interface GamePageProps {
  params: Promise<{ gameSlug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function GamePage({ params, searchParams }: GamePageProps) {
  const { gameSlug } = await params;
  const searchParamsResolved = await searchParams;
  const currentTab = typeof searchParamsResolved.tab === 'string' ? searchParamsResolved.tab : 'chapters';
  
  const game = await getCachedGameBySlug(gameSlug);

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
          gameId: game.id
        }
      }
    });
    isFavorited = !!favorite;
  }

  // Calculate game overall rating from global reviews
  let totalRating = 0;
  let totalReviews = game.reviews?.length || 0;

  if (game.reviews) {
    game.reviews.forEach((review) => {
      totalRating += review.rating;
    });
  }

  const averageRating = totalReviews > 0 ? (totalRating / totalReviews).toFixed(1) : null;

  // Find user's game status
  let userGameStatus = null;
  if (userId && game.userStatuses) {
    const statusObj = game.userStatuses.find(s => s.userId === userId);
    if (statusObj) userGameStatus = statusObj.status;
  }

  // Calculate Community Stats
  const playingCount = game.userStatuses?.filter(s => s.status === 'PLAYING').length || 0;
  const completedCount = game.userStatuses?.filter(s => s.status === 'COMPLETED').length || 0;
  const droppedCount = game.userStatuses?.filter(s => s.status === 'DROPPED').length || 0;

  // Group chapters by category
  const chaptersByCategory = game.chapters.reduce((acc, chapter) => {
    const cat = chapter.category || 'Main Story';
    if (!acc[cat]) {
      acc[cat] = [];
    }
    acc[cat].push(chapter);
    return acc;
  }, {} as Record<string, typeof game.chapters>);

  // Sort categories: Categories with at least one 'isMain' chapter come first, and specifically prioritize "Phaethon's Story" or "Main Story"
  const sortedCategories = Object.entries(chaptersByCategory).sort(([catA, chapsA], [catB, chapsB]) => {
    // Explicitly put Phaethon's Story, Main Story, Archon Quest, or Trailblaze Mission at the absolute top
    if (catA === "Phaethon's Story" || catA === "Main Story" || catA === "Archon Quest" || catA === "Trailblaze Mission") return -1;
    if (catB === "Phaethon's Story" || catB === "Main Story" || catB === "Archon Quest" || catB === "Trailblaze Mission") return 1;
    
    const aIsMain = chapsA.some(c => c.isMain);
    const bIsMain = chapsB.some(c => c.isMain);
    if (aIsMain && !bIsMain) return -1;
    if (!aIsMain && bIsMain) return 1;
    return catA.localeCompare(catB);
  });

  return (
    <div className="animate-fade-in">
      {/* Cinematic Header */}
      <div className="game-detail-header-container">
        {game.imageUrl && (
          <div className="game-detail-image-container">
            <Image src={game.imageUrl} alt={game.title} fill sizes="(max-width: 768px) 100vw, 250px" priority={true} style={{ objectFit: 'contain', objectPosition: 'center' }} />
          </div>
        )}
        <div className="game-detail-info-container">
          <div>
            <div className="game-detail-title-row">
              <div>
                <div className="game-detail-title-group" style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <h1 className="game-detail-title">{game.title}</h1>
                  <FavoriteButton gameId={game.id} initialIsFavorited={isFavorited} isLoggedIn={!!session} />
                  <GameStatusSelector gameId={game.id} initialStatus={userGameStatus} isLoggedIn={!!session} />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                  {game.genres?.map(genre => (
                    <span key={genre.id} style={{ padding: '0.2rem 0.6rem', fontSize: '0.8rem', background: 'var(--color-primary)', color: 'white', borderRadius: '12px', fontWeight: 'bold' }}>
                      {genre.name}
                    </span>
                  ))}
                </div>
                <p className="game-detail-developer">{game.developer}</p>
                
                {/* Community Stats */}
                <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                  <div><strong style={{ color: 'var(--color-text-main)' }}>{playingCount}</strong> Playing</div>
                  <div><strong style={{ color: 'var(--color-text-main)' }}>{completedCount}</strong> Completed</div>
                  <div><strong style={{ color: 'var(--color-text-main)' }}>{droppedCount}</strong> Dropped</div>
                </div>
              </div>
              {/* IMDB Style Rating Widget */}
              <div className="game-detail-rating-widget">
                <div className="game-detail-rating-label">Rating</div>
                <div className="game-detail-rating-score-row">
                  <span className="game-detail-rating-star">★</span>
                  <div>
                    <span className="game-detail-rating-score">{averageRating || '-'}</span>
                    <span className="game-detail-rating-max">/5</span>
                  </div>
                </div>
                <div className="game-detail-rating-count">
                  {totalReviews} {totalReviews === 1 ? 'Review' : 'Reviews'}
                </div>
              </div>
            </div>
            

            <p className="game-detail-desc">{game.description}</p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', borderBottom: '1px solid var(--color-surface-border)', paddingBottom: '1rem' }}>
        <Link href={`/${game.slug}?tab=chapters`} scroll={false}>
          <button className={`btn ${currentTab === 'chapters' ? 'btn-primary' : 'btn-glass'}`} style={{ padding: '0.6rem 1.5rem', borderRadius: '20px', fontWeight: 'bold' }}>
            Chapters
          </button>
        </Link>
        <Link href={`/${game.slug}?tab=characters`} scroll={false}>
          <button className={`btn ${currentTab === 'characters' ? 'btn-primary' : 'btn-glass'}`} style={{ padding: '0.6rem 1.5rem', borderRadius: '20px', fontWeight: 'bold' }}>
            Characters
          </button>
        </Link>
        <Link href={`/${game.slug}?tab=reviews`} scroll={false}>
          <button className={`btn ${currentTab === 'reviews' ? 'btn-primary' : 'btn-glass'}`} style={{ padding: '0.6rem 1.5rem', borderRadius: '20px', fontWeight: 'bold' }}>
            Game Reviews
          </button>
        </Link>
      </div>

      <div style={{ marginTop: '2rem' }}>
        {/* Chapters Section */}
        {currentTab === 'chapters' && (
          <div>
            <div className="game-detail-section-header" style={{ marginBottom: '1.5rem' }}>
              <h2 className="game-detail-section-title">Chapters</h2>
            </div>
            <div className="game-detail-chapter-list">

        {sortedCategories.length === 0 ? (
          <EmptyState 
            title="No chapters yet" 
            description="There are currently no chapters available for this game. Check back later!" 
          />
        ) : (
          sortedCategories.map(([category, chapters]) => {
            const sortedChapters = [...chapters].sort((a, b) => {
              if (a.releaseDate && b.releaseDate) {
                const diff = new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime();
                if (diff !== 0) return diff;
              }
              return a.chapterNum - b.chapterNum;
            });

            return (
              <div key={category}>
                <div className="game-detail-chapter-category">
                  <h2 className="game-detail-chapter-category-title">{category}</h2>
                </div>
                <div className="game-detail-chapter-grid">
                  {sortedChapters.map(chapter => {
                    const chapReviews = chapter.reviews.length;
                    const chapAvg = chapReviews > 0 
                      ? (chapter.reviews.reduce((acc, r) => acc + r.rating, 0) / chapReviews).toFixed(1)
                      : null;

                    return (
                      <Link key={chapter.id} href={`/${game.slug}/${chapter.slug}`}>
                        <div className="glass-panel chapter-card" style={{ cursor: 'pointer', display: 'flex', overflow: 'hidden' }}>
                          {chapter.imageUrl && (
                            <div className="chapter-card-img-container" style={{ position: 'relative', width: '80px', alignSelf: 'stretch', flexShrink: 0, background: 'var(--color-surface-border)' }}>
                              <Image src={chapter.imageUrl} alt={chapter.title} fill sizes="(max-width: 768px) 100vw, 80px" style={{ objectFit: 'cover' }} />
                            </div>
                          )}
                          <div className="chapter-card-content" style={{ padding: '1.25rem 1.5rem', flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <h3 className="game-detail-chapter-card-header" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                  <span className={`chapter-badge badge-${chapter.chapterType?.toLowerCase() || 'main'}`}>
                                    {chapter.chapterType || 'MAIN'}
                                  </span>
                                  {chapter.chapterCode && (
                                    <span className="chapter-code">{chapter.chapterCode}</span>
                                  )}
                                </div>
                                <span>{chapter.title}</span>
                                {chapter.releaseDate && (
                                  <span className="game-detail-chapter-date-badge">
                                    {new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(chapter.releaseDate))}
                                  </span>
                                )}
                              </h3>
                              <p className="game-detail-chapter-summary">{chapter.summary.substring(0, 120)}...</p>
                            </div>
                            <div className="game-detail-chapter-rating" style={{ color: chapAvg ? 'var(--color-text-main)' : 'var(--color-primary)', fontWeight: chapAvg ? 'bold' : 'normal' }}>
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
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
          </div>
        )}

        {/* Characters Section */}
        {currentTab === 'characters' && game.characters && (
          <div className="game-detail-character-container">
            <div className="game-detail-section-header" style={{ marginBottom: '1.5rem' }}>
              <h2 className="game-detail-section-title">Characters</h2>
            </div>
            <div className="grid-cards">
              {game.characters.map((char) => (
                <div key={char.id} className="glass-panel game-detail-character-card">
                {char.imageUrl ? (
                  <div className="game-detail-character-image-container">
                    <Image src={char.imageUrl} alt={char.name} fill sizes="(max-width: 768px) 100vw, 300px" style={{ objectFit: 'cover', objectPosition: 'top' }} />
                  </div>
                ) : (
                  <div className="game-detail-character-no-image">
                    No Image
                  </div>
                )}
                <div className="game-detail-character-info">
                  <h3 className="game-detail-character-name">{char.name}</h3>
                  <p className="game-detail-character-lore">
                    {char.lore}
                  </p>
                  {(char.voiceActorEN || char.voiceActorJP) && (
                    <div className="game-detail-character-va">
                      {char.voiceActorEN && <div><strong>EN:</strong> {char.voiceActorEN}</div>}
                      {char.voiceActorJP && <div><strong>JP:</strong> {char.voiceActorJP}</div>}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        )}

        {/* Game Reviews Section */}
        {currentTab === 'reviews' && (
          <div>
            <h2 className="game-detail-section-title">Game Reviews</h2>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
              What do you think about the overall game (gameplay, gacha rates, graphics, etc.)? 
              For specific story feedback, please review the individual chapters.
            </p>
            <ReviewSection gameId={game.id} initialReviews={game.reviews || []} session={session} />
          </div>
        )}
      </div>
    </div>
  );
}
