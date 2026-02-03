import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';

export const RegisterClient = () => {
  const navigate = useNavigate();
  const { registerClient } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await registerClient(formData);
      // Rediriger vers login avec message d'information
      navigate('/login', { 
        state: { 
          message: 'Inscription réussie ! Un email de vérification a été envoyé. Veuillez vérifier votre boîte de réception et cliquer sur le lien pour activer votre compte.',
          type: 'success'
        }
      });
    } catch (err) {
      // Gestion améliorée des erreurs
      if (err.response?.data?.message) {
        // Erreurs de validation multiples
        if (err.response.data.errors && Array.isArray(err.response.data.errors)) {
          const validationErrors = err.response.data.errors.map(error => error.msg).join(', ');
          setError(validationErrors);
        } else {
          setError(err.response.data.message);
        }
      } else if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        // Pour les erreurs de validation multiples (format direct)
        const validationErrors = err.response.data.errors.map(error => error.msg || error.message).join(', ');
        setError(validationErrors);
      } else if (err.response?.data?.error) {
        // Compatibilité avec l'ancien format
        setError(err.response.data.error);
      } else {
        setError('Une erreur est survenue lors de l\'inscription');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Carte principale */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 text-center">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">👤</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Inscription Client</h1>
            <p className="text-purple-100 text-sm">Créez votre compte client</p>
          </div>

          {/* Formulaire */}
          <div className="p-8">
            <div className="mb-6">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">✨</span>
                  <div>
                    <h3 className="text-sm font-semibold text-purple-900">Bénéfices client</h3>
                    <p className="text-xs text-purple-700">Réservez en ligne, suivez vos rendez-vous</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bannière d'information pour les comptes non vérifiés */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <span className="text-2xl">⏳️</span>
                <div>
                  <h3 className="text-sm font-semibold text-yellow-900">Vérification email requise</h3>
                  <p className="text-xs text-yellow-700 mt-1">
                    Un email de vérification sera envoyé après inscription. Veuillez vérifier votre boîte de réception (y compris les spams) pour activer votre compte.
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                <ul className="list-disc list-inside space-y-1">
                  {error.split(', ').map((errorMsg, index) => (
                    <li key={index} className="text-sm">{errorMsg}</li>
                  ))}
                </ul>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                type="text"
                placeholder="Nom complet"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
              />

              <Input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />

              <Input
                type="tel"
                placeholder="Téléphone (optionnel)"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />

              <Input
                type="password"
                placeholder="Mot de passe (8+ caractères, majuscule, chiffre, symbole)"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={8}
                showPasswordToggle={true}
              />

              <Input
                type="password"
                placeholder="Confirmer le mot de passe"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                minLength={8}
                showPasswordToggle={true}
              />

              <Button type="submit" loading={loading} className="w-full">
                S'inscrire
              </Button>
            </form>

            {/* Liens de navigation */}
            <div className="mt-8 space-y-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-3">
                  Déjà un compte ?
                </p>
                <button
                  onClick={() => navigate('/login')}
                  className="w-full py-2 px-4 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium"
                >
                  Se connecter
                </button>
              </div>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Ou</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/register-salon')}
                className="w-full py-2 px-4 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium border border-blue-200"
              >
                💇 Créer un compte salon
              </button>
            </div>
          </div>
        </div>

        {/* Footer informatif */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Rejoignez les milliers de clients qui réservent en ligne
          </p>
        </div>
      </div>
    </div>
  );
};