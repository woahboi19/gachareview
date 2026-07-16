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
      orderBy: { createdAt: 'desc' },
      take: 6,
      include: { game: true }
    });
  },
  ['recent-chapters'],
  { tags: ['chapters', 'games'], revalidate: 3600 }
);

export const getCachedGame = (id: string) => {
  return unstable_cache(
    async () => {
      return await prisma.game.findUnique({
        where: { id },
        include: {
          chapters: {
            orderBy: { chapterNum: 'asc' },
            include: {
              reviews: true
            }
          }
        }
      });
    },
    [`game-details-${id}`],
    { tags: ['game-details', `game-${id}`], revalidate: 3600 }
  )();
};

export const getCachedChapter = (chapterId: string) => {
  return unstable_cache(
    async () => {
      return await prisma.storyChapter.findUnique({
        where: { id: chapterId },
        include: {
          game: true,
          reviews: {
            orderBy: { createdAt: 'desc' },
            include: { user: true, upvotes: true }
          }
        }
      });
    },
    [`chapter-details-${chapterId}`],
    { tags: ['chapter-details', `chapter-${chapterId}`], revalidate: 3600 }
  )();
};
