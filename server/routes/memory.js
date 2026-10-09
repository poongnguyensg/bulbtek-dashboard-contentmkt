import express from 'express';
import { query } from '../db.js';

const router = express.Router();

const mapMemoryFromDb = (row) => ({
  id: row.id,
  productId: row.product_id,
  productName: row.product_name,
  categoryId: row.category_id,
  categoryName: row.category_name,
  channel: row.channel,
  date: row.date,
  angleUsed: row.angle_used,
  hookFb: row.hook_fb,
  hookTiktok: row.hook_tiktok,
  variationIndex: row.variation_index,
  facebookCaption: row.facebook_caption,
  tiktokCaption: row.tiktok_caption,
  createdAt: row.created_at
});

// GET /api/memory
router.get('/', async (req, res) => {
  const { productId } = req.query;
  try {
    let result;
    if (productId) {
      result = await query(
        'SELECT * FROM content_memory WHERE product_id = $1 ORDER BY created_at DESC',
        [productId]
      );
    } else {
      result = await query('SELECT * FROM content_memory ORDER BY created_at DESC LIMIT 500');
    }
    res.json(result.rows.map(mapMemoryFromDb));
  } catch (err) {
    console.error('Lỗi GET /api/memory:', err.message);
    res.status(500).json({ error: 'Không thể truy vấn bộ nhớ góc viết content.' });
  }
});

// POST /api/memory
router.post('/', async (req, res) => {
  const entry = req.body;
  const id = entry.id || `mem-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  const now = new Date().toISOString();

  try {
    const sql = `
      INSERT INTO content_memory (
        id, product_id, product_name, category_id, category_name, channel,
        date, angle_used, hook_fb, hook_tiktok, variation_index,
        facebook_caption, tiktok_caption, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *;
    `;
    const values = [
      id,
      entry.productId || '',
      entry.productName || '',
      entry.categoryId || '',
      entry.categoryName || '',
      entry.channel || 'Facebook',
      entry.date || now.slice(0, 10),
      entry.angleUsed || '',
      entry.hookFb || '',
      entry.hookTiktok || '',
      entry.variationIndex || 1,
      entry.facebookCaption || '',
      entry.tiktokCaption || '',
      now
    ];
    const result = await query(sql, values);
    res.json(mapMemoryFromDb(result.rows[0]));
  } catch (err) {
    console.error('Lỗi POST /api/memory:', err.message);
    res.status(500).json({ error: 'Lỗi lưu lịch sử bộ nhớ góc tiếp cận.' });
  }
});

// DELETE /api/memory
router.delete('/', async (req, res) => {
  const { productId } = req.query;
  try {
    if (productId) {
      await query('DELETE FROM content_memory WHERE product_id = $1', [productId]);
    } else {
      await query('DELETE FROM content_memory');
    }
    res.json({ success: true, message: 'Đã xóa bộ nhớ góc viết thành công.' });
  } catch (err) {
    console.error('Lỗi DELETE /api/memory:', err.message);
    res.status(500).json({ error: 'Lỗi xóa bộ nhớ.' });
  }
});

export default router;
