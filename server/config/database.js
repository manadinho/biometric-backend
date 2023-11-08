const { Client } = require("pg");

const client = new Client({
  user: "postgres",
  host: "localhost",
  database: "biometric_db",
  password: "postgres",
  port: 5432, // PostgreSQL's default port
});

client.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err);
  }
});

module.exports = client;
