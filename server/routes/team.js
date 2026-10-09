import express from 'express';
import { query } from '../db.js';

const router = express.Router();

const mapTeamFromDb = (row) => ({
  id: row.id,
  name: row.name,
  email: row.email,
  role: row.role,
  roleTitle: row.role_title,
  status: row.status,
  addedDate: row.added_date,
  avatar: row.avatar
});

// GET /api/team
router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM team_members ORDER BY id ASC');
    res.json(result.rows.map(mapTeamFromDb));
  } catch (err) {
    console.error('Lỗi GET /api/team:', err.message);
    res.status(500).json({ error: 'Không thể truy vấn danh sách thành viên từ PostgreSQL.' });
  }
});

// POST /api/team
router.post('/', async (req, res) => {
  const m = req.body;
  if (!m || !m.name) {
    return res.status(400).json({ error: 'Tên thành viên là bắt buộc.' });
  }

  const id = m.id || `user-${Date.now()}`;
  try {
    const sql = `
      INSERT INTO team_members (id, name, email, role, role_title, status, added_date, avatar)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        role = EXCLUDED.role,
        role_title = EXCLUDED.role_title,
        status = EXCLUDED.status,
        avatar = EXCLUDED.avatar
      RETURNING *;
    `;
    const result = await query(sql, [
      id,
      m.name,
      m.email || '',
      m.role || 'CREATOR',
      m.roleTitle || 'Marketing Specialist',
      m.status || 'Active',
      m.addedDate || new Date().toISOString().slice(0, 10),
      m.avatar || m.name.slice(0, 2).toUpperCase()
    ]);
    res.json(mapTeamFromDb(result.rows[0]));
  } catch (err) {
    console.error('Lỗi POST /api/team:', err.message);
    res.status(500).json({ error: 'Không thể lưu thành viên vào cơ sở dữ liệu.' });
  }
});

// PATCH /api/team/:id/role
router.patch('/:id/role', async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  if (!role) {
    return res.status(400).json({ error: 'Vai trò (role) là bắt buộc.' });
  }

  try {
    const result = await query(
      'UPDATE team_members SET role = $1 WHERE id = $2 RETURNING *',
      [role, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Không tìm thấy thành viên cần đổi vai trò.' });
    }
    res.json(mapTeamFromDb(result.rows[0]));
  } catch (err) {
    console.error(`Lỗi PATCH /api/team/${id}/role:`, err.message);
    res.status(500).json({ error: 'Lỗi cập nhật vai trò nhân sự.' });
  }
});

export default router;
