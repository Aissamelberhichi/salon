import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { authAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth'; // Importer le hook useAuth

export const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { user } = useAuth(); // Utiliser le hook useAuth pour accéder à l'utilisateur connecté
  const [passwordReset, setPasswordReset] = useState(false);

  useEffect(() => {
    // Ne pas rediriger automatiquement si le token est manquant
    // L'utilisateur doit voir le formulaire et l'erreur
    if (!token) {
      setError('Token de réinitialisation manquant. Veuillez vérifier le lien dans votre email.');
    }
    
    // S'assurer qu'il n'y a pas de redirection automatique au chargement
    console.log('ResetPassword page loaded with token:', token);
  }, [token]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8 || password.length > 128) {
      errors.push('Le mot de passe doit contenir entre 8 et 128 caractères');
    }
    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins une lettre minuscule');
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins une lettre majuscule');
    }
    if (!/(?=.*\d)/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins un chiffre');
    }
    if (!/(?=.*[@$!%*?&])/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins un caractère spécial (@$!%*?&)');
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validation des mots de passe
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      setLoading(false);
      return;
    }

    const passwordErrors = validatePassword(formData.newPassword);
    if (passwordErrors.length > 0) {
      setError(passwordErrors.join('. '));
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.resetPassword({
        token,
        newPassword: formData.newPassword
      });
      setSuccess(response.message);
      setPasswordReset(true);
      
      // Rediriger vers la page de connexion après 2 secondes
      setTimeout(() => {
        navigate('/login');
      }, 2000);
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
              <h1 className="text-3xl font-bold text-white mb-2">Réinitialiser le mot de passe</h1>
              <p className="text-white/90 text-sm">
                Entrez votre nouveau mot de passe sécurisé
              </p>
            </div>
          </div>

          {/* Contenu */}
          <div className="p-8">
            {passwordReset ? (
              /* Écran de succès après réinitialisation */
              <div className="text-center space-y-6">
                {/* Icône de succès animée */}
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto animate-pulse">
                  <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>

                {/* Message de succès */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Mot de passe réinitialisé ! 🎉
                  </h2>
                  <p className="text-gray-600 mb-4">
                    Votre mot de passe a été modifié avec succès
                  </p>
                </div>

                {/* Instructions */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left space-y-3">
                  <h3 className="font-semibold text-blue-900 text-sm mb-2">🔄 Redirection en cours...</h3>
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                    <p className="text-sm text-blue-800">
                      Vous allez être redirigé vers la page de connexion
                    </p>
                  </div>
                  <p className="text-xs text-blue-600">
                    Si la redirection ne fonctionne pas, <Link to="/login" className="text-blue-700 underline font-medium">cliquez ici</Link>
                  </p>
                </div>

                {/* Bouton manuel */}
                <Button
                  onClick={() => navigate('/login')}
                  variant="secondary"
                  className="w-full"
                >
                  Aller à la connexion maintenant
                </Button>
              </div>
            ) : (
              /* Formulaire de réinitialisation */
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
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      Nouveau mot de passe
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <input
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        required
                        value={formData.newPassword}
                        onChange={handleChange}
                        className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-sm"
                        placeholder="Nouveau mot de passe"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      Confirmer le mot de passe
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        required
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-sm"
                        placeholder="Confirmer le mot de passe"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    loading={loading}
                    disabled={loading || !token}
                    className="w-full py-3 text-base font-semibold"
                  >
                    {loading ? 'Réinitialisation en cours...' : 'Réinitialiser le mot de passe'}
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Assurez-vous que votre mot de passe est sécurisé (8+ caractères, majuscule, chiffre, spécial)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
