#!/usr/bin/env node

const http = require('http');

function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(data)
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function test() {
  console.log('\n========== EcoLoop API Test ==========\n');

  try {
    console.log('Testing Health Check...');
    const health = await makeRequest('GET', '/api/health');
    console.log(`Status: ${health.status}`);
    console.log(`Response:`, health.data);
    console.log('✓ Server is running!\n');
  } catch (error) {
    console.error('✗ Server connection failed:', error.message);
  }
}

test();
