'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Game {
  id: string;
  title: string;
  description: string;
  developer: string;
  imageUrl: string | null;
}

export default function GameForm({ initialGames }: { initialGames: Game[] }) {
  const [games, setGames] = useState<Game[]>(initialGames);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [developer, setDeveloper] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const url = editingId ? `/api/admin/games/${editingId}` : '/api/admin/games';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, developer, imageUrl })
      });

      if (res.ok) {
        const savedGame = await res.json();
        if (editingId) {
          setGames(games.map(g => g.id === editingId ? savedGame : g));
        } else {
          setGames([savedGame, ...games]);
        }
        resetForm();
        router.refresh();
      } else {
        alert(`Failed to ${editingId ? 'update' : 'create'} game`);
      }
    } catch (err) {
      console.error(err);
      alert(`Error ${editingId ? 'updating' : 'creating'} game`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setDeveloper('');
    setImageUrl('');
  };

  const startEdit = (game: Game) => {
    setEditingId(game.id);
    setTitle(game.title);
    setDescription(game.description);
    setDeveloper(game.developer);
    setImageUrl(game.imageUrl || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this game? All its chapters and reviews will also be deleted.')) return;
    
    try {
      const res = await fetch(`/api/admin/games/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setGames(games.filter(g => g.id !== id));
        router.refresh();
      } else {
        alert('Failed to delete game');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting game');
    }
  };

  return (
    <div>
      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--color-primary)' }}>
            {editingId ? 'Edit Game' : 'Add New Game'}
          </h2>
          {editingId && (
            <button className="btn btn-glass" onClick={resetForm} style={{ padding: '0.4rem 1rem' }}>
              Cancel Edit
            </button>
          )}
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input type="text" className="form-textarea" style={{ minHeight: '40px' }} value={title} onChange={e => setTitle(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Developer</label>
            <input type="text" className="form-textarea" style={{ minHeight: '40px' }} value={developer} onChange={e => setDeveloper(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Image URL (e.g. /images/genshin.webp)</label>
            <input type="text" className="form-textarea" style={{ minHeight: '40px' }} value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" value={description} onChange={e => setDescription(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ alignSelf: 'flex-start' }}>
            {isSubmitting ? 'Saving...' : (editingId ? 'Update Game' : 'Add Game')}
          </button>
        </form>
      </div>

      <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Existing Games</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {games.map(game => (
          <div key={game.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>{game.title}</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>{game.developer}</p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-glass" style={{ padding: '0.4rem 1rem' }} onClick={() => startEdit(game)}>
                Edit
              </button>
              <button className="btn btn-primary" style={{ background: '#ff3b30', color: '#fff', padding: '0.4rem 1rem' }} onClick={() => handleDelete(game.id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
        {games.length === 0 && <p style={{ color: 'var(--color-text-muted)' }}>No games found.</p>}
      </div>
    </div>
  );
}
