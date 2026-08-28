const db = require('./db');
const { requireAuth } = require('./auth');
const { mapProduct } = require('./product-mapper');

function cartProducts(userId) {
  const rows = db.prepare(`
    SELECT p.*
    FROM enquiry_cart c
    JOIN products p ON p.id = c.product_id
    WHERE c.user_id = ?
    ORDER BY c.id DESC
  `).all(userId);
  return rows.map(mapProduct);
}

function addToCart(userId, productId) {
  const product = db.prepare('SELECT id FROM products WHERE id = ?').get(productId);
  if (!product) {
    return { error: 'Product not found', status: 404 };
  }
  db.prepare(`
    INSERT OR IGNORE INTO enquiry_cart (user_id, product_id) VALUES (?, ?)
  `).run(userId, productId);
  return { products: cartProducts(userId) };
}

function registerEnquiryCartRoutes(app) {
  app.get('/api/enquiry-cart', requireAuth, (req, res) => {
    res.json(cartProducts(req.user.id));
  });

  app.post('/api/enquiry-cart', requireAuth, (req, res) => {
    const productId = Number(req.body?.productId);
    if (!productId) {
      return res.status(400).json({ error: 'productId is required' });
    }
    const result = addToCart(req.user.id, productId);
    if (result.error) {
      return res.status(result.status).json({ error: result.error });
    }
    res.status(201).json(result.products);
  });

  app.post('/api/enquiry-cart/merge', requireAuth, (req, res) => {
    const ids = Array.isArray(req.body?.productIds) ? req.body.productIds.map(Number).filter(Boolean) : [];
    const insert = db.prepare('INSERT OR IGNORE INTO enquiry_cart (user_id, product_id) VALUES (?, ?)');
    const exists = db.prepare('SELECT id FROM products WHERE id = ?');
    const tx = db.transaction((productIds) => {
      for (const productId of productIds) {
        if (exists.get(productId)) {
          insert.run(req.user.id, productId);
        }
      }
    });
    tx(ids);
    res.json(cartProducts(req.user.id));
  });

  app.delete('/api/enquiry-cart/:productId', requireAuth, (req, res) => {
    db.prepare('DELETE FROM enquiry_cart WHERE user_id = ? AND product_id = ?').run(req.user.id, req.params.productId);
    res.json(cartProducts(req.user.id));
  });
}

module.exports = { registerEnquiryCartRoutes };
