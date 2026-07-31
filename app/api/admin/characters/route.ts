import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { auth } from '../../../../auth';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { gameId, name, lore, imageUrl, voiceActorEN, voiceActorJP } = await req.json();

    if (!gameId || !name || !lore) {
      return NextResponse.json({ error: 'Game ID, name, and lore are required.' }, { status: 400 });
    }

    const character = await prisma.character.create({
      data: {
        gameId,
        name,
        lore,
        imageUrl,
        voiceActorEN,
        voiceActorJP,
      },
    });

    return NextResponse.json(character, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating character:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
