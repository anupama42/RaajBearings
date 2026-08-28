const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const dataDir = path.join(__dirname, '..', 'data');
fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(path.join(dataDir, 'bearings.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sku TEXT NOT NULL,
    name TEXT NOT NULL,
    brand TEXT NOT NULL,
    type TEXT NOT NULL,
    description TEXT NOT NULL,
    price_min REAL NOT NULL,
    price_max REAL NOT NULL,
    moq INTEGER NOT NULL,
    material TEXT NOT NULL,
    inner_diameter TEXT NOT NULL,
    outer_diameter TEXT NOT NULL,
    image_url TEXT NOT NULL,
    filter_a TEXT NOT NULL,
    filter_b TEXT NOT NULL,
    filter_c TEXT NOT NULL,
    filter_d TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS enquiries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    company TEXT,
    message TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (product_id) REFERENCES products(id)
  );

  CREATE TABLE IF NOT EXISTS filter_options (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL CHECK (category IN ('A', 'B', 'C', 'D')),
    value TEXT NOT NULL,
    UNIQUE (category, value)
  );

  CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    company TEXT,
    message TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    login_id TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    city TEXT,
    company TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS enquiry_cart (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE (user_id, product_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
  );
`);

const { migrateCatalog } = require('./migrate');
migrateCatalog(db);

const filterCount = db.prepare('SELECT COUNT(*) AS n FROM filter_options').get().n;
if (filterCount === 0) {
  const insertFilter = db.prepare('INSERT INTO filter_options (category, value) VALUES (?, ?)');
  const seedFilters = db.transaction(() => {
    for (const category of ['A', 'B', 'C', 'D']) {
      for (const n of [1, 2, 3]) {
        insertFilter.run(category, `${category}${n}`);
      }
    }
  });
  seedFilters();
}

module.exports = db;
