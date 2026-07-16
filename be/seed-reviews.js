const Database = require('better-sqlite3');
const { v4: uuidv4 } = require('uuid');

const db = new Database('/usr/local/projects/services/indonesia-tax-app/be/data/tax-app.db');
db.pragma('foreign_keys = OFF');

const sampleReviews = [
  "Sangat membantu! Konsultasi berjalan lancar dan SPT saya selesai tepat waktu.",
  "Profesional dan ramah. Penjelasannya mudah dipahami untuk pemula seperti saya.",
  "Layanan cepat dan akurat. Harga sangat worth it untuk konsultasi pajak.",
  "Saya sangat puas dengan hasilnya. Konsultan sangat berpengalaman dan detail.",
  "Terima kasih banyak! Pajak UMKM saya sekarang beres semua.",
  "Bagus banget. Bisa bahasa Inggris juga jadi enak buat yang ga terlalu paham istilah pajak.",
  "Recommended! Sudah beberapa kali pakai jasanya, selalu memuaskan.",
  "Konsultan yang sangat sabar menjelaskan. Cocok untuk yang baru pertama kali lapor pajak.",
  "Excellent service! Very professional and thorough with tax filing.",
  "Saya diajarin step by step. Sekarang jadi lebih paham cara isi SPT sendiri.",
  "Fast response, clear communication. Will use again next year.",
  "Membantu banget buat freelance kayak saya yang income income nggak tetap.",
  "Konsultan terbaik! Sudah 3 tahun pakai jasanya, nggak pernah kecewa.",
  "Dia sangat teliti dan membantu saya menghindari kesalahan fatal di laporan pajak.",
  "Great experience overall. The consultant went above and beyond.",
  "Bener-bener worth it buat harga segitu. Jauh lebih murah daripada KAP tapi kualitas setara.",
  "Puas banget. Prosesnya cepat dan semua dokumen tersimpan rapi.",
  "Sangat recommended untuk perusahaan kecil seperti kami. Bulanan lancar semua.",
  "Konsultan dengan knowledge luas. Bisa handle case kompleks sekalipun.",
  "Friendly dan gak bikin stress. Top markotop!",
];

const existing = db.prepare('SELECT COUNT(*) as cnt FROM reviews').get();
if (existing.cnt > 0) {
  console.log(`${existing.cnt} reviews already exist, clearing...`);
  db.prepare('DELETE FROM reviews').run();
}

const consultants = db.prepare('SELECT id, user_id FROM consultants').all();
let seeded = 0;

for (const c of consultants) {
  const reviewCount = 2 + Math.floor(Math.random() * 8);
  for (let i = 0; i < reviewCount; i++) {
    const rating = Math.random() > 0.7 ? 5 : (Math.random() > 0.4 ? 4 : 3);
    const comment = sampleReviews[Math.floor(Math.random() * sampleReviews.length)];
    const dayOffset = Math.floor(Math.random() * 60);
    const date = new Date(Date.now() - dayOffset * 86400000).toISOString();

    const userId = uuidv4();
    const userName = ['Bambang','Sari','Eko','Putri','Agus','Dina','Hendra','Rina','Dimas','Ani'][Math.floor(Math.random()*10)];
    const userEmail = `reviewer_${uuidv4().slice(0,8)}@example.com`;

    db.prepare(`INSERT OR IGNORE INTO users (id, email, name, role, created_at) VALUES (?, ?, ?, 'user', ?)`).run(userId, userEmail, userName, date);
    db.prepare(`INSERT INTO reviews (id, consultation_id, user_id, consultant_id, rating, comment, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`).run(
      uuidv4(), uuidv4(), userId, c.id, rating, comment, date
    );
    seeded++;
  }
}

console.log(`Seeded ${seeded} reviews across ${consultants.length} consultants`);
db.close();
