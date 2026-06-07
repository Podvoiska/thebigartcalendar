import { put } from '@vercel/blob';

// Buffer is Node-only, and @vercel/blob needs the Node runtime.
export const runtime = 'nodejs';

// Folders the uploader may write into (keeps the endpoint from being a generic dump).
const ALLOWED_FOLDERS = new Set(['events', 'blog', 'uploads']);

// Cap on the decoded file size. Note: on deployed Vercel, serverless functions
// also have a ~4.5 MB request-body limit, and base64 inflates payloads ~33%, so
// keep source images under ~3 MB. For larger files, switch to Blob client uploads.
const MAX_BYTES = 4 * 1024 * 1024;

type UploadBody = {
  data?: string; // base64, optionally a "data:<type>;base64,<...>" URL
  contentType?: string; // e.g. "image/png"
  filename?: string; // original name — used only for the slug/extension
  folder?: string; // "events" | "blog" | "uploads"
};

/**
 * POST /api/admin/upload
 *
 * Auth: `Authorization: Bearer <ADMIN_UPLOAD_TOKEN>`.
 * Body (JSON): { data, contentType?, filename?, folder? }
 * Returns: { url, pathname, contentType } — store `url` in e.g. events.image_url_override.
 */
export async function POST(request: Request) {
  const token = process.env.ADMIN_UPLOAD_TOKEN;
  if (!token) {
    return Response.json({ error: 'Server is missing ADMIN_UPLOAD_TOKEN' }, { status: 500 });
  }
  if (request.headers.get('authorization') !== `Bearer ${token}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: UploadBody;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.data) {
    return Response.json({ error: 'Missing "data" (base64-encoded file)' }, { status: 400 });
  }

  // Accept either raw base64 or a data: URL, deriving the content type from the latter.
  let base64 = body.data;
  let contentType = body.contentType;
  const dataUrl = base64.match(/^data:([^;]+);base64,([\s\S]*)$/);
  if (dataUrl) {
    contentType = contentType ?? dataUrl[1];
    base64 = dataUrl[2];
  }
  contentType = contentType ?? 'application/octet-stream';

  if (!contentType.startsWith('image/')) {
    return Response.json(
      { error: `Only image uploads are allowed (got "${contentType}")` },
      { status: 415 },
    );
  }

  const buffer = Buffer.from(base64, 'base64');
  if (buffer.byteLength === 0) {
    return Response.json({ error: 'Decoded file is empty — is "data" valid base64?' }, { status: 400 });
  }
  if (buffer.byteLength > MAX_BYTES) {
    return Response.json(
      { error: `File too large (${(buffer.byteLength / 1024 / 1024).toFixed(1)} MB, max ${MAX_BYTES / 1024 / 1024} MB)` },
      { status: 413 },
    );
  }

  const folder = ALLOWED_FOLDERS.has(body.folder ?? '') ? body.folder! : 'events';
  const ext = contentType.split('/')[1]?.split('+')[0] || 'bin';
  const stem =
    (body.filename?.replace(/\.[^.]+$/, '') ?? 'image')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'image';

  const blob = await put(`${folder}/${stem}.${ext}`, buffer, {
    access: 'public',
    contentType,
    addRandomSuffix: true,
  });

  return Response.json({ url: blob.url, pathname: blob.pathname, contentType });
}
