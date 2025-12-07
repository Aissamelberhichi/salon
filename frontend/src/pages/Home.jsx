import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';

export const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full text-center">
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Salon SaaS Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Sprint 1: Authentification & Gestion des Rôles
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-8 rounded-xl border-2 border-purple-200 hover:border-purple-400 transition">
            <div className="text-6xl mb-4">👤</div>
            <h3 className="text-2xl font-bold mb-3">Je suis Client</h3>
            <p className="text-gray-600 mb-6">
              Réservez des rendez-vous dans vos salons préférés
            </p>
            <Button onClick={() => navigate('/register-client')} className="w-full">
              S'inscrire comme Client
            </Button>
          </div>

          <div className="bg-white p-8 rounded-xl border-2 border-purple-200 hover:border-purple-400 transition">
            <div className="text-6xl mb-4">🏪</div>
            <h3 className="text-2xl font-bold mb-3">Je gère un Salon</h3>
            <p className="text-gray-600 mb-6">
              Gérez votre salon, équipe et réservations
            </p>
            <Button onClick={() => navigate('/register-salon')} className="w-full">
              S'inscrire comme Gérant
            </Button>
          </div>
        </div>

        <button
          onClick={() => navigate('/login')}
          className="text-purple-600 hover:underline font-medium text-lg"
        >
          Déjà inscrit ? Se connecter →
        </button>
      </div>
    </div>
  );
};