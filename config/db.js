// const { Pool } = require("pg");
// const dotenv = require("dotenv");

// dotenv.config();

// const pool = new Pool({
//   host: process.env.DB_HOST,
//   port: process.env.DB_PORT,
//   database: process.env.DB_NAME,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,

//   // SSL هيشتغل بس في Production
//   ssl: process.env.NODE_ENV === "production"
//     ? { rejectUnauthorized: false }
//     : false,
// });

// pool.connect()
//   .then(() => console.log("✅ Connected to PostgreSQL"))
//   .catch((err) => console.error("❌ Database connection error:", err));

// module.exports = pool;



const { Pool } = require("pg");
const dotenv = require("dotenv");

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL
    ? { rejectUnauthorized: false }
    : false,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 10000,
  max: 1,
});

// pool.connect()
//   .then(() => console.log("✅ Connected to PostgreSQL"))
//   .catch(err => console.error("❌ Database connection error:", err));

module.exports = pool;