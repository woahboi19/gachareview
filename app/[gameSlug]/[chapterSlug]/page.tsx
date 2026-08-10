import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import ReviewSection from '../../../components/ReviewSection';
import { auth } from '../../../auth';

import { getCachedChapterBySlug } from '../../../lib/data';

interface ChapterPageProps {
  params: Promise<{ gameSlug: string; chapterSlug: string }>;
}

export default async function ChapterPage({ params }: ChapterPageProps) {
  const { gameSlug, chapterSlug } = await params;
  const session = await auth();

  const chapter = await getCachedChapterBySlug(gameSlug, chapterSlug);

  if (!chapter) {
    notFound();
  }

  // Find prev and next chapters
  let prevChapter = null;
  let nextChapter = null;
  if (chapter.game?.chapters) {
    const sortedChapters = [...chapter.game.chapters].sort((a, b) => {
      if (a.releaseDate && b.releaseDate) {
        const diff = new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime();
        if (diff !== 0) return diff;
      }
      return a.chapterNum - b.chapterNum;
    });

    const currentIndex = sortedChapters.findIndex(c => c.slug === chapter.slug);
    if (currentIndex > 0) prevChapter = sortedChapters[currentIndex - 1];
    if (currentIndex < sortedChapters.length - 1) nextChapter = sortedChapters[currentIndex + 1];
  }

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '1.5rem', marginTop: '1rem', display: 'flex', justifyContent: 'space-between' }}>
        <Link href={`/${gameSlug}`}>
          <button className="btn btn-glass" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', gap: '0.5rem' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Back to {chapter.game.title}
          </button>
        </Link>
        
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {prevChapter && (
            <Link href={`/${gameSlug}/${prevChapter.slug}`}>
              <button className="btn btn-glass" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                &laquo; Prev
              </button>
            </Link>
          )}
          {nextChapter && (
            <Link href={`/${gameSlug}/${nextChapter.slug}`}>
              <button className="btn btn-glass" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                Next &raquo;
              </button>
            </Link>
          )}
        </div>
      </div>

      <div style={{ padding: '2rem 0', borderBottom: '1px solid var(--color-surface-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
          <span className={`chapter-badge badge-${chapter.chapterType?.toLowerCase() || 'main'}`}>
            {chapter.chapterType || 'MAIN'}
          </span>
          {chapter.chapterCode && (
            <span className="chapter-code" style={{ fontSize: '1rem', marginLeft: '0.5rem' }}>{chapter.chapterCode}</span>
          )}
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          {chapter.title}
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
               backgroundImage: `url("${chapter.imageUrl || chapter.game.imageUrl}")`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(20px) brightness(0.4)', zIndex: 0
             }} />
             <Image 
               src={chapter.imageUrl || chapter.game.imageUrl || ''} 
               alt={chapter.title} 
               fill 
               sizes="(max-width: 768px) 100vw, 800px"
               style={{ objectFit: 'contain', zIndex: 1 }} 
             />
          </div>
        )}

        <div style={{ lineHeight: '1.8', fontSize: '1.1rem', color: 'var(--color-text-main)', maxWidth: '800px', whiteSpace: 'pre-wrap' }}>
          {chapter.summary}
        </div>
      </div>

      {chapter.characters && chapter.characters.length > 0 && (
        <div style={{ marginTop: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--color-surface-border)' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--color-primary)' }}>Featured Characters</h3>
          <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
            {chapter.characters.map((char: any) => (
              <div key={char.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '80px' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', overflow: 'hidden', position: 'relative', border: '2px solid var(--color-surface-border)' }}>
                  {char.imageUrl ? (
                    <Image src={char.imageUrl} alt={char.name} fill style={{ objectFit: 'cover', objectPosition: 'top' }} sizes="60px" />
                  ) : (
                    <div style={{ width: '100%', height: '100%', background: 'var(--color-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>No Img</div>
                  )}
                </div>
                <span style={{ fontSize: '0.8rem', marginTop: '0.5rem', textAlign: 'center', maxWidth: '80px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{char.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: '3rem' }}>
        <ReviewSection chapterId={chapter.id} initialReviews={chapter.reviews} session={session} />
      </div>

      {/* Bottom Navigation */}
      <div style={{ marginTop: '3rem', paddingTop: '1rem', borderTop: '1px solid var(--color-surface-border)', display: 'flex', justifyContent: 'space-between' }}>
        {prevChapter ? (
          <Link href={`/${gameSlug}/${prevChapter.slug}`}>
            <button className="btn btn-glass" style={{ padding: '0.8rem 1.5rem', fontSize: '1rem' }}>
              &laquo; Previous: {prevChapter.title}
            </button>
          </Link>
        ) : <div />}
        
        {nextChapter ? (
          <Link href={`/${gameSlug}/${nextChapter.slug}`}>
            <button className="btn btn-glass" style={{ padding: '0.8rem 1.5rem', fontSize: '1rem' }}>
              Next: {nextChapter.title} &raquo;
            </button>
          </Link>
        ) : <div />}
      </div>
    </div>
  );
}
