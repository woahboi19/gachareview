import Link from 'next/link';
import Image from 'next/image';

interface GameCardProps {
  id: string;
  slug: string;
  title: string;
  description: string;
  imageUrl?: string | null;
  score?: string;
  genre?: string;
  isTrending?: boolean;
}

export default function GameCard({ slug, title, description, imageUrl, score, genre, isTrending }: GameCardProps) {
  return (
    <Link href={`/${slug}`}>
      <div className="glass-panel animate-fade-in card-hover" style={{ padding: '0', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {imageUrl && (
          <div style={{ width: '100%', aspectRatio: '3/4', overflow: 'hidden', background: '#050505', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
            <Image src={imageUrl} alt={title} fill sizes="(max-width: 768px) 100vw, 300px" className="gamecard-img" style={{ objectFit: 'cover', objectPosition: 'center', transition: 'transform 0.4s ease' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%', background: 'linear-gradient(to top, rgba(13,13,13,1) 0%, transparent 100%)', pointerEvents: 'none' }} />
            
            {/* Top Badges */}
            <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', right: '0.75rem', display: 'flex', justifyContent: 'space-between', zIndex: 10 }}>
              {isTrending ? (
                <span style={{ background: 'var(--color-primary)', color: '#000', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', boxShadow: '0 2px 10px rgba(217,70,239,0.4)', display: 'flex', alignItems: 'center' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
                    <path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z"/>
                  </svg>
                  Trending
                </span>
              ) : <div />}
              {score && (
                <span style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="var(--color-primary)" stroke="var(--color-primary)" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                  {score}
                </span>
              )}
            </div>
          </div>
        )}
        <div className="gamecard-content" style={{ padding: '1.25rem', flexGrow: 1, display: 'flex', flexDirection: 'column', background: 'var(--color-surface)' }}>
          {genre && <span style={{ color: 'var(--color-primary)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>{genre}</span>}
          <h3 className="gamecard-title" style={{ marginBottom: '0.5rem', fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-text)', fontFamily: 'var(--font-sora)' }}>{title}</h3>
          <p className="gamecard-desc" style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', flexGrow: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', margin: 0 }}>{description}</p>
        </div>
      </div>
    </Link>
  );
}
