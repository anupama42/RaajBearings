const db = require('./db');

const ALLOWED_TABLES = new Set(['products', 'enquiries', 'filter_options', 'contacts', 'enquiry_cart']);

function splitStatements(sql) {
  return String(sql)
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean);
}

function runStatement(sql) {
  const stmt = db.prepare(sql);
  if (stmt.reader) {
    const rows = stmt.all();
    return { type: 'select', columns: rows[0] ? Object.keys(rows[0]) : [], rows };
  }
  const result = stmt.run();
  return {
    type: 'write',
    changes: result.changes,
    lastInsertRowid: Number(result.lastInsertRowid)
  };
}

function executeSql(sql) {
  const statements = splitStatements(sql);
  if (!statements.length) {
    throw new Error('SQL is empty');
  }
  return statements.map((statement) => ({
    sql: statement,
    result: runStatement(statement)
  }));
}

function listTables() {
  return db.prepare(`
    SELECT name FROM sqlite_master
    WHERE type = 'table' AND name NOT LIKE 'sqlite_%'
    ORDER BY name
  `).all().map((row) => row.name);
}

function tableInfo(name) {
  if (!ALLOWED_TABLES.has(name)) {
    throw new Error('Unknown table');
  }
  const columns = db.prepare(`PRAGMA table_info(${name})`).all();
  const rows = db.prepare(`SELECT * FROM ${name} ORDER BY id DESC LIMIT 200`).all();
  return { name, columns, rows };
}

module.exports = {
  ALLOWED_TABLES,
  executeSql,
  listTables,
  tableInfo
};
