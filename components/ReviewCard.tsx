'use client';

import { useState } from 'react';
import TranslateButton from './TranslateButton';

interface ReviewCardProps {
  id: string;
  gameTitle?: string;
  chapterTitle?: string;
  chapterNum?: number;
  rating: number;
  content: string;
  createdAt: Date | string;
  authorName?: string;
}

export default function ReviewCard({ id, gameTitle, chapterTitle, chapterNum, rating, content, createdAt, authorName }: ReviewCardProps) {
  const [translatedContent, setTranslatedContent] = useState<string | null>(null);

  const displayContent = translatedContent || content;

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
        <div>
          {gameTitle && chapterTitle && (
            <h4 style={{ fontSize: '1.1rem', marginBottom: '0.2rem' }}>
              <span style={{ color: 'var(--color-primary)' }}>{gameTitle}</span> - Ch.{chapterNum} {chapterTitle}
            </h4>
          )}
          {authorName && (
            <h4 style={{ fontSize: '1.1rem', marginBottom: '0.2rem' }}>
              By <span style={{ color: 'var(--color-primary)' }}>{authorName}</span>
            </h4>
          )}
          <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            {new Date(createdAt).toLocaleDateString()}
          </span>
        </div>
        <div style={{ fontSize: '1.5rem', color: '#f5c518', fontWeight: 'bold' }}>
          ★ {rating.toFixed(1)}
        </div>
      </div>
      <p style={{ color: 'var(--color-text-main)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
        {displayContent}
      </p>
      
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <TranslateButton originalText={content} onTranslated={(text) => setTranslatedContent(text)} />
      </div>
    </div>
  );
}
