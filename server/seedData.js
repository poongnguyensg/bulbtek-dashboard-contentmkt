import { query } from './db.js';

export const SEED_PRODUCTS = [
  {
    id: 'prod-sunset',
    name: 'Bi LED Sunset',
    product_line: 'Bi LED',
    sku: 'BTK-LED-SUNSET',
    status: 'Hero Product',
    retail_price: '8.500.000 VNĐ / Cặp',
    suitable_for: 'Xe ô tô',
    target_audience: 'Cả hai',
    segment: 'Premium',
    specs: {
      chipLed: 'Osram 6+3 nhân công nghệ Đức',
      colorTemp: '5500K (Trắng ấm tự nhiên)',
      brightness: '12.000 Lux (Tâm pha cực gom)',
      power: 'Cos 65W - Pha 75W',
      voltage: '9V - 16V DC',
      lifespan: '50.000 giờ thắp sáng',
      warranty: '3 năm (1 đổi 1 chính hãng)',
      compatibility: 'Chân xoáy đa năng, tương thích 98% dòng xe ô tô',
      sizeInch: '3.0 inch',
      waterproof: 'IP65',
      specialFeatures: 'Ánh sáng cung hoàng hôn dịu mắt, bám đường vượt trội trong mưa phùn, tản nhiệt đồng kép quạt thủy lực không ồn'
    },
    core_benefit: 'Tầm nhìn đỉnh cao hoàng hôn, bám đường êm dịu, không gây chói xe ngược chiều',
    stage: 'Growth',
    internal_notes: 'Sản phẩm chủ lực đánh phân khúc sedan và SUV cao cấp, đại lý có biên độ lợi nhuận tốt',
    image_url: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=600&auto=format&fit=crop&q=80',
    is_hidden: false
  },
  {
    id: 'prod-vista',
    name: 'Bi LED Vista',
    product_line: 'Bi LED',
    sku: 'BTK-LED-VISTA',
    status: 'Sản phẩm hiện hữu',
    retail_price: '6.200.000 VNĐ / Cặp',
    suitable_for: 'Xe ô tô',
    target_audience: 'B2C Người dùng cuối',
    segment: 'Mid',
    specs: {
      chipLed: 'Sanan Opto thế hệ mới',
      colorTemp: '5500K',
      brightness: '9.500 Lux',
      power: 'Cos 55W - Pha 65W',
      voltage: '12V DC',
      lifespan: '45.000 giờ',
      warranty: '2 năm',
      compatibility: 'Chân xoáy đa năng',
      sizeInch: '3.0 inch',
      waterproof: 'IP65',
      specialFeatures: 'Thiết kế đuôi vặn ngắn, dễ thi công không cắt chóa'
    },
    core_benefit: 'Hiệu năng thực dụng, giá thành tiếp cận số đông, dễ lắp đặt giữ zin xe',
    stage: 'Mature',
    internal_notes: 'Phù hợp khách hàng nâng cấp đèn lần đầu cần chi phí vừa phải',
    image_url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&auto=format&fit=crop&q=80',
    is_hidden: false
  },
  {
    id: 'prod-ray2',
    name: 'Bi Gầm RAY 2.0',
    product_line: 'Bi Gầm',
    sku: 'BTK-FOG-RAY2',
    status: 'Hero Product',
    retail_price: '4.800.000 VNĐ / Cặp',
    suitable_for: 'Cả hai (Ô tô & Xe máy)',
    target_audience: 'Cả hai',
    segment: 'Mid',
    specs: {
      chipLed: 'Chip CSP 6 nhân chịu nhiệt',
      colorTemp: '3 chế độ: 3000K (Vàng đậm) - 4300K (Vàng chanh) - 5500K (Trắng)',
      brightness: '8.800 Lux',
      power: 'Cos 45W - Pha 55W',
      voltage: '9V - 16V DC',
      lifespan: '50.000 giờ',
      warranty: '2 năm',
      compatibility: 'Pát zin chuyên dụng cho Toyota, Ford, Honda, Hyundai, Kia, Mitsubishi',
      sizeInch: '3.0 inch / 2.0 inch',
      waterproof: 'IP68 (Ngâm nước tuyệt đối)',
      specialFeatures: 'Tích hợp mắt quỷ đổi màu qua app Bluetooth, van thở chống hấp hơi nước 1 chiều'
    },
    core_benefit: 'Vũ khí phá sương xuyên mưa bão số 1, chống nước tuyệt đối, đổi 3 màu linh hoạt',
    stage: 'Growth',
    internal_notes: 'Sản phẩm bán chạy nhất mùa mưa bão tháng 7-11 hàng năm',
    image_url: 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=600&auto=format&fit=crop&q=80',
    is_hidden: false
  },
  {
    id: 'prod-bisquare-vf3',
    name: 'Bi Square 3.0 (VinFast VF3)',
    product_line: 'Bi LED',
    sku: 'BTK-LED-SQ-VF3',
    status: 'Sản phẩm mới',
    retail_price: '7.900.000 VNĐ / Cặp',
    suitable_for: 'VinFast VF3 / VF5',
    target_audience: 'B2C Người dùng cuối',
    segment: 'Premium',
    specs: {
      chipLed: 'Custom Lens Square LED Module',
      colorTemp: '5500K',
      brightness: '11.000 Lux',
      power: 'Cos 50W - Pha 60W',
      voltage: '12V DC',
      lifespan: '50.000 giờ',
      warranty: '3 năm',
      compatibility: '100% Cắm jack zin xe VinFast VF3 không trích dây',
      sizeInch: '3.0 inch Form Vuông',
      waterproof: 'IP67',
      specialFeatures: 'Thiết kế chóa vuông nguyên bản khớp 100% mặt ca-lăng VF3, giữ nguyên bảo hành điện hãng'
    },
    core_benefit: 'Giải pháp tăng sáng form vuông chuẩn zin 100% cho VinFast VF3, cắm jack giữ trọn bảo hành xe điện',
    stage: 'Launch',
    internal_notes: 'Tập trung đẩy mạnh hội nhóm VinFast VF3 toàn quốc',
    image_url: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=600&auto=format&fit=crop&q=80',
    is_hidden: false
  }
];

export const SEED_CATEGORIES = [
  {
    id: 'cat-branding',
    name: 'BRANDING',
    tone: 'Cảm xúc, thương hiệu, câu chuyện',
    color: '#AF2024',
    example_angle: 'Hành trình bác tài xuyên đêm cùng sự bền bỉ của Bulbtek, triết lý An Toàn Hành Trình',
    icon: 'ShieldAlert'
  },
  {
    id: 'cat-product',
    name: 'PRODUCT',
    tone: 'Kỹ thuật, thông số, lợi ích, thuyết phục',
    color: '#2563EB',
    example_angle: 'So sánh đường cắt ánh sáng Cos/Pha, giải mã công nghệ tản nhiệt đồng kép và chip LED Osram',
    icon: 'Zap'
  },
  {
    id: 'cat-interaction',
    name: 'TƯƠNG TÁC',
    tone: 'Vui, câu hỏi, mời gọi, tag bạn bè',
    color: '#F59E0B',
    example_angle: 'Bác tài sợ nhất điều gì khi lái xe đêm trời mưa bão? Chia sẻ kỉ niệm phượt cùng xế cưng',
    icon: 'MessageSquare'
  },
  {
    id: 'cat-quiz',
    name: 'QUIZ',
    tone: 'Gamification, đố vui, giáo dục nhẹ',
    color: '#10B981',
    example_angle: 'Đố vui chọn đúng nhiệt màu đi mưa: 3000K hay 6000K? Minigame nhận quà nâng cấp đèn Bulbtek',
    icon: 'HelpCircle'
  },
  {
    id: 'cat-dealer',
    name: 'DEALER',
    tone: 'B2B, lợi ích kinh doanh, số liệu, professional',
    color: '#EA580C',
    example_angle: 'Chính sách chiết khấu gara hấp dẫn, hỗ trợ biển bảng POSM và đào tạo kỹ thuật lắp đặt độc quyền',
    icon: 'Briefcase'
  }
];

export const SEED_TEAM = [
  {
    id: 'user-philip',
    name: 'Philip',
    email: 'philip.coo@bulbtek.vn',
    role: 'ADMIN',
    role_title: 'COO (Chief Operating Officer)',
    status: 'Active',
    added_date: '2025-10-01',
    avatar: 'PL'
  },
  {
    id: 'user-tuananh',
    name: 'Tuấn Anh',
    email: 'tuananh.lead@bulbtek.vn',
    role: 'APPROVER',
    role_title: 'Marketing & Ecom Team Lead',
    status: 'Active',
    added_date: '2025-11-15',
    avatar: 'TA'
  },
  {
    id: 'user-linh',
    name: 'Linh',
    email: 'linh.mkt@bulbtek.vn',
    role: 'CREATOR',
    role_title: 'Marketing Executive (Content & SEO)',
    status: 'Active',
    added_date: '2026-02-01',
    avatar: 'LH'
  },
  {
    id: 'user-duc',
    name: 'Đức',
    email: 'duc.copy@bulbtek.vn',
    role: 'CREATOR',
    role_title: 'Content Specialist',
    status: 'Active',
    added_date: '2026-03-10',
    avatar: 'MD'
  }
];

export const seedDatabaseIfEmpty = async () => {
  try {
    // 1. Kiểm tra products
    const prodRes = await query('SELECT COUNT(*) FROM products');
    if (parseInt(prodRes.rows[0].count, 10) === 0) {
      console.log('[PostgreSQL] 📦 Đang nạp dữ liệu mẫu ban đầu cho sản phẩm...');
      for (const p of SEED_PRODUCTS) {
        await query(`
          INSERT INTO products (
            id, name, product_line, sku, status, retail_price, suitable_for, 
            target_audience, segment, specs, core_benefit, stage, internal_notes, 
            image_url, is_hidden
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
          ON CONFLICT (id) DO NOTHING
        `, [
          p.id, p.name, p.product_line, p.sku, p.status, p.retail_price, p.suitable_for,
          p.target_audience, p.segment, JSON.stringify(p.specs), p.core_benefit, p.stage,
          p.internal_notes, p.image_url, p.is_hidden
        ]);
      }
    }

    // 2. Kiểm tra categories
    const catRes = await query('SELECT COUNT(*) FROM categories');
    if (parseInt(catRes.rows[0].count, 10) === 0) {
      console.log('[PostgreSQL] 📦 Đang nạp dữ liệu danh mục content...');
      for (const c of SEED_CATEGORIES) {
        await query(`
          INSERT INTO categories (id, name, tone, color, example_angle, icon)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (id) DO NOTHING
        `, [c.id, c.name, c.tone, c.color, c.example_angle, c.icon]);
      }
    }

    // 3. Kiểm tra team members
    const teamRes = await query('SELECT COUNT(*) FROM team_members');
    if (parseInt(teamRes.rows[0].count, 10) === 0) {
      console.log('[PostgreSQL] 📦 Đang nạp danh sách nhân sự mẫu...');
      for (const u of SEED_TEAM) {
        await query(`
          INSERT INTO team_members (id, name, email, role, role_title, status, added_date, avatar)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (id) DO NOTHING
        `, [u.id, u.name, u.email, u.role, u.role_title, u.status, u.added_date, u.avatar]);
      }
    }

    console.log('[PostgreSQL] ✅ Hoàn tất kiểm tra dữ liệu khởi tạo!');
  } catch (err) {
    console.error('[PostgreSQL] ⚠️ Lỗi trong quá trình seed database:', err.message);
  }
};
