import { prisma } from '../../../lib/prisma';
import GameForm from '../../../components/admin/GameForm';

export const dynamic = 'force-dynamic';

export default async function AdminGamesPage() {
  const games = await prisma.game.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '2rem' }}>Manage Games</h1>
      <GameForm initialGames={games} />
    </div>
  );
}
