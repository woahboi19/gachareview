'use client';

import { useState, useEffect } from 'react';

interface TranslateButtonProps {
  originalText: string;
  onTranslated: (translatedText: string | null) => void;
}

export default function TranslateButton({ originalText, onTranslated }: TranslateButtonProps) {
  const [isTranslating, setIsTranslating] = useState(false);
  const [translated, setTranslated] = useState(false);
  const [targetLang, setTargetLang] = useState('tr');

  useEffect(() => {
    // Determine the browser's preferred language for translation, default to Turkish if unavailable
    if (typeof navigator !== 'undefined' && navigator.language) {
      const browserLang = navigator.language.split('-')[0];
      setTargetLang(browserLang);
    }
  }, []);

  const handleTranslate = async () => {
    if (translated) {
      // Toggle back to original
      setTranslated(false);
      onTranslated(null);
      return;
    }

    setIsTranslating(true);
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: originalText, targetLang })
      });

      if (!res.ok) {
        throw new Error('Translation failed');
      }

      const data = await res.json();
      setTranslated(true);
      onTranslated(data.translatedText);
    } catch (error) {
      console.error(error);
      alert('Could not translate text.');
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <button 
      onClick={handleTranslate} 
      disabled={isTranslating}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        background: 'rgba(255, 255, 255, 0.1)',
        border: '1px solid var(--color-surface-border)',
        borderRadius: 'var(--radius-sm)',
        padding: '0.2rem 0.6rem',
        fontSize: '0.8rem',
        color: 'var(--color-text-muted)',
        cursor: 'pointer',
        transition: 'all 0.2s',
        marginTop: '0.5rem'
      }}
      title={`Translate to ${targetLang.toUpperCase()}`}
    >
      <span style={{ fontSize: '1rem' }}>🌐</span>
      {isTranslating ? 'Translating...' : translated ? 'Show Original' : 'Translate'}
    </button>
  );
}
