// SalonDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { salonAPI, serviceAPI, coiffeurAPI, rdvAPI } from '../../services/api';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { reviewAPI, clientScoreAPI } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

export const SalonDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [salon, setSalon] = useState(null);
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [coiffeurs, setCoiffeurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Booking state
  const [selectedService, setSelectedService] = useState(null);
  const [selectedCoiffeur, setSelectedCoiffeur] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedServices, setSelectedServices] = useState([]);

  const [reviews, setReviews] = useState([]);
  const [canReview, setCanReview] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  // Client scoring state
  const [clientScore, setClientScore] = useState(null);
  const [checkingScore, setCheckingScore] = useState(false);

  // Calculer durée et prix totaux
  const totalDuration = selectedServices.reduce((sum, serviceId) => {
    const service = services.find(s => s.id === serviceId);
    return sum + (service?.duration || 0);
  }, 0);

  const totalPrice = selectedServices.reduce((sum, serviceId) => {
    const service = services.find(s => s.id === serviceId);
    return sum + (service?.price || 0);
  }, 0);

  useEffect(() => {
    loadData();
  }, [id]);

  useEffect(() => {
    if (selectedCoiffeur && selectedDate && selectedServices.length > 0) {
      loadAvailableSlots();
    } else {
      setAvailableSlots([]);
    }
  }, [selectedCoiffeur, selectedDate, selectedServices]);

  useEffect(() => {
    // Load reviews
    reviewAPI.getSalonReviews(id).then(r => setReviews(r.data || [])).catch(() => {});
    // Check if current user can review
    if (user?.role === 'CLIENT') {
      // Backend will check eligibility, we rely on that for now
      setCanReview(true);
    }
  }, [id, user]);

  // Load client score when user is available
  useEffect(() => {
    if (user?.role === 'CLIENT') {
      const loadClientScore = async () => {
        try {
          const { data } = await clientScoreAPI.getClientScore(user.id);
          setClientScore(data);
        } catch (err) {
          console.error('Error loading client score:', err);
        }
      };
      loadClientScore();
    }
  }, [user]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError('');
    setReviewSuccess('');
    try {
      await reviewAPI.createReview(id, reviewForm);
      setReviewSuccess('Avis ajouté !');
      setReviewForm({ rating: 5, comment: '' });
      // Reload reviews
      const { data } = await reviewAPI.getSalonReviews(id);
      setReviews(data || []);
    } catch (e) {
      setReviewError(e.response?.data?.error || 'Erreur');
    }
  };

  const loadData = async () => {
    try {
      const [salonRes, servicesRes, categoriesRes, coiffeursRes] = await Promise.all([
        salonAPI.getSalonById(id),
        serviceAPI.getServicesBySalon(id),
        serviceAPI.getAllCategories(),
        coiffeurAPI.getCoiffeursBySalon(id)
      ]);
      
      setSalon(salonRes.data);
      
      // Debug: Vérifier les données brutes
      console.log('Services bruts:', servicesRes.data);
      console.log('Categories brutes:', categoriesRes.data);
      
      // Parser les données si nécessaire
      let servicesData = servicesRes.data;
      let categoriesData = categoriesRes.data;
      
      // Si les services sont des chaînes (données brutes), essayer de parser
      if (typeof servicesData === 'string') {
        try {
          servicesData = JSON.parse(servicesData);
        } catch (e) {
          console.error('Erreur parsing services:', e);
          servicesData = [];
        }
      }
      
      // Si les catégories sont des chaînes, essayer de parser
      if (typeof categoriesData === 'string') {
        try {
          categoriesData = JSON.parse(categoriesData);
        } catch (e) {
          console.error('Erreur parsing categories:', e);
          categoriesData = [];
        }
      }
      
      setServices(servicesData);
      setCategories(categoriesData);
      setCoiffeurs(coiffeursRes.data);
      
      console.log('Services parsés:', servicesData);
      console.log('Categories parsées:', categoriesData);
      
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableSlots = async () => {
    try {
      const serviceIdForSlots = selectedServices[0] || null; // utiliser le 1er service sélectionné
      const { data } = await rdvAPI.getAvailableSlots(
        selectedCoiffeur,
        selectedDate,
        serviceIdForSlots
      );
      setAvailableSlots(data);
    } catch (err) {
      console.error('Erreur chargement créneaux:', err);
      setAvailableSlots([]);
    }
  };

  const handleBooking = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (selectedServices.length === 0 || !selectedCoiffeur || !selectedDate || !selectedSlot) {
      setError('Veuillez sélectionner au moins un service et tous les champs requis');
      return;
    }

    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      // Check client score before booking
      if (user.role === 'CLIENT' && clientScore) {
        if (clientScore.requiresDeposit) {
          const confirmBooking = window.confirm(
            `Votre score de confiance est de ${clientScore.score} (${clientScore.level}).\n\n` +
            `Un dépôt sera requis pour confirmer cette réservation.\n\n` +
            `Voulez-vous continuer ?`
          );
          if (!confirmBooking) {
            setSubmitting(false);
            return;
          }
        }
      }
      await rdvAPI.createRendezVous({
        salonId: id,
        serviceIds: selectedServices,
        coiffeurId: selectedCoiffeur,
        date: selectedDate,
        startTime: selectedSlot,
        notes
      });
      
      setSuccess('✅ Réservation créée avec succès!');
      setTimeout(() => {
        navigate('/my-reservations');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la réservation');
    } finally {
      setSubmitting(false);
    }
  };

  // Grouper les services par catégorie
  const getServicesByCategory = () => {
    if (!services.length || !categories.length) return {};
    
    const grouped = {};
    
    // Debug logs
    console.log('Services:', services);
    console.log('Categories:', categories);
    
    services.forEach(service => {
      console.log('Service:', service);
      console.log('Service categoryId:', service.categoryId);
      
      const category = categories.find(cat => cat.id === service.categoryId);
      console.log('Found category:', category);
      
      const categoryName = category ? category.name : 'Non catégorisé';
      
      if (!grouped[categoryName]) {
        grouped[categoryName] = {
          category: category || { name: 'Non catégorisé', icon: '📦' },
          services: []
        };
      }
      
      grouped[categoryName].services.push(service);
    });
    
    console.log('Grouped services:', grouped);
    return grouped;
  };

  const servicesByCategory = getServicesByCategory();

  // Modifier le toggle de service
  const toggleService = (serviceId) => {
    setSelectedServices(prev => {
      if (prev.includes(serviceId)) {
        return prev.filter(id => id !== serviceId);
      } else {
        return [...prev, serviceId];
      }
    });
    setSelectedSlot(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!salon) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Salon non trouvé</p>
          <Button onClick={() => navigate('/salons')}>Retour aux salons</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Button variant="secondary" onClick={() => navigate('/salons')}>
            ← Retour aux salons
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Salon Info */}
          <div className="lg:col-span-2">
            {/* Salon Header */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h1 className="text-3xl font-bold mb-4">{salon.name}</h1>
              
              {salon.description && (
                <p className="text-gray-600 mb-4">{salon.description}</p>
              )}

              <div className="space-y-2 text-gray-600">
                {salon.address && (
                  <div className="flex items-center gap-2">
                    <span>📍</span>
                    <span>{salon.address}, {salon.city}</span>
                  </div>
                )}
                {salon.phone && (
                  <div className="flex items-center gap-2">
                    <span>📱</span>
                    <span>{salon.phone}</span>
                  </div>
                )}
                {salon.email && (
                  <div className="flex items-center gap-2">
                    <span>📧</span>
                    <span>{salon.email}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Services */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">✂️ Services</h2>
              {Object.keys(servicesByCategory).length > 0 ? (
                <div className="space-y-8">
                  {Object.entries(servicesByCategory).map(([categoryName, categoryData]) => (
                    <div key={categoryName} className="border border-gray-200 rounded-lg p-6">
                      {/* En-tête de catégorie */}
                      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                        <span className="text-2xl">{categoryData.category.icon}</span>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">
                            {categoryData.category.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {categoryData.services.length} service{categoryData.services.length > 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>

                      {/* Services de la catégorie */}
                      <div className="space-y-4">
                        {categoryData.services.map((service) => (
                          <div
                            key={service.id}
                            onClick={() => toggleService(service.id)}
                            className={`p-4 border rounded-lg cursor-pointer transition ${
                              selectedServices.includes(service.id)
                                ? 'border-purple-500 bg-purple-50'
                                : 'border-gray-200 hover:border-purple-300'
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex items-start gap-3">
                                <input
                                  type="checkbox"
                                  checked={selectedServices.includes(service.id)}
                                  onChange={() => {}}
                                  className="mt-1 w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                                />
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-800 mb-1">{service.name}</h4>
                                  {service.description && (
                                    <p className="text-sm text-gray-600 mb-2">{service.description}</p>
                                  )}
                                  <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <span className="flex items-center gap-1">
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m0 0l-3-3M3 8v4m0 0l3 3" />
                                      </svg>
                                      <span>{service.duration} min</span>
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m0 0l-3-3M3 8v4m0 0l3 3" />
                                      </svg>
                                      <span>{service.duration} min</span>
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right ml-4">
                                <div className="text-xl font-bold text-purple-600">{service.price} DH</div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleService(service.id);
                                  }}
                                  className="mt-2 px-3 py-1 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
                                >
                                  Réserver
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      onClick={() => toggleService(service.id)}
                      className={`p-4 border rounded-lg cursor-pointer transition ${
                        selectedServices.includes(service.id)
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={selectedServices.includes(service.id)}
                            onChange={() => {}}
                            className="mt-1 w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-800 mb-1">{service.name}</h3>
                            {service.description && (
                              <p className="text-sm text-gray-600 mb-2">{service.description}</p>
                            )}
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m0 0l-3-3M3 8v4m0 0l-3-3M3 8v4m0 0l-3-3" />
                                </svg>
                                <span>{service.duration} min</span>
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-xl font-bold text-purple-600">{service.price} DH</div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleService(service.id);
                            }}
                            className="mt-2 px-3 py-1 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
                          >
                            Réserver
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Coiffeurs */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">👨‍🦰 Coiffeurs</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {coiffeurs.map((coiffeur) => (
                  <div
                    key={coiffeur.id}
                    onClick={() => setSelectedCoiffeur(coiffeur.id)}
                    className={`p-4 border rounded-lg cursor-pointer transition ${
                      selectedCoiffeur === coiffeur.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {coiffeur.photo ? (
                        <img
                          src={coiffeur.photo}
                          alt={coiffeur.fullName}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white text-2xl">
                          👤
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold">{coiffeur.fullName}</h3>
                        {coiffeur.specialty && (
                          <p className="text-sm text-purple-600">{coiffeur.specialty}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Booking Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-4">
              <h2 className="text-xl font-bold mb-4">📅 Réserver</h2>

              {/* Selected Services Summary */}
              {selectedServices.length > 0 && (
                <div className="mb-6 p-4 bg-purple-50 rounded-lg">
                  <h3 className="font-semibold mb-2">Services sélectionnés:</h3>
                  <div className="space-y-2">
                    {selectedServices.map(serviceId => {
                      const service = services.find(s => s.id === serviceId);
                      return service ? (
                        <div key={serviceId} className="flex justify-between text-sm">
                          <span>{service.name}</span>
                          <span>{service.price} MAD</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                  <div className="mt-4 pt-4 border-t border-purple-200">
                    <div className="flex justify-between font-bold">
                      <span>Total:</span>
                      <span>{totalPrice} MAD</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Durée totale: {totalDuration} minutes
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {/* Date Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date *
                  </label>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setSelectedSlot(null);
                    }}
                    min={new Date().toISOString().split('T')[0]}
                    disabled={selectedServices.length === 0 || !selectedCoiffeur}
                  />
                </div>

                {/* Time Slots */}
                {availableSlots.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Heure *
                    </label>
                    <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                      {availableSlots.map((slot) => (
                        <button
                          key={slot.time}
                          onClick={() => setSelectedSlot(slot.time)}
                          className={`p-2 text-sm border rounded transition ${
                            selectedSlot === slot.time
                              ? 'border-purple-500 bg-purple-50 text-purple-700'
                              : 'border-gray-200 hover:border-purple-300'
                          }`}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (optionnel)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    rows="3"
                    placeholder="Instructions spéciales..."
                  />
                </div>

                <Button
                  onClick={handleBooking}
                  loading={submitting}
                  disabled={selectedServices.length === 0 || !selectedCoiffeur || !selectedDate || !selectedSlot}
                  className="w-full"
                >
                  {submitting ? 'Réservation en cours...' : 'Confirmer la réservation'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Avis des clients</h2>
          
          {/* Affichage des avis existants */}
          {reviews.length > 0 ? (
            <div className="space-y-4 mb-6">
              {reviews.map((review) => (
                <div key={review.id} className="border-b pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{review.client.fullName}</h4>
                      <div className="flex items-center mb-2">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-5 h-5 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <p className="text-gray-600">{review.comment}</p>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 mb-6">Aucun avis pour le moment.</p>
          )}

          {/* Formulaire d'avis */}
          {user?.role === 'CLIENT' && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-3">Laisser un avis</h3>
              {reviewError && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded">
                  {reviewError}
                </div>
              )}
              {reviewSuccess && (
                <div className="mb-4 p-3 bg-green-50 text-green-700 rounded">
                  {reviewSuccess}
                </div>
              )}
              <form onSubmit={handleReviewSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Note
                  </label>
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewForm({...reviewForm, rating: star})}
                        className="p-1"
                      >
                        <svg
                          className={`w-8 h-8 ${star <= reviewForm.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Votre avis
                  </label>
                  <textarea
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})}
                    className="w-full p-2 border rounded-md"
                    rows="3"
                    placeholder="Décrivez votre expérience..."
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                >
                  Envoyer l'avis
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
