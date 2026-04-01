const { Pool } = require('pg');

let pool;

const connectDB = async () => {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is required');
  }
  let retries = 3;
  for (let i = 0; i < retries; i++) {
    try {
      pool = new Pool({ connectionString: databaseUrl });
      await pool.query('SELECT 1');
      console.log('Connected to PostgreSQL');
      return;
    } catch (err) {
      console.error(`Attempt ${i + 1} failed to connect to PostgreSQL:`, err.message);
      if (i === retries - 1) {
        throw err;
      }
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
};

const disconnectDB = async () => {
  if (pool) {
    await pool.end();
    console.log('Disconnected from PostgreSQL');
    pool = null;
  }
};

const healthCheck = async () => {
  if (!pool) return false;
  try {
    const res = await pool.query('SELECT 1');
    return res.rowCount === 1;
  } catch (err) {
    return false;
  }
};

module.exports = { connectDB, disconnectDB, healthCheck };