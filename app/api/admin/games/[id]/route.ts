import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { auth } from '../../../../../auth';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    await prisma.game.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting game:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { title, description, developer, imageUrl, isEditorsPick, genreNames } = body;

    if (!title || !description || !developer) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    function slugify(text: string) {
      return text.toString().toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-');
    }

    const genreList = typeof genreNames === 'string' ? genreNames.split(',').map((s: string) => s.trim()).filter(Boolean) : [];
    const connectOrCreateGenres = genreList.map((name: string) => ({
      where: { name },
      create: { name, slug: slugify(name) }
    }));

    const game = await prisma.game.update({
      where: { id },
      data: {
        title,
        description,
        developer,
        imageUrl: imageUrl || null,
        isEditorsPick: !!isEditorsPick,
        genres: {
          set: [],
          connectOrCreate: connectOrCreateGenres
        }
      }
    });

    return NextResponse.json(game);
  } catch (error) {
    console.error('Error updating game:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
