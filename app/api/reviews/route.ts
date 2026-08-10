import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { prisma } from '../../../lib/prisma';
import { auth } from '../../../auth';

export async function POST(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { chapterId, gameId, rating, content, isSpoiler } = await request.json();

    if ((!chapterId && !gameId) || !rating || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let finalGameId = gameId;
    let chapterSlug = null;
    let gameSlug = null;

    if (chapterId) {
      // Get gameId from chapter to link the review properly
      const chapter = await prisma.storyChapter.findUnique({
        where: { id: chapterId },
        select: { 
          gameId: true,
          slug: true,
          game: { select: { slug: true } }
        }
      });
      if (chapter) {
        finalGameId = chapter.gameId;
        chapterSlug = chapter.slug;
        gameSlug = chapter.game.slug;
      }
    } else if (gameId) {
      const game = await prisma.game.findUnique({
        where: { id: gameId },
        select: { slug: true }
      });
      if (game) gameSlug = game.slug;
    }

    // Check if review already exists
    const existingReview = await prisma.review.findFirst({
      where: {
        userId: session.user.id,
        gameId: finalGameId,
        chapterId: chapterId || null
      }
    });

    if (existingReview) {
      return NextResponse.json({ error: 'You have already reviewed this.' }, { status: 400 });
    }

    const review = await prisma.review.create({
      data: {
        rating,
        content,
        isSpoiler: isSpoiler || false,
        chapterId: chapterId || null,
        gameId: finalGameId,
        userId: session.user.id
      },
      include: {
        user: true,
        upvotes: true
      }
    });

    if (gameSlug) {
      // @ts-expect-error Next.js 15 canary revalidateTag typing issue
      revalidateTag(`game-${gameSlug}`);
    }
    if (gameSlug && chapterSlug) {
      // @ts-expect-error Next.js 15 canary revalidateTag typing issue
      revalidateTag(`chapter-${gameSlug}-${chapterSlug}`);
    }

    return NextResponse.json(review, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating review:', error);
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json({ error: 'You have already reviewed this.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
  }
}
