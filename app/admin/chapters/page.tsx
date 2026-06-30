import { prisma } from '../../../lib/prisma';
import ChapterForm from '../../../components/admin/ChapterForm';

export const dynamic = 'force-dynamic';

export default async function AdminChaptersPage() {
  const games = await prisma.game.findMany({
    select: { id: true, title: true }
  });
  
  const chapters = await prisma.storyChapter.findMany({
    orderBy: { createdAt: 'desc' },
    include: { game: { select: { title: true } } }
  });

  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '2rem' }}>Manage Chapters</h1>
      <ChapterForm initialChapters={chapters} games={games} />
    </div>
  );
}
