const { Client } = require('pg');

const DATABASE_URL = 'postgresql://neondb_owner:npg_J2fqPGrFNHu1@ep-odd-grass-adpjlbpd-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require';

async function testDatabase() {
  const client = new Client({
    connectionString: DATABASE_URL
  });

  try {
    console.log('1. Testing database connection...');
    await client.connect();
    console.log('✓ Successfully connected to Neon database!');

    console.log('\n2. Checking database version...');
    const versionResult = await client.query('SELECT version()');
    console.log('✓ Database version:', versionResult.rows[0].version);

    console.log('\n3. Listing existing tables...');
    const tablesResult = await client.query(`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `);

    if (tablesResult.rows.length === 0) {
      console.log('⚠ No tables found in public schema');
    } else {
      console.log('✓ Found tables:');
      tablesResult.rows.forEach(row => {
        console.log('  -', row.tablename);
      });
    }

    console.log('\n4. Checking for Prisma migration table...');
    const migrationTable = await client.query(`
      SELECT EXISTS (
        SELECT 1
        FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename = '_prisma_migrations'
      );
    `);

    if (migrationTable.rows[0].exists) {
      console.log('✓ Prisma migrations table exists');

      const migrations = await client.query('SELECT * FROM _prisma_migrations ORDER BY finished_at DESC LIMIT 5');
      console.log('  Recent migrations:', migrations.rows.length);
    } else {
      console.log('⚠ Prisma migrations table not found - need to run migrations');
    }

    console.log('\n5. Checking for User and RefreshToken tables...');
    const userTableExists = await client.query(`
      SELECT EXISTS (
        SELECT 1
        FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename = 'User'
      );
    `);

    const refreshTokenTableExists = await client.query(`
      SELECT EXISTS (
        SELECT 1
        FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename = 'RefreshToken'
      );
    `);

    console.log('  User table exists:', userTableExists.rows[0].exists);
    console.log('  RefreshToken table exists:', refreshTokenTableExists.rows[0].exists);

  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
  } finally {
    await client.end();
    console.log('\n✓ Database connection closed');
  }
}

testDatabase().catch(console.error);