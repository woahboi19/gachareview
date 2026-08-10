import { prisma } from '../lib/prisma';
import { getCachedTrendingGames, getCachedEditorsPicks, getCachedHighestRated, getCachedRecentChapters } from '../lib/data';
import GameCard from '../components/GameCard';
import HeroCarousel from '../components/HeroCarousel';
import { auth } from '../auth';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const session = await auth();
  const userId = session?.user?.id;

  let favoriteGames: { id: string; slug: string; title: string; description: string; imageUrl: string | null; }[] = [];
  if (userId) {
    const favorites = await prisma.favoriteGame.findMany({
      where: { userId },
      include: { game: true },
      orderBy: { createdAt: 'desc' }
    });
    favoriteGames = favorites.map(f => f.game);
  }

  const popularGames = await getCachedTrendingGames();
  const editorsPicks = await getCachedEditorsPicks();
  const highestRated = await getCachedHighestRated();
  const recentChapters = await getCachedRecentChapters();

  return (
    <div>
      <section style={{ textAlign: 'center', padding: '5rem 0 3rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h1 style={{ fontSize: '4.5rem', marginBottom: '1rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-1px', fontFamily: 'var(--font-sora)' }}>
          Gacha<span style={{ color: 'var(--color-primary)' }}>Review</span>
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
          The ultimate database for Gacha game stories. Track chapters, read community reviews, and find your next adventure.
        </p>
      </section>

      {/* Hero Carousel Widget */}
      <div style={{ marginTop: '2rem' }}>
        <HeroCarousel chapters={recentChapters} />
      </div>

      {/* Your Favorites */}
      {favoriteGames.length > 0 && (
        <div style={{ marginTop: '3rem' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your Favorites</h2>
          <div className="grid-cards" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
          {favoriteGames.map(game => (
            <GameCard 
              key={game.id} 
              id={game.id}
              slug={game.slug}
              title={game.title} 
              description={game.description} 
              imageUrl={game.imageUrl} 
            />
          ))}
          </div>
        </div>
      )}

      {/* Trending Today */}
      <div style={{ marginTop: '4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-primary)' }}>
            <path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z"/>
          </svg>
          <h2 style={{ fontSize: '2.5rem', margin: 0, fontFamily: 'var(--font-sora)' }}>Trending Today</h2>
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, var(--color-surface-border), transparent)' }} />
        </div>
        <div className="grid-cards" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
        {popularGames.map(game => (
          <GameCard 
            key={game.id} 
            id={game.id}
            slug={game.slug}
            title={game.title} 
            description={game.description} 
            imageUrl={game.imageUrl}
            isTrending={true}
            score={game.averageScore > 0 ? game.averageScore.toFixed(1) : undefined}
            genre={game.genres && game.genres.length > 0 ? game.genres[0].name : undefined}
          />
        ))}
        </div>
      </div>

      {/* Editor's Picks */}
      <div style={{ marginTop: '4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#FFD700' }}>
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
            <path d="M4 22h16"></path>
            <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
            <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
          </svg>
          <h2 style={{ fontSize: '2.5rem', margin: 0, fontFamily: 'var(--font-sora)' }}>Editor&apos;s Picks</h2>
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, var(--color-surface-border), transparent)' }} />
        </div>
        <div className="grid-cards" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
        {editorsPicks.map(game => (
          <GameCard 
            key={game.id} 
            id={game.id}
            slug={game.slug}
            title={game.title} 
            description={game.description} 
            imageUrl={game.imageUrl} 
            score={game.averageScore > 0 ? game.averageScore.toFixed(1) : undefined}
            genre={game.genres && game.genres.length > 0 ? game.genres[0].name : undefined}
          />
        ))}
        </div>
      </div>

      {/* Highest Rated Stories */}
      <div style={{ marginTop: '4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#FFD700' }}>
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
          <h2 style={{ fontSize: '2.5rem', margin: 0, fontFamily: 'var(--font-sora)' }}>Highest Rated</h2>
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, var(--color-surface-border), transparent)' }} />
        </div>
        <div className="grid-cards" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
        {highestRated.map(game => (
          <GameCard 
            key={game.id}
            id={game.id}
            slug={game.slug}
            title={game.title} 
            description={game.description} 
            imageUrl={game.imageUrl} 
            score={game.averageScore > 0 ? game.averageScore.toFixed(1) : undefined}
            genre={game.genres && game.genres.length > 0 ? game.genres[0].name : undefined}
          />
        ))}
        </div>
      </div>
    </div>
  );
}
