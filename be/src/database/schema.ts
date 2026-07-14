import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  password: text('password'),
  name: text('name').notNull(),
  phone: text('phone'),
  npwp: text('npwp'),
  google_id: text('google_id'),
  avatar_url: text('avatar_url'),
  role: text('role').notNull().default('user'),
  locale: text('locale').notNull().default('id'),
  is_active: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  created_at: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
  updated_at: text('updated_at')
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const consultants = sqliteTable('consultants', {
  id: text('id').primaryKey(),
  user_id: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  cert_level: text('cert_level').notNull(),
  cert_number: text('cert_number').notNull(),
  izin_praktik: text('izin_praktik'),
  specializations: text('specializations').notNull().default('[]'),
  bio: text('bio'),
  price_per_session: integer('price_per_session').notNull().default(100000),
  rating: real('rating').notNull().default(0),
  total_reviews: integer('total_reviews').notNull().default(0),
  is_verified: integer('is_verified', { mode: 'boolean' })
    .notNull()
    .default(true),
  is_online: integer('is_online', { mode: 'boolean' }).notNull().default(false),
  total_sessions: integer('total_sessions').notNull().default(0),
  created_at: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
  updated_at: text('updated_at')
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const consultantSchedules = sqliteTable('consultant_schedules', {
  id: text('id').primaryKey(),
  consultant_id: text('consultant_id')
    .notNull()
    .references(() => consultants.id, { onDelete: 'cascade' }),
  day_of_week: integer('day_of_week').notNull(),
  start_time: text('start_time').notNull(),
  end_time: text('end_time').notNull(),
  is_active: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  created_at: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const consultations = sqliteTable('consultations', {
  id: text('id').primaryKey(),
  user_id: text('user_id')
    .notNull()
    .references(() => users.id),
  consultant_id: text('consultant_id')
    .notNull()
    .references(() => consultants.id),
  type: text('type').notNull().default('chat'),
  status: text('status').notNull().default('pending'),
  started_at: text('started_at'),
  ended_at: text('ended_at'),
  created_at: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
  updated_at: text('updated_at')
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const messages = sqliteTable('messages', {
  id: text('id').primaryKey(),
  consultation_id: text('consultation_id')
    .notNull()
    .references(() => consultations.id, { onDelete: 'cascade' }),
  sender_id: text('sender_id')
    .notNull()
    .references(() => users.id),
  content: text('content').notNull(),
  type: text('type').notNull().default('text'),
  file_url: text('file_url'),
  file_name: text('file_name'),
  is_read: integer('is_read', { mode: 'boolean' }).notNull().default(false),
  created_at: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const orders = sqliteTable('orders', {
  id: text('id').primaryKey(),
  user_id: text('user_id')
    .notNull()
    .references(() => users.id),
  consultant_id: text('consultant_id')
    .notNull()
    .references(() => consultants.id),
  consultation_id: text('consultation_id').references(() => consultations.id),
  service_type: text('service_type').notNull(),
  amount: integer('amount').notNull(),
  platform_fee: integer('platform_fee').notNull().default(0),
  commission_rate: real('commission_rate').notNull().default(0.25),
  status: text('status').notNull().default('pending'),
  created_at: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
  updated_at: text('updated_at')
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const payments = sqliteTable('payments', {
  id: text('id').primaryKey(),
  order_id: text('order_id')
    .notNull()
    .references(() => orders.id),
  method: text('method'),
  external_id: text('external_id'),
  status: text('status').notNull().default('pending'),
  amount: integer('amount').notNull(),
  paid_at: text('paid_at'),
  created_at: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const documents = sqliteTable('documents', {
  id: text('id').primaryKey(),
  user_id: text('user_id')
    .notNull()
    .references(() => users.id),
  consultation_id: text('consultation_id').references(() => consultations.id),
  filename: text('filename').notNull(),
  original_name: text('original_name').notNull(),
  url: text('url').notNull(),
  mime_type: text('mime_type').notNull(),
  size: integer('size').notNull(),
  type: text('type').notNull().default('general'),
  created_at: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const reviews = sqliteTable('reviews', {
  id: text('id').primaryKey(),
  consultation_id: text('consultation_id')
    .notNull()
    .references(() => consultations.id),
  user_id: text('user_id')
    .notNull()
    .references(() => users.id),
  consultant_id: text('consultant_id')
    .notNull()
    .references(() => consultants.id),
  rating: integer('rating').notNull(),
  comment: text('comment'),
  created_at: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const taxCategories = sqliteTable('tax_categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  name_en: text('name_en').notNull(),
  description: text('description'),
  description_en: text('description_en'),
  slug: text('slug').notNull().unique(),
  icon: text('icon'),
  is_active: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  sort_order: integer('sort_order').notNull().default(0),
  created_at: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const taxRates = sqliteTable('tax_rates', {
  id: text('id').primaryKey(),
  category_id: text('category_id')
    .notNull()
    .references(() => taxCategories.id),
  name: text('name').notNull(),
  name_en: text('name_en').notNull(),
  rate: real('rate').notNull(),
  description: text('description'),
  is_active: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  created_at: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const blogPosts = sqliteTable('blog_posts', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  title_en: text('title_en'),
  content: text('content').notNull(),
  content_en: text('content_en'),
  excerpt: text('excerpt'),
  excerpt_en: text('excerpt_en'),
  author_id: text('author_id').references(() => users.id),
  cover_image: text('cover_image'),
  status: text('status').notNull().default('draft'),
  tags: text('tags').default('[]'),
  view_count: integer('view_count').notNull().default(0),
  published_at: text('published_at'),
  created_at: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
  updated_at: text('updated_at')
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const notifications = sqliteTable('notifications', {
  id: text('id').primaryKey(),
  user_id: text('user_id')
    .notNull()
    .references(() => users.id),
  title: text('title').notNull(),
  body: text('body').notNull(),
  type: text('type').notNull().default('general'),
  reference_id: text('reference_id'),
  reference_type: text('reference_type'),
  is_read: integer('is_read', { mode: 'boolean' }).notNull().default(false),
  created_at: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const payoutAccounts = sqliteTable('payout_accounts', {
  id: text('id').primaryKey(),
  consultant_id: text('consultant_id')
    .notNull()
    .references(() => consultants.id),
  bank_name: text('bank_name').notNull(),
  account_number: text('account_number').notNull(),
  account_name: text('account_name').notNull(),
  is_default: integer('is_default', { mode: 'boolean' })
    .notNull()
    .default(true),
  created_at: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const payoutLogs = sqliteTable('payout_logs', {
  id: text('id').primaryKey(),
  consultant_id: text('consultant_id')
    .notNull()
    .references(() => consultants.id),
  amount: integer('amount').notNull(),
  period_start: text('period_start').notNull(),
  period_end: text('period_end').notNull(),
  status: text('status').notNull().default('pending'),
  reference: text('reference'),
  created_at: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
});
