import express from 'express';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, 'dist');
const distIndexPath = path.resolve(distDir, 'index.html');
const isProd =
  process.env.NODE_ENV === 'production' ||
  (process.env.NODE_ENV !== 'development' && fs.existsSync(distIndexPath));
const PORT = Number(process.env.PORT) || 3000;

const app = express();
app.use('/api', (req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Vary', 'Origin');
    res.header('Access-Control-Allow-Credentials', 'true');
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});
app.use(express.json({ limit: '10mb' }));
app.use((err: any, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err && err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'รูปแบบข้อมูลคำขอไม่ถูกต้อง (Invalid JSON)', status: 'error' });
  }
  next(err);
});

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    mode: isProd ? 'production' : 'development',
    time: new Date().toISOString(),
  });
});

// Admin passcode verification endpoint
app.post('/api/auth/verify-admin', (req, res) => {
  const raw = typeof req.body?.password === 'string' ? req.body.password : '';
  const thaiDigits = '๐๑๒๓๔๕๖๗๘๙';
  const submitted = raw
    .trim()
    .replace(/[๐-๙]/g, (d: string) => String(thaiDigits.indexOf(d)));
  const expected = (process.env.ADMIN_PASSCODE || '501107').trim();

  if (!submitted) {
    return res.status(400).json({ ok: false, error: 'กรุณากรอกรหัสผ่านผู้ดูแลระบบ' });
  }

  const submittedBuf = Buffer.from(submitted, 'utf8');
  const expectedBuf = Buffer.from(expected, 'utf8');
  const isMatch =
    submittedBuf.length === expectedBuf.length &&
    crypto.timingSafeEqual(submittedBuf, expectedBuf);

  if (!isMatch) {
    return res.status(401).json({ ok: false, error: 'รหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่อีกครั้ง' });
  }

  return res.json({ ok: true });
});

// Return clean JSON 404 for unknown API paths instead of SPA HTML
app.all('/api/*', (_req, res) => {
  res.status(404).json({ error: 'ไม่พบบริการ API ที่ร้องขอ', status: 'error' });
});

// Setup Vite or static serving
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(distIndexPath);
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(
      `Village Management Server listening on http://0.0.0.0:${PORT} (${isProd ? 'production' : 'development'})`
    );
  });
}

startServer();
