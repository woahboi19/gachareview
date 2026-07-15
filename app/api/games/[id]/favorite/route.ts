import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { auth } from '../../../../../auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const userId = session.user.id;

    // Check if game exists
    const game = await prisma.game.findUnique({ where: { id } });
    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    // Upsert favorite
    const favorite = await prisma.favoriteGame.create({
      data: {
        userId,
        gameId: id
      }
    });

    return NextResponse.json(favorite, { status: 201 });
  } catch (error: any) {
    // If it already exists, Prisma throws P2002 (Unique constraint failed)
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Already favorited' }, { status: 400 });
    }
    console.error('Error favoriting game:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const userId = session.user.id;

    await prisma.favoriteGame.deleteMany({
      where: {
        userId,
        gameId: id
      }
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error unfavoriting game:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
