import { unstable_cache } from 'next/cache';
import { prisma } from './prisma';

export const getCachedPopularGames = unstable_cache(
  async () => {
    return await prisma.game.findMany({
      take: 5,
      orderBy: { favoritedBy: { _count: 'desc' } }
    });
  },
  ['popular-games'],
  { tags: ['games'], revalidate: 3600 }
);

export const getCachedAllGames = unstable_cache(
  async () => {
    return await prisma.game.findMany({
      orderBy: { title: 'asc' }
    });
  },
  ['all-games'],
  { tags: ['games'], revalidate: 3600 }
);

export const getCachedRecentChapters = unstable_cache(
  async () => {
    return await prisma.storyChapter.findMany({
      orderBy: { releaseDate: 'desc' },
      take: 6,
      include: { game: true }
    });
  },
  ['recent-chapters'],
  { tags: ['chapters', 'games'], revalidate: 3600 }
);

export const getCachedGameBySlug = (gameSlug: string) => {
  return unstable_cache(
    async () => {
      return await prisma.game.findUnique({
        where: { slug: gameSlug },
        include: {
          chapters: {
            orderBy: { chapterNum: 'asc' },
            include: {
              reviews: true
            }
          },
          characters: true
        }
      });
    },
    [`game-details-slug-${gameSlug}`],
    { tags: ['game-details', `game-${gameSlug}`], revalidate: 3600 }
  )();
};

export const getCachedChapterBySlug = (gameSlug: string, chapterSlug: string) => {
  return unstable_cache(
    async () => {
      return await prisma.storyChapter.findFirst({
        where: { 
          slug: chapterSlug,
          game: { slug: gameSlug }
        },
        include: {
          game: true,
          reviews: {
            orderBy: { createdAt: 'desc' },
            include: { user: true, upvotes: true }
          }
        }
      });
    },
    [`chapter-details-slug-${gameSlug}-${chapterSlug}`],
    { tags: ['chapter-details', `chapter-${gameSlug}-${chapterSlug}`], revalidate: 3600 }
  )();
};
