import { NextRequest, NextResponse } from 'next/server';
import translate from 'google-translate-api-x';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, targetLang } = body;

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // Default to 'tr' if not specified, but this will normally be sent by the client.
    const to = targetLang || 'tr';

    const res = await translate(text, { to }) as any;

    return NextResponse.json({ translatedText: res.text, from: res.from }, { status: 200 });
  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 });
  }
}
