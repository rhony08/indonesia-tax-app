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
  { name: 'Andi Pratama', email: 'andi@taxconsult.id', phone: '08123456707', npwp: '123456789012351', cert_level: 'C', price: 350000, bio: 'Former DJP auditor with 15 years experience. Expert in tax audits, disputes, and corporate restructuring.', specializations: '["Tax Audit","PPh 23","PPh 21","International Tax","Tax Dispute"]', rating: 5.0, reviews: 312 },
  { name: 'Ratna Kusuma', email: 'ratna@taxconsult.id', phone: '08123456708', npwp: '123456789012352', cert_level: 'B', price: 250000, bio: 'Corporate tax specialist with Big 4 background. Helping startups and growing companies with tax strategy.', specializations: '["PPN","PPh 23","Tax Planning","Corporate Tax","Startup Tax"]', rating: 4.7, reviews: 180 },
  { name: 'Hendra Gunawan', email: 'hendra@taxconsult.id', phone: '08123456709', npwp: '123456789012353', cert_level: 'A', price: 90000, bio: 'Affordable tax help for karyawan swasta. Quick, accurate, patient with beginners.', specializations: '["PPh 21","SPT Tahunan","Beginner Friendly"]', rating: 4.3, reviews: 42 },
  { name: 'Maya Indah', email: 'maya@taxconsult.id', phone: '08123456710', npwp: '123456789012354', cert_level: 'B', price: 220000, bio: 'PPN and e-Faktur specialist. Helping UMKM navigate the complexities of VAT reporting and compliance.', specializations: '["PPN","PPH Final","Monthly Compliance","UMKM Tax"]', rating: 4.6, reviews: 88 },
  { name: 'Fajar Setiawan', email: 'fajar@taxconsult.id', phone: '08123456711', npwp: '123456789012355', cert_level: 'A', price: 110000, bio: 'Millennial tax consultant. Making tax fun and easy for young professionals and content creators.', specializations: '["PPh 21","SPT Tahunan","Freelance Tax","Content Creator Tax"]', rating: 4.5, reviews: 73 },
  { name: 'Dian Permata', email: 'dian@taxconsult.id', phone: '08123456712', npwp: '123456789012356', cert_level: 'C', price: 400000, bio: 'Certified tax attorney and consultant. Handling complex legal-tax cases, mergers, and cross-border transactions.', specializations: '["International Tax","Tax Dispute","Corporate Tax","M&A Tax","Tax Audit"]', rating: 4.9, reviews: 256 },
  { name: 'Rizky Fauzi', email: 'rizky@taxconsult.id', phone: '08123456713', npwp: '123456789012357', cert_level: 'B', price: 180000, bio: 'Tax technology enthusiast. Combining tech and tax to deliver efficient, paperless solutions.', specializations: '["PPh 21","PPh 23","PPN","Tax Automation","Digital Tax"]', rating: 4.5, reviews: 67 },
  { name: 'Nur Azizah', email: 'nur@taxconsult.id', phone: '08123456714', npwp: '123456789012358', cert_level: 'A', price: 95000, bio: 'Patience is my superpower. Teaching tax basics to students, fresh grads, and anyone confused by taxes.', specializations: '["SPT Tahunan","PPh 21","Beginner Friendly","Student Tax","Tax Education"]', rating: 4.8, reviews: 140 },
  { name: 'Bayu Saputra', email: 'bayu@taxconsult.id', phone: '08123456715', npwp: '123456789012359', cert_level: 'B', price: 250000, bio: 'Property and real estate tax specialist. Handling PPh final for property transactions, PBB, and construction tax.', specializations: '["PPH Final","PPN","Property Tax","Construction Tax"]', rating: 4.4, reviews: 55 },
  { name: 'Citra Maharani', email: 'citra@taxconsult.id', phone: '08123456716', npwp: '123456789012360', cert_level: 'A', price: 130000, bio: 'Ex-banker turned tax consultant. Expert in financial analysis and helping freelancers manage irregular income.', specializations: '["PPh 21","SPT Tahunan","Freelance Tax","Financial Planning"]', rating: 4.6, reviews: 91 },
  { name: 'Yusuf Ismail', email: 'yusuf@taxconsult.id', phone: '08123456717', npwp: '123456789012361', cert_level: 'C', price: 380000, bio: '25 years in taxation. Former head of tax at a multinational. Now helping Indonesian businesses grow compliantly.', specializations: '["International Tax","Corporate Tax","PPh 23","PPh 21","Tax Strategy","M&A Tax"]', rating: 5.0, reviews: 398 },
  { name: 'Tika Handayani', email: 'tika@taxconsult.id', phone: '08123456718', npwp: '123456789012362', cert_level: 'B', price: 200000, bio: 'Healthcare and medical professional tax specialist. Understanding the unique needs of doctors and clinics.', specializations: '["PPh 21","PPN","Healthcare Tax","Professional Tax"]', rating: 4.3, reviews: 48 },
  { name: 'Gilang Permana', email: 'gilang@taxconsult.id', phone: '08123456719', npwp: '123456789012363', cert_level: 'A', price: 105000, bio: 'Fresh and energetic approach to tax. Favorite among startup founders and young entrepreneurs.', specializations: '["PPH Final","PPh 21","Startup Tax","UMKM Tax"]', rating: 4.2, reviews: 38 },
  { name: 'Wulan Sari', email: 'wulan@taxconsult.id', phone: '08123456720', npwp: '123456789012364', cert_level: 'B', price: 275000, bio: 'Import-export tax expert. Handling PIB, PEB, customs valuation, and international trade compliance.', specializations: '["PPN","PPh 23","International Tax","Customs","Import Export"]', rating: 4.7, reviews: 112 },
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
