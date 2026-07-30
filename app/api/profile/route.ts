import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { auth } from '../../../auth';

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { name, image, bio, spoilerMode } = body;

    // Validate username if provided (Alphanumeric + CJK characters only)
    if (name) {
      const nameRegex = /^[\w\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af]+$/;
      if (!nameRegex.test(name)) {
        return NextResponse.json({ error: 'Username can only contain letters, numbers, and CJK characters.' }, { status: 400 });
      }
      if (name.length > 24) {
        return NextResponse.json({ error: 'Username is too long (max 24 characters).' }, { status: 400 });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(image && { image }),
        ...(bio !== undefined && { bio }),
        ...(spoilerMode !== undefined && { spoilerMode }),
      },
    });

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
