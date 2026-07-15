import Link from 'next/link';

interface GameCardProps {
  id: string;
  title: string;
  description: string;
  imageUrl?: string | null;
}

export default function GameCard({ id, title, description, imageUrl }: GameCardProps) {
  return (
    <Link href={`/game/${id}`}>
      <div className="glass-panel animate-fade-in" style={{ padding: '0', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {imageUrl && (
          <div style={{ width: '100%', aspectRatio: '9/16', overflow: 'hidden', background: 'var(--color-surface-border)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <img src={imageUrl} alt={title} style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center' }} />
          </div>
        )}
        <div style={{ padding: '1.5rem', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '0.5rem', fontSize: '1.25rem', color: 'var(--color-text-main)' }}>{title}</h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', flexGrow: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{description}</p>
        </div>
      </div>
    </Link>
  );
}
