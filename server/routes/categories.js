import express from 'express';
import { query } from '../db.js';

const router = express.Router();

const mapCategoryFromDb = (row) => ({
  id: row.id,
  name: row.name,
  tone: row.tone,
  color: row.color,
  exampleAngle: row.example_angle,
  icon: row.icon
});

// GET /api/categories
router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM categories ORDER BY created_at ASC');
    res.json(result.rows.map(mapCategoryFromDb));
  } catch (err) {
    console.error('Lỗi GET /api/categories:', err.message);
    res.status(500).json({ error: 'Không thể tải danh mục content từ PostgreSQL.' });
  }
});

// POST /api/categories
router.post('/', async (req, res) => {
  const c = req.body;
  if (!c || !c.name) {
    return res.status(400).json({ error: 'Tên danh mục là bắt buộc.' });
  }

  const id = c.id || `cat-${Date.now()}`;
  try {
    const sql = `
      INSERT INTO categories (id, name, tone, color, example_angle, icon)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        tone = EXCLUDED.tone,
        color = EXCLUDED.color,
        example_angle = EXCLUDED.example_angle,
        icon = EXCLUDED.icon
      RETURNING *;
    `;
    const result = await query(sql, [
      id,
      c.name,
      c.tone || '',
      c.color || '#AF2024',
      c.exampleAngle || c.example_angle || '',
      c.icon || 'Zap'
    ]);
    res.json(mapCategoryFromDb(result.rows[0]));
  } catch (err) {
    console.error('Lỗi POST /api/categories:', err.message);
    res.status(500).json({ error: 'Không thể lưu danh mục vào PostgreSQL.' });
  }
});

export default router;
