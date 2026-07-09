
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets from public/qhom (3D models and images).
// 3D dish models (.glb) can be up to ~100MB, so this is tuned so large
// files stream smoothly instead of loading as one giant blocking response:
//  - Range requests (byte-range) are enabled so the browser/model-viewer can
//    fetch the file in chunks and report incremental progress instead of
//    stalling until the whole 100MB is in memory.
//  - Aggressive immutable caching means a dish's model is only downloaded
//    once per browser; reopening the same dish later is instant.
app.use('/qhom', express.static(path.join(process.cwd(), 'public', 'qhom'), {
  acceptRanges: true,
  maxAge: '365d',
  immutable: true,
  etag: true,
  lastModified: true,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.glb') || filePath.endsWith('.gltf')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      res.setHeader('Accept-Ranges', 'bytes');
    }
  },
}));

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
      if (ext || req.path.startsWith('/qhom/')) {
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
