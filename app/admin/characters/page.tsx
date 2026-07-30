import { prisma } from '../../../lib/prisma';
import CharactersClient from './CharactersClient';

export const dynamic = 'force-dynamic';

export default async function AdminCharacters() {
  const games = await prisma.game.findMany({
    select: {
      id: true,
      title: true
    },
    orderBy: { title: 'asc' }
  });

  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '2rem', fontFamily: 'var(--font-rajdhani)' }}>Manage Characters</h1>
      <CharactersClient games={games} />
    </div>
  );
}
