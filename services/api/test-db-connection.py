#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import psycopg2
from psycopg2 import sql
import json
from datetime import datetime
import sys

# Force UTF-8 encoding for Windows
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

# Database URL
DATABASE_URL = "postgresql://neondb_owner:npg_J2fqPGrFNHu1@ep-odd-grass-adpjlbpd-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"

def test_database_connection():
    print("Testing Neon Database Connection...\n")

    try:
        # Test 1: Basic connectivity
        print("1. Testing basic connectivity...")
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor()

        cursor.execute("SELECT NOW() as current_time, version() as pg_version")
        result = cursor.fetchone()
        print("[OK] Connected successfully!")
        print(f"  Current time: {result[0]}")
        print(f"  PostgreSQL version: {result[1]}\n")

        # Test 2: Check for existing tables
        print("2. Checking existing tables...")
        cursor.execute("""
            SELECT tablename
            FROM pg_tables
            WHERE schemaname = 'public'
            ORDER BY tablename;
        """)
        tables = cursor.fetchall()

        if tables:
            print("[OK] Found tables:")
            for table in tables:
                print(f"  - {table[0]}")
        else:
            print("[WARNING] No tables found in public schema")
        print()

        # Test 3: Check for Prisma migrations table
        print("3. Checking Prisma migrations...")
        cursor.execute("""
            SELECT EXISTS (
                SELECT FROM pg_tables
                WHERE schemaname = 'public'
                AND tablename = '_prisma_migrations'
            );
        """)

        migrations_exist = cursor.fetchone()[0]
        if migrations_exist:
            print("[OK] Prisma migrations table exists")

            cursor.execute("""
                SELECT migration_name, finished_at, applied_steps_count
                FROM _prisma_migrations
                ORDER BY finished_at DESC
                LIMIT 5;
            """)
            migrations = cursor.fetchall()

            if migrations:
                print("  Recent migrations:")
                for migration in migrations:
                    print(f"  - {migration[0]} (applied: {migration[1]})")
        else:
            print("[WARNING] Prisma migrations table not found - migrations may need to be run")
        print()

        # Test 4: Check User and RefreshToken tables structure
        print("4. Checking table structures...")

        # Check User table
        cursor.execute("""
            SELECT EXISTS (
                SELECT FROM pg_tables
                WHERE schemaname = 'public'
                AND tablename = 'User'
            );
        """)

        user_table_exists = cursor.fetchone()[0]
        if user_table_exists:
            cursor.execute("""
                SELECT column_name, data_type, is_nullable, column_default
                FROM information_schema.columns
                WHERE table_schema = 'public' AND table_name = 'User'
                ORDER BY ordinal_position;
            """)
            columns = cursor.fetchall()

            print("[OK] User table structure:")
            for col in columns:
                print(f"  - {col[0]}: {col[1]} (nullable: {col[2]})")
            print()
        else:
            print("[WARNING] User table not found\n")

        # Check RefreshToken table
        cursor.execute("""
            SELECT EXISTS (
                SELECT FROM pg_tables
                WHERE schemaname = 'public'
                AND tablename = 'RefreshToken'
            );
        """)

        token_table_exists = cursor.fetchone()[0]
        if token_table_exists:
            cursor.execute("""
                SELECT column_name, data_type, is_nullable
                FROM information_schema.columns
                WHERE table_schema = 'public' AND table_name = 'RefreshToken'
                ORDER BY ordinal_position;
            """)
            columns = cursor.fetchall()

            print("[OK] RefreshToken table structure:")
            for col in columns:
                print(f"  - {col[0]}: {col[1]} (nullable: {col[2]})")
            print()
        else:
            print("[WARNING] RefreshToken table not found\n")

        # Test 5: Connection parameters
        print("5. Connection configuration:")
        print(f"  - Database: {conn.info.dbname}")
        print(f"  - User: {conn.info.user}")
        print(f"  - Host: {conn.info.host}")
        print(f"  - Port: {conn.info.port}")
        print(f"  - SSL mode: {conn.info.ssl_attribute('mode')}")
        print()

        # Test 6: Test basic CRUD operations
        if user_table_exists:
            print("6. Testing basic CRUD operations...")

            try:
                # Create a test user
                test_user_id = f"test_{datetime.now().timestamp()}"
                cursor.execute(
                    'INSERT INTO "User" ("userId") VALUES (%s) RETURNING id, "createdAt", "userId"',
                    (test_user_id,)
                )
                inserted_user = cursor.fetchone()
                print(f"[OK] INSERT successful: {inserted_user}")

                # Read the user
                cursor.execute(
                    'SELECT * FROM "User" WHERE "userId" = %s',
                    (test_user_id,)
                )
                selected_user = cursor.fetchone()
                print(f"[OK] SELECT successful: {selected_user}")

                # Update the user
                cursor.execute(
                    'UPDATE "User" SET "createdAt" = NOW() WHERE "userId" = %s RETURNING *',
                    (test_user_id,)
                )
                print("[OK] UPDATE successful")

                # Delete the test user
                cursor.execute(
                    'DELETE FROM "User" WHERE "userId" = %s',
                    (test_user_id,)
                )
                print("[OK] DELETE successful")
                print("[OK] All CRUD operations completed successfully\n")

                # Rollback since this is just a test
                conn.rollback()

            except Exception as crud_error:
                print(f"[WARNING] CRUD operations failed: {crud_error}")
                print("  This might indicate tables need to be created\n")
                conn.rollback()

        # Summary
        print("=" * 40)
        print("DATABASE CONNECTION TEST SUMMARY:")
        print("[OK] Database is accessible")
        print("[OK] Connection is properly configured")

        if not migrations_exist or not user_table_exists:
            print("\n[WARNING] REQUIRED ACTIONS:")
            print("  1. Run Prisma migrations to create tables:")
            print("     cd services/api")
            print("     npx prisma migrate deploy")
            print("  2. Generate Prisma client:")
            print("     npx prisma generate")
        else:
            print("[OK] Tables are properly set up")

        print("=" * 40)

        cursor.close()
        conn.close()

    except Exception as e:
        print(f"[ERROR] Database connection failed: {e}")
        import traceback
        traceback.print_exc()
        return False

    return True

if __name__ == "__main__":
    test_database_connection()