import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import { rdvAPI, reviewAPI } from '../../services/api';
import { motion } from 'framer-motion';
import {
  MapPinIcon,
  StarIcon,
  ClockIcon,
  BuildingStorefrontIcon,
  ScissorsIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  SparklesIcon,
  TagIcon,
  CurrencyDollarIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import 'leaflet/dist/leaflet.css';

// Icône personnalisée pour le marqueur de position actuelle
const CurrentLocationIcon = () => (
  <div className="relative">
    <div className="animate-ping absolute h-4 w-4 rounded-full bg-blue-600 opacity-75"></div>
    <div className="h-3 w-3 rounded-full bg-blue-600"></div>
  </div>
);

// Composant pour centrer la carte sur la position actuelle
const CenterMap = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

// Composant pour gérer les marqueurs des salons
const SalonMarkers = ({ salons, onSalonHover }) => {
  return (
    <>
      {salons.map((salon) => (
        <Marker 
          key={salon.id} 
          position={[salon.lat, salon.lng]}
          eventHandlers={{
            mouseover: () => onSalonHover(salon.id),
            mouseout: () => onSalonHover(null)
          }}
        >
          <Popup>
            <div className="p-2">
              <div className="font-medium text-gray-900">{salon.name}</div>
              <div className="text-sm text-gray-600">{salon.address}</div>
              <div className="text-sm text-gray-500">{salon.city} {salon.postalCode}</div>
              {salon.rating && (
                <div className="flex items-center gap-1 mt-1">
                  <StarIconSolid className="h-4 w-4 text-yellow-400" />
                  <span className="text-sm font-medium">{salon.rating.toFixed(1)}</span>
                  <span className="text-xs text-gray-500">({salon.reviewCount || 0})</span>
                </div>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
};

export const FindSalons = () => {
  const navigate = useNavigate();
  const [position, setPosition] = useState(null);
  const [salons, setSalons] = useState([]);
  const [allSalons, setAllSalons] = useState([]); // Pour la recherche globale
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hoveredSalon, setHoveredSalon] = useState(null);
  const [radius, setRadius] = useState(5); // Rayon en kilomètres
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [salonRatings, setSalonRatings] = useState({});
  const [loadingAllSalons, setLoadingAllSalons] = useState(false);

  // Position par défaut (Casablanca)
  const setCasablancaPosition = async () => {
    const defaultPos = { lat: 33.5731, lng: -7.5898 };
    setPosition(defaultPos);
    setError('');
    await fetchNearbySalons(defaultPos.lat, defaultPos.lng);
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

  // Détecter la position actuelle
  useEffect(() => {
    if (!navigator.geolocation) {
      setError(
        <div className="space-y-2">
          <p>La géolocalisation n'est pas supportée par votre navigateur.</p>
          <button 
            onClick={setCasablancaPosition}
            className="text-blue-600 hover:underline"
          >
            Afficher les salons à Casablanca
          </button>
        </div>
      );
      setLoading(false);
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition({ lat: latitude, lng: longitude });
        await fetchNearbySalons(latitude, longitude);
      },
      (err) => {
        console.error('Erreur de géolocalisation:', err);
        setError(
          <div className="space-y-3">
            <p>
              {err.code === err.PERMISSION_DENIED
                ? "L'accès à votre position a été refusé. Veuillez autoriser la géolocalisation dans les paramètres de votre navigateur."
                : "Impossible de récupérer votre position. Vérifiez votre connexion ou réessayez plus tard."}
            </p>
            <button
              onClick={setCasablancaPosition}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Afficher les salons à Casablanca
            </button>
          </div>
        );
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }, []);

  // Fonction pour récupérer tous les salons (pour la recherche globale)
  const fetchAllSalons = async () => {
    if (allSalons.length > 0) return; // Déjà chargé
    
    try {
      setLoadingAllSalons(true);
      // Récupérer tous les salons sans limite
      const response = await rdvAPI.getAllSalons({ limit: 1000 });
      console.log('Response getAllSalons:', response);
      const allSalonsData = response.data?.salons || response.data || [];
      console.log('allSalonsData:', allSalonsData);
      setAllSalons(allSalonsData);
      
      // Charger les ratings pour tous les salons
      await loadSalonRatings(allSalonsData);
    } catch (err) {
      console.error('Erreur lors de la récupération de tous les salons:', err);
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
      setSalons(salonsData);
      await loadSalonRatings(salonsData);
    } catch (err) {
      console.error('Erreur lors de la récupération des salons:', err);
      setError('Impossible de charger les salons à proximité');
    } finally {
      setLoading(false);
    }
  };

  // Recharger les salons quand le rayon change
  useEffect(() => {
    if (position) {
      fetchNearbySalons(position.lat, position.lng);
    }
  }, [radius]);

  // Charger tous les salons quand l'utilisateur commence à rechercher
  useEffect(() => {
    if (searchTerm.trim()) {
      console.log('Début de la recherche globale pour:', searchTerm);
      fetchAllSalons();
    }
  }, [searchTerm]);

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

  // Filtrer les salons
  const filteredSalons = (searchTerm.trim() ? allSalons : salons).filter(salon => {
    const matchesSearch = !searchTerm || 
      salon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      salon.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      salon.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === 'all' || salon.type === selectedType;
    
    return matchesSearch && matchesType;
  });

  // Debug logs
  console.log('searchTerm:', searchTerm);
  console.log('allSalons length:', allSalons.length);
  console.log('salons length:', salons.length);
  console.log('filteredSalons length:', filteredSalons.length);
  console.log('Using allSalons:', searchTerm.trim());

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

  // Si pas de position et pas d'erreur, on attend encore
  if (!position && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Détection de votre position...</p>
        </div>
      </div>
    );
  }

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

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {[
              { 
                label: searchTerm.trim() ? 'Recherche globale' : 'Salons proches', 
                value: filteredSalons.length, 
                icon: searchTerm.trim() ? MagnifyingGlassIcon : BuildingStorefrontIcon, 
                color: searchTerm.trim() ? 'bg-green-400/20' : 'bg-white/10' 
              },
              { label: 'Rayon', value: `${radius} km`, icon: MapPinIcon, color: 'bg-blue-400/20' },
              { label: 'Moyenne avis', value: '4.5', icon: StarIcon, color: 'bg-yellow-400/20' },
              { label: 'Types', value: salonTypes.length - 1, icon: TagIcon, color: 'bg-green-400/20' }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className={`${stat.color} backdrop-blur-sm rounded-2xl p-4 border border-white/20`}
              >
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className="h-6 w-6 text-white" />
                  <span className="text-3xl font-bold text-white">{stat.value}</span>
                </div>
                <p className="text-white/90 text-sm font-medium">{stat.label}</p>
              </motion.div>
            ))}
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
            <XMarkIcon className="h-5 w-5" />
            {error}
          </motion.div>
        )}

        {/* Search & Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par nom du salon (tous les salons) ou ville/adresse (proche de vous)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Radius Filter */}
            <div className="flex-1 lg:flex-initial">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rayon: {radius} km
              </label>
              <input
                type="range"
                min="1"
                max="50"
                value={radius}
                onChange={(e) => setRadius(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Type Filter */}
            <div className="flex gap-2 flex-wrap">
              {salonTypes.map((type) => (
                <motion.button
                  key={type.value}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedType(type.value)}
                  className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                    selectedType === type.value
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <type.icon className="h-4 w-4" />
                  {type.label}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Salons List */}
        {filteredSalons.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100"
          >
            <div className="w-24 h-24 mx-auto mb-6 bg-purple-50 rounded-full flex items-center justify-center">
              <BuildingStorefrontIcon className="h-12 w-12 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {searchTerm ? 'Aucun résultat' : 'Aucun salon trouvé'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm 
                ? 'Essayez une autre recherche'
                : 'Essayez d\'augmenter le rayon de recherche'
              }
            </p>
            <button
              onClick={() => { setSearchTerm(''); setSelectedType('all'); setRadius(prev => Math.min(50, prev + 5)); }}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all inline-flex items-center gap-2"
            >
              <MagnifyingGlassIcon className="h-5 w-5" />
              Réinitialiser les filtres
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Liste des salons */}
            <div className="lg:col-span-1 space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <BuildingStorefrontIcon className="h-6 w-6 text-purple-600" />
                Salons à proximité ({filteredSalons.length})
              </h2>
              <div className="space-y-4">
                {filteredSalons.map((salon, index) => {
                  const ratings = salonRatings[salon.id] || { rating: 0, reviewCount: 0 };
                  const typeConfig = salonTypes.find(t => t.value === salon.type) || salonTypes[0];

                  return (
                    <motion.div
                      key={salon.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group ${
                        hoveredSalon === salon.id ? 'ring-2 ring-purple-500' : ''
                      }`}
                      onMouseEnter={() => setHoveredSalon(salon.id)}
                      onMouseLeave={() => setHoveredSalon(null)}
                      onClick={() => navigate(`/salons/${salon.id}`)}
                    >
                      {/* Header */}
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start gap-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                              <BuildingStorefrontIcon className="h-8 w-8 text-purple-600" />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-purple-600 transition-colors">
                                {salon.name}
                              </h3>
                              <div className="flex items-center gap-2 text-gray-600 mb-1">
                                <MapPinIcon className="h-4 w-4" />
                                <span className="text-sm">{salon.city}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <typeConfig.icon className="h-4 w-4 text-purple-600" />
                                <span className="text-sm font-medium text-purple-600">{typeConfig.label}</span>
                              </div>
                            </div>
                          </div>
                          {position && (
                            <div className="text-right">
                              <span className="text-sm font-medium text-gray-900">
                                {calculateDistance(position.lat, position.lng, salon.lat, salon.lng)} km
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Rating */}
                        {ratings.reviewCount > 0 && (
                          <div className="flex items-center gap-3 mb-4 p-3 bg-yellow-50 rounded-xl">
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <StarIconSolid
                                  key={i}
                                  className={`h-5 w-5 ${
                                    i < Math.floor(ratings.rating) ? 'text-yellow-400' : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <div className="text-sm">
                              <span className="font-bold text-gray-900">{ratings.rating.toFixed(1)}</span>
                              <span className="text-gray-600 ml-1">({ratings.reviewCount} avis)</span>
                            </div>
                          </div>
                        )}

                        {/* Address */}
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
                            <MapPinIcon className="h-5 w-5 text-gray-400" />
                            <span className="text-sm text-gray-700">{salon.address}</span>
                          </div>
                          <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
                            <MapPinIcon className="h-5 w-5 text-gray-400" />
                            <span className="text-sm text-gray-700">{salon.city} {salon.postalCode}</span>
                          </div>
                        </div>

                        {/* Services preview */}
                        {salon.services && salon.services.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-2">
                              <ScissorsIcon className="h-4 w-4" />
                              Services
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {salon.services.slice(0, 3).map((service, idx) => (
                                <span key={idx} className="px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-sm">
                                  {service.name}
                                </span>
                              ))}
                              {salon.services.length > 3 && (
                                <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-sm">
                                  +{salon.services.length - 3} autres
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Action Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/salons/${salon.id}`);
                          }}
                          className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                        >
                          <BuildingStorefrontIcon className="h-5 w-5" />
                          Voir le salon
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Carte */}
            <div className="lg:col-span-2 h-[600px] rounded-xl overflow-hidden shadow-lg">
              {position ? (
                <MapContainer
                  center={position}
                  zoom={13}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  
                  {/* Marqueur de position actuelle */}
                  <Marker position={position}>
                    <Popup>
                      <div className="text-center p-2">
                        <div className="font-medium">Vous êtes ici</div>
                        <div className="text-xs text-gray-600">
                          {position.lat.toFixed(4)}, {position.lng.toFixed(4)}
                        </div>
                      </div>
                    </Popup>
                  </Marker>

                  {/* Marqueurs des salons */}
                  <SalonMarkers 
                    salons={filteredSalons} 
                    onSalonHover={setHoveredSalon} 
                  />

                  {/* Centrer la carte sur la position actuelle */}
                  <CenterMap center={position} zoom={13} />
                </MapContainer>
              ) : (
                <div className="h-full flex items-center justify-center bg-gray-100">
                  <p className="text-gray-500">Chargement de la carte...</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FindSalons;
