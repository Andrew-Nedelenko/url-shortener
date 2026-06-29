import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import * as path from 'path';

config();

const isProd = process.env.NODE_ENV === 'production';

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5433,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'url_shortener',
  migrations: [path.join(__dirname, 'migrations', isProd ? '*.js' : '*.ts')],
  entities: [
    path.join(__dirname, isProd ? '**/*.entity.js' : '**/*.entity.ts'),
  ],
});
