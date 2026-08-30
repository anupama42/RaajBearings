const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const db = require('./db');
const { registerAuthRoutes } = require('./auth');
const { registerEnquiryCartRoutes } = require('./enquiry-cart');
const { executeSql, listTables, tableInfo } = require('./db-admin');
const { registerAdminAuthRoutes, requireAdmin } = require('./admin-auth');
const {
  mapProduct,
  productFromBody,
  validateProduct,
  INSERT_SQL,
  UPDATE_SQL
} = require('./product-mapper');
require('./seed');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use('/images', express.static(path.join(__dirname, '..', 'public', 'images')));
app.use('/admin', express.static(path.join(__dirname, '..', 'public', 'admin')));
registerAuthRoutes(app);
registerAdminAuthRoutes(app);
registerEnquiryCartRoutes(app);

app.get('/api/filters', (_req, res) => {
  const rows = db.prepare(`
    SELECT category, value FROM filter_options
    WHERE category IN ('A', 'B', 'C', 'D')
    ORDER BY category, value
  `).all();
  const grouped = {
    discount: [
      { value: '10', label: '10% and above' },
      { value: '20', label: '20% and above' },
      { value: '30', label: '30% and above' },
      { value: '50', label: '50% and above' }
    ],
    A: [],
    B: [],
    C: [],
    D: []
  };
  for (const row of rows) {
    grouped[row.category].push(row.value);
  }
  res.json(grouped);
});

app.post('/api/filters', requireAdmin, (req, res) => {
  const category = String(req.body?.category || '').toUpperCase();
  const value = String(req.body?.value || '').trim();
  if (!['A', 'B', 'C', 'D'].includes(category) || !value) {
    return res.status(400).json({ error: 'category must be A, B, C, or D and value is required' });
  }
  try {
    const result = db.prepare('INSERT INTO filter_options (category, value) VALUES (?, ?)').run(category, value);
    res.status(201).json({ id: Number(result.lastInsertRowid), category, value });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/filters/:id', requireAdmin, (req, res) => {
  const result = db.prepare('DELETE FROM filter_options WHERE id = ?').run(req.params.id);
  if (!result.changes) {
    return res.status(404).json({ error: 'Filter option not found' });
  }
  res.json({ deleted: true });
});

app.get('/api/search-options', (_req, res) => {
  const brands = db.prepare('SELECT DISTINCT brand FROM products ORDER BY brand').all().map((r) => r.brand);
  const types = db.prepare('SELECT DISTINCT type FROM products ORDER BY type').all().map((r) => r.type);
  res.json({ brands, types });
});

app.get('/api/products', (req, res) => {
  const { brand, type, minDiscount, minRating, filterC, filterD, q } = req.query;
  const clauses = [];
  const params = {};

  if (brand) {
    clauses.push('brand = @brand');
    params.brand = String(brand);
  }
  if (type) {
    clauses.push('type = @type');
    params.type = String(type);
  }
  if (minDiscount) {
    clauses.push('discount_percent >= @minDiscount');
    params.minDiscount = Number(minDiscount);
  }
  if (minRating) {
    clauses.push('rating >= @minRating');
    params.minRating = Number(minRating);
  }
  if (filterC) {
    clauses.push('filter_c = @filterC');
    params.filterC = String(filterC);
  }
  if (filterD) {
    clauses.push('filter_d = @filterD');
    params.filterD = String(filterD);
  }
  if (q) {
    clauses.push('(name LIKE @q OR sku LIKE @q OR brand LIKE @q OR type LIKE @q)');
    params.q = `%${String(q)}%`;
  }

  const sql = `SELECT * FROM products ${clauses.length ? 'WHERE ' + clauses.join(' AND ') : ''} ORDER BY id`;
  const rows = db.prepare(sql).all(params);
  res.json(rows.map(mapProduct));
});

app.get('/api/products/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!row) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(mapProduct(row));
});

app.post('/api/products', requireAdmin, (req, res) => {
  const row = productFromBody(req.body);
  const error = validateProduct(row);
  if (error) {
    return res.status(400).json({ error });
  }
  const result = db.prepare(INSERT_SQL).run(row);
  const created = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(mapProduct(created));
});

app.put('/api/products/:id', requireAdmin, (req, res) => {
  const existing = db.prepare('SELECT id FROM products WHERE id = ?').get(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: 'Product not found' });
  }
  const row = { ...productFromBody(req.body), id: Number(req.params.id) };
  const error = validateProduct(row);
  if (error) {
    return res.status(400).json({ error });
  }
  db.prepare(UPDATE_SQL).run(row);
  const updated = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  res.json(mapProduct(updated));
});

app.delete('/api/products/:id', requireAdmin, (req, res) => {
  const deleteProduct = db.transaction((id) => {
    db.prepare('DELETE FROM enquiry_cart WHERE product_id = ?').run(id);
    db.prepare('DELETE FROM enquiries WHERE product_id = ?').run(id);
    return db.prepare('DELETE FROM products WHERE id = ?').run(id);
  });
  const result = deleteProduct(req.params.id);
  if (!result.changes) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json({ deleted: true });
});

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || ''));
}

function isPhone(value) {
  const digits = String(value || '').replace(/\D/g, '');
  const local = digits.length === 12 && digits.startsWith('91') ? digits.slice(2) : digits;
  return /^[6-9]\d{9}$/.test(local);
}

app.post('/api/enquiries', (req, res) => {
  const { productId, name, email, phone, company, city, message } = req.body || {};
  if (!productId || !String(name || '').trim() || !email || !phone || !String(city || '').trim() || !message) {
    return res.status(400).json({ error: 'productId, name, email, phone, city, and message are required' });
  }
  if (!isEmail(email)) {
    return res.status(400).json({ error: 'Enter a valid email address' });
  }
  if (!isPhone(phone)) {
    return res.status(400).json({ error: 'Enter a valid 10-digit mobile number' });
  }
  if (String(city).trim().length < 2) {
    return res.status(400).json({ error: 'Enter a valid city' });
  }

  const product = db.prepare('SELECT id FROM products WHERE id = ?').get(productId);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const result = db.prepare(`
    INSERT INTO enquiries (product_id, name, email, phone, company, city, message)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(productId, String(name).trim(), email, phone, company || '', String(city).trim(), message);

  res.status(201).json({ id: Number(result.lastInsertRowid), status: 'received' });
});

app.post('/api/contacts', (req, res) => {
  const { name, email, phone, company, message } = req.body || {};
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'name, email, and message are required' });
  }
  const result = db.prepare(`
    INSERT INTO contacts (name, email, phone, company, message)
    VALUES (?, ?, ?, ?, ?)
  `).run(name, email, phone || '', company || '', message);
  res.status(201).json({ id: Number(result.lastInsertRowid), status: 'received' });
});

app.get('/api/contacts', requireAdmin, (req, res) => {
  res.json(db.prepare('SELECT * FROM contacts ORDER BY id DESC').all());
});

app.get('/api/enquiries', requireAdmin, (req, res) => {
  const rows = db.prepare(`
    SELECT e.*, p.name AS product_name, p.sku
    FROM enquiries e
    JOIN products p ON p.id = e.product_id
    ORDER BY e.id DESC
  `).all();
  res.json(rows);
});

app.get('/api/db/tables', requireAdmin, (req, res) => {
  res.json({ tables: listTables() });
});

app.get('/api/db/tables/:name', requireAdmin, (req, res) => {
  try {
    res.json(tableInfo(req.params.name));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/db/query', requireAdmin, (req, res) => {
  const sql = req.body?.sql;
  if (!sql) {
    return res.status(400).json({ error: 'sql is required' });
  }
  try {
    res.json({ statements: executeSql(sql) });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

const frontendDist = path.join(__dirname, '..', '..', 'frontend', 'dist', 'frontend', 'browser');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/images') || req.path.startsWith('/admin')) {
      return next();
    }
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
} else {
  app.get('/', (_req, res) => {
    res.redirect('/admin');
  });
}

app.listen(PORT, () => {
  console.log(`Bearing catalog API running on http://localhost:${PORT}`);
  console.log(`Database admin UI: http://localhost:${PORT}/admin`);
});
