#!/usr/bin/env node

/**
 * Test script for frontend postcode validation
 * Tests the marketplace frontend integration with the API
 */

const testCases = [
  {
    postcode: 'SW1A 1AA',
    expected: 'valid',
    description: 'Valid UK postcode (London)'
  },
  {
    postcode: '43003',
    expected: 'invalid',
    description: 'Invalid US ZIP code'
  },
  {
    postcode: 'ABC123',
    expected: 'invalid',
    description: 'Invalid format'
  },
  {
    postcode: 'M1 1AA',
    expected: 'valid',
    description: 'Valid UK postcode (Manchester)'
  }
];

async function testFrontendValidation() {
  console.log('🧪 Testing Frontend Postcode Validation Integration\n');
  
  for (const testCase of testCases) {
    console.log(`Testing: ${testCase.postcode} - ${testCase.description}`);
    
    try {
      // Test the API endpoint that the frontend uses
      const response = await fetch('http://localhost:4000/api/postcode/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postcode: testCase.postcode }),
      });

      const result = await response.json();
      
      if (testCase.expected === 'valid') {
        if (result.isValid) {
          console.log(`✅ PASS: ${testCase.postcode} correctly validated as valid UK postcode`);
          console.log(`   Location: ${result.city || result.area} (${result.country})`);
        } else {
          console.log(`❌ FAIL: ${testCase.postcode} should be valid but was rejected`);
          console.log(`   Error: ${result.message}`);
        }
      } else {
        if (!result.isValid) {
          console.log(`✅ PASS: ${testCase.postcode} correctly rejected as invalid`);
          console.log(`   Error: ${result.message}`);
        } else {
          console.log(`❌ FAIL: ${testCase.postcode} should be invalid but was accepted`);
        }
      }
      
      console.log('---');
      
    } catch (error) {
      console.log(`❌ ERROR: ${testCase.postcode} -> ${error.message}`);
      console.log('---');
    }
  }
  
  console.log('🎯 Frontend validation test completed!');
  console.log('\n📱 Next steps:');
  console.log('1. Open http://localhost:3000 in your browser');
  console.log('2. Go to the signup/registration page');
  console.log('3. Try entering "43003" as a postcode');
  console.log('4. Verify it shows validation error and prevents form submission');
}

// Run the test
testFrontendValidation().catch(console.error);
