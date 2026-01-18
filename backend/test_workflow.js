const axios = require('axios');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImI1ZmM1YzU2LTY3MDQtNGI1Ny04ZjExLTcyMDYwNzhhZTNmOSIsImVtYWlsIjoiY2Fpc3NpZXJAdGVzdC5jb20iLCJyb2xlIjoiQ0FJU1NJRVIiLCJpYXQiOjE3NjY4MjYzNTcsImV4cCI6MTc2NjgyNzI1N30.DsgStMA1WNQRgDZrmRNzaU0esHV2y8IF43SIfp-RL1g';

async function getTodayReservations() {
  try {
    const response = await axios.get('http://localhost:5003/api/admin/reservations?date=2025-12-27', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Today reservations:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Failed to get reservations:', error.response?.data || error.message);
  }
}

async function updateStatus(rdvId, status) {
  try {
    const response = await axios.put(`http://localhost:5003/api/rdv/${rdvId}/status`, {
      status: status
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`Status updated to ${status}:`, JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error(`Failed to update status to ${status}:`, error.response?.data || error.message);
  }
}

// Test the workflow
async function testWorkflow() {
  console.log('=== TESTING CAISSIER WORKFLOW ===');

  // 1. Get today's reservations
  console.log('\n1. Getting today\'s reservations...');
  await getTodayReservations();

  // 2. Change PENDING to CONFIRMED
  console.log('\n2. Changing PENDING to CONFIRMED...');
  await updateStatus('74ad9bb5-fb2e-4847-9fce-e8aad8270f60', 'CONFIRMED');

  // 3. Change CONFIRMED to LATE
  console.log('\n3. Changing CONFIRMED to LATE...');
  await updateStatus('74ad9bb5-fb2e-4847-9fce-e8aad8270f60', 'LATE');

  // 4. Accept late client (LATE to CONFIRMED)
  console.log('\n4. Accepting late client (LATE to CONFIRMED)...');
  await updateStatus('74ad9bb5-fb2e-4847-9fce-e8aad8270f60', 'CONFIRMED');

  // 5. Complete the service (CONFIRMED to COMPLETED)
  console.log('\n5. Completing the service (CONFIRMED to COMPLETED)...');
  await updateStatus('74ad9bb5-fb2e-4847-9fce-e8aad8270f60', 'COMPLETED');

  console.log('\n=== WORKFLOW TEST COMPLETED ===');
}

testWorkflow();