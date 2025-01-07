// knexfile.ts
import type { Knex } from 'knex';

const config: Knex.Config = {
  client: 'mysql', // Hoặc 'mysql', 'sqlite3', 'mssql', tùy vào DB bạn sử dụng
  connection: {
    host: '3.135.208.5',
    user: 'root',
    password: 'Sp77777776',
    database: 'jobber_auth',
    port: 32306,
  },
};

// Sử dụng `export =` để xuất khẩu tương thích với CommonJS
export = config;
