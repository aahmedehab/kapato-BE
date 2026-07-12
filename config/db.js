const { Sequelize } = require("sequelize");
require("dotenv").config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL is not set");
}

const useSsl =
  process.env.NODE_ENV === "production" ||
  databaseUrl?.includes("neon.tech") ||
  databaseUrl?.includes("sslmode=require");

const sequelize = new Sequelize(
  databaseUrl || "postgres://localhost:5432/kapato",
  {
    dialect: "postgres",
    dialectOptions: useSsl
      ? {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
        }
      : {},
    pool: {
      max: 1,
      min: 0,
      idle: 10000,
      acquire: 30000,
    },
    logging: false,
  }
);

module.exports = sequelize;
