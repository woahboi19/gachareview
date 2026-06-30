import { NextRequest, NextResponse } from 'next/server';
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
      where: { id }
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

    if (existingUpvote) {
      // Toggle off: Delete upvote
      await prisma.upvote.delete({
        where: { id: existingUpvote.id }
      });
      return NextResponse.json({ action: 'removed' });
    } else {
      // Toggle on: Create upvote
      await prisma.upvote.create({
        data: {
          userId,
          reviewId: id
        }
      });
      return NextResponse.json({ action: 'added' });
    }

  } catch (error) {
    console.error('Error toggling upvote:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
