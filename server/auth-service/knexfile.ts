// knexfile.ts
import type { Knex } from 'knex';
import dotenv from 'dotenv';

dotenv.config();

const config: { [key: string]: Knex.Config } = {
  development: {
    client: 'mysql', // Hoặc 'mysql', 'sqlite3', 'mssql', tùy vào DB bạn sử dụng
    connection: {
      host:  '3.135.208.5',
      user: 'root',
      password: 'Sp77777776',
      database: 'jobber_auth',
      port: 32306,
    },
  },

  production: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: Number(process.env.DB_PORT),
    },
    migrations: {
      directory: './migrations',
    },
    seeds: {
      directory: './seeds',
    },
  },
};

// Sử dụng `export =` để xuất khẩu tương thích với CommonJS
export = config;
