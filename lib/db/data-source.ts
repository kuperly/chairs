import 'reflect-metadata';
import { config } from 'dotenv';
import { DataSource } from 'typeorm';

// Load environment variables from .env.local
config({ path: '.env.local' });

export const dataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  synchronize: false, // Use migrations in production
  logging: process.env.NODE_ENV === 'development',
  entities: ['lib/db/entities/**/*.ts'],
  migrations: ['lib/db/migrations/**/*.ts'],
  subscribers: [],
});

// Initialize connection
let isInitialized = false;

export async function getDataSource() {
  if (!isInitialized) {
    await dataSource.initialize();
    isInitialized = true;
  }
  return dataSource;
}
