
import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

// Increase limit to allow larger 3D models and images
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Ensure uploads directory exists and is served statically
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// File Upload endpoint
app.post('/api/upload', (req, res) => {
  try {
    const { filename, fileType, base64 } = req.body;
    if (!filename || !base64) {
      return res.status(400).json({ error: 'Filename and base64 content are required.' });
    }

    // Sanitize filename to prevent directory traversal
    const safeName = filename.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const filePath = path.join(uploadsDir, safeName);
    
    // Decode base64 to buffer
    const fileBuffer = Buffer.from(base64, 'base64');
    fs.writeFileSync(filePath, fileBuffer);
    
    // Return relative url path
    res.json({ url: `/uploads/${safeName}` });
  } catch (error: any) {
    console.error('File upload failed:', error);
    res.status(500).json({ error: error.message || 'Internal server error during upload.' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
