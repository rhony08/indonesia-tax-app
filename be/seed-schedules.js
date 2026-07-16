const Database = require('better-sqlite3');
const { v4: uuidv4 } = require('uuid');

const db = new Database('/usr/local/projects/services/indonesia-tax-app/be/data/tax-app.db');
db.pragma('foreign_keys = ON');

const days = [
  { day: 0, start: '08:00', end: '12:00' },
  { day: 1, start: '08:00', end: '17:00' },
  { day: 2, start: '08:00', end: '17:00' },
  { day: 3, start: '08:00', end: '17:00' },
  { day: 4, start: '08:00', end: '17:00' },
  { day: 5, start: '09:00', end: '13:00' },
];

const consultants = db.prepare('SELECT id FROM consultants').all();
const existing = db.prepare('SELECT COUNT(*) as cnt FROM consultant_schedules').get();

if (existing.cnt > 0) {
  console.log('Schedules already exist, clearing and re-seeding...');
  db.prepare('DELETE FROM consultant_schedules').run();
}

for (const { id } of consultants) {
  const workingDays = [1, 2, 3, 4, 5, 6].filter(() => Math.random() > 0.15);
  for (const d of workingDays) {
    const baseStart = 8 + Math.floor(Math.random() * 3);
    const blockCount = 1 + Math.floor(Math.random() * 3);
    for (let i = 0; i < blockCount; i++) {
      const sh = baseStart + i * 3;
      const eh = sh + 2 + Math.floor(Math.random() * 2);
      const start = `${String(sh).padStart(2, '0')}:00`;
      const end = `${String(Math.min(eh, 21)).padStart(2, '0')}:00`;
      db.prepare('INSERT INTO consultant_schedules (id, consultant_id, day_of_week, start_time, end_time, is_active) VALUES (?, ?, ?, ?, ?, 1)').run(
        uuidv4(), id, d, start, end
      );
    }
  }
}

const count = db.prepare('SELECT COUNT(*) as cnt FROM consultant_schedules').get();
console.log(`Seeded ${count.cnt} schedule slots across ${consultants.length} consultants`);
db.close();
