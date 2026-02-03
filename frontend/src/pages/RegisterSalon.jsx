import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';

export const RegisterSalon = () => {
  const navigate = useNavigate();
  const { registerSalonOwner } = useAuth();
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
      await registerSalonOwner(formData);
      // Rediriger vers la page d'attente de validation
      navigate('/salon-pending-validation');
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Carte principale */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-center">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">💇</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Inscription Salon</h1>
            <p className="text-blue-100 text-sm">Créez votre compte gérant</p>
          </div>

          {/* Formulaire */}
          <div className="p-8">
            {/* Message d'attente d'activation */}
            <div className="mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">⏳️</span>
                  <div>
                    <h3 className="text-sm font-semibold text-blue-900">En attente d'activation</h3>
                    <p className="text-xs text-blue-700 mt-1">
                      Après inscription, votre salon sera activé par l'administrateur. Vous recevrez un email une fois votre compte validé.
                    </p>
                  </div>
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
                placeholder="Nom complet du gérant"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
              />

              <Input
                type="email"
                placeholder="Email professionnel"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />

              <Input
                type="tel"
                placeholder="Téléphone du salon"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
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
                Créer mon salon
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
                  className="w-full py-2 px-4 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
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
                onClick={() => navigate('/register-client')}
                className="w-full py-2 px-4 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium border border-purple-200"
              >
                👤 S'inscrire comme client
              </button>
            </div>
          </div>
        </div>

        {/* Footer informatif */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Gérez votre salon, vos coiffeurs et vos rendez-vous en ligne
          </p>
        </div>
      </div>
    </div>
  );
};