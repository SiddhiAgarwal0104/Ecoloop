#!/usr/bin/env node

/**
 * API Testing Script for EcoLoop Household Backend
 * Tests all endpoints with sample data
 */

const BASE_URL = 'http://localhost:5000/api';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

let authToken = '';
let userId = '';
let donationId = '';
let recycleId = '';
let notificationId = '';

// Helper function for API requests
async function makeRequest(method, endpoint, body = null, token = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    }
  };

  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    return { status: 0, data: { error: error.message } };
  }
}

// Helper function to log results
function logResult(testName, passed, response) {
  const status = passed ? `${colors.green}✓ PASSED${colors.reset}` : `${colors.red}✗ FAILED${colors.reset}`;
  console.log(`\n${colors.cyan}[TEST] ${testName}${colors.reset}`);
  console.log(`${status}`);
  console.log(`Status: ${response.status}`);
  console.log(`Response:`, JSON.stringify(response.data, null, 2));
}

async function runTests() {
  console.log(`${colors.blue}${'='.repeat(60)}`);
  console.log(`EcoLoop Household Backend API Test Suite`);
  console.log(`${'='.repeat(60)}${colors.reset}\n`);

  try {
    // 1. Health Check
    console.log(`${colors.yellow}1. Testing Health Check${colors.reset}`);
    const healthRes = await makeRequest('GET', '/health');
    logResult('Health Check', healthRes.status === 200, healthRes);

    // 2. Register User
    console.log(`\n${colors.yellow}2. Testing User Registration${colors.reset}`);
    const registerBody = {
      name: 'John Doe',
      email: `testuser${Date.now()}@example.com`,
      phone: '9876543210',
      password: 'Password@123',
      locality: 'Bandra',
      address: '123 Main Street, Mumbai',
      latitude: 19.0596,
      longitude: 72.8295
    };
    const registerRes = await makeRequest('POST', '/auth/register', registerBody);
    const registerPassed = registerRes.status === 201 && registerRes.data.data?.token;
    logResult('User Registration', registerPassed, registerRes);

    if (registerPassed) {
      authToken = registerRes.data.data.token;
      userId = registerRes.data.data.user.id;
      console.log(`${colors.green}Token saved: ${authToken.substring(0, 20)}...${colors.reset}`);
      console.log(`${colors.green}User ID saved: ${userId}${colors.reset}`);
    }

    // 3. Login User
    console.log(`\n${colors.yellow}3. Testing User Login${colors.reset}`);
    const loginBody = {
      email: registerBody.email,
      password: registerBody.password
    };
    const loginRes = await makeRequest('POST', '/auth/login', loginBody);
    const loginPassed = loginRes.status === 200 && loginRes.data.data?.token;
    logResult('User Login', loginPassed, loginRes);

    // 4. Get User Profile
    console.log(`\n${colors.yellow}4. Testing Get User Profile${colors.reset}`);
    const profileRes = await makeRequest('GET', '/auth/me', null, authToken);
    const profilePassed = profileRes.status === 200;
    logResult('Get User Profile', profilePassed, profileRes);

    // 5. Create Donation
    console.log(`\n${colors.yellow}5. Testing Create Donation${colors.reset}`);
    const donationBody = {
      itemCategory: 'CLOTHES',
      condition: 'GOOD',
      quantity: 5,
      description: 'Winter clothes in good condition',
      address: '456 Charity Lane, Mumbai',
      latitude: 19.0760,
      longitude: 72.8777
    };
    const createDonRes = await makeRequest('POST', '/donations', donationBody, authToken);
    const donationPassed = createDonRes.status === 201 && createDonRes.data.data?.donation?._id;
    logResult('Create Donation', donationPassed, createDonRes);

    if (donationPassed) {
      donationId = createDonRes.data.data.donation._id;
      console.log(`${colors.green}Donation ID saved: ${donationId}${colors.reset}`);
    }

    // 6. Get My Donations
    console.log(`\n${colors.yellow}6. Testing Get My Donations${colors.reset}`);
    const myDonRes = await makeRequest('GET', '/donations/my', null, authToken);
    const myDonPassed = myDonRes.status === 200 && Array.isArray(myDonRes.data.data?.donations);
    logResult('Get My Donations', myDonPassed, myDonRes);

    // 7. Get Single Donation
    if (donationId) {
      console.log(`\n${colors.yellow}7. Testing Get Single Donation${colors.reset}`);
      const singleDonRes = await makeRequest('GET', `/donations/${donationId}`, null, authToken);
      const singleDonPassed = singleDonRes.status === 200;
      logResult('Get Single Donation', singleDonPassed, singleDonRes);

      // 8. Update Donation
      console.log(`\n${colors.yellow}8. Testing Update Donation${colors.reset}`);
      const updateDonBody = {
        quantity: 7,
        description: 'Updated winter clothes collection'
      };
      const updateDonRes = await makeRequest('PUT', `/donations/${donationId}`, updateDonBody, authToken);
      const updateDonPassed = updateDonRes.status === 200;
      logResult('Update Donation', updateDonPassed, updateDonRes);
    }

    // 9. Create Recycle Request
    console.log(`\n${colors.yellow}9. Testing Create Recycle Request${colors.reset}`);
    const recycleBody = {
      wasteCategory: 'PLASTIC',
      wasteType: 'SEGREGATED',
      quantity: 25,
      unit: 'KG',
      description: 'Plastic bottles and containers',
      address: '789 Eco Street, Mumbai',
      latitude: 19.0844,
      longitude: 72.8867
    };
    const createRecRes = await makeRequest('POST', '/recycle', recycleBody, authToken);
    const recyclePassed = createRecRes.status === 201 && createRecRes.data.data?.recycleRequest?._id;
    logResult('Create Recycle Request', recyclePassed, createRecRes);

    if (recyclePassed) {
      recycleId = createRecRes.data.data.recycleRequest._id;
      console.log(`${colors.green}Recycle ID saved: ${recycleId}${colors.reset}`);
    }

    // 10. Get My Recycle Requests
    console.log(`\n${colors.yellow}10. Testing Get My Recycle Requests${colors.reset}`);
    const myRecRes = await makeRequest('GET', '/recycle/my', null, authToken);
    const myRecPassed = myRecRes.status === 200 && Array.isArray(myRecRes.data.data?.recycleRequests);
    logResult('Get My Recycle Requests', myRecPassed, myRecRes);

    // 11. Get Single Recycle Request
    if (recycleId) {
      console.log(`\n${colors.yellow}11. Testing Get Single Recycle Request${colors.reset}`);
      const singleRecRes = await makeRequest('GET', `/recycle/${recycleId}`, null, authToken);
      const singleRecPassed = singleRecRes.status === 200;
      logResult('Get Single Recycle Request', singleRecPassed, singleRecRes);

      // 12. Update Recycle Request
      console.log(`\n${colors.yellow}12. Testing Update Recycle Request${colors.reset}`);
      const updateRecBody = {
        quantity: 30,
        description: 'Updated plastic waste collection'
      };
      const updateRecRes = await makeRequest('PUT', `/recycle/${recycleId}`, updateRecBody, authToken);
      const updateRecPassed = updateRecRes.status === 200;
      logResult('Update Recycle Request', updateRecPassed, updateRecRes);
    }

    // 13. Get Household Dashboard
    console.log(`\n${colors.yellow}13. Testing Get Household Dashboard${colors.reset}`);
    const dashRes = await makeRequest('GET', '/dashboard/household', null, authToken);
    const dashPassed = dashRes.status === 200 && dashRes.data.data?.stats;
    logResult('Get Household Dashboard', dashPassed, dashRes);

    // 14. Get Household Stats
    console.log(`\n${colors.yellow}14. Testing Get Household Stats${colors.reset}`);
    const statsRes = await makeRequest('GET', '/dashboard/stats', null, authToken);
    const statsPassed = statsRes.status === 200 && statsRes.data.data?.stats;
    logResult('Get Household Stats', statsPassed, statsRes);

    // 15. Get Notifications
    console.log(`\n${colors.yellow}15. Testing Get Notifications${colors.reset}`);
    const notifRes = await makeRequest('GET', '/notifications', null, authToken);
    const notifPassed = notifRes.status === 200 && Array.isArray(notifRes.data.data?.notifications);
    logResult('Get Notifications', notifPassed, notifRes);

    // 16. Get Unread Count
    console.log(`\n${colors.yellow}16. Testing Get Unread Notification Count${colors.reset}`);
    const unreadRes = await makeRequest('GET', '/notifications/unread-count', null, authToken);
    const unreadPassed = unreadRes.status === 200;
    logResult('Get Unread Count', unreadPassed, unreadRes);

    // 17. Delete Donation (if created)
    if (donationId) {
      console.log(`\n${colors.yellow}17. Testing Delete Donation${colors.reset}`);
      const delDonRes = await makeRequest('DELETE', `/donations/${donationId}`, null, authToken);
      const delDonPassed = delDonRes.status === 200;
      logResult('Delete Donation', delDonPassed, delDonRes);
    }

    // 18. Delete Recycle Request (if created)
    if (recycleId) {
      console.log(`\n${colors.yellow}18. Testing Delete Recycle Request${colors.reset}`);
      const delRecRes = await makeRequest('DELETE', `/recycle/${recycleId}`, null, authToken);
      const delRecPassed = delRecRes.status === 200;
      logResult('Delete Recycle Request', delRecPassed, delRecRes);
    }

    // Test without authentication
    console.log(`\n${colors.yellow}19. Testing Protected Route Without Token${colors.reset}`);
    const noAuthRes = await makeRequest('GET', '/dashboard/household', null, null);
    const noAuthPassed = noAuthRes.status === 401;
    logResult('Protected Route Without Token', noAuthPassed, noAuthRes);

    // Summary
    console.log(`\n${colors.blue}${'='.repeat(60)}`);
    console.log(`Test Suite Completed!`);
    console.log(`${'='.repeat(60)}${colors.reset}\n`);

  } catch (error) {
    console.error(`${colors.red}Test Error: ${error.message}${colors.reset}`);
  }
}

// Run tests
runTests();
