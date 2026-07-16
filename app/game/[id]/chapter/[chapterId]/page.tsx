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
      <div style={{ marginBottom: '1.5rem', marginTop: '1rem' }}>
        <Link href={`/game/${id}`}>
          <button className="btn btn-glass" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', gap: '0.5rem' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Back to {chapter.game.title}
          </button>
        </Link>
      </div>

      <div style={{ padding: '2rem 0', borderBottom: '1px solid var(--color-surface-border)' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          Chapter {chapter.chapterNum}: {chapter.title}
        </h1>
        <p style={{ color: 'var(--color-primary)', fontSize: '1.2rem', marginBottom: '2rem', fontWeight: 600 }}>
          {chapter.game.title}
        </p>

        {(chapter.imageUrl || chapter.game.imageUrl) && (
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
               backgroundImage: `url(${chapter.imageUrl || chapter.game.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(20px) brightness(0.4)', zIndex: 0
             }} />
             <div style={{
               position: 'absolute', top: 0, bottom: 0, left: 0, right: 0,
               backgroundImage: `url(${chapter.imageUrl || chapter.game.imageUrl})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', zIndex: 1
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
