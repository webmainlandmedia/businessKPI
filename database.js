const mysql = require('mysql');

// Create connection pool
const pool = mysql.createPool({
  connectionLimit: 10,
  host: '119.3.241.33',
  user: 'my',
  password: 'Ggfpeitfklkimg@9527',
  database: 'yvrlinlihouse2023old',
  port: 3306,
  charset: 'utf8mb4',
});

module.exports = pool;