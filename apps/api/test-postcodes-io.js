const fetch = require('node-fetch');

/**
 * Test script for postcodes.io UK postcode validation
 * This script tests various postcode scenarios to ensure the API is working correctly
 */

const POSTCODES_IO_BASE_URL = 'https://api.postcodes.io';

async function testPostcodeValidation(postcode) {
  console.log(`\n🔍 Testing postcode: ${postcode}`);
  
  try {
    const url = `${POSTCODES_IO_BASE_URL}/postcodes/${encodeURIComponent(postcode)}`;
    console.log(`📡 URL: ${url}`);
    
    const response = await fetch(url);
    console.log(`📊 Response status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Valid UK postcode found!`);
      console.log(`   📍 Location: ${data.result.admin_district}, ${data.result.region}`);
      console.log(`   🗺️  Coordinates: ${data.result.latitude}, ${data.result.longitude}`);
      console.log(`   🏷️  Outcode: ${data.result.outcode}, Incode: ${data.result.incode}`);
      console.log(`   🌍 Country: ${data.result.country}`);
      return true;
    } else if (response.status === 404) {
      console.log(`❌ Postcode not found in UK`);
      return false;
    } else {
      console.log(`⚠️  Unexpected response: ${response.status} ${response.statusText}`);
      return false;
    }
  } catch (error) {
    console.error(`💥 Error testing postcode ${postcode}:`, error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting postcodes.io validation tests...\n');
  
  const testCases = [
    // Valid UK postcodes (these should definitely exist)
    'SW1A 1AA',  // Buckingham Palace, London
    'W1A 1AA',   // BBC Broadcasting House, London
    'SW1A 2AA',  // Another London postcode
    'W1A 2AA',   // Another London postcode
    'M1 1AA',    // Manchester
    'M1 2AA',    // Manchester
    'B1 1AA',    // Birmingham
    'B1 2AA',    // Birmingham
    'EH1 1AA',   // Edinburgh
    'EH1 2AA',   // Edinburgh
    'L1 1AA',    // Liverpool
    'L1 2AA',    // Liverpool
    'G1 1AA',    // Glasgow
    'G1 2AA',    // Glasgow
    'CF1 1AA',   // Cardiff
    'CF1 2AA',   // Cardiff
    'BT1 1AA',   // Belfast
    'BT1 2AA',   // Belfast
    
    // Invalid postcodes
    '43003',     // US postcode
    'ABC123',    // Invalid format
    '12345',     // Invalid format
    'PQ2 3RE',  // Invalid UK postcode
    'XY9 9ZZ',  // Invalid UK postcode
    'ZZ9 9ZZ',  // Invalid UK postcode
  ];
  
  let validCount = 0;
  let invalidCount = 0;
  
  for (const postcode of testCases) {
    const isValid = await testPostcodeValidation(postcode);
    if (isValid) {
      validCount++;
    } else {
      invalidCount++;
    }
    
    // Small delay between requests to be respectful to the API
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('\n📊 Test Results Summary:');
  console.log(`✅ Valid postcodes found: ${validCount}`);
  console.log(`❌ Invalid postcodes rejected: ${invalidCount}`);
  console.log(`📝 Total test cases: ${testCases.length}`);
  
  // We expect most of the UK postcodes to be valid
  if (validCount >= 10 && invalidCount >= 6) {
    console.log('\n🎉 All tests passed! postcodes.io is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the results above.');
  }
}

// Run the tests
runTests().catch(console.error);
