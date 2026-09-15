const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');
const Database = require('better-sqlite3');


const PORT = process.env.PORT || 5000;

const db = new Database(
  path.join(__dirname, 'data.db')
);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');


// =====================================================
// DATABASE
// =====================================================

db.exec(`
CREATE TABLE IF NOT EXISTS subjects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS years (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  subject_id INTEGER NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  stage TEXT NOT NULL DEFAULT 'Respublika',
  UNIQUE(subject_id, year, stage)
);

CREATE TABLE IF NOT EXISTS topics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  subject_id INTEGER NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  UNIQUE(subject_id, name)
);

CREATE TABLE IF NOT EXISTS questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  year_id INTEGER NOT NULL REFERENCES years(id) ON DELETE CASCADE,
  topic_id INTEGER REFERENCES topics(id) ON DELETE SET NULL,
  question_text TEXT NOT NULL,
  image_url TEXT,
  options TEXT NOT NULL,
  correct_answer INTEGER NOT NULL DEFAULT 0,
  source_note TEXT
);

CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  subject_id INTEGER NOT NULL,
  mode TEXT NOT NULL DEFAULT 'mixed',
  started_at TEXT DEFAULT (datetime('now')),
  finished_at TEXT,
  total INTEGER DEFAULT 0,
  correct_count INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS practice_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  chosen INTEGER,
  is_correct INTEGER NOT NULL DEFAULT 0,
  attempted_at TEXT DEFAULT (datetime('now'))
);
`);



// =====================================================
// APP
// =====================================================

const app = express();

app.use(cors());

app.use(
  express.json({
    limit: '10mb',
  })
);


// =====================================================
// UPLOADS
// =====================================================

const uploadsDir = path.join(
  __dirname,
  'uploads'
);

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

app.use(
  '/uploads',
  express.static(uploadsDir)
);


// =====================================================
// IMAGE UPLOAD
// =====================================================

const diskStorage = multer.diskStorage({
  destination: uploadsDir,

  filename: (req, file, cb) => {
    const ext = path
      .extname(file.originalname)
      .toLowerCase();

    cb(
      null,
      `${Date.now()}-${Math.round(
        Math.random() * 1e9
      )}${ext}`
    );
  },
});

const imageUpload = multer({
  storage: diskStorage,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    const ok =
      /image\/(png|jpe?g|gif|webp|svg)/.test(
        file.mimetype
      );

    cb(
      ok
        ? null
        : new Error(
            'Faqat rasm fayllari (png, jpg, gif, webp, svg)'
          ),
      ok
    );
  },
});


const memUpload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 15 * 1024 * 1024,
  },
});


// =====================================================
// ERROR WRAPPER
// =====================================================

const wrap = (fn) => (req, res) => {
  try {
    fn(req, res);
  } catch (e) {
    res.status(500).json({
      error: e.message,
    });
  }
};


// =====================================================
// TEXT SIMILARITY
// =====================================================

const tokens = (text) =>
  (text || '')
    .toLowerCase()
    .replace(
      /[^\p{L}\p{N}\s]/gu,
      ' '
    )
    .split(/\s+/)
    .filter(
      (w) => w.length > 2
    );


const bigrams = (text) => {
  const t = tokens(text);

  const out = [];

  for (
    let i = 0;
    i < t.length - 1;
    i++
  ) {
    out.push(
      t[i] + ' ' + t[i + 1]
    );
  }

  return out;
};


const jaccard = (a, b) => {
  if (!a.size || !b.size) {
    return 0;
  }

  let inter = 0;

  for (const x of a) {
    if (b.has(x)) {
      inter++;
    }
  }

  return (
    inter /
    (a.size + b.size - inter)
  );
};


// =====================================================
// SUBJECTS
// =====================================================

app.get(
  '/api/subjects',
  wrap((req, res) => {
    res.json(
      db
        .prepare(`
          SELECT s.*,

            (
              SELECT COUNT(*)
              FROM years y
              WHERE y.subject_id = s.id
            ) years_count,

            (
              SELECT COUNT(*)
              FROM topics t
              WHERE t.subject_id = s.id
            ) topics_count,

            (
              SELECT COUNT(*)
              FROM questions q
              JOIN years y
                ON y.id = q.year_id
              WHERE y.subject_id = s.id
            ) questions_count

          FROM subjects s

          ORDER BY s.name
        `)
        .all()
    );
  })
);


app.post(
  '/api/subjects',
  wrap((req, res) => {
    const name = String(
      req.body.name || ''
    ).trim();

    if (!name) {
      return res.status(400).json({
        error: "Fan nomi bo'sh",
      });
    }

    try {
      res.status(201).json({
        id: db
          .prepare(
            'INSERT INTO subjects (name) VALUES (?)'
          )
          .run(name)
          .lastInsertRowid,
      });
    } catch {
      res.status(400).json({
        error:
          'Bu fan allaqachon mavjud',
      });
    }
  })
);


app.delete(
  '/api/subjects/:id',
  wrap((req, res) => {
    db
      .prepare(
        'DELETE FROM subjects WHERE id = ?'
      )
      .run(req.params.id);

    res.json({
      ok: true,
    });
  })
);


// =====================================================
// YEARS
// =====================================================

app.get(
  '/api/years',
  wrap((req, res) => {
    res.json(
      db
        .prepare(`
          SELECT y.*,

            (
              SELECT COUNT(*)
              FROM questions q
              WHERE q.year_id = y.id
            ) questions_count

          FROM years y

          WHERE y.subject_id = ?

          ORDER BY
            y.year DESC,
            y.stage
        `)
        .all(req.query.subjectId)
    );
  })
);


app.post(
  '/api/years',
  wrap((req, res) => {
    const {
      subjectId,
      year,
      stage = 'Respublika',
    } = req.body;

    const y = Number(year);

    if (!subjectId || !y) {
      return res.status(400).json({
        error: 'Fan va yil kerak',
      });
    }

    try {
      res.status(201).json({
        id: db
          .prepare(`
            INSERT INTO years
              (subject_id, year, stage)
            VALUES (?, ?, ?)
          `)
          .run(
            subjectId,
            y,
            String(stage).trim() ||
              'Respublika'
          )
          .lastInsertRowid,
      });
    } catch {
      res.status(400).json({
        error:
          "Bu yil/bosqich allaqachon qo'shilgan",
      });
    }
  })
);


app.delete(
  '/api/years/:id',
  wrap((req, res) => {
    db
      .prepare(
        'DELETE FROM years WHERE id = ?'
      )
      .run(req.params.id);

    res.json({
      ok: true,
    });
  })
);


// =====================================================
// TOPICS
// =====================================================

app.get(
  '/api/topics',
  wrap((req, res) => {
    res.json(
      db
        .prepare(`
          SELECT t.*,

            (
              SELECT COUNT(*)
              FROM questions q
              WHERE q.topic_id = t.id
            ) questions_count

          FROM topics t

          WHERE t.subject_id = ?

          ORDER BY t.name
        `)
        .all(req.query.subjectId)
    );
  })
);


app.post(
  '/api/topics',
  wrap((req, res) => {
    const {
      subjectId,
      name,
    } = req.body;

    const n = String(
      name || ''
    ).trim();

    if (!subjectId || !n) {
      return res.status(400).json({
        error:
          'Fan va mavzu nomi kerak',
      });
    }

    try {
      res.status(201).json({
        id: db
          .prepare(`
            INSERT INTO topics
              (subject_id, name)
            VALUES (?, ?)
          `)
          .run(
            subjectId,
            n
          )
          .lastInsertRowid,
      });
    } catch {
      res.status(400).json({
        error:
          'Bu mavzu allaqachon mavjud',
      });
    }
  })
);


app.delete(
  '/api/topics/:id',
  wrap((req, res) => {
    db
      .prepare(
        'DELETE FROM topics WHERE id = ?'
      )
      .run(req.params.id);

    res.json({
      ok: true,
    });
  })
);


// =====================================================
// QUESTIONS
// =====================================================

const parseQ = (r) => ({
  ...r,
  options: JSON.parse(r.options),
});

// Variantlarni aralashtiradi va to'g'ri javob indeksini yangilaydi
function shuffleOptions(q) {
  const opts = [...q.options];
  const correct = q.correct_answer ?? 0;
  const indices = [0, 1, 2, 3];
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  const shuffled = indices.map((i) => opts[i]);
  const newCorrect = indices.indexOf(correct);
  return { ...q, options: shuffled, correct_answer: newCorrect };
}


app.get(
  '/api/questions',
  wrap((req, res) => {
    const {
      subjectId,
      yearId,
      topicId,
      search = '',
    } = req.query;

    let sql = `
      SELECT
        q.*,
        t.name topic_name,
        y.year,
        y.stage

      FROM questions q

      JOIN years y
        ON y.id = q.year_id

      LEFT JOIN topics t
        ON t.id = q.topic_id

      WHERE y.subject_id = ?
    `;

    const params = [
      subjectId,
    ];

    if (yearId) {
      sql +=
        ' AND q.year_id = ?';

      params.push(yearId);
    }

    if (topicId) {
      sql +=
        ' AND q.topic_id = ?';

      params.push(topicId);
    }

    if (search) {
      sql +=
        ' AND q.question_text LIKE ?';

      params.push(
        `%${search}%`
      );
    }

    sql += `
      ORDER BY
        y.year DESC,
        q.id DESC

      LIMIT 1000
    `;

    res.json(
      db
        .prepare(sql)
        .all(...params)
        .map(parseQ)
    );
  })
);


app.get(
  '/api/questions/:id',
  wrap((req, res) => {
    const r = db
      .prepare(`
        SELECT
          q.*,
          t.name topic_name,
          y.year,
          y.stage,
          y.subject_id

        FROM questions q

        JOIN years y
          ON y.id = q.year_id

        LEFT JOIN topics t
          ON t.id = q.topic_id

        WHERE q.id = ?
      `)
      .get(req.params.id);

    if (!r) {
      return res.status(404).json({
        error: 'Savol topilmadi',
      });
    }

    res.json(
      parseQ(r)
    );
  })
);


app.post(
  '/api/questions',
  wrap((req, res) => {
    const {
      yearId,
      topicId = null,
      questionText,
      imageUrl = null,
      options,
      correctAnswer,
      sourceNote = null,
    } = req.body;

    if (
      !yearId ||
      !String(
        questionText || ''
      ).trim()
    ) {
      return res.status(400).json({
        error:
          'Yil va savol matni kerak',
      });
    }

    if (
      !Array.isArray(options) ||
      options.length < 2 ||
      options.some(
        (o) =>
          !String(o).trim()
      )
    ) {
      return res.status(400).json({
        error:
          'Kamida 2 ta variant kerak',
      });
    }

    const c =
      Number(correctAnswer);

    if (
      !(c >= 0 && c < options.length)
    ) {
      return res.status(400).json({
        error:
          "To'g'ri javob noto'g'ri",
      });
    }

    res.status(201).json({
      id: db
        .prepare(`
          INSERT INTO questions
            (
              year_id,
              topic_id,
              question_text,
              image_url,
              options,
              correct_answer,
              source_note
            )

          VALUES
            (?, ?, ?, ?, ?, ?, ?)
        `)
        .run(
          yearId,
          topicId,
          String(
            questionText
          ).trim(),
          imageUrl,
          JSON.stringify(
            options
          ),
          c,
          sourceNote
            ? String(
                sourceNote
              ).trim()
            : null
        )
        .lastInsertRowid,
    });
  })
);


app.put(
  '/api/questions/:id',
  wrap((req, res) => {
    const {
      yearId,
      topicId = null,
      questionText,
      imageUrl = null,
      options,
      correctAnswer,
      sourceNote = null,
    } = req.body;

    if (
      !yearId ||
      !String(
        questionText || ''
      ).trim()
    ) {
      return res.status(400).json({
        error:
          'Yil va savol matni kerak',
      });
    }

    if (
      !Array.isArray(options) ||
      options.length < 2 ||
      options.some(
        (o) =>
          !String(o).trim()
      )
    ) {
      return res.status(400).json({
        error:
          "Variantlar to'liq emas",
      });
    }

    const c =
      Number(correctAnswer);

    if (
      !(c >= 0 && c < options.length)
    ) {
      return res.status(400).json({
        error:
          "To'g'ri javob noto'g'ri",
      });
    }

    db
      .prepare(`
        UPDATE questions

        SET
          year_id = ?,
          topic_id = ?,
          question_text = ?,
          image_url = ?,
          options = ?,
          correct_answer = ?,
          source_note = ?

        WHERE id = ?
      `)
      .run(
        yearId,
        topicId,
        String(
          questionText
        ).trim(),
        imageUrl,
        JSON.stringify(
          options
        ),
        c,
        sourceNote
          ? String(
              sourceNote
            ).trim()
          : null,
        req.params.id
      );

    res.json({
      ok: true,
    });
  })
);


app.delete(
  '/api/questions/:id',
  wrap((req, res) => {
    db
      .prepare(
        'DELETE FROM questions WHERE id = ?'
      )
      .run(req.params.id);

    res.json({
      ok: true,
    });
  })
);


// =====================================================
// IMAGE UPLOAD API
// =====================================================

app.post(
  '/api/upload',
  imageUpload.single('image'),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        error:
          'Rasm yuklanmadi',
      });
    }

    res.json({
      url:
        `/uploads/${req.file.filename}`,
    });
  }
);


// =====================================================
// EXCEL / CSV IMPORT
// =====================================================

app.get(
  '/api/import-template',
  (req, res) => {
    const rows = [
      {
        year: 2024,
        stage: 'Respublika',
        topic: 'Algoritmlar',
        question:
          '2 + 2 * 3 ifodaning qiymati nechaga teng?',
        a: '8',
        b: '10',
        c: '12',
        d: '14',
        correct: 'B',
        note: '',
      },

      {
        year: 2024,
        stage: 'Respublika',
        topic: 'Dasturlash',
        question:
          "Python dasturlash tilida ro'yxat (list) qanday belgilar bilan yaratiladi?",
        a: '( )',
        b: '[ ]',
        c: '{ }',
        d: '< >',
        correct: 'B',
        note: '',
      },

      {
        year: 2025,
        stage: 'Viloyat',
        topic: 'Algoritmlar',
        question:
          'Quyidagi algoritm qaysi turga kiradi: birinchi qadamdan boshlab har bir qadamni ketma-ket bajarish?',
        a: 'Tarmoqlanuvchi',
        b: 'Takrorlanuvchi',
        c: 'Chiziqli',
        d: 'Rekursiv',
        correct: 'C',
        note: '',
      },
    ];

    const ws =
      XLSX.utils.json_to_sheet(
        rows
      );

    ws['!cols'] = [
      { wch: 8 },
      { wch: 12 },
      { wch: 16 },
      { wch: 70 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 8 },
      { wch: 20 },
    ];

    const wb =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      wb,
      ws,
      'Savollar'
    );

    const buf =
      XLSX.write(wb, {
        type: 'buffer',
        bookType: 'xlsx',
      });

    res.setHeader(
      'Content-Disposition',
      'attachment; filename="savollar_shablon.xlsx"'
    );

    res.type(
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );

    res.send(buf);
  }
);


app.post(
  '/api/import',
  memUpload.single('file'),
  wrap((req, res) => {
    const subjectId =
      Number(
        req.body.subjectId
      );

    if (!subjectId) {
      return res.status(400).json({
        error:
          'Fan tanlanmagan',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        error:
          'Fayl yuklanmadi',
      });
    }

    const wb = XLSX.read(
      req.file.buffer,
      {
        type: 'buffer',
      }
    );

    const sheet =
      wb.Sheets[
        wb.SheetNames[0]
      ];

    const rows =
      XLSX.utils.sheet_to_json(
        sheet,
        {
          defval: '',
        }
      );

    if (!rows.length) {
      return res.status(400).json({
        error:
          'Faylda qatorlar topilmadi',
      });
    }

    const findYear =
      db.prepare(`
        SELECT id
        FROM years

        WHERE
          subject_id = ?
          AND year = ?
          AND stage = ?
      `);

    const insYear =
      db.prepare(`
        INSERT INTO years
          (
            subject_id,
            year,
            stage
          )

        VALUES
          (?, ?, ?)
      `);

    const findTopic =
      db.prepare(`
        SELECT id
        FROM topics

        WHERE
          subject_id = ?
          AND name = ?
      `);

    const insTopic =
      db.prepare(`
        INSERT INTO topics
          (
            subject_id,
            name
          )

        VALUES
          (?, ?)
      `);

    const insQ =
      db.prepare(`
        INSERT INTO questions
          (
            year_id,
            topic_id,
            question_text,
            options,
            correct_answer,
            source_note
          )

        VALUES
          (?, ?, ?, ?, ?, ?)
      `);

    let inserted = 0;

    const errors = [];

    const letterMap = {
      a: 0,
      b: 1,
      c: 2,
      d: 3,
    };

    const tx =
      db.transaction(() => {
        rows.forEach(
          (r, i) => {
            const line =
              i + 2;

            const year =
              Number(r.year);

            const stage =
              String(
                r.stage || ''
              ).trim() ||
              'Respublika';

            const topic =
              String(
                r.topic || ''
              ).trim();

            const text =
              String(
                r.question || ''
              ).trim();

            if (!year || !text) {
              errors.push(
                `${line}-qator: yil yoki savol matni yo'q`
              );

              return;
            }

            let y =
              findYear.get(
                subjectId,
                year,
                stage
              );

            if (!y) {
              y = {
                id: insYear.run(
                  subjectId,
                  year,
                  stage
                ).lastInsertRowid,
              };
            }

            let t = null;

            if (topic) {
              t =
                findTopic.get(
                  subjectId,
                  topic
                );

              if (!t) {
                t = {
                  id: insTopic.run(
                    subjectId,
                    topic
                  ).lastInsertRowid,
                };
              }
            }

            const opts =
              [
                'a',
                'b',
                'c',
                'd',
              ].map(
                (k) =>
                  String(
                    r[k] ?? ''
                  ).trim()
              );

            if (
              opts.some(
                (o) => !o
              )
            ) {
              errors.push(
                `${line}-qator: variantlar to'liq emas`
              );

              return;
            }

            let correct =
              r.correct;

            if (
              typeof correct ===
              'string'
            ) {
              correct =
                letterMap[
                  correct
                    .trim()
                    .toLowerCase()
                ];

              if (
                correct ===
                undefined
              ) {
                correct =
                  Number(
                    r.correct
                  ) - 1;
              }
            } else {
              correct =
                Number(
                  correct
                ) - 1;
            }

            if (
              !(
                correct >= 0 &&
                correct <= 3
              )
            ) {
              errors.push(
                `${line}-qator: to'g'ri javob belgilanmagan`
              );

              return;
            }

            insQ.run(
              y.id,
              t
                ? t.id
                : null,
              text,
              JSON.stringify(
                opts
              ),
              correct,
              String(
                r.note || ''
              ).trim() ||
                null
            );

            inserted++;
          }
        );
      });

    tx();

    res.json({
      inserted,
      errors,
      total: rows.length,
    });
  })
);


// =====================================================
// ANALYSIS
// =====================================================

app.get(
  '/api/analysis/matrix/:subjectId',
  wrap((req, res) => {
    const subjectId =
      req.params.subjectId;

    const years =
      db
        .prepare(`
          SELECT *

          FROM years

          WHERE subject_id = ?

          ORDER BY
            year DESC,
            stage
        `)
        .all(subjectId);

    const raw =
      db
        .prepare(`
          SELECT
            t.id topic_id,
            t.name topic,
            y.id year_id,
            COUNT(q.id) n

          FROM topics t

          LEFT JOIN years y
            ON y.subject_id =
              t.subject_id

          LEFT JOIN questions q
            ON q.topic_id = t.id
            AND q.year_id = y.id

          WHERE t.subject_id = ?

          GROUP BY
            t.id,
            y.id
        `)
        .all(subjectId);

    const map = {};

    for (const r of raw) {
      if (!map[r.topic_id]) {
        map[r.topic_id] = {
          topic_id:
            r.topic_id,

          topic:
            r.topic,

          counts: {},

          total: 0,
        };
      }

      if (r.year_id) {
        map[r.topic_id]
          .counts[r.year_id] =
          r.n;

        map[r.topic_id]
          .total += r.n;
      }
    }

    const rows =
      Object.values(
        map
      ).sort(
        (a, b) =>
          b.total -
          a.total
      );

    const top =
      rows
        .map((r) => ({
          topic_id:
            r.topic_id,

          topic:
            r.topic,

          total:
            r.total,
        }))
        .sort(
          (a, b) =>
            b.total -
            a.total
        )
        .slice(0, 15);

    res.json({
      years,
      rows,
      top,
    });
  })
);


app.get(
  '/api/analysis/similar/:id',
  wrap((req, res) => {
    const q =
      db
        .prepare(`
          SELECT
            q.*,
            y.subject_id

          FROM questions q

          JOIN years y
            ON y.id = q.year_id

          WHERE q.id = ?
        `)
        .get(req.params.id);

    if (!q) {
      return res.status(404).json({
        error:
          'Savol topilmadi',
      });
    }

    const others =
      db
        .prepare(`
          SELECT
            q.id,
            q.question_text,
            y.year,
            y.stage,
            t.name topic_name

          FROM questions q

          JOIN years y
            ON y.id = q.year_id

          LEFT JOIN topics t
            ON t.id = q.topic_id

          WHERE
            y.subject_id = ?
            AND q.id != ?
        `)
        .all(
          q.subject_id,
          q.id
        );

    const baseT =
      new Set(
        tokens(
          q.question_text
        )
      );

    const baseB =
      new Set(
        bigrams(
          q.question_text
        )
      );

    const scored =
      others
        .map((o) => {
          const s =
            0.6 *
              jaccard(
                baseT,
                new Set(
                  tokens(
                    o.question_text
                  )
                )
              ) +
            0.4 *
              jaccard(
                baseB,
                new Set(
                  bigrams(
                    o.question_text
                  )
                )
              );

          return {
            ...o,
            score:
              Math.round(
                s * 100
              ),
          };
        })
        .filter(
          (s) =>
            s.score >= 25
        )
        .sort(
          (a, b) =>
            b.score -
            a.score
        )
        .slice(0, 10);

    res.json(
      scored
    );
  })
);


// =====================================================
// PRACTICE
// =====================================================

app.post(
  '/api/practice/start',
  wrap((req, res) => {
    const {
      subjectId,
      topicId = null,
      yearId = null,
      count = 20,
      wrongOnly = false,
    } = req.body;

    let sql = `
      SELECT
        q.*,
        t.name topic_name,
        y.year,
        y.stage

      FROM questions q

      JOIN years y
        ON y.id = q.year_id

      LEFT JOIN topics t
        ON t.id = q.topic_id

      WHERE y.subject_id = ?
    `;

    const params = [
      subjectId,
    ];

    if (topicId) {
      sql +=
        ' AND q.topic_id = ?';

      params.push(
        topicId
      );
    }

    if (yearId) {
      sql +=
        ' AND q.year_id = ?';

      params.push(
        yearId
      );
    }

    if (wrongOnly) {
      sql += `
        AND q.id IN (
          SELECT question_id
          FROM practice_results
          WHERE is_correct = 0
        )
      `;
    }

    sql += `
      ORDER BY RANDOM()
      LIMIT ?
    `;

    params.push(
      Math.min(
        Math.max(
          Number(count) ||
            20,
          1
        ),
        200
      )
    );

    const questions =
      db
        .prepare(sql)
        .all(...params);

    if (!questions.length) {
      return res.status(400).json({
        error:
          "Bu filtr bo'yicha savol topilmadi",
      });
    }

    const mode =
      wrongOnly
        ? 'wrong'
        : topicId
        ? 'topic'
        : yearId
        ? 'year'
        : 'mixed';

    const sessionId =
      db
        .prepare(`
          INSERT INTO sessions
            (
              subject_id,
              mode
            )

          VALUES
            (?, ?)
        `)
        .run(
          subjectId,
          mode
        )
        .lastInsertRowid;

    res.json({
      sessionId,

      questions:
        questions.map((q) => {
          const parsed = parseQ(q);
          const shuffled = shuffleOptions(parsed);
          const { correct_answer, ...rest } = shuffled;
          return rest;
        }),
    });
  })
);


app.post(
  '/api/practice/submit',
  wrap((req, res) => {
    const {
      sessionId,
      answers,
    } = req.body;

    if (
      !sessionId ||
      !Array.isArray(
        answers
      )
    ) {
      return res.status(400).json({
        error:
          "Noto'g'ri so'rov",
      });
    }

    const getQ =
      db.prepare(`
        SELECT *
        FROM questions
        WHERE id = ?
      `);

    const ins =
      db.prepare(`
        INSERT INTO practice_results
          (
            session_id,
            question_id,
            chosen,
            is_correct
          )

        VALUES
          (?, ?, ?, ?)
      `);

    const upd =
      db.prepare(`
        UPDATE sessions

        SET
          finished_at =
            datetime('now'),

          total = ?,

          correct_count = ?

        WHERE id = ?
      `);

    let correct = 0;

    const details = [];

    const tx =
      db.transaction(() => {
        for (
          const a of answers
        ) {
          const q =
            getQ.get(
              a.questionId
            );

          if (!q) {
            continue;
          }

          const ok =
            a.chosen ===
            q.correct_answer
              ? 1
              : 0;

          correct += ok;

          ins.run(
            sessionId,
            a.questionId,
            a.chosen ??
              null,
            ok
          );

          details.push({
            ...parseQ(q),

            chosen:
              a.chosen ??
              null,

            is_correct:
              ok,
          });
        }

        upd.run(
          answers.length,
          correct,
          sessionId
        );
      });

    tx();

    res.json({
      total:
        answers.length,

      correct,

      details,
    });
  })
);


app.get(
  '/api/practice/wrong/:subjectId',
  wrap((req, res) => {
    const rows =
      db
        .prepare(`
          SELECT
            q.*,
            t.name topic_name,
            y.year,
            y.stage,

            SUM(
              pr.is_correct = 0
            ) wrong_count,

            MAX(
              pr.attempted_at
            ) last_wrong

          FROM practice_results pr

          JOIN questions q
            ON q.id =
              pr.question_id

          JOIN years y
            ON y.id =
              q.year_id

          LEFT JOIN topics t
            ON t.id =
              q.topic_id

          WHERE
            y.subject_id = ?

          GROUP BY q.id

          HAVING
            wrong_count > 0

          ORDER BY
            wrong_count DESC,
            last_wrong DESC
        `)
        .all(
          req.params.subjectId
        );

    res.json(
      rows.map(parseQ)
    );
  })
);


// =====================================================
// STATS
// =====================================================

app.get(
  '/api/stats/:subjectId',
  wrap((req, res) => {
    const subjectId =
      req.params.subjectId;

    const totals =
      db
        .prepare(`
          SELECT
            COUNT(*) n

          FROM questions q

          JOIN years y
            ON y.id =
              q.year_id

          WHERE
            y.subject_id = ?
        `)
        .get(
          subjectId
        );

    const att =
      db
        .prepare(`
          SELECT
            COUNT(*) n,

            COALESCE(
              SUM(
                pr.is_correct
              ),
              0
            ) c

          FROM practice_results pr

          JOIN sessions s
            ON s.id =
              pr.session_id

          WHERE
            s.subject_id = ?
        `)
        .get(
          subjectId
        );

    const sessions =
      db
        .prepare(`
          SELECT *

          FROM sessions

          WHERE
            subject_id = ?

          ORDER BY
            id DESC

          LIMIT 10
        `)
        .all(
          subjectId
        );

    const byTopic =
      db
        .prepare(`
          SELECT
            t.name topic,

            COUNT(*) attempted,

            COALESCE(
              SUM(
                pr.is_correct
              ),
              0
            ) correct

          FROM practice_results pr

          JOIN questions q
            ON q.id =
              pr.question_id

          JOIN sessions s
            ON s.id =
              pr.session_id

          LEFT JOIN topics t
            ON t.id =
              q.topic_id

          WHERE
            s.subject_id = ?

          GROUP BY
            q.topic_id

          ORDER BY
            attempted DESC
        `)
        .all(
          subjectId
        );

    res.json({
      totalQuestions:
        totals.n,

      attempted:
        att.n,

      correct:
        att.c,

      accuracy:
        att.n
          ? Math.round(
              (att.c /
                att.n) *
                100
            )
          : 0,

      sessions,

      byTopic,
    });
  })
);


// =====================================================
// ADMIN AUTH
// =====================================================

app.post('/api/admin/login', (req, res) => {
  const { login, password } = req.body;
  const correctLogin    = process.env.ADMIN_LOGIN    || 'admin';
  const correctPassword = process.env.ADMIN_PASSWORD || 'admin123';

  if (login === correctLogin && password === correctPassword) {
    return res.json({ ok: true });
  }
  res.status(401).json({ error: 'Login yoki parol noto\'g\'ri' });
});



// =====================================================
// PRODUCTION CLIENT
// =====================================================

const clientDist =
  path.join(
    __dirname,
    '..',
    'client',
    'dist'
  );

if (
  fs.existsSync(
    clientDist
  )
) {
  app.use(
    express.static(
      clientDist
    )
  );

  app.get(
    '*',
    (req, res) =>
      res.sendFile(
        path.join(
          clientDist,
          'index.html'
        )
      )
  );
}


// =====================================================
// START SERVER
// =====================================================

app.listen(
  PORT,
  () => {
    console.log(
      `Server: http://localhost:${PORT}`
    );
  }
);