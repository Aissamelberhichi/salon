const axios = require('axios');

async function checkReservations() {
  try {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjkzOGM5ZTgzLTNiZWEtNDQyNS1iYjMwLTcxZjljNzlkNDJmOSIsImVtYWlsIjoiY2xpZW50QHRlc3QuY29tIiwicm9sZSI6IkNMSUVOVCIsImlhdCI6MTc2NjgyNjIwMCwiZXhwIjoxNzY2ODI3MTAwfQ.UfAQ-yLcjXEEhSo_lDn67y3aeM4LhjAOENrCKyu8gqU';

    const response = await axios.get('http://localhost:5003/api/rdv/my-reservations', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Existing reservations:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Failed to get reservations:', error.response?.data || error.message);
  }
}

checkReservations();