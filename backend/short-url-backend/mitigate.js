import fs from 'fs';
import path from 'path';
import db from './db.js';

async function runMigration() {
  try {
    // Read schema.sql file
    const schemaPath = path.resolve('schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    
    // Split SQL commands by semicolons to execute each separately
    const statements = schema.split(';').filter(statement => statement.trim());

    // Execute each SQL statement
    for (const statement of statements) {
      await db.query(statement);
    }

    console.log('Database migration completed successfully.');
  } catch (error) {
    console.error('Error running migration:', error);
  } finally {
    // Close the database connection pool
    db.closePool();
  }
}

runMigration();


statements[0] = DROP TABLE IF EXISTS clicks
statements[1] =