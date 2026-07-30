'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

type Game = { id: string, title: string };

export default function CharactersClient({ games }: { games: Game[] }) {
  const [gameId, setGameId] = useState('');
  const [name, setName] = useState('');
  const [lore, setLore] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [voiceActorEN, setVoiceActorEN] = useState('');
  const [voiceActorJP, setVoiceActorJP] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameId || !name || !lore) {
      toast.error('Please fill required fields (Game, Name, Lore)');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/characters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId, name, lore, imageUrl, voiceActorEN, voiceActorJP }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to add character');
      }

      toast.success('Character added successfully!');
      setName('');
      setLore('');
      setImageUrl('');
      setVoiceActorEN('');
      setVoiceActorJP('');
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '2rem', maxWidth: '600px' }}>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', fontFamily: 'var(--font-rajdhani)', textTransform: 'uppercase' }}>Add New Character</h2>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Game *</label>
          <select 
            value={gameId} 
            onChange={e => setGameId(e.target.value)}
            style={{ width: '100%', padding: '0.75rem', background: 'var(--color-bg)', border: '1px solid var(--color-surface-border)', color: '#fff', fontSize: '1rem' }}
          >
            <option value="">Select a game...</option>
            {games.map(g => (
              <option key={g.id} value={g.id}>{g.title}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Name *</label>
          <input 
            type="text" 
            value={name} 
            onChange={e => setName(e.target.value)}
            placeholder="E.g., Kafka"
            style={{ width: '100%', padding: '0.75rem', background: 'var(--color-bg)', border: '1px solid var(--color-surface-border)', color: '#fff', fontSize: '1rem' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Lore / Description *</label>
          <textarea 
            value={lore} 
            onChange={e => setLore(e.target.value)}
            rows={4}
            placeholder="A member of the Stellaron Hunters..."
            style={{ width: '100%', padding: '0.75rem', background: 'var(--color-bg)', border: '1px solid var(--color-surface-border)', color: '#fff', fontSize: '1rem', resize: 'vertical' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Image URL</label>
          <input 
            type="url" 
            value={imageUrl} 
            onChange={e => setImageUrl(e.target.value)}
            placeholder="https://..."
            style={{ width: '100%', padding: '0.75rem', background: 'var(--color-bg)', border: '1px solid var(--color-surface-border)', color: '#fff', fontSize: '1rem' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Voice Actor (EN)</label>
            <input 
              type="text" 
              value={voiceActorEN} 
              onChange={e => setVoiceActorEN(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', background: 'var(--color-bg)', border: '1px solid var(--color-surface-border)', color: '#fff', fontSize: '1rem' }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Voice Actor (JP)</label>
            <input 
              type="text" 
              value={voiceActorJP} 
              onChange={e => setVoiceActorJP(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', background: 'var(--color-bg)', border: '1px solid var(--color-surface-border)', color: '#fff', fontSize: '1rem' }}
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          className="btn btn-primary"
          style={{ padding: '0.75rem', fontSize: '1.1rem', marginTop: '1rem' }}
        >
          {isSubmitting ? 'Adding...' : 'Add Character'}
        </button>
      </form>
    </div>
  );
}
