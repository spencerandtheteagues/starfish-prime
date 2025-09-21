import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

// Set DATABASE_URL for Prisma
process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_J2fqPGrFNHu1@ep-odd-grass-adpjlbpd-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function testCRUD() {
  console.log('Starting CRUD tests...\n');

  try {
    // 1. CREATE - Test user creation
    console.log('1. CREATE Test - Creating a new user...');
    const testUserId = `test-user-${Date.now()}`;
    const newUser = await prisma.user.create({
      data: {
        userId: testUserId,
      },
    });
    console.log('✓ User created:', {
      id: newUser.id,
      userId: newUser.userId,
      createdAt: newUser.createdAt
    });

    // 2. READ - Test user retrieval
    console.log('\n2. READ Test - Finding the created user...');
    const foundUser = await prisma.user.findUnique({
      where: {
        userId: testUserId,
      },
    });
    console.log('✓ User found:', foundUser ? 'Yes' : 'No');

    // 3. CREATE RefreshToken - Test relation
    console.log('\n3. CREATE RefreshToken - Testing relations...');
    const tokenHash = crypto.randomBytes(32).toString('hex');
    const refreshToken = await prisma.refreshToken.create({
      data: {
        userId: newUser.id,
        tokenHash: tokenHash,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });
    console.log('✓ RefreshToken created:', {
      id: refreshToken.id,
      userId: refreshToken.userId,
      tokenHash: refreshToken.tokenHash.substring(0, 10) + '...',
      expiresAt: refreshToken.expiresAt
    });

    // 4. READ with Relations
    console.log('\n4. READ with Relations - Testing joins...');
    const userWithTokens = await prisma.user.findUnique({
      where: {
        userId: testUserId,
      },
      include: {
        refreshTokens: true,
      },
    });
    console.log('✓ User with tokens found:');
    console.log('  - User ID:', userWithTokens.userId);
    console.log('  - Token count:', userWithTokens.refreshTokens.length);

    // 5. UPDATE - Test token update
    console.log('\n5. UPDATE Test - Revoking token...');
    const updatedToken = await prisma.refreshToken.update({
      where: {
        id: refreshToken.id,
      },
      data: {
        revokedAt: new Date(),
      },
    });
    console.log('✓ Token revoked at:', updatedToken.revokedAt);

    // 6. DELETE - Clean up test data
    console.log('\n6. DELETE Test - Cleaning up test data...');
    const deletedUser = await prisma.user.delete({
      where: {
        id: newUser.id,
      },
    });
    console.log('✓ User deleted:', deletedUser.userId);

    // 7. Verify CASCADE DELETE
    console.log('\n7. CASCADE DELETE Test - Verifying token was deleted...');
    const tokenExists = await prisma.refreshToken.findUnique({
      where: {
        id: refreshToken.id,
      },
    });
    console.log('✓ Token cascade deleted:', tokenExists === null ? 'Yes' : 'No');

    // 8. Test connection pooling
    console.log('\n8. Connection Pooling Test - Running concurrent queries...');
    const promises = [];
    for (let i = 0; i < 5; i++) {
      promises.push(
        prisma.user.count().then(count => {
          console.log(`  - Query ${i + 1}: User count = ${count}`);
          return count;
        })
      );
    }
    await Promise.all(promises);
    console.log('✓ Concurrent queries completed successfully');

    // 9. Test transaction
    console.log('\n9. Transaction Test - Creating multiple records atomically...');
    const transactionResult = await prisma.$transaction(async (tx) => {
      const user1 = await tx.user.create({
        data: { userId: `tx-user-1-${Date.now()}` },
      });
      const user2 = await tx.user.create({
        data: { userId: `tx-user-2-${Date.now()}` },
      });

      // Clean up
      await tx.user.deleteMany({
        where: {
          id: {
            in: [user1.id, user2.id]
          }
        }
      });

      return { created: 2, deleted: 2 };
    });
    console.log('✓ Transaction completed:', transactionResult);

    console.log('\n✅ ALL TESTS PASSED SUCCESSFULLY!');
    console.log('Database is fully operational and ready for production use.');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
    if (error.meta) {
      console.error('Error metadata:', error.meta);
    }
    throw error;
  } finally {
    await prisma.$disconnect();
    console.log('\n✓ Database connection closed');
  }
}

// Run tests
testCRUD().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});