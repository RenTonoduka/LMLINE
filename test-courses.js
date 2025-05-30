const { execSync } = require('child_process');

console.log('🧪 Testing Courses Page Implementation...\n');

function runTest(name, command, expectedPattern = null) {
  try {
    console.log(`✓ ${name}`);
    const result = execSync(command, { encoding: 'utf8', timeout: 5000 });
    
    if (expectedPattern && !result.includes(expectedPattern)) {
      console.log(`  ❌ Expected pattern not found: ${expectedPattern}`);
      return false;
    }
    
    console.log(`  ✅ Passed`);
    return true;
  } catch (error) {
    console.log(`  ❌ Failed: ${error.message}`);
    return false;
  }
}

function runAPITest(name, url, expectedProperty = null) {
  try {
    console.log(`✓ ${name}`);
    const result = execSync(`curl -s "${url}" | jq '${expectedProperty || '.success'}'`, { encoding: 'utf8', timeout: 5000 });
    
    if (result.trim() === 'true') {
      console.log(`  ✅ Passed`);
      return true;
    } else {
      console.log(`  ❌ Failed: Expected true, got ${result.trim()}`);
      return false;
    }
  } catch (error) {
    console.log(`  ❌ Failed: ${error.message}`);
    return false;
  }
}

let passedTests = 0;
let totalTests = 0;

// Test 1: API returns successful response
totalTests++;
if (runAPITest(
  'API /api/courses returns success',
  'http://localhost:3001/api/courses',
  '.success'
)) {
  passedTests++;
}

// Test 2: API returns data array
totalTests++;
if (runAPITest(
  'API returns data array',
  'http://localhost:3001/api/courses',
  '.data | type == "array"'
)) {
  passedTests++;
}

// Test 3: API returns courses
totalTests++;
if (runAPITest(
  'API returns courses',
  'http://localhost:3001/api/courses',
  '.data | length > 0'
)) {
  passedTests++;
}

// Test 4: API supports pagination
totalTests++;
if (runAPITest(
  'API supports pagination',
  'http://localhost:3001/api/courses?page=1&limit=5',
  '.pagination.page == 1'
)) {
  passedTests++;
}

// Test 5: API supports search
totalTests++;
if (runAPITest(
  'API supports search',
  'http://localhost:3001/api/courses?search=Web',
  '.success'
)) {
  passedTests++;
}

// Test 6: API supports category filter
totalTests++;
if (runAPITest(
  'API supports category filter',
  'http://localhost:3001/api/courses?categoryId=cat1',
  '.success'
)) {
  passedTests++;
}

// Test 7: Courses page renders
totalTests++;
if (runTest(
  'Courses page renders',
  'curl -s http://localhost:3001/courses | grep -q "コース一覧"'
)) {
  passedTests++;
}

// Test 8: Courses page has search functionality
totalTests++;
if (runTest(
  'Courses page has search input',
  'curl -s http://localhost:3001/courses | grep -q "コースを検索"'
)) {
  passedTests++;
}

// Test 9: Courses page has category filters
totalTests++;
if (runTest(
  'Courses page has category filters',
  'curl -s http://localhost:3001/courses | grep -q "Programming"'
)) {
  passedTests++;
}

// Test 10: Check individual course API
totalTests++;
if (runAPITest(
  'Individual course API works',
  'http://localhost:3001/api/courses/course1',
  '.success'
)) {
  passedTests++;
}

console.log('\n📊 Test Results:');
console.log(`✅ Passed: ${passedTests}/${totalTests}`);
console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`);

if (passedTests === totalTests) {
  console.log('\n🎉 All tests passed! Courses page implementation is working correctly.');
  process.exit(0);
} else {
  console.log('\n⚠️  Some tests failed. Please check the implementation.');
  process.exit(1);
}