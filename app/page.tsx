import { prisma } from '../lib/prisma';
import GameCard from '../components/GameCard';
import HeroCarousel from '../components/HeroCarousel';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const games = await prisma.game.findMany({
    orderBy: { createdAt: 'desc' }
  });

  const recentChapters = await prisma.storyChapter.findMany({
    orderBy: { createdAt: 'desc' },
    take: 6,
    include: { game: true }
  });

  return (
    <div>
      <section style={{ textAlign: 'center', padding: '3rem 1rem 1rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', fontWeight: 800 }}>Gacha Story Database</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
          Your ultimate source for Gacha game story summaries and community ratings.
        </p>
      </section>

      {/* Hero Carousel Widget */}
      <div style={{ marginTop: '2rem' }}>
        <HeroCarousel chapters={recentChapters} />
      </div>

      {/* Popular Titles */}
      <div style={{ marginTop: '3rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', borderLeft: '4px solid var(--color-primary)', paddingLeft: '0.75rem' }}>Popular Titles</h2>
        <div className="grid-cards" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
        {games.map(game => (
          <GameCard 
            key={game.id} 
            id={game.id} 
            title={game.title} 
            description={game.description} 
            imageUrl={game.imageUrl} 
          />
        ))}
        </div>
      </div>
    </div>
  );
}
