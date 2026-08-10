import { getCachedAllGames, getCachedAllGenres } from '../../lib/data';
import GameCard from '../../components/GameCard';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function GamesPage({ searchParams }: { searchParams: Promise<{ genre?: string }> }) {
  const { genre } = await searchParams;
  const allGames = await getCachedAllGames();
  const genres = await getCachedAllGenres();

  const filteredGames = genre ? allGames.filter(g => g.genres?.some(gen => gen.slug === genre)) : allGames;

  return (
    <div style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '3rem', margin: 0, fontFamily: 'var(--font-sora)' }}>Library</h1>
        <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, var(--color-surface-border), transparent)' }} />
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '3rem' }}>
        <Link href="/games">
          <span style={{ 
            display: 'inline-block', padding: '0.5rem 1.5rem', borderRadius: '2rem', 
            background: !genre ? 'var(--color-primary)' : 'rgba(255,255,255,0.05)',
            color: !genre ? '#fff' : 'var(--color-text-muted)',
            border: !genre ? '1px solid transparent' : '1px solid var(--color-surface-border)',
            fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s'
          }}>
            All
          </span>
        </Link>
        {genres.map(g => (
          <Link key={g.id} href={`/games?genre=${g.slug}`}>
            <span style={{ 
              display: 'inline-block', padding: '0.5rem 1.5rem', borderRadius: '2rem', 
              background: genre === g.slug ? 'var(--color-primary)' : 'rgba(255,255,255,0.05)',
              color: genre === g.slug ? '#fff' : 'var(--color-text-muted)',
              border: genre === g.slug ? '1px solid transparent' : '1px solid var(--color-surface-border)',
              fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s'
            }}>
              {g.name}
            </span>
          </Link>
        ))}
      </div>
      <div className="grid-cards" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
        {filteredGames.map(game => (
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
        {filteredGames.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
            No games found for this genre.
          </div>
        )}
      </div>
    </div>
  );
}
