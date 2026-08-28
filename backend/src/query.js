#!/usr/bin/env node
const db = require('./db');
const { executeSql } = require('./db-admin');

const sql = process.argv.slice(2).join(' ').trim();
if (!sql) {
  console.log('Usage: npm run query -- "SELECT * FROM products"');
  process.exit(1);
}

try {
  const statements = executeSql(sql);
  console.log(JSON.stringify(statements, null, 2));
} finally {
  db.close();
}
