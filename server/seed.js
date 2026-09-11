const path = require('path');
const Database = require('better-sqlite3');
const db = new Database(path.join(__dirname, 'data.db'));
db.pragma('foreign_keys = ON');

const subjectId = db.prepare('INSERT OR IGNORE INTO subjects (name) VALUES (?)').run('Informatika').lastInsertRowid
  || db.prepare('SELECT id FROM subjects WHERE name = ?').get('Informatika').id;

const insYear = db.prepare('INSERT OR IGNORE INTO years (subject_id, year, stage) VALUES (?, ?, ?)');
const insTopic = db.prepare('INSERT OR IGNORE INTO topics (subject_id, name) VALUES (?, ?)');
const getYear = db.prepare('SELECT id FROM years WHERE subject_id = ? AND year = ? AND stage = ?');
const getTopic = db.prepare('SELECT id FROM topics WHERE subject_id = ? AND name = ?');

const years = [
  [2022, 'Respublika'], [2023, 'Respublika'], [2024, 'Respublika'],
  [2024, 'Viloyat'], [2025, 'Respublika'],
];
const topicsList = ['Algoritmlar', 'Dasturlash', 'Mantiqiy masalalar', 'Ma\'lumotlar bazasi', 'Kompyuter tarmoqlari', 'Axborot xavfsizligi'];
for (const [y, s] of years) insYear.run(subjectId, y, s);
for (const t of topicsList) insTopic.run(subjectId, t);

const Q = [
  // [year, stage, topic, question, [a,b,c,d], correct]
  [2022, 'Respublika', 'Algoritmlar', 'Algoritmning asosiy xususiyatlaridan biri qaysi?', ['Cheklilik', 'Tasodifiylik', 'Nomutanosiblik', 'Takrorlanmaslik'], 0],
  [2022, 'Respublika', 'Dasturlash', 'Python\'da print() funksiyasi nima uchun ishlatiladi?', ['Fayl o\'qish', 'Ekranga chiqarish', 'Kiritish', 'Hisoblash'], 1],
  [2022, 'Respublika', 'Mantiqiy masalalar', '1 dan 100 gacha bo\'lgan sonlar yig\'indisi nechaga teng?', ['5000', '4950', '5050', '5051'], 2],
  [2023, 'Respublika', 'Algoritmlar', 'Chiziqli algoritm qanday algoritm?', ['Tarmoqlanuvchi', 'Takrorlanuvchi', 'Ketma-ket bajariladigan', 'Rekursiv'], 2],
  [2023, 'Respublika', 'Dasturlash', 'Quyidagilardan qaysi biri Python\'da o\'zgaruvchi nomi bo\'la olmaydi?', ['son1', '_temp', '2var', 'natija'], 2],
  [2023, 'Respublika', 'Kompyuter tarmoqlari', 'TCP/IP modeli nechta qatlamdan iborat?', ['3', '4', '5', '7'], 1],
  [2023, 'Respublika', 'Mantiqiy masalalar', 'Bir karopkada 5 ta qizil va 3 ta ko\'k shar bor. Tasodifiy bitta olinganda qizil shar chiqish ehtimoli qancha?', ['3/8', '5/8', '1/2', '5/3'], 1],
  [2024, 'Respublika', 'Algoritmlar', '2 + 2 * 3 ifodasining qiymati nechaga teng?', ['12', '8', '10', '14'], 1],
  [2024, 'Respublika', 'Algoritmlar', 'Algoritm blok-sxemasida romb shakli nimani anglatadi?', ['Boshlanish', 'Kiritish/chiqarish', 'Shart tekshiruvi', 'Jarayon'], 2],
  [2024, 'Respublika', 'Dasturlash', 'Python dasturlash tilida ro\'yxat (list) qanday belgilar bilan yaratiladi?', ['( )', '[ ]', '{ }', '< >'], 1],
  [2024, 'Respublika', 'Ma\'lumotlar bazasi', 'SQL da ma\'lumotlarni qidirish uchun qaysi operator ishlatiladi?', ['FIND', 'GET', 'SELECT', 'SEARCH'], 2],
  [2024, 'Viloyat', 'Algoritmlar', 'Quyidagi algoritm qaysi turga kiradi: birinchi qadamdan boshlab har bir qadamni ketma-ket bajarish?', ['Tarmoqlanuvchi', 'Takrorlanuvchi', 'Chiziqli', 'Rekursiv'], 2],
  [2024, 'Viloyat', 'Dasturlash', 'Python\'da for tsikli necha marta ishlaydi, agar range(5) yozilsa?', ['4', '5', '6', 'Cheksiz'], 1],
  [2025, 'Respublika', 'Algoritmlar', 'Euklid algoritmi nima uchun ishlatiladi?', ['Eng katta umumiy bo\'luvchini topish', 'Sonlarni tartiblash', 'Kvadrat ildiz', 'Faktorial hisoblash'], 0],
  [2025, 'Respublika', 'Axborot xavfsizligi', 'Parol sifatida qaysi biri eng ishonchli?', ['123456', 'qwerty', 'B7#kP9$mQ2', 'parol'], 2],
  [2025, 'Respublika', 'Mantiqiy masalalar', 'Agar bugun payshanba bo\'lsa, 100 kun keyin qanday kun bo\'ladi?', ['Payshanba', 'Juma', 'Shanba', 'Yakshanba'], 2],
];

const insQ = db.prepare(`INSERT OR IGNORE INTO questions (year_id, topic_id, question_text, options, correct_answer)
  VALUES (?, ?, ?, ?, ?)`);
const count = db.prepare('SELECT COUNT(*) n FROM questions').get().n;
if (count === 0) {
  const tx = db.transaction(() => {
    for (const [y, s, t, text, opts, correct] of Q) {
      const yr = getYear.get(subjectId, y, s);
      const tp = getTopic.get(subjectId, t);
      insQ.run(yr.id, tp.id, text, JSON.stringify(opts), correct);
    }
  });
  tx();
  console.log(`Seed: ${Q.length} ta namuna savol qo'shildi.`);
} else {
  console.log('Baza allaqachon ma\'lumotga ega, seed o\'tkazildi.');
}
