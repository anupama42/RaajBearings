const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'raaj-bearings-local-secret';

// Credentials come from environment variables in production.
// Defaults are only for local development.
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'raajadmin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Raaj@2024';

// Pre-hash the password once so plaintext is never kept in memory beyond startup.
const ADMIN_PASSWORD_HASH = bcrypt.hashSync(ADMIN_PASSWORD, 10);

function requireAdmin(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) {
    return res.status(401).json({ error: 'Admin login required' });
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (payload.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    next();
  } catch {
    return res.status(401).json({ error: 'Session expired. Please log in again.' });
  }
}

function registerAdminAuthRoutes(app) {
  app.post('/api/admin/login', (req, res) => {
    const username = String(req.body?.username || '').trim();
    const password = String(req.body?.password || '');

    const userOk = username === ADMIN_USERNAME;
    const passOk = bcrypt.compareSync(password, ADMIN_PASSWORD_HASH);

    // Constant-ish response regardless of which field was wrong.
    if (!userOk || !passOk) {
      return res.status(401).json({ error: 'Invalid admin username or password' });
    }

    const token = jwt.sign({ role: 'admin', sub: username }, JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, username });
  });
}

module.exports = { registerAdminAuthRoutes, requireAdmin };
