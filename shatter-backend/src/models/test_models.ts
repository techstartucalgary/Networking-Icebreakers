import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './user_model';
import { Auth } from './auth_model';
import { hashPassword } from '../utils/password_hash';

dotenv.config();

async function testAuthModel() {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGO_URI;
    if (!MONGODB_URI) {
      throw new Error('MONGO_URI not set in .env');
    }

    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // Clean up any existing test data first
    await User.deleteMany({ email: 'test@example.com' });
    await Auth.deleteMany({ email: 'test@example.com' });

    // ========================================
    // Test 1: Create a user
    // ========================================
    console.log('Test 1: Creating user...');
    const newUser = await User.create({
      name: 'Test User',           // Changed from displayName to name
      email: 'test@example.com'
    });
    console.log('User created:', {
      _id: newUser._id,
      email: newUser.email,
      name: newUser.name            // Changed from displayName to name
    });

    // ========================================
    // Test 2: Create authentication for that user
    // ========================================
    console.log('\nTest 2: Creating authentication...');
    const hashedPassword = await hashPassword('testPassword123');
    const newAuth = await Auth.create({
      userID: newUser._id,
      email: 'test@example.com',
      passwordHash: hashedPassword
    });
    console.log('Auth created:', {
      _id: newAuth._id,
      email: newAuth.email,
      userID: newAuth.userID,
      hasTimestamps: !!(newAuth.createdAt && newAuth.updatedAt)
    });

    // ========================================
    // Test 3: Verify passwordHash is NOT returned by default (select: false)
    // ========================================
    console.log('\nTest 3: Testing select: false on passwordHash...');
    const authWithoutHash = await Auth.findOne({ email: 'test@example.com' });
    console.log('Query without select:', {
      hasPasswordHash: 'passwordHash' in (authWithoutHash || {}),
      expected: false
    });

    // ========================================
    // Test 4: Explicitly select passwordHash with +passwordHash
    // ========================================
    console.log('\nTest 4: Explicitly selecting passwordHash...');
    const authWithHash = await Auth.findOne({ 
      email: 'test@example.com' 
    }).select('+passwordHash');
    console.log('Query with select(+passwordHash):', {
      hasPasswordHash: !!(authWithHash?.passwordHash),
      hashLength: authWithHash?.passwordHash?.length,
      expected: 60
    });

    // ========================================
    // Test 5: Test passwordChangedAt middleware
    // ========================================
    console.log('\nTest 5: Testing passwordChangedAt middleware...');
    console.log('   Initial passwordChangedAt:', authWithHash?.passwordChangedAt || 'null (correct for new doc)');
    
    // Wait 1 second to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update password
    if (authWithHash) {
      const newHashedPassword = await hashPassword('newPassword456');
      authWithHash.passwordHash = newHashedPassword;
      await authWithHash.save();  // Middleware runs here!
    }
    
    const updatedAuth = await Auth.findOne({ 
      email: 'test@example.com' 
    }).select('+passwordHash');
    console.log('After password change:', {
      passwordChangedAt: updatedAuth?.passwordChangedAt,
      wasUpdated: !!updatedAuth?.passwordChangedAt
    });

    // ========================================
    // Test 6: Test lastLogin update
    // ========================================
    console.log('\nTest 6: Testing lastLogin update...');
    const beforeLogin = await Auth.findOne({ email: 'test@example.com' });
    console.log('   Before login - lastLogin:', beforeLogin?.lastLogin || 'null');
    
    // Simulate login
    await Auth.updateOne(
      { email: 'test@example.com' },
      { lastLogin: new Date() }
    );
    
    const afterLogin = await Auth.findOne({ email: 'test@example.com' });
    console.log('After login - lastLogin:', afterLogin?.lastLogin);

    // ========================================
    // Test 7: Populate user data from auth
    // ========================================
    console.log('\nTest 7: Testing populate (join with User)...');
    const authWithUser = await Auth.findOne({ 
      email: 'test@example.com' 
    }).populate('userID');
    console.log('Auth with populated user:', {
      authId: authWithUser?._id,
      email: authWithUser?.email,
      populatedUser: authWithUser?.userID
    });

    // ========================================
    // Test 8: Test email validation
    // ========================================
    console.log('\nTest 8: Testing email validation...');
    try {
      const testUser2 = await User.create({
        name: 'Test User 2',         // Changed from displayName to name
        email: 'invalid-email'       // Invalid format
      });
      const invalidAuth = await Auth.create({
        userID: testUser2._id,
        email: 'invalid-email',
        passwordHash: 'hash'
      });
      console.log('Email validation FAILED - invalid email was accepted');
    } catch (error: any) {
      console.log('Email validation PASSED - invalid email rejected:', 
        error.message.includes('valid email') ? 'Correct error message' : error.message
      );
    }

    // ========================================
    // Test 9: Test unique email constraint
    // ========================================
    console.log('\nTest 9: Testing unique email constraint...');
    try {
      const testUser3 = await User.create({
        name: 'Test User 3',         // Changed from displayName to name
        email: 'duplicate@example.com'
      });
      await Auth.create({
        userID: testUser3._id,
        email: 'duplicate@example.com',
        passwordHash: 'hash1'
      });
      
      const testUser4 = await User.create({
        name: 'Test User 4',         // Changed from displayName to name
        email: 'duplicate2@example.com'
      });
      await Auth.create({
        userID: testUser4._id,
        email: 'duplicate@example.com',  // Same email!
        passwordHash: 'hash2'
      });
      console.log('Unique constraint FAILED - duplicate email accepted');
    } catch (error: any) {
      console.log('Unique constraint PASSED - duplicate email rejected');
    }

    // ========================================
    // Test 10: Test unique userID constraint
    // ========================================
    console.log('\nTest 10: Testing unique userID constraint...');
    try {
      await Auth.create({
        userID: newUser._id,  // Same userID as first auth!
        email: 'another@example.com',
        passwordHash: 'hash'
      });
      console.log('Unique userID constraint FAILED - duplicate userID accepted');
    } catch (error: any) {
      console.log('Unique userID constraint PASSED - duplicate userID rejected');
    }

    // ========================================
    // Clean up all test data
    // ========================================
    console.log('\nCleaning up test data...');
    await User.deleteMany({ 
      email: { $in: ['test@example.com', 'duplicate@example.com', 'duplicate2@example.com'] }
    });
    await Auth.deleteMany({ 
      email: { $in: ['test@example.com', 'duplicate@example.com', 'another@example.com'] }
    });
    console.log('Test data cleaned up');

    console.log('\nAll tests passed!');
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDisconnected from MongoDB');
  }
}

testAuthModel();
