function addColumn(db, table, column, definition) {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all().map((row) => row.name);
  if (!columns.includes(column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

function migrateCatalog(db) {
  addColumn(db, 'products', 'original_price', 'REAL NOT NULL DEFAULT 0');
  addColumn(db, 'products', 'discount_percent', 'REAL NOT NULL DEFAULT 0');
  addColumn(db, 'products', 'rating', 'REAL NOT NULL DEFAULT 4');
  addColumn(db, 'enquiries', 'city', 'TEXT');

  const upgrades = {
    '6205-2RS': { original_price: 520, discount_percent: 18, rating: 4.6 },
    '6308-ZZ': { original_price: 1180, discount_percent: 22, rating: 4.4 },
    '7205-B': { original_price: 1820, discount_percent: 15, rating: 4.7 },
    '32210': { original_price: 2340, discount_percent: 28, rating: 4.3 },
    '22218-E': { original_price: 6250, discount_percent: 12, rating: 4.8 },
    'NU210': { original_price: 2580, discount_percent: 20, rating: 4.1 },
    'UCP205': { original_price: 890, discount_percent: 35, rating: 3.9 },
    '51108': { original_price: 740, discount_percent: 25, rating: 4.2 },
    'HK2016': { original_price: 310, discount_percent: 40, rating: 3.6 },
    '6204-C3': { original_price: 280, discount_percent: 10, rating: 4.5 },
    '30205': { original_price: 960, discount_percent: 30, rating: 3.8 },
    '7008-P4': { original_price: 4820, discount_percent: 8, rating: 4.9 }
  };

  const update = db.prepare(`
    UPDATE products
    SET original_price = @original_price,
        discount_percent = @discount_percent,
        rating = @rating,
        price_max = @original_price,
        price_min = @sale_price
    WHERE sku = @sku AND (original_price = 0 OR original_price < 20)
  `);

  const tx = db.transaction(() => {
    for (const [sku, values] of Object.entries(upgrades)) {
      const sale_price = Math.round(values.original_price * (100 - values.discount_percent) / 100);
      update.run({ sku, ...values, sale_price });
    }
  });
  tx();
}

module.exports = { migrateCatalog };
