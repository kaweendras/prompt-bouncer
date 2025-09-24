const { AIContentFilter } = require('../../dist/index.js');

console.log('=== Comparing Default vs Mild Filter Enabled ===\n');

// Default filter (mild disabled)
const defaultFilter = new AIContentFilter();

// Strict filter (mild enabled) 
const strictFilter = new AIContentFilter({
  enableMildFilter: true
});

const testTexts = [
  'This song is fire',
  'I killed the bug in my code',
  'That movie was absolutely fire',
  'Kill the process in task manager',
  'I want to kill you' // This should be flagged by both
];

testTexts.forEach((text, index) => {
  console.log(`${index + 1}. Testing: "${text}"`);
  
  const defaultResult = defaultFilter.moderate(text);
  const strictResult = strictFilter.moderate(text);
  
  console.log(`   Default Filter (mild disabled):`);
  console.log(`     Safe: ${defaultResult.isSafe}`);
  console.log(`     Categories: [${defaultResult.categories.join(', ')}]`);
  console.log(`     Flagged: [${defaultResult.flaggedWords.join(', ')}]`);
  
  console.log(`   Strict Filter (mild enabled):`);
  console.log(`     Safe: ${strictResult.isSafe}`);
  console.log(`     Categories: [${strictResult.categories.join(', ')}]`);
  console.log(`     Flagged: [${strictResult.flaggedWords.join(', ')}]`);
  
  console.log('');
});

console.log('=== Recommended Usage Pattern ===');
console.log('// Allow content that is safe OR low severity (mild)');
console.log('function shouldAllowContent(text) {');
console.log('  const result = defaultFilter.moderate(text);');
console.log('  return result.isSafe || result.severity === "low";');
console.log('}');
console.log('');

// Test the recommended pattern
const testPattern = 'This game lets you kill enemies';
const result = defaultFilter.moderate(testPattern);
const shouldAllow = result.isSafe || result.severity === "low";

console.log(`Example: "${testPattern}"`);
console.log(`Result: ${result.isSafe ? 'Safe' : 'Flagged (' + result.severity + ')'}`);
console.log(`Recommended Action: ${shouldAllow ? 'ALLOW' : 'BLOCK'}`);