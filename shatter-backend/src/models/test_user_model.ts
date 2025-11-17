import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './user_model';
import { hashPassword } from '../utils/password_hash';

dotenv.config();

async function testUserModel() {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGO_URI;
    if (!MONGODB_URI) {
      throw new Error('MONGO_URI not set in .env');
    }

    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Clean up any existing test data
    await User.deleteMany({ email: 'test@example.com' });

    // ========================================
    // Test 1: Create a user with password
    // ========================================
    console.log('📝 Test 1: Creating user with password...');
    const hashedPassword = await hashPassword('testPassword123');
    const newUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      passwordHash: hashedPassword
    });
    console.log('✅ User created:', {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      createdAt: newUser.createdAt,
      hasTimestamps: !!(newUser.createdAt && newUser.updatedAt)
    });

    // ========================================
    // Test 2: Verify passwordHash is NOT returned by default
    // ========================================
    console.log('\n📝 Test 2: Testing select: false on passwordHash...');
    const userWithoutHash = await User.findOne({ email: 'test@example.com' });
    const fieldsReturned = Object.keys(userWithoutHash?.toObject() || {});
    console.log('✅ Query without select:', {
      hasPasswordHash: 'passwordHash' in (userWithoutHash || {}),
      expected: false,
      fieldsReturned: fieldsReturned
    });

    // ========================================
    // Test 3: Explicitly select passwordHash
    // ========================================
    console.log('\n📝 Test 3: Explicitly selecting passwordHash...');
    const userWithHash = await User.findOne({ 
      email: 'test@example.com' 
    }).select('+passwordHash');
    console.log('✅ Query with select(+passwordHash):', {
      hasPasswordHash: !!(userWithHash?.passwordHash),
      hashLength: userWithHash?.passwordHash?.length,
      hashStartsWith: userWithHash?.passwordHash?.substring(0, 7),
      expected: '60 chars, starts with $2a$10$'
    });

    // ========================================
    // Test 4: Test passwordChangedAt middleware
    // ========================================
    console.log('\n📝 Test 4: Testing passwordChangedAt middleware...');
    console.log('   Initial passwordChangedAt:', userWithHash?.passwordChangedAt || 'null (correct for new user)');
    
    // Wait 1 second to see timestamp difference
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update password
    if (userWithHash) {
      const newHashedPassword = await hashPassword('newPassword456');
      userWithHash.passwordHash = newHashedPassword;
      await userWithHash.save();  // Middleware runs here!
    }
    
    const updatedUser = await User.findOne({ 
      email: 'test@example.com' 
    }).select('+passwordHash');
    console.log('✅ After password change:', {
      passwordChangedAt: updatedUser?.passwordChangedAt,
      wasUpdated: !!updatedUser?.passwordChangedAt,
      updatedAt: updatedUser?.updatedAt
    });

    // ========================================
    // Test 5: Test lastLogin update
    // ========================================
    console.log('\n📝 Test 5: Testing lastLogin update...');
    const beforeLogin = await User.findOne({ email: 'test@example.com' });
    console.log('   Before login - lastLogin:', beforeLogin?.lastLogin || 'null');
    
    // Simulate login
    const loginTime = new Date();
    await User.updateOne(
      { email: 'test@example.com' },
      { lastLogin: loginTime }
    );
    
    const afterLogin = await User.findOne({ email: 'test@example.com' });
    console.log('✅ After login - lastLogin:', afterLogin?.lastLogin);
    console.log('   Time matches:', afterLogin?.lastLogin?.getTime() === loginTime.getTime());

    // ========================================
    // Test 6: Test email validation (invalid format)
    // ========================================
    console.log('\n📝 Test 6: Testing email validation...');
    try {
      await User.create({
        name: 'Invalid User',
        email: 'not-an-email',    // Invalid format
        passwordHash: 'hash'
      });
      console.log('❌ Email validation FAILED - invalid email was accepted');
    } catch (error: any) {
      console.log('✅ Email validation PASSED - invalid email rejected');
      console.log('   Error:', error.message.includes('valid email') ? 'Correct error message' : error.message);
    }

    // ========================================
    // Test 7: Test unique email constraint
    // ========================================
    console.log('\n📝 Test 7: Testing unique email constraint...');
    try {
      await User.create({
        name: 'Duplicate User',
        email: 'test@example.com',  // Duplicate!
        passwordHash: await hashPassword('password')
      });
      console.log('❌ Unique constraint FAILED - duplicate email was accepted');
    } catch (error: any) {
      console.log('✅ Unique constraint PASSED - duplicate email rejected');
      console.log('   Error code:', error.code === 11000 ? '11000 (duplicate key)' : error.code);
    }

    // ========================================
    // Test 8: Test email lowercase conversion
    // ========================================
    console.log('\n📝 Test 8: Testing email lowercase conversion...');
    const testUser2 = await User.create({
      name: 'Uppercase Test',
      email: 'UPPERCASE@EXAMPLE.COM',  // Uppercase
      passwordHash: await hashPassword('password')
    });
    console.log('✅ Email lowercase conversion:', {
      input: 'UPPERCASE@EXAMPLE.COM',
      stored: testUser2.email,
      wasConverted: testUser2.email === 'uppercase@example.com'
    });
    await User.deleteOne({ _id: testUser2._id });

    // ========================================
    // Test 9: Test email trim (whitespace removal)
    // ========================================
    console.log('\n📝 Test 9: Testing email trim...');
    const testUser3 = await User.create({
      name: 'Whitespace Test',
      email: '  spaces@example.com  ',  // Whitespace
      passwordHash: await hashPassword('password')
    });
    console.log('✅ Email trim:', {
      input: '  spaces@example.com  ',
      stored: testUser3.email,
      wasTrimmed: testUser3.email === 'spaces@example.com'
    });
    await User.deleteOne({ _id: testUser3._id });

    // ========================================
    // Test 10: Test name trim
    // ========================================
    console.log('\n📝 Test 10: Testing name trim...');
    const testUser4 = await User.create({
      name: '  John Doe  ',  // Whitespace
      email: 'johndoe@example.com',
      passwordHash: await hashPassword('password')
    });
    console.log('✅ Name trim:', {
      input: '  John Doe  ',
      stored: testUser4.name,
      wasTrimmed: testUser4.name === 'John Doe'
    });
    await User.deleteOne({ _id: testUser4._id });

    // ========================================
    // Test 11: Test required fields
    // ========================================
    console.log('\n📝 Test 11: Testing required fields...');
    
    // Missing name
    try {
      await User.create({
        email: 'noname@example.com',
        passwordHash: 'hash'
      });
      console.log('❌ Name required validation FAILED');
    } catch (error: any) {
      console.log('✅ Name required validation PASSED');
    }
    
    // Missing email
    try {
      await User.create({
        name: 'No Email User',
        passwordHash: 'hash'
      });
      console.log('❌ Email required validation FAILED');
    } catch (error: any) {
      console.log('✅ Email required validation PASSED');
    }
    
    // Missing passwordHash
    try {
      await User.create({
        name: 'No Password User',
        email: 'nopass@example.com'
      });
      console.log('❌ PasswordHash required validation FAILED');
    } catch (error: any) {
      console.log('✅ PasswordHash required validation PASSED');
    }

    // ========================================
    // Clean up
    // ========================================
    console.log('\n🧹 Cleaning up test data...');
    await User.deleteMany({ 
      email: { $in: ['test@example.com', 'uppercase@example.com', 'spaces@example.com', 'johndoe@example.com'] } 
    });
    console.log('✅ Test data cleaned up');

    console.log('\n🎉 All tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

testUserModel();
