import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { uploadBlogImage } from '@/lib/blogDb';
import { logError } from '@/lib/logger';

export const runtime = 'nodejs';

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_SIZE = 5 * 1024 * 1024;

export async function POST(request) {
  const auth = requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  let formData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Ungültige Anfrage' }, { status: 400 });
  }

  const file = formData.get('file');
  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: 'Keine Datei' }, { status: 400 });
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: 'Ungültiger Dateityp (jpeg/png/webp)' }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'Datei zu groß (max 5MB)' }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = file.name || 'image';
    const result = await uploadBlogImage(
      new Blob([buffer], { type: file.type }),
      fileName
    );
    console.info('[blog-upload] success', { path: result.path });
    return NextResponse.json({ success: true, url: result.url });
  } catch (err) {
    logError(err, { route: 'blog-upload' });
    return NextResponse.json({ error: 'Upload fehlgeschlagen' }, { status: 500 });
  }
}
