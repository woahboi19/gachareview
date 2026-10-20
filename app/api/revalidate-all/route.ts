import { revalidatePath, revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

export async function GET() {
  revalidatePath('/', 'layout');
  // @ts-expect-error Next.js 15 canary
  revalidateTag('games');
  // @ts-expect-error Next.js 15 canary
  revalidateTag('genres');
  // @ts-expect-error Next.js 15 canary
  revalidateTag('chapters');
  // @ts-expect-error Next.js 15 canary
  revalidateTag('reviews');
  // @ts-expect-error Next.js 15 canary
  revalidateTag('users');
  // @ts-expect-error Next.js 15 canary
  revalidateTag('game-details');
  // @ts-expect-error Next.js 15 canary
  revalidateTag('chapter-details');
  
  return NextResponse.json({ revalidated: true, now: Date.now() });
}
