import { prisma } from '../../lib/prisma';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { auth } from '../../auth';
import FavoriteButton from '../../components/FavoriteButton';
import EmptyState from '../../components/EmptyState';
import GameStatusSelector from '../../components/GameStatusSelector';
import ReviewSection from '../../components/ReviewSection';

import { getCachedGameBySlug } from '../../lib/data';

interface GamePageProps {
  params: Promise<{ gameSlug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function GamePage({ params, searchParams }: GamePageProps) {
  const { gameSlug } = await params;
  const searchParamsResolved = await searchParams;
  const currentTab = typeof searchParamsResolved.tab === 'string' ? searchParamsResolved.tab : 'chapters';
  const charRole = typeof searchParamsResolved.role === 'string' ? searchParamsResolved.role : 'all';
  
  const game = await getCachedGameBySlug(gameSlug);

  if (!game) {
    notFound();
  }

  const session = await auth();
  const userId = session?.user?.id;
  
  let isFavorited = false;
  if (userId) {
    const favorite = await prisma.favoriteGame.findUnique({
      where: {
        userId_gameId: {
          userId,
          gameId: game.id
        }
      }
    });
    isFavorited = !!favorite;
  }

  // Calculate game overall rating from global reviews
  let totalRating = 0;
  const totalReviews = game.reviews?.length || 0;

  if (game.reviews) {
    game.reviews.forEach((review) => {
      totalRating += review.rating;
    });
  }

  const averageRating = totalReviews > 0 ? (totalRating / totalReviews).toFixed(1) : null;

  // Find user's game status
  let userGameStatus = null;
  if (userId && game.userStatuses) {
    const statusObj = game.userStatuses.find(s => s.userId === userId);
    if (statusObj) userGameStatus = statusObj.status;
  }

  // Calculate Community Stats
  const playingCount = game.userStatuses?.filter(s => s.status === 'PLAYING').length || 0;
  const completedCount = game.userStatuses?.filter(s => s.status === 'COMPLETED').length || 0;
  const droppedCount = game.userStatuses?.filter(s => s.status === 'DROPPED').length || 0;

  // Group chapters by category
  const chaptersByCategory = game.chapters.reduce((acc, chapter) => {
    const cat = chapter.category || 'Main Story';
    if (!acc[cat]) {
      acc[cat] = [];
    }
    acc[cat].push(chapter);
    return acc;
  }, {} as Record<string, typeof game.chapters>);

  // Sort categories: Categories with at least one 'isMain' chapter come first, and specifically prioritize known story categories
  const sortedCategories = Object.entries(chaptersByCategory).sort(([catA, chapsA], [catB, chapsB]) => {
    const categoryPriority: Record<string, number> = {
      "Phaethon's Story": 1,
      "Main Story": 2,
      "Archon Quest": 3,
      "Trailblaze Mission": 4,
      "Season 1: New Eridu": 10,
      "Season 2: Waifei Peninsula": 11,
      "Season 3: Roscaelifer": 12,
      "Special Episodes": 20,
      "Agent Stories": 30,
      "Prologue: Mondstadt": 40,
      "Chapter I: Liyue": 41,
      "Chapter II: Inazuma": 42,
      "Chapter III: Sumeru": 43,
      "Chapter IV: Fontaine": 44,
      "Chapter V: Natlan": 45,
      "Chapter VI: Nod-Krai": 46,
      "Chapter VII: Snezhnaya": 47,
      "Interlude Chapters": 50,
      "Story Quests": 60,
      "Hangout Events": 70,
      "Event Quests": 80,
      "Prologue: Herta Space Station": 90,
      "Chapter I: Jarilo-VI": 91,
      "Chapter II: The Xianzhou Luofu": 92,
      "Chapter III: Penacony": 93,
      "Chapter IV: Amphoreus": 94,
      "Chapter V: Planarcadia": 95,
      "Trailblaze Continuances": 100,
      "Trailblaze Continuance": 101,
      "Companion Missions": 110,
      "Companion Mission": 111,
      "Prologue: Huanglong": 120,
      "Chapter I: Jinzhou Rising": 121,
      "Chapter II: Even When Divinity Remains Silent": 122,
      "Chapter III: To the Stars Yet to Shine": 123,
      "Chapter IV: Rebirth From the Depths": 124,
      "Companion Stories": 130,
      "Companion Story": 131,
      "Reunion Arc": 140,
      "Act I: Hour of an Awakening": 140,
      "Victoria Arc": 141,
      "Act II: Shadow of a Dying Sun": 141,
      "Nexus Point of Future": 142,
      "Act III: Nexus Point of Future": 142,
      "Intermezzi": 150,
      "Intermezzo": 151,
      "Side Stories": 160,
      "Side Story": 161,
      "Story Collections": 170,
      "Story Collection": 171,
      "Vignettes": 172,
      "Part 1: The Honkai War": 180,
      "Part 1 EX & Chronicles": 181,
      "Elysian Realm": 182,
      "A Post-Honkai Odyssey": 183,
      "Part 1.5: Dance of Life and Death": 184,
      "Part 2: Mars Saga": 185,
      "Prologue: Force Start": 200,
      "Chapter 1: The Broken Lands": 201,
      "Chapter 2: Lost in the Marsh": 202,
      "Special Operations & Story Events": 203,
      "May Flame Consume the Ashes of the Past": 204,
      "Endfield Operations & Field Protocols": 205,
      "Prologue: In Media Res": 210,
      "Main Story (Cantos)": 211,
      "Intervallo (Story Events)": 212,
      "Act 1: The Judas Incident & Chaos Genesis": 220,
      "Act 2: The Peltion Conspiracy & Nihilum Abyss": 221,
      "Trauma Code: Epione Records": 222,
      "Galactic Incursions & Special Sorties": 223,
      "Main Story: Nightmare Void": 224,
      "Cognitive Incursions": 224,
      "Season 1: Champion Sword": 230,
      "Season 2: Demon World": 231,
      "Season 3: The Underworld": 232,
      "Side Stories & Short Stories": 240,
    };

    if (categoryPriority[catA] !== undefined && categoryPriority[catB] !== undefined) {
      return categoryPriority[catA] - categoryPriority[catB];
    }
    if (categoryPriority[catA] !== undefined) return -1;
    if (categoryPriority[catB] !== undefined) return 1;

    const aIsMain = chapsA.some(c => c.isMain);
    const bIsMain = chapsB.some(c => c.isMain);
    if (aIsMain && !bIsMain) return -1;
    if (!aIsMain && bIsMain) return 1;
    return catA.localeCompare(catB, undefined, { numeric: true, sensitivity: 'base' });
  });

  return (
    <div className="animate-fade-in">
      {/* Cinematic Header */}
      <div className="game-detail-header-container">
        {game.imageUrl && (
          <div className="game-detail-image-container">
            <Image src={game.imageUrl} alt={game.title} fill sizes="(max-width: 768px) 100vw, 250px" priority={true} style={{ objectFit: 'contain', objectPosition: 'center' }} />
          </div>
        )}
        <div className="game-detail-info-container">
          <div>
            <div className="game-detail-title-row">
              <div>
                <div className="game-detail-title-group" style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <h1 className="game-detail-title">{game.title}</h1>
                  <FavoriteButton gameId={game.id} initialIsFavorited={isFavorited} isLoggedIn={!!session} />
                  <GameStatusSelector gameId={game.id} initialStatus={userGameStatus} isLoggedIn={!!session} />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                  {game.genres?.map(genre => (
                    <span key={genre.id} style={{ padding: '0.2rem 0.6rem', fontSize: '0.8rem', background: 'var(--color-primary)', color: 'white', borderRadius: '12px', fontWeight: 'bold' }}>
                      {genre.name}
                    </span>
                  ))}
                </div>
                <p className="game-detail-developer">{game.developer}</p>
                
                {/* Community Stats */}
                <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                  <div><strong style={{ color: 'var(--color-text-main)' }}>{playingCount}</strong> Playing</div>
                  <div><strong style={{ color: 'var(--color-text-main)' }}>{completedCount}</strong> Completed</div>
                  <div><strong style={{ color: 'var(--color-text-main)' }}>{droppedCount}</strong> Dropped</div>
                </div>
              </div>
              {/* IMDB Style Rating Widget */}
              <div className="game-detail-rating-widget">
                <div className="game-detail-rating-label">Rating</div>
                <div className="game-detail-rating-score-row">
                  <span className="game-detail-rating-star">★</span>
                  <div>
                    <span className="game-detail-rating-score">{averageRating || '-'}</span>
                    <span className="game-detail-rating-max">/5</span>
                  </div>
                </div>
                <div className="game-detail-rating-count">
                  {totalReviews} {totalReviews === 1 ? 'Review' : 'Reviews'}
                </div>
              </div>
            </div>
            

            <p className="game-detail-desc">{game.description}</p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', borderBottom: '1px solid var(--color-surface-border)', paddingBottom: '1rem' }}>
        <Link href={`/${game.slug}?tab=chapters`} scroll={false}>
          <button className={`btn ${currentTab === 'chapters' ? 'btn-primary' : 'btn-glass'}`} style={{ padding: '0.6rem 1.5rem', borderRadius: '20px', fontWeight: 'bold' }}>
            Chapters
          </button>
        </Link>
        <Link href={`/${game.slug}?tab=characters`} scroll={false}>
          <button className={`btn ${currentTab === 'characters' ? 'btn-primary' : 'btn-glass'}`} style={{ padding: '0.6rem 1.5rem', borderRadius: '20px', fontWeight: 'bold' }}>
            Characters
          </button>
        </Link>
        <Link href={`/${game.slug}?tab=reviews`} scroll={false}>
          <button className={`btn ${currentTab === 'reviews' ? 'btn-primary' : 'btn-glass'}`} style={{ padding: '0.6rem 1.5rem', borderRadius: '20px', fontWeight: 'bold' }}>
            Game Reviews
          </button>
        </Link>
      </div>

      <div style={{ marginTop: '2rem' }}>
        {/* Chapters Section */}
        {currentTab === 'chapters' && (
          <div>
            <div className="game-detail-section-header" style={{ marginBottom: '1.5rem' }}>
              <h2 className="game-detail-section-title">Chapters</h2>
            </div>
            <div className="game-detail-chapter-list">

        {sortedCategories.length === 0 ? (
          <EmptyState 
            title="No chapters yet" 
            description="There are currently no chapters available for this game. Check back later!" 
          />
        ) : (
          sortedCategories.map(([category, chapters]) => {
            const sortedChapters = [...chapters].sort((a, b) => {
              if (a.chapterNum !== b.chapterNum) {
                return a.chapterNum - b.chapterNum;
              }
              if (a.releaseDate && b.releaseDate) {
                return new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime();
              }
              return 0;
            });

            return (
              <div key={category}>
                <div className="game-detail-chapter-category">
                  <h2 className="game-detail-chapter-category-title">{category}</h2>
                </div>
                <div className="game-detail-chapter-grid">
                  {sortedChapters.map(chapter => {
                    const chapReviews = chapter.reviews.length;
                    const chapAvg = chapReviews > 0 
                      ? (chapter.reviews.reduce((acc, r) => acc + r.rating, 0) / chapReviews).toFixed(1)
                      : null;

                    let eventPill = null;
                    let displayTitle = chapter.title;

                    if (chapter.category === 'Event Quests' && chapter.title.includes(': ')) {
                      const idx = chapter.title.indexOf(': ');
                      const eventName = chapter.title.substring(0, idx);
                      displayTitle = chapter.title.substring(idx + 2);
                      eventPill = (
                        <span 
                          style={{ 
                            fontSize: '0.75rem', 
                            fontWeight: 700, 
                            color: '#93c5fd', 
                            background: 'rgba(59, 130, 246, 0.15)', 
                            padding: '0.15rem 0.5rem', 
                            borderRadius: '6px', 
                            border: '1px solid rgba(59, 130, 246, 0.3)',
                            letterSpacing: '0.02em',
                            textTransform: 'uppercase'
                          }}
                        >
                          {eventName}
                        </span>
                      );
                    }

                    const isCharacterStory = chapter.category === 'Story Quests' || chapter.category === 'Hangout Events' || chapter.chapterType === 'CHARACTER';
                    const primaryChar = isCharacterStory && chapter.characters && chapter.characters.length > 0 ? chapter.characters[0] : null;
                    const charDisplayImg = primaryChar?.avatarUrl || primaryChar?.imageUrl;

                    return (
                      <Link key={chapter.id} href={`/${game.slug}/${chapter.slug}`}>
                        <div className="glass-panel chapter-card" style={{ cursor: 'pointer', display: 'flex', overflow: 'hidden' }}>
                          {chapter.imageUrl && (
                            <div className="chapter-card-img-container" style={{ position: 'relative', width: '80px', alignSelf: 'stretch', flexShrink: 0, background: 'var(--color-surface-border)' }}>
                              <Image src={chapter.imageUrl} alt={chapter.title} fill sizes="(max-width: 768px) 100vw, 80px" style={{ objectFit: 'cover' }} />
                            </div>
                          )}
                          <div className="chapter-card-content" style={{ padding: '1.25rem 1.5rem', flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <h3 className="game-detail-chapter-card-header" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                  <span className={`chapter-badge badge-${chapter.chapterType?.toLowerCase() || 'main'}`}>
                                    {chapter.chapterType || 'MAIN'}
                                  </span>
                                  {chapter.chapterCode && (
                                    <span className="chapter-code">{chapter.chapterCode}</span>
                                  )}
                                </div>
                                {eventPill}
                                {primaryChar && (
                                  <div 
                                    style={{ 
                                      display: 'inline-flex', 
                                      alignItems: 'center', 
                                      gap: '0.4rem', 
                                      background: 'rgba(255, 255, 255, 0.08)', 
                                      padding: '0.12rem 0.55rem 0.12rem 0.25rem', 
                                      borderRadius: '16px', 
                                      border: '1px solid rgba(255, 255, 255, 0.15)' 
                                    }}
                                  >
                                    {charDisplayImg && (
                                      <div style={{ position: 'relative', width: 22, height: 22, borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
                                        <Image src={charDisplayImg} alt={primaryChar.name} fill sizes="22px" style={{ objectFit: 'cover' }} />
                                      </div>
                                    )}
                                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f3f4f6' }}>{primaryChar.name}</span>
                                  </div>
                                )}
                                <span>{displayTitle}</span>
                                {chapter.releaseDate && (
                                  <span className="game-detail-chapter-date-badge">
                                    {new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(chapter.releaseDate))}
                                  </span>
                                )}
                              </h3>
                              <p className="game-detail-chapter-summary">{chapter.summary.substring(0, 120)}...</p>
                            </div>
                            <div className="game-detail-chapter-rating" style={{ color: chapAvg ? 'var(--color-text-main)' : 'var(--color-primary)', fontWeight: chapAvg ? 'bold' : 'normal' }}>
                              {chapAvg ? (
                                <>
                                  <span style={{ color: '#f5c518' }}>★</span> {chapAvg}
                                  <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginLeft: '0.5rem' }}>({chapReviews})</span>
                                </>
                              ) : (
                                '★ Rate'
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
          </div>
        )}

        {/* Characters Section */}
        {currentTab === 'characters' && game.characters && (() => {
          const isCZN = game.slug === 'chaos-zero-nightmare';
          const isLC = game.slug === 'limbus-company';

          const CZN_PARTNER_NAMES = new Set([
            'Janet', 'Asteria', 'Erica', 'Noel', 'Marin', 'Tina', 'Marianne', 'Scarlet',
            'Kiara', 'Priscilla', 'Solia', 'Eishlen', 'Nyx', 'Zeta', 'Bria', 'Anteia',
            'Serithea', 'Ritochka', 'Carroty', 'Lillian', 'Rachel', 'Eloise', 'Rosaria',
            'Wilhelmina', 'Daisy', 'Akad', 'Alyssa', 'Arwen', 'Nakia', 'Zatera', 'Raidel',
            'Douglas', 'Yuri', 'Yvonne', 'Elexia'
          ]);

          const LC_CREW_NAMES = new Set([
            'Dante', 'Vergilius', 'Charon', 'Yi Sang', 'Faust', 'Don Quixote', 'Ryōshū',
            'Meursault', 'Hong Lu', 'Heathcliff', 'Ishmael', 'Rodion', 'Sinclair', 'Outis', 'Gregor'
          ]);

          const sortChars = (list: typeof game.characters) => {
            return [...list].sort((a, b) => {
              if (a.isMain && !b.isMain) return -1;
              if (!a.isMain && b.isMain) return 1;
              if (a.releaseDate && b.releaseDate) {
                const diff = new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime();
                if (diff !== 0) return diff;
              } else if (a.releaseDate && !b.releaseDate) {
                return -1;
              } else if (!a.releaseDate && b.releaseDate) {
                return 1;
              }
              return a.name.localeCompare(b.name);
            });
          };

          const isPartnerChar = (c: (typeof game.characters)[0]) => 
            CZN_PARTNER_NAMES.has(c.name) || c.lore.toLowerCase().includes('partner');

          const combatants = isCZN ? sortChars(game.characters.filter(c => !isPartnerChar(c))) : [];
          const partners = isCZN ? sortChars(game.characters.filter(c => isPartnerChar(c))) : [];

          const lcbCrew = isLC ? sortChars(game.characters.filter(c => LC_CREW_NAMES.has(c.name))) : [];
          const keyFigures = isLC ? sortChars(game.characters.filter(c => !LC_CREW_NAMES.has(c.name))) : [];

          const renderCharacterCard = (char: (typeof game.characters)[0], isPartner = false) => (
            <div key={char.id} className="glass-panel game-detail-character-card">
              {char.imageUrl ? (
                <div className="game-detail-character-image-container">
                  <Image src={char.imageUrl} alt={char.name} fill sizes="(max-width: 768px) 100vw, 300px" style={{ objectFit: 'cover', objectPosition: 'top' }} />
                </div>
              ) : (
                <div className="game-detail-character-no-image">
                  No Image
                </div>
              )}
              <div className="game-detail-character-info">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <h3 className="game-detail-character-name" style={{ margin: 0 }}>{char.name}</h3>
                  {char.isMain ? (
                    <span 
                      style={{ 
                        fontSize: '0.68rem', 
                        fontWeight: 700, 
                        padding: '0.15rem 0.5rem', 
                        borderRadius: '12px', 
                        background: 'rgba(234, 179, 8, 0.15)', 
                        color: '#facc15', 
                        border: '1px solid rgba(234, 179, 8, 0.35)', 
                        textTransform: 'uppercase', 
                        letterSpacing: '0.04em',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      Main Character
                    </span>
                  ) : isCZN ? (
                    isPartner ? (
                      <span 
                        style={{ 
                          fontSize: '0.68rem', 
                          fontWeight: 700, 
                          padding: '0.15rem 0.5rem', 
                          borderRadius: '12px', 
                          background: 'rgba(168, 85, 247, 0.15)', 
                          color: '#c084fc', 
                          border: '1px solid rgba(168, 85, 247, 0.35)', 
                          textTransform: 'uppercase', 
                          letterSpacing: '0.04em',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        Support Partner
                      </span>
                    ) : (
                      <span 
                        style={{ 
                          fontSize: '0.68rem', 
                          fontWeight: 700, 
                          padding: '0.15rem 0.5rem', 
                          borderRadius: '12px', 
                          background: 'rgba(59, 130, 246, 0.15)', 
                          color: '#60a5fa', 
                          border: '1px solid rgba(59, 130, 246, 0.35)', 
                          textTransform: 'uppercase', 
                          letterSpacing: '0.04em',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        Combatant
                      </span>
                    )
                  ) : isLC ? (
                    LC_CREW_NAMES.has(char.name) ? (
                      char.name === 'Vergilius' || char.name === 'Charon' ? (
                        <span 
                          style={{ 
                            fontSize: '0.68rem', 
                            fontWeight: 700, 
                            padding: '0.15rem 0.5rem', 
                            borderRadius: '12px', 
                            background: 'rgba(56, 189, 248, 0.15)', 
                            color: '#38bdf8', 
                            border: '1px solid rgba(56, 189, 248, 0.35)', 
                            textTransform: 'uppercase', 
                            letterSpacing: '0.04em',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          LCB Staff
                        </span>
                      ) : (
                        <span 
                          style={{ 
                            fontSize: '0.68rem', 
                            fontWeight: 700, 
                            padding: '0.15rem 0.5rem', 
                            borderRadius: '12px', 
                            background: 'rgba(239, 68, 68, 0.15)', 
                            color: '#f87171', 
                            border: '1px solid rgba(239, 68, 68, 0.35)', 
                            textTransform: 'uppercase', 
                            letterSpacing: '0.04em',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          Sinner
                        </span>
                      )
                    ) : (
                      <span 
                        style={{ 
                          fontSize: '0.68rem', 
                          fontWeight: 700, 
                          padding: '0.15rem 0.5rem', 
                          borderRadius: '12px', 
                          background: 'rgba(245, 158, 11, 0.15)', 
                          color: '#fbbf24', 
                          border: '1px solid rgba(245, 158, 11, 0.35)', 
                          textTransform: 'uppercase', 
                          letterSpacing: '0.04em',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        Key Figure
                      </span>
                    )
                  ) : game.slug === 'arknights-endfield' ? (
                    <span 
                      style={{ 
                        fontSize: '0.68rem', 
                        fontWeight: 700, 
                        padding: '0.15rem 0.5rem', 
                        borderRadius: '12px', 
                        background: 'rgba(6, 182, 212, 0.15)', 
                        color: '#22d3ee', 
                        border: '1px solid rgba(6, 182, 212, 0.35)', 
                        textTransform: 'uppercase', 
                        letterSpacing: '0.04em',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      Operator
                    </span>
                  ) : null}
                </div>
                {char.releaseDate && (
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span>Released:</span>
                    <span style={{ color: 'var(--color-text-main)', fontWeight: 500 }}>
                      {new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(char.releaseDate))}
                    </span>
                  </div>
                )}
                <p className="game-detail-character-lore">
                  {char.lore}
                </p>
                {(char.voiceActorEN || char.voiceActorJP) && (
                  <div className="game-detail-character-va">
                    {char.voiceActorEN && <div><strong>{game.slug === 'honkai-impact-3rd' ? 'CN:' : game.slug === 'limbus-company' ? 'KR:' : 'EN:'}</strong> {char.voiceActorEN}</div>}
                    {char.voiceActorJP && <div><strong>JP:</strong> {char.voiceActorJP}</div>}
                  </div>
                )}
              </div>
            </div>
          );

          if (isCZN) {
            return (
              <div className="game-detail-character-container">
                <div className="game-detail-section-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h2 className="game-detail-section-title" style={{ margin: 0 }}>Characters & Partners</h2>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem', marginTop: '0.35rem' }}>
                      Explore the Ark SS Nightmare frontline combatants and specialized support partners.
                    </p>
                  </div>
                  {/* Category Filter Pills */}
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <Link href={`/${game.slug}?tab=characters&role=all`} scroll={false}>
                      <button 
                        className={`btn ${charRole === 'all' ? 'btn-primary' : 'btn-glass'}`} 
                        style={{ padding: '0.4rem 1rem', borderRadius: '16px', fontSize: '0.85rem', fontWeight: 600 }}
                      >
                        All ({game.characters.length})
                      </button>
                    </Link>
                    <Link href={`/${game.slug}?tab=characters&role=combatants`} scroll={false}>
                      <button 
                        className={`btn ${charRole === 'combatants' ? 'btn-primary' : 'btn-glass'}`} 
                        style={{ padding: '0.4rem 1rem', borderRadius: '16px', fontSize: '0.85rem', fontWeight: 600 }}
                      >
                        ⚔️ Combatants ({combatants.length})
                      </button>
                    </Link>
                    <Link href={`/${game.slug}?tab=characters&role=partners`} scroll={false}>
                      <button 
                        className={`btn ${charRole === 'partners' ? 'btn-primary' : 'btn-glass'}`} 
                        style={{ padding: '0.4rem 1rem', borderRadius: '16px', fontSize: '0.85rem', fontWeight: 600 }}
                      >
                        🛡️ Partners ({partners.length})
                      </button>
                    </Link>
                  </div>
                </div>

                {/* Combatants Section */}
                {(charRole === 'all' || charRole === 'combatants') && (
                  <div style={{ marginBottom: '3rem' }}>
                    <div style={{ borderLeft: '4px solid #3b82f6', paddingLeft: '0.85rem', marginBottom: '1.25rem' }}>
                      <h3 style={{ fontSize: '1.35rem', fontWeight: 700, margin: 0, color: '#f3f4f6' }}>
                        ⚔️ Frontline Combatants ({combatants.length})
                      </h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
                        Playable tactical combat agents commanded in sorties and deck-building tactical encounters.
                      </p>
                    </div>
                    <div className="grid-cards">
                      {combatants.map(c => renderCharacterCard(c, false))}
                    </div>
                  </div>
                )}

                {/* Support Partners Section */}
                {(charRole === 'all' || charRole === 'partners') && (
                  <div>
                    <div style={{ borderLeft: '4px solid #a855f7', paddingLeft: '0.85rem', marginBottom: '1.25rem' }}>
                      <h3 style={{ fontSize: '1.35rem', fontWeight: 700, margin: 0, color: '#f3f4f6' }}>
                        🛡️ Support Partners ({partners.length})
                      </h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
                        Equippable companion partners providing Ego skills, passive attribute boosts, and tactical resonance.
                      </p>
                    </div>
                    <div className="grid-cards">
                      {partners.map(c => renderCharacterCard(c, true))}
                    </div>
                  </div>
                )}
              </div>
            );
          }

          if (isLC) {
            return (
              <div className="game-detail-character-container">
                <div className="game-detail-section-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h2 className="game-detail-section-title" style={{ margin: 0 }}>Sinners & Key Figures</h2>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem', marginTop: '0.35rem' }}>
                      The contract Sinners aboard Mephistopheles and the pivotal figures encountered across the City.
                    </p>
                  </div>
                  {/* Category Filter Pills */}
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <Link href={`/${game.slug}?tab=characters&role=all`} scroll={false}>
                      <button 
                        className={`btn ${charRole === 'all' ? 'btn-primary' : 'btn-glass'}`} 
                        style={{ padding: '0.4rem 1rem', borderRadius: '16px', fontSize: '0.85rem', fontWeight: 600 }}
                      >
                        All ({game.characters.length})
                      </button>
                    </Link>
                    <Link href={`/${game.slug}?tab=characters&role=crew`} scroll={false}>
                      <button 
                        className={`btn ${charRole === 'crew' ? 'btn-primary' : 'btn-glass'}`} 
                        style={{ padding: '0.4rem 1rem', borderRadius: '16px', fontSize: '0.85rem', fontWeight: 600 }}
                      >
                        🚌 LCB Crew ({lcbCrew.length})
                      </button>
                    </Link>
                    <Link href={`/${game.slug}?tab=characters&role=keyfigures`} scroll={false}>
                      <button 
                        className={`btn ${charRole === 'keyfigures' ? 'btn-primary' : 'btn-glass'}`} 
                        style={{ padding: '0.4rem 1rem', borderRadius: '16px', fontSize: '0.85rem', fontWeight: 600 }}
                      >
                        🎭 Key Figures ({keyFigures.length})
                      </button>
                    </Link>
                  </div>
                </div>

                {/* LCB Crew Section */}
                {(charRole === 'all' || charRole === 'crew') && (
                  <div style={{ marginBottom: '3rem' }}>
                    <div style={{ borderLeft: '4px solid #ef4444', paddingLeft: '0.85rem', marginBottom: '1.25rem' }}>
                      <h3 style={{ fontSize: '1.35rem', fontWeight: 700, margin: 0, color: '#f3f4f6' }}>
                        🚌 LCB Department Crew ({lcbCrew.length})
                      </h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
                        Executive Manager Dante, Guide Vergilius, Driver Charon, and the 12 contracted Sinners.
                      </p>
                    </div>
                    <div className="grid-cards">
                      {lcbCrew.map(c => renderCharacterCard(c, false))}
                    </div>
                  </div>
                )}

                {/* Key Figures & Antagonists Section */}
                {(charRole === 'all' || charRole === 'keyfigures') && (
                  <div>
                    <div style={{ borderLeft: '4px solid #f59e0b', paddingLeft: '0.85rem', marginBottom: '1.25rem' }}>
                      <h3 style={{ fontSize: '1.35rem', fontWeight: 700, margin: 0, color: '#f3f4f6' }}>
                        🎭 Key Figures & Antagonists ({keyFigures.length})
                      </h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
                        Pivotal figures, formidable commanders, and tragic personalities encountered across the Cantos and Intervallos.
                      </p>
                    </div>
                    <div className="grid-cards">
                      {keyFigures.map(c => renderCharacterCard(c, false))}
                    </div>
                  </div>
                )}
              </div>
            );
          }

          const sortedCharacters = sortChars(game.characters);

          return (
            <div className="game-detail-character-container">
              <div className="game-detail-section-header" style={{ marginBottom: '1.5rem' }}>
                <h2 className="game-detail-section-title">Characters</h2>
              </div>
              <div className="grid-cards">
                {sortedCharacters.map((char) => renderCharacterCard(char, false))}
              </div>
            </div>
          );
        })()}

        {/* Game Reviews Section */}
        {currentTab === 'reviews' && (
          <div>
            <h2 className="game-detail-section-title">Game Reviews</h2>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
              What do you think about the overall game (gameplay, gacha rates, graphics, etc.)? 
              For specific story feedback, please review the individual chapters.
            </p>
            <ReviewSection gameId={game.id} initialReviews={game.reviews || []} session={session} />
          </div>
        )}
      </div>
    </div>
  );
}
