import { unstable_cache } from 'next/cache';
import { prisma } from './prisma';

export const getCachedAllGenres = unstable_cache(
  async () => {
    return await prisma.genre.findMany({
      orderBy: { name: 'asc' }
    });
  },
  ['all-genres'],
  { tags: ['genres'], revalidate: 3600 }
);

export const getCachedPopularGames = unstable_cache(
  async () => {
    return await prisma.game.findMany({
      take: 5,
      orderBy: { favoritedBy: { _count: 'desc' } },
      include: { genres: true }
    });
  },
  ['popular-games'],
  { tags: ['games'], revalidate: 3600 }
);

export const getCachedAllGames = unstable_cache(
  async () => {
    return await prisma.game.findMany({
      orderBy: { title: 'asc' },
      include: { genres: true }
    });
  },
  ['all-games'],
  { tags: ['games'], revalidate: 3600 }
);

export const getCachedRecentChapters = unstable_cache(
  async () => {
    return await prisma.storyChapter.findMany({
      where: { releaseDate: { not: null, lte: new Date() } },
      orderBy: { releaseDate: 'desc' },
      take: 6,
      include: { game: true }
    });
  },
  ['recent-chapters'],
  { tags: ['chapters', 'games'], revalidate: 3600 }
);

export const getCachedUpcomingChapters = unstable_cache(
  async () => {
    return await prisma.storyChapter.findMany({
      where: { releaseDate: { not: null, gt: new Date() } },
      orderBy: { releaseDate: 'asc' },
      take: 6,
      include: { game: true }
    });
  },
  ['upcoming-chapters'],
  { tags: ['chapters', 'games'], revalidate: 3600 }
);

export const getCachedTrendingGames = unstable_cache(
  async () => {
    return await prisma.game.findMany({
      take: 4,
      orderBy: { favoritedBy: { _count: 'desc' } },
      include: { genres: true }
    });
  },
  ['trending-games'],
  { tags: ['games'], revalidate: 3600 }
);

export const getCachedEditorsPicks = unstable_cache(
  async () => {
    return await prisma.game.findMany({
      where: { isEditorsPick: true },
      take: 4,
      orderBy: { createdAt: 'desc' },
      include: { genres: true }
    });
  },
  ['editors-picks'],
  { tags: ['games'], revalidate: 3600 }
);

export const getCachedHighestRated = unstable_cache(
  async () => {
    return await prisma.game.findMany({
      take: 4,
      orderBy: { averageScore: 'desc' },
      include: { genres: true }
    });
  },
  ['highest-rated'],
  { tags: ['games'], revalidate: 3600 }
);

export const getCachedGameBySlug = (gameSlug: string) => {
  return unstable_cache(
    async () => {
      return await prisma.game.findUnique({
        where: { slug: gameSlug },
        include: {
          genres: true,
          userStatuses: true,
          reviews: {
            where: { chapterId: null },
            include: { user: true, upvotes: true },
            orderBy: { createdAt: 'desc' }
          },
          chapters: {
            orderBy: [{ releaseDate: 'asc' }, { chapterNum: 'asc' }],
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
          game: {
            include: { chapters: { select: { slug: true, title: true, chapterNum: true, releaseDate: true } } }
          },
          characters: true,
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

export const getCachedTopReviews = unstable_cache(
  async () => {
    return await prisma.review.findMany({
      take: 10,
      orderBy: { upvotes: { _count: 'desc' } },
      include: { user: true, game: true, chapter: true, upvotes: true }
    });
  },
  ['top-reviews'],
  { tags: ['reviews'], revalidate: 3600 }
);

export const getCachedTopUsers = unstable_cache(
  async () => {
    return await prisma.user.findMany({
      take: 10,
      orderBy: { reviews: { _count: 'desc' } },
      include: { _count: { select: { reviews: true } } }
    });
  },
  ['top-users'],
  { tags: ['users'], revalidate: 3600 }
);
