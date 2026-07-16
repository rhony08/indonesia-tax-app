const Database = require('better-sqlite3');
const { v4: uuidv4 } = require('uuid');

const db = new Database('/usr/local/projects/services/indonesia-tax-app/be/data/tax-app.db');
db.pragma('foreign_keys = ON');

const now = new Date().toISOString();

const consultantUsers = [
  { name: 'Budi Santoso', email: 'budi@taxconsult.id', phone: '08123456701', npwp: '123456789012345', cert_level: 'B', price: 150000, bio: 'Tax consultant with 10+ years experience. Specializing in PPh 21 and SPT Tahunan for employees and freelancers.', specializations: '["PPh 21","SPT Tahunan","Tax Planning"]', rating: 4.8, reviews: 120 },
  { name: 'Siti Rahayu', email: 'siti@taxconsult.id', phone: '08123456702', npwp: '123456789012346', cert_level: 'A', price: 100000, bio: 'Certified tax consultant level A. Helping individuals file their annual tax returns correctly and on time.', specializations: '["SPT Tahunan","PPH Final","Tax Consultation"]', rating: 4.5, reviews: 85 },
  { name: 'Ahmad Hidayat', email: 'ahmad@taxconsult.id', phone: '08123456703', npwp: '123456789012347', cert_level: 'C', price: 300000, bio: 'Senior tax consultant with full certification. Handling complex corporate and international tax cases.', specializations: '["PPh 21","PPh 23","PPN","Tax Audit","International Tax"]', rating: 4.9, reviews: 210 },
  { name: 'Dewi Lestari', email: 'dewi@taxconsult.id', phone: '08123456704', npwp: '123456789012348', cert_level: 'B', price: 200000, bio: 'UMKM tax specialist. Over 7 years helping small businesses with monthly compliance and PP 23/2018 reporting.', specializations: '["PPH Final","PPN","Tax Consultation","Monthly Compliance"]', rating: 4.6, reviews: 95 },
  { name: 'Rudi Hermawan', email: 'rudi@taxconsult.id', phone: '08123456705', npwp: '123456789012349', cert_level: 'B', price: 175000, bio: 'Freelancer and digital nomad tax expert. Making tax easy for the gig economy workers.', specializations: '["PPh 21","SPT Tahunan","Tax Planning","Freelance Tax"]', rating: 4.7, reviews: 150 },
  { name: 'Linda Wijaya', email: 'linda@taxconsult.id', phone: '08123456706', npwp: '123456789012350', cert_level: 'A', price: 120000, bio: 'Friendly and patient tax consultant. Perfect for first-time taxpayers who need guidance.', specializations: '["SPT Tahunan","PPh 21","Tax Consultation","Beginner Friendly"]', rating: 4.4, reviews: 65 },
];

for (const c of consultantUsers) {
  const userId = uuidv4();
  const consultantId = uuidv4();

  const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(c.email);
  if (existingUser) {
    console.log(`Skipping ${c.email} - already exists`);
    continue;
  }

  db.prepare(`INSERT INTO users (id, email, password, name, phone, npwp, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
    userId, c.email, '$2a$10$placeholderhashedpassword1234567890', c.name, c.phone, c.npwp, 'consultant', now, now
  );

  db.prepare(`INSERT INTO consultants (id, user_id, cert_level, cert_number, izin_praktik, specializations, bio, price_per_session, rating, total_reviews, is_verified, is_online, total_sessions, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
    consultantId, userId, c.cert_level, `CERT-${c.cert_level}-${Date.now()}`, `IP-${Date.now()}`, c.specializations, c.bio, c.price, c.rating, c.reviews, 1, 1, c.reviews, now, now
  );

  console.log(`Seeded: ${c.name} (${c.email})`);
}

console.log('Done seeding consultants');
db.close();
