import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import { rdvAPI } from '../../services/api';
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
            <div className="font-medium">{salon.name}</div>
            <div className="text-sm text-gray-600">{salon.address}</div>
            <div className="text-sm">{salon.city} {salon.postalCode}</div>
          </Popup>
        </Marker>
      ))}
    </>
  );
};

export const FindSalons = () => {
  const [position, setPosition] = useState(null);
  const [salons, setSalons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hoveredSalon, setHoveredSalon] = useState(null);
  const [radius, setRadius] = useState(5); // Rayon en kilomètres
  const navigate = useNavigate();

  // Position par défaut (Casablanca)
  const setCasablancaPosition = async () => {
    const defaultPos = { lat: 33.5731, lng: -7.5898 };
    setPosition(defaultPos);
    setError('');
    await fetchNearbySalons(defaultPos.lat, defaultPos.lng);
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

  // Fonction pour récupérer les salons à proximité
  const fetchNearbySalons = async (lat, lng) => {
    console.log('Recherche de salons près de:', { lat, lng, radius });
    try {
      const response = await rdvAPI.getNearbySalons(lat, lng, radius);
      console.log('Réponse de l\'API:', response);
      setSalons(response.data || []);
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

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        <p className="mt-4 text-gray-600">Chargement des salons à proximité...</p>
      </div>
    );
  }

  console.log('Rendu du composant avec:', { position, salons, error });

  // Si pas de position et pas d'erreur, on attend encore
  if (!position && !error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        <p className="mt-4 text-gray-600">Détection de votre position...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Trouver un salon à proximité</h1>
          <p className="text-sm text-gray-600">
            {position 
              ? `Votre position actuelle: ${position.lat.toFixed(4)}, ${position.lng.toFixed(4)}`
              : 'Position non disponible'}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Filtres */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rayon de recherche: {radius} km
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
            <button
              onClick={() => position && fetchNearbySalons(position.lat, position.lng)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Actualiser
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-blue-50 border border-blue-200 text-blue-700 px-6 py-4 rounded-lg">
            <div className="flex items-start">
              <svg className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h2a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>{error}</div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Liste des salons */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Salons à proximité ({salons.length})</h2>
            
            {salons.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun salon trouvé</h3>
                <p className="mt-1 text-sm text-gray-500">Essayez d'augmenter le rayon de recherche</p>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => setRadius(prev => Math.min(50, prev + 5))}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    Augmenter le rayon
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {salons.map((salon) => (
                  <div 
                    key={salon.id}
                    className={`bg-white rounded-lg shadow p-4 transition-all ${
                      hoveredSalon === salon.id ? 'ring-2 ring-blue-500' : 'hover:shadow-md'
                    }`}
                    onMouseEnter={() => setHoveredSalon(salon.id)}
                    onMouseLeave={() => setHoveredSalon(null)}
                  >
                    <h3 className="font-medium">{salon.name}</h3>
                    <p className="text-sm text-gray-600">{salon.address}</p>
                    <p className="mt-1 text-sm text-gray-500">
                      {salon.city} {salon.postalCode}
                    </p>
                    {position && (
                      <p className="text-xs text-gray-500 mt-1">
                        {calculateDistance(position.lat, position.lng, salon.lat, salon.lng)} km
                      </p>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/salons/${salon.id}`);
                      }}
                      className="mt-3 w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Voir le salon
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Carte */}
          <div className="lg:col-span-2 h-[500px] rounded-lg overflow-hidden shadow-lg">
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
                    <div className="text-center">
                      <div className="font-medium">Vous êtes ici</div>
                      <div className="text-xs text-gray-600">
                        {position.lat.toFixed(4)}, {position.lng.toFixed(4)}
                      </div>
                    </div>
                  </Popup>
                </Marker>

                {/* Marqueurs des salons */}
                <SalonMarkers 
                  salons={salons} 
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
      </div>
    </div>
  );
};

export default FindSalons;
