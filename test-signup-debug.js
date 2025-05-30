const { execSync, spawn } = require('child_process');
const fs = require('fs');

console.log('🔍 Debugging Signup Issues...\n');

// Function to check if Docker logs contain errors
function checkDockerLogs() {
  try {
    console.log('📋 Checking Docker application logs...');
    const logs = execSync('docker-compose -f docker-compose.dev.yml logs app --tail=50', { encoding: 'utf8', timeout: 10000 });
    
    const errorLines = logs.split('\n').filter(line => 
      line.toLowerCase().includes('error') || 
      line.toLowerCase().includes('firebase') ||
      line.toLowerCase().includes('auth')
    );
    
    if (errorLines.length > 0) {
      console.log('❌ Found potential errors in logs:');
      errorLines.forEach(line => console.log(`   ${line}`));
    } else {
      console.log('✅ No obvious errors in recent logs');
    }
    
    console.log('\n');
    return true;
  } catch (error) {
    console.log(`❌ Failed to check logs: ${error.message}\n`);
    return false;
  }
}

// Function to check Firebase configuration
function checkFirebaseConfig() {
  console.log('🔥 Checking Firebase configuration...');
  
  try {
    // Check environment variables
    const envContent = fs.readFileSync('.env.local', 'utf8');
    const hasFirebaseVars = envContent.includes('NEXT_PUBLIC_FIREBASE_API_KEY');
    
    if (hasFirebaseVars) {
      console.log('✅ Firebase environment variables found in .env.local');
    } else {
      console.log('❌ Firebase environment variables NOT found in .env.local');
      console.log('   This is likely the cause of signup issues');
    }
    
    console.log('\n');
    return hasFirebaseVars;
  } catch (error) {
    console.log('❌ Could not read .env.local file\n');
    return false;
  }
}

// Function to test auth endpoints
function testAuthEndpoints() {
  console.log('🔗 Testing authentication endpoints...');
  
  const tests = [
    {
      name: 'Auth sync endpoint',
      command: 'curl -s -X POST http://localhost:3001/api/auth/sync -H "Content-Type: application/json" -d "{}"'
    },
    {
      name: 'Auth user endpoint', 
      command: 'curl -s http://localhost:3001/api/auth/user'
    }
  ];
  
  tests.forEach(test => {
    try {
      console.log(`  Testing ${test.name}...`);
      const result = execSync(test.command, { encoding: 'utf8', timeout: 5000 });
      const parsed = JSON.parse(result);
      
      if (parsed.error) {
        console.log(`    ❌ ${parsed.error}`);
      } else {
        console.log(`    ✅ Endpoint responds correctly`);
      }
    } catch (error) {
      console.log(`    ❌ Failed: ${error.message}`);
    }
  });
  
  console.log('\n');
}

// Function to check page rendering
function checkPageRendering() {
  console.log('🖥️  Checking page rendering...');
  
  try {
    const registerPage = execSync('curl -s http://localhost:3001/auth/register', { encoding: 'utf8', timeout: 5000 });
    
    const hasForm = registerPage.includes('新規登録') && registerPage.includes('アカウントを作成');
    const hasInputs = registerPage.includes('名前') && registerPage.includes('メールアドレス');
    
    if (hasForm && hasInputs) {
      console.log('✅ Register page renders correctly');
    } else {
      console.log('❌ Register page has rendering issues');
    }
    
    console.log('\n');
    return hasForm && hasInputs;
  } catch (error) {
    console.log(`❌ Failed to check page rendering: ${error.message}\n`);
    return false;
  }
}

// Function to provide solutions
function provideSolutions(firebaseConfigExists) {
  console.log('💡 Solutions and Next Steps:\n');
  
  if (!firebaseConfigExists) {
    console.log('🔥 FIREBASE SETUP REQUIRED:');
    console.log('   1. Go to https://console.firebase.google.com/');
    console.log('   2. Create a new project or select existing one');
    console.log('   3. Enable Authentication → Email/Password');
    console.log('   4. Get your config from Project Settings → General → Your apps');
    console.log('   5. Add Firebase config to .env.local:');
    console.log('');
    console.log('   NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"');
    console.log('   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"');
    console.log('   NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"');
    console.log('   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"');
    console.log('   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="123456789"');
    console.log('   NEXT_PUBLIC_FIREBASE_APP_ID="1:123456789:web:abcdef"');
    console.log('');
    console.log('   6. Restart Docker: docker-compose -f docker-compose.dev.yml restart app');
    console.log('');
  }
  
  console.log('🔧 IMMEDIATE WORKAROUND (for testing):');
  console.log('   You can test the system using existing demo data:');
  console.log('   • Visit http://localhost:3001/courses to browse courses');
  console.log('   • APIs work without authentication');
  console.log('   • Database operations function correctly');
  console.log('');
  
  console.log('📞 FOR HELP:');
  console.log('   • Check firebase-setup-guide.md for detailed instructions');
  console.log('   • Firebase setup is required only for user authentication');
  console.log('   • All other LMS features work without Firebase');
}

// Main execution
async function main() {
  console.log('🧪 SIGNUP DEBUG ANALYSIS\n');
  console.log('='.repeat(50));
  
  checkDockerLogs();
  const firebaseConfigExists = checkFirebaseConfig();
  testAuthEndpoints();
  checkPageRendering();
  
  console.log('='.repeat(50));
  provideSolutions(firebaseConfigExists);
  
  console.log('\n🎯 SUMMARY:');
  if (!firebaseConfigExists) {
    console.log('   Main Issue: Firebase configuration missing');
    console.log('   Status: Signup will fail until Firebase is configured');
    console.log('   Workaround: Use other LMS features without authentication');
  } else {
    console.log('   Firebase config found - investigating other issues...');
  }
}

main();