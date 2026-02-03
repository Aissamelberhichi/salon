import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/common/Button';

export const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, logout } = useAuth(); // Ajouter logout
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const isVerifyingRef = useRef(false);

  useEffect(() => {
    // Éviter les exécutions multiples avec useRef
    if (isVerifyingRef.current) {
      console.log('⏭️ Vérification déjà en cours, ignoré');
      return;
    }

    console.log('🔍 VerifyEmail useEffect déclenché');
    console.log('📋 searchParams:', searchParams.toString());
    
    const token = searchParams.get('token');
    console.log('🔑 Token extrait:', token);
    
    if (!token) {
      console.log('❌ Token manquant');
      setStatus('error');
      setError('Token de vérification manquant');
      return;
    }

    console.log('✅ Token trouvé, lancement de la vérification');
    isVerifyingRef.current = true;
    verifyEmail(token);
  }, [searchParams]);

  const verifyEmail = async (token) => {
    try {
      console.log('📧 Début de la vérification du token:', token);
      const url = `${import.meta.env.VITE_API_URL || 'http://localhost:5003'}/email/verify?token=${token}`;
      console.log('🌐 URL de la requête:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('📋 Réponse reçue:', response.status, response.statusText);
      const data = await response.json();
      console.log('📋 Données reçues:', data);

      // Si la réponse contient un utilisateur, la vérification a réussi
      console.log('🔍 Test de la condition de succès:');
      console.log('  - data.user existe?', !!data.user);
      console.log('  - data.message:', data.message);
      console.log('  - message contient "succès"?', data.message?.includes('succès'));
      
      // Simplifions : si on reçoit une réponse positive de l'API, c'est un succès
      if (data.user || (data.message && !data.message.includes('invalide') && !data.message.includes('expiré'))) {
        console.log('✅ Condition de succès vérifiée');
        setStatus('success');
        setMessage('Votre email a été vérifié avec succès !');
        console.log('✅ Vérification réussie');
        
        // Rediriger vers login avec message de succès immédiatement
        console.log('🔄 Redirection immédiate vers login...');
        console.log('📍 Navigation vers:', '/login');
        console.log('📋 État à passer:', {
          message: 'Email vérifié avec succès ! Vous pouvez maintenant vous connecter.',
          type: 'success'
        });
        
        try {
          // Déconnecter l'utilisateur pour éviter la redirection automatique
          console.log('🔑 Déconnexion de l\'utilisateur...');
          await logout();
          
          navigate('/login', { 
            state: { 
              message: 'Email vérifié avec succès ! Vous pouvez maintenant vous connecter.',
              type: 'success'
            }
          });
          console.log('✅ Navigation exécutée avec succès');
        } catch (navError) {
          console.error('❌ Erreur de navigation:', navError);
        }
      } else {
        console.log('❌ Condition de succès non vérifiée');
        setStatus('error');
        setError(data.message || 'Erreur lors de la vérification');
        console.log('❌ Erreur de vérification:', data.message);
      }
    } catch (err) {
      setStatus('error');
      setError('Une erreur est survenue. Veuillez réessayer plus tard.');
      console.error('❌ Erreur catch:', err);
      console.error('📋 Détails de l\'erreur:', err.message);
    }
  };

  const handleResendEmail = () => {
    navigate('/resend-verification');
  };

  const handleGoToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-center">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
              {status === 'loading' && <span className="text-3xl animate-spin">⏳️</span>}
              {status === 'success' && <span className="text-3xl">✅</span>}
              {status === 'error' && <span className="text-3xl">❌</span>}
              {status === 'waiting' && <span className="text-3xl">📧</span>}
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {status === 'loading' && 'Vérification en cours...'}
              {status === 'success' && 'Email vérifié !'}
              {status === 'error' && 'Erreur de vérification'}
              {status === 'waiting' && 'Vérifiez votre email'}
            </h1>
            <p className="text-purple-100 text-sm">
              {status === 'loading' && 'Nous vérifions votre email...'}
              {status === 'success' && 'Votre compte est maintenant actif'}
              {status === 'error' && 'Une erreur est survenue'}
              {status === 'waiting' && 'Un email de vérification a été envoyé'}
            </p>
          </div>

          {/* Contenu */}
          <div className="p-8">
            {/* Message principal */}
            <div className={`rounded-lg p-6 mb-6 ${
              status === 'success' ? 'bg-green-50 border border-green-200' :
              status === 'error' ? 'bg-red-50 border border-red-200' :
              status === 'waiting' ? 'bg-yellow-50 border border-yellow-200' :
              'bg-blue-50 border border-blue-200'
            }`}>
              <div className="text-center">
                <h3 className={`text-lg font-semibold mb-2 ${
                  status === 'success' ? 'text-green-900' :
                  status === 'error' ? 'text-red-900' :
                  status === 'waiting' ? 'text-yellow-900' :
                  'text-blue-900'
                }`}>
                  {status === 'loading' && 'Vérification en cours'}
                  {status === 'success' && 'Compte activé avec succès !'}
                  {status === 'error' && 'Le lien de vérification a peut-être expiré ou est invalide'}
                  {status === 'waiting' && 'Vérifiez votre boîte de réception'}
                </h3>
                <p className={`text-sm ${
                  status === 'success' ? 'text-green-700' :
                  status === 'error' ? 'text-red-700' :
                  status === 'waiting' ? 'text-yellow-700' :
                  'text-blue-700'
                }`}>
                  {message}
                </p>
              </div>
            </div>

            {/* Instructions pour l'attente */}
            {status === 'waiting' && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">Étapes suivantes :</h4>
                <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                  <li>Ouvrez votre boîte de réception email</li>
                  <li>Cherchez l'email de "Coifure App"</li>
                  <li>Cliquez sur le bouton "Vérifier mon adresse email"</li>
                  <li>Vous serez redirigé automatiquement ici</li>
                </ol>
                <p className="text-xs text-gray-600 mt-2">
                  ⚠️ N'oubliez pas de vérifier vos spams !
                </p>
              </div>
            )}

            {/* Boutons d'action */}
            <div className="space-y-3">
              {status === 'error' && (
                <>
                  <Button 
                    onClick={handleResendEmail}
                    className="w-full"
                    variant="secondary"
                  >
                    📧 Renvoyer l'email de vérification
                  </Button>
                  <Button 
                    onClick={handleGoToLogin}
                    className="w-full"
                    variant="outline"
                  >
                    🔑 Retour à la connexion
                  </Button>
                </>
              )}

              {status === 'waiting' && (
                <>
                  <Button 
                    onClick={handleResendEmail}
                    className="w-full"
                    variant="secondary"
                  >
                    📧 Je n'ai pas reçu l'email
                  </Button>
                  <Button 
                    onClick={handleGoToLogin}
                    className="w-full"
                    variant="outline"
                  >
                    🔑 Aller à la connexion
                  </Button>
                </>
              )}

              {status === 'success' && (
                <Button 
                  onClick={() => navigate('/dashboard')}
                  className="w-full"
                >
                  🚀 Accéder à mon tableau de bord
                </Button>
              )}
            </div>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                Besoin d'aide ? Contactez notre support
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
