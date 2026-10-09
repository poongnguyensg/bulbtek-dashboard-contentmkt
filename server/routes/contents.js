import express from 'express';
import { query } from '../db.js';

const router = express.Router();

const mapContentFromDb = (row) => ({
  id: row.id,
  title: row.title,
  creativeHeadline: row.creative_headline,
  channel: row.channel,
  date: row.date,
  productId: row.product_id,
  productName: row.product_name,
  productLine: row.product_line,
  categoryId: row.category_id,
  status: row.status,
  assigneeId: row.assignee_id,
  assigneeName: row.assignee_name,
  facebookCaption: row.facebook_caption,
  tiktokCaption: row.tiktok_caption,
  highlightSpecs: typeof row.highlight_specs === 'string' ? JSON.parse(row.highlight_specs) : (row.highlight_specs || []),
  angleUsed: row.angle_used,
  aiModelUsed: row.ai_model_used,
  createdBy: row.created_by,
  createdAt: row.created_at,
  rejectionReasons: typeof row.rejection_reasons === 'string' ? JSON.parse(row.rejection_reasons) : (row.rejection_reasons || []),
  rejectionComment: row.rejection_comment,
  rejectedAt: row.rejected_at,
  rejectedBy: row.rejected_by,
  approvedAt: row.approved_at,
  approvedBy: row.approved_by,
  publishedAt: row.published_at,
  publishedUrl: row.published_url
});

// GET /api/contents
router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM contents ORDER BY date ASC, created_at DESC');
    res.json(result.rows.map(mapContentFromDb));
  } catch (err) {
    console.error('Lỗi GET /api/contents:', err.message);
    res.status(500).json({ error: 'Không thể truy vấn danh sách bài viết content từ PostgreSQL.' });
  }
});

// POST /api/contents - Upsert 1 bài viết
router.post('/', async (req, res) => {
  const item = req.body;
  if (!item || !item.title) {
    return res.status(400).json({ error: 'Tiêu đề bài viết là bắt buộc.' });
  }

  const id = item.id || `content-${Date.now()}`;
  const now = new Date().toISOString();

  try {
    const sql = `
      INSERT INTO contents (
        id, title, creative_headline, channel, date, product_id, product_name,
        product_line, category_id, status, assignee_id, assignee_name,
        facebook_caption, tiktok_caption, highlight_specs, angle_used,
        ai_model_used, created_by, created_at, rejection_reasons,
        rejection_comment, rejected_at, rejected_by, approved_at,
        approved_by, published_at, published_url
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
        $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27
      )
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        creative_headline = EXCLUDED.creative_headline,
        channel = EXCLUDED.channel,
        date = EXCLUDED.date,
        product_id = EXCLUDED.product_id,
        product_name = EXCLUDED.product_name,
        product_line = EXCLUDED.product_line,
        category_id = EXCLUDED.category_id,
        status = EXCLUDED.status,
        assignee_id = EXCLUDED.assignee_id,
        assignee_name = EXCLUDED.assignee_name,
        facebook_caption = EXCLUDED.facebook_caption,
        tiktok_caption = EXCLUDED.tiktok_caption,
        highlight_specs = EXCLUDED.highlight_specs,
        angle_used = EXCLUDED.angle_used,
        ai_model_used = EXCLUDED.ai_model_used,
        rejection_reasons = EXCLUDED.rejection_reasons,
        rejection_comment = EXCLUDED.rejection_comment,
        rejected_at = EXCLUDED.rejected_at,
        rejected_by = EXCLUDED.rejected_by,
        approved_at = EXCLUDED.approved_at,
        approved_by = EXCLUDED.approved_by,
        published_at = EXCLUDED.published_at,
        published_url = EXCLUDED.published_url
      RETURNING *;
    `;

    const values = [
      id,
      item.title,
      item.creativeHeadline || '',
      item.channel || 'Facebook',
      item.date || now.slice(0, 10),
      item.productId || '',
      item.productName || '',
      item.productLine || 'Bi LED',
      item.categoryId || 'cat-product',
      item.status || 'Draft',
      item.assigneeId || 'user-linh',
      item.assigneeName || 'Linh',
      item.facebookCaption || '',
      item.tiktokCaption || '',
      JSON.stringify(item.highlightSpecs || []),
      item.angleUsed || '',
      item.aiModelUsed || 'Claude 3.7 Sonnet',
      item.createdBy || 'Linh',
      item.createdAt || now,
      JSON.stringify(item.rejectionReasons || []),
      item.rejectionComment || '',
      item.rejectedAt || null,
      item.rejectedBy || '',
      item.approvedAt || null,
      item.approvedBy || '',
      item.publishedAt || null,
      item.publishedUrl || ''
    ];

    const result = await query(sql, values);
    res.json(mapContentFromDb(result.rows[0]));
  } catch (err) {
    console.error('Lỗi POST /api/contents:', err.message);
    res.status(500).json({ error: 'Không thể lưu bài viết content vào PostgreSQL.' });
  }
});

// DELETE /api/contents/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await query('DELETE FROM contents WHERE id = $1 RETURNING id', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Không tìm thấy bài viết cần xóa.' });
    }
    res.json({ success: true, message: `Đã xóa bài viết ${id}.` });
  } catch (err) {
    console.error(`Lỗi DELETE /api/contents/${id}:`, err.message);
    res.status(500).json({ error: 'Lỗi khi xóa bài viết từ PostgreSQL.' });
  }
});

// POST /api/contents/bulk - Nhập hoặc lưu hàng loạt bài viết
router.post('/bulk', async (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Danh sách bài viết không hợp lệ.' });
  }

  try {
    for (const item of items) {
      const id = item.id || `content-${Date.now()}-${Math.round(Math.random() * 1000)}`;
      const now = new Date().toISOString();

      const sql = `
        INSERT INTO contents (
          id, title, creative_headline, channel, date, product_id, product_name,
          product_line, category_id, status, assignee_id, assignee_name,
          facebook_caption, tiktok_caption, highlight_specs, angle_used,
          ai_model_used, created_by, created_at, rejection_reasons,
          rejection_comment, rejected_at, rejected_by, approved_at,
          approved_by, published_at, published_url
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
          $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27
        )
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          creative_headline = EXCLUDED.creative_headline,
          channel = EXCLUDED.channel,
          date = EXCLUDED.date,
          product_id = EXCLUDED.product_id,
          product_name = EXCLUDED.product_name,
          product_line = EXCLUDED.product_line,
          category_id = EXCLUDED.category_id,
          status = EXCLUDED.status,
          assignee_id = EXCLUDED.assignee_id,
          assignee_name = EXCLUDED.assignee_name,
          facebook_caption = EXCLUDED.facebook_caption,
          tiktok_caption = EXCLUDED.tiktok_caption,
          highlight_specs = EXCLUDED.highlight_specs,
          angle_used = EXCLUDED.angle_used,
          ai_model_used = EXCLUDED.ai_model_used;
      `;

      await query(sql, [
        id,
        item.title,
        item.creativeHeadline || '',
        item.channel || 'Facebook',
        item.date || now.slice(0, 10),
        item.productId || '',
        item.productName || '',
        item.productLine || 'Bi LED',
        item.categoryId || 'cat-product',
        item.status || 'Draft',
        item.assigneeId || 'user-linh',
        item.assigneeName || 'Linh',
        item.facebookCaption || '',
        item.tiktokCaption || '',
        JSON.stringify(item.highlightSpecs || []),
        item.angleUsed || '',
        item.aiModelUsed || 'Claude 3.7 Sonnet',
        item.createdBy || 'Linh',
        item.createdAt || now,
        JSON.stringify(item.rejectionReasons || []),
        item.rejectionComment || '',
        item.rejectedAt || null,
        item.rejectedBy || '',
        item.approvedAt || null,
        item.approvedBy || '',
        item.publishedAt || null,
        item.publishedUrl || ''
      ]);
    }

    res.json({ success: true, count: items.length });
  } catch (err) {
    console.error('Lỗi POST /api/contents/bulk:', err.message);
    res.status(500).json({ error: 'Lỗi khi lưu danh sách bài viết vào PostgreSQL.' });
  }
});

export default router;
