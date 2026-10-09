import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

// Tự động cấu hình SSL phù hợp (Local vs Internal vs Cloud PostgreSQL)
function createPoolConfig(useSsl) {
  const config = {
    connectionString: connectionString || 'postgresql://postgres:postgres@localhost:5432/bulbtek_content',
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    max: 20
  };

  if (useSsl) {
    config.ssl = { rejectUnauthorized: false };
  } else {
    config.ssl = false;
  }
  return config;
}

// Chỉ bật SSL nếu chuỗi kết nối chỉ định rõ ràng hoặc cấu hình DB_SSL
const initialUseSsl = Boolean(
  process.env.DB_SSL === 'true' ||
  (connectionString && (connectionString.includes('sslmode=require') || connectionString.includes('ssl=true')))
);

export let pool = new Pool(createPoolConfig(initialUseSsl));

let isDbConnected = false;

pool.on('error', (err) => {
  console.error('[PostgreSQL] Lỗi kết nối Pool:', err.message);
  isDbConnected = false;
});

export const query = async (text, params) => {
  return pool.query(text, params);
};

export const getDbStatus = () => isDbConnected;

export const initDb = async () => {
  if (!connectionString) {
    console.warn('[PostgreSQL] ⚠️ Không tìm thấy DATABASE_URL hoặc POSTGRES_URL. Backend sẽ chờ cấu hình cơ sở dữ liệu.');
    return false;
  }

  let client;
  try {
    client = await pool.connect();
  } catch (err) {
    // Nếu lỗi do SSL không được hỗ trợ -> thử lại ngay với chế độ không SSL
    if (err.message && err.message.includes('The server does not support SSL connections')) {
      console.warn('[PostgreSQL] ⚠️ Máy chủ không hỗ trợ SSL, tự động chuyển sang chế độ không SSL...');
      await pool.end().catch(() => {});
      pool = new Pool(createPoolConfig(false));
      pool.on('error', (e) => {
        console.error('[PostgreSQL] Lỗi kết nối Pool:', e.message);
        isDbConnected = false;
      });
      client = await pool.connect();
    } else if (err.message && (err.message.includes('no pg_hba.conf entry') || err.message.includes('SSL off'))) {
      // Nếu server yêu cầu SSL nhưng pool chưa bật SSL
      console.warn('[PostgreSQL] ⚠️ Máy chủ yêu cầu SSL, tự động chuyển sang chế độ SSL...');
      await pool.end().catch(() => {});
      pool = new Pool(createPoolConfig(true));
      pool.on('error', (e) => {
        console.error('[PostgreSQL] Lỗi kết nối Pool:', e.message);
        isDbConnected = false;
      });
      client = await pool.connect();
    } else {
      console.error('[PostgreSQL] ❌ Lỗi kết nối ban đầu:', err.message);
      isDbConnected = false;
      return false;
    }
  }

  try {
    isDbConnected = true;
    console.log('[PostgreSQL] ✅ Đã kết nối thành công tới máy chủ PostgreSQL!');

    // 1. Tạo bảng products
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        product_line VARCHAR(100) NOT NULL,
        sku VARCHAR(100),
        status VARCHAR(50),
        retail_price VARCHAR(100),
        suitable_for VARCHAR(100),
        target_audience VARCHAR(100),
        segment VARCHAR(50),
        specs JSONB DEFAULT '{}'::jsonb,
        core_benefit TEXT,
        stage VARCHAR(50),
        internal_notes TEXT,
        image_url TEXT,
        is_hidden BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 2. Tạo bảng categories
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        tone VARCHAR(255),
        color VARCHAR(50),
        example_angle TEXT,
        icon VARCHAR(50),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 3. Tạo bảng contents
    await client.query(`
      CREATE TABLE IF NOT EXISTS contents (
        id VARCHAR(100) PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        creative_headline VARCHAR(500),
        channel VARCHAR(50),
        date VARCHAR(20),
        product_id VARCHAR(100),
        product_name VARCHAR(255),
        product_line VARCHAR(100),
        category_id VARCHAR(100),
        status VARCHAR(50),
        assignee_id VARCHAR(100),
        assignee_name VARCHAR(255),
        facebook_caption TEXT,
        tiktok_caption TEXT,
        highlight_specs JSONB DEFAULT '[]'::jsonb,
        angle_used TEXT,
        ai_model_used VARCHAR(100),
        created_by VARCHAR(255),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        rejection_reasons JSONB DEFAULT '[]'::jsonb,
        rejection_comment TEXT,
        rejected_at TIMESTAMPTZ,
        rejected_by VARCHAR(255),
        approved_at TIMESTAMPTZ,
        approved_by VARCHAR(255),
        published_at TIMESTAMPTZ,
        published_url TEXT
      );
    `);

    // 4. Tạo bảng team_members
    await client.query(`
      CREATE TABLE IF NOT EXISTS team_members (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        role VARCHAR(50),
        role_title VARCHAR(100),
        status VARCHAR(50) DEFAULT 'Active',
        added_date VARCHAR(50),
        avatar VARCHAR(50)
      );
    `);

    // 5. Tạo bảng system_settings
    await client.query(`
      CREATE TABLE IF NOT EXISTS system_settings (
        id VARCHAR(50) PRIMARY KEY DEFAULT 'default',
        data JSONB NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 6. Tạo bảng content_memory (Anti-Duplication Engine)
    await client.query(`
      CREATE TABLE IF NOT EXISTS content_memory (
        id VARCHAR(100) PRIMARY KEY,
        product_id VARCHAR(100),
        product_name VARCHAR(255),
        category_id VARCHAR(100),
        category_name VARCHAR(255),
        channel VARCHAR(50),
        date VARCHAR(20),
        angle_used TEXT,
        hook_fb TEXT,
        hook_tiktok TEXT,
        variation_index INTEGER,
        facebook_caption TEXT,
        tiktok_caption TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    console.log('[PostgreSQL] ✅ Đã khởi tạo cấu trúc bảng (Schema) thành công!');
    client.release();
    return true;
  } catch (err) {
    console.error('[PostgreSQL] ❌ Lỗi kết nối hoặc khởi tạo bảng:', err.message);
    isDbConnected = false;
    return false;
  }
};
