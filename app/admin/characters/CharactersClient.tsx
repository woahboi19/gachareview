'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

type Game = { id: string, title: string };

type CharacterItem = {
  id: string;
  name: string;
  gameId: string;
  imageUrl: string | null;
  voiceActorEN: string | null;
  voiceActorJP: string | null;
  game: { title: string };
};

export default function CharactersClient({ games, initialCharacters = [] }: { games: Game[], initialCharacters?: CharacterItem[] }) {
  const [characters, setCharacters] = useState<CharacterItem[]>(initialCharacters);
  const [gameId, setGameId] = useState('');
  const [name, setName] = useState('');
  const [lore, setLore] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [voiceActorEN, setVoiceActorEN] = useState('');
  const [voiceActorJP, setVoiceActorJP] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedGameFilter, setSelectedGameFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
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

      const created = await res.json();
      const matchedGame = games.find(g => g.id === gameId);
      const newChar: CharacterItem = {
        ...created,
        game: { title: matchedGame?.title || 'Unknown' }
      };

      setCharacters([newChar, ...characters]);
      toast.success('Character added successfully!');
      setName('');
      setLore('');
      setImageUrl('');
      setVoiceActorEN('');
      setVoiceActorJP('');
      router.refresh();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this character?')) return;
    try {
      const res = await fetch(`/api/admin/characters/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setCharacters(characters.filter(c => c.id !== id));
        toast.success('Character deleted successfully');
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || 'Failed to delete character');
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error deleting character');
    }
  };

  const filteredCharacters = characters.filter(c => {
    if (selectedGameFilter && c.gameId !== selectedGameFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = c.name.toLowerCase().includes(q);
      const matchGame = c.game?.title?.toLowerCase().includes(q);
      const matchVA = (c.voiceActorEN || '').toLowerCase().includes(q) || (c.voiceActorJP || '').toLowerCase().includes(q);
      return matchName || matchGame || matchVA;
    }
    return true;
  });

  return (
    <div>
      <div className="glass-panel" style={{ padding: '2rem', maxWidth: '650px', marginBottom: '3rem' }}>
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

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Existing Characters</h2>
          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
            Showing {filteredCharacters.length} of {characters.length} characters
          </span>
        </div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <select 
            value={selectedGameFilter} 
            onChange={e => setSelectedGameFilter(e.target.value)}
            style={{ minHeight: '38px', padding: '0.4rem 0.8rem', background: 'var(--color-surface)', border: '1px solid var(--color-surface-border)', color: '#fff', borderRadius: '4px' }}
          >
            <option value="">All Games ({characters.length})</option>
            {games.map(g => (
              <option key={g.id} value={g.id}>
                {g.title} ({characters.filter(c => c.gameId === g.id).length})
              </option>
            ))}
          </select>
          <input 
            type="text" 
            placeholder="Search characters or voice actors..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ minHeight: '38px', minWidth: '240px', padding: '0.4rem 0.8rem', background: 'var(--color-surface)', border: '1px solid var(--color-surface-border)', color: '#fff', borderRadius: '4px' }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredCharacters.map(char => (
          <div key={char.id} className="glass-panel" style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ color: 'var(--color-primary)', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 800, marginBottom: '0.2rem' }}>
                {char.game?.title || 'Unknown Game'}
              </p>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>{char.name}</h3>
              {(char.voiceActorEN || char.voiceActorJP) && (
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', margin: 0 }}>
                  {char.voiceActorEN && <span>VA (EN): {char.voiceActorEN} </span>}
                  {char.voiceActorJP && <span>VA (JP): {char.voiceActorJP}</span>}
                </p>
              )}
            </div>
            <div>
              <button 
                className="btn btn-primary" 
                style={{ background: '#ff3b30', color: '#fff', padding: '0.4rem 1rem' }}
                onClick={() => handleDelete(char.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {filteredCharacters.length === 0 && (
          <p style={{ color: 'var(--color-text-muted)' }}>
            {characters.length === 0 ? 'No characters found.' : 'No characters match the selected filter.'}
          </p>
        )}
      </div>
    </div>
  );
}
