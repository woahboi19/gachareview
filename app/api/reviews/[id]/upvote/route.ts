import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { prisma } from '../../../../../lib/prisma';
import { auth } from '../../../../../auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const userId = session.user.id;

    // Check if the review exists
    const review = await prisma.review.findUnique({
      where: { id },
      include: {
        chapter: {
          select: { slug: true, game: { select: { slug: true } } }
        }
      }
    });

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    // Check if the user already upvoted
    const existingUpvote = await prisma.upvote.findUnique({
      where: {
        userId_reviewId: {
          userId,
          reviewId: id
        }
      }
    });

    let action = '';

    if (existingUpvote) {
      // Toggle off: Delete upvote
      await prisma.upvote.delete({
        where: { id: existingUpvote.id }
      });
      action = 'removed';
    } else {
      // Toggle on: Create upvote
      await prisma.upvote.create({
        data: {
          userId,
          reviewId: id
        }
      });
      action = 'added';
    }

    if (review.chapter?.game?.slug) {
      revalidateTag(`game-${review.chapter.game.slug}`, {});
      revalidateTag(`chapter-${review.chapter.game.slug}-${review.chapter.slug}`, {});
    }

    return NextResponse.json({ action });

  } catch (error) {
    console.error('Error toggling upvote:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
