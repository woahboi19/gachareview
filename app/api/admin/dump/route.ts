import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function GET() {
  try {
    const chapters = await prisma.storyChapter.findMany({
      select: { title: true, imageUrl: true, game: { select: { title: true, imageUrl: true } } }
    });
    return NextResponse.json(chapters);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
