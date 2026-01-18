const axios = require('axios');

async function createRdv() {
  try {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjkzOGM5ZTgzLTNiZWEtNDQyNS1iYjMwLTcxZjljNzlkNDJmOSIsImVtYWlsIjoiY2xpZW50QHRlc3QuY29tIiwicm9sZSI6IkNMSUVOVCIsImlhdCI6MTc2NjgyNjIwMCwiZXhwIjoxNzY2ODI3MTAwfQ.UfAQ-yLcjXEEhSo_lDn67y3aeM4LhjAOENrCKyu8gqU';

    const response = await axios.post('http://localhost:5003/api/rdv/book', {
      salonId: '314d241f-de09-4a2e-8987-96fa026bf62c',
      serviceIds: ['5931fe39-04bd-488a-b5e9-2f19aac03de6'],
      date: '2025-12-27',
      startTime: '17:00',
      coiffeurId: 'de73c34c-4a21-4ad3-8f05-9a6835cd0da3',
      notes: 'Test RDV pour vérifier le workflow caissier'
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('RDV created successfully:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Failed to create RDV:', error.response?.data || error.message);
  }
}

createRdv();