const Database = require('better-sqlite3');
const path = require('path');

try {
  // Connect to the SQLite database
  const dbPath = path.join(process.cwd(), '.data', 'imaginex.db');
  const db = new Database(dbPath);

  // Clear all generations
  db.prepare('DELETE FROM generations').run();
  
  console.log('Successfully cleared all generated images from the database.');
  process.exit(0);
} catch (error) {
  console.error('Failed to clear database:', error.message);
  process.exit(1);
}
