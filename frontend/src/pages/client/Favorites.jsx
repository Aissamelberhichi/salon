import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { favoriteAPI, salonAPI } from '../../services/api';
import { MapPinIcon, HeartIcon, StarIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';

const Favorites = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(null);
  const [userPosition, setUserPosition] = useState(null);
  const [error, setError] = useState('');

  // Calculer la distance entre deux points
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Rayon de la Terre en km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
  };

  // Obtenir la position de l'utilisateur
  const getUserPosition = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserPosition({ lat: latitude, lng: longitude });
        },
        (error) => {
          console.error('Erreur de géolocalisation:', error);
        }
      );
    }
  };

  useEffect(() => {
    fetchFavorites();
    getUserPosition();
  }, []);

  // Recalculer les distances lorsque la position change
  useEffect(() => {
    if (userPosition && favorites.length > 0) {
      const updatedFavorites = favorites.map((salon) => {
        if (salon.lat && salon.lng) {
          const distance = calculateDistance(userPosition.lat, userPosition.lng, salon.lat, salon.lng);
          return { ...salon, distance: `${distance} km` };
        }
        return salon;
      });
      setFavorites(updatedFavorites);
    }
  }, [userPosition]);

  const fetchFavorites = async () => {
    try {
      if (!user) {
        console.log('User not logged in');
        setError('Vous devez être connecté pour voir vos favoris');
        setLoading(false);
        return;
      }

      setError('');

      // Récupérer les favoris depuis l'API
      const favoritesResponse = await favoriteAPI.getFavorites();
      const favoriteSalons = favoritesResponse.data || [];

      console.log('🔍 FAVORITES DEBUG ===');
      console.log('🔍 Données brutes des favoris:', favoriteSalons);
      console.log('🔍 Type:', typeof favoriteSalons);
      console.log('🔍 Est tableau:', Array.isArray(favoriteSalons));
      console.log('🔍 Longueur:', favoriteSalons.length);

      if (favoriteSalons.length > 0) {
        favoriteSalons.forEach((salon, index) => {
          console.log(`📝 Salon ${index + 1}:`, salon.name);
          console.log(`   ID: ${salon.id}`);
          console.log(`   Rating: ${salon.rating || salon.averageRating || 'N/A'}`);
          console.log(`   ReviewCount: ${salon.reviewCount}`);
          console.log(`   AverageRating: ${salon.averageRating}`);
          console.log(`   Address: ${salon.address}`);
        });
      }

      // Les favoris contiennent déjà les détails du salon grâce à la modification du backend
      // Calculer la distance pour chaque salon
      const favoritesWithDistance = favoriteSalons.map((salon) => {
        if (userPosition && salon.lat && salon.lng) {
          const distance = calculateDistance(userPosition.lat, userPosition.lng, salon.lat, salon.lng);
          return { ...salon, distance: `${distance} km` };
        } else {
          return salon;
        }
      });

      setFavorites(favoritesWithDistance);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      setError('Erreur lors du chargement des favoris. Veuillez réessayer.');
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  const removeFromFavorites = async (salonId) => {
    setRemoving(salonId);
    
    try {
      // Appel API pour supprimer des favoris
      await favoriteAPI.removeFromFavorites(salonId);
      
      // Mettre à jour l'état local
      setFavorites(prev => prev.filter(salon => salon.id !== salonId));
      console.log('Removed from favorites:', salonId);
    } catch (error) {
      console.error('Error removing from favorites:', error);
      // Afficher un message d'erreur plus convivial
      alert('Erreur lors de la suppression des favoris. Veuillez réessayer.');
    } finally {
      setRemoving(null);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<StarIcon key={i} className="w-4 h-4 text-yellow-400 fill-current" />);
    }

    if (hasHalfStar) {
      stars.push(<StarIcon key="half" className="w-4 h-4 text-yellow-400" />); // Simplified for now
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<StarIcon key={`empty-${i}`} className="w-4 h-4 text-gray-300" />);
    }

    return stars;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Chargement de vos favoris...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
            <HeartIconSolid className="h-10 w-10 text-red-500" />
            Mes Salons Favoris
          </h1>
          <p className="text-xl text-gray-600">
            Retrouvez facilement vos salons de coiffure préférés
          </p>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl shadow-sm flex items-center gap-3"
          >
            <HeartIcon className="h-5 w-5" />
            {error}
          </motion.div>
        )}
        
        {/* Favorites Grid */}
        {favorites.length === 0 && !error ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100"
          >
            <div className="w-24 h-24 mx-auto mb-6 bg-red-50 rounded-full flex items-center justify-center">
              <HeartIcon className="h-12 w-12 text-red-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Aucun salon favori</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Vous n'avez pas encore ajouté de salons à vos favoris. 
              Explorez les salons et ajoutez-les à vos favoris pour les retrouver facilement.
            </p>
            <motion.a
              href="/salons"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              Explorer les salons
            </motion.a>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {favorites.map((salon, index) => (
              <motion.div
                key={salon.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group"
              >
                {/* Image Section */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={salon.images?.find(img => img.isPrimary)?.url || salon.images?.[0]?.url || `https://picsum.photos/seed/${salon.id}/400/300.jpg`}
                    alt={salon.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  
                  {/* Remove Button */}
                  <motion.button
                    onClick={() => removeFromFavorites(salon.id)}
                    disabled={removing === salon.id}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-colors disabled:opacity-50"
                  >
                    {removing === salon.id ? (
                      <div className="w-5 h-5 animate-spin rounded-full border-2 border-purple-600 border-t-transparent"></div>
                    ) : (
                      <HeartIconSolid className="w-5 h-5 text-red-500" />
                    )}
                  </motion.button>
                </div>
                
                {/* Content Section */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{salon.name}</h3>
                  
                  {/* Rating */}
                  <div className="flex items-center mb-3">
                    <div className="flex items-center">
                      {renderStars(salon.averageRating || salon.rating || 0)}
                      <span className="ml-2 text-sm text-gray-600">
                        {salon.averageRating || salon.rating ? (
                          `${(salon.averageRating || salon.rating)} (${salon.reviewCount || 0} avis)`
                        ) : 'Pas encore d\'avis'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Address */}
                  <div className="flex items-center text-gray-600 text-sm mb-3">
                    <MapPinIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="line-clamp-1">{salon.address}</span>
                  </div>
                  
                  {/* Distance and Price */}
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <span className="flex items-center">
                      <MapPinIcon className="w-4 h-4 mr-1" />
                      {salon.distance || 'Distance non disponible'}
                    </span>
                    <span className="font-medium text-purple-600">
                      {salon.priceRange || 'Prix non spécifié'}
                    </span>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <motion.a
                      href={`/salons/${salon.id}`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 text-center px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all"
                    >
                      Voir détails
                    </motion.a>
                    <motion.a
                      href={`/salons/${salon.id}/book`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 text-center px-4 py-2 border-2 border-purple-600 text-purple-600 rounded-xl font-semibold hover:bg-purple-50 transition-all"
                    >
                      Réserver
                    </motion.a>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export { Favorites };
