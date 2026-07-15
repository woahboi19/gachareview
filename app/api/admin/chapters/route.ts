import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { auth } from '../../../../auth';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { gameId, title, chapterNum, summary, imageUrl, category, isMain, createdAt } = body;

    if (!gameId || !title || !chapterNum || !summary) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const chapterData: any = {
      gameId,
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
