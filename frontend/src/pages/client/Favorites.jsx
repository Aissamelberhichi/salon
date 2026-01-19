import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../../components/common/Button';
import { favoriteAPI } from '../../services/api';
import {
  HeartIcon,
  MapPinIcon,
  StarIcon,
  PhoneIcon,
  XMarkIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

export const Favorites = () => {
  const navigate = useNavigate();
  
  // États
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Charger les favoris
  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      console.log('Début du chargement des favoris...');
      setLoading(true);
      const response = await favoriteAPI.getFavorites();
      console.log('Réponse API brute:', response);
      const favoritesData = response.data || [];
      console.log('Données des favoris:', favoritesData);
      setFavorites(favoritesData);
    } catch (err) {
      console.error('Erreur lors du chargement des favoris:', err);
      console.error('Détails de l\'erreur:', err.response?.data);
      setError('Impossible de charger vos favoris');
    } finally {
      setLoading(false);
    }
  };

  const removeFromFavorites = async (salonId) => {
    try {
      console.log('Tentative de retrait du favori pour salonId:', salonId);
      console.log('Liste actuelle des favoris:', favorites);
      
      await favoriteAPI.removeFromFavorites(salonId);
      
      // Retirer le salon de la liste des favoris
      setFavorites(prev => {
        console.log('Favoris avant filtrage:', prev);
        const filtered = prev.filter(f => {
          console.log('Vérification du favori:', f, 'salonId:', salonId, 'f.salonId === salonId:', f.salonId === salonId);
          return f.salonId !== salonId;
        });
        console.log('Favoris après filtrage:', filtered);
        return filtered;
      });
    } catch (err) {
      console.error('Erreur lors du retrait des favoris:', err);
      console.error('Détails de l\'erreur:', err.response?.data);
      setError('Impossible de retirer ce salon des favoris');
    }
  };

  // Salons favoris (avec détails complets)
  const favoriteSalons = favorites.map(fav => {
    console.log('Traitement du favori:', fav);
    console.log('Images du salon:', fav.images);
    console.log('Structure complète du favori:', JSON.stringify(fav, null, 2));
    
    return {
      ...fav,  // Le fav contient déjà les données du salon
      isFavorite: true,
      addedAt: fav.createdAt || fav.addedAt
    };
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {console.log('Rendering Favorites page - favorites:', favorites, 'loading:', loading, 'error:', error)}
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <HeartIcon className="h-8 w-8 text-purple-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Mes Favoris</h1>
                <p className="text-sm text-gray-500">Retrouvez vos salons préférés</p>
              </div>
            </div>
            
            <Button
              onClick={() => navigate('/dashboard')}
              variant="outline"
              size="sm"
            >
              Retour au tableau de bord
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Section des favoris */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <HeartIcon className="h-6 w-6 text-purple-600" />
              Mes Salons Favoris
              {favorites.length > 0 && (
                <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded-full">
                  {favorites.length}
                </span>
              )}
            </h2>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-600 border-t-transparent"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
              <p className="text-red-600">{error}</p>
            </div>
          ) : favorites.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
              <SparklesIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun favori</h3>
              <p className="text-gray-500 mb-6">Ajoutez des salons à vos favoris pour les retrouver facilement</p>
              <Button onClick={() => navigate('/find-salons')}>
                Découvrir des salons
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteSalons.map((salon, index) => (
                <motion.div
                  key={salon.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-purple-200"
                >
                  <div className="p-6">
                    {/* Header du salon */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{salon.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPinIcon className="h-4 w-4" />
                          <span>{salon.city}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromFavorites(salon.salonId)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Retirer des favoris"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Image du salon */}
                    <div className="mb-4">
                      {console.log('Affichage image pour salon:', salon.name, 'avec images:', salon.images)}
                      {salon.images && Array.isArray(salon.images) && salon.images.length > 0 ? (
                        <img
                          src={salon.images.find(img => img.isPrimary)?.url || salon.images[0].url}
                          alt={salon.name}
                          className="w-full h-40 object-cover rounded-xl"
                          onError={(e) => {
                            console.error('Erreur de chargement image:', e);
                            e.target.onerror = null;
                          }}
                        />
                      ) : (
                        <div className="w-full h-40 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
                          <span className="text-purple-600 text-2xl font-bold">
                            {salon.name ? salon.name.charAt(0).toUpperCase() : '?'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Informations */}
                    <div className="space-y-3">
                      {salon.address && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPinIcon className="h-4 w-4" />
                          <span className="truncate">{salon.address}</span>
                        </div>
                      )}
                      
                      {salon.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <PhoneIcon className="h-4 w-4" />
                          <span>{salon.phone}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <StarIcon className="h-4 w-4 text-yellow-500" />
                        <span>{salon.type || 'Non spécifié'}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-4">
                      <Button
                        onClick={() => navigate(`/salons/${salon.salonId}`)}
                        size="sm"
                        className="flex-1"
                      >
                        Voir le salon
                      </Button>
                      <Button
                        onClick={() => navigate(`/salons/${salon.salonId}/book`)}
                        variant="outline"
                        size="sm"
                      >
                        Réserver
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};
