import { prisma } from '../../../../../lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ReviewSection from '../../../../../components/ReviewSection';
import { auth } from '../../../../../auth';

interface ChapterPageProps {
  params: Promise<{ id: string; chapterId: string }>;
}

export default async function ChapterPage({ params }: ChapterPageProps) {
  const { id, chapterId } = await params;
  const session = await auth();

  const chapter = await prisma.storyChapter.findUnique({
    where: { id: chapterId },
    include: {
      game: true,
      reviews: {
        orderBy: { createdAt: 'desc' },
        include: { user: true, upvotes: true }
      }
    }
  });

  if (!chapter || chapter.gameId !== id) {
    notFound();
  }

  return (
    <div className="animate-fade-in">
      <Link href={`/game/${id}`}>
        <span style={{ color: 'var(--color-secondary)', display: 'inline-flex', alignItems: 'center', marginBottom: '2rem' }}>
          ← Back to {chapter.game.title}
        </span>
      </Link>

      <div style={{ padding: '2rem 0', borderBottom: '1px solid var(--color-surface-border)' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          Chapter {chapter.chapterNum}: {chapter.title}
        </h1>
        <p style={{ color: 'var(--color-primary)', fontSize: '1.2rem', marginBottom: '2rem', fontWeight: 600 }}>
          {chapter.game.title}
        </p>

        {chapter.imageUrl && (
          <div style={{ 
            width: '100%', 
            height: '350px', 
            borderRadius: '12px', 
            marginBottom: '2rem', 
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 8px 16px rgba(0,0,0,0.5)'
          }}>
             <div style={{
               position: 'absolute', top: -20, bottom: -20, left: -20, right: -20,
               backgroundImage: `url(${chapter.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(20px) brightness(0.4)', zIndex: 0
             }} />
             <div style={{
               position: 'absolute', top: 0, bottom: 0, left: 0, right: 0,
               backgroundImage: `url(${chapter.imageUrl})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', zIndex: 1
             }} />
          </div>
        )}

        <div style={{ lineHeight: '1.8', fontSize: '1.1rem', color: '#e0e0e0', maxWidth: '800px' }}>
          {chapter.summary}
        </div>
      </div>

      <div style={{ marginTop: '3rem' }}>
        <ReviewSection chapterId={chapter.id} initialReviews={chapter.reviews} session={session} />
      </div>
    </div>
  );
}
