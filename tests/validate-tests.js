/**
 * Test Validation Script
 * Validates test files without running Jest
 */

const fs = require('fs');
const path = require('path');

console.log('\n========================================');
console.log('  LogoGenius Test Suite Validation');
console.log('========================================\n');

const checks = {
  passed: 0,
  failed: 0,
  warnings: 0,
};

function check(condition, message, isWarning = false) {
  if (condition) {
    console.log(`✅ ${message}`);
    checks.passed++;
  } else if (isWarning) {
    console.log(`⚠️  ${message}`);
    checks.warnings++;
  } else {
    console.log(`❌ ${message}`);
    checks.failed++;
  }
}

// 1. Check Jest configuration
console.log('1. Configuration Files');
console.log('----------------------');
check(
  fs.existsSync('jest.config.ts'),
  'jest.config.ts exists'
);
check(
  fs.existsSync('tests/setup.ts'),
  'tests/setup.ts exists'
);

// 2. Check test files
console.log('\n2. Test Files');
console.log('--------------');
const testFiles = [
  'tests/e2e-workflows.test.ts',
  'tests/unit/services.test.ts',
];

testFiles.forEach(file => {
  check(
    fs.existsSync(file),
    `${file} exists`
  );
});

// 3. Validate test file structure
console.log('\n3. Test File Structure');
console.log('-----------------------');

// Check E2E test structure
try {
  const e2eContent = fs.readFileSync('tests/e2e-workflows.test.ts', 'utf-8');
  
  check(
    e2eContent.includes("import { describe, it, expect"),
    'E2E tests import Jest globals'
  );
  check(
    e2eContent.includes("describe('LogoGenius E2E Workflows'"),
    'E2E tests have main describe block'
  );
  check(
    e2eContent.includes("describe('Tier 1: Basic Workflow'"),
    'E2E tests include Tier 1 tests'
  );
  check(
    e2eContent.includes("describe('Tier 2: Pro Workflow'"),
    'E2E tests include Tier 2 tests'
  );
  check(
    e2eContent.includes("describe('Tier 3: Premium Workflow'"),
    'E2E tests include Tier 3 tests'
  );
  check(
    e2eContent.includes("describe('Error Handling'"),
    'E2E tests include error handling tests'
  );
  check(
    e2eContent.includes('async function apiCall'),
    'E2E tests have API helper function'
  );
  
  // Count test cases
  const testMatches = e2eContent.match(/it\(['"`]/g);
  check(
    testMatches && testMatches.length >= 15,
    `E2E tests contain ${testMatches ? testMatches.length : 0} test cases`
  );
  
} catch (e) {
  check(false, 'Failed to read E2E test file');
}

// Check Unit test structure
try {
  const unitContent = fs.readFileSync('tests/unit/services.test.ts', 'utf-8');
  
  check(
    unitContent.includes("import { describe, it, expect"),
    'Unit tests import Jest globals'
  );
  
  const serviceTests = [
    'Token Service',
    'Version Tracking Service',
    'File Manager Service',
    'README Generator Service',
    'ZIP Packager Service',
    'Mockup Renderer Service',
    'Email Service',
    'Admin Analytics Service',
    'Order Processor Service',
  ];
  
  serviceTests.forEach(service => {
    check(
      unitContent.includes(`describe('${service}'`),
      `Unit tests include ${service}`
    );
  });
  
} catch (e) {
  check(false, 'Failed to read unit test file');
}

// 4. Check package.json scripts
console.log('\n4. Package.json Scripts');
console.log('------------------------');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
  
  check(
    packageJson.scripts && packageJson.scripts.test,
    '"test" script defined'
  );
  check(
    packageJson.scripts && packageJson.scripts['test:watch'],
    '"test:watch" script defined'
  );
  check(
    packageJson.scripts && packageJson.scripts['test:coverage'],
    '"test:coverage" script defined'
  );
  check(
    packageJson.scripts && packageJson.scripts['test:e2e'],
    '"test:e2e" script defined'
  );
  
  // Check devDependencies
  const hasJest = packageJson.devDependencies && 
    (packageJson.devDependencies.jest || packageJson.devDependencies['@types/jest']);
  check(
    hasJest,
    'Jest dependencies in devDependencies'
  );
  
} catch (e) {
  check(false, 'Failed to read package.json');
}

// 5. Check documentation
console.log('\n5. Documentation');
console.log('-----------------');
check(
  fs.existsSync('tests/README.md'),
  'tests/README.md exists'
);
check(
  fs.existsSync('tests/TEST-SETUP.md'),
  'tests/TEST-SETUP.md exists'
);
check(
  fs.existsSync('.env.example'),
  '.env.example exists'
);

// 6. Validate TypeScript syntax (basic check)
console.log('\n6. TypeScript Validation');
console.log('------------------------');

try {
  const e2eContent = fs.readFileSync('tests/e2e-workflows.test.ts', 'utf-8');
  const unitContent = fs.readFileSync('tests/unit/services.test.ts', 'utf-8');
  
  // Check for basic TypeScript patterns
  check(
    e2eContent.includes('interface ') || e2eContent.includes('type '),
    'E2E tests use TypeScript interfaces/types'
  );
  check(
    unitContent.includes('async () =>'),
    'Unit tests use async/await'
  );
  check(
    !e2eContent.includes('require(') || e2eContent.includes('import '),
    'E2E tests use ES modules (import)'
  );
  
  // Check for common issues
  check(
    !e2eContent.includes('console.log') || e2eContent.includes('// console.log'),
    'No debug console.log in E2E tests (setup.ts handles it)',
    true
  );
  
} catch (e) {
  check(false, 'Failed to validate TypeScript');
}

// Summary
console.log('\n========================================');
console.log('              Summary');
console.log('========================================');
console.log(`✅ Passed:   ${checks.passed}`);
console.log(`⚠️  Warnings: ${checks.warnings}`);
console.log(`❌ Failed:   ${checks.failed}`);
console.log('========================================\n');

if (checks.failed === 0) {
  console.log('🎉 All checks passed! Test suite is ready.\n');
  console.log('To run tests:');
  console.log('  npm test          # Run all tests');
  console.log('  npm run test:e2e  # Run E2E tests only');
  console.log('  npx jest tests/unit  # Run unit tests only\n');
} else {
  console.log('⚠️  Some checks failed. Please review above.\n');
  process.exit(1);
}
