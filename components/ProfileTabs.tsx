'use client';

import { useState } from 'react';
import GameCard from './GameCard';
import ReviewCard from './ReviewCard';
import { useRouter } from 'next/navigation';

type Game = {
  id: string;
  slug: string;
  title: string;
  description: string;
  imageUrl: string | null;
};

type TabId = 'favorites' | 'playing' | 'completed' | 'dropped' | 'reviews' | 'settings';

type ProfileTabsProps = {
  user: {
    id: string;
    name: string | null;
    image: string | null;
    bio: string | null;
    spoilerMode: boolean;
    createdAt: Date;
    role: string;
    gameStatuses: {
      status: 'PLAYING' | 'DROPPED' | 'COMPLETED' | 'FAVORITE';
      game: Game;
    }[];
    favorites: {
      game: Game;
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

const TabButton = ({ id, label, count, activeTab, setActiveTab }: { id: TabId, label: string, count?: number, activeTab: TabId, setActiveTab: (id: TabId) => void }) => (
  <button 
    onClick={() => setActiveTab(id)}
    style={{
      background: 'none', border: 'none', color: activeTab === id ? 'var(--color-primary)' : 'var(--color-text-muted)',
      fontSize: '1.2rem', fontWeight: activeTab === id ? 'bold' : 'normal', cursor: 'pointer',
      borderBottom: activeTab === id ? '2px solid var(--color-primary)' : 'none', paddingBottom: '0.2rem',
      textTransform: 'uppercase', fontFamily: 'var(--font-rajdhani)'
    }}
  >
    {label} {count !== undefined && `(${count})`}
  </button>
);

export default function ProfileTabs({ user, isOwnProfile }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<'favorites' | 'playing' | 'completed' | 'dropped' | 'reviews' | 'settings'>('favorites');
  const [name, setName] = useState(user.name || '');
  const [image, setImage] = useState(user.image || '');
  const [bio, setBio] = useState(user.bio || '');
  const [spoilerMode, setSpoilerMode] = useState(user.spoilerMode);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();

  // Combine legacy favorites with new GameStatus FAVORITE
  const favoriteGames: Game[] = Array.from(new Map<string, Game>([
    ...user.favorites.map(f => [f.game.id, f.game] as [string, Game]),
    ...user.gameStatuses.filter(s => s.status === 'FAVORITE').map(s => [s.game.id, s.game] as [string, Game])
  ]).values());

  const playingGames = user.gameStatuses.filter(s => s.status === 'PLAYING').map(s => s.game);
  const completedGames = user.gameStatuses.filter(s => s.status === 'COMPLETED').map(s => s.game);
  const droppedGames = user.gameStatuses.filter(s => s.status === 'DROPPED').map(s => s.game);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, image, bio, spoilerMode })
      });
      if (res.ok) {
        alert('Profile updated successfully!');
        router.refresh();
      } else {
        const data = await res.json();
        setErrorMsg(data.error || 'Failed to update profile.');
      }
    } catch (error) {
      console.error(error);
      setErrorMsg('An error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderGameGrid = (games: Game[], emptyMsg: string) => (
    <div>
      {games.length === 0 ? (
        <p style={{ color: 'var(--color-text-muted)' }}>{emptyMsg}</p>
      ) : (
        <div className="grid-cards" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
          {games.map((game) => (
            <GameCard 
              key={game.id} 
              id={game.id}
              slug={game.slug}
              title={game.title} 
              description={game.description} 
              imageUrl={game.imageUrl} 
            />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ marginTop: '2rem' }}>
      {/* Tabs Navigation */}
      <div style={{ display: 'flex', gap: '1.5rem', borderBottom: '1px solid var(--color-surface-border)', paddingBottom: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <TabButton id="favorites" label="Favorites" count={favoriteGames.length} activeTab={activeTab} setActiveTab={setActiveTab} />
        <TabButton id="playing" label="Playing" count={playingGames.length} activeTab={activeTab} setActiveTab={setActiveTab} />
        <TabButton id="completed" label="Completed" count={completedGames.length} activeTab={activeTab} setActiveTab={setActiveTab} />
        <TabButton id="dropped" label="Dropped" count={droppedGames.length} activeTab={activeTab} setActiveTab={setActiveTab} />
        <TabButton id="reviews" label="Reviews" count={user.reviews.length} activeTab={activeTab} setActiveTab={setActiveTab} />
        {isOwnProfile && <TabButton id="settings" label="Settings" activeTab={activeTab} setActiveTab={setActiveTab} />}
      </div>

      {/* Tabs Content */}
      <div className="animate-fade-in">
        {activeTab === 'favorites' && renderGameGrid(favoriteGames, "No favorite games yet.")}
        {activeTab === 'playing' && renderGameGrid(playingGames, "Not currently playing any games.")}
        {activeTab === 'completed' && renderGameGrid(completedGames, "No completed games.")}
        {activeTab === 'dropped' && renderGameGrid(droppedGames, "No dropped games.")}

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
          <form onSubmit={handleUpdateProfile} style={{ padding: '2rem', maxWidth: '600px', border: '1px solid var(--color-surface-border)', background: 'var(--color-surface)' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', fontFamily: 'var(--font-rajdhani)', textTransform: 'uppercase' }}>Update Profile</h3>
            
            {errorMsg && (
              <div style={{ padding: '1rem', background: 'rgba(255, 59, 48, 0.1)', border: '1px solid #ff3b30', color: '#ff3b30', marginBottom: '1rem' }}>
                {errorMsg}
              </div>
            )}

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Display Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', background: 'var(--color-bg)', border: '1px solid var(--color-surface-border)', color: '#fff' }}
              />
              <small style={{ color: 'var(--color-text-muted)', display: 'block', marginTop: '0.25rem' }}>Only letters, numbers, and CJK characters. Max 24 chars.</small>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Bio</label>
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                rows={3}
                style={{ width: '100%', padding: '0.75rem', background: 'var(--color-bg)', border: '1px solid var(--color-surface-border)', color: '#fff', resize: 'vertical' }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Profile Image URL</label>
              <input
                type="url"
                value={image}
                onChange={e => setImage(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                style={{ width: '100%', padding: '0.75rem', background: 'var(--color-bg)', border: '1px solid var(--color-surface-border)', color: '#fff' }}
              />
            </div>

            <div style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid var(--color-surface-border)', background: 'var(--color-bg)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <input 
                type="checkbox" 
                id="spoilerMode" 
                checked={spoilerMode} 
                onChange={e => setSpoilerMode(e.target.checked)} 
                style={{ width: '20px', height: '20px' }}
              />
              <label htmlFor="spoilerMode" style={{ cursor: 'pointer', flexGrow: 1 }}>
                <strong style={{ display: 'block', color: 'var(--color-text-main)' }}>Enable Spoiler Mode</strong>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Automatically blur summaries for chapters released in the last 30 days.</span>
              </label>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="btn"
              style={{ width: '100%', padding: '0.75rem', fontSize: '1.1rem', fontWeight: 'bold', background: 'var(--color-primary)', color: '#000', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-rajdhani)', textTransform: 'uppercase' }}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
