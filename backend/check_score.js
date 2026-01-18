const axios = require('axios');

async function checkClientScore() {
  try {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjkzOGM5ZTgzLTNiZWEtNDQyNS1iYjMwLTcxZjljNzlkNDJmOSIsImVtYWlsIjoiY2xpZW50QHRlc3QuY29tIiwicm9sZSI6IkNMSUVOVCIsImlhdCI6MTc2NjgyNjIwMCwiZXhwIjoxNzY2ODI3MTAwfQ.UfAQ-yLcjXEEhSo_lDn67y3aeM4LhjAOENrCKyu8gqU';

    const response = await axios.get('http://localhost:5003/api/client-score/clients/938c9e83-3bea-4425-bb30-71f9c79d42f9/score', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Client score:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Failed to get client score:', error.response?.data || error.message);
  }
}

async function checkClientHistory() {
  try {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjkzOGM5ZTgzLTNiZWEtNDQyNS1iYjMwLTcxZjljNzlkNDJmOSIsImVtYWlsIjoiY2xpZW50QHRlc3QuY29tIiwicm9sZSI6IkNMSUVOVCIsImlhdCI6MTc2NjgyNjIwMCwiZXhwIjoxNzY2ODI3MTAwfQ.UfAQ-yLcjXEEhSo_lDn67y3aeM4LhjAOENrCKyu8gqU';

    const response = await axios.get('http://localhost:5003/api/client-score/clients/938c9e83-3bea-4425-bb30-71f9c79d42f9/history', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Client score history:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Failed to get client history:', error.response?.data || error.message);
  }
}

async function runChecks() {
  console.log('=== CHECKING CLIENT SCORE ===');
  await checkClientScore();
  console.log('\n=== CHECKING CLIENT SCORE HISTORY ===');
  await checkClientHistory();
}

runChecks();