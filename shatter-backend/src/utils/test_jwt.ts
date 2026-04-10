import dotenv from 'dotenv';
// Load environment variables
dotenv.config();

import { generateToken, verifyToken } from './jwt_utils.js';


function testJWT() {
  console.log('🧪 Testing JWT Utilities...\n');
  
  // Test 1: Generate a token
  console.log('📝 Test 1: Generating token...');
  const userId = '673abc123def456789';
  const token = generateToken(userId);
  console.log('✅ Token generated:', token);
  console.log('   Token length:', token.length, 'characters\n');
  
  // Test 2: Verify a valid token
  console.log('📝 Test 2: Verifying valid token...');
  try {
    const decoded = verifyToken(token);
    console.log('✅ Token verified successfully');
    console.log('   Decoded userId:', decoded.userId);
    console.log('   Matches original?', decoded.userId === userId ? 'YES ✅' : 'NO ❌\n');
  } catch (error: any) {
    console.log('❌ Verification failed:', error.message);
  }
  
  // Test 3: Try to verify an invalid token
  console.log('\n📝 Test 3: Testing invalid token...');
  try {
    const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.fake.signature';
    verifyToken(fakeToken);
    console.log('❌ Invalid token was accepted (this should not happen!)');
  } catch (error: any) {
    console.log('✅ Invalid token correctly rejected');
    console.log('   Error:', error.message);
  }
  
  // Test 4: Token structure
  console.log('\n📝 Test 4: Token structure...');
  const parts = token.split('.');
  console.log('✅ Token has', parts.length, 'parts (should be 3)');
  console.log('   Part 1 (Header):', parts[0].substring(0, 20) + '...');
  console.log('   Part 2 (Payload):', parts[1].substring(0, 20) + '...');
  console.log('   Part 3 (Signature):', parts[2].substring(0, 20) + '...');
  
  console.log('\n🎉 All JWT tests completed!');
}

testJWT();
