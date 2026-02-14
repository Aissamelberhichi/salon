import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { authAPI } from '../services/api';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await authAPI.requestPasswordReset({ email });
      setSuccess(response.message);
      setEmailSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Carte principale */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Mot de passe oublié</h1>
              <p className="text-white/90 text-sm">
                Entrez votre email pour recevoir un lien de réinitialisation
              </p>
            </div>
          </div>

          {/* Formulaire */}
          <div className="p-8">
            {emailSent ? (
              /* Message de succès après envoi */
              <div className="text-center space-y-6">
                {/* Icône de succès animée */}
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto animate-pulse">
                  <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>

                {/* Titre de succès */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Email envoyé avec succès !
                  </h2>
                  <p className="text-gray-600 mb-4">
                    Nous avons envoyé un email de réinitialisation à :
                  </p>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg px-4 py-3 mb-4">
                    <p className="text-purple-900 font-medium font-mono text-sm">
                      {email}
                    </p>
                  </div>
                </div>


                {/* Alertes importantes */}
                <div className="space-y-3">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-3">
                    <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div className="text-left">
                      <p className="text-sm font-medium text-yellow-800">⏰ Important</p>
                      <p className="text-xs text-yellow-700 mt-1">
                        Le lien de réinitialisation expire dans <strong>1 heure</strong>
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-start gap-3">
                    <svg className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-800">📧 Pas reçu l'email ?</p>
                      <p className="text-xs text-gray-600 mt-1">
                        Vérifiez vos spams ou <button 
                          onClick={() => {
                            setEmailSent(false);
                            setError('');
                            setSuccess('');
                          }}
                          className="text-purple-600 hover:text-purple-500 underline font-medium"
                        >
                          réessayez avec un autre email
                        </button>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3 pt-4">
                  <Button
                    onClick={() => {
                      setEmailSent(false);
                      setError('');
                      setSuccess('');
                    }}
                    variant="secondary"
                    className="w-full"
                  >
                    📧 Envoyer un autre email
                  </Button>
                  
                  <Link 
                    to="/login" 
                    className="inline-flex items-center justify-center w-full text-sm text-purple-600 hover:text-purple-500 transition-colors duration-200 py-2"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Retour à la connexion
                  </Link>
                </div>
              </div>
            ) : (
              /* Formulaire initial */
              <>
                {error && (
                  <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-3">
                    <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm">{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email professionnel
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                        </svg>
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-sm"
                        placeholder="votre@email.com"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    loading={loading}
                    disabled={loading || !email}
                    className="w-full py-3 text-base font-semibold"
                  >
                    {loading ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation'}
                  </Button>
                </form>

                {/* Lien de retour */}
                <div className="mt-6 text-center">
                  <Link 
                    to="/login" 
                    className="inline-flex items-center text-sm text-purple-600 hover:text-purple-500 transition-colors duration-200"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Retour à la connexion
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer informatif */}
        <div className="mt-6 text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Vous recevrez un email avec un lien sécurisé valable 1 heure</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
