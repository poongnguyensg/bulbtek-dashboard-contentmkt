import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import { initDb, getDbStatus } from './db.js';
import { seedDatabaseIfEmpty } from './seedData.js';

import uploadRoutes from './routes/upload.js';
import productsRoutes from './routes/products.js';
import categoriesRoutes from './routes/categories.js';
import contentsRoutes from './routes/contents.js';
import teamRoutes from './routes/team.js';
import settingsRoutes from './routes/settings.js';
import memoryRoutes from './routes/memory.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Tải biến môi trường
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware cơ bản
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 1. Phục vụ tĩnh thư mục uploads cho ảnh sản phẩm
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// 2. Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    postgresConnected: getDbStatus(),
    storageDir: uploadsDir
  });
});

// 3. Mount các routes API
app.use('/api/upload', uploadRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/contents', contentsRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/memory', memoryRoutes);

// 4. Phục vụ Frontend Build (trong môi trường Production)
const distDir = path.join(__dirname, '../dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));

  // SPA fallback cho Express 5
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
      return res.sendFile(path.join(distDir, 'index.html'));
    }
    next();
  });
}

// Khởi chạy server và kết nối CSDL
app.listen(PORT, async () => {
  console.log(`====================================================`);
  console.log(`🚀 Bulbtek Content API Server đang chạy tại PORT: ${PORT}`);
  console.log(`📁 Thư mục uploads vật lý: ${uploadsDir}`);
  console.log(`====================================================`);

  const dbReady = await initDb();
  if (dbReady) {
    await seedDatabaseIfEmpty();
  } else {
    console.warn('[Server] ⚠️ Đang hoạt động ở chế độ chờ PostgreSQL (vui lòng cấu hình DATABASE_URL nếu chưa có).');
  }
});
