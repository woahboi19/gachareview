'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface Game {
  id: string;
  title: string;
}

interface Chapter {
  id: string;
  gameId: string;
  title: string;
  chapterNum: number;
  summary: string;
  imageUrl: string | null;
  category: string;
  isMain: boolean;
  slug?: string;
  releaseDate?: string | Date | null;
  game: { title: string };
}

export default function ChapterForm({ initialChapters, games }: { initialChapters: Chapter[], games: Game[] }) {
  const [chapters, setChapters] = useState<Chapter[]>(initialChapters);
  const [gameId, setGameId] = useState(games.length > 0 ? games[0].id : '');
  const [title, setTitle] = useState('');
  const [shortCode, setShortCode] = useState('');
  const [chapterNum, setChapterNum] = useState('');
  const [summary, setSummary] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState('Main Story');
  const [isMain, setIsMain] = useState(false);
  const [releaseDate, setReleaseDate] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedGameFilter, setSelectedGameFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const url = editingId ? `/api/admin/chapters/${editingId}` : '/api/admin/chapters';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId, title, shortCode, chapterNum, summary, imageUrl, category, isMain, releaseDate: releaseDate || undefined })
      });

      if (res.ok) {
        const savedChapter = await res.json();
        if (editingId) {
          setChapters(chapters.map(c => c.id === editingId ? savedChapter : c));
          toast.success('Chapter updated successfully!');
        } else {
          setChapters([savedChapter, ...chapters]);
          toast.success('Chapter created successfully!');
        }
        resetForm();
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || `Failed to ${editingId ? 'update' : 'create'} chapter`);
      }
    } catch (err: unknown) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : `Error ${editingId ? 'updating' : 'creating'} chapter`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setShortCode('');
    setChapterNum('');
    setSummary('');
    setImageUrl('');
    setCategory('Main Story');
    setIsMain(false);
    setReleaseDate('');
  };

  const startEdit = (chapter: Chapter) => {
    setEditingId(chapter.id);
    setGameId(chapter.gameId || (games.length > 0 ? games[0].id : ''));
    setTitle(chapter.title);
    setShortCode(chapter.slug || '');
    setChapterNum(chapter.chapterNum.toString());
    setSummary(chapter.summary);
    setImageUrl(chapter.imageUrl || '');
    setCategory(chapter.category || 'Main Story');
    setIsMain(chapter.isMain || false);
    
    if (chapter.releaseDate) {
      setReleaseDate(new Date(chapter.releaseDate).toISOString().split('T')[0]);
    } else {
      setReleaseDate('');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this chapter? All its reviews will also be deleted.')) return;
    
    try {
      const res = await fetch(`/api/admin/chapters/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setChapters(chapters.filter(c => c.id !== id));
        toast.success('Chapter deleted successfully');
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || 'Failed to delete chapter');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error deleting chapter');
    }
  };

  const filteredChapters = chapters.filter(c => {
    if (selectedGameFilter && c.gameId !== selectedGameFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = c.title.toLowerCase().includes(q);
      const matchCategory = (c.category || '').toLowerCase().includes(q);
      const matchNum = c.chapterNum.toString().includes(q);
      const matchGame = c.game?.title?.toLowerCase().includes(q);
      return matchTitle || matchCategory || matchNum || matchGame;
    }
    return true;
  });

  return (
    <div>
      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--color-primary)' }}>
            {editingId ? 'Edit Chapter' : 'Add New Chapter'}
          </h2>
          {editingId && (
            <button className="btn btn-glass" onClick={resetForm} style={{ padding: '0.4rem 1rem' }}>
              Cancel Edit
            </button>
          )}
        </div>
        {games.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)' }}>Please add a game first before adding chapters.</p>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Game</label>
              <select className="form-textarea" style={{ minHeight: '40px' }} value={gameId} onChange={e => setGameId(e.target.value)} required>
                {games.map(g => (
                  <option key={g.id} value={g.id} style={{ background: 'var(--color-surface)' }}>{g.title}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Chapter Title</label>
                <input type="text" className="form-textarea" style={{ minHeight: '40px' }} value={title} onChange={e => setTitle(e.target.value)} required />
              </div>
              <div className="form-group" style={{ width: '150px' }}>
                <label className="form-label">Short URL Code</label>
                <input type="text" className="form-textarea" style={{ minHeight: '40px' }} value={shortCode} onChange={e => setShortCode(e.target.value)} placeholder="e.g. 1001" />
              </div>
              <div className="form-group" style={{ width: '100px' }}>
                <label className="form-label">Chapter #</label>
                <input type="number" className="form-textarea" style={{ minHeight: '40px' }} value={chapterNum} onChange={e => setChapterNum(e.target.value)} required />
              </div>
              <div className="form-group" style={{ width: '200px' }}>
                <label className="form-label">Category</label>
                <input type="text" className="form-textarea" style={{ minHeight: '40px' }} value={category} onChange={e => setCategory(e.target.value)} placeholder="Main Story" required />
              </div>
            </div>
            
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" id="isMain" checked={isMain} onChange={e => setIsMain(e.target.checked)} style={{ width: '20px', height: '20px' }} />
              <label htmlFor="isMain" className="form-label" style={{ margin: 0 }}>This is a Main Story category (Appears at top of Game Page)</label>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Image URL (Optional)</label>
                <input type="text" className="form-textarea" style={{ minHeight: '40px' }} value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
              </div>
              <div className="form-group" style={{ width: '200px' }}>
                <label className="form-label">Release Date (Optional)</label>
                <input type="date" className="form-textarea" style={{ minHeight: '40px', colorScheme: 'dark' }} value={releaseDate} onChange={e => setReleaseDate(e.target.value)} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Summary / Description</label>
              <textarea className="form-textarea" value={summary} onChange={e => setSummary(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ alignSelf: 'flex-start' }}>
              {isSubmitting ? 'Saving...' : (editingId ? 'Update Chapter' : 'Add Chapter')}
            </button>
          </form>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Existing Chapters</h2>
          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
            Showing {filteredChapters.length} of {chapters.length} chapters
          </span>
        </div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <select 
            value={selectedGameFilter} 
            onChange={e => setSelectedGameFilter(e.target.value)}
            className="form-textarea"
            style={{ minHeight: '38px', padding: '0.4rem 0.8rem', background: 'var(--color-surface)' }}
          >
            <option value="">All Games ({chapters.length})</option>
            {games.map(g => (
              <option key={g.id} value={g.id}>
                {g.title} ({chapters.filter(c => c.gameId === g.id).length})
              </option>
            ))}
          </select>
          <input 
            type="text" 
            placeholder="Search chapters..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="form-textarea"
            style={{ minHeight: '38px', minWidth: '220px', padding: '0.4rem 0.8rem' }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredChapters.map(chapter => (
          <div key={chapter.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ color: 'var(--color-primary)', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 800, marginBottom: '0.2rem' }}>
                {chapter.game?.title} - {chapter.category || 'Main Story'} {chapter.isMain && <span style={{ color: 'var(--color-primary)' }}>(Main)</span>} - Ch. {chapter.chapterNum}
              </p>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>{chapter.title}</h3>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-glass" style={{ padding: '0.4rem 1rem' }} onClick={() => startEdit(chapter)}>
                Edit
              </button>
              <button className="btn btn-primary" style={{ background: '#ff3b30', color: '#fff', padding: '0.4rem 1rem' }} onClick={() => handleDelete(chapter.id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
        {filteredChapters.length === 0 && (
          <p style={{ color: 'var(--color-text-muted)' }}>
            {chapters.length === 0 ? 'No chapters found.' : 'No chapters match the selected filter.'}
          </p>
        )}
      </div>
    </div>
  );
}
