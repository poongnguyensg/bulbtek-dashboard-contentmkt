import express from 'express';
import { query } from '../db.js';

const router = express.Router();

// Helper chuẩn hóa dữ liệu từ DB snake_case sang camelCase cho Frontend
const mapProductFromDb = (row) => ({
  id: row.id,
  name: row.name,
  productLine: row.product_line,
  sku: row.sku,
  status: row.status,
  retailPrice: row.retail_price,
  suitableFor: row.suitable_for,
  targetAudience: row.target_audience,
  segment: row.segment,
  specs: typeof row.specs === 'string' ? JSON.parse(row.specs) : (row.specs || {}),
  coreBenefit: row.core_benefit,
  stage: row.stage,
  internalNotes: row.internal_notes,
  imageUrl: row.image_url,
  isHidden: row.is_hidden,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

// GET /api/products - Lấy danh sách toàn bộ sản phẩm
router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM products ORDER BY created_at DESC');
    const products = result.rows.map(mapProductFromDb);
    res.json(products);
  } catch (err) {
    console.error('Lỗi GET /api/products:', err.message);
    res.status(500).json({ error: 'Không thể truy vấn danh sách sản phẩm từ cơ sở dữ liệu.' });
  }
});

// POST /api/products - Tạo mới hoặc Cập nhật sản phẩm (Upsert)
router.post('/', async (req, res) => {
  const p = req.body;
  if (!p || !p.name) {
    return res.status(400).json({ error: 'Tên sản phẩm là bắt buộc.' });
  }

  const id = p.id || `prod-${Date.now()}`;
  const now = new Date().toISOString();

  try {
    const sql = `
      INSERT INTO products (
        id, name, product_line, sku, status, retail_price, suitable_for,
        target_audience, segment, specs, core_benefit, stage, internal_notes,
        image_url, is_hidden, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        product_line = EXCLUDED.product_line,
        sku = EXCLUDED.sku,
        status = EXCLUDED.status,
        retail_price = EXCLUDED.retail_price,
        suitable_for = EXCLUDED.suitable_for,
        target_audience = EXCLUDED.target_audience,
        segment = EXCLUDED.segment,
        specs = EXCLUDED.specs,
        core_benefit = EXCLUDED.core_benefit,
        stage = EXCLUDED.stage,
        internal_notes = EXCLUDED.internal_notes,
        image_url = EXCLUDED.image_url,
        is_hidden = EXCLUDED.is_hidden,
        updated_at = EXCLUDED.updated_at
      RETURNING *;
    `;

    const values = [
      id,
      p.name,
      p.productLine || 'Bi LED',
      p.sku || '',
      p.status || 'Sản phẩm mới',
      p.retailPrice || '',
      p.suitableFor || 'Xe ô tô',
      p.targetAudience || 'Cả hai',
      p.segment || 'Mid',
      JSON.stringify(p.specs || {}),
      p.coreBenefit || '',
      p.stage || 'Growth',
      p.internalNotes || '',
      p.imageUrl || '',
      Boolean(p.isHidden),
      p.createdAt || now,
      now
    ];

    const result = await query(sql, values);
    res.json(mapProductFromDb(result.rows[0]));
  } catch (err) {
    console.error('Lỗi POST /api/products:', err.message);
    res.status(500).json({ error: 'Không thể lưu sản phẩm vào PostgreSQL.' });
  }
});

// DELETE /api/products/:id - Xóa sản phẩm
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await query('DELETE FROM products WHERE id = $1 RETURNING id', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Không tìm thấy sản phẩm cần xóa.' });
    }
    res.json({ success: true, message: `Đã xóa sản phẩm ${id} thành công.` });
  } catch (err) {
    console.error(`Lỗi DELETE /api/products/${id}:`, err.message);
    res.status(500).json({ error: 'Lỗi khi xóa sản phẩm từ PostgreSQL.' });
  }
});

// POST /api/products/bulk - Nhập hàng loạt sản phẩm
router.post('/bulk', async (req, res) => {
  const { products, overwriteExisting = true } = req.body;
  if (!Array.isArray(products) || products.length === 0) {
    return res.status(400).json({ error: 'Dữ liệu danh sách sản phẩm không hợp lệ.' });
  }

  let added = 0;
  let updated = 0;

  try {
    for (const p of products) {
      const id = p.id || `prod-${Date.now()}-${Math.round(Math.random() * 1000)}`;
      const now = new Date().toISOString();

      if (overwriteExisting) {
        const sql = `
          INSERT INTO products (
            id, name, product_line, sku, status, retail_price, suitable_for,
            target_audience, segment, specs, core_benefit, stage, internal_notes,
            image_url, is_hidden, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            product_line = EXCLUDED.product_line,
            sku = EXCLUDED.sku,
            status = EXCLUDED.status,
            retail_price = EXCLUDED.retail_price,
            suitable_for = EXCLUDED.suitable_for,
            target_audience = EXCLUDED.target_audience,
            segment = EXCLUDED.segment,
            specs = EXCLUDED.specs,
            core_benefit = EXCLUDED.core_benefit,
            stage = EXCLUDED.stage,
            internal_notes = EXCLUDED.internal_notes,
            image_url = EXCLUDED.image_url,
            is_hidden = EXCLUDED.is_hidden,
            updated_at = EXCLUDED.updated_at
          RETURNING xmax;
        `;
        const resSql = await query(sql, [
          id,
          p.name,
          p.productLine || 'Bi LED',
          p.sku || '',
          p.status || 'Sản phẩm mới',
          p.retailPrice || '',
          p.suitableFor || 'Xe ô tô',
          p.targetAudience || 'Cả hai',
          p.segment || 'Mid',
          JSON.stringify(p.specs || {}),
          p.coreBenefit || '',
          p.stage || 'Growth',
          p.internalNotes || '',
          p.imageUrl || '',
          Boolean(p.isHidden),
          p.createdAt || now,
          now
        ]);
        // xmax = 0 nghĩa là insert mới, > 0 nghĩa là update
        if (resSql.rows[0]?.xmax === 0) {
          added++;
        } else {
          updated++;
        }
      } else {
        const sql = `
          INSERT INTO products (
            id, name, product_line, sku, status, retail_price, suitable_for,
            target_audience, segment, specs, core_benefit, stage, internal_notes,
            image_url, is_hidden, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
          ON CONFLICT (id) DO NOTHING;
        `;
        const resSql = await query(sql, [
          id,
          p.name,
          p.productLine || 'Bi LED',
          p.sku || '',
          p.status || 'Sản phẩm mới',
          p.retailPrice || '',
          p.suitableFor || 'Xe ô tô',
          p.targetAudience || 'Cả hai',
          p.segment || 'Mid',
          JSON.stringify(p.specs || {}),
          p.coreBenefit || '',
          p.stage || 'Growth',
          p.internalNotes || '',
          p.imageUrl || '',
          Boolean(p.isHidden),
          p.createdAt || now,
          now
        ]);
        if (resSql.rowCount > 0) added++;
      }
    }

    res.json({ success: true, added, updated, total: products.length });
  } catch (err) {
    console.error('Lỗi POST /api/products/bulk:', err.message);
    res.status(500).json({ error: 'Lỗi khi nhập sản phẩm hàng loạt vào cơ sở dữ liệu.' });
  }
});

export default router;
