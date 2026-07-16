'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import type { Session } from 'next-auth';
import RatingStars from './RatingStars';
import TranslateButton from './TranslateButton';

interface Review {
  id: string;
  rating: number;
  content: string;
  isSpoiler: boolean;
  userId: string;
  createdAt: Date;
  user: { name: string | null; image: string | null };
  upvotes: { id: string; userId: string; reviewId: string }[];
}

interface ReviewSectionProps {
  chapterId: string;
  initialReviews: Review[];
  session: Session | null;
}

export default function ReviewSection({ chapterId, initialReviews, session }: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  
  // Create state
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [isSpoiler, setIsSpoiler] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editContent, setEditContent] = useState('');
  const [editIsSpoiler, setEditIsSpoiler] = useState(false);
  const [isEditingSubmit, setIsEditingSubmit] = useState(false);

  // Spoilers state (which reviews are revealed)
  const [revealedSpoilers, setRevealedSpoilers] = useState<Set<string>>(new Set());

  // Translations state
  const [translatedTexts, setTranslatedTexts] = useState<Record<string, string>>({});

  const [modal, setModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    isConfirm: boolean;
    onConfirm?: () => void;
  }>({ isOpen: false, title: '', message: '', isConfirm: false });

  const router = useRouter();

  const openModal = (title: string, message: string, isConfirm: boolean, onConfirm?: () => void) => {
    setModal({ isOpen: true, title, message, isConfirm, onConfirm });
  };

  const closeModal = () => {
    setModal({ ...modal, isOpen: false });
  };

  const handleRevealSpoiler = (id: string) => {
    setRevealedSpoilers(prev => {
      const newSet = new Set(prev);
      newSet.add(id);
      return newSet;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !session?.user) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chapterId, rating, content, isSpoiler })
      });

      if (res.ok) {
        const newReview = await res.json();
        setReviews([newReview, ...reviews]);
        setContent('');
        setRating(5);
        setIsSpoiler(false);
        router.refresh(); 
      } else {
        const errData = await res.json();
        openModal('Error', errData.error || 'Failed to submit review', false);
      }
    } catch (err) {
      console.error(err);
      openModal('Error', 'An unexpected error occurred.', false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (review: Review) => {
    setEditingId(review.id);
    setEditRating(review.rating);
    setEditContent(review.content);
    setEditIsSpoiler(review.isSpoiler);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleEditSubmit = async (e: React.FormEvent, reviewId: string) => {
    e.preventDefault();
    if (!editContent.trim()) return;

    setIsEditingSubmit(true);
    try {
      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: editRating, content: editContent, isSpoiler: editIsSpoiler })
      });

      if (res.ok) {
        const updatedReview = await res.json();
        setReviews(reviews.map(r => r.id === reviewId ? updatedReview : r));
        setEditingId(null);
        router.refresh();
      } else {
        const errData = await res.json();
        openModal('Error', errData.error || 'Failed to update review', false);
      }
    } catch (err) {
      console.error(err);
      openModal('Error', 'An unexpected error occurred.', false);
    } finally {
      setIsEditingSubmit(false);
    }
  };

  const handleDelete = (reviewId: string) => {
    openModal('Are you sure?', 'Are you sure you want to delete this review? This action cannot be undone.', true, async () => {
      try {
        const res = await fetch(`/api/reviews/${reviewId}`, {
          method: 'DELETE'
        });

        if (res.ok) {
          setReviews(reviews.filter(r => r.id !== reviewId));
          router.refresh();
        } else {
          const errData = await res.json();
          openModal('Error', errData.error || 'Failed to delete review', false);
        }
      } catch (err) {
        console.error(err);
        openModal('Error', 'An unexpected error occurred.', false);
      }
    });
  };

  const handleUpvote = async (reviewId: string) => {
    if (!session?.user?.id) {
      openModal('Login Required', 'You must be logged in to like reviews.', false);
      return;
    }

    // Optimistic UI update
    const userId = session.user.id;
    const reviewIndex = reviews.findIndex(r => r.id === reviewId);
    if (reviewIndex === -1) return;

    const review = reviews[reviewIndex];
    const hasUpvoted = review.upvotes.some(u => u.userId === userId);

    const newReviews = [...reviews];
    if (hasUpvoted) {
      newReviews[reviewIndex].upvotes = review.upvotes.filter(u => u.userId !== userId);
    } else {
      newReviews[reviewIndex].upvotes = [...review.upvotes, { id: 'temp', userId, reviewId }];
    }
    setReviews(newReviews);

    try {
      const res = await fetch(`/api/reviews/${reviewId}/upvote`, { method: 'POST' });
      if (!res.ok) {
        // Revert on failure
        setReviews(reviews);
        openModal('Error', 'Failed to update like status', false);
      } else {
        router.refresh();
      }
    } catch (err) {
      setReviews(reviews);
      console.error(err);
    }
  };

  return (
    <div style={{ marginTop: '2rem' }}>
      {/* Custom Modal */}
      {modal.isOpen && typeof document !== 'undefined' && createPortal(
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }}>
          <div className="glass-panel" style={{ width: '90%', maxWidth: '400px', padding: '2rem', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--color-primary)' }}>{modal.title}</h3>
            <p style={{ color: '#e0e0e0', marginBottom: '2rem' }}>{modal.message}</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
              {modal.isConfirm && (
                <button 
                  className="btn btn-primary" 
                  style={{ background: '#ff3b30', color: '#fff' }} 
                  onClick={() => {
                    if (modal.onConfirm) modal.onConfirm();
                    closeModal();
                  }}
                >
                  Yes, Delete
                </button>
              )}
              <button className="btn btn-glass" onClick={closeModal}>
                {modal.isConfirm ? 'Cancel' : 'OK'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      <h3 style={{ marginBottom: '1rem', fontSize: '1.5rem', fontWeight: 700 }}>Reviews & Ratings</h3>
      
      {/* Review Form */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        {session?.user ? (
          <>
            <h4 style={{ marginBottom: '1rem' }}>Leave a Review as <span style={{ color: 'var(--color-primary)' }}>{session.user.name}</span></h4>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Rating</label>
                <RatingStars rating={rating} setRating={setRating} interactive />
              </div>
              <div className="form-group">
                <label className="form-label">Review</label>
                <textarea 
                  className="form-textarea" 
                  value={content} 
                  onChange={e => setContent(e.target.value)} 
                  placeholder="What did you think about this chapter's story?" 
                  required 
                />
              </div>
              <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input 
                  type="checkbox" 
                  id="spoiler-check" 
                  checked={isSpoiler}
                  onChange={e => setIsSpoiler(e.target.checked)}
                  style={{ width: '1.2rem', height: '1.2rem', cursor: 'pointer' }}
                />
                <label htmlFor="spoiler-check" style={{ cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                  This review contains spoilers
                </label>
              </div>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }}>You must be logged in to leave a review.</p>
            <button className="btn btn-primary" onClick={() => signIn()}>
              Login with Discord
            </button>
          </div>
        )}
      </div>

      {/* Review List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {reviews.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)' }}>No reviews yet. Be the first to review!</p>
        ) : (
          reviews.map(review => {
            const isOwner = session?.user?.id === review.userId;
            const isEditing = editingId === review.id;
            const isSpoilerVisible = !review.isSpoiler || revealedSpoilers.has(review.id) || isOwner;

            if (isEditing) {
              return (
                <div key={review.id} className="glass-panel" style={{ padding: '1.5rem', border: '1px solid var(--color-primary)' }}>
                  <form onSubmit={(e) => handleEditSubmit(e, review.id)}>
                    <div className="form-group">
                      <label className="form-label">Edit Rating</label>
                      <RatingStars rating={editRating} setRating={setEditRating} interactive />
                    </div>
                    <div className="form-group">
                      <textarea 
                        className="form-textarea" 
                        value={editContent} 
                        onChange={e => setEditContent(e.target.value)} 
                        required 
                      />
                    </div>
                    <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input 
                        type="checkbox" 
                        id={`edit-spoiler-${review.id}`} 
                        checked={editIsSpoiler}
                        onChange={e => setEditIsSpoiler(e.target.checked)}
                      />
                      <label htmlFor={`edit-spoiler-${review.id}`}>Contains spoilers</label>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <button type="submit" className="btn btn-primary" disabled={isEditingSubmit}>Save</button>
                      <button type="button" className="btn btn-glass" onClick={handleCancelEdit}>Cancel</button>
                    </div>
                  </form>
                </div>
              );
            }

            return (
              <div key={review.id} className="glass-panel" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {review.user.image && <img src={review.user.image} alt="" style={{ width: '24px', height: '24px', borderRadius: '50%' }} />}
                    <strong>{review.user.name}</strong>
                    {review.isSpoiler && <span style={{ background: '#ff3b30', color: '#fff', fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 'bold' }}>SPOILER</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <RatingStars rating={review.rating} />
                    {isOwner && (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => handleEditClick(review)} style={{ background: 'transparent', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontSize: '0.85rem' }}>Edit</button>
                        <button onClick={() => handleDelete(review.id)} style={{ background: 'transparent', border: 'none', color: '#ff3b30', cursor: 'pointer', fontSize: '0.85rem' }}>Delete</button>
                      </div>
                    )}
                  </div>
                </div>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
                <div style={{ position: 'relative' }}>
                  <p style={{ 
                    filter: !isSpoilerVisible ? 'blur(8px)' : 'none', 
                    transition: 'filter 0.3s ease',
                    userSelect: !isSpoilerVisible ? 'none' : 'auto',
                    whiteSpace: 'pre-wrap',
                    color: 'var(--color-text-main)'
                  }}>
                    {translatedTexts[review.id] || review.content}
                  </p>
                  {!isSpoilerVisible && (
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <button onClick={() => handleRevealSpoiler(review.id)} className="btn btn-glass" style={{ background: 'rgba(0,0,0,0.6)' }}>
                        Show Spoiler
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Upvote Button and Translate */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                  <TranslateButton 
                    originalText={review.content} 
                    onTranslated={(text) => {
                      if (text) {
                        setTranslatedTexts(prev => ({ ...prev, [review.id]: text }));
                      } else {
                        setTranslatedTexts(prev => {
                          const next = { ...prev };
                          delete next[review.id];
                          return next;
                        });
                      }
                    }} 
                  />

                  <button 
                    onClick={() => handleUpvote(review.id)}
                    style={{ 
                      background: 'transparent', border: 'none', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '0.4rem',
                      color: review.upvotes.some(u => u.userId === session?.user?.id) ? '#ff3b30' : 'var(--color-text-muted)',
                      transition: 'transform 0.2s ease',
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <span style={{ fontSize: '1.2rem' }}>
                      {review.upvotes.some(u => u.userId === session?.user?.id) ? '❤️' : '🤍'}
                    </span>
                    <span style={{ fontWeight: 'bold' }}>{review.upvotes.length}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
