import { hashPassword, comparePassword } from './password_hash';

async function testPasswordHashing() {
  console.log('🧪 Testing Password Hashing...\n');

  // Test 1: Hash a password
  const plainPassword = 'mySecretPassword123';
  console.log('Original password:', plainPassword);
  
  const hashedPassword = await hashPassword(plainPassword);
  console.log('Hashed password:', hashedPassword);
  console.log('Hash length:', hashedPassword.length, 'characters\n');

  // Test 2: Verify correct password
  const isCorrect = await comparePassword(plainPassword, hashedPassword);
  console.log('Testing correct password:', isCorrect ? 'PASS' : 'FAIL');

  // Test 3: Verify wrong password
  const isWrong = await comparePassword('wrongPassword', hashedPassword);
  console.log('Testing wrong password:', !isWrong ? 'PASS' : 'FAIL');

  // Test 4: Same password hashes differently each time (salt!)
  const hash1 = await hashPassword(plainPassword);
  const hash2 = await hashPassword(plainPassword);
  console.log('\nSame password, different hashes (proves salt works):');
  console.log('Hash 1:', hash1);
  console.log('Hash 2:', hash2);
  console.log('Are they different?', hash1 !== hash2 ? 'YES' : 'NO');
}

testPasswordHashing();
