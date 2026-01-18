import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { rdvAPI } from '../../services/api';
import { Button } from '../../components/common/Button';

export const SalonList = () => {
  const navigate = useNavigate();
  const [salons, setSalons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSalons();
  }, []);

  const loadSalons = async () => {
    try {
      const { data } = await rdvAPI.getNearbySalons();
      setSalons(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

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
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">🏪 Salons de Coiffure</h1>
          <p className="text-gray-600 mt-2">Trouvez et réservez votre prochain rendez-vous</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {salons.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏪</div>
            <p className="text-gray-600">Aucun salon disponible pour le moment</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {salons.map((salon) => (
              <div
                key={salon.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition cursor-pointer"
                onClick={() => navigate(`/salon/${salon.id}`)}
              >
                {/* Image */}
                <div className="relative h-48 bg-gradient-to-br from-purple-400 to-blue-400 rounded-t-lg overflow-hidden">
                  {salon.images && salon.images[0] ? (
                    <img
                      src={salon.images[0].url}
                      alt={salon.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <span className="text-6xl text-white">💈</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-bold">{salon.name}</h3>
                    <div className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                      {salon.type === 'MEN' ? '👨 Homme' : 
                       salon.type === 'WOMEN' ? '👩 Femme' : 
                       salon.type === 'MIXED' ? '👫 Mixte' : 
                       '🏪 Non spécifié'}
                    </div>
                  </div>
                  
                  {salon.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {salon.description}
                    </p>
                  )}

                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    {salon.address && (
                      <div className="flex items-center gap-2">
                        <span>📍</span>
                        <span>{salon.city || salon.address}</span>
                      </div>
                    )}
                    {salon.phone && (
                      <div className="flex items-center gap-2">
                        <span>📱</span>
                        <span>{salon.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex gap-4 mb-4">
                    <div className="flex items-center gap-1 text-sm">
                      <span>✂️</span>
                      <span>{salon.services?.length || 0} services</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <span>👨‍🦰</span>
                      <span>{salon.coiffeurs?.length || 0} coiffeurs</span>
                    </div>
                  </div>

                  <Button className="w-full">
                    Réserver un rendez-vous
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};