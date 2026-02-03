async function testReviewAPI() {
  const salonId = '71ff6378-9e6d-4b7d-9ecd-bc960a963a4e';
  
  try {
    console.log('Test de l\'API des avis pour le salon:', salonId);
    
    const response = await fetch(`http://localhost:5003/api/reviews/salons/${salonId}/reviews`);
    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Data:', data);
    console.log('Type:', typeof data);
    console.log('Est tableau:', Array.isArray(data));
    console.log('Longueur:', data?.length);
    
    if (data && data.length > 0) {
      data.forEach((review, index) => {
        console.log(`\n--- Avis ${index + 1} ---`);
        console.log('ID:', review.id);
        console.log('Note:', review.rating);
        console.log('Commentaire:', review.comment);
        console.log('Client:', review.client?.fullName);
        console.log('Salon ID:', review.salonId);
      });
    }
    
  } catch (error) {
    console.error('Erreur:', error.message);
  }
}

testReviewAPI();
