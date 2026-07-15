import { prisma } from '../../../lib/prisma';
import { notFound } from 'next/navigation';
import { auth } from '../../../auth';
import ProfileTabs from '../../../components/ProfileTabs';

interface ProfilePageProps {
  params: Promise<{ id: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      favorites: {
        include: {
          game: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      },
      reviews: {
        include: {
          chapter: true,
          game: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      }
    }
  });

  if (!user) {
    notFound();
  }

  const session = await auth();
  const isOwnProfile = session?.user?.id === user.id;

  // Render fallback avatar if no image exists
  const avatarUrl = user.image || `https://api.dicebear.com/9.x/avataaars/svg?seed=${user.id}`;
  const displayName = user.name || 'Anonymous User';

  return (
    <div className="animate-fade-in">
      {/* Hero Header */}
      <div style={{
        position: 'relative',
        height: '250px',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        marginBottom: '4rem',
        background: 'linear-gradient(135deg, rgba(26,115,232,0.8) 0%, rgba(138,43,226,0.8) 100%)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
      }}>
        {/* Profile Info Overlay */}
        <div style={{
          position: 'absolute',
          bottom: '0',
          left: '0',
          right: '0',
          padding: '2rem',
          background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
          display: 'flex',
          alignItems: 'flex-end',
          gap: '2rem'
        }}>
          {/* Avatar */}
          <div style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            overflow: 'hidden',
            border: '4px solid var(--color-background)',
            boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
            background: '#fff',
            flexShrink: 0,
            transform: 'translateY(20px)'
          }}>
            <img src={avatarUrl} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>

          <div style={{ paddingBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{displayName}</h1>
              {user.role === 'ADMIN' && (
                <span style={{ background: '#ff3b30', color: '#fff', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>ADMIN</span>
              )}
            </div>
            <p style={{ color: '#ccc', margin: 0, marginTop: '0.5rem', fontSize: '1rem' }}>
              Joined {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      <ProfileTabs user={user} isOwnProfile={isOwnProfile} />
    </div>
  );
}
