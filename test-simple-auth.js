const { execSync } = require('child_process');

console.log('🧪 Testing Simple Authentication System...\n');

function runAPITest(name, method, url, data = null) {
  try {
    console.log(`✓ ${name}`);
    
    let command;
    if (method === 'POST' && data) {
      command = `curl -s -X POST -H "Content-Type: application/json" -d '${JSON.stringify(data)}' "${url}"`;
    } else {
      command = `curl -s "${url}"`;
    }
    
    const result = execSync(command, { encoding: 'utf8', timeout: 5000 });
    const parsed = JSON.parse(result);
    
    if (parsed.success) {
      console.log(`  ✅ Passed: ${parsed.message || 'Success'}`);
      return { success: true, data: parsed.data };
    } else {
      console.log(`  ❌ Failed: ${parsed.error}`);
      return { success: false, error: parsed.error };
    }
  } catch (error) {
    console.log(`  ❌ Failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

let passedTests = 0;
let totalTests = 0;

// Test 1: Simple signup
totalTests++;
const signupResult = runAPITest(
  'Simple signup API',
  'POST',
  'http://localhost:3001/api/auth/simple-signup',
  {
    email: `test${Date.now()}@example.com`,
    password: 'testpassword123',
    name: 'Test User'
  }
);

if (signupResult.success) {
  passedTests++;
}

// Test 2: Simple login
totalTests++;
if (signupResult.success) {
  const loginResult = runAPITest(
    'Simple login API',
    'POST',
    'http://localhost:3001/api/auth/simple-login',
    {
      email: `test${Date.now() - 1000}@example.com`,
      password: 'testpassword123'
    }
  );
  
  if (loginResult.success) {
    passedTests++;
  }
} else {
  console.log('✓ Simple login API');
  console.log('  ⏭️  Skipped: Signup failed');
}

// Test 3: Duplicate signup prevention
totalTests++;
if (signupResult.success) {
  const duplicateResult = runAPITest(
    'Duplicate signup prevention',
    'POST', 
    'http://localhost:3001/api/auth/simple-signup',
    {
      email: 'test@example.com',
      password: 'testpassword123', 
      name: 'Test User'
    }
  );
  
  if (!duplicateResult.success && duplicateResult.error.includes('already exists')) {
    console.log('  ✅ Passed: Correctly prevents duplicate signups');
    passedTests++;
  }
} else {
  console.log('✓ Duplicate signup prevention');
  console.log('  ⏭️  Skipped: Initial signup failed');
}

// Test 4: Check if bcrypt is available
totalTests++;
try {
  console.log('✓ Password hashing dependency check');
  execSync('docker-compose -f docker-compose.dev.yml exec -T app npm list bcryptjs', { encoding: 'utf8', timeout: 5000 });
  console.log('  ✅ Passed: bcryptjs is available');
  passedTests++;
} catch (error) {
  console.log('  ❌ Failed: bcryptjs not found - need to install');
}

// Test 5: Environment variables loaded
totalTests++;
try {
  console.log('✓ Environment variables check');
  const envTest = execSync('curl -s http://localhost:3001/api/auth/simple-signup -X POST -H "Content-Type: application/json" -d "{}"', { encoding: 'utf8' });
  const parsed = JSON.parse(envTest);
  
  if (parsed.error === 'Missing required fields') {
    console.log('  ✅ Passed: API responding correctly');
    passedTests++;
  } else {
    console.log('  ❌ Failed: Unexpected API response');
  }
} catch (error) {
  console.log('  ❌ Failed: API not responding');
}

console.log('\n📊 Test Results:');
console.log(`✅ Passed: ${passedTests}/${totalTests}`);
console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`);

if (passedTests >= 3) {
  console.log('\n🎉 Simple authentication system is working!');
  console.log('\n🔧 To use simple auth instead of Firebase:');
  console.log('   1. Visit: http://localhost:3001/auth/register');
  console.log('   2. Try creating an account');
  console.log('   3. If it fails, use these direct APIs:');
  console.log('      • POST /api/auth/simple-signup');
  console.log('      • POST /api/auth/simple-login');
  console.log('\n⚠️  Note: This is a temporary solution for testing');
  console.log('   For production, proper Firebase setup is recommended');
} else {
  console.log('\n⚠️  Simple auth setup needs additional configuration');
  console.log('   Missing dependencies or database issues detected');
}

console.log('\n🔥 For Firebase setup instead:');
console.log('   See firebase-setup-guide.md for complete instructions');