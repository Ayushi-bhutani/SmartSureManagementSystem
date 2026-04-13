#!/usr/bin/env node

/**
 * Feature Verification Script
 * Checks if all new features are properly set up
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 SmartSure Feature Verification\n');
console.log('=' .repeat(50));

let allPassed = true;
const results = [];

// Helper function to check if file exists
function checkFile(filePath, description) {
  const fullPath = path.join(__dirname, 'src', filePath);
  const exists = fs.existsSync(fullPath);
  
  results.push({
    check: description,
    status: exists ? '✅ PASS' : '❌ FAIL',
    passed: exists
  });
  
  if (!exists) allPassed = false;
  return exists;
}

// Helper function to check if file contains text
function checkFileContains(filePath, searchText, description) {
  const fullPath = path.join(__dirname, 'src', filePath);
  
  if (!fs.existsSync(fullPath)) {
    results.push({
      check: description,
      status: '❌ FAIL (File not found)',
      passed: false
    });
    allPassed = false;
    return false;
  }
  
  const content = fs.readFileSync(fullPath, 'utf8');
  const contains = content.includes(searchText);
  
  results.push({
    check: description,
    status: contains ? '✅ PASS' : '❌ FAIL',
    passed: contains
  });
  
  if (!contains) allPassed = false;
  return contains;
}

// Check package.json for dependencies
function checkDependency(packageName, description) {
  const packageJsonPath = path.join(__dirname, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  const exists = packageJson.dependencies[packageName] || packageJson.devDependencies[packageName];
  
  results.push({
    check: description,
    status: exists ? `✅ PASS (${exists})` : '❌ FAIL',
    passed: !!exists
  });
  
  if (!exists) allPassed = false;
  return exists;
}

console.log('\n📦 Checking Dependencies...\n');

checkDependency('chart.js', 'Chart.js installed');
checkDependency('ng2-charts', 'ng2-charts installed');
checkDependency('ngx-toastr', 'ngx-toastr installed');

console.log('\n📁 Checking Feature Files...\n');

// Analytics Service
checkFile('app/services/analytics.service.ts', 'Analytics Service');

// Notification Service
checkFile('app/services/notification.service.ts', 'Notification Service');

// Export Service
checkFile('app/services/export.service.ts', 'Export Service');

// Analytics Dashboard Component
checkFile('app/features/admin/analytics/analytics-dashboard.component.ts', 'Analytics Dashboard Component');

// Notification Panel Component
checkFile('app/shared/components/notification-panel/notification-panel.component.ts', 'Notification Panel Component');

console.log('\n🔗 Checking Integrations...\n');

// Check if analytics route exists
checkFileContains('app/app.routes.ts', '/admin/analytics', 'Analytics route configured');

// Check if notification panel is in navbar
checkFileContains('app/shared/components/navbar/navbar.component.ts', 'app-notification-panel', 'Notification panel in navbar');
checkFileContains('app/shared/components/navbar/navbar.component.ts', 'NotificationPanelComponent', 'Notification panel imported');

// Check if Chart.js is imported in analytics
checkFileContains('app/features/admin/analytics/analytics-dashboard.component.ts', 'BaseChartDirective', 'Chart.js directive imported');
checkFileContains('app/features/admin/analytics/analytics-dashboard.component.ts', 'ChartConfiguration', 'Chart.js types imported');

console.log('\n' + '='.repeat(50));
console.log('\n📊 VERIFICATION RESULTS:\n');

// Print all results
results.forEach(result => {
  console.log(`${result.status.padEnd(25)} ${result.check}`);
});

console.log('\n' + '='.repeat(50));

if (allPassed) {
  console.log('\n✅ ALL CHECKS PASSED!');
  console.log('\n🚀 Your project is ready for testing!');
  console.log('\nNext steps:');
  console.log('1. Run: ng serve');
  console.log('2. Open: http://localhost:4200');
  console.log('3. Login as Admin');
  console.log('4. Navigate to Analytics dashboard');
  console.log('5. Check notification bell in navbar');
  console.log('\n📖 See TESTING_CHECKLIST.md for detailed testing guide');
} else {
  console.log('\n❌ SOME CHECKS FAILED!');
  console.log('\nPlease review the failed checks above.');
  console.log('If files are missing, they may need to be created.');
}

console.log('\n' + '='.repeat(50) + '\n');

process.exit(allPassed ? 0 : 1);
