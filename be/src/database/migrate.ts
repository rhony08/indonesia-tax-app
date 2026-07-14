import { sql } from 'drizzle-orm';
import { db, schema } from './database';
import { Logger } from '@nestjs/common';

const logger = new Logger('DatabaseMigrate');

export async function initializeDatabase() {
  try {
    db.run(sql`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        password TEXT,
        name TEXT NOT NULL,
        phone TEXT,
        npwp TEXT,
        google_id TEXT,
        avatar_url TEXT,
        role TEXT NOT NULL DEFAULT 'user',
        locale TEXT NOT NULL DEFAULT 'id',
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);

    db.run(sql`
      CREATE TABLE IF NOT EXISTS consultants (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        cert_level TEXT NOT NULL,
        cert_number TEXT NOT NULL,
        izin_praktik TEXT,
        specializations TEXT NOT NULL DEFAULT '[]',
        bio TEXT,
        price_per_session INTEGER NOT NULL DEFAULT 100000,
        rating REAL NOT NULL DEFAULT 0,
        total_reviews INTEGER NOT NULL DEFAULT 0,
        is_verified INTEGER NOT NULL DEFAULT 1,
        is_online INTEGER NOT NULL DEFAULT 0,
        total_sessions INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);

    db.run(sql`
      CREATE TABLE IF NOT EXISTS consultant_schedules (
        id TEXT PRIMARY KEY,
        consultant_id TEXT NOT NULL REFERENCES consultants(id) ON DELETE CASCADE,
        day_of_week INTEGER NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);

    db.run(sql`
      CREATE TABLE IF NOT EXISTS consultations (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id),
        consultant_id TEXT NOT NULL REFERENCES consultants(id),
        type TEXT NOT NULL DEFAULT 'chat',
        status TEXT NOT NULL DEFAULT 'pending',
        started_at TEXT,
        ended_at TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);

    db.run(sql`
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        consultation_id TEXT NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
        sender_id TEXT NOT NULL REFERENCES users(id),
        content TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'text',
        file_url TEXT,
        file_name TEXT,
        is_read INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);

    db.run(sql`
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id),
        consultant_id TEXT NOT NULL REFERENCES consultants(id),
        consultation_id TEXT REFERENCES consultations(id),
        service_type TEXT NOT NULL,
        amount INTEGER NOT NULL,
        platform_fee INTEGER NOT NULL DEFAULT 0,
        commission_rate REAL NOT NULL DEFAULT 0.25,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);

    db.run(sql`
      CREATE TABLE IF NOT EXISTS payments (
        id TEXT PRIMARY KEY,
        order_id TEXT NOT NULL REFERENCES orders(id),
        method TEXT,
        external_id TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        amount INTEGER NOT NULL,
        paid_at TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);

    db.run(sql`
      CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id),
        consultation_id TEXT REFERENCES consultations(id),
        filename TEXT NOT NULL,
        original_name TEXT NOT NULL,
        url TEXT NOT NULL,
        mime_type TEXT NOT NULL,
        size INTEGER NOT NULL,
        type TEXT NOT NULL DEFAULT 'general',
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);

    db.run(sql`
      CREATE TABLE IF NOT EXISTS reviews (
        id TEXT PRIMARY KEY,
        consultation_id TEXT NOT NULL REFERENCES consultations(id),
        user_id TEXT NOT NULL REFERENCES users(id),
        consultant_id TEXT NOT NULL REFERENCES consultants(id),
        rating INTEGER NOT NULL,
        comment TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);

    db.run(sql`
      CREATE TABLE IF NOT EXISTS tax_categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        name_en TEXT NOT NULL,
        description TEXT,
        description_en TEXT,
        slug TEXT NOT NULL UNIQUE,
        icon TEXT,
        is_active INTEGER NOT NULL DEFAULT 1,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);

    db.run(sql`
      CREATE TABLE IF NOT EXISTS tax_rates (
        id TEXT PRIMARY KEY,
        category_id TEXT NOT NULL REFERENCES tax_categories(id),
        name TEXT NOT NULL,
        name_en TEXT NOT NULL,
        rate REAL NOT NULL,
        description TEXT,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);

    db.run(sql`
      CREATE TABLE IF NOT EXISTS blog_posts (
        id TEXT PRIMARY KEY,
        slug TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL,
        title_en TEXT,
        content TEXT NOT NULL,
        content_en TEXT,
        excerpt TEXT,
        excerpt_en TEXT,
        author_id TEXT REFERENCES users(id),
        cover_image TEXT,
        status TEXT NOT NULL DEFAULT 'draft',
        tags TEXT DEFAULT '[]',
        view_count INTEGER NOT NULL DEFAULT 0,
        published_at TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);

    db.run(sql`
      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id),
        title TEXT NOT NULL,
        body TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'general',
        reference_id TEXT,
        reference_type TEXT,
        is_read INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);

    db.run(sql`
      CREATE TABLE IF NOT EXISTS payout_accounts (
        id TEXT PRIMARY KEY,
        consultant_id TEXT NOT NULL REFERENCES consultants(id),
        bank_name TEXT NOT NULL,
        account_number TEXT NOT NULL,
        account_name TEXT NOT NULL,
        is_default INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);

    db.run(sql`
      CREATE TABLE IF NOT EXISTS payout_logs (
        id TEXT PRIMARY KEY,
        consultant_id TEXT NOT NULL REFERENCES consultants(id),
        amount INTEGER NOT NULL,
        period_start TEXT NOT NULL,
        period_end TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        reference TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);

    logger.log('Database tables initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize database:', error);
    throw error;
  }
}
