import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { auth } from '../../../../auth';

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { gameId, title, chapterNum, summary, imageUrl, category, isMain, createdAt, shortCode } = body;

    if (!gameId || !title || !chapterNum || !summary) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const game = await prisma.game.findUnique({ where: { id: gameId } });
    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    let slug = shortCode ? slugify(shortCode) : Math.random().toString(36).substring(2, 7);
    
    // Check if chapter short code is already taken in this game
    const existing = await prisma.storyChapter.findUnique({ 
      where: { 
        gameId_slug: { gameId, slug } 
      } 
    });
    
    if (existing) {
      if (shortCode) {
         return NextResponse.json({ error: 'This short code is already used for this game.' }, { status: 400 });
      } else {
         slug = `${slug}${Math.random().toString(36).substring(2, 4)}`;
      }
    }

    const chapterData: any = {
      gameId,
      slug,
      title,
      chapterNum: parseInt(chapterNum),
      summary,
      imageUrl: imageUrl || null,
      category: category || 'Main Story',
      isMain: isMain || false,
    };

    if (createdAt) {
      chapterData.createdAt = new Date(createdAt);
    }

    const chapter = await prisma.storyChapter.create({
      data: chapterData,
      include: {
        game: true
      }
    });

    return NextResponse.json(chapter, { status: 201 });
  } catch (error) {
    console.error('Error creating chapter:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
