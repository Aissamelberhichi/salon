import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { salonAPI } from '../../services/api';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';

export const SalonDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [salon, setSalon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSalon();
  }, []);

  const loadSalon = async () => {
    try {
      const { data } = await salonAPI.getMySalon();
      setSalon(data);
    } catch (err) {
      if (err.response?.status === 404) {
        navigate('/salon/create');
      } else {
        setError(err.response?.data?.error || 'Erreur lors du chargement');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!salon) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{salon.name}</h1>
            <p className="text-sm text-gray-600">Dashboard Salon</p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => navigate('/dashboard')}>
              Profil
            </Button>
            <Button variant="danger" onClick={handleLogout}>
              Déconnexion
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Success Message */}
        <div className="mb-8 bg-green-50 border border-green-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-green-900 mb-2">🎉 Sprint 2 - Dashboard Salon</h2>
          <p className="text-green-800">
            Félicitations! Votre salon est créé et le dashboard est fonctionnel.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-3xl mb-2">📸</div>
            <h3 className="text-lg font-semibold mb-1">Photos</h3>
            <p className="text-3xl font-bold text-purple-600">{salon.images?.length || 0}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-3xl mb-2">⏰</div>
            <h3 className="text-lg font-semibold mb-1">Horaires</h3>
            <p className="text-3xl font-bold text-purple-600">
              {salon.hours?.filter(h => !h.isClosed).length || 0}/7
            </p>
            <p className="text-xs text-gray-500 mt-1">jours ouverts</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-3xl mb-2">✅</div>
            <h3 className="text-lg font-semibold mb-1">Statut</h3>
            <p className={`text-sm font-medium ${salon.isActive ? 'text-green-600' : 'text-red-600'}`}>
              {salon.isActive ? 'Actif' : 'Inactif'}
            </p>
          </div>
            <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-3xl mb-2">✂️</div>
            <h3 className="text-lg font-semibold mb-1">Services</h3>
            <p className="text-3xl font-bold text-purple-600">
              {salon.services?.filter(s => s.isActive).length || 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">services actifs</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-3xl mb-2">👨‍🦰</div>
            <h3 className="text-lg font-semibold mb-1">Coiffeurs</h3>
            <p className="text-3xl font-bold text-purple-600">
              {salon.coiffeurs?.filter(c => c.isActive).length || 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">coiffeurs actifs</p>
          </div>
        </div>
        

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Actions disponibles (Sprint 2)</h2>
          <div className="grid md:grid-cols-2 gap-4">

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <div className="text-3xl mb-2">📸</div>
            <Button onClick={() => navigate('/salon/images')} className="w-full">
              Gérer les photos
            </Button>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <div className="text-3xl mb-2">⏰</div>
              <Button onClick={() => navigate('/salon/hours')} className="w-full">
                Gérer les horaires
              </Button>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <div className="text-3xl mb-2">📍</div>
                <Button onClick={() => navigate('/salon/location')} className="w-full">
                  Modifier la localisation
                </Button>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <div className="text-3xl mb-2">⚙️</div>
                <Button onClick={() => navigate('/salon/settings')} className="w-full">
                  ⚙️ Paramètres du salon
                </Button>
            </div>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <div className="text-3xl mb-2">✂️</div>
              <Button onClick={() => navigate('/salon/services')} className="w-full">
                Gérer les services
              </Button>
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <div className="text-3xl mb-2">👨‍🦰</div>
              <Button onClick={() => navigate('/salon/coiffeurs')} className="w-full">
                Gérer les coiffeurs
              </Button>
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <div className="text-3xl mb-2">📅</div>
                <Button onClick={() => navigate('/salon/reservations')} className="w-full">
                  Voir les réservations
                </Button>
            </div>

          </div>
        </div>

        {/* Salon Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Informations du salon</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
              <p className="text-gray-900">{salon.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
              <p className="text-gray-900">{salon.city || 'Non renseignée'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
              <p className="text-gray-900">{salon.address || 'Non renseignée'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
              <p className="text-gray-900">{salon.phone || 'Non renseigné'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <p className="text-gray-900">{salon.email || 'Non renseigné'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ID Salon</label>
              <p className="text-xs text-gray-600 font-mono">{salon.id}</p>
            </div>
          </div>
          
          {salon.description && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <p className="text-gray-900">{salon.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};