import Link from 'next/link';
import Image from 'next/image';

interface GameCardProps {
  id: string;
  slug: string;
  title: string;
  description: string;
  imageUrl?: string | null;
}

export default function GameCard({ slug, title, description, imageUrl }: GameCardProps) {
  return (
    <Link href={`/${slug}`}>
      <div className="glass-panel animate-fade-in card-hover" style={{ padding: '0', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {imageUrl && (
          <div style={{ position: 'relative', width: '100%', aspectRatio: '3/4', overflow: 'hidden', background: '#050505', display: 'flex', justifyContent: 'center', alignItems: 'center', borderBottom: '1px solid var(--color-surface-border)' }}>
            <Image src={imageUrl} alt={title} fill style={{ objectFit: 'contain', objectPosition: 'center' }} />
          </div>
        )}
        <div className="gamecard-content" style={{ padding: '1.5rem', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <h3 className="gamecard-title" style={{ marginBottom: '0.5rem', fontSize: '1.25rem', color: 'var(--color-text-main)' }}>{title}</h3>
          <p className="gamecard-desc" style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', flexGrow: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{description}</p>
        </div>
      </div>
    </Link>
  );
}
