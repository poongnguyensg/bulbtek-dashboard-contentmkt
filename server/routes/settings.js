import express from 'express';
import { query } from '../db.js';

const router = express.Router();

// GET /api/settings
router.get('/', async (req, res) => {
  try {
    const result = await query("SELECT data FROM system_settings WHERE id = 'default'");
    if (result.rows.length === 0) {
      return res.json(null);
    }
    const data = typeof result.rows[0].data === 'string'
      ? JSON.parse(result.rows[0].data)
      : result.rows[0].data;
    res.json(data);
  } catch (err) {
    console.error('Lỗi GET /api/settings:', err.message);
    res.status(500).json({ error: 'Không thể tải cài đặt hệ thống từ PostgreSQL.' });
  }
});

// PUT /api/settings
router.put('/', async (req, res) => {
  const settingsData = req.body;
  if (!settingsData) {
    return res.status(400).json({ error: 'Dữ liệu cài đặt không hợp lệ.' });
  }

  try {
    const sql = `
      INSERT INTO system_settings (id, data, updated_at)
      VALUES ('default', $1, NOW())
      ON CONFLICT (id) DO UPDATE SET
        data = EXCLUDED.data,
        updated_at = NOW()
      RETURNING data;
    `;
    const result = await query(sql, [JSON.stringify(settingsData)]);
    const saved = typeof result.rows[0].data === 'string'
      ? JSON.parse(result.rows[0].data)
      : result.rows[0].data;
    res.json(saved);
  } catch (err) {
    console.error('Lỗi PUT /api/settings:', err.message);
    res.status(500).json({ error: 'Không thể cập nhật cài đặt hệ thống vào PostgreSQL.' });
  }
});

export default router;
