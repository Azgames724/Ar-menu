
import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 5000;

// Keep a generous body limit for large 3D model uploads; per-file size is
// enforced explicitly in the upload handler below.
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ---------------------------------------------------------------------------
// Firebase auth helpers
// ---------------------------------------------------------------------------

const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY;
const ADMIN_EMAIL = 'abeniship13@gmail.com';

/**
 * Verify a Firebase ID token via the Firebase Auth REST API and return the
 * user's email and uid, or null if the token is invalid.
 */
async function verifyFirebaseToken(
  idToken: string,
): Promise<{ uid: string; email: string; emailVerified: boolean } | null> {
  if (!FIREBASE_API_KEY) {
    console.error('FIREBASE_API_KEY is not set — cannot verify tokens');
    return null;
  }
  try {
    const resp = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      },
    );
    if (!resp.ok) return null;
    const data = await resp.json() as any;
    const u = data?.users?.[0];
    if (!u) return null;
    return { uid: u.localId, email: u.email ?? '', emailVerified: u.emailVerified ?? false };
  } catch {
    return null;
  }
}

/**
 * Express middleware that requires a valid Firebase ID token in the
 * Authorization: Bearer <token> header and attaches the decoded user to
 * res.locals.firebaseUser.  Only the owner email is considered admin.
 */
async function requireAdmin(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) {
  const authHeader = req.headers.authorization ?? '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    res.status(401).json({ error: 'Missing authorization token.' });
    return;
  }

  const user = await verifyFirebaseToken(token);
  if (!user) {
    res.status(401).json({ error: 'Invalid or expired token.' });
    return;
  }
  if (!user.emailVerified || user.email !== ADMIN_EMAIL) {
    res.status(403).json({ error: 'Admin access required.' });
    return;
  }

  res.locals.firebaseUser = user;
  next();
}

// ---------------------------------------------------------------------------
// Upload configuration
// ---------------------------------------------------------------------------

const ALLOWED_EXTENSIONS = new Set(['.glb', '.gltf', '.png', '.jpg', '.jpeg', '.webp']);
const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.webp']);
const MODEL_EXTS = new Set(['.glb', '.gltf']);
// Decoded byte limits (base64 is ~4/3 the raw size)
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;  // 10 MB
const MAX_MODEL_BYTES = 25 * 1024 * 1024;  // 25 MB

// ---------------------------------------------------------------------------
// Static files
// ---------------------------------------------------------------------------

const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// ---------------------------------------------------------------------------
// API routes
// ---------------------------------------------------------------------------

// File List — admin only
app.get('/api/list-files', requireAdmin, (req, res) => {
  try {
    if (!fs.existsSync(uploadsDir)) {
      return res.json({ models: [], images: [] });
    }

    const files = fs.readdirSync(uploadsDir);
    const models: Array<{ name: string; url: string }> = [];
    const images: Array<{ name: string; url: string }> = [];

    files.forEach(file => {
      const ext = path.extname(file).toLowerCase();
      const item = { name: file, url: `/uploads/${file}` };
      if (MODEL_EXTS.has(ext)) {
        models.push(item);
      } else if (IMAGE_EXTS.has(ext)) {
        images.push(item);
      }
    });

    res.json({ models, images });
  } catch (error: any) {
    console.error('Failed to list files:', error);
    res.status(500).json({ error: error.message || 'Error listing folder files' });
  }
});

// File Upload — admin only, whitelisted extensions, per-type size limits
app.post('/api/upload', requireAdmin, (req, res) => {
  try {
    const { filename, base64 } = req.body;
    if (!filename || !base64) {
      return res.status(400).json({ error: 'Filename and base64 content are required.' });
    }

    // Sanitize filename
    const safeName = (filename as string).replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const ext = path.extname(safeName).toLowerCase();

    // Extension whitelist
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return res.status(400).json({ error: `File type '${ext}' is not allowed.` });
    }

    // Decode and enforce size limit
    const fileBuffer = Buffer.from(base64 as string, 'base64');
    const limit = IMAGE_EXTS.has(ext) ? MAX_IMAGE_BYTES : MAX_MODEL_BYTES;
    if (fileBuffer.byteLength > limit) {
      const mb = Math.round(limit / 1024 / 1024);
      return res.status(400).json({ error: `File exceeds the ${mb} MB size limit.` });
    }

    const filePath = path.join(uploadsDir, safeName);
    fs.writeFileSync(filePath, fileBuffer);

    res.json({ url: `/uploads/${safeName}` });
  } catch (error: any) {
    console.error('File upload failed:', error);
    res.status(500).json({ error: error.message || 'Internal server error during upload.' });
  }
});

// ---------------------------------------------------------------------------
// Vite / static frontend
// ---------------------------------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      const ext = path.extname(req.path);
      if (
        ext ||
        req.path.startsWith('/api/') ||
        req.path.startsWith('/qhom/') ||
        req.path.startsWith('/uploads/')
      ) {
        res.status(404).send('Not Found');
      } else {
        res.sendFile(path.join(distPath, 'index.html'));
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
