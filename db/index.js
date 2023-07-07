const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  password: "postgres",
  host: "localhost",
  port: 32768,
  database: "twitter",
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
