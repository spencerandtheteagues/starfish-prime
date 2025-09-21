const { Pool } = require('pg');

// Database URL from environment
const DATABASE_URL = 'postgresql://neondb_owner:npg_J2fqPGrFNHu1@ep-odd-grass-adpjlbpd-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require';

async function testDatabaseConnection() {
  console.log('Testing Neon Database Connection...\n');

  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    },
    // Connection pool settings for production
    max: 20, // Maximum number of connections
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

  try {
    // Test 1: Basic connectivity
    console.log('1. Testing basic connectivity...');
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
    console.log('✓ Connected successfully!');
    console.log(`  Current time: ${result.rows[0].current_time}`);
    console.log(`  PostgreSQL version: ${result.rows[0].pg_version}\n`);

    // Test 2: Check for existing tables
    console.log('2. Checking existing tables...');
    const tablesResult = await client.query(`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `);

    if (tablesResult.rows.length > 0) {
      console.log('✓ Found tables:');
      tablesResult.rows.forEach(row => {
        console.log(`  - ${row.tablename}`);
      });
    } else {
      console.log('⚠ No tables found in public schema');
    }
    console.log();

    // Test 3: Check for Prisma migrations table
    console.log('3. Checking Prisma migrations...');
    const migrationsResult = await client.query(`
      SELECT EXISTS (
        SELECT FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename = '_prisma_migrations'
      );
    `);

    if (migrationsResult.rows[0].exists) {
      console.log('✓ Prisma migrations table exists');

      // Get migration history
      const migrationHistory = await client.query(`
        SELECT migration_name, finished_at, applied_steps_count
        FROM _prisma_migrations
        ORDER BY finished_at DESC
        LIMIT 5;
      `);

      if (migrationHistory.rows.length > 0) {
        console.log('  Recent migrations:');
        migrationHistory.rows.forEach(row => {
          console.log(`  - ${row.migration_name} (applied: ${row.finished_at})`);
        });
      }
    } else {
      console.log('⚠ Prisma migrations table not found - migrations may need to be run');
    }
    console.log();

    // Test 4: Check User and RefreshToken tables structure
    console.log('4. Checking table structures...');

    const userTableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename = 'User'
      );
    `);

    if (userTableExists.rows[0].exists) {
      const userColumns = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'User'
        ORDER BY ordinal_position;
      `);

      console.log('✓ User table structure:');
      userColumns.rows.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
      console.log();
    } else {
      console.log('⚠ User table not found\n');
    }

    const refreshTokenTableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename = 'RefreshToken'
      );
    `);

    if (refreshTokenTableExists.rows[0].exists) {
      const tokenColumns = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'RefreshToken'
        ORDER BY ordinal_position;
      `);

      console.log('✓ RefreshToken table structure:');
      tokenColumns.rows.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
      console.log();
    } else {
      console.log('⚠ RefreshToken table not found\n');
    }

    // Test 5: Check connection pool settings
    console.log('5. Connection pool configuration:');
    console.log(`  - Max connections: ${pool.options.max}`);
    console.log(`  - Idle timeout: ${pool.options.idleTimeoutMillis}ms`);
    console.log(`  - Connection timeout: ${pool.options.connectionTimeoutMillis}ms`);
    console.log(`  - Total clients: ${pool.totalCount}`);
    console.log(`  - Idle clients: ${pool.idleCount}`);
    console.log(`  - Waiting clients: ${pool.waitingCount}\n`);

    // Test 6: Test basic CRUD operations
    console.log('6. Testing basic CRUD operations...');

    // Create a test user
    try {
      const testUserId = 'test_' + Date.now();
      const insertResult = await client.query(
        'INSERT INTO "User" ("userId") VALUES ($1) RETURNING id, "createdAt", "userId"',
        [testUserId]
      );
      console.log('✓ INSERT successful:', insertResult.rows[0]);

      // Read the user
      const selectResult = await client.query(
        'SELECT * FROM "User" WHERE "userId" = $1',
        [testUserId]
      );
      console.log('✓ SELECT successful:', selectResult.rows[0]);

      // Update the user (if there were more fields)
      const updateResult = await client.query(
        'UPDATE "User" SET "createdAt" = NOW() WHERE "userId" = $1 RETURNING *',
        [testUserId]
      );
      console.log('✓ UPDATE successful');

      // Delete the test user
      const deleteResult = await client.query(
        'DELETE FROM "User" WHERE "userId" = $1',
        [testUserId]
      );
      console.log('✓ DELETE successful');
      console.log('✓ All CRUD operations completed successfully\n');
    } catch (crudError) {
      console.log('⚠ CRUD operations failed:', crudError.message);
      console.log('  This might indicate tables need to be created\n');
    }

    client.release();

    // Summary
    console.log('========================================');
    console.log('DATABASE CONNECTION TEST SUMMARY:');
    console.log('✓ Database is accessible');
    console.log('✓ Connection pooling is configured');

    if (!migrationsResult.rows[0].exists || !userTableExists.rows[0].exists) {
      console.log('\n⚠ REQUIRED ACTIONS:');
      console.log('  1. Run Prisma migrations to create tables:');
      console.log('     cd services/api');
      console.log('     npx prisma migrate deploy');
      console.log('  2. Generate Prisma client:');
      console.log('     npx prisma generate');
    } else {
      console.log('✓ Tables are properly set up');
    }

    console.log('========================================');

  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Error details:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the test
testDatabaseConnection();