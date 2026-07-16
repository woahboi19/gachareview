import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { prisma } from '../../../../lib/prisma';
import { auth } from '../../../../auth';

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { rating, content, isSpoiler } = await request.json();

    const existingReview = await prisma.review.findUnique({
      where: { id: params.id }
    });

    if (!existingReview) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    if (existingReview.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updatedReview = await prisma.review.update({
      where: { id: params.id },
      data: {
        rating,
        content,
        isSpoiler: isSpoiler || false,
      },
      include: {
        user: true,
        upvotes: true
      }
    });
    if (existingReview.gameId) revalidateTag(`game-${existingReview.gameId}`);
    revalidateTag(`chapter-${existingReview.chapterId}`);

    return NextResponse.json(updatedReview, { status: 200 });
  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json({ error: 'Failed to update review' }, { status: 500 });
  }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existingReview = await prisma.review.findUnique({
      where: { id: params.id }
    });

    if (!existingReview) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    if (existingReview.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.review.delete({
      where: { id: params.id }
    });
    if (existingReview.gameId) revalidateTag(`game-${existingReview.gameId}`);
    revalidateTag(`chapter-${existingReview.chapterId}`);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 });
  }
}
