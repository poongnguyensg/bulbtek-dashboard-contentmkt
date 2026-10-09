import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Đảm bảo thư mục server/uploads tồn tại
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Cấu hình lưu trữ tệp tin trên đĩa cứng
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Làm sạch tên file và thêm timestamp + random suffix để chống trùng lặp
    const ext = path.extname(file.originalname).toLowerCase();
    const safeBaseName = path.basename(file.originalname, ext)
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '-');
    const uniqueName = `bulbtek-${Date.now()}-${Math.round(Math.random() * 1e6)}${ext || '.jpg'}`;
    cb(null, uniqueName);
  }
});

// Giới hạn loại tệp ảnh hợp lệ và kích thước (tối đa 15MB)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận tệp hình ảnh định dạng JPG, PNG, WEBP, GIF, SVG!'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
  fileFilter
});

// POST /api/upload - Nhận tệp hình ảnh và trả về URL tĩnh phục vụ
router.post('/', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Không tìm thấy tệp ảnh tải lên trong yêu cầu.' });
  }

  // Đường dẫn tương đối phục vụ qua endpoint tĩnh /uploads/...
  const fileUrl = `/uploads/${req.file.filename}`;
  
  return res.json({
    success: true,
    message: 'Tải ảnh lên máy chủ thành công!',
    url: fileUrl,
    filename: req.file.filename,
    size: req.file.size,
    mimetype: req.file.mimetype
  });
});

export default router;
