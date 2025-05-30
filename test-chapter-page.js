const { execSync } = require('child_process');

console.log('🧪 Testing Chapter Page Implementation...\n');

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

// Test 1: Chapter API returns success
totalTests++;
if (runAPITest(
  'API /api/chapters/chapter1 returns success',
  'http://localhost:3001/api/chapters/chapter1?courseId=course1',
  '.success'
)) {
  passedTests++;
}

// Test 2: Chapter API returns data object
totalTests++;
if (runAPITest(
  'Chapter API returns data object',
  'http://localhost:3001/api/chapters/chapter1?courseId=course1',
  '.data | type == "object"'
)) {
  passedTests++;
}

// Test 3: Chapter has course info
totalTests++;
if (runAPITest(
  'Chapter has course information',
  'http://localhost:3001/api/chapters/chapter1?courseId=course1',
  '.data.course | type == "object"'
)) {
  passedTests++;
}

// Test 4: Course has chapters array
totalTests++;
if (runAPITest(
  'Course has chapters array',
  'http://localhost:3001/api/chapters/chapter1?courseId=course1',
  '.data.course.chapters | type == "array"'
)) {
  passedTests++;
}

// Test 5: Chapter page renders
totalTests++;
if (runTest(
  'Chapter page renders',
  'curl -s http://localhost:3001/courses/course1/chapters/chapter1 | grep -q "コース一覧"'
)) {
  passedTests++;
}

// Test 6: Chapter page has breadcrumb
totalTests++;
if (runTest(
  'Chapter page has breadcrumb navigation',
  'curl -s http://localhost:3001/courses/course1/chapters/chapter1 | grep -q "チャプター"'
)) {
  passedTests++;
}

// Test 7: Chapter page has content section
totalTests++;
if (runTest(
  'Chapter page has content section',
  'curl -s http://localhost:3001/courses/course1/chapters/chapter1 | grep -q "レッスン内容"'
)) {
  passedTests++;
}

// Test 8: Chapter page has completion button
totalTests++;
if (runTest(
  'Chapter page has completion functionality',
  'curl -s http://localhost:3001/courses/course1/chapters/chapter1 | grep -q "完了としてマーク"'
)) {
  passedTests++;
}

// Test 9: Chapter page has sidebar
totalTests++;
if (runTest(
  'Chapter page has course content sidebar',
  'curl -s http://localhost:3001/courses/course1/chapters/chapter1 | grep -q "コース内容"'
)) {
  passedTests++;
}

// Test 10: Progress API works
totalTests++;
try {
  console.log('✓ Progress API works');
  const result = execSync(`curl -s -X POST -H "Content-Type: application/json" -d '{"chapterId":"chapter1","courseId":"course1","userId":"instructor1","isCompleted":true}' http://localhost:3001/api/progress | jq '.success'`, { encoding: 'utf8', timeout: 5000 });
  
  if (result.trim() === 'true') {
    console.log('  ✅ Passed');
    passedTests++;
  } else {
    console.log(`  ❌ Failed: Expected true, got ${result.trim()}`);
  }
} catch (error) {
  console.log(`  ❌ Failed: ${error.message}`);
}

console.log('\n📊 Test Results:');
console.log(`✅ Passed: ${passedTests}/${totalTests}`);
console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`);

if (passedTests === totalTests) {
  console.log('\n🎉 All tests passed! Chapter page implementation is working correctly.');
  process.exit(0);
} else {
  console.log('\n⚠️  Some tests failed. Please check the implementation.');
  process.exit(1);
}