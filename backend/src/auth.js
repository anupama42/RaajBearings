const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('./db');

const JWT_SECRET = process.env.JWT_SECRET || 'raaj-bearings-local-secret';

function mapUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    loginId: row.login_id,
    name: row.name,
    email: row.email,
    phone: row.phone || '',
    city: row.city || '',
    company: row.company || ''
  };
}

function hashPassword(password) {
  return bcrypt.hashSync(password, 10);
}

function signToken(userId) {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: '7d' });
}

function isValidLoginId(value) {
  return /^[a-zA-Z0-9._-]{4,30}$/.test(String(value || ''));
}

function isValidPassword(value) {
  return /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(String(value || ''));
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || ''));
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) {
    return res.status(401).json({ error: 'Please log in' });
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(payload.sub);
    if (!user) {
      return res.status(401).json({ error: 'Please log in' });
    }
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: 'Session expired. Please log in again.' });
  }
}

function seedDemoUser() {
  const count = db.prepare('SELECT COUNT(*) AS n FROM users').get().n;
  if (count > 0) return;
  db.prepare(`
    INSERT INTO users (login_id, password_hash, name, email, phone, city, company)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    'raajuser',
    hashPassword('Raaj@1234'),
    'Raaj Customer',
    'customer@raajbearings.local',
    '9632601143',
    'Pune',
    'Raaj Bearings'
  );
  console.log('Created demo login: raajuser / Raaj@1234');
}

function registerAuthRoutes(app) {
  seedDemoUser();
  app.post('/api/auth/register', (req, res) => {
    const { loginId, password, name, email, phone, city, company } = req.body || {};
    if (!isValidLoginId(loginId)) {
      return res.status(400).json({ error: 'Login ID must be 4-30 letters, numbers, dot, underscore or hyphen' });
    }
    if (!isValidPassword(password)) {
      return res.status(400).json({ error: 'Password must be at least 8 characters and include a letter and a number' });
    }
    if (!String(name || '').trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }
    if (!isEmail(email)) {
      return res.status(400).json({ error: 'Enter a valid email address' });
    }

    const exists = db.prepare('SELECT id FROM users WHERE login_id = ? COLLATE NOCASE').get(String(loginId).trim());
    if (exists) {
      return res.status(409).json({ error: 'That login ID is already taken' });
    }

    const result = db.prepare(`
      INSERT INTO users (login_id, password_hash, name, email, phone, city, company)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      String(loginId).trim(),
      hashPassword(password),
      String(name).trim(),
      String(email).trim(),
      phone || '',
      city || '',
      company || ''
    );

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ token: signToken(user.id), user: mapUser(user) });
  });

  app.post('/api/auth/login', (req, res) => {
    const loginId = String(req.body?.loginId || '').trim();
    const password = String(req.body?.password || '');
    const user = db.prepare('SELECT * FROM users WHERE login_id = ? COLLATE NOCASE').get(loginId);
    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid login ID or password' });
    }
    res.json({ token: signToken(user.id), user: mapUser(user) });
  });

  app.get('/api/auth/me', requireAuth, (req, res) => {
    res.json(mapUser(req.user));
  });

  app.put('/api/auth/profile', requireAuth, (req, res) => {
    const { name, email, phone, city, company, currentPassword, newPassword } = req.body || {};
    if (!String(name || '').trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }
    if (!isEmail(email)) {
      return res.status(400).json({ error: 'Enter a valid email address' });
    }

    let passwordHash = req.user.password_hash;
    if (newPassword) {
      if (!bcrypt.compareSync(String(currentPassword || ''), req.user.password_hash)) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }
      if (!isValidPassword(newPassword)) {
        return res.status(400).json({ error: 'New password must be at least 8 characters and include a letter and a number' });
      }
      passwordHash = hashPassword(newPassword);
    }

    db.prepare(`
      UPDATE users
      SET name = ?, email = ?, phone = ?, city = ?, company = ?, password_hash = ?
      WHERE id = ?
    `).run(
      String(name).trim(),
      String(email).trim(),
      phone || '',
      city || '',
      company || '',
      passwordHash,
      req.user.id
    );

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
    res.json(mapUser(user));
  });
}

module.exports = {
  registerAuthRoutes,
  requireAuth,
  hashPassword,
  mapUser
};
