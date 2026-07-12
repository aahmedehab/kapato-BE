// const { Pool } = require("pg");
// const dotenv = require("dotenv");

// dotenv.config();

// const connectionString = process.env.DATABASE_URL;

// if (!connectionString && process.env.NODE_ENV === "production") {
//   console.error("DATABASE_URL is not set");
// }

// const globalForPool = global;

// if (!globalForPool.__pgPool) {
//   globalForPool.__pgPool = new Pool({
//     connectionString,
//     ssl: connectionString ? { rejectUnauthorized: false } : false,
//     connectionTimeoutMillis: 5000,
//     idleTimeoutMillis: 10000,
//     max: 1,
//   });
// }

// module.exports = globalForPool.__pgPool;


const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
  logging: false,
});

module.exports = sequelize;