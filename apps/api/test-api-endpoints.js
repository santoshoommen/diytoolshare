const fetch = require('node-fetch');

/**
 * Test script for the DIY Tool Share API postcode validation endpoints
 * This script tests all the API endpoints to ensure they're working correctly with postcodes.io
 */

const API_BASE_URL = 'http://localhost:4000';

async function testEndpoint(endpoint, data, expectedStatus = 200) {
  console.log(`\n🔍 Testing endpoint: ${endpoint}`);
  console.log(`📤 Request data:`, data);
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    
    console.log(`📊 Response status: ${response.status}`);
    
    if (response.ok) {
      const result = await response.json();
      console.log(`✅ Success! Response:`, JSON.stringify(result, null, 2));
      return true;
    } else {
      const error = await response.json();
      console.log(`❌ Error:`, JSON.stringify(error, null, 2));
      return false;
    }
  } catch (error) {
    console.error(`💥 Request failed:`, error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting API endpoint tests...\n');
  
  const tests = [
    // Test valid UK postcodes
    {
      endpoint: '/api/postcode/validate',
      data: { postcode: 'SW1A 1AA' },
      description: 'Valid London postcode (Buckingham Palace)'
    },
    {
      endpoint: '/api/postcode/validate',
      data: { postcode: 'B1 2AA' },
      description: 'Valid Birmingham postcode'
    },
    {
      endpoint: '/api/postcode/validate',
      data: { postcode: 'EH1 2AA' },
      description: 'Valid Edinburgh postcode'
    },
    {
      endpoint: '/api/postcode/validate',
      data: { postcode: 'BT1 1AA' },
      description: 'Valid Belfast postcode'
    },
    
    // Test region checking
    {
      endpoint: '/api/postcode/region',
      data: { postcode: 'SW1A 1AA', region: 'London' },
      description: 'Check if SW1A 1AA is in London region'
    },
    {
      endpoint: '/api/postcode/region',
      data: { postcode: 'B1 2AA', region: 'West Midlands' },
      description: 'Check if B1 2AA is in West Midlands region'
    },
    
    // Test invalid postcodes
    {
      endpoint: '/api/postcode/validate',
      data: { postcode: '43003' },
      description: 'Invalid US postcode format'
    },
    {
      endpoint: '/api/postcode/validate',
      data: { postcode: 'ABC123' },
      description: 'Invalid postcode format'
    },
    {
      endpoint: '/api/postcode/validate',
      data: { postcode: 'PQ2 3RE' },
      description: 'Invalid UK postcode (not found in database)'
    },
    
    // Test edge cases
    {
      endpoint: '/api/postcode/validate',
      data: { postcode: '' },
      description: 'Empty postcode'
    },
    {
      endpoint: '/api/postcode/validate',
      data: {},
      description: 'Missing postcode field'
    }
  ];
  
  let successCount = 0;
  let failureCount = 0;
  
  for (const test of tests) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📝 Test: ${test.description}`);
    
    const success = await testEndpoint(test.endpoint, test.data);
    
    if (success) {
      successCount++;
    } else {
      failureCount++;
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log(`\n${'='.repeat(60)}`);
  console.log('📊 Test Results Summary:');
  console.log(`✅ Successful tests: ${successCount}`);
  console.log(`❌ Failed tests: ${failureCount}`);
  console.log(`📝 Total tests: ${tests.length}`);
  
  if (successCount >= 8) {
    console.log('\n🎉 All critical tests passed! The API is working correctly with postcodes.io.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the results above.');
  }
}

// Run the tests
runTests().catch(console.error);
