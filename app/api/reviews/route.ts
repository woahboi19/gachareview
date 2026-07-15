import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { auth } from '../../../auth';

export async function POST(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { chapterId, rating, content, isSpoiler } = await request.json();

    if (!chapterId || !rating || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get gameId from chapter to link the review properly
    const chapter = await prisma.storyChapter.findUnique({
      where: { id: chapterId },
      select: { gameId: true }
    });

    const review = await prisma.review.create({
      data: {
        rating,
        content,
        isSpoiler: isSpoiler || false,
        chapterId,
        gameId: chapter?.gameId,
        userId: session.user.id
      },
      include: {
        user: true,
        upvotes: true
      }
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error: any) {
    console.error('Error creating review:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'You have already reviewed this chapter.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
  }
}
