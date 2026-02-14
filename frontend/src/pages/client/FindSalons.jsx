import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { salonAPI, rdvAPI, reviewAPI } from '../../services/api';
import { motion } from 'framer-motion';
import {
  MapPinIcon,
  StarIcon,
  BuildingStorefrontIcon,
  ScissorsIcon,
  MagnifyingGlassIcon,
  TagIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import 'leaflet/dist/leaflet.css';

const FindSalons = () => {
  const navigate = useNavigate();
  const [position, setPosition] = useState(null);
  const [salons, setSalons] = useState([]);
  const [allSalons, setAllSalons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hoveredSalon, setHoveredSalon] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [radius, setRadius] = useState(5); // Rayon en kilomètres
  const [searchMode, setSearchMode] = useState('global'); // Mode de recherche: 'nearby' ou 'global' - commence par global
  const [salonRatings, setSalonRatings] = useState({});
  const [loadingAllSalons, setLoadingAllSalons] = useState(false);

  // Position par défaut (Casablanca)
  const setCasablancaPosition = async () => {
    const defaultPos = { lat: 33.5731, lng: -7.5898 };
    setPosition(defaultPos);
    setError('');
    await fetchNearbySalons(defaultPos.lat, defaultPos.lng);
  };

  // Obtenir la position actuelle de l'utilisateur
  const getCurrentPosition = async () => {
    setLoading(true);
    setError('');
    
    if (!navigator.geolocation) {
      setError('La géolocalisation n\'est pas supportée par votre navigateur');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const userPosition = { lat: latitude, lng: longitude };
        setPosition(userPosition);
        await fetchNearbySalons(latitude, longitude);
        setLoading(false);
      },
      async (error) => {
        console.error('Erreur de géolocalisation:', error);
        let errorMessage = 'Impossible d\'obtenir votre position';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Vous avez refusé la géolocalisation. Utilisation de la position par défaut (Casablanca)';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Position indisponible. Utilisation de la position par défaut (Casablanca)';
            break;
          case error.TIMEOUT:
            errorMessage = 'Délai d\'attente dépassé. Utilisation de la position par défaut (Casablanca)';
            break;
        }
        
        setError(errorMessage);
        // Fallback vers Casablanca
        await setCasablancaPosition();
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  // Charger les avis des salons
  const loadSalonRatings = async (salonsList) => {
    const ratingsPromises = salonsList.map(async (salon) => {
      try {
        const { data: reviews } = await reviewAPI.getSalonReviews(salon.id);
        const rating = reviews.length > 0 
          ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
          : 0;
        return { salonId: salon.id, rating, reviewCount: reviews.length };
      } catch (err) {
        console.error(`Error loading reviews for salon ${salon.id}:`, err);
        return { salonId: salon.id, rating: 0, reviewCount: 0 };
      }
    });

    const ratingsData = await Promise.all(ratingsPromises);
    const ratingsMap = ratingsData.reduce((acc, { salonId, rating, reviewCount }) => {
      acc[salonId] = { rating, reviewCount };
      return acc;
    }, {});
    
    setSalonRatings(ratingsMap);
  };

  // Fonction pour récupérer tous les salons (pour la recherche globale)
  const fetchAllSalons = async (forceRefresh = false) => {
    // Si déjà chargé et pas de rafraîchissement forcé, ne pas recharger
    if (!forceRefresh && allSalons.length > 0) return;
    
    try {
      setLoadingAllSalons(true);
      setError('');
      
      // Récupérer tous les salons sans limite avec pagination si nécessaire
      const response = await salonAPI.getAllSalons({ limit: 1000 });
      console.log('Response getAllSalons:', response);
      const allSalonsData = response.data?.salons || response.data || [];
      console.log('allSalonsData:', allSalonsData);
      
      // Enrichir les données avec des informations supplémentaires
      const enrichedSalons = allSalonsData.map(salon => ({
        ...salon,
        // Ajouter des champs calculés pour une meilleure recherche
        searchableText: `${salon.name} ${salon.city} ${salon.address} ${salon.description || ''}`.toLowerCase(),
        // Ajouter un score de pertinence pour la recherche
        searchScore: 0
      }));
      
      setAllSalons(enrichedSalons);
      
      // Charger les ratings pour tous les salons
      await loadSalonRatings(enrichedSalons);
      
      // Afficher un message de succès
      if (enrichedSalons.length === 0) {
        setError('Aucun salon trouvé dans la base de données');
      }
    } catch (err) {
      console.error('Erreur lors de la récupération de tous les salons:', err);
      setError('Impossible de charger les salons. Veuillez réessayer plus tard.');
      
      // En cas d'erreur, essayer de charger les données de démonstration
      try {
        const mockSalons = [
          {
            id: 1,
            name: 'Salon de Coiffure Elite',
            address: '123 Rue de la Paix, Paris',
            city: 'Paris',
            postalCode: '75001',
            type: 'luxe',
            description: 'Salon de haute couture',
            lat: 48.8566,
            lng: 2.3522,
            searchableText: 'salon de coiffure elite paris 123 rue de la paix 75001 salon de haute couture',
            searchScore: 0
          },
          {
            id: 2,
            name: 'Beauty Studio',
            address: '45 Avenue des Champs-Élysées, Paris',
            city: 'Paris',
            postalCode: '75008',
            type: 'moderne',
            description: 'Salon moderne et tendance',
            lat: 48.8698,
            lng: 2.3076,
            searchableText: 'beauty studio paris 45 avenue des champs-élysées 75008 salon moderne et tendance',
            searchScore: 0
          },
          {
            id: 3,
            name: 'Hair Art Salon',
            address: '78 Boulevard Saint-Germain, Paris',
            city: 'Paris',
            postalCode: '75006',
            type: 'artistique',
            description: 'Salon artistique et créatif',
            lat: 48.8530,
            lng: 2.3398,
            searchableText: 'hair art salon paris 78 boulevard saint-germain 75006 salon artistique et créatif',
            searchScore: 0
          }
        ];
        
        setAllSalons(mockSalons);
        await loadSalonRatings(mockSalons);
        setError('Données de démonstration chargées (API indisponible)');
      } catch (mockError) {
        console.error('Erreur lors du chargement des données de démonstration:', mockError);
      }
    } finally {
      setLoadingAllSalons(false);
    }
  };

  // Fonction pour récupérer les salons à proximité
  const fetchNearbySalons = async (lat, lng) => {
    console.log('Recherche de salons près de:', { lat, lng, radius });
    try {
      const response = await rdvAPI.getNearbySalons(lat, lng, radius);
      console.log('Réponse de l\'API:', response);
      const salonsData = response.data || [];
      console.log('Structure des données des salons de proximité:', salonsData);
      if (salonsData.length > 0) {
        console.log('Exemple de structure d\'un salon:', salonsData[0]);
        console.log('ID du salon:', salonsData[0].id);
      }
      setSalons(salonsData);
      await loadSalonRatings(salonsData);
    } catch (err) {
      console.error('Erreur lors de la récupération des salons:', err);
      setError('Impossible de charger les salons à proximité');
    } finally {
      setLoading(false);
    }
  };

  // Charger les salons globaux au démarrage pour avoir des résultats immédiats
  useEffect(() => {
    // Lancer la recherche globale immédiatement au chargement
    fetchAllSalons();
  }, []);

  // Charger les salons selon le mode de recherche
  useEffect(() => {
    if (searchMode === 'nearby' && position) {
      fetchNearbySalons(position.lat, position.lng);
    } else if (searchMode === 'global') {
      fetchAllSalons();
    }
  }, [searchMode, position, radius]);

  // Calculer la distance en kilomètres
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

  // Filtrer les salons selon le mode de recherche
  const filteredSalons = (() => {
    if (searchMode === 'nearby') {
      // Recherche par proximité avec filtre par nom
      return salons.filter(salon => {
        const matchesSearch = !searchTerm || 
          salon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          salon.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
          salon.address.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesType = selectedType === 'all' || salon.type === selectedType;
        
        return matchesSearch && matchesType;
      });
    } else if (searchMode === 'global') {
      // Recherche globale améliorée dans tous les salons
      if (!searchTerm && selectedType === 'all') {
        return allSalons;
      }
      
      return allSalons
        .map(salon => {
          let score = 0;
          let matchesSearch = true;
          let matchesType = selectedType === 'all' || salon.type === selectedType;
          
          if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            const searchableText = salon.searchableText || 
              `${salon.name} ${salon.city} ${salon.address} ${salon.description || ''}`.toLowerCase();
            
            // Calcul du score de pertinence
            if (salon.name.toLowerCase().includes(searchLower)) {
              score += 100; // Correspondance exacte du nom
              if (salon.name.toLowerCase() === searchLower) {
                score += 50; // Nom exact
              }
            }
            
            if (salon.city.toLowerCase().includes(searchLower)) {
              score += 30; // Correspondance de la ville
            }
            
            if (salon.address.toLowerCase().includes(searchLower)) {
              score += 20; // Correspondance de l'adresse
            }
            
            if (salon.description && salon.description.toLowerCase().includes(searchLower)) {
              score += 15; // Correspondance de la description
            }
            
            // Correspondance partielle des mots
            const searchWords = searchLower.split(' ');
            searchWords.forEach(word => {
              if (word.length > 2) {
                if (salon.name.toLowerCase().includes(word)) score += 25;
                if (salon.city.toLowerCase().includes(word)) score += 10;
                if (salon.address.toLowerCase().includes(word)) score += 5;
              }
            });
            
            matchesSearch = score > 0;
          }
          
          return {
            ...salon,
            searchScore: score,
            matchesSearch: matchesSearch && matchesType
          };
        })
        .filter(salon => salon.matchesSearch)
        .sort((a, b) => {
          // Trier par score de pertinence (décroissant)
          if (a.searchScore !== b.searchScore) {
            return b.searchScore - a.searchScore;
          }
          // En cas d'égalité, trier par note (décroissant)
          const ratingA = salonRatings[a.id]?.rating || 0;
          const ratingB = salonRatings[b.id]?.rating || 0;
          return ratingB - ratingA;
        })
        .map(({ matchesSearch, ...salon }) => salon); // Retirer le champ temporaire
    }
    return [];
  })();

  // Types de salons
  const salonTypes = [
    { value: 'all', label: 'Tous les types', icon: BuildingStorefrontIcon },
    { value: 'MEN', label: 'Homme', icon: UserIcon },
    { value: 'WOMEN', label: 'Femme', icon: ScissorsIcon },
    { value: 'MIXED', label: 'Mixte', icon: TagIcon }
  ];

  if (loading || (loadingAllSalons && searchTerm.trim())) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">
            {searchTerm.trim() ? 'Recherche dans tous les salons...' : 'Chargement des salons à proximité...'}
          </p>
        </div>
      </div>
    );
  }

  // Toujours afficher la page principale, même sans position initiale
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-sm rounded-3xl mb-6 shadow-lg"
            >
              <MapPinIcon className="h-10 w-10 text-white" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold text-white mb-4"
            >
              Trouver un Salon
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-white/90"
            >
              Découvrez les meilleurs salons près de chez vous
            </motion.p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl shadow-sm flex items-center gap-3"
          >
            <span className="h-5 w-5">⚠️</span>
            {error}
          </motion.div>
        )}

        {/* Search & Filters */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100/60 p-8 mb-8">
          {/* Search Mode Tabs */}
          <div className="flex flex-col lg:flex-row gap-6 mb-8">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-3">Mode de recherche</label>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setSearchMode('nearby');
                    getCurrentPosition();
                  }}
                  className={`px-6 py-4 rounded-xl text-sm font-semibold transition-all flex items-center gap-3 ${
                    searchMode === 'nearby'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30 ring-2 ring-purple-500/50'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <MapPinIcon className="h-5 w-5 flex-shrink-0" />
                  <div className="text-left">
                    <div className="font-semibold">À proximité</div>
                    <div className="text-xs opacity-80">Salons près de vous</div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    setSearchMode('global');
                    fetchAllSalons();
                  }}
                  className={`px-6 py-4 rounded-xl text-sm font-semibold transition-all flex items-center gap-3 ${
                    searchMode === 'global'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30 ring-2 ring-purple-500/50'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <MagnifyingGlassIcon className="h-5 w-5 flex-shrink-0" />
                  <div className="text-left">
                    <div className="font-semibold">Recherche globale</div>
                    <div className="text-xs opacity-80">Tous les salons</div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Search Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Recherche</label>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder={searchMode === 'nearby' ? "Rechercher un salon près de vous..." : "Rechercher un salon dans tous les salons..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-lg"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Radius Filter */}
            {searchMode === 'nearby' && (
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-3">Rayon de recherche</label>
                <div className="flex items-center gap-4 bg-gray-50 rounded-xl p-4">
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={radius}
                    onChange={(e) => setRadius(parseInt(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 min-w-[80px] text-center">
                    <span className="text-lg font-semibold text-purple-600">{radius}</span>
                    <span className="text-sm text-gray-600 ml-1">km</span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Type Filter */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-3">Type de salon</label>
              <div className="flex gap-2 flex-wrap">
                {salonTypes.map((type) => (
                  <button
                    key={type.value}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedType(type.value)}
                    className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                      selectedType === type.value
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    <type.icon className="h-5 w-5" />
                    <span>{type.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="mb-8">
          {/* Results Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <BuildingStorefrontIcon className="h-7 w-7 text-purple-600" />
                Salons trouvés
                <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-lg font-semibold">
                  {filteredSalons.length}
                </span>
              </h2>
              <p className="text-gray-600 mt-1">
                {searchMode === 'nearby' 
                  ? `Dans un rayon de ${radius} km autour de votre position` 
                  : 'Parmi tous les salons disponibles'
                }
              </p>
            </div>
            
            {/* Quick Actions */}
            <div className="flex gap-3">
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                >
                  <MagnifyingGlassIcon className="h-4 w-4" />
                  Effacer la recherche
                </button>
              )}
              {selectedType !== 'all' && (
                <button
                  onClick={() => setSelectedType('all')}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                >
                  <TagIcon className="h-4 w-4" />
                  Tous les types
                </button>
              )}
            </div>
          </div>

          {/* Salons Grid */}
          {filteredSalons.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20 bg-white rounded-2xl shadow-lg border border-gray-100"
            >
              <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-purple-50 to-pink-50 rounded-full flex items-center justify-center">
                <BuildingStorefrontIcon className="h-16 w-16 text-purple-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-3">
                {searchTerm ? 'Aucun résultat trouvé' : 'Aucun salon disponible'}
              </h3>
              <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
                {searchTerm 
                  ? 'Essayez de modifier votre recherche ou d\'élargir vos critères'
                  : 'Essayez d\'augmenter le rayon de recherche ou de réessayer plus tard'
                }
              </p>
              <button
                onClick={() => { 
                  setSearchTerm(''); 
                  setSelectedType('all'); 
                  if (searchMode === 'nearby') setRadius(10);
                }}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all inline-flex items-center gap-3 text-lg"
              >
                <MagnifyingGlassIcon className="h-6 w-6" />
                Réinitialiser les filtres
              </button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredSalons.map((salon, index) => {
                const ratings = salonRatings[salon.id] || { rating: 0, reviewCount: 0 };
                const typeConfig = salonTypes.find(t => t.value === salon.type) || salonTypes[0];

                return (
                  <motion.div
                    key={salon.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer ${
                      hoveredSalon === salon.id ? 'ring-2 ring-purple-500' : ''
                    }`}
                    onMouseEnter={() => setHoveredSalon(salon.id)}
                    onMouseLeave={() => setHoveredSalon(null)}
                    onClick={() => {
                      if (!salon.id) {
                        console.error('ID du salon manquant:', salon);
                        return;
                      }
                      console.log('Navigation vers le salon avec ID:', salon.id);
                      navigate(`/salons/${salon.id}`);
                    }}
                  >
                    <div className="relative">
                      <img
                        src={salon.image || `https://picsum.photos/seed/${salon.id}/400/300.jpg`}
                        alt={salon.name}
                        className="w-full h-48 object-cover"
                      />
                    </div>
                    
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">{salon.name}</h3>
                      
                      <div className="flex items-center mb-2">
                        <div className="flex items-center">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <StarIconSolid
                                key={i}
                                className={`h-4 w-4 ${
                                  i < Math.floor(ratings.rating) ? 'text-yellow-400' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="ml-1 text-sm text-gray-600">
                            {ratings.rating.toFixed(1)} ({ratings.reviewCount} avis)
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-2">
                        <MapPinIcon className="w-4 h-4 inline mr-1" />
                        {salon.address}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                        {position && (
                          <span>
                            <MapPinIcon className="w-4 h-4 inline mr-1" />
                            {calculateDistance(position.lat, position.lng, salon.lat, salon.lng)} km
                          </span>
                        )}
                        <span className="font-medium">
                          {typeConfig.label}
                        </span>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/salons/${salon.id}`);
                          }}
                          className="flex-1 text-center px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                        >
                          Voir détails
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FindSalons;
export { FindSalons };
