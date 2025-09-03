const fetch = require('node-fetch');

/**
 * Test script to simulate frontend postcode validation
 * This tests the same API calls that the marketplace frontend makes
 */

const API_BASE_URL = 'http://localhost:4000';

async function testFrontendPostcodeValidation(postcode, description) {
  console.log(`\n🔍 Testing: ${description}`);
  console.log(`📝 Postcode: ${postcode}`);
  
  try {
    // Simulate the exact API call the frontend makes
    const response = await fetch(`${API_BASE_URL}/api/postcode/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ postcode })
    });
    
    console.log(`📊 Response status: ${response.status}`);
    
    if (response.ok) {
      const result = await response.json();
      if (result.isValid) {
        console.log(`✅ Valid UK postcode!`);
        console.log(`   📍 Location: ${result.city}, ${result.region}`);
        console.log(`   🗺️  Coordinates: ${result.coordinates.lat}, ${result.coordinates.lng}`);
        console.log(`   🏷️  Area: ${result.area}, District: ${result.district}`);
        return true;
      } else {
        console.log(`❌ Invalid postcode: ${result.message}`);
        return false;
      }
    } else {
      const error = await response.json();
      console.log(`❌ API Error: ${error.message}`);
      return false;
    }
  } catch (error) {
    console.error(`💥 Request failed:`, error.message);
    return false;
  }
}

async function runFrontendTests() {
  console.log('🚀 Starting Frontend Integration Tests...\n');
  console.log('This simulates the exact API calls the marketplace frontend makes\n');
  
  const testCases = [
    // Valid UK postcodes (should work in registration)
    {
      postcode: 'SW1A 1AA',
      description: 'Valid London postcode - should allow registration'
    },
    {
      postcode: 'B1 2AA',
      description: 'Valid Birmingham postcode - should allow registration'
    },
    {
      postcode: 'EH1 2AA',
      description: 'Valid Edinburgh postcode - should allow registration'
    },
    {
      postcode: 'BT1 1AA',
      description: 'Valid Belfast postcode - should allow registration'
    },
    
    // Invalid postcodes (should block registration)
    {
      postcode: '43003',
      description: 'US postcode - should block registration'
    },
    {
      postcode: 'ABC123',
      description: 'Invalid format - should block registration'
    },
    {
      postcode: 'PQ2 3RE',
      description: 'Invalid UK postcode - should block registration'
    },
    {
      postcode: 'XY9 9ZZ',
      description: 'Invalid UK postcode - should block registration'
    },
    
    // Edge cases
    {
      postcode: '',
      description: 'Empty postcode - should block registration'
    },
    {
      postcode: 'SW1A',
      description: 'Incomplete postcode - should block registration'
    }
  ];
  
  let validCount = 0;
  let invalidCount = 0;
  
  for (const test of testCases) {
    const isValid = await testFrontendPostcodeValidation(test.postcode, test.description);
    
    if (isValid) {
      validCount++;
    } else {
      invalidCount++;
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log(`\n${'='.repeat(60)}`);
  console.log('📊 Frontend Integration Test Results:');
  console.log(`✅ Valid postcodes (registration allowed): ${validCount}`);
  console.log(`❌ Invalid postcodes (registration blocked): ${invalidCount}`);
  console.log(`📝 Total test cases: ${testCases.length}`);
  
  // Expected results:
  // - 4 valid UK postcodes should allow registration
  // - 6 invalid postcodes should block registration
  if (validCount === 4 && invalidCount === 6) {
    console.log('\n🎉 Perfect! Frontend integration is working correctly!');
    console.log('✅ Valid UK postcodes are being accepted for registration');
    console.log('✅ Invalid postcodes are being correctly rejected');
    console.log('✅ The marketplace is now properly restricted to UK users only');
  } else {
    console.log('\n⚠️  Some tests didn\'t work as expected. Please check the results above.');
  }
  
  console.log('\n🔒 Security Status:');
  if (invalidCount >= 6) {
    console.log('✅ UK-only restriction is working correctly');
    console.log('✅ Invalid postcodes cannot be used for registration');
  } else {
    console.log('⚠️  UK-only restriction may not be fully working');
  }
}

// Run the tests
runFrontendTests().catch(console.error);
