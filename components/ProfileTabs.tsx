'use client';

import { useState } from 'react';
import GameCard from './GameCard';
import ReviewCard from './ReviewCard';
import { useRouter } from 'next/navigation';

type ProfileTabsProps = {
  user: {
    id: string;
    name: string | null;
    image: string | null;
    createdAt: Date;
    role: string;
    favorites: {
      game: {
        id: string;
        title: string;
        description: string;
        imageUrl: string | null;
      }
    }[];
    reviews: {
      id: string;
      rating: number;
      content: string;
      createdAt: Date;
      chapter: {
        title: string;
        chapterNum: number;
      } | null;
      game: {
        title: string;
      } | null;
    }[];
  };
  isOwnProfile: boolean;
};

export default function ProfileTabs({ user, isOwnProfile }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<'favorites' | 'reviews' | 'settings'>('favorites');
  const [name, setName] = useState(user.name || '');
  const [image, setImage] = useState(user.image || '');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, image })
      });
      if (res.ok) {
        alert('Profile updated successfully!');
        router.refresh();
      } else {
        alert('Failed to update profile.');
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ marginTop: '2rem' }}>
      {/* Tabs Navigation */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--color-surface-border)', paddingBottom: '1rem', marginBottom: '2rem' }}>
        <button 
          onClick={() => setActiveTab('favorites')}
          style={{
            background: 'none', border: 'none', color: activeTab === 'favorites' ? '#ff3b30' : 'var(--color-text-muted)',
            fontSize: '1.2rem', fontWeight: activeTab === 'favorites' ? 'bold' : 'normal', cursor: 'pointer',
            borderBottom: activeTab === 'favorites' ? '2px solid #ff3b30' : 'none', paddingBottom: '0.2rem'
          }}
        >
          Favorites ({user.favorites.length})
        </button>
        <button 
          onClick={() => setActiveTab('reviews')}
          style={{
            background: 'none', border: 'none', color: activeTab === 'reviews' ? '#f5c518' : 'var(--color-text-muted)',
            fontSize: '1.2rem', fontWeight: activeTab === 'reviews' ? 'bold' : 'normal', cursor: 'pointer',
            borderBottom: activeTab === 'reviews' ? '2px solid #f5c518' : 'none', paddingBottom: '0.2rem'
          }}
        >
          Reviews ({user.reviews.length})
        </button>
        {isOwnProfile && (
          <button 
            onClick={() => setActiveTab('settings')}
            style={{
              background: 'none', border: 'none', color: activeTab === 'settings' ? 'var(--color-primary)' : 'var(--color-text-muted)',
              fontSize: '1.2rem', fontWeight: activeTab === 'settings' ? 'bold' : 'normal', cursor: 'pointer',
              borderBottom: activeTab === 'settings' ? '2px solid var(--color-primary)' : 'none', paddingBottom: '0.2rem'
            }}
          >
            Settings
          </button>
        )}
      </div>

      {/* Tabs Content */}
      <div className="animate-fade-in">
        {activeTab === 'favorites' && (
          <div>
            {user.favorites.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)' }}>No favorite games yet.</p>
            ) : (
              <div className="grid-cards" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
                {user.favorites.map(({ game }) => (
                  <GameCard 
                    key={game.id} 
                    id={game.id} 
                    title={game.title} 
                    description={game.description} 
                    imageUrl={game.imageUrl} 
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {user.reviews.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)' }}>No reviews written yet.</p>
            ) : (
              user.reviews.map(review => (
                <ReviewCard 
                  key={review.id}
                  id={review.id}
                  gameTitle={review.game?.title || 'Unknown Game'}
                  chapterTitle={review.chapter ? review.chapter.title : 'Unknown Chapter'}
                  chapterNum={review.chapter?.chapterNum}
                  rating={review.rating}
                  content={review.content}
                  createdAt={review.createdAt}
                />
              ))
            )}
          </div>
        )}

        {activeTab === 'settings' && isOwnProfile && (
          <form onSubmit={handleUpdateProfile} className="glass-panel" style={{ padding: '2rem', maxWidth: '600px' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Update Profile</h3>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Display Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--color-surface-border)', color: '#fff' }}
              />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Profile Image URL</label>
              <input
                type="url"
                value={image}
                onChange={e => setImage(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--color-surface-border)', color: '#fff' }}
              />
            </div>
            <button 
              type="submit" 
              disabled={isLoading}
              className="btn"
              style={{ width: '100%', padding: '0.75rem', fontSize: '1.1rem', fontWeight: 'bold', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
