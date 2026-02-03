import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { salonAPI, serviceAPI, reviewAPI, coiffeurAPI, favoriteAPI } from '../../services/api';
import { 
  StarIcon, 
  MapPinIcon, 
  ClockIcon, 
  PhoneIcon, 
  GlobeAltIcon,
  ScissorsIcon,
  UserGroupIcon,
  UserCircleIcon,
  PhotoIcon,
  InformationCircleIcon,
  CheckBadgeIcon,
  HeartIcon,
  ShareIcon,
  CalendarIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid, HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { normalizeCoiffeurData, formatSpecialities } from './utils/coiffeurUtils';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const SalonProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();   
  const { user } = useAuth();
  const [salon, setSalon] = useState(null);
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [coiffeurs, setCoiffeurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('services');
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  
  // Review form states
  const [canReview, setCanReview] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const tabs = [
    { id: 'services', name: 'Services', icon: ScissorsIcon },
    { id: 'team', name: 'Notre Équipe', icon: UserGroupIcon },
    { id: 'about', name: 'À propos', icon: InformationCircleIcon },
    { id: 'reviews', name: 'Avis', icon: StarIcon, count: reviews.length },
    { id: 'gallery', name: 'Galerie', icon: PhotoIcon },
  ];

  // Test direct de l'API des avis
  useEffect(() => {
    if (id) {
      console.log('🔍 Salon ID dans l\'URL:', id);
      reviewAPI.getSalonReviews(id).then(response => {
        console.log('✅ API Response - Status:', response.status);
        console.log('✅ API Response - Data:', response.data);
        console.log('✅ API Response - Type:', typeof response.data);
        console.log('✅ API Response - Est tableau:', Array.isArray(response.data));
        console.log('✅ API Response - Longueur:', response.data?.length);
        
        if (response.data && response.data.length > 0) {
          console.log('📝 Avis trouvés:');
          response.data.forEach((review, index) => {
            console.log(`  ${index + 1}. ${review.client?.fullName} - ${review.rating}/5 - ${review.comment}`);
          });
        } else {
          console.log('❌ Aucun avis trouvé pour ce salon');
        }
      }).catch(error => {
        console.error('❌ Erreur API:', error);
        console.error('❌ Status:', error.response?.status);
        console.error('❌ Message:', error.response?.data);
      });
    }
  }, [id]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('Début du chargement des données...');
        
        const [salonRes, servicesRes, categoriesRes, reviewsRes, coiffeursRes] = await Promise.all([
          salonAPI.getSalonById(id),
          serviceAPI.getServicesBySalon(id),
          serviceAPI.getAllCategories(),
          reviewAPI.getSalonReviews(id),
          coiffeurAPI.getCoiffeursBySalon(id)
        ]);

        // Afficher les données brutes des avis
        console.log('📊 Données brutes des avis:', reviewsRes);
        console.log('📊 Type de reviewsRes.data:', typeof reviewsRes.data);
        console.log('📊 reviewsRes.data est un tableau?', Array.isArray(reviewsRes.data));
        console.log('📊 Longueur des avis:', reviewsRes.data?.length);
        
        if (reviewsRes.data && Array.isArray(reviewsRes.data)) {
          console.log('📝 Liste des avis chargés:');
          reviewsRes.data.forEach((review, index) => {
            console.log(`  ${index + 1}. ID: ${review.id}, Client: ${review.client?.fullName}, Note: ${review.rating}`);
          });
        }
        
        console.log('Réponse de l\'API des coiffeurs:', coiffeursRes);
        
        // Vérifier la structure des données
        const coiffeursData = coiffeursRes?.data || [];
        console.log('Données des coiffeurs:', coiffeursData);
        
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
        
        setSalon(salonRes.data);
        setServices(servicesData || []);
        setCategories(categoriesData || []);
        setReviews(reviewsRes.data || []);
        setCoiffeurs(coiffeursData);
        
        console.log('✅ Salon chargé:', salonRes.data?.name);
        console.log('✅ Reviews définis:', reviewsRes.data || []);
        console.log('✅ Nombre de reviews après setReviews:', (reviewsRes.data || []).length);
        
        // Vérifier si le salon est en favori
        await checkFavoriteStatus(salonRes.data.id);
        
        // Check if current user can review
        if (user?.role === 'CLIENT') {
          setCanReview(true);
        }
        
      } catch (err) {
        setError(err.response?.data?.error || 'Erreur lors du chargement du salon');
        console.error('Error loading salon data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Vérifier si le salon est en favori
  const checkFavoriteStatus = async (salonId) => {
    try {
      console.log('Checking favorite status for salon:', salonId);
      console.log('User logged in:', !!user);
      
      if (!user) {
        console.log('User not logged in, skipping favorite check');
        setIsFavorite(false);
        return;
      }
      
      const response = await favoriteAPI.isFavorite(salonId);
      console.log('Favorite status response:', response.data);
      setIsFavorite(response.data?.isFavorite || false);
    } catch (err) {
      console.error('Erreur lors de la vérification du statut de favori:', err);
      console.error('Error response:', err.response?.data);
      setIsFavorite(false);
    }
  };

  // Gérer l'ajout/retrait des favoris
  const toggleFavorite = async () => {
    try {
      console.log('Toggle favorite clicked. Current state:', isFavorite);
      console.log('Salon ID:', salon?.id);
      console.log('User:', user);
      
      if (!user) {
        console.error('User not logged in');
        // Rediriger vers la page de connexion
        navigate('/login');
        return;
      }
      
      if (!salon?.id) {
        console.error('Salon ID not available');
        return;
      }
      
      if (isFavorite) {
        console.log('Removing from favorites...');
        await favoriteAPI.removeFromFavorites(salon.id);
        setIsFavorite(false);
        console.log('Successfully removed from favorites');
      } else {
        console.log('Adding to favorites...');
        await favoriteAPI.addToFavorites(salon.id);
        setIsFavorite(true);
        console.log('Successfully added to favorites');
      }
    } catch (err) {
      console.error('Erreur lors de la gestion des favoris:', err);
      console.error('Error response:', err.response?.data);
    }
  };

  // Handle review submission
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError('');
    setReviewSuccess('');
    setSubmittingReview(true);
    
    try {
      await reviewAPI.createReview(id, reviewForm);
      setReviewSuccess('Avis ajouté avec succès !');
      setReviewForm({ rating: 5, comment: '' });
      // Reload reviews
      const { data } = await reviewAPI.getSalonReviews(id);
      setReviews(data || []);
    } catch (err) {
      console.error('Erreur lors de l\'ajout de l\'avis:', err);
      setReviewError(err.response?.data?.error || 'Erreur lors de l\'ajout de l\'avis');
    } finally {
      setSubmittingReview(false);
    }
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : 0;

  // Logs pour déboguer
  console.log('🎯 RENDER DEBUG ===');
  console.log('🎯 Reviews state:', reviews);
  console.log('🎯 Type de reviews:', typeof reviews);
  console.log('🎯 Reviews est un tableau?', Array.isArray(reviews));
  console.log('🎯 Longueur de reviews:', reviews.length);
  console.log('🎯 Average rating:', averageRating);
  console.log('🎯 =================');

  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
    percentage: reviews.length > 0 ? (reviews.filter(r => r.rating === rating).length / reviews.length) * 100 : 0
  }));

  // Grouper les services par catégorie
  const getServicesByCategory = () => {
    if (!services.length || !categories.length) return {};
    
    const grouped = {};
    
    services.forEach(service => {
      const category = categories.find(cat => cat.id === service.categoryId);
      const categoryName = category ? category.name : 'Non catégorisé';
      
      if (!grouped[categoryName]) {
        grouped[categoryName] = {
          category: category || { name: 'Non catégorisé', icon: '📦' },
          services: []
        };
      }
      
      grouped[categoryName].services.push(service);
    });
    
    return grouped;
  };

  const servicesByCategory = getServicesByCategory();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Chargement du salon...</p>
        </div>
      </div>
    );
  }

  if (!salon) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <div className="text-center">
          <div className="mx-auto h-24 w-24 text-gray-400">
            <ScissorsIcon />
          </div>
          <h3 className="mt-4 text-xl font-semibold text-gray-900">Salon non trouvé</h3>
          <p className="mt-2 text-gray-600">Le salon que vous recherchez n'existe pas.</p>
          <Button onClick={() => navigate('/salons')} className="mt-6">
            Retour aux salons
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      {/* Hero Section avec Image de Couverture */}
      <div className="relative">
        <div className="h-[500px] w-full relative overflow-hidden">
          {salon.coverImage ? (
            <>
              <img
                src={salon.coverImage}
                alt={`Couverture de ${salon.name}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 -left-4 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-300 rounded-full mix-blend-overlay filter blur-3xl animate-pulse delay-1000"></div>
              </div>
              <div className="text-center z-10">
                <ScissorsIcon className="h-24 w-24 text-white/80 mx-auto mb-4" />
                <span className="text-white text-4xl font-bold">{salon.name}</span>
              </div>
            </div>
          )}
          
          {/* Actions flottantes */}
          <div className="absolute top-6 right-6 flex gap-3">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => toggleFavorite()}
              className="bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white transition-colors"
            >
              {isFavorite ? (
                <HeartIconSolid className="h-6 w-6 text-red-500" />
              ) : (
                <HeartIcon className="h-6 w-6 text-gray-700" />
              )}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white transition-colors"
            >
              <ShareIcon className="h-6 w-6 text-gray-700" />
            </motion.button>
          </div>
        </div>

        {/* Carte d'information flottante */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-8 lg:p-12">
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Logo et Badge */}
                <div className="flex-shrink-0">
                  <div className="relative">
                    <div className="h-32 w-32 lg:h-40 lg:w-40 rounded-2xl overflow-hidden shadow-xl ring-4 ring-white bg-white">
                      {salon.images && salon.images.length > 0 ? (
                        <img 
                          src={salon.images.find(img => img.isPrimary)?.url || salon.images[0].url} 
                          alt={salon.name} 
                          className="h-full w-full object-cover" 
                        />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                          <span className="text-purple-600 text-5xl font-bold">
                            {salon.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-purple-600 rounded-full p-2 shadow-lg">
                      <CheckBadgeIcon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </div>

                {/* Informations principales */}
                <div className="flex-1 space-y-4">
                  <div>
                    <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-2">{salon.name}</h1>
                    <div className="flex flex-wrap items-center gap-4 text-gray-600">
                      <div className="flex items-center gap-2">
                        <MapPinIcon className="h-5 w-5 text-purple-600" />
                        <span className="font-medium">{salon.city}</span>
                        {salon.postalCode && <span className="text-gray-400">• {salon.postalCode}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Rating et Stats */}
                  <div className="flex flex-wrap items-center gap-6">
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[0, 1, 2, 3, 4].map((rating) => (
                          <StarIconSolid
                            key={rating}
                            className={classNames(
                              parseFloat(averageRating) > rating ? 'text-yellow-400' : 'text-gray-300',
                              'h-6 w-6'
                            )}
                          />
                        ))}
                      </div>
                      <span className="text-2xl font-bold text-gray-900">{averageRating || 'N/A'}</span>
                      <span className="text-gray-500">({reviews.length} avis)</span>
                    </div>
                    
                    <div className="h-8 w-px bg-gray-300"></div>
                    
                    <div className="flex items-center gap-2 text-gray-600">
                      <UserGroupIcon className="h-5 w-5 text-purple-600" />
                      <span className="font-medium">{coiffeurs.length} Professionnels</span>
                    </div>
                    
                    <div className="h-8 w-px bg-gray-300"></div>
                    
                    <div className="flex items-center gap-2 text-gray-600">
                      <ScissorsIcon className="h-5 w-5 text-purple-600" />
                      <span className="font-medium">{services.length} Services</span>
                    </div>
                  </div>

                  {/* Informations de Contact */}
                  <div className="flex flex-wrap gap-6 pt-4">
                    {salon.phone && (
                      <a href={`tel:${salon.phone}`} className="flex items-center gap-2 text-gray-700 hover:text-purple-600 transition-colors group">
                        <div className="p-2 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition-colors">
                          <PhoneIcon className="h-5 w-5 text-purple-600" />
                        </div>
                        <span className="font-medium">{salon.phone}</span>
                      </a>
                    )}
                    {salon.website && (
                      <a 
                        href={salon.website.startsWith('http') ? salon.website : `https://${salon.website}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-gray-700 hover:text-purple-600 transition-colors group"
                      >
                        <div className="p-2 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition-colors">
                          <GlobeAltIcon className="h-5 w-5 text-purple-600" />
                        </div>
                        <span className="font-medium">{salon.website.replace(/^https?:\/\//, '')}</span>
                      </a>
                    )}
                    {salon.openingHours && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <div className="p-2 bg-green-50 rounded-lg">
                          <ClockIcon className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Horaires</p>
                          <span className="font-medium text-green-600">Ouvert maintenant</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* CTA Button */}
                  <div className="pt-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => document.getElementById('booking-section')?.scrollIntoView({ behavior: 'smooth' })}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-3 text-lg"
                    >
                      <CalendarIcon className="h-6 w-6" />
                      Prendre rendez-vous
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation par onglets - Design moderne */}
            <div className="border-t border-gray-100 bg-gray-50/50">
              <div className="px-8 lg:px-12">
                <nav className="flex gap-2 overflow-x-auto py-4 scrollbar-hide">
                  {tabs.map((tab) => (
                    <motion.button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className={classNames(
                        'flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm whitespace-nowrap transition-all',
                        activeTab === tab.id
                          ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                          : 'text-gray-600 hover:bg-white hover:text-purple-600'
                      )}
                    >
                      <tab.icon className="h-5 w-5" />
                      {tab.name}
                      {tab.count !== undefined && (
                        <span className={classNames(
                          'px-2 py-0.5 rounded-full text-xs font-semibold',
                          activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-600'
                        )}>
                          {tab.count}
                        </span>
                      )}
                    </motion.button>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu des onglets */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'services' && (
              <div id="booking-section">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Nos Services</h2>
                  <p className="text-gray-600">Découvrez notre gamme complète de services professionnels</p>
                </div>
                
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
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {categoryData.services.map((service, index) => (
                            <motion.div
                              key={service.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-purple-200"
                            >
                              <div className="flex justify-between items-start gap-4">
                                <div className="flex-1">
                                  <div className="flex items-start gap-3 mb-3">
                                    <div className="p-3 bg-purple-50 rounded-xl group-hover:bg-purple-100 transition-colors">
                                      <ScissorsIcon className="h-6 w-6 text-purple-600" />
                                    </div>
                                    <div>
                                      <h3 className="text-xl font-semibold text-gray-900 mb-1">{service.name}</h3>
                                      <p className="text-gray-600 text-sm line-clamp-2">{service.description}</p>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-4 mt-4">
                                    <div className="flex items-baseline gap-1">
                                      <span className="text-3xl font-bold text-purple-600">{service.price}</span>
                                      <span className="text-gray-500 font-medium">DH</span>
                                    </div>
                                    <div className="h-8 w-px bg-gray-200"></div>
                                    <div className="flex items-center gap-2 text-gray-600">
                                      <ClockIcon className="h-5 w-5" />
                                      <span className="font-medium">{service.duration} min</span>
                                    </div>
                                  </div>
                                </div>
                                
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => navigate(`/salons/${id}/book?service=${service.id}`)}
                                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all"
                                >
                                  Réserver
                                </motion.button>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {services.map((service, index) => (
                      <motion.div
                        key={service.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-purple-200"
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-start gap-3 mb-3">
                              <div className="p-3 bg-purple-50 rounded-xl group-hover:bg-purple-100 transition-colors">
                                <ScissorsIcon className="h-6 w-6 text-purple-600" />
                              </div>
                              <div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-1">{service.name}</h3>
                                <p className="text-gray-600 text-sm line-clamp-2">{service.description}</p>
                              </div>
                            </div>
                           
                            <div className="flex items-center gap-4 mt-4">
                              <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-bold text-purple-600">{service.price}</span>
                                <span className="text-gray-500 font-medium">DH</span>
                              </div>
                              <div className="h-8 w-px bg-gray-200"></div>
                              <div className="flex items-center gap-2 text-gray-600">
                                <ClockIcon className="h-5 w-5" />
                                <span className="font-medium">{service.duration} min</span>
                              </div>
                            </div>
                          </div>
                          
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate(`/salons/${id}/book?service=${service.id}`)}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all"
                          >
                            Réserver
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'team' && (
              <div>
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Notre Équipe</h2>
                  <p className="text-gray-600">Découvrez nos professionnels passionnés</p>
                </div>
                
                {coiffeurs.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {coiffeurs.map((coiffeur, index) => {
                      console.log('🔍 Raw coiffeur data:', coiffeur);
                      console.log('📋 All coiffeur keys:', Object.keys(coiffeur));
                      console.log('🔍 Specialities field:', coiffeur.specialities);
                      console.log('🔍 Specialties field:', coiffeur.specialties);
                      console.log('🔍 Specialites field:', coiffeur.specialites);
                      const coiffeurData = normalizeCoiffeurData(coiffeur, index);
                      console.log('✨ Normalized coiffeur data:', coiffeurData);
                      console.log('🎯 Specialities:', coiffeurData.specialities);
                      console.log('📊 Specialities length:', coiffeurData.specialities.length);

                      return (
                        <motion.div
                          key={coiffeurData.id}
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1, duration: 0.5 }}
                          className="group relative"
                        >
                          <div className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-purple-200">
                            {/* Header avec image et badges */}
                            <div className="relative h-80 overflow-hidden bg-gradient-to-br from-slate-100 via-purple-50 to-pink-50">
                              {/* Pattern de fond */}
                              <div className="absolute inset-0 opacity-5">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600 rounded-full blur-3xl"></div>
                                <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-600 rounded-full blur-2xl"></div>
                              </div>
                              
                              {/* Image du coiffeur */}
                              <div className="relative z-10 h-full flex items-center justify-center p-8">
                                {coiffeurData.photo ? (
                                  <div className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl blur-xl opacity-20 scale-110"></div>
                                    <img 
                                      src={coiffeurData.photo} 
                                      alt={coiffeurData.fullName}
                                      className="relative w-48 h-48 rounded-2xl object-cover shadow-2xl ring-4 ring-white/50 transition-transform duration-700 group-hover:scale-105"
                                      loading="lazy"
                                      onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(coiffeurData.fullName)}&background=6366f1&color=fff&size=400`;
                                      }}
                                    />
                                  </div>
                                ) : (
                                  <div className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl blur-xl opacity-20 scale-110"></div>
                                    <div className="relative w-48 h-48 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center shadow-2xl ring-4 ring-white/50">
                                      <UserCircleIcon className="h-24 w-24 text-purple-300" />
                                    </div>
                                  </div>
                                )}
                              </div>
                              
                              {/* Badges flottants */}
                              <div className="absolute top-6 right-6 z-20 space-y-3">
                                {coiffeurData.isAvailable && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.2 + index * 0.1 }}
                                    className="bg-white/95 backdrop-blur-sm text-emerald-700 text-xs font-bold px-4 py-2 rounded-full flex items-center gap-2 shadow-lg border border-emerald-100"
                                  >
                                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                                    Disponible
                                  </motion.div>
                                )}
                                
                                {coiffeurData.rating > 0 && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.3 + index * 0.1 }}
                                    className="bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2 shadow-lg border border-amber-100"
                                  >
                                    <StarIconSolid className="h-4 w-4 text-amber-500" />
                                    <span className="text-sm font-bold text-gray-900">
                                      {coiffeurData.rating.toFixed(1)}
                                    </span>
                                  </motion.div>
                                )}
                              </div>

                              {/* Badge d'expérience */}
                              {coiffeurData.experience > 0 && (
                                <div className="absolute top-6 left-6 z-20">
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.4 + index * 0.1 }}
                                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg"
                                  >
                                    {coiffeurData.experience} ans
                                  </motion.div>
                                </div>
                              )}
                            </div>
                            
                            {/* Contenu */}
                            <div className="p-8 relative">
                              {/* Ligne décorative */}
                              <div className="absolute top-0 left-8 right-8 h-1 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 rounded-full"></div>
                              
                              <div className="text-center mb-6">
                                <h3 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight">
                                  {coiffeurData.fullName}
                                </h3>
                              </div>
                              
                              <p className="text-gray-600 text-center leading-relaxed mb-6 line-clamp-3">
                                {coiffeurData.bio || 'Professionnel passionné dédié à l\'excellence et à la satisfaction client.'}
                              </p>
                              
                              {/* Spécialités */}
                              <div className="mb-6">
                                <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 tracking-wider text-center">
                                  Compétences principales
                                </h4>
                                <div className="flex flex-wrap gap-2 justify-center">
                                  {coiffeurData.specialities.slice(0, 4).map((skill, idx) => (
                                    <motion.span
                                      key={idx}
                                      initial={{ opacity: 0, scale: 0.8 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      transition={{ delay: 0.1 * idx }}
                                      className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 border border-purple-200 hover:border-purple-300 transition-colors"
                                    >
                                      {skill}
                                    </motion.span>
                                  ))}
                                  {coiffeurData.specialities.length > 4 && (
                                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                                      +{coiffeurData.specialities.length - 4}
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              {/* Bouton d'action */}
                              <motion.button
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => navigate(`/salons/${id}/book?coiffeurId=${coiffeurData.id}`)}
                                className="w-full bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 text-white py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 group"
                              >
                                <CalendarIcon className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                                Prendre rendez-vous
                              </motion.button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-white rounded-2xl">
                    <UserGroupIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun coiffeur disponible</h3>
                    <p className="text-gray-500">Notre équipe sera bientôt complète.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'about' && (
              <div className="bg-white rounded-2xl p-8 lg:p-12 shadow-sm">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">À propos de {salon.name}</h2>
                
                <div className="prose prose-lg max-w-none mb-8">
                  <p className="text-gray-700 leading-relaxed">
                    {salon.description || 'Bienvenue dans notre salon de beauté professionnel. Nous nous engageons à offrir les meilleurs services avec une équipe de professionnels qualifiés.'}
                  </p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-8">
                  {salon.address && (
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-purple-100 rounded-xl">
                          <MapPinIcon className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">Adresse</h3>
                          <p className="text-gray-700">{salon.address}</p>
                          <p className="text-gray-700">{salon.postalCode} {salon.city}</p>
                          {salon.country && <p className="text-gray-700">{salon.country}</p>}
                        </div>
                      </div>
                    </div>
                  )}

                  {salon.openingHours && (
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-green-100 rounded-xl">
                          <ClockIcon className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">Horaires d'ouverture</h3>
                          <p className="text-gray-700 whitespace-pre-line">{salon.openingHours}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            {activeTab === 'reviews' && (
              <div>
                {/* Header avec statistiques */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl p-8 lg:p-12 shadow-sm mb-8"
                >
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <StarIcon className="h-8 w-8 text-purple-600" />
                        Avis clients
                      </h2>
                      <div className="flex items-center gap-6 mb-6">
                        <div className="text-6xl font-bold text-gray-900">{averageRating || 'N/A'}</div>
                        <div>
                          <div className="flex mb-1">
                            {[0, 1, 2, 3, 4].map((rating) => (
                              <StarIconSolid
                                key={rating}
                                className={classNames(
                                  parseFloat(averageRating) > rating ? 'text-yellow-400' : 'text-gray-300',
                                  'h-6 w-6'
                                )}
                              />
                            ))}
                          </div>
                          <p className="text-gray-600 font-medium">Basé sur {reviews.length} avis</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {ratingDistribution.map((item) => (
                        <div key={item.rating} className="flex items-center gap-3">
                          <span className="text-sm font-medium text-gray-700 w-8">{item.rating} ★</span>
                          <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${item.percentage}%` }}
                              transition={{ duration: 1, delay: 0.2 }}
                              className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full"
                            />
                          </div>
                          <span className="text-sm text-gray-600 w-12 text-right">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>

                {/* Liste des avis */}
                {reviews.length > 0 ? (
                  <div className="space-y-6 mb-8">
                    {reviews.map((review, index) => (
                      <motion.div
                        key={review.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0">
                            <div className="h-14 w-14 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center shadow-lg">
                              <span className="text-white font-bold text-xl">
                                {review.client?.fullName ? review.client.fullName.charAt(0).toUpperCase() : 'A'}
                              </span>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 mb-2">
                              {review.client?.fullName || 'Client Anonyme'}
                            </div>
                            <div className="flex items-center gap-3 mb-2">
                              {[0, 1, 2, 3, 4].map((rating) => (
                                <StarIconSolid
                                  key={rating}
                                  className={classNames(
                                    review.rating > rating ? 'text-yellow-400' : 'text-gray-300',
                                    'h-5 w-5'
                                  )}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-500">
                              {new Date(review.createdAt).toLocaleDateString('fr-FR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-700 leading-relaxed mt-4">{review.comment}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <StarIcon className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun avis pour le moment</h3>
                    <p className="text-gray-500">Soyez le premier à laisser un avis !</p>
                  </div>
                )}

                {/* Formulaire d'avis */}
                {user?.role === 'CLIENT' && canReview && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100"
                  >
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <SparklesIcon className="h-6 w-6 text-purple-600" />
                      Laisser un avis
                    </h3>
                    
                    {reviewError && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-3"
                      >
                        <ExclamationCircleIcon className="h-5 w-5" />
                        {reviewError}
                      </motion.div>
                    )}
                    
                    {reviewSuccess && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl flex items-center gap-3"
                      >
                        <CheckCircleIcon className="h-5 w-5" />
                        {reviewSuccess}
                      </motion.div>
                    )}
                    
                    <form onSubmit={handleReviewSubmit}>
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Note
                        </label>
                        <div className="flex items-center gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <motion.button
                              key={star}
                              type="button"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setReviewForm({...reviewForm, rating: star})}
                              className="p-2"
                            >
                              <StarIcon
                                className={`w-8 h-8 ${star <= reviewForm.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                              />
                            </motion.button>
                          ))}
                        </div>
                      </div>
                      
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Votre avis
                        </label>
                        <textarea
                          value={reviewForm.comment}
                          onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})}
                          className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none"
                          rows="4"
                          placeholder="Décrivez votre expérience..."
                          required
                        />
                      </div>
                      
                      <motion.button
                        type="submit"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={submittingReview}
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-colors font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {submittingReview ? 'Envoi en cours...' : 'Envoyer l\'avis'}
                      </motion.button>
                    </form>
                  </motion.div>
                )}
              </div>
            )}

            {activeTab === 'gallery' && (
              <div>
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Galerie Photos</h2>
                  <p className="text-gray-600">Découvrez notre salon en images</p>
                </div>
                
                {salon.images && salon.images.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {salon.images.map((image, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="aspect-square rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all cursor-pointer group"
                        onClick={() => setSelectedImage(image)}
                      >
                        <img
                          src={image}
                          alt={`${salon.name} - Photo ${index + 1}`}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          loading="lazy"
                        />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-white rounded-2xl">
                    <PhotoIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune photo disponible</h3>
                    <p className="text-gray-500">Les photos seront bientôt ajoutées.</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Modal pour l'image agrandie */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="max-w-5xl max-h-[90vh] relative"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedImage}
                alt="Image agrandie"
                className="w-full h-full object-contain rounded-2xl"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 bg-white/10 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/20 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SalonProfile;