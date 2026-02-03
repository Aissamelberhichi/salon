import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';

export const SalonPendingValidation = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleGoToLogin = () => {
    navigate('/login');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Carte principale */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-center">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">⏳</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Inscription en cours de validation</h1>
            <p className="text-blue-100 text-sm">Votre salon est en attente de validation</p>
          </div>

          {/* Contenu */}
          <div className="p-8">
            {/* Message principal */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <span className="text-2xl">📋</span>
                <div>
                  <h3 className="text-sm font-semibold text-blue-900 mb-2">Votre salon sera activé par l'administrateur</h3>
                  <p className="text-xs text-blue-700 mb-3">
                    Vous recevrez un email une fois votre compte validé. Notre équipe examine votre demande dans les plus brefs délais.
                  </p>
                </div>
              </div>
            </div>

            {/* Détails du processus */}
            <div className="space-y-4 mb-6">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">🔍 Processus de validation</h4>
                <ul className="space-y-2 text-xs text-gray-700">
                  <li className="flex items-start space-x-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>Votre inscription a été bien reçue</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-500 mt-0.5">⏱</span>
                    <span>Examen de votre dossier par notre équipe (24-48h)</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-500 mt-0.5">📧</span>
                    <span>Email de notification une fois validé</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-gray-400 mt-0.5">○</span>
                    <span>Activation de votre compte et accès au dashboard</span>
                  </li>
                </ul>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-yellow-900 mb-2">📝 Documents requis</h4>
                <p className="text-xs text-yellow-700 mb-2">
                  Assurez-vous d'avoir préparé les documents suivants pour accélérer la validation :
                </p>
                <ul className="space-y-1 text-xs text-yellow-700">
                  <li>• Licence d'exploitation du salon</li>
                  <li>• Pièce d'identité du gérant</li>
                </ul>
              </div>
            </div>

            {/* Contact support */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
              <h4 className="text-sm font-semibold text-purple-900 mb-2">💬 Besoin d'aide ?</h4>
              <p className="text-xs text-purple-700 mb-3">
                Notre service client est disponible pour répondre à vos questions :
              </p>
              <div className="space-y-1 text-xs text-purple-700">
                <p>📧 Email : support@coifure.com</p>
                <p>📞 Téléphone : 01 23 45 67 89</p>
                <p>⏰ Horaires : Lun-Ven 9h-18h</p>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="space-y-3">
              <Button
                onClick={handleGoToLogin}
                className="w-full"
                variant="primary"
              >
                Aller à la page de connexion
              </Button>
              
              <button
                onClick={handleGoHome}
                className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                Retour à l'accueil
              </button>
            </div>

            {/* Compte à rebours */}
            {countdown > 0 && (
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">
                  Redirection automatique vers la connexion dans {countdown} secondes...
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer informatif */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Merci de votre patience. Nous travaillons à valider votre compte rapidement.
          </p>
        </div>
      </div>
    </div>
  );
};
