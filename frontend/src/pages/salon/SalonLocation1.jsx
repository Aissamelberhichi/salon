import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { salonAPI } from '../../services/api';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
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
      const { data } = await salonAPI.getMySalon();
      setSalon(data);
      setFormData({
        address: data.address || '',
        city: data.city || '',
        postalCode: data.postalCode || '',
        lat: data.lat,
        lng: data.lng
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      await salonAPI.updateSalon(salon.id, formData);
      setSuccess(' Localisation mise à jour avec succès!');
      await loadSalon();
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la sauvegarde');
    } finally {
      setSubmitting(false);
    }
  };

  // Détecter la position actuelle de l'utilisateur
  const detectCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("La géolocalisation n'est pas supportée par votre navigateur");
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
  };

  // Mettre à jour la position quand le formulaire change
  useEffect(() => {
    if (formData.lat && formData.lng) {
      setPosition({
        lat: formData.lat,
        lng: formData.lng
      });
    }
  }, [formData.lat, formData.lng]);

  // Mettre à jour le formulaire quand la position change
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

  // Mettre à jour la position quand on utilise le formulaire
  useEffect(() => {
    if (formData.lat !== position.lat || formData.lng !== position.lng) {
      setPosition({
        lat: formData.lat || 33.5731,
        lng: formData.lng || -7.5898
      });
    }
  }, [formData.lat, formData.lng]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900"> Localisation</h1>
            <p className="text-sm text-gray-600">{salon?.name}</p>
          </div>
          <Button variant="secondary" onClick={() => navigate('/salon/dashboard')}>
            ← Retour au Dashboard
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
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

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
          <h2 className="text-lg font-bold">Adresse du salon</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adresse complète
            </label>
            <Input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="123 Rue Mohammed V"
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
              />
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="font-semibold mb-4">Coordonnées GPS</h3>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Latitude
                </label>
                <Input
                  type="number"
                  value={formData.lat || ''}
                  onChange={(e) => setFormData({ ...formData, lat: parseFloat(e.target.value) })}
                  placeholder="33.5731"
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
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button 
                type="button" 
                variant="secondary" 
                onClick={detectCurrentLocation}
                className="flex items-center gap-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Ma position actuelle
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={setDefaultLocation}
              >
                Casablanca par défaut
              </Button>
            </div>
            {locationError && (
              <p className="mt-2 text-sm text-red-600">{locationError}</p>
            )}
          </div>

          <Button type="submit" disabled={submitting}>
            {submitting ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </form>

        {/* OpenStreetMap Integration */}
        <div className="mt-8 h-96 rounded-lg overflow-hidden border border-gray-200">
          <MapContainer
            center={position}
            zoom={13}
            scrollWheelZoom={true}
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
          <span>Cliquez sur la carte ou utilisez le bouton ci-dessus pour définir l'emplacement</span>
          <button 
            type="button" 
            onClick={detectCurrentLocation}
            className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-xs"
            title="Utiliser ma position actuelle"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Me localiser
          </button>
        </div>
        </div>
      </div>
    </div>
  );
};