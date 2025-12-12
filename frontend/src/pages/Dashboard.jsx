import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';

export const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleColors = {
    CLIENT: 'bg-blue-100 text-blue-800',
    SALON_OWNER: 'bg-purple-100 text-purple-800',
    ADMIN: 'bg-red-100 text-red-800'
  };

  const roleLabels = {
    CLIENT: 'Client',
    SALON_OWNER: 'Gérant de Salon',
    ADMIN: 'Administrateur'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Bienvenue, {user.fullName}!
              </h1>
              <p className="text-gray-600">Votre tableau de bord</p>
            </div>
            <Button variant="danger" onClick={handleLogout}>
              Déconnexion
            </Button>
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-700">Rôle</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${roleColors[user.role]}`}>
                {roleLabels[user.role]}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-700">Email</span>
              <span className="text-gray-900">{user.email}</span>
            </div>

            {user.phone && (
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700">Téléphone</span>
                <span className="text-gray-900">{user.phone}</span>
              </div>
            )}
          </div>

          {/* Actions rapides pour Client */}
          {user.role === 'CLIENT' && (
            <div className="mt-6 space-y-3">
              <h2 className="text-lg font-bold mb-3">Actions rapides</h2>
              <Button onClick={() => navigate('/salons')} className="w-full">
                🏪 Voir les salons
              </Button>
              <Button onClick={() => navigate('/my-reservations')} className="w-full">
                📅 Mes réservations
              </Button>
            </div>
          )}

          <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <h3 className="font-semibold text-purple-900 mb-2">🎉 Sprint 4 Complété!</h3>
            <p className="text-sm text-purple-800">
              Système de réservation fonctionnel avec gestion des rendez-vous.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};