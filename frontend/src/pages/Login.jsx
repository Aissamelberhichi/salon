import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';

export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState('client');

  // Gérer les messages passés en paramètre
  useEffect(() => {
    if (location.state?.message) {
      if (location.state.type === 'success') {
        setSuccessMessage(location.state.message);
      } else {
        setError(location.state.message);
      }
      // Nettoyer l'état après l'affichage
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      // Gestion améliorée des erreurs
      if (err.response?.data?.message) {
        setError(err.response.data.message);
        
        // Si l'email n'est pas vérifié, afficher un bouton pour renvoyer
        if (err.response.data.code === 'EMAIL_NOT_VERIFIED') {
          setError(err.response.data.message + ' Cliquez sur "Renvoyer la vérification" ci-dessous.');
        }
      } else if (err.response?.data?.error) {
        // Compatibilité avec l'ancien format
        setError(err.response.data.error);
      } else {
        setError('Une erreur est survenue lors de la connexion');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5003'}/api/email/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();

      if (response.ok) {
        setError('Email de vérification renvoyé ! Vérifiez votre boîte de réception.');
      } else {
        setError(data.message || 'Erreur lors de l\'envoi de l\'email');
      }
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer plus tard.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Carte principale */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header avec choix du type */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6">
            <h1 className="text-3xl font-bold text-white text-center mb-6">Connexion</h1>
            
            {/* Sélecteur de type d'utilisateur */}
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-1 flex">
              <button
                onClick={() => setUserType('client')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  userType === 'client'
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                👤 Client
              </button>
              <button
                onClick={() => setUserType('salon')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  userType === 'salon'
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                💇 Salon
              </button>
            </div>
          </div>

          {/* Formulaire */}
          <div className="p-8">
            <p className="text-gray-600 text-center mb-8">
              {userType === 'client' 
                ? 'Accédez à votre espace client' 
                : 'Accédez à votre espace gérant'
              }
            </p>

            {successMessage && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
                <p className="text-sm font-medium">{successMessage}</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                <ul className="list-disc list-inside space-y-1">
                  {error.split(', ').map((errorMsg, index) => (
                    <li key={index} className="text-sm">{errorMsg}</li>
                  ))}
                </ul>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                type="email"
                placeholder="Email professionnel"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />

              <Input
                type="password"
                placeholder="Mot de passe"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                showPasswordToggle={true}
              />

              <Button type="submit" loading={loading} className="w-full">
                Se connecter
              </Button>
            </form>

            {/* Lien mot de passe oublié */}
            <div className="mt-4 text-center">
              <Link 
                to="/forgot-password" 
                className="text-sm text-purple-600 hover:text-purple-500 hover:underline transition-colors"
              >
                🔐 Mot de passe oublié ?
              </Link>
            </div>

            {/* Liens d'inscription */}
            <div className="mt-8 space-y-4">
              {error && error.includes('vérifier votre adresse email') && (
                <div className="text-center">
                  <button
                    onClick={handleResendVerification}
                    className="w-full py-2 px-4 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors text-sm font-medium"
                  >
                    📧 Renvoyer la vérification
                  </button>
                </div>
              )}
              
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-3">
                  Pas encore de compte ?
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => navigate('/register-client')}
                    className="flex-1 py-2 px-4 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium"
                  >
                    👤 S'inscrire Client
                  </button>
                  <button
                    onClick={() => navigate('/register-salon')}
                    className="flex-1 py-2 px-4 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                  >
                    💇 Créer un Salon
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer informatif */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            {userType === 'client' 
              ? 'Réservez des rendez-vous dans les meilleurs salons'
              : 'Gérez votre salon et vos rendez-vous'
            }
          </p>
        </div>
      </div>
    </div>
  );
};