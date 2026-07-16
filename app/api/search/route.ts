import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const q = searchParams.get('q');

  if (!q || q.trim() === '') {
    return NextResponse.json({ games: [], chapters: [] });
  }

  const query = q.trim();

  try {
    const games = await prisma.game.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { developer: { contains: query, mode: 'insensitive' } }
        ]
      },
      take: 5
    });

    const chapters = await prisma.storyChapter.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { summary: { contains: query, mode: 'insensitive' } }
        ]
      },
      include: {
        game: { select: { title: true } }
      },
      take: 5
    });

    return NextResponse.json({ games, chapters });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Failed to search' }, { status: 500 });
  }
}
