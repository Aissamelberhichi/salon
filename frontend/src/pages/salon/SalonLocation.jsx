import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { salonAPI } from '../../services/api';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import {
  MapPinIcon,
  ClockIcon,
  BuildingStorefrontIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon,
  SparklesIcon,
  ArrowPathIcon,
  XMarkIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  MapIcon as MapIconOutline
} from '@heroicons/react/24/outline';
import 'leaflet/dist/leaflet.css';

// Fonction utilitaire pour le géocodage inverse
const reverseGeocode = async (lat, lng) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=fr`
    );
    const data = await response.json();
    return data.address;
  } catch (error) {
    console.error('Erreur de géocodage:', error);
    return null;
  }
};

// Composant pour gérer les clics sur la carte
const LocationMarker = ({ position, setPosition, onPositionChange }) => {
  useMapEvents({
    async click(e) {
      const newPos = {
        lat: e.latlng.lat,
        lng: e.latlng.lng
      };
      setPosition(newPos);
      onPositionChange(newPos);
    },
  });

  return position === null ? null : (
    <Marker position={position}>
      <Popup>Votre salon se trouve ici</Popup>
    </Marker>
  );
};

export const SalonLocation = () => {
  const navigate = useNavigate();
  const [salon, setSalon] = useState(null);
  const [formData, setFormData] = useState({
    address: '',
    city: '',
    postalCode: '',
    lat: null,
    lng: null
  });
  const [position, setPosition] = useState({
    lat: 33.5731,
    lng: -7.5898
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [locationError, setLocationError] = useState('');

  useEffect(() => {
    loadSalon();
  }, []);

  const loadSalon = async () => {
    try {
      setError('');
      setLoading(true);
      const { data } = await salonAPI.getMySalon();
      setSalon(data);
      
      if (data.lat && data.lng) {
        setPosition({
          lat: data.lat,
          lng: data.lng
        });
        setFormData({
          address: data.address || '',
          city: data.city || '',
          postalCode: data.postalCode || '',
          lat: data.lat,
          lng: data.lng
        });
      }
    } catch (err) {
      console.error('Erreur lors du chargement:', err);
      setError(err.response?.data?.error || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  // Détecter la position actuelle de l'utilisateur
  const detectCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("La géolocalisation n'est pas supportée par votre navigateur.");
      return;
    }

    setLocationError('');
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const newPos = { lat: latitude, lng: longitude };
        setPosition(newPos);
        await handlePositionChange(newPos);
      },
      (error) => {
        console.error('Erreur de géolocalisation:', error);
        setLocationError(
          error.code === error.PERMISSION_DENIED
            ? "L'accès à votre position a été refusé. Veuillez autoriser la géolocalisation dans les paramètres de votre navigateur."
            : "Impossible de récupérer votre position. Vérifiez votre connexion ou réessayez plus tard."
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // Position par défaut (Casablanca)
  const setDefaultLocation = () => {
    const defaultPos = {
      lat: 33.5731,
      lng: -7.5898
    };
    setPosition(defaultPos);
    handlePositionChange({
      ...defaultPos,
      address: '123 Boulevard Mohammed V',
      city: 'Casablanca',
      postalCode: '20000'
    });
    setLocationError('');
  };

  const handlePositionChange = async (newPosition) => {
    setPosition(newPosition);
    
    // Mise à jour immédiate des coordonnées
    setFormData(prev => ({
      ...prev,
      lat: parseFloat(newPosition.lat.toFixed(6)),
      lng: parseFloat(newPosition.lng.toFixed(6))
    }));
    
    // Géocodage inverse pour obtenir l'adresse
    try {
      const address = await reverseGeocode(newPosition.lat, newPosition.lng);
      if (address) {
        setFormData(prev => ({
          ...prev,
          address: address.road ? `${address.road} ${address.house_number || ''}`.trim() : prev.address,
          city: address.city || address.town || address.village || prev.city,
          postalCode: address.postcode || prev.postalCode
        }));
      }
    } catch (error) {
      console.error('Erreur lors du géocodage:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      await salonAPI.updateSalon(salon.id, formData);
      setSuccess('✅ Localisation mise à jour avec succès!');
      await loadSalon();
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err);
      setError(err.response?.data?.error || 'Erreur lors de la sauvegarde');
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate stats
  const stats = {
    hasLocation: !!(position.lat === 33.5731 && position.lng === -7.5898),
    isComplete: !!(formData.address === '' || formData.city === '' || formData.postalCode === '')
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Chargement de la localisation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-green-600 via-green-700 to-emerald-600 shadow-xl">
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
              Localisation du Salon
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-white/90"
            >
              {salon?.name} - Configurez l'emplacement de votre salon
            </motion.p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {[
              { label: 'Position GPS', value: stats.hasLocation ? 'Oui' : 'Non', icon: MapPinIcon, color: 'bg-white/10' },
              { label: 'Adresse', value: stats.isComplete ? 'Complète' : 'Incomplète', icon: BuildingStorefrontIcon, color: 'bg-blue-400/20' },
              { label: 'Coordonnées', value: stats.hasLocation ? `${position.lat?.toFixed(4)}, ${position.lng?.toFixed(4)}` : 'Non définies', icon: MapIconOutline, color: 'bg-purple-400/20' },
              { label: 'Statut', value: loading ? 'Chargement' : 'Prêt', icon: CheckCircleIcon, color: 'bg-yellow-400/20' }
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
            <ExclamationCircleIcon className="h-5 w-5" />
            {error}
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-2xl shadow-sm flex items-center gap-3"
          >
            <CheckCircleIcon className="h-5 w-5" />
            {success}
          </motion.div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <SparklesIcon className="h-6 w-6 text-green-600" />
              Actions rapides
            </h2>
            <Button
              variant="secondary"
              onClick={() => navigate('/salon/dashboard')}
              className="flex items-center gap-2"
            >
              <XMarkIcon className="h-4 w-4" />
              Retour
            </Button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={detectCurrentLocation}
              className="p-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3"
            >
              <MapPinIcon className="h-8 w-8" />
              <div className="text-left">
                <div className="font-bold text-lg">Ma position</div>
                <div className="text-sm opacity-90">Utiliser ma position GPS</div>
              </div>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={setDefaultLocation}
              className="p-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3"
            >
              <BuildingStorefrontIcon className="h-8 w-8" />
              <div className="text-left">
                <div className="font-bold text-lg">Casablanca</div>
                <div className="text-sm opacity-90">Position par défaut</div>
              </div>
            </motion.button>
          </div>
        </div>

        {/* Map and Form */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <MapPinIcon className="h-6 w-6 text-green-600" />
                  Informations du salon
                </h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => setDefaultLocation()}
                  className="px-4 py-2 bg-green-100 text-green-700 rounded-xl text-sm font-semibold hover:bg-green-200 transition-all"
                >
                  <ArrowPathIcon className="h-4 w-4" />
                  Réinitialiser
                </motion.button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse complète
                  </label>
                  <Input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="123 Rue Mohammed V"
                    className="w-full"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ville
                    </label>
                    <Input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="Casablanca"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Code postal
                    </label>
                    <Input
                      type="text"
                      value={formData.postalCode}
                      onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                      placeholder="20000"
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MapIconOutline className="h-5 w-5 text-purple-600" />
                  Coordonnées GPS
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Latitude
                    </label>
                    <Input
                      type="number"
                      value={formData.lat || ''}
                      onChange={(e) => setFormData({ ...formData, lat: parseFloat(e.target.value) })}
                      placeholder="33.5731"
                      step="0.000001"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Longitude
                    </label>
                    <Input
                      type="number"
                      value={formData.lng || ''}
                      onChange={(e) => setFormData({ ...formData, lng: parseFloat(e.target.value) })}
                      placeholder="-7.5898"
                      step="0.000001"
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {locationError && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{locationError}</p>
                </div>
              )}
           

            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <Button
                variant="secondary"
                onClick={() => navigate('/salon/dashboard')}
                className="flex-1"
              >
                <XMarkIcon className="h-4 w-4 mr-2" />
                Annuler
              </Button>
              <Button
                type="submit"
                loading={submitting}
                className="flex-1"
              >
                <MapPinIcon className="h-4 w-4 mr-2" />
                {submitting ? 'Sauvegarde...' : 'Enregistrer'}
              </Button>
            </div>
            </form>
        </motion.div>

          {/* Map */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-2 h-96"
          >
            <MapContainer
              center={position}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <LocationMarker
                position={position}
                setPosition={setPosition}
                onPositionChange={handlePositionChange}
              />
            </MapContainer>
            <div className="bg-white p-2 text-sm text-gray-600 border-t border-gray-200 flex justify-between items-center">
              <span>Cliquez sur la carte ou utilisez les boutons ci-dessus pour définir l'emplacement</span>
              <button
                type="button"
                onClick={detectCurrentLocation}
                className="text-green-600 hover:text-green-800 flex items-center gap-1 text-xs"
                title="Utiliser ma position actuelle"
              >
                <MapPinIcon className="h-3 w-3" />
                Me localiser
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SalonLocation;