import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{ 
      borderTop: '1px solid var(--color-surface-border)', 
      marginTop: '2rem', 
      padding: '1.5rem 2rem', 
      background: 'var(--color-surface)',
      textAlign: 'center'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ background: 'var(--color-primary)', color: '#000', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 900, fontSize: '1rem', letterSpacing: '-0.5px' }}>
            GR
          </span>
          <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-text-main)' }}>GachaReview</span>
        </div>
        
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', maxWidth: '400px', margin: 0 }}>
          Your ultimate destination for reviewing and discovering the best gacha game stories.
        </p>

        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem' }}>
          <Link href="/" style={{ color: 'var(--color-text-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>Home</Link>
          <a href="#" style={{ color: 'var(--color-text-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>Discord</a>
          <a href="#" style={{ color: 'var(--color-text-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>Twitter</a>
        </div>
        
        <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--color-text-muted)', opacity: 0.6 }}>
          &copy; {new Date().getFullYear()} GachaReview. Made with ❤️ for Gacha Gamers.
        </div>
      </div>
    </footer>
  );
}
