import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { prisma } from '../../../../../lib/prisma';
import { auth } from '../../../../../auth';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: gameId } = await params;
    const { status } = await request.json();

    // Validate status
    const validStatuses = ['PLAYING', 'COMPLETED', 'DROPPED', 'FAVORITE', 'NONE'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const game = await prisma.game.findUnique({
      where: { id: gameId }
    });

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    if (status === 'NONE') {
      await prisma.userGameStatus.deleteMany({
        where: {
          userId: session.user.id,
          gameId: gameId
        }
      });
    } else {
      await prisma.userGameStatus.upsert({
        where: {
          userId_gameId: {
            userId: session.user.id,
            gameId: gameId
          }
        },
        update: {
          status: status
        },
        create: {
          userId: session.user.id,
          gameId: gameId,
          status: status
        }
      });
    }

    // @ts-expect-error Next.js 15 canary
    revalidateTag(`game-${game.slug}`);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating game status:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
