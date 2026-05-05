import { NextResponse } from 'next/server';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { put } from '@vercel/blob';

function safeUploadFilename(originalName: string) {
  const cleaned = originalName.replaceAll(' ', '_').replace(/[^a-zA-Z0-9._-]/g, '');
  const base = cleaned.length > 0 ? cleaned : 'upload.bin';
  return `${Date.now()}-${base}`;
}

export async function POST(request: Request) {
  const data = await request.formData();
  const file: File | null = data.get('file') as unknown as File;

  if (!file) {
    return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const filename = safeUploadFilename(file.name);

  /** Vercel (preview + production): filesystem under the app is read-only; use Blob when configured. */
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const pathname = `uploads/${filename}`;
      const blob = await put(pathname, buffer, {
        access: 'public',
        contentType: file.type || undefined,
        addRandomSuffix: false,
      });
      return NextResponse.json({ success: true, url: blob.url });
    } catch (error) {
      console.error('[api/upload] Vercel Blob put failed', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Upload to storage failed',
          details: error instanceof Error ? error.message : String(error),
        },
        { status: 500 },
      );
    }
  }

  if (process.env.VERCEL) {
    return NextResponse.json(
      {
        success: false,
        error:
          'Vercel preview needs Blob: Dashboard → this project → Storage → Blob → create a store (adds BLOB_READ_WRITE_TOKEN for Preview + Production).',
      },
      { status: 503 },
    );
  }

  try {
    const uploadDir = join(process.cwd(), 'public/uploads');
    await mkdir(uploadDir, { recursive: true });
    const path = join(uploadDir, filename);
    await writeFile(path, buffer);
    return NextResponse.json({ success: true, url: `/uploads/${filename}` });
  } catch (error) {
    console.error('[api/upload] local writeFile failed', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to save file locally',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
