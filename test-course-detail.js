const { execSync } = require('child_process');

console.log('🧪 Testing Course Detail Page Implementation...\n');

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

// Test 1: API returns course details
totalTests++;
if (runAPITest(
  'API /api/courses/course1 returns success',
  'http://localhost:3001/api/courses/course1',
  '.success'
)) {
  passedTests++;
}

// Test 2: API returns course data
totalTests++;
if (runAPITest(
  'API returns course data object',
  'http://localhost:3001/api/courses/course1',
  '.data | type == "object"'
)) {
  passedTests++;
}

// Test 3: Course has chapters
totalTests++;
if (runAPITest(
  'Course has chapters array',
  'http://localhost:3001/api/courses/course1',
  '.data.chapters | type == "array"'
)) {
  passedTests++;
}

// Test 4: Course detail page renders
totalTests++;
if (runTest(
  'Course detail page renders',
  'curl -s http://localhost:3001/courses/course1 | grep -q "コース一覧に戻る"'
)) {
  passedTests++;
}

// Test 5: Course detail page has content section
totalTests++;
if (runTest(
  'Course detail page has content section',
  'curl -s http://localhost:3001/courses/course1 | grep -q "コンテンツ"'
)) {
  passedTests++;
}

// Test 6: Course detail page has enrollment button
totalTests++;
if (runTest(
  'Course detail page has enrollment functionality',
  'curl -s http://localhost:3001/courses/course1 | grep -q "コースに登録する"'
)) {
  passedTests++;
}

// Test 7: Course detail page shows price
totalTests++;
if (runTest(
  'Course detail page shows price',
  'curl -s http://localhost:3001/courses/course1 | grep -q "買い切り型コース"'
)) {
  passedTests++;
}

// Test 8: Test enrollment API
totalTests++;
if (runAPITest(
  'Enrollment API works',
  'http://localhost:3001/api/enrollments',
  '.success'
)) {
  passedTests++;
}

// Test 9: Course has creator info
totalTests++;
if (runAPITest(
  'Course has creator information',
  'http://localhost:3001/api/courses/course1',
  '.data.creator | type == "object"'
)) {
  passedTests++;
}

// Test 10: Test non-existent course
totalTests++;
if (runAPITest(
  'Non-existent course returns error',
  'http://localhost:3001/api/courses/nonexistent',
  '.success == false'
)) {
  passedTests++;
}

console.log('\n📊 Test Results:');
console.log(`✅ Passed: ${passedTests}/${totalTests}`);
console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`);

if (passedTests === totalTests) {
  console.log('\n🎉 All tests passed! Course detail page implementation is working correctly.');
  process.exit(0);
} else {
  console.log('\n⚠️  Some tests failed. Please check the implementation.');
  process.exit(1);
}