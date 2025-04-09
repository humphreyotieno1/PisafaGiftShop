/**
 * Database setup script for local development
 * 
 * This script helps set up a local database connection for development.
 * Run this script with: node setup-local-db.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Default database URL for local development
const defaultDatabaseUrl = 'postgresql://postgres:postgres@localhost:5432/pisafa_gift_shop';

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
const envLocalPath = path.join(__dirname, '.env.local');

console.log('Setting up local database connection...');

// Create .env.local file if it doesn't exist
if (!fs.existsSync(envLocalPath)) {
  console.log('Creating .env.local file...');
  fs.writeFileSync(
    envLocalPath,
    `# Local development environment variables
DATABASE_URL="${process.env.DATABASE_URL || defaultDatabaseUrl}"
JWT_SECRET="local-development-secret-key"
`
  );
  console.log('.env.local file created successfully.');
} else {
  console.log('.env.local file already exists.');
}

// Check if DATABASE_URL is set
try {
  console.log('Checking database connection...');
  execSync('npx prisma db pull', { stdio: 'inherit' });
  console.log('Database connection successful!');
} catch (error) {
  console.error('Error connecting to database. Please check your DATABASE_URL in .env.local');
  console.error('You may need to create a local PostgreSQL database or update the connection string.');
  console.error('For local development, you can use:');
  console.error(`  DATABASE_URL="${defaultDatabaseUrl}"`);
  console.error('Make sure PostgreSQL is running and the database exists.');
}

console.log('\nNext steps:');
console.log('1. Make sure your database is running');
console.log('2. Run: npx prisma migrate dev');
console.log('3. Run: npm run dev');
