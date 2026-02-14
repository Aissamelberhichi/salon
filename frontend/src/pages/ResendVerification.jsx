import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { authAPI } from '../services/api';

export const ResendVerification = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setError('');
    setMessage('');

    console.log('📧 Tentative de renvoi d\'email de vérification pour:', email);

    try {
      const response = await authAPI.resendVerificationEmail(email);
      setStatus('success');
      setMessage(response.message || 'Email de vérification renvoyé avec succès !');
      console.log('✅ Email de vérification renvoyé avec succès');
    } catch (err) {
      setStatus('error');
      setError(err.response?.data?.message || 'Une erreur est survenue. Veuillez réessayer plus tard.');
      console.error('❌ Erreur API:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-center">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📧</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Renvoyer la vérification</h1>
            <p className="text-blue-100 text-sm">Recevez un nouvel email de vérification</p>
          </div>

          {/* Formulaire */}
          <div className="p-8">
            {status === 'success' && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
                <p className="text-sm font-medium">{message}</p>
              </div>
            )}

            {status === 'error' && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            {status !== 'success' && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={status === 'loading'}
                  />
                </div>

                <Button 
                  type="submit" 
                  loading={status === 'loading'} 
                  className="w-full"
                >
                  {status === 'loading' ? 'Envoi en cours...' : 'Renvoyer l\'email'}
                </Button>
              </form>
            )}

            {/* Actions supplémentaires */}
            <div className="mt-8 space-y-4">
              {status === 'success' && (
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-4">
                    Vérifiez votre boîte de réception et vos spams.
                  </p>
                  <Button 
                    onClick={() => navigate('/login')}
                    variant="primary"
                    className="w-full"
                  >
                    Se connecter
                  </Button>
                </div>
              )}

              <div className="text-center">
                <p className="text-sm text-gray-600 mb-3">
                  {status !== 'success' ? 'Autres options :' : 'Besoin d\'aide ?'}
                </p>
                <div className="space-y-2">
                  <button
                    onClick={() => navigate('/login')}
                    className="block w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                  >
                    Retour à la connexion
                  </button>
                  <button
                    onClick={() => navigate('/register-client')}
                    className="block w-full py-2 px-4 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                  >
                    Créer un nouveau compte
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer informatif */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            {status === 'success' 
              ? 'L\'email peut prendre quelques minutes pour arriver.' 
              : 'Le lien expirera dans 24 heures.'
            }
          </p>
        </div>
      </div>
    </div>
  );
};
