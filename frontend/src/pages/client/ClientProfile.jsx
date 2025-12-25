import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { clientScoreAPI } from '../../services/api';
import { Button } from '../../components/common/Button';

export const ClientProfile = () => {
  const { user } = useAuth();
  const [clientScore, setClientScore] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.id) {
      loadClientData();
    }
  }, [user]);

  const loadClientData = async () => {
    try {
      setLoading(true);
      const [scoreRes, historyRes] = await Promise.all([
        clientScoreAPI.getClientScore(user.id),
        clientScoreAPI.getClientHistory(user.id, 20)
      ]);
      
      setClientScore(scoreRes.data);
      setHistory(historyRes.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'RELIABLE': return 'text-green-600 bg-green-50';
      case 'NORMAL': return 'text-blue-600 bg-blue-50';
      case 'AT_RISK': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getLevelText = (level) => {
    switch (level) {
      case 'RELIABLE': return 'Fiable';
      case 'NORMAL': return 'Normal';
      case 'AT_RISK': return 'À risque';
      default: return level;
    }
  };

  const getScoreColor = (score) => {
    if (score >= 120) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    return 'text-red-600';
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
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Mon Profil Client</h1>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Score Overview */}
        {clientScore && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Score de Confiance</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className={`text-4xl font-bold ${getScoreColor(clientScore.score)}`}>
                  {clientScore.score}
                </div>
                <p className="text-gray-600 mt-2">Score actuel</p>
              </div>
              <div className="text-center">
                <div className={`inline-block px-4 py-2 rounded-full font-semibold ${getLevelColor(clientScore.level)}`}>
                  {getLevelText(clientScore.level)}
                </div>
                <p className="text-gray-600 mt-2">Niveau de confiance</p>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${clientScore.requiresDeposit ? 'text-red-600' : 'text-green-600'}`}>
                  {clientScore.requiresDeposit ? 'Oui' : 'Non'}
                </div>
                <p className="text-gray-600 mt-2">Dépôt requis</p>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">Comment ça marche ?</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Score initial : 100 points</li>
                <li>• Fiable : 120+ points (pas de dépôt requis)</li>
                <li>• Normal : 80-119 points (dépôt selon cas)</li>
                <li>• À risque : moins de 80 points (dépôt requis)</li>
              </ul>
            </div>
          </div>
        )}

        {/* Event History */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Historique des Événements</h2>
            <Button variant="secondary" onClick={loadClientData}>
              Actualiser
            </Button>
          </div>

          {history.length > 0 ? (
            <div className="space-y-3">
              {history.map((event) => (
                <div key={event.id} className="border-b pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{event.description}</h4>
                      <p className="text-sm text-gray-600">
                        {new Date(event.createdAt).toLocaleDateString('fr-FR')} à{' '}
                        {new Date(event.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      {event.metadata && Object.keys(event.metadata).length > 0 && (
                        <div className="mt-2 text-sm text-gray-500">
                          {JSON.stringify(event.metadata, null, 2)}
                        </div>
                      )}
                    </div>
                    <div className={`font-semibold ${event.scoreChange > 0 ? 'text-green-600' : event.scoreChange < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                      {event.scoreChange > 0 && '+'}{event.scoreChange} pts
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Aucun événement enregistré</p>
          )}
        </div>
      </div>
    </div>
  );
};
