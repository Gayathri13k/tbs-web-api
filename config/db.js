require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    database: process.env.DATABASE,
    host: process.env.HOST,
    port: process.env.PORT,
    user: process.env.USER,
    password: process.env.PASSWORD,
    connectionTimeoutMillis: 5000,
    ssl: true
});

module.exports = pool;

