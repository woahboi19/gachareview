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
    const { title, description, developer, imageUrl, isEditorsPick, genreNames } = body;

    if (!title || !description || !developer) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let slug = slugify(title);
    
    const reservedSlugs = ['login', 'admin', 'api', 'profile', 'game', 'search'];
    if (reservedSlugs.includes(slug)) {
      slug = `${slug}-game`;
    }
    
    // Simple check to avoid duplicates in case of same title
    const existing = await prisma.game.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Math.random().toString(36).substring(2, 6)}`;
    }

    const genreList = typeof genreNames === 'string' ? genreNames.split(',').map((s: string) => s.trim()).filter(Boolean) : [];
    const connectOrCreateGenres = genreList.map((name: string) => ({
      where: { name },
      create: { name, slug: slugify(name) }
    }));

    const game = await prisma.game.create({
      data: {
        title,
        slug,
        description,
        developer,
        imageUrl: imageUrl || null,
        isEditorsPick: !!isEditorsPick,
        genres: {
          connectOrCreate: connectOrCreateGenres
        }
      }
    });

    return NextResponse.json(game, { status: 201 });
  } catch (error) {
    console.error('Error creating game:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
